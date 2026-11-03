import {SnsCrafting} from './crafting-ui.mjs';
import {biographyMarkup,biographyFormChanges} from './biography.mjs';
import {requestRest} from './rest-service.mjs';
import {configureAcquisition} from './acquisition-ui.mjs';
import {environmentAction} from './environment-ui.mjs';
import {canControlTransformation} from './transformation-core.mjs';
import {illusionAction} from './magen-ui.mjs';
import {illusionActionBlock,senseContext} from './magen-core.mjs';
import {transformationMode,configureTransformation,transformationTechnique,transformationDomain,transformationRest,transformationManualTurn} from './transformation-ui.mjs';
import {postSheetDamage} from './sheet-damage.mjs';
import {declareDefenses} from './defense-workflow.mjs';
import {configureConditionDuration,promptEndActorScene} from './effect-duration-dialog.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {promptCondition,endCondition} from './condition-application.mjs';
import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {copyDroppedCanonicalChoice} from './canonical-dialog.mjs';
import {configureGrantedJutsu} from './granted-jutsu-dialog.mjs';
import {SnsSpecialResourceEditor} from './special-resource-editor.mjs';
import {configureActiveAptitude,toggleActiveAptitude,payAptitudeUpkeep} from './active-aptitude-dialog.mjs';
import {copyDroppedPower} from './item-drop.mjs';
import {weaponChecks,weaponCheckComponents} from './weapon-checks.mjs';
import {SnsCatalog} from './catalog.mjs';
import {mountTraitPicker} from './trait-picker.mjs';
import {useJutsu} from './jutsu-use.mjs';
import {SnsStatEditor} from './stat-editor.mjs';
import {SnsPowerDialog} from './power-dialog.mjs';
import {SnsJutsuManager} from './jutsu-manager.mjs';
import {SnsPowerProgression} from './power-progression.mjs';
import {SnsJutsuBuilder} from './jutsu-builder.mjs';
import { ATTRIBUTES, COMBAT, testSpec, escapeHtml } from "./kernel.mjs";
import { sheetView } from "./view.mjs";
import { SnsCheckDialog } from './check-dialog.mjs';
import { checkComponents,resolveCheck } from './roll-components.mjs';
import { SnsEvolutionDialog } from './evolution-dialog.mjs';
import { checkFlavor,attackTraitLabels } from './chat-card.mjs';
import {ITEM_PROFILES,typeForCategory,itemCategory} from './sheet-profiles.mjs';
import {SnsDamageDialog} from './damage-dialog.mjs';
import {damageSnapshot,weaponDamageProfile} from './damage-source.mjs';
const ROOT = "systems/sns-v14-dev";
const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
const partials = ["partials/budget-context", "partials/transformations", "partials/sidebar", "partials/header", "partials/active-aptitudes", "partials/applied-states", "partials/received-effects", ...["character", "actions", "inventory", "jutsus", "crafting", "skills", "features", "effects", "bio"].map(t => "tabs/" + t)].map(p => ROOT + "/templates/" + p + ".hbs");
export class ShinobiSheet extends SnsHandlebarsApplicationMixin(ActorSheetV2) {
 _getHeaderControls(){const controls=super._getHeaderControls();if(this.isEditable&&game.user.isGM)controls.push({action:'damageHistory',icon:'fa-solid fa-clock-rotate-left',label:'Ferramentas de dano'});return controls;}
 get isEditable(){return super.isEditable&&canControlTransformation(this.actor);}
  static async restActor(event,target){if(!this.isEditable||this.restPending)return;this.restPending=true;if(target)target.disabled=true;try{await this.submit();await requestRest(this.actor);}catch(e){ui.notifications.warn(e.message);}finally{this.restPending=false;if(target?.isConnected)target.disabled=false;}}
  static async sheetDamage(event,target){if(this.isEditable){await this.submit();await postSheetDamage(this.actor,this.actor.items.get(target.dataset.itemId),target.dataset.roll,Number(target.dataset.grade));}}
  static async damageHistory(){if(this.isEditable&&game.user.isGM)try{await new SnsDamageDialog({actor:this.actor}).render({force:true});}catch(error){ui.notifications.warn(error.message);}}
  static async conditionDuration(event,target){if(this.isEditable)try{await configureConditionDuration(this.actor,target.dataset.itemId);}catch(e){ui.notifications.warn(e.message);}}
  static async endActorScene(){if(this.isEditable)await promptEndActorScene(this.actor);}
  static async applyCondition(){if(this.isEditable)await promptCondition(this.actor);}
  static async sustainSupport(event,target){if(this.isEditable)await (await import('./support-service.mjs')).requestSupportControl(this.actor.items.get(target.dataset.itemId),'sustain');}
  static async endCondition(event,target){if(this.isEditable)await endCondition(this.actor,target.dataset.itemId);}
  activeTab = "character";
  actionTab = "encounter";
  jutsuTab = "powers";
  static DEFAULT_OPTIONS = {
    classes: ["sns-sheet-app"], position: { width: 780, height: 820 },window:{resizable:true},
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {craftEntry:ShinobiSheet.craftEntry,creationGuide:ShinobiSheet.creationGuide,acquisition:ShinobiSheet.acquisition,restActor:ShinobiSheet.restActor,environmentAction,illusionAction,transformationMode,configureTransformation,transformationTechnique,transformationDomain,transformationRest,transformationManualTurn,
      sheetDamage:ShinobiSheet.sheetDamage,conditionDuration:ShinobiSheet.conditionDuration,endActorScene:ShinobiSheet.endActorScene,damageHistory:ShinobiSheet.damageHistory,applyCondition:ShinobiSheet.applyCondition,sustainSupport:ShinobiSheet.sustainSupport,endCondition:ShinobiSheet.endCondition,
      payAptitudeUpkeep:ShinobiSheet.payAptitudeUpkeep,
      configureActiveAptitude:ShinobiSheet.configureActiveAptitude,toggleActiveAptitude:ShinobiSheet.toggleActiveAptitude,
      editSpecialResource:ShinobiSheet.editSpecialResource,
      createGrantedJutsu:ShinobiSheet.createGrantedJutsu,chooseTab: ShinobiSheet.chooseTab,editIdentityText:ShinobiSheet.editIdentityText,configurePower:ShinobiSheet.configurePower,manageJutsus:ShinobiSheet.manageJutsus,learnEffects:ShinobiSheet.learnEffects,buildJutsu:ShinobiSheet.buildJutsu,useJutsu:ShinobiSheet.useJutsu,
      editAttributes: ShinobiSheet.editAttributes,
      portrait: ShinobiSheet.portrait,
      rollTest: ShinobiSheet.rollTest,
      grant: ShinobiSheet.grant,
      editCombat: ShinobiSheet.editCombat,
      editAuxiliary: ShinobiSheet.editAuxiliary,
      showEvolution:ShinobiSheet.showEvolution,
      chooseContext: ShinobiSheet.chooseContext,editSkill:ShinobiSheet.editSkill,
      createEntry:ShinobiSheet.createEntry,editEntry:ShinobiSheet.editEntry,
      browseEntries:ShinobiSheet.browseEntries,changeQuantity:ShinobiSheet.changeQuantity,
      editMoney:ShinobiSheet.editMoney,removeEntry:ShinobiSheet.removeEntry,toggleEquipped:ShinobiSheet.toggleEquipped
    }
  };
  static async creationGuide(){if(!this.isEditable)return;await this.submit();const {SnsCreationWizard}=await import('./creation-wizard.mjs');const mode=this.actor.system.phase==='evolution'?'evolution':'creation';if(this.creationWizard&&(this.creationWizard.mode!==mode||this.creationWizard.justConcluded)){await this.creationWizard.close();this.creationWizard=null;}this.creationWizard??=new SnsCreationWizard(this.actor,{mode});await this.creationWizard.render({force:true});}
  static async craftEntry(event,target){if(!this.actor.testUserPermission(game.user,'OBSERVER'))return;if(this.isEditable)await this.submit();await new SnsCrafting(this.actor,target.dataset.itemId).render({force:true});}
  static async acquisition(event,target){if(this.isEditable){await this.submit();await configureAcquisition(this.actor,target.dataset.itemId);await this.render({force:true});}}
  static PARTS = { sheet: {scrollable:["", ".panels"], template: ROOT + "/templates/sheet.hbs", templates: partials } };
  async close(options={}){if(!options.force&&this.isEditable&&this.element?.isConnected)await this.submit();return super.close(options);}
  async _prepareContext(options) {
    const context={ ...await super._prepareContext(options), ...sheetView(this.actor, { activeTab: this.activeTab,actionTab:this.actionTab,jutsuTab:this.jutsuTab, isGM: game.user.isGM, editable: this.isEditable }) };
    context.biography=await Promise.all(context.biography.map(async row=>{
      const editorValue=foundry.utils.cleanHTML(biographyMarkup(row.value));
      return {...row,editorValue,html:await foundry.applications.ux.TextEditor.enrichHTML(editorValue,{secrets:false,relativeTo:this.actor})};
    }));
    this.biographyBaseline=Object.fromEntries(context.biography.map(row=>[row.key,row.editorValue]));
    return context;
  }
  static async editSpecialResource(event,target){if(!this.isEditable)return;await this.submit();new SnsSpecialResourceEditor(this.actor,target.dataset.resourceId??'').render({force:true});}
  static async configureActiveAptitude(event,target){if(!this.isEditable)return;await this.submit();await configureActiveAptitude(this.actor,target.dataset.activationId??'');}
  static async toggleActiveAptitude(event,target){if(!this.isEditable)return;await this.submit();await toggleActiveAptitude(this.actor,target.dataset.activationId);}
  static async payAptitudeUpkeep(event,target){if(!this.isEditable)return;await this.submit();await payAptitudeUpkeep(this.actor,target.dataset.activationId);}
  async _onRender(context,options) {
    await super._onRender(context,options);
    mountTraitPicker(this.element,this.actor);
    this.element.querySelectorAll('.bio-pane prose-mirror').forEach(editor=>{
      const label=editor.getAttribute('aria-label'),button=editor.querySelector('button.toggle');
      if(button){button.setAttribute('aria-label','Editar '+label);button.dataset.tooltip='Editar '+label;}
    });
    const header=this.window.header;
    if(this.isEditable&&!header.querySelector('.sns-token-control')){
      const tokenButton=document.createElement('button');
      tokenButton.type='button';tokenButton.className='header-control sns-token-control';
      tokenButton.dataset.action='configurePrototypeToken';tokenButton.setAttribute('aria-label','Prototype Token');
      tokenButton.innerHTML='<i class="fa-solid fa-circle-user" aria-hidden="true"></i> Prototype Token';
      header.insertBefore(tokenButton,this.window.controls);
    }
    if(!this.isEditable)header.querySelector('.sns-token-control')?.remove();
    // Foundry locks form buttons for observers; navigation and reading remain available.
    if(!this.isEditable) {
      this.element.querySelectorAll('[data-action="chooseTab"],[data-action="chooseContext"],[data-action="browseEntries"],[data-action="editEntry"],[data-action="showEvolution"],[data-action="manageJutsus"],[data-action="craftEntry"]').forEach(el=>el.disabled=false);
      const readSearch=this.element.querySelector('.inventory-search input');
      if(readSearch)readSearch.disabled=false;
    }
    const search=this.element.querySelector(".inventory-search input");
    search?.addEventListener("input",()=>{
      const needle=search.value.trim().toLocaleLowerCase();
      this.element.querySelectorAll(".inventory-row").forEach(row=>row.hidden=!(row.dataset.entryName+' '+(row.dataset.tags??'')).toLocaleLowerCase().includes(needle));
    });
    this.element.querySelectorAll(".score-number,.chakra-emblem input,.chakra-maximum output").forEach(el=>{
      const n=(el.value ?? el.textContent).trim().length;
      if(n>=3)el.style.fontSize=(n>=4?15:18)+"px";
    });
  }
 async _onDropItem(event,item){const choice=await copyDroppedCanonicalChoice(this.actor,item);if(choice.handled)return choice.item;if(item.type==='power'&&item.actor!==this.actor)return copyDroppedPower(this.actor,item);return super._onDropItem(event,item);}
  _processFormData(event, form, formData) {
    const data = super._processFormData(event, form, formData);
    for (const path of ["system.resources.vitality.value", "system.resources.chakra.value", "system.movement.available", "system.finances.ryo"]) {
      const field = form.elements.namedItem(path);
      if (field?.value === "") foundry.utils.setProperty(data, path, null);
    }
    return biographyFormChanges(data,this.biographyBaseline,foundry.utils.cleanHTML);
  }
  static async chooseTab(event, target) {
    const valid = ["character", "actions", "inventory", "jutsus", "crafting", "skills", "features", "effects", "bio"];
    if (!valid.includes(target.dataset.tabid)) return;
    this.tabScroll??={};
    const panel=this.element?.querySelector('.panels');
    if(panel)this.tabScroll[this.activeTab]=panel.scrollTop;
    if (this.isEditable) await this.submit();
    this.activeTab = target.dataset.tabid;
    await this.render({ force: true });
    const nextPanel=this.element?.querySelector('.panels');
    if(nextPanel)nextPanel.scrollTop=this.tabScroll[this.activeTab]??0;
  }
  static async portrait() {
    if (!this.isEditable) return;
    new foundry.applications.apps.FilePicker({
      type: "image", current: this.actor.img,
      callback: async path => { if (this.isEditable) await this.actor.update({ img: path }); }
    }).render({ force: true });
  }
  static async chooseContext(event,target){
    const group=target.dataset.group,key=target.dataset.context;
    if(group==="actions"&&["encounter","exploration","downtime"].includes(key))this.actionTab=key;
    if(group==="jutsus"&&key==='effects')return ShinobiSheet.chooseTab.call(this,event,{dataset:{tabid:'effects'}});
    else if(group==="jutsus"&&["powers","techniques"].includes(key))this.jutsuTab=key;
    if(this.isEditable)await this.submit();
    await this.render({force:true});
  }
  static async editSkill(event,target){if(!this.isEditable)return;await this.submit();if(this.actor.system.derived.skills[target.dataset.skill])await new SnsStatEditor(this.actor,target.dataset.skill).render({force:true});}
  static async editIdentityText(event,target){
    if(!this.isEditable||!['languages','senses'].includes(target.dataset.field))return;
    const field=target.dataset.field,label=field==='languages'?'Idiomas':'Sentidos';
    const value=await DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:label},content:'<label>'+label+'<input name="value" value="'+escapeHtml(this.actor.system.identity[field])+'"></label>',ok:{label:'Salvar',callback:(e,b)=>b.form.elements.value.value.trim()}});
    if(value!==null&&value!==undefined&&this.isEditable)await this.actor.update({['system.identity.'+field]:value});
  }
  static async createGrantedJutsu(event,target){if(!this.isEditable)return;await this.submit();await configureGrantedJutsu(this.actor,this.actor.items.get(target.dataset.itemId));}
  static async configurePower(event,target){if(!this.isEditable)return;const item=target.dataset.itemId?this.actor.items.get(target.dataset.itemId):null;if(item&&itemCategory(item)!=='powers')return;await new SnsPowerDialog(this.actor,item).render({force:true});}
  static async manageJutsus(event,target){const item=this.actor.items.get(target.dataset.itemId);if(item&&itemCategory(item)==='powers')await new SnsJutsuManager(this.actor,item).render({force:true});}
  static async useJutsu(event,target){if(this.actor.type==='npc'&&(this.actor.isOwner||game.user.isGM)){if(this.isEditable)await this.submit();return useJutsu(this.actor,this.actor.items.get(target.dataset.itemId));}if(!this.isEditable)return;await this.submit();await useJutsu(this.actor,this.actor.items.get(target.dataset.itemId));}
  static async learnEffects(event,target){const item=this.actor.items.get(target.dataset.itemId);if(item&&itemCategory(item)==='powers')await new SnsPowerProgression(item).render({force:true});}
  static async buildJutsu(event,target){if(!this.isEditable)return;const item=this.actor.items.get(target.dataset.itemId),power=this.actor.items.get(target.dataset.powerId??item?.system.details.powerId);await new SnsJutsuBuilder(this.actor,power,item?.type==='jutsu'?item:null).render({force:true});}
  static async createEntry(event,target){
    if(!this.isEditable)return;
    const category=target.dataset.category,preferredType=ITEM_PROFILES[target.dataset.itemType]?target.dataset.itemType:typeForCategory(category);
    const result=await DialogV2.prompt({classes:["sns-editor-dialog"],window:{title:"Adicionar registro à ficha"},
      content:'<label>Tipo<select name="type">'+Object.entries(ITEM_PROFILES).map(([type,p])=>'<option value="'+type+'" '+(type===preferredType?'selected':'')+'>'+escapeHtml(p.label)+'</option>').join('')+'</select></label><label>Nome<input name="name" required></label>',
      ok:{label:"Criar e editar",callback:(event,button)=>({name:button.form.elements.name.value.trim(),type:button.form.elements.type.value})}});
    if(result?.name&&this.isEditable){const destination=result.type==='action'&&['standard','reaction','free','exploration','downtime'].includes(category)?category:ITEM_PROFILES[result.type].category;const [item]=await this.actor.createEmbeddedDocuments("Item",[{name:result.name,type:result.type,system:{category:destination,details:destination==='techniques'&&itemCategory(this.actor.items.get(target.dataset.powerId)??{})==='powers'?{powerId:target.dataset.powerId}:{}}}]);await item.sheet.render({force:true});}
  }
  static async removeEntry(event,target){
    if(!this.isEditable)return;const item=this.actor.items.get(target.dataset.itemId);if(!item)return;
    const yes=await DialogV2.confirm({window:{title:'Remover registro'},content:'<p>Remover '+escapeHtml(item.name)+' desta ficha?</p>'});
    if(yes&&this.isEditable)await item.delete();
  }
  static async toggleEquipped(event,target){if(!this.isEditable)return;const item=this.actor.items.get(target.dataset.itemId);if(item)await item.update({'system.equipped':!item.system.equipped});}
  static async editEntry(event,target){
    const item=this.actor.items.get(target.dataset.itemId);
    if(!item)return;
    await item.sheet.render({force:true});
  }
  static async changeQuantity(event,target){
    if(!this.isEditable)return;
    const item=this.actor.items.get(target.dataset.itemId);
    if(item)await item.update({"system.quantity":Math.max(0,item.system.quantity+Number(target.dataset.delta))});
  }
  static async browseEntries(event,target){await new SnsCatalog({actor:this.actor,category:target.dataset.category??'',powerId:target.dataset.powerId??''}).render({force:true});}
  static async editMoney(){
    if(!game.user.isGM)return;
    const result=await DialogV2.prompt({classes:["sns-editor-dialog"],window:{title:"Saldo de Ryo · mestre"},content:'<label>Saldo conhecido<input type="number" min="0" step="1" name="value" value="'+(this.actor.system.finances.ryo ?? "")+'"></label><p>Em branco: saldo ainda não informado.</p>',
      ok:{label:"Salvar",callback:(event,button)=>({value:button.form.elements.value.value===""?null:Number(button.form.elements.value.value)})}});
    if(result&&game.user.isGM)await this.actor.update({"system.finances.ryo":result.value});
  }
  static async showEvolution(){if(this.isEditable)return ShinobiSheet.creationGuide.call(this);await new SnsEvolutionDialog(this).render({force:true});}
  static async editAttributes(){if(!this.isEditable)return;await this.submit();await new SnsStatEditor(this.actor).render({force:true});}
  static async editCombat() {
    if (!this.isEditable) return;
    await this.submit();
    const canEditBases=game.user.isGM || this.actor.system.phase!=="evolution";
    const content = COMBAT.map(([k,label])=>{
      const m=this.actor.system.modifiers[k];
      return '<fieldset><legend>'+escapeHtml(label)+'</legend><div class="sns-edit-grid"><label>Base<input name="base_'+k+'" type="number" min="0" step="1" value="'+this.actor.system.bases[k]+'" '+(canEditBases?'':'disabled')+'></label><label>Bônus de precisão<input name="bonus_'+k+'" type="number" step="1" value="'+m.value+'"></label><label>Origem<input name="origin_'+k+'" value="'+escapeHtml(m.origin)+'"></label></div></fieldset>';
    }).join('')+'<p>Bases de criação: total 12, transferência de até 2 pontos. Depois de fixadas, alteração depende do mestre. Bônus contextuais de ataque continuam no diálogo da rolagem.</p>';
    const result = await DialogV2.prompt({classes:["sns-editor-dialog"],
      window: { title: "Habilidades de combate · bases e ajustes" },position:{width:600},content,
      ok: { label: "Salvar", callback: (event, button) => {
        const data={},f=button.form.elements;
        for(const [k] of COMBAT){
          const base=Number(f['base_'+k].value),bonus=Number(f['bonus_'+k].value),origin=f['origin_'+k].value.trim();
          if(!Number.isInteger(base)||base<0||!Number.isInteger(bonus)||bonus&&!origin)throw new Error('Informe valores inteiros e a origem de cada bônus.');
          if(canEditBases)data['system.bases.'+k]=base;
          data['system.modifiers.'+k+'.value']=bonus;data['system.modifiers.'+k+'.origin']=origin;
        }
        return data;
      } }
    });
    if (result && this.isEditable) await this.actor.update(result);
  }
  static async editAuxiliary(){
    if(!this.isEditable)return;
    await this.submit();
    const keys=[['movement','Deslocamento'],['initiative','Iniciativa']];
    const content=keys.map(([k,label])=>{const m=this.actor.system.modifiers[k];return '<fieldset><legend>'+label+'</legend><label>Bônus<input name="bonus_'+k+'" type="number" step="1" value="'+m.value+'"></label><label>Origem<input name="origin_'+k+'" value="'+escapeHtml(m.origin)+'"></label></fieldset>';}).join('');
    const result=await DialogV2.prompt({classes:["sns-editor-dialog"],window:{title:'Deslocamento e iniciativa · ajustes'},content,
      ok:{label:'Salvar',callback:(event,button)=>{const data={},f=button.form.elements;for(const [k] of keys){const n=Number(f['bonus_'+k].value),origin=f['origin_'+k].value.trim();if(!Number.isInteger(n)||n&&!origin)throw new Error('Informe bônus inteiro e sua origem.');data['system.modifiers.'+k+'.value']=n;data['system.modifiers.'+k+'.origin']=origin;}return data;}}});
    if(result&&this.isEditable)await this.actor.update(result);
  }
  static async grant() {
    if (!game.user.isGM || !this.isEditable) return;
    const result = await DialogV2.prompt({classes:["sns-editor-dialog"],
      window: { title: "Conceder pontos · mestre" },
      content: '<label>Categoria<select name="category"><option value="attributes">Atributos</option><option value="skills">Perícias</option><option value="powers">Poderes</option><option value="social">Sociais</option></select></label><label>Quantidade<input name="amount" type="number" min="1" step="1" value="1"></label><label>Motivo<input name="note" required></label>',
      ok: { label: "Registrar concessão", callback: (event, button) => {
        const f = button.form.elements, amount = Number(f.amount.value), note = f.note.value.trim();
        if (!Number.isInteger(amount) || amount < 1 || !note) throw new Error("Informe quantidade positiva e motivo.");
        return { id: foundry.utils.randomID(), category: f.category.value, amount, note };
      } }
    });
    if (result && game.user.isGM) await this.actor.update({ "system.budgets.grants": [...this.actor.system.budgets.grants, result] });
  }
  static async rollTest(event, target) {
    if (!this.actor.isOwner) return;
    try {
      if(this.isEditable)await this.submit();
      const key = target.dataset.roll;
      const blocked=illusionActionBlock(this.actor,{attack:['cc','cd'].includes(key),key});if(blocked)return ui.notifications.warn(blocked);
      const initial = testSpec(this.actor.system, key);
      const entry=target.dataset.itemId?this.actor.items.get(target.dataset.itemId):null;
      if(entry&&itemCategory(entry)==='weapons'&&!weaponChecks(entry,Object.fromEntries(Object.entries(this.actor.system.derived.combat).map(([key,value])=>[key,value.precision])),this.actor.system.toObject(),this.actor.items).some(c=>c.key===key&&c.available))return ui.notifications.warn('Confira a forma de ataque, a quantidade e se a arma está em uso.');
      const capturedTargets=Array.from(game.user.targets??[]);
      const name=entry?entry.name+' · '+initial.name:undefined;
      const show=game.user.getFlag('sns-v14-dev','showCheckDialogs')!==false;
      const source=this.actor.system.toObject(),effects=characteristicEffects(this.actor);
      const rows=entry&&itemCategory(entry)==='weapons'?weaponCheckComponents(source,key,entry,this.actor.items):checkComponents(source,key,effects);
      const result=show||event.shiftKey||senseContext(this.actor,key).required ? await SnsCheckDialog.prompt(this.actor,key,name,rows) :
        {spec:resolveCheck(source,key,rows,effects),messageMode:game.settings.get('core','messageMode')};
      if (!result || !this.actor.isOwner) return;
      const spec = result.spec;
      if(name)spec.name=name;
      const profile=weaponDamageProfile(this.actor,entry,key),defenseRequestUuid=await declareDefenses(this.actor,entry,profile,capturedTargets);
      if(defenseRequestUuid===null)return;
      const roll = new foundry.dice.Roll(spec.formula);
      await roll.evaluate();
      const damageUse=damageSnapshot(this.actor,entry,profile,capturedTargets,roll,spec);if(damageUse&&defenseRequestUuid)damageUse.defenseRequestUuid=defenseRequestUuid;
      const natural = roll.dice[0].results.filter(r => r.active !== false).reduce((a, r) => a + r.result, 0);
      await roll.toMessage({
        speaker: foundry.documents.ChatMessage.getSpeaker({ actor: this.actor }),
        flavor:checkFlavor(spec,{traits:attackTraitLabels(entry)}),flags:{'sns-v14-dev':{...(damageUse?{damageUse}:{}),check:{actorImg:this.actor.img,key:spec.key,natural}}}
      }, { messageMode: result.messageMode });
    } catch (error) { ui.notifications.error(error.message); }
  }
}
