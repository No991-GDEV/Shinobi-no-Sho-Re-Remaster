import {characteristicEffects} from './characteristic-effects.mjs';
import {npcFixedDefenseKey} from './npc-generator-defense.mjs';
import {fixedDefensePrecision} from './defense-context.mjs';
import {conditionPenalty,conditionMovement} from './condition-effects.mjs';
import {calculate,displayValue} from './kernel.mjs';
import {skillColor} from './stat-editor-state.mjs';
import {signed} from './roll-components.mjs';
import {recordedInventory} from './supporting-view.mjs';
import {itemCategory} from './sheet-profiles.mjs';
const known=n=>Number.isFinite(n)?n:null;
const total=values=>values.every(n=>n!==null)?values.reduce((a,b)=>a+b,0):null;
const list=text=>String(text??'').split(/[,;\n]/).map(x=>x.trim()).filter(Boolean);
const knowledge=new Set(['arte','ciencias_naturais','cultura','mecanismos','medicina','ocultismo','veneficio']);
export function memberView(actor,uuid){
 if(!actor)return {uuid,name:'Ator indisponível',img:'icons/svg/mystery-man.svg',unavailable:true,nc:'—',dodge:'—',movementDisplay:'—',vitality:'—',vitalityMax:'—',healthPercent:0,skills:[],topSkills:[],languages:[],funds:null,fundsDisplay:'—',wealth:null,wealthDisplay:'—',compartments:'—'};
 const s=typeof actor.system.toObject==='function'?actor.system.toObject():actor.system,effects=characteristicEffects(actor),d=actor.type==='shinobi'?calculate(s,effects):null;
 const stats=d?.combat??Object.fromEntries(['cc','cd','esq','lm'].map(k=>[k,{precision:Number.isInteger(s.stats?.[k])?s.stats[k]+conditionPenalty(effects,k):s.stats?.[k]}]));
 const skills=d?Object.values(d.skills).filter(x=>x.available).map(x=>({...x,signed:signed(x.precision),color:skillColor(x)})):[];
 const items=Array.from(actor.items??[]),load=recordedInventory(items),physical=items.filter(i=>['weapons','armor','equipment','consumables','ammunition','treasures','containers'].includes(itemCategory(i)));
 const prices=physical.map(i=>known(i.system.details?.price)===null?null:i.system.details.price*i.system.quantity),wealth=total(prices);
 const hp=s.resources?.vitality,value=known(hp?.value),max=known(hp?.max)??d?.vitalityMax??null;
 const senses=s.identity?.senses||s.details?.senses||'';
 return {uuid,name:actor.name,img:actor.img,nc:displayValue(s.nc),blurb:[s.identity?.rank||s.details?.rank,s.identity?.clan,s.identity?.village||s.details?.village].filter(Boolean).join(' · '),vitality:displayValue(value),vitalityMax:displayValue(max),healthPercent:max>0&&value!==null?Math.max(0,Math.min(100,100*value/max)):0,
  chakra:displayValue(s.resources?.chakra?.value),chakraMax:displayValue(s.resources?.chakra?.max??d?.chakraMax),movement:known(d?.movement??conditionMovement(s.stats?.movement,effects)),movementDisplay:displayValue(d?.movement??conditionMovement(s.stats?.movement,effects)),dodge:displayValue(npcFixedDefenseKey(actor)==='lm'?(fixedDefensePrecision(actor,effects)===null?null:9+fixedDefensePrecision(actor,effects)):(d?.fixedDodge??(known(stats.esq?.precision)===null?null:9+stats.esq.precision))),
  combat:['cc','cd','lm'].map((key,i)=>({key,label:['CC','CD','LM'][i],value:known(stats[key]?.precision)===null?'—':signed(stats[key].precision)})),senses,skills,topSkills:skills.filter(s=>s.trained).sort((a,b)=>b.precision-a.precision).slice(0,5),languages:list(s.identity?.languages||s.details?.languages),funds:known(s.finances?.ryo??s.details?.funds),fundsDisplay:displayValue(s.finances?.ryo??s.details?.funds),wealth,wealthDisplay:displayValue(wealth),compartments:load.compartments};
}
export function partyView(members,activities=[]){
 const lang=new Map(),best=new Map();
 for(const m of members){const seen=new Set();for(const name of m.languages){const key=name.toLocaleLowerCase('pt-BR');if(seen.has(key))continue;seen.add(key);const row=lang.get(key)??{name,count:0};row.count++;lang.set(key,row);}for(const s of m.skills){const prior=best.get(s.key);if(!prior||s.precision>prior.precision||s.precision===prior.precision&&s.trained&&!prior.trained)best.set(s.key,{...s,actor:m.name,uuid:m.uuid});}}
 const skills=[...best.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 const speeds=members.map(m=>known(m.movement)),speed=members.length&&speeds.every(n=>n!==null)?Math.min(...speeds):null;
 return {languages:[...lang.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')),skills,knowledge:skills.filter(s=>knowledge.has(s.key)),count:members.length,speed:displayValue(speed),activityCount:members.filter(m=>activities.some(a=>a.member===m.uuid&&a.name)).length,funds:displayValue(total(members.map(m=>known(m.funds)))),wealth:displayValue(total(members.map(m=>known(m.wealth))))};
}
