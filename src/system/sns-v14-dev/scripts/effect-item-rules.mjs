import {SKILLS} from './rules.mjs';
// Keep this leaf module independent of the calculation/controller import cycle.
const ATTRIBUTES=[['for','','Força'],['des','','Destreza'],['agi','','Agilidade'],['per','','Percepção'],['int','','Inteligência'],['vig','','Vigor'],['esp','','Espírito'],['car','','Carisma'],['man','','Manipulação']];
export const EFFECT_TARGETS=[...ATTRIBUTES.map(([key,,label])=>({id:'attribute:'+key,label})),...['cc','cd','esq','lm','initiative','movement'].map((key,i)=>({id:key,label:['Corpo a corpo','À distância','Esquiva','Ler movimento','Iniciativa','Deslocamento (m)'][i]})),...SKILLS.map(s=>({id:'skill:'+s.key,label:s.name??s.label??s.key})),{id:'hardness',label:'Dureza corporal'}];
const targets=new Set(EFFECT_TARGETS.map(t=>t.id));
export function validateEffectRules(rows=[]){
 if(!Array.isArray(rows)||rows.length>30)throw Error('Use até 30 alterações por efeito.');
 return rows.map(r=>{if(!targets.has(r.target)||!Number.isInteger(r.value)||Math.abs(r.value)>100||r.target==='hardness'&&r.value<0)throw Error('Escolha uma alteração válida e um valor inteiro entre −100 e 100.');return {target:r.target,value:r.value};});
}
export function effectItemModifiers(actor){
 return Array.from(actor?.items??[]).filter(i=>['effect','condition'].includes(i.type)&&i.system?.appliedCondition?.managed&&i.system.appliedCondition.active).flatMap(i=>{
  // Invalid imported data must never inject an arbitrary property or formula.
  let rows;try{rows=validateEffectRules(i.system.effectRules);}catch{return [];}
  return rows.filter(r=>r.target!=='hardness').map(r=>({kind:r.target.startsWith('attribute:')?'attributeModifier':'flatModifier',target:r.target.replace(/^attribute:/,''),scope:'all',value:r.value,sourceId:i.id,sourceName:i.name}));
 });
}
export function effectItemHardness(actor){return Math.max(0,...Array.from(actor?.items??[]).filter(i=>i.system?.appliedCondition?.managed&&i.system.appliedCondition.active).flatMap(i=>{try{return validateEffectRules(i.system.effectRules).filter(r=>r.target==='hardness').map(r=>r.value);}catch{return [];}}));}
export const effectBinding=item=>item?.flags?.['sns-v14-dev']?.effectBinding??null;
export function mayEditEffectItem(before,after,isGM){
 if(isGM)return true;
 if(JSON.stringify(effectBinding(before))!==JSON.stringify(effectBinding(after)))return false;
 if(JSON.stringify(before?.system?.effectRules??[])!==JSON.stringify(after?.system?.effectRules??[]))return false;
 const a=before?.system?.appliedCondition??{},b=after?.system?.appliedCondition??{};
 if(effectBinding(before)&&JSON.stringify(a)!==JSON.stringify(b))return false;
 return ['managed','scope','origin','sourceUuid','casterUuid','duration','durationRule','durationClock','applicationKey','appliedBy','appliedAt'].every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]));
}
