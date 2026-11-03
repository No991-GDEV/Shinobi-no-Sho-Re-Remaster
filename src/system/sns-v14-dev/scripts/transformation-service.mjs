import {isProcessor} from './processor-authority.mjs';
import {transitionPlan,transformationState,transformationSources,transformationProjection,profileFor,canControlTransformation,hasVaporArmor} from './transformation-core.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev',queues=new WeakMap();
const gm=()=>isProcessor();
export function transformationLock(actor,task){const next=(queues.get(actor)??Promise.resolve()).catch(()=>{}).then(task);queues.set(actor,next);return next;}
export async function changeTransformation(actor,request,eventKey=''){
 if(!gm()||!actor?.isOwner)throw Error('O mestre ativo precisa processar esta transformação.');
 return transformationLock(actor,async()=>{
  const plan=transitionPlan(actor,request,eventKey);if(plan.duplicate)return plan;
  await actor.update({...plan.patch,['flags.'+ns+'.transformations']:plan.state});
  await syncTransformationTokens(actor);
  const p=plan.profile,mode=p.def.modes.find(m=>m.id===plan.row.mode),buff=request.buff&&p.def.buffs.find(b=>b.id===request.buff);
  const title=buff?.name??mode.name,active=buff?plan.row.buffs.includes(buff.id):mode.rank>0;
  await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:'<article class="sns-activation-card"><header><img src="icons/svg/fire.svg" alt=""><div><strong>'+esc(title)+'</strong><span>'+esc(active?'Ativado':'Encerrado')+'</span></div></header><div class="sns-activation-facts"><span>'+esc(plan.action)+'</span><span>'+esc(plan.payment==='vitality'?'Vitalidade':'Chakra')+' '+plan.cost+'</span><span>Nível '+p.level+'</span></div><p>'+esc(p.def.name+(mode.tails?' · '+plan.row.tails+' cauda(s)':''))+'</p><details><summary>Benefícios e regras</summary><p>'+esc(p.def.source)+'</p></details></article>'});
  return plan;
 });
}
export async function requestTransformation(actor,request){
 if(!actor?.isOwner)throw Error('É preciso controlar esta ficha.');
 if(!canControlTransformation(actor))throw Error('O mestre está controlando a transformação forçada.');
 if(gm())return changeTransformation(actor,request);
 const active=game.users.activeGM;if(!active)throw Error('Um mestre precisa estar conectado para processar a transformação.');
 return foundry.documents.ChatMessage.create({whisper:[active.id,game.user.id],content:'<strong>'+esc(actor.name)+'</strong><p>Transformação solicitada.</p>',flags:{[ns]:{transformationRequest:{actorUuid:actor.uuid,request}}}});
}
export function guardTransformationUpdate(actor,changes,options,user){
 const expanded=foundry.utils.expandObject(changes),flags=expanded.flags?.[ns];
 if(!user.isGM&&(Object.hasOwn(expanded,'-=flags')||Object.hasOwn(expanded.flags??{},'-='+ns)||Object.hasOwn(flags??{},'transformations')||Object.hasOwn(flags??{},'-=transformations')))return false;
}
export function mayEditTransformationItem(before,after,isGM){
 if(isGM)return true;const a=before?.flags?.[ns]??{},b=after?.flags?.[ns]??{};
 return ['delayControl','transformationImages','vaporSealBroken'].every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]));
}
async function processRequest(message){
 const packet=message.getFlag(ns,'transformationRequest');if(!gm()||!packet||message.getFlag(ns,'transformationResult'))return;
 let result;
 try{const actor=await fromUuid(packet.actorUuid);if(!actor?.testUserPermission(message.author,'OWNER'))throw Error('O autor não controla esta ficha.');if(!canControlTransformation(actor,message.author))throw Error('O mestre está controlando a transformação forçada.');
  if(packet.request.operation==='technique'){const {useTransformationTechnique}=await import('./transformation-techniques.mjs');await useTransformationTechnique(actor,packet.request.sourceId,packet.request.technique,{...packet.request.options,targets:packet.request.targets,eventKey:message.id});}
  else{const row=transformationState(actor).entries.find(r=>r.sourceId===packet.request.sourceId);if(row?.playerLocked)throw Error('O mestre está controlando a transformação forçada.');await changeTransformation(actor,packet.request,message.id);}result={ok:true};}
 catch(e){result={ok:false,reason:e.message};}
 await message.update({['flags.'+ns+'.transformationResult']:result,content:'<strong>Transformação</strong><p>'+esc(result.ok?'Concluída.':result.reason)+'</p>'});
}
const appearanceLocks=new Map();
export async function syncTransformationTokens(actor){
 const key=actor.uuid??actor.id,prior=appearanceLocks.get(key)??Promise.resolve();
 const task=prior.catch(()=>{}).then(()=>syncAppearance(actor));appearanceLocks.set(key,task);
 try{return await task;}finally{if(appearanceLocks.get(key)===task)appearanceLocks.delete(key);}
}
async function syncAppearance(actor){
 if(!gm())return;
 const p=transformationProjection(actor),active=p.active.find(a=>a.mode),image=active?.profile.source.flags?.[ns]?.transformationImages?.[active.mode.id],size=p.size;
 const tokens=[...Array.from(game.scenes??[]).flatMap(s=>Array.from(s.tokens??[]).filter(t=>t.actor?.uuid===actor.uuid)),...(actor.prototypeToken?[actor.prototypeToken]:[])];
 for(const token of tokens){
  // Compare persisted appearance, not transient prepared values during linked-actor updates.
  const persisted=token.toObject(),old=persisted.flags?.[ns]?.transformationAppearance,current={src:persisted.texture.src,width:persisted.width,height:persisted.height},base=structuredClone(old?.base??current),applied=old?.applied??{};
  for(const key of Object.keys(base))if(old&&applied[key]!==undefined&&current[key]!==applied[key])base[key]=current[key];
  const desired=active?{src:image||base.src,width:size?.token??base.width,height:size?.token??base.height}:base;
  const update={};if(current.src!==desired.src)update['texture.src']=desired.src;if(current.width!==desired.width)update.width=desired.width;if(current.height!==desired.height)update.height=desired.height;
  if(active){const next={base,applied:desired};if(JSON.stringify(next)!==JSON.stringify(old))update['flags.'+ns+'.transformationAppearance']=next;}
  else if(old)update['flags.'+ns+'.transformationAppearance']=new foundry.data.operators.ForcedDeletion();
  if(Object.keys(update).length){await token.update(update,{snsTransformationToken:true});token.reset();}
 }
}
export function transformationView(actor){
 const state=transformationState(actor),projection=transformationProjection(actor);
 return transformationSources(actor).map(p=>{
  const row=state.entries.find(e=>e.sourceId===p.source.id)??{mode:'normal',tails:1,usedLevel:Math.max(2,p.level),buffs:[],turns:0},mode=p.def.modes.find(m=>m.id===row.mode),live=projection.active.find(e=>e.row.sourceId===row.sourceId&&e.mode);
  return {sourceId:p.source.id,name:p.def.name,level:p.level,modeName:mode?.name??'Normal',active:!!live,problem:row.problem??(p.control&&row.mode!=='normal'&&!row.controlPaid?'Controle Total: regularize a ativação.':''),safe:p.control?'Uma cena':Math.max(0,1+p.level-row.turns)+' turnos seguros',control:p.control,
   modes:p.def.modes.map(m=>({id:m.id,name:m.name,selected:m.id===row.mode,disabled:p.level<m.minLevel||m.control&&!p.control||m.rank>(mode?.rank??0)+1,action:m.rank>(mode?.rank??0)?m.action:'Livre'})),
   tails:p.def.tails.filter(t=>t.level<=p.level&&(!p.def.falseBijuu||t.count<=(p.source.flags?.[ns]?.falseBijuuTails??1))).map(t=>({...t,selected:t.count===row.tails})),levels:Array.from({length:Math.max(0,p.level-1)},(_,i)=>({value:i+2,selected:i+2===row.usedLevel})),
   buffs:p.def.buffs.map(b=>({id:b.id,name:b.name,active:row.buffs.includes(b.id),disabled:!row.buffs.includes(b.id)&&(p.level<b.minLevel||!hasVaporArmor(actor,p.def)||b.incompatibleModes.includes(row.mode)),cost:b.steps?.filter(s=>s.level<=p.level).at(-1)?.cost??b.cost})),
   benefits:[...projection.effects.filter(e=>e.sourceId===p.source.id&&e.kind==='attributeModifier').map(e=>e.target.toUpperCase()+' +'+e.value+(e.scope==='all'?'':' · '+({size:'tamanho',tests:'testes',movement:'deslocamento',testsAndUnarmed:'testes e dano desarmado'}[e.scope]??e.scope))),live?.mode.hardness?'Dureza '+live.mode.hardness:'',live?.mode.accelerated?'Acelerado':'',live?.mode.restrictTechniques?'Técnicas limitadas à bijuu':''].filter(Boolean).join(' · '),
   techniques:projection.grants.filter(g=>g.sourceId===p.source.id).map(g=>({id:g.id,name:g.name,action:g.action,range:g.range,costText:g.cost===0?'Sem custo':typeof g.cost==='number'?'Chakra '+g.cost:g.cost==='bomb'?'Custo: 1,5 × nível usado':g.cost==='half'?'Custo: metade do nível usado':'Custo: nível usado',icon:['beast','horn','arm','partial'].includes(g.id)?'hand-fist':'fire',shot:g.id==='shot',bomb:g.id==='bomb',arm:['arm','partial'].includes(g.id),created:g.row.arms?.some(a=>a.id===g.id)})),hasTechniques:projection.grants.some(g=>g.sourceId===p.source.id)};
 });
}
export function installTransformationHooks(){
 Hooks.on('snsProcessorReady',async()=>{if(gm())for(const actor of game.actors){if(transformationState(actor).entries.length){await syncTransformationTokens(actor);await import('./transformation-techniques.mjs').then(m=>m.reconcileDominationCondition(actor));}}});
 Hooks.on('createChatMessage',processRequest);
 Hooks.on('preUpdateChatMessage',(message,changes,options,userId)=>{
  if(game.users.get(userId)?.isGM||!message.getFlag(ns,'transformationRequest'))return;
  const e=foundry.utils.expandObject(changes);if(['flags','author','speaker','-=flags','-=author','-=speaker'].some(k=>Object.hasOwn(e,k)))return false;
 });
 Hooks.on('updateActor',(actor,changes,options)=>{if(!options.snsTransformationToken&&JSON.stringify(changes).includes('transformations'))syncTransformationTokens(actor).catch(console.error);});
 Hooks.on('createToken',token=>{if(token.actor)syncTransformationTokens(token.actor).catch(console.error);});
 Hooks.on('updateActor',(actor,changes)=>{if(gm()&&JSON.stringify(changes).includes('transformations')&&transformationState(actor).entries.some(r=>r.domination?.pendingCondition))import('./transformation-techniques.mjs').then(m=>m.reconcileDominationCondition(actor)).catch(console.error);});
 Hooks.on('updateItem',async(item,changes)=>{
  const actor=item.actor;if(!gm()||!actor||!transformationState(actor).entries.length)return;
  const row=transformationState(actor).entries.find(r=>r.sourceId===item.id),p=profileFor(actor,item.id);
  if(row&&p?.control&&row.mode!=='normal'&&!row.controlPaid){
   try{await changeTransformation(actor,{sourceId:item.id,mode:row.mode,tails:row.tails,usedLevel:Math.min(row.usedLevel,p.level),resource:row.resource??'chakra'});}
   catch(e){const state=structuredClone(transformationState(actor)),r=state.entries.find(r=>r.sourceId===item.id);r.suspended=true;r.problem=e.message;await actor.update({'flags.sns-v14-dev.transformations':state});}
  }
  await syncTransformationTokens(actor);
 });
 Hooks.on('deleteItem',item=>{if(item.actor)syncTransformationTokens(item.actor).catch(console.error);});
}
