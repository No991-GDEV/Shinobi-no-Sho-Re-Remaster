import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {ATTRIBUTES} from './kernel.mjs';
import {skillPreview,stepSkill,attributePreview} from './stat-editor-state.mjs';
import {signed} from './roll-components.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
const {ApplicationV2,HandlebarsApplicationMixin}=foundry.applications.api;
export class SnsStatEditor extends SnsHandlebarsApplicationMixin(ApplicationV2){
 static DEFAULT_OPTIONS={tag:'form',classes:['sns-check-dialog','sns-stat-editor'],position:{width:460,height:'auto'},window:{resizable:false},form:{handler:SnsStatEditor.save,closeOnSubmit:false,submitOnChange:false},actions:{step:SnsStatEditor.step,cancel:SnsStatEditor.cancel}};
 static PARTS={editor:{scrollable:[""],template:'systems/sns-v14-dev/templates/stat-editor.hbs'}};
 constructor(actor,key=null){super({position:{width:key?460:820},classes:['sns-check-dialog','sns-stat-editor',key?'sns-skill-editor':'sns-attributes-editor']});this.actor=actor;this.key=key;this.baseline=actor.system.toObject();this.draft=key?{bought:this.baseline.skills[key].bought,bonus:this.baseline.modifiers['skill_'+key].value,origin:this.baseline.modifiers['skill_'+key].origin}:{...this.baseline.attributes};}
 async _prepareContext(){
  const source=this.actor.system.toObject();
  if(this.key){const p=skillPreview(source,this.key,this.draft);return {appId:this.id,skillMode:true,name:p.skill.name,attribute:p.skill.attribute.toUpperCase(),draft:this.draft,...p,precision:signed(p.skill.precision),bonus:signed(this.draft.bonus),isGM:game.user.isGM,overLimit:this.draft.bought>p.limit,overspent:p.budget.balance<0};}
  const d=attributePreview(source,this.draft,characteristicEffects(this.actor));
  return {name:this.actor.name,img:this.actor.img,nc:source.nc,attributes:ATTRIBUTES.map(([key,abbr,label],i)=>({key,abbr,label,value:this.draft[key],social:i>6,canDown:this.draft[key]>0})),budget:d.budgets.attributes,socialBudget:d.budgets.social,vitalityMax:d.vitalityMax,chakraMax:d.chakraMax};
 }
 capture(){
  const f=this.element.elements;
  if(this.key)this.draft={bought:f.bought.value===''?NaN:Number(f.bought.value),bonus:f.bonus.value===''?NaN:Number(f.bonus.value),origin:f.origin.value};
  else for(const [key] of ATTRIBUTES)this.draft[key]=f[key].value===''?NaN:Number(f[key].value);
 }
 async _onRender(context,options){
  await super._onRender(context,options);this.window.title.textContent=this.key?context.name+' · editar perícia':'Atributos · distribuição';
  this.element.querySelectorAll('input').forEach(el=>el.addEventListener('change',async()=>{const previous=structuredClone(this.draft);try{this.capture();await this.render({force:true});}catch(e){this.draft=previous;ui.notifications.warn(e.message);await this.render({force:true});}}));
 }
 static async step(event,target){
  if(!this.actor.isOwner)return;
  try{this.capture();const delta=Number(target.dataset.delta);if(this.key)this.draft=stepSkill(this.actor.system.toObject(),this.key,this.draft,delta);else if([1,-1].includes(delta)&&ATTRIBUTES.some(([k])=>k===target.dataset.key))this.draft[target.dataset.key]=Math.max(0,this.draft[target.dataset.key]+delta);await this.render({force:true});}catch(e){ui.notifications.warn(e.message);}
 }
 static async cancel(){await this.close();}
 static async save(){
  if(!this.actor.isOwner)return ui.notifications.warn('Você não pode editar esta ficha.');
  try{
   this.capture();const current=this.actor.system.toObject(),patch={};
   const changed=(path,previous,next)=>{if(previous===next)return;const actual=foundry.utils.getProperty(current,path);if(actual!==previous)throw Error('Este valor foi alterado enquanto o editor estava aberto. Reabra o editor para continuar.');patch['system.'+path]=next;};
   if(this.key){const p=skillPreview(current,this.key,this.draft);if(!game.user.isGM&&this.draft.bought>Math.max(p.limit,this.baseline.skills[this.key].bought))throw Error('A compra excede o limite do NC.');changed('skills.'+this.key+'.bought',this.baseline.skills[this.key].bought,this.draft.bought);for(const [k,v] of [['value',this.draft.bonus],['origin',this.draft.origin]])changed('modifiers.skill_'+this.key+'.'+k,this.baseline.modifiers['skill_'+this.key][k],v);}
   else{attributePreview(current,this.draft);for(const [key] of ATTRIBUTES)changed('attributes.'+key,this.baseline.attributes[key],this.draft[key]);}
   if(Object.keys(patch).length)await this.actor.update(patch);await this.close();
  }catch(e){ui.notifications.warn(e.message);}
 }
}
