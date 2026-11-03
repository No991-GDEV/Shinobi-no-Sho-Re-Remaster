import {activeIllusions,illusionData} from './magen-core.mjs';
import {requestIllusionAction,processIllusionTurn,endIllusion} from './magen-service.mjs';
import {withEffectLock,isTimekeeper} from './effect-lifecycle.mjs';
import {actorCombat} from './effect-duration.mjs';
const ns='sns-v14-dev';
export async function illusionAction(event,target){
 const root=this.actor.items.get(target.dataset.itemId);if(!root)return;
 try{
  if(target.dataset.illusionAction==='end'){await endIllusion(this.actor,root);return;}
  if(target.dataset.illusionAction==='turn'){
   if(!isTimekeeper()||actorCombat(this.actor)||illusionData(root).combatId)throw Error('Contar um turno da ilusão fora de combate.');
   const meta=illusionData(root),round=Math.max(meta.starts,meta.ends)+1;
   await withEffectLock(this.actor,async()=>{for(const phase of ['start','end'])await processIllusionTurn(this.actor,{combatId:'',actor:this.actor,round,phase});});return;
  }
  await requestIllusionAction(this.actor,root,target.dataset.illusionAction);
 }catch(e){ui.notifications.warn(e.message);}
}
export function decorateMagenMessage(message,element){
 const use=message.getFlag(ns,'jutsuUse');if(!use?.bindings.some(b=>b.id.startsWith('book_magen_'))||element.querySelector('[data-sns-magen]'))return;
 const container=document.createElement('section');container.dataset.snsMagen='';container.className='sns-magen-interaction';(element.querySelector('.message-content')??element).append(container);
 Promise.all(use.targets.map(async ref=>{
  const target=await fromUuid(ref.uuid),root=activeIllusions(target).find(i=>illusionData(i).group===message.uuid+'#'+ref.uuid);if(!root)return;
  const meta=illusionData(root),row=document.createElement('div');row.className='sns-illusion-controls';const title=document.createElement('strong');title.textContent=ref.name+' · '+(meta.noticed?'ilusão reconhecida':'sob ilusão');if(use.targets.length>1)row.append(title);const details=document.createElement('details'),summary=document.createElement('summary'),assistance=document.createElement('div');summary.textContent='Avaliar ou ajudar com Kai';details.append(summary,assistance);
  const add=(label,actor,action,key)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',async()=>{b.disabled=true;try{const helper=actor??controlledActor();await requestIllusionAction(helper,root,action,key);}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});(actor?row:assistance).append(b);};
  if(target.isOwner&&meta.category==='compulsao'){
   if(meta.starts>=2&&!meta.noticed)add('Notar Genjutsu',target,'notice');
   if(meta.noticed&&Array.from(target.items).some(i=>i.system.contentId==='sns:jutsu:kai'))add('Kai · libertar-se',target,'kai');
  }
  add('Avaliar · meu token',null,'assess');add('Kai · ESP · meu token',null,'kai','attribute:esp');add('Kai · INT · meu token',null,'kai','attribute:int');
  row.append(details);container.append(row);
 })).then(()=>{if(!container.children.length)container.remove();}).catch(e=>console.warn('Magen',e.message));
}
function controlledActor(){const actors=[...new Map(Array.from(canvas.tokens?.controlled??[]).filter(t=>t.actor?.isOwner).map(t=>[t.actor.uuid,t.actor])).values()];if(actors.length===1)return actors[0];if(!actors.length&&game.user.character?.isOwner)return game.user.character;throw Error('Selecione o token do personagem que vai avaliar ou usar Kai.');}
export function refreshMagenMessages(item){const m=illusionData(item);if(!m)return;const message=game.messages.find(message=>message.uuid===m.group.split('#')[0]);if(message)ui.chat?.updateMessage(message);}
