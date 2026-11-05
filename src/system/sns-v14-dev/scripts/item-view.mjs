import {isLegado,legadoRowDetails} from './legado-core.mjs';
import {npcJutsuPlan} from './npc-jutsu-core.mjs';
import {bookGrantLabel} from './book-power-grants.mjs';
import {npcPowerSummary} from './npc-power-profile.mjs';
import {itemArt,assignedItemArt,isPlaceholderArt} from './item-art.mjs';
import {creationData} from './support-core.mjs';
import {selectedAptitudeName,aptitudeChoiceStatus} from './aptitude-choices.mjs';
import {resolveGrantedJutsu} from './granted-jutsus.mjs';
import {itemCategory} from './sheet-profiles.mjs';
import {resolveJutsu,jutsuTraits,effectDefinition} from './power-core.mjs';
import {traitLabels} from './traits.mjs';
import {techniqueRestriction} from './transformation-core.mjs';
import {effectiveRuleItem} from './jutsu-rule-text.mjs';
import {isStandaloneTechnique,compactTechniqueDetails} from './standalone-technique.mjs';
export function jutsuProjection(item,options={}){
 const p=baseJutsuProjection(item,options);if(!p?.valid||!item.flags?.['sns-v14-dev']?.legadoCopy)return p;
 const mastered=item.actor.system.attributes?.int>=10&&Array.from(item.actor.items).some(i=>['sns:apt:sandan-sharingan','sns:legado:apt:sandan-sharingan'].includes(i.system.ruleId||i.system.contentId));
 return mastered?p:{...p,cost:p.cost+1,data:{...p.data,chakraCost:String(p.cost+1)},formulas:{...p.formulas,chakraCost:(p.formulas?.chakraCost??String(p.cost))+' + 1 · Falta de Domínio'}};
}
function baseJutsuProjection(item,{usedLevel}={}){
 if(item.type!=='jutsu'||!item.actor)return null;
 const effectId=item.system.jutsu?.effectId||(item.actor.type==='npc'&&effectDefinition(item.system.contentId)?item.system.contentId:'');if(!effectId)return null;
 const candidate={id:item.id,uuid:item.uuid,type:item.type,actor:item.actor,flags:item.flags,system:{...item.system,jutsu:{...item.system.jutsu,effectId,...(usedLevel===undefined?{}:{usedLevel})}}};
 const result=item.system.jutsu?.grantSourceId?resolveGrantedJutsu(item.actor,candidate):resolveJutsu(item.actor,item.actor.items.get(item.system.details.powerId),candidate,{recordedNpc:item.actor.type==='npc'}),restriction=techniqueRestriction(item.actor,item);
 return result&&restriction?{...result,valid:false,blockedReason:'Indisponível durante o modo bijuu ativo.',problems:[...(result.problems??[]),restriction]}:result;
}
export function itemPresentation(item){item=effectiveRuleItem(item);const referenceOnly=!isLegado(item)&&!!item.flags?.['sns-v14-dev']?.npcReferenceOnly;const projection=jutsuProjection(item);let details=npcPowerSummary(item,projection?.data?{...item.system.details,...projection.data}:item.system.details);if(item.flags?.['sns-v14-dev']?.sharedRecipe){try{const plan=npcJutsuPlan(item,[]);details={...details,action:plan.action,chakraCost:plan.cost===null?'Ver uso':String(plan.cost),range:plan.range};}catch{}}details=legadoRowDetails(item,details);if(item.type==='jutsu')details=compactTechniqueDetails(item,details);return {temporaryFists:!!(item.flags?.['sns-v14-dev']?.supportFists||item.flags?.['sns-v14-dev']?.bladeHand),id:item.id,name:item.name,displayName:selectedAptitudeName(item),selectionLabel:aptitudeChoiceStatus(item).label,img:itemArt(item),type:item.type,category:itemCategory(item),level:item.system.level,details,bookGrantLabel:item.flags?.['sns-v14-dev']?.legadoCopy?'Cópia por Mímica · sem custo em PP':bookGrantLabel(item),power:item.system.power,system:item.system,npcTechnique:isLegado(item)||item.actor?.type==='npc'||!!item.flags?.['sns-v14-dev']?.sharedRecipe,referenceOnly,canUse:!referenceOnly&&(isStandaloneTechnique(item)||isLegado(item)||!!projection?.valid||item.actor?.type==='npc'||!!item.flags?.['sns-v14-dev']?.sharedRecipe),consultOnly:referenceOnly||item.actor?.type!=='npc'&&item.flags?.['sns-v14-dev']?.animeRepertoire?.resolution==='manual',blockedReason:projection?.blockedReason??'',noRoll:!!projection?.noRoll,issues:projection?.problems??[],tags:[...(creationData(item)?[creationData(item).dissolved?'Criação desfeita':(creationData(item).solid?'Criada':'Não sólida')+' · '+creationData(item).element+' · Dureza '+creationData(item).hardness]:[]),...(item.system.tags??[]),...traitLabels({...item.system,traits:jutsuTraits(item.system.traits,projection),details}).map(t=>t.label)],quantity:item.system.quantity,compartments:item.system.compartments??'—',equipped:item.system.equipped};}
