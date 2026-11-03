import {isProcessor} from './processor-authority.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev',busy=new Set();
// Personal visual penalties only. Environment, darkness and their independent dice are not inferred.
export function visualPenaltySnapshot(actor){
 const sources=Array.from(actor?.items??[]).filter(i=>i.system.appliedCondition?.active&&['sns:state:camuflagem-visual-parcial','sns:state:camuflagem-visual-total','sns:condition:cego'].includes(i.system.contentId));
 if(!sources.length)return null;
 return {threshold:sources.some(i=>i.system.contentId.endsWith('-total')||i.system.contentId==='sns:condition:cego')?4:2,sources:sources.map(i=>({uuid:i.uuid,name:i.name}))};
}
export function visualCheckState(packet,resolution){
 if(!packet?.attack||!packet.visualPenalty)return 'clear';
 if(packet.attack.natural>=packet.profile.criticalAt)return 'critical';
 if(packet.attack.natural<=3)return 'attackFailure';
 if(!resolution||resolution.threshold!==packet.visualPenalty.threshold)return 'pending';
 if(resolution.mode==='sensor')return 'clear';
 if(resolution.mode==='unknown')return 'miss';
 if(resolution.mode!=='roll'||!Number.isInteger(resolution.natural)||resolution.natural<1||resolution.natural>8)return 'pending';
 return resolution.natural<=resolution.threshold?'miss':'clear';
}
export function messageVisualState(message){
 const resolution=message.getFlag(ns,'visualResolution');
 return visualCheckState(message.getFlag(ns,'damageUse'),resolution&&game.users.get(resolution.user)?.isGM?resolution:null);
}
export async function resolveVisualAttack(message,mode){
 if(!isProcessor())throw Error('O mestre precisa definir a localização do alvo.');
 if(busy.has(message.uuid))return;busy.add(message.uuid);
 try{
  const packet=message.getFlag(ns,'damageUse'),caster=packet&&await fromUuid(packet.actorUuid);
  if(!caster?.testUserPermission(message.author,'OWNER')||!['roll','sensor','unknown'].includes(mode)||messageVisualState(message)!=='pending')return;
  const threshold=packet.visualPenalty.threshold;if(![2,4].includes(threshold))throw Error('Penalidade visual inválida.');
  let natural=null,rollUuid='';
  if(mode==='roll'){
   const roll=await new foundry.dice.Roll('1d8').evaluate();natural=roll.total;
   const result=await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor:caster}),flavor:'<strong>Visão prejudicada · '+esc(packet.name)+'</strong><p>Falha com '+threshold+' ou menos · Básico, p.273</p>',flags:{[ns]:{visualCheck:{attackUuid:message.uuid,threshold}}}});rollUuid=result.uuid;
  }
  await message.update({['flags.'+ns+'.visualResolution']:{mode,threshold,natural,rollUuid,user:game.user.id,at:new Date().toISOString()}});
 }finally{busy.delete(message.uuid);}
}
export function decorateVisualAttack(message,element){
 const packet=message.getFlag(ns,'damageUse');if(!packet?.attack||!packet.visualPenalty||element.querySelector('[data-sns-visual]'))return;
 const state=messageVisualState(message),box=document.createElement('section');box.dataset.snsVisual='';box.className='sns-damage-chat';
 const p=document.createElement('p');p.textContent=state==='pending'?'Visão prejudicada · localização do alvo':state==='critical'?'Acerto crítico · dispensa erro de camuflagem':state==='attackFailure'?'Falha automática no ataque':state==='miss'?'Visão prejudicada · ataque falhou':message.getFlag(ns,'visualResolution')?.mode==='sensor'?'Localização exata por Sensor':'Visão prejudicada · passou pelo erro de camuflagem';box.append(p);
 if(state==='pending'&&isProcessor()){
  const controls=document.createElement('div');controls.className='damage-controls';
  for(const [mode,label]of [['roll','Alvo localizado · testar 1d8'],['sensor','Sensor · localização exata'],['unknown','Alvo não localizado']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',async()=>{b.disabled=true;try{await resolveVisualAttack(message,mode);}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});controls.append(b);}box.append(controls);
 }
 (element.querySelector('.message-content')??element).append(box);
}
