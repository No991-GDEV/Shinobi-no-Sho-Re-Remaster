import {runCastStep} from './cast-undo-service.mjs';
import {assertCastActive} from './cast-undo-core.mjs';
import {isProcessor} from './processor-authority.mjs';
import {RUNTIME_STATES} from '../data/runtime-states.mjs';
import {useDifficulty,targetResistanceBonus} from './magen-core.mjs';
import {effectPending,jutsuDamageRecord,damageTriggerState,nextTurnEndRule} from './jutsu-damage-trigger.mjs';
import {mayWriteDamagePresentation} from './damage-presentation.mjs';
import {durationRule,durationClock,actorCombat} from './effect-duration.mjs';
import {applyCondition} from './condition-application.mjs';
import {loadCanonicalLibrary} from './canonical-content.mjs';
import {jutsuProjection} from './item-view.mjs';
import {validateTargetEffects,projectedTargetEffects,effectRows,effectOutcome,needsHit,needsResistance,attackOutcome,versusDifficulty,rolledCheck} from './jutsu-outcomes.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const pending=new Set();
export const isResolver=()=>isProcessor();
export async function readJutsuUse(message){
 assertCastActive(message);
 const use=message.getFlag('sns-v14-dev','jutsuUse');if(!use||use.version!==2)throw Error('Este uso é de uma versão anterior. Faça um novo uso da técnica.');
 if(!use.caster?.uuid||!Array.isArray(use.targets)||!use.results||Array.isArray(use.results))throw Error('Registro de uso inválido.');
 validateTargetEffects(use.bindings);
 const item=await fromUuid(use.itemUuid),actor=item?.actor;
 if(!actor||actor.uuid!==use.caster.uuid||item.type!=='jutsu'||!message.author||!actor.testUserPermission(message.author,'OWNER'))throw Error('O autor do uso precisa ser proprietário da técnica.');
 
 const projection=jutsuProjection(item,{usedLevel:use.usedLevel});if(!projection?.valid)throw Error('A técnica ou seus requisitos não estão válidos.');
 if(JSON.stringify(projectedTargetEffects(item,projection))!==JSON.stringify(use.bindings)||use.difficulty!==useDifficulty(projection,use.targets.length))throw Error('Os efeitos ou a dificuldade do jutsu mudaram. Faça um novo uso.');
 for(const target of use.targets)if((target.resistanceBonus??0)!==(projection.magen?targetResistanceBonus(await fromUuid(target.uuid)):0))throw Error('O papel do alvo mudou. Faça um novo uso.');
 if(use.targets.length>50||new Set(use.targets.map(t=>t.uuid)).size!==use.targets.length)throw Error('Registro de alvos inválido.');
 if(effectRows(use).some(r=>needsResistance(r.binding)&&!Number.isFinite(r.dc)))throw Error('Dificuldade de resistência desconhecida.');
 return {use:structuredClone(use),item,actor,projection};
}
export async function resolveJutsuEffects(message,decisions){
 if(!isResolver())throw Error('O mestre ativo precisa resolver os efeitos.');
 const use=message.getFlag('sns-v14-dev','jutsuUse'),actors=await Promise.all([use?.caster?.uuid,...(use?.targets??[]).map(t=>t.uuid)].filter(Boolean).map(uuid=>fromUuid(uuid)));
 return runCastStep(message,actors,'Efeitos nos alvos',()=>resolveEffects(message,decisions));
}
async function resolveEffects(message,decisions){
 if(!isResolver())throw Error('O mestre ativo precisa resolver os efeitos.');
 if(pending.has(message.uuid))return null;pending.add(message.uuid);
 try{
  const {use,item,actor,projection}=await readJutsuUse(message),library=await loadCanonicalLibrary(),rows=effectRows(use),known=new Set(rows.map(r=>r.key));
  if(projection.magen){const {resolveMagenEffects}=await import('./magen-service.mjs');return await resolveMagenEffects(message,use,decisions,item,actor,projection,library);}
  if(Object.keys(decisions).some(k=>!known.has(k)))throw Error('Há uma decisão para alvo ou efeito que não pertence a este uso.');
  // Validate the whole batch before any write. A pending row is deliberately untouched.
  const batch=[];
  for(const row of rows){
   if(!effectPending(use,row.key)||!decisions[row.key])continue;
   const decision=decisions[row.key];
   const target=await fromUuid(row.target.uuid);
   if(!target?.isOwner||!['shinobi','npc','companion'].includes(target.type))throw Error('O alvo não está disponível: '+row.target.name);
   const damageRecord=row.binding.requiresDamage?jutsuDamageRecord(message,target):null,damageState=row.binding.requiresDamage?damageTriggerState(damageRecord):'taken';
   let status=effectOutcome(row.binding,decision);if(row.binding.requiresDamage&&decision.hit!=='miss'){if(damageState==='pending')continue;if(damageState==='none')status='noDamage';}if(status==='pending')continue;
   if(!RUNTIME_STATES[row.binding.conditionId]&&!library.entries.some(e=>e.id===row.binding.conditionId&&e.document.type==='condition'))throw Error('Condição indisponível no livro.');
   if(status==='apply'){const rule=applicationDuration(row.binding,target);durationClock(rule,actorCombat(target),rule.anchor==='caster'?actor.uuid:target.uuid);}
   batch.push({...row,decision,status,target,damageRecord});
  }
  for(const row of batch){
   if(!isResolver())throw Error('O mestre ativo mudou. Reabra a resolução.');
   const key=message.uuid+'#'+row.key+(row.damageRecord?'#'+row.damageRecord.id:'');let created=null;
   if(row.status==='apply'){
    const repeats=row.binding.upgradeIfRepeated?Array.from(row.target.items).filter(i=>i.system.appliedCondition?.active&&i.system.contentId===row.binding.conditionId&&i.system.appliedCondition.sourceUuid===item.uuid):[];
    const conditionId=repeats.length?row.binding.upgradeIfRepeated:row.binding.conditionId,rule=applicationDuration(row.binding,row.target);
    created=await applyCondition(row.target,conditionId,{degree:row.binding.degree,scope:row.binding.scope,origin:use.name+' · '+actor.name,sourceUuid:item.uuid,duration:row.binding.duration,durationRule:rule,casterUuid:actor.uuid,note:[row.binding.note,row.binding.source,rule.mode==='manual'&&row.binding.durationRule?.mode==='turns'?'Fora de combate: contar os turnos conforme a descrição.':''].filter(Boolean).join(' · '),applicationKey:key},library);
    if(created&&repeats.length)await row.target.updateEmbeddedDocuments('Item',repeats.map(i=>({_id:i.id,'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()})));
   }
   if(row.status==='apply'&&!created)throw Error('O alvo está recebendo outra condição. Tente novamente.');
   use.results[row.key]={status:row.status==='apply'?'applied':row.status,itemUuid:created?.uuid??'',...(row.damageRecord?{damageRecordId:row.damageRecord.id}:{}),user:game.user.id,at:new Date().toISOString(),decision:structuredClone(row.decision)};
   // The condition's applicationKey also survives a failed message update, preventing fatigue escalation twice on retry.
   await message.update({'flags.sns-v14-dev.jutsuUse.results':use.results});
  }
  return use.results;
 }finally{pending.delete(message.uuid);}
}
export function jutsuUseCard(use){
 return '';
}
export async function afterJutsuMessage(message){
 const use=message?.getFlag('sns-v14-dev','jutsuUse');if(!use||!isResolver())return;
 const immediate=Object.fromEntries(effectRows(use).filter(r=>!needsHit(r.binding)&&!needsResistance(r.binding)).map(r=>[r.key,{}]));
 if(Object.keys(immediate).length)try{await resolveJutsuEffects(message,immediate);}catch(e){ui.notifications.warn(e.message);}
}
export function guardJutsuMessageUpdate(message,changes,options,userId){
 if(game.users.get(userId)?.isGM)return;
 const expanded=foundry.utils.expandObject(changes);
 if(mayWriteDamagePresentation(message,expanded,userId))return;
 if(message.getFlag('sns-v14-dev','jutsuUse')&&['flags','author','speaker','-=flags','-=author','-=speaker'].some(key=>Object.hasOwn(expanded,key)))return false;
}
export async function decorateJutsuUse(message,element){
 const {decorateJutsuTargets}=await import('./combat-chat-ui.mjs');try{await decorateJutsuTargets(message,element);}catch(e){console.warn('SNS · apresentação dos alvos',e.message);}
}
export {effectRows,effectOutcome,needsHit,needsResistance,attackOutcome,versusDifficulty,rolledCheck};

function applicationDuration(binding,target){const combat=actorCombat(target),rule=binding.untilNextTurnEnd?durationRule(nextTurnEndRule(target.uuid,combat)):durationRule(binding.durationRule);return binding.id.startsWith('book_')&&rule.mode==='turns'&&!combat?durationRule({mode:'manual'}):rule;}
