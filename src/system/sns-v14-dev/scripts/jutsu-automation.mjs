import {castUndone} from './cast-undo-core.mjs';
import {actorMessages} from './message-index.mjs';
import {readJutsuUse,resolveJutsuEffects,isResolver} from './jutsu-application.mjs';
import {effectPending,jutsuDamageStates} from './jutsu-damage-trigger.mjs';
import {effectRows,needsHit,needsResistance} from './jutsu-outcomes.mjs';
import {beginDefenseDeclaration} from './defense-workflow.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev',working=new Set(),again=new Set();
export function automaticEffectDecisions(use,defenses,damages={}){
 const decisions={};
 for(const row of effectRows(use)){
  if(!effectPending(use,row.key))continue;
  const result=defenses?.[row.target.uuid.replaceAll('.','~')];
  if(needsHit(row.binding)&&!['hit','miss'].includes(result?.hit))continue;
  if(!needsResistance(row.binding)||result?.hit==='miss'||row.binding.requiresDamage&&damages[row.target.uuid]==='none')decisions[row.key]={...(needsHit(row.binding)?{hit:result.hit}:{})};
 }
 return decisions;
}
export function resistanceGroups(use,defenses,damages={}){
 const groups=new Map();
 for(const row of effectRows(use)){
  if(!effectPending(use,row.key)||!needsResistance(row.binding)||row.binding.requiresDamage&&damages[row.target.uuid]!=='taken')continue;
  const hit=defenses?.[row.target.uuid.replaceAll('.','~')]?.hit;
  if(needsHit(row.binding)&&hit!=='hit')continue;
  const signature=[row.target.uuid,row.binding.resistance,row.dc,!!row.binding.optionalResistance].join('|');
  let group=groups.get(signature);if(!group){group={id:row.key,target:row.target,key:row.binding.resistance,dc:row.dc,optional:!!row.binding.optionalResistance,rows:[]};groups.set(signature,group);}group.rows.push(row);
 }
 return [...groups.values()];
}
export async function processJutsuAutomation(message){
 if(!isResolver()||castUndone(message)||!message?.getFlag(ns,'jutsuUse'))return;
 if(working.has(message.uuid)){again.add(message.uuid);return;}
 working.add(message.uuid);
 try{
  do{again.delete(message.uuid);await resolveAutomatic(message);}while(again.delete(message.uuid));
 }finally{working.delete(message.uuid);}
}
async function resolveAutomatic(message){
 const {use,item,actor,projection}=await readJutsuUse(message),defenses=message.getFlag(ns,'defenseResults')??{};
 if(projection.magen){const {resolveMagenImmunities}=await import('./magen-service.mjs');await resolveMagenImmunities(message,use,projection.magen);}
 for(const row of effectRows(use)){
  const result=use.results[row.key];if(!row.binding.requiresDamage||!result?.damageRecordId||result.status==='damageUndone')continue;
  const target=await fromUuid(row.target.uuid),record=target?.getFlag(ns,'damageLedger')?.[result.damageRecordId];
  if(record?.status!=='undone')continue;
  const condition=result.itemUuid&&await fromUuid(result.itemUuid);
  if(condition?.system?.appliedCondition?.active&&condition.system.appliedCondition.applicationKey===message.uuid+'#'+row.key+'#'+record.id)await condition.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()});
  use.results[row.key]={...result,status:'damageUndone'};await message.update({['flags.'+ns+'.jutsuUse.results.'+row.key]:use.results[row.key]});
 }
 const damages=await jutsuDamageStates(message,use),immediate=automaticEffectDecisions(use,defenses,damages);
 if(Object.keys(immediate).length)await resolveJutsuEffects(message,immediate);
 const current=await readJutsuUse(message);
 for(const group of resistanceGroups(current.use,defenses,damages)){
  const stored=message.getFlag(ns,'effectResistances')?.[group.id];
  if(stored?.messageUuid){
   const child=await fromUuid(stored.messageUuid),outcome=child?.getFlag(ns,'defenseResults')?.[group.target.uuid.replaceAll('.','~')];
   if(!outcome||!['hit','miss'].includes(outcome.hit))continue;
   const decisions=Object.fromEntries(group.rows.map(row=>[row.key,{hit:'hit',resistance:outcome.hit==='hit'?'failed':'passed',resistanceRoll:outcome.roll}]));
   await resolveJutsuEffects(message,decisions);continue;
  }
  const profile={base:0,fixed:0,nature:'lethal',criticalAt:15,noDamage:true,attackKind:'resistance',resistance:{keys:[group.key],difficulty:group.dc,optional:group.optional}};
  const target=await fromUuid(group.target.uuid);if(!target?.isOwner)throw Error('Alvo da resistência não está disponível.');
  const source={uuid:item.uuid,name:'Resistência · '+use.name};
  let declaration=stored?.requestUuid?await fromUuid(stored.requestUuid):null;
  if(!declaration){
   declaration=await beginDefenseDeclaration(actor,source,profile,[{actor:target,name:group.target.name}],{parentUuid:message.uuid,groupId:group.id});
   if(!declaration)return;
   await message.update({['flags.'+ns+'.effectResistances.'+group.id]:{requestUuid:declaration.uuid,messageUuid:''}});
  }
  const request=declaration.getFlag(ns,'defenseRequest');
  if(!declaration.author?.isGM||request.actorUuid!==actor.uuid||request.itemUuid!==item.uuid||JSON.stringify(request.profile)!==JSON.stringify(profile)||request.status==='cancelled')continue;
  if(!request.targets.every(t=>request.responses[t.uuid.replaceAll('.','~')]))continue;
  const child=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:'<strong>Resistência · '+esc(use.name)+'</strong><p>'+esc(group.target.name)+' · Dif '+group.dc+'</p>',flags:{[ns]:{jutsuSecondary:{parentUuid:message.uuid,groupId:group.id},damageUse:{version:1,actorUuid:actor.uuid,itemUuid:item.uuid,name:source.name,profile,targets:request.targets,attack:null,defenseRequestUuid:declaration.uuid}}}});
  await message.update({['flags.'+ns+'.effectResistances.'+group.id]:{requestUuid:declaration.uuid,messageUuid:child.uuid}});
 }
}
export function installJutsuAutomationHooks(){
 const process=async message=>{
  if(!isResolver())return;
  const link=message.getFlag(ns,'jutsuSecondary')??message.getFlag(ns,'jutsuResistanceRequest');
  const parent=link&&message.author?.isGM?await fromUuid(link.parentUuid):message;
  if(parent?.getFlag(ns,'jutsuUse'))await processJutsuAutomation(parent);
 };
 for(const hook of ['createChatMessage','updateChatMessage'])Hooks.on(hook,message=>process(message).catch(e=>console.warn('SNS · efeitos automáticos',e.message)));
 Hooks.on('updateActor',(actor,changes)=>{if(!isResolver()||!JSON.stringify(changes).includes('damageLedger'))return;for(const message of actorMessages(actor.uuid)){const use=message.getFlag(ns,'jutsuUse');if(use?.bindings.some(b=>b.requiresDamage)&&use.targets.some(t=>t.uuid===actor.uuid))process(message).catch(console.warn);}});
 Hooks.on('snsProcessorReady',()=>{if(isResolver())for(const message of game.messages)if(message.getFlag(ns,'effectResistances')||message.getFlag(ns,'jutsuUse')?.bindings.some(b=>b.requiresDamage))process(message).catch(console.warn);});
}
