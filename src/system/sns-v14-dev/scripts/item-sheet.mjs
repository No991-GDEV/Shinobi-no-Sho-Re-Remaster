import {cleanRuntimeDescription} from './ui-copy.mjs';
import {isLegado} from './legado-core.mjs';
import {OPTIONAL_SOURCES,optionalSourceId} from '../data/optional-sources.mjs';
import {jutsuReading} from './jutsu-reading.mjs';
import {effectiveRuleItem} from './jutsu-rule-text.mjs';
import {SnsRequirementEditor} from './requirement-editor.mjs';
import {isCraftFormula} from './poison-crafting.mjs';
import {itemArt,assignedItemArt,isPlaceholderArt} from './item-art.mjs';
import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {loadCanonicalLibrary,canonicalEntry,canonicalVariant,canonicalTextPatch} from './canonical-content.mjs';
import {updateBookText,correctAptitudeChoice} from './canonical-dialog.mjs';
import {aptitudeChoiceStatus} from './aptitude-choices.mjs';
import {ACCESS_ORIGINS,isOriginItem,originGrant} from './restricted-access.mjs';
import {configureGrantedJutsu} from './granted-jutsu-dialog.mjs';
import {ITEM_RULES,requirementsFor,narrativeFields} from './item-requirements.mjs';
import {SnsPowerProgression} from './power-progression.mjs';
import {SnsJutsuBuilder} from './jutsu-builder.mjs';
import {jutsuProjection} from './item-view.mjs';
import {itemProfile,itemCategory,ITEM_PROFILES,CATEGORIES,normalizeTags} from './sheet-profiles.mjs';
import {escapeHtml} from './kernel.mjs';
import {mountTraitPicker} from './trait-picker.mjs';
import {categoryChoices} from './traits.mjs';
import {editorField,GUIDED_FIELDS} from './item-fields.mjs';
import {equipmentUse} from './equipment-use.mjs';
import {configureJutsuEffects} from './jutsu-effect-editor.mjs';
export class ReferenceItemSheet extends SnsHandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2){
 activeTab='description';
 static DEFAULT_OPTIONS={classes:['sns-document','sns-item-sheet'],position:{width:700,height:560},form:{submitOnChange:true,closeOnSubmit:false},actions:{editDescription:ReferenceItemSheet.editDescription,castJutsu:ReferenceItemSheet.castJutsu,configureCraft:ReferenceItemSheet.configureCraft,configureRequirements:ReferenceItemSheet.configureRequirements,configureEffects:ReferenceItemSheet.configureEffects,correctChoice:ReferenceItemSheet.correctChoice,updateBookText:ReferenceItemSheet.updateBookText,documentTab:ReferenceItemSheet.tab,documentPortrait:ReferenceItemSheet.portrait,editTags:ReferenceItemSheet.editTags,learnEffects:ReferenceItemSheet.learnEffects,buildJutsu:ReferenceItemSheet.buildJutsu}};
 static PARTS={sheet:{scrollable:["", ".sidebar", ".sheet-body"],template:'systems/sns-v14-dev/templates/reference-item.hbs'}};
 async close(options={}){if(!options.force&&this.isEditable&&this.element?.isConnected)await this.submit();return super.close(options);}
 async _prepareContext(options){
  const source=this.item.system.toObject(),profile=itemProfile(this.item),mechanics=jutsuProjection(this.item),guided=!!source.jutsu?.effectId;
  const library=await loadCanonicalLibrary(),bookEntry=canonicalEntry(this.item,library);
  const reading=jutsuReading(this.item,library?.entries??[],this.readingLevel);if(reading)for(const r of reading.related)r.html=await foundry.applications.ux.TextEditor.enrichHTML(r.html,{secrets:false,relativeTo:this.item});
  const powerId=source.details?.powerId??'',powers=this.item.actor?.items.filter(i=>itemCategory(i)==='powers')??[];
  const powerOptions=[{value:'',label:'Técnica avulsa',selected:!powerId},...powers.map(i=>({value:i.id,label:i.name,selected:i.id===powerId}))];
  if(powerId&&!powers.some(i=>i.id===powerId))powerOptions.push({value:powerId,label:'Poder indisponível',selected:true});
  return {...await super._prepareContext(options),isFormula:isCraftFormula(this.item),item:this.item,reading,readingLevels:reading?.max>reading?.min?Array.from({length:reading.max-reading.min+1},(_,i)=>({value:reading.min+i,selected:reading.min+i===reading.level})):[],displayImage:itemArt(this.item),source,profile,equipmentUse:equipmentUse(this.item,this.item.actor?.system,this.item.actor?.items),bookName:bookEntry?.document.name??'',showPersonalNotes:!!source.personalNotes||(profile.physical&&this.isEditable),levelLabel:profile.physical?'Item':this.item.type==='jutsu'?'Jutsu':profile.label.split(' / ')[0],editable:this.isEditable,showLevel:!this.item.system.contentId?.startsWith('sns:legado:')&&!(this.item.type==='jutsu'&&this.item.actor)&&!['aptitude','feature','clan','hijutsu','background'].includes(this.item.type),
   isOrigin:isOriginItem(this.item),originLabel:ACCESS_ORIGINS[originGrant(this.item)]??'',originChoices:[{id:'',name:'Nenhuma autorização',selected:!source.details.accessRule},...Object.entries(ACCESS_ORIGINS).filter(([id])=>this.item.type!=='power'||id==='jinchuuriki').map(([id,name])=>({id,name,selected:id===source.details.accessRule}))],
   canCorrectChoice:game.user.isGM&&this.isEditable&&aptitudeChoiceStatus(this.item).required,choiceUsesRecordedPrecision:this.item.actor&&['sns:apt:perito','sns:apt:intuicao'].includes(source.ruleId),bookVariant:canonicalVariant(this.item,bookEntry),canUpdateBook:game.user.isGM&&this.isEditable&&!!bookEntry&&!!canonicalTextPatch(this.item,bookEntry,library),isGM:game.user.isGM,canHaveRule:['aptitude','feature','power','jutsu','clan','hijutsu'].includes(this.item.type),ruleChoices:[{id:'',name:'Sem requisitos definidos',selected:!source.ruleId},...Object.entries(ITEM_RULES).map(([id,r])=>({id,name:r.name,selected:id===source.ruleId})),...(source.ruleId&&!ITEM_RULES[source.ruleId]?[{id:source.ruleId,name:source.ruleId+' · regra indisponível',selected:true}]:[])],requirements:requirementsFor(this.item,this.item.actor),narrativeNotes:narrativeFields.filter(key=>source.details?.[key]).map(key=>({label:key==='requirements'?'Requisitos anotados':'Restrições anotadas',text:source.details[key]})),
   optionalSourceLabel:OPTIONAL_SOURCES.find(s=>s.id===optionalSourceId(this.item))?.label??'',isPower:this.item.type==='power',guidedPower:!!source.power?.definitionId,canCastJutsu:(isLegado(this.item)||!effectiveRuleItem(this.item).flags?.['sns-v14-dev']?.npcReferenceOnly)&&this.item.type==='jutsu'&&!!this.item.actor&&(this.item.actor.isOwner||game.user.isGM),isJutsu:this.item.type==='jutsu',hasActor:!!this.item.actor,mechanics:jutsuProjection(this.item),tags:source.tags,tagText:(source.tags??[]).join(', '),
   categories:categoryChoices(this.item.type,source.category,ITEM_PROFILES,CATEGORIES),
   sidebarFields:profile.physical?profile.details.filter(f=>['usage','size','price','ownership'].includes(f.key)).map(f=>({...f,label:{usage:'Uso',size:'Tamanho',price:'Preço (Ryo)',ownership:'Propriedade'}[f.key],path:'system.details.'+f.key,value:source.details?.[f.key]??'',numeric:f.kind==='number'})):[],
   fields:profile.details.filter(f=>!narrativeFields.includes(f.key)).filter(f=>f.key!=='powerId'||this.item.actor).filter(f=>!profile.physical||!['usage','size','price','ownership'].includes(f.key)).map(f=>({...editorField(f,(guided&&f.key==='powerId'?powers.find(p=>p.id===powerId)?.name:guided&&f.key==='effect'?mechanics?.effect?.name:mechanics?.data?.[f.key])??source.details?.[f.key]??'',guided),readonly:!game.user.isGM&&!!this.item.flags?.['sns-v14-dev']?.sharedRecipe||!game.user.isGM&&['grantRule','featureRule','resourceRule','eyeStage','stagePowerCost','powerCost','powerOrigin'].includes(f.key)||guided&&GUIDED_FIELDS.includes(f.key),label:f.key==='powerId'?'Poder vinculado':f.key==='effect'&&mechanics?.noRoll?'Técnica da regra':f.label,path:'system.details.'+f.key,numeric:f.kind==='number',powerLink:f.key==='powerId',powerOptions})),
   tabs:[['description','Descrição'],['details','Detalhes']].map(([id,label])=>({id,label,active:id===this.activeTab})),
   descriptionHTML:await foundry.applications.ux.TextEditor.enrichHTML(reading?.description??(source.contentId?.startsWith('sns:state:')?cleanRuntimeDescription(source.description):source.description),{secrets:false,relativeTo:this.item}),
   canEditDescription:this.isEditable&&(game.user.isGM||!this.item.flags?.['sns-v14-dev']?.sharedRecipe),emptyDescription:!String(source.description??'').replace(/<[^>]*>/g,'').trim(),description:this.activeTab==='description',details:this.activeTab==='details'};
 }
 async _onRender(context,options){await super._onRender(context,options);mountTraitPicker(this.element,this.item);for(const b of this.element.querySelectorAll('prose-mirror button.toggle')){b.setAttribute('aria-label','Editar descrição');b.title='Editar descrição';}const level=this.element.querySelector('[data-reading-level]');if(level){level.disabled=false;level.addEventListener('change',async e=>{e.stopImmediatePropagation();this.readingLevel=Number(e.target.value);await this.render({force:true});},true);}if(!this.isEditable)this.element.querySelectorAll('[data-action="castJutsu"],[data-action="documentTab"]').forEach(b=>b.disabled=false);}
 _processFormData(event,form,formData){
  const data=super._processFormData(event,form,formData);delete data.readingLevel;
  if(this.item.system.jutsu?.effectId){for(const key of GUIDED_FIELDS){delete data['system.details.'+key];if(data.system?.details)delete data.system.details[key];}}
  const tags=form.elements.namedItem('system.tags');if(tags)foundry.utils.setProperty(data,'system.tags',normalizeTags(tags.value));
  for(const input of form.querySelectorAll('[data-nullable]'))if(input.value==='')foundry.utils.setProperty(data,input.name,null);
  return data;
 }
 static async editDescription(){if(!this.isEditable)return;this.element.querySelector('prose-mirror button.toggle')?.click();}
 static async tab(event,target){if(!['description','details'].includes(target.dataset.tab))return;if(this.isEditable)await this.submit();this.activeTab=target.dataset.tab;await this.render({force:true});}
 static async editTags(){if(!this.isEditable)return;const value=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Tags do item'},content:'<label>Separadas por vírgula<input name="tags" value="'+escapeHtml(this.item.system.tags.join(', '))+'"></label>',ok:{label:'Salvar',callback:(e,b)=>b.form.elements.tags.value}});if(value!==null&&value!==undefined&&this.isEditable)await this.item.update({'system.tags':normalizeTags(value)});}
 static async correctChoice(){if(!game.user.isGM||!this.isEditable)return;await this.submit();await correctAptitudeChoice(this.item);await this.render({force:true});}
 static async updateBookText(){if(!game.user.isGM||!this.isEditable)return;await this.submit();await updateBookText(this.item);await this.render({force:true});}
 static async learnEffects(){await new SnsPowerProgression(this.item).render({force:true});}
 static async buildJutsu(){if(this.item.system.jutsu?.grantSourceId&&this.isEditable)return configureGrantedJutsu(this.item.actor,this.item.actor.items.get(this.item.system.jutsu.grantSourceId),this.item);if(this.item.actor&&this.isEditable)await new SnsJutsuBuilder(this.item.actor,null,this.item).render({force:true});}
 static async castJutsu(){if(this.item.actor&&(this.item.actor.isOwner||game.user.isGM))return (await import('./jutsu-use.mjs')).useJutsu(this.item.actor,this.item);}
 static async configureCraft(){if(!game.user.isGM||!this.isEditable||!isCraftFormula(this.item))return;await this.submit();const {SnsCraftProfileEditor}=await import('./crafting-editor.mjs');await new SnsCraftProfileEditor(this.item).render({force:true});}
 static async configureRequirements(){if(!game.user.isGM||!this.isEditable)return;await this.submit();await new SnsRequirementEditor(this.item).render({force:true});}
 static async configureEffects(){if(!game.user.isGM||!this.isEditable)return;await this.submit();await configureJutsuEffects(this.item);await this.render({force:true});}
 static async portrait(){if(!this.isEditable)return;new foundry.applications.apps.FilePicker({type:'image',current:this.item.img,callback:async img=>{if(this.isEditable)await this.item.update({img});}}).render({force:true});}
}

