import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
globalThis.foundry={applications:{api:{ApplicationV2:class{},HandlebarsApplicationMixin:B=>B}},documents:{ChatMessage:{getSpeaker:({actor})=>({actor:actor.id})}}};
const {sheetBlockOptions,useSheetBlock}=await import('../src/system/sns-v14-dev/scripts/sheet-block.mjs');
const {supportingItems}=await import('../src/system/sns-v14-dev/scripts/supporting-view.mjs');
const {calculate}=await import('../src/system/sns-v14-dev/scripts/kernel.mjs');
const library=JSON.parse(fs.readFileSync(new URL('../src/content/sns-conteudo-dev/content/basico-canonico-v1.json',import.meta.url),'utf8'));
const player={id:'player',isGM:false,active:true},gm={id:'gm',isGM:true,active:true},users=[player,gm];users.activeGM=gm;
function setup(type='npc'){
 globalThis.game={user:player,users,messages:[],settings:{get:()=> 'publicroll'}};
 const source=type==='shinobi'?structuredClone(JSON.parse(fs.readFileSync(new URL('./fixtures/shinobi-nc4.json',import.meta.url),'utf8')).system):{nc:6,attributes:{for:3,des:6,agi:4,per:4,int:4,vig:4,esp:4,car:2,man:2},stats:{cc:9,cd:10,esq:8,lm:10},details:{size:'Médio'},resources:{chakra:{value:16},vitality:{value:40}},activeAptitudes:[]};
 if(type==='shinobi')source.identity.size='Médio';
 const actor={id:'a',uuid:'Actor.a',img:'icons/svg/mystery-man.svg',name:'Defensor',type,isOwner:true,flags:{},system:{...source,...(type==='shinobi'?{derived:calculate(source)}:{}),toObject:()=>structuredClone(source)},testUserPermission:()=>true};
 const weapon=structuredClone(library.entries.find(e=>e.id==='sns:equipment:kunai').document);weapon.id='kunai';weapon.actor=actor;weapon.system.equipped=true;weapon.system.quantity=2;
 actor.items=[weapon];actor.items.get=id=>actor.items.find(i=>i.id===id);return {actor,source,weapon};
}
const request=profile=>({uuid:'ChatMessage.pending',getFlag:(n,k)=>k==='defenseRequest'?{version:1,actorUuid:'Actor.attacker',name:'Ataque',status:'pending',targets:[{uuid:'Actor.a'}],responses:{},profile}:null});

for(const type of ['npc','shinobi'])test(type+' free block uses defense modifiers, posts no damage and changes no resources',async()=>{
 const {actor,source}=setup(type),before=structuredClone(source),cards=[];let kind;
 const result=await useSheetBlock(actor,{choose:async o=>o[0],roll:async(a,s,options)=>{kind=options.kind;return {toMessage:async data=>cards.push(data)};}});
 assert.equal(result.linked,false);assert.equal(kind,'defense');assert.match(result.spec.formula,/^2d8/);assert.match(cards[0].flavor,/DEFESA/);assert.doesNotMatch(cards[0].flavor,/>ATAQUE</);assert(!cards[0].flags['sns-v14-dev'].damageUse);assert.deepEqual(source,before);
});
test('a pending attack declares its exact blocking option, including heavy weapon penalty, without a free roll',async()=>{
 const {actor}=setup(),message=request({attackKind:'melee',weaponClass:'Pesada',attackerSize:'Médio'});game.messages=[message];const state=sheetBlockOptions(actor);assert(state.linked);assert.equal(state.options[0].choice.penalty,-1);let calls=0;
 await useSheetBlock(actor,{choose:async o=>o[0],declare:async(m,a,key)=>{assert.equal(m,message);assert.equal(a,actor);assert.equal(key,'block-kunai');calls++;},roll:async()=>assert.fail('Must not roll before declaration')});assert.equal(calls,1);
});
test('area, oversized attacks and ordinary weapons against technique projectiles do not fall back to a free block',async()=>{
 const {actor}=setup();for(const profile of [{attackKind:'area',attackerSize:'Médio'},{attackKind:'melee',weaponClass:'Leve',attackerSize:'Enorme'},{attackKind:'techniqueProjectile',attackerSize:'Médio'}]){game.messages=[request(profile)];assert.deepEqual(sheetBlockOptions(actor),{linked:true,options:[]});await assert.rejects(useSheetBlock(actor),/não é permitido/);}
});
test('ownership, cancellation and changed equipment are rechecked without emitting a roll',async()=>{
 const {actor,weapon}=setup();actor.isOwner=false;await assert.rejects(useSheetBlock(actor),/dono/);actor.isOwner=true;
 assert.equal(await useSheetBlock(actor,{choose:async()=>null,roll:async()=>assert.fail()}),null);
 await assert.rejects(useSheetBlock(actor,{choose:async o=>{weapon.system.equipped=false;return o[0];},roll:async()=>assert.fail()}),/não está mais disponível/);
});
test('NPC main view retains custom reactions and free actions alongside attacks and standard actions',()=>{
 const action=(id,category)=>({id,name:'Ação '+id,type:'action',img:'icons/svg/daze.svg',system:{category,tags:[],details:{}}});const rows=supportingItems([action('a','standard'),action('b','reaction'),action('c','free')],'details');assert.deepEqual(rows.filter(g=>g.entries.length).map(g=>[g.id,g.entries[0].id]),[['standard','a'],['reaction','b'],['free','c']]);
});
test('a missing size is explained instead of implying that an equipped weapon is absent',async()=>{const {actor}=setup();delete actor.system.details.size;await assert.rejects(useSheetBlock(actor),/Informe o tamanho/);});
