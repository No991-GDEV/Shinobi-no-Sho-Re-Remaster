import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ns = 'sns-v14-dev';
const systemRoot = new URL('../src/system/sns-v14-dev/', import.meta.url);
const readSystem = rel => fs.readFileSync(new URL(rel, systemRoot), 'utf8');

function loadHandlebars() {
 if (process.env.SNS_SKIP_HANDLEBARS === '1') return null;
 const require = createRequire(import.meta.url);
 try { return require('handlebars'); } catch {}
 const candidates = [
  'F:/Foundry VTT14/App/resources/app/node_modules/handlebars/lib/index.js',
  path.resolve(new URL('../../implementacao/sns-v14/validacao/node_modules/handlebars/lib/index.js', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
 ];
 for (const p of candidates) {
  if (fs.existsSync(p)) return require(p);
 }
 return null;
}

const hb = loadHandlebars();
const Handlebars = hb ? hb.create() : null;
if (Handlebars) {
 Handlebars.registerHelper('snsIsTab', (a, b) => a === b);
 Handlebars.registerHelper('checked', v => (v ? 'checked' : ''));
 Handlebars.registerPartial('mock/document-partial.hbs', '<li class="directory-item entry actor" data-entry-id="{{id}}"><a class="entry-name">{{name}}</a></li>');
 Handlebars.registerPartial('portrait', '<img src="{{actor.img}}" data-edit="img" data-action="editImage" alt="">');
 Handlebars.registerPartial('actorTags', '<div class="actor-tags"></div>');
 Handlebars.registerPartial('actorNav', '<nav class="sheet-tabs"></nav>');
 Handlebars.registerPartial('actorFields', '<section class="actor-fields"></section>');
 Handlebars.registerPartial('actorNotes', '<section class="actor-notes"></section>');
 Handlebars.registerPartial('inventoryPanel', '<section class="inventory-panel"></section>');
 Handlebars.registerPartial(`systems/${ns}/templates/partials/party.hbs`, readSystem('templates/partials/party.hbs'));
 Handlebars.registerPartial(`systems/${ns}/templates/partials/party-directory.hbs`, readSystem('templates/partials/party-directory.hbs'));
}

function getByPath(obj, dotPath) {
 return dotPath.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function setByPath(obj, dotPath, value) {
 const parts = dotPath.split('.');
 let cur = obj;
 for (let i = 0; i < parts.length - 1; i++) {
  if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
  cur = cur[parts[i]];
 }
 cur[parts.at(-1)] = structuredClone(value);
}

const notifications = { warns: [], infos: [] };
const createdMessages = [];
const hookRegistry = new Map();

function resetLogs() {
 notifications.warns.length = 0;
 notifications.infos.length = 0;
 createdMessages.length = 0;
}

function makeCollection(arr = []) {
 arr.get = id => arr.find(x => x.id === id) ?? null;
 arr.contents = arr;
 return arr;
}

function makeMockItem(raw = {}, parentActor = null) {
 const data = structuredClone(raw);
 data.id ??= 'item' + Math.random().toString(36).slice(2, 10);
 data.system ??= {};
 data.flags ??= {};
 const item = {
  ...data,
  uuid: parentActor ? `${parentActor.uuid}.Item.${data.id}` : `Item.${data.id}`,
  actor: parentActor,
  deleted: false,
  toObject() {
   return structuredClone({
    _id: this.id,
    id: this.id,
    name: this.name,
    type: this.type,
    img: this.img ?? 'icons/svg/item-bag.svg',
    system: this.system,
    flags: this.flags
   });
  },
  toDragData() {
   return { type: 'Item', uuid: this.uuid };
  },
  async update(patch = {}) {
   for (const [k, v] of Object.entries(patch)) setByPath(this, k, v);
   return this;
  },
  async delete() {
   this.deleted = true;
   if (parentActor?.items) {
    const idx = parentActor.items.findIndex(i => i.id === this.id);
    if (idx >= 0) parentActor.items.splice(idx, 1);
   }
   return this;
  }
 };
 return item;
}

function makeMockActor({
 id = 'actor000000000001',
 name = 'Ninja Teste',
 type = 'shinobi',
 img = 'icons/svg/mystery-man.svg',
 sort = 0,
 isOwner = true,
 permission = true,
 system = {},
 flags = {},
 items = [],
 prototypeToken = {}
} = {}) {
 const baseSystem = structuredClone(system);
 if (type === 'party') {
  baseSystem.members ??= [];
  baseSystem.activities ??= [];
  baseSystem.details ??= {};
  if (baseSystem.details.funds === undefined) baseSystem.details.funds = null;
  baseSystem.tags ??= [];
  baseSystem.resources ??= { vitality: { value: null, max: null }, chakra: { value: null, max: null, baseMax: null } };
  baseSystem.stats ??= { cc: null, cd: null, esq: null, lm: null, initiative: null, movement: null };
  baseSystem.attributes ??= {};
 } else if (type === 'shinobi') {
  baseSystem.nc ??= 1;
  baseSystem.phase ??= 'evolution';
  baseSystem.attributes ??= { for: 2, agi: 3, vig: 2, int: 2, esp: 2, car: 1 };
  baseSystem.finances ??= { ryo: 0 };
  baseSystem.identity ??= { rank: 'Genin', clan: '', village: 'Konoha', languages: 'Comum', senses: '' };
  baseSystem.resources ??= {
   vitality: { value: 20, max: 30, mod: 0 },
   chakra: { value: 10, max: 20, baseMax: 20, mod: 0 }
  };
  baseSystem.stats ??= { movement: 9 };
  baseSystem.skills ??= {};
  baseSystem.training ??= {};
  baseSystem.tags ??= [];
 } else {
  baseSystem.nc ??= 2;
  baseSystem.details ??= { rank: 'Chunin', village: 'Konoha', languages: 'Comum', senses: 'Visão aguçada', funds: 0 };
  baseSystem.attributes ??= { for: 2, agi: 2, vig: 2, int: 2, esp: 2, car: 1 };
  baseSystem.resources ??= {
   vitality: { value: 18, max: 24 },
   chakra: { value: 12, max: 16, baseMax: 16 }
  };
  baseSystem.stats ??= { cc: 4, cd: 3, esq: 3, lm: 3, initiative: 3, movement: 8 };
  baseSystem.recordedSkills ??= [];
  baseSystem.tags ??= [];
 }

 const actor = {
  id,
  _id: id,
  uuid: `Actor.${id}`,
  documentName: 'Actor',
  name,
  type,
  img,
  sort,
  isOwner,
  prototypeToken: structuredClone(prototypeToken),
  system: baseSystem,
  flags: structuredClone(flags),
  items: makeCollection([]),
  sheet: { rendered: false, renderCalls: 0, async render() { this.rendered = true; this.renderCalls++; return this; } },
  testUserPermission(_user, level) {
   if (typeof permission === 'function') return permission(_user, level);
   return !!permission;
  },
  getFlag(scope, key) {
   return this.flags?.[scope]?.[key];
  },
  updateSource(patch = {}) {
   for (const [k, v] of Object.entries(patch)) setByPath(this, k, v);
  },
  toObject() {
   return structuredClone({
    id: this.id,
    _id: this._id,
    uuid: this.uuid,
    name: this.name,
    type: this.type,
    img: this.img,
    sort: this.sort,
    system: this.system,
    flags: this.flags,
    prototypeToken: this.prototypeToken
   });
  },
  toDragData() {
   return { type: 'Actor', uuid: this.uuid };
  },
  async update(patch = {}) {
   for (const [k, v] of Object.entries(patch)) setByPath(this, k, v);
   return this;
  },
  async delete() {
   const idx = globalThis.game.actors.findIndex(a => a.id === this.id);
   if (idx >= 0) globalThis.game.actors.splice(idx, 1);
   return this;
  },
  async getTokenDocument(overrides = {}) {
   return {
    actorId: this.id,
    name: this.name,
    texture: { src: this.img },
    ...overrides,
    toObject() { return { ...this }; }
   };
  },
  async createEmbeddedDocuments(embeddedName, docs = []) {
   if (embeddedName !== 'Item') return [];
   if (this._failCreateItem) return [];
   const created = docs.map(d => makeMockItem(d, this));
   this.items.push(...created);
   return created;
  },
  async updateEmbeddedDocuments(embeddedName, updates = []) {
   if (embeddedName !== 'Item') return [];
   for (const upd of updates) {
    const item = this.items.get(upd._id);
    if (item) await item.update(upd);
   }
   return updates;
  }
 };
 Object.defineProperty(actor.system, 'toObject', {
  value: () => structuredClone(actor.system),
  enumerable: false,
  configurable: true
 });
 actor.items.push(...items.map(raw => makeMockItem(raw, actor)));
 return actor;
}

function makeChatMessage(data = {}) {
 const msg = {
  id: 'msg' + Math.random().toString(36).slice(2, 10),
  uuid: 'ChatMessage.' + Math.random().toString(36).slice(2, 10),
  author: data.author ?? globalThis.game.user,
  flags: structuredClone(data.flags ?? {}),
  content: data.content ?? '',
  flavor: data.flavor,
  speaker: data.speaker ?? {},
  whisper: data.whisper ?? [],
  messageMode: data.messageMode,
  getFlag(scope, key) {
   return this.flags?.[scope]?.[key];
  },
  async update(patch = {}) {
   for (const [k, v] of Object.entries(patch)) setByPath(this, k, v);
   return this;
  }
 };
 createdMessages.push(msg);
 return msg;
}

class MockBaseActorDirectory {
 static DEFAULT_OPTIONS = { actions: {}, renderUpdateKeys: ['name', 'img'] };
 static PARTS = {
  header: { template: 'header.hbs' },
  directory: { template: 'directory.hbs' },
  footer: { template: 'footer.hbs' }
 };
 static _entryPartial = 'mock/document-partial.hbs';
 documentName = 'Actor';
 parts = {};
 element = null;
 async _preparePartContext() { return {}; }
 async _prepareDirectoryContext(ctx) { return ctx; }
 async render() { return this; }
 async _onRender() {}
 collapseAll() {}
 _onSearchFilter() {}
 _createContextMenu() {}
 _getFolderContextOptions() { return []; }
 _getEntryContextOptions() { return [{ label: 'Editar', icon: 'fa-solid fa-edit', visible: () => true, onClick: () => {} }]; }
 _onDragStart(event) {
  const id = event.currentTarget?.dataset?.entryId;
  const doc = this.collection?.get?.(id);
  if (doc && event.dataTransfer) event.dataTransfer.setData('text/plain', JSON.stringify(doc.toDragData()));
 }
 _onDragHighlight() {}
 _entryAlreadyExists(entry) {
  return !entry.pack && !!this.collection?.get?.(entry.id);
 }
 async _getDroppedEntryFromData(data) {
  return this._droppedOverride ?? globalThis.fromUuid(data?.uuid);
 }
 async _handleDroppedEntry(_target, data) {
  return { delegatedSuper: true, data };
 }
}

class MockBaseActor {
 async _preCreate() { return true; }
 async _preUpdate() { return true; }
 async toggleStatusEffect() { return true; }
 async modifyTokenAttribute() { return this; }
 static async create(data) {
  const created = makeMockActor({
   id: data.id ?? ('new' + Math.random().toString(36).slice(2, 15)).slice(0, 16),
   name: data.name ?? 'Novo Ator',
   type: data.type ?? 'shinobi',
   img: data.img,
   system: data.system,
   flags: data.flags,
   prototypeToken: data.prototypeToken
  });
  globalThis.game.actors.push(created);
  return created;
 }
}

class MockRoll {
 constructor(formula) {
  this.formula = formula;
  this.total = 9;
  this.dice = [{ faces: 8, results: [{ result: 4, active: true }, { result: 5, active: true }] }];
 }
 async evaluate() { return this; }
 toJSON() { return { formula: this.formula, total: this.total, terms: [] }; }
 static fromData(data) {
  const r = new MockRoll(data.formula);
  r.total = data.total ?? 9;
  return r;
 }
 async toMessage(msgData = {}, opts = {}) {
  return makeChatMessage({ ...msgData, messageMode: opts.messageMode });
 }
}

const dialogQueue = [];

const worldSettings = new Map([[`${ns}.primaryParty`, ''], [`${ns}.showPartyStats`, true], [`${ns}.messageMode`, 'public']]);

globalThis.ui = {
 notifications: {
  warn: msg => notifications.warns.push(String(msg)),
  info: msg => notifications.infos.push(String(msg)),
  error: msg => notifications.warns.push(String(msg))
 },
 actors: { rendered: false, renderCalls: 0, async render() { this.renderCalls++; return this; } }
};

globalThis.Hooks = {
 on(name, fn) {
  if (!hookRegistry.has(name)) hookRegistry.set(name, []);
  hookRegistry.get(name).push(fn);
  return hookRegistry.get(name).length;
 },
 once(name, fn) { return this.on(name, fn); },
 off() {}
};

globalThis.canvas = { tokens: { controlled: [] }, dimensions: { size: 100 } };

globalThis.foundry = {
 applications: {
  api: {
   ApplicationV2: class {},
   HandlebarsApplicationMixin: Base => class extends Base {
    async _prepareContext() { return {}; }
    async _onRender() {}
    async render() { return this; }
    async submit() {}
   },
   DialogV2: {
    async confirm() { return dialogQueue.length ? dialogQueue.shift()() : true; },
    async prompt() { return dialogQueue.length ? dialogQueue.shift()() : null; }
   }
  },
  sheets: {
   ActorSheetV2: class {
    constructor(options = {}) { this.document = options?.document ?? null; this.actor = this.document; }
    get isEditable() { return !!this.actor?.isOwner || !!globalThis.game?.user?.isGM; }
    _getHeaderControls() { return []; }
    _processFormData(_e, _f, fd) { return { ...(fd?.object ?? {}) }; }
   }
  },
  sidebar: { tabs: { ActorDirectory: MockBaseActorDirectory } },
  instances: new Map(),
  ux: { TextEditor: { enrichHTML: async html => String(html ?? '') } }
 },
 documents: {
  Actor: MockBaseActor,
  Item: class {},
  ChatMessage: {
   getSpeaker: ({ actor }) => ({ actor: actor?.id ?? 'sp', alias: actor?.name ?? 'Ator' }),
   create: async data => makeChatMessage(data)
  }
 },
 dice: { Roll: MockRoll },
 utils: {
  cleanHTML: s => String(s ?? ''),
  expandObject: obj => {
   const out = {};
   for (const [k, v] of Object.entries(obj ?? {})) setByPath(out, k, v);
   return out;
  },
  mergeObject: (a, b) => {
   const out = structuredClone(a ?? {});
   for (const [k, v] of Object.entries(b ?? {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) {
     out[k] = globalThis.foundry.utils.mergeObject(out[k], v);
    } else {
     out[k] = structuredClone(v);
    }
   }
   return out;
  },
  getProperty: getByPath,
  setProperty: setByPath,
  randomID: () => 'rand123456789012'
 }
};

globalThis.ChatMessage = globalThis.foundry.documents.ChatMessage;

function configureWorld({ isGM = true, actors = [], character = null, showPartyStats = true, primaryParty = '', showCheckDialogs = false } = {}) {
 worldSettings.set(`${ns}.showPartyStats`, showPartyStats);
 worldSettings.set(`${ns}.primaryParty`, primaryParty);
 const userFlags = { partyOpen: {}, showCheckDialogs };
 const user = {
  id: isGM ? 'gmUser0000000001' : 'plUser0000000001',
  isGM,
  active: true,
  character,
  targets: new Set(),
  getFlag(_scope, key) { return userFlags[key]; },
  async setFlag(_scope, key, val) { userFlags[key] = val; }
 };
 const gmUser = { id: 'gmUser0000000001', isGM: true, active: true };
 const actorsCol = makeCollection(actors);
 const usersArr = isGM ? [user] : [gmUser, user];
 usersArr.activeGM = gmUser;
 usersArr.get = id => usersArr.find(u => u.id === id) ?? null;

 globalThis.game = {
  user,
  users: usersArr,
  actors: actorsCol,
  combats: [],
  combat: null,
  settings: {
   get: (scope, k) => (scope === 'core' && k === 'messageMode' ? 'public' : worldSettings.get(`${ns}.${k}`)),
   set: async (_s, k, v) => { worldSettings.set(`${ns}.${k}`, v); }
  }
 };
 globalThis.fromUuid = async uuid => {
  if (!uuid) return null;
  if (uuid.includes('.Item.')) {
   const [actorPart, itemPart] = uuid.split('.Item.');
   const actorId = actorPart.replace(/^Actor\./, '');
   return actorsCol.get(actorId)?.items?.get?.(itemPart) ?? null;
  }
  return actorsCol.get(String(uuid).replace(/^Actor\./, '')) ?? null;
 };
}

configureWorld({ isGM: true, actors: [] });

const partyCore = await import(`../src/system/${ns}/scripts/party-core.mjs`);
const { createSnsActorDirectory, SnsActorDirectory } = await import(`../src/system/${ns}/scripts/party-directory.mjs`);
const partyService = await import(`../src/system/${ns}/scripts/party-service.mjs`);
const { memberView, partyView } = await import(`../src/system/${ns}/scripts/party-view.mjs`);
const { supportingNavigation } = await import(`../src/system/${ns}/scripts/supporting-view.mjs`);
const { SupportingActorSheet } = await import(`../src/system/${ns}/scripts/supporting-sheet.mjs`);
const { ShinobiActor } = await import(`../src/system/${ns}/scripts/actor.mjs`);

function makeMiniEl({ tag = 'div', dataset = {}, classes = [], textContent = '', children = [], parent = null } = {}) {
 const classSet = new Set(classes);
 const listeners = new Map();
 const attrs = new Map();
 const el = {
  tagName: tag.toUpperCase(),
  dataset: { ...dataset },
  style: {},
  children,
  parentElement: parent,
  isConnected: true,
  disabled: false,
  innerHTML: '',
  title: '',
  textContent,
  classList: {
   contains: c => classSet.has(c),
   add: (...cs) => cs.forEach(c => classSet.add(c)),
   remove: (...cs) => cs.forEach(c => classSet.delete(c)),
   toggle: (c, force) => {
    const next = force === undefined ? !classSet.has(c) : !!force;
    if (next) classSet.add(c); else classSet.delete(c);
    return next;
   }
  },
  setAttribute(k, v) { attrs.set(k, String(v)); },
  getAttribute(k) { return attrs.get(k) ?? null; },
  addEventListener(type, fn) {
   if (!listeners.has(type)) listeners.set(type, []);
   listeners.get(type).push(fn);
  },
  async trigger(type, event = {}) {
   const ev = { preventDefault() {}, stopPropagation() {}, ...event };
   for (const fn of listeners.get(type) ?? []) await fn(ev);
  },
  matches(sel) {
   if (sel === '[data-party]') return Object.hasOwn(this.dataset, 'party');
   if (sel === '.folder') return classSet.has('folder');
   return false;
  },
  closest(sel) {
   let cur = this;
   while (cur) {
    if (cur.matches(sel)) return cur;
    cur = cur.parentElement;
   }
   return null;
  },
  querySelector(sel) {
   return this.querySelectorAll(sel)[0] ?? null;
  },
  querySelectorAll(sel) {
   const out = [];
   const walk = node => {
    for (const child of node.children ?? []) {
     const match =
      (sel === '.sns-parties .directory-item.folder' && child.classList.contains('folder') && child.classList.contains('directory-item')) ||
      (sel === '.sns-parties .folder' && child.classList.contains('folder')) ||
      (sel === '.directory-item.entry' && child.classList.contains('entry')) ||
      (sel === '[data-palette="effects"]' && child.dataset.palette === 'effects') ||
      (sel === '.palette.status-effects' && child.classList.contains('status-effects')) ||
      (sel === ':scope > .folder-header .folder-name' && child.classList.contains('folder-name')) ||
      (sel === ':scope > .folder-header.active' && child.classList.contains('folder-header') && child.classList.contains('active'));
     if (match) out.push(child);
     walk(child);
    }
   };
   walk(this);
   return out;
  },
  replaceWith(next) {
   this.replacedBy = next;
  },
  remove() {
   this.removed = true;
  }
 };
 for (const child of children) child.parentElement = el;
 return el;
}

test('Bloco 1: party-core reconhece qualquer party, resolve equipe ativa, particiona, filtra árvore e protege permissões', () => {
 const unmanaged = makeMockActor({ id: 'p200000000000002', name: 'Taka', type: 'party', sort: 20, flags: {} });
 const managed = makeMockActor({ id: 'p100000000000001', name: 'Time 7', type: 'party', sort: 10, flags: { [ns]: { partyManaged: { version: 1, primary: true } } } });
 const shinobi = makeMockActor({ id: 's100000000000001', name: 'Naruto', type: 'shinobi' });

 assert.equal(partyCore.isPartyActor(unmanaged), true);
 assert.equal(partyCore.isPartyActor(managed), true);
 assert.equal(partyCore.isPartyActor(shinobi), false);

 assert.equal(partyCore.resolveActiveParty([shinobi, unmanaged, managed], ''), managed);
 assert.equal(partyCore.resolveActiveParty([shinobi, unmanaged, managed], unmanaged.id), unmanaged);
 assert.equal(partyCore.resolveActiveParty([shinobi, unmanaged, managed], 'none'), null);
 assert.equal(partyCore.resolveActiveParty([shinobi, unmanaged], ''), unmanaged);

 const part = partyCore.partitionParties([unmanaged, managed], unmanaged);
 assert.equal(part.activeParty, unmanaged);
 assert.deepEqual(part.otherParties, [managed]);

 const filtered = partyCore.filterPartyTree({
  entries: [{ id: managed.id }, { id: shinobi.id }, { id: 'free01' }],
  children: [{ entries: [{ id: unmanaged.id }, { id: 'keep01' }], children: [] }]
 }, new Set([managed.id, shinobi.id, unmanaged.id]));
 assert.deepEqual(filtered.entries.map(e => e.id), ['free01']);
 assert.deepEqual(filtered.children[0].entries.map(e => e.id), ['keep01']);

 const before = unmanaged.toObject();
 const after = { ...before, system: { ...before.system, members: [shinobi.uuid] } };
 assert.equal(partyCore.mayEditParty(before, after, false), false);
 assert.equal(partyCore.mayEditParty(before, after, true), true);

 const offsets = partyCore.partyDepositOffsets(8, 100);
 assert.equal(offsets.length, 8);
 assert.equal(new Set(offsets.map(o => `${o.dx},${o.dy}`)).size, 8);
});

test('Bloco 1: ShinobiActor._preCreate bloqueia party para não-GM e força actorLink: true para party', async () => {
 resetLogs();
 configureWorld({ isGM: false });
 const playerProto = new ShinobiActor();
 playerProto.type = 'party';
 playerProto.system = {};
 const blocked = await playerProto._preCreate({ name: 'Invasão', type: 'party' }, {}, globalThis.game.user);
 assert.equal(blocked, false);

 configureWorld({ isGM: true });
 const gmParty = makeMockActor({ id: 'p300000000000003', name: 'Akatsuki', type: 'party' });
 Object.setPrototypeOf(gmParty, ShinobiActor.prototype);
 await gmParty._preCreate({ name: 'Akatsuki', type: 'party', img: 'icons/svg/mystery-man.svg' }, {}, globalThis.game.user);
 assert.equal(gmParty.prototypeToken.actorLink, true);
 assert.equal(gmParty.img, `systems/${ns}/assets/pf-actor-party.svg`);
});

test('Bloco 1: SnsActorDirectory prepara equipe ativa/outras, contexto de árvore, menus, filtro, colapso e drag & drop', async () => {
 const naruto = makeMockActor({ id: 's100000000000001', name: 'Naruto', type: 'shinobi' });
 const sasuke = makeMockActor({ id: 's200000000000002', name: 'Sasuke', type: 'shinobi' });
 const sakura = makeMockActor({ id: 's300000000000003', name: 'Sakura', type: 'shinobi' });
 const time7 = makeMockActor({
  id: 'p100000000000001',
  name: 'Time 7',
  type: 'party',
  sort: 10,
  system: { members: [naruto.uuid, sakura.uuid] },
  flags: { [ns]: { partyManaged: { version: 1, primary: true } } }
 });
 const taka = makeMockActor({ id: 'p200000000000002', name: 'Taka', type: 'party', sort: 20, system: { members: [sasuke.uuid] } });
 const akatsuki = makeMockActor({ id: 'p300000000000003', name: 'Akatsuki', type: 'party', sort: 30, system: { members: [] } });

 configureWorld({ isGM: true, actors: [time7, taka, akatsuki, naruto, sasuke, sakura], primaryParty: time7.id });

 const Dir = createSnsActorDirectory(MockBaseActorDirectory);
 const dir = new Dir();
 dir.collection = globalThis.game.actors;

 const partiesCtx = await dir._preparePartContext('parties', {}, {});
 assert.equal(partiesCtx.activeParty.id, time7.id);
 assert.equal(partiesCtx.activeParty.expanded, true);
 assert.deepEqual(partiesCtx.otherParties.map(p => p.id), [taka.id, akatsuki.id]);
 assert.equal(partiesCtx.multipleOthers, true);
 assert.equal(partiesCtx.showCreateButton, false);
 assert.equal(partiesCtx.activeParty.members.length, 2);

 const dirCtx = { tree: { entries: [{ id: time7.id }, { id: naruto.id }, { id: 'solo000000000001' }], children: [] } };
 await dir._prepareDirectoryContext(dirCtx, {});
 assert.deepEqual(dirCtx.tree.entries.map(e => e.id), ['solo000000000001']);

 // Drag start injeta fromParty
 const transferred = {};
 const partyDom = makeMiniEl({ tag: 'li', dataset: { entryId: time7.id, party: '' }, classes: ['directory-item', 'folder', 'expanded'] });
 const memberDom = makeMiniEl({ tag: 'li', dataset: { entryId: naruto.id }, classes: ['entry'], parent: partyDom });
 dir._onDragStart({
  currentTarget: memberDom,
  dataTransfer: {
   setData: (k, v) => { transferred[k] = v; },
   getData: k => transferred[k]
  }
 });
 const dragPayload = JSON.parse(transferred['text/plain']);
 assert.equal(dragPayload.fromParty, time7.id);

 // Drop de membro de Time 7 para Taka move entre equipes
 const takaDom = makeMiniEl({ tag: 'li', dataset: { entryId: taka.id, party: '' }, classes: ['directory-item', 'folder'] });
 await dir._handleDroppedEntry(takaDom, { type: 'Actor', uuid: naruto.uuid, fromParty: time7.id });
 assert.equal(time7.system.members.includes(naruto.uuid), false);
 assert.equal(taka.system.members.includes(naruto.uuid), true);

 // Drop fora de [data-party] remove integrante da equipe de origem
 const regularDom = makeMiniEl({ tag: 'div', classes: ['directory-list'] });
 await dir._handleDroppedEntry(regularDom, { type: 'Actor', uuid: sakura.uuid, fromParty: time7.id });
 assert.equal(time7.system.members.includes(sakura.uuid), false);

 // Drop de entrada de compêndio ainda não existente no mundo importa e adiciona na equipe destino
 const compendiumActor = makeMockActor({ id: 'comp000000000001', name: 'Kakashi Compêndio', type: 'shinobi' });
 dir._entryAlreadyExists = () => false;
 dir._droppedOverride = compendiumActor;
 await dir._handleDroppedEntry(takaDom, { type: 'Actor', uuid: 'Compendium.sns.actors.comp000000000001' });
 assert.ok(taka.system.members.some(u => u !== sasuke.uuid && u !== naruto.uuid));
 dir._droppedOverride = null;
 dir._entryAlreadyExists = null;

 // Context options exibem ações específicas corretamente
 const ctxOpts = dir._getEntryContextOptions();
 const optActivate = ctxOpts.find(o => o.label === 'Definir como equipe ativa');
 const optRemove = ctxOpts.find(o => o.label === 'Remover da equipe');
 assert.equal(optActivate.visible(takaDom), true);
 assert.equal(optActivate.visible(partyDom), false); // Time 7 já está ativa
 assert.equal(optRemove.visible(memberDom), true);
 assert.equal(optRemove.visible(partyDom), false);

 // Search filter e collapseAll
 const childEntry = makeMiniEl({ tag: 'li', dataset: { entryId: sasuke.id }, classes: ['entry'], parent: takaDom });
 const folderTitle = makeMiniEl({ tag: 'span', classes: ['folder-name'], textContent: 'Taka' });
 const folderHeader = makeMiniEl({ tag: 'header', classes: ['folder-header'], children: [folderTitle], parent: takaDom });
 takaDom.children.push(folderHeader, childEntry);
 const rootEl = makeMiniEl({ children: [partyDom, takaDom] });
 dir.element = rootEl;
 childEntry.style.display = 'none';
 dir._onSearchFilter(null, 'taka', /taka/i, rootEl);
 assert.equal(takaDom.style.display, 'flex');
 assert.equal(takaDom.classList.contains('expanded'), true);
 dir.collapseAll();
 assert.equal(takaDom.classList.contains('expanded'), false);
 assert.equal(SnsActorDirectory.DEFAULT_OPTIONS.actions.activateParty !== undefined, true);
});

test('Bloco 1: Token HUD (Clown Car) deposita e recolhe tokens dos integrantes da equipe', async () => {
 const naruto = makeMockActor({ id: 's100000000000001', name: 'Naruto', type: 'shinobi', img: 'naruto.png' });
 const sasuke = makeMockActor({ id: 's200000000000002', name: 'Sasuke', type: 'shinobi', img: 'sasuke.png' });
 const party = makeMockActor({ id: 'p100000000000001', name: 'Time 7', type: 'party', system: { members: [naruto.uuid, sasuke.uuid] } });
 configureWorld({ isGM: true, actors: [party, naruto, sasuke] });

 const sceneTokens = [];
 const updateCalls = [];
 const deleteCalls = [];
 const scene = {
  isOwner: true,
  grid: { size: 100 },
  tokens: sceneTokens,
  async createEmbeddedDocuments(_type, docs) {
   const created = docs.map((d, i) => ({ id: 'tok' + i, ...d }));
   sceneTokens.push(...created);
   return created;
  },
  async updateEmbeddedDocuments(_type, patches) {
   updateCalls.push(patches);
   return patches;
  },
  async deleteEmbeddedDocuments(_type, ids) {
   deleteCalls.push(ids);
   for (const id of ids) {
    const idx = sceneTokens.findIndex(t => t.id === id);
    if (idx >= 0) sceneTokens.splice(idx, 1);
   }
   return ids;
  }
 };
 const partyTokenDoc = { actor: party, parent: scene, x: 500, y: 500, elevation: 10 };

 const origCreateElement = globalThis.document?.createElement;
 globalThis.document = {
  createElement: tag => makeMiniEl({ tag })
 };
 try {
  const effectsBtn = makeMiniEl({ tag: 'button', dataset: { palette: 'effects' } });
  const statusPalette = makeMiniEl({ tag: 'div', classes: ['palette', 'status-effects'] });
  const hudRoot = makeMiniEl({ children: [effectsBtn, statusPalette] });
  globalThis.HTMLElement = hudRoot.constructor;

  partyService.decoratePartyTokenHUD({ document: partyTokenDoc }, hudRoot, {});
  assert.equal(statusPalette.removed, true);
  assert.ok(effectsBtn.replacedBy);
  const clownBtn = effectsBtn.replacedBy;
  assert.ok(clownBtn.className === 'control-icon sns-party-clown-car' || clownBtn.classList.contains('sns-party-clown-car') || clownBtn.innerHTML.includes('fa-arrow-right-from-bracket'));

  // Primeiro clique deposita os 2 membros
  await clownBtn.trigger('click');
  assert.equal(sceneTokens.length, 2);
  assert.ok(clownBtn.innerHTML.includes('fa-arrow-right-to-bracket'));

  // Segundo clique aproxima até (500, 500) e recolhe/deleta
  await clownBtn.trigger('click');
  assert.equal(updateCalls.length, 1);
  assert.deepEqual(updateCalls[0].map(p => [p.x, p.y, p.elevation]), [[500, 500, 10], [500, 500, 10]]);
  assert.equal(deleteCalls.length, 1);
  assert.equal(sceneTokens.length, 0);
 } finally {
  if (origCreateElement) globalThis.document.createElement = origCreateElement;
  else delete globalThis.document;
  delete globalThis.HTMLElement;
 }
});

test('Bloco 2: Distribuição de Ryo, transferência de itens, limpar atividades, descanso em grupo e pedido de teste', async () => {
 resetLogs();
 const kunai = { id: 'kunai01', name: 'Kunai', type: 'weapon', system: { category: 'weapons', quantity: 5, equipped: true, compartments: 1, details: { price: 10 } } };
 const jutsu = { id: 'jutsu01', name: 'Katon', type: 'power', system: { category: 'powers', quantity: 1 } };
 const naruto = makeMockActor({ id: 's100000000000001', name: 'Naruto', type: 'shinobi', system: { finances: { ryo: 100 }, resources: { vitality: { value: 5, max: 30, mod: 0 }, chakra: { value: 2, max: 20, baseMax: 20, mod: 0 } }, attributes: { for: 2, agi: 3, vig: 2, int: 2, esp: 2, car: 1 } } });
 const gamakichi = makeMockActor({ id: 'c100000000000001', name: 'Gamakichi', type: 'companion', system: { details: { funds: 10 }, resources: { vitality: { value: 4, max: 24 }, chakra: { value: 1, max: 16, baseMax: 16 } }, stats: { cc: 4, cd: 3, esq: 3, lm: 3, initiative: 3, movement: 8 } } });
 const party = makeMockActor({
  id: 'p100000000000001',
  name: 'Time 7',
  type: 'party',
  system: {
   members: [naruto.uuid, gamakichi.uuid],
   activities: [{ member: naruto.uuid, name: 'Batedor', item: '' }],
   details: { funds: 205 }
  },
  items: [kunai, jutsu]
 });

 configureWorld({ isGM: true, actors: [party, naruto, gamakichi] });

 // 1. Distribuir Ryo
 dialogQueue.push(() => ({ amount: 201, deduct: true, recipients: [naruto.uuid, gamakichi.uuid] }));
 const ryoPlan = await partyService.distributePartyRyo(party);
 assert.equal(ryoPlan.perMember, 100);
 assert.equal(ryoPlan.remainder, 1);
 assert.equal(naruto.system.finances.ryo, 200);
 assert.equal(gamakichi.system.details.funds, 110);
 assert.equal(party.system.details.funds, 5); // 205 - 200 distribuídos
 assert.ok(createdMessages.some(m => m.content.includes('Distribuição de Ryo')));

 // 2. Transferência parcial e total de item físico + bloqueio em poder + rollback em falha
 const kunaiItem = party.items.get('kunai01');
 const partial = await partyService.transferPartyItem(party, kunaiItem, naruto, { quantity: 2 });
 assert.equal(partial.plan.sourceAction, 'update');
 assert.equal(kunaiItem.system.quantity, 3);
 assert.equal(naruto.items.length, 1);
 assert.equal(naruto.items[0].system.quantity, 2);
 assert.equal(naruto.items[0].system.equipped, false);

 // Falha ao criar no destino preserva origem
 gamakichi._failCreateItem = true;
 await assert.rejects(() => partyService.transferPartyItem(party, kunaiItem, gamakichi, { quantity: 3 }), /Não foi possível criar o item/);
 assert.equal(kunaiItem.system.quantity, 3);
 gamakichi._failCreateItem = false;

 // Transferência total remove da origem
 const full = await partyService.transferPartyItem(party, kunaiItem, gamakichi, { quantity: 3 });
 assert.equal(full.plan.sourceAction, 'delete');
 assert.equal(party.items.get('kunai01'), null);

 // Poder não pode ser transferido pelo depósito físico
 await assert.rejects(() => partyService.transferPartyItem(party, party.items.get('jutsu01'), naruto, { quantity: 1 }), /Somente itens físicos/);

 // 3. Limpar atividades
 await partyService.clearPartyActivities(party);
 assert.deepEqual(party.system.activities, []);

 // 4. Descansar equipe (processa requestRest completo via isTimekeeper = true para GM)
 dialogQueue.push(() => true);
 const restResult = await partyService.restParty(party);
 assert.deepEqual(restResult.rested, ['Naruto', 'Gamakichi']);
 assert.deepEqual(restResult.skipped, []);
 assert.equal(naruto.system.resources.vitality.value, 19);
 assert.equal(naruto.system.resources.chakra.value, 11);
 assert.equal(gamakichi.system.resources.vitality.value, 18);
 assert.equal(gamakichi.system.resources.chakra.value, 10);

 // 5. Pedir teste ao grupo e clicar no botão do chat
 dialogQueue.push(() => ({ key: 'skill:prontidao', dc: 14, secret: false }));
 const promptMsg = await partyService.promptPartyCheck(party);
 assert.equal(promptMsg.getFlag(ns, 'partyCheckPrompt').dc, 14);
 const rollBtn = makeMiniEl({ tag: 'button', dataset: { partyCheckRoll: '' } });
 rollBtn.matches = () => true;
 const cardEl = makeMiniEl({ children: [rollBtn] });
 cardEl.querySelector = sel => (sel === '[data-party-check-roll]' ? rollBtn : null);
 globalThis.HTMLElement = cardEl.constructor;
 try {
  partyService.decoratePartyCheckPrompt(promptMsg, cardEl);
  globalThis.canvas.tokens.controlled = [{ actor: gamakichi }];
  const beforeMsgs = createdMessages.length;
  gamakichi.system.recordedSkills = [{ key: 'prontidao', precision: 6, untrained: false }];
  await rollBtn.trigger('click');
  assert.equal(createdMessages.length, beforeMsgs + 1);
  assert.match(createdMessages.at(-1).flavor, /Dif 14/);
 } finally {
  delete globalThis.HTMLElement;
 }
});

test('Bloco 3: memberView, partyView (tooltips e viagem), visibilidade restrita, rollMemberCheck e templates Handlebars', async () => {
 resetLogs();
 const naruto = makeMockActor({
  id: 's100000000000001',
  name: 'Naruto',
  type: 'shinobi',
  system: {
   identity: { rank: 'Genin', clan: 'Uzumaki', village: 'Konoha', languages: 'Comum, Sábio', senses: 'Modo Sábio' },
   resources: { vitality: { value: 15, max: 30, mod: 0 }, chakra: { value: 8, max: 20, baseMax: 20, mod: 0 } },
   stats: { movement: 9 },
   training: { prontidao: true, acrobacia: true },
   attributes: { for: 2, agi: 4, vig: 2, int: 1, esp: 3, car: 2 }
  },
  items: [{ name: 'Explorar ruínas', type: 'item', system: { category: 'exploration', details: {} } }]
 });
 const ninjaNpc = makeMockActor({
  id: 'n100000000000001',
  name: 'Kakashi NPC',
  type: 'npc',
  system: {
   details: { rank: 'Jounin', village: 'Konoha', languages: 'Comum', senses: 'Faro apurado', funds: 500 },
   resources: { vitality: { value: 40, max: 50 }, chakra: { value: 25, max: 40 } },
   stats: { cc: 7, cd: 6, esq: 6, lm: 8, initiative: 6, movement: 9 },
   recordedSkills: [{ key: 'prontidao', precision: 8, untrained: false }, { key: 'ocultismo', precision: 7, untrained: false }]
  }
 });
 const party = makeMockActor({
  id: 'p100000000000001',
  name: 'Time 7',
  type: 'party',
  system: {
   members: [naruto.uuid, ninjaNpc.uuid],
   activities: [{ member: naruto.uuid, name: 'Explorar ruínas', item: '' }],
   details: { funds: 1200 }
  }
 });

 const mvNaruto = memberView(naruto, naruto.uuid);
 assert.equal(mvNaruto.chakraPercent, 40);
 assert.equal(mvNaruto.canRoll, true);
 assert.equal(mvNaruto.prontidao.key, 'prontidao');
 assert.equal(mvNaruto.explorationItems[0].name, 'Explorar ruínas');

 const mvNpc = memberView(ninjaNpc, ninjaNpc.uuid);
 assert.equal(mvNpc.prontidao.precision, 8);
 assert.ok(mvNpc.topSkills.some(s => s.key === 'ocultismo' && s.precision === 7));

 const summary = partyView([mvNaruto, mvNpc], party.system.activities);
 const comum = summary.languages.find(l => l.name === 'Comum');
 assert.equal(comum.count, 2);
 assert.equal(comum.tooltip, 'Naruto, Kakashi NPC');
 const prontidao = summary.skills.find(s => s.key === 'prontidao');
 assert.match(prontidao.tooltip, /Kakashi NPC: \+8\nNaruto:/);
 assert.equal(summary.travel.perMinute, '90');
 assert.equal(summary.travel.kmPerHour, '5,4');
 assert.equal(summary.travel.kmPerDay, '43,2');

 // Navegação restrita oculta Visão geral
 assert.deepEqual(supportingNavigation('party', { restricted: false }).map(([id]) => id), ['details', 'exploration', 'inventory', 'notes']);
 assert.deepEqual(supportingNavigation('party', { restricted: true }).map(([id]) => id), ['exploration', 'inventory', 'notes']);

 // SupportingActorSheet com jogador e showPartyStats = false restringe colega e redireciona aba
 configureWorld({ isGM: false, actors: [party, naruto, ninjaNpc], showPartyStats: false });
 ninjaNpc.isOwner = false;
 naruto.isOwner = true;
 const sheetPlayer = new SupportingActorSheet({ document: party });
 sheetPlayer.actor = party;
 const ctxPlayer = await sheetPlayer._prepareContext({});
 assert.equal(ctxPlayer.partyRestricted, true);
 assert.equal(ctxPlayer.activeTab, 'exploration');
 assert.equal(ctxPlayer.members[0].restricted, false); // própria ficha
 assert.equal(ctxPlayer.members[1].restricted, true);  // ficha de colega/NPC

 // Jogador tentando clicar em tab details permanece em exploration
 await SupportingActorSheet.tab.call(sheetPlayer, null, { dataset: { tab: 'details' } });
 assert.equal(sheetPlayer.activeTab, 'exploration');

 // GM rola secreta (default) e pública (Shift+click) via rollMemberCheck
 configureWorld({ isGM: true, actors: [party, naruto, ninjaNpc], showPartyStats: false });
 await SupportingActorSheet.rollMemberCheck.call(sheetPlayer, { shiftKey: false }, { dataset: { uuid: ninjaNpc.uuid, roll: 'lm' } });
 assert.equal(createdMessages.at(-1).messageMode, 'gm');

 await SupportingActorSheet.rollMemberCheck.call(sheetPlayer, { shiftKey: true }, { dataset: { uuid: ninjaNpc.uuid, roll: 'skill:prontidao' } });
 assert.equal(createdMessages.at(-1).messageMode, 'public');

 // Compilação e renderização Handlebars dos templates modificados/novos
 if (Handlebars) {
  const sheetGM = new SupportingActorSheet({ document: party });
  sheetGM.actor = party;
  sheetGM.activeTab = 'details';
  const ctxGM = await sheetGM._prepareContext({});
  const partyHtml = Handlebars.compile(readSystem('templates/partials/party.hbs'))(ctxGM);
  assert.match(partyHtml, /class="party-visibility-toggle/);
  assert.match(partyHtml, /class="party-chakra"/);
  assert.match(partyHtml, /data-action="rollMemberCheck" data-uuid="Actor\.n100000000000001" data-roll="cc"/);
  assert.match(partyHtml, /title="Naruto, Kakashi NPC">Comum \(2\)/);

  sheetGM.summaryTab = 'skills';
  const ctxSkills = await sheetGM._prepareContext({});
  const skillsHtml = Handlebars.compile(readSystem('templates/partials/party.hbs'))(ctxSkills);
  assert.match(skillsHtml, /Kakashi NPC: \+8/);

  sheetGM.activeTab = 'exploration';
  const ctxExp = await sheetGM._prepareContext({});
  const expHtml = Handlebars.compile(readSystem('templates/partials/party.hbs'))(ctxExp);
  assert.match(expHtml, /data-action="clearAllActivities"/);
  assert.match(expHtml, /data-action="promptPartyCheck"/);
  assert.match(expHtml, /data-action="restParty"/);
  assert.match(expHtml, /43,2 km/);

  sheetGM.activeTab = 'inventory';
  const ctxInv = await sheetGM._prepareContext({});
  const invHtml = Handlebars.compile(readSystem('templates/partials/party.hbs'))(ctxInv);
  assert.match(invHtml, /data-party-drop-member=/);

  const dirHtml = Handlebars.compile(readSystem('templates/partials/party-directory.hbs'))({
   activeParty: { id: party.id, name: 'Time 7', img: party.img, active: true, expanded: true, members: [naruto, ninjaNpc] },
   otherParties: [
    { id: 'p2', name: 'Taka', img: 'taka.svg', active: false, expanded: false, members: [] },
    { id: 'p3', name: 'Akatsuki', img: 'aka.svg', active: false, expanded: false, members: [] }
   ],
   multipleOthers: true,
   otherPartiesExpanded: false,
   showCreateButton: false,
   isGM: true,
   entryPartial: 'mock/document-partial.hbs'
  });
  assert.match(dirHtml, /class="plain sns-parties"/);
  assert.match(dirHtml, /Outras equipes/);
  assert.match(dirHtml, /data-action="activateParty"/);
 }
});
