import {ATTRIBUTES} from './kernel.mjs';
import {attributePreview,skillPreview} from './stat-editor-state.mjs';

export function inlineInteger(value){
 if(typeof value!=='number'&&(typeof value!=='string'||!value.trim()))throw Error('Informe um número inteiro não negativo.');
 const number=Number(value);
 if(!Number.isSafeInteger(number)||number<0)throw Error('Informe um número inteiro não negativo.');
 return number;
}

export function checkInlineBaseline(current,expected){
 if(expected!==undefined&&current!==inlineInteger(expected))throw Error('Este valor mudou na ficha. Confira o valor atualizado e tente novamente.');
}

// Same previews as the existing editors. Only the chosen field is written;
// grants, modifiers, resources and the other choices remain untouched.
export function inlineStatPatch(source,{kind,key,value,expected},{isGM=false,effects=[]}={}){
 const next=inlineInteger(value);
 if(kind==='attribute'){
  if(!ATTRIBUTES.some(([id])=>id===key))throw Error('Atributo desconhecido.');
  const current=source.attributes[key];checkInlineBaseline(current,expected);
  attributePreview(source,{...source.attributes,[key]:next},effects);
  return next===current?{}:{['system.attributes.'+key]:next};
 }
 if(kind==='skill'){
  if(!Object.hasOwn(source.skills??{},key))throw Error('Perícia desconhecida.');
  const current=source.skills[key].bought;checkInlineBaseline(current,expected);
  const modifier=source.modifiers?.['skill_'+key]??{value:0,origin:''};
  const preview=skillPreview(source,key,{bought:next,bonus:modifier.value??0,origin:modifier.origin??''});
  if(!isGM&&next>Math.max(preview.limit,current))throw Error('A compra excede o limite do NC.');
  return next===current?{}:{['system.skills.'+key+'.bought']:next};
 }
 throw Error('Campo de criação desconhecido.');
}
