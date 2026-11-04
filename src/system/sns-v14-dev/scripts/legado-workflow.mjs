import {isProcessor} from './processor-authority.mjs';
import {withEffectLock,clockActors} from './effect-lifecycle.mjs';
import {activeLegadoEffects,legadoEffect,endLegadoGroup,addLegadoEffect} from './legado-effects.mjs';
import {legadoState,legadoEyeActive,legadoItems,isLegado} from './legado-core.mjs';
import {SnsCheckDialog} from './check-dialog.mjs';
import {rollWithLegado} from './legado-fortune.mjs';
import {checkFlavor} from './chat-card.mjs';
import {rolledCheck,versusDifficulty} from './jutsu-outcomes.mjs';
const ns='sns-v14-dev',safeKey=id=>id.replaceAll('.','~'),syncing=new WeakSet();
export function escapeProgress(data,outcome){
 if(!['attribute:int','attribute:vig'].includes(data.escape)||!Number.isInteger(data.dc))throw Error('Este efeito não tem teste de libertação.');
 const successes=(data.successes??0)+(outcome==='passed'?1:0);
 return {successes,ended:!!data.requiredSuccesses&&successes>=data.requiredSuccesses,ignoreTurn:data.escape==='attribute:vig'&&outcome==='passed'};
}
export async function rollLegadoEscape(actor,item){
 const data=legadoEffect(item);if(!actor?.isOwner||!item?.system.appliedCondition?.active||!data?.escape)return;
 const {defenseSpec}=await import('./defense-choices.mjs');
 const base=defenseSpec(actor,data.escape,null,0,[],{resistance:{keys:[data.escape]}});if(!base)throw Error('Informe a precisão deste teste na ficha.');
 const title=item.name+' · Dif '+data.dc,dialog=actor.type==='shinobi'?await SnsCheckDialog.prompt(actor,data.escape,title,base.components):await SnsCheckDialog.promptRecorded(actor,{...base,name:title},base.components);if(!dialog)return;
 const roll=await rollWithLegado(actor,dialog.spec,{kind:'defense'}),result=rolledCheck(roll,dialog.spec),outcome=versusDifficulty(result,data.dc);
 return roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:checkFlavor(dialog.spec),flags:{[ns]:{legadoEscape:{actorUuid:actor.uuid,effectId:item.id,dc:data.dc,key:data.escape},testOutcome:{dc:data.dc,result:outcome},check:{actorImg:actor.img,key:data.escape}}}},{messageMode:dialog.messageMode});
}
export async function processLegadoEscape(message){
 const proof=message.getFlag(ns,'legadoEscape');if(!isProcessor()||!proof)return;
 const actor=await fromUuid(proof.actorUuid),item=actor?.items.get(proof.effectId),data=legadoEffect(item);
 if(!actor?.testUserPermission(message.author,'OWNER')||!item?.system.appliedCondition?.active||data?.escape!==proof.key||data.dc!==proof.dc)return;
 await withEffectLock(actor,async()=>{
  if(actor.flags?.[ns]?.legadoEscapeReceipts?.[message.id])return;
  const {defenseSpec}=await import('./defense-choices.mjs');const spec=defenseSpec(actor,proof.key,null,0,[],{resistance:{keys:[proof.key]}});
  if(!spec)return;const roll=message.rolls?.[0],native=roll?.dice?.[0]?.results?.filter(r=>r.active!==false)??[];if(native.length!==2)return;const precision=roll.total-native.reduce((n,r)=>n+r.result,0);const result=rolledCheck(roll,{...spec,precision,adjustment:0});if(!result)return;
  const outcome=versusDifficulty(result,data.dc),next=escapeProgress(legadoEffect(item),outcome);
  if(next.ended)await endLegadoGroup(actor,data.group);
  else{await item.update({['flags.'+ns+'.legadoEffect.successes']:next.successes});if(next.ignoreTurn)for(const e of activeLegadoEffects(actor).filter(i=>legadoEffect(i).rootUuid===item.uuid))await e.update({'system.appliedCondition.active':false});}
  await actor.update({['flags.'+ns+'.legadoEscapeReceipts.'+message.id]:{effectId:item.id,outcome,successes:next.successes}});
 });
}
export async function decorateLegadoChat(message,element){
 const cast=message.getFlag(ns,'npcJutsuCast');if(!cast?.plan.legado||!['kotoamatsukami','mahikami'].includes(cast.plan.legado.key))return;
 const root=element?.[0]??element;if(!root?.querySelector||root.querySelector('[data-legado-escapes]'))return;const box=document.createElement('section');box.dataset.legadoEscapes='';box.className='sns-npc-jutsu-controls';
 for(const actor of clockActors().filter(a=>a.isOwner))for(const item of activeLegadoEffects(actor).filter(i=>legadoEffect(i).sourceUuid===message.uuid&&legadoEffect(i).escape)){
  const d=legadoEffect(item),b=document.createElement('button');b.type='button';b.textContent=actor.name+' · '+(d.escape==='attribute:int'?'Libertar-se':'Ignorar Atordoado')+' · Dif '+d.dc;
  b.addEventListener('click',async()=>{b.disabled=true;try{await rollLegadoEscape(actor,item);}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});box.append(b);
 }
 if(box.childElementCount)(root.querySelector('.message-content')??root).append(box);
}
export async function consumeLegadoFortune(message){
 if(!isProcessor())return;const proof=message.rolls?.[0]?.options?.legadoFortune;if(!proof||proof.mode==='espiral')return;
 const actor=await fromUuid(proof.actorUuid);if(!actor?.testUserPermission(message.author,'OWNER'))return;
 await withEffectLock(actor,async()=>{const s=structuredClone(legadoState(actor)),row=s.active?.['bishamonten-fortune'];if(!row||row.mode!==proof.mode||row.castUuid!==proof.castUuid)return;delete s.active['bishamonten-fortune'];await actor.update({['flags.'+ns+'.legado']:s});for(const i of activeLegadoEffects(actor).filter(i=>legadoEffect(i).selfKey==='bishamonten-fortune'))await endLegadoGroup(actor,legadoEffect(i).group);});
}
export async function syncLegadoActor(actor){
 if(!isProcessor()||!actor?.isOwner||syncing.has(actor)||!legadoItems(actor).some(isLegado))return;
 syncing.add(actor);try{await withEffectLock(actor,async()=>{
  const s=structuredClone(legadoState(actor));let changed=false;
  if(!legadoEyeActive(actor)&&(Object.keys(s.active??{}).length||s.susanoo?.active)){s.active={};if(s.susanoo)s.susanoo.active=false;changed=true;}
  if(s.active?.susanoo&&!s.susanoo?.active){delete s.active.susanoo;changed=true;}
  for(const key of Object.keys(s.active??{}))if(key.startsWith('hachiman-')&&!s.active.hachiman||key==='bishamonten-fortune'&&!s.active.bishamonten||key==='kamui-curto-alcance'&&!s.active.kamui){delete s.active[key];changed=true;}
  const activeEffects=activeLegadoEffects(actor);
  for(const [key,row] of Object.entries(s.active??{})){
   if(['bishamonten-fortune','hachiman-migi'].includes(key)&&Array.from(actor.items).some(i=>legadoEffect(i)?.selfKey===key&&row.castUuid==='ChatMessage.'+legadoEffect(i).group&&!i.system.appliedCondition?.active)){delete s.active[key];changed=true;}
  }
  if(changed)await actor.update({['flags.'+ns+'.legado']:s});
  for(const item of activeEffects){const d=legadoEffect(item);if(d.selfKey&&!s.active?.[d.selfKey]&&!(d.selfKey==='susanoo'&&s.susanoo?.active))await endLegadoGroup(actor,d.group);}
  for(const target of clockActors())for(const item of activeLegadoEffects(target)){
   const d=legadoEffect(item);if(d.casterUuid!==actor.uuid)continue;
   if(d.kind==='koto-control'&&!s.active?.kotoamatsukami||d.kind==='mahikami-relativity'&&!s.active?.mahikami)await endLegadoGroup(target,d.group);
  }
 });}finally{syncing.delete(actor);}
}
export async function processMahikamiAreaTurn(actor,event){
 if(event.actor?.uuid!==actor.uuid||event.phase!=='end'||!canvas?.ready)return;
 const tokens=Array.from(canvas.scene.tokens??[]).filter(t=>t.actor?.uuid===actor.uuid);if(!tokens.length)return;
 for(const region of Array.from(canvas.scene.regions??[])){
  const uuid=region.getFlag(ns,'areaTemplate')?.messageUuid;if(!uuid)continue;const message=await fromUuid(uuid),cast=message?.getFlag(ns,'npcJutsuCast');if(cast?.plan.legado?.key!=='mahikami'||cast.plan.legado.mode!=='usar')continue;
  const caster=await fromUuid(cast.actorUuid);if(!legadoState(caster).active?.mahikami)continue;
  const inside=tokens.some(t=>region.testPoint({x:t.x+t.width*canvas.scene.grid.size/2,y:t.y+t.height*canvas.scene.grid.size/2,elevation:t.elevation}));
  const roots=activeLegadoEffects(actor).filter(i=>legadoEffect(i).kind==='mahikami-relativity'&&legadoEffect(i).sourceUuid===uuid);
  if(!inside){for(const root of roots)await endLegadoGroup(actor,legadoEffect(root).group);continue;}
  if(!roots.length){const {resolveLegadoSave}=await import('./legado-effects.mjs');await resolveLegadoSave(message,actor,'passed',event.combatId+'~'+event.round);}
  const root=activeLegadoEffects(actor).find(i=>legadoEffect(i).kind==='mahikami-relativity'&&legadoEffect(i).sourceUuid===uuid);if(!root)continue;
  await addLegadoEffect(actor,{name:'Atordoado · Mahikami',kind:'relativity-stunned',condition:'atordoado',group:legadoEffect(root).group+'~turn'+event.round,sourceUuid:uuid,casterUuid:cast.actorUuid,data:{rootUuid:root.uuid}});
 }
}
async function consumeHidari(message){
 if(!isProcessor())return;const packet=message.getFlag(ns,'damageUse');if(!packet?.profile?.legadoBonusReceipt)return;const actor=await fromUuid(packet.actorUuid);if(!actor?.testUserPermission(message.author,'OWNER'))return;
 await withEffectLock(actor,async()=>{const s=structuredClone(legadoState(actor));if(s.active?.['hachiman-hidari']?.castUuid!==packet.profile.legadoBonusReceipt)return;delete s.active['hachiman-hidari'];await actor.update({['flags.'+ns+'.legado']:s});for(const i of activeLegadoEffects(actor).filter(i=>legadoEffect(i).selfKey==='hachiman-hidari'))await endLegadoGroup(actor,legadoEffect(i).group);});
}
export function installLegadoWorkflow(){
 Hooks.on('createChatMessage',m=>{void processLegadoEscape(m).catch(console.error);void consumeLegadoFortune(m).catch(console.error);void consumeHidari(m).catch(console.error);});
 Hooks.on('renderChatMessageHTML',(m,el)=>void decorateLegadoChat(m,el));
 Hooks.on('updateActor',(a,c)=>{const keys=Object.keys(c);if(keys.some(k=>k.includes('legado')||k.includes('activeAptitudes'))||c.flags?.[ns]?.legado||c.system?.activeAptitudes)void syncLegadoActor(a).catch(console.error);});
 Hooks.on('updateItem',i=>{if(i.actor&&legadoEffect(i)?.selfKey)void syncLegadoActor(i.actor).catch(console.error);});
}
