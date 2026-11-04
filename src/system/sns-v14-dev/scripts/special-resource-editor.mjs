import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {SPECIAL_RESOURCES,grantedResources,resolveSpecialResource,specialResourceChange,validateSpecialResourceRegistration} from './special-resources.mjs';
const {ApplicationV2,HandlebarsApplicationMixin}=foundry.applications.api;
export class SnsSpecialResourceEditor extends SnsHandlebarsApplicationMixin(ApplicationV2){
 static DEFAULT_OPTIONS={tag:'form',classes:['sns-check-dialog','sns-special-resource-editor'],position:{width:500,height:'auto'},window:{resizable:false},form:{handler:SnsSpecialResourceEditor.save,closeOnSubmit:false},actions:{cancel:SnsSpecialResourceEditor.cancel}};
 static PARTS={editor:{scrollable:[""],template:'systems/sns-v14-dev/templates/special-resource-editor.hbs'}};
 constructor(actor,id=''){super();this.actor=actor;this.baseline=JSON.stringify(actor.system.specialResources??[]);this.existing=actor.system.specialResources.find(r=>r.id===id);this.grant=grantedResources(actor).find(r=>r.id===id);this.draft=this.existing?foundry.utils.deepClone(this.existing):this.grant??{id:foundry.utils.randomID(),kind:'bijuu',sourceId:'',value:null,history:[]};this.value=this.draft.value;this.note='';this.confirmed=false;}
 async _prepareContext(){const rule=SPECIAL_RESOURCES[this.draft.kind];return {existing:!!(this.existing||this.grant),draft:{...this.draft,value:this.value},view:resolveSpecialResource(this.actor,this.draft),kinds:Object.entries(SPECIAL_RESOURCES).map(([value,r])=>({value,label:r.label,selected:value===this.draft.kind})),sources:this.actor.items.filter(i=>i.type===rule.type).map(i=>({id:i.id,name:i.name,selected:i.id===this.draft.sourceId})),note:this.note,confirmed:this.confirmed,history:[...(this.draft.history??[])].reverse(),appId:this.id};}
 async _onRender(context,options){await super._onRender(context,options);this.window.title.textContent=(this.existing||this.grant?'Ajustar':'Registrar')+' recurso especial · '+this.actor.name;for(const name of ['kind','sourceId'])this.element.elements[name]?.addEventListener('change',async()=>{this.capture();if(name==='kind')this.draft.sourceId='';await this.render({force:true});});}
 capture(){const f=this.element.elements;if(!this.existing&&!this.grant){this.draft.kind=f.kind.value;this.draft.sourceId=f.sourceId.value;}this.value=f.value.value===''?null:Number(f.value.value);this.note=f.note.value;this.confirmed=!!f.confirmed?.checked;}
 static async cancel(){await this.close();}
 static async save(){
  if(!this.actor.isOwner)return;
  try{this.capture();if(JSON.stringify(this.actor.system.specialResources??[])!==this.baseline)throw Error('Os recursos mudaram enquanto o editor estava aberto. Reabra para continuar.');
   if(!this.existing&&!this.grant&&!this.confirmed)throw Error('Confira a origem e os requisitos antes de registrar.');
   if(!this.existing)validateSpecialResourceRegistration(this.actor,this.draft);
   if(!game.user.isGM&&this.draft.kind==='vision'&&this.actor.items.get(this.draft.sourceId)?.system.contentId==='sns:legado:apt:mangekyo-sharingan')throw Error('Use Descanso Sharingan para recuperar a visão do Legado.');
   let row=specialResourceChange(this.actor,this.draft,this.value,this.note,{user:game.user.id,at:new Date().toISOString()});
   if(!this.existing&&!row.history.length)row={...row,history:[{from:null,to:null,note:this.note.trim()||'Registro da origem; valor atual desconhecido.',user:game.user.id,at:new Date().toISOString()}]};
   // Source deletion, level changes and permissions are checked again after the popup.
   if(!this.actor.isOwner)return;
   const updated=this.actor.system.specialResources.map(r=>r.id===row.id?row:r);if(!this.existing)updated.push(row);
   await this.actor.update({'system.specialResources':updated});await this.close();
  }catch(error){ui.notifications.warn(error.message);}
 }
}
