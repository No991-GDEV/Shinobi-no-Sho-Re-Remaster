import {latestDamage,safeTargetKey} from './damage-core.mjs';
export const effectPending=(use,key)=>!use.results[key]||use.results[key].status==='damageUndone';
export const nextTurnEndRule=(targetUuid,combat)=>combat?.started?{mode:'turns',turns:combat.combatant?.actor?.uuid===targetUuid?2:1,phase:'end',anchor:'recipient'}:{mode:'manual'};
export function damageTriggerState(record){
 if(!record||record.status!=='applied')return 'pending';
 if(![record.resources?.vitalityLost,record.resources?.temporaryLost].every(n=>Number.isSafeInteger(n)&&n>=0))return 'pending';
 return record.resources?.vitalityLost>0||record.resources?.temporaryLost>0?'taken':'none';
}
export function jutsuDamageRecord(message,actor){
 const use=message.getFlag('sns-v14-dev','jutsuUse');
 return latestDamage(actor).find(e=>e.requestKey==='chat:'+message.id+':'+safeTargetKey(actor.uuid)&&e.sourceUuid===use.itemUuid);
}
export async function jutsuDamageStates(message,use){
 const states={};if(!use.bindings.some(b=>b.requiresDamage))return states;
 for(const target of use.targets){const actor=await fromUuid(target.uuid);states[target.uuid]=actor?damageTriggerState(jutsuDamageRecord(message,actor)):'pending';}return states;
}
