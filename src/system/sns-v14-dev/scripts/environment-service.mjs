import {touches} from './message-index.mjs';
import {jutsuAreas} from './area-core.mjs';
import {environmentData,environmentMember,environmentRoots,activeEnvironments,environmentPlan,environmentSummary,memberCondition,hasFlight,purificationPlan} from './environment-core.mjs';
import {isTimekeeper,withEffectLock,clockActors} from './effect-lifecycle.mjs';
import {jutsuProjection} from './item-view.mjs';
import {damageTargets,damageSnapshot} from './damage-source.mjs';
import {actorCombat,durationRule} from './effect-duration.mjs';
import {defenseSpec} from './defense-choices.mjs';
import {rolledCheck,versusDifficulty} from './jutsu-outcomes.mjs';
import {illusionActionBlock} from './magen-core.mjs';
import {supportUnable} from './support-core.mjs';
import {applyCondition} from './condition-application.mjs';
import {techniqueCard} from './technique-card.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev',busy=new Set(),again=new Set(),key=u=>u.replaceAll('.','~');
const advancedContext=()=>({applyMember,clearMember,endEnvironment,environmentAttack,stamp});
const stamp=actor=>{const c=actorCombat(actor);return c?.started?{combatId:c.id,round:c.round,combatantId:c.combatant?.id,actorUuid:c.combatant?.actor?.uuid}:null;};
export async function postEnvironmentUse(actor,item,{usedLevel}={}){
 if(!actor.isOwner||item?.actor!==actor||!game.users.activeGM)throw Error('Um mestre ativo precisa acompanhar esta técnica.');
 const p=jutsuProjection(item,{usedLevel});if(!p?.valid||!p.environment)throw Error('Revise os requisitos da técnica.');
 return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:techniqueCard(item,p),flags:{[ns]:{areaUse:jutsuAreas(item,p),check:{actorImg:actor.img,key:'jutsu'},environmentUse:{actorUuid:actor.uuid,itemUuid:item.uuid,usedLevel:p.usedLevel,targets:damageTargets(game.user.targets??[]),status:'choose'}}}});
}
export async function requestEnvironmentCast(message,selection){
 const r=message.getFlag(ns,'environmentUse'),actor=await fromUuid(r?.actorUuid);if(!actor?.isOwner||!['choose','blocked'].includes(r.status)||!game.users.activeGM)throw Error('Uso indisponível.');
 return ChatMessage.create({whisper:[game.users.activeGM.id],content:'Escolha de efeito de ambiente.',flags:{[ns]:{environmentCast:{useUuid:message.uuid,selection}}}});
}
export async function requestEnvironmentControl(rootOrUuid,action,data={}){
 const root=typeof rootOrUuid==='string'?await fromUuid(rootOrUuid):rootOrUuid;if(!environmentData(root)||!game.users.activeGM)throw Error('Efeito indisponível.');
 return ChatMessage.create({whisper:[game.users.activeGM.id],content:'Efeito de área.',flags:{[ns]:{environmentControl:{rootUuid:root.uuid,action,...data}}}});
}
async function createRoot(actor,item,selection,targets,useUuid,{pendingDefense=false,costOverride=null}={}){
 if(!isTimekeeper())throw Error('Somente o mestre ativo cria o registro.');
 const prior=environmentRoots(actor).find(i=>environmentData(i).activationUuid===useUuid);if(prior){const paid=actor.getFlag(ns,'environmentLedger')?.[key(useUuid)];if(paid&&JSON.stringify(paid.selection)!==JSON.stringify(selection))throw Error('O uso já foi cobrado com outra configuração.');return prior;}
 const p=jutsuProjection(item,{usedLevel:selection.usedLevel});if(!p?.valid||!p.environment||item.system.targetEffects?.length||supportUnable(actor))throw Error('Revise os requisitos e a capacidade de agir.');
 const m=environmentPlan(p.environment,selection,targets,actor,useUuid);
 if(m.kind==='purificar'){const substance=await fromUuid(selection.rootUuid),data=environmentData(substance);if(!substance?.system.appliedCondition.active||!data||!['nuvem','nevoa','restringente'].includes(data.kind)||!purificationPlan(m.usedLevel,data).allowed)throw Error('Escolha uma substância ativa de nível igual ou inferior.');}
 const cost=costOverride??m.cost,paid=actor.getFlag(ns,'environmentLedger')?.[key(useUuid)];
 if(paid&&JSON.stringify(paid.selection)!==JSON.stringify(selection))throw Error('Este uso já possui outra configuração.');
 if(!paid){const current=actor.system.resources.chakra.value;if(!Number.isInteger(current)||current<cost)throw Error('Chakra insuficiente.');if(m.kind==='venenoso'){const poison=actor.items.get(m.poison.itemId),ticket=key(useUuid);if(!poison.getFlag(ns,'poisonBatch')?.uses?.[ticket]){if(poison.system.quantity<1)throw Error('Dose indisponível.');await poison.update({'system.quantity':poison.system.quantity-1,['flags.'+ns+'.poisonBatch.uses.'+ticket]:{useUuid,at:new Date().toISOString()}});}}await actor.update({'system.resources.chakra.value':current-cost,['flags.'+ns+'.environmentLedger.'+key(useUuid)]:{cost,itemUuid:item.uuid,selection,at:new Date().toISOString()},...(m.kind==='desastre'?{['flags.'+ns+'.advancedScene']:{disasterUsed:true,disasterUseUuid:useUuid}}:{})});}
 const permanent=m.kind==='barreira'&&m.solid;
 const [root]=await actor.createEmbeddedDocuments('Item',[{name:p.effect.name,type:'effect',img:['barreira','repelir','prisao-de-agua'].includes(m.kind)?'icons/svg/shield.svg':'icons/svg/acid.svg',system:{contentId:'sns:state:ambiente',source:p.effect.source,description:p.effect.text,appliedCondition:{managed:true,active:!pendingDefense,scope:'all',origin:item.name,sourceUuid:item.uuid,casterUuid:actor.uuid,duration:permanent?'Permanente':m.duration,durationRule:durationRule({mode:'manual'}),applicationKey:useUuid,appliedBy:game.user.id,appliedAt:new Date().toISOString(),endedAt:''}},flags:{[ns]:{environment:{version:1,...m,cost,sourceId:item.id,activationUuid:useUuid,activationTurn:stamp(actor),initialTargets:targets,permanent,...(pendingDefense?{defenseStatus:'pending'}:{})}}}}]);
 if(!root)throw Error('Uso cobrado, mas registro não criado. Retome o mesmo cartão.');return root;
}
export async function createEnvironmentDefenseRoot(actor,item,replyUuid){
 if(!isTimekeeper())throw Error('O mestre ativo resolve a proteção.');
 return withEffectLock(actor,async()=>{const p=jutsuProjection(item),m=p?.environment;if(!p?.valid||!['barreira','repelir'].includes(m?.kind))throw Error('Proteção indisponível.');
 const repeat=m.kind==='repelir'&&m.stage>=7&&actor.getFlag(ns,'environmentRepelirWindow'),cost=repeat?Math.ceil(m.cost/2):m.cost;
 const root=await createRoot(actor,item,{mode:'defense',solid:m.kind==='barreira'&&m.element==='doton'},[],replyUuid,{pendingDefense:true,costOverride:cost});
 if(m.kind==='repelir'&&m.stage>=7)await actor.setFlag(ns,'environmentRepelirWindow',{useUuid:replyUuid,turn:stamp(actor)});return root;
 });
}
async function applyMember(root,actor,conditionId,{forced=false}={}){
 if(!root.system.appliedCondition.active)return null;
 const m=environmentData(root),k=key(actor.uuid),entry=m.members[k]??{};const current=actor.items.get(entry.itemId);if(current?.system.appliedCondition.active){if(!conditionId||current.system.contentId===conditionId)return current;await clearMember(root,actor,{note:'Estado atualizado após resistência.'});return applyMember(root,actor,conditionId,{forced});}
 const applicationKey=root.uuid+'#'+actor.uuid+'#'+(entry.generation??0),options={sourceUuid:root.uuid,casterUuid:root.actor.uuid,origin:root.name,duration:m.duration,durationRule:{mode:'manual'},applicationKey,note:m.kind==='prisao-de-agua'?(m.stage>=9?'Sufocamento: não pode respirar.':'Pode respirar/falar.')+' Libertação dá mobilidade para atacar a prisão, sem permitir atravessá-la.':m.kind==='deslocamento-de-vacuo'?'Deslocamento +'+m.movementBonus+'m até o início do próximo turno do usuário.':''};
 let item;if(conditionId)item=await applyCondition(actor,conditionId,options);else{[item]=await actor.createEmbeddedDocuments('Item',[{name:root.name,type:'effect',img:root.img,system:{contentId:'sns:state:ambiente-recebido',description:root.system.description,appliedCondition:{managed:true,active:true,scope:'all',...options,durationRule:durationRule({mode:'manual'}),appliedAt:new Date().toISOString(),appliedBy:game.user.id}}}]);}
 if(!item)throw Error('Não foi possível aplicar o estado ao participante.');
 if(!root.system.appliedCondition.active){await item.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()});return null;}
 await item.update({['flags.'+ns+'.environmentMember']:{rootUuid:root.uuid,kind:m.kind,stage:m.stage,dc:m.dc,movementBonus:m.movementBonus,escaped:entry.escaped===true,inside:true}});
 await root.update({['flags.'+ns+'.environment.members.'+k]:{...entry,uuid:actor.uuid,name:actor.name,inside:true,itemId:item.id,forced}});return item;
}
async function clearMember(root,actor,{leave=false,note='Estado encerrado'}={}){
 const m=environmentData(root),k=key(actor.uuid),entry=m.members[k];if(!entry)return;
 const i=actor.items.get(entry.itemId);if(i?.system.appliedCondition.active)await i.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString(),'system.appliedCondition.note':note});
 await root.update({['flags.'+ns+'.environment.members.'+k]:{...entry,inside:leave?false:entry.inside,itemId:'',generation:(entry.generation??0)+1}});
 if(leave)for(const message of game.messages??[]){const pulse=message.getFlag(ns,'environmentPulse');if(pulse?.rootUuid!==root.uuid||pulse.targetUuid!==actor.uuid||message.getFlag(ns,'defenseResults')?.[k]||pulse.cancelled)continue;await message.update({['flags.'+ns+'.environmentPulse.cancelled']:true});const request=await fromUuid(message.getFlag(ns,'damageUse')?.defenseRequestUuid);if(request)await request.update({['flags.'+ns+'.defenseRequest.status']:'cancelled'});}

}
export async function endEnvironment(root,reason='Encerrado'){
 if(!isTimekeeper()||!environmentData(root))return;
 await (await import('./advanced-service.mjs')).advancedEnd(root);
 if(root.system.appliedCondition.active)await root.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString(),'system.appliedCondition.note':reason});
 for(const actor of clockActors())for(const item of actor.items)if(environmentMember(item)?.rootUuid===root.uuid&&item.system.appliedCondition.active)await item.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString(),'system.appliedCondition.note':reason});
 for(const member of Object.values(environmentData(root).members))if(member.inside){const actor=await fromUuid(member.uuid);if(actor)await clearMember(root,actor,{leave:true,note:reason});}
}
async function acceptCast(reply){
 const r=reply.getFlag(ns,'environmentCast');if(!r)return;const message=await fromUuid(r.useUuid),use=message?.getFlag(ns,'environmentUse'),actor=await fromUuid(use?.actorUuid),item=await fromUuid(use?.itemUuid);
 if(item?.actor!==actor||!actor.testUserPermission(reply.author,'OWNER')||!actor.testUserPermission(message.author,'OWNER'))throw Error('A origem não está disponível ou você não tem permissão.');
 return withEffectLock(message,async()=>{
 let root;await withEffectLock(actor,async()=>{if(!['choose','blocked','casting'].includes(message.getFlag(ns,'environmentUse').status))return;root=await createRoot(actor,item,{...r.selection,usedLevel:use.usedLevel??item.system.jutsu.usedLevel},use.targets,message.uuid);await message.update({['flags.'+ns+'.environmentUse']:{...use,status:'casting',rootUuid:root.uuid,cost:environmentData(root).cost}});});if(!root)return;
 const m=environmentData(root);
 if(m.advanced)await (await import('./advanced-service.mjs')).advancedInitial(root,use.targets,advancedContext());
 else if(m.kind==='purificar')await purify(root,r.selection.rootUuid);
 else if(m.kind==='prisao-de-agua'||m.kind==='barreira'&&m.mode==='cage'||m.kind==='restringente'){if(!m.initialAttackUuid){const attack=await environmentAttack(root,use.targets,{initial:true});if(!attack)throw Error('Ataque cancelado. O chakra já foi gasto; continue pelo mesmo cartão.');await root.update({['flags.'+ns+'.environment.initialAttackUuid']:attack.uuid});}}
 else if(['deslocamento-de-vacuo','nuvem','nevoa'].includes(m.kind)){
  if(m.kind==='deslocamento-de-vacuo'&&r.selection.willing!==true)throw Error('Selecione alvos voluntários no meio elemental apropriado.');
  const targets=m.kind==='deslocamento-de-vacuo'?use.targets:[...use.targets,...(r.selection.includeSelf?[{uuid:actor.uuid,name:actor.name}]:[])];
  for(const t of [...new Map(targets.map(t=>[t.uuid,t])).values()]){const a=await fromUuid(t.uuid);if(!a)continue;if(m.kind==='nuvem'&&a.uuid===actor.uuid)continue;await applyMember(root,a,null);}
 }
 await root.update({'system.appliedCondition.note':environmentSummary(root)});await message.update({content:techniqueCard(item,jutsuProjection(item,{usedLevel:use.usedLevel})),['flags.'+ns+'.environmentUse.status']:'active'});
 });
}
export async function environmentAttack(root,targets,{initial=false}={}){
 const m=environmentData(root),actor=root.actor,item=actor.items.get(m.sourceId),{declareDefenses}=await import('./defense-workflow.mjs');
 const list=await Promise.all(targets.map(async t=>({actor:await fromUuid(t.uuid),name:t.name})));if(!list.length)return null;
 const profile={base:0,fixed:0,nature:'lethal',criticalAt:15,noDamage:true,attackKind:m.kind==='restringente'?'area':'techniqueProjectile',environment:{rootUuid:root.uuid,kind:m.kind,initial},attackerSize:actor.system.identity?.size||actor.system.details?.size||''};
 if(initial&&m.kind==='restringente')for(const t of list){if(hasFlight(t.actor))continue;const entry=environmentData(root).members[key(t.actor.uuid)];if(!entry)await root.update({['flags.'+ns+'.environment.members.'+key(t.actor.uuid)]:{uuid:t.actor.uuid,name:t.actor.name,inside:true,initialPending:true,generation:0}});}
 const uuid=await declareDefenses(actor,item,profile,list);if(uuid===null)return null;let spec=defenseSpec(actor,'cd');if(!spec)throw Error('Informe Combate à Distância.');const penalty=m.kind==='prisao-de-agua'?-3:m.kind==='barreira'?-2:0;spec={...spec,adjustment:spec.adjustment+penalty,formula:spec.formula+(penalty?' - '+(-penalty):'')};
 const roll=await new foundry.dice.Roll(spec.formula).evaluate(),packet=damageSnapshot(actor,item,profile,list,roll,spec);packet.defenseRequestUuid=uuid;
 return roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'<section class="sns-technique-card"><header class="sns-technique-title"><img src="'+root.img+'" alt=""><strong>'+esc(root.name)+'</strong></header><p>'+esc(m.kind==='prisao-de-agua'?'CD−3 ·1m · contato e concentração':m.kind==='barreira'?'Enjaular · CD−2':'Área grudenta · defesa inicial')+'</p></section>',flags:{[ns]:{damageUse:packet,check:{actorImg:actor.img,key:'cd'}}}});
}
async function applyAttackMembers(message){
 const p=message.getFlag(ns,'damageUse');if(!p?.profile.environment||!message.getFlag(ns,'defenseResults'))return;
 const root=await fromUuid(p.profile.environment.rootUuid);if(!root?.system.appliedCondition.active||!environmentData(root)||root.actor.uuid!==p.actorUuid||!root.actor.testUserPermission(message.author,'OWNER'))return;
 for(const target of p.targets){const result=message.getFlag(ns,'defenseResults')[key(target.uuid)],actor=await fromUuid(target.uuid);if(!result||result.hit==='pending'||!actor)continue;const m=environmentData(root),entry=m.members[key(actor.uuid)];
  if(entry?.attackUuid===message.uuid)continue;
  if(m.kind==='restringente'&&hasFlight(actor)){if(entry)await clearMember(root,actor,{leave:true,note:'Voo: não é afetado pelo chão restringente.'});continue;}
  if(result.hit==='hit'){await applyMember(root,actor,memberCondition(m));if(m.kind==='prisao-de-agua'&&m.stage>=9)await (await import('./advanced-service.mjs')).prisonSuffocation(root,actor);}
  else if(m.kind==='restringente')await root.update({['flags.'+ns+'.environment.members.'+key(actor.uuid)]:{...entry,inside:true,initialPending:true,uuid:actor.uuid,name:actor.name}});
  if(environmentData(root).members[key(actor.uuid)])await root.update({['flags.'+ns+'.environment.members.'+key(actor.uuid)+'.attackUuid']:message.uuid});
 }
}
async function rollTest(actor,testKey,dc,name){const spec=defenseSpec(actor,testKey);if(!spec)throw Error('Informe a precisão de '+testKey+'.');const roll=await new foundry.dice.Roll(spec.formula).evaluate(),r=rolledCheck(roll,spec);const message=await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'<section class="sns-technique-card"><header class="sns-technique-title"><strong>'+esc(name)+'</strong></header><p>Dif '+dc+'</p></section>',flags:{[ns]:{check:{actorImg:actor.img,key:testKey},environmentTest:{dc,result:versusDifficulty(r,dc)}}}});return {passed:versusDifficulty(r,dc)==='passed',roll:r,message};}
async function purify(root,uuid){const source=await fromUuid(uuid),m=environmentData(root),s=environmentData(source);if(!s||!['nuvem','nevoa','restringente'].includes(s.kind)||source.parent?.documentName!=='Actor')throw Error('Escolha uma substância ambiental conhecida. Objetos/prisões não são substâncias para Purificar.');const plan=purificationPlan(m.usedLevel,s);if(!plan.allowed)throw Error('Nível insuficiente para purificar esta substância.');if(plan.automatic||(await rollTest(root.actor,'attribute:esp',s.dc,'Purificar')).passed)await endEnvironment(source,'Ambiente purificado.');await endEnvironment(root,'Purificação resolvida.');}
async function acceptControl(reply){
 const r=reply.getFlag(ns,'environmentControl');if(!r)return;r.requestUuid=reply.uuid.replaceAll('.','~');const root=await fromUuid(r.rootUuid),m=environmentData(root);if(!m)return;const target=r.targetUuid&&await fromUuid(r.targetUuid),owner=root.actor.testUserPermission(reply.author,'OWNER'),member=target&&m.members[key(target.uuid)];
 const advancedResult=await (await import('./advanced-service.mjs')).advancedControl(root,r,reply.author,advancedContext());if(advancedResult)return advancedResult;
 if(r.action==='escape'){
  if(!target?.testUserPermission(reply.author,'OWNER')||!member?.inside||!['restringente','prisao-de-agua'].includes(m.kind)||!root.system.appliedCondition.active)throw Error('Você não é um participante deste efeito.');
  const combat=actorCombat(target);if(combat?.started&&combat.combatant?.actor?.uuid!==target.uuid)throw Error('O teste de libertação usa o próprio turno.');
  if(!(['attribute:for',...(m.kind==='restringente'?['skill:escapar']:['attribute:vig'])].includes(r.key)))throw Error('Teste de libertação não permitido.');
  const test=await rollTest(target,r.key,m.dc-(m.kind==='prisao-de-agua'&&r.key==='attribute:vig'?2:0),root.name+' · libertação');if(test.passed){await clearMember(root,target,{note:m.kind==='prisao-de-agua'?'Mobilidade para atacar a prisão por dentro.':'Livre até o fim deste turno.'});await root.update({['flags.'+ns+'.environment.members.'+key(target.uuid)+'.escaped']:true,['flags.'+ns+'.environment.members.'+key(target.uuid)+'.escapeTurn']:stamp(target)});if(m.kind==='prisao-de-agua')await applyMember(root,target,null);}return;
 }
 if(!owner&&!reply.author.isGM)throw Error('Somente o usuário da técnica pode controlá-la.');
 if(r.action==='end'){if(m.permanent&&!reply.author.isGM)throw Error('Somente o mestre remove o registro de cobertura permanente.');return endEnvironment(root);}
 if(r.action==='members'){
  if(!reply.author.isGM)throw Error('Somente o mestre pode alterar os participantes da área.');const targets=damageTargets(await Promise.all((r.targets??[]).map(async uuid=>({actor:await fromUuid(uuid)}))));
  const keep=new Set(targets.map(t=>t.uuid));for(const row of Object.values(m.members))if(row.inside&&!keep.has(row.uuid)){const a=await fromUuid(row.uuid);if(a)await clearMember(root,a,{leave:true,note:'Saiu da área.'});}
  for(const row of targets){const a=await fromUuid(row.uuid);if(m.kind==='restringente'&&hasFlight(a)||m.kind==='nuvem'&&a.uuid===root.actor.uuid)continue;await applyMember(root,a,m.kind==='restringente'?memberCondition(m):null);}return;
 }
 if(r.action==='sustain'){if(supportUnable(root.actor))return endEnvironment(root,'Usuário incapaz de sustentar.');const c=actorCombat(root.actor);if(c?.started&&c.combatant?.actor?.uuid!==root.actor.uuid)throw Error('Sustente no próprio turno.');await root.update({['flags.'+ns+'.environment.pending']:false,['flags.'+ns+'.environment.maintainedTurn']:stamp(root.actor)});return;}
 if(r.action==='concentration'){if(!m.concentration)throw Error('Este efeito não exige concentração.');if(!(await rollTest(root.actor,'skill:concentracao',9+2*m.usedLevel,root.name+' · concentração')).passed){if(m.kind==='desastre')await (await import('./advanced-service.mjs')).advancedControl(root,{action:'end'},game.user,advancedContext());else await endEnvironment(root,'Concentração interrompida.');}return;}
 if(r.action==='restore'){if(m.kind!=='prisao-de-agua'||!root.system.appliedCondition.active)throw Error('A prisão não está ativa.');const ledger=root.actor.getFlag(ns,'environmentLedger')?.[reply.id];if(!ledger){const ch=root.actor.system.resources.chakra.value;if(ch<m.cost)throw Error('Chakra insuficiente.');await root.actor.update({'system.resources.chakra.value':ch-m.cost,['flags.'+ns+'.environmentLedger.'+reply.id]:{cost:m.cost,rootUuid:root.uuid,action:'restore'}});}await root.update({['flags.'+ns+'.environment.remainingHardness']:m.maxHardness});return;}
 if(r.action==='pulse'){if(!reply.author.isGM||actorCombat(root.actor)?.started)throw Error('No combate, os turnos são contados automaticamente. Fora dele, somente o mestre pode avançar.');return pulseCloud(root,r.eventKey??reply.uuid);}
 if(r.action==='objectDamage'){if(!reply.author.isGM)throw Error('Somente o mestre pode resolver o ataque contra o objeto.');return (await import('./environment-protection.mjs')).damageEnvironmentObject(root,r.attackUuid);}
 throw Error('Ação indisponível.');
}
async function pulseCloud(root,eventKey){
 const m=environmentData(root);if(m.kind!=='nuvem'||!root.system.appliedCondition.active)return;const {beginDefenseDeclaration}=await import('./defense-workflow.mjs');
 for(const member of Object.values(m.members).filter(r=>r.inside&&r.uuid!==root.actor.uuid)){
  const actor=await fromUuid(member.uuid);if(!actor)continue;const id=key(eventKey+'#'+actor.uuid);if(environmentData(root).pulses?.[id])continue;
  const profile={base:0,fixed:m.damage,nature:'lethal',criticalAt:15,attackKind:'resistance',resistance:{keys:['attribute:vig'],difficulty:m.dc-2},environmentPulse:{rootUuid:root.uuid,eventKey,generation:environmentData(root).members[key(actor.uuid)]?.generation??0}},req=await beginDefenseDeclaration(root.actor,root.actor.items.get(m.sourceId),profile,[{actor,name:actor.name}]);
  const p=damageSnapshot(root.actor,root.actor.items.get(m.sourceId),profile,[{actor,name:actor.name}]);p.defenseRequestUuid=req.uuid;
  const message=await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:root.actor}),content:'<section class="sns-technique-card"><header class="sns-technique-title"><img src="icons/svg/acid.svg" alt=""><strong>Nuvem · '+esc(actor.name)+'</strong></header><p>Vigor Dif'+(m.dc-2)+' · falha: dano fixo'+m.damage+' e Lento.</p></section>',flags:{[ns]:{damageUse:p,environmentPulse:{rootUuid:root.uuid,targetUuid:actor.uuid,generation:profile.environmentPulse.generation},check:{actorImg:root.actor.img,key:'jutsu'}}}});
  await root.update({['flags.'+ns+'.environment.pulses.'+id]:message.uuid});
 }
}
async function resolvePulse(message){const p=message.getFlag(ns,'environmentPulse'),result=p&&message.getFlag(ns,'defenseResults')?.[key(p.targetUuid)];if(!result||result.hit==='pending'||p.cancelled)return;const root=await fromUuid(p.rootUuid),actor=await fromUuid(p.targetUuid);if(!actor||!root?.system.appliedCondition.active||!environmentData(root)?.members[key(actor.uuid)]?.inside||p.generation!==undefined&&p.generation!==(environmentData(root).members[key(actor.uuid)].generation??0))return;if(result.hit==='hit')await applyMember(root,actor,'sns:condition:lento');else await clearMember(root,actor,{note:'Passou no teste de Vigor da Nuvem (decisão D133).'});}
export async function processEnvironmentTurn(actor,event){
 if(!isTimekeeper())return;
 await (await import('./advanced-service.mjs')).advancedStateTurns(actor,event,advancedContext());
 if(event.phase==='start'&&event.actor?.uuid===actor.uuid&&actor.flags?.[ns]?.environmentRepelirWindow)await actor.unsetFlag(ns,'environmentRepelirWindow');
 for(const root of activeEnvironments(actor)){
  let m=environmentData(root);if(m.permanent)continue;
  if(m.advanced){await (await import('./advanced-service.mjs')).advancedTurn(root,event,advancedContext());m=environmentData(root);if(!root.system.appliedCondition.active)continue;}
  const own=event.actor?.uuid===actor.uuid,same=m.activationTurn?.combatId===event.combatId&&m.activationTurn?.round===event.round&&m.activationTurn?.combatantId===event.combatantId;
  if(own&&event.phase==='start'&&!same){if(m.kind==='deslocamento-de-vacuo'){await endEnvironment(root,'Início do próximo turno do usuário.');continue;}if(m.duration==='Sustentada'||m.concentration)await root.update({['flags.'+ns+'.environment.pending']:true});if(m.kind==='nuvem')await pulseCloud(root,[event.combatId,event.round,event.combatantId].join('~'));}
  if(own&&event.phase==='end'&&environmentData(root).pending){if(m.kind==='desastre'&&!m.drifting){await (await import('./advanced-service.mjs')).advancedControl(root,{action:'end'},game.user,advancedContext());continue;}await endEnvironment(root,'Não manteve a ação de sustentação/concentração.');continue;}
  if(m.kind==='restringente'&&event.phase==='end'){const row=m.members[key(event.actor?.uuid??'')];if(row?.inside&&(row.escaped||row.initialPending)){if(hasFlight(event.actor)){await clearMember(root,event.actor,{leave:true});continue;}await root.update({['flags.'+ns+'.environment.members.'+key(event.actor.uuid)+'.escaped']:false,['flags.'+ns+'.environment.members.'+key(event.actor.uuid)+'.initialPending']:false});await applyMember(root,event.actor,memberCondition(m));}}
 }
}
async function reconcile(actor){await (await import('./advanced-service.mjs')).advancedReconcile(actor,advancedContext());for(const root of activeEnvironments(actor)){const m=environmentData(root);if(!m.permanent&&supportUnable(actor)){if(m.kind==='desastre'){if(!m.drifting)await (await import('./advanced-service.mjs')).advancedControl(root,{action:'end'},game.user,advancedContext());}else await endEnvironment(root,'Usuário incapaz de manter a técnica.');}if(!m.permanent&&m.kind!=='desastre'&&!actor.items.has(m.sourceId))await endEnvironment(root,'Origem da técnica removida.');}}
export function installEnvironmentHooks(){
 const process=async message=>{if(!isTimekeeper())return;if(busy.has(message.uuid)){again.add(message.uuid);return;}busy.add(message.uuid);try{do{again.delete(message.uuid);await acceptCast(message);if(message.getFlag(ns,'environmentControl')&&!message.getFlag(ns,'environmentControlResult')){const result=await withEffectLock(await fromUuid(message.getFlag(ns,'environmentControl').rootUuid),()=>acceptControl(message));await message.update({['flags.'+ns+'.environmentControlResult']:{status:'resolved',...(typeof result==='object'?result:{})}});}await applyAttackMembers(message);await resolvePulse(message);const advanced=await import('./advanced-service.mjs');await advanced.advancedResolve(message,advancedContext());await advanced.advancedReveal(message);}while(again.delete(message.uuid));}catch(e){const r=message.getFlag(ns,'environmentCast'),use=r&&await fromUuid(r.useUuid);if(use)await use.update({['flags.'+ns+'.environmentUse.status']:'blocked',['flags.'+ns+'.environmentUse.reason']:e.message});if(message.getFlag(ns,'environmentControl')&&!message.getFlag(ns,'environmentControlResult'))await message.update({['flags.'+ns+'.environmentControlResult']:{status:'blocked',reason:e.message}});ui.notifications.warn(e.message);console.error('SNS · ambiente',e);}finally{busy.delete(message.uuid);}};
 Hooks.on('updateWorldTime',()=>{if(isTimekeeper())for(const a of clockActors())void withEffectLock(a,()=>reconcile(a));});
 Hooks.on('createChatMessage',process);Hooks.on('updateChatMessage',process);
 Hooks.on('updateItem',async item=>{if(!isTimekeeper())return;const member=environmentMember(item),source=member&&await fromUuid(member.rootUuid);if(member&&item.system.appliedCondition.active&&!source?.system.appliedCondition.active)await item.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()});});
 Hooks.on('deleteItem',async item=>{if(!isTimekeeper()||!environmentData(item))return;await (await import('./advanced-service.mjs')).advancedEnd(item);for(const actor of clockActors())for(const child of actor.items)if(environmentMember(child)?.rootUuid===item.uuid&&child.system.appliedCondition.active)await child.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString(),'system.appliedCondition.note':'Origem do efeito removida.'});});
 Hooks.on('updateActor',(actor,changes)=>{if(!touches(changes,['system.resources','system.attributes','system.nc','system.modifiers','system.activeAptitudes','flags.sns-v14-dev.environment','flags.sns-v14-dev.transformations']))return;if(isTimekeeper())void withEffectLock(actor,()=>reconcile(actor));});Hooks.on('deleteItem',item=>{if(isTimekeeper()&&item.actor)void withEffectLock(item.actor,()=>reconcile(item.actor));});
 Hooks.on('preUpdateChatMessage',(message,changes,options,userId)=>{if(game.users.get(userId)?.isGM)return;const e=foundry.utils.expandObject(changes);if(e.flags?.[ns]?.environmentVisual||e.flags?.[ns]?.['-=environmentVisual']||message.getFlag(ns,'environmentVisualProof')&&['flags','author','speaker','-=flags'].some(k=>Object.hasOwn(e,k)))return false;if(['environmentUse','environmentCast','environmentControl','environmentPulse','environmentControlResult','advancedEvent','advancedAttack','advancedTest','advancedResolved','advancedDamageKey'].some(k=>message.getFlag(ns,k))&&['flags','author','speaker','rolls','-=flags'].some(k=>Object.hasOwn(e,k)))return false;});
}
