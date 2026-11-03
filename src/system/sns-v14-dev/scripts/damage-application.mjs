import {supportHardnessRecords} from './support-core.mjs';
import {damageCalculation,damageResources,damageInputsSignature,latestDamage} from './damage-core.mjs';
import {effectiveHardness} from './transformation-core.mjs';
import {ARMOR_DAMAGE_PROFILES} from '../data/damage-profiles.mjs';
const pending=new WeakSet();
export const mayResolveDamage=()=>game.user.isGM&&game.users.activeGM?.id===game.user.id;
export function armorProtection(actor){
 const worn=Array.from(actor.items??[]).filter(i=>i.type==='armor'&&i.system.equipped&&i.system.quantity>0);
 // Zero-absorption clothing does not provide a second pool.
 const candidates=worn.filter(i=>{
  const fixed=ARMOR_DAMAGE_PROFILES[i.system.contentId];if(fixed?.max===0)return false;
  // Workbook clothing explicitly records zero absorption even without a book
  // identity. It cannot absorb damage; a GM-configured pool still takes priority.
  const registered=Array.from(actor.system.damageState?.armorPools??[]).find(p=>p.itemId===i.id);
  return !(!fixed&&!registered&&String(i.system.details?.absorption??'').trim()==='0');
 });
 if(candidates.length>1)throw Error('Há mais de uma armadura em uso. Deixe somente uma armadura de proteção equipada.');
 const item=candidates[0];if(!item)return {id:'',name:'Sem armadura de absorção',max:0,value:0};
 const stored=Array.from(actor.system.damageState?.armorPools??[]).find(p=>p.itemId===item.id),fixed=ARMOR_DAMAGE_PROFILES[item.system.contentId];
 return {id:item.id,name:item.name,max:fixed?.max??stored?.max??null,value:stored?.value??null,source:fixed?.source??stored?.source??'',custom:!fixed};
}
function owned(actor){if(!mayResolveDamage()||!actor?.isOwner||!['shinobi','npc','companion'].includes(actor.type))throw Error('O mestre ativo precisa resolver o dano desta ficha.');}
export async function registerProtection(actor,{hardness,hardnessSource='',armorId='',value,max,source=''}){
 owned(actor);if(pending.has(actor))throw Error('A ficha está concluindo outra aplicação.');
 pending.add(actor);try{
 if(!Number.isInteger(hardness)||hardness<0||hardness>0&&!hardnessSource?.trim())throw Error('Informe dureza não negativa e sua origem quando maior que zero.');
 const current=armorProtection(actor);if(current.id!==armorId)throw Error('A armadura em uso mudou. Reabra as proteções.');
 const pools=Array.from(actor.system.damageState?.armorPools??[]).map(p=>({...p}));
 if(armorId){max=current.custom?max:current.max;if(!Number.isInteger(max)||max<0||!Number.isInteger(value)||value<0||value>max||current.custom&&!source.trim())throw Error('Confira absorção atual/máxima e a origem da armadura personalizada.');const row={itemId:armorId,value,max,source:current.custom?source:current.source};const index=pools.findIndex(p=>p.itemId===armorId);if(index<0)pools.push(row);else pools[index]=row;}
 await actor.update({'system.damageState.hardness':hardness,'system.damageState.hardnessSource':hardnessSource.trim(),'system.damageState.armorPools':pools});
 }finally{pending.delete(actor);}
}
export async function applyDamage(actor,{requestKey,source='',sourceUuid='',spec,expectedSignature=null,decision={}}){
 owned(actor);if(!requestKey||typeof requestKey!=='string')throw Error('Aplicação sem identificador.');if(pending.has(actor))throw Error('A ficha está concluindo outra aplicação.');pending.add(actor);
 try{
  const log=actor.flags?.['sns-v14-dev']?.damageLedger??{},previous=Object.values(log).find(e=>e?.version===1&&e.requestKey===requestKey&&e.status==='applied');if(previous)return previous;
  const armor=armorProtection(actor),signature=damageInputsSignature(actor,armor.id);
  if(expectedSignature!==null&&expectedSignature!==signature)throw Error('Vitalidade ou proteção mudou. Recalcule o dano antes de aplicar.');
  if(armor.id&&(!Number.isInteger(armor.value)||!Number.isInteger(armor.max)||armor.value<0||armor.value>armor.max))throw Error('Registre a absorção atual da armadura antes de aplicar dano.');
  const calculation=damageCalculation({...spec,hardness:effectiveHardness(actor)});
  const resources=damageResources(calculation,{vitality:actor.system.resources.vitality.value,temp:actor.system.resources.vitality.temp??0,absorption:armor.value});
  const id=foundry.utils.randomID(),state=actor.system.damageState??{},pools=Array.from(state.armorPools??[]).map(p=>({...p}));
  if(armor.id)pools.find(p=>p.itemId===armor.id).value=resources.after.absorption;
  const record={version:1,id,requestKey,status:'applied',source,sourceUuid,actorUuid:actor.uuid,sequence:Math.max(0,...latestDamage(actor).map(e=>e.sequence))+1,previousHead:state.head??'',externalRevision:state.externalRevision??0,armorId:armor.id,armorName:armor.name,armorMax:armor.max,armorSource:armor.source??'',hardnessSource:[...(state.hardness===calculation.hardness&&state.hardnessSource?[state.hardnessSource]:[]),...supportHardnessRecords(actor).filter(r=>r.hardness===calculation.hardness).map(r=>r.name)].join(' · '),supportHardness:supportHardnessRecords(actor),calculation,resources,decision:structuredClone(decision),user:game.user.id,at:new Date().toISOString()};
  if(!mayResolveDamage())throw Error('O mestre ativo mudou. Reabra a aplicação.');
  // One actor document write holds resource values, pool balance and the durable ledger together.
  await actor.update({'system.resources.vitality.value':resources.after.vitality,...(actor.type==='shinobi'?{'system.resources.vitality.temp':resources.after.temp}:{}),'system.damageState.head':id,'system.damageState.armorPools':pools,['flags.sns-v14-dev.damageLedger.'+id]:record},{snsDamageOperation:true});
  return record;
 }finally{pending.delete(actor);}
}
export async function undoDamage(actor,id){
 owned(actor);if(pending.has(actor))throw Error('A ficha está concluindo outra aplicação.');pending.add(actor);
 try{
  const record=actor.flags?.['sns-v14-dev']?.damageLedger?.[id],state=actor.system.damageState??{};
  if(!record||record.version!==1)throw Error('Registro de dano não encontrado.');if(record.status==='undone')return record;
  if(state.head!==id)throw Error('Desfaça primeiro a aplicação de dano mais recente.');
  if((state.externalRevision??0)!==record.externalRevision)throw Error('Houve uma alteração posterior de Vitalidade ou absorção. Confira o histórico com o mestre.');
  const pools=Array.from(state.armorPools??[]).map(p=>({...p})),pool=pools.find(p=>p.itemId===record.armorId),a=record.resources.after;
  if(actor.system.resources.vitality.value!==a.vitality||(actor.system.resources.vitality.temp??0)!==a.temp||record.armorId&&pool?.value!==a.absorption)throw Error('A Vitalidade ou a absorção mudou após o dano. Não é possível desfazê-lo.');
  if(pool)pool.value=record.resources.before.absorption;
  const restored={...record,status:'undone',undoneBy:game.user.id,undoneAt:new Date().toISOString()};
  await actor.update({'system.resources.vitality.value':record.resources.before.vitality,...(actor.type==='shinobi'?{'system.resources.vitality.temp':record.resources.before.temp}:{}),'system.damageState.head':record.previousHead,'system.damageState.armorPools':pools,['flags.sns-v14-dev.damageLedger.'+id]:restored},{snsDamageOperation:true});return restored;
 }finally{pending.delete(actor);}
}
