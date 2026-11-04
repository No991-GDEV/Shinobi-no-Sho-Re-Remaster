import test from 'node:test';import assert from 'node:assert/strict';
import {validateEffectRules,effectItemModifiers,effectItemHardness,mayEditEffectItem} from '../src/system/sns-v14-dev/scripts/effect-item-rules.mjs';
import {effectItemPlan,reconcileEffectItems,endBoundEffect,processEffectItemRequest} from '../src/system/sns-v14-dev/scripts/effect-item-service.mjs';
import {temporaryEffects} from '../src/system/sns-v14-dev/scripts/temporary-effects.mjs';
import {characteristicEffects} from '../src/system/sns-v14-dev/scripts/characteristic-effects.mjs';
import {effectiveAttribute,effectiveHardness,transitionPlan,transformationProjection,recordedAttributeView} from '../src/system/sns-v14-dev/scripts/transformation-core.mjs';
import {calculate} from '../src/system/sns-v14-dev/scripts/kernel.mjs';
globalThis.game={user:{id:'gm',isGM:true},users:{activeGM:{id:'gm'}},combats:[]};
const patch=(o,p)=>{for(const [path,value] of Object.entries(p)){const keys=path.split('.');let target=o;for(const k of keys.slice(0,-1))target=target[k]??={};target[keys.at(-1)]=structuredClone(value);}};
const fixture=()=>{
 const a={uuid:'Actor.qa',isOwner:true,type:'shinobi',items:[],flags:{},system:{nc:20,attributes:Object.fromEntries(['for','des','agi','per','int','vig','esp','car','man'].map(k=>[k,12])),resources:{chakra:{value:100},vitality:{value:100}},activeAptitudes:[{id:'eye',sourceId:'sh',rule:'sharingan',active:true,history:[{chakraCost:1}]}]}};
 a.items.get=id=>a.items.find(i=>i.id===id);a.items.push({id:'sh',uuid:'Actor.qa.Item.sh',type:'aptitude',name:'Sharingan',system:{contentId:'sns:apt:sharingan',details:{},level:1}});
 a.update=async p=>patch(a,p);a.createEmbeddedDocuments=async(type,rows)=>rows.map(data=>{const i={...structuredClone(data),id:'effect'+a.items.length,actor:a};i.system.appliedCondition.durationRule??={mode:'manual'};i.system.appliedCondition.durationClock??={};i.update=async p=>patch(i,p);a.items.push(i);return i;});
 a.updateEmbeddedDocuments=async(type,rows)=>rows.map(({_id,...p})=>{const i=a.items.get(_id);patch(i,p);return i;});return a;
};
test('migration creates one editable Item without paying or changing intrinsic precision',async()=>{
 const a=fixture(),chakra=a.system.resources.chakra.value,before=calculate(a.system,characteristicEffects(a));
 const first=await reconcileEffectItems(a);assert.equal(first.creates.length,1);assert.equal(a.items.at(-1).type,'effect');
 assert.equal(temporaryEffects(a).length,1);assert(temporaryEffects(a)[0].condition);assert.equal(a.system.resources.chakra.value,chakra);assert.deepEqual(calculate(a.system,characteristicEffects(a)),before);
 assert.deepEqual(effectItemPlan(a),{creates:[],updates:[]});
});
test('reconciliation preserves personal name, description, notes, rules and Item ID',async()=>{
 const a=fixture();await reconcileEffectItems(a);const i=a.items.at(-1),id=i.id;i.name='Olho esquerdo';i.system.description='<p>Minha descrição.</p>';i.system.personalNotes='Nota';i.system.effectRules=[{target:'cc',value:2}];
 await Promise.all([reconcileEffectItems(a),reconcileEffectItems(a)]);assert.equal(a.items.at(-1).id,id);assert.equal(i.name,'Olho esquerdo');assert.equal(i.system.description,'<p>Minha descrição.</p>');assert.equal(i.system.personalNotes,'Nota');assert.equal(effectItemPlan(a).creates.length,0);
});
test('end is idempotent, disables source, preserves paid history and does not charge or refund activation',async()=>{
 const a=fixture();await reconcileEffectItems(a);const i=a.items.at(-1);await endBoundEffect(i);await endBoundEffect(i);
 assert.equal(a.system.activeAptitudes[0].active,false);assert.equal(i.system.appliedCondition.active,false);assert.equal(a.system.resources.chakra.value,100);assert.equal(a.system.activeAptitudes[0].history.length,2);assert.equal(a.system.activeAptitudes[0].history[1].chakraCost,0);
 a.system.activeAptitudes[0].active=true;await reconcileEffectItems(a);assert.equal(a.items.length,2);assert(i.system.appliedCondition.active);
});
test('source deletion ends the bound Item and removes its additional mechanical modifiers',async()=>{
 const a=fixture();await reconcileEffectItems(a);const i=a.items.at(-1);i.system.effectRules=[{target:'cc',value:2}];assert.equal(effectItemModifiers(a)[0].value,2);a.items.splice(0,1);await reconcileEffectItems(a);assert.equal(i.system.appliedCondition.active,false);assert.deepEqual(effectItemModifiers(a),[]);
});
test('custom changes affect actual calculations and weapon attributes once, hardness uses highest',()=>{
 const a=fixture();a.system.activeAptitudes=[];const i={type:'effect',id:'fx',name:'Reforço',system:{appliedCondition:{managed:true,active:true},effectRules:[{target:'attribute:for',value:2},{target:'cc',value:1},{target:'hardness',value:3}]}};a.items.push(i);
 assert.equal(effectiveAttribute(a,'for'),14);assert.equal(calculate(a.system,characteristicEffects(a)).combat.cc.precision,18);assert.equal(effectiveHardness(a),3);a.system.damageState={hardness:5};assert.equal(effectItemHardness(a),3);assert.equal(effectiveHardness(a),5);i.system.appliedCondition.active=false;assert.equal(effectiveAttribute(a,'for'),12);assert.equal(calculate(a.system,characteristicEffects(a)).combat.cc.precision,15);
});
test('closed rule targets reject arbitrary paths, code, fractions, NaN, negative hardness and oversized data',()=>{
 for(const r of [{target:'resources.vitality.value',value:1},{target:'cc',value:'1'},{target:'cc',value:NaN},{target:'cc',value:1.5},{target:'hardness',value:-1},{target:'cc',value:101}])assert.throws(()=>validateEffectRules([r]));assert.throws(()=>validateEffectRules(Array(31).fill({target:'cc',value:1})));
 assert.deepEqual(validateEffectRules([{target:'cc',value:-2}]),[{target:'cc',value:-2}]);
});
test('NPC editable attributes retain the base when switching tabs, while the effective value includes the bonus',()=>{
 const effects=[{kind:'attributeModifier',target:'for',scope:'all',value:2}];let stored=12;
 for(let n=0;n<5;n++){const view=recordedAttributeView(stored,effects,'for');assert.equal(view.effectiveValue,14);assert(view.adjusted);stored=view.value;}
 assert.equal(stored,12);assert.deepEqual(recordedAttributeView(null,effects,'for'),{value:null,effectiveValue:null,adjusted:false});
});
test('owners edit prose; only GM edits mechanics, bindings, origin and duration',async()=>{
 const a=fixture();await reconcileEffectItems(a);const i=a.items.at(-1),before={system:structuredClone(i.system),flags:structuredClone(i.flags)},after=structuredClone(before);after.system.description='Texto';assert(mayEditEffectItem(before,after,false));after.system.effectRules=[{target:'cc',value:2}];assert(!mayEditEffectItem(before,after,false));assert(mayEditEffectItem(before,after,true));after.system.effectRules=[];after.flags['sns-v14-dev'].effectBinding.key='forged';assert(!mayEditEffectItem(before,after,false));
});
test('Gobi mode and buff bindings do not duplicate intrinsic bonuses, ending mode is reflected',async()=>{
 const a=fixture();a.system.activeAptitudes=[];a.items.push({id:'power',uuid:'Actor.qa.Item.power',type:'power',name:'Jinchuuriki',system:{contentId:'sns:power:jinchuuriki',choice:{kind:'bijuu',key:'gobi'},level:6,details:{accessRule:'jinchuuriki'}}},{id:'origin',type:'feature',system:{contentId:'sns:feature:gobi-gobi-futton',details:{accessRule:'gobi-gobi-futton'}}});
 for(const mode of ['presence','cloak']){const plan=transitionPlan(a,{sourceId:'power',mode,tails:5,usedLevel:6});patch(a,{...plan.patch,'flags.sns-v14-dev.transformations':plan.state});}
 const before=calculate(a.system,characteristicEffects(a));await reconcileEffectItems(a);assert.equal(temporaryEffects(a).length,1);assert.deepEqual(calculate(a.system,characteristicEffects(a)),before);assert.equal(a.system.resources.chakra.value,94);assert.equal(transformationProjection(a).active.length,1);
 const plan=transitionPlan(a,{sourceId:'power',mode:'normal'});patch(a,{...plan.patch,'flags.sns-v14-dev.transformations':plan.state});await reconcileEffectItems(a);assert.equal(temporaryEffects(a).length,0);assert.equal(a.items.at(-1).system.appliedCondition.active,false);
});
const message=(uuid,author={id:'owner'})=>({author,flags:{'sns-v14-dev':{effectItemRequest:{itemUuid:uuid}}},writes:0,getFlag(ns,key){return this.flags[ns]?.[key];},async update(p){this.writes++;patch(this,p);}});
test('owned end requests are processed once across duplicate delivery and preserve activation costs',async()=>{
 const a=fixture();await reconcileEffectItems(a);const i=a.items.at(-1);a.testUserPermission=u=>u.id==='owner';globalThis.fromUuid=async()=>i;const m=message('effect');await Promise.all([processEffectItemRequest(m),processEffectItemRequest(m)]);await processEffectItemRequest(m);assert.equal(m.writes,1);assert.equal(m.getFlag('sns-v14-dev','effectItemResult').ok,true);assert.equal(a.system.resources.chakra.value,100);assert.equal(a.system.activeAptitudes[0].active,false);
});
test('end requests cannot alter an actor owned by another user',async()=>{
 const a=fixture();await reconcileEffectItems(a);const i=a.items.at(-1);a.testUserPermission=()=>false;globalThis.fromUuid=async()=>i;const m=message('effect');await processEffectItemRequest(m);assert.equal(m.getFlag('sns-v14-dev','effectItemResult').ok,false);assert.equal(a.system.activeAptitudes[0].active,true);assert.equal(i.system.appliedCondition.active,true);
});
test('a request received before processor availability remains pending and can resume later',async()=>{
 const a=fixture();await reconcileEffectItems(a);const i=a.items.at(-1);a.testUserPermission=()=>true;globalThis.fromUuid=async()=>i;const m=message('effect');game.user.isGM=false;await processEffectItemRequest(m);assert.equal(m.writes,0);game.user.isGM=true;await processEffectItemRequest(m);assert.equal(m.getFlag('sns-v14-dev','effectItemResult').ok,true);assert.equal(i.system.appliedCondition.active,false);
});
