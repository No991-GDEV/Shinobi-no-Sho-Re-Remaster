import {mayEditSharedRecipe} from './recipe-policy.mjs';
import {craftProfile,validateCraftProfile,mayEditCraftItem,protectedCraftCreation,trustedCraftProfileCopy,mayDeleteCraftItem} from './crafting-core.mjs';
import {kuchiyoseLink,summonItemProblems,mayEditGeneratedSummonItem} from './kuchiyose-core.mjs';
import {itemArt,assignedItemArt,isPlaceholderArt} from './item-art.mjs';
import {mayEditEnvironment,environmentData,environmentMember} from './environment-core.mjs';
import {mayEditSupport,supportData,creationData} from './support-core.mjs';
const ICONS={reference:'book',weapon:'sword',armor:'shield',shield:'shield',equipment:'item-bag',service:'coins',consumable:'pill',ammunition:'target',container:'chest',treasure:'coins',kit:'chest',document:'book',action:'upgrade',attack:'sword',aptitude:'sun',power:'aura',jutsu:'fire',effect:'aura',condition:'degen',affliction:'poison',clan:'oak',hijutsu:'book',background:'village',feature:'sun',formula:'clockwork'};
import {mayEditTransformationItem} from './transformation-service.mjs';
import {mayEditPhantasm,phantasmData} from './phantasm-core.mjs';
import {mayEditIllusion,illusionData} from './magen-core.mjs';
import {acquisitionOf,mayEditAcquisition,acquisitionProblems} from './investment-budget.mjs';
import {requirementProfile,requirementSource,validateRequirementProfile,mayEditRequirementProfile,isTrustedRequirementCopy} from './requirement-policy.mjs';
const generatedBookFields=['sharedRecipe','npcBuildTechnique','npcCastParameters','bookPowerGrant','bookCanhao','jionguHearts','jionguNature','falseBijuuTails','puppetConstruction','puppetDevice','puppetUse'];
export function itemIcon(type){return 'icons/svg/'+(ICONS[type]??'item-bag')+'.svg';}
export class SnsItem extends foundry.documents.Item {
 async _preCreate(data,options,user){
  const allowed=await super._preCreate(data,options,user);if(allowed===false)return false;
  if(!user.isGM&&generatedBookFields.some(k=>Object.hasOwn(this.flags?.['sns-v14-dev']??{},k))){ui.notifications.warn('O mestre configura as construções e concessões do gerador.');return false;}
  if(!mayEditGeneratedSummonItem({},this.toObject(),user.isGM)){ui.notifications.warn('Os itens da espécie são calculados pela construção da invocação.');return false;}
  if(craftProfile(this)){
   try{validateCraftProfile(craftProfile(this));}catch(error){ui.notifications.warn(error.message);return false;}
   if(!user.isGM){const uuid=this.flags?.['sns-v14-dev']?.craftProfileSource||data._stats?.compendiumSource,source=uuid?await fromUuid(uuid):null;if(!source?.testUserPermission(user,'OBSERVER')||!trustedCraftProfileCopy(this,source)){ui.notifications.warn('Escolha uma fórmula com o preparo definido pelo mestre.');return false;}}
  }
  if(!user.isGM&&(protectedCraftCreation(this)||!craftProfile(this)&&(this.flags?.['sns-v14-dev']?.craftProfileSource||this.flags?.['sns-v14-dev']?.craftProfileHistory))){ui.notifications.warn('O mestre controla os registros de fabricação.');return false;}
  if(requirementProfile(this)){
   try{validateRequirementProfile(requirementProfile(this));}catch(error){ui.notifications.warn(error.message);return false;}
   if(!user.isGM){const uuid=requirementSource(this)||data._stats?.compendiumSource,source=uuid?await fromUuid(uuid):null;if(!source?.testUserPermission(user,'OBSERVER')||!isTrustedRequirementCopy(this,source)){ui.notifications.warn('Requisitos personalizados precisam ser definidos pelo mestre.');return false;}}
  }
  if(!user.isGM&&(this.flags?.['sns-v14-dev']?.advancedState||this.flags?.['sns-v14-dev']?.advancedChild||this.flags?.['sns-v14-dev']?.poisonBatch||environmentData(this)||environmentMember(this)||illusionData(this)||phantasmData(this)||supportData(this)||creationData(this)||this.flags?.['sns-v14-dev']?.supportFists)){ui.notifications.warn('O mestre aplica e controla os registros de ilusão.');return false;}
  if(!user.isGM&&this.system.appliedCondition?.managed){ui.notifications.warn('O mestre aplica os estados temporários.');return false;}
  if(this.actor&&this.type==='effectDefinition'){ui.notifications.warn('Este é um componente de criação. Aprenda-o na progressão de um poder; os estados recebidos ficam em Efeitos.');return false;}
  if(this.actor&&user.isGM&&this.type==='condition'&&this.system.contentId?.startsWith('sns:condition:')&&!this.system.appliedCondition.managed)this.updateSource({'system.appliedCondition.managed':true,'system.appliedCondition.active':true,'system.appliedCondition.scope':'all','system.appliedCondition.origin':'Mestre'});
  const {mayAcquireOrigin,originGrant,packageAcquisitionProblems}=await import('./restricted-access.mjs');
  if(!mayAcquireOrigin(this,user.isGM,this.actor)){ui.notifications.warn('Adicione esta origem à ficha de um personagem que você controla.');return false;}
  const packageProblems=packageAcquisitionProblems(this,this.actor);if(packageProblems.length){ui.notifications.warn(packageProblems.join(' '));return false;}
  const origin=originGrant(this);if(origin)this.updateSource({'flags.sns-v14-dev.originAuthorization':{rule:origin,user:user.id,at:new Date().toISOString()}});
  const {validateTargetEffects}=await import('./jutsu-outcomes.mjs');
  try{validateTargetEffects(this.system.targetEffects??[]);}catch(e){ui.notifications.warn(e.message);return false;}
  if(!user.isGM&&this.system.targetEffects?.length){
   const {loadCanonicalLibrary}=await import('./canonical-content.mjs'),entry=(await loadCanonicalLibrary()).entries.find(e=>e.id===this.system.contentId);
   if(!entry||JSON.stringify(validateTargetEffects(entry.document.system.targetEffects??[]))!==JSON.stringify(validateTargetEffects(this.system.targetEffects))){ui.notifications.warn('Para efeitos personalizados, peça ao mestre para definir as regras. Efeitos do catálogo podem ser adicionados diretamente.');return false;}
  }
  const {overrideProblems}=await import('./override-policy.mjs');const rows=this.system.jutsu?.overrides??[];
  if(rows.length&&(!user.isGM||overrideProblems(rows).length)){ui.notifications.warn('Somente o mestre pode registrar exceções mecânicas justificadas.');return false;}
  const {requirementsFor}=await import('./item-requirements.mjs'),r=requirementsFor(this,this.actor);
  if(this.actor&&r.configured&&!r.valid){ui.notifications.warn('Não foi possível adicionar '+this.name+': '+r.problems.join(' '));return false;}
  if(this.actor&&!user.isGM&&['aptitude','feature'].includes(this.type)&&!r.configured)ui.notifications.warn('Requisitos: ver descrição.');
  if((this.actor?.type==='shinobi'||kuchiyoseLink(this.actor)?.mode==='calculated')&&['aptitude','power'].includes(this.type)){
   let a=acquisitionOf(this);
   if(!a&&this.type==='aptitude'){const {chooseAcquisition}=await import('./acquisition-ui.mjs');a=await chooseAcquisition(this.actor,this);if(!a)return false;this.updateSource({'flags.sns-v14-dev.acquisition':a});}
   if(!user.isGM&&!mayEditAcquisition({},this.toObject(),false)){ui.notifications.warn('O mestre precisa registrar concessões e exceções de aquisição.');return false;}
   if(user.isGM&&a){a={...a,authorizedBy:user.id};this.updateSource({'flags.sns-v14-dev.acquisition':a});}
   const problems=acquisitionProblems({...this.toObject(),id:this.id},this.actor.items);if(problems.length){ui.notifications.warn(problems.join(' '));return false;}
  }
  const summonProblems=this.actor?summonItemProblems(this.actor,this):[];if(summonProblems.length){ui.notifications.warn(summonProblems.join(' '));return false;}
  const art=assignedItemArt(this);if(art&&isPlaceholderArt(data.img??this.img))this.updateSource({img:art});else if(!data.img||data.img==='icons/svg/item-bag.svg')this.updateSource({img:itemIcon(this.type)});
 }
 async _preUpdate(changes,options,user){
  const allowed=await super._preUpdate(changes,options,user);if(allowed===false)return false;
  const {mayChangeOverrides,overrideProblems}=await import('./override-policy.mjs');
  const expanded=foundry.utils.expandObject(changes),rows=expanded.system?.jutsu?.overrides;
  if(rows!==undefined&&(!mayChangeOverrides(this.system.jutsu?.overrides,rows,user.isGM)||overrideProblems(rows).length)){ui.notifications.warn('Somente o mestre pode alterar exceções; informe campo, valor e justificativa.');return false;}
  if(expanded.system?.targetEffects!==undefined){try{const {validateTargetEffects}=await import('./jutsu-outcomes.mjs');validateTargetEffects(expanded.system.targetEffects);}catch(e){ui.notifications.warn(e.message);return false;}}
  const {mayEditItemRules}=await import('./item-requirements.mjs');
  const after=foundry.utils.mergeObject(this.toObject(),expanded,{inplace:false,applyOperators:true});
  if(!mayEditSharedRecipe(this.toObject(),after,user.isGM)){ui.notifications.warn('Esta técnica segue a receita do livro. Altere o poder de origem ou crie um jutsu personalizado.');return false;}
  if(!user.isGM&&generatedBookFields.some(k=>JSON.stringify(this.flags?.['sns-v14-dev']?.[k])!==JSON.stringify(after.flags?.['sns-v14-dev']?.[k]))){ui.notifications.warn('O mestre configura as construções e concessões do gerador.');return false;}
  if(!mayEditGeneratedSummonItem(this.toObject(),after,user.isGM)){ui.notifications.warn('Altere os valores no botão Construção da invocação.');return false;}
  const summonProblems=this.actor?summonItemProblems(this.actor,{...after,id:this.id}):[];if(summonProblems.length){ui.notifications.warn(summonProblems.join(' '));return false;}
  if(!mayEditCraftItem(this.toObject(),after,user.isGM)){ui.notifications.warn('O mestre configura as fórmulas e conserva os recibos de fabricação.');return false;}
  if(craftProfile(after)){try{validateCraftProfile(craftProfile(after));}catch(error){ui.notifications.warn(error.message);return false;}}
  if(!mayEditRequirementProfile(this.toObject(),after,user.isGM)){ui.notifications.warn('Somente o mestre pode alterar os requisitos e seu histórico.');return false;}
  if(requirementProfile(after)){try{validateRequirementProfile(requirementProfile(after));}catch(error){ui.notifications.warn(error.message);return false;}}
  if(this.actor&&expanded.system?.level!==undefined&&expanded.system.level>this.system.level){const {requirementsFor}=await import('./item-requirements.mjs'),r=requirementsFor(after,this.actor);if(r.configured&&!r.valid){ui.notifications.warn(r.problems.join(' '));return false;}}
  if((this.actor?.type==='shinobi'||kuchiyoseLink(this.actor)?.mode==='calculated')&&['aptitude','power'].includes(this.type)){
   if(!mayEditAcquisition(this.toObject(),after,user.isGM)){ui.notifications.warn('O mestre controla concessões e exceções de aquisição.');return false;}
   const changed=JSON.stringify(acquisitionOf(this))!==JSON.stringify(acquisitionOf(after));
   if(changed&&user.isGM&&acquisitionOf(after)){after.flags['sns-v14-dev'].acquisition.authorizedBy=user.id;changes['flags.sns-v14-dev.acquisition']=after.flags['sns-v14-dev'].acquisition;}
   if(changed){const problems=acquisitionProblems({...after,id:this.id},this.actor.items);if(problems.length){ui.notifications.warn(problems.join(' '));return false;}}
  }
  if(!mayEditEnvironment(this.toObject(),after,user.isGM)||!mayEditSupport(this.toObject(),after,user.isGM)||!mayEditIllusion(this.toObject(),after,user.isGM)||!mayEditPhantasm(this.toObject(),after,user.isGM)){ui.notifications.warn('O mestre controla o registro de ilusão.');return false;}
  if(!mayEditTransformationItem(this.toObject(),after,user.isGM)){ui.notifications.warn('Imagens, Controle Total e integridade da Armadura a Vapor: somente o mestre pode editar.');return false;}
  if(this.actor&&expanded.system?.equipped===true&&!this.system.equipped){
   const {equipmentUse}=await import('./equipment-use.mjs'),use=equipmentUse(after,this.actor.system,this.actor.items);
   if(!use.valid){ui.notifications.warn(use.problems.join(' '));return false;}
  }
  if(!mayEditItemRules(this.system.toObject(),after.system,user.isGM)){ui.notifications.warn('Somente o mestre pode editar as regras e os requisitos deste item.');return false;}
  if(expanded.system?.details&&Object.hasOwn(expanded.system.details,'accessRule')){
   const {originGrant}=await import('./restricted-access.mjs'),origin=originGrant(after);
   if(after.system.details.accessRule&&!origin){ui.notifications.warn('Selecione uma origem de acesso válida para uma característica, clã ou hijutsu.');return false;}
   if(this.system.details.accessRule!==after.system.details.accessRule)changes['flags.sns-v14-dev.originHistory']=[...(this.flags?.['sns-v14-dev']?.originHistory??[]),{before:this.system.details.accessRule??'',after:origin,user:user.id,at:new Date().toISOString()}];
  }
  if(expanded.system?.choice){const {aptitudeChoiceStatus}=await import('./aptitude-choices.mjs');if(!aptitudeChoiceStatus(after).valid){ui.notifications.warn('Escolha inválida para esta aptidão.');return false;}}
 }
 async _preDelete(options,user){const allowed=await super._preDelete(options,user);if(allowed===false)return false;if(!mayEditGeneratedSummonItem(this.toObject(),{},user.isGM)){ui.notifications.warn("Os itens da espécie são mantidos pela construção.");return false;}if(!mayDeleteCraftItem(this,user.isGM)){ui.notifications.warn('Conclua ou desfaça o preparo antes de remover este registro.');return false;}if((this.flags?.['sns-v14-dev']?.advancedState||this.flags?.['sns-v14-dev']?.advancedChild||this.flags?.['sns-v14-dev']?.poisonBatch||environmentData(this)||environmentMember(this)||illusionData(this)||phantasmData(this)||supportData(this)||creationData(this)||this.flags?.['sns-v14-dev']?.supportFists)&&!user.isGM){ui.notifications.warn('Use as ações da ilusão na aba Efeitos.');return false;}}
}
