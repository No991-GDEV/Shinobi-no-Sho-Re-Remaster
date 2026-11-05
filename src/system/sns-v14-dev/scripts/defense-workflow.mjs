import {withEffectLock} from './effect-lifecycle.mjs';
import {rollWithLegado} from './legado-fortune.mjs';
import {assertCastActive} from './cast-undo-core.mjs';
import {isProcessor} from './processor-authority.mjs';
import {isGeneratedMinion} from './npc-minion-policy.mjs';
import {environmentDefenses,prepareEnvironmentDefense,resolveEnvironmentDefense} from './environment-protection.mjs';
import {prepareBladeContest,bladeContestEffects,resolveBladeBlock,bladeContestOutcome} from './blade-workflow.mjs';
import {skinDefenseResolution} from './support-core.mjs';
import {skinDefenses,applySkinDefense,resolveSkinDefense} from './support-service.mjs';
import {prepareAttackPhantasms,attackPhantasmContext,ensurePhantasmVisual} from './phantasm-service.mjs';
import {phantasmDefenseEffects} from './phantasm-core.mjs';
import {recordedTransformationRows} from './transformation-core.mjs';
import {preDefenseEffects,fixedDefensePrecision} from './defense-context.mjs';
import {ricochetTargetState} from './attack-sequences.mjs';
import {messageVisualState} from './visual-attack.mjs';
import {defenseController,defenseChoices,defenseSpec,mayRespondToDefense,shouldPromptDefense} from './defense-choices.mjs';
import {damageTargets} from './damage-source.mjs';
import {attackOutcome,rolledCheck,versusDifficulty} from './jutsu-outcomes.mjs';
import {conditionPenalty} from './condition-effects.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {checkFlavor} from './chat-card.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const supportDefenseChoices=(actor,profile,extra=[])=>{const choices=defenseChoices(actor,profile,extra),skin=!profile.resistance&&(!profile.allowedDefenses||profile.allowedDefenses.includes('anticipate'))&&choices.some(c=>c.key==='lm')?skinDefenses(actor):[];return [...choices,...skin,...environmentDefenses(actor,profile)];};
const ns='sns-v14-dev',waiting=new Map(),prompted=new Set(),responding=new Set(),defenseDialogs=new Map();
const activeGM=()=>isProcessor();
export async function readDefenseRequest(message){
 assertCastActive(message);
 const r=message?.getFlag(ns,'defenseRequest');if(!r||r.version!==1||!Array.isArray(r.targets)||!r.targets.length||r.targets.length>50||new Set(r.targets.map(t=>t.uuid)).size!==r.targets.length)throw Error('Declaração de defesa inválida.');
 const caster=await fromUuid(r.actorUuid);if(!caster?.testUserPermission(message.author,'OWNER'))throw Error('Origem de ataque inválida.');return r;
}
export async function beginDefenseDeclaration(actor,item,profile,targets,context=null){
 if(isGeneratedMinion(actor))profile={...profile,minionAttack:true};
 const selected=damageTargets(targets);if(!profile||!selected.length)return null;
 if(!game.users.activeGM)throw Error('Um mestre ativo precisa acompanhar as defesas. Nenhum recurso gasto.');if(['melee','projectile','techniqueProjectile','technique','area'].includes(profile.attackKind)){const {submerged}=await import('./advanced-core.mjs');for(const t of selected){const a=await fromUuid(t.uuid);if(a&&submerged(a))throw Error('Alvo submerso em Colisão de Ondas: não recebe outros ataques físicos.');}}
 const r={version:1,actorUuid:actor.uuid,itemUuid:item?.uuid??'',name:item?.name??'Ataque',profile,targets:selected,responses:{},status:'pending',...(context?.phantasmUuid?{phantasmUuid:context.phantasmUuid}:{}),...(context?.preDefenseUuid?{preDefenseUuid:context.preDefenseUuid}:{}),...(context?.preDefenseBatchUuid?{preDefenseBatchUuid:context.preDefenseBatchUuid}:{}),...(context?.edgeUuid?{edgeUuid:context.edgeUuid}:{})};
 const owners=await Promise.all(selected.map(async t=>defenseController(await fromUuid(t.uuid),game.users)?.id));
 const request=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),whisper:[...new Set([game.user.id,game.users.activeGM.id,...owners].filter(Boolean))],content:r.profile.edgeContestRoll?'<section class="sns-technique-card"><header class="sns-technique-title"><img src="icons/svg/sword.svg" alt=""><strong>Afiar · Lâmina estendida</strong></header><div class="sns-chat-tags"><span>FUUTON</span><span>TESTE RESISTIDO</span></div><p><b>Espírito</b> '+r.profile.resistance.difficulty+'</p><p>Perceba a extensão da lâmina. Falhar impõe −1 nas reações de defesa deste ataque.</p></section>':r.profile.phantasmNotice?'<section class="sns-technique-card"><header class="sns-technique-title"><img src="icons/svg/eye.svg" alt=""><strong>Notar Genjutsu</strong><span>Reação</span></header><div class="sns-chat-tags"><span>GENJUTSU</span><span>FANTASMA</span></div><p><b>Ilusão</b> '+esc(r.name)+'</p><p>Reconhecer a ilusão impede que ela engane você.</p></section>':'<section class="sns-defense-card"><strong>'+esc(r.name)+'</strong></section>',flags:{[ns]:{defenseRequest:r,...(context?.parentUuid?{jutsuResistanceRequest:context}:{})}}});
 await promptDefenses(request);return request;
}
export async function declareDefenses(actor,item,profile,targets,context=null){
 const edgeUuid=await prepareBladeContest(actor,item,profile,targets);if(edgeUuid===null)return null;
 const phantasmUuid=await prepareAttackPhantasms(actor,item,profile,targets);
 const request=await beginDefenseDeclaration(actor,item,profile,targets,{...context,...(edgeUuid?{edgeUuid}:{}),...(phantasmUuid?{phantasmUuid}:{})});if(!request)return '';
 const result=new Promise(resolve=>waiting.set(request.uuid,resolve));ui.chat?.updateMessage(request);
 await promptDefenses(request);checkWaiting(request);
 const accepted=await result;if(!accepted)return null;return request.uuid;
}
function checkWaiting(message){
 const r=message.getFlag(ns,'defenseRequest'),resolve=waiting.get(message.uuid);if(!resolve||!r)return;
 if(r.status==='cancelled'){waiting.delete(message.uuid);resolve(false);}
 else if(r.targets.every(t=>r.responses[t.uuid.replaceAll('.','~')])){waiting.delete(message.uuid);resolve(true);}
}
async function promptDefenses(message){
 let r;try{r=await readDefenseRequest(message);}catch{return;}
 if(r.status!=='pending')return;
 for(const target of r.targets){
  const actor=await fromUuid(target.uuid),key=message.uuid+'#'+target.uuid;
  if(r.profile.resistance)continue;
  if(!actor||!shouldPromptDefense(actor,game.user,game.users,globalThis.canvas?.tokens?.controlled??[])||r.responses[target.uuid.replaceAll('.','~')]||prompted.has(key))continue;
  prompted.add(key);const choices=supportDefenseChoices(actor,r.profile,await extraDefenseEffects(message,actor));
  // This compact popup is shown only to the active player controlling this target (GM for NPC/offline owner).
  const app=new foundry.applications.api.DialogV2({classes:['sns-editor-dialog','sns-defense-choice'],window:{title:'Defesa · '+actor.name},position:{width:380},content:'<p><strong>'+esc(r.name)+'</strong> · '+esc(message.speaker.alias??'Ataque')+'</p><p>Como você vai se defender?</p>',buttons:choices.map(c=>({action:c.id,label:esc(c.label)+(c.detail?' · '+esc(c.detail):''),callback:async()=>{
   await requestDefenseChoice(message,actor,c.id);
  }}))});defenseDialogs.set(key,app);app.render({force:true});
 }
}
export function closeResolvedDefenseDialogs(message){
 const r=message.getFlag(ns,'defenseRequest');if(!r)return;
 for(const t of r.targets??[]){const key=message.uuid+'#'+t.uuid,app=defenseDialogs.get(key);if(app&&(r.status==='cancelled'||r.responses?.[t.uuid.replaceAll('.','~')])){defenseDialogs.delete(key);void app.close({force:true}).catch(console.warn);}}
}
export async function requestDefenseChoice(message,actor,choiceId){
 const r=await readDefenseRequest(message),key=actor.uuid.replaceAll('.','~');
 if(r.status!=='pending'||!r.targets.some(t=>t.uuid===actor.uuid)||r.responses[key]||!mayRespondToDefense(actor,game.user,game.users))throw Error('Somente o dono do alvo ou o mestre pode escolher a defesa.');
 if(!supportDefenseChoices(actor,r.profile,await extraDefenseEffects(message,actor)).some(c=>c.id===choiceId))throw Error('Opção de defesa indisponível.');
 return foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),whisper:[game.users.activeGM.id],content:'<p>'+esc(actor.name)+' · defesa declarada</p>',flags:{[ns]:{defenseReply:{requestUuid:message.uuid,targetUuid:actor.uuid,choice:choiceId}}}});
}
async function acceptDeclaration(reply){
 if(!activeGM())return;const data=reply.getFlag(ns,'defenseReply');if(!data)return;const request=await fromUuid(data.requestUuid);if(!request)return;return withEffectLock(request,()=>acceptDeclarationLocked(reply,request));
}
async function acceptDeclarationLocked(reply,request){
 const data=reply.getFlag(ns,'defenseReply'),r=await readDefenseRequest(request),actor=await fromUuid(data.targetUuid),key=data.targetUuid.replaceAll('.','~');
 if(r.status!=='pending'||!r.targets.some(t=>t.uuid===data.targetUuid)||!mayRespondToDefense(actor,reply.author,game.users)||r.responses[key])return;
 if(!r.profile.resistance){const {breakFascination}=await import('./magen-service.mjs');await breakFascination(actor);}
 const choice=supportDefenseChoices(actor,r.profile,await extraDefenseEffects(request,actor)).find(c=>c.id===data.choice);if(!choice)return;
 const environmentRoot=await prepareEnvironmentDefense(actor,choice,reply.uuid);
 const supportRoot=await applySkinDefense(actor,choice,reply.uuid);
 await request.update({['flags.'+ns+'.defenseRequest.responses.'+key]:{choice:choice.id,choiceSnapshot:choice,author:reply.author.id,replyUuid:reply.uuid,...(environmentRoot?{environmentRootUuid:environmentRoot.uuid}:choice.environmentRootUuid?{environmentRootUuid:choice.environmentRootUuid}:{}),...(supportRoot?{supportRootUuid:supportRoot.uuid}:{})}});
}
export async function performDefenses(message){
 assertCastActive(message);
 const packet=message.getFlag(ns,'damageUse');if(!packet?.defenseRequestUuid)return;
 const globalVisual=messageVisualState(message);if(globalVisual==='pending')return;
 const request=await fromUuid(packet.defenseRequestUuid),r=await readDefenseRequest(request);if(r.status==='cancelled')return;
 if(message.author?.id!==request.author?.id||packet.actorUuid!==r.actorUuid||packet.itemUuid!==r.itemUuid||JSON.stringify(packet.targets)!==JSON.stringify(r.targets)||JSON.stringify(packet.profile)!==JSON.stringify(r.profile))return;
 for(const target of packet.targets){
  if(ricochetTargetState(packet,message.getFlag(ns,'defenseResults'),target.uuid)!=='ready')continue;
  const actor=await fromUuid(target.uuid),key=message.uuid+'#'+target.uuid,declared=r.responses[target.uuid.replaceAll('.','~')];
  if(!actor||!declared||message.getFlag(ns,'defenseResults')?.[target.uuid.replaceAll('.','~')]||(declared.author??defenseController(actor,game.users)?.id)!==game.user.id||responding.has(key))continue;
  const ghostVisual=await ensurePhantasmVisual(message,actor.uuid),visual=globalVisual==='miss'?'miss':ghostVisual;if(visual==='pending')continue;responding.add(key);try{
  const extra=await extraDefenseEffects(request,actor),choice=declared.supportRootUuid?{id:declared.choice,label:'Pele de Pedra',kind:'opposed',key:'lm'}:declared.choiceSnapshot??supportDefenseChoices(actor,packet.profile,extra).find(c=>c.id===declared.choice);if(!choice)continue;
  if(choice.kind==='manual'&&visual!=='miss')return ui.notifications.warn('Defesa de '+actor.name+': resolução pelo mestre.');
  let roll=null,spec=null;
  if(visual!=='miss'&&(choice.kind==='resistance'||choice.kind==='opposed'&&packet.attack?.natural>3&&(packet.attack.natural<packet.profile.criticalAt||packet.profile.minionAttack&&!isGeneratedMinion(actor)||packet.profile.followups))){spec=defenseSpec(actor,choice.key,choice.itemId?actor.items.get(choice.itemId):null,choice.penalty??0,[...extra,...(choice.environmentBonus?[{kind:'flatModifier',target:'lm',value:choice.environmentBonus,sourceId:'environment-defense',sourceName:choice.label}]:[])],packet.profile);if(!spec)return;roll=await rollWithLegado(actor,spec,{kind:'defense'});}
  const response={attackUuid:message.uuid,targetUuid:actor.uuid,choice:choice.id};
  if(roll)await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:checkFlavor({...spec,name:choice.label})+'<p class="sns-roll-context">'+esc(r.name)+(packet.profile.resistance?(packet.profile.edgeContestRoll?' · contra Espírito ':' · Dif ')+packet.profile.resistance.difficulty:'')+'</p>',whisper:[game.users.activeGM.id,game.user.id],flags:{[ns]:{defenseResult:response,check:{actorImg:actor.img,key:choice.key}}}});
  else await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),whisper:[game.users.activeGM.id],content:'<p>'+esc(actor.name)+' · '+esc(choice.label)+'</p>',flags:{[ns]:{defenseResult:response}}});
 }catch(e){responding.delete(key);throw e;}
 }
}
async function acceptDefenseResult(reply){
 if(!activeGM())return;const data=reply.getFlag(ns,'defenseResult');if(!data)return;
 const message=await fromUuid(data.attackUuid),packet=message?.getFlag(ns,'damageUse');if(!packet?.defenseRequestUuid||!packet.targets.some(t=>t.uuid===data.targetUuid))return;
 assertCastActive(message);
 const request=await fromUuid(packet.defenseRequestUuid),r=await readDefenseRequest(request),actor=await fromUuid(data.targetUuid),key=data.targetUuid.replaceAll('.','~'),declared=r.responses[key];
 if(!actor||!mayRespondToDefense(actor,reply.author,game.users)||declared?.author!==reply.author?.id||declared?.choice!==data.choice||message.getFlag(ns,'defenseResults')?.[key])return;
 const extra=await extraDefenseEffects(request,actor),choice=declared.supportRootUuid?{id:declared.choice,label:'Pele de Pedra',kind:'opposed',key:'lm'}:declared.choiceSnapshot??supportDefenseChoices(actor,packet.profile,extra).find(c=>c.id===data.choice);if(!choice)return;
 let hit='pending',roll=null,fixed=null;
 const ghostVisual=await ensurePhantasmVisual(message,actor.uuid);if(messageVisualState(message)==='pending'||ghostVisual==='pending')return;
 if(messageVisualState(message)==='miss'||ghostVisual==='miss')hit='miss';
 else if(choice.kind==='none')hit=packet.profile.resistance?'hit':packet.attack.natural<=3?'miss':'hit';
 else if(choice.kind==='resistance'){const spec=defenseSpec(actor,choice.key,null,0,[],packet.profile);roll=reply.rolls?.[0]&&spec?rolledCheck(reply.rolls[0],spec):null;if(packet.profile.edgeContestRoll){let left=packet.attack;hit=bladeContestOutcome(left,roll);let n=0;while(hit==='pending'&&n++<20){const attacker=await fromUuid(packet.actorUuid),ls=defenseSpec(attacker,'attribute:esp'),rs=defenseSpec(actor,'skill:prontidao');if(!ls||!rs)throw Error('Informe Espírito e Prontidão para desempatar Afiar.');const lr=await new foundry.dice.Roll(ls.formula).evaluate(),rr=await new foundry.dice.Roll(rs.formula).evaluate();left=rolledCheck(lr,ls);roll=rolledCheck(rr,rs);await lr.toMessage({speaker:ChatMessage.getSpeaker({actor:attacker}),flavor:'<strong>Afiar · desempate de Espírito</strong>',flags:{[ns]:{check:{actorImg:attacker.img,key:'attribute:esp'}}}});await rr.toMessage({speaker:ChatMessage.getSpeaker({actor}),flavor:'<strong>Afiar · desempate de Prontidão</strong>',flags:{[ns]:{check:{actorImg:actor.img,key:'skill:prontidao'}}}});hit=bladeContestOutcome(left,roll);}if(hit==='pending')throw Error('Afiar: empate persistente. O mestre deve resolver o desempate.');}else{const result=versusDifficulty(roll,packet.profile.resistance.difficulty);hit=result==='passed'?'miss':result==='failed'?'hit':'pending';}}
 else if(choice.kind==='object')hit=attackOutcome(packet.attack,5,{fixed:true,criticalAt:packet.profile.criticalAt,criticalAllowed:!packet.profile.minionAttack||isGeneratedMinion(actor)});
 else if(choice.kind==='fixed'){const precision=fixedDefensePrecision(actor,[...characteristicEffects(actor),...extra],packet.profile);fixed={total:9+precision,precision};hit=attackOutcome(packet.attack,fixed.total,{fixed:true,criticalAt:packet.profile.criticalAt,criticalAllowed:!packet.profile.minionAttack||isGeneratedMinion(actor)});}
 else{const spec=defenseSpec(actor,choice.key,choice.itemId?actor.items.get(choice.itemId):null,choice.penalty??0,[...extra,...(choice.environmentBonus?[{kind:'flatModifier',target:'lm',value:choice.environmentBonus,sourceId:'environment-defense',sourceName:choice.label}]:[])],packet.profile);roll=reply.rolls?.[0]?rolledCheck(reply.rolls[0],spec):null;hit=attackOutcome(packet.attack,roll,{criticalAt:packet.profile.criticalAt,criticalAllowed:!packet.profile.minionAttack||isGeneratedMinion(actor)});}
 let technique=null;if(declared.supportRootUuid){technique=skinDefenseResolution({hit,rolled:!!roll,attackFailed:packet.attack?.natural<=3,visualMiss:messageVisualState(message)==='miss'||ghostVisual==='miss'});if(!technique.pending)await resolveSkinDefense(await fromUuid(declared.supportRootUuid),technique.grant,message.uuid);hit=technique.hit;}
 let environmentSuccess=null;if(declared.environmentRootUuid&&choice.environmentId){const resolution=skinDefenseResolution({hit,rolled:!!roll,attackFailed:packet.attack?.natural<=3,visualMiss:messageVisualState(message)==='miss'||ghostVisual==='miss'});if(!resolution.pending){await resolveEnvironmentDefense(await fromUuid(declared.environmentRootUuid),resolution.grant,message.uuid);environmentSuccess=resolution.grant;}hit=resolution.hit;}
 const bladeBlock=await resolveBladeBlock(message,choice,actor,hit);hit=bladeBlock.hit;
 await message.update({['flags.'+ns+'.defenseResults.'+key]:{hit,...(declared.environmentRootUuid?{environmentRootUuid:declared.environmentRootUuid,environmentSuccess:environmentSuccess??true}:{}),...(bladeBlock.weaponBroken?{weaponBroken:bladeBlock.weaponBroken}:{}),choice:choice.label,replyUuid:reply.uuid,roll,...(fixed?{fixed}:{}),...(technique?{defenseTechnique:true,techniqueSuccess:technique.grant,supportRootUuid:declared.supportRootUuid}:{}),user:reply.author.id}});
 if(packet.profile.edgeContestRoll)await request.update({['flags.'+ns+'.edgeResults.'+key]:{hit}});
 if(roll)await reply.update({['flags.'+ns+'.defenseOutcome']:{hit,resistance:!!packet.profile.resistance,natural:roll.natural,critical:!packet.profile.edgeContestRoll,result:technique?(technique.grant?'passed':'failed'):environmentSuccess!==null?(environmentSuccess?'passed':'failed'):hit==='miss'?'passed':hit==='hit'?'failed':'pending'}});
}
async function extraDefenseEffects(request,actor){
 const r=request.getFlag(ns,'defenseRequest'),context=await attackPhantasmContext(request,actor),ghost=[...phantasmDefenseEffects(context.speed),...await bladeContestEffects(request,actor)];if(r?.profile.decapitation)ghost.push({kind:'condition',key:'desprevenido',scope:'defenses',degree:3,sourceId:'decapitation',sourceName:'Ataque furtivo'});if(r?.preDefenseBatchUuid){const proof=await fromUuid(r.preDefenseBatchUuid),batch=proof?.getFlag(ns,'preDefenseBatch');if(!proof?.author?.isGM||batch?.actorUuid!==r.actorUuid||batch.itemUuid!==r.itemUuid||JSON.stringify(batch.profile)!==JSON.stringify(r.profile.preDefense))throw Error('Pré-defesa inválida.');const row=batch.targets[actor.uuid.replaceAll('.','~')];if(!row)throw Error('Alvo não consta na pré-defesa.');if(row.testUuid){const test=await fromUuid(row.testUuid),p=test?.getFlag(ns,'damageUse'),result=test?.getFlag(ns,'defenseResults')?.[actor.uuid.replaceAll('.','~')];if(!test?.author?.isGM||p?.actorUuid!==r.actorUuid||p.itemUuid!==r.itemUuid||p.profile.resistance.difficulty!==row.dc||!['hit','miss'].includes(result?.hit))throw Error('Teste anterior ainda não resolvido.');ghost.push(...preDefenseEffects(r.profile,result));}return ghost;}if(!r?.preDefenseUuid)return ghost;
 const message=await fromUuid(r.preDefenseUuid),packet=message?.getFlag(ns,'damageUse'),result=message?.getFlag(ns,'defenseResults')?.[actor.uuid.replaceAll('.','~')];
 if(!packet||message.author?.id!==request.author?.id||packet.actorUuid!==r.actorUuid||packet.itemUuid!==r.itemUuid||JSON.stringify(packet.targets)!==JSON.stringify(r.targets)||packet.profile.resistance?.keys?.[0]!==r.profile.preDefense?.key||packet.profile.resistance?.difficulty!==r.profile.preDefense?.dc)throw Error('Teste anterior à defesa inválido.');
 if(!['hit','miss'].includes(result?.hit))throw Error('Aguarde o teste anterior à defesa.');
 return [...ghost,...preDefenseEffects(r.profile,result)];
}
export function guardDefenseMessage(message,changes,options,userId){
 if(game.users.get(userId)?.isGM)return;
 const e=foundry.utils.expandObject(changes),r=message.getFlag(ns,'defenseRequest');
 if(r){const patch=e.flags?.[ns]?.defenseRequest;if(message.author?.id===userId&&Object.keys(e).length===1&&Object.keys(e.flags??{}).length===1&&Object.keys(e.flags[ns]??{}).length===1&&patch&&Object.keys(patch).length===1&&patch.status==='cancelled')return;
  if(['flags','author','speaker','-=flags','-=author','-=speaker'].some(k=>Object.hasOwn(e,k)))return false;
 }
 if((message.getFlag(ns,'defenseReply')||message.getFlag(ns,'defenseResult'))&&['flags','author','speaker','rolls','-=flags','-=rolls'].some(k=>Object.hasOwn(e,k)))return false;
}
export async function decorateDefenseRequest(message,element){
 const r=message.getFlag(ns,'defenseRequest');if(!r||element.querySelector('[data-sns-defense-request]'))return;
 const box=document.createElement('div');box.dataset.snsDefenseRequest='';box.className='sns-defense-request';
 if(r.profile.resistance&&!message.getFlag(ns,'jutsuResistanceRequest')){const {appendResistanceButtons}=await import('./combat-chat-ui.mjs');box.className='sns-standalone-save';for(const target of r.targets){const actor=await fromUuid(target.uuid);if(!actor)continue;const row=document.createElement('div'),name=document.createElement('strong');name.textContent=target.name;row.append(name);await appendResistanceButtons(message,actor,row);box.append(row);}(element.querySelector('.message-content')??element).append(box);return;}
 const label=document.createElement('p');label.textContent=r.status==='cancelled'?'Ataque cancelado':Object.keys(r.responses).length+' / '+r.targets.length+' defesas declaradas';box.append(label);
 if(r.status==='pending'&&(message.author?.id===game.user.id||game.user.isGM)&&!game.messages.some(m=>m.getFlag(ns,'damageUse')?.defenseRequestUuid===message.uuid)){const b=document.createElement('button');b.type='button';b.textContent='Cancelar ataque';b.addEventListener('click',async()=>{b.disabled=true;try{await cancelDefenseDeclaration(message);}catch(e){b.disabled=false;ui.notifications.warn(e.message);}});box.append(b);}
 (element.querySelector('.message-content')??element).append(box);
}
export async function cancelDefenseDeclaration(message){
 const r=await readDefenseRequest(message);if(r.status!=='pending'||message.author?.id!==game.user.id&&!game.user.isGM)throw Error('Somente o autor ou o mestre pode cancelar este ataque.');
 if(!game.users.activeGM)throw Error('Conecte o mestre para cancelar o ataque.');
 const request=await foundry.documents.ChatMessage.create({whisper:[game.user.id,game.users.activeGM.id],content:'Cancelando ataque…',flags:{[ns]:{defenseCancel:{requestUuid:message.uuid}}}});await acceptDefenseCancellation(request);return request;
}
export async function acceptDefenseCancellation(reply){
 if(!activeGM()||!reply.getFlag(ns,'defenseCancel'))return;const message=await fromUuid(reply.getFlag(ns,'defenseCancel').requestUuid);if(!message)return;return withEffectLock(message,async()=>{const r=await readDefenseRequest(message);if(r.status!=='pending'||!reply.author?.isGM&&message.author?.id!==reply.author?.id||game.messages.some(m=>m.getFlag(ns,'damageUse')?.defenseRequestUuid===message.uuid))return;await message.update({['flags.'+ns+'.defenseRequest.status']:'cancelled'});});
}
export function installDefenseHooks(){
 Hooks.on('snsProcessorReady',()=>{for(const message of game.messages)if(message.getFlag(ns,'defenseCancel'))void acceptDefenseCancellation(message).catch(console.error);});
 Hooks.on('controlToken',()=>{for(const m of game.messages)if(m.getFlag(ns,'defenseRequest')?.status==='pending')void promptDefenses(m).catch(console.error);});
 Hooks.on('createChatMessage',message=>{Promise.all([acceptDefenseCancellation(message),promptDefenses(message),acceptDeclaration(message),performDefenses(message),acceptDefenseResult(message)]).catch(e=>ui.notifications.warn(e.message));});
 Hooks.on('updateChatMessage',message=>{closeResolvedDefenseDialogs(message);checkWaiting(message);if(message.getFlag(ns,'defenseRequest'))for(const attack of game.messages.filter(m=>m.getFlag(ns,'damageUse')?.defenseRequestUuid===message.uuid))performDefenses(attack).catch(e=>ui.notifications.warn(e.message));if(message.getFlag(ns,'environmentVisual')||message.getFlag(ns,'phantasmLocation')||message.getFlag(ns,'phantasmVisual')||message.getFlag(ns,'visualResolution')||message.getFlag(ns,'damageUse')?.profile?.ricochet)performDefenses(message).catch(e=>ui.notifications.warn(e.message));});
 Hooks.on('preUpdateChatMessage',guardDefenseMessage);
 Hooks.on('renderChatMessageHTML',decorateDefenseRequest);
}
