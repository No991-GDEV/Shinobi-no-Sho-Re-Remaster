import {isProcessor} from './processor-authority.mjs';
import {attackOutcome,rolledCheck} from './jutsu-outcomes.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev',working=new Set(),again=new Set(),key=uuid=>uuid.replaceAll('.','~');
export function ricochetTargetState(packet,results,uuid){
 if(!packet.profile.ricochet)return 'ready';
 const index=packet.targets.findIndex(t=>t.uuid===uuid);if(index<0)return 'stopped';
 for(const prior of packet.targets.slice(0,index)){const result=results?.[key(prior.uuid)];if(result?.hit==='miss')return 'stopped';if(result?.hit!=='hit')return 'waiting';}return 'ready';
}
export function sequenceReady(message){
 const packet=message.getFlag(ns,'damageUse');if(!packet?.profile)return true;
 if(packet.profile.ricochet)return packet.targets.every(t=>['hit','miss'].includes(message.getFlag(ns,'defenseResults')?.[key(t.uuid)]?.hit));
 if(packet.profile.followups)return packet.targets.every(t=>message.getFlag(ns,'attackSequences')?.[key(t.uuid)]?.complete===true);
 return true;
}
export const sequenceBonus=(message,uuid)=>message.getFlag(ns,'attackSequences')?.[key(uuid)]?.hits??0;
export function followupHit(attack,defense,profile){
 return attackOutcome(attack,defense.fixed?.total??defense.roll,{fixed:!!defense.fixed,criticalAt:profile.criticalAt});
}
export async function processAttackSequences(message){
 if(!isProcessor())return;
 const packet=message.getFlag(ns,'damageUse');if(!packet?.profile?.followups&&!packet?.profile?.ricochet)return;
 if(working.has(message.uuid)){again.add(message.uuid);return;}working.add(message.uuid);
 try{do{again.delete(message.uuid);await resolve(message,packet);}while(again.delete(message.uuid));}finally{working.delete(message.uuid);}
}
async function resolve(message,packet){
 const results=message.getFlag(ns,'defenseResults')??{};
 for(const target of packet.targets){
  const k=key(target.uuid),state=ricochetTargetState(packet,results,target.uuid);
  if(state==='stopped'&&!results[k]){await message.update({['flags.'+ns+'.defenseResults.'+k]:{hit:'miss',stopped:true,choice:'Ricochete interrompido',user:game.user.id}});continue;}
  if(!packet.profile.followups||message.getFlag(ns,'attackSequences')?.[k]?.complete)continue;
  const defense=results[k];if(!['hit','miss'].includes(defense?.hit))continue;
  if(defense.hit==='miss'){await message.update({['flags.'+ns+'.attackSequences.'+k]:{complete:true,hits:0,rolls:[]}});continue;}
  if(!defense.fixed&&!defense.roll)continue;
  const rolls=[];
  for(let index=0;index<packet.profile.followups;index++){
   let child=game.messages.find(m=>m.author?.isGM&&m.getFlag(ns,'followupRoll')?.parentUuid===message.uuid&&m.getFlag(ns,'followupRoll').targetUuid===target.uuid&&m.getFlag(ns,'followupRoll').index===index);
   if(!child){const actor=await fromUuid(packet.actorUuid),roll=await new foundry.dice.Roll('2d8 + '+packet.attack.precision).evaluate();child=await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:'<strong>'+esc(packet.name)+' · disparo adicional '+(index+1)+'</strong><p>'+esc(target.name)+' · mesma defesa</p>',flags:{[ns]:{followupRoll:{parentUuid:message.uuid,targetUuid:target.uuid,index}}}});}
   const attack=rolledCheck(child.rolls?.[0],{precision:packet.attack.precision,adjustment:0}),hit=followupHit(attack,defense,packet.profile);if(hit==='pending')return;rolls.push({uuid:child.uuid,attack,hit});
  }
  await message.update({['flags.'+ns+'.attackSequences.'+k]:{complete:true,hits:rolls.filter(r=>r.hit==='hit').length,rolls}});
 }
}
export function installAttackSequenceHooks(){
 const process=m=>processAttackSequences(m).catch(e=>console.warn('SNS · ataques adicionais',e));
 Hooks.on('createChatMessage',process);Hooks.on('updateChatMessage',process);Hooks.on('snsProcessorReady',()=>{for(const m of game.messages)if(m.getFlag(ns,'damageUse')?.profile?.followups||m.getFlag(ns,'damageUse')?.profile?.ricochet)process(m);});
}
