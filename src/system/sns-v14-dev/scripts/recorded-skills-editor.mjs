import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {SKILLS} from './rules.mjs';
import {recordedSkills,validateRecordedSkills} from './recorded-skills.mjs';
const {ApplicationV2,HandlebarsApplicationMixin}=foundry.applications.api;
export class SnsRecordedSkillsEditor extends SnsHandlebarsApplicationMixin(ApplicationV2){
 static DEFAULT_OPTIONS={tag:'form',classes:['sns-check-dialog','sns-recorded-skills-editor'],position:{width:570,height:'auto'},window:{resizable:false},form:{handler:SnsRecordedSkillsEditor.save,closeOnSubmit:false},actions:{step:SnsRecordedSkillsEditor.step,cancel:SnsRecordedSkillsEditor.cancel}};
 static PARTS={editor:{scrollable:["", ".recorded-skill-fields", ".legacy-skill-note"],template:'systems/sns-v14-dev/templates/recorded-skills-editor.hbs'}};
 constructor(actor){super();this.actor=actor;this.baseline=JSON.stringify({rows:actor.system.recordedSkills??[],configured:!!actor.system.recordedSkillsConfigured});this.draft=SKILLS.map(s=>({...s,...recordedSkills(actor.system).find(r=>r.key===s.key)}));}
 async _prepareContext(){return {rows:this.draft,legacy:this.actor.system.details.skills,appId:this.id};}
 async _onRender(context,options){await super._onRender(context,options);this.window.title.textContent='Perícias · '+this.actor.name;}
 capture(){for(const row of this.draft){const f=this.element.elements;row.untrained=f['untrained-'+row.key].checked;const value=f['precision-'+row.key].value;row.precision=value===''?null:Number(value);}}
 static async step(event,target){if(!this.actor.isOwner)return;this.capture();const row=this.draft.find(r=>r.key===target.dataset.key),delta=Number(target.dataset.delta);if(!row||![1,-1].includes(delta))return;row.untrained=false;row.precision=(row.precision??0)+delta;await this.render({force:true});}
 static async cancel(){await this.close();}
 static async save(){
  if(!this.actor.isOwner)return ui.notifications.warn('Você não pode editar esta ficha.');
  try{
   this.capture();const rows=validateRecordedSkills(this.draft.filter(r=>r.untrained||r.precision!==null));
   if(JSON.stringify({rows:this.actor.system.recordedSkills??[],configured:!!this.actor.system.recordedSkillsConfigured})!==this.baseline)throw Error('As perícias foram alteradas enquanto o editor estava aberto. Reabra para continuar.');
   await this.actor.update({'system.recordedSkills':rows,'system.recordedSkillsConfigured':true});await this.close();
  }catch(error){ui.notifications.warn(error.message);}
 }
}
