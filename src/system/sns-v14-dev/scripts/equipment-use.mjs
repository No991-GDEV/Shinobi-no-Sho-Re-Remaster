// Possession is allowed. Fixed canonical requirements apply to equip/use only.
import {EQUIPMENT_DEFINITIONS} from '../data/equipment-definitions.mjs';
import {itemRuleId,requirementsFor} from './item-requirements.mjs';
import {effectiveRuleItem} from './jutsu-rule-text.mjs';
const labels={for:'Força',des:'Destreza',vig:'Vigor'};
export const equipmentAcuity=item=>EQUIPMENT_DEFINITIONS[item?.system?.contentId]?.acuity;
export function weaponTraining(item,system,ownedItems=[]){
 const id=item?.system?.contentId,definition=EQUIPMENT_DEFINITIONS[id];
 if(!definition?.training)return {configured:false,trained:false,penalty:0};
 if(definition.training==='simples')return {configured:true,trained:true,penalty:0};
 const items=Array.from(ownedItems??[]).map(effectiveRuleItem),allowed=new Set([id,...(id==='sns:equipment:wakizashi'?['sns:equipment:katana']:[])]);
 const trained=items.some(i=>itemRuleId(i)==='sns:apt:usar-arma'&&allowed.has(i.system?.choice?.key)&&requirementsFor(i,{system,items}).valid);
 return {configured:true,trained,penalty:trained?0:-3};
}
export function equipmentUse(item,system=null,ownedItems=[]){
 const definition=EQUIPMENT_DEFINITIONS[item?.system?.contentId];
 const items=Array.from(ownedItems??[]);
 const custom=requirementsFor(item,{system,items},[],false,{scope:'use'});
 if(!definition&&!custom.configured)return {configured:false,valid:true,rows:[],problems:[]};
 const evaluate=req=>{
  if(req.alternatives){const options=req.alternatives.map(evaluate);return {label:options.map(o=>o.label).join(' ou '),current:options.map(o=>o.current).join(' / '),met:options.some(o=>o.met)};}
  if(req.ownedRule){const candidates=items.filter(i=>itemRuleId(i)===req.ownedRule),met=candidates.some(i=>requirementsFor(i,{system,items}).valid);return {label:req.label,current:met?'Possuída e válida':candidates.length?'Requisitos pendentes':'Não possuída',met};}
  const keys=req.anyAttributes??[req.attribute],values=keys.map(k=>system?.attributes?.[k]);
  return {label:keys.map(k=>labels[k]).join(' ou ')+' ≥ '+req.min,current:values.map(v=>Number.isInteger(v)?String(v):'Não informado').join(' / '),met:values.some(v=>Number.isInteger(v)&&v>=req.min)};
 };
 const replace=item?.flags?.['sns-v14-dev']?.requirements?.scope==='use'&&item.flags['sns-v14-dev'].requirements.mode==='replace';
 const rows=[...(replace?[]:(definition?.requirements??[]).map(evaluate)),...(custom.configured?custom.rows:[])];
 const problems=[...rows.filter(r=>!r.met).map(r=>(definition?.name??item.name??'O item')+' exige '+r.label+' para uso ('+r.current+').'),...(custom.configured&&!custom.valid&&!custom.rows.length?custom.problems:[])];
 return {configured:true,valid:!problems.length,source:custom.configured?custom.source:'Básico 4.1b · p.'+definition.pages,rows,problems};
}
