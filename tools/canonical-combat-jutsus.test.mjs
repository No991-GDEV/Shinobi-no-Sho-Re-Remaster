import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

globalThis.foundry = {
  applications: { api: { ApplicationV2: class {}, HandlebarsApplicationMixin: B => B } },
  documents: { ChatMessage: { getSpeaker: () => ({ actor: 'fixture' }) } }
};

const { npcJutsuPlan } = await import('../src/system/sns-v14-dev/scripts/npc-jutsu-core.mjs');
const { packetFor } = await import('../src/system/sns-v14-dev/scripts/npc-jutsu-service.mjs');
const { defenseChoices } = await import('../src/system/sns-v14-dev/scripts/defense-choices.mjs');

const library = JSON.parse(
  fs.readFileSync(new URL('../src/content/sns-conteudo-dev/content/basico-canonico-v1.json', import.meta.url), 'utf8')
);
const entries = library.entries;

function makeShinobi({ name = 'Shinobi', items = [], attributes = {}, skillLevels = {}, skills = {} } = {}) {
  const itemList = [...items];
  itemList.get = id => itemList.find(i => i.id === id);
  const sys = {
    nc: 4,
    identity: { size: 'Médio' },
    details: { size: 'Médio' },
    attributes: { for: 8, des: 6, agi: 8, vig: 6, int: 6, esp: 6, per: 6, ...attributes },
    bases: { cc: 3, cd: 3, esq: 3, lm: 3 },
    derived: {
      combat: {
        cc: { precision: 11 },
        cd: { precision: 9 },
        esq: { precision: 11 },
        lm: { precision: 9 }
      }
    },
    stats: { cc: 11, cd: 9, esq: 11, lm: 9 },
    skills: {
      acrobacia: { bought: 0 }, atletismo: { bought: 0 }, arte: { bought: 2 },
      escapar: { bought: 0 }, furtividade: { bought: 0 }, ocultar: { bought: 0 },
      ocultismo: { bought: 2 }, prontidao: { bought: 2 }, veneficio: { bought: 0 },
      ...skills
    },
    skillLevels,
    resources: { chakra: { value: 20, max: 20 } },
    activeAptitudes: []
  };
  const rawSys = structuredClone(sys);
  Object.defineProperty(sys, 'toObject', { value: () => structuredClone(rawSys), enumerable: false });
  return {
    uuid: 'Actor.' + name,
    name,
    type: 'shinobi',
    isOwner: true,
    items: itemList,
    flags: {},
    system: sys
  };
}

function makeEntryItem(actor, contentId) {
  const entry = entries.find(e => e.id === contentId);
  assert.ok(entry, 'Entry missing: ' + contentId);
  const item = {
    id: 'item-' + contentId.split(':').at(-1),
    uuid: actor.uuid + '.Item.' + contentId.split(':').at(-1),
    name: entry.document.name,
    type: 'jutsu',
    actor,
    flags: {},
    system: structuredClone(entry.document.system)
  };
  return item;
}

const apt = (id, contentId) => ({ id, name: contentId, type: 'aptitude', system: { contentId, ruleId: contentId } });
const pwr = (id, contentId, level) => ({ id, name: contentId, type: 'power', system: { contentId, level, power: { definitionId: contentId, choices: [] } } });
const kunai = (id = 'kunai') => {
  const doc = structuredClone(entries.find(e => e.id === 'sns:equipment:kunai').document);
  doc.id = id;
  doc.system.equipped = true;
  doc.system.quantity = 1;
  return doc;
};

test('Konoha Senpuu: finta Agilidade + ataque CC desarmado + bônus de Punho de Ferro, Chute Giratório e Chute Inverso', () => {
  const baseActor = makeShinobi();
  const baseItem = makeEntryItem(baseActor, 'sns:jutsu:konoha-senpu');
  const p1 = npcJutsuPlan(baseItem, entries);
  assert.equal(p1.mode, 'attack:cc');
  assert.equal(p1.cost, 0);
  assert.equal(p1.base, 4); // ceil(8/2)
  assert.equal(p1.damageNature, 'nonlethal');
  assert.equal(p1.action, 'Completa');
  assert.equal(p1.checks[0].key, 'attribute:agi');
  assert.deepEqual(p1.missing, []);

  const upgradedActor = makeShinobi({
    items: [
      apt('a1', 'sns:apt:punho-de-ferro'),
      apt('a2', 'sns:apt:chute-giratorio'),
      apt('a3', 'sns:apt:chute-inverso')
    ]
  });
  const upgradedItem = makeEntryItem(upgradedActor, 'sns:jutsu:konoha-senpu');
  const p2 = npcJutsuPlan(upgradedItem, entries);
  assert.equal(p2.base, 8); // ceil(8/2)=4 + iron(FOR 8 => +2) + chute-giratorio(+2)
  assert.equal(p2.damageNature, 'lethal');
  assert.equal(p2.action, 'Padrão');
  assert.deepEqual(p2.allowedDefenses, ['dodge', 'anticipate']);
});

test('Konoha Reppuu: com/sem Rasteira, Ataque Giratório, Derrubar Agressivo e Arremessar', () => {
  const plainActor = makeShinobi();
  const plainItem = makeEntryItem(plainActor, 'sns:jutsu:konoha-reppu');
  const p1 = npcJutsuPlan(plainItem, entries);
  assert.equal(p1.mode, 'attack:cc');
  assert.equal(p1.cost, 0);
  assert.equal(p1.noDamage, true);
  assert.equal(p1.testAdjustment, 0);
  assert.deepEqual(p1.missing, []);

  const aggActor = makeShinobi({
    items: [
      apt('r', 'sns:apt:rasteira'),
      apt('ag', 'sns:apt:derrubar-agressivo'),
      apt('arr', 'sns:apt:arremessar'),
      apt('g', 'sns:apt:ataque-giratorio')
    ]
  });
  const aggItem = makeEntryItem(aggActor, 'sns:jutsu:konoha-reppu');
  const missingCtx = npcJutsuPlan(aggItem, entries);
  assert.ok(missingCtx.missing.includes('context'));
  const pDmg = npcJutsuPlan(aggItem, entries, undefined, { contextChoice: 'damage' });
  assert.equal(pDmg.mode, 'attack:cc');
  assert.equal(pDmg.noDamage, false);
  assert.equal(pDmg.base, 4);
  assert.equal(pDmg.fixed, 0);
  assert.equal(pDmg.testAdjustment, 1);
  assert.equal(pDmg.shape, 'circle');
  assert.equal(pDmg.size, 3);
  assert.deepEqual(pDmg.missing, []);

  const pWall = npcJutsuPlan(aggItem, entries, undefined, { contextChoice: 'throw-wall' });
  assert.equal(pWall.noDamage, false);
  assert.equal(pWall.base, 0);
  assert.equal(pWall.fixed, 8);
});

test('Konoha Daisenpuu (multiAttack) e Konoha Shoufu (Arremessar e Agressivo)', () => {
  const actor = makeShinobi({ items: [apt('cg', 'sns:apt:chute-giratorio')] });
  const daisenpu = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:konoha-daisenpu'), entries);
  assert.equal(daisenpu.mode, 'attack:cc');
  assert.equal(daisenpu.multiAttack, true);
  assert.equal(daisenpu.base, 6); // 4 + 2
  assert.equal(daisenpu.checks[0].key, 'attribute:agi');

  const shofuWall = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:konoha-shofu'), entries, undefined, { contextChoice: 'throw-wall' });
  assert.equal(shofuWall.mode, 'attack:cc');
  assert.equal(shofuWall.noDamage, false);
  assert.equal(shofuWall.fixed, 8);

  const shofuManeuver = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:konoha-shofu'), entries, undefined, { contextChoice: 'maneuver' });
  assert.equal(shofuManeuver.noDamage, true);
  assert.deepEqual(shofuManeuver.missing, []);
});

test('Oukashou (Kyoudo Kyouka), Hirudora, Yagai, Bakudan, Engolimento, Ino-Shika-Chou Yooyoo, Makyo no Ran e demais técnicas canônicas', () => {
  const actor = makeShinobi({
    items: [
      kunai('k1'),
      pwr('jinch', 'sns:power:jinchuuriki', 6),
      pwr('iryou', 'sns:power:iryou-ninjutsu', 4),
      pwr('fuuin', 'sns:power:fuuinjutsu', 4),
      pwr('kuch', 'sns:power:kuchiyose', 5),
      apt('pf', 'sns:apt:punho-de-ferro'),
      { id: 'per-arte', name: 'Perito', type: 'aptitude', system: { contentId: 'sns:apt:perito', ruleId: 'sns:apt:perito', choice: { key: 'arte' } } }
    ]
  });

  const oukNv2 = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:oukashou'), entries, undefined, { contextChoice: 'direct-nv2' });
  assert.equal(oukNv2.mode, 'attack:cc');
  assert.equal(oukNv2.cost, 3); // ceil(6/2)
  assert.equal(oukNv2.base, 10); // ESP(6) + Iryou(4)
  assert.equal(oukNv2.damageNature, 'lethal');
  assert.deepEqual(oukNv2.allowedDefenses, ['dodge', 'anticipate']);
  assert.equal(oukNv2.noDamage, false);

  const oukNv1 = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:oukashou'), entries, undefined, { contextChoice: 'direct-nv1' });
  assert.equal(oukNv1.base, 7); // ceil(6/2) + Iryou(4)

  const oukGround = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:oukashou'), entries, undefined, { contextChoice: 'ground-nv2' });
  assert.equal(oukGround.base, 5); // floor(10/2)
  assert.equal(oukGround.shape, 'circle');
  assert.equal(oukGround.size, 9);
  assert.deepEqual(oukGround.allowedDefenses, ['dodge', 'anticipate']);

  const hirudora = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:hirudora'), entries, undefined, { contextChoice: 't2' });
  assert.equal(hirudora.mode, 'attack:cc');
  assert.equal(hirudora.gradeMinimum, 2);
  assert.deepEqual(hirudora.allowedDefenses, ['dodge', 'anticipate']);

  const yagai = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:yagai'), entries, undefined, { contextChoice: 't4' });
  assert.equal(yagai.mode, 'attack:cc');
  assert.equal(yagai.gradeMinimum, 4);
  assert.deepEqual(yagai.allowedDefenses, []);

  const bakudanItem = makeEntryItem(actor, 'sns:jutsu:bakudan');
  bakudanItem.system.details.powerId = 'fuuin';
  const bakudan = npcJutsuPlan(bakudanItem, entries, 4, { contextChoice: 'activate' });
  assert.equal(bakudan.mode, 'save');
  assert.equal(bakudan.cost, 2);
  assert.equal(bakudan.dc, 17); // 9 + 2*4
  assert.equal(bakudan.base, 8); // 2*4
  assert.equal(bakudan.shape, 'circle');
  assert.equal(bakudan.size, 8);
  assert.equal(bakudan.noDamage, false);

  const engolido = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:engolimento'), entries, undefined, { contextChoice: 'inside' });
  assert.equal(engolido.mode, 'save');
  assert.equal(engolido.dc, 17); // 9 + FOR(8)
  assert.equal(engolido.fixed, 3); // veneficio ceil(6/2)=3

  const yooyoo = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:hb-f05-ino-shika-chou-yooyoo'), entries, undefined, { contextChoice: 'cd' });
  assert.equal(yooyoo.mode, 'attack:cd');
  assert.equal(yooyoo.base, 6); // unarmed(6) + hardness(0)

  const makyo = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:shukyoku-daikyusetsu-makyo-no-ran'), entries);
  assert.equal(makyo.mode, 'attack:cc');
  assert.equal(makyo.cost, 5);
  assert.equal(makyo.base, 9); // kuch(5) + ceil(arte(5)/2)=3 + Perito(1)
  assert.equal(makyo.ignoreAllHardness, true);
  assert.equal(makyo.ignoreArmor, true);
  assert.deepEqual(makyo.allowedDefenses, ['dodge', 'anticipate']);
  assert.equal(makyo.multiAttack, true);

  const sennenWall = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:hb-f05-sennen-goroshi'), entries, undefined, { contextChoice: 'stun-wall' });
  assert.equal(sennenWall.fixed, 8);
  assert.equal(sennenWall.noDamage, false);

  const sangosho = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:sangosho'), entries);
  assert.equal(sangosho.mode, 'attack:cc');
  assert.equal(sangosho.noDamage, true);

  const po = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:po-de-prata'), entries);
  assert.equal(po.mode, 'attack:cd');
  assert.equal(po.noDamage, true);
  assert.equal(po.shape, 'circle');
  assert.equal(po.size, 12);
  assert.deepEqual(po.allowedDefenses, ['block']);

  const tsunoori = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:tsunoori'), entries);
  assert.equal(tsunoori.mode, 'attack:cc');
  assert.equal(tsunoori.cost, 4);
  assert.equal(tsunoori.base, 10); // ceil(8/2)+6
  assert.equal(tsunoori.damageNature, 'lethal');

  const hipnose = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:hipnose-sharingan'), entries);
  assert.equal(hipnose.mode, 'save');
  assert.equal(hipnose.cost, 5);
  assert.deepEqual(hipnose.saveKeys, ['attribute:int']);
  assert.equal(hipnose.dc, 14); // 8 + 6

  const tsukTorture = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:tsukuyomi'), entries, undefined, { contextChoice: 'torture' });
  assert.equal(tsukTorture.mode, 'save');
  assert.equal(tsukTorture.dc, 17); // 11 + 6
  assert.equal(tsukTorture.visionCost, 2);

  const tsukMsg = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:tsukuyomi'), entries, undefined, { contextChoice: 'messenger' });
  assert.equal(tsukMsg.mode, 'none');
  assert.equal(tsukMsg.visionCost, 1);

  const sojasosai = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:sojasosai-no-jutsu'), entries);
  assert.equal(sojasosai.mode, 'attack:cc');
  assert.equal(sojasosai.cost, 10);
  assert.equal(sojasosai.noDamage, true);

  const mikazuki = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:hb-f05-mikazuki-no-mai'), entries);
  assert.equal(mikazuki.mode, 'attack:cc');
  assert.equal(mikazuki.weaponId, 'k1');
  assert.equal(mikazuki.base, 6); // ceil(8/2)=4 + kunai(1) + 1
  assert.equal(mikazuki.checks[0].adjustment, 1);

  const avanco = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:avanco-ofensivo'), entries);
  assert.equal(avanco.mode, 'attack:cc');
  assert.equal(avanco.gradeBonus, 0.5);
  assert.equal(avanco.base, 6);

  const corvos = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:hb-f06-sanzengarasu-no-jutsu'), entries, undefined, { contextChoice: 'attack', contextValue: 7 });
  assert.equal(corvos.mode, 'attack:cd');
  assert.equal(corvos.base, 7);
  assert.equal(corvos.cost, 5);
  assert.deepEqual(corvos.missing, []);

  const akumu = npcJutsuPlan(makeEntryItem(actor, 'sns:jutsu:akumu-no-kyuin'), entries);
  assert.equal(akumu.mode, 'save');
  assert.equal(akumu.cost, 7); // ceil(6/2)+4
  assert.equal(akumu.dc, 14); // 8 + 6
  assert.deepEqual(akumu.saveKeys, ['attribute:for', 'skill:escapar']);
  assert.equal(akumu.shape, 'cone');
  assert.equal(akumu.size, 16);
});

test('packetFor gera damageSnapshot válido com attackKind melee, attackerSize e weaponClass Desarmado (incluindo noDamage) e libera defesas do alvo', () => {
  const caster = makeShinobi({ name: 'Caster' });
  const target = makeShinobi({ name: 'Alvo', items: [kunai('k-def')] });
  const targetToken = { actor: target, name: target.name };

  // Ataque com dano: Konoha Senpu
  const senpuItem = makeEntryItem(caster, 'sns:jutsu:konoha-senpu');
  const senpuPlan = npcJutsuPlan(senpuItem, entries);
  const senpuPacket = packetFor(caster, senpuItem, senpuPlan, { valid: true, usedLevel: 1, data: { damage: String(senpuPlan.base) }, combatProfile: {}, traits: [] }, [targetToken]);
  assert.ok(senpuPacket);
  assert.equal(senpuPacket.profile.attackKind, 'melee');
  assert.equal(senpuPacket.profile.attackerSize, 'Médio');
  assert.equal(senpuPacket.profile.weaponClass, 'Desarmado');
  assert.equal(senpuPacket.profile.base, 4);
  assert.equal(senpuPacket.targets.length, 1);

  const senpuDefenses = defenseChoices(target, senpuPacket.profile);
  assert.ok(senpuDefenses.some(c => c.id === 'dodge'), 'Esquivar disponível');
  assert.ok(senpuDefenses.some(c => c.id === 'anticipate'), 'Antecipar disponível');
  assert.ok(senpuDefenses.some(c => c.id === 'block-k-def'), 'Bloquear com arma disponível');

  // Manobra sem dano: Konoha Reppu
  const reppuItem = makeEntryItem(caster, 'sns:jutsu:konoha-reppu');
  const reppuPlan = npcJutsuPlan(reppuItem, entries);
  const reppuPacket = packetFor(caster, reppuItem, reppuPlan, { valid: true, usedLevel: 1, data: { damage: 'Nenhum' }, combatProfile: { noDamage: true }, traits: [] }, [targetToken]);
  assert.ok(reppuPacket);
  assert.equal(reppuPacket.profile.noDamage, true);
  assert.equal(reppuPacket.profile.attackKind, 'melee');
  assert.equal(reppuPacket.profile.weaponClass, 'Desarmado');

  const reppuDefenses = defenseChoices(target, reppuPacket.profile);
  assert.ok(reppuDefenses.some(c => c.id === 'dodge'));
  assert.ok(reppuDefenses.some(c => c.id === 'anticipate'));
  assert.ok(reppuDefenses.some(c => c.id === 'block-k-def'));

  // Po de Prata: area que bloqueia dodge/anticipate e permite apenas block
  const poItem = makeEntryItem(caster, 'sns:jutsu:po-de-prata');
  const poPlan = npcJutsuPlan(poItem, entries);
  const poPacket = packetFor(caster, poItem, poPlan, { valid: true, usedLevel: 1, data: { damage: 'Nenhum' }, combatProfile: { noDamage: true }, traits: [] }, [targetToken]);
  assert.deepEqual(poPacket.profile.allowedDefenses, ['block']);
  const poDefenses = defenseChoices(target, poPacket.profile);
  assert.ok(!poDefenses.some(c => c.id === 'dodge'));
  assert.ok(!poDefenses.some(c => c.id === 'anticipate'));

  // Chute Inverso em Konoha Senpu: impede Bloqueio
  const casterInv = makeShinobi({ name: 'CasterInv', items: [apt('inv', 'sns:apt:chute-inverso')] });
  const invItem = makeEntryItem(casterInv, 'sns:jutsu:konoha-senpu');
  const invPlan = npcJutsuPlan(invItem, entries);
  const invPacket = packetFor(casterInv, invItem, invPlan, { valid: true, usedLevel: 1, data: { damage: String(invPlan.base) }, combatProfile: {}, traits: [] }, [targetToken]);
  const invDefenses = defenseChoices(target, invPacket.profile);
  assert.ok(invDefenses.some(c => c.id === 'dodge'));
  assert.ok(invDefenses.some(c => c.id === 'anticipate'));
  assert.ok(!invDefenses.some(c => c.id === 'block-k-def'));
});

test('npcJutsuPlan é determinístico entre chamadas sucessivas', () => {
  const actor = makeShinobi({ items: [apt('pf', 'sns:apt:punho-de-ferro'), kunai()] });
  for (const id of ['sns:jutsu:konoha-senpu', 'sns:jutsu:konoha-reppu', 'sns:jutsu:konoha-daisenpu', 'sns:jutsu:tsunoori', 'sns:jutsu:hipnose-sharingan']) {
    const item = makeEntryItem(actor, id);
    const a = JSON.stringify(npcJutsuPlan(item, entries));
    const b = JSON.stringify(npcJutsuPlan(item, entries));
    assert.equal(a, b, id);
  }
});
