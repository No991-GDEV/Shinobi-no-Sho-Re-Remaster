import {jutsuRuleText,rulePlain} from './jutsu-rule-text.mjs';
import {techniqueCard} from './technique-card.mjs';

// A reference technique can be shared without pretending it has an executor.
// Never use this path to bypass an invalid configured effect or power grant.
export function isStandaloneTechnique(item){
 const j=item?.system?.jutsu??{};
 const f=item?.flags?.['sns-v14-dev']??{};
 return item?.type==='jutsu'&&!j.effectId&&!j.grantSourceId&&!item.system.details?.powerId&&!['sharedRecipe','npcSourceRecipe','puppetUse','generatorTechnique'].some(k=>f[k]);
}
export function compactTechniqueDetails(item,details={}){
 const fields=jutsuRuleText(item).fields,result={...details};
 for(const [key,max]of [['action',64],['chakraCost',24],['range',64],['duration',60]]){
  const old=rulePlain(result[key]);if(old.length<=max)continue;
  if(item.system.contentId==='sns:jutsu:bunshin-no-jutsu'&&['action','chakraCost'].includes(key)){result[key]=key==='action'?'Movimento / Padrão':'1 / 4';continue;}
  const printed=rulePlain(fields[key]);result[key]=printed&&printed.length<=max?printed:key==='chakraCost'?'Variável':'Ver descrição';
 }
 return result;
}
export async function postStandaloneTechnique(actor,item){
 if(!actor?.isOwner&&!globalThis.game?.user?.isGM||item?.actor!==actor||!isStandaloneTechnique(item))return;
 const data=compactTechniqueDetails(item,{...item.system.details,...jutsuRuleText(item).fields});
 const projection={data,usedLevel:Math.max(1,item.system.level??1),traits:item.system.traits??[],effect:{text:item.system.description}};
 return foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:techniqueCard(item,projection)+'<p class="sns-manual-technique">Custo e efeitos: controle manual.</p>',flags:{'sns-v14-dev':{standaloneTechnique:{actorUuid:actor.uuid,itemUuid:item.uuid},check:{actorImg:actor.img,key:'jutsu'}}}});
}
