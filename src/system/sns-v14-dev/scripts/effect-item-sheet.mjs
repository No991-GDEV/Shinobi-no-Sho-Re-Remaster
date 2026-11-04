import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {EFFECT_TARGETS,effectBinding,validateEffectRules} from './effect-item-rules.mjs';
import {durationRule,durationLabel,durationFields,durationFromForm,durationClock,actorCombat,mountDurationFields} from './effect-duration.mjs';
import {temporaryEffects} from './temporary-effects.mjs';
import {endCondition} from './condition-application.mjs';
export class EffectItemSheet extends SnsHandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2){
 static DEFAULT_OPTIONS={classes:['sns-document','sns-effect-item-sheet'],position:{width:660,height:690},window:{resizable:true},form:{submitOnChange:false,closeOnSubmit:false},actions:{addRule:EffectItemSheet.addRule,removeRule:EffectItemSheet.removeRule,endEffect:EffectItemSheet.endEffect,openSource:EffectItemSheet.openSource,editDescription:EffectItemSheet.editDescription}};
 static PARTS={sheet:{scrollable:['','.sns-effect-editor-body'],template:'systems/sns-v14-dev/templates/effect-item.hbs'}};
 async _prepareContext(options){
  const item=this.item,source=item.system.toObject(),r=source.appliedCondition,b=effectBinding(item),flags=item.flags?.['sns-v14-dev']??{};
  const controlled=['legadoEffect','advancedState','advancedChild','environment','environmentMember','illusion','support','phantasm'].some(k=>flags[k]);
  const row=item.actor?temporaryEffects(item.actor).find(r=>r.id===item.id):null;
  return {...await super._prepareContext(options),item,source,record:r,editable:this.isEditable,isGM:game.user.isGM,bound:!!b,controlled,canTime:game.user.isGM&&!controlled,canStatus:game.user.isGM&&!controlled&&!b,canEnd:!!item.actor&&r.active&&item.actor.isOwner,sourceName:row?.sourceName||r.origin,summary:row?.displaySummary||b?.snapshot?.summary||'',durationLabel:durationLabel(r),durationFields:durationFields(r.durationRule),rules:(source.effectRules??[]).map((r,index)=>({...r,index,targets:EFFECT_TARGETS.map(t=>({...t,selected:t.id===r.target}))})),descriptionHTML:await foundry.applications.ux.TextEditor.enrichHTML(source.description,{relativeTo:item,secrets:false})};
 }
 async _onRender(context,options){await super._onRender(context,options);mountDurationFields(this.element);for(const b of this.element.querySelectorAll('prose-mirror button.toggle')){b.title='Editar descrição';b.setAttribute('aria-label','Editar descrição');}}
 _processFormData(event,form,formData){
  const data=super._processFormData(event,form,formData),r=this.item.system.appliedCondition;
  // Timing controls have no document paths; build only the explicit update below.
  for(const key of Object.keys(data))if(key.startsWith('duration')||key.startsWith('rule'))delete data[key];
  if(game.user.isGM){
   if(this.item.type==='effect'&&!r.managed)data['system.appliedCondition.managed']=true;
   data['system.effectRules']=validateEffectRules(Array.from(form.querySelectorAll('[data-effect-rule]')).map(el=>({target:el.querySelector('[data-rule-target]').value,value:Number(el.querySelector('[data-rule-value]').value)})));
   if(form.elements.durationMode){const rule=durationFromForm(form.elements);if(JSON.stringify(rule)!==JSON.stringify(durationRule(r.durationRule))){data['system.appliedCondition.durationRule']=rule;data['system.appliedCondition.durationClock']=durationClock(rule,actorCombat(this.item.actor),rule.anchor==='caster'?r.casterUuid:this.item.actor?.uuid);}}
  }
  return data;
 }
 static async addRule(){if(!game.user.isGM||!this.isEditable)return;await this.submit();await this.item.update({'system.effectRules':[...this.item.system.effectRules,{target:'cc',value:1}]});}
 static async removeRule(event,target){if(!game.user.isGM||!this.isEditable)return;await this.submit();await this.item.update({'system.effectRules':this.item.system.effectRules.filter((r,i)=>i!==Number(target.dataset.index))});}
 static async endEffect(){if(!this.item.actor?.isOwner)return;await this.submit();await endCondition(this.item.actor,this.item.id);await this.render({force:true});}
 static async openSource(){const uuid=this.item.system.appliedCondition.sourceUuid;if(!uuid)return;const source=await fromUuid(uuid);if(source?.testUserPermission(game.user,'OBSERVER'))await source.sheet.render({force:true});}
 static editDescription(){if(this.isEditable)this.element.querySelector('prose-mirror button.toggle')?.click();}
}
