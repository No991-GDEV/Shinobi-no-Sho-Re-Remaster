import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {ATTRIBUTES} from './kernel.mjs';
import {POWER_ORIGINS,POWER_FORMS} from './power-groups.mjs';
import {POWER_DEFINITIONS} from '../data/power-definitions.mjs';
const {ApplicationV2,HandlebarsApplicationMixin}=foundry.applications.api;
export class SnsPowerDialog extends SnsHandlebarsApplicationMixin(ApplicationV2){
 static DEFAULT_OPTIONS={tag:'form',classes:['sns-editor-dialog','sns-power-dialog'],position:{width:430,height:'auto'},window:{title:'Adicionar poder'},form:{handler:SnsPowerDialog.save,submitOnChange:false,closeOnSubmit:false}};
 static PARTS={power:{scrollable:[""],template:'systems/sns-v14-dev/templates/power-dialog.hbs'}};
 constructor(actor,item=null){super();this.actor=actor;this.item=item;}
 async _prepareContext(){const s=this.item?.system,d=s?.details??{};return {canConfigureRules:game.user.isGM||!this.item,name:this.item?.name??'',level:s?.level??0,limit:Math.floor(this.actor.system.nc/2),nature:d.nature??'',definitions:POWER_DEFINITIONS.map(p=>({id:p.id,name:p.name,selected:p.id===s?.power.definitionId})),origins:[...(this.item&&!d.powerOrigin?[{value:'',label:'A definir',selected:true}]:[]),...Object.entries(POWER_ORIGINS).map(([value,label])=>({value,label,selected:value===(d.powerOrigin||(!this.item?'common':''))}))],forms:Object.entries(POWER_FORMS).map(([value,label])=>({value,label,selected:value===(d.organization||'effects')})),attributes:ATTRIBUTES.map(([value,label])=>({value,label,selected:value===d.keyAttribute})),editing:!!this.item};}
 async _onRender(context,options){await super._onRender(context,options);this.window.title.textContent=context.editing?'Configurar poder':'Adicionar poder';}
 static async save(){
  if(!this.actor.isOwner)return;const f=this.element.elements,name=f.name.value.trim(),level=Number(f.level.value),powerOrigin=this.item&&!game.user.isGM?this.item.system.details.powerOrigin:f.powerOrigin.value,organization=f.organization.value,keyAttribute=f.keyAttribute.value;
  if(!name||!Number.isInteger(level)||level<0||!(Object.hasOwn(POWER_ORIGINS,powerOrigin)||this.item&&!game.user.isGM&&!powerOrigin)||!Object.hasOwn(POWER_FORMS,organization)||keyAttribute&&!ATTRIBUTES.some(([k])=>k===keyAttribute))return ui.notifications.warn('Confira nome, nível e opções do poder.');
  if(this.item&&this.item.parent!==this.actor)return;
  const definitionId=this.item&&!game.user.isGM?this.item.system.power.definitionId:f.definitionId.value;if(definitionId&&!POWER_DEFINITIONS.some(p=>p.id===definitionId))return;
  const patch={name,'system.level':level,'system.power.definitionId':definitionId,'system.details.powerOrigin':powerOrigin,'system.details.organization':organization,'system.details.keyAttribute':keyAttribute,'system.details.nature':f.nature.value.trim()};
  if(this.item)await this.item.update(patch);else await this.actor.createEmbeddedDocuments('Item',[{name,type:'power',system:{category:'powers',level,power:{definitionId},details:{powerOrigin,organization,keyAttribute,nature:f.nature.value.trim()}}}]);
  await this.close();
 }
}
