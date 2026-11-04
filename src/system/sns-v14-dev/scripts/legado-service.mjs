import {isProcessor} from './processor-authority.mjs';
import {withEffectLock,clockActors} from './effect-lifecycle.mjs';
import {loadCanonicalLibrary,canonicalCopy} from './canonical-content.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {legadoPlan} from './legado-plan.mjs';
import {legadoPayment} from './legado-payment.mjs';
import {planLegadoCopy,copyAllocation} from './legado-copy.mjs';
import {legadoState,legadoItems,isLegado,legadoId,hasLegado,legadoSelected,legadoHasMangekyo,legadoEternal,legadoTransplant,restLegadoVision,legadoSusanoo} from './legado-core.mjs';
import {activeLegadoEffects,legadoEffect,addLegadoEffect,endLegadoGroup,applyLegadoOcularStates,applyLegadoSelfEffect} from './legado-effects.mjs';
import {actorCombat} from './effect-duration.mjs';
import {effectiveHardness} from './transformation-core.mjs';
import {escapeHtml as esc,calculate} from './kernel.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
const ns='sns-v14-dev',reconciling=new WeakSet();
const time=()=>game.time?.worldTime??0;
export const legadoTurnKey=actor=>{const c=actorCombat(actor);return c?[c.id,c.round,c.turn].join('~'):'';};
export async function reconcileLegadoGrants(actor){
 if(!isProcessor()||!actor?.isOwner||reconciling.has(actor)||!legadoItems(actor).some(i=>isLegado(i)&&i.type==='aptitude'))return;
 reconciling.add(actor);try{
  const library=await loadCanonicalLibrary();if(!library)return;
  const allowed=new Set();if(hasLegado(actor,'nidan-sharingan'))allowed.add('mimica-sharingan');if(hasLegado(actor,'sandan-sharingan'))allowed.add('hipnose-sharingan');
  if(legadoHasMangekyo(actor))for(const e of library.entries.filter(e=>e.id.startsWith('sns:legado:jutsu:')))allowed.add(e.id.split(':').at(-1));
  // Fixed point for shared prerequisites (Kamui/Hachiman before their branches).
  for(let pass=0;pass<3;pass++)for(const key of allowed){
   const id='sns:legado:jutsu:'+key;if(legadoItems(actor).some(i=>legadoId(i)===id))continue;
   const entry=library.entries.find(e=>e.id===id);if(!entry||!requirementsFor(entry.document,actor).valid)continue;
   const data=canonicalCopy(entry);data.flags[ns].legadoGrant={sourceId:legadoItems(actor).find(i=>i.type==='aptitude'&&isLegado(i)).id};await actor.createEmbeddedDocuments('Item',[data]);
  }
  if(legadoEternal(actor)){
   const ocular=activeLegadoEffects(actor).filter(i=>legadoEffect(i).kind.startsWith('ocular-')||legadoEffect(i).kind.startsWith('blindness-'));
   if(ocular.length)await actor.updateEmbeddedDocuments('Item',ocular.map(i=>({_id:i.id,'system.appliedCondition.active':false})));
  }
 }finally{reconciling.delete(actor);}
}
export async function processLegadoCast(message){
 if(!isProcessor())return;const cast=message.getFlag(ns,'npcJutsuCast');if(!cast?.plan.legado)return;
 const actor=await fromUuid(cast.actorUuid),item=await fromUuid(cast.itemUuid);
 if(!actor?.testUserPermission(message.author,'OWNER')||item?.actor!==actor||!isLegado(item))return;
 if(cast.status==='pending')await (await import('./npc-jutsu-service.mjs')).completeNpcCast(message);
 if(message.getFlag(ns,'npcJutsuCast').status!=='pending')await finalizeLegadoCast(message);
}
export async function finalizeLegadoCast(message){
 if(!isProcessor())return;const cast=message.getFlag(ns,'npcJutsuCast'),actor=await fromUuid(cast?.actorUuid);if(!actor||!cast.plan.legado||cast.status==='pending')return;
 await withEffectLock(actor,async()=>{
  const done=actor.getFlag(ns,'legadoFinalized')??{};if(done[message.id])return;
  const payment=actor.getFlag(ns,'npcCastLedger')?.[message.id];if(!payment)return;
  await applyLegadoOcularStates(actor,cast.plan,{states:payment.legadoStates??[],state:legadoState(actor)},message.id);
  await applyLegadoSelfEffect(actor,message);
  if(cast.plan.legado.key==='mimica-sharingan')await resolveMimic(actor,cast.plan,message.id);
  if(cast.plan.legado.mode==='extinguir')for(const t of cast.targets){const target=await fromUuid(t.uuid);if(target?.isOwner)for(const i of activeLegadoEffects(target).filter(i=>legadoEffect(i).kind==='incendiado'))await i.update({'system.appliedCondition.active':false});}
  if(cast.plan.legado.endSusanoo)await addLegadoEffect(actor,{name:'Fatigado · Indra-no-Vajra',kind:'indra-fatigue',group:message.id,condition:'fatigado',turns:3,sourceUuid:message.uuid,data:{note:'Susano’o não pode ser reativado enquanto durar esta condição.'}});
  await actor.update({['flags.'+ns+'.legadoFinalized.'+message.id]:{at:time()}});
 });
}
async function resolveMimic(actor,plan,requestId){
 const {mode,params}=plan.legado,state=structuredClone(legadoState(actor));state.copies??=[];
 if(['copiar','copia-rapida','anular'].includes(mode)){
  const id=requestId.slice(0,15);if(state.copies.some(c=>c.id===id))return;
  const library=await loadCanonicalLibrary(),copy=planLegadoCopy(actor,library.entries,params,{id,worldTime:time()});
  for(const doc of copy.documents){doc.flags[ns].acquisition.authorizedBy=game.user.id;if(!actor.items.has(doc._id))await actor.createEmbeddedDocuments('Item',[doc],{keepId:true});}
  if(copy.documents.some(d=>!actor.items.has(d._id)))throw Error('A cópia não pôde ser concluída. Os pontos de Mímica não foram alocados.');
  state.copies.push(copy.record);
 }else{
  const row=state.copies.find(c=>c.id===params.copyId&&!c.forgotten);if(!row)throw Error('A cópia não está mais disponível.');
  if(mode==='memorizar'){
   for(const old of state.copies.filter(c=>c.memorized&&c!==row&&!c.learned&&!c.forgotten)){old.forgotten=true;await actor.deleteEmbeddedDocuments('Item',old.itemIds.filter(id=>actor.items.has(id)));}
   row.memorized=true;row.allocation=copyAllocation(row.cost,true);row.expires=null;
  }else if(mode==='esquecer'){row.forgotten=true;row.allocation=0;await actor.deleteEmbeddedDocuments('Item',row.itemIds.filter(id=>actor.items.has(id)));}
  else if(mode==='aprender'){
   if(!row.memorized||row.learned)throw Error('Primeiro memorize uma cópia ainda não aprendida.');
   const balance=actor.type==='shinobi'?calculate(actor.system.toObject(),characteristicEffects(actor),actor.items).budgets.powers.balance:Infinity;
   if(balance<2)throw Error('São necessários2PPdisponíveis para aprender a técnica.');
   const memory={name:'Técnica memorizada · '+row.name,type:'aptitude',img:'icons/svg/eye.svg',system:{contentId:'sns:legado:memory:'+row.id,category:'aptitudes',description:'<p>Técnica aprendida pela Mímica Sharingan. Não pode cumprir pré-requisitos de outras compras.</p>',details:{powerCost:2},source:{id:'Legado do Ódio',pages:'PDF9–10'}},flags:{[ns]:{acquisition:{mode:'paid'},legadoMemory:{copyId:row.id}}}};
   const existing=actor.items.find(i=>i.flags?.[ns]?.legadoMemory?.copyId===row.id);if(!existing)await actor.createEmbeddedDocuments('Item',[memory]);
   if(!actor.items.some(i=>i.flags?.[ns]?.legadoMemory?.copyId===row.id))throw Error('A compra de2PPnão pôde ser concluída.');row.learned=true;row.allocation=0;row.expires=null;
  }
 }
 await actor.update({['flags.'+ns+'.legado']:state});
}
export async function requestLegadoControl(actor,op,payload={}){
 if(!actor?.isOwner||!game.users.activeGM)throw Error('Controle esta ficha e mantenha um mestre conectado.');
 if(op==='escape')return (await import('./legado-workflow.mjs')).rollLegadoEscape(actor,actor.items.get(payload.effectId));
 if(op==='rest-vision'){
  const days=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Descanso Sharingan'},content:'<label>Dias completos de repouso sem usar Sharingan<input name="days" type="number" min="1" max="365" value="7"></label>',ok:{label:'Registrar repouso',callback:(e,b)=>Number(b.form.elements.days.value)}});if(!days)return;payload={days};
 }
 const request=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),whisper:[...new Set([game.user.id,game.users.activeGM.id])],content:'<p>Legado do Ódio · '+esc(op==='rest-vision'?'Descanso Sharingan':op==='end-active'?'Encerrar técnica':'Controle da técnica')+'</p>',flags:{[ns]:{legadoRequest:{actorUuid:actor.uuid,op,payload,version:1}}}});
 if(isProcessor())await processLegadoRequest(request);return request;
}
export async function processLegadoRequest(message){
 if(!isProcessor()||!message.getFlag(ns,'legadoRequest')||message.getFlag(ns,'legadoResult'))return;
 await withEffectLock(message,async()=>{
  if(message.getFlag(ns,'legadoResult'))return;const r=message.getFlag(ns,'legadoRequest'),actor=await fromUuid(r.actorUuid);
  try{
   if(r.version!==1||!actor?.testUserPermission(message.author,'OWNER'))throw Error('Sem permissão para esta ficha.');
   await withEffectLock(actor,async()=>{
    const done=actor.flags?.[ns]?.legadoControls??{};if(done[message.id])return;
    const state=structuredClone(legadoState(actor));
    if(r.op==='unlock-eye'){if(!message.author.isGM||!state.vision?.locked)throw Error('O mestre libera o olho após o intervalo de recuperação.');state.vision.locked=false;}else if(r.op==='rest-vision'){
     const rest=restLegadoVision(actor,r.payload.days);state.vision=rest.vision;
     if(rest.recovered){for(const i of activeLegadoEffects(actor).filter(i=>legadoEffect(i).persistVision&&!legadoEffect(i).kind.startsWith('tsukuyomi')))await i.update({'system.appliedCondition.active':false});const source=legadoItems(actor).find(i=>legadoId(i)==='sns:legado:apt:mangekyo-sharingan'),rows=structuredClone(Array.from(actor.system.specialResources??[]));const row=rows.find(r=>r.sourceId===source?.id&&r.kind==='vision');if(row){row.value=rest.vision.value;await actor.update({'system.specialResources':rows});}}
    }else if(r.op==='end-active'){
     const key=r.payload.key;if(typeof key!=='string'||!state.active?.[key]&&!(key==='susanoo'&&state.susanoo?.active))throw Error('Esta técnica não está ativa.');
     delete state.active?.[key];if(key==='hachiman')for(const name of Object.keys(state.active??{}))if(name.startsWith('hachiman-'))delete state.active[name];if(key==='susanoo')state.susanoo.active=false;
     for(const i of activeLegadoEffects(actor).filter(i=>legadoEffect(i).selfKey===key))await endLegadoGroup(actor,legadoEffect(i).group);
    }else if(r.op==='end-effect'){
     const item=actor.items.get(r.payload.effectId),data=legadoEffect(item);if(!item?.system.appliedCondition.active||!data)throw Error('Efeito indisponível.');
     if((data.permanent||data.persistVision||data.escape)&&!message.author.isGM)throw Error('Este estado exige o tratamento ou recuperação descrito no livro.');await item.update({'system.appliedCondition.active':false});
    }else throw Error('Controle de Legado desconhecido.');
    await actor.update({['flags.'+ns+'.legado']:state,['flags.'+ns+'.legadoControls.'+message.id]:{op:r.op,at:time()}});
   });
   await message.update({content:'<p>Legado do Ódio · '+(r.op==='rest-vision'?'Repouso registrado.':'Técnica encerrada.')+'</p>',['flags.'+ns+'.legadoResult']:{status:'done'}});
  }catch(e){await message.update({content:'<p>'+esc(e.message)+'</p>',['flags.'+ns+'.legadoResult']:{status:'blocked',reason:e.message}});}
 });
}
export async function processLegadoTurn(actor,event){
 if(!isProcessor()||!actor?.isOwner||!legadoItems(actor).some(isLegado)&&!activeLegadoEffects(actor).length)return;const key=[event.combatId,event.combatantId,event.round,event.phase].join('~'),state=structuredClone(legadoState(actor));if(state.turns?.[key])return;
 let changed=false;
 await (await import('./legado-workflow.mjs')).processMahikamiAreaTurn(actor,event);
 if(event.actor?.uuid===actor.uuid&&event.phase==='start'&&state.susanoo?.yomiHardness){state.susanoo.yomiHardness=0;state.susanoo.yomiShield=false;changed=true;}
 if(event.actor?.uuid===actor.uuid&&event.phase==='start'&&state.active?.['ame-no-tejikara']?.mode==='portal'&&(state.active['ame-no-tejikara'].turns??0)>=Math.floor(actor.system.nc/2)){delete state.active['ame-no-tejikara'];changed=true;}
 if(event.actor?.uuid===actor.uuid&&event.phase==='start'){
  if(state.susanooCooldown>0){state.susanooCooldown--;changed=true;}
  for(const [name,active]of Object.entries(state.active??{})){
   const mode=name==='hachiman'?'manter':name==='ame-no-tejikara'&&active.mode==='portal'?'manter':name==='mahikami'&&active.sustained?'sustentar':'';if(!mode||(active.turnKey??'').split('~')[0]===event.combatId&&Number((active.turnKey??'').split('~')[1])>=event.round)continue;
   const item=legadoItems(actor).find(i=>legadoId(i)==='sns:legado:jutsu:'+name);if(!item)continue;
   try{const plan=legadoPlan(item,{mode}),payment=legadoPayment(actor,plan,{receiptKey:key+'~'+name,worldTime:time(),turnKey:key});await actor.update(payment.patch);await applyLegadoOcularStates(actor,plan,payment,key+'~'+name);}
   catch(e){const next=structuredClone(legadoState(actor));delete next.active?.[name];await actor.update({['flags.'+ns+'.legado']:next});ui.notifications.warn(actor.name+' · '+e.message);}
  }
 }
 for(const item of activeLegadoEffects(actor)){
  const data=legadoEffect(item);if(event.actor?.uuid!==actor.uuid)continue;
  if(data.kind==='incendiado'){
   const level=data.level??1;
   if(event.phase==='start'){
    const {applyDamage}=await import('./damage-application.mjs'),jinchuuriki=legadoItems(actor).find(i=>i.type==='power'&&legadoId(i)==='sns:power:jinchuuriki'),hardness=jinchuuriki?.system.level>=5?2:jinchuuriki?.system.level>=2?1:0;
    await applyDamage(actor,{requestKey:'legado:'+key+':'+item.id,source:item.name,sourceUuid:item.uuid,spec:{base:0,fixed:Math.ceil(level),grade:1,nature:'lethal',ignoreHardness:Math.max(0,effectiveHardness(actor)-hardness),ignoreArmor:true},decision:{kind:'incendiado',level}});
   }else await item.update({name:'Incendiado · '+(level+1),['flags.'+ns+'.legadoEffect.level']:level+1});
  }
 }
 const latest=structuredClone(legadoState(actor));latest.turns={...latest.turns,[key]:true};if(changed){latest.susanooCooldown=state.susanooCooldown;if(state.susanoo)latest.susanoo={...latest.susanoo,yomiHardness:state.susanoo.yomiHardness,yomiShield:state.susanoo.yomiShield};if(!state.active?.['ame-no-tejikara'])delete latest.active?.['ame-no-tejikara'];}await actor.update({['flags.'+ns+'.legado']:latest});
}
async function expireLegadoCopies(){
 if(!isProcessor())return;
 for(const actor of clockActors()){
  const original=legadoState(actor),expired=(original.copies??[]).filter(c=>!c.forgotten&&!c.memorized&&!c.learned&&c.expires<=time());
  const activeExpired=Object.entries(original.active??{}).filter(([,v])=>v.expires&&v.expires<=time());if(!expired.length&&!activeExpired.length)continue;
  await withEffectLock(actor,async()=>{const s=structuredClone(legadoState(actor));for(const e of expired){const row=s.copies.find(c=>c.id===e.id);row.forgotten=true;row.allocation=0;const ids=row.itemIds.filter(id=>actor.items.has(id));if(ids.length)await actor.deleteEmbeddedDocuments('Item',ids);}for(const [key]of activeExpired){delete s.active[key];for(const i of activeLegadoEffects(actor).filter(i=>legadoEffect(i).selfKey===key))await endLegadoGroup(actor,legadoEffect(i).group);}await actor.update({['flags.'+ns+'.legado']:s});});
 }
}
export function installLegadoHooks(){
 Hooks.on('createChatMessage',m=>{void processLegadoCast(m).catch(e=>ui.notifications.warn(e.message));void processLegadoRequest(m).catch(console.error);});
 Hooks.on('snsProcessorReady',()=>{for(const m of game.messages){if(m.getFlag(ns,'npcJutsuCast')?.plan?.legado&&!m.getFlag(ns,'legadoProcessed'))void processLegadoCast(m).catch(console.error);if(m.getFlag(ns,'legadoRequest')&&!m.getFlag(ns,'legadoResult'))void processLegadoRequest(m).catch(console.error);}for(const a of clockActors())void reconcileLegadoGrants(a).catch(console.error);});
 for(const name of ['createItem','updateItem','deleteItem'])Hooks.on(name,item=>{if(item.actor&&isLegado(item)&&['aptitude','jutsu','power'].includes(item.type))void reconcileLegadoGrants(item.actor).catch(console.error);});
 Hooks.on('updateActor',(a,changes)=>{if(changes.system?.attributes||Object.keys(changes).some(k=>k.startsWith('system.attributes'))||changes.flags?.[ns]?.legado||Object.keys(changes).some(k=>k.startsWith('flags.'+ns+'.legado')))void reconcileLegadoGrants(a).catch(console.error);});
 Hooks.on('updateWorldTime',()=>void expireLegadoCopies().catch(console.error));
 Hooks.on('preUpdateChatMessage',(m,changes,options,userId)=>{if(game.users.get(userId)?.isGM)return;if((m.getFlag(ns,'npcJutsuCast')?.plan?.legado||m.getFlag(ns,'legadoRequest'))&&['flags','content','speaker','author','rolls','-=flags'].some(k=>Object.hasOwn(foundry.utils.expandObject(changes),k)))return false;});
}
