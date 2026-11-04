import {legadoMayReroll} from './legado-effects.mjs';
import {npcSaveDifficulty} from './npc-repertoire-core.mjs';
import {attackNpcCast,rollNpcSave,rollFreeNpcSave,placeNpcTemplate,completeNpcCast,rollNpcTechniqueCheck,reloadNpcDevice} from './npc-jutsu-service.mjs';
const ns='sns-v14-dev';
const labels={'attribute:agi':'Agilidade','attribute:vig':'Vigor','attribute:int':'Inteligência','attribute:esp':'Espírito','skill:prontidao':'Prontidão'};
function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});return b;}
export async function decorateNpcJutsu(message,element){
 const cast=message.getFlag(ns,'npcJutsuCast');if(!cast||element.querySelector('[data-npc-jutsu-actions]'))return;
 const actor=await fromUuid(cast.actorUuid);if(!actor)return;
 const controls=document.createElement('section');controls.className='sns-npc-jutsu-controls';controls.dataset.npcJutsuActions='';
 const canUse=actor.isOwner||game.user.isGM;
 if(cast.status==='pending'){
  const text=document.createElement('p');text.textContent='Uso pendente · nenhum efeito liberado antes do pagamento.';controls.append(text);
  if(canUse)controls.append(button('Concluir uso · '+cast.plan.cost+' chakra',()=>completeNpcCast(message)));
 }else{
  if(cast.plan.deviceUse){const remaining=document.createElement('small');remaining.textContent='Usos restantes: '+(actor.flags?.[ns]?.puppetUses?.[cast.plan.deviceUse.itemId]??'—');controls.append(remaining);if(game.user.isGM)controls.append(button('Recarregar dispositivo',()=>reloadNpcDevice(message)));}
  if(canUse&&cast.status==='paid'&&cast.plan.mode.startsWith('attack:'))controls.append(button(cast.plan.mode==='attack:cc'?'Ataque corpo a corpo':cast.plan.mode==='attack:lm'?'Ataque · Ler Movimento':'Ataque à distância',()=>attackNpcCast(message)));
  if(canUse&&cast.plan.shape&&!message.getFlag(ns,'areaUse'))controls.append(button('Posicionar área',()=>placeNpcTemplate(message)));
  if(canUse&&cast.status==='paid')for(const [index,check]of (cast.plan.checks??[]).entries())controls.append(button(check.label,()=>rollNpcTechniqueCheck(message,index)));
  if(cast.status==='attacked'){const p=document.createElement('p');p.textContent='Ataque realizado · dano e defesas no cartão da rolagem.';controls.append(p);}
  if(cast.plan.mode==='save'){
   if(!cast.targets.length)for(const key of cast.plan.saveKeys)controls.append(button((labels[key]??key)+' · Dif '+cast.plan.dc,()=>rollFreeNpcSave(message,key)));
   for(const target of cast.targets){const a=await fromUuid(target.uuid);if(!a)continue;const result=cast.saves[target.uuid.replaceAll('.','~')],row=document.createElement('div'),label=document.createElement('strong');label.textContent=target.name;row.append(label);
    if(result){const text=document.createElement('span');text.textContent=result.outcome==='passed'?'Resistiu':'Falhou';row.append(text);if((a.isOwner||game.user.isGM)&&legadoMayReroll(cast,a))row.append(button('Mangekyo · repetir resistência',()=>rollNpcSave(message,a,cast.plan.saveKeys[0])));}
    else if(a.isOwner||game.user.isGM)for(const key of cast.plan.saveKeys)row.append(button((labels[key]??key)+' · Dif '+npcSaveDifficulty(cast,a),()=>rollNpcSave(message,a,key)));
    else{const text=document.createElement('small');text.textContent='Aguardando resistência · Dif '+npcSaveDifficulty(cast,a);row.append(text);}controls.append(row);
   }
  }
 }
 if(!element.querySelector('[data-npc-jutsu-actions]'))(element.querySelector('.message-content')??element).append(controls);
}
