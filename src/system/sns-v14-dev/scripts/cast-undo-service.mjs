import {isProcessor} from './processor-authority.mjs';
import {mayWriteDamagePresentation} from './damage-presentation.mjs';
import {castActorSnapshot,castGuard,castGuardScope,castStorageKey,castStorageUuid,normalizeCastJournal,stateHash,stateText,snapshotChanges,reversalOperations,simulateReversal,messageCastRoot,assertCastActive} from './cast-undo-core.mjs';
const ns='sns-v14-dev',locks=new Map();
let journalOrder=Date.now();
const guardHash=(state,uuid,snapshot)=>stateHash(castGuard(snapshot,state.scopes?.[castStorageKey(uuid)]));
function laterDependency(journal,state){
 const others=Array.from(game.messages??[]);for(const m of others){if(m.uuid===journal.uuid)continue;const j=get(m,'castJournal');
  if(j&&j.rootUuid!==state.rootUuid&&j.status!=='undone'&&(j.order??0)>(state.order??0)&&Object.keys(j.guards).some(uuid=>Object.hasOwn(state.guards,uuid)))return 'Há um uso posterior nestas fichas. Desfaça o mais recente primeiro.';
  if((m.rolls?.length||m.isRoll)&&Number(m._stats?.createdTime)>state.startedAt&&('Actor.'+m.speaker?.actor===state.casterUuid||m.flags?.[ns]?.damageUse?.actorUuid===state.casterUuid)&&messageCastRoot(m)?.uuid!==state.rootUuid)return 'O usuário já fez outra rolagem após este jutsu. Confira essa ação antes de desfazer.';
 }return '';
}
const serial=(key,fn)=>{const next=(locks.get(key)??Promise.resolve()).catch(()=>{}).then(fn);locks.set(key,next);return next.finally(()=>{if(locks.get(key)===next)locks.delete(key);});};
const get=(m,key)=>key==='castJournal'?normalizeCastJournal(m?.flags?.[ns]?.[key]):m?.flags?.[ns]?.[key],gmIds=()=>Array.from(game.users).filter(u=>u.isGM).map(u=>u.id);
const newUse=root=>get(root,'undoVersion')===1||get(root,'npcJutsuCast')?.undoVersion===1;
async function journalOf(message,{create=false}={}){
 const root=messageCastRoot(message)??message,meta=get(root,'castUndo');
 if(meta?.journalUuid){const journal=await fromUuid(meta.journalUuid);if(journal?.author?.isGM&&get(journal,'castJournal')?.rootUuid===root.uuid)return {root,journal};throw Error('Registro de reversão indisponível.');}
 const paymentUuid=get(root,'jutsuPayment');
 if(paymentUuid)return serial('adopt:'+paymentUuid,async()=>{
  const payment=await fromUuid(paymentUuid),r=get(payment,'jutsuPaymentRequest'),p=get(payment,'jutsuPaymentResult'),paid=get(payment,'castUndo'),journal=paid?.journalUuid&&await fromUuid(paid.journalUuid),state=get(journal,'castJournal');
  if(!p?.paid||payment.author?.id!==root.author?.id||!journal?.author?.isGM||!state||state.rootUuid!==payment.uuid&&state.rootUuid!==root.uuid||r.actorUuid!==(get(root,'jutsuUse')?.caster?.uuid||'Actor.'+root.speaker.actor)||r.itemUuid.split('.').at(-1)!==get(root,'jutsu')?.itemId)throw Error('O pagamento não pertence a este uso.');
  if(state.rootUuid!==root.uuid)await journal.update({['flags.'+ns+'.castJournal.rootUuid']:root.uuid});
  await root.update({['flags.'+ns+'.castUndo']:{...paid,status:'ready'}});return {root,journal};
 });
 if(!create||!newUse(root))return {root,journal:null};
 const f=root.flags?.[ns]??{},casterUuid=f.npcJutsuCast?.actorUuid||f.jutsuPaymentRequest?.actorUuid||f.jutsuUse?.caster?.uuid||f.supportUse?.actorUuid||f.environmentUse?.actorUuid||f.phantasmActivation?.actorUuid||'Actor.'+root.speaker?.actor;
 const journal=await foundry.documents.ChatMessage.create({whisper:gmIds(),content:'<p>Registro de reversão de jutsu.</p>',flags:{[ns]:{castJournal:{version:2,rootUuid:root.uuid,casterUuid,order:journalOrder=Math.max(Date.now(),journalOrder+1),startedAt:Date.now(),steps:[],guards:{},scopes:{},status:'ready',createdAt:new Date().toISOString()}}}});
 await root.update({['flags.'+ns+'.castUndo']:{version:1,journalUuid:journal.uuid,status:'recording'}});return {root,journal};
}
export async function runCastStep(message,actors,label,task){
 if(!isProcessor())return task();assertCastActive(message);
 const eligible=newUse(messageCastRoot(message)??message)||get(messageCastRoot(message)??message,'jutsuPayment')||get(messageCastRoot(message)??message,'castUndo');if(!eligible)return task();
 return serial('cast:'+messageCastRoot(message)?.uuid,async()=>{
  const {root,journal}=await journalOf(message,{create:true});if(!journal)return task();const prior=structuredClone(get(journal,'castJournal'));
  const participants=[...new Map(actors.filter(a=>a?.isOwner&&!a.pack).map(a=>[a.uuid,a])).values()],before=new Map(participants.map(a=>[a.uuid,castActorSnapshot(a)]));
  if(prior.casterUuid==='Actor.undefined')prior.casterUuid=participants[0]?.uuid;
  let conflict=prior.conflict||'';for(const a of participants)if(prior.guards[castStorageKey(a.uuid)]&&await guardHash(prior,a.uuid,before.get(a.uuid))!==prior.guards[castStorageKey(a.uuid)])conflict='A ficha foi alterada entre as etapas deste uso.';
  const actorIds=new Set(Array.from(game.actors??[]).map(a=>a.id));let value,error;try{value=await task();}catch(e){error=e;}
  if(Array.from(game.actors??[]).some(a=>!actorIds.has(a.id)))conflict='Uma ficha foi criada durante este uso. Confira essa criação antes de uma reversão manual.';
  const operations=[],afterStates=new Map();for(const actor of participants){await (await import('./effect-item-service.mjs')).reconcileEffectItems(actor);const after=castActorSnapshot(actor);afterStates.set(actor.uuid,after);operations.push(...snapshotChanges(actor.uuid,before.get(actor.uuid),after));}
  if(operations.length)prior.steps.push({label,operations,at:new Date().toISOString()});for(const actor of participants){prior.scopes??={};prior.scopes[castStorageKey(actor.uuid)]=castGuardScope(prior.steps,actor.uuid,prior.casterUuid);prior.guards[castStorageKey(actor.uuid)]=await guardHash(prior,actor.uuid,afterStates.get(actor.uuid));}
  if(operations.length||Object.keys(prior.guards).length){prior.status='ready';if(conflict)prior.conflict=conflict;await journal.update({['flags.'+ns+'.castJournal']:prior});const meta={version:1,journalUuid:journal.uuid,status:'ready',changes:prior.steps.reduce((n,s)=>n+s.operations.length,0)};if(stateText(meta)!==stateText(get(root,'castUndo')))await root.update({['flags.'+ns+'.castUndo']:meta});}
  if(error)throw error;return value;
 });
}
export async function payStructuredJutsu(actor,item,projection,expected){
 if(!actor?.isOwner||!game.users.activeGM)throw Error('Um mestre conectado precisa processar o uso.');
 const message=await foundry.documents.ChatMessage.create({whisper:[...new Set([game.user.id,game.users.activeGM.id])],content:'<p>Pagamento de jutsu.</p>',flags:{[ns]:{undoVersion:1,jutsuPaymentRequest:{actorUuid:actor.uuid,itemUuid:item.uuid,level:projection.usedLevel,cost:projection.cost,expected}}}});
 if(isProcessor())await processStructuredPayment(message);
 if(!get(message,'jutsuPaymentResult'))await new Promise((resolve,reject)=>{const hook=Hooks.on('updateChatMessage',m=>{if(m.uuid===message.uuid&&get(message,'jutsuPaymentResult')){clearTimeout(timer);Hooks.off('updateChatMessage',hook);resolve();}}),timer=setTimeout(()=>{Hooks.off('updateChatMessage',hook);reject(Error('Pagamento pendente. Confira o registro antes de tentar outro uso.'));},20000);});
 const result=get(message,'jutsuPaymentResult');if(!result?.paid)throw Error(result?.reason||'Pagamento indisponível.');return message.uuid;
}
export async function processStructuredPayment(message){
 const request=get(message,'jutsuPaymentRequest');if(!isProcessor()||!request||get(message,'jutsuPaymentResult'))return;
 return serial('payment:'+message.uuid,()=>serial('paymentActor:'+request.actorUuid,async()=>{if(get(message,'jutsuPaymentResult'))return;let result;
  try{const actor=await fromUuid(request.actorUuid),item=await fromUuid(request.itemUuid),{jutsuProjection}=await import('./item-view.mjs'),p=item&&jutsuProjection(item,{usedLevel:request.level});
   if(item?.actor!==actor||!actor?.testUserPermission(message.author,'OWNER')||!p?.valid||p.cost!==request.cost||actor.system.resources.chakra.value!==request.expected||!Number.isInteger(request.expected)||request.expected<p.cost)throw Error('A técnica, a permissão ou o chakra mudou. Abra um novo uso.');
   await runCastStep(message,[actor],'Custo',()=>actor.update({'system.resources.chakra.value':request.expected-p.cost}));result={paid:true,cost:p.cost};
  }catch(e){result={paid:false,reason:e.message};}
  await message.update({['flags.'+ns+'.jutsuPaymentResult']:result,content:'<p>'+(result.paid?'Custo pago.':'Não foi possível pagar o custo.')+'</p>'});
 }));
}
function fieldsPatch(fields){return Object.fromEntries(fields.map(f=>[f.path,f.before.exists?structuredClone(f.before.value):new foundry.data.operators.ForcedDeletion()]));}
async function currentActors(journal){const map=new Map();for(const key of Object.keys(get(journal,'castJournal').guards)){const uuid=castStorageUuid(key),actor=await fromUuid(uuid);if(!actor?.isOwner||!actor.items)throw Error('Uma ficha afetada não está mais disponível.');map.set(uuid,actor);}return map;}
function areaSnapshot(doc){const data=doc.toObject();delete data._stats;delete data._id;return data;}
export async function recordCastArea(doc,options,userId){
 if(!isProcessor())return;const origin=get(doc,'areaTemplate')?.messageUuid||get(doc,'npcJutsuCast');if(typeof origin!=='string')return;const message=await fromUuid(origin);if(!message||!get(messageCastRoot(message),'castUndo'))return;
 return serial('cast:'+messageCastRoot(message).uuid,async()=>{assertCastActive(message);const {journal}=await journalOf(message),state=structuredClone(get(journal,'castJournal')),actor=await fromUuid(state.casterUuid),user=game.users.get(userId);if(!user?.isGM&&!actor?.testUserPermission(user,'OWNER'))return;state.areas??={};state.areas[castStorageKey(doc.uuid)]=areaSnapshot(doc);await journal.update({['flags.'+ns+'.castJournal']:state});});
}
async function validateAreas(state){for(const [key,data]of Object.entries(state.areas??{})){const doc=await fromUuid(castStorageUuid(key));if(doc&&stateText(areaSnapshot(doc))!==stateText(data))throw Error('Uma área deste uso foi alterada. Confira a área antes de desfazer.');}}
export async function castUndoStatus(message){
 if(!game.user.isGM||!get(message,'castUndo'))return {available:false};
 const {root,journal}=await journalOf(message);if(!journal)return {available:false};const state=get(journal,'castJournal');
 if(state.status==='undone')return {available:true,undone:true};
 const dependency=state.conflict||laterDependency(journal,state);if(dependency)return {available:true,blocked:dependency};
 const actors=await currentActors(journal);for(const [uuid,actor]of actors){const hash=await guardHash(state,uuid,castActorSnapshot(actor)),key=castStorageKey(uuid),expected=state.undo?.guards?.[key]??state.guards[key];if(hash!==expected)return {available:true,blocked:'A ficha de '+actor.name+' mudou após este uso. Confira as ações e o dano posteriores.'};}
 return {available:true,root,journal,actors,resume:state.status==='undoing'};
}
export async function undoCast(message){
 if(!isProcessor()||!game.user.isGM)throw Error('O mestre ativo precisa desfazer o uso.');
 return serial('cast:'+messageCastRoot(message)?.uuid,async()=>{
  const {root,journal}=await journalOf(message);if(!journal)throw Error('Este uso não tem registro de reversão.');let state=structuredClone(get(journal,'castJournal'));if(state.status==='undone')return state;
  const dependency=state.conflict||laterDependency(journal,state);if(dependency)throw Error(dependency);await validateAreas(state);const actors=await currentActors(journal);
  const resuming=state.status==='undoing';state.undo??={cursor:0,operations:[...Object.entries(state.areas??{}).map(([key,data])=>({kind:'area',uuid:castStorageUuid(key),data})),...reversalOperations(state.steps)],guards:structuredClone(state.guards)};
  // Validate every participant before writing anything. A crash after one write
  // can resume only if replaying that exact write reproduces the saved hash.
  const op=state.undo.operations[state.undo.cursor];let recovered=false;
  for(const [uuid,actor]of actors){const snapshot=castActorSnapshot(actor),key=castStorageKey(uuid);if(await guardHash(state,uuid,snapshot)===state.undo.guards[key])continue;
   if(resuming&&op?.actorUuid===uuid){const original=simulateReversal(snapshot,op,{forward:true});if(stateText(simulateReversal(original,op))===stateText(snapshot)&&await guardHash(state,uuid,original)===state.undo.guards[key]){state.undo.guards[key]=await guardHash(state,uuid,snapshot);recovered=true;continue;}}
   throw Error('A ficha de '+actor.name+' mudou após este uso. Desfaça ou confira as ações posteriores primeiro.');
  }
  if(recovered)state.undo.cursor++;state.status='undoing';await journal.update({['flags.'+ns+'.castJournal']:state});await root.update({['flags.'+ns+'.castUndo.status']:'undoing'});
  while(state.undo.cursor<state.undo.operations.length){const operation=state.undo.operations[state.undo.cursor];
   if(operation.kind==='area'){const doc=await fromUuid(operation.uuid);if(doc){if(stateText(areaSnapshot(doc))!==stateText(operation.data))throw Error('A área mudou durante a reversão.');await doc.delete({snsCastUndo:true});}state.undo.cursor++;await journal.update({['flags.'+ns+'.castJournal']:state});continue;}
   const actor=actors.get(operation.actorUuid),before=castActorSnapshot(actor);
   if(await guardHash(state,actor.uuid,before)!==state.undo.guards[castStorageKey(actor.uuid)])throw Error('A ficha mudou durante a reversão. Nenhuma etapa restante foi aplicada.');
   if(operation.kind==='created')await actor.deleteEmbeddedDocuments('Item',[operation.itemId],{snsCastUndo:true});
   else if(operation.kind==='deleted')await actor.createEmbeddedDocuments('Item',[{_id:operation.itemId,...operation.data}],{keepId:true,snsCastUndo:true});
   else if(operation.kind==='item')await actor.items.get(operation.itemId).update(fieldsPatch(operation.fields),{snsCastUndo:true});
   else await actor.update(fieldsPatch(operation.fields),{snsCastUndo:true,snsDamageOperation:true});
   await (await import('./effect-item-service.mjs')).reconcileEffectItems(actor);
   const after=castActorSnapshot(actor),desired=simulateReversal(before,operation);if(stateText(after)!==stateText(desired))throw Error('A reversão teve uma alteração adicional. Confira a ficha antes de continuar.');
   state.undo.guards[castStorageKey(actor.uuid)]=await guardHash(state,actor.uuid,after);state.undo.cursor++;await journal.update({['flags.'+ns+'.castJournal']:state});
  }
  state.status='undone';state.undoneBy=game.user.id;state.undoneAt=new Date().toISOString();await journal.update({['flags.'+ns+'.castJournal']:state});await root.update({['flags.'+ns+'.castUndo.status']:'undone'});return state;
 });
}
export async function decorateCastUndo(message,element){
 if(get(message,'castJournal')||get(message,'jutsuPaymentRequest')){element.classList.add('sns-cast-internal');return;}
 const root=messageCastRoot(message),meta=get(root,'castUndo');if(!meta)return;
 if(['undoing','undone'].includes(meta.status)){element.classList.add('sns-cast-undone');if(!element.querySelector('.sns-cast-undone-label')){const p=document.createElement('p');p.className='sns-cast-undone-label';p.textContent=meta.status==='undone'?'Uso desfeito':'Reversão em andamento';(element.querySelector('.message-content')??element).prepend(p);}}
 if(root!==message||!game.user.isGM||element.querySelector('[data-cast-undo]')||meta.status==='undone')return;
 const footer=document.createElement('footer');footer.className='sns-cast-undo';footer.dataset.castUndo='';const button=document.createElement('button');button.type='button';button.dataset.castUndoButton='';button.textContent=meta.status==='undoing'?'Retomar reversão':'Desfazer uso';const reason=document.createElement('p');reason.className='sns-undo-reason';reason.hidden=true;button.addEventListener('click',async()=>{button.disabled=true;reason.hidden=true;try{await undoCast(message);}catch(e){reason.textContent=e.message;reason.hidden=false;}finally{button.disabled=false;}});footer.append(button,reason);(element.querySelector('.message-content')??element).append(footer);
}
export function mayWriteCastPresentation(message,expanded,userId){
 if(['undoing','undone'].includes(get(messageCastRoot(message),'castUndo')?.status))return false;
 if(mayWriteDamagePresentation(message,expanded,userId))return true;
 const cast=get(message,'npcJutsuCast'),update=expanded.flags?.[ns]?.npcJutsuCast;
 if(!cast||cast.status!=='paid'||message.author?.id!==userId||expanded._id!==undefined&&expanded._id!==message.id||Object.keys(expanded).some(k=>!['flags','_id'].includes(k))||Object.keys(expanded.flags??{}).some(k=>k!==ns)||Object.keys(expanded.flags?.[ns]??{}).some(k=>k!=='npcJutsuCast')||!update||Object.keys(update).some(k=>!['status','attackUuid','targets'].includes(k))||update.status!=='attacked')return false;
 const child=game.messages.get(update.attackUuid?.split('.').at(-1)),packet=get(child,'damageUse');
 return !!child&&child.author?.id===userId&&get(child,'npcCastParent')===message.uuid&&packet?.actorUuid===cast.actorUuid&&packet?.itemUuid===cast.itemUuid&&stateText(packet.targets)===stateText(update.targets);
}
export function installCastUndo(){
 const process=message=>{if(isProcessor()){void processStructuredPayment(message).catch(console.error);if(get(message,'jutsuPayment'))void journalOf(message).catch(console.error);if(get(message,'npcJutsuCast')?.undoVersion===1&&get(message,'npcJutsuCast').status==='pending')void import('./npc-jutsu-service.mjs').then(m=>m.completeNpcCast(message)).catch(e=>ui.notifications.warn(e.message));}};
 Hooks.on('createChatMessage',process);Hooks.on('snsProcessorReady',()=>{for(const message of game.messages)process(message);});
 Hooks.on('createRegion',(doc,options,userId)=>void recordCastArea(doc,options,userId).catch(console.warn));Hooks.on('createMeasuredTemplate',(doc,options,userId)=>void recordCastArea(doc,options,userId).catch(console.warn));
 Hooks.on('renderChatMessageHTML',(message,element)=>void decorateCastUndo(message,element).catch(console.error));
 Hooks.on('updateChatMessage',(message,changes)=>{if(!JSON.stringify(changes).includes('castUndo'))return;for(const child of game.messages)if(child!==message&&messageCastRoot(child)?.uuid===message.uuid)ui.chat?.updateMessage(child);});
 Hooks.on('preUpdateChatMessage',(message,changes,options,userId)=>{if(game.users.get(userId)?.isGM)return;const f=foundry.utils.expandObject(changes);if(mayWriteCastPresentation(message,f,userId))return;if(get(message,'castJournal')||get(message,'jutsuPaymentRequest')||f.flags?.[ns]?.castUndo||f.flags?.[ns]?.jutsuPayment||get(message,'castUndo')&&(f.flags||f.author||f.speaker||f['-=flags']))return false;});
}
