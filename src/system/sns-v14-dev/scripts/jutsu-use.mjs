import {payStructuredJutsu} from './cast-undo-service.mjs';
import {rollWithLegado} from './legado-fortune.mjs';
import {isLegado} from './legado-core.mjs';
import {jutsuAreas} from './area-core.mjs';
import {chooseCastLevel} from './jutsu-level.mjs';
import {declareJutsuDefenses} from './pre-defense.mjs';
import {techniqueRestriction} from './transformation-core.mjs';
import {jutsuProjection} from './item-view.mjs';
import {SnsCheckDialog} from './check-dialog.mjs';
import {checkFlavor} from './chat-card.mjs';
import {escapeHtml} from './kernel.mjs';
import {useSnapshot,rolledCheck} from './jutsu-outcomes.mjs';
import {jutsuUseCard,afterJutsuMessage} from './jutsu-application.mjs';
import {damageSnapshot,jutsuDamageProfile} from './damage-source.mjs';
import {prepareProjectilePacket} from './projectile-allocation.mjs';
import {illusionActionBlock} from './magen-core.mjs';
import {techniqueCard} from './technique-card.mjs';
import {isStandaloneTechnique,postStandaloneTechnique} from './standalone-technique.mjs';
const pending=new WeakSet();
export async function useJutsu(actor,item){
 if(!isLegado(item)&&isStandaloneTechnique(item))return postStandaloneTechnique(actor,item);
 if(isLegado(item)||actor.type==='npc'||item.flags?.['sns-v14-dev']?.sharedRecipe)return (await import('./npc-jutsu-service.mjs')).useNpcJutsu(actor,item);
 if(!actor.isOwner||item?.actor!==actor||pending.has(actor))return;
 const actionBlock=illusionActionBlock(actor);if(actionBlock)return ui.notifications.warn(actionBlock);
 const restricted=techniqueRestriction(actor,item);if(restricted)return ui.notifications.warn(restricted);
 pending.add(actor);
 try{
  let paymentUuid='';
  const usedLevel=await chooseCastLevel(item);if(usedLevel===null)return;
  const project=()=>jutsuProjection(item,{usedLevel});
  let projection=project();
  if(projection?.valid&&projection.environment)return await (await import('./environment-service.mjs')).postEnvironmentUse(actor,item,{usedLevel});
  if(projection?.valid&&projection.support)return await (await import('./support-service.mjs')).postSupportUse(actor,item,{usedLevel});
  if(!projection?.valid)return ui.notifications.warn(projection?.problems.join(' ')||'Configure um efeito aprendido para usar este jutsu.');
  const attackBlock=illusionActionBlock(actor,{attack:!!projection.magen||!projection.noRoll&&projection.data.damage!=='Nenhum'});if(attackBlock)return ui.notifications.warn(attackBlock);
  if(projection.phantasm){const {activatePhantasm}=await import('./phantasm-service.mjs');return await activatePhantasm(actor,item,projection);}
  const targetCount=new Set(Array.from(game.user.targets??[]).filter(t=>t.actor).map(t=>t.actor.uuid)).size;if(projection.combatProfile?.maxTargets&&targetCount>projection.combatProfile.maxTargets)return ui.notifications.warn('Esta técnica permite até '+projection.combatProfile.maxTargets+' alvo(s) neste estágio.');
  if(!projection.noRoll){const {submerged}=await import('./advanced-core.mjs');if(Array.from(game.user.targets??[]).some(t=>t.actor&&submerged(t.actor)))return ui.notifications.warn('Alvos submersos em Colisão de Ondas não podem receber outros ataques físicos. Desmarque-os.');}
  let use;try{use=useSnapshot(actor,item,projection,Array.from(game.user.targets??[]),{allowUntargeted:true});}catch(error){return ui.notifications.warn(error.message);}
  const damageUse=damageSnapshot(actor,item,jutsuDamageProfile(projection),Array.from(game.user.targets??[]));
  if(!await prepareProjectilePacket(damageUse))return;
  const initialBindings=JSON.stringify(item.system.targetEffects??[]),definition=p=>JSON.stringify({bindings:p?.autoBindings??[],combat:p?.combatProfile??{},magen:p?.magen??null}),initialDefinition=definition(projection);
  if(projection.resistanceCast){
   const current=actor.system.resources.chakra.value,cost=projection.cost,verified=project();
   if(!game.users.activeGM)return ui.notifications.warn('Um mestre ativo precisa acompanhar as resistências.');
   if(!verified?.valid||definition(verified)!==initialDefinition||!Number.isInteger(current)||current<cost)return ui.notifications.warn('Revise os requisitos e o chakra antes de usar Magen.');
   paymentUuid=await payStructuredJutsu(actor,item,projection,current);
   const message=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:techniqueCard(item,projection,use),flags:{'sns-v14-dev':{jutsuPayment:paymentUuid,areaUse:jutsuAreas(item,projection),jutsuUse:use,check:{actorImg:actor.img,key:'jutsu'},jutsu:{itemId:item.id,usedLevel:projection.usedLevel,chakraCost:cost,noAttack:true}}}});
   await afterJutsuMessage(message);return message;
  }
  if(projection.noRoll){
   const confirmed=await foundry.applications.api.DialogV2.confirm({classes:['sns-editor-dialog'],window:{title:'Usar '+item.name},content:'<p>'+escapeHtml(projection.data.action+' · '+projection.data.target+' · Chakra '+projection.cost+' · '+projection.data.duration)+'</p><p>'+escapeHtml(projection.effect.notes)+'</p>',yes:{label:'Usar e gastar '+projection.cost+' chakra'},no:{label:'Cancelar'}});
   if(!confirmed||!actor.isOwner)return;
   if(initialBindings!==JSON.stringify(item.system.targetEffects??[]))return ui.notifications.warn('Os efeitos mudaram. Reabra o uso.');
   const currentProjection=project(),current=actor.system.resources.chakra.value;
   if(!currentProjection?.valid||!currentProjection.noRoll||currentProjection.cost!==projection.cost||JSON.stringify(currentProjection.data)!==JSON.stringify(projection.data))return ui.notifications.warn('A técnica ou seus requisitos mudaram. Reabra o uso.');
   if(!Number.isInteger(current)||current<currentProjection.cost)return ui.notifications.warn('Chakra atual desconhecido ou insuficiente. Nenhum gasto realizado.');
   paymentUuid=await payStructuredJutsu(actor,item,currentProjection,current);
   const message=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:techniqueCard(item,currentProjection,use),flags:{'sns-v14-dev':{jutsuPayment:paymentUuid,areaUse:jutsuAreas(item,projection),...(use?{jutsuUse:use}:{}),check:{actorImg:actor.img,key:'jutsu'},jutsu:{itemId:item.id,chakraCost:currentProjection.cost,noRoll:true}}}});
   await afterJutsuMessage(message);return message;
  }
  const key=projection.data.test,precision=actor.type==='shinobi'?actor.system.derived.combat[key]?.precision:actor.system.stats[key];
  if(!Number.isInteger(precision))return ui.notifications.warn('Informe a precisão de '+key.toUpperCase()+' do ator antes do teste.');
  const name=item.name+' · Chakra '+projection.cost;
  const dialog=actor.type==='shinobi'?await SnsCheckDialog.prompt(actor,key,name):await SnsCheckDialog.promptRecorded(actor,{key,name,precision,die:'2d8'});
  if(!dialog||!actor.isOwner)return;
  if(initialBindings!==JSON.stringify(item.system.targetEffects??[]))return ui.notifications.warn('Os efeitos mudaram. Reabra o uso.');
  projection=project();if(definition(projection)!==initialDefinition)return ui.notifications.warn('A regra ou evolução mudou. Reabra o uso.');if(!projection?.valid)return ui.notifications.warn('O poder ou o efeito mudou. Revise o jutsu.');
  if(damageUse)damageUse.profile={...jutsuDamageProfile(projection),...(damageUse.profile.projectileAllocation?{projectileAllocation:damageUse.profile.projectileAllocation}:{})};
  const current=actor.system.resources.chakra.value,cost=projection.cost;
  if(!Number.isInteger(current)||!Number.isInteger(cost)||cost<0||current<cost)return ui.notifications.warn('Chakra atual desconhecido ou insuficiente. Nenhum gasto realizado.');
  const {ambientCombustions,triggerAmbientCombustion}=await import('./advanced-service.mjs'),ambient=await ambientCombustions(actor,projection),paidEarly=!!(damageUse?.profile.preDefense&&damageUse.targets.length)||ambient.length>0;if(paidEarly)paymentUuid=await payStructuredJutsu(actor,item,projection,current);for(const root of ambient)if(!await triggerAmbientCombustion(root,actor,item))return ui.notifications.warn('A combustão interrompeu a técnica. O chakra de sua tentativa foi gasto.');
  const defenseRequestUuid=await declareJutsuDefenses(actor,item,damageUse?.profile,damageUse?await Promise.all(damageUse.targets.map(async t=>({actor:await fromUuid(t.uuid),name:t.name}))):[]);if(defenseRequestUuid===null)return;
  if(damageUse&&defenseRequestUuid)damageUse.defenseRequestUuid=defenseRequestUuid;
  // One actor write, before the roll. Failure/interruption never refunds the initiation cost.
  const latest=actor.system.resources.chakra.value,verified=project();
  if(!verified?.valid||definition(verified)!==initialDefinition||verified.cost!==cost||initialBindings!==JSON.stringify(item.system.targetEffects??[])||JSON.stringify(verified.data)!==JSON.stringify(projection.data)||!Number.isInteger(latest)||!paidEarly&&latest<cost)return ui.notifications.warn('A técnica ou os recursos mudaram durante a declaração. Reabra o uso.');
  if(!paidEarly)paymentUuid=await payStructuredJutsu(actor,item,projection,latest);
  const roll=await rollWithLegado(actor,dialog.spec,{kind:'attack'});
  const facts=projection.data;
  if(damageUse)damageUse.attack=rolledCheck(roll,dialog.spec);
  if(use)use.attack=rolledCheck(roll,dialog.spec);
  const message=await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:techniqueCard(item,projection,use)+checkFlavor(dialog.spec,{compact:true}),flags:{'sns-v14-dev':{jutsuPayment:paymentUuid,areaUse:jutsuAreas(item,projection),...(damageUse?{damageUse}:{}),...(use?{jutsuUse:use}:{}),check:{actorImg:actor.img,key},jutsu:{itemId:item.id,usedLevel:projection.usedLevel,chakraCost:cost}}}},{messageMode:dialog.messageMode});
  await afterJutsuMessage(message);return message;
 }catch(error){ui.notifications.warn(error.message);}finally{pending.delete(actor);}
}
