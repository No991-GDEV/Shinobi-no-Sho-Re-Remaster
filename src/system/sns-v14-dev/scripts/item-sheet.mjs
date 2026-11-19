import {cleanRuntimeDescription} from './ui-copy.mjs';
import {isLegado} from './legado-core.mjs';
import {OPTIONAL_SOURCES,optionalSourceId} from '../data/optional-sources.mjs';
import {jutsuReading} from './jutsu-reading.mjs';
import {effectiveRuleItem} from './jutsu-rule-text.mjs';
import {SnsRequirementEditor} from './requirement-editor.mjs';
import {isCraftFormula} from './poison-crafting.mjs';
import {displayItemArt} from './item-art.mjs';
import {shareItemToChat} from './item-chat.mjs';
import {compactTechniqueDetails} from './standalone-technique.mjs';
import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {loadCanonicalLibrary,canonicalEntry,canonicalVariant,canonicalTextPatch} from './canonical-content.mjs';
import {updateBookText,correctAptitudeChoice} from './canonical-dialog.mjs';
import {aptitudeChoiceStatus,choiceFieldLabel} from './aptitude-choices.mjs';
import {ACCESS_ORIGINS,isOriginItem,originGrant} from './restricted-access.mjs';
import {configureGrantedJutsu} from './granted-jutsu-dialog.mjs';
import {ITEM_RULES,requirementsFor,narrativeFields} from './item-requirements.mjs';
import {SnsPowerProgression} from './power-progression.mjs';
import {SnsJutsuBuilder} from './jutsu-builder.mjs';
import {jutsuProjection} from './item-view.mjs';
import {ownedPowerDefinition,jutsuTraits} from './power-core.mjs';
import {itemProfile,itemCategory,ITEM_PROFILES,CATEGORIES,normalizeTags} from './sheet-profiles.mjs';
import {escapeHtml} from './kernel.mjs';
import {mountTraitPicker} from './trait-picker.mjs';
import {categoryChoices,traitLabels,fold} from './traits.mjs';
import {editorField,GUIDED_FIELDS} from './item-fields.mjs';
import {acuityAvailable,toggleWeaponAcuity} from './weapon-checks.mjs';
import {equipmentAcuity,equipmentUse} from './equipment-use.mjs';
import {configureJutsuEffects} from './jutsu-effect-editor.mjs';
import {configureItemAutomation,itemAutomationSummary} from './item-automation.mjs';

const hasValue=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const clipFact=(value,max=105)=>{
 const text=String(value??'').trim();
 if(text.length<=max)return text;
 return text.slice(0,max-1).replace(/\s+\S*$/,'').trim()+'…';
};
function formatAutomationFact(summary){
 if(!summary)return '';
 const parts=[];
 if(summary.hasPassive)parts.push(summary.passiveText||'Passivo');
 if(summary.hasToggle)parts.push(`Modo (${summary.active?'ativo':'inativo'})`);
 if(summary.hasQuickAction)parts.push(summary.actionSummary||'Ação rápida');
 if(summary.hasChargePool&&summary.charge)parts.push(`${summary.charge.value}/${summary.charge.max} ${summary.charge.unit}`);
 return parts.join(' · ');
}

export class ReferenceItemSheet extends SnsHandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2){
 activeTab='description';
 _hasRulesTab=false;
 static DEFAULT_OPTIONS={classes:['sns-document','sns-item-sheet'],position:{width:720,height:580},window:{resizable:true},form:{submitOnChange:true,closeOnSubmit:false},actions:{toggleAcuity:ReferenceItemSheet.toggleAcuity,editDescription:ReferenceItemSheet.editDescription,castJutsu:ReferenceItemSheet.castJutsu,shareItem:ReferenceItemSheet.shareItem,configureCraft:ReferenceItemSheet.configureCraft,configureRequirements:ReferenceItemSheet.configureRequirements,configureEffects:ReferenceItemSheet.configureEffects,configureAutomation:ReferenceItemSheet.configureAutomation,correctChoice:ReferenceItemSheet.correctChoice,updateBookText:ReferenceItemSheet.updateBookText,documentTab:ReferenceItemSheet.tab,editTags:ReferenceItemSheet.editTags,learnEffects:ReferenceItemSheet.learnEffects,buildJutsu:ReferenceItemSheet.buildJutsu}};
 static PARTS={sheet:{scrollable:['', '.sidebar', '.sheet-body'],template:'systems/sns-v14-dev/templates/reference-item.hbs'}};
 async close(options={}){if(!options.force&&this.isEditable&&this.element?.isConnected)await this.submit();return super.close(options);}
 async _prepareContext(options){
  const source=this.item.system.toObject(),profile=itemProfile(this.item),mechanics=jutsuProjection(this.item),guided=!!source.jutsu?.effectId;
  const library=await loadCanonicalLibrary(),bookEntry=canonicalEntry(this.item,library);
  const reading=jutsuReading(this.item,library?.entries??[],this.readingLevel);
  if(reading)for(const r of reading.related)r.html=await foundry.applications.ux.TextEditor.enrichHTML(r.html,{secrets:false,relativeTo:this.item});
  const powerId=source.details?.powerId??'',powers=this.item.actor?.items.filter(i=>itemCategory(i)==='powers')??[];
  const powerOptions=[{value:'',label:'Técnica avulsa',selected:!powerId},...powers.map(i=>({value:i.id,label:i.name,selected:i.id===powerId}))];
  if(powerId&&!powers.some(i=>i.id===powerId))powerOptions.push({value:powerId,label:'Poder indisponível',selected:true});

  const isGM=game.user.isGM;
  const isJutsu=this.item.type==='jutsu';
  const hasActor=!!this.item.actor;
  const isFormula=isCraftFormula(this.item);
  const isOrigin=isOriginItem(this.item);
  const originLabel=ACCESS_ORIGINS[originGrant(this.item)]??'';
  const choiceStatus=aptitudeChoiceStatus(this.item);
  const equipmentUseData=equipmentUse(this.item,this.item.actor?.system,this.item.actor?.items);
  const requirements=requirementsFor(this.item,this.item.actor);
  const automationSummary=itemAutomationSummary(this.item.actor,this.item);
  const guidedPowerDef=ownedPowerDefinition(this.item);
  const guidedPower=!!guidedPowerDef;
  const canCorrectChoice=isGM&&this.isEditable&&choiceStatus.required;
  const bookVariant=canonicalVariant(this.item,bookEntry);
  const canUpdateBook=isGM&&this.isEditable&&!!bookEntry&&!!canonicalTextPatch(this.item,bookEntry,library);
  const canConfigureAutomation=(this.isEditable||isGM)&&['clan','hijutsu','aptitude','feature','power','equipment','armor','weapon'].includes(this.item.type);
  const canHaveRule=['aptitude','feature','power','jutsu','clan','hijutsu'].includes(this.item.type);
  const canChooseAcuity=this.item.type==='weapon'&&hasActor&&equipmentAcuity(this.item)!==false&&acuityAvailable(this.item.actor.system,this.item.actor.items);
  const usesAcuity=this.item.system.details.ccAttribute==='Acuidade (Destreza)';
  const canCastJutsu=(isLegado(this.item)||!effectiveRuleItem(this.item).flags?.['sns-v14-dev']?.npcReferenceOnly)&&isJutsu&&hasActor&&(this.item.actor.isOwner||isGM);
  const categories=categoryChoices(this.item.type,source.category,ITEM_PROFILES,CATEGORIES);

  const fullKind=fold(profile.label);
  const baseKind=fold(String(profile.label??'').split(' / ')[0]);
  const renderedTags=[...(source.tags??[]),...traitLabels({...source,details:{...source.details,...mechanics?.data},traits:jutsuTraits(source.traits,mechanics)}).map(t=>t.label)];
  const showKindTag=!!fullKind&&!renderedTags.some(t=>{const k=fold(t);return k===baseKind||k===fullKind;});

  const sidebarFacts=[];
  const addFact=(label,value)=>{
   if(!hasValue(value)||String(value).trim()==='—'||sidebarFacts.some(f=>f.label===label))return;
   sidebarFacts.push({label,value:clipFact(value)});
  };

  if(!profile.physical){
   if(isJutsu){
    const compact=compactTechniqueDetails(this.item,{...source.details,...mechanics?.data});
    const readingRows=reading?.rows??[];
    const rVal=(...labels)=>readingRows.find(r=>labels.includes(r.label))?.value??'';
    addFact('Poder vinculado',powers.find(p=>p.id===powerId)?.name||rVal('Poder'));
    addFact('Nível usado',rVal('Nível usado'));
    addFact('Ação',compact.action||rVal('Ação'));
    addFact('Chakra',hasValue(compact.chakraCost)?compact.chakraCost:rVal('Chakra'));
    addFact('Alcance',compact.range||rVal('Alcance','Alcance comum','Ativação remota'));
    addFact('Duração',compact.duration||rVal('Duração'));
    addFact('Alvos',compact.target||rVal('Alvos')||compact.area||rVal('Área'));
    addFact('Dano / DB',compact.damage||rVal('Dano base','Dano comum do poder','Dano / efeito','Projéteis'));
    const diffRaw=hasValue(compact.difficulty)?String(compact.difficulty).trim():rVal('Dificuldade','Dificuldade comum','Dificuldade remota');
    if(hasValue(diffRaw))addFact('Resistência',/^\d+$/.test(diffRaw)?`Dif ${diffRaw}`:diffRaw);
    else if(hasValue(compact.defenses)&&compact.defenses!=='Conforme defesa e exceções da fonte')addFact('Resistência',compact.defenses);
    else addFact('Resistência',rVal('Defesas','Defesa'));
    if(requirements.configured&&hasActor)addFact('Requisitos',requirements.valid?'Atendidos':'Não atendidos');
   }else{
    const d=source.details??{};
    const ppCost=hasValue(d.stagePowerCost)?d.stagePowerCost:d.powerCost;
    if(hasValue(ppCost))addFact('Custo PP',`${ppCost} PP`);
    addFact('Estágio',d.eyeStage);
    addFact('Origem',originLabel||d.powerOrigin||d.donor||d.village||d.sourceActor);
    addFact('Natureza',d.nature);
    addFact('Atributo-chave',d.keyAttribute);
    if(['action','attack'].includes(this.item.type)&&source.category&&source.category!=='standard'){
     addFact('Tipo',CATEGORIES[source.category]??source.category);
    }
    if(choiceStatus.required&&choiceStatus.valid&&choiceStatus.label){
     addFact(choiceFieldLabel(choiceStatus.kind),choiceStatus.label);
    }
    if(guidedPower&&Number.isInteger(source.level)&&source.level>0){
     const learned=(source.power?.choices??[]).filter(c=>c.slot<=source.level).length;
     addFact('Efeitos',`${learned} / ${source.level}`);
    }
    addFact('Ação',d.action);
    addFact('Chakra',d.chakraCost);
    addFact('Alcance',d.range);
    addFact('Duração',d.duration);
    addFact('Alvos',d.target);
    addFact('Dano',d.damage);
    if(hasValue(d.precision))addFact('Precisão',Number(d.precision)>=0&&!/^[+-]/.test(String(d.precision).trim())?`+${d.precision}`:d.precision);
    addFact('Grau',d.degree);
    addFact('Tempo',d.time);
    addFact('Dificuldade',d.difficulty);
    if(['formula','service'].includes(this.item.type)&&hasValue(d.price))addFact('Custo',`${d.price} Ryo`);
    if(requirements.configured){
     addFact('Requisitos',hasActor?(requirements.valid?'Atendidos':'Não atendidos'):(requirements.rows.length?`${requirements.rows.length} critério(s)`:'Sem pré-requisitos'));
    }
    const autoText=formatAutomationFact(automationSummary);
    if(autoText)addFact('Automação',autoText);
   }
  }

  const sidebarTitle=isJutsu?'Resumo do Jutsu':'Resumo de '+String(profile.label??'Item').split(' / ')[0];
  const showSidebarActions=canCastJutsu||(canChooseAcuity&&this.isEditable)||hasActor;
  const showSidebar=profile.physical||isJutsu||sidebarFacts.length>0||hasActor||guidedPower;

  const hasRulesTab=isGM||canConfigureAutomation||canUpdateBook||canCorrectChoice||guidedPower||isJutsu||equipmentUseData.configured||requirements.configured||isOrigin||canHaveRule||!!automationSummary||isFormula;
  this._hasRulesTab=hasRulesTab;
  const activeTab=this.activeTab==='rules'&&!hasRulesTab?'description':this.activeTab;
  if(activeTab!==this.activeTab)this.activeTab=activeTab;

  const hasRulesToolbar=canCastJutsu||(isJutsu&&this.isEditable&&(hasActor||isGM))||guidedPower||(isGM&&this.isEditable)||canConfigureAutomation||canUpdateBook||canCorrectChoice||(canChooseAcuity&&this.isEditable);
  const hasRulesContent=hasRulesToolbar||(isJutsu&&!!mechanics?.problems?.length)||!!automationSummary||equipmentUseData.configured||requirements.configured||isOrigin||(canHaveRule&&isGM&&this.isEditable);

  return {
   ...await super._prepareContext(options),
   isFormula,item:this.item,reading,
   readingLevels:reading?.max>reading?.min?Array.from({length:reading.max-reading.min+1},(_,i)=>({value:reading.min+i,selected:reading.min+i===reading.level})):[],
   displayImage:displayItemArt(this.item),source,profile,equipmentUse:equipmentUseData,
   bookName:bookEntry?.document.name??'',
   showPersonalNotes:!!source.personalNotes||(profile.physical&&this.isEditable),
   levelLabel:profile.physical?'Item':isJutsu?'Jutsu':profile.label.split(' / ')[0],
   editable:this.isEditable,
   showLevel:!this.item.system.contentId?.startsWith('sns:legado:')&&!(isJutsu&&hasActor)&&!['aptitude','feature','clan','hijutsu','background'].includes(this.item.type),
   isOrigin,originLabel,
   originChoices:[{id:'',name:'Nenhuma autorização',selected:!source.details.accessRule},...Object.entries(ACCESS_ORIGINS).filter(([id])=>this.item.type!=='power'||id==='jinchuuriki').map(([id,name])=>({id,name,selected:id===source.details.accessRule}))],
   canCorrectChoice,
   choiceUsesRecordedPrecision:hasActor&&['sns:apt:perito','sns:apt:intuicao'].includes(source.ruleId),
   bookVariant,canUpdateBook,isGM,canHaveRule,
   ruleChoices:[{id:'',name:'Sem requisitos definidos',selected:!source.ruleId},...Object.entries(ITEM_RULES).map(([id,r])=>({id,name:r.name,selected:id===source.ruleId})),...(source.ruleId&&!ITEM_RULES[source.ruleId]?[{id:source.ruleId,name:source.ruleId+' · regra indisponível',selected:true}]:[])],
   requirements,
   narrativeNotes:narrativeFields.filter(key=>source.details?.[key]).map(key=>({label:key==='requirements'?'Requisitos anotados':'Restrições anotadas',text:source.details[key]})),
   optionalSourceLabel:OPTIONAL_SOURCES.find(s=>s.id===optionalSourceId(this.item))?.label??'',
   canChooseAcuity,usesAcuity,isPower:this.item.type==='power',guidedPower,canConfigureAutomation,automationSummary,canCastJutsu,isJutsu,hasActor,mechanics,
   tags:source.tags,tagText:(source.tags??[]).join(', '),
   categories,
   showKindTag,showSidebar,sidebarTitle,sidebarFacts,showSidebarActions,
   hasRulesTab,hasRulesToolbar,hasRulesContent,
   sidebarFields:profile.physical?profile.details.filter(f=>['usage','size','price','ownership'].includes(f.key)).map(f=>({...f,label:{usage:'Uso',size:'Tamanho',price:'Preço (Ryo)',ownership:'Propriedade'}[f.key],path:'system.details.'+f.key,value:source.details?.[f.key]??'',numeric:f.kind==='number'})):[],
   fields:profile.details.filter(f=>!narrativeFields.includes(f.key)).filter(f=>f.key!=='powerId'||hasActor).filter(f=>!profile.physical||!['usage','size','price','ownership'].includes(f.key)).map(f=>({...editorField(f,(guided&&f.key==='powerId'?powers.find(p=>p.id===powerId)?.name:guided&&f.key==='effect'?mechanics?.effect?.name:mechanics?.data?.[f.key])??source.details?.[f.key]??'',guided),readonly:!isGM&&!!this.item.flags?.['sns-v14-dev']?.sharedRecipe||!isGM&&['grantRule','featureRule','resourceRule','eyeStage','stagePowerCost','powerCost','powerOrigin'].includes(f.key)||guided&&GUIDED_FIELDS.includes(f.key),label:f.key==='powerId'?'Poder vinculado':f.key==='effect'&&mechanics?.noRoll?'Técnica da regra':f.label,path:'system.details.'+f.key,numeric:f.kind==='number',powerLink:f.key==='powerId',powerOptions})),
   tabs:[['description','Descrição'],['details','Detalhes'],...(hasRulesTab?[['rules','Regras']]:[])].map(([id,label])=>({id,label,active:id===activeTab})),
   descriptionHTML:await foundry.applications.ux.TextEditor.enrichHTML(reading?.description??(source.contentId?.startsWith('sns:state:')?cleanRuntimeDescription(source.description):source.description),{secrets:false,relativeTo:this.item}),
   canEditDescription:this.isEditable&&(isGM||!this.item.flags?.['sns-v14-dev']?.sharedRecipe),
   emptyDescription:!String(source.description??'').replace(/<[^>]*>/g,'').trim(),
   description:activeTab==='description',
   details:activeTab==='details',
   rulesTab:activeTab==='rules'
  };
 }
 async _onRender(context,options){
  await super._onRender(context,options);
  mountTraitPicker(this.element,this.item);
  for(const b of this.element.querySelectorAll('prose-mirror button.toggle')){b.setAttribute('aria-label','Editar descrição');b.title='Editar descrição';}
  const level=this.element.querySelector('[data-reading-level]');
  if(level){level.disabled=false;level.addEventListener('change',async e=>{e.stopImmediatePropagation();this.readingLevel=Number(e.target.value);await this.render({force:true});},true);}
  if(!this.isEditable){
   const selectors=['[data-action="castJutsu"]','[data-action="documentTab"]'];
   if(this.item.actor&&(this.item.actor.isOwner||game.user.isGM))selectors.push('[data-action="shareItem"]');
   this.element.querySelectorAll(selectors.join(',')).forEach(b=>b.disabled=false);
  }
 }
 _processFormData(event,form,formData){
  const data=super._processFormData(event,form,formData);delete data.readingLevel;
  if(data.img&&data.img===displayItemArt(this.item)&&data.img!==(this.item._source?.img??this.item.img))delete data.img;
  if(this.item.system.jutsu?.effectId){for(const key of GUIDED_FIELDS){delete data['system.details.'+key];if(data.system?.details)delete data.system.details[key];}}
  const tags=form.elements.namedItem('system.tags');if(tags)foundry.utils.setProperty(data,'system.tags',normalizeTags(tags.value));
  for(const input of form.querySelectorAll('[data-nullable]'))if(input.value==='')foundry.utils.setProperty(data,input.name,null);
  return data;
 }
 static async editDescription(){if(!this.isEditable)return;this.element.querySelector('prose-mirror button.toggle')?.click();}
 static async tab(event,target){
  const next=target.dataset.tab;
  if(!['description','details','rules'].includes(next))return;
  if(next==='rules'&&this._hasRulesTab===false)return;
  if(this.isEditable)await this.submit();
  this.activeTab=next;
  await this.render({force:true});
 }
 static async shareItem(){if(this.item.actor&&(this.item.actor.isOwner||game.user.isGM))await shareItemToChat(this.item.actor,this.item);}
 static async editTags(){if(!this.isEditable)return;const value=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Tags do item'},content:'<label>Separadas por vírgula<input name="tags" value="'+escapeHtml(this.item.system.tags.join(', '))+'"></label>',ok:{label:'Salvar',callback:(e,b)=>b.form.elements.tags.value}});if(value!==null&&value!==undefined&&this.isEditable)await this.item.update({'system.tags':normalizeTags(value)});}
 static async correctChoice(){if(!game.user.isGM||!this.isEditable)return;await this.submit();await correctAptitudeChoice(this.item);await this.render({force:true});}
 static async updateBookText(){if(!game.user.isGM||!this.isEditable)return;await this.submit();await updateBookText(this.item);await this.render({force:true});}
 static async learnEffects(){await new SnsPowerProgression(this.item).render({force:true});}
 static async toggleAcuity(){if(this.isEditable){try{await toggleWeaponAcuity(this.item);}catch(e){ui.notifications.warn(e.message);}}}
 static async buildJutsu(){if(this.item.system.jutsu?.grantSourceId&&this.isEditable)return configureGrantedJutsu(this.item.actor,this.item.actor.items.get(this.item.system.jutsu.grantSourceId),this.item);if(this.item.actor&&this.isEditable)await new SnsJutsuBuilder(this.item.actor,null,this.item).render({force:true});}
 static async castJutsu(){if(this.item.actor&&(this.item.actor.isOwner||game.user.isGM))return (await import('./jutsu-use.mjs')).useJutsu(this.item.actor,this.item);}
 static async configureCraft(){if(!game.user.isGM||!this.isEditable||!isCraftFormula(this.item))return;await this.submit();const {SnsCraftProfileEditor}=await import('./crafting-editor.mjs');await new SnsCraftProfileEditor(this.item).render({force:true});}
 static async configureRequirements(){if(!game.user.isGM||!this.isEditable)return;await this.submit();await new SnsRequirementEditor(this.item).render({force:true});}
 static async configureEffects(){if(!game.user.isGM||!this.isEditable)return;await this.submit();await configureJutsuEffects(this.item);await this.render({force:true});}
 static async configureAutomation(){if(!this.isEditable&&!game.user.isGM)return;await this.submit();await configureItemAutomation(this.item);await this.render({force:true});}
}
