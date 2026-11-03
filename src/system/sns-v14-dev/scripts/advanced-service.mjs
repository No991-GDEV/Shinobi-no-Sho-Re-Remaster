import {advancedState,advancedStates,advancedDamage,continuousStep,poisonDefinition,originalSkill,liveAdvanced} from './advanced-core.mjs';
import {environmentData} from './environment-core.mjs';
import {isTimekeeper,withEffectLock,clockActors} from './effect-lifecycle.mjs';
import {actorCombat,durationRule,durationClock,advanceDuration} from './effect-duration.mjs';
import {defenseSpec} from './defense-choices.mjs';
import {rolledCheck,versusDifficulty} from './jutsu-outcomes.mjs';
import {damageSnapshot} from './damage-source.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev',key=u=>u.replaceAll('.','~');
const active=item=>item?.system.appliedCondition?.active;
const eventKey=e=>[e.combatId,e.round,e.combatantId,e.phase].join('~');
async function stateFor(root,actor,kind,extra={},identity=''){
 const id=root.uuid+'#'+actor.uuid+'#'+kind+'#'+identity,prior=actor.items.find(i=>i.system.appliedCondition?.applicationKey===id);if(prior&&active(prior))return prior;if(prior)return stateFor(root,actor,kind,extra,identity+'~'+foundry.utils.randomID());
 const m=environmentData(root),[state]=await actor.createEmbeddedDocuments('Item',[{name:kind==='venenoso'?m.poison.name:root.name,type:'effect',img:root.img,system:{contentId:'sns:state:tecnica-avancada',description:kind==='venenoso'?m.poison.description:root.system.description,source:root.system.source,appliedCondition:{managed:true,active:true,scope:'all',origin:root.name,sourceUuid:root.uuid,casterUuid:root.actor.uuid,duration:kind==='dano-continuo'?m.doses+' doses':kind==='venenoso'?'Conforme o veneno':m.duration,durationRule:durationRule({mode:'manual'}),applicationKey:id,appliedBy:game.user.id,appliedAt:new Date().toISOString()}},flags:{[ns]:{advancedState:{rootUuid:root.uuid,targetUuid:actor.uuid,kind,element:m.element,stage:m.stage,dc:m.dc,usedLevel:m.usedLevel,events:{},...extra}}}}]);
 if(!state)throw Error('O estado não foi criado. Retome esta resolução.');if(['inflamavel','desastre','colisao-de-ondas'].includes(kind))await root.update({['flags.'+ns+'.environment.members.'+key(actor.uuid)]:{uuid:actor.uuid,name:actor.name,itemId:state.id,inside:true}});return state;
}
async function endState(state,note='Encerrado'){
 for(const message of game.messages??[]){const e=message.getFlag(ns,'advancedEvent');if(e&&['pending','breathPending'].includes(e.status)&&(e.stateUuid===state.uuid||!e.stateUuid&&e.rootUuid===advancedState(state).rootUuid&&e.targetUuid===state.actor.uuid))await message.update({['flags.'+ns+'.advancedEvent.status']:'cancelled'});}
 if(active(state))await state.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString(),'system.appliedCondition.note':note});
 for(const i of state.actor.items)if(i.flags?.[ns]?.advancedChild===state.uuid&&active(i))await i.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()});
}
export async function endAdvancedState(state,note){if(!isTimekeeper())throw Error('O mestre ativo encerra estados vinculados.');return endState(state,note);}
async function conditionChild(state,id,ctx){
 const prior=state.actor.items.find(i=>i.flags?.[ns]?.advancedChild===state.uuid&&i.system.contentId===id&&active(i));if(prior)return prior;
 const {applyCondition}=await import('./condition-application.mjs');const i=await applyCondition(state.actor,id,{origin:state.name,sourceUuid:state.uuid,applicationKey:state.uuid+'#'+id+'#'+(advancedState(state).childGeneration??0),duration:'Enquanto este efeito permanecer',durationRule:{mode:'manual'}});if(i)await i.update({['flags.'+ns+'.advancedChild']:state.uuid});return i;
}
async function check(actor,keyName,dc,title,{resistance=false,suffocation=false}={}){
 const spec=defenseSpec(actor,keyName,null,0,[],{resistance:resistance?{}:null,suffocation});if(!spec)throw Error('Informe a precisão de '+keyName+'.');
 const roll=await new foundry.dice.Roll(spec.formula).evaluate(),result=versusDifficulty(rolledCheck(roll,spec),dc),message=await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'<section class="sns-technique-card"><header class="sns-technique-title"><strong>'+esc(title)+'</strong></header><p>Dif '+dc+'</p><p class="sns-save-verdict '+(result==='passed'?'is-resisted':'is-affected')+'">'+(result==='passed'?'Sucesso':'Falha')+'</p></section>',flags:{[ns]:{check:{actorImg:actor.img,key:keyName},advancedTest:{dc,result,key:keyName}}}});return {passed:result==='passed',message};
}
async function eventCard(root,actor,type,id,description,state=null){
 let message=game.messages.find(m=>m.author?.isGM&&m.getFlag(ns,'advancedEvent')?.key===id);if(message)return message;
 return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:root.actor}),content:'<section class="sns-technique-card"><header class="sns-technique-title"><img src="'+root.img+'" alt=""><strong>'+esc(root.name)+' · '+esc(actor.name)+'</strong></header><p>'+esc(description)+'</p></section>',flags:{[ns]:{check:{actorImg:actor.img,key:'jutsu'},advancedEvent:{rootUuid:root.uuid,targetUuid:actor.uuid,type,key:id,status:'pending',stateUuid:state?.uuid??'',turnNumber:state?advancedState(state).breathTurns??0:0}}}});
}
async function fixedDamage(root,actor,amount,id,title,{common=false}={}){
 let message=game.messages.find(m=>m.author?.isGM&&m.getFlag(ns,'advancedDamageKey')===id);
 const {showDamage,packetSpecFor,applyPacketDamage}=await import('./damage-chat.mjs');
 if(!message){const p=damageSnapshot(root.actor,root.actor.items.get(environmentData(root).sourceId),{base:common?amount:0,fixed:common?0:amount,criticalAt:15,nature:'lethal',attackKind:'ongoing'},[{actor,name:actor.name}]);p.name=title;if(common){const roll=await new foundry.dice.Roll('2d8').evaluate();p.requestedGrade=(await import('./damage-core.mjs')).damageGrade(roll.total,{automatic:true});await roll.toMessage({speaker:ChatMessage.getSpeaker({actor:root.actor}),flavor:'Grau de dano · '+esc(title)});}message=await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:root.actor}),content:'<section class="sns-technique-card"><header class="sns-technique-title"><img src="'+root.img+'" alt=""><strong>'+esc(title)+'</strong></header><p>'+ (common?'DB '+amount+' · Grau '+p.requestedGrade:'Dano fixo '+amount)+'</p></section>',flags:{[ns]:{damageUse:p,advancedDamageKey:id}}});}
 await showDamage(message);const p=message.getFlag(ns,'damageUse'),spec=packetSpecFor(message,p,message.getFlag(ns,'damagePresentation').spec,actor);await applyPacketDamage(message,actor,{spec,decision:{hit:'hit'}});return message;
}
export async function advancedAttack(root,targets,profile=advancedDamage(environmentData(root)),{penalty=0,token='initial',sourceItem=null,projection=null}={}){
 if(!isTimekeeper()||!active(root))throw Error('Técnica indisponível.');
 const prior=game.messages.find(m=>m.author?.isGM&&m.getFlag(ns,'advancedAttack')?.rootUuid===root.uuid&&m.getFlag(ns,'advancedAttack')?.token===token);if(prior)return prior;
 const actor=root.actor,item=sourceItem??actor.items.get(environmentData(root).sourceId),list=[];for(const t of targets){const a=await fromUuid(t.uuid);if(a&&!advancedStates(a).some(i=>advancedState(i).kind==='colisao-de-ondas'&&advancedState(i).submerged))list.push({actor:a,name:a.name});}
 if(!list.length)throw Error('Não há alvos válidos; criaturas submersas não são atacadas fisicamente.');
 const {declareJutsuDefenses}=await import('./pre-defense.mjs');const request=await declareJutsuDefenses(actor,item,profile,list);if(request===null)throw Error('Ataque cancelado. O uso já iniciado não reembolsa chakra.');
 const checkKey=profile.decapitation?'cc':'cd',base=defenseSpec(actor,checkKey);if(!base)throw Error('Informe Combate à Distância.');const spec={...base,adjustment:base.adjustment+penalty,formula:base.formula+(penalty<0?' - '+(-penalty):penalty>0?' + '+penalty:'')},roll=await new foundry.dice.Roll(spec.formula).evaluate(),packet=damageSnapshot(actor,item,profile,list,roll,spec);packet.defenseRequestUuid=request;const use=projection?(await import('./jutsu-outcomes.mjs')).useSnapshot(actor,item,projection,list):null;if(use)use.attack=packet.attack;
 const message=await roll.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'<section class="sns-technique-card"><header class="sns-technique-title"><img src="'+root.img+'" alt=""><strong>'+esc(root.name)+'</strong></header><p>'+esc(profile.advancedKind==='meteoros'?'Dano fixo por meteoro; sobreposição por alvo.':profile.advancedKind==='lamina-de-vento'?'Lâminas de DB3 · um ataque e uma defesa.':'Ataque da técnica')+'</p></section>',flags:{[ns]:{...(use?{jutsuUse:use}:{}),damageUse:packet,check:{actorImg:actor.img,key:'cd'},advancedAttack:{rootUuid:root.uuid,token}}}});if(use)await (await import('./jutsu-application.mjs')).afterJutsuMessage(message);return message;
}
export async function advancedInitial(root,targets,ctx){
 const m=environmentData(root);
 if(m.kind==='imergir'){await root.update({['flags.'+ns+'.environment.hidden']:true});return;}
 if(m.kind==='flutuar'){if(m.mode==='land')await ctx.endEnvironment(root,'Descida suave concluída.');return;}
 if(m.kind==='inflamavel'){if(m.mode==='continuous'){const selected=[...targets,...(m.selection.includeSelf?[{uuid:root.actor.uuid}]:[])];for(const row of [...new Map(selected.map(t=>[t.uuid,t])).values()]){const a=await fromUuid(row.uuid);if(a)await stateFor(root,a,m.kind);}}return;}
 if(m.kind==='desastre'){for(const row of targets){const a=await fromUuid(row.uuid);if(a&&a.uuid!==root.actor.uuid){const state=await stateFor(root,a,m.kind);await conditionChild(state,'sns:condition:lento',ctx);}}return;}
 await advancedAttack(root,targets,advancedDamage(m),{penalty:m.kind==='meteoros'&&m.mode==='aimed'?-3:0});
}
async function injectPoison(root,targets){const m=environmentData(root);
  for(const row of targets){const a=await fromUuid(row.uuid);if(!a)continue;let state=advancedStates(a).find(i=>advancedState(i).kind==='venenoso'&&advancedState(i).poison.id===m.poison.id);
   if(state){await eventCard(root,a,'poisonReinfect',root.uuid+'#reinfect#'+a.uuid,'Nova exposição: resistir para não perder um sucesso.',state);continue;}
   state=await stateFor(root,a,m.kind,{poison:m.poison,failures:0,successes:0,activePoison:true,scene:a.flags?.[ns]?.magenScene??0});await eventCard(root,a,'poison',state.uuid+'#initial','Vigor Dif '+m.poison.dc+' · exposição pelo efeito Venenoso.');
  }
}
export async function advancedResolve(message,ctx){
 const data=message.getFlag(ns,'advancedAttack'),p=message.getFlag(ns,'damageUse');if(!isTimekeeper()||!data||!p)return;
 const root=await fromUuid(data.rootUuid),m=environmentData(root);if(!m||root.actor.uuid!==p.actorUuid||!root.actor.testUserPermission(message.author,'OWNER'))return;
 for(const row of p.targets){const r=message.getFlag(ns,'defenseResults')?.[key(row.uuid)];if(!r||!['hit','miss'].includes(r.hit)||message.getFlag(ns,'advancedResolved')?.[key(row.uuid)])continue;
  const a=await fromUuid(row.uuid);if(!a)continue;
  if(r.hit==='hit'){
   if(m.kind==='venenoso')await injectPoison(root,[row]);
   if(m.kind==='dano-continuo')await stateFor(root,a,m.kind,{damage:m.usedLevel,remaining:m.doses-1,seen:0,lastEvent:''},message.id);
   if(m.kind==='colisao-de-ondas'&&active(root))await stateFor(root,a,m.kind,{submerged:true,breathTurns:0,damage:m.damage},message.id);
   if(p.profile.decapitation){const state=await stateFor(root,a,'decapitation',{dc:10},message.id);await conditionChild(state,'sns:condition:impedido',ctx);}
  }
  await message.update({['flags.'+ns+'.advancedResolved.'+key(row.uuid)]:{hit:r.hit,at:new Date().toISOString()}});
 }
 if(p.targets.every(t=>message.getFlag(ns,'advancedResolved')?.[key(t.uuid)])&&['meteoros','lamina-de-vento','dano-continuo','venenoso'].includes(m.kind))await ctx.endEnvironment(root,'Ataque resolvido. Estados recebidos mantêm suas durações próprias.');
}
async function poisonMixture(actor){
 const states=advancedStates(actor).filter(i=>advancedState(i).kind==='venenoso'&&advancedState(i).failures>0&&!advancedState(i).suppressed),max=Math.max(-1,...states.map(i=>advancedState(i).poison.category)),same=states.filter(i=>advancedState(i).poison.category===max),current=same.filter(i=>advancedState(i).activePoison);let chosen=current.length===1?current[0]:same[0];
 if(same.length>1&&current.length!==1){const die=await new foundry.dice.Roll('1d'+same.length).evaluate();chosen=same[die.total-1];await die.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'<strong>Adaptação a venenos da mesma categoria</strong>'});}
 for(const i of states)if(advancedState(i).activePoison!==(i===chosen))await i.update({['flags.'+ns+'.advancedState.activePoison']:i===chosen});
}
async function poisonTest(root,state,event,reinfect,ctx){
 const m=advancedState(state);if(!active(state)||m.suppressed&&!reinfect){await event.update({['flags.'+ns+'.advancedEvent.status']:'cancelled'});return;}const actor=state.actor,definition=poisonDefinition(m.poison.id),result=await check(actor,'attribute:vig',m.poison.dc,state.name,{resistance:true});
 if(reinfect){if(!result.passed)await state.update({['flags.'+ns+'.advancedState.successes']:Math.max(0,m.successes-1),['flags.'+ns+'.advancedState.suppressed']:false});}
 else{const successes=m.successes+(result.passed?1:0),failures=m.failures+(result.passed?0:1);await state.update({['flags.'+ns+'.advancedState.successes']:successes,['flags.'+ns+'.advancedState.failures']:failures,['flags.'+ns+'.advancedState.suppressed']:successes>=3,['flags.'+ns+'.advancedState.scene']:actor.flags?.[ns]?.magenScene??0,...(!result.passed&&!m.expiresAt&&definition.hours?{['flags.'+ns+'.advancedState.expiresAt']:game.time.worldTime+definition.hours*3600}:{})});
  if(successes>=3){if(definition.sleepFailures&&failures<definition.sleepFailures)await state.update({['flags.'+ns+'.advancedState.sleepPrevented']:definition.id==='sns:poison:sonifero-menor',['flags.'+ns+'.advancedState.deferredSleep']:definition.id==='sns:poison:sonifero'});for(const child of actor.items)if(child.flags?.[ns]?.advancedChild===state.uuid&&active(child))await child.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()});await state.update({['flags.'+ns+'.advancedState.childGeneration']:(m.childGeneration??0)+1});}
  else if(!result.passed&&definition.sleepFailures&&failures>=definition.sleepFailures&&!m.sleepPrevented)await conditionChild(state,'sns:condition:inconsciente',ctx);
 }
 await poisonMixture(actor);await event.update({['flags.'+ns+'.advancedEvent.status']:'resolved'});
}
export async function advancedControl(root,r,author,ctx){
 const m=environmentData(root);if(!m?.advanced&&!['endState','advancedSave','advancedEvent','decapitation'].includes(r.action))return false;
 const target=r.targetUuid&&await fromUuid(r.targetUuid),owner=root.actor.testUserPermission(author,'OWNER');
 if(r.action==='endState'){const state=target?.items.get(r.stateId);if(!author.isGM||advancedState(state)?.rootUuid!==root.uuid)throw Error('Somente o mestre pode encerrar este efeito.');await endState(state,'Encerrado pelo mestre.');return true;}
 if(r.action==='advancedSave'){
  const state=target?.items.get(r.stateId),s=advancedState(state);if(!target?.testUserPermission(author,'OWNER')||!active(state)||s?.rootUuid!==root.uuid)throw Error('Estado de alvo inválido.');
  const allowed=s.kind==='dano-continuo'?['attribute:vig']:s.kind==='decapitation'?['attribute:for','skill:escapar']:[];if(!allowed.includes(r.key))throw Error('Teste de libertação inválido.');
  const c=actorCombat(target);if(c?.started&&c.combatant?.actor?.uuid!==target.uuid)throw Error('Use a ação no próprio turno.');
  const dc=s.kind==='decapitation'?10:s.dc-(s.stage>=7?0:3),result=await check(target,r.key,dc,state.name+' · retirar efeito',{resistance:true});if(result.passed)await endState(state,'Libertação bem-sucedida.');return true;
 }
 if(r.action==='advancedEvent'){
  const event=await fromUuid(r.eventUuid),e=event?.getFlag(ns,'advancedEvent');if(!event?.author.isGM||e?.rootUuid!==root.uuid||!['pending','breathPending'].includes(e.status))throw Error('Solicitação já resolvida ou inválida.');
  const a=await fromUuid(e.targetUuid);if(!a)throw Error('Alvo indisponível.');const state=e.stateUuid?await fromUuid(e.stateUuid):advancedStates(a).find(i=>advancedState(i).rootUuid===root.uuid&&advancedState(i).kind===(e.type.startsWith('poison')?'venenoso':e.type));
  if(e.type==='desastre'){
   if(!active(root))throw Error('O desastre já terminou.');if(!owner&&!author.isGM)throw Error('O usuário da técnica decide quem deseja proteger.');
   if(r.mode==='protect'){if(m.drifting)throw Error('Sem concentração não é possível proteger.');if((await check(root.actor,'skill:concentracao',9+2*m.usedLevel,'Proteger '+a.name)).passed){await event.update({['flags.'+ns+'.advancedEvent.status']:'protected'});return true;}}
   else if(r.mode!=='attack')throw Error('Escolha proteger ou resolver o ataque.');
   await advancedAttack(root,[{uuid:a.uuid,name:a.name}],advancedDamage(m),{token:e.key});await event.update({['flags.'+ns+'.advancedEvent.status']:'resolved'});return true;
  }
  if(!a?.testUserPermission(author,'OWNER')||!state)throw Error('Esta escolha cabe ao dono do alvo ou ao mestre.');
  if(e.type.startsWith('poison')){await withEffectLock(a,()=>poisonTest(root,state,event,e.type==='poisonReinfect',ctx));return true;}
  if(e.type==='colisao-de-ondas'||e.type==='prisao-de-agua'){
   const s=advancedState(state);if(!active(root)||!active(state))throw Error('Sufocamento encerrado.');if(e.status==='breathPending'&&r.mode!=='breath')throw Error('Resolva a respiração após falhar ao nadar.');if(r.mode==='standard'){if(e.type!=='colisao-de-ondas'||s.stage>=10)throw Error('Esta evolução não permite subir sem teste.');await endState(state,'Nadou com ação padrão.');}
   else if(r.mode==='swim'){if(e.type!=='colisao-de-ondas')throw Error('Não há superfície acessível nesta prisão.');if((await check(a,'skill:atletismo',s.dc,'Nadar · ação de movimento')).passed)await endState(state,'Voltou à superfície.');else{await event.update({['flags.'+ns+'.advancedEvent.status']:'breathPending'});return true;}}
   else if(r.mode==='breath'){const turns=e.turnNumber??0;const result=await check(a,'attribute:vig',s.dc-2+turns,'Prender a respiração · ação livre',{resistance:true,suffocation:true});if(!result.passed)await fixedDamage(root,a,s.damage,e.key+'#suffocation','Sufocamento · '+root.name);}
   else throw Error('Escolha como lidar com o sufocamento.');
   if(a.system.resources.vitality.value<=0)await conditionChild(state,'sns:condition:inconsciente',ctx);
   await event.update({['flags.'+ns+'.advancedEvent.status']:'resolved'});return true;
  }
  throw Error('Escolha indisponível.');
 }
 if(r.action==='selfIgnition'){if(!target?.testUserPermission(author,'OWNER')||m.kind!=='inflamavel'||m.mode!=='continuous'||!active(root)||!advancedStates(target).some(i=>advancedState(i).rootUuid===root.uuid))throw Error('Ignição inválida.');const item=target.items.get(r.itemId),p=item&&(await import('./item-view.mjs')).jutsuProjection(item),element=p?.power?.id?.split(':').at(-1)??p?.power?.system.power.definitionId.split(':').at(-1);if(!p?.valid||!['katon','raiton'].includes(element))throw Error('A técnica não aciona esta combustão.');await fixedDamage(root,target,m.commonDamage,r.requestUuid+'#ignite','Combustão à queima-roupa',{common:true});const test=await check(target,'skill:concentracao',m.dc,'Evitar fracasso da técnica por combustão');await ctx.endEnvironment(root,'Substância inflamável consumida.');return {passed:test.passed};}
 if(!owner&&!author.isGM)throw Error('Somente o usuário controla a técnica.');
 if(r.action==='advancedMembers'){if(!author.isGM||!['inflamavel','desastre'].includes(m.kind))throw Error('Somente o mestre pode alterar os participantes.');const keep=new Set(r.targets??[]);for(const a of clockActors())for(const state of advancedStates(a))if(advancedState(state).rootUuid===root.uuid&&!keep.has(a.uuid))await endState(state,'Saiu da área.');for(const uuid of keep){const a=await fromUuid(uuid);if(!a||m.kind==='desastre'&&a.uuid===root.actor.uuid)continue;const state=await stateFor(root,a,m.kind,{},'entry-'+(m.entryGeneration??0));if(m.kind==='desastre')await conditionChild(state,'sns:condition:lento',ctx);}await root.update({['flags.'+ns+'.environment.entryGeneration']:(m.entryGeneration??0)+1});return true;}
 if(r.action==='decapitation'){
  if(m.kind!=='imergir'||!active(root)||!author.isGM||r.stealthConfirmed!==true||!target)throw Error('Falsa Decapitação exige Furtividade bem-sucedida e um alvo logo acima. Somente o mestre pode resolver.');
  const profile={base:0,fixed:0,nature:'lethal',criticalAt:15,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',decapitation:true};await advancedAttack(root,[{uuid:target.uuid,name:target.name}],profile,{penalty:-2,token:'decapitation'});await ctx.endEnvironment(root,'Saiu da imersão após Falsa Decapitação.');return true;
 }
 if(r.action==='end'&&m.kind==='desastre'&&m.drifting)throw Error('O efeito termina na próxima rodada. Fora de combate, o mestre pode encerrá-lo.');
 if(r.action==='end'&&m.kind==='desastre'&&!m.drifting){const c=actorCombat(root.actor);await root.update({['flags.'+ns+'.environment.drifting']:true,['flags.'+ns+'.environment.concentration']:false,['flags.'+ns+'.environment.pending']:false,['flags.'+ns+'.environment.driftRule']:durationRule({mode:'turns',turns:1,phase:'start',anchor:'recipient'}),...(c?.started?{['flags.'+ns+'.environment.driftClock']:durationClock({mode:'turns',turns:1,phase:'start',anchor:'recipient'},c,c.combatant.actor.uuid)}:{})});return true;}
 if(r.action==='sustain'&&m.kind==='colisao-de-ondas'){
  const combat=actorCombat(root.actor);if(combat?.started&&combat.combatant?.actor?.uuid!==root.actor.uuid)throw Error('Sustente a onda no próprio turno.');
  const event=m.pendingEvent;if(!event)throw Error('Não há manutenção pendente.');const ledger=root.actor.getFlag(ns,'environmentLedger')?.[event];if(!ledger){const cost=Math.ceil(m.cost/2),ch=root.actor.system.resources.chakra.value;if(ch<cost)throw Error('Chakra insuficiente para manter a onda.');await root.actor.update({'system.resources.chakra.value':ch-cost,['flags.'+ns+'.environmentLedger.'+event]:{cost,rootUuid:root.uuid}});}await root.update({['flags.'+ns+'.environment.pending']:false});return true;
 }
 if(r.action==='waveAttack'&&m.kind==='colisao-de-ondas'){const targets=(r.targets??[]).map(uuid=>({uuid}));await advancedAttack(root,targets,advancedDamage(m),{token:r.requestUuid});return true;}
 if(r.action==='ignite'&&m.kind==='inflamavel'){
  if(!author.isGM||!target)throw Error('Somente o mestre pode definir a ignição e seu causador.');if(m.mode==='meta')throw Error('Use a combustão preparada com um jutsu compatível.');
  if(m.stage<8&&!['katon','raiton'].includes(r.element))throw Error('Antes da evolução8 é necessário Katon ou Raiton.');await fixedDamage(root,target,m.commonDamage,r.requestUuid+'#ignite','Combustão à queima-roupa',{common:true});const test=await check(target,'skill:concentracao',m.dc,'Evitar fracasso da técnica por combustão');await root.update({['flags.'+ns+'.environment.ignition']:{targetUuid:target.uuid,passed:test.passed,eventUuid:test.message.uuid}});await ctx.endEnvironment(root,'Substância inflamável consumida.');return true;
 }
 if(r.action==='combustion'&&m.kind==='inflamavel'&&m.mode==='meta'){
  const item=root.actor.items.get(r.itemId),{jutsuProjection}=await import('./item-view.mjs'),p=item&&jutsuProjection(item),id=p?.effect?.id,element=p?.power?.id?.split(':').at(-1),profile=p&&(await import('./damage-source.mjs')).jutsuDamageProfile(p);
  if(!p?.valid||!['katon','raiton'].includes(element)||!profile||m.stage<8&&id!=='sns:effect:canhao'||m.stage>=8&&(p.data.duration!=='Instantânea'||p.data.range!==(p.power.rangeBase+p.power.rangeFactor*root.actor.system.attributes.esp)+' m'))throw Error('Escolha uma combustão instantânea de alcance comum; antes de8 somente Canhão.');
  if(item.system.targetEffects?.length||item.system.jutsu.overrides?.length)throw Error('Não use meta-aptidões ou exceções com Inflamável.');
  const paid=root.actor.getFlag(ns,'environmentLedger')?.[r.requestUuid];if(!paid){const ch=root.actor.system.resources.chakra.value;if(ch<p.cost)throw Error('Chakra insuficiente.');await root.actor.update({'system.resources.chakra.value':ch-p.cost,['flags.'+ns+'.environmentLedger.'+r.requestUuid]:{cost:p.cost,rootUuid:root.uuid,itemUuid:item.uuid}});}
  await advancedAttack(root,(r.targets??[]).map(uuid=>({uuid})),{...profile,base:profile.base+2,attackKind:m.stage<8?'area':profile.attackKind,advancedKind:'inflamavel'},{token:r.requestUuid,sourceItem:item,projection:p});await ctx.endEnvironment(root,'Combustão preparada usada.');return true;
 }
 if(r.action==='hide'&&m.kind==='imergir'){if(!author.isGM)throw Error('Somente o mestre pode ocultar o personagem novamente.');await root.update({['flags.'+ns+'.environment.hidden']:true});return true;}
 if(r.action==='endDrift'&&m.kind==='desastre'&&m.drifting&&author.isGM){if(actorCombat(root.actor)?.started)throw Error('Aguarde a rodada residual no combate.');await ctx.endEnvironment(root,'Rodada residual encerrada pelo mestre.');return true;}
 return false;
}
export async function advancedTurn(root,event,ctx){
 const m=environmentData(root);if(!m?.advanced||!active(root))return;
 const id=eventKey(event),own=event.actor?.uuid===root.actor.uuid,same=m.activationTurn?.combatId===event.combatId&&m.activationTurn?.round===event.round&&m.activationTurn?.combatantId===event.combatantId;
 if(m.kind==='desastre'){
  if(m.events?.[id])return;
  if(m.drifting&&m.driftClock){const next=advanceDuration({active:true,durationRule:m.driftRule,durationClock:m.driftClock},event);if(next){await root.update({['flags.'+ns+'.environment.driftClock']:next.clock});if(next.expired){await ctx.endEnvironment(root,'Rodada residual concluída.');return;}}}
  if(own&&event.phase==='start'&&!same&&!m.drifting){const turns=(m.elapsedTurns??0)+1;await root.update({['flags.'+ns+'.environment.elapsedTurns']:turns});if(turns>=m.maxTurns)await advancedControl(root,{action:'end'},game.user,ctx);}
  if(event.phase==='start'&&!m.events?.[id]){const a=event.actor;if(a&&a.uuid!==root.actor.uuid&&advancedStates(a).some(i=>advancedState(i).rootUuid===root.uuid)){await eventCard(root,a,'desastre',root.uuid+'#'+id,'Ataque do desastre · DB'+m.damage+(m.drifting?' · sem proteção por Concentração':' · usuário pode tentar proteger com Concentração'));}await root.update({['flags.'+ns+'.environment.events.'+id]:{structuresDamage:m.damage,at:new Date().toISOString()}});}
 }
 if(own&&event.phase==='start'&&!same&&m.kind==='colisao-de-ondas')await root.update({['flags.'+ns+'.environment.pendingEvent']:key(root.uuid+'#'+id)});
}
export async function advancedStateTurns(actor,event,ctx){
 if(!isTimekeeper()||event.phase!=='start'||event.actor?.uuid!==actor.uuid)return;
 for(const state of advancedStates(actor)){const m=advancedState(state),id=eventKey(event);if(m.events?.[id])continue;const root=await fromUuid(m.rootUuid);if(!root)continue;
  if(m.kind==='dano-continuo'){
   const next=continuousStep(m,{...event,key:id});if(next){if(next.tickDamage)await fixedDamage(root,actor,next.tickDamage,state.uuid+'#'+id,state.name);await state.update({['flags.'+ns+'.advancedState']:{...m,...next,events:{...m.events,[id]:true}}});if(next.remaining===0)await endState(state,'Todas as doses foram aplicadas.');}
  }else if(['colisao-de-ondas','prisao-de-agua'].includes(m.kind)){if(!active(root)){await endState(state,'Área/prisão encerrada.');continue;}await eventCard(root,actor,m.kind,state.uuid+'#'+id,m.kind==='colisao-de-ondas'?'Nadar com movimento, subir com ação padrão (antes de10) ou prender a respiração.':'Prender a respiração · Vigor '+(m.dc-2+(m.breathTurns??0)),state);await state.update({['flags.'+ns+'.advancedState.events.'+id]:true,['flags.'+ns+'.advancedState.breathTurns']:(m.breathTurns??0)+1});}
  else if(m.kind==='venenoso'&&!m.suppressed){await eventCard(root,actor,'poison',state.uuid+'#'+id,'Resistir ao veneno · Vigor Dif'+m.poison.dc);await state.update({['flags.'+ns+'.advancedState.events.'+id]:true});}
 }
}
export async function advancedEnd(root){
 const m=environmentData(root);if(!m?.advanced&&m?.kind!=='prisao-de-agua')return;
 for(const a of clockActors())for(const i of advancedStates(a))if(advancedState(i).rootUuid===root.uuid&&!['dano-continuo','venenoso','decapitation'].includes(advancedState(i).kind))await endState(i,'Técnica de origem encerrada.');
 for(const message of game.messages??[]){const e=message.getFlag(ns,'advancedEvent');if(e?.rootUuid===root.uuid&&!e.type.startsWith('poison')&&['pending','breathPending'].includes(e.status))await message.update({['flags.'+ns+'.advancedEvent.status']:'cancelled'});}
}
export async function advancedReconcile(actor,ctx){
 for(const state of advancedStates(actor)){const m=advancedState(state);if(m.kind==='venenoso'){
   if(m.expiresAt&&game.time.worldTime>=m.expiresAt){await endState(state,'Duração do veneno encerrada.');continue;}
   const scene=actor.flags?.[ns]?.magenScene??0;if(m.suppressed&&m.scene!==scene)await state.update({['flags.'+ns+'.advancedState.suppressed']:false,['flags.'+ns+'.advancedState.successes']:0,['flags.'+ns+'.advancedState.scene']:scene,...(m.deferredSleep?{['flags.'+ns+'.advancedState.sleepsAt']:game.time.worldTime+3600}: {})});if(m.sleepsAt&&game.time.worldTime>=m.sleepsAt)await conditionChild(state,'sns:condition:inconsciente',ctx);
  }}
 if(advancedStates(actor).some(i=>advancedState(i).kind==='venenoso'))await poisonMixture(actor);
 for(const root of liveAdvanced(actor)){const m=environmentData(root);if(m.kind==='flutuar'){const fan=actor.items.get(m.fanId);if(!fan||!fan.system.equipped||fan.system.quantity<1)await ctx.endEnvironment(root,'O leque não está mais empunhado.');}}
}
export async function advancedReveal(message){
 const p=message.getFlag(ns,'damageUse'),f=message.flags?.[ns]??{},uuid=p?.attack?p.actorUuid:f.jutsu?message.speaker?.actor?'Actor.'+message.speaker.actor:null:f.environmentUse?.status==='active'?f.environmentUse.actorUuid:f.supportUse?.status==='active'?f.supportUse.actorUuid:f.phantasmActivation?.status==='active'?f.phantasmActivation.actorUuid:null;if(!isTimekeeper()||!uuid||!message.author)return;const a=await fromUuid(uuid);if(!a?.testUserPermission(message.author,'OWNER'))return;
 for(const root of liveAdvanced(a)){const m=environmentData(root);if(m.kind==='imergir'&&m.hidden!==false&&m.activationUuid!==message.uuid)await root.update({['flags.'+ns+'.environment.hidden']:false});}
}
export async function preparePoisonBatch(actor,item,{producer=actor}={}){
 if(!isTimekeeper()||item?.actor!==actor)throw Error('O mestre registra os lotes produzidos.');const d=poisonDefinition(item.system.contentId),level=originalSkill(producer,'veneficio'),doku=producer.items.find(i=>i.system.power?.definitionId==='sns:power:dokujutsu'&&i.system.level>0);
 if(!d||!Number.isInteger(level)||level+(doku?2:0)<4+2*d.category||!producer.items.some(i=>(i.system.ruleId||i.system.contentId)==='sns:apt:quimico'))throw Error('Veneno, Químico ou nível original de Venefício inválido.');
 if(d.dokujutsu&&!producer.items.some(i=>i.system.power?.definitionId==='sns:power:dokujutsu'&&i.system.level>=d.dokujutsu))throw Error('Este veneno exige Dokujutsu '+d.dokujutsu+'.');
 await item.update({['flags.'+ns+'.poisonBatch']:{producerUuid:producer.uuid,producerSkill:level,dokujutsu:!!doku,category:d.category,registeredBy:game.user.id,uses:{}}});return item;
}
export async function prisonSuffocation(root,actor){
 const m=environmentData(root);return stateFor(root,actor,'prisao-de-agua',{damage:actor.system.nc,breathTurns:0});
}
export async function ambientCombustions(actor,projection){
 const element=projection?.power?.id?.split(':').at(-1)??projection?.power?.system?.power?.definitionId?.split(':').at(-1);if(!['katon','raiton'].includes(element))return [];
 const list=[];for(const state of advancedStates(actor).filter(i=>advancedState(i).kind==='inflamavel')){const root=await fromUuid(advancedState(state).rootUuid);if(active(root)&&environmentData(root).mode==='continuous')list.push(root);}return list;
}
export async function triggerAmbientCombustion(root,actor,item){
 const {requestEnvironmentControl}=await import('./environment-service.mjs');const message=await requestEnvironmentControl(root,'selfIgnition',{targetUuid:actor.uuid,itemId:item.id});
 const result=await new Promise(resolve=>{const check=()=>{const r=message.getFlag(ns,'environmentControlResult');if(r){Hooks.off('updateChatMessage',hook);resolve(r);}};const hook=Hooks.on('updateChatMessage',m=>{if(m.uuid===message.uuid)check();});check();});
 if(result.status==='blocked')throw Error(result.reason);return result.passed;
}
