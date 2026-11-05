import {rollWithLegado} from './legado-fortune.mjs';
import {configureLegado,legadoControl} from './legado-ui.mjs';
import {legadoView} from './legado-ui.mjs';
import {SnsActorDefenseEditor,editActorSize} from './actor-defense-editor.mjs';
import {npcFixedDefenseKey} from './npc-generator-defense.mjs';
import {fixedDefensePrecision} from './defense-context.mjs';
import {actorDefenseView} from './actor-defenses.mjs';
import {environmentAction} from './environment-ui.mjs';
import {kuchiyoseLink,summonUseProblem} from './kuchiyose-core.mjs';
import {isManagedParty} from './party-core.mjs';
import {companionLinkView,changeCompanionMaster,SnsKuchiyoseBuilder} from './kuchiyose-ui.mjs';
import {choosePartyMember,changePartyMembers,deleteParty} from './party-service.mjs';
import {canControlTransformation} from './transformation-core.mjs';
import {illusionAction} from './magen-ui.mjs';
import {illusionActionBlock} from './magen-core.mjs';
import {recordedAttributeView,recordedTransformationRows,recordedMovement,attributeEffect} from './transformation-core.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {transformationView} from './transformation-service.mjs';
import {transformationMode,configureTransformation,transformationTechnique,transformationDomain,transformationRest,transformationManualTurn} from './transformation-ui.mjs';
import {declareDefenses} from './defense-workflow.mjs';
import {conditionEffects,conditionPenalty,conditionMovement,conditionHaste} from './condition-effects.mjs';
import {promptCondition,endCondition} from './condition-application.mjs';
import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {copyDroppedCanonicalChoice} from './canonical-dialog.mjs';
import {copyDroppedPower} from './item-drop.mjs';
import {virtualRecordedSkills} from './advanced-core.mjs';
import {recordedSkills} from './recorded-skills.mjs';
import {SnsRecordedSkillsEditor} from './recorded-skills-editor.mjs';
import {editPrerequisiteData} from './prerequisite-data.mjs';
import {weaponChecks,weaponCheckComponents} from './weapon-checks.mjs';
import {itemPresentation} from './item-view.mjs';
import {groupPowers} from './power-groups.mjs';
import {specialResourceView} from './special-resources.mjs';
import {activeAptitudeView} from './active-aptitudes.mjs';
import {temporaryEffects} from './temporary-effects.mjs';
import {mountTraitPicker} from './trait-picker.mjs';
import {ACTOR_PROFILES,normalizeTags} from './sheet-profiles.mjs';
import {ShinobiSheet} from './sheet.mjs';
import {escapeHtml} from './kernel.mjs';
import {checkFlavor,attackTraitLabels} from './chat-card.mjs';
import {SnsCheckDialog} from './check-dialog.mjs';
import {ATTRIBUTES,displayValue} from './kernel.mjs';
import {supportingNavigation,supportingItems,recordedInventory} from './supporting-view.mjs';
import {memberView,partyView} from './party-view.mjs';
import {damageSnapshot,weaponDamageProfile,recordedDamageProfile} from './damage-source.mjs';
const statLabels={cc:'Corpo a corpo',cd:'À distância',esq:'Esquiva',lm:'Ler movimento',initiative:'Iniciativa',movement:'Deslocamento (m)'};
export class SupportingActorSheet extends SnsHandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2){
 get isEditable(){return super.isEditable&&canControlTransformation(this.actor);}
 _getHeaderControls(){const controls=super._getHeaderControls();if(this.isEditable&&game.user.isGM&&['npc','companion'].includes(this.actor.type))controls.push({action:'damageHistory',icon:'fa-solid fa-clock-rotate-left',label:'Ferramentas de dano'});if(this.isEditable&&this.actor.type==='companion')controls.push({action:'restActor',icon:'fa-solid fa-bed',label:'Descanso completo'});return controls;}
 static async deleteParty(){return deleteParty(this.actor);}
 static async buildCompanion(){if(this.isEditable)await new SnsKuchiyoseBuilder(this.actor).render({force:true});}
 static async editDefenses(event,target){if(this.isEditable){await this.submit();await new SnsActorDefenseEditor(this.actor,target.dataset.category).render({force:true});}}
 static async editSize(){if(this.isEditable){await this.submit();await editActorSize(this.actor);}}
 static async editPrerequisites(){if(this.isEditable&&game.user.isGM){await this.submit();await editPrerequisiteData(this.actor);}}
 activeTab='details';
 summaryTab='languages';
 jutsuTab='powers';
 constructor(options){super(options);if(this.actor.type==='loot')this.activeTab='inventory';this.memberHook=Hooks.on('updateActor',a=>{if(this.rendered&&(this.actor.type==='party'&&this.actor.system.members.includes(a.uuid)||this.actor.type==='companion'&&kuchiyoseLink(this.actor)?.masterUuid===a.uuid))void this.render({force:true});});}
 async _onClose(options){Hooks.off('updateActor',this.memberHook);return super._onClose(options);}
 static DEFAULT_OPTIONS={classes:['sns-document','sns-support-sheet'],position:{width:760,height:740},window:{resizable:true},form:{submitOnChange:true,closeOnSubmit:false},actions:{configureLegado,legadoControl,editDefenses:SupportingActorSheet.editDefenses,editSize:SupportingActorSheet.editSize,deleteParty:SupportingActorSheet.deleteParty,buildCompanion:SupportingActorSheet.buildCompanion,restActor:ShinobiSheet.restActor,environmentAction,illusionAction,transformationMode,configureTransformation,transformationTechnique,transformationDomain,transformationRest,transformationManualTurn,sheetDamage:ShinobiSheet.sheetDamage,conditionDuration:ShinobiSheet.conditionDuration,endActorScene:ShinobiSheet.endActorScene,damageHistory:ShinobiSheet.damageHistory,createTemporaryEffect:ShinobiSheet.createTemporaryEffect,applyCondition:ShinobiSheet.applyCondition,sustainSupport:ShinobiSheet.sustainSupport,endCondition:ShinobiSheet.endCondition,editPrerequisites:SupportingActorSheet.editPrerequisites,editChakraBase:SupportingActorSheet.editChakraBase,editFixedDefense:SupportingActorSheet.editFixedDefense,rollAttribute:SupportingActorSheet.rollAttribute,payAptitudeUpkeep:ShinobiSheet.payAptitudeUpkeep,configureActiveAptitude:ShinobiSheet.configureActiveAptitude,toggleActiveAptitude:ShinobiSheet.toggleActiveAptitude,editSpecialResource:ShinobiSheet.editSpecialResource,createGrantedJutsu:ShinobiSheet.createGrantedJutsu,documentTab:SupportingActorSheet.tab,partySummary:SupportingActorSheet.summary,setActivity:SupportingActorSheet.setActivity,clearActivity:SupportingActorSheet.clearActivity,documentPortrait:ShinobiSheet.portrait,editTags:SupportingActorSheet.editTags,createEntry:ShinobiSheet.createEntry,editEntry:ShinobiSheet.editEntry,browseEntries:ShinobiSheet.browseEntries,removeEntry:ShinobiSheet.removeEntry,toggleEquipped:ShinobiSheet.toggleEquipped,rollStat:SupportingActorSheet.rollStat,editRecordedSkills:SupportingActorSheet.editRecordedSkills,rollRecordedSkill:SupportingActorSheet.rollRecordedSkill,addMember:SupportingActorSheet.addMember,removeMember:SupportingActorSheet.removeMember,openMember:SupportingActorSheet.openMember,configurePower:ShinobiSheet.configurePower,manageJutsus:ShinobiSheet.manageJutsus,learnEffects:ShinobiSheet.learnEffects,buildJutsu:ShinobiSheet.buildJutsu,useJutsu:ShinobiSheet.useJutsu,chooseContext:ShinobiSheet.chooseContext}};
 static PARTS={sheet:{scrollable:["", ".npc-sidebar", ".actor-panels", ".party-sidebar", ".party-main", ".loot-sidebar", ".hazard-sidebar", ".vehicle-sidebar-content", ".party-body>.inventory-panel"],template:'systems/sns-v14-dev/templates/supporting-actor.hbs',templates:['systems/sns-v14-dev/templates/partials/budget-context.hbs','systems/sns-v14-dev/templates/partials/received-effects.hbs','systems/sns-v14-dev/templates/partials/applied-states.hbs','systems/sns-v14-dev/templates/partials/transformations.hbs','systems/sns-v14-dev/templates/partials/active-aptitudes.hbs','systems/sns-v14-dev/templates/partials/party.hbs','systems/sns-v14-dev/templates/partials/kuchiyose-link.hbs','systems/sns-v14-dev/templates/tabs/jutsus.hbs']}};
 async close(options={}){if(!options.force&&this.isEditable&&this.element?.isConnected)await this.submit();return super.close(options);}
 async _prepareContext(options){
  const source=this.actor.system.toObject(),profile=ACTOR_PROFILES[this.actor.type];
  const members=[];for(const uuid of source.members){const doc=await fromUuid(uuid),allowed=doc?.documentName==='Actor'&&doc.testUserPermission(game.user,'OBSERVER');const member=memberView(allowed?doc:null,uuid);member.activity=source.activities.find(a=>a.member===uuid);members.push(member);}
  const companionLink=await companionLinkView(this.actor);
  const type=this.actor.type,effects=characteristicEffects(this.actor),transformationAdjustment=key=>recordedTransformationRows([],effects,key,source).reduce((n,r)=>n+r.value,0),dodgePenalty=conditionPenalty(effects,'esq')+transformationAdjustment('esq');
  const nav=supportingNavigation(type),icons={details:'fa-dharmachakra',actions:'fa-diamond',inventory:'fa-suitcase',notes:'fa-book-open-reader',effects:'fa-person-rays'};
  return {...await super._prepareContext(options),defenseGroups:actorDefenseView(this.actor),legado:legadoView(this.actor),actor:this.actor,source,profile,npcCanCast:this.actor.type==='npc'&&(this.actor.isOwner||game.user.isGM),editable:this.isEditable,type,companionLink,specialResources:specialResourceView(this.actor),activeAptitudes:activeAptitudeView(this.actor),
   tags:source.tags,tagText:source.tags.join(', '),isParty:type==='party',canDeleteParty:game.user.isGM&&isManagedParty(this.actor),isLoot:type==='loot',isHazard:type==='hazard',isVehicle:type==='vehicle',isSquad:type==='squad',isCompanion:type==='companion',members,isGM:game.user.isGM,hasFunds:['loot','party'].includes(type),inventorySummary:recordedInventory(this.actor.items.contents),partySummary:partyView(members,source.activities),summaryLanguages:this.summaryTab==='languages',summarySkills:this.summaryTab==='skills',summaryKnowledge:this.summaryTab==='knowledge',exploration:this.activeTab==='exploration',
   attributes:ATTRIBUTES.map(([key,abbr,label])=>({key,abbr,label,...recordedAttributeView(source.attributes[key],effects,key)})),recordedSkills:virtualRecordedSkills(recordedSkills(source),effects).map(row=>({...row,signedPrecision:Number.isInteger(row.precision)?((row.precision+conditionPenalty(effects,'skill:'+row.key)+transformationAdjustment('skill:'+row.key))>=0?'+':'−')+Math.abs(row.precision+conditionPenalty(effects,'skill:'+row.key)+transformationAdjustment('skill:'+row.key)):row.signedPrecision})),legacySkills:source.details.skills,
   descriptionHTML:await foundry.applications.ux.TextEditor.enrichHTML(source.description,{secrets:false,relativeTo:this.actor}),
   sections:profile.sections.map(([label,fs])=>({label,fields:fs.filter(f=>!(type==='companion'&&companionLink&&['master','control','duration','shared'].includes(f.key))).filter(f=>!(type==='vehicle'&&['integrity','resistance'].includes(f.key))&&!(type==='hazard'&&f.key==='resistance')).map(f=>({...f,value:source.details[f.key],numeric:f.kind==='number',gmOnly:['funds','reward'].includes(f.key)}))})),
   resources:['vitality','chakra'].map((key,i)=>({key,label:['Vitalidade','Chakra'][i],...source.resources[key],maxField:key==='chakra'?'baseMax':'max',inputMax:key==='chakra'?source.resources.chakra.baseMax:source.resources[key].max,effectiveMax:this.actor.system.resources[key].max,maxAdjusted:key==='chakra'&&this.actor.system.resources.chakra.max!==source.resources.chakra.baseMax})),
   stats:Object.entries(statLabels).map(([key,label])=>({key,label,value:source.stats[key],conditionAdjustment:conditionPenalty(effects,key)+transformationAdjustment(key)+(key==='initiative'?conditionHaste(effects):0),effectiveValue:Number.isInteger(source.stats[key])?key==='movement'?recordedMovement(source.stats[key],effects,source):source.stats[key]+conditionPenalty(effects,key)+transformationAdjustment(key)+(key==='initiative'?conditionHaste(effects):0):'—',rollable:['cc','cd','lm','initiative'].includes(key)&&source.stats[key]!==null})),
   fixedDodge:fixedDefensePrecision(this.actor,effects)===null?'—':9+fixedDefensePrecision(this.actor,effects),
   defenseLabel:npcFixedDefenseKey(this.actor)==='lm'?'Defesa (LM)':'Defesa de esquiva',effectiveMovement:recordedMovement(source.stats.movement,effects,source),movementModified:Number.isFinite(source.stats.movement)&&recordedMovement(source.stats.movement,effects,source)!==source.stats.movement,
   tabs:nav.map(([id,label])=>({id,label,icon:icons[id],active:id===this.activeTab})),activeLabel:nav.find(([id])=>id===this.activeTab)?.[1],
   features:this.activeTab==='features',details:this.activeTab==='details'||this.activeTab==='exploration',actions:this.activeTab==='actions',inventory:this.activeTab==='inventory',notes:this.activeTab==='notes',
   appliedEffectEntries:this.actor.items.map(itemPresentation).filter(i=>i.category==='effects'&&!i.system.appliedCondition?.managed),transformations:transformationView(this.actor),temporaryEffects:temporaryEffects(this.actor),showAppliedStates:this.activeTab==='effects',activeTab:this.activeTab,jutsus:this.activeTab==='jutsus',jutsuTab:this.jutsuTab,powers:this.jutsuTab==='powers',techniques:this.jutsuTab==='techniques',effects:this.jutsuTab==='effects',...groupPowers(this.actor.items.map(itemPresentation)),jutsuEntries:this.actor.items.map(itemPresentation).filter(i=>i.category===this.jutsuTab),groups:supportingItems(this.actor.items.contents,this.activeTab,source.stats,source)};
 }
 async _onRender(context,options){await super._onRender(context,options);if(kuchiyoseLink(this.actor)?.mode==='calculated'&&!game.user.isGM){for(const input of this.element.querySelectorAll('input[name]'))if(/^system\.(nc|attributes\.|stats\.|statsOriginal\.|skillLevels\.|recordedSkills)|^system\.resources\.(vitality\.max|chakra\.baseMax)/.test(input.name))input.readOnly=true;this.element.querySelector('[data-action="editRecordedSkills"]')?.setAttribute('disabled','');}this.element.querySelector('[data-companion-master]')?.addEventListener('change',changeCompanionMaster.bind(this));mountTraitPicker(this.element,this.actor);if(!this.isEditable)this.element.querySelectorAll('[data-action="chooseContext"],[data-action="partySummary"],[data-action="learnEffects"],[data-action="useJutsu"],[data-action="manageJutsus"],[data-action="chooseContext"],[data-action="documentTab"],[data-action="editEntry"],[data-action="openMember"],[data-action="browseEntries"]').forEach(b=>b.disabled=false);this.element.querySelector('[data-inventory-search]')?.addEventListener('input',event=>{const q=event.target.value.trim().toLocaleLowerCase('pt-BR');this.element.querySelectorAll('[data-search-text]').forEach(row=>row.hidden=!row.dataset.searchText.toLocaleLowerCase('pt-BR').includes(q));});}
 async _onDropActor(event,actor){if(this.actor.type!=='party'||!this.isEditable||actor.id===this.actor.id||!actor.testUserPermission(game.user,'OBSERVER')||this.actor.system.members.includes(actor.uuid))return null;if(isManagedParty(this.actor)){await changePartyMembers(this.actor,{add:[actor.uuid]});return actor;}await this.actor.update({'system.members':[...this.actor.system.members,actor.uuid]});return actor;}
 async _onDropItem(event,item){const choice=await copyDroppedCanonicalChoice(this.actor,item);if(choice.handled)return choice.item;if(item.type==='power'&&item.actor!==this.actor)return copyDroppedPower(this.actor,item);return super._onDropItem(event,item);}
 _processFormData(event,form,formData){const data=super._processFormData(event,form,formData);const tags=form.elements.namedItem('system.tags');if(tags)foundry.utils.setProperty(data,'system.tags',normalizeTags(tags.value));for(const el of form.querySelectorAll('[data-nullable]'))if(el.value==='')foundry.utils.setProperty(data,el.name,null);return data;}
 static async tab(event,target){if(!['details','actions','inventory','notes','jutsus','effects','features','exploration'].includes(target.dataset.tab))return;if(this.isEditable)await this.submit();this.activeTab=target.dataset.tab;await this.render({force:true});}
 static async summary(event,target){if(!['languages','skills','knowledge'].includes(target.dataset.summary))return;if(this.isEditable)await this.submit();this.summaryTab=target.dataset.summary;await this.render({force:true});}
 static async editFixedDefense(){
  if(!this.isEditable)return;await this.submit();
  const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Defesa de esquiva'},content:'<p>Defesa fixa = 9 + precisão de esquiva. Com Sharingan ativo, usa Ler Movimento sem seus bônus de precisão, conservando os bônus de Esquiva.</p><label>Precisão de esquiva<input name="esq" type="number" step="1" value="'+(this.actor.system.stats.esq??'')+'"></label><label>Precisão de Ler Movimento<input name="lm" type="number" step="1" value="'+(this.actor.system.stats.lm??'')+'"></label>',ok:{label:'Salvar',callback:(e,b)=>({esq:b.form.elements.esq.value,lm:b.form.elements.lm.value})}});
  if(!result||!this.isEditable)return;const patch={};for(const key of ['esq','lm']){const value=result[key]===''?null:Number(result[key]);if(value!==null&&!Number.isInteger(value))return ui.notifications.warn('Informe uma precisão inteira.');patch['system.stats.'+key]=value;}await this.actor.update(patch);
 }
 static async rollAttribute(event,target){
  if(!this.isEditable)return;await this.submit();const key=target.dataset.attribute,entry=ATTRIBUTES.find(([id])=>id===key),precision=this.actor.system.attributes[key];if(!entry||!Number.isInteger(precision))return ui.notifications.warn('Informe o atributo antes de rolar.');
  const blocked=illusionActionBlock(this.actor,{key:'attribute:'+key});if(blocked)return ui.notifications.warn(blocked);
  const result=await SnsCheckDialog.promptRecorded(this.actor,{key:'attribute:'+key,name:entry[2],precision,die:'2d8'});if(!result||!this.isEditable)return;
  const roll=await rollWithLegado(this.actor,result.spec,{kind:'test'});return roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor:this.actor}),flavor:checkFlavor(result.spec),flags:{'sns-v14-dev':{check:{actorImg:this.actor.img,key:'attribute:'+key}}}},{messageMode:result.messageMode});
 }
 static async editChakraBase(){
  if(!this.isEditable)return;await this.submit();
  const before=this.actor.system.resources.chakra.baseMax;
  const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Máximo base de chakra'},content:'<p>As características aplicam seus efeitos ao máximo base. Alterar o máximo não preenche nem reduz o chakra atual.</p><label>Máximo base<input name="baseMax" type="number" min="0" step="1" value="'+(before??'')+'" placeholder="Não informado"></label>',ok:{label:'Salvar máximo base',callback:(e,b)=>({value:b.form.elements.baseMax.value===''?null:Number(b.form.elements.baseMax.value)})}});
  if(!result||!this.isEditable)return;const value=result.value;
  if(this.actor.system.resources.chakra.baseMax!==before)return ui.notifications.warn('O máximo mudou. Reabra o editor.');
  if(value!==null&&(!Number.isInteger(value)||value<0))return ui.notifications.warn('Informe um máximo inteiro e não negativo.');
  await this.actor.update({'system.resources.chakra.baseMax':value});
 }
 static async setActivity(event,target){
  if(!this.isEditable||this.actor.type!=='party'||!this.actor.system.members.includes(target.dataset.uuid))return;
  const member=await fromUuid(target.dataset.uuid);if(!member?.testUserPermission(game.user,'OBSERVER'))return;
  const old=this.actor.system.activities.find(a=>a.member===target.dataset.uuid);
  const name=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Atividade de '+member.name},content:'<label>Atividade de exploração<input name="activity" value="'+escapeHtml(old?.name??'')+'" placeholder="Ex.: vigiar o caminho"></label><p>Descreva a atividade de exploração.</p>',ok:{label:'Salvar atividade',callback:(e,b)=>b.form.elements.activity.value.trim()}});
  if(name&&this.isEditable&&this.actor.system.members.includes(target.dataset.uuid))await this.actor.update({'system.activities':[...this.actor.system.activities.filter(a=>a.member!==target.dataset.uuid),{member:target.dataset.uuid,name,item:''}]});
 }
 static async clearActivity(event,target){if(this.isEditable)await this.actor.update({'system.activities':this.actor.system.activities.filter(a=>a.member!==target.dataset.uuid)});}
 static async editTags(){if(!this.isEditable)return;const value=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Tags do ator'},content:'<label>Separadas por vírgula<input name="tags" value="'+escapeHtml(this.actor.system.tags.join(', '))+'"></label>',ok:{label:'Salvar',callback:(e,b)=>b.form.elements.tags.value}});if(value!==null&&value!==undefined&&this.isEditable)await this.actor.update({'system.tags':normalizeTags(value)});}
 static async addMember(){
  if(isManagedParty(this.actor))return choosePartyMember(this.actor);
  if(!this.isEditable)return;
  const actors=game.actors.filter(a=>a.id!==this.actor.id&&a.testUserPermission(game.user,'OBSERVER')&&!this.actor.system.members.includes(a.uuid));
  if(!actors.length)return ui.notifications.info('Nenhum ator disponível.');
  const uuid=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Adicionar membro'},content:'<label>Membro<select name="member">'+actors.map(a=>'<option value="'+a.uuid+'">'+escapeHtml(a.name)+'</option>').join('')+'</select></label>',ok:{label:'Vincular',callback:(e,b)=>b.form.elements.member.value}});
  if(uuid&&this.isEditable)await this.actor.update({'system.members':[...this.actor.system.members,uuid]});
 }
 static async removeMember(event,target){if(isManagedParty(this.actor))return changePartyMembers(this.actor,{remove:[target.dataset.uuid]});if(this.isEditable)await this.actor.update({'system.members':this.actor.system.members.filter(uuid=>uuid!==target.dataset.uuid)});}
 static async openMember(event,target){const actor=await fromUuid(target.dataset.uuid);if(actor?.testUserPermission(game.user,'OBSERVER'))await actor.sheet.render({force:true});}
 static async editRecordedSkills(){if(!this.isEditable)return;await this.submit();await new SnsRecordedSkillsEditor(this.actor).render({force:true});}
 static async rollRecordedSkill(event,target){
  if(!this.isEditable)return;if(summonUseProblem(this.actor))return ui.notifications.warn(summonUseProblem(this.actor));await this.submit();
  const row=virtualRecordedSkills(recordedSkills(this.actor.system),characteristicEffects(this.actor)).find(r=>r.key===target.dataset.skill);
  if(!row||row.untrained||row.precision===null)return;
  const blocked=illusionActionBlock(this.actor,{key:'skill:'+row.key});if(blocked)return ui.notifications.warn(blocked);
  const result=await SnsCheckDialog.promptRecorded(this.actor,{key:'skill:'+row.key,name:row.name,precision:row.precision,die:'2d8'});
  if(!result||!this.isEditable)return;const roll=await rollWithLegado(this.actor,result.spec,{kind:'test'});
  await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor:this.actor}),flavor:checkFlavor(result.spec),flags:{'sns-v14-dev':{check:{actorImg:this.actor.img,key:'skill:'+row.key}}}},{messageMode:result.messageMode});
 }
 static async rollStat(event,target){
  if(!this.isEditable)return;if(summonUseProblem(this.actor))return ui.notifications.warn(summonUseProblem(this.actor));if(this.actor.type==='companion'&&kuchiyoseLink(this.actor)?.mode==='calculated'&&target.dataset.stat==='initiative')return ui.notifications.info('A invocação age no turno do invocador.');await this.submit();const item=target.dataset.itemId?this.actor.items.get(target.dataset.itemId):null;
  const weapon=item&&item.system.category==='weapons'||item?.type==='weapon';
  const check=weapon?weaponChecks(item,this.actor.system.stats,this.actor.system.toObject(),this.actor.items).find(c=>c.key===target.dataset.stat):null;
  if(weapon&&!check?.available)return;
  const key=weapon?check.key:item?'attack':target.dataset.stat,value=weapon?check.precision:item?item.system.details.precision:this.actor.system.stats[key];
  if(value===null||value===undefined||!['attack','cc','cd','lm','initiative'].includes(key))return;
  const blocked=illusionActionBlock(this.actor,{attack:['attack','cc','cd'].includes(key),key});if(blocked)return ui.notifications.warn(blocked);
  const capturedTargets=Array.from(game.user.targets??[]);
  const result=await SnsCheckDialog.promptRecorded(this.actor,{key,name:item?item.name+(weapon?' · '+check.label:''):statLabels[key],precision:value,die:key==='initiative'?'1d8':'2d8'},weapon?weaponCheckComponents(this.actor.system.toObject(),key,item,this.actor.items):null);
  if(!result||!this.isEditable)return;const profile=weapon?weaponDamageProfile(this.actor,item,key):recordedDamageProfile(item),defenseRequestUuid=await declareDefenses(this.actor,item,profile,capturedTargets);if(defenseRequestUuid===null)return;
  const roll=await rollWithLegado(this.actor,result.spec,{kind:profile?'attack':'test'});
  const damageUse=damageSnapshot(this.actor,item,profile,capturedTargets,roll,result.spec);if(damageUse&&defenseRequestUuid)damageUse.defenseRequestUuid=defenseRequestUuid;
  await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor:this.actor}),flavor:checkFlavor(result.spec,{traits:attackTraitLabels(item)}),flags:{'sns-v14-dev':{...(damageUse?{damageUse}:{}),check:{actorImg:this.actor.img,key}}}},{messageMode:result.messageMode});
 }
}


