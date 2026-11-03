import {conditionCheckRows} from './condition-effects.mjs';
import {attributeEffect,flatEffect} from './transformation-core.mjs';
import { ATTRIBUTES, COMBAT, calculate, testSpec } from './kernel.mjs';
export const signed = n => (n >= 0 ? '+' : '−') + Math.abs(n);
export const COMPONENT_TYPES = {base:'Base',attribute:'Atributo',skill:'Perícia',adjustment:'Ajuste',context:'Contexto',technique:'Técnica',equipment:'Equipamento',penalty:'Penalidade',condition:'Condição'};

// This decomposes SNS precision. It does not import Pathfinder bonus stacking or fortune rules.
export function checkComponents(system,key,effects=[]){
  testSpec(system,key,0,"",effects); // Keep training/access/fixed-dodge gates from the SNS kernel.
  const d=calculate(system,effects),rows=[];
  const add=(id,label,type,value)=>rows.push({id,label,type,value,enabled:true});
  const attrName=k=>ATTRIBUTES.find(([id])=>id===k)[2];
  if(key==='initiative'){
    add('agility','Agilidade','attribute',d.attributes.agi);
    add('readiness','Prontidão','skill',d.skills.prontidao.level);
    if(system.modifiers?.initiative?.value)add('manual',d.initiativeOrigin,'adjustment',system.modifiers.initiative.value);
  }else if(key.startsWith('attribute:')){
    const k=key.slice(10);add('attribute',attrName(k),'attribute',d.attributes[k]);
    const extra=attributeEffect(effects,k,'tests')-attributeEffect(effects,k);if(extra)add('temporary-scope','Transformação · testes','technique',extra);
  }else if(key.startsWith('skill:')){
    const s=d.skills[key.slice(6)];
    const override=effects.find(e=>e.kind==='skillOverride'&&e.target===s.key);if(override)add('temporary-skill',override.sourceName,'technique',override.value);else{add('attribute',attrName(s.attribute)+' (½)','attribute',Math.ceil(d.attributes[s.attribute]/2));add('bought',s.trained?'Níveis comprados':'Não treinada','skill',s.bought);}
    if(s.modifier.value)add('manual',s.modifier.origin,'adjustment',s.modifier.value);
  }else{
    const [,label,k]=COMBAT.find(([id])=>id===key),c=d.combat[key];
    add('base',{cc:'Base corporal',cd:'Base à distância',lm:'Base de leitura'}[key],'base',c.base);
    add('attribute',attrName(k),'attribute',c.normal-c.base);
    if(c.modifier.value)add('manual',c.modifier.origin,'adjustment',c.modifier.value);
  }
  if(flatEffect(effects,key))add('temporary-flat',[...new Set(effects.filter(e=>e.kind==='flatModifier'&&e.target===key).map(e=>e.sourceName).filter(Boolean))].join(', ')||'Efeito da ficha','technique',flatEffect(effects,key));
  return conditionCheckRows(rows,effects,key);
}
export function resolveCheck(system,key,rows,effects=[]){
  const initial=testSpec(system,key,0,"",effects),ids=new Set();
  for(const row of rows){
    if(!row.id||ids.has(row.id)||!row.label?.trim()||!Number.isInteger(row.value)||!COMPONENT_TYPES[row.type])throw new Error('Modificador inválido ou duplicado.');
    ids.add(row.id);
  }
  const included=rows.filter(r=>r.enabled),total=included.reduce((n,r)=>n+r.value,0);
  const breakdown=rows.map(r=>r.label+' '+signed(r.value)+(r.enabled?'':' (desconsiderado)')).join('; ');
  const spec=testSpec(system,key,total-initial.precision,breakdown,effects);
  return {...spec,components:rows.map(r=>({...r})),breakdown};
}
export function resolveRecordedCheck({key,name,precision,die='2d8'},rows){
  if(!Number.isInteger(precision)||!['1d8','2d8'].includes(die))throw new Error('Valores do teste inválidos.');
  const ids=new Set();for(const row of rows){if(!row.id||ids.has(row.id)||!row.label?.trim()||!Number.isInteger(row.value)||!COMPONENT_TYPES[row.type])throw new Error('Modificador inválido ou duplicado.');ids.add(row.id);}
  const total=rows.filter(r=>r.enabled).reduce((n,r)=>n+r.value,0);
  return {key,name,precision,adjustment:total-precision,die,formula:die+' + '+total,components:rows.map(r=>({...r})),breakdown:rows.map(r=>r.label+' '+signed(r.value)+(r.enabled?'':' (desconsiderado)')).join('; ')};
}
