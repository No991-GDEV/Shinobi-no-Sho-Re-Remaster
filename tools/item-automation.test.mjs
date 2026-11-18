import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

globalThis.foundry={
 applications:{api:{ApplicationV2:class{},HandlebarsApplicationMixin:B=>B,DialogV2:{prompt:async()=>null,confirm:async()=>true}}},
 documents:{ChatMessage:{getSpeaker:({actor})=>({actor:actor?.id??'fixture'}),create:async data=>data}},
 utils:{expandObject:x=>x,mergeObject:(a,b)=>({...a,...b})}
};

const {ownedPowerDefinition,availableChoices,resolveJutsu}=await import('../src/system/sns-v14-dev/scripts/power-core.mjs');
const {calculate}=await import('../src/system/sns-v14-dev/scripts/kernel.mjs');
const {characteristicEffects}=await import('../src/system/sns-v14-dev/scripts/characteristic-effects.mjs');
const {effectiveHardness}=await import('../src/system/sns-v14-dev/scripts/transformation-core.mjs');
const {toggleItemActivation,deactivateItemMode,actorItemActivations,adjustItemCharge,resolveItemChargePool,itemAutomationSummary}=await import('../src/system/sns-v14-dev/scripts/item-automation.mjs');
const {validateEffectRules}=await import('../src/system/sns-v14-dev/scripts/effect-item-rules.mjs');
const {ITEM_AUTOMATION_PROFILES}=await import('../src/system/sns-v14-dev/data/item-automation-profiles.mjs');
const {npcJutsuPlan}=await import('../src/system/sns-v14-dev/scripts/npc-jutsu-core.mjs');
const {virtualEffectRows}=await import('../src/system/sns-v14-dev/scripts/effect-item-sources.mjs');
const {syncAllPowerRecipes}=await import('../src/system/sns-v14-dev/scripts/power-recipes.mjs');
const {itemPresentation}=await import('../src/system/sns-v14-dev/scripts/item-view.mjs');
const {NPC_REPERTOIRES}=await import('../src/system/sns-v14-dev/data/npc-repertoires.mjs');
const {OPTIONAL_SOURCES,sourceEnabled,sourceAvailable}=await import('../src/system/sns-v14-dev/data/optional-sources.mjs');
const {loadCanonicalLibrary,resetCanonicalLibrary,canonicalCopy}=await import('../src/system/sns-v14-dev/scripts/canonical-content.mjs');
const {D115_OPTIONAL_LIBRARIES}=await import('../src/system/sns-v14-dev/data/homebrew-d115-sources.mjs');

const library=JSON.parse(fs.readFileSync(new URL('../src/content/sns-conteudo-dev/content/basico-canonico-v1.json',import.meta.url),'utf8'));
const book=id=>structuredClone(library.entries.find(e=>e.id===id).document);

function makeActor(){
 const system=structuredClone(JSON.parse(fs.readFileSync(new URL('./fixtures/shinobi-nc4.json',import.meta.url),'utf8')).system);
 system.nc=12;
 system.attributes={for:4,des:4,agi:4,per:4,int:6,vig:6,esp:8,car:2,man:2};
 system.skills.arte={bought:4};
 system.skills.veneficio={bought:4};
 system.skills.lidar_com_animais={bought:4};
 system.resources.chakra.value=20;
 const actor={
  id:'shinobi1',uuid:'Actor.shinobi1',name:'Shinobi Teste',type:'shinobi',img:'icons/svg/mystery-man.svg',
  isOwner:true,flags:{'sns-v14-dev':{}},items:[],system,
  async update(patch){
   for(const [k,v]of Object.entries(patch)){
    const parts=k.split('.');let cur=this;
    for(let i=0;i<parts.length-1;i++){cur[parts[i]]??={};cur=cur[parts[i]];}
    cur[parts.at(-1)]=v;
   }
  },
  async createEmbeddedDocuments(kind,docs){
   return docs.map((d,idx)=>{const copy=structuredClone(d);copy.id='created'+this.items.length+'_'+idx;copy.actor=this;this.items.push(copy);return copy;});
  }
 };
 actor.items.get=id=>actor.items.find(i=>i.id===id);
 Object.defineProperty(actor.system,'toObject',{value:()=>{const {toObject,...rest}=actor.system;return structuredClone(rest);},enumerable:false,configurable:true});
 return actor;
}

test('all 16 effect-based Kekkei Genkai and Hijutsu powers resolve ownedPowerDefinition and learnable choices for PCs',()=>{
 const effectRepertoires=Object.entries(NPC_REPERTOIRES).filter(([,r])=>r.mode==='effects');
 assert(effectRepertoires.length>=17);
 for(const [pid,rep]of effectRepertoires){
  const power=book(pid);
  power.id='p_'+pid;
  power.system.level=6;
  power.system.power={definitionId:'',choices:[]};
  const def=ownedPowerDefinition(power);
  assert(def,pid+' should have ownedPowerDefinition');
  const choices=availableChoices(power,6);
  assert(choices.length>0,pid+' should expose learnable choices');
  for(const e of rep.effects??[]){
   if((e.min??1)<=6)assert(choices.some(c=>c.id===e.id),`${pid} missing repertoire effect ${e.id}`);
  }
 }
 // Verify Hyouton Espelhos Demoníacos resolution end-to-end on a PC
 const actor=makeActor();
 const hyouton=book('sns:power:hyouton');
 hyouton.id='hyouton1';hyouton.system.level=6;
 hyouton.system.power={definitionId:'',choices:[
  {id:'c1',slot:1,effectId:'sns:effect:canhao',stage:1},
  {id:'c2',slot:2,effectId:'sns:effect:orbe',stage:2},
  {id:'c3',slot:3,effectId:'sns:effect:barreira',stage:3},
  {id:'c4',slot:4,effectId:'sns:effect:coluna',stage:4},
  {id:'c5',slot:5,effectId:'sns:effect:flechas',stage:3},
  {id:'c6',slot:6,effectId:'sns:effect:espelhos-demoniacos',stage:6}
 ]};
 const yuki=book('sns:clan:yuki');yuki.id='yuki1';
 const fut=book('sns:power:fuuton');fut.id='fut1';fut.system.level=1;
 const suit=book('sns:power:suiton');suit.id='suit1';suit.system.level=1;
 const moveApt=book('sns:apt:ataque-em-movimento');moveApt.id='apt1';
 actor.items.push(yuki,fut,suit,moveApt,hyouton);
 const jutsu={id:'j1',type:'jutsu',system:{details:{powerId:hyouton.id},jutsu:{effectId:'sns:effect:espelhos-demoniacos',selectionId:'c6',usedLevel:6,variant:'normal',overrides:[]}}};
 const res=resolveJutsu(actor,hyouton,jutsu);
 assert(res.valid,res.problems?.join(' '));
 assert.equal(res.data.difficulty,20); // 9 + 6 + ceil(8/2) + difficultyBonus(1)
});

test('item toggles (e.g. Hachimon Tonkou 8 Gates) charge chakra, update derived attributes/hardness, appear in virtual effects and clean up on deactivation',async()=>{
 const actor=makeActor();
 const gates=book('sns:power:hachimon-tonkou');
 gates.id='gates1';gates.system.level=5;
 actor.items.push(gates);
 const before=calculate(actor.system,characteristicEffects(actor),actor.items);
 assert.equal(before.attributes.for,4);
 assert.equal(before.attributes.agi,4);
 assert.equal(effectiveHardness(actor),0);

 // Activate 5th/6th Gate (+3 FOR, +3 AGI, +1 Hardness, +4m movement, cost 3 chakra)
 await toggleItemActivation(actor,gates.id,'gate5');
 assert.equal(actor.system.resources.chakra.value,17);
 const activeView=actorItemActivations(actor);
 assert.equal(activeView[0].active,true);
 assert.equal(activeView[0].selectedStageId,'gate5');
 assert(virtualEffectRows(actor).some(r=>r.itemModeKey==='hachimon-tonkou'));

 const during=calculate(actor.system,characteristicEffects(actor),actor.items);
 assert.equal(during.attributes.for,7);
 assert.equal(during.attributes.agi,7);
 assert.equal(during.movement,before.movement+6);
 assert.equal(effectiveHardness(actor),1);

 // Deactivate via item mode helper (same path used by Effects tab End button)
 await deactivateItemMode(actor,'hachimon-tonkou');
 const after=calculate(actor.system,characteristicEffects(actor),actor.items);
 assert.equal(after.attributes.for,4);
 assert.equal(after.attributes.agi,4);
 assert.equal(effectiveHardness(actor),0);
});

test('custom itemAutomation passiveRules work on any item and respect equipped state on physical equipment',()=>{
 const actor=makeActor();
 const equip={
  id:'eq1',name:'Bracelete Especial',type:'equipment',
  system:{equipped:false},
  flags:{'sns-v14-dev':{itemAutomation:{passiveRules:[{target:'attribute:des',value:2},{target:'hardness',value:2}]}}}
 };
 actor.items.push(equip);
 assert.equal(calculate(actor.system,characteristicEffects(actor),actor.items).attributes.des,4);
 assert.equal(effectiveHardness(actor),0);
 equip.system.equipped=true;
 assert.equal(calculate(actor.system,characteristicEffects(actor),actor.items).attributes.des,6);
 assert.equal(effectiveHardness(actor),2);
});

test('owners can sync level-based clan power recipes directly without GM chat approval and use them immediately',async()=>{
 globalThis.fetch=async()=>({ok:true,json:async()=>library});
 const actor=makeActor();
 const clan=book('sns:clan:hyuuga');clan.id='clan1';clan.actor=actor;
 const byakugan=book('sns:apt:byakugan');byakugan.id='apt_bya';byakugan.actor=actor;
 const acuidade=book('sns:apt:acuidade');acuidade.id='apt_acu';acuidade.actor=actor;
 const juuken=book('sns:power:juuken');juuken.id='juuken1';juuken.actor=actor;juuken.system.level=4;
 actor.items.push(clan,byakugan,acuidade,juuken);
 const added=await syncAllPowerRecipes(actor,juuken);
 assert(added.length>0,'Should add Juuken techniques directly for owner');
 for(const tech of added){
  tech.actor=actor;
  assert(itemPresentation(tech).canUse,tech.name+' should be usable immediately');
 }
});

test('D115 homebrews (Kibaku Nendo Revisado and Pergaminho Canônico) are disabled by default and merge into catalog/powers when enabled',async()=>{
 const priorGame=globalThis.game,priorFetch=globalThis.fetch;
 try{
  globalThis.fetch=async()=>({ok:true,json:async()=>library});
  // Disabled by default (and with 0-arg blanket mocks used in older optional-source tests)
  globalThis.game={settings:{get:()=>true}};
  resetCanonicalLibrary();
  assert.equal(sourceEnabled('kibaku-revisado'),false);
  assert.equal(sourceEnabled('pergaminho-canonico'),false);
  assert.equal(sourceAvailable({system:{contentId:'sns:kibaku-rev:power:kibaku-nendo'}}),false);
  assert.equal(sourceAvailable({system:{contentId:'sns:pergaminho:hijutsu:shinchi-tenkoho'}}),false);
  const baseOnly=await loadCanonicalLibrary();
  assert.equal(baseOnly.entries.some(e=>e.id.startsWith('sns:kibaku-rev:')||e.id.startsWith('sns:pergaminho:')),false);

  // Enabled explicitly by key in Foundry settings
  const enabledKeys=new Set(['enableKibakuRevisado','enablePergaminhoCanonico']);
  globalThis.game={settings:{get:(ns,key)=>enabledKeys.has(key)}};
  resetCanonicalLibrary();
  assert.equal(sourceEnabled('kibaku-revisado'),true);
  assert.equal(sourceEnabled('pergaminho-canonico'),true);
  assert.equal(OPTIONAL_SOURCES.filter(s=>s.inMemory).length,2);
  const merged=await loadCanonicalLibrary();
  const d115Total=D115_OPTIONAL_LIBRARIES['kibaku-revisado'].entries.length+D115_OPTIONAL_LIBRARIES['pergaminho-canonico'].entries.length;
  assert.equal(d115Total,19);
  for(const e of D115_OPTIONAL_LIBRARIES['kibaku-revisado'].entries)assert(merged.entries.some(x=>x.id===e.id),e.id);
  for(const e of D115_OPTIONAL_LIBRARIES['pergaminho-canonico'].entries)assert(merged.entries.some(x=>x.id===e.id),e.id);

  // Verify Kibaku Revisado power progression & half-level chakra cost + D115 item presets
  const actor=makeActor();
  const kibakuEntry=D115_OPTIONAL_LIBRARIES['kibaku-revisado'].entries.find(e=>e.id==='sns:kibaku-rev:power:kibaku-nendo');
  const kibaku=canonicalCopy(kibakuEntry);kibaku.id='kibaku_rev1';kibaku.system.level=4;kibaku.system.power={definitionId:'',choices:[]};
  const def=ownedPowerDefinition(kibaku);
  assert(def&&def.id==='sns:kibaku-rev:power:kibaku-nendo');
  assert.equal(def.allowedEffects.length,16);
  for(const effId of ['sns:effect:kibaku-montaria','sns:effect:kibaku-passaros-explosivos','sns:effect:kibaku-c3','sns:effect:kibaku-c4','sns:effect:kibaku-c0']){
   assert(def.allowedEffects.includes(effId),effId+' should be allowed');
  }
  const ch1=availableChoices(kibaku,1).find(c=>c.id==='sns:effect:canhao');
  const ch2=availableChoices(kibaku,2).find(c=>c.id==='sns:effect:kibaku-montaria');
  const ch3=availableChoices(kibaku,3).find(c=>c.id==='sns:effect:kibaku-passaros-explosivos');
  const ch4=availableChoices(kibaku,4).find(c=>c.id==='sns:effect:kibaku-c3');
  kibaku.system.power.choices.push(
   {id:'kc1',slot:1,effectId:ch1.id,stage:ch1.stage},
   {id:'kc2',slot:2,effectId:ch2.id,stage:ch2.stage},
   {id:'kc3',slot:3,effectId:ch3.id,stage:ch3.stage},
   {id:'kc4',slot:4,effectId:ch4.id,stage:ch4.stage}
  );
  const proj=resolveJutsu(actor,kibaku,{system:{jutsu:{effectId:ch1.id,selectionId:'kc1',usedLevel:3,variant:'normal',overrides:[]}}});
  assert(proj.valid,proj.problems?.join('; '));
  assert.equal(proj.cost,2,'Kibaku Revisado chakra cost = ceil(3/2) = 2');
  const c3Proj=resolveJutsu(actor,kibaku,{system:{jutsu:{effectId:ch4.id,selectionId:'kc4',usedLevel:4,variant:'normal',overrides:[]}}});
  assert(c3Proj.valid,c3Proj.problems?.join('; '));
  assert.equal(c3Proj.cost,2,'Kibaku Revisado C3 level 4 chakra cost = ceil(4/2) = 2');

  const tenkoho=canonicalCopy(D115_OPTIONAL_LIBRARIES['pergaminho-canonico'].entries.find(e=>e.id==='sns:pergaminho:hijutsu:shinchi-tenkoho'));
  tenkoho.id='tenkoho1';
  const raitonArmor=canonicalCopy(D115_OPTIONAL_LIBRARIES['pergaminho-canonico'].entries.find(e=>e.id==='sns:pergaminho:apt:armadura-de-raios'));
  raitonArmor.id='r_armor1';
  actor.items.push(kibaku,tenkoho,raitonArmor);
  await toggleItemActivation(actor,tenkoho.id,'daisan');
  await toggleItemActivation(actor,raitonArmor.id,'nv2');
  const calc=calculate(actor.system,characteristicEffects(actor),actor.items);
  assert.equal(calc.attributes.for,10,'4 base + 6 Daisan Kassei');
  assert.equal(calc.attributes.agi,6,'4 base + 2 Daisan Kassei');
  assert.equal(effectiveHardness(actor),2,'Armadura de Raios Nv 2 hardness');
 }finally{
  globalThis.game=priorGame;globalThis.fetch=priorFetch;resetCanonicalLibrary();
 }
});

test('all ITEM_AUTOMATION_PROFILES rules pass strict EFFECT_TARGETS validation',()=>{
 for(const [id,profile]of Object.entries(ITEM_AUTOMATION_PROFILES)){
  if(profile.passiveRules)validateEffectRules(profile.passiveRules);
  if(profile.toggle?.rules)validateEffectRules(profile.toggle.rules);
  if(profile.toggle?.stages){
   for(const s of profile.toggle.stages)validateEffectRules(s.rules);
  }
  if(profile.quickAction){
   assert(['none','save','check','attack:cc','attack:cd','attack:lm'].includes(profile.quickAction.mode??'none'),id+' invalid quickAction mode');
  }
 }
});

test('Phase 4 Group 1 unlocks yoton, kami-ninpou, kumo-ninpou, hebi-ninpou, aoi-katon, ranton, kibaku-nendo and adds dano-continuo/purificar to kikai-ninpou',()=>{
 for(const pid of ['sns:power:yoton','sns:power:kami-ninpou','sns:power:kumo-ninpou','sns:power:hebi-ninpou','sns:power:hb-f05-aoi-katon','sns:hijutsu:ranton','sns:hijutsu:kibaku-nendo']){
  const item=book(pid);item.id='p4_'+pid;item.system.level=6;item.system.power={definitionId:'',choices:[]};
  const def=ownedPowerDefinition(item);
  assert(def,pid+' should resolve ownedPowerDefinition');
  const ch1=availableChoices(item,1);
  assert(ch1.some(c=>c.allowed),pid+' should have learnable slot 1 effect');
 }
 const kikai=book('sns:power:kikai-ninpou');kikai.id='p4_kikai';kikai.system.level=6;kikai.system.power={definitionId:'',choices:[]};
 const kikaiChoices=availableChoices(kikai,6);
 assert(kikaiChoices.some(c=>c.id==='sns:effect:dano-continuo'&&c.allowed),'kikai-ninpou should allow dano-continuo');
 assert(kikaiChoices.some(c=>c.id==='sns:effect:purificar'&&c.allowed),'kikai-ninpou should allow purificar');
});

test('Phase 4 Group 2 tracks and adjusts item chargePools (Aburame kikaichuu/rinkaichuu, Hoshigaki water, Kibaku clay bombs)',async()=>{
 const actor=makeActor();
 const kikaichuu=book('sns:apt:kikaichuu');kikaichuu.id='apt_kik';
 const rinkaichuu=book('sns:apt:rinkaichuu');rinkaichuu.id='apt_rin';
 const kibaku=book('sns:hijutsu:kibaku-nendo');kibaku.id='hij_kib';
 actor.items.push(kikaichuu,rinkaichuu,kibaku);

 // PER 4 -> ceil(4/2)=2, bought 4 -> Lidar com Animais = 6
 const kPool=resolveItemChargePool(actor,kikaichuu);
 assert.equal(kPool.value,6);assert.equal(kPool.max,6);
 await adjustItemCharge(actor,kikaichuu.id,-2);
 assert.equal(resolveItemChargePool(actor,kikaichuu).value,4);
 await adjustItemCharge(actor,kikaichuu.id,'recharge');
 assert.equal(resolveItemChargePool(actor,kikaichuu).value,6);

 // Rinkaichuu recharges half (ceil(6/2) = 3)
 await adjustItemCharge(actor,rinkaichuu.id,-5);
 assert.equal(resolveItemChargePool(actor,rinkaichuu).value,1);
 await adjustItemCharge(actor,rinkaichuu.id,'recharge');
 assert.equal(resolveItemChargePool(actor,rinkaichuu).value,4,'1 + ceil(6/2)=3 -> 4');

 // Kibaku clay bombs compartment max = 30
 await adjustItemCharge(actor,kibaku.id,-6);
 const bPool=resolveItemChargePool(actor,kibaku);
 assert.equal(bPool.value,24);assert.equal(bPool.max,30);
 assert(itemAutomationSummary(actor,kibaku).hasChargePool);
 assert(actorItemActivations(actor).filter(r=>r.kind==='charge').length>=3);
});

test('Phase 4 Group 3 executes Nara kagejutsu, Yamanaka shindenshin, bakuton and Ryuusei telecinese sections cleanly',async()=>{
 globalThis.fetch=async()=>({ok:true,json:async()=>library});
 const actor=makeActor();
 const clanNara=book('sns:clan:nara');clanNara.id='c_nara';clanNara.actor=actor;
 const kage=book('sns:power:kagejutsu');kage.id='p_kage';kage.actor=actor;kage.system.level=6;
 const clanYam=book('sns:clan:yamanaka');clanYam.id='c_yam';clanYam.actor=actor;
 const shin=book('sns:power:shindenshin');shin.id='p_shin';shin.actor=actor;shin.system.level=6;
 const hijBak=book('sns:hijutsu:bakuton');hijBak.id='h_bak';hijBak.actor=actor;
 const bak=book('sns:power:bakuton');bak.id='p_bak';bak.actor=actor;bak.system.level=6;
 const hijMed=book('sns:hijutsu:hb-f05-medium');hijMed.id='h_med';hijMed.actor=actor;
 const aptPerc=book('sns:apt:hb-f05-percepcao-espiritual');aptPerc.id='a_per_esp';aptPerc.actor=actor;
 const aptCanal=book('sns:apt:hb-f05-canal-espiritual');aptCanal.id='a_can';aptCanal.actor=actor;
 actor.system.attributes.int=8;
 const tele=book('sns:power:hb-f05-telecinese');tele.id='p_tele';tele.actor=actor;tele.system.level=6;
 actor.items.push(clanNara,kage,clanYam,shin,hijBak,bak,hijMed,aptPerc,aptCanal,tele);

 for(const p of [kage,shin,bak,tele]){
  const added=await syncAllPowerRecipes(actor,p);
  assert(added.length>0,p.name+' should sync section techniques');
  for(const tech of added){
   tech.actor=actor;
   const plan=npcJutsuPlan(tech,library.entries);
   assert.equal(plan.missing.filter(k=>!['context','nature'].includes(k)).length,0,tech.name+' had missing plan fields: '+plan.missing.join(','));
  }
 }
});

test('Phase 4 Groups 4 & 5 toggles and passives update derived actor stats cleanly',async()=>{
 const actor=makeActor();
 const hoshigaki=book('sns:clan:hoshigaki');hoshigaki.id='c_hosh';
 const caloria=book('sns:apt:controle-de-caloria');caloria.id='a_cal';
 const shurado=book('sns:apt:shurado');shurado.id='a_shu';
 const risk=book('sns:apt:esquiva-de-risco');risk.id='a_risk';
 actor.items.push(hoshigaki,caloria,shurado,risk);

 await toggleItemActivation(actor,caloria.id,'amarelo');
 await toggleItemActivation(actor,shurado.id);
 await toggleItemActivation(actor,risk.id);
 const calc=calculate(actor.system,characteristicEffects(actor),actor.items);
 assert.equal(calc.attributes.for,8,'4 base + 4 Pilula Amarela');
 assert.equal(effectiveHardness(actor),2,'max(1 Pele de Couro, 2 Shurado) = 2');
});
