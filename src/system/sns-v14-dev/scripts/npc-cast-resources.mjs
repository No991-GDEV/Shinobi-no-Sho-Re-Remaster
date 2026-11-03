import {resolveSpecialResource,specialResourceChange} from './special-resources.mjs';
import {PUPPET_DEVICES} from '../data/npc-puppet-devices.mjs';
const ns='sns-v14-dev';
export function npcExtraResources(actor,plan){
 const patch={},receipt={};
 if(plan.healthCost){const rows=Array.from(actor.system.specialResources??[]),row=rows.find(r=>r.kind==='health'),resolved=row&&resolveSpecialResource(actor,row);if(!resolved?.valid||!resolved.known||row.value<plan.healthCost)throw Error('Saúde de Kujaku Myoho insuficiente. Confira a lesão e a reserva com o mestre antes de outro uso.');patch['system.specialResources']=rows.map(r=>r===row?specialResourceChange(actor,row,row.value-plan.healthCost,'Uso de '+plan.name,{user:globalThis.game?.user?.id??'',at:new Date().toISOString()}):r);receipt.health=plan.healthCost;}
 if(plan.deviceUse){const d=plan.deviceUse,item=actor.items.get(d.itemId),construction=actor.items.get(item?.flags?.[ns]?.puppetDevice?.skeletonId)?.flags?.[ns]?.puppetConstruction,capacity=PUPPET_DEVICES[item?.flags?.[ns]?.puppetDevice?.slug]?.uses;if(!item||!construction||!Number.isSafeInteger(d.before)||!capacity||d.before<1||d.before>capacity||d.after!==d.before-1)throw Error('Dispositivo inválido.');const actual=actor.flags?.[ns]?.puppetUses?.[d.itemId]??capacity;if(actual!==d.before)throw Error('O estoque do dispositivo mudou. Abra um novo uso.');patch['flags.'+ns+'.puppetUses.'+d.itemId]=d.after;receipt.device={itemId:d.itemId,from:d.before,to:d.after};}
 return {patch,receipt};
}
