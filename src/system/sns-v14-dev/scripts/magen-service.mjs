import {touches} from './message-index.mjs';
import {activeIllusions,illusionData,sceneEpoch,magenImmunity,advanceIllusion,illusionBreaksByDamage,noticeDifficulty} from './magen-core.mjs';
import {conditionCopy,applyCondition} from './condition-application.mjs';
import {runtimeStateCopy} from '../data/runtime-states.mjs';
import {durationRule,durationClock,advanceDuration,actorCombat} from './effect-duration.mjs';
import {nextTurnEndRule} from './jutsu-damage-trigger.mjs';
import {withEffectLock,isTimekeeper} from './effect-lifecycle.mjs';
import {defenseSpec} from './defense-choices.mjs';
import {rolledCheck,versusDifficulty,effectRows,effectOutcome} from './jutsu-outcomes.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {activationRows,resolveActiveAptitude} from './active-aptitudes.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev';
const rootFor=(actor,item)=>illusionData(item)?.root?item:Array.from(actor.items).find(i=>illusionData(i)?.root&&illusionData(i)?.group===illusionData(item)?.group);
export async function resolveMagenImmunities(message,use,magen){
 let changed=false;for(const row of effectRows(use)){if(use.results[row.key])continue;const target=await fromUuid(row.target.uuid),same=activeIllusions(target).some(i=>illusionData(i).group===message.uuid+'#'+target.uuid),reason=same?'':magenImmunity(target,magen);if(reason){use.results[row.key]={status:'immune',reason,user:game.user.id,at:new Date().toISOString()};changed=true;}}
 if(changed)await message.update({['flags.'+ns+'.jutsuUse.results']:use.results});
}
function applicationRule(magen,target){const combat=actorCombat(target);return magen.turns&&combat?magen.nextTurnEnd?nextTurnEndRule(target.uuid,combat):durationRule({mode:'turns',turns:magen.turns,phase:'end',anchor:'recipient'}):durationRule({mode:'manual'});}
export async function resolveMagenEffects(message,use,decisions,item,caster,projection,library){
 if(!isTimekeeper())throw Error('O mestre ativo precisa resolver Magen.');
 const rows=effectRows(use),known=new Set(rows.map(r=>r.key));if(Object.keys(decisions).some(k=>!known.has(k)))throw Error('Decisão fora deste uso.');
 for(const targetRef of use.targets){
  const selected=rows.filter(r=>r.target.uuid===targetRef.uuid);if(selected.every(r=>use.results[r.key]))continue;
  const outcomes=selected.map(r=>decisions[r.key]&&effectOutcome(r.binding,decisions[r.key]));if(outcomes.some(s=>!s||s==='pending'))continue;
  if(new Set(outcomes).size!==1)throw Error('A mesma ilusão exige um único resultado de resistência.');
  const target=await fromUuid(targetRef.uuid);if(!target?.isOwner)throw Error('Alvo de Magen indisponível.');
  await withEffectLock(target,async()=>{
   const group=message.uuid+'#'+target.uuid,magen=projection.magen;let root=Array.from(target.items).find(i=>illusionData(i)?.root&&illusionData(i)?.group===group),status=outcomes[0];
   const immunity=root?'':magenImmunity(target,magen);if(immunity)status='immune';
   if(status==='apply'&&!root){
    const combat=actorCombat(target),rule=applicationRule(magen,target),clock=durationClock(rule,combat,target.uuid),combatant=combat?.combatant?.actor?.uuid===target.uuid;
    const meta={version:1,root:true,group,effectId:magen.effectId,stage:magen.stage,category:magen.category,cost:magen.cost,difficulty:selected[0].dc,sceneEpoch:sceneEpoch(target),sourceUuid:item.uuid,casterUuid:caster.uuid,combatId:combat?.id??'',starts:combatant?1:0,ends:0,events:[],attempts:0,noticed:false,assessments:{},progression:magen.progression,progressed:false,remaining:magen.turns,nextTurnEnd:magen.nextTurnEnd};
    const record={managed:true,active:true,scope:'all',origin:use.name+' · '+caster.name,sourceUuid:item.uuid,casterUuid:caster.uuid,duration:projection.data.duration,durationRule:rule,durationClock:clock,note:'Magen · '+(magen.category==='compulsao'?'Compulsão':'Aflição')+' · Dif '+meta.difficulty+' · Chakra '+meta.cost,applicationKey:group,appliedBy:game.user.id,appliedAt:new Date().toISOString(),endedAt:''};
    const marker=runtimeStateCopy('sns:state:ilusao-mental');marker.name=use.name+' · '+(magen.category==='compulsao'?'Compulsão':'Aflição');marker.system.description=projection.effect.text;marker.system.appliedCondition=record;marker.flags={[ns]:{illusion:meta}};
    const children=selected.map(r=>{
     const options={...record,scope:r.binding.scope,degree:r.binding.degree,durationRule:{mode:'manual'},durationClock:{},applicationKey:message.uuid+'#'+r.key};
     const runtime=r.binding.conditionId.startsWith('sns:state:');let data=runtime?runtimeStateCopy(r.binding.conditionId):conditionCopy(library.entries.find(e=>e.id===r.binding.conditionId),{...options,user:game.user.id,at:record.appliedAt});
     if(runtime)data.system.appliedCondition=options;
     data.flags={[ns]:{illusion:{version:1,root:false,group,bindingId:r.binding.id}}};return data;
    });
    const previous=activeIllusions(target);const created=await target.createEmbeddedDocuments('Item',[marker,...children]);root=created.find(i=>illusionData(i)?.root);if(created.length!==children.length+1||!root)throw Error('A ilusão não pôde ser aplicada integralmente.');
    // All conditions are created together; no fatigue accumulation and no duplicate mental groups.
    for(const old of previous)await endIllusion(target,old,'Substituída por '+use.name);
   }
   for(const row of selected){const child=root&&Array.from(target.items).find(i=>i.system.appliedCondition?.applicationKey===message.uuid+'#'+row.key);use.results[row.key]={status:status==='apply'?'applied':status,itemUuid:child?.uuid??'',rootUuid:root?.uuid??'',reason:immunity,user:game.user.id,at:new Date().toISOString(),decision:structuredClone(decisions[row.key])};}
   await message.update({['flags.'+ns+'.jutsuUse.results']:use.results});
  });
 }
 return use.results;
}
export async function addFascinationImmunity(actor,sourceKey=''){
 if(!isTimekeeper()||Array.from(actor.items).some(i=>i.system.contentId==='sns:state:imunidade-fascinio'&&i.system.appliedCondition?.active))return;
 const combat=actorCombat(actor),rule=combat?nextTurnEndRule(actor.uuid,combat):{mode:'manual'};
 return applyCondition(actor,'sns:state:imunidade-fascinio',{applicationKey:sourceKey?'fascination#'+sourceKey:'',duration:'Um turno após se libertar de Êxtase / Fascinar',durationRule:rule,origin:'Libertação de fascínio',note:'Imune a Êxtase e Fascinar por um turno. Fora de combate, o mestre encerra após contar o turno.'});
}
export async function endIllusion(actor,item,reason='Encerrada pelo mestre',damageRecordId=''){
 if(!isTimekeeper()||!actor?.isOwner)throw Error('O mestre ativo precisa encerrar a ilusão.');
 const root=rootFor(actor,item);if(!root?.system.appliedCondition.active)return false;
 const meta=illusionData(root),group=Array.from(actor.items).filter(i=>illusionData(i)?.group===meta.group&&i.system.appliedCondition?.active),at=new Date().toISOString();
 await actor.updateEmbeddedDocuments('Item',group.map(i=>({_id:i.id,'system.appliedCondition.active':false,'system.appliedCondition.endedAt':at,...(i===root?{['flags.'+ns+'.illusion.endReason']:reason,['flags.'+ns+'.illusion.endDamageRecordId']:damageRecordId}:{})})));
 if(meta.effectId==='sns:effect:extase'){const cooldown=await addFascinationImmunity(actor,meta.group);if(cooldown)await root.update({['flags.'+ns+'.illusion.endCooldownUuid']:cooldown.uuid});}return true;
}
export async function processIllusionTurn(actor,event,library=null){
 if(!isTimekeeper())return;
 for(const root of activeIllusions(actor)){
  const meta=illusionData(root),next=advanceIllusion(meta,event,actor.uuid),timer=advanceDuration(root.system.appliedCondition,event);
  if(next&&!meta.combatId&&event.phase==='end'&&meta.remaining>0){next.remaining=meta.remaining-1;if(!next.remaining){await endIllusion(actor,root,'Duração encerrada · contagem manual');continue;}}
  if(timer?.expired){await root.update({'system.appliedCondition.durationClock':timer.clock});await endIllusion(actor,root,'Duração encerrada');continue;}
  if(!next&&!timer)continue;
  if(timer)await root.update({'system.appliedCondition.durationClock':timer.clock});
  if(next?.progressed&&!meta.progressed){
   library??=await (await import('./canonical-content.mjs')).loadCanonicalLibrary();const id=next.progression.conditionId,record=root.system.appliedCondition;
   const data=conditionCopy(library.entries.find(e=>e.id===id),{...record,durationRule:{mode:'manual'},durationClock:{},applicationKey:meta.group+'#progression',user:game.user.id,at:new Date().toISOString()});data.flags={[ns]:{illusion:{version:1,root:false,group:meta.group}}};
   if(!Array.from(actor.items).some(i=>i.system.appliedCondition?.applicationKey===meta.group+'#progression'))await actor.createEmbeddedDocuments('Item',[data]);
   const old=Array.from(actor.items).filter(i=>illusionData(i)?.group===meta.group&&!illusionData(i)?.root&&i.system.contentId!==id&&i.system.appliedCondition.active);
   if(old.length)await actor.updateEmbeddedDocuments('Item',old.map(i=>({_id:i.id,'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()})));
  }
  if(next)await root.update({['flags.'+ns+'.illusion']:next});
 }
}
export async function breakFascination(actor){
 if(!isTimekeeper())return;
 for(const root of activeIllusions(actor)){
  if(illusionData(root).effectId==='sns:effect:extase')await endIllusion(actor,root,'Ameaça óbvia · ataque declarado');
  if(illusionData(root).effectId==='sns:effect:aliviamento')await root.update({['flags.'+ns+'.illusion.noticed']:true});
 }
}
const hasKai=actor=>Array.from(actor.items).some(i=>i.type==='jutsu'&&i.system.contentId==='sns:jutsu:kai');
async function illusionRoll(actor,key,dc,root,action,attempt,bonus=0){
 const spec=defenseSpec(actor,key);if(!spec)throw Error('Precisão de '+key+' não informada.');
 if(bonus){spec.adjustment+=bonus;spec.formula='2d8 + '+(spec.precision+spec.adjustment);}
 let child=game.messages.find(m=>m.author?.isGM&&m.getFlag(ns,'illusionRoll')?.rootUuid===root.uuid&&m.getFlag(ns,'illusionRoll')?.actorUuid===actor.uuid&&m.getFlag(ns,'illusionRoll')?.action===action&&m.getFlag(ns,'illusionRoll')?.attempt===attempt);
 if(!child){const roll=await new foundry.dice.Roll(spec.formula).evaluate();child=await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:'<strong>'+esc({notice:'Notar Genjutsu',assess:'Avaliar Genjutsu',kai:'Kai'}[action])+'</strong><p>'+esc(root.name)+' · Dif '+dc+'</p>',flags:{[ns]:{testOutcome:{dc,result:versusDifficulty(rolledCheck(roll,spec),dc)},check:{actorImg:actor.img,key},illusionRoll:{rootUuid:root.uuid,actorUuid:actor.uuid,action,attempt}}}});}
 return {uuid:child.uuid,roll:rolledCheck(child.rolls[0],spec),passed:versusDifficulty(rolledCheck(child.rolls[0],spec),dc)==='passed'};
}
export function chakraVision(actor){return activationRows(actor).some(row=>row.active&&['sharingan','transplanted'].includes(row.rule)&&resolveActiveAptitude(actor,row).valid);}
export async function requestIllusionAction(actor,root,action,key='attribute:esp'){
 if(!actor?.isOwner||!root||!game.users.activeGM)throw Error('Selecione uma ficha que você controla e mantenha um mestre ativo.');
 return foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),whisper:[game.users.activeGM.id],content:'<p>'+esc(actor.name)+' · '+esc({notice:'Notar Genjutsu',assess:'Avaliar Genjutsu',kai:'Kai',cancel:'Cancelar ilusão'}[action]??action)+'</p>',flags:{[ns]:{illusionReply:{rootUuid:root.uuid,actorUuid:actor.uuid,action,key}}}});
}
export async function resolveIllusionAction(reply){
 if(!isTimekeeper())return;
 const r=reply.getFlag(ns,'illusionReply');if(!r)return;
 const root=await fromUuid(r.rootUuid),target=root?.actor,actor=await fromUuid(r.actorUuid);if(!illusionData(root)?.root||!root.system.appliedCondition.active||!actor?.testUserPermission(reply.author,'OWNER'))return;
 return withEffectLock(target,async()=>{
  if(reply.getFlag(ns,'illusionResolved'))return;const meta=structuredClone(illusionData(root));let result;
  if(r.action==='cancel'){
   if(actor.uuid!==meta.casterUuid&&!reply.author.isGM)throw Error('Só o usuário da técnica ou mestre cancela livremente.');
   await endIllusion(target,root,'Cancelada pelo usuário da técnica');result={ended:true};
  }else if(r.action==='notice'){
   if(actor.uuid!==target.uuid||meta.category!=='compulsao'||meta.noticed||meta.starts<2)throw Error('Notar fica disponível a partir do segundo turno, enquanto a Compulsão não foi identificada.');
   if(meta.lastNoticeStart===meta.starts)throw Error('Notar já foi usado neste turno.');
   const bonus=meta.effectId==='sns:effect:desorientar'&&Array.from(actor.items).some(i=>i.system.ruleId==='sns:apt:sensor'&&requirementsFor(i,actor).valid)?2:0;
   result=await illusionRoll(actor,'attribute:int',noticeDifficulty(meta),root,'notice',meta.attempts,bonus);meta.attempts++;meta.lastNoticeStart=meta.starts;meta.noticed=result.passed;await root.update({['flags.'+ns+'.illusion']:meta});
  }else if(r.action==='assess'){
   if(actor.uuid===target.uuid||meta.ends<1)throw Error('Avaliar exige outro personagem e o primeiro turno do afetado concluído.');
   const key=actor.uuid.replaceAll('.','~'),prior=meta.assessments[key]??{attempts:0,noticed:false};if(prior.noticed)return;
   const same=Array.from(actor.items).some(i=>i.type==='power'&&i.system.power?.definitionId==='sns:power:magen'&&requirementsFor({...i,system:{...i.system,ruleId:'sns:power:magen'}},actor).valid&&i.system.power.choices.some(c=>c.slot<=i.system.level&&c.effectId===meta.effectId));
   result=same||chakraVision(actor)?{passed:true,automatic:true}:await illusionRoll(actor,'attribute:per',meta.difficulty-2-prior.attempts,root,'assess',prior.attempts);
   meta.assessments[key]={attempts:prior.attempts+1,noticed:result.passed};await root.update({['flags.'+ns+'.illusion']:meta});
  }else if(r.action==='kai'){
   if(!hasKai(actor)||!['attribute:esp','attribute:int'].includes(r.key))throw Error('A ficha precisa ter Kai, usando Espírito ou Inteligência.');
   if(actor.uuid===target.uuid){if(!meta.noticed)throw Error('É preciso notar a Compulsão antes de usar Kai em si mesmo.');result={passed:true,automatic:true,cost:0};}
   else{
    const current=actor.system.resources.chakra.value,ledger=actor.getFlag(ns,'magenKaiLedger')??{};if(!ledger[reply.id]){if(!Number.isInteger(current)||current<meta.cost)throw Error('Chakra insuficiente para Kai.');await actor.update({'system.resources.chakra.value':current-meta.cost,['flags.'+ns+'.magenKaiLedger.'+reply.id]:{cost:meta.cost,rootUuid:root.uuid}});}
    result=await illusionRoll(actor,r.key,meta.difficulty,root,'kai',reply.id);result.cost=meta.cost;
   }
   if(result.passed)await endIllusion(target,root,'Kai · '+actor.name);
  }else return;
  await reply.update({['flags.'+ns+'.illusionResolved']:result});return result;
 });
}
export async function processIllusionDamage(actor){
 if(!isTimekeeper())return;
 return withEffectLock(actor,async()=>{
  const log=actor.getFlag(ns,'damageLedger')??{};
  for(const root of activeIllusions(actor)){const meta=illusionData(root),damage=Object.values(log).find(d=>d.status==='applied'&&d.at>=root.system.appliedCondition.appliedAt&&illusionBreaksByDamage(meta,d.resources));if(damage)await endIllusion(actor,root,'Dano · '+damage.id,damage.id);}
  // An immediate damage undo restores only its own cancellation, without replacing a later illusion.
  for(const root of actor.items){const meta=illusionData(root),at=root.system.appliedCondition?.endedAt;if(!meta?.root||root.system.appliedCondition.active||!meta.endDamageRecordId||log[meta.endDamageRecordId]?.status!=='undone'||meta.sceneEpoch!==sceneEpoch(actor)||activeIllusions(actor).length)continue;
   if(Array.from(actor.items).some(i=>illusionData(i)?.root&&i!==root&&i.system.appliedCondition.appliedAt>at))continue;
   const group=Array.from(actor.items).filter(i=>illusionData(i)?.group===meta.group&&i.system.appliedCondition.endedAt===at);
   await actor.updateEmbeddedDocuments('Item',group.map(i=>({_id:i.id,'system.appliedCondition.active':true,'system.appliedCondition.endedAt':'',...(i===root?{['flags.'+ns+'.illusion.endDamageRecordId']:'',['flags.'+ns+'.illusion.endReason']:''}:{})})));
   const cooldown=meta.endCooldownUuid&&await fromUuid(meta.endCooldownUuid);if(cooldown?.system.appliedCondition.active)await cooldown.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()});
  }
 });
}
export function installMagenHooks(){
 Hooks.on('preUpdateActor',(actor,changes,options)=>{const r=foundry.utils.expandObject(changes).system?.resources;if(r&&(Object.hasOwn(r.vitality??{},'value')||Object.hasOwn(r.vitality??{},'temp')))options.snsMagenBefore={vitality:actor.system.resources?.vitality?.value,temp:actor.system.resources?.vitality?.temp??0};});
 Hooks.on('createChatMessage',m=>resolveIllusionAction(m).catch(e=>ui.notifications.warn(e.message)));
 Hooks.on('preUpdateChatMessage',(m,changes,options,userId)=>{if(game.users.get(userId)?.isGM)return;const e=foundry.utils.expandObject(changes);if((m.getFlag(ns,'illusionReply')||m.getFlag(ns,'illusionRoll'))&&['flags','rolls','author','speaker','-=flags','-=rolls'].some(k=>Object.hasOwn(e,k)))return false;});
 Hooks.on('updateActor',(actor,changes,options)=>{
  if(!touches(changes,['system.resources.vitality','flags.sns-v14-dev.damageLedger']))return;
  if(!isTimekeeper())return;if(JSON.stringify(changes).includes('damageLedger')){processIllusionDamage(actor).catch(console.warn);return;}
  const prior=options.snsMagenBefore;if(!prior||options.snsDamageOperation)return;
  const vitality=actor.system.resources?.vitality,loss={vitalityLost:Number.isInteger(prior.vitality)&&Number.isInteger(vitality?.value)?Math.max(0,prior.vitality-vitality.value):0,temporaryLost:Math.max(0,prior.temp-(vitality?.temp??0))};
  withEffectLock(actor,async()=>{for(const root of activeIllusions(actor))if(illusionBreaksByDamage(illusionData(root),loss))await endIllusion(actor,root,'Perda de Vitalidade');}).catch(console.warn);
 });
}
