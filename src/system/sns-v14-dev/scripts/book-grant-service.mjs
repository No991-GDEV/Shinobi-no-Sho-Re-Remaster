import {BOOK_POWER_GRANTS} from './book-power-grants.mjs';
import {canonicalCopy,loadCanonicalLibrary} from './canonical-content.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {touches} from './message-index.mjs';
const ns='sns-v14-dev',working=new Set();
export function bookGrantPlan(actor,library){
 const create=[],update=[],remove=[],items=Array.from(actor.items),cap=Math.floor(actor.system.nc/2);
 const sources=items.filter(i=>i.type==='power'&&i.system.level>0&&i.system.level<=cap&&BOOK_POWER_GRANTS[i.system.contentId?.replace('sns:power:','')]&&requirementsFor(i,actor).valid);
 const wanted=new Map();for(const source of sources)for(const element of BOOK_POWER_GRANTS[source.system.contentId.replace('sns:power:','')])if(!wanted.has(element)||source.system.contentId==='sns:power:jinton')wanted.set(element,source);
 for(const [element,source]of wanted){
  const contentId='sns:power:'+element,target=items.find(i=>i.type==='power'&&i.system.contentId===contentId),old=target?.flags?.[ns]?.bookPowerGrant;
  if(!target){const entry=library.entries.find(e=>e.id===contentId);if(!entry)throw Error('Elemento concedido indisponível: '+element);const row=canonicalCopy(entry);row.system.level=1;row.flags[ns].acquisition={mode:'paid'};row.flags[ns].bookPowerGrant={sourceId:source.id,sourceContentId:source.system.contentId,element,automatic:true,bonus:0};create.push(row);continue;}
  const jinton=source.system.contentId==='sns:power:jinton',bonus=old?.bonus??0,newBonus=old?(old.sourceContentId==='sns:power:jinton'?bonus:0):jinton&&target.system.level>1?Math.min(1,Math.max(0,cap-target.system.level)):0;
  const grant={sourceId:source.id,sourceContentId:source.system.contentId,element,automatic:old?.automatic??false,bonus:newBonus};
  if(JSON.stringify(old)!==JSON.stringify(grant)||bonus!==newBonus)update.push({_id:target.id,'flags.sns-v14-dev.bookPowerGrant':grant,...(bonus!==newBonus?{'system.level':Math.max(1,target.system.level-bonus+newBonus)}:{})});
 }
 for(const target of items){const g=target.flags?.[ns]?.bookPowerGrant;if(!g||wanted.has(g.element))continue;
  if(g.automatic&&target.system.level===1&&!target.system.power?.choices?.length)remove.push(target.id);
  else update.push({_id:target.id,'flags.sns-v14-dev.-=bookPowerGrant':null,...(g.bonus?{'system.level':Math.max(1,target.system.level-g.bonus)}:{})});
 }
 return {create,update,remove};
}
export async function reconcileBookGrants(actor){
 if(!isTimekeeper()||actor?.type!=='shinobi'||working.has(actor.uuid))return;
 working.add(actor.uuid);try{await withEffectLock(actor,async()=>{const library=await loadCanonicalLibrary();if(!library)return;const plan=bookGrantPlan(actor,library);if(plan.create.length)await actor.createEmbeddedDocuments('Item',plan.create);if(plan.update.length)await actor.updateEmbeddedDocuments('Item',plan.update);if(plan.remove.length)await actor.deleteEmbeddedDocuments('Item',plan.remove);});}finally{working.delete(actor.uuid);}
}
export function installBookGrantHooks(){
 const item=i=>{if(i.type==='power'||['clan','hijutsu','feature','aptitude'].includes(i.type))void reconcileBookGrants(i.actor).catch(console.error);};
 for(const name of ['createItem','updateItem','deleteItem'])Hooks.on(name,item);
 Hooks.on('updateActor',(actor,changes)=>{if(touches(changes,['system.nc','system.attributes','system.prerequisiteEvents']))void reconcileBookGrants(actor).catch(console.error);});
 // Reconcile on actual purchases/edits, never rewrite every pre-existing sheet
 // merely because a client connected.
}
