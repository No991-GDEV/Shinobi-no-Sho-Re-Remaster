import {CONDITION_STATUSES} from '../data/condition-statuses.mjs';
import {fold} from './traits.mjs';
export const DEFENSE_CATEGORIES={immunities:'Imunidades',weaknesses:'Fraquezas',resistances:'Resistências'};
export const DEFENSE_TYPES=[...new Map([
 ['dano','Dano'],['fisico','Dano físico'],['corte','Corte'],['perfuracao','Perfuração'],['concussao','Concussão'],['fogo','Fogo'],['agua','Água'],['terra','Terra'],['vento','Vento'],['raio','Raio'],['veneno','Veneno'],['genjutsu','Genjutsu'],
 ...CONDITION_STATUSES.map(c=>[c.contentId,c.name])
].map(([id,name])=>[id,{id,name}])).values()];
const typeMap=new Map(DEFENSE_TYPES.map(t=>[t.id,t.name]));
export function validateDefenseEntries(category,rows){
 if(!Object.hasOwn(DEFENSE_CATEGORIES,category)||!Array.isArray(rows)||rows.length>50)throw Error('Lista de defesas inválida.');
 const text=(v,max=300)=>{if(typeof v!=='string'||v.length>max)throw Error('Texto de defesa inválido.');return v.trim();};
 return rows.map(row=>{
  const type=text(row.type,100),label=text(row.label??'',500);
  if(!typeMap.has(type)&&type!=='custom'||type==='custom'&&!label)throw Error('Escolha um tipo ou dê um nome à defesa.');
  const value=row.value===''||row.value===null||row.value===undefined?null:Number(row.value);
  if(category!=='immunities'&&value!==null&&(!Number.isFinite(value)||value<0||!Number.isSafeInteger(value*2)))throw Error('O valor deve ser não negativo, em pontos inteiros ou meios pontos.');
  return {type,label:type==='custom'?label:'',value:category==='immunities'?null:value,exceptions:text(row.exceptions??''),note:text(row.note??'',1000)};
 });
}
export function actorDefenseEntries(actor,category){
 if(!Object.hasOwn(DEFENSE_CATEGORIES,category))throw Error('Categoria de defesa inválida.');
 const configured=actor.flags?.['sns-v14-dev']?.defenses?.[category];
 if(Array.isArray(configured))return validateDefenseEntries(category,configured);
 const legacy=String(actor.system.details?.[category]??'').trim();
 // Retain the full old sentence: commas may separate exceptions, not entries.
 return legacy?[{type:'custom',label:legacy,value:null,exceptions:'',note:''}]:[];
}
export function actorDefenseView(actor){
 return Object.entries(DEFENSE_CATEGORIES).map(([category,label])=>({category,label,entries:actorDefenseEntries(actor,category).map(row=>({...row,name:row.type==='custom'?row.label:typeMap.get(row.type),hasValue:row.value!==null,displayValue:row.value===null?'':String(row.value).replace('.',',')}))}));
}
export const ACTOR_SIZES=[['minusculo','Minúsculo'],['diminuto','Diminuto'],['miudo','Miúdo'],['pequeno','Pequeno'],['medio','Médio'],['grande','Grande'],['enorme','Enorme'],['imenso','Imenso'],['colossal','Colossal'],['incrivel','Incrível']].map(([id,name])=>({id:'porte:'+id,name}));
export function actorSizeId(system){
 const size=fold(system.details?.size??'');
 return ACTOR_SIZES.find(s=>fold(s.name)===size)?.id??system.traits?.find(id=>ACTOR_SIZES.some(s=>s.id===id))??'';
}
export function actorSizePatch(system,id){
 const size=ACTOR_SIZES.find(s=>s.id===id);if(!size&&id!=='')throw Error('Tamanho inválido.');
 return {'system.details.size':size?.name??'','system.traits':[...(system.traits??[]).filter(t=>!ACTOR_SIZES.some(s=>s.id===t)),...(id?[id]:[])],'system.tags':(system.tags??[]).filter(t=>!ACTOR_SIZES.some(s=>fold(s.name)===fold(t)))};
}
