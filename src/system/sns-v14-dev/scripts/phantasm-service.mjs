import {ensureEnvironmentVisual} from './environment-vision.mjs';
import {activePhantasms,unusedSpeedPhantasms,speedUsedThisRound,phantasmData,phantasmKey,observationPlan,phantasmVisualOutcome} from './phantasm-core.mjs';
import {sceneEpoch} from './magen-core.mjs';
import {chakraVision} from './magen-service.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {actorCombat,durationRule,durationClock} from './effect-duration.mjs';
import {jutsuProjection} from './item-view.mjs';
import {techniqueCard} from './technique-card.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev',working=new Set();
function awaitDocument(message,test){return new Promise(resolve=>{const check=()=>{if(test()){Hooks.off('updateChatMessage',hook);resolve(message);}};const hook=Hooks.on('updateChatMessage',m=>{if(m.uuid===message.uuid)check();});check();});}
const supported=actor=>actor&&['shinobi','npc','companion'].includes(actor.type);
function liveProjection(root){const meta=phantasmData(root),item=root?.actor?.items.get(meta?.sourceId),projection=item&&jutsuProjection(item,{usedLevel:meta.usedLevel});return root?.system.appliedCondition.active&&projection?.valid&&projection.phantasm?.effectId===meta.effectId&&projection.phantasm.stage>=meta.stage?projection:null;}
export async function activatePhantasm(actor,item,projection){
 if(!game.users.activeGM)throw Error('Um mestre ativo precisa acompanhar a ilusão.');
 const message=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:techniqueCard(item,projection),flags:{[ns]:{check:{actorImg:actor.img,key:'jutsu'},phantasmActivation:{actorUuid:actor.uuid,itemUuid:item.uuid,usedLevel:projection.usedLevel,status:'pending'}}}});
 await awaitDocument(message,()=>message.getFlag(ns,'phantasmActivation').status!=='pending');
 const result=message.getFlag(ns,'phantasmActivation');if(result.status==='blocked')ui.notifications.warn(result.reason);return message;
}
async function resolveActivation(message){
 const req=message.getFlag(ns,'phantasmActivation');if(!req||req.status!=='pending')return;
 const actor=await fromUuid(req.actorUuid),item=await fromUuid(req.itemUuid);
 if(!supported(actor)||item?.actor!==actor||!actor.testUserPermission(message.author,'OWNER'))throw Error('Origem da ilusão inválida.');
 await withEffectLock(actor,async()=>{
  if(message.getFlag(ns,'phantasmActivation').status!=='pending')return;
  const projection=jutsuProjection(item,{usedLevel:req.usedLevel}),meta=projection?.phantasm;
  if(!projection?.valid||!meta||item.system.targetEffects.length)throw Error('Verifique os requisitos da ilusão. Efeitos personalizados são resolvidos pelo mestre.');
  let root=actor.items.find(i=>phantasmData(i)?.activationUuid===message.uuid);
  if(!root&&activePhantasms(actor).some(i=>phantasmData(i).effectId===meta.effectId))throw Error('Este Fantasma já está ativo. Encerre-o antes de fazer outro uso.');
  const paid=actor.getFlag(ns,'phantasmActivations')?.[message.id],current=actor.system.resources.chakra.value;
  if(paid&&(paid.cost!==projection.cost||paid.usedLevel!==undefined&&paid.usedLevel!==projection.usedLevel))throw Error('Esta ativação já foi paga com outro nível.');
  if(!paid){const combat=actorCombat(actor);if(meta.effectId.endsWith(':falsa-velocidade')&&speedUsedThisRound(actor,combat))throw Error('Fintar só pode ser usado uma vez por rodada.');if(!Number.isInteger(current)||current<projection.cost)throw Error('Chakra insuficiente para a ilusão.');await actor.update({'system.resources.chakra.value':current-projection.cost,['flags.'+ns+'.phantasmActivations.'+message.id]:{cost:projection.cost,usedLevel:projection.usedLevel,itemUuid:item.uuid,effectId:meta.effectId,combatId:combat?.id??'',round:combat?.round??0}});}
  if(!root){
   const speed=meta.effectId.endsWith(':falsa-velocidade'),combat=actorCombat(actor),rule=speed&&combat?durationRule({mode:'turns',turns:1,phase:'end',anchor:'recipient'}):durationRule({mode:'manual'});
   [root]=await actor.createEmbeddedDocuments('Item',[{name:projection.effect.name,type:'effect',img:'icons/svg/eye.svg',system:{contentId:'sns:state:fantasma',description:projection.effect.text,source:projection.effect.source,appliedCondition:{managed:true,active:true,scope:'all',origin:item.name,sourceUuid:item.uuid,casterUuid:actor.uuid,duration:projection.data.duration,durationRule:rule,durationClock:durationClock(rule,combat,actor.uuid),applicationKey:message.uuid,appliedBy:game.user.id,appliedAt:new Date().toISOString(),endedAt:'',note:speed?'Fintado somente contra o próximo ataque deste usuário. Um inimigo e uma finta por rodada; até o fim deste turno.':'Camuflagem: resolva para cada inimigo.'}},flags:{[ns]:{phantasm:{version:1,...meta,usedLevel:projection.usedLevel,sourceId:item.id,activationUuid:message.uuid,observers:{}}}}}]);
   if(!root)throw Error('Não foi possível registrar o efeito.');
  }
  await message.update({['flags.'+ns+'.phantasmActivation']:{...req,status:'active',rootUuid:root.uuid,cost:projection.cost}});
 });
}
export async function requestPhantasmEnd(root){return foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor:root.actor}),whisper:[game.users.activeGM.id],content:'Encerrar '+esc(root.name),flags:{[ns]:{phantasmEnd:{rootUuid:root.uuid}}}});}
export async function endPhantasm(root){if(!isTimekeeper()||!phantasmData(root))return;await root.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()});}
export async function prepareAttackPhantasms(actor,item,profile,targets){
 if(profile?.resistance||!profile||!targets.length||!unusedSpeedPhantasms(actor).length&&!targets.some(t=>activePhantasms(t.actor).some(i=>phantasmData(i).effectId.endsWith(':falsa-posicao'))))return '';
 if(unusedSpeedPhantasms(actor).length&&targets.length>1)throw Error('Falsa Velocidade usa a manobra Fintar contra um único inimigo.');
 if(profile.followups||profile.ricochet)throw Error('Fantasmas com Míssil ou Ricochete ainda exigem resolução do mestre; a sequência automática foi interrompida antes de rolar.');
 if(!game.users.activeGM)throw Error('Um mestre ativo precisa acompanhar os Fantasmas.');
 const message=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),whisper:[game.user.id,game.users.activeGM.id],content:'Escolhendo defesas contra a ilusão.',flags:{[ns]:{phantasmAttack:{actorUuid:actor.uuid,itemUuid:item?.uuid??'',name:item?.name??'Ataque',targets:targets.map(t=>({uuid:t.actor.uuid,name:t.name??t.actor.name})),status:'pending',contexts:{}}}}});
 await awaitDocument(message,()=>message.getFlag(ns,'phantasmAttack').status!=='pending');if(message.getFlag(ns,'phantasmAttack').status!=='resolved')throw Error(message.getFlag(ns,'phantasmAttack').reason??'Declaração interrompida.');return message.uuid;
}
async function observe(root,observer,{afterHit=false,attackUuid=''}={}){
 if(!liveProjection(root))return {noticed:true,reason:'Ilusão encerrada ou origem indisponível.'};
 const meta=structuredClone(phantasmData(root)),prior=meta.observers[phantasmKey(observer.uuid)],plan=observationPlan(meta,observer,{vision:chakraVision(observer),afterHit});
 let noticed=plan.noticed,rollUuid='';
 if(!plan.automatic){
  const {declareDefenses}=await import('./defense-workflow.mjs'),profile={base:0,fixed:0,nature:'lethal',criticalAt:15,noDamage:true,attackKind:'resistance',phantasmNotice:true,resistance:{keys:['attribute:int'],difficulty:plan.difficulty}},source=root.actor.items.get(meta.sourceId),uuid=await declareDefenses(root.actor,source,profile,[{actor:observer,name:observer.name}]);
  if(!uuid)throw Error('Teste de Notar Genjutsu cancelado.');const request=await fromUuid(uuid),r=request.getFlag(ns,'defenseRequest');
  const check=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor:root.actor}),content:'<div class="sns-technique-card"><strong>Notar Genjutsu · '+esc(root.name)+'</strong><p>'+esc(observer.name)+' · Inteligência · Dif '+plan.difficulty+'</p></div>',flags:{[ns]:{phantasmNotice:{rootUuid:root.uuid,observerUuid:observer.uuid,attackUuid},damageUse:{version:1,actorUuid:root.actor.uuid,itemUuid:source.uuid,name:source.name,profile,targets:r.targets,attack:null,defenseRequestUuid:uuid}}}});
  await awaitDocument(check,()=>['hit','miss'].includes(check.getFlag(ns,'defenseResults')?.[phantasmKey(observer.uuid)]?.hit));const result=check.getFlag(ns,'defenseResults')[phantasmKey(observer.uuid)];noticed=result.hit==='miss';rollUuid=result.replyUuid;await request.update({['flags.'+ns+'.phantasmNoticeResult']:{noticed,rollUuid}});
 }
 if(!plan.automatic||!prior){
  meta.observers[phantasmKey(observer.uuid)]={uuid:observer.uuid,name:observer.name,noticed:!!noticed,attempts:(prior?.attempts??0)+(plan.automatic?0:1),rollUuid,reason:plan.reason??'',at:new Date().toISOString()};await root.update({['flags.'+ns+'.phantasm']:meta});
  if(!noticed)await observer.update({['flags.'+ns+'.phantasmMemory.'+meta.effectId.split(':').at(-1)]:{epoch:sceneEpoch(observer),effectId:meta.effectId,cause:root.uuid}});
 }
 return {noticed:!!noticed,reason:plan.reason??'',rollUuid,rootUuid:root.uuid,threshold:noticed?0:meta.threshold,fintado:!noticed&&meta.effectId.endsWith(':falsa-velocidade'),stage:meta.stage};
}
async function resolveAttack(message){
 const r=message.getFlag(ns,'phantasmAttack');if(!r||r.status!=='pending')return;
 const actor=await fromUuid(r.actorUuid);if(!supported(actor)||!actor.testUserPermission(message.author,'OWNER')||!Array.isArray(r.targets)||r.targets.length>50||new Set(r.targets.map(t=>t.uuid)).size!==r.targets.length)throw Error('Declaração de interação inválida.');
 const contexts={};for(const ref of r.targets){const target=await fromUuid(ref.uuid);if(!supported(target))throw Error('Observador indisponível.');let context={};
  for(const root of unusedSpeedPhantasms(actor))context.speed=await withEffectLock(root,async()=>{if(phantasmData(root).usedAttackUuid)return {};const result=await observe(root,target);await root.update({['flags.'+ns+'.phantasm.usedAttackUuid']:message.uuid,['flags.'+ns+'.phantasm.targetUuid']:target.uuid});return result;});
  for(const root of activePhantasms(target).filter(i=>phantasmData(i).effectId.endsWith(':falsa-posicao')))context.position=await withEffectLock(root,()=>observe(root,actor));
  contexts[phantasmKey(target.uuid)]=context;
 }const proof=await foundry.documents.ChatMessage.create({whisper:[game.user.id],content:'Interações de Fantasma resolvidas.',flags:{[ns]:{phantasmResolution:{requestUuid:message.uuid,actorUuid:r.actorUuid,itemUuid:r.itemUuid,targets:r.targets,contexts}}}});await message.update({['flags.'+ns+'.phantasmAttack']:{...r,status:'resolved',proofUuid:proof.uuid}});
}
export async function attackPhantasmContext(request,actor){
 const r=request.getFlag(ns,'defenseRequest');if(!r?.phantasmUuid)return {};
 const source=await fromUuid(r.phantasmUuid),state=source?.getFlag(ns,'phantasmAttack'),proof=state?.proofUuid&&await fromUuid(state.proofUuid),resolved=proof?.getFlag(ns,'phantasmResolution');if(state?.status!=='resolved'||!proof?.author?.isGM||resolved?.requestUuid!==source.uuid||resolved.actorUuid!==r.actorUuid||resolved.itemUuid!==r.itemUuid||JSON.stringify(resolved.targets.map(t=>t.uuid))!==JSON.stringify(r.targets.map(t=>t.uuid)))throw Error('Interação de Fantasma inválida.');return resolved.contexts[phantasmKey(actor.uuid)]??{};
}
export async function ensurePhantasmVisual(message,targetUuid){
 const environment=await ensureEnvironmentVisual(message,targetUuid);if(environment!=='clear')return environment;
 const packet=message.getFlag(ns,'damageUse');if(!packet?.defenseRequestUuid||!packet.attack)return 'clear';const request=await fromUuid(packet.defenseRequestUuid),context=await attackPhantasmContext(request,{uuid:targetUuid}),position=context.position;
 if(!position?.threshold)return 'clear';let result=message.getFlag(ns,'phantasmVisual')?.[phantasmKey(targetUuid)];
 if(result){const proof=result.proofUuid&&await fromUuid(result.proofUuid),data=proof?.getFlag(ns,'phantasmVisualProof');if(!proof?.author?.isGM||data?.attackUuid!==message.uuid||data.targetUuid!==targetUuid||data.threshold!==position.threshold||data.rootUuid!==position.rootUuid)result=null;else result=data;}
 if(!result&&isTimekeeper())await withEffectLock(message,async()=>{
  const stored=message.getFlag(ns,'phantasmVisual')?.[phantasmKey(targetUuid)],proof=stored?.proofUuid&&await fromUuid(stored.proofUuid),data=proof?.getFlag(ns,'phantasmVisualProof');if(proof?.author?.isGM&&data?.attackUuid===message.uuid&&data.targetUuid===targetUuid&&data.rootUuid===position.rootUuid&&data.threshold===position.threshold){result=data;return;}
  let natural=null,rollUuid='';const initial=phantasmVisualOutcome(packet.attack,packet.profile.criticalAt,position.threshold,null);
  let location=null;if(initial==='pending'){const storedLocation=message.getFlag(ns,'phantasmLocation')?.[phantasmKey(targetUuid)],locationProof=storedLocation?.proofUuid&&await fromUuid(storedLocation.proofUuid),data=locationProof?.getFlag(ns,'phantasmLocationProof');if(locationProof?.author?.isGM&&data?.attackUuid===message.uuid&&data.targetUuid===targetUuid)location=data.mode;if(!location){result=null;return;}}
  if(initial==='pending'&&location==='approximate'){const roll=await new foundry.dice.Roll('1d8').evaluate();natural=roll.total;const child=await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor:await fromUuid(packet.actorUuid)}),flavor:'<strong>Falsa Posição · camuflagem '+(position.threshold===4?'total':'parcial')+'</strong><p>Erro com '+position.threshold+' ou menos</p>',flags:{[ns]:{phantasmCamouflage:{attackUuid:message.uuid,targetUuid}}}});rollUuid=child.uuid;}
  result={attackUuid:message.uuid,targetUuid,state:location==='unknown'?'miss':['sensor','area'].includes(location)?'clear':phantasmVisualOutcome(packet.attack,packet.profile.criticalAt,position.threshold,natural),location,natural,threshold:position.threshold,rootUuid:position.rootUuid,stage:position.stage,rollUuid,user:game.user.id};const proofMessage=await foundry.documents.ChatMessage.create({whisper:[game.user.id],content:'Erro de camuflagem resolvido.',flags:{[ns]:{phantasmVisualProof:result}}});await message.update({['flags.'+ns+'.phantasmVisual.'+phantasmKey(targetUuid)]:{...result,proofUuid:proofMessage.uuid}});
 });
 return result&&game.users.get(result.user)?.isGM?result.state:'pending';
}
async function observeAfterHit(message){
 const packet=message.getFlag(ns,'damageUse');if(!packet?.defenseRequestUuid)return;const request=await fromUuid(packet.defenseRequestUuid);
 for(const target of packet.targets){const key=phantasmKey(target.uuid),result=message.getFlag(ns,'defenseResults')?.[key];if(result?.hit!=='hit')continue;const done=message.getFlag(ns,'phantasmAfterHit')?.[key],proof=done?.proofUuid&&await fromUuid(done.proofUuid);if(proof?.author?.isGM&&proof.getFlag(ns,'phantasmObservationProof')?.attackUuid===message.uuid&&proof.getFlag(ns,'phantasmObservationProof')?.targetUuid===target.uuid)continue;
  const context=await attackPhantasmContext(request,{uuid:target.uuid});if(!context.position?.threshold)continue;
  const root=await fromUuid(context.position.rootUuid);if(!liveProjection(root))continue;const observer=await fromUuid(packet.actorUuid),outcome=await withEffectLock(root,()=>observe(root,observer,{afterHit:true,attackUuid:message.uuid}));const proofMessage=await foundry.documents.ChatMessage.create({whisper:[game.user.id],content:'Observação após acerto resolvida.',flags:{[ns]:{phantasmObservationProof:{attackUuid:message.uuid,targetUuid:target.uuid,outcome}}}});await message.update({['flags.'+ns+'.phantasmAfterHit.'+key]:{...outcome,proofUuid:proofMessage.uuid}});
 }
}
export async function resolvePhantasmLocation(message,targetUuid,mode){
 if(!isTimekeeper())throw Error('Somente o mestre pode definir a localização e as exceções de Sensor ou área.');
 const packet=message.getFlag(ns,'damageUse');if(!packet?.targets.some(t=>t.uuid===targetUuid)||!['approximate','sensor','unknown',...(packet.profile.attackKind==='area'?['area']:[])].includes(mode))throw Error('Contexto de localização inválido.');
 const request=await fromUuid(packet.defenseRequestUuid),context=await attackPhantasmContext(request,{uuid:targetUuid});if(!context.position?.threshold)throw Error('Este alvo não possui camuflagem de Falsa Posição.');
 if(message.getFlag(ns,'phantasmVisual')?.[phantasmKey(targetUuid)])return;
 const proof=await foundry.documents.ChatMessage.create({whisper:[game.user.id],content:'Localização definida.',flags:{[ns]:{phantasmLocationProof:{attackUuid:message.uuid,targetUuid,mode}}}});
 await message.update({['flags.'+ns+'.phantasmLocation.'+phantasmKey(targetUuid)]:{proofUuid:proof.uuid}});
}
export function installPhantasmHooks(){
 const process=async message=>{if(!isTimekeeper()||working.has(message.uuid))return;working.add(message.uuid);try{
  const end=message.getFlag(ns,'phantasmEnd');if(end&&!message.getFlag(ns,'phantasmEnded')){const root=await fromUuid(end.rootUuid);if(!phantasmData(root)||!root.actor.testUserPermission(message.author,'OWNER'))throw Error('Somente o usuário da ilusão pode encerrá-la.');await endPhantasm(root);await message.update({['flags.'+ns+'.phantasmEnded']:true});}
  const direction=message.getFlag(ns,'phantasmDirection');if(direction){const attack=await fromUuid(direction.attackUuid),result=attack?.getFlag(ns,'phantasmVisual')?.[direction.key],root=result&&await fromUuid(result.rootUuid);if(result?.state!=='miss'||result.stage<10||!root?.actor.testUserPermission(message.author,'OWNER')||typeof direction.direction!=='string'||!direction.direction.trim()||direction.direction.length>100)throw Error('Direção indisponível para este ataque.');if(!result.direction)await attack.update({['flags.'+ns+'.phantasmVisual.'+direction.key+'.direction']:direction.direction.trim()});}
  await resolveActivation(message);await resolveAttack(message);await observeAfterHit(message);
 }catch(e){const key=message.getFlag(ns,'phantasmActivation')?'phantasmActivation':message.getFlag(ns,'phantasmAttack')?'phantasmAttack':'';if(key)await message.update({['flags.'+ns+'.'+key+'.status']:'blocked',['flags.'+ns+'.'+key+'.reason']:e.message});ui.notifications.warn(e.message);}finally{working.delete(message.uuid);}};
 Hooks.on('createChatMessage',process);Hooks.on('updateChatMessage',process);
 Hooks.on('preUpdateChatMessage',(m,c,o,userId)=>{if(game.users.get(userId)?.isGM)return;const e=foundry.utils.expandObject(c),s=m.flags?.[ns]??{};if(['phantasmActivation','phantasmAttack','phantasmEnd','phantasmDirection','phantasmResolution','phantasmVisualProof','phantasmLocationProof','phantasmObservationProof','phantasmNotice','phantasmCamouflage'].some(k=>s[k])&&['flags','author','speaker','rolls','-=flags'].some(k=>Object.hasOwn(e,k)))return false;});
}
