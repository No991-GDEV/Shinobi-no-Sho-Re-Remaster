import {weaponDamageProfile} from './damage-source.mjs';
import {isManagedCondition,conditionEffects,conditionPenalty} from './condition-effects.mjs';
import {selectedAptitudeName,aptitudeChoiceStatus} from './aptitude-choices.mjs';
import {CATEGORIES,itemCategory,itemProfile} from './sheet-profiles.mjs';
import {weaponChecks} from './weapon-checks.mjs';
import {isAptitudePower} from './aptitude-jutsus.mjs';
const physical=['weapons','armor','equipment','consumables','ammunition','treasures','containers'];
export function supportingNavigation(type){
 if(type==='hazard')return [];
 if(type==='party')return [['details','Visão geral'],['exploration','Exploração'],['inventory','Depósito'],['notes','Notas']];
 if(type==='loot')return [['inventory','Inventário'],['details','Configuração'],['notes','Descrição']];
 if(['npc','companion'].includes(type))return [['details','Principal'],['inventory','Inventário'],['jutsus','Jutsus'],['effects','Efeitos'],['features','Características'],['notes','Notas']];
 return [['details','Detalhes'],['actions','Ações'],['inventory','Inventário'],['notes','Descrição'],['effects','Efeitos']];
}
export function supportingItems(items,tab,stats={},system=null){
 const rows=items.map(i=>({temporaryFists:!!(i.flags?.['sns-v14-dev']?.supportFists||i.flags?.['sns-v14-dev']?.bladeHand),id:i.id,name:i.name,displayName:selectedAptitudeName(i),selectionLabel:aptitudeChoiceStatus(i).label,img:i.img,tags:i.system.tags??[],category:itemCategory(i),type:i.type,label:itemProfile(i).label,quantity:i.system.quantity,compartments:i.system.compartments??'—',details:i.system.details,weapon:itemCategory(i)==='weapons',equipped:i.system.equipped,weaponChecks:weaponChecks(i,stats,system,items).map(c=>{const p=i.actor&&weaponDamageProfile(i.actor,i,c.key);return {...c,hasDamage:!!p,damageBase:p?.base,damageFormula:p?.formula};}),canRoll:Number.isInteger(i.system.details?.precision),signedPrecision:(i.system.details?.precision>=0?'+':'−')+Math.abs(i.system.details?.precision??0)}));
 const group=(id,label,entries,createType='')=>({id,label,entries,createType});
 if(tab==='inventory')return physical.map(id=>group(id,CATEGORIES[id],rows.filter(i=>i.category===id&&!i.temporaryFists)));
 if(tab==='effects'){const visible=rows.filter(r=>!isManagedCondition(items.find(i=>i.id===r.id)));return [group('effects','Condições',visible.filter(i=>i.type==='condition'),'condition'),group('effects','Efeitos',visible.filter(i=>i.category==='effects'&&i.type!=='condition'))];}
 if(tab==='features')return [group('features','Clãs e características',rows.filter(i=>i.category==='features'),'feature'),group('aptitudes','Aptidões',rows.filter(i=>i.category==='aptitudes'&&!isAptitudePower(items.find(s=>s.id===i.id))))];
 if(tab==='details')return [group('standard','Ataques',rows.filter(i=>i.type==='attack'||i.weapon),'attack'),group('standard','Ações',rows.filter(i=>i.category==='standard'&&i.type!=='attack')),group('reaction','Reações',rows.filter(i=>i.category==='reaction')),group('free','Ações livres',rows.filter(i=>i.category==='free'))];
 const ids=tab==='jutsus'?['powers','techniques']:['standard','reaction','free','aptitudes'];
 return ids.map(id=>group(id,CATEGORIES[id],rows.filter(i=>i.category===id)));
}
export function recordedInventory(items){
 const rows=items.filter(i=>physical.includes(itemCategory(i))&&!i.flags?.['sns-v14-dev']?.supportFists&&!i.flags?.['sns-v14-dev']?.bladeHand);
 // An unknown compartment value must never masquerade as a zero-capacity item.
 return {count:rows.length,compartments:rows.some(i=>i.system.compartments===null||i.system.compartments===undefined)?'—':rows.reduce((n,i)=>n+i.system.compartments*i.system.quantity,0)};
}
