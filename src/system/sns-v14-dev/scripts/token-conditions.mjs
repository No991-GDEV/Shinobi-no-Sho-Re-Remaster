import {isProcessor} from './processor-authority.mjs';
import {CONDITION_STATUSES} from '../data/condition-statuses.mjs';
import {transformationProjection} from './transformation-core.mjs';
import {isManagedCondition} from './condition-effects.mjs';
import {applyCondition,endCondition} from './condition-application.mjs';
const queued=new WeakMap();
export const statusDefinition=id=>CONDITION_STATUSES.find(s=>s.id===id);
export function conditionStatusPlan(actor){
 const active=new Set(Array.from(actor.items??[]).filter(i=>isManagedCondition(i)&&i.system.appliedCondition.active).map(i=>i.system.contentId));
 if(transformationProjection(actor).accelerated)active.add('sns:condition:acelerado');
 return CONDITION_STATUSES.filter(s=>active.has(s.contentId));
}
export function configureConditionStatuses(){
 // Keep core IDs available to core tools, but show the SNS menu instead of its generic list.
 for(const s of foundry.utils.iterateValues(CONFIG.statusEffects))s.hud=false;
 for(const s of CONDITION_STATUSES)CONFIG.statusEffects[s.id]={_id:s.markerId,id:s.id,name:s.name,img:s.img,hud:{actorTypes:['shinobi','npc','companion']}};
}
export function syncConditionStatuses(actor){
 if(!actor||!isProcessor())return Promise.resolve();
 const task=(queued.get(actor)??Promise.resolve()).catch(()=>{}).then(async()=>{
  const desired=conditionStatusPlan(actor),existing=Array.from(actor.effects??[]).filter(e=>e.flags?.['sns-v14-dev']?.conditionStatus);
  const remove=existing.filter(e=>!desired.some(s=>s.contentId===e.flags['sns-v14-dev'].conditionStatus)||existing.find(x=>x.flags['sns-v14-dev'].conditionStatus===e.flags['sns-v14-dev'].conditionStatus)!==e).map(e=>e.id);
  if(remove.length)await actor.deleteEmbeddedDocuments('ActiveEffect',remove,{snsStatusSync:true});
  const missing=desired.filter(s=>!existing.some(e=>e.flags['sns-v14-dev'].conditionStatus===s.contentId&&!remove.includes(e.id)));
  if(missing.length)await actor.createEmbeddedDocuments('ActiveEffect',missing.map(s=>({_id:s.markerId,name:s.name,img:s.img,statuses:[s.id],origin:actor.uuid,showIcon:CONST.ACTIVE_EFFECT_SHOW_ICON.ALWAYS,flags:{'sns-v14-dev':{conditionStatus:s.contentId}},system:{changes:[]}})),{snsStatusSync:true,keepId:true});
  if(canvas.tokens?.hud?.document?.actor?.uuid===actor.uuid)await canvas.tokens.hud.render({force:true});
 });queued.set(actor,task);return task;
}
export async function toggleConditionStatus(actor,statusId,{active,overlay=false}={}){
 const status=statusDefinition(statusId);if(!status)return undefined;
 if(status.contentId==='sns:condition:acelerado'&&transformationProjection(actor).accelerated)throw Error('Acelerado é concedido pela transformação. Encerre o modo ou benefício que o concede.');
 if(!actor.isOwner)throw Error('Você precisa controlar esta ficha.');
 const items=Array.from(actor.items).filter(i=>isManagedCondition(i)&&i.system.appliedCondition.active&&i.system.contentId===status.contentId),desired=active??!items.length;
 if(desired&&!items.length){if(!game.user.isGM)throw Error('O mestre precisa aplicar esta condição.');await applyCondition(actor,status.contentId,{origin:'Condição aplicada pelo token'});}
 else if(!desired)for(const item of items)await endCondition(actor,item.id);
 await syncConditionStatuses(actor);
 if(overlay&&desired){const marker=Array.from(actor.effects).find(e=>e.flags?.['sns-v14-dev']?.conditionStatus===status.contentId);if(marker)await marker.update({'flags.core.overlay':true},{snsStatusSync:true});}
 return !!desired;
}
export function installConditionStatusHooks(){
 const refresh=item=>{if(item.parent?.documentName==='Actor'&&item.type==='condition')syncConditionStatuses(item.parent).catch(e=>ui.notifications.warn(e.message));};
 for(const name of ['createItem','updateItem','deleteItem'])Hooks.on(name,refresh);
 Hooks.on('canvasReady',()=>{for(const token of canvas.tokens?.placeables??[])syncConditionStatuses(token.actor).catch(console.error);});
 Hooks.on('createToken',token=>syncConditionStatuses(token.actor).catch(console.error));
 Hooks.on('updateActor',(actor,changes)=>{if(JSON.stringify(changes).includes('transformations'))syncConditionStatuses(actor).catch(console.error);});
}
