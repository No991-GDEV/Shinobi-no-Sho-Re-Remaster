import {generateNpcNumbers,generatorOptions,GENERATOR_SOURCE} from './npc-generator-math.mjs';
import {canonicalCopy} from './canonical-content.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {availableChoices,jutsuVariants,resolveJutsu,effectDefinition} from './power-core.mjs';
import {SKILLS,EVOLUTION} from './rules.mjs';
import {TRAITS} from '../data/traits-v1.mjs';
import {escapeHtml} from './kernel.mjs';
import {printedRuleHeaders} from './jutsu-rule-text.mjs';
const ns='sns-v14-dev',attributes=['for','des','agi','per','int','vig','esp'];
const title=s=>s[0].toUpperCase()+s.slice(1).toLowerCase(),fold=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
export const GENERATOR_IDENTITIES=Object.fromEntries(['vila','cla'].map(family=>[family,TRAITS.filter(t=>t.family===family).map(t=>({id:t.id,name:t.label})).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'))]));
export function newNpcDraft(options={}){return {options:generatorOptions(options),numbers:generateNpcNumbers(options),name:'',village:'',clan:'',excluded:[]};}
export function generatorActorView(data,{copy=true}={}){
 const clone=value=>copy?structuredClone(value):value;
 const actor={type:'npc',system:clone(data.system),flags:clone(data.flags??{}),items:[]};
 actor.items=data.items.map(row=>({...clone(row),id:row._id,actor}));actor.items.get=id=>actor.items.find(i=>i.id===id);actor.items.contents=actor.items;return actor;
}
function checkNumbers(draft){
 const r=draft.numbers;if(!r)throw Error('Atualize a prévia.');
 for(const group of [r.attributes,r.stats])for(const [key,value]of Object.entries(group))if(!Number.isSafeInteger(value)||value< -20||value>500)throw Error('Valor inválido: '+key+'.');
 if(attributes.some(k=>!Object.hasOwn(r.attributes,k))||['cc','cd','esq','lm','initiative','movement'].some(k=>!Object.hasOwn(r.stats,k)))throw Error('A prévia está incompleta.');
 for(const key of ['vitality','chakra','meleeRange','rangedRange'])if(!Number.isSafeInteger(r[key])||r[key]<(key==='chakra'?0:1)||r[key]>10000)throw Error('Valor inválido: '+key+'.');
 return r;
}
export function generatedNpcPreview(draft,library){
 const options=generatorOptions(draft.options),numbers=checkNumbers(draft),entries=library?.entries??library;
 if(numbers.defenseKey!==(options.difficulty.endsWith('PER.')?'lm':'esq'))throw Error('Recalcule a defesa do modelo.');
 if(!Array.isArray(entries))throw Error('O compêndio de regras não está disponível.');
 const get=id=>{const e=entries.find(e=>e.id===id);if(!e)throw Error('Definição ausente no compêndio: '+id);return e;};
 const identity=(family,id)=>{if(!id)return null;const t=GENERATOR_IDENTITIES[family].find(t=>t.id===id);if(!t)throw Error('Origem inválida.');return t;};
 const village=identity('vila',draft.village),clan=identity('cla',draft.clan),name=String(draft.name??'').trim()||title(options.style)+' · NC '+options.nc;
 if(name.length>100)throw Error('Use um nome com até 100 caracteres.');
 let nextId=0;const id=()=>('npcgen'+String(++nextId).padStart(10,'0')),items=[],notices=[],choices=[],excluded=new Set(draft.excluded??[]);
 const original=generateNpcNumbers({...options,noCombatBonus:true,oneHp:false});
 const data={name,type:'npc',img:'icons/svg/mystery-man.svg',ownership:{default:0},system:{nc:options.nc,attributes:{...numbers.attributes,car:null,man:null},stats:{...numbers.stats},statsOriginal:Object.fromEntries(['cc','cd','esq','lm','initiative'].map(k=>[k,Math.max(0,original.stats[k]+numbers.stats[k]-generateNpcNumbers(options).stats[k])])),resources:{vitality:{value:numbers.vitality,max:numbers.vitality},chakra:{value:numbers.chakra,baseMax:numbers.chakra}},traits:['estilo:'+options.style,'porte:'+fold(options.size),...(village?[village.id]:[]),...(clan?[clan.id]:[])],tags:[],details:{size:title(options.size),rank:options.oneHp?'Capanga':'NPC',role:title(options.style)+' · '+title(options.difficulty),village:village?.name??'',defense:''},source:{id:GENERATOR_SOURCE.file,edition:GENERATOR_SOURCE.version,pages:'GERADOR DE CAPANGAS; VARIÁVEIS E TABELAS'},recordedSkills:SKILLS.filter(s=>!s.training).map(s=>({key:s.key,precision:numbers.attributes[s.attribute]??null,untrained:false})).filter(s=>s.precision!==null),recordedSkillsConfigured:true},flags:{[ns]:{npcGenerator:{version:1,sourceSha256:GENERATOR_SOURCE.sha256,options,defenseKey:numbers.defenseKey},...(options.oneHp?{magenCapanga:true}:{})}},items};
 const add=id=>{const row=canonicalCopy(get(id));row._id=('npcgen'+String(++nextId).padStart(10,'0'));items.push(row);return row;};
 const valid=item=>requirementsFor(item,generatorActorView(data)).valid;
 const addApt=key=>{const row=canonicalCopy(get(key));if(!valid(row)){notices.push({name:row.name,reason:requirementsFor(row,generatorActorView(data)).problems.join(' ')});return null;}row._id=id();items.push(row);return row;};
 const addTechnique=(key,{grant,params,usedLevel=1,power,selectionId,variant}={})=>{
  const e=get(key),row=canonicalCopy(e),choice={id:key,name:e.document.name,selected:!excluded.has(key)};choices.push(choice);if(excluded.has(key))return;
  row._id=id();row.type='jutsu';row.system.category='techniques';row.system.details={...row.system.details,powerCost:0,...(grant?{grantedById:grant._id,grantSourceId:key}:{})};
  const headers=printedRuleHeaders(row.system.description);for(const [key,label]of [['action','acao'],['range','alcance'],['duration','duracao'],['chakraCost','custo de chakra']])if(headers[label])row.system.details[key]=headers[label];
  if(power){row.name=power.name+' · '+e.document.name;row.system.details.powerId=power._id;row.system.jutsu={effectId:key,selectionId,usedLevel,variant,overrides:[]};}
  if(params){row.flags[ns].npcCastParameters={1:params};row.flags[ns].generatorTechnique={grantId:grant._id};row.system.details={...row.system.details,action:'Padrão',range:options.style==='genjutsu'?'5 m':numbers.meleeRange+' m',duration:key.endsWith('fascinar')?'Cena':key.endsWith('miragem')?'Contínua':'Instantânea',chakraCost:String(params.cost)};}
  items.push(row);return row;
 };
 // Named book techniques, not placeholder attacks. Their descriptions remain literal copies.
 for(const key of ['sns:jutsu:henge-no-jutsu','sns:jutsu:kinobori','sns:jutsu:bunshin-no-jutsu']){
  const row=canonicalCopy(get(key));if(valid(row))addTechnique(key);else notices.push({name:row.name,reason:requirementsFor(row,generatorActorView(data)).problems.join(' ')});
 }
 const mainAttack=numbers.attacks[0];
 for(const [key,label,base,range]of [['cc','Golpear',mainAttack?.base??Math.max(0,Math.ceil(numbers.attributes.for/2)),numbers.meleeRange],['cd','Arremesso',numbers.attacks.find(a=>a.key==='cd')?.base??0,numbers.rangedRange]]){
  const book=canonicalCopy(get('sns:action:golpear'));book._id=id();book.type='attack';book.name=label;book.system.details={precision:numbers.stats[key],damage:String(base),range:range+' m',action:'Padrão'};book.system.category='standard';book.flags[ns].generatorAttack={key,range};items.push(book);
 }
 if(options.style==='ninjutsu'){
  const power=add('sns:power:ninpou');power.system.level=Math.floor(options.nc/2);power.system.power.choices=[];
  if(!valid(power))throw Error('O NPC não cumpre os requisitos de Ninpou.');
  const priority=['canhao','raio','flechas','coluna','missil'];
  for(let slot=1;slot<=power.system.level;slot++){
   const allowed=availableChoices(power,slot).filter(c=>c.allowed),candidate=priority.map(k=>allowed.find(c=>c.id==='sns:effect:'+k)).find(Boolean)??allowed[0];
   if(!candidate)throw Error('Não foi possível completar as escolhas de Ninpou.');power.system.power.choices.push({id:id(),slot,effectId:candidate.id,stage:candidate.stage});
  }
  const unique=[...new Set(power.system.power.choices.map(c=>c.effectId))];
  for(const key of unique){const selected=power.system.power.choices.filter(c=>c.effectId===key).at(-1),variant=jutsuVariants(power,key,power.system.level)[0]?.id??'normal';addTechnique(key,{power,usedLevel:power.system.level,selectionId:selected.id,variant});}
 }else if(options.style==='genjutsu'){
  for(const key of ['sns:apt:fascinar','sns:apt:miragem']){const grant=addApt(key);if(grant)addTechnique(key,{grant,params:key.endsWith('fascinar')?{mode:'save',cost:3,base:0,dc:6+numbers.attributes.int,saveKeys:['attribute:int']}:{mode:'none',cost:1,base:0}});}
 }else{
  const girar=addApt('sns:apt:ataque-giratorio');if(girar)addTechnique('sns:apt:ataque-giratorio',{grant:girar,params:{mode:'attack:cc',cost:0,base:mainAttack.base}});
  const chute=girar?addApt('sns:apt:chute-giratorio'):null;if(chute)addTechnique('sns:apt:chute-giratorio',{grant:chute,params:{mode:'attack:cc',cost:0,base:mainAttack.base+2}});
 }
 const actor=generatorActorView(data),jutsus=actor.items.filter(i=>i.type==='jutsu');
 for(const j of jutsus){if(j.system.jutsu?.effectId){const p=actor.items.get(j.system.details.powerId),r=resolveJutsu(actor,p,j);if(!r.valid)throw Error(j.name+': '+r.problems.join(' '));}}
 const pp=items.reduce((n,i)=>n+(i.type==='power'?i.system.level:i.type==='aptitude'?i.system.details.powerCost??0:0),0),budget=EVOLUTION.find(r=>r.nc===options.nc)?.poderes_basico;
 if(pp>budget)throw Error('O repertório ultrapassou os pontos de poder do NC.');
 data.system.description='<p>'+escapeHtml(title(options.style))+' · '+escapeHtml(title(options.difficulty))+'.</p><p>Atributos, precisões e recursos calculados pela planilha de Ricardo “TheNewbie” Oliveira. Os bônus de combate da planilha já estão incluídos nas precisões.</p><p>As técnicas abaixo usam as regras e os custos de suas próprias descrições. Não recebem automaticamente o dano genérico da planilha. Vila e clã são identificações; não concedem poderes.</p>'+(options.oneHp?'<p>Capanga: 1 de Vitalidade e defesa melhorada. Confira as restrições de capangas do Básico, p.281: sem crítico, golpe de misericórdia ou oportuno contra não capangas; falha em testes de atributo/perícia, salvo exceção expressa.</p>':'');
 return {data,actor,choices,notices,pp,budget,techniques:jutsus.map(j=>({id:j.system.jutsu?.effectId||j.system.contentId,name:j.name,description:j.system.description,img:j.img})),fixedDefense:9+numbers.stats[numbers.defenseKey]};
}
