import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const warnings = [];
globalThis.ui = {
 notifications: {
  warn: msg => warnings.push(String(msg)),
  info: () => {}
 }
};

const library = JSON.parse(
 fs.readFileSync(new URL('../src/content/sns-conteudo-dev/content/basico-canonico-v1.json', import.meta.url), 'utf8')
);
const manifest = JSON.parse(
 fs.readFileSync(new URL('../src/content/sns-conteudo-dev/module.json', import.meta.url), 'utf8')
);
const nc4Fixture = JSON.parse(
 fs.readFileSync(new URL('./fixtures/shinobi-nc4.json', import.meta.url), 'utf8')
);

const book = id => structuredClone(library.entries.find(e => e.id === id).document);

function setByPath(target, pathStr, value) {
 const parts = pathStr.split('.');
 let cur = target;
 for (let i = 0; i < parts.length - 1; i++) {
  if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
  cur = cur[parts[i]];
 }
 cur[parts.at(-1)] = structuredClone(value);
}

class MockFoundryItem {
 constructor(data = {}, options = {}) {
  const clone = structuredClone(data);
  Object.assign(this, clone);
  this.system ??= {};
  this.flags ??= {};
  this.actor = options.parent ?? data.actor ?? null;
 }
 async _preCreate() {
  return true;
 }
 updateSource(patch = {}) {
  for (const [k, v] of Object.entries(patch)) setByPath(this, k, v);
 }
 toObject() {
  return structuredClone({
   id: this.id,
   name: this.name,
   type: this.type,
   img: this.img,
   system: this.system,
   flags: this.flags
  });
 }
}

globalThis.foundry = {
 applications: { api: { ApplicationV2: class {}, HandlebarsApplicationMixin: B => B, DialogV2: class {} } },
 documents: { Item: MockFoundryItem },
 utils: {
  expandObject: x => x,
  mergeObject: (a, b) => ({ ...a, ...b })
 }
};

globalThis.fetch = async url => {
 const file = String(url).split('/').at(-1);
 if (file === 'basico-canonico-v1.json') return { ok: true, json: async () => library };
 return { ok: false, json: async () => null };
};

function setupGame({ isGM = false } = {}) {
 globalThis.game = {
  user: { id: isGM ? 'gm-user' : 'player-user', isGM },
  settings: { get: () => false },
  items: [],
  packs: manifest.packs.map(p => ({
   collection: 'sns-conteudo-dev.' + p.name,
   documentName: p.type,
   metadata: p,
   testUserPermission: () => isGM || p.ownership?.PLAYER === 'OBSERVER',
   getIndex: async () => library.entries
    .filter(e => (e.publicationPack ?? 'basico') === p.name)
    .map(e => ({ _id: e.id.replaceAll(':', '-'), ...structuredClone(e.document) }))
  }))
 };
}

setupGame({ isGM: true });

const { packageAcquisitionProblems } = await import('../src/system/sns-v14-dev/scripts/restricted-access.mjs');
const { requirementGate } = await import('../src/system/sns-v14-dev/scripts/catalog-requirement-filter.mjs');
const { SnsCatalog } = await import('../src/system/sns-v14-dev/scripts/catalog-browser.mjs');
const { SnsItem } = await import('../src/system/sns-v14-dev/scripts/item.mjs');
const { investmentBudget } = await import('../src/system/sns-v14-dev/scripts/investment-budget.mjs');
const { guideRequirements, mayFinishCreation } = await import('../src/system/sns-v14-dev/scripts/guide-validation.mjs');

function makeCatalogRow(doc, packName = 'hijutsus-1') {
 return {
  documentName: 'Item',
  requirementFlags: { 'sns-v14-dev': { requirements: doc.flags?.['sns-v14-dev']?.requirements } },
  contentId: doc.system.contentId,
  id: 'Compendium.sns-conteudo-dev.' + packName + '.Item.' + doc.system.contentId,
  uuid: 'Compendium.sns-conteudo-dev.' + packName + '.Item.' + doc.system.contentId,
  name: doc.name,
  type: doc.type,
  category: doc.system.category,
  level: doc.system.level > 0 ? doc.system.level : null,
  tags: doc.system.tags ?? [],
  traits: doc.system.traits ?? [],
  sourceId: doc.system.source?.id ?? '',
  source: doc.system.source?.id ?? '',
  origin: packName,
  canAdd: true,
  ruleSystem: {
   contentId: doc.system.contentId,
   ruleId: doc.system.ruleId,
   details: doc.system.details,
   choice: doc.system.choice
  }
 };
}

function makeCreationActor(items = []) {
 const system = structuredClone(nc4Fixture.system);
 system.budgets.powersSpent = 0;
 system.budgets.investmentReviewed = true;
 const actor = {
  id: 'pc-1',
  uuid: 'Actor.pc-1',
  name: 'Samurai Jinchuuriki',
  type: 'shinobi',
  isOwner: true,
  flags: { 'sns-v14-dev': {} },
  system,
  items: [...items]
 };
 actor.items.get = id => actor.items.find(i => i.id === id);
 Object.defineProperty(actor.system, 'toObject', {
  value: () => {
   const { toObject, ...rest } = actor.system;
   return structuredClone(rest);
  },
  enumerable: false,
  configurable: true
 });
 return actor;
}

test('packageAcquisitionProblems blocks players from combining incompatible primary origins while allowing GM, and still blocks exact duplicates', () => {
 const samurai = book('sns:hijutsu:samurai');
 const jinchuuriki = book('sns:power:jinchuuriki');
 const uchiha = book('sns:clan:uchiha');
 const tensai = book('sns:hijutsu:tensai');
 const hatake = book('sns:clan:hatake');

 const actorWithJinchuuriki = makeCreationActor([{ ...jinchuuriki, id: 'jin1' }]);
 const actorWithSamurai = makeCreationActor([{ ...samurai, id: 'sam1' }]);
 const actorWithUchiha = makeCreationActor([{ ...uchiha, id: 'uch1' }]);
 const actorWithHatake = makeCreationActor([{ ...hatake, id: 'hat1' }]);

 // Jogador (padrão de 2 argumentos e explícito isGM: false) é bloqueado
 assert.equal(packageAcquisitionProblems(samurai, actorWithJinchuuriki).length, 1);
 assert.equal(packageAcquisitionProblems(samurai, actorWithJinchuuriki, { isGM: false }).length, 1);
 assert.equal(packageAcquisitionProblems(jinchuuriki, actorWithSamurai).length, 1);
 assert.equal(packageAcquisitionProblems(samurai, actorWithUchiha).length, 1);

 // Mestre é liberado para combinar origens distintas
 assert.deepEqual(packageAcquisitionProblems(samurai, actorWithJinchuuriki, { isGM: true }), []);
 assert.deepEqual(packageAcquisitionProblems(jinchuuriki, actorWithSamurai, { isGM: true }), []);
 assert.deepEqual(packageAcquisitionProblems(samurai, actorWithUchiha, { isGM: true }), []);

 // Duplicata da mesma origem segue bloqueada até para o mestre
 assert.deepEqual(packageAcquisitionProblems(samurai, actorWithSamurai, { isGM: true }), ['A ficha já possui esta origem.']);
 assert.deepEqual(packageAcquisitionProblems(jinchuuriki, actorWithJinchuuriki, { isGM: true }), ['A ficha já possui esta origem.']);

 // Pares canônicos (Tensai + Hatake) continuam permitidos para ambos
 assert.deepEqual(packageAcquisitionProblems(tensai, actorWithHatake, { isGM: false }), []);
 assert.deepEqual(packageAcquisitionProblems(tensai, actorWithHatake, { isGM: true }), []);
});

test('requirementGate marks Samurai as blocked for players and ok for GM on a Jinchuuriki actor, while blocking duplicates', () => {
 const samurai = book('sns:hijutsu:samurai');
 const jinchuuriki = book('sns:power:jinchuuriki');
 const samuraiRow = makeCatalogRow(samurai, 'hijutsus-1');

 const actorWithJinchuuriki = makeCreationActor([{ ...jinchuuriki, id: 'jin1' }]);
 assert.equal(requirementGate(samuraiRow, actorWithJinchuuriki), 'blocked');
 assert.equal(requirementGate(samuraiRow, actorWithJinchuuriki, { isGM: false }), 'blocked');
 assert.equal(requirementGate(samuraiRow, actorWithJinchuuriki, { isGM: true }), 'ok');

 const actorWithBoth = makeCreationActor([{ ...jinchuuriki, id: 'jin1' }, { ...samurai, id: 'sam1' }]);
 assert.equal(requirementGate(samuraiRow, actorWithBoth, { isGM: true }), 'blocked');
});

test('SnsCatalog._prepareContext locks Samurai for player and exposes GM override notice when actor already owns Jinchuuriki', async () => {
 const jinchuuriki = book('sns:power:jinchuuriki');
 const actor = makeCreationActor([{ ...jinchuuriki, id: 'jin1' }]);

 setupGame({ isGM: false });
 const playerCatalog = new SnsCatalog({ actor, category: 'features' });
 playerCatalog.filters.query = 'Samurai';
 const playerCtx = await playerCatalog._prepareContext();
 const playerRow = playerCtx.rows.find(r => r.contentId === 'sns:hijutsu:samurai');
 assert(playerRow, 'Samurai must appear in catalog rows for player');
 assert.equal(playerRow.canAdd, false);
 assert.equal(playerRow.addBlocked, true);

 setupGame({ isGM: true });
 const gmCatalog = new SnsCatalog({ actor, category: 'features' });
 gmCatalog.filters.query = 'Samurai';
 const gmCtx = await gmCatalog._prepareContext();
 const gmRow = gmCtx.rows.find(r => r.contentId === 'sns:hijutsu:samurai');
 assert(gmRow, 'Samurai must appear in catalog rows for GM');
 assert.equal(gmRow.canAdd, true);
 assert.equal(gmRow.addBlocked, false);
 assert.equal(gmRow.requirementMessage, 'Exceção do mestre: combina origens');
});

test('SnsItem._preCreate permits GM to add Samurai + Jinchuuriki in either order, blocks players and duplicates, and keeps normal PP and creation validation', async () => {
 warnings.length = 0;
 const samuraiDoc = book('sns:hijutsu:samurai');
 const jinchuurikiDoc = book('sns:power:jinchuuriki');
 jinchuurikiDoc.system.level = 2;
 jinchuurikiDoc.system.choice = { kind: 'bijuu', key: 'kyuubi' };
 const ninpouDoc = book('sns:power:ninpou');
 ninpouDoc.system.level = 2;

 // 1. Ator com Jinchuuriki: jogador bloqueado ao tentar adicionar Samurai
 const actorWithJin = makeCreationActor([{ ...jinchuurikiDoc, id: 'jin1' }]);
 const playerSamurai = new SnsItem(samuraiDoc, { parent: actorWithJin });
 const playerRes = await playerSamurai._preCreate(samuraiDoc, {}, { id: 'player-user', isGM: false });
 assert.equal(playerRes, false);
 assert(warnings.some(w => w.includes('Esta combinação não é permitida pelas regras')));

 // 2. Ator com Jinchuuriki: mestre consegue adicionar Samurai e grava gmOverride
 const gmSamurai = new SnsItem(samuraiDoc, { parent: actorWithJin });
 const gmRes = await gmSamurai._preCreate(samuraiDoc, {}, { id: 'gm-user', isGM: true });
 assert.notEqual(gmRes, false);
 assert.equal(gmSamurai.flags['sns-v14-dev'].originAuthorization.rule, 'samurai');
 assert.equal(gmSamurai.flags['sns-v14-dev'].originAuthorization.gmOverride, true);

 // 3. Ordem inversa: ator com Samurai recebe Jinchuuriki pelo mestre (e jogador é bloqueado)
 const actorWithSam = makeCreationActor([{ ...samuraiDoc, id: 'sam1' }]);
 const playerJin = new SnsItem(jinchuurikiDoc, { parent: actorWithSam });
 assert.equal(await playerJin._preCreate(jinchuurikiDoc, {}, { id: 'player-user', isGM: false }), false);

 const gmJin = new SnsItem(jinchuurikiDoc, { parent: actorWithSam });
 assert.notEqual(await gmJin._preCreate(jinchuurikiDoc, {}, { id: 'gm-user', isGM: true }), false);
 assert.equal(gmJin.flags['sns-v14-dev'].originAuthorization.rule, 'jinchuuriki');
 assert.equal(gmJin.flags['sns-v14-dev'].originAuthorization.gmOverride, true);

 // 4. Duplicata exata continua bloqueada mesmo para o mestre
 actorWithJin.items.push({ ...gmSamurai, id: 'sam1' });
 const dupSamurai = new SnsItem(samuraiDoc, { parent: actorWithJin });
 assert.equal(await dupSamurai._preCreate(samuraiDoc, {}, { id: 'gm-user', isGM: true }), false);

 // 5. Contabilidade normal de PP e validação de criação (Jinchuuriki 2 PP + Ninpou 2 PP = 4 PP)
 actorWithJin.items.push({ ...ninpouDoc, id: 'nin1' });
 const budget = investmentBudget(actorWithJin.system, actorWithJin.items);
 assert.equal(budget.powerSpent, 4);
 assert.equal(budget.spent, 4);
 assert.equal(budget.complete, true);

 const reqs = guideRequirements(actorWithJin, { items: actorWithJin.items.map(i => ({ id: i.id, name: i.name, category: i.system.category })) });
 assert(reqs.every(r => r.status === 'ok'), 'Samurai and Jinchuuriki requirements should both be ok');
 assert.equal(mayFinishCreation(actorWithJin, actorWithJin.system), true);
});
