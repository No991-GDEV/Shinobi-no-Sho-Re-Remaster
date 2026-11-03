import {mountDurationFields} from './effect-duration.mjs';
import {durationClock,durationFields,durationFromForm,actorCombat} from './effect-duration.mjs';
import {isManagedCondition} from './condition-effects.mjs';
import {endActorScene,isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {escapeHtml as esc} from './kernel.mjs';
export async function configureConditionDuration(actor,id){
 if(!game.user.isGM||!actor.isOwner)return;
 const item=actor.items.get(id);if(!isManagedCondition(item)||!item.system.appliedCondition.active)return;
 const baseline=JSON.stringify(item.system.appliedCondition),current=item.system.appliedCondition;
 const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Duração · '+item.name},position:{width:520},render:(event,dialog)=>mountDurationFields(dialog.element),content:'<p>Salvar reinicia a contagem da duração.</p>'+durationFields(current.durationRule),ok:{label:'Salvar duração',callback:(e,b)=>durationFromForm(b.form.elements)}});
 if(!result)return;
 await withEffectLock(actor,async()=>{
  if(!game.user.isGM||!actor.isOwner||JSON.stringify(item.system.appliedCondition)!==baseline)return ui.notifications.warn('O efeito mudou. Reabra sua duração.');
  const source=current.sourceUuid?await fromUuid(current.sourceUuid):null,casterUuid=current.casterUuid||source?.actor?.uuid;
  const clock=durationClock(result,actorCombat(actor),result.anchor==='caster'?casterUuid:actor.uuid);
  await item.update({'system.appliedCondition.durationRule':result,'system.appliedCondition.durationClock':clock});
 });
}
export async function promptEndActorScene(actor){
 if(!game.user.isGM||!actor.isOwner)return;
 const confirmed=await foundry.applications.api.DialogV2.confirm({classes:['sns-editor-dialog'],window:{title:'Encerrar efeitos de cena'},content:'<p>Encerrar os efeitos de cena, as ilusões de Magen e os doujutsus ativos em <strong>'+esc(actor.name)+'</strong>?</p><p>Não recupera recursos. O transplante permanece como estiver, pois dura enquanto o olho estiver descoberto.</p>',yes:{label:'Encerrar cena desta ficha'},no:{label:'Cancelar'}});
 if(!confirmed)return;
 if(!isTimekeeper())return (await import('./rest-service.mjs')).requestSceneEnd(actor);
 const result=await endActorScene(actor);ui.notifications.info('Encerrados: '+result.conditions+' condição(ões) e '+result.aptitudes+' aptidão(ões).');
}
