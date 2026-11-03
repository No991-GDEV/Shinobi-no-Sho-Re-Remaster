import {SKILLS} from './rules.mjs';
const fold=value=>String(value??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/\*/g,'').replace(/[.\s]+$/g,'').trim();
const aliases=new Map(SKILLS.map(s=>[fold(s.name),s.key]));
for(const [name,key] of [['disfarce','disfarces'],['mecanismo','mecanismos'],['ciencia naturais','ciencias_naturais']])aliases.set(name,key);
export function validateRecordedSkills(rows){
 if(!Array.isArray(rows))throw Error('Lista de perícias inválida.');
 const seen=new Set();
 return rows.map(row=>{
  if(!SKILLS.some(s=>s.key===row.key)||seen.has(row.key))throw Error('Perícia inválida ou repetida.');
  seen.add(row.key);
  if(typeof row.untrained!=='boolean'||(!row.untrained&&!Number.isInteger(row.precision)))throw Error('Informe uma precisão inteira ou marque sem treinamento.');
  return {key:row.key,precision:row.untrained?null:row.precision,untrained:row.untrained};
 });
}
// Read old short stat blocks without rewriting their text. Ignore ambiguous prose.
export function readLegacySkills(text){
 const rows=new Map();
 for(const token of String(text??'').replace(/\.\s*(?=Sem treinamento:)/gi,';').split(';')){
  const untrained=token.match(/^\s*Sem treinamento:\s*([^.]*)/i);
  if(untrained){for(const name of untrained[1].split(',')){const key=aliases.get(fold(name));if(key)rows.set(key,{key,precision:null,untrained:true});}continue;}
  const match=token.trim().match(/^(.+?)\s+([+-]?\d+|X)\.?$/i);
  if(!match)continue;
  const key=aliases.get(fold(match[1]));if(!key||rows.has(key))continue;
  const x=match[2].toUpperCase()==='X';rows.set(key,{key,precision:x?null:Number(match[2]),untrained:x});
 }
 return [...rows.values()];
}
export function recordedSkills(source){
 const stored=source.recordedSkills??[];
 const values=stored.length||source.recordedSkillsConfigured?stored:readLegacySkills(source.details?.skills);
 return SKILLS.flatMap(skill=>{const row=values.find(r=>r.key===skill.key);return row?[{...row,name:skill.name,display:row.untrained?'X':(row.precision>=0?'+':'')+row.precision}]:[];});
}
