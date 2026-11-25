import {isPartyActor,isManagedParty,isPartyCreature,memberUuids,validatePartyMembers,shouldRefreshPartyDirectory,partyDepositOffsets,planRyoDistribution,planItemTransfer,isPartyStatsVisible} from './party-core.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {ATTRIBUTES,escapeHtml as esc} from './kernel.mjs';
import {SKILLS} from './rules.mjs';
import {itemCategory} from './sheet-profiles.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {conditionCheckRows} from './condition-effects.mjs';
import {checkComponents,resolveCheck,resolveRecordedCheck} from './roll-components.mjs';
import {recordedSkills} from './recorded-skills.mjs';
import {virtualRecordedSkills} from './advanced-core.mjs';

const ns='sns-v14-dev';
let starting;
export const NO_PRIMARY_PARTY='none';

function readSetting(key,fallback){
 try{const v=globalThis.game?.settings?.get?.(ns,key);return v===undefined?fallback:v;}catch{return fallback;}
}

function rerenderOpenParties(){
 for(const app of globalThis.foundry?.applications?.instances?.values?.()??[]){
  if(app?.rendered&&app?.actor?.type==='party')void app.render({force:true});
 }
}

export async function ensurePrimaryParty(){
 if(!isTimekeeper())return null;if(starting)return starting;
 starting=(async()=>{
  const selected=readSetting('primaryParty',''),known=game.actors.get(selected);
  if(selected===NO_PRIMARY_PARTY)return null;
  if(isPartyActor(known))return known;
  // A saved ID without an actor means the GM removed the primary party.
  if(selected){await game.settings.set(ns,'primaryParty',NO_PRIMARY_PARTY);return null;}
  let party=game.actors.find(a=>isPartyActor(a)&&a.flags?.[ns]?.partyManaged?.primary)??game.actors.find(isPartyActor);
  if(!party)party=await foundry.documents.Actor.create({name:'Equipe',type:'party',ownership:{default:2},flags:{[ns]:{partyManaged:{version:1,primary:true}}}});
  if(party)await game.settings.set(ns,'primaryParty',party.id);return party;
 })();try{return await starting;}finally{starting=null;}
}

export async function rememberDeletedParty(party){if(isTimekeeper()&&party?.type==='party'&&readSetting('primaryParty','')===party.id)await game.settings.set(ns,'primaryParty',NO_PRIMARY_PARTY);}

export async function activateParty(partyOrId){
 if(!game.user.isGM)return null;
 const party=typeof partyOrId==='string'?game.actors.get(partyOrId):partyOrId;
 if(!isPartyActor(party))return null;
 await game.settings.set(ns,'primaryParty',party.id);
 await ui.actors?.render?.({force:true});
 return party;
}

export async function deleteParty(party){
 if(!game.user.isGM||!party?.isOwner||!isPartyActor(party))throw Error('Somente o mestre pode excluir esta equipe.');
 const confirmed=await foundry.applications.api.DialogV2.confirm({classes:['sns-editor-dialog'],window:{title:'Excluir equipe'},content:'<p>Excluir a ficha da equipe <strong>'+esc(party.name)+'</strong>?</p><p>O depósito, as notas e os vínculos desta equipe serão removidos. As fichas dos integrantes e suas pastas serão mantidas.</p>',yes:{label:'Excluir equipe'},no:{label:'Cancelar',default:true}});
 if(!confirmed)return null;
 return withEffectLock(party,async()=>{if(!game.user.isGM||!party.isOwner||!game.actors.has(party.id))return null;const result=await party.delete();if(result)await rememberDeletedParty(party);return result;});
}

export async function createParty(){
 if(!game.user.isGM)return null;
 const name=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Criar equipe'},content:'<label>Nome da equipe<input name="name" value="Equipe" required></label>',ok:{label:'Criar equipe',callback:(e,b)=>b.form.elements.name.value.trim()}});
 if(!name)return null;const party=await foundry.documents.Actor.create({name,type:'party',ownership:{default:2},flags:{[ns]:{partyManaged:{version:1,primary:false}}}});if(party)await party.sheet.render({force:true});return party;
}

export async function changePartyMembers(party,{add=[],remove=[]}={}){
 if(!game.user.isGM||!party?.isOwner||party.type!=='party')throw Error('O mestre organiza os integrantes da equipe.');
 return withEffectLock(party,async()=>{
  const next=memberUuids(party).filter(uuid=>!remove.includes(uuid));for(const uuid of add)if(!next.includes(uuid))next.push(uuid);
  validatePartyMembers(party,next,game.actors);await party.update({'system.members':next,'system.activities':(party.system.activities??[]).filter(a=>next.includes(a.member))});return party;
 });
}

export async function choosePartyMember(party){
 if(!game.user.isGM)return;
 const candidates=game.actors.filter(a=>isPartyCreature(a)&&!memberUuids(party).includes(a.uuid));
 if(!candidates.length)return ui.notifications.info('Nenhuma outra ficha disponível para adicionar.');
 const selected=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Adicionar integrante'},content:'<label>Ficha<select name="member">'+candidates.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(a=>'<option value="'+a.uuid+'">'+esc(a.name)+'</option>').join('')+'</select></label>',ok:{label:'Adicionar',callback:(e,b)=>b.form.elements.member.value}});
 if(selected)await changePartyMembers(party,{add:[selected]});
}

export async function newPartyCharacter(party){
 if(!game.user.isGM)return null;
 const name=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Novo personagem da equipe'},content:'<label>Nome<input name="name" autofocus></label>',ok:{label:'Criar personagem',callback:(e,b)=>b.form.elements.name.value.trim()}});
 if(!name)return null;const actor=await foundry.documents.Actor.create({name,type:'shinobi'});if(actor){await changePartyMembers(party,{add:[actor.uuid]});await actor.sheet?.render?.({force:true});}return actor;
}

export function partyMemberActors(party){
 return memberUuids(party).map(uuid=>game.actors.get(uuid.slice(6))).filter(Boolean);
}

export function partySceneTokens(party,scene){
 if(!isPartyActor(party)||!scene)return [];
 const memberIds=new Set(partyMemberActors(party).map(a=>a.id));
 return Array.from(scene.tokens??[]).filter(t=>memberIds.has(t.actorId));
}

export async function togglePartyTokens(tokenDoc){
 if(!game.user.isGM||!isPartyActor(tokenDoc?.actor)||!tokenDoc?.parent?.isOwner)return null;
 const party=tokenDoc.actor,scene=tokenDoc.parent;
 const activeTokens=partySceneTokens(party,scene);
 if(activeTokens.length>0){
  const anchor={x:tokenDoc.x,y:tokenDoc.y,elevation:tokenDoc.elevation??0,...(tokenDoc.level?{level:tokenDoc.level}:{})};
  await scene.updateEmbeddedDocuments('Token',activeTokens.map(t=>({_id:t.id,...anchor})));
  await Promise.all(activeTokens.map(t=>{
   const anim=t.object?.movementAnimationName?t.object.animationContexts?.get?.(t.object.movementAnimationName)?.promise:null;
   return anim?anim.catch(()=>{}):null;
  }));
  await scene.deleteEmbeddedDocuments('Token',activeTokens.map(t=>t.id));
  return {action:'retrieved',count:activeTokens.length};
 }
 const members=partyMemberActors(party);
 if(!members.length){ui.notifications.info('Esta equipe não possui integrantes para posicionar na cena.');return null;}
 const gridSize=scene.grid?.size??globalThis.canvas?.dimensions?.size??100;
 const candidates=partyDepositOffsets(Math.max(members.length*2,members.length+8),gridSize).map(o=>({x:tokenDoc.x+o.dx,y:tokenDoc.y+o.dy}));
 const free=typeof tokenDoc.object?.checkCollision==='function'?candidates.filter(p=>!tokenDoc.object.checkCollision({x:p.x+gridSize/2,y:p.y+gridSize/2},{type:'move',mode:'any'})):candidates;
 const tokensData=await Promise.all(members.map(async(member,idx)=>{
  const pos=free[idx]??{x:tokenDoc.x,y:tokenDoc.y};
  const overrides={x:pos.x,y:pos.y,elevation:tokenDoc.elevation??0,...(tokenDoc.level?{level:tokenDoc.level}:{}),actorLink:member.type==='shinobi'?true:(member.prototypeToken?.actorLink??false)};
  const doc=typeof member.getTokenDocument==='function'?await member.getTokenDocument(overrides,{parent:scene}):overrides;
  const raw=typeof doc?.toObject==='function'?doc.toObject():doc;
  return {...raw,...overrides};
 }));
 const created=await scene.createEmbeddedDocuments('Token',tokensData);
 return {action:'deposited',count:created?.length??tokensData.length};
}

export function decoratePartyTokenHUD(hud,element,data={}){
 const root=element instanceof HTMLElement?element:element?.[0];
 const tokenDoc=hud?.document??hud?.object?.document??globalThis.canvas?.scene?.tokens?.get?.(data?._id??'');
 if(!root||!globalThis.game?.user?.isGM||!isPartyActor(tokenDoc?.actor))return;
 const effectsBtn=root.querySelector('[data-palette="effects"]');
 if(!effectsBtn)return;
 root.querySelector('.palette.status-effects')?.remove();
 let hasTokens=partySceneTokens(tokenDoc.actor,tokenDoc.parent).length>0;
 const button=document.createElement('button');
 button.type='button';
 button.className='control-icon sns-party-clown-car';
 button.dataset.tooltip='';
 const syncLabel=()=>{
  const label=hasTokens?'Recolher integrantes na ficha da equipe':'Depositar integrantes na cena';
  button.setAttribute('aria-label',label);
  button.title=label;
  button.innerHTML=`<i class="fa-solid ${hasTokens?'fa-arrow-right-to-bracket':'fa-arrow-right-from-bracket'}" inert></i>`;
 };
 syncLabel();
 button.addEventListener('click',async event=>{
  event.preventDefault();event.stopPropagation();
  if(button.disabled)return;
  button.disabled=true;
  try{
   const res=await togglePartyTokens(tokenDoc);
   if(res){hasTokens=res.action==='deposited';syncLabel();}
  }catch(e){ui.notifications.warn(e.message);}
  finally{if(button.isConnected)button.disabled=false;}
 });
 effectsBtn.replaceWith(button);
}

export async function togglePartyVisibility(party){
 if(!game.user.isGM||!isPartyActor(party))return null;
 const current=isPartyStatsVisible(false,readSetting('showPartyStats',true));
 const next=!current;
 await game.settings.set(ns,'showPartyStats',next);
 rerenderOpenParties();
 ui.notifications.info(next?'Visão geral da equipe liberada para jogadores.':'Visão geral da equipe restrita ao mestre.');
 return next;
}

export async function clearPartyActivities(party){
 if(!party?.isOwner||!isPartyActor(party))return null;
 if(!(party.system?.activities?.length)){ui.notifications.info('Nenhuma atividade registrada.');return party;}
 await party.update({'system.activities':[]});
 ui.notifications.info('Atividades de exploração limpas.');
 return party;
}

export async function restParty(party){
 if(!game.user.isGM||!isPartyActor(party))return null;
 const members=partyMemberActors(party).filter(m=>['shinobi','npc','companion'].includes(m.type));
 if(!members.length){ui.notifications.info('Nenhum integrante elegível para descansar nesta equipe.');return null;}
 const confirmed=await foundry.applications.api.DialogV2.confirm({classes:['sns-editor-dialog'],window:{title:'Descanso da equipe'},content:'<p>Realizar descanso completo (8 horas) para <strong>'+members.length+'</strong> integrante(s) da equipe?</p>',yes:{label:'Descansar equipe'},no:{label:'Cancelar',default:true}});
 if(!confirmed)return null;
 const {requestRest}=await import('./rest-service.mjs');
 const rested=[],skipped=[];
 for(const member of members){
  try{await requestRest(member);rested.push(member.name);}
  catch(error){skipped.push({name:member.name,reason:error.message});}
 }
 if(rested.length)ui.notifications.info('Descanso concluído para: '+rested.join(', ')+'.');
 if(skipped.length)ui.notifications.warn('Não descansaram: '+skipped.map(s=>`${s.name} (${s.reason})`).join('; '));
 return {rested,skipped};
}

export async function distributePartyRyo(party){
 if(!game.user.isGM||!isPartyActor(party))return null;
 const members=partyMemberActors(party);
 if(!members.length){ui.notifications.info('Vincule integrantes antes de distribuir Ryo.');return null;}
 const rawFunds=party.system?.details?.funds;
 const availableFunds=Number.isSafeInteger(rawFunds)?rawFunds:null;
 const defaultAmount=availableFunds&&availableFunds>0?availableFunds:0;
 const content='<label>Valor total (Ryo)<input name="amount" type="number" min="1" step="1" value="'+defaultAmount+'" required></label>'
  +(availableFunds!==null?'<label class="craft-checkbox"><input name="deduct" type="checkbox" '+(availableFunds>0?'checked':'')+'> Descontar do saldo do depósito (atual: '+availableFunds+' Ryo)</label>':'')
  +'<fieldset><legend>Destinatários</legend>'+members.map(m=>'<label class="craft-checkbox"><input type="checkbox" name="recipient" value="'+m.uuid+'" checked> '+esc(m.name)+'</label>').join('')+'</fieldset>';
 const form=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Distribuir Ryo · '+party.name},content,ok:{label:'Distribuir',callback:(e,b)=>{
  const f=b.form.elements;
  const recipients=Array.from(b.form.querySelectorAll('[name="recipient"]:checked')).map(el=>el.value);
  return {amount:Number(f.amount.value),deduct:!!f.deduct?.checked,recipients};
 }}});
 if(!form)return null;
 return withEffectLock(party,async()=>{
  const plan=planRyoDistribution(form.amount,form.recipients,{availableFunds:form.deduct?availableFunds:null,deductFromStash:form.deduct});
  const names=[];
  for(const uuid of plan.recipients){
   const member=game.actors.get(uuid.slice(6));
   if(!member)continue;
   if(member.type==='shinobi'){
    const prev=Number.isSafeInteger(member.system?.finances?.ryo)?member.system.finances.ryo:0;
    await member.update({'system.finances.ryo':prev+plan.perMember});
   }else{
    const prev=Number.isSafeInteger(member.system?.details?.funds)?member.system.details.funds:0;
    await member.update({'system.details.funds':prev+plan.perMember});
   }
   names.push(member.name);
  }
  if(form.deduct)await party.update({'system.details.funds':plan.remainingStash});
  await foundry.documents.ChatMessage.create({
   speaker:foundry.documents.ChatMessage.getSpeaker({actor:party}),
   content:`<section class="sns-technique-card"><header class="sns-technique-title"><i class="fa-solid fa-coins" aria-hidden="true"></i><strong>Distribuição de Ryo</strong></header><p>${plan.perMember} Ryo para cada integrante (${esc(names.join(', '))}).${plan.remainder?' Restaram '+plan.remainder+' Ryo no depósito.':''}</p></section>`
  });
  ui.notifications.info(`Distribuídos ${plan.totalDistributed} Ryo (${plan.perMember} Ryo por integrante).`);
  return plan;
 });
}

export async function transferPartyItem(party,item,targetMember,{quantity=null}={}){
 if(!isPartyActor(party)||!item||item.actor?.uuid!==party.uuid||!isPartyCreature(targetMember))throw Error('Selecione um item do depósito e um integrante válido.');
 if(!game.user.isGM&&!(party.isOwner&&targetMember.isOwner))throw Error('Sem permissão para transferir itens entre estas fichas.');
 const maxQty=item.system?.quantity??1;
 let chosen=quantity;
 if(chosen===null&&maxQty>1){
  const entered=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Transferir '+item.name},content:'<p>Destino: <strong>'+esc(targetMember.name)+'</strong></p><label>Quantidade (1 a '+maxQty+')<input name="qty" type="number" min="1" max="'+maxQty+'" step="1" value="'+maxQty+'" required></label>',ok:{label:'Transferir',callback:(e,b)=>Number(b.form.elements.qty.value)}});
  if(entered===null||entered===undefined)return null;
  chosen=entered;
 }
 return withEffectLock(party,async()=>{
  const plan=planItemTransfer(item,chosen??maxQty,itemCategory);
  const created=await targetMember.createEmbeddedDocuments('Item',[plan.copyData]);
  if(!created?.length)throw Error('Não foi possível criar o item na ficha de destino.');
  if(plan.sourceAction==='delete')await item.delete();
  else await item.update({'system.quantity':plan.remainingQuantity});
  ui.notifications.info(`Transferido: ${plan.quantity}× ${item.name} → ${targetMember.name}.`);
  return {plan,created:created[0]};
 });
}

function partyCheckChoices(){
 const skills=[...SKILLS].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(s=>({key:'skill:'+s.key,label:s.name}));
 const attrs=ATTRIBUTES.map(([k,,label])=>({key:'attribute:'+k,label}));
 const combat=[{key:'initiative',label:'Iniciativa'},{key:'lm',label:'Ler movimento'},{key:'cc',label:'Corpo a corpo'},{key:'cd',label:'À distância'}];
 return {skills,attrs,combat};
}

function partyCheckLabel(key){
 if(key.startsWith('skill:'))return SKILLS.find(s=>s.key===key.slice(6))?.name??key;
 if(key.startsWith('attribute:'))return ATTRIBUTES.find(([k])=>k===key.slice(10))?.[2]??key;
 return {initiative:'Iniciativa',lm:'Ler movimento',cc:'Corpo a corpo',cd:'À distância'}[key]??key;
}

export async function promptPartyCheck(party){
 if(!game.user.isGM||!isPartyActor(party))return null;
 const {skills,attrs,combat}=partyCheckChoices();
 const options=[
  '<optgroup label="Perícias">'+skills.map(s=>'<option value="'+s.key+'">'+esc(s.label)+'</option>').join('')+'</optgroup>',
  '<optgroup label="Atributos">'+attrs.map(a=>'<option value="'+a.key+'">'+esc(a.label)+'</option>').join('')+'</optgroup>',
  '<optgroup label="Combate / Geral">'+combat.map(c=>'<option value="'+c.key+'">'+esc(c.label)+'</option>').join('')+'</optgroup>'
 ].join('');
 const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Pedir teste ao grupo'},content:'<label>Teste<select name="checkKey">'+options+'</select></label><label>Dificuldade (opcional)<input name="dc" type="number" min="1" step="1" placeholder="—"></label><label class="craft-checkbox"><input name="secret" type="checkbox"> Rolagem secreta (apenas mestre)</label>',ok:{label:'Enviar pedido',callback:(e,b)=>{const f=b.form.elements;return {key:f.checkKey.value,dc:f.dc.value===''?null:Number(f.dc.value),secret:!!f.secret.checked};}}});
 if(!result)return null;
 if(result.dc!==null&&(!Number.isInteger(result.dc)||result.dc<1))throw Error('Informe uma dificuldade inteira positiva.');
 const label=partyCheckLabel(result.key),dcText=result.dc?` · Dif ${result.dc}`:'',secretText=result.secret?' <span class="sns-tag">Secreta</span>':'';
 return foundry.documents.ChatMessage.create({
  speaker:foundry.documents.ChatMessage.getSpeaker({actor:party}),
  content:`<section class="sns-technique-card sns-party-check-card"><header class="sns-technique-title"><i class="fa-solid fa-dice-d8" aria-hidden="true"></i><strong>Teste de ${esc(label)}${esc(dcText)}</strong>${secretText}</header><p>Integrantes de <strong>${esc(party.name)}</strong> podem rolar diretamente pelo botão abaixo.</p><button type="button" class="sns-party-check-roll" data-party-check-roll><i class="fa-solid fa-dice-d8" aria-hidden="true"></i> Rolar ${esc(label)}</button></section>`,
  flags:{[ns]:{partyCheckPrompt:{partyUuid:party.uuid,key:result.key,label,dc:result.dc,secret:result.secret,memberUuids:memberUuids(party)}}}
 });
}

export async function rollActorCheckDirect(actor,key,{dc=null,secret=false,event=null,showDialog=null}={}){
 if(!actor||(!actor.isOwner&&!game.user.isGM))throw Error('Sem permissão para rolar por esta ficha.');
 const label=partyCheckLabel(key);
 const openDialog=typeof showDialog==='boolean'?showDialog:((globalThis.game?.user?.getFlag?.(ns,'showCheckDialogs')!==false)||!!event?.shiftKey);
 const {SnsCheckDialog}=await import('./check-dialog.mjs');
 const {checkFlavor}=await import('./chat-card.mjs');
 const {rollWithLegado}=await import('./legado-fortune.mjs');
 let defaultMode='public';
 try{defaultMode=globalThis.game?.settings?.get?.('core','messageMode')??'public';}catch{}
 let spec,messageMode=secret?(game.user.isGM?'gm':'blind'):defaultMode;
 if(!['public','gm','blind','self'].includes(messageMode))messageMode='public';
 if(actor.type==='shinobi'){
  if(openDialog){
   const res=await SnsCheckDialog.prompt(actor,key,label);
   if(!res)return null;
   spec=res.spec;
   if(!secret)messageMode=res.messageMode;
  }else{
   const source=actor.system.toObject(),effects=characteristicEffects(actor);
   spec=resolveCheck(source,key,conditionCheckRows(checkComponents(source,key,effects),effects,key),effects);
  }
 }else{
  const source=actor.system.toObject(),effects=characteristicEffects(actor);
  let precision=null;
  if(key.startsWith('attribute:'))precision=source.attributes?.[key.slice(10)]??null;
  else if(key.startsWith('skill:')){
   const row=virtualRecordedSkills(recordedSkills(source),effects).find(r=>r.key===key.slice(6)&&!r.untrained);
   precision=row?.precision??null;
  }else if(['cc','cd','lm','initiative'].includes(key))precision=source.stats?.[key]??null;
  if(!Number.isInteger(precision))throw Error(`${actor.name}: teste de ${label} não informado na ficha.`);
  const die=key==='initiative'?'1d8':'2d8';
  if(openDialog){
   const res=await SnsCheckDialog.promptRecorded(actor,{key,name:label,precision,die});
   if(!res)return null;
   spec=res.spec;
   if(!secret)messageMode=res.messageMode;
  }else{
   spec=resolveRecordedCheck({key,name:label,precision,die},conditionCheckRows([{id:'recorded',label:'Precisão',value:precision,type:'base',enabled:true}],effects,key));
  }
 }
 const roll=await rollWithLegado(actor,spec,{kind:['cc','cd'].includes(key)?'attack':'test'});
 const natural=roll.dice?.[0]?.results?.filter(r=>r.active!==false).reduce((a,r)=>a+r.result,0)??null;
 const tag=dc?`Dif ${dc}`:'';
 return roll.toMessage({
  speaker:foundry.documents.ChatMessage.getSpeaker({actor}),
  flavor:checkFlavor(spec,{tag}),
  flags:{[ns]:{check:{actorImg:actor.img,key:spec.key,natural}}}
 },{messageMode});
}

async function resolveActorForPrompt(promptData){
 const controlled=(globalThis.canvas?.tokens?.controlled??[]).map(t=>t.actor).filter(a=>a?.isOwner);
 if(controlled.length===1)return controlled[0];
 if(game.user.character?.isOwner)return game.user.character;
 const members=(promptData.memberUuids??[]).map(u=>game.actors.get(u.slice(6))).filter(a=>a?.isOwner);
 if(members.length===1)return members[0];
 if(members.length>1){
  const uuid=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Escolher personagem'},content:'<label>Ficha<select name="actorUuid">'+members.map(a=>'<option value="'+a.uuid+'">'+esc(a.name)+'</option>').join('')+'</select></label>',ok:{label:'Rolar',callback:(e,b)=>b.form.elements.actorUuid.value}});
  return uuid?game.actors.get(uuid.slice(6)):null;
 }
 return null;
}

export function decoratePartyCheckPrompt(message,element){
 const promptData=message?.getFlag?.(ns,'partyCheckPrompt');
 const root=element instanceof HTMLElement?element:element?.[0];
 if(!promptData||!root)return;
 const button=root.querySelector('[data-party-check-roll]');
 if(!button||button.dataset.bound==='1')return;
 button.dataset.bound='1';
 button.addEventListener('click',async event=>{
  event.preventDefault();
  try{
   const actor=await resolveActorForPrompt(promptData);
   if(!actor)return ui.notifications.warn('Selecione seu token ou vincule um personagem próprio à equipe para rolar.');
   await rollActorCheckDirect(actor,promptData.key,{dc:promptData.dc,secret:!!promptData.secret,event});
  }catch(e){ui.notifications.warn(e.message);}
 });
}

export async function decoratePartyDirectory(app,element){
 if(app?.parts?.parties||app?.constructor?.PARTS?.parties)return;
 const root=element instanceof HTMLElement?element:element?.[0];if(!root)return;
 root.querySelector('.sns-parties')?.remove();root.querySelectorAll('[data-sns-party-hidden]').forEach(e=>e.removeAttribute('data-sns-party-hidden'));
 const parties=game.actors.filter(a=>isPartyActor(a)&&a.testUserPermission(game.user,'OBSERVER'));if(!parties.length&&!game.user.isGM)return;
 const section=document.createElement('section');section.className='sns-parties';section.setAttribute('aria-label','Equipes');
 if(game.user.isGM){const button=document.createElement('button');button.type='button';button.className='party-create';button.innerHTML='<i class="fa-solid fa-plus"></i> Criar equipe';button.addEventListener('click',()=>createParty());section.append(button);}
 const expanded=game.user.getFlag(ns,'partyOpen')??{},hidden=new Set();
 for(const party of parties){
  const uuids=memberUuids(party),members=uuids.map(uuid=>game.actors.get(uuid.slice(6))).filter(a=>a?.testUserPermission(game.user,'OBSERVER'));hidden.add(party.id);for(const a of members)hidden.add(a.id);
  const folder=document.createElement('section');folder.className='sns-party-folder';folder.dataset.partyId=party.id;
  folder.innerHTML='<header><button type="button" class="party-toggle" aria-label="Expandir ou recolher '+esc(party.name)+'"><i class="fa-solid fa-folder-open"></i></button><button type="button" class="party-open" title="Abrir ficha da equipe" aria-label="Abrir ficha de '+esc(party.name)+'"><i class="fa-solid fa-file-lines"></i></button><strong>'+esc(party.name)+'</strong>'+(game.user.isGM?'<button type="button" class="party-add" aria-label="Adicionar integrante a '+esc(party.name)+'"><i class="fa-solid fa-user-plus"></i></button><button type="button" class="party-new" aria-label="Criar personagem em '+esc(party.name)+'"><i class="fa-solid fa-plus"></i></button>':'')+'</header><ol '+(expanded[party.id]===false?'hidden':'')+'>'+members.map(a=>'<li draggable="true" data-member-uuid="'+a.uuid+'"><img src="'+esc(a.img)+'" alt=""><button type="button" class="party-member-open">'+esc(a.name)+'</button>'+(game.user.isGM?'<button type="button" class="party-remove" aria-label="Retirar '+esc(a.name)+' da equipe"><i class="fa-solid fa-xmark"></i></button>':'')+'</li>').join('')+(!members.length?'<li class="party-empty">Nenhum integrante visível. '+(game.user.isGM?'Arraste fichas para esta equipe.':'')+'</li>':'')+'</ol>';
  const list=folder.querySelector('ol');folder.querySelector('.party-toggle').addEventListener('click',async()=>{list.hidden=!list.hidden;await game.user.setFlag(ns,'partyOpen',{...game.user.getFlag(ns,'partyOpen'),[party.id]:!list.hidden});});
  if(game.user.isGM){const button=document.createElement('button');button.type='button';button.className='party-delete';button.title='Excluir equipe';button.setAttribute('aria-label','Excluir equipe '+party.name);button.innerHTML='<i class="fa-solid fa-trash"></i>';button.addEventListener('click',()=>deleteParty(party));folder.querySelector('header').append(button);}
  folder.querySelector('.party-open').addEventListener('click',()=>party.sheet.render({force:true}));
  folder.querySelector('.party-add')?.addEventListener('click',()=>choosePartyMember(party));folder.querySelector('.party-new')?.addEventListener('click',()=>newPartyCharacter(party));
  for(const row of folder.querySelectorAll('[data-member-uuid]')){
   row.querySelector('.party-member-open').addEventListener('click',()=>game.actors.get(row.dataset.memberUuid.slice(6))?.sheet.render({force:true}));
   row.querySelector('.party-remove')?.addEventListener('click',()=>changePartyMembers(party,{remove:[row.dataset.memberUuid]}));
   row.addEventListener('dragstart',e=>{e.stopPropagation();const actor=game.actors.get(row.dataset.memberUuid.slice(6));e.dataTransfer.setData('text/plain',JSON.stringify(actor.toDragData()));});
  }
  folder.addEventListener('dragover',e=>{if(game.user.isGM){e.preventDefault();e.stopPropagation();}});
  folder.addEventListener('drop',async e=>{if(!game.user.isGM)return;e.preventDefault();e.stopPropagation();try{const data=JSON.parse(e.dataTransfer.getData('text/plain')),actor=await fromUuid(data.uuid);if(data.type!=='Actor'||!actor||actor.pack)throw Error('Arraste uma ficha já criada neste mundo.');await changePartyMembers(party,{add:[actor.uuid]});}catch(error){ui.notifications.warn(error.message);}});
  section.append(folder);
 }
 const directory=root.querySelector('.directory-list');if(!directory)return;directory.prepend(section);
 for(const row of root.querySelectorAll('.directory-item[data-entry-id]'))if(hidden.has(row.dataset.entryId))row.setAttribute('data-sns-party-hidden','');
 const search=root.querySelector('[name="search"]');search?.addEventListener('input',()=>{const q=search.value.toLocaleLowerCase('pt-BR').trim();for(const row of section.querySelectorAll('[data-member-uuid]'))row.hidden=q&&!row.textContent.toLocaleLowerCase('pt-BR').includes(q);for(const f of section.querySelectorAll('.sns-party-folder'))if(q)f.querySelector('ol').hidden=false;});
}

export function installPartyHooks(){
 Hooks.once('init',()=>{
  game.settings.register(ns,'primaryParty',{scope:'world',config:false,type:String,default:''});
  game.settings.register(ns,'showPartyStats',{name:'Visão geral da equipe visível para jogadores',hint:'Quando desmarcada, apenas o mestre vê a aba Visão geral e as estatísticas detalhadas dos colegas na ficha da equipe.',scope:'world',config:true,type:Boolean,default:true,onChange:()=>rerenderOpenParties()});
 });
 Hooks.on('snsProcessorReady',()=>ensurePrimaryParty().catch(error=>console.error('SNS · equipe',error)));
 Hooks.on('renderActorDirectory',decoratePartyDirectory);
 Hooks.on('renderTokenHUD',decoratePartyTokenHUD);
 Hooks.on('renderChatMessageHTML',decoratePartyCheckPrompt);
 const refresh=async()=>{const app=ui.actors;if(!app?.rendered)return;const top=app.element?.querySelector('.directory-list')?.scrollTop;await app.render({force:true});if(Number.isFinite(top)){const list=app.element?.querySelector('.directory-list');if(list)list.scrollTop=top;}};
 const update=a=>{void refresh().catch(console.error);};
 Hooks.on('updateActor',(a,changes)=>{if(shouldRefreshPartyDirectory(a,changes))update(a);});
 Hooks.on('createActor',update);
 Hooks.on('deleteActor',a=>{void rememberDeletedParty(a).catch(console.error);update(a);});
 Hooks.on('updateSetting',setting=>{if(setting?.key===ns+'.primaryParty')void refresh().catch(console.error);if(setting?.key===ns+'.showPartyStats')rerenderOpenParties();});
}
