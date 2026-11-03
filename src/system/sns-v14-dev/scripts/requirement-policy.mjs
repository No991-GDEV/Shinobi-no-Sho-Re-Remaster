// GM-authored requirement profiles. Flags avoid changing the persisted system
// schema; the same tree is evaluated by acquisition, catalogue and guide.
const ns='sns-v14-dev';
export const requirementProfile=item=>item?.flags?.[ns]?.requirements??null;
export const requirementSource=item=>item?.flags?.[ns]?.requirementsSource??'';
const stable=x=>JSON.stringify(x??null);
export function validateRequirementTree(tree){
 let count=0;
 const check=(n,depth)=>{
  if(!n||typeof n!=='object'||Array.isArray(n)||++count>80||depth>8)throw Error('Árvore de requisitos inválida ou muito extensa.');
  const kind=n.kind,label=String(n.label??'').trim();
  const min=()=>{if(!Number.isSafeInteger(n.min)||n.min<1||n.min>100)throw Error('O mínimo deve ser um inteiro entre 1 e 100.');};
  const id=()=>{if(typeof n.id!=='string'||!/^sns:[a-zA-Z0-9:_-]+$/.test(n.id))throw Error('Selecione uma identidade de regra válida.');};
  if(['all','any'].includes(kind)){if(!Array.isArray(n.options)||kind==='any'&&!n.options.length)throw Error('O grupo de alternativas precisa de opções.');return {kind,options:n.options.map(o=>check(o,depth+1))};}
  if(kind==='attribute'){if(!['for','des','agi','per','int','vig','esp','car','man'].includes(n.key))throw Error('Atributo inválido.');min();return {kind,key:n.key,min:n.min,label};}
  if(kind==='skillLevel'){if(typeof n.key!=='string'||!/^[a-z_]+$/.test(n.key))throw Error('Perícia inválida.');min();return {kind,key:n.key,min:n.min,label};}
  if(['owned','powerLevel'].includes(kind)){id();if(kind==='powerLevel')min();return {kind,id:n.id,...(kind==='powerLevel'?{min:n.min}:{}),label};}
  if(kind==='ownedChoice'){id();if(typeof n.choice!=='string'||!n.choice.trim())throw Error('Informe a escolha exigida.');return {kind,id:n.id,choice:n.choice,label};}
  if(kind==='effectKnown'){id();min();if(n.powerId&&!/^sns:power:[a-z0-9_-]+$/.test(n.powerId))throw Error('Poder de origem inválido.');return {kind,id:n.id,min:n.min,label,...(n.powerId?{powerId:n.powerId}:{})};}
  if(kind==='access'){if(typeof n.key!=='string'||!/^[a-z0-9_-]+$/.test(n.key))throw Error('Origem inválida.');return {kind,key:n.key};}
  if(kind==='actorType'){if(!Array.isArray(n.types)||!n.types.length||n.types.some(t=>!['shinobi','npc','companion'].includes(t)))throw Error('Tipo de ficha inválido.');return {kind,types:[...new Set(n.types)],label};}
  if(kind==='nc'){min();return {kind,min:n.min,label:label||'Nível de campanha'};}
  throw Error('Tipo de requisito não disponível no editor: '+kind);
 };
 return check(tree,0);
}
export function validateRequirementProfile(profile){
 if(profile===null||profile===undefined)return null;
 if(!['append','replace'].includes(profile.mode))throw Error('Escolha complementar ou substituir os requisitos.');
 const source=String(profile.source??'').trim(),reason=String(profile.reason??'').trim();
 if(!source||!reason)throw Error('Informe a fonte e o motivo da configuração.');
 const scope=profile.scope??'acquisition';if(!['acquisition','use'].includes(scope))throw Error('Escopo de requisito inválido.');
 return {mode:profile.mode,scope,tree:validateRequirementTree(profile.tree),source,reason,author:String(profile.author??''),at:String(profile.at??'')};
}
export function mayEditRequirementProfile(before,after,isGM){
 return !!isGM||['requirements','requirementsSource','requirementsHistory'].every(k=>stable(before?.flags?.[ns]?.[k])===stable(after?.flags?.[ns]?.[k]));
}
export function carryRequirementProfile(from,to,sourceUuid=''){
 if(!requirementProfile(from))return to;
 const flags=to.flags??={};flags[ns]??={};
 flags[ns].requirements=structuredClone(requirementProfile(from));
 flags[ns].requirementsSource=sourceUuid||requirementSource(from);
 return to;
}
export function isTrustedRequirementCopy(item,source){
 try{return !!source&&!!requirementProfile(source)&&stable(validateRequirementProfile(requirementProfile(item)))===stable(validateRequirementProfile(requirementProfile(source)));}catch{return false;}
}
