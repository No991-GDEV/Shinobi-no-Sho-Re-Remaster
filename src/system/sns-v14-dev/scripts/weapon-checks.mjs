import {creationUsable,energyFor,bladeHandRoot} from './support-core.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {recordedTransformationRows} from './transformation-core.mjs';
import {conditionEffects,conditionCheckRows} from './condition-effects.mjs';
import {signed,checkComponents} from './roll-components.mjs';
import {calculate} from './kernel.mjs';
import {itemRuleId,requirementsFor} from './item-requirements.mjs';
import {equipmentUse,equipmentAcuity,weaponTraining} from './equipment-use.mjs';
import {effectiveRuleItem} from './jutsu-rule-text.mjs';
export const ATTACK_MODES={'Corpo a corpo':['cc'],'À distância':['cd'],'Corpo a corpo e à distância':['cc','cd']};
export function acuityAvailable(system,items=[]){const source=Array.from(items).find(i=>itemRuleId(i)==='sns:apt:acuidade');return !!source&&requirementsFor(source,{system,items}).valid;}
export function acuityRows(system,rows,effects=[]){const dex=calculate(system,effects).attributes.des;return rows.map(row=>row.id==='attribute'?{...row,label:'Destreza · Acuidade (Básico p.61)',value:dex}:row);}
export async function toggleWeaponAcuity(item){if(!item?.isOwner||item.type!=='weapon'||!item.actor||equipmentAcuity(item)===false||!acuityAvailable(item.actor.system,item.actor.items))throw Error('Acuidade exige Destreza 3, a aptidão e uma arma permitida.');await item.update({'system.details.ccAttribute':item.system.details.ccAttribute==='Acuidade (Destreza)'?'Padrão (Força)':'Acuidade (Destreza)'});}
export function weaponCheckComponents(system,key,item,ownedItems=null){
 item=effectiveRuleItem(item);
 const use=equipmentUse(item,system,ownedItems);if(!use.valid)throw Error(use.problems.join(' '));
 const training=weaponTraining(item,system,ownedItems);
 const original=item.actor??Array.from(ownedItems??[]).find(i=>i.id===item.id)?.actor;const effects=characteristicEffects(original??{items:ownedItems});
 const finish=rows=>{rows=system.stats&&!system.bases?recordedTransformationRows(rows,effects,key,system,key==='cc'&&item.system.details?.ccAttribute==='Acuidade (Destreza)'?'des':''):rows;return conditionCheckRows(training.penalty?[...rows,{id:'weaponTraining',label:'Sem proficiência · '+item.name+' (Básico p.128)',type:'penalty',value:training.penalty,enabled:true}]:rows,effects,key);};
 if(key==='cc'&&item.system.details?.ccAttribute==='Acuidade (Destreza)'&&equipmentAcuity(item)===false)throw Error('Esta arma não permite Acuidade (Básico p.128–135).');
 if(key==='cc'&&item.system.details?.ccAttribute==='Acuidade (Destreza)'&&ownedItems!==null){
  const source=Array.from(ownedItems).find(i=>itemRuleId(i)==='sns:apt:acuidade');
  if(!source||!requirementsFor(source,{system,items:ownedItems}).valid)throw Error('Acuidade exige a aptidão possuída e Destreza3.');
 }
 if(system.stats&&!system.bases){
  const precision=system.stats[key];if(!Number.isInteger(precision))throw Error('Informe a precisão de combate.');
  if(key==='cc'&&item.system.details?.ccAttribute==='Acuidade (Destreza)'){
   const {des}=system.attributes??{},strength=original?.flags?.['sns-v14-dev']?.kuchiyose?.mode==='calculated'?original.flags['sns-v14-dev'].kuchiyose.build.attributes.for:system.attributes?.for;if(!Number.isInteger(des)||des<3)throw Error('Acuidade exige Destreza 3. Confira a configuração da arma.');
   if(!Number.isInteger(strength))throw Error('Informe Força para calcular a precisão com Acuidade.');
   return finish([{id:'recordedBase',label:'CC sem Força',type:'base',value:precision-strength,enabled:true},{id:'attribute',label:'Destreza · Acuidade (Básico p.61)',type:'attribute',value:des,enabled:true}]);
  }
  return finish([{id:'recorded',label:'Precisão',type:'base',value:precision,enabled:true}]);
 }
 const rows=checkComponents(system,key,effects);
 if(key==='cc'&&item.system.details?.ccAttribute==='Acuidade (Destreza)'){
  const dex=calculate(system,effects).attributes.des;
  if(dex<3)throw new Error('Acuidade exige Destreza 3. Confira a configuração da arma.');
  return finish(rows.map(row=>row.id==='attribute'?{...row,label:'Destreza · Acuidade (Básico p.61)',value:dex}:row));
 }
 return finish(rows);
}
export function weaponChecks(item,stats={},system=null,ownedItems=null){
 item=effectiveRuleItem(item);
 const modes=ATTACK_MODES[item.system.details?.attackMode]??[];
 return modes.map(key=>{
  const acuity=!!system&&key==='cc'&&item.system.details?.ccAttribute==='Acuidade (Destreza)';
  let precision=stats[key],valid=equipmentUse(item,system,ownedItems).valid;
  const training=weaponTraining(item,system,ownedItems);
  if(system){try{precision=weaponCheckComponents(system,key,item,ownedItems).reduce((n,r)=>n+r.value,0);}catch{precision=null;valid=false;}}
  return {key,label:key==='cc'?'Corpo a corpo':'À distância',precision,origin:[acuity?'Acuidade':'',training.penalty?'Sem proficiência':''].filter(Boolean).join(' · '),display:Number.isInteger(precision)?signed(precision):'—',available:valid&&(!item.flags?.['sns-v14-dev']?.bladeHand||!!bladeHandRoot(item.actor??{items:ownedItems},item))&&(!item.flags?.['sns-v14-dev']?.supportFists||!!energyFor(item.actor??{items:ownedItems},item,key))&&creationUsable(item,key)&&!!item.system.equipped&&item.system.quantity>0&&Number.isInteger(precision)};
 });
}
