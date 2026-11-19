import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const systemRoot=new URL('../src/system/sns-v14-dev/',import.meta.url);
const contentRoot=new URL('../src/content/sns-conteudo-dev/content/',import.meta.url);
const readSystem=rel=>fs.readFileSync(new URL(rel,systemRoot),'utf8');
const library=JSON.parse(fs.readFileSync(new URL('basico-canonico-v1.json',contentRoot),'utf8'));

function loadHandlebars(){
 if(process.env.SNS_SKIP_HANDLEBARS==='1')return null;
 const require=createRequire(import.meta.url);
 try{return require('handlebars');}catch{}
 const candidates=[
  'F:/Foundry VTT14/App/resources/app/node_modules/handlebars/lib/index.js',
  path.resolve(new URL('../../implementacao/sns-v14/validacao/node_modules/handlebars/lib/index.js',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'))
 ];
 for(const p of candidates){
  if(fs.existsSync(p))return require(p);
 }
 return null;
}

const hb=loadHandlebars();
const Handlebars=hb?hb.create():null;
if(Handlebars){
 Handlebars.registerHelper('snsIsTab',(a,b)=>a===b);
 Handlebars.registerHelper('checked',v=>v?'checked':'');
 for(const p of [
  'partials/active-aptitudes.hbs',
  'partials/transformations.hbs',
  'partials/basic-reactions.hbs',
  'partials/budget-context.hbs',
  'partials/kuchiyose-link.hbs',
  'partials/applied-states.hbs',
  'partials/received-effects.hbs',
  'partials/party.hbs',
  'tabs/jutsus.hbs'
 ]){
  Handlebars.registerPartial(`systems/sns-v14-dev/templates/${p}`,readSystem(`templates/${p}`));
 }
}

const createdMessages=[];
let fetchMockImpl=async()=>({ok:true,json:async()=>library});
globalThis.fetch=(...args)=>fetchMockImpl(...args);
globalThis.game={
 user:{id:'user1',isGM:false,targets:new Set(),getFlag:()=>true},
 users:{activeGM:{id:'gm1'}},
 settings:{get:()=>'publicroll'},
 actors:[],
 combats:[],
 combat:null
};
globalThis.ui={notifications:{warn:()=>{},info:()=>{},error:()=>{}}};
globalThis.Hooks={on:()=>1,once:()=>{},off:()=>{}};
globalThis.foundry={
 applications:{
  api:{
   ApplicationV2:class{},
   HandlebarsApplicationMixin:Base=>class extends Base{
    async _prepareContext(){return {};}
    async _onRender(){}
    async render(){return this;}
    async submit(){}
   },
   DialogV2:{prompt:async()=>null,confirm:async()=>true}
  },
  sheets:{
   ActorSheetV2:class{_processFormData(_e,_f,fd){return {...(fd?.object??{})};}},
   ItemSheetV2:class{_processFormData(_e,_f,fd){return {...(fd?.object??{})};}}
  },
  ux:{
   TextEditor:{enrichHTML:async html=>String(html??'')}
  }
 },
 documents:{
  Actor:class{},
  Item:class{},
  ChatMessage:{
   getSpeaker:({actor})=>({actor:actor?.id??'fixture',alias:actor?.name??'Ninja'}),
   create:async data=>{createdMessages.push(data);return data;}
  }
 },
 utils:{
  cleanHTML:s=>String(s??''),
  expandObject:x=>x,
  mergeObject:(a,b)=>({...a,...b}),
  setProperty:(obj,pathStr,val)=>{
   const parts=pathStr.split('.');let cur=obj;
   for(let i=0;i<parts.length-1;i++){cur[parts[i]]??={};cur=cur[parts[i]];}
   cur[parts.at(-1)]=val;
  },
  randomID:()=>'rand123456789012'
 }
};

const {itemChatCard,shareItemToChat}=await import('../src/system/sns-v14-dev/scripts/item-chat.mjs');
const {ShinobiSheet}=await import('../src/system/sns-v14-dev/scripts/sheet.mjs');
const {SupportingActorSheet}=await import('../src/system/sns-v14-dev/scripts/supporting-sheet.mjs');
const {sheetView}=await import('../src/system/sns-v14-dev/scripts/view.mjs');
const {ReferenceItemSheet}=await import('../src/system/sns-v14-dev/scripts/item-sheet.mjs');
const {EffectItemSheet}=await import('../src/system/sns-v14-dev/scripts/effect-item-sheet.mjs');
const {ITEM_PROFILES,ACTOR_PROFILES}=await import('../src/system/sns-v14-dev/scripts/sheet-profiles.mjs');

function makeCollection(arr){
 arr.get=id=>arr.find(i=>i.id===id);
 arr.contents=arr;
 return arr;
}

function makeItem(raw,actor=null){
 const base=structuredClone(raw);
 base.id??='item_'+Math.random().toString(36).slice(2,8);
 base.uuid=(actor?actor.uuid+'.Item.':'Item.')+base.id;
 base.actor=actor;
 base.isOwner=actor?actor.isOwner:true;
 base.system??={};
 base.system.details??={};
 base.system.tags??=[];
 base.system.traits??=[];
 base.system.source??={};
 Object.defineProperty(base.system,'toObject',{
  value:()=>{const {toObject,...rest}=base.system;return structuredClone(rest);},
  enumerable:false,configurable:true
 });
 return base;
}

function makeActorFixture(type='shinobi'){
 const baseSys=structuredClone(JSON.parse(fs.readFileSync(new URL('./fixtures/shinobi-nc4.json',import.meta.url),'utf8')).system);
 baseSys.attributes={for:5,des:5,agi:4,per:6,int:6,vig:6,esp:8,car:4,man:4};
 baseSys.resources.vitality.value=24;
 baseSys.resources.chakra.value=18;
 baseSys.finances={ryo:350};
 baseSys.activeAptitudes=[];
 const actor={
  id:'actor1',uuid:'Actor.actor1',name:'Shinobi Verificador',type,img:'icons/svg/mystery-man.svg',
  isOwner:true,flags:{'sns-v14-dev':{}},items:makeCollection([]),system:baseSys,
  testUserPermission:()=>true,
  async update(patch){
   for(const [k,v]of Object.entries(patch)){
    const parts=k.split('.');let cur=this;
    for(let i=0;i<parts.length-1;i++){cur[parts[i]]??={};cur=cur[parts[i]];}
    cur[parts.at(-1)]=v;
   }
  }
 };
 Object.defineProperty(actor.system,'toObject',{
  value:()=>{const {toObject,...rest}=actor.system;return structuredClone(rest);},
  enumerable:false,configurable:true
 });
 return actor;
}

test('itemChatCard and shareItemToChat render contextual facts, escape XSS, avoid resource deductions and delegate jutsus',async()=>{
 const actor=makeActorFixture();
 const beforeActor=JSON.stringify(actor);

 const weapon=makeItem({
  id:'w1',name:'Katana <script>alert(1)</script>',type:'weapon',img:'icons/svg/item-bag.svg',
  system:{
   contentId:'sns:equipment:katana',level:2,quantity:1,compartments:2,equipped:true,
   tags:['Corte &lt;img src=x onerror=alert(1)&gt;'],
   details:{damage:'6',range:'Corpo a corpo',attackMode:'Corpo a corpo',weaponClass:'Mediana',usage:'1 mão',size:'Média',price:120,ownership:'Própria'},
   description:'<p>Lâmina afiada <script>bad()</script></p>',
   personalNotes:'Presente do sensei <b>bold</b>'
  }
 },actor);

 const equipment=makeItem({
  id:'eq1',name:'Colete Ninja',type:'equipment',img:'icons/svg/shield.svg',
  system:{
   contentId:'sns:equipment:colete-ninja',level:0,quantity:1,compartments:1,equipped:false,
   details:{usage:'Vestido',size:'Médio',price:200},
   description:'<p>Proteção padrão da vila.</p>'
  }
 },actor);

 const clan=makeItem({
  id:'cl1',name:'Clã Uchiha',type:'clan',img:'icons/svg/eye.svg',
  system:{
   level:3,
   details:{accessRule:'uchiha',requirements:'Autorizado pelo mestre',restrictions:'Sem restrições extras'},
   description:'<p>Linhagem do Sharingan.</p>'
  }
 },actor);

 const aptitude=makeItem({
  id:'ap1',name:'Perito',type:'aptitude',img:'icons/svg/aura.svg',
  system:{
   ruleId:'sns:apt:perito',choice:{kind:'skill',key:'furtividade'},
   details:{powerCost:1,action:'Passiva',requirements:'Nível 1'},
   description:'<p>Especialista em uma perícia.</p>'
  }
 },actor);

 const power=makeItem({
  id:'pw1',name:'Katon',type:'power',img:'icons/svg/fire.svg',
  system:{
   contentId:'sns:power:katon',level:4,
   details:{powerCost:2,powerOrigin:'common',keyAttribute:'esp',nature:'Fogo',action:'Padrão',chakraCost:'1+'},
   description:'<p>'+'Técnica ancestral do elemento fogo que envolve grandes chamas. '.repeat(8)+'</p>'
  }
 },actor);

 const formula=makeItem({
  id:'fm1',name:'Veneno Paralizante',type:'formula',img:'icons/svg/potion.svg',
  system:{
   details:{time:'10 minutos',difficulty:'14',ingredients:'Ervas raras',output:'1 dose',price:80},
   description:'<p>Preparo alquímico.</p>'
  }
 },actor);

 const jutsuBook=structuredClone(library.entries.find(e=>e.id==='sns:jutsu:bunshin-no-jutsu').document);
 const jutsu=makeItem({...jutsuBook,id:'jt1'},actor);
 actor.items.push(weapon,equipment,clan,aptitude,power,formula,jutsu);

 // Weapon card + XSS check
 const wHtml=itemChatCard(weapon,actor);
 assert.match(wHtml,/class="sns-technique-card sns-item-chat-card"/);
 assert.match(wHtml,/katana\.webp/);
 assert.match(wHtml,/Arma · Nível 2/);
 assert.match(wHtml,/<b>Dano<\/b> 6/);
 assert.match(wHtml,/<b>Compartimentos<\/b> 2/);
 assert.match(wHtml,/<b>Preço<\/b> 120 Ryo/);
 assert.match(wHtml,/<b>Estado<\/b> Em uso/);
 assert.match(wHtml,/class="sns-item-chat-notes"/);
 assert(!wHtml.includes('<script>'));
 assert(!wHtml.includes('<img src=x'));
 assert(!wHtml.includes('<b>bold</b>'));
 assert(wHtml.includes('&lt;script&gt;'));

 // Equipment uses EXTRA_DISPLAY_ART and Guardado state
 const eqHtml=itemChatCard(equipment,actor);
 assert.match(eqHtml,/stone-skin\.webp/);
 assert.match(eqHtml,/<b>Estado<\/b> Guardado/);

 // Clan omits Nível in right header and resolves ACCESS_ORIGINS
 const clHtml=itemChatCard(clan,actor);
 assert.match(clHtml,/<span>Clã<\/span>/);
 assert(!clHtml.includes('Clã · Nível'));
 assert.match(clHtml,/<b>Origem<\/b> Clã Uchiha/);

 // Aptitude resolves selected choice name and PP cost
 const apHtml=itemChatCard(aptitude,actor);
 assert.match(apHtml,/Perito · Furtividade/);
 assert.match(apHtml,/<b>Custo<\/b> 1 PP/);

 // Power formats origin, keyAttribute, level and long description details
 const pwHtml=itemChatCard(power,actor);
 assert.match(pwHtml,/Poder · Nível 4/);
 assert.match(pwHtml,/<b>Origem<\/b> Comum/);
 assert.match(pwHtml,/<b>Atributo-chave<\/b> ESP \(Espírito\)/);
 assert.match(pwHtml,/<b>Natureza<\/b> Fogo/);
 assert.match(pwHtml,/<details class="sns-technique-description">/);

 // Formula facts
 const fmHtml=itemChatCard(formula,actor);
 assert.match(fmHtml,/<b>Tempo<\/b> 10 minutos/);
 assert.match(fmHtml,/<b>Dificuldade<\/b> 14/);
 assert.match(fmHtml,/<b>Preço<\/b> 80 Ryo/);

 // shareItemToChat guards, message creation, no resource deductions, jutsu delegation
 createdMessages.length=0;
 actor.isOwner=false;globalThis.game.user.isGM=false;
 assert.equal(await shareItemToChat(actor,weapon),undefined);
 assert.equal(createdMessages.length,0);

 // GM can share even if !actor.isOwner
 globalThis.game.user.isGM=true;
 await shareItemToChat(actor,power);
 assert.equal(createdMessages.length,1);
 assert.equal(createdMessages[0].flags['sns-v14-dev'].sharedItemCard.itemUuid,power.uuid);
 assert.equal(createdMessages[0].flags['sns-v14-dev'].check.key,'power');

 // Rejects item from another actor
 const foreign=makeItem({id:'fx',name:'Alheio',type:'equipment'},makeActorFixture());
 await shareItemToChat(actor,foreign);
 assert.equal(createdMessages.length,1);

 // Jutsu delegates to shareTechniqueToChat
 actor.isOwner=true;globalThis.game.user.isGM=false;
 await shareItemToChat(actor,jutsu);
 assert.equal(createdMessages.length,2);
 assert.ok(createdMessages[1].flags['sns-v14-dev'].sharedTechniqueCard);
 assert.equal(createdMessages[1].flags['sns-v14-dev'].sharedItemCard,undefined);
 assert.match(createdMessages[1].content,/Bunshin no Jutsu/);

 // Zero resource mutations
 assert.equal(actor.system.resources.chakra.value,18);
 assert.equal(actor.system.resources.vitality.value,24);
 assert.equal(actor.system.finances.ryo,350);
 assert.equal(JSON.stringify(actor.system),JSON.parse(beforeActor).system?JSON.stringify(JSON.parse(beforeActor).system):JSON.stringify(actor.system));
});

test('chooseContext, openActiveAptitudes, sheetView and templates connect compact Actions strip and Jutsus Aptidões ativas',async()=>{
 // Action registrations on both PJ and SupportingActorSheet
 for(const action of ['shareItem','shareJutsu','openActiveAptitudes','chooseContext']){
  assert.equal(typeof ShinobiSheet.DEFAULT_OPTIONS.actions[action],'function',`ShinobiSheet missing ${action}`);
  assert.equal(typeof SupportingActorSheet.DEFAULT_OPTIONS.actions[action],'function',`SupportingActorSheet missing ${action}`);
 }

 // chooseContext handles powers, techniques, aptitudes and does NOT redirect 'effects'
 const sheetMock={activeTab:'jutsus',jutsuTab:'powers',isEditable:false,rendered:0,async submit(){},async render(){this.rendered++;}};
 await ShinobiSheet.chooseContext.call(sheetMock,null,{dataset:{group:'jutsus',context:'aptitudes'}});
 assert.equal(sheetMock.jutsuTab,'aptitudes');
 assert.equal(sheetMock.activeTab,'jutsus');
 await ShinobiSheet.chooseContext.call(sheetMock,null,{dataset:{group:'jutsus',context:'effects'}});
 assert.equal(sheetMock.activeTab,'jutsus');
 assert.equal(sheetMock.jutsuTab,'aptitudes');

 // openActiveAptitudes switches from actions -> jutsus / aptitudes and submits when editable
 let submitted=0;
 const navMock={activeTab:'actions',jutsuTab:'powers',isEditable:true,rendered:0,async submit(){submitted++;},async render(){this.rendered++;}};
 await ShinobiSheet.openActiveAptitudes.call(navMock);
 assert.equal(navMock.activeTab,'jutsus');
 assert.equal(navMock.jutsuTab,'aptitudes');
 assert.equal(submitted,1);
 assert.equal(navMock.rendered,1);

 // sheetView exposes aptitudesTab and activeAptitudeCount
 const actor=makeActorFixture();
 const gatesBook=structuredClone(library.entries.find(e=>e.id==='sns:power:hachimon-tonkou').document);
 const gates=makeItem({...gatesBook,id:'gates1',system:{...gatesBook.system,level:5}},actor);
 const byakuganBook=structuredClone(library.entries.find(e=>e.id==='sns:apt:byakugan').document);
 const byakugan=makeItem({...byakuganBook,id:'byak1'},actor);
 const kunai=makeItem({id:'k1',name:'Kunai',type:'weapon',img:'icons/svg/item-bag.svg',system:{contentId:'sns:equipment:kunai',quantity:2,equipped:true,details:{damage:'2',attackMode:'Corpo a corpo'}}},actor);
 const clan=makeItem({id:'c1',name:'Clã Hyuuga',type:'clan',img:'icons/svg/eye.svg',system:{details:{accessRule:'hyuuga'}}},actor);
 const formula=makeItem({id:'f1',name:'Bomba Caseira',type:'formula',img:'icons/svg/potion.svg',system:{}},actor);
 const jutsu=makeItem({...structuredClone(library.entries.find(e=>e.id==='sns:jutsu:bunshin-no-jutsu').document),id:'j1'},actor);
 actor.items.push(gates,byakugan,kunai,clan,formula,jutsu);

 const view=sheetView(actor,{activeTab:'jutsus',jutsuTab:'aptitudes',isGM:false,editable:true});
 assert.equal(view.aptitudesTab,true);
 assert.equal(view.powers,false);
 assert.equal(view.techniques,false);
 assert.equal(view.activeAptitudeCount,view.activeAptitudes.length+view.itemActivations.length);
 assert(view.activeAptitudeCount>=2);

 // SupportingActorSheet context aligns with aptitudesTab and activeAptitudeCount
 const npc=makeActorFixture('npc');
 npc.system={
  ...npc.system,
  nc:4,details:{},tags:[],members:[],activities:[],
  stats:{cc:6,cd:6,esq:6,lm:6,initiative:4,movement:9},
  resources:{vitality:{value:10,max:10},chakra:{value:10,max:10,baseMax:10}},
  recordedSkills:[]
 };
 Object.defineProperty(npc.system,'toObject',{value:()=>{const {toObject,...rest}=npc.system;return structuredClone(rest);},enumerable:false,configurable:true});
 const npcSheet=Object.create(SupportingActorSheet.prototype);
 npcSheet.actor=npc;
 npcSheet.activeTab='jutsus';
 npcSheet.summaryTab='languages';
 npcSheet.jutsuTab='aptitudes';
 const npcCtx=await npcSheet._prepareContext({});
 assert.equal(npcCtx.aptitudesTab,true);
 assert.equal(npcCtx.activeAptitudeCount,0);

 // Static template structure assertions (also executed on CI without Handlebars)
 const actionsTplSrc=readSystem('templates/tabs/actions.hbs');
 const jutsusTplSrc=readSystem('templates/tabs/jutsus.hbs');
 const activeTplSrc=readSystem('templates/partials/active-aptitudes.hbs');
 const invTplSrc=readSystem('templates/tabs/inventory.hbs');
 const featTplSrc=readSystem('templates/tabs/features.hbs');
 const craftTplSrc=readSystem('templates/tabs/crafting.hbs');
 const supTplSrc=readSystem('templates/supporting-actor.hbs');
 assert.match(actionsTplSrc,/active-aptitudes\.hbs"\s+compact=true/);
 assert.match(actionsTplSrc,/strike-icon jutsu-chat-icon/);
 assert.match(actionsTplSrc,/data-action="shareJutsu"/);
 assert.doesNotMatch(jutsusTplSrc,/data-context="effects"|Efeitos ativos/);
 assert.match(jutsusTplSrc,/data-context="aptitudes"[^>]*>Aptidões ativas/);
 assert.match(activeTplSrc,/class="active-aptitudes sns-action-toggles"/);
 assert.match(activeTplSrc,/data-action="openActiveAptitudes"/);
 assert.match(activeTplSrc,/Doujutsu &amp; Modos/);
 assert.match(activeTplSrc,/Ativações &amp; Ações/);
 assert.match(activeTplSrc,/Reservas &amp; Cargas/);
 assert.match(invTplSrc,/class="jutsu-entry-header">[\s\S]*data-action="shareItem"/);
 assert.match(featTplSrc,/class="item-image framed jutsu-chat-icon" data-action="shareItem"/);
 assert.doesNotMatch(featTplSrc,/class="feature-icon"/);
 assert.match(craftTplSrc,/data-action="shareItem"/);
 assert.match(supTplSrc,/data-action="shareItem"/);

 // Template compilation and rendering checks (when Handlebars is available)
 if(Handlebars){
  const tplActions=Handlebars.compile(actionsTplSrc);
  const actionsHtml=tplActions({
   ...view,
   activeTab:'actions',
   encounter:true,
   activeAptitudes:[
    {id:'act1',sourceId:'byak1',sourceName:'Byakugan',sourceImg:'icons/svg/eye.svg',hasSource:true,eyeControl:true,eyeLabel:'Abrir olho',canToggle:true,active:true,transplanted:true,automaticUpkeep:false,upkeep:1,valid:true,status:'Descoberto',action:'Parcial',costLabel:'1',duration:'Cena'}
   ],
   itemActivations:[
    {id:'hachimon-tonkou',kind:'toggle',itemId:'gates1',sourceId:'gates1',sourceName:'Hachimon Tonkou',sourceImg:'icons/svg/aura.svg',label:'Oito Portões',active:true,selectedStageLabel:'1º Portão',action:'Livre',costLabel:'1',duration:'Sustentada'},
    {id:'qa1',kind:'action',itemId:'gates1',sourceId:'gates1',sourceName:'Hachimon Tonkou',sourceImg:'icons/svg/aura.svg',label:'Golpe Rápido',action:'Padrão',costLabel:'0',duration:'Instantânea'},
    {id:'ch1',kind:'charge',itemId:'k1',sourceId:'k1',sourceName:'Kunai',sourceImg:'icons/svg/sword.svg',label:'Cargas',charge:{value:2,max:3,unit:'cargas',rechargeLabel:'Recarregar'}}
   ]
  });
  assert.match(actionsHtml,/class="active-aptitudes sns-action-toggles"/);
  assert.match(actionsHtml,/data-action="openActiveAptitudes"/);
  assert.match(actionsHtml,/class="sns-quick-toggle is-active /);
  assert.match(actionsHtml,/class="sns-quick-dot"/);
  assert.match(actionsHtml,/class="sns-quick-upkeep" data-action="payAptitudeUpkeep"/);
  assert.match(actionsHtml,/class="sns-quick-charge"/);
  assert.match(actionsHtml,/data-action="runItemQuickAction"/);
  assert.match(actionsHtml,/class="strike-icon jutsu-chat-icon" data-action="shareItem"/);
  assert.match(actionsHtml,/data-action="shareJutsu"/);

  const tplJutsus=Handlebars.compile(jutsusTplSrc);
  const jutsusAptHtml=tplJutsus({
   ...view,
   activeAptitudes:[
    {id:'act1',sourceId:'byak1',sourceName:'Byakugan',sourceImg:'icons/svg/eye.svg',hasSource:true,eyeControl:true,eyeLabel:'Abrir olho',canToggle:true,active:false,valid:true,status:'Inativa',action:'Parcial',costLabel:'1',duration:'Cena'}
   ],
   itemActivations:[
    {id:'hachimon-tonkou',kind:'toggle',itemId:'gates1',sourceId:'gates1',sourceName:'Hachimon Tonkou',sourceImg:'icons/svg/aura.svg',label:'Oito Portões',active:false,action:'Livre',costLabel:'1',duration:'Sustentada'},
    {id:'qa1',kind:'action',itemId:'gates1',sourceId:'gates1',sourceName:'Hachimon Tonkou',sourceImg:'icons/svg/aura.svg',label:'Golpe Rápido',action:'Padrão',costLabel:'0',duration:'Instantânea'},
    {id:'ch1',kind:'charge',itemId:'k1',sourceId:'k1',sourceName:'Kunai',sourceImg:'icons/svg/sword.svg',label:'Cargas',action:'2 / 3 cargas',duration:'Recarregar',charge:{value:2,max:3,unit:'cargas',rechargeLabel:'Recarregar'}}
   ]
  });
  assert.doesNotMatch(jutsusAptHtml,/data-context="effects"|Efeitos ativos/);
  assert.match(jutsusAptHtml,/data-context="aptitudes" class="active">Aptidões ativas <span class="sns-subnav-count">/);
  assert.match(jutsusAptHtml,/Doujutsu &amp; Modos/);
  assert.match(jutsusAptHtml,/Ativações &amp; Ações/);
  assert.match(jutsusAptHtml,/Reservas &amp; Cargas/);
  assert.match(jutsusAptHtml,/data-action="shareItem" data-item-id="byak1"/);
  assert.doesNotMatch(jutsusAptHtml,/data-action="openActiveAptitudes"/);

  const jutsusPowHtml=tplJutsus({...view,powers:true,aptitudesTab:false,powerGroups:[{id:'p1',name:'Katon',displayName:'Katon',img:'icons/svg/fire.svg',level:3,originLabel:'Comum',formLabel:'Efeitos',details:{nature:'Fogo'},techniques:[]}]});
  assert.match(jutsusPowHtml,/class="item-image framed jutsu-chat-icon" data-action="shareItem" data-item-id="p1"/);

  const invHtml=Handlebars.compile(invTplSrc)({...view,activeTab:'inventory'});
  assert.match(invHtml,/class="jutsu-entry-header"><button type="button" class="item-image framed jutsu-chat-icon" data-action="shareItem" data-item-id="k1"/);

  const featHtml=Handlebars.compile(featTplSrc)({...view,activeTab:'features'});
  assert.match(featHtml,/class="item-image framed jutsu-chat-icon" data-action="shareItem" data-item-id="c1"/);
  assert.doesNotMatch(featHtml,/class="feature-icon"/);

  const craftHtml=Handlebars.compile(craftTplSrc)({...view,activeTab:'crafting'});
  assert.match(craftHtml,/class="item-image framed jutsu-chat-icon" data-action="shareItem" data-item-id="f1"/);

  const supHtml=Handlebars.compile(supTplSrc)({
   type:'npc',profile:ACTOR_PROFILES.npc,actor:npc,source:npc.system,editable:true,
   inventory:false,details:false,notes:false,jutsus:false,
   groups:[{id:'standard',label:'Ações',entries:[{id:'a1',name:'Investida',displayName:'Investida',img:'icons/svg/sword.svg',tags:[],details:{action:'Padrão'}}]}]
  });
  assert.match(supHtml,/class="item-image framed jutsu-chat-icon" data-action="shareItem" data-item-id="a1"/);
 }
});

test('ReferenceItemSheet, reference-item.hbs and effect-item.hbs render description/details/rules tabs, contextual sidebars and deduplicated kind tags',async()=>{
 for(const action of ['shareItem','documentTab','castJutsu','toggleAcuity','editDescription','configureAutomation']){
  assert.equal(typeof ReferenceItemSheet.DEFAULT_OPTIONS.actions[action],'function',`ReferenceItemSheet missing ${action}`);
 }

 const refTplSrc=readSystem('templates/reference-item.hbs');
 const effTplSrc=readSystem('templates/effect-item.hbs');
 assert.match(refTplSrc,/{{#if showKindTag}}/);
 assert.match(refTplSrc,/class="sns-item-sidebar-facts"/);
 assert.match(refTplSrc,/class="sns-cast-item" data-action="castJutsu"/);
 assert.match(refTplSrc,/class="sns-share-item" data-action="shareItem"/);
 assert.match(refTplSrc,/class="tab rules active sns-rules-pane"/);
 assert.match(refTplSrc,/class="item-mechanics-toolbar"/);
 assert.match(effTplSrc,/class="sns-effect-editor-header">[\s\S]*<div class="item-image framed">/);
 assert.match(effTplSrc,/class="sns-effect-badge/);

 const tplRef=Handlebars?Handlebars.compile(refTplSrc):null;
 const tplEff=Handlebars?Handlebars.compile(effTplSrc):null;
 const actor=makeActorFixture();
 const katonBook=structuredClone(library.entries.find(e=>e.id==='sns:power:katon').document);
 const katonPower=makeItem({...katonBook,id:'pwKaton',system:{...katonBook.system,level:5,details:{...katonBook.system.details,powerCost:2,nature:'Fogo',powerOrigin:'common'}}},actor);
 const jutsuBook=structuredClone(library.entries.find(e=>e.id==='sns:jutsu:bunshin-no-jutsu').document);
 const jutsu=makeItem({...jutsuBook,id:'jtRef',system:{...jutsuBook.system,details:{...jutsuBook.system.details,powerId:'pwKaton'}}},actor);
 const swordDup=makeItem({id:'sw1',name:'Espada de Chakra Branco',type:'weapon',img:'icons/svg/sword.svg',system:{tags:['Arma'],quantity:1,compartments:1,equipped:true,details:{weaponClass:'Mediana',attackMode:'Corpo a corpo',damage:'4',price:300}}},actor);
 const swordUnique=makeItem({id:'sw2',name:'Kunai',type:'weapon',img:'icons/svg/item-bag.svg',system:{contentId:'sns:equipment:kunai',tags:['Fio'],quantity:3,compartments:1,equipped:false,details:{weaponClass:'Leve',attackMode:'Corpo a corpo e à distância',damage:'2'}}},actor);
 const aptAcuity=makeItem({id:'aq1',name:'Acuidade',type:'aptitude',img:'icons/svg/aura.svg',system:{ruleId:'sns:apt:acuidade'}},actor);
 const simpleService=makeItem({id:'sv1',name:'Passagem',type:'service',img:'icons/svg/coins.svg',system:{details:{price:10},description:'<p>Viagem simples.</p>'}},null);
 actor.items.push(katonPower,jutsu,swordDup,swordUnique,aptAcuity);

 async function renderRef(item,tab='description',{isGM=false}={}){
  globalThis.game.user.isGM=isGM;
  const sheet=Object.create(ReferenceItemSheet.prototype);
  sheet.item=item;
  sheet.activeTab=tab;
  sheet._hasRulesTab=false;
  Object.defineProperty(sheet,'isEditable',{value:true,configurable:true});
  const ctx=await sheet._prepareContext({});
  return {sheet,ctx,html:tplRef?tplRef(ctx):''};
 }

 // 1. Jutsu item sheet: sidebar facts + actions, clean Description tab, Details tab, Rules tab
 const jDesc=await renderRef(jutsu,'description',{isGM:true});
 assert.equal(jDesc.ctx.showSidebar,true);
 assert.equal(jDesc.ctx.sidebarTitle,'Resumo do Jutsu');
 assert(jDesc.ctx.sidebarFacts.some(f=>f.label==='Ação'));
 assert(jDesc.ctx.sidebarFacts.some(f=>f.label==='Chakra'));
 assert.equal(jDesc.ctx.hasRulesTab,true);
 if(tplRef){
  assert.match(jDesc.html,/class="sidebar-summary">Resumo do Jutsu/);
  assert.match(jDesc.html,/class="sns-item-sidebar-facts"/);
  assert.match(jDesc.html,/class="sns-cast-item" data-action="castJutsu"/);
  assert.match(jDesc.html,/class="sns-share-item" data-action="shareItem"/);
  assert.match(jDesc.html,/class="sns-edit-description"/);
  assert.doesNotMatch(jDesc.html,/class="item-mechanics-toolbar"/);
 }

 const jDetails=await renderRef(jutsu,'details');
 assert.equal(jDetails.ctx.details,true);
 if(tplRef){
  assert.match(jDetails.html,/class="tab details active"/);
  assert.match(jDetails.html,/name="system\.details\.chakraCost"/);
 }

 const jRules=await renderRef(jutsu,'rules',{isGM:true});
 assert.equal(jRules.ctx.rulesTab,true);
 if(tplRef){
  assert.match(jRules.html,/class="tab rules active sns-rules-pane"/);
  assert.match(jRules.html,/class="item-mechanics-toolbar"/);
  assert.match(jRules.html,/data-action="buildJutsu"/);
  assert.match(jRules.html,/data-action="configureEffects"/);
  assert.match(jRules.html,/class="item-rule-binding"/);
 }

 // 2. Power item sheet: guided sidebar + learnEffects in rules tab
 const pRules=await renderRef(katonPower,'rules');
 assert.equal(pRules.ctx.showSidebar,true);
 assert.equal(pRules.ctx.sidebarTitle,'Resumo de Poder');
 assert(pRules.ctx.sidebarFacts.some(f=>f.label==='Natureza'&&f.value==='Fogo'));
 assert(pRules.ctx.sidebarFacts.some(f=>f.label==='Efeitos'));
 if(tplRef){
  assert.match(pRules.html,/data-action="learnEffects"/);
  assert.match(pRules.html,/data-action="configureAutomation"/);
 }

 // 3. Physical weapon: showKindTag deduplication + acuity button + sidebar physical fields
 const sw1=await renderRef(swordDup,'description');
 assert.equal(sw1.ctx.showKindTag,false);
 if(tplRef){
  assert.doesNotMatch(sw1.html,/class="sns-tag kind-tag"/);
  assert.match(sw1.html,/class="inventory-details"/);
  assert.match(sw1.html,/data-action="toggleAcuity"/);
 }

 const sw2=await renderRef(swordUnique,'description');
 assert.equal(sw2.ctx.showKindTag,true);
 assert.match(sw2.ctx.displayImage,/dagger\.webp/i);
 if(tplRef){
  assert.match(sw2.html,/class="sns-tag kind-tag">Arma<\/span>/);
 }

 // 4. Item without rules falls back safely when tab='rules'
 const sv=await renderRef(simpleService,'rules',{isGM:false});
 assert.equal(sv.ctx.hasRulesTab,false);
 assert.equal(sv.ctx.rulesTab,false);
 assert.equal(sv.ctx.description,true);
 assert.equal(sv.sheet.activeTab,'description');
 await ReferenceItemSheet.tab.call(sv.sheet,null,{dataset:{tab:'rules'}});
 assert.equal(sv.sheet.activeTab,'description');

 // 5. EffectItemSheet + effect-item.hbs renders framed artwork and status badges
 globalThis.game.user.isGM=true;
 const effItem=makeItem({
  id:'ef1',name:'Chamas Ativas',type:'effect',img:'icons/svg/fire.svg',
  system:{description:'<p>Queimadura contínua.</p>',personalNotes:'Teste',effectRules:[{target:'cc',value:1}],appliedCondition:{managed:true,active:true,origin:'Katon',duration:'1 cena',durationRule:{mode:'scene'}}}
 },actor);
 const effSheet=Object.create(EffectItemSheet.prototype);
 effSheet.item=effItem;
 Object.defineProperty(effSheet,'isEditable',{value:true,configurable:true});
 const effCtx=await effSheet._prepareContext({});
 assert.equal(effCtx.record.active,true);
 if(tplEff){
  const effHtml=tplEff(effCtx);
  assert.match(effHtml,/class="sns-effect-editor-header">[\s\S]*<div class="item-image framed"><img src="icons\/svg\/fire\.svg"/);
  assert.match(effHtml,/class="sns-effect-badge is-active">Efeito ativo/);
  assert.match(effHtml,/data-action="endEffect"/);
  assert.match(effHtml,/class="sns-effect-save"/);
 }
});

test('stylesheets clean legacy Foundry blues and preserve required selectors and test substrings',()=>{
 const docs=readSystem('styles/documents.css');
 const adapted=readSystem('styles/pf-item-adapted.css');
 const combat=readSystem('styles/combat-ux.css');

 for(const hex of ['#171f69','#1e347e','#00005a','#27285e']){
  assert(!docs.toLowerCase().includes(hex),`documents.css still contains ${hex}`);
  assert(!adapted.toLowerCase().includes(hex),`pf-item-adapted.css still contains ${hex}`);
 }
 assert(docs.includes('prose-mirror:not([open]) .editor-content{position:static;height:auto;max-height:none;overflow:visible}'));
 assert(combat.includes('font:700 13px/14px SnsCondensed'));

 for(const cls of [
  'jutsu-chat-icon','strike-icon.jutsu-chat-icon','jutsu-entry-header','sns-action-toggles',
  'sns-quick-toggle','sns-quick-dot','sns-quick-charge','sns-quick-status','sns-quick-upkeep',
  'sns-aptitudes-group','sns-aptitudes-group-head','sns-subnav-count','sns-item-chat-card',
  'sns-item-sidebar-facts','sns-item-sidebar-actions','sns-rules-pane','sns-edit-description'
 ]){
  assert(combat.includes(cls),`combat-ux.css missing .${cls}`);
 }
});

test('DocumentSheetV2 native editImage & getDefaultArtwork (PF2e/Sqyre), Genjutsu level 3+ and Kuchiyose extra binding + GM summoner list',async()=>{
 const {openDocumentImagePicker,displayItemArt}=await import('../src/system/sns-v14-dev/scripts/item-art.mjs');
 const {ShinobiActor}=await import('../src/system/sns-v14-dev/scripts/actor.mjs');
 const {SnsItem}=await import('../src/system/sns-v14-dev/scripts/item.mjs');
 const {resolveJutsu,availableChoices,jutsuVariants,choiceProblems,maxEffectSlots,ownedPowerDefinition}=await import('../src/system/sns-v14-dev/scripts/power-core.mjs');
 const {techniqueCard}=await import('../src/system/sns-v14-dev/scripts/technique-card.mjs');
 const {summonPower,summonLimit,summonProjection,suggestSummonAttributes}=await import('../src/system/sns-v14-dev/scripts/kuchiyose-core.mjs');
 const {originGrant,summonPact}=await import('../src/system/sns-v14-dev/scripts/restricted-access.mjs');
 const {kuchiyoseOriginChoices,companionLinkView}=await import('../src/system/sns-v14-dev/scripts/kuchiyose-ui.mjs');
 const {acquisitionProblems,investmentBudget}=await import('../src/system/sns-v14-dev/scripts/investment-budget.mjs');

 // 1A. Templates use native DocumentSheetV2 <img data-edit="img" data-action="editImage"> (matching PF2e/Foundry v14)
 for(const rel of ['templates/tabs/character.hbs','templates/supporting-actor.hbs','templates/reference-item.hbs','templates/effect-item.hbs']){
  const tpl=readSystem(rel);
  assert.match(tpl,/<img[^>]*data-edit="img"[^>]*data-action="editImage"/,`${rel} missing native img[data-edit][data-action="editImage"]`);
  assert.doesNotMatch(tpl,/data-action="(portrait|documentPortrait)"/,`${rel} still uses custom portrait button`);
 }
 assert.equal(ShinobiSheet.DEFAULT_OPTIONS.actions.portrait,undefined);
 assert.equal(SupportingActorSheet.DEFAULT_OPTIONS.actions.documentPortrait,undefined);
 assert.equal(ReferenceItemSheet.DEFAULT_OPTIONS.actions.documentPortrait,undefined);

 // 1B. ShinobiActor & SnsItem static getDefaultArtwork
 assert.equal(ShinobiActor.getDefaultArtwork({type:'shinobi'}).img,'icons/svg/mystery-man.svg');
 assert.equal(ShinobiActor.getDefaultArtwork({type:'npc'}).img,'systems/sns-v14-dev/assets/pf-actor-npc.svg');
 assert.equal(ShinobiActor.getDefaultArtwork({type:'companion'}).img,'systems/sns-v14-dev/assets/pf-actor-familiar.svg');
 assert.match(SnsItem.getDefaultArtwork({type:'weapon',system:{contentId:'sns:equipment:katana'}}).img,/katana\.webp/);

 // 1C. ReferenceItemSheet._processFormData strips fallback displayImage unless user chose a real image
 const mockItem=makeItem({id:'it1',name:'Genjutsu',type:'power',img:'icons/svg/aura.svg',system:{contentId:'sns:power:genjutsu',power:{definitionId:'sns:power:genjutsu',choices:[]},jutsu:{effectId:''}}});
 mockItem._source={img:'icons/svg/aura.svg'};
 const mockSheet=Object.create(ReferenceItemSheet.prototype);
 mockSheet.item=mockItem;
 const fakeForm={elements:{namedItem:()=>null},querySelectorAll:()=>[]};
 const stripped=mockSheet._processFormData(null,fakeForm,{object:{img:displayItemArt(mockItem)}});
 assert.equal(stripped.img,undefined);
 const kept=mockSheet._processFormData(null,fakeForm,{object:{img:'https://sqyre.cloud/bucket/genjutsu-custom.webp'}});
 assert.equal(kept.img,'https://sqyre.cloud/bucket/genjutsu-custom.webp');

 // 1D. openDocumentImagePicker compatibility helper passes allowUpload: true + redirectToRoot + browse()
 let pickedOpts=null,browsed=0,updatedImg='';
 class SqyrePicker {
  constructor(opts){pickedOpts=opts;}
  async browse(){browsed++;await this.optsCallback?.();}
 }
 globalThis.foundry.applications.apps??={};
 globalThis.foundry.applications.apps.FilePicker=class BasePicker {};
 globalThis.foundry.applications.apps.FilePicker.implementation=SqyrePicker;
 const doc={img:'icons/svg/mystery-man.svg',async update(p){updatedImg=p.img;}};
 await openDocumentImagePicker({isEditable:true,position:{top:100,left:200}},doc);
 assert.equal(browsed,1);
 assert.equal(pickedOpts.allowUpload,true);
 assert.ok(pickedOpts.redirectToRoot.includes('icons/svg/mystery-man.svg'));
 assert.equal(pickedOpts.document,doc);
 await pickedOpts.callback('https://sqyre.cloud/bucket/avatar.webp');
 assert.equal(updatedImg,'https://sqyre.cloud/bucket/avatar.webp');

 // 2. Genjutsu power (Miragem & Fascinar) + level 3+ slots + custom illusion description
 const actor=makeActorFixture();
 actor.system.attributes.int=10;
 const genPower=makeItem({
  id:'p-gen',name:'Genjutsu',type:'power',
  system:{level:2,category:'powers',power:{definitionId:'sns:power:genjutsu',choices:[
   {id:'c1',slot:1,stage:1,effectId:'sns:effect:genjutsu-miragem'},
   {id:'c2',slot:2,stage:1,effectId:'sns:effect:genjutsu-fascinar'}
  ]},details:{powerOrigin:'common',organization:'effects',keyAttribute:'int'}}
 },actor);
 const slotChoices=availableChoices(genPower,1);
 assert.deepEqual(slotChoices.map(c=>c.id).sort(),['sns:effect:genjutsu-fascinar','sns:effect:genjutsu-miragem']);
 assert.equal(maxEffectSlots(ownedPowerDefinition(genPower)),2);
 const genPowerLvl4=makeItem({
  id:'p-gen4',name:'Genjutsu',type:'power',
  system:{level:4,category:'powers',power:{definitionId:'sns:power:genjutsu',choices:[
   {id:'c1',slot:1,stage:1,effectId:'sns:effect:genjutsu-miragem'},
   {id:'c2',slot:2,stage:1,effectId:'sns:effect:genjutsu-fascinar'}
  ]},details:{powerOrigin:'common',organization:'effects',keyAttribute:'int'}}
 },actor);
 assert.deepEqual(choiceProblems(genPowerLvl4),[]);

 // Miragem variants respect INT (INT 10 unlocks Pequena and Média, not Grande INT 12)
 const mirVariants=jutsuVariants(genPower,'sns:effect:genjutsu-miragem',1);
 assert(mirVariants.some(v=>v.id==='media-movel'));
 assert(!mirVariants.some(v=>v.id==='grande-imovel'));
 const mirJutsu=makeItem({
  id:'j-mir',name:'Chuva de Pétalas',type:'jutsu',
  flags:{'sns-v14-dev':{customIllusionText:'Pétalas carmesim encobrem o corredor.'}},
  system:{details:{powerId:'p-gen'},jutsu:{effectId:'sns:effect:genjutsu-miragem',selectionId:'c1',usedLevel:1,variant:'media-movel',overrides:[]}}
 },actor);
 const mirProj=resolveJutsu(actor,genPower,mirJutsu);
 assert.equal(mirProj.valid,true);
 assert.equal(resolveJutsu({...actor,system:{...actor.system,nc:8}},genPowerLvl4,mirJutsu).valid,true);
 assert.equal(mirProj.noRoll,true);
 assert.equal(mirProj.cost,2);
 assert.equal(mirProj.data.duration,'Sustentada');
 const mirCard=techniqueCard(mirJutsu,mirProj);
 assert.match(mirCard,/Pétalas carmesim encobrem o corredor\./);
 assert.match(mirCard,/Genjutsu 1/);

 // Fascinar calculates Dif 6 + INT (+1 with Ilusão Profunda) and binds sns:condition:fascinado
 const fasJutsu=makeItem({
  id:'j-fas',name:'Olhar Hipnótico',type:'jutsu',
  flags:{'sns-v14-dev':{customIllusionText:'O alvo vê borboletas negras ao redor.'}},
  system:{details:{powerId:'p-gen'},jutsu:{effectId:'sns:effect:genjutsu-fascinar',selectionId:'c2',usedLevel:2,variant:'normal',overrides:[]}}
 },actor);
 const fasProj1=resolveJutsu(actor,genPower,fasJutsu);
 assert.equal(fasProj1.valid,true);
 assert.equal(fasProj1.resistanceCast,true);
 assert.equal(fasProj1.cost,3);
 assert.equal(fasProj1.data.difficulty,16); // 6 + 10
 assert.equal(fasProj1.autoBindings[0].conditionId,'sns:condition:fascinado');

 actor.items.push(makeItem({id:'ap-deep',name:'Ilusão Profunda',type:'aptitude',system:{contentId:'sns:apt:ilusao-profunda',ruleId:'sns:apt:ilusao-profunda'}},actor));
 const fasProj2=resolveJutsu(actor,genPower,fasJutsu);
 assert.equal(fasProj2.data.difficulty,17); // 6 + 10 + 1
 const fasCard=techniqueCard(fasJutsu,fasProj2);
 assert.match(fasCard,/O alvo vê borboletas negras ao redor\./);
 assert.match(fasCard,/INT · Dif 17/);
 assert.match(fasCard,/Fascinado/);

 // 3. Kuchiyose Padrão vs Restrito & extra contract binding regression (sourceId + GM dropdown)
 const pactFeature={id:'pact-esc',type:'feature',name:'Kuchiyose: Escorpião',system:{contentId:'sns:feature:hb-f05-kuchiyose-escorpiao',details:{}}};
 assert.equal(originGrant(pactFeature),'hb-f05-kuchiyose-escorpiao');

 // Regression check: mode:'granted' without sourceId fails powerInvestment; with pactFeature.id it passes at 0 PP
 const brokenPower={id:'pk-bad',name:'Kuchiyose (Invocação)',type:'power',system:{contentId:'sns:power:kuchiyose',level:4},flags:{'sns-v14-dev':{acquisition:{mode:'granted',reason:'Sem sourceId'}}}};
 assert(acquisitionProblems(brokenPower,[pactFeature]).some(p=>/concessão sem origem definida/i.test(p)));
 const grantedPower={id:'pk-ok',name:'Kuchiyose (Invocação)',type:'power',system:{contentId:'sns:power:kuchiyose',level:4,choice:{kind:'summonSpecies',key:'escorpiao'},details:{powerOrigin:'restricted'}},flags:{'sns-v14-dev':{acquisition:{mode:'granted',sourceId:pactFeature.id,reason:'Concessão extra do mestre no vínculo de invocação',authorizedBy:'gm1'}}}};
 assert.deepEqual(acquisitionProblems(grantedPower,[pactFeature]),[]);
 assert.equal(investmentBudget({},[pactFeature,grantedPower]).spent,0);
 const manualZeroPower={id:'pk-m0',name:'Kuchiyose (Invocação)',type:'power',system:{contentId:'sns:power:kuchiyose',level:4,choice:{kind:'summonSpecies',key:'escorpiao'},details:{powerOrigin:'restricted'}},flags:{'sns-v14-dev':{acquisition:{mode:'manual',cost:0,reason:'Concessão extra do mestre no vínculo de invocação',authorizedBy:'gm1'}}}};
 assert.deepEqual(acquisitionProblems(manualZeroPower,[]),[]);
 assert.equal(investmentBudget({},[manualZeroPower]).spent,0);

 // GM companionLinkView lists shinobi actors outside party so GM can bind non-party summoners
 const prevIsGM=globalThis.game.user.isGM;
 const prevActors=globalThis.game.actors;
 try{
  const orphanMaster={id:'m-out',uuid:'Actor.m-out',name:'Sasori',type:'shinobi',pack:null,isToken:false,testUserPermission:()=>true,items:[pactFeature]};
  const summon={id:'s-esc',uuid:'Actor.s-esc',name:'Escorpião Gigante',type:'companion',isOwner:true,system:{nc:8,contentId:'sns:kuchiyose:escorpiao',details:{kind:'Invocação',master:''}},flags:{'sns-v14-dev':{}},items:makeCollection([])};
  globalThis.game.actors=makeCollection([orphanMaster,summon]);
  globalThis.game.user.isGM=true;
  const gmView=await companionLinkView(summon);
  assert(gmView.choices.some(c=>c.value===orphanMaster.uuid&&/Sasori · fora da equipe/.test(c.label)));
 }finally{
  globalThis.game.user.isGM=prevIsGM;
  globalThis.game.actors=prevActors;
 }

 const summoner={items:[
  pactFeature,
  {id:'pk',type:'power',system:{contentId:'sns:power:kuchiyose',level:4,choice:{kind:'summonSpecies',key:'escorpiao'},details:{powerOrigin:'restricted'}}}
 ]};
 assert.equal(summonPact(summoner,'escorpiao').met,true);
 assert.equal(summonPower(summoner,'escorpiao').id,'pk');
 const limRestr=summonLimit(summoner,'escorpiao',{usedLevel:4,count:1});
 assert.equal(limRestr.common,false);
 const limCommon=summonLimit(summoner,'escorpiao',{usedLevel:4,count:1,powerOrigin:'common'});
 assert.equal(limCommon.common,true);
 const attrs=suggestSummonAttributes(8,'escorpiao');
 const projRestr=summonProjection(summoner,{species:'escorpiao',usedLevel:4,count:1,nc:8,size:'Médio',powerOrigin:'restricted',attributes:attrs,bases:{cc:3,cd:3,esq:3,lm:3}});
 const projCommon=summonProjection(summoner,{species:'escorpiao',usedLevel:4,count:1,nc:8,size:'Médio',powerOrigin:'common',attributes:attrs,bases:{cc:3,cd:3,esq:3,lm:3}});
 assert.equal(projCommon.stats.cc,projRestr.stats.cc-3);
 assert.equal(kuchiyoseOriginChoices('restricted').find(c=>c.selected).value,'restricted');
 assert.equal(kuchiyoseOriginChoices('common').find(c=>c.selected).value,'common');
});

test('ProseMirror editor stays flex when open, preserves source editing, passes document-uuid and opens/focuses/saves cleanly',async()=>{
 const docs=readSystem('styles/documents.css');
 const combat=readSystem('styles/combat-ux.css');

 // 1. Never collapse ProseMirror with display:block and never break :not([open]) reading or .editing-source
 assert.doesNotMatch(docs,/prose-mirror\s*\{\s*display\s*:\s*block/i);
 assert.doesNotMatch(combat,/prose-mirror\s*\{\s*display\s*:\s*block/i);
 assert.doesNotMatch(combat,/\.sns-effect-editor-body\s+prose-mirror:not\(\[open\]\)\s+\.editor-container\{[^}]*position\s*:\s*absolute/);
 assert.doesNotMatch(docs,/prose-mirror\[open\]\s+\.editor-container\{[^}]*display\s*:\s*flex/);
 assert.doesNotMatch(combat,/prose-mirror\[open\]\s+\.editor-container\{[^}]*display\s*:\s*flex/);
 for(const css of [docs,combat]){
  assert.match(css,/prose-mirror\{[^}]*display:flex;flex-direction:column/);
  assert.match(css,/prose-mirror\[open\]\s+\.menu-container\{/);
  assert.match(css,/prose-mirror\[open\]\s+menu\{[^}]*position:relative;inset:auto/);
  assert.match(css,/prose-mirror\[open\]\s+\.editor-container\{[^}]*flex:1 1 auto/);
  assert.match(css,/prose-mirror\[open\]\s+\.editor-content\{[^}]*position:static;inset:auto/);
 }
 assert.match(combat,/button\.sns-edit-description[^}]*\{display:none\}/);

 // 2. All <prose-mirror> elements carry document-uuid
 for(const rel of ['templates/reference-item.hbs','templates/effect-item.hbs','templates/supporting-actor.hbs','templates/tabs/bio.hbs']){
  const tpl=readSystem(rel);
  assert.match(tpl,/<prose-mirror[^>]*\bdocument-uuid="\{\{[^"]+\}\}"/,`${rel} missing document-uuid on <prose-mirror>`);
 }

 // 3. editDescription opens & focuses on open, or calls save() if already open
 for(const SheetClass of [ReferenceItemSheet,EffectItemSheet]){
  const listeners=new Map();
  let saved=0,focused=0;
  const pm={
   disabled:false,
   _open:false,
   get open(){return this._open;},
   set open(v){
    this._open=v;
    if(v){
     for(const fn of listeners.get('open')??[])fn();
     listeners.delete('open');
    }
   },
   addEventListener(type,fn){
    const arr=listeners.get(type)??[];
    arr.push(fn);
    listeners.set(type,arr);
   },
   focus(){focused++;},
   save(){saved++;}
  };
  const mockSheet={isEditable:true,element:{querySelector:sel=>sel==='prose-mirror'?pm:null}};
  await SheetClass.editDescription.call(mockSheet);
  assert.equal(pm.open,true);
  assert.equal(focused,1);
  assert.equal(saved,0);
  await SheetClass.editDescription.call(mockSheet);
  assert.equal(saved,1);
 }
});
