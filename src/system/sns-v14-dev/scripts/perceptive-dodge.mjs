import {attributeEffect} from './transformation-core.mjs';
const id=i=>i?.system?.ruleId||i?.system?.contentId;
export function perceptiveDodgeEffects(actor,effects=[]){
 const items=Array.from(actor?.items??[]),active=Array.from(actor?.system?.activeAptitudes??[]).find(r=>r.active&&['sharingan','transplanted'].includes(r.rule)&&items.some(i=>i.id===r.sourceId&&(r.rule==='sharingan'?id(i)==='sns:apt:sharingan':i.system.details?.featureRule==='Transplante de doujutsu · regra da mesa')));
 if(!active)return [];
 const s=actor.system;let lm,esq;
 if(actor.type==='shinobi'){
  lm=s.bases?.lm+s.attributes?.per+attributeEffect(effects,'per');esq=s.bases?.esq+s.attributes?.agi+attributeEffect(effects,'agi');
 }else{
  // Recorded ratings include these permanent bonuses. Keep Reflexos, exclude
  // Intuição, and use the current editable ratings, not prerequisite history.
  lm=s.stats?.lm-(items.some(i=>id(i)==='sns:apt:intuicao')?1:0);
  esq=s.stats?.esq-(items.some(i=>id(i)==='sns:apt:reflexos')?1:0);
 }
 return Number.isInteger(lm)&&Number.isInteger(esq)&&lm>esq?[{kind:'flatModifier',target:'esq',value:lm-esq,sourceId:active.sourceId,sourceName:'Esquiva perceptiva · Sharingan'}]:[];
}
