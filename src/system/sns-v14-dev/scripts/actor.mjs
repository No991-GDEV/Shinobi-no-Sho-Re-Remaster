import {mayEditCraftActor} from './crafting-core.mjs';
import {mayEditParty,isManagedParty} from './party-core.mjs';
import {mayEditSummon,kuchiyoseLink} from './kuchiyose-core.mjs';
import {mayEditEnvironment} from './environment-core.mjs';
import {mayEditSupportActor} from './support-core.mjs';
import {captureVitalityChange} from './vitality-animation.mjs';
import {guardTransformationUpdate} from './transformation-service.mjs';
import {statusDefinition,toggleConditionStatus} from './token-conditions.mjs';
import {damageUpdateGuard} from './damage-guards.mjs';
import {mayEditTurnLedger} from './effect-duration.mjs';
import {mayEditPhantasmActor} from './phantasm-core.mjs';
import {mayEditMagenActor} from './magen-core.mjs';
import {mayEditBudgets,mayCreateBudgets} from './investment-budget.mjs';
import {mayEditProgressionHistory} from './progression-policy.mjs';
import {mayCreateNpcBuild,mayEditNpcBuild} from './npc-build-permissions.mjs';
export class ShinobiActor extends foundry.documents.Actor {
  async toggleStatusEffect(statusId,options={}){if(!statusDefinition(statusId))return super.toggleStatusEffect(statusId,options);try{return await toggleConditionStatus(this,statusId,options);}catch(e){ui.notifications.warn(e.message);return false;}}
  async _preUpdate(changes,options,user){
    const allowed=await super._preUpdate(changes,options,user);if(allowed===false)return false;
    if(guardTransformationUpdate(this,changes,options,user)===false)return false;
    if(!damageUpdateGuard(this,changes,options,user)){ui.notifications.warn('Proteções e histórico de dano: somente o mestre pode editar.');return false;}
    const expanded=foundry.utils.expandObject(changes),system=expanded.system;
    const after=foundry.utils.mergeObject(this.toObject(),expanded,{inplace:false,applyOperators:true});if(!mayEditEnvironment(this.toObject(),after,user.isGM)||!mayEditSupportActor(this.toObject(),after,user.isGM)||!mayEditMagenActor(this.toObject(),after,user.isGM)||!mayEditPhantasmActor(this.toObject(),after,user.isGM)){ui.notifications.warn('Use as ações do efeito para alterar seu estado.');return false;}
    if(!mayEditNpcBuild(this.toObject(),after,user.isGM)){ui.notifications.warn('Somente o mestre altera a configuração do NPC.');return false;}
    if(!mayEditParty(this.toObject(),after,user.isGM)){ui.notifications.warn('Somente o mestre organiza a equipe. Edite seus personagens pelas fichas.');return false;}
    if(!mayEditSummon(this.toObject(),after,user.isGM)){ui.notifications.warn('Use Construção para ajustar os valores calculados da invocação.');return false;}
    if(!mayEditTurnLedger(this.flags?.['sns-v14-dev']?.turnMaintenance,expanded,user.isGM)){ui.notifications.warn('A manutenção é atualizada no início do turno.');return false;}
    if(!user.isGM&&(Object.hasOwn(system??{},'statsOriginal')||Object.hasOwn(system??{},'skillLevels'))){ui.notifications.warn('Atributos e níveis originais do NPC: somente o mestre pode editar.');return false;}
    if(!mayEditCraftActor(this.toObject(),after,user.isGM)){ui.notifications.warn('Abra Fabricação para alterar o preparo.');return false;}
    if(this.type==='shinobi'&&!mayEditBudgets(this.toObject(),after,user.isGM)){ui.notifications.warn('Use a progressão da tabela. Concessões extras e ajustes do contador continuam com o mestre.');return false;}
    if(this.type==='shinobi'&&!mayEditProgressionHistory(this.toObject(),after,user.isGM,user.id)){ui.notifications.warn('O histórico de NC só registra a alteração aplicada à ficha.');return false;}
    if(this.type==='shinobi'&&!user.isGM&&this.system.phase==='creation'&&after.system.phase==='evolution'){
      const {mayFinishCreation}=await import('./guide-validation.mjs');
      if(!mayFinishCreation(this,after.system)){ui.notifications.warn('Há pontos ou requisitos pendentes na criação.');return false;}
    }
    captureVitalityChange(this,changes,options);
  }
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;
    if(!mayCreateNpcBuild(data,user.isGM)){ui.notifications.warn('Somente o mestre gera NPCs e define suas condições de origem.');return false;}
    if(!user.isGM&&isManagedParty(data)){ui.notifications.warn('O mestre cria as equipes do mundo.');return false;}
    if(!user.isGM&&kuchiyoseLink(data)){ui.notifications.warn('Vincule a nova invocação pelo seletor da ficha; o histórico não pode ser importado.');return false;}
    if(!user.isGM&&data.flags?.['sns-v14-dev']?.craftJobs){ui.notifications.warn('O histórico de fabricação não pode ser importado como uma nova produção.');return false;}
    if(!mayCreateBudgets(data,user.isGM)){ui.notifications.warn('Crie a ficha sem pontos concedidos e escolha o NC no assistente de criação.');return false;}
    if(!data.img||data.img==='icons/svg/mystery-man.svg'){
      const icon={npc:'npc',companion:'familiar',hazard:'hazard',loot:'loot',party:'party',vehicle:'vehicle',squad:'army'}[this.type];
      if(icon)this.updateSource({img:'systems/sns-v14-dev/assets/pf-actor-'+icon+'.svg'});
    }
    const combat=['shinobi','npc','companion'].includes(this.type);
    this.updateSource({ prototypeToken: {
      actorLink: this.type==='shinobi',
      bar1: { attribute: combat?"resources.vitality":null },
      bar2: { attribute: combat?"resources.chakra":null }
    } });
  }
  async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
    if (["resources.vitality", "resources.chakra"].includes(attribute)) {
      const current = foundry.utils.getProperty(this.system, attribute + ".value");
      if (isDelta && current === null) throw new Error("Informe o valor atual antes de aplicar uma variação.");
      const next = isDelta ? current + value : value;
      if (!Number.isInteger(next)) throw new Error("Recurso deve ter valor inteiro.");
      return this.update({ ["system." + attribute + ".value"]: next });
    }
    return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
  }
}
