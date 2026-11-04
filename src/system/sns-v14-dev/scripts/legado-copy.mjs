import {legadoState,legadoItems,legadoId,hasLegado} from './legado-core.mjs';
import {canonicalCopy} from './canonical-content.mjs';
import {ITEM_RULES,requirementsFor} from './item-requirements.mjs';
import {effectDefinition} from './power-core.mjs';
const ns='sns-v14-dev',elements=['ninpou','katon','suiton','doton','raiton','fuuton'];
export function copyAllocation(cost,memorized=false){if(!Number.isSafeInteger(cost)||cost<1)throw Error('Custo de Mímica inválido.');return memorized?Math.floor(cost/2):cost;}
const restricted=req=>['access','eyeAccess','selfOrigin','noClanOrHijutsu'].includes(req.kind)||(req.options??[]).some(restricted);
export function copyableLegadoEntry(entry){
 if(!entry||entry.id.startsWith('sns:legado:'))return false;
 if(entry.document.type==='effectDefinition')return effectDefinition(entry.id)?.powers.some(p=>elements.includes(p))??false;
 return entry.document.type==='aptitude'&&(entry.ruleIds?.length?entry.ruleIds:[entry.id]).some(id=>ITEM_RULES[id]&&!ITEM_RULES[id].requirements.some(restricted));
}
export function planLegadoCopy(actor,library,params,{id='copy',worldTime=0}={}){
 if(!hasLegado(actor,'mimica-sharingan'))throw Error('A ficha precisa possuir Mímica Sharingan.');
 const state=legadoState(actor),entry=library.find(e=>e.id===params.entryId),cap=Math.floor(actor.system.nc/2),int=actor.system.attributes?.int;
 if(!Number.isInteger(int)||!entry||!['aptitude','effectDefinition'].includes(entry.document.type)||entry.id.startsWith('sns:legado:'))throw Error('Selecione uma aptidão comum ou efeito copiável.');
 const docs=[],source=legadoItems(actor).find(i=>legadoId(i)==='sns:legado:jutsu:mimica-sharingan');let cost,name=entry.document.name,level;
 if(entry.document.type==='aptitude'){
  const variants=entry.variants??[];if(variants.some(v=>v.level)&&!variants.some(v=>v.level===params.level))throw Error('Escolha um nível de aptidão existente.');const variant=variants.find(v=>v.level===params.level)??variants[0],data=canonicalCopy(entry,variant?.id??'',params.choiceKey??''),rule=ITEM_RULES[data.system.ruleId||data.system.contentId];
  if(!rule||rule.requirements.some(restricted)||!requirementsFor(data,actor).valid)throw Error('A aptidão precisa ser comum e cumprir todos os requisitos sem usar outras cópias.');
  level=variant?.level??1;cost=3*level;docs.push(data);
 }else{
  const def=effectDefinition(entry.id),element=params.element??'ninpou';level=params.level;
  if(!def||!elements.includes(element)||!def.powers.includes(element)||!Number.isInteger(level)||level<def.min||level>cap)throw Error('O efeito, elemento ou nível não pode ser copiado.');
  const stage=params.evolution?Math.max(def.min,...def.evolutions.filter(n=>n<=level)):def.min;
  cost=level+(stage>def.min?1:0);
  const powerEntry=library.find(e=>e.id==='sns:power:'+element);if(!powerEntry)throw Error('Definição do poder comum indisponível.');
  const power=canonicalCopy(powerEntry);power._id=id+'p';power.system.level=level;power.system.power={...power.system.power,definitionId:powerEntry.id,choices:[def.min,...def.evolutions.filter(n=>n<=stage)].map((n,k)=>({id:id+'s'+k,slot:n,effectId:entry.id,stage:n}))};docs.push(power);
  docs.push({name:power.name+' · '+name,type:'jutsu',img:entry.document.img,system:{contentId:entry.id,category:'techniques',description:entry.document.system.description,source:entry.document.system.source,details:{powerId:power._id},jutsu:{effectId:entry.id,selectionId:id+'s0',usedLevel:level,variant:'normal',overrides:[]}},flags:{}});
 }
 if(params.mode==='anular'&&params.retain===false)return {record:{id,name,cost:0,allocation:0,itemIds:[],expires:worldTime,forgotten:true},documents:[]};
 const quick=params.mode==='copia-rapida'?1:params.mode==='anular'?1:0;cost+=quick;
 const used=(state.copies??[]).filter(c=>!c.forgotten&&!c.learned).reduce((n,c)=>n+c.allocation,0);if(used+cost>int)throw Error('Pontos de Mímica insuficientes: '+Math.max(0,int-used)+' disponíveis.');
 docs.forEach((doc,n)=>{doc._id??=id+(n?'j':'a');doc.flags??={};doc.flags[ns]={...doc.flags[ns],legadoCopy:{id,sourceId:source.id,level,expires:worldTime+604800,chakraExtra:entry.document.type==='effectDefinition'&&!(int>=10&&hasLegado(actor,'sandan-sharingan'))?1:0},acquisition:{mode:'granted',sourceId:source.id,reason:'Cópia temporária paga com Pontos de Mímica'}};});
 return {record:{id,name,cost,allocation:cost,level,entryId:entry.id,itemIds:docs.map(d=>d._id),expires:worldTime+604800,memorized:false,forgotten:false},documents:docs};
}
