import {durationLabel} from './effect-duration.mjs';
import {illusionData} from './magen-core.mjs';
// SNS Básico 4.1b, pp.275–279. These are debilitated-precision penalties,
// capped at −3 per test, not deductions from original attributes/ratings.
export const CONDITION_SCOPES=Object.freeze(['all','attacks','defenses','initiative',...['for','des','agi','per','int','vig','esp','car','man'].map(k=>'attribute:'+k)]);
const profiles=Object.freeze({
 debilitado:{scope:'chosen',degree:1},amedrontado:{scope:'all',degree:1},fintado:{scope:'defenses',degree:2},desprevenido:{scope:'defenses',degree:3},caido:{scope:'cc',degree:3},
 fatigado:{scope:'combat',degree:1,slow:true},exausto:{scope:'combat',degree:3,slow:true},
 impedido:{scope:'combat',degree:1},agarrado:{scope:'combat',degree:1},
 surdo:{scope:'initiative',degree:3},lento:{scope:'none',degree:0,slow:true},acelerado:{scope:'none',degree:0},'super-acelerado':{scope:'none',degree:0}
});
export const isManagedCondition=item=>item?.system?.appliedCondition?.managed===true;
export function conditionEffects(actor){
 const effects=Array.from(actor?.items??[]).filter(i=>isManagedCondition(i)&&i.system.appliedCondition.active).map(i=>{
  const key=i.type==='condition'&&i.system.contentId?.startsWith('sns:condition:')?i.system.contentId.slice(14):'';
  const profile=profiles[key],record=i.system.appliedCondition;
  const chosen=CONDITION_SCOPES.includes(record.scope)?record.scope:'all';
  const degree=Number.isInteger(i.system.details?.degree)?Math.max(1,Math.min(3,i.system.details.degree)):1;
  return {kind:'condition',key,sourceId:i.id,sourceName:i.name,scope:profile?.scope==='chosen'?chosen:profile?.scope??'none',degree:profile?.scope==='chosen'?degree:profile?.degree??0,slow:!!profile?.slow,automated:!!profile};
 });
 return effects;
}
const attacks=key=>['cc','cd','attack'].includes(key),defenses=key=>['esq','lm','defense:cc'].includes(key);
export function matchingConditions(effects,key){
 const present=id=>effects.some(e=>e.kind==='condition'&&e.key===id);
 return effects.filter(e=>e.kind==='condition'&&e.degree>0&&!(e.key==='fatigado'&&present('exausto'))&&!(e.key==='impedido'&&present('agarrado'))&&(e.scope==='all'||e.scope===key||e.scope==='attacks'&&attacks(key)||e.scope==='defenses'&&defenses(key)||e.scope==='combat'&&(attacks(key)||defenses(key))));
}
export function conditionPenalty(effects,key){
 const byKind=new Map();
 for(const effect of matchingConditions(effects,key))byKind.set(effect.key,Math.max(byKind.get(effect.key)??0,effect.degree));
 const degree=Math.min(3,Array.from(byKind.values()).reduce((sum,value)=>sum+value,0));return degree?-degree:0;
}
export const effectsForEscape=(effects,sourceId)=>sourceId?effects.filter(e=>e.kind!=='condition'||e.sourceId!==sourceId):effects;
export function conditionCheckRows(rows,effects,key){
 const clean=rows.filter(r=>!['condition-penalty','condition-haste'].includes(r.id)),value=conditionPenalty(effects,key),haste=conditionHaste(effects);
 if(key==='initiative'&&haste)clean.push({id:'condition-haste',label:haste===4?'Super Acelerado':'Acelerado',type:'condition',value:haste,enabled:true});
 return value?[...clean,{id:'condition-penalty',label:'Condições · '+[...new Set(matchingConditions(effects,key).map(e=>e.sourceName))].join(', '),type:'condition',value,enabled:true}]:clean;
}
export function conditionMovement(value,effects){return Number.isFinite(value)&&effects.some(e=>e.kind==='condition'&&e.slow)?value/2:value;}
export function conditionHaste(effects){return effects.some(e=>e.kind==='condition'&&e.key==='super-acelerado')?4:effects.some(e=>e.kind==='condition'&&e.key==='acelerado')?2:0;}
export function conditionViews(actor){
 const effects=conditionEffects(actor);
 return Array.from(actor?.items??[]).filter(i=>isManagedCondition(i)&&i.system.appliedCondition.active).map(i=>{
  const e=effects.find(e=>e.sourceId===i.id),r=i.system.appliedCondition;
  const description=String(i.system.description??'').replace(/<\/(p|h\d|tr)>/g,'\n').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"');
  const label={all:'Todos os testes',attacks:'Ataques',cc:'Corpo a corpo',defenses:'Defesas e Esquiva',initiative:'Iniciativa',combat:'Ataques e defesas'}[e.scope]??(e.scope.startsWith('attribute:')?'Teste de '+e.scope.slice(10).toUpperCase():'');
  const changes=[e.degree?label+' −'+e.degree:'',e.slow?'Deslocamento pela metade':'',['acelerado','super-acelerado'].includes(e.key)?'Iniciativa +'+(e.key==='super-acelerado'?4:2)+' · AGI dobrada para deslocamento':''].filter(Boolean);
  const m=illusionData(i),root=!!m?.root;
  return {id:i.id,condition:true,name:i.name,duration:durationLabel(r),sourceName:r.origin||'Mestre',source:[i.system.source?.id,i.system.source?.pages].filter(Boolean).join(' · '),summary:root?(m.category==='compulsao'?'Compulsão':'Aflição')+' · Dif '+m.difficulty+' · Chakra '+m.cost+' · '+(m.noticed?'Reconhecida':'Não reconhecida'):changes.join(' · ')||'Ver descrição.',description,note:r.note,problems:[],endLabel:'Encerrar',valid:true,illusion:!!m,illusionRoot:root,noticeAvailable:root&&m.category==='compulsao'&&!m.noticed&&m.starts>=2&&m.lastNoticeStart!==m.starts,kaiAvailable:root&&m.noticed&&Array.from(actor.items).some(x=>x.system.contentId==='sns:jutsu:kai'),manualIllusionTurn:root&&!m.combatId};
 });
}
export function conditionApplicationPlan(items,id){
 const active=Array.from(items??[]).filter(i=>isManagedCondition(i)&&i.system.appliedCondition.active),has=key=>active.some(i=>i.system.contentId==='sns:condition:'+key);
 if(id==='sns:condition:fatigado'&&has('exausto')||id==='sns:condition:exausto'&&has('exausto'))return {contentId:'sns:condition:inconsciente',end:[]};
 if(id==='sns:condition:fatigado'&&has('fatigado'))return {contentId:'sns:condition:exausto',end:active.filter(i=>i.system.contentId==='sns:condition:fatigado').map(i=>i.id)};
 return {contentId:id,end:[]};
}
