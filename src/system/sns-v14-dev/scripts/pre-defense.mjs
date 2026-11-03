import {declareDefenses} from './defense-workflow.mjs';
import {escapeHtml as esc} from './kernel.mjs';
export const preDefenseProfile=profile=>({base:0,fixed:0,nature:'lethal',criticalAt:15,noDamage:true,attackKind:'resistance',resistance:{keys:[profile.preDefense.key],difficulty:profile.preDefense.dc}});
function awaitResults(message){
 return new Promise(resolve=>{
  const check=()=>{const packet=message.getFlag('sns-v14-dev','damageUse'),results=message.getFlag('sns-v14-dev','defenseResults');if(packet.targets.every(t=>['hit','miss'].includes(results?.[t.uuid.replaceAll('.','~')]?.hit))){Hooks.off('updateChatMessage',hook);resolve();}};
  const hook=Hooks.on('updateChatMessage',updated=>{if(updated.uuid===message.uuid)check();});check();
 });
}
export async function declareJutsuDefenses(actor,item,profile,targets){
 if(profile?.preDefense?.chakraVisionAuto&&targets.length)return declareSensoryDefense(actor,item,profile,targets);
 if(!profile?.preDefense||!targets.length)return declareDefenses(actor,item,profile,targets);
 const test=preDefenseProfile(profile),source={uuid:item.uuid,name:'Prontidão · '+item.name},requestUuid=await declareDefenses(actor,source,test,targets);if(requestUuid===null)return null;
 const request=await fromUuid(requestUuid),r=request.getFlag('sns-v14-dev','defenseRequest');
 const message=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:'<strong>Prontidão antes da defesa</strong><p>'+esc(item.name)+' · Dif '+test.resistance.difficulty+'</p>',flags:{'sns-v14-dev':{damageUse:{version:1,actorUuid:actor.uuid,itemUuid:item.uuid,name:source.name,profile:test,targets:r.targets,attack:null,defenseRequestUuid:requestUuid}}}});
 await awaitResults(message);
 return declareDefenses(actor,item,profile,targets,{preDefenseUuid:message.uuid});
}

async function declareSensoryDefense(actor,item,profile,targets){
 const {chakraVision}=await import('./magen-service.mjs');const resolved={};
 for(const t of targets){const a=t.actor,owns=id=>Array.from(a.items).some(i=>(i.system.ruleId||i.system.contentId)===id),kagura=owns('sns:hijutsu:kagura-shingan'),sensor=Array.from(a.items).some(i=>(i.system.ruleId||i.system.contentId)==='sns:apt:sensor'&&i.system.choice?.key==='chakra');
  if(chakraVision(a)||kagura){resolved[a.uuid.replaceAll('.','~')]={automatic:true};continue;}
  const dc=profile.preDefense.dc-(sensor?2:0),test={...preDefenseProfile(profile),resistance:{keys:['skill:prontidao'],difficulty:dc}},uuid=await declareDefenses(actor,{uuid:item.uuid,name:'Prontidão · '+item.name},test,[t]);if(uuid===null)return null;
  const req=await fromUuid(uuid),message=await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),content:'<strong>Perceber Lâmina de Vento</strong><p>Prontidão Dif '+dc+'</p>',flags:{'sns-v14-dev':{damageUse:{version:1,actorUuid:actor.uuid,itemUuid:item.uuid,name:item.name,profile:test,targets:req.getFlag('sns-v14-dev','defenseRequest').targets,attack:null,defenseRequestUuid:uuid}}}});await awaitResults(message);resolved[a.uuid.replaceAll('.','~')]={testUuid:message.uuid,dc};
 }
 const proof=await ChatMessage.create({whisper:[game.user.id],content:'Pré-defesas sensoriais resolvidas.',flags:{'sns-v14-dev':{preDefenseBatch:{actorUuid:actor.uuid,itemUuid:item.uuid,profile:profile.preDefense,targets:resolved}}}});
 return declareDefenses(actor,item,profile,targets,{preDefenseBatchUuid:proof.uuid});
}
