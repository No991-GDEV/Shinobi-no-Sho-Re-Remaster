import {isProcessor} from './processor-authority.mjs';
import {advanceDuration} from './effect-duration.mjs';
import {transformationTurnPlan,transformationState} from './transformation-core.mjs';
import {activationRows,resolveActiveAptitude,upkeepChange} from './active-aptitudes.mjs';
import {isManagedCondition} from './condition-effects.mjs';
const locks=new WeakMap(),queues=new WeakMap();
export const isTimekeeper=()=>isProcessor();
export function withEffectLock(actor,task){
 const next=(locks.get(actor)??Promise.resolve()).catch(()=>{}).then(task);locks.set(actor,next);return next;
}
export function clockActors(){
 const actors=[...game.actors,...Array.from(game.scenes??[]).flatMap(s=>Array.from(s.tokens??[]).map(t=>t.actor)),...Array.from(game.combats??[]).flatMap(c=>Array.from(c.combatants).map(t=>t.actor))];
 return [...new Map(actors.filter(a=>a&&['shinobi','npc','companion'].includes(a.type)).map(a=>[a.uuid,a])).values()];
}
export async function processCombatEvent(event,actors=clockActors(),combat=game.combats.get(event.combatId)){
 if(!isTimekeeper())return;
 if(!combat)throw Error('O combate da duração não está mais disponível.');
 return withEffectLock(combat,async()=>{
  const key=event.combatantId+'~'+event.phase,seen=combat.flags?.['sns-v14-dev']?.turnEvents??{};
  if(event.round<1||!['start','end'].includes(event.phase)||event.round<=(seen[key]??0)||!isTimekeeper())return;
  await resolveCombatEvent(event,actors);
  if(!isTimekeeper())throw Error('O mestre ativo mudou durante a atualização. Confira os efeitos.');
  await combat.update({'flags.sns-v14-dev.turnEvents':{...seen,[key]:event.round}});
 });
}
async function resolveCombatEvent(event,actors){
 if(!isTimekeeper())return;
 const at=new Date().toISOString();
 // Resolve timers before upkeep. All mutations are serialized per Actor.
 for(const actor of actors)await withEffectLock(actor,async()=>{
  if(!isTimekeeper()||!actor.isOwner)return;
  const updates=[];
  const {processLegadoTurn}=await import('./legado-service.mjs');await processLegadoTurn(actor,event);
  const {processEnvironmentTurn}=await import('./environment-service.mjs');await processEnvironmentTurn(actor,event);
  const {processSupportTurn}=await import('./support-service.mjs');await processSupportTurn(actor,event);
  const {processIllusionTurn}=await import('./magen-service.mjs');await processIllusionTurn(actor,event);
  for(const item of actor.items){
   if(item.flags?.['sns-v14-dev']?.advancedState||item.flags?.['sns-v14-dev']?.advancedChild||item.flags?.['sns-v14-dev']?.environment||item.flags?.['sns-v14-dev']?.environmentMember||item.flags?.['sns-v14-dev']?.illusion||item.flags?.['sns-v14-dev']?.support)continue;
   if(!isManagedCondition(item))continue;
   const next=advanceDuration(item.system.appliedCondition,event);if(!next)continue;
   if(next.expired&&item.flags?.['sns-v14-dev']?.effectBinding)await (await import('./effect-item-service.mjs')).endBoundEffect(item);
   updates.push({_id:item.id,'system.appliedCondition.durationClock':next.clock,...(next.expired?{'system.appliedCondition.active':false,'system.appliedCondition.endedAt':at}:{})});
  }
  if(updates.length)await actor.updateEmbeddedDocuments('Item',updates,{snsEffectItems:true});
 });
 if(event.phase!=='start'||!event.actor?.isOwner)return;
 await withEffectLock(event.actor,()=>maintainTransplants(event.actor,event));
 await withEffectLock(event.actor,async()=>{const plan=transformationTurnPlan(event.actor,event);if(plan)await event.actor.update({...plan.patch,'flags.sns-v14-dev.transformations':plan.state});});
}
async function maintainTransplants(actor,event){
 if(!isTimekeeper())return;
 const rows=activationRows(actor),updates=new Map(),ledger=structuredClone(actor.flags?.['sns-v14-dev']?.turnMaintenance??{});
 let chakra=actor.system.resources.chakra.value,changed=false;
 const sources=new Set();
 for(const row of rows){
  if(!row.active||row.rule!=='transplanted'||sources.has(row.sourceId))continue;sources.add(row.sourceId);
  const key=[event.combatId,event.round,row.sourceId].join('~');
  if(ledger[key])continue;
  const profile=resolveActiveAptitude(actor,row),at=new Date().toISOString(),record={combatId:event.combatId,round:event.round,sourceId:row.sourceId,sourceName:profile.sourceName,cost:profile.upkeep??null,before:chakra,after:chakra,status:'blocked',reason:'',user:game.user.id,at};
  try{
   // Each maintenance reads the remaining chakra after the preceding one.
   const view={items:actor.items,system:{...actor.system,resources:{...actor.system.resources,chakra:{...actor.system.resources.chakra,value:chakra}}}};
   const change=upkeepChange(view,row,{user:game.user.id,at});
   change.row.history.at(-1).eventKey=key;updates.set(row.id,change.row);chakra=change.chakra;record.after=chakra;record.status='paid';
  }catch(e){record.reason=e.message;}
  ledger[key]=record;changed=true;
 }
 if(!changed)return;
 const stored=Array.from(actor.system.activeAptitudes??[]).map(row=>updates.get(row.id)??row);
 for(const [id,row] of updates)if(!stored.some(r=>r.id===id))stored.push(row);
 await actor.update({'system.activeAptitudes':stored,'system.resources.chakra.value':chakra,'flags.sns-v14-dev.turnMaintenance':ledger});
 const results=Object.values(ledger).filter(r=>r.combatId===event.combatId&&r.round===event.round);
 if(results.some(r=>r.status==='blocked'))ui.notifications.warn(actor.name+': manutenção pendente por chakra insuficiente ou origem inválida. Confira Aptidões ativas.');
 else if(chakra===0)ui.notifications.warn(actor.name+': chakra 0. Confira Colapso do Olho com o mestre.');
}
export function queueCombatEvents(combat,events){
 const next=(queues.get(combat)??Promise.resolve()).catch(()=>{}).then(async()=>{for(const event of events)await processCombatEvent(event);});
 queues.set(combat,next);next.catch(error=>{console.error('SNS · turnos',error);ui.notifications.error('Não foi possível atualizar os efeitos: '+error.message);});return next;
}
export const flushCombatEvents=combat=>queues.get(combat)??Promise.resolve();
export async function endActorScene(actor){
 if(!isTimekeeper()||!actor?.isOwner)throw Error('O mestre ativo precisa encerrar os efeitos de cena.');
 return withEffectLock(actor,async()=>{
  if(actor.flags?.['sns-v14-dev']?.environmentRepelirWindow)await actor.unsetFlag('sns-v14-dev','environmentRepelirWindow');
  if(actor.flags?.['sns-v14-dev']?.advancedScene)await actor.unsetFlag('sns-v14-dev','advancedScene');
  const {activeEnvironments,environmentData}=await import('./environment-core.mjs'),{endEnvironment}=await import('./environment-service.mjs');for(const root of activeEnvironments(actor))if(!environmentData(root).permanent)await endEnvironment(root,'Cena encerrada.');
  const {activeSupports}=await import('./support-core.mjs'),{endSupport}=await import('./support-service.mjs');for(const root of activeSupports(actor))await endSupport(root,'Cena encerrada.');
  const {activePhantasms}=await import('./phantasm-core.mjs'),{endPhantasm}=await import('./phantasm-service.mjs');for(const root of activePhantasms(actor))await endPhantasm(root);
  const at=new Date().toISOString(),conditions=Array.from(actor.items).filter(i=>isManagedCondition(i)&&i.system.appliedCondition.active&&i.system.appliedCondition.durationRule?.mode==='scene');
  const {activeIllusions,sceneEpoch}=await import('./magen-core.mjs'),{endIllusion}=await import('./magen-service.mjs');for(const root of activeIllusions(actor))await endIllusion(actor,root,'Cena encerrada');
  const cooldowns=Array.from(actor.items).filter(i=>i.system.contentId==='sns:state:imunidade-fascinio'&&i.system.appliedCondition.active);if(cooldowns.length)await actor.updateEmbeddedDocuments('Item',cooldowns.map(i=>({_id:i.id,'system.appliedCondition.active':false,'system.appliedCondition.endedAt':at})));
  await actor.update({'flags.sns-v14-dev.magenScene':sceneEpoch(actor)+1});
  for(const item of conditions)if(item.flags?.['sns-v14-dev']?.effectBinding)await (await import('./effect-item-service.mjs')).endBoundEffect(item);
  if(conditions.length)await actor.updateEmbeddedDocuments('Item',conditions.map(i=>({_id:i.id,'system.appliedCondition.active':false,'system.appliedCondition.endedAt':at})),{snsEffectItems:true});
  const rows=activationRows(actor),ended=rows.filter(r=>r.active&&['sharingan','byakugan','legado-sharingan'].includes(r.rule));
  const legado=actor.flags?.['sns-v14-dev']?.legado;if(legado){const next=structuredClone(legado);next.active={};if(next.susanoo)next.susanoo={...next.susanoo,active:false,recreated:false,destroyed:false,yomi:0};await actor.update({'flags.sns-v14-dev.legado':next});const effects=Array.from(actor.items).filter(i=>i.system.appliedCondition?.active&&i.flags?.['sns-v14-dev']?.legadoEffect?.selfKey);if(effects.length)await actor.updateEmbeddedDocuments('Item',effects.map(i=>({_id:i.id,'system.appliedCondition.active':false})));}
  if(ended.length){const next=rows.map(r=>ended.includes(r)?{...r,active:false,history:[...(r.history??[]),{event:'sceneEnd',from:true,to:false,chakraCost:0,user:game.user.id,at}]}:r);await actor.update({'system.activeAptitudes':next});}
  const transformations=structuredClone(transformationState(actor));if(transformations.entries.length){transformations.entries=transformations.entries.map(r=>({...r,mode:'normal',buffs:[],arms:[],turns:0,controlPaid:false,playerLocked:false,forced:false}));await actor.update({'flags.sns-v14-dev.transformations':transformations});}
  return {conditions:conditions.length,aptitudes:ended.length};
 });
}
