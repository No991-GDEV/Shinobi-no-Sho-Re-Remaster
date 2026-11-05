import {initialResourcePatch} from './initial-resources.mjs';
// Shared creation/evolution guide. D145 lets the owner use the published table
// and finish without GM approval; extra grants and rule overrides stay GM tools.
// Inline choices use shared calculations and retain current resources and items.
import { SnsHandlebarsApplicationMixin } from "./view-state.mjs";
import {guideView,guideRequirements} from './guide-validation.mjs';
import {standardProgressionUpdate,progressionHistory} from './progression-policy.mjs';
import {INITIAL_POINT_LABELS} from './initial-grants.mjs';
import {EVOLUTION} from './rules.mjs';
import { CREATION_STEPS, creationWizardState, isCreationStepId } from "./creation-wizard-state.mjs";
import { SnsEvolutionDialog } from "./evolution-dialog.mjs";
import {ATTRIBUTES} from './kernel.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {inlineStatPatch,inlineInteger,checkInlineBaseline,creationCombatBases} from './creation-inline.mjs';
import { SnsCatalog } from "./catalog.mjs";
import { SnsPowerDialog } from "./power-dialog.mjs";
import { SnsPowerProgression } from "./power-progression.mjs";
import { SnsJutsuBuilder } from "./jutsu-builder.mjs";
import { canControlTransformation } from "./transformation-core.mjs";
import { configureAcquisition } from "./acquisition-ui.mjs";

const { ApplicationV2 } = foundry.applications.api;

const SKILL_SEARCH_SELECTOR = "[data-creation-skill-search]";

export class SnsCreationWizard extends SnsHandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["sns-editor-dialog", "sns-creation-wizard"],
    position: { width: 760, height: 650 },
    window: { title: "Criar personagem", resizable: true },
    actions: {
      chooseStep: SnsCreationWizard.chooseStep,
      applyProgression:SnsCreationWizard.applyProgression,
      openEvolution: SnsCreationWizard.openEvolution,
      openCatalog: SnsCreationWizard.openCatalog,
      stepInline: SnsCreationWizard.stepInline,
      saveCombatBases:SnsCreationWizard.saveCombatBases,
      openPowerDialog: SnsCreationWizard.openPowerDialog,
      editAcquisition: SnsCreationWizard.editAcquisition,removeChoice:SnsCreationWizard.removeChoice,
      openProgression: SnsCreationWizard.openProgression,
      openJutsuBuilder: SnsCreationWizard.openJutsuBuilder,
      conclude: SnsCreationWizard.conclude
    }
  };
  static PARTS = { wizard: { scrollable: ["", ".creation-panel-body"], template: "systems/sns-v14-dev/templates/creation-wizard.hbs" } };

  constructor(actor,{mode='creation'}={}) {
    if (!actor || typeof actor !== "object") throw new Error("SnsCreationWizard exige um ator.");
    super();
    this.actor = actor;
    this.mode=mode==='evolution'?'evolution':'creation';
    this.justConcluded=false;
    this.baseNc=actor.system.nc;
    this.targetNc=this.mode==='evolution'?Math.min(20,this.baseNc+1):this.baseNc;
    this.skillFilter = "";
    this._hooks = [];
    this._rerenderTimer = null;
    this._inlineQueue=Promise.resolve();
    this._inlineSaving=false;
  }

  get guideFlags() {
    return this.actor.getFlag?.("sns-v14-dev", this.flagKey) ?? this.actor.flags?.["sns-v14-dev"]?.[this.flagKey] ?? {};
  }
  get flagKey(){return this.mode==='evolution'?'evolutionGuide':'creationGuide';}

  _owned() {
    return !!this.actor?.isOwner && canControlTransformation(this.actor);
  }

  _inCreation() {
    return this.actor?.system?.phase === "creation";
  }
  _canAllocate(){return this.mode==='evolution'?this.actor.system.phase==='evolution'&&this.guideFlags.nc===this.actor.system.nc&&!this.guideFlags.completed:this._inCreation();}

  // sheetView real com papel de usuário atual + requisitos conhecidos por item.
  currentView() {
    return guideView(this.actor,{isGM:game.user.isGM});
  }

  reviewRequirements(view) {
    return guideRequirements(this.actor,view);
  }

  currentStepId() {
    if(this.mode==='evolution'&&(this.guideFlags.nc!==this.actor.system.nc||this.guideFlags.completed))return this.justConcluded?'review':'points';
    const id = this.guideFlags.step;
    return isCreationStepId(id) ? id : "points";
  }

  async _prepareContext() {
    const view = this.currentView();
    const state = creationWizardState(view, this.currentStepId(), this.guideFlags);
    const evolution=this.mode==='evolution';
    if(evolution){
      state.completed=this.guideFlags.nc===view.source.nc&&!!this.guideFlags.completed&&state.ready.value;
      state.canConclude=this._canAllocate()&&state.ready.value;
      state.steps=state.steps.map(s=>({...s,label:s.id==='points'?'NC e novos pontos':s.id==='jutsus'?'Jutsus':s.label}));
      if(!this._canAllocate())state.steps=state.steps.map(s=>({...s,disabled:s.id!=='points'}));
    }
    const editable=this._owned()&&this._canAllocate();
    let pointProposal=[],pointError='',pointPreview=null;
    try{pointPreview=standardProgressionUpdate(view.source,this.targetNc);pointProposal=pointPreview.changes;}catch(error){pointError=error.message;}
    const attributes=ATTRIBUTES.map(([key,abbr,label])=>({key,abbr,label,value:view.source.attributes?.[key]??0,social:['car','man'].includes(key)}));
    for(const skill of state.data.skills??[]){
      skill.precision=view.d.skills[skill.key]?.precision;
      skill.canIncrease=editable&&(game.user.isGM||skill.bought<(view.d.evolution?.limite_poder_pericia??0));
    }
    if (Array.isArray(state.data.skills)) {
      const query = this.skillFilter.trim().toLowerCase();
      if (query)
        state.data.skills = state.data.skills.filter(s =>
          s.name.toLowerCase().includes(query) || String(s.key ?? "").toLowerCase().includes(query));
    }
    return {
      actor: { name: this.actor.name, img: this.actor.img },
      state,
      isGM: game.user.isGM,
      editable,
      canProgress:!pointError&&this._owned()&&(evolution?view.source.phase==='evolution':this._inCreation()),evolution,
      title:evolution?'Evoluir personagem':'Criar personagem',nc:view.source.nc,
      ncChoices:EVOLUTION.map(r=>({nc:r.nc,selected:r.nc===this.targetNc})),
      pointProposal,pointError,lowering:pointPreview?.lowering,changingNc:this.targetNc!==view.source.nc,
      attributeRows:attributes.filter(a=>!a.social),socialRows:attributes.filter(a=>a.social),
      vitalityMax:view.d.vitalityMax,chakraMax:view.d.chakraMax,initialResources:!evolution&&(view.source.resources.vitality.value===null||view.source.resources.chakra.value===null),
      skillLimit:view.d.evolution?.limite_poder_pericia,
      canEditBases:this._owned()&&this._inCreation(),combatBases:[['cc','Corpo a corpo'],['cd','À distância'],['esq','Esquiva'],['lm','Ler movimento']].map(([key,label])=>({key,label,base:view.source.bases?.[key]??3,total:view.d.combat[key].precision})),
      attributeWarnings:(view.issues??[]).filter(issue=>ATTRIBUTES.some(([,abbr])=>issue.startsWith(abbr+':'))||issue.startsWith('Atributo social')),
      ryo: view.ryo ?? view.source?.finances?.ryo ?? null
    };
  }

  // ===== Hooks (filtrados pelo mesmo ator; removidos ao fechar) =====

  attachHooks() {
    if (this._hooks.length) return;
    const target = this.actor;
    const sameActor = parent => parent === target || !!target?.uuid && parent?.uuid === target.uuid;
    const isGuideFlagChange = change => {
      const keys=Object.keys(change??{});
      if(keys.length!==1)return false;
      const flag='flags.sns-v14-dev.'+this.flagKey;
      if(keys[0]===flag||keys[0].startsWith(flag+'.'))return true;
      const namespaces=Object.keys(change.flags??{});
      return keys[0]==='flags'&&namespaces.length===1&&namespaces[0]==='sns-v14-dev'&&Object.keys(change.flags['sns-v14-dev']??{}).every(k=>k===this.flagKey);
    };
    const refresh = () => {
      if (!this.rendered || !this.actor) return;
      if(this._inlineSaving)return;
      if (!this._owned()) { void this.close(); return; }
      this.scheduleRerender();
    };
    const listeners = [
      ["updateActor", (doc, change) => {
        if (!sameActor(doc)) return;
        if (isGuideFlagChange(change)) return; // progresso do guia não re-renderiza
        refresh();
      }],
      ["createItem", item => { if (sameActor(item?.parent)) refresh(); }],
      ["updateItem", (item, change) => { if (sameActor(item?.parent) && !isGuideFlagChange(change)) refresh(); }],
      ["deleteItem", item => { if (sameActor(item?.parent)) refresh(); }]
    ];
    for (const [name, fn] of listeners) {
      const listener = (...args) => { try { fn(...args); } catch { /* hook nunca derruba o guia */ } };
      Hooks.on(name, listener);
      this._hooks.push([name, listener]);
    }
  }

  detachHooks() {
    for (const [name, listener] of this._hooks) Hooks.off(name, listener);
    this._hooks = [];
  }

  scheduleRerender() {
    if (this._rerenderTimer) return;
    this._rerenderTimer = setTimeout(() => {
      this._rerenderTimer = null;
      if (!this.rendered || !this.actor || this._inlineSaving) return;
      this.render({ force: true }).catch(() => {});
    }, 60);
  }

  // Anexar a cada render (idempotente) permite reabrir a MESMA instância.
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.attachHooks();
    if(this.window?.title)this.window.title.textContent=this.mode==='evolution'?'Evoluir personagem':'Criar personagem';
    this.element.querySelector('[name="guideNc"]')?.addEventListener('change',async event=>{if(!this._owned())return;this.targetNc=Number(event.currentTarget.value);await this.render({force:true});});
    this.element.querySelectorAll('[data-inline-kind]').forEach(input=>{
      const commit=()=>{
        if(input.value===input.dataset.baseline||input.value===input.dataset.submittedValue)return;
        input.dataset.submittedValue=input.value;
        const {inlineKind:kind,inlineKey:key,baseline:expected}=input.dataset;
        void this.saveInline({kind,key,value:input.value,expected});
      };
      input.addEventListener('change',commit);
      input.addEventListener('blur',commit);
      input.addEventListener('keydown',event=>{
        if(event.key==='Enter'){event.preventDefault();commit();input.blur();}
        if(event.key==='Escape'){event.preventDefault();input.value=input.dataset.baseline;input.blur();}
      });
    });
    // Busca de perícias: ligada em CADA render da etapa (navegar de Pontos
    // para Perícias também conecta), com render real dos resultados e foco
    // restaurado no campo após o re-render.
    const search = this.element.querySelector(SKILL_SEARCH_SELECTOR);
    if (search) {
      search.value = this.skillFilter;
      search.addEventListener("input", async () => {
        this.skillFilter = search.value ?? "";
        await this.render({ force: true });
        const next = this.element.querySelector(SKILL_SEARCH_SELECTOR);
        if (next) { next.focus(); next.setSelectionRange(next.value.length, next.value.length); }
      });
    }
  }

  async close(options = {}) {
    this.detachHooks();
    if (this._rerenderTimer) { clearTimeout(this._rerenderTimer); this._rerenderTimer = null; }
    return super.close(options);
  }

  async _persistProgress(stepId) {
    if (!isCreationStepId(stepId) || !this._owned()) return;
    const flags = this.guideFlags;
    const progress = Math.max(flags.progress | 0, CREATION_STEPS.findIndex(s => s.id === stepId) + 1);
    await this.actor.setFlag("sns-v14-dev", this.flagKey, { ...flags, step: stepId, progress });
  }

  // ===== Actions =====

  static async chooseStep(event, target) {
    const stepId = target.dataset.step;
    if (!isCreationStepId(stepId)) return;
    if (!this._owned()) return;
    await this._inlineQueue;
    if(!this._owned())return;
    await this._persistProgress(stepId);
    this.skillFilter = "";
    await this.render({ force: true });
  }

  static async openEvolution() {
    if (!this._owned()) return;
    if (!this.actor.sheet) return ui.notifications.warn("A ficha precisa estar aberta para a evolução.");
    new SnsEvolutionDialog(this.actor.sheet).render({ force: true });
  }

  static async applyProgression(){
    await this._inlineQueue;
    if(!this._owned()||(this.mode==='evolution'?this.actor.system.phase!=='evolution':!this._inCreation())||this._applying)return;
    this._applying=true;
    try{
      if(this.actor.system.nc!==this.baseNc){this.baseNc=this.actor.system.nc;this.targetNc=this.baseNc;throw Error('O NC mudou na ficha. Confira a proposta atualizada.');}
      const source=this.actor.system.toObject?.()??this.actor.system,proposal=standardProgressionUpdate(source,this.targetNc);
      await this.actor.update({...proposal.update,...progressionHistory(this.actor,proposal,game.user.id),['flags.sns-v14-dev.'+this.flagKey]:{nc:this.targetNc,step:'attributes',progress:3,completed:false,added:proposal.added,startedBy:game.user.id}});
      this.baseNc=this.actor.system.nc;this.targetNc=this.baseNc;
    }catch(error){ui.notifications.warn(error.message);}
    finally{this._applying=false;await this.render({force:true});}
  }

  static async openCatalog(event, target) {
    if (!this._owned()) return;
    const category = String(target.dataset.category || "");
    const catalog = new SnsCatalog({ actor: this.actor, category });
    if (typeof catalog.load === "function") {
      try { await catalog.load(); } catch (error) { console.warn("SNS · catálogo indisponível", error); }
    }
    catalog.render({ force: true });
  }

  async saveInline(change){
    const save=async()=>{
      if(!this._owned()||!this._canAllocate())return;
      this._inlineSaving=true;
      try{
        const source=this.actor.system.toObject?.()??this.actor.system;
        const item=change.kind==='power'?this.actor.items.get(change.key):null;
        if(change.kind==='power'&&(!item||item.type!=='power'||item.parent!==this.actor))throw Error('Poder não encontrado na ficha.');
        const current=change.kind==='power'?item.system.level:change.kind==='attribute'?source.attributes?.[change.key]:source.skills?.[change.key]?.bought;
        const value=change.delta===undefined?change.value:current+change.delta;
        if(change.kind==='power'){
          const next=inlineInteger(value);checkInlineBaseline(current,change.expected);
          if(next!==current)await item.update({'system.level':next});
        }else{
          const patch=inlineStatPatch(source,{...change,value},{isGM:game.user.isGM,effects:characteristicEffects(this.actor)});
          if(Object.keys(patch).length)await this.actor.update(patch);
        }
      }catch(error){ui.notifications.warn(error.message);}
      finally{
        this._inlineSaving=false;
        if(this.rendered){
          const active=globalThis.document?.activeElement,inside=active&&this.element.contains?.(active);
          const focus=inside&&active.dataset?.inlineKind?{input:true,kind:active.dataset.inlineKind,key:active.dataset.inlineKey}:inside&&active.dataset?.action==='stepInline'?{kind:active.dataset.kind,key:active.dataset.key,delta:active.dataset.delta}:null;
          await this.render({force:true});
          if(focus){
            const selector=focus.input?'[data-inline-kind]':'[data-action="stepInline"]';
            const next=[...this.element.querySelectorAll(selector)].find(el=>focus.input?el.dataset.inlineKind===focus.kind&&el.dataset.inlineKey===focus.key:el.dataset.kind===focus.kind&&el.dataset.key===focus.key&&el.dataset.delta===focus.delta);
            next?.focus({preventScroll:true});
          }
        }
      }
    };
    this._inlineQueue=this._inlineQueue.then(save,save);
    return this._inlineQueue;
  }

  static async stepInline(event,target){
    const delta=Number(target.dataset.delta);
    if(![1,-1].includes(delta))return;
    await this.saveInline({kind:target.dataset.kind,key:target.dataset.key,delta});
  }
  static async saveCombatBases(){
    await this._inlineQueue;if(!this._owned()||!this._inCreation())return;
    const fields=[...this.element.querySelectorAll('[data-combat-base]')],current=this.actor.system.bases;
    try{for(const f of fields)checkInlineBaseline(current[f.dataset.combatBase],f.dataset.baseline);const values=Object.fromEntries(fields.map(f=>[f.dataset.combatBase,f.value]));await this.actor.update(creationCombatBases(this.actor.system,values));await this.render({force:true});}catch(e){ui.notifications.warn(e.message);}
  }

  static async openPowerDialog(event,target) {
    if (!this._owned()) return;
    const item=target?.dataset?.itemId?this.actor.items.get(target.dataset.itemId):null;
    if(target?.dataset?.itemId&&item?.type!=='power')return;
    new SnsPowerDialog(this.actor,item).render({ force: true });
  }

  static async removeChoice(event,target){
    await this._inlineQueue;if(!this._owned()||!this._canAllocate()||this._removing)return;
    const item=this.actor.items.get(target.dataset.itemId);if(!item||!['aptitudes','features'].includes(item.system.category||({aptitude:'aptitudes',feature:'features',clan:'features',hijutsu:'features',background:'features'}[item.type])))return;
    this._removing=true;try{await item.delete();await this.render({force:true});}catch(e){ui.notifications.warn(e.message);}finally{this._removing=false;}
  }

  static async editAcquisition(event,target) {
    if(!this._owned())return;
    await configureAcquisition(this.actor,target.dataset.itemId);
  }

  static async openProgression(event, target) {
    if (!this._owned()) return;
    const item = target.dataset.itemId ? this.actor.items.get?.(target.dataset.itemId) : null;
    if (!item) return ui.notifications.warn("Item não encontrado na ficha.");
    new SnsPowerProgression(item).render({ force: true });
  }

  static async openJutsuBuilder(event, target) {
    if (!this._owned()) return;
    const item = target.dataset.itemId ? this.actor.items.get?.(target.dataset.itemId) : null;
    if (item&&item.type!=='power') return;
    new SnsJutsuBuilder(this.actor, item).render({ force: true });
  }

  // Snapshot de confirmação: source INTEIRO (NC/fase/orçamentos/recursos/
  // modificadores/atributos/perícias) + system/flags de TODOS os itens
  // (nível, escolha, custo, requisitos). Mudança de qualquer um desses
  // durante o diálogo cancela a conclusão. Flags de navegação do ator ficam
  // fora porque source não as contém.
  static snapshot(view) {
    const actorDoc = view.actor;
    const items = typeof actorDoc?.items?.[Symbol.iterator] === "function"
      ? [...actorDoc.items].map(doc => [doc.id, doc.type, doc.system.toObject?.() ?? doc.system, doc.flags ?? {}])
      : (view.items ?? []).map(i => [i.id, i.category, i.level ?? null, null]);
    return JSON.stringify([view.source ?? null, items]);
  }

  // The owner completes the normal flow directly. No points or resources are
  // granted here; the actor also validates a player's creation phase change.
  static async conclude(){
    await this._inlineQueue;
    if(!this._owned()||!this._canAllocate()||this._concluding)return;
    const state=creationWizardState(this.currentView(),'review',this.guideFlags);
    if(!state.ready.value)return ui.notifications.warn('Confira os pontos e os requisitos antes de concluir.');
    this._concluding=true;
    try{
      if(!this._owned()||!this._canAllocate())return;
      const flags={...this.guideFlags,nc:this.actor.system.nc,completed:true,step:'review',user:game.user.id,completedAt:new Date().toISOString()};
      const initialPatch=initialResourcePatch(this.actor,this.currentView().d,{creation:!this.mode||this.mode==='creation',fill:!!this.element?.querySelector('[data-initial-resources]')?.checked});
      await this.actor.update({...initialPatch,...(!this.mode||this.mode==='creation'?{'system.phase':'evolution'}:{}),['flags.sns-v14-dev.'+this.flagKey]:flags});
      this.justConcluded=true;
      await this.render({force:true});
    }finally{this._concluding=false;}
  }
}
