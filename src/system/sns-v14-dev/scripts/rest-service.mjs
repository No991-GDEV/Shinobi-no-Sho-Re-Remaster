import {REST_LABEL,restRecovery,endsAtRest,restBlock} from './rest-core.mjs';
import {actorCombat} from './effect-duration.mjs';
import {endActorScene,isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {transformationState} from './transformation-core.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev',pending=new WeakMap();
const card=(actor,body)=>'<section class="sns-technique-card sns-rest-card"><header class="sns-technique-title"><i class="fa-solid fa-bed" aria-hidden="true"></i><strong>'+REST_LABEL+'</strong></header>'+body+'</section>';
function validate(actor){restRecovery(actor);if(actorCombat(actor))throw Error('Encerre a participação no combate antes de descansar.');const block=restBlock(actor);if(block)throw Error(block);}
export async function requestRest(actor){
 if(!actor?.isOwner)throw Error('Você precisa controlar esta ficha.');if(!game.users.activeGM)throw Error('Um mestre ativo precisa acompanhar o descanso.');validate(actor);
 if(pending.has(actor))return pending.get(actor);
 const task=(async()=>{
  const request=await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),whisper:[...new Set([game.user.id,game.users.activeGM.id])],content:card(actor,'<p>Concluindo o descanso…</p>'),flags:{[ns]:{restRequest:{actorUuid:actor.uuid,version:1}}}});
  if(isTimekeeper())await processRest(request);
  if(request.getFlag(ns,'restResult'))return request;
  await new Promise((resolve,reject)=>{let timer;const finish=()=>{if(!request.getFlag(ns,'restResult'))return;Hooks.off('updateChatMessage',hook);clearTimeout(timer);resolve();};const hook=Hooks.on('updateChatMessage',m=>{if(m.uuid===request.uuid)finish();});timer=setTimeout(()=>{Hooks.off('updateChatMessage',hook);reject(Error('O descanso aguarda o mestre. Confira a mensagem antes de tentar novamente.'));},15000);finish();});
  return request;
 })();pending.set(actor,task);try{return await task;}finally{pending.delete(actor);}
}
export async function processRest(message){
 if(!isTimekeeper()||!message.getFlag(ns,'restRequest')||message.getFlag(ns,'restResult'))return;
 return withEffectLock(message,async()=>{
  if(message.getFlag(ns,'restResult'))return;
  let actor;try{
   const r=message.getFlag(ns,'restRequest');actor=await fromUuid(r.actorUuid);
   if(r.version!==1||!actor?.testUserPermission(message.author,'OWNER'))throw Error('Pedido de descanso sem permissão para esta ficha.');
   const previous=actor.getFlag(ns,'rests')?.[message.id];if(previous){await message.update({['flags.'+ns+'.restResult']:previous,content:card(actor,restSummary(previous))});return;}
   validate(actor);
   const activeBefore=Array.from(actor.items).filter(i=>i.system.appliedCondition?.active).map(i=>i.id);
   await endActorScene(actor);
   const {restTransformation}=await import('./transformation-techniques.mjs');for(const row of transformationState(actor).entries)await restTransformation(actor,row.sourceId);
   // Use the existing linked-state cleanup so durations, children and pending saves stop together.
   const {endAdvancedState}=await import('./advanced-service.mjs');
   for(const item of actor.items.filter(endsAtRest))if(item.flags?.[ns]?.advancedState)await endAdvancedState(item,'Descanso completo.');
   const at=new Date().toISOString(),ordinary=actor.items.filter(endsAtRest);
   if(ordinary.length)await actor.updateEmbeddedDocuments('Item',ordinary.map(i=>({_id:i.id,'system.appliedCondition.active':false,'system.appliedCondition.endedAt':at})));
   const result=await withEffectLock(actor,async()=>{
    // Read again after transformations end; the original resources and maxima are preserved.
    const committed=actor.getFlag(ns,'rests')?.[message.id];if(committed)return committed;
    const recovery=restRecovery(actor),ended=activeBefore.filter(id=>!actor.items.get(id)?.system.appliedCondition?.active).length;
    const result={status:'done',...recovery,ended,at,user:message.author.id};
    await actor.update({'system.resources.vitality.value':recovery.vitality.after,'system.resources.chakra.value':recovery.chakra.after,['flags.'+ns+'.rests.'+message.id]:result});return result;
   });
   await message.update({['flags.'+ns+'.restResult']:result,content:card(actor,restSummary(result))});
  }catch(e){const committed=actor?.getFlag(ns,'rests')?.[message.id];if(committed){await message.update({['flags.'+ns+'.restResult']:committed,content:card(actor,restSummary(committed))});return;}await message.update({['flags.'+ns+'.restResult']:{status:'blocked',reason:e.message},content:card(actor,'<p>'+esc(e.message)+'</p>')});ui.notifications.warn(e.message);}
 });
}
function restSummary(r){return '<div class="sns-rest-recovery"><span><i class="fa-solid fa-heart"></i> Vitalidade <strong>+'+r.vitality.gain+'</strong><small>'+r.vitality.before+' → '+r.vitality.after+'</small></span><span><i class="fa-solid fa-circle-dot"></i> Chakra <strong>+'+r.chakra.gain+'</strong><small>'+r.chakra.before+' → '+r.chakra.after+'</small></span></div><p>'+r.ended+' efeito(s) encerrado(s).'+(r.metabolism?' Metabolismo Rápido aplicado.':'')+'</p>';}
export function installRestHooks(){
 Hooks.on('snsProcessorReady',()=>{for(const m of game.messages){void processRest(m).catch(console.error);void processSceneEnd(m).catch(console.error);}});
 Hooks.on('createChatMessage',m=>{void processRest(m).catch(console.error);void processSceneEnd(m).catch(console.error);});
 Hooks.on('preUpdateChatMessage',(m,changes,options,userId)=>{const result=foundry.utils.expandObject(changes)?.flags?.[ns]?.restResult;if(m.getFlag(ns,'restResult')&&result&&JSON.stringify(result)!==JSON.stringify(m.getFlag(ns,'restResult')))return false;if(game.users.get(userId)?.isGM)return;if(m.getFlag(ns,'restRequest')&&['flags','author','speaker','rolls','content','-=flags'].some(k=>Object.hasOwn(foundry.utils.expandObject(changes),k)))return false;});
}

export async function requestSceneEnd(actor){
 if(!game.user.isGM||!actor.isOwner||!game.users.activeGM)throw Error('Um mestre conectado precisa encerrar a cena.');
 return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),whisper:[...new Set([game.user.id,game.users.activeGM.id])],content:'Encerrando efeitos de cena…',flags:{[ns]:{sceneEndRequest:{actorUuid:actor.uuid}}}});
}
async function processSceneEnd(message){
 if(!isTimekeeper()||!message.getFlag(ns,'sceneEndRequest')||message.getFlag(ns,'sceneEndResult'))return;
 return withEffectLock(message,async()=>{if(message.getFlag(ns,'sceneEndResult'))return;try{const actor=await fromUuid(message.getFlag(ns,'sceneEndRequest').actorUuid);if(!message.author?.isGM||!actor?.isOwner)throw Error('Somente o mestre encerra a cena desta ficha.');const result=await endActorScene(actor);await message.update({content:'Cena encerrada · '+result.conditions+' condição(ões), '+result.aptitudes+' aptidão(ões).',['flags.'+ns+'.sceneEndResult']:result});}catch(e){await message.update({content:e.message,['flags.'+ns+'.sceneEndResult']:{status:'blocked'}});}});
}
