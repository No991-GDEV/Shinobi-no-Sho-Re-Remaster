import {fogThreshold} from './environment-core.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
const ns='sns-v14-dev',key=s=>s.replaceAll('.','~');
export async function ensureEnvironmentVisual(message,targetUuid){
 const packet=message.getFlag(ns,'damageUse'),fog=packet?.environmentVision?.[key(targetUuid)];if(!packet?.attack||!fog||packet.attack.natural<=3||packet.attack.natural>=packet.profile.criticalAt)return 'clear';
 const stored=message.getFlag(ns,'environmentVisual')?.[key(targetUuid)],proof=stored?.proofUuid&&await fromUuid(stored.proofUuid),r=proof?.getFlag(ns,'environmentVisualProof');
 return proof?.author?.isGM&&r?.attackUuid===message.uuid&&r.targetUuid===targetUuid&&r.rootUuid===fog.rootUuid?r.state:'pending';
}
export async function resolveEnvironmentVisual(message,targetUuid,mode){
 if(!isTimekeeper())throw Error('Somente o mestre pode definir distância, localização e Sensor na Névoa.');
 return withEffectLock(message,async()=>{const p=message.getFlag(ns,'damageUse'),f=p?.environmentVision?.[key(targetUuid)];if(!f||!p.targets.some(t=>t.uuid===targetUuid)||mode==='area'&&p.profile.attackKind!=='area')throw Error('Contexto de Névoa inválido.');if(await ensureEnvironmentVisual(message,targetUuid)!=='pending')return;
 const threshold=fogThreshold(f.stage,mode);let natural=null,rollUuid='';if(threshold){const roll=await new foundry.dice.Roll('1d8').evaluate();natural=roll.total;const card=await roll.toMessage({speaker:ChatMessage.getSpeaker({actor:await fromUuid(p.actorUuid)}),flavor:'<strong>Névoa · camuflagem '+(threshold===4?'total':'parcial')+'</strong><p>Erro com '+threshold+' ou menos.</p>'});rollUuid=card.uuid;}
 const data={attackUuid:message.uuid,targetUuid,rootUuid:f.rootUuid,stage:f.stage,mode,threshold,natural,rollUuid,state:mode==='unknown'||threshold&&natural<=threshold?'miss':'clear'};
 const proof=await ChatMessage.create({whisper:[game.user.id],content:'Localização definida.',flags:{[ns]:{environmentVisualProof:data}}});await message.update({['flags.'+ns+'.environmentVisual.'+key(targetUuid)]:{proofUuid:proof.uuid}});
 });
}
export async function decorateEnvironmentVision(message,element){
 const p=message.getFlag(ns,'damageUse');if(!p?.attack||!p.environmentVision||element.querySelector('[data-environment-vision]'))return;const box=document.createElement('section');box.dataset.environmentVision='';box.className='sns-target-resolution';
 for(const target of p.targets){if(!p.environmentVision[key(target.uuid)])continue;const state=await ensureEnvironmentVisual(message,target.uuid),row=document.createElement('div'),label=document.createElement('strong');label.textContent=target.name+' · Névoa';row.append(label);const status=document.createElement('p');status.textContent=state==='pending'?'Definir distância e localização':state==='miss'?'Erro de camuflagem · não acertou':'Visão resolvida';row.append(status);
 if(state==='pending'&&isTimekeeper()){const controls=document.createElement('div');controls.className='sns-save-controls';for(const [mode,title]of [['near','Até1m'],['far','Mais de1m · posição aproximada'],['sensor','Sensor · localização exata'],['unknown','Sem localizar'],...(p.profile.attackKind==='area'?[['area','Área cobre a posição']]:[])]){const b=document.createElement('button');b.type='button';b.textContent=title;b.addEventListener('click',async()=>{b.disabled=true;try{await resolveEnvironmentVisual(message,target.uuid,mode);}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});controls.append(b);}row.append(controls);}box.append(row);
 }if(box.children.length)(element.querySelector('.message-content')??element).append(box);
}
