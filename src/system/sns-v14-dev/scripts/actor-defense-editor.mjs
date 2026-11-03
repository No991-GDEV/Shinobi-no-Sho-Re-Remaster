import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {DEFENSE_CATEGORIES,DEFENSE_TYPES,actorDefenseEntries,validateDefenseEntries,ACTOR_SIZES,actorSizeId,actorSizePatch} from './actor-defenses.mjs';
import {escapeHtml} from './kernel.mjs';
import {canControlTransformation} from './transformation-core.mjs';
export class SnsActorDefenseEditor extends SnsHandlebarsApplicationMixin(foundry.applications.api.ApplicationV2){
 static DEFAULT_OPTIONS={tag:'form',classes:['sns-editor-dialog','sns-defense-editor'],position:{width:540,height:'auto'},window:{resizable:true},form:{handler:SnsActorDefenseEditor.save,closeOnSubmit:false},actions:{add:SnsActorDefenseEditor.add,remove:SnsActorDefenseEditor.remove,cancel:SnsActorDefenseEditor.cancel}};
 static PARTS={editor:{scrollable:['','.sns-defense-fields'],template:'systems/sns-v14-dev/templates/actor-defense-editor.hbs'}};
 constructor(actor,category){super();this.actor=actor;this.category=category;this.draft=actorDefenseEntries(actor,category);this.baseline=JSON.stringify(this.draft);}
 async _prepareContext(){return {label:DEFENSE_CATEGORIES[this.category],isImmunity:this.category==='immunities',rows:this.draft.map((r,index)=>({...r,index,types:[{id:'custom',name:'Personalizada'},...DEFENSE_TYPES].map(t=>({...t,selected:r.type===t.id}))}))};}
 async _onRender(context,options){await super._onRender(context,options);this.window.title.textContent=DEFENSE_CATEGORIES[this.category]+' · '+this.actor.name;}
 capture(){const f=this.element.elements;this.draft=this.draft.map((r,i)=>({type:f['type-'+i].value,label:f['label-'+i].value,value:f['value-'+i]?.value??null,exceptions:f['exceptions-'+i].value,note:f['note-'+i].value}));}
 static async add(){if(!this.actor.isOwner||!canControlTransformation(this.actor))return;this.capture();this.draft.push({type:'custom',label:'',value:null,exceptions:'',note:''});await this.render({force:true});}
 static async remove(event,target){if(!this.actor.isOwner||!canControlTransformation(this.actor))return;this.capture();this.draft.splice(Number(target.dataset.index),1);await this.render({force:true});}
 static async cancel(){await this.close();}
 static async save(){
  if(!this.actor.isOwner||!canControlTransformation(this.actor))return ui.notifications.warn('Você não pode editar esta ficha.');
  try{this.capture();const rows=validateDefenseEntries(this.category,this.draft);
   if(JSON.stringify(actorDefenseEntries(this.actor,this.category))!==this.baseline)throw Error('A lista mudou. Reabra o editor.');
   await this.actor.update({['flags.sns-v14-dev.defenses.'+this.category]:rows});await this.close();
  }catch(e){ui.notifications.warn(e.message);}
 }
}
export async function editActorSize(actor){
 if(!actor.isOwner||!canControlTransformation(actor))return;
 const baseline=JSON.stringify({size:actor.system.details.size,traits:actor.system.traits,tags:actor.system.tags}),selected=actorSizeId(actor.system);
 const custom=!selected&&actor.system.details.size;
 const id=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Tamanho · '+actor.name},content:'<label>Tamanho<select name="size">'+(custom?'<option value="__current__" selected>'+escapeHtml(custom)+'</option>':'')+'<option value="">Não informado</option>'+ACTOR_SIZES.map(s=>'<option value="'+s.id+'" '+(selected===s.id?'selected':'')+'>'+escapeHtml(s.name)+'</option>').join('')+'</select></label>',ok:{label:'Salvar',callback:(e,b)=>b.form.elements.size.value}});
 if(id===null||id===undefined||id==='__current__'||!actor.isOwner||!canControlTransformation(actor))return;
 if(JSON.stringify({size:actor.system.details.size,traits:actor.system.traits,tags:actor.system.tags})!==baseline)return ui.notifications.warn('O tamanho ou as tags mudaram. Reabra o editor.');
 await actor.update(actorSizePatch(actor.system,id));
}
