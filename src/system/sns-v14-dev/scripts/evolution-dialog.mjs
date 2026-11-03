import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {sheetView} from './view.mjs';
import {EVOLUTION} from './rules.mjs';
import {initialPointProposal,initialGrants,INITIAL_POINT_LABELS} from './initial-grants.mjs';
import {standardProgressionUpdate,progressionHistory} from './progression-policy.mjs';
import {configureAcquisition} from './acquisition-ui.mjs';
const {ApplicationV2,HandlebarsApplicationMixin}=foundry.applications.api;
export class SnsEvolutionDialog extends SnsHandlebarsApplicationMixin(ApplicationV2){
  static DEFAULT_OPTIONS={tag:'form',classes:['sns-editor-dialog','sns-evolution-dialog'],position:{width:540,height:'auto'},window:{title:'Evolução do personagem'},
    form:{handler:SnsEvolutionDialog.save,submitOnChange:false,closeOnSubmit:false},actions:{acquisition:SnsEvolutionDialog.acquisition,reviewLegacy:SnsEvolutionDialog.reviewLegacy,nextNc:SnsEvolutionDialog.nextNc,grant:SnsEvolutionDialog.grant,initialPoints:SnsEvolutionDialog.initialPoints}};
  static PARTS={evolution:{scrollable:[""],template:'systems/sns-v14-dev/templates/evolution-dialog.hbs'}};
  constructor(sheet){super();this.sheet=sheet;this.actor=sheet.actor;this.baseNc=this.actor.system.nc;this.targetNc=this.baseNc;this.targetPhase=this.actor.system.phase;}
  capture(){const f=this.element.elements;if(this.actor.isOwner)this.targetNc=Number(f.nc.value);if(game.user.isGM)this.targetPhase=f.phase.value;}
  async _prepareContext(){
    const source=this.actor.system.toObject();let planned=null,pointError='';try{planned=standardProgressionUpdate(source,this.targetNc);}catch(error){pointError=error.message;}const proposal=planned?.changes??[];source.nc=this.targetNc;source.phase=this.targetPhase;if(planned)source.budgets.grants=planned.grants;
    const view=sheetView({name:this.actor.name,img:this.actor.img,items:this.actor.items,flags:this.actor.flags,system:source},{editable:this.actor.isOwner,isGM:game.user.isGM});
    return {...view,proposal,pointError,lowering:planned?.lowering,currentNc:this.actor.system.nc,nextAvailable:game.user.isGM&&this.targetNc<20,canInitialPoints:game.user.isGM&&this.actor.isOwner&&this.actor.system.phase==='creation'&&!this.actor.system.budgets.grants.length,ncChoices:EVOLUTION.map(r=>({nc:r.nc,selected:r.nc===this.targetNc})),reference:EVOLUTION.find(r=>r.nc===this.targetNc)};
  }
  async _onRender(context,options){await super._onRender(context,options);this.element.querySelector('[name=nc]').addEventListener('change',async()=>{this.capture();await this.render({force:true});});}
  static async nextNc(){if(!game.user.isGM||!this.actor.isOwner)return;this.capture();this.targetNc=Math.min(20,this.targetNc+1);await this.render({force:true});}
  static async acquisition(event,target){if(!this.actor.isOwner)return;this.capture();await configureAcquisition(this.actor,target.dataset.itemId);await this.render({force:true});}
  static async reviewLegacy(){
    if(!game.user.isGM||!this.actor.isOwner)return;this.capture();const view=sheetView(this.actor,{isGM:true});
    if(view.investment.pending.length>(view.investment.legacyPending?1:0))return ui.notifications.warn('Confira primeiro as aquisições pendentes dos itens.');
    const yes=await foundry.applications.api.DialogV2.confirm({window:{title:'Revisar PP anteriores'},content:'<p>Usar o total calculado dos itens: <strong>'+view.investment.computedSpent+' PP</strong>? O registro anterior de '+view.investment.legacySpent+' PP ficará no histórico, sem entrar no saldo.</p>'});
    if(yes&&game.user.isGM&&this.actor.isOwner){await this.actor.update({'system.budgets.investmentReviewed':true});await this.render({force:true});}
  }
  static async grant(){if(!game.user.isGM||!this.actor.isOwner)return;this.capture();await this.sheet.constructor.grant.call(this.sheet);await this.render({force:true});}
  static async initialPoints(){
    if(!game.user.isGM||!this.actor.isOwner||this.actor.system.phase!=='creation'||this.actor.system.budgets.grants.length)return;
    this.capture();if(this.targetNc!==this.actor.system.nc)return ui.notifications.warn('Salve o NC escolhido antes de definir os pontos iniciais.');const nc=this.actor.system.nc,proposal=initialPointProposal(nc);
    const content='<p>Referência da tabela vigente para NC '+nc+'. Ajuste os valores abaixo.</p><div class="initial-points-grid">'+Object.entries(INITIAL_POINT_LABELS).map(([key,label])=>'<label>'+label+'<input type="number" name="'+key+'" value="'+proposal[key]+'" min="0" step="1" required aria-label="Pontos iniciais de '+label.toLowerCase()+'"></label>').join('')+'</div><label>Motivo da concessão<input name="note" required value="Pontos iniciais · NC '+nc+'" aria-label="Motivo da concessão"></label><p>A concessão fica no histórico da ficha. Escolha poderes e aptidões nas etapas seguintes.</p>';
    const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog','sns-initial-points'],window:{title:'Conceder pontos iniciais'},position:{width:480},content,ok:{label:'Conceder pontos',callback:(event,button)=>{const f=button.form.elements;return initialGrants(Object.fromEntries(Object.keys(INITIAL_POINT_LABELS).map(key=>[key,Number(f[key].value)])),f.note.value);}}});
    if(!result||!game.user.isGM||!this.actor.isOwner)return;
    if(this.actor.system.nc!==nc||this.actor.system.phase!=='creation'||this.actor.system.budgets.grants.length)return ui.notifications.warn('A ficha mudou. Abra a distribuição novamente.');
    await this.actor.update({'system.budgets.grants':result});await this.render({force:true});
  }
  static async save(){
    if(!this.actor.isOwner)return;this.capture();
    if(this.actor.system.nc!==this.baseNc)return ui.notifications.warn('O NC mudou na ficha. Reabra a evolução.');
    const source=this.actor.system.toObject(),proposal=standardProgressionUpdate(source,this.targetNc),phase=game.user.isGM?this.targetPhase:source.phase;
    await this.actor.update({...proposal.update,...progressionHistory(this.actor,proposal,game.user.id),'system.phase':phase,...(phase==='evolution'?{'flags.sns-v14-dev.evolutionGuide':{nc:this.targetNc,step:'attributes',completed:false,added:proposal.added}}:{})});
    await this.close();
    const {SnsCreationWizard}=await import('./creation-wizard.mjs');
    await new SnsCreationWizard(this.actor,{mode:phase==='evolution'?'evolution':'creation'}).render({force:true});
  }
}
