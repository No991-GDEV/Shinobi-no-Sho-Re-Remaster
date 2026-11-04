import {mountDurationFields} from './effect-duration.mjs';
import {RUNTIME_STATES,runtimeStateCopy} from '../data/runtime-states.mjs';
import {durationRule as normalizeDuration,durationClock,durationFields,durationFromForm,actorCombat} from './effect-duration.mjs';
import {loadCanonicalLibrary,canonicalCopy} from './canonical-content.mjs';
import {CONDITION_SCOPES,isManagedCondition,conditionApplicationPlan} from './condition-effects.mjs';
import {escapeHtml,ATTRIBUTES} from './kernel.mjs';
const pending=new WeakSet();
export function conditionCopy(entry,{scope='all',degree=1,origin='Mestre',sourceUuid='',duration='',note='',applicationKey='',user='',at='',casterUuid='',durationRule={},durationClock={}}={}){
 if(!CONDITION_SCOPES.includes(scope)||!Number.isInteger(degree)||degree<1||degree>3)throw Error('Escopo ou grau inválido para a condição.');
 if(!entry||entry.document.type!=='condition'||!entry.id.startsWith('sns:condition:'))throw Error('Selecione uma condição do livro.');
 const data=canonicalCopy(entry);data.system.details.degree=degree;
 data.system.appliedCondition={managed:true,active:true,scope,origin,sourceUuid,casterUuid,duration,durationRule:normalizeDuration(durationRule),durationClock,note,applicationKey,appliedBy:user,appliedAt:at,endedAt:''};
 return data;
}
export async function applyCondition(actor,contentId,options={},library=null){
 if(!game.user.isGM||!actor?.isOwner||!['shinobi','npc','companion'].includes(actor.type))throw Error('O mestre precisa aplicar a condição a uma ficha de personagem, NPC ou companheiro.');
 if(pending.has(actor))return null;
 pending.add(actor);
 try{
  if(options.applicationKey){const prior=Array.from(actor.items).find(i=>i.system.appliedCondition?.applicationKey===options.applicationKey);if(prior)return prior;}
  library??=await loadCanonicalLibrary();const plan=conditionApplicationPlan(actor.items,contentId),at=new Date().toISOString();
  const entry=library?.entries.find(e=>e.id===plan.contentId);
  const rule=normalizeDuration(options.durationRule),clock=durationClock(rule,actorCombat(actor),rule.anchor==='caster'?options.casterUuid:actor.uuid);
  let data;if(RUNTIME_STATES[contentId]){data=runtimeStateCopy(contentId);data.system.appliedCondition={managed:true,active:true,scope:'all',origin:options.origin??'Mestre',sourceUuid:options.sourceUuid??'',casterUuid:options.casterUuid??'',duration:options.duration??'',durationRule:rule,durationClock:clock,note:options.note??'',applicationKey:options.applicationKey??'',appliedBy:game.user.id,appliedAt:at,endedAt:''};}else data=conditionCopy(entry,{...options,durationRule:rule,durationClock:clock,user:game.user.id,at});
  const [created]=await actor.createEmbeddedDocuments('Item',[data]);
  if(plan.end.length)await actor.updateEmbeddedDocuments('Item',plan.end.map(id=>({_id:id,'system.appliedCondition.active':false,'system.appliedCondition.endedAt':at})));
  return created;
 }finally{pending.delete(actor);}
}
export async function endCondition(actor,id){
 const item=actor?.items.get(id);if(item?.flags?.['sns-v14-dev']?.effectBinding)return (await import('./effect-item-service.mjs')).endBoundEffect(item);if(item?.flags?.['sns-v14-dev']?.legadoEffect){const data=item.flags['sns-v14-dev'].legadoEffect;return (await import('./legado-service.mjs')).requestLegadoControl(actor,data.selfKey?'end-active':'end-effect',{key:data.selfKey,effectId:id});}if(item?.flags?.['sns-v14-dev']?.advancedState)return (await import('./environment-service.mjs')).requestEnvironmentControl(item.flags['sns-v14-dev'].advancedState.rootUuid,'endState',{targetUuid:actor.uuid,stateId:item.id});if(item?.flags?.['sns-v14-dev']?.environment)return (await import('./environment-service.mjs')).requestEnvironmentControl(item,'end');if(item?.flags?.['sns-v14-dev']?.environmentMember&&!game.user.isGM){ui.notifications.warn('Use o teste de libertação do efeito. Ao sair da área, o mestre pode encerrá-lo.');return false;}if(item?.flags?.['sns-v14-dev']?.support&&actor.isOwner)return (await import('./support-service.mjs')).requestSupportControl(item,'end');if(item?.flags?.['sns-v14-dev']?.phantasm&&actor.isOwner){return (await import('./phantasm-service.mjs')).requestPhantasmEnd(item);}
 if(!actor?.isOwner||!isManagedCondition(item)||!item.system.appliedCondition.active)return false;
 if(item.flags?.['sns-v14-dev']?.illusion){if(!game.user.isGM)return ui.notifications.warn('Use Notar ou Kai no cartão da ilusão.');return (await import('./magen-service.mjs')).endIllusion(actor,item);}
 await item.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()});if(item.system.contentId==='sns:condition:fascinado'){const source=item.system.appliedCondition.sourceUuid&&await fromUuid(item.system.appliedCondition.sourceUuid);if(source?.system.ruleId==='sns:apt:fascinar'||source?.system.contentId==='sns:apt:fascinar')await (await import('./magen-service.mjs')).addFascinationImmunity(actor);}return true;
}
export async function promptCondition(actor){
 if(!game.user.isGM||!actor?.isOwner)return;
 const library=await loadCanonicalLibrary(),conditions=library?.entries.filter(e=>e.document.type==='condition').sort((a,b)=>a.document.name.localeCompare(b.document.name,'pt-BR'))??[];
 const targets=[...new Map(Array.from(game.user.targets??[]).filter(t=>t.actor).map(t=>[t.actor.uuid,t.actor])).values()];
 const scopeLabels={all:'Todos os testes',attacks:'Ataques',defenses:'Defesas e Esquiva',initiative:'Iniciativa',...Object.fromEntries(ATTRIBUTES.map(([k,,name])=>['attribute:'+k,'Teste de '+name]))};
 const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Aplicar condição'},render:(event,dialog)=>{const root=dialog.element;mountDurationFields(root);const update=()=>{const enabled=root.querySelector('[name=condition]').value==='sns:condition:debilitado';for(const name of ['degree','scope'])root.querySelector('[name='+name+']').closest('label').hidden=!enabled;};root.querySelector('[name=condition]').addEventListener('change',update);update();},content:'<label>Condição<select name="condition">'+conditions.map(e=>'<option value="'+escapeHtml(e.id)+'">'+escapeHtml(e.document.name)+'</option>').join('')+'</select></label><label>Aplicar em<select name="target"><option value="self">'+escapeHtml(actor.name)+'</option><option value="targets" '+(targets.length?'':'disabled')+'>Alvos marcados ('+targets.length+')</option></select></label><label>Grau de Debilitado<input name="degree" type="number" min="1" max="3" step="1" value="1"></label><label>Escopo de Debilitado<select name="scope">'+CONDITION_SCOPES.map(key=>'<option value="'+key+'">'+escapeHtml(scopeLabels[key])+'</option>').join('')+'</select></label><label>Origem<input name="origin" placeholder="Jutsu, efeito ou acontecimento"></label><label>Duração<input name="duration" placeholder="Até ser encerrado"></label>'+durationFields()+'<label>Observação<input name="note"></label>',ok:{label:'Aplicar condição',callback:(e,b)=>{const f=b.form.elements;return {contentId:f.condition.value,target:f.target.value,degree:Number(f.degree.value),scope:f.scope.value,origin:f.origin.value.trim()||'Mestre',duration:f.duration.value.trim(),durationRule:durationFromForm(f),casterUuid:actor.uuid,note:f.note.value.trim()};}}});
 if(!result)return;
 const recipients=result.target==='targets'?targets:[actor];
 if(!recipients.length||recipients.some(a=>!a.isOwner||!['shinobi','npc','companion'].includes(a.type)))return ui.notifications.warn('Confira os alvos antes de aplicar.');
 try{for(const recipient of recipients)durationClock(result.durationRule,actorCombat(recipient),result.durationRule.anchor==='caster'?actor.uuid:recipient.uuid);for(const recipient of recipients)await applyCondition(recipient,result.contentId,result,library);ui.notifications.info('Condição aplicada em '+recipients.map(a=>a.name).join(', ')+'.');}
 catch(error){ui.notifications.error(error.message);}
}
