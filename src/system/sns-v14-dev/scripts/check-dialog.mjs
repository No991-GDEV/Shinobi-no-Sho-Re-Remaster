import {acuityAvailable,acuityRows} from './weapon-checks.mjs';
import {minionTestPolicy} from './npc-minion-policy.mjs';
import {recordedTransformationRows} from './transformation-core.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {conditionCheckRows,effectsForEscape} from './condition-effects.mjs';
import {senseContext} from './magen-core.mjs';
import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import { checkComponents,resolveCheck,resolveRecordedCheck,signed,COMPONENT_TYPES } from './roll-components.mjs';
const {ApplicationV2,HandlebarsApplicationMixin}=foundry.applications.api;

export class SnsCheckDialog extends SnsHandlebarsApplicationMixin(ApplicationV2){
  static DEFAULT_OPTIONS={tag:'form',classes:['sns-check-dialog'],position:{width:420,height:'auto'},window:{resizable:false},
    form:{handler:SnsCheckDialog.submitCheck,closeOnSubmit:false,submitOnChange:false},actions:{addModifier:SnsCheckDialog.addModifier}};
  static PARTS={check:{scrollable:[""],template:'systems/sns-v14-dev/templates/check-dialog.hbs'}};
  constructor(actor,key,recorded=null){
    super();this.source=actor.system.toObject();this.key=key;this.recorded=recorded;this.effects=characteristicEffects(actor);this.rows=recorded?[{id:'recorded',label:'Precisão',value:recorded.precision,type:'base',enabled:true}]:checkComponents(this.source,key,this.effects);this.rows=conditionCheckRows(recorded?recordedTransformationRows(this.rows,this.effects,key,this.source):this.rows,this.effects,key);
    if(recorded&&Number.isInteger(recorded.techniqueAdjustment)&&recorded.techniqueAdjustment!==0)this.rows=conditionCheckRows([...this.rows,{id:'technique-rule',label:recorded.techniqueLabel||'Regra da técnica',value:recorded.techniqueAdjustment,type:'technique',enabled:true}],this.effects,key);
    this.messageMode=game.settings.get('core','messageMode');this.showDefault=game.user.getFlag('sns-v14-dev','showCheckDialogs')!==false;
    this.escapeConditionId='';this.actor=actor;this.sense='neutral';
    this.result=new Promise(resolve=>this.resolveResult=resolve);
  }
  static async prompt(actor,key,name,rows=null,{allowAcuity=false}={}){const app=new this(actor,key);app.labelOverride=name;app.canChooseAcuity=allowAcuity&&key==='cc'&&acuityAvailable(app.source,actor.items);app.meleeAttribute='for';if(rows)app.rows=conditionCheckRows(rows,app.effects,key);await app.render({force:true});return app.result;}
  static async promptRecorded(actor,spec,rows=null){const app=new this(actor,spec.key,spec);if(rows)app.rows=conditionCheckRows(rows,app.effects,spec.key);await app.render({force:true});return app.result;}
  testEffects(){return effectsForEscape(this.effects,this.escapeConditionId);}
  getSpec(){const context=senseContext(this.actor,this.key,this.sense),effects=[...this.testEffects(),...context.effects],base=this.canChooseAcuity&&this.meleeAttribute==='des'?acuityRows(this.source,this.rows,effects):this.rows,rows=conditionCheckRows(base,effects,this.key),spec=this.recorded?resolveRecordedCheck(this.recorded,rows):resolveCheck(this.source,this.key,rows,effects);return {...spec,...minionTestPolicy(this.actor,this.key),...(this.labelOverride?{name:this.labelOverride}:{}),blocked:context.blocked};}
  async _prepareContext(){
    const spec=this.getSpec();
    return {canChooseAcuity:this.canChooseAcuity,usesDex:this.meleeAttribute==='des',senseRequired:senseContext(this.actor,this.key).required,senses:[['neutral','Outro / sem uso do sentido afetado'],['vision','Visual'],['hearing','Auditivo'],['smell','Olfativo']].map(([id,name])=>({id,name,selected:this.sense===id})),senseBlocked:spec.blocked,hasConditions:this.effects.some(e=>e.kind==='condition'&&!!e.key),escapeNoneSelected:!this.escapeConditionId,conditionOptions:this.effects.filter(e=>e.kind==='condition'&&!!e.key).map(e=>({id:e.sourceId,name:e.sourceName,selected:e.sourceId===this.escapeConditionId})),name:spec.name,formula:spec.formula,total:signed(spec.precision+spec.adjustment),die:spec.die,
      rows:spec.components.map(r=>({...r,signed:signed(r.value),typeLabel:COMPONENT_TYPES[r.type]})),
      messageModes:Object.entries(CONFIG.ChatMessage.modes).map(([value,m])=>({value,label:game.i18n.localize(m.label),selected:value===this.messageMode})),showDefault:this.showDefault};
  }
  async _onRender(context,options){
    await super._onRender(context,options);
    this.window.title.textContent=context.name+' · teste';
    this.element.querySelector('[name=meleeAttribute]')?.addEventListener('change',async e=>{this.captureOptions();this.meleeAttribute=e.target.value==='des'?'des':'for';await this.render({force:true});});
    this.element.querySelector('[name=sense]')?.addEventListener('change',async event=>{this.captureOptions();this.sense=event.target.value;await this.render({force:true});});
    this.element.querySelector('[name=escapeCondition]')?.addEventListener('change',async event=>{
      this.captureOptions();const id=event.target.value;this.escapeConditionId=this.effects.some(e=>e.kind==='condition'&&e.sourceId===id)?id:'';
      this.rows=conditionCheckRows(this.rows,this.testEffects(),this.key);await this.render({force:true});
    });
    this.element.querySelectorAll('[data-component]').forEach(input=>input.addEventListener('change',async()=>{
      this.captureOptions();this.rows.find(r=>r.id===input.dataset.component).enabled=input.checked;await this.render({force:true});
    }));
    this.element.querySelector('[name=messageMode]').addEventListener('change',()=>this.captureOptions());
    this.element.querySelector('[name=showDefault]').addEventListener('change',async()=>{
      this.captureOptions();await game.user.setFlag('sns-v14-dev','showCheckDialogs',this.showDefault);
    });
  }
  captureOptions(){
    this.messageMode=this.element.querySelector('[name=messageMode]').value;
    this.showDefault=this.element.querySelector('[name=showDefault]').checked;
  }
  static async addModifier(){
    const f=this.element.elements,label=f.modifierName.value.trim(),value=Number(f.modifierValue.value),type=f.modifierType.value;
    if(!label||!Number.isInteger(value)||value===0)return ui.notifications.warn('Informe o nome e um valor inteiro diferente de zero.');
    if(!['context','technique','equipment'].includes(type))return;
    this.captureOptions();this.rows.push({id:foundry.utils.randomID(),label,type,value,enabled:true});await this.render({force:true});
  }
  static async submitCheck(){
    if(this.canChooseAcuity&&this.meleeAttribute==='des'&&!acuityAvailable(this.actor.system,this.actor.items))return ui.notifications.warn('Acuidade não está mais disponível.');
    if(this.getSpec().blocked)return ui.notifications.warn(this.getSpec().blocked);
    this.captureOptions();if(!Object.hasOwn(CONFIG.ChatMessage.modes,this.messageMode))throw new Error('Visibilidade inválida.');
    this.resolveResult({spec:this.getSpec(),messageMode:this.messageMode});this.resolveResult=null;await this.close();
  }
  async _onClose(options){this.resolveResult?.(null);this.resolveResult=null;await super._onClose(options);}
}
