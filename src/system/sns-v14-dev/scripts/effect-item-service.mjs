import {isProcessor} from './processor-authority.mjs';
import {virtualEffectRows} from './effect-item-sources.mjs';
import {effectBinding} from './effect-item-rules.mjs';
import {activationRows,activationChange} from './active-aptitudes.mjs';
import {durationClock,actorCombat} from './effect-duration.mjs';
const ns='sns-v14-dev',queues=new WeakMap(),ending=new WeakMap();
export const bindingKey=row=>row.temporaryTechnique?'arm:'+row.sourceId+':'+row.technique:row.transformation?'transformation:'+row.sourceId+':'+(row.buff||'mode'):'activation:'+row.id;
export function effectItemPlan(actor,at=new Date().toISOString()){
 const live=new Map(virtualEffectRows(actor).filter(row=>row.hasSource).map(row=>[bindingKey(row),row])),creates=[],updates=[],seen=new Set();
 for(const item of actor.items??[]){
  const binding=effectBinding(item);if(!binding)continue;
  const row=live.get(binding.key),active=!!row&&!seen.has(binding.key);seen.add(binding.key);
  const r=item.system.appliedCondition,snapshot=row?{summary:row.summary,duration:row.duration,sourceName:row.sourceName,source:row.source,endLabel:row.endLabel,problems:row.problems??[]}:binding.snapshot;
  const update={_id:item.id};
  if(JSON.stringify(snapshot)!==JSON.stringify(binding.snapshot))update['flags.'+ns+'.effectBinding.snapshot']=snapshot;
  if(r.active!==active){update['system.appliedCondition.active']=active;update['system.appliedCondition.endedAt']=active?'':at;
   if(active){update['system.appliedCondition.appliedAt']=at;try{update['system.appliedCondition.durationClock']=durationClock(r.durationRule,actorCombat(actor),r.durationRule?.anchor==='caster'?r.casterUuid:actor.uuid);}catch{update['system.appliedCondition.durationRule']={mode:'manual'};update['system.appliedCondition.durationClock']={};}}
  }
  if(Object.keys(update).length>1)updates.push(update);
 }
 for(const [key,row] of live){if(seen.has(key))continue;const source=actor.items.get(row.sourceId);
  creates.push({name:row.name,type:'effect',img:row.img||source?.img||'icons/svg/aura.svg',system:{description:'<p>'+String(row.description??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')+'</p>',source:{id:row.source??''},appliedCondition:{managed:true,active:true,origin:row.sourceName??'',sourceUuid:source?.uuid??'',duration:row.duration??'',durationRule:{mode:'manual'},appliedAt:at}},flags:{[ns]:{effectBinding:{version:1,key,kind:row.temporaryTechnique?'arm':row.transformation?'transformation':'activation',sourceId:row.sourceId,activationId:row.id,buff:row.buff??'',technique:row.technique??'',snapshot:{summary:row.summary,duration:row.duration,sourceName:row.sourceName,source:row.source,endLabel:row.endLabel,problems:row.problems??[]}}}}});
 }
 return {creates,updates};
}
export function reconcileEffectItems(actor){
 if(!isProcessor()||!actor?.isOwner||actor.pack)return Promise.resolve();
 const task=(queues.get(actor)??Promise.resolve()).catch(()=>{}).then(async()=>{
  if(!isProcessor())return;const plan=effectItemPlan(actor);
  if(plan.creates.length)await actor.createEmbeddedDocuments('Item',plan.creates,{snsEffectItems:true});
  if(plan.updates.length)await actor.updateEmbeddedDocuments('Item',plan.updates,{snsEffectItems:true});
  return plan;
 });queues.set(actor,task);return task;
}
// Caller may already hold the effect clock lock. No recursive acquisition here.
export async function endBoundEffect(item){
 if(ending.has(item))return ending.get(item);
 const task=endBoundEffectOnce(item);ending.set(item,task);try{return await task;}finally{ending.delete(item);}
}
async function endBoundEffectOnce(item){
 const actor=item?.actor,binding=effectBinding(item);if(!binding||!actor?.isOwner)throw Error('Efeito ou personagem indisponível.');
 if(!isProcessor())return requestEffectEnd(item);
 if(!item.system.appliedCondition.active)return false;
 if(binding.kind==='activation'){
  const row=activationRows(actor).find(r=>r.id===binding.activationId);
  if(row?.active){const change=activationChange(actor,row,false,{user:game.user.id,at:new Date().toISOString()}),rows=Array.from(actor.system.activeAptitudes??[]).map(r=>r.id===row.id?change.row:r);if(!rows.some(r=>r.id===row.id))rows.push(change.row);await actor.update({'system.activeAptitudes':rows});}
 }else if(binding.kind==='transformation'){
  const {transformationState}=await import('./transformation-core.mjs'),state=transformationState(actor).entries.find(r=>r.sourceId===binding.sourceId);
  if(state&&(binding.buff?state.buffs?.includes(binding.buff):state.mode!=='normal'))await (await import('./transformation-service.mjs')).changeTransformation(actor,{sourceId:binding.sourceId,...(binding.buff?{buff:binding.buff}:{mode:'normal'})});
 }else if(binding.kind==='arm'){
  const {transformationState}=await import('./transformation-core.mjs'),row=transformationState(actor).entries.find(r=>r.sourceId===binding.sourceId);
  if(row?.arms?.some(a=>a.id===binding.technique))await (await import('./transformation-techniques.mjs')).useTransformationTechnique(actor,binding.sourceId,binding.technique,{variant:'retract'});
 }
 await item.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()},{snsEffectItems:true});
 await reconcileEffectItems(actor);return true;
}
async function requestEffectEnd(item){
 if(!game.users.activeGM)throw Error('Um mestre precisa estar conectado para encerrar este efeito.');
 return foundry.documents.ChatMessage.create({whisper:[game.users.activeGM.id,game.user.id],content:'<p>Encerrar efeito.</p>',flags:{[ns]:{effectItemRequest:{itemUuid:item.uuid}}}});
}
const requests=new WeakSet();
export async function processEffectItemRequest(message){
 const request=message.getFlag(ns,'effectItemRequest');if(!isProcessor()||!request||message.getFlag(ns,'effectItemResult')||requests.has(message))return;
 requests.add(message);try{
  let result;try{const item=await fromUuid(request.itemUuid);if(!item?.actor?.testUserPermission(message.author,'OWNER'))throw Error('O autor não controla esta ficha.');await endBoundEffect(item);result={ok:true};}catch(e){result={ok:false,reason:e.message};}
  await message.update({['flags.'+ns+'.effectItemResult']:result,content:result.ok?'<p>Efeito encerrado.</p>':'<p>Não foi possível encerrar o efeito.</p>'});
 }finally{requests.delete(message);}
}
export function installEffectItemHooks(){
 const schedule=actor=>reconcileEffectItems(actor).catch(e=>console.error('SNS · efeitos como itens',e));
 Hooks.on('snsProcessorReady',()=>{if(isProcessor()){import('./effect-lifecycle.mjs').then(m=>m.clockActors().forEach(schedule));for(const message of game.messages)void processEffectItemRequest(message).catch(console.error);}});
 Hooks.on('createActor',schedule);
 Hooks.on('updateActor',(actor,changes,options)=>{if(!options.snsEffectItems&&/activeAptitudes|transformations|attributes/.test(JSON.stringify(changes)))schedule(actor);});
 for(const hook of ['createItem','updateItem','deleteItem'])Hooks.on(hook,(item,data,options)=>{if(item.actor&&!options?.snsEffectItems&&!data?.snsEffectItems&&!effectBinding(item))schedule(item.actor);});
 Hooks.on('createChatMessage',message=>{void processEffectItemRequest(message).catch(console.error);});
 Hooks.on('preUpdateChatMessage',(message,changes,options,userId)=>{const result=foundry.utils.expandObject(changes)?.flags?.[ns]?.effectItemResult;if(message.getFlag(ns,'effectItemResult')&&result&&JSON.stringify(result)!==JSON.stringify(message.getFlag(ns,'effectItemResult')))return false;if(!game.users.get(userId)?.isGM&&message.getFlag(ns,'effectItemRequest'))return false;});
}
