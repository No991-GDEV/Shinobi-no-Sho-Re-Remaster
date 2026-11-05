import {carryRequirementProfile} from './requirement-policy.mjs';
import {sourceAvailable} from '../data/optional-sources.mjs';
import {itemArt,assignedItemArt,isPlaceholderArt} from './item-art.mjs';
import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {loadCanonicalLibrary,preferCanonicalRows,isAcquisitionPack,isCatalogWorldItem} from './canonical-content.mjs';
import {chooseCanonicalCopy} from './canonical-dialog.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {packageAcquisitionProblems} from './restricted-access.mjs';
import {catalogTabs,catalogTabFor,initialCatalogTab,mayBrowseCatalogRow,filterCatalog,catalogTraitLabel,catalogRating,CATALOG_RANKS} from './catalog-core.mjs';
import {entryTypeLabel,entryFilterForCategory,applyEntryTypeFilter,entryFilterChoices} from './catalog-entry-filters.mjs';
import {requirementGate} from './catalog-requirement-filter.mjs';
import {catalogPrice} from './catalog-equipment-price.mjs';
import {mountCatalogTraits} from './catalog-traits.mjs';
import {traitMap} from './traits.mjs';
import {POWER_DEFINITIONS,EFFECT_DEFINITIONS} from '../data/power-definitions.mjs';
import {TRAITS} from '../data/traits-v1.mjs';
import {itemCategory} from './sheet-profiles.mjs';
import {escapeHtml} from './kernel.mjs';
const {ApplicationV2,HandlebarsApplicationMixin,DialogV2}=foundry.applications.api;
const defaults=()=>({query:'',allCategories:false,type:'',category:'',source:'',sources:[],min:'',max:'',traits:[],excludedTraits:[],sizes:[],ranks:[],match:'all',sort:'level',direction:'asc',includeWorld:false,onlyMet:false});
export class SnsCatalog extends SnsHandlebarsApplicationMixin(ApplicationV2){
 static DEFAULT_OPTIONS={classes:['sns-editor-dialog','sns-catalog'],position:{width:940,height:720},window:{title:'Compêndios SNS'},actions:{loadMore:SnsCatalog.loadMore,retry:SnsCatalog.retry,open:SnsCatalog.open,add:SnsCatalog.add,switchCategory:SnsCatalog.switchCategory,clearFilters:SnsCatalog.clearFilters,clearTraits:SnsCatalog.clearTraits,removeTrait:SnsCatalog.removeTrait,toggleTrait:SnsCatalog.toggleTrait,reverseSort:SnsCatalog.reverseSort}};
 static PARTS={catalog:{scrollable:["", ".catalog-filters", ".catalog-results"],template:'systems/sns-v14-dev/templates/catalog.hbs'}};
 constructor({actor=null,category='',powerId=''}={}){super();this.actor=actor;this.powerId=powerId;this.activeCategory=initialCatalogTab(category);this.filters={...defaults(),...entryFilterForCategory(category)};this.savedFilters=new Map();this.openFilters=new Set(['types','sizes']);}
 async load(){
  // D142 · system.choice acompanha o loader: uma escolha já publicada no
  // catálogo não pode virar opção genérica/pendente por falta do campo.
  const row=(item,origin,documentName='Item')=>({documentName,requirementFlags:{'sns-v14-dev':{requirements:item.flags?.['sns-v14-dev']?.requirements}},contentId:item.system.contentId,referenceKey:item.flags?.['sns-v14-dev']?.d108ReferenceKey,id:item.uuid,uuid:item.uuid,name:item.name,img:itemArt(item),type:item.type,category:documentName==='Item'?itemCategory(item):'',level:documentName==='Actor'?(item.system.nc??null):item.system.level>0?item.system.level:null,tags:item.system.tags??[],traits:item.system.traits??[],sourceId:item.system.source?.id??'',source:[item.system.source?.id,item.system.source?.edition,item.system.source?.pages].filter(Boolean).join(' · '),origin,canAdd:documentName==='Item'&&item.type!=='effectDefinition'&&!!this.actor?.isOwner,ruleSystem:{contentId:item.system.contentId,ruleId:item.system.ruleId,details:item.system.details,choice:item.system.choice}});
  this.rows=game.items.filter(i=>isCatalogWorldItem(i)&&i.testUserPermission(game.user,'OBSERVER')).map(i=>row(i,'Mundo'));
  for(const pack of game.packs.filter(p=>isAcquisitionPack(p)&&['Item',...(game.user.isGM?['Actor']:[])].includes(p.documentName)&&p.testUserPermission(game.user,'OBSERVER'))){
   try{
    const index=await pack.getIndex({fields:['type','system.category','system.level','system.nc','system.tags','system.traits','system.source','system.ruleId','system.details','system.contentId','system.choice','flags.sns-v14-dev.d108ReferenceKey','flags.sns-v14-dev.requirements']});
    for(const entry of index){
     if(pack.documentName==='Actor'&&!['npc','companion','hazard'].includes(entry.type))continue;
     const item={...entry,uuid:'Compendium.'+pack.collection+'.'+pack.documentName+'.'+entry._id,system:entry.system??{}};
     this.rows.push(row(item,pack.metadata.label,pack.documentName));
    }
   }catch(error){console.warn('SNS · índice indisponível',pack.collection,error);}
  }
  for(const p of POWER_DEFINITIONS)this.rows.push({id:p.id,name:p.name,type:'powerDefinition',category:'powers',level:null,img:itemArt({img:'icons/svg/aura.svg',system:{contentId:p.id}}),traits:p.id.endsWith('ninpou')?['arte:ninjutsu']:['arte:ninjutsu','elemento:'+p.id.split(':').at(-1)],sourceId:p.source.id,source:p.source.id+' · '+p.source.pages,origin:'Definição de criação',canAdd:!!this.actor?.isOwner,builtin:true});
  for(const e of EFFECT_DEFINITIONS)this.rows.push({id:e.id,name:e.name,type:'effectDefinition',category:'effectDefinitions',level:e.min,img:itemArt({img:'icons/svg/fire.svg',system:{contentId:e.id}}),traits:e.traits,sourceId:e.source.id,source:e.source.id+' · '+e.source.pages+(e.revision?' / '+e.revision.id+' '+e.revision.pages:''),origin:'Componente de criação',canAdd:false,builtin:true});
  this.library=await loadCanonicalLibrary();this.rows=preferCanonicalRows(this.rows,this.library);
 }
 async _prepareContext(){
  if(!this.rows)await this.load();
  const allowed=catalogTabs(game.user.isGM);if(!allowed.some(t=>t.id===this.activeCategory))this.activeCategory='equipment';
  const tab=allowed.find(t=>t.id===this.activeCategory),visible=this.rows.filter(r=>sourceAvailable(r)&&mayBrowseCatalogRow(r,game.user.isGM)),inCategory=visible.filter(r=>(this.filters.allCategories||catalogTabFor(r)===tab.id)&&(this.filters.includeWorld||r.origin!=='Mundo'));
  const onlyMet=this.filters.onlyMet&&!!this.actor;
  const filterState=JSON.stringify([tab.id,this.filters]);if(this.pageFilterState!==filterState){this.pageFilterState=filterState;this.visibleLimit=60;this.resetResultsScroll=true;}
  const gates=new Map(),gateFor=row=>{if(!gates.has(row))gates.set(row,requirementGate(row,this.actor,{isGM:game.user.isGM}));return gates.get(row);};
  const filtered=filterCatalog(visible,{...this.filters,onlyMet:false,tab:this.filters.allCategories?'':tab.id,isGM:game.user.isGM});
  const eligible=onlyMet?filtered.filter(row=>['ok','choice'].includes(gateFor(row))):filtered;
  const hiddenUnknown=onlyMet?filtered.filter(row=>gateFor(row)==='unknown').length:0;
  const shown=eligible.slice(0,this.visibleLimit).map(row=>{
   const gate=gateFor(row);
   const base={...row,shortSource:row.sourceId?.replace('Naruto: Shinobi no Sho — ','')||row.origin,levelDisplay:catalogRating(row,this.filters.allCategories?catalogTabFor(row):tab.id).display,levelTitle:catalogRating(row,this.filters.allCategories?catalogTabFor(row):tab.id).title,typeLabel:entryTypeLabel(row.type),price:catalogPrice(row,tab.id),gate};
   if(!this.actor||row.builtin||row.documentName==='Actor')return base;
   const candidate={type:row.type,flags:row.requirementFlags,system:row.ruleSystem},r=requirementsFor(candidate,this.actor,[],true),problems=[...new Set([...packageAcquisitionProblems(candidate,this.actor),...(r.configured&&!r.valid?r.problems:[])])];
   const canAdd=row.canAdd&&!packageAcquisitionProblems(candidate,this.actor).length&&(!r.configured||r.valid);
   return {...base,canAdd,addBlocked:row.canAdd&&!canAdd,requirementTitle:problems.join(' '),requirementMessage:problems.length?problems[0]+(problems.length>1?' (+'+(problems.length-1)+')':''):gate==='missing'&&EQUIPMENT_TAB_ROWS.has(tab.id)?'Requisitos de uso; posse permitida':r.configured?(r.rows.some(x=>x.kind==='choice')?'Escolha a opção ao adicionar':'Requisitos atendidos'):['aptitude','feature'].includes(row.type)?'Requisitos na descrição':''};
  });
  const sources=[...new Set(inCategory.map(r=>r.sourceId).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  return {showRanks:!this.filters.allCategories&&tab.id==='jutsus',showPrices:!this.filters.allCategories&&tab.id==='equipment',ratingLabel:tab.id==='jutsus'?'Nível/Rank':'Nível',priceLabel:'Preço',levelsLabel:tab.id==='jutsus'?'Níveis / Ranks':'Níveis',rankChoices:[...CATALOG_RANKS,'unknown'].map(id=>({id,label:id==='unknown'?'Sem rank informado':'Rank '+id,selected:this.filters.ranks.includes(id)})),openTypes:this.openFilters.has('types'),openSizes:this.openFilters.has('sizes'),openSources:this.openFilters.has('sources'),openLevels:this.openFilters.has('levels'),appId:this.id,rows:shown,count:eligible.length,renderedCount:shown.length,hasMore:shown.length<eligible.length,remainingCount:eligible.length-shown.length,total:inCategory.length,filters:this.filters,activeCategory:this.filters.allCategories?'Todas as categorias':tab.label,categoryId:tab.id,isGM:game.user.isGM,
   tabs:allowed.map(t=>({...t,active:t.id===tab.id,count:visible.filter(r=>catalogTabFor(r)===t.id&&r.origin!=='Mundo').length})),
   typeGroups:entryFilterChoices({tabId:this.filters.allCategories?'':tab.id,rows:inCategory,type:this.filters.type,category:this.filters.category}),
   sources:sources.map(id=>({id,name:id,selected:this.filters.sources.includes(id)})),sizes:TRAITS.filter(t=>t.family==='porte').map(t=>({...t,selected:this.filters.sizes.includes(t.id)})),showSizes:['bestiary','hazards'].includes(tab.id),
   traitChips:[...this.filters.traits.map(id=>({id,excluded:false})),...this.filters.excludedTraits.map(id=>({id,excluded:true}))].map(t=>({...t,label:catalogTraitLabel(traitMap.get(t.id)??t.id),title:traitMap.get(t.id)?.description??t.id})),
   all:this.filters.match==='all',any:this.filters.match==='any',sortName:this.filters.sort==='name',sortLevel:this.filters.sort==='level',descending:this.filters.direction==='desc',
   linked:!!this.actor,
   onlyMet,onlyMetChecked:!!(this.filters.onlyMet&&this.actor),
   hiddenUnknown,hiddenUnknownText:hiddenUnknown?hiddenUnknown+' entrada(s) ocultas: requisitos sem verificação disponível.':'',
   canAdd:!!this.actor?.isOwner,
   libraryError:!this.library||!!this.library.optionalErrors?.length,emptyText:this.filters.traits.length||this.filters.excludedTraits.length||this.filters.query||this.filters.type||this.filters.category||this.filters.ranks.length||this.filters.min!==''||this.filters.max!==''||this.filters.sources.length||(this.filters.onlyMet&&this.actor)?'Nenhuma entrada corresponde aos filtros.':'Ainda não há entradas publicadas nesta categoria.'};
 }
 async _onRender(context,options){
  await super._onRender(context,options);this.disposeTraits?.();if(this.resetResultsScroll){this.resetResultsScroll=false;const results=this.element.querySelector('.catalog-results');if(results)results.scrollTop=0;}
  this.disposeTraits=mountCatalogTraits(this.element,{tab:this.activeCategory,selected:[...this.filters.traits,...this.filters.excludedTraits],onSelect:async id=>{if(!traitMap.has(id))return;this.filters.traits=[...new Set([...this.filters.traits,id])];this.restoreTraitsFocus=true;await this.render({force:true});}});
  for(const panel of this.element.querySelectorAll('[data-filter-panel]'))panel.addEventListener('toggle',()=>{if(panel.open)this.openFilters.add(panel.dataset.filterPanel);else this.openFilters.delete(panel.dataset.filterPanel);});
  for(const input of this.element.querySelectorAll('[data-filter]'))input.addEventListener('input',()=>{
   const key=input.dataset.filter;
   if(key==='allCategories'){const query=this.filters.query,sort=this.filters.sort;this.filters={...defaults(),query,sort,allCategories:input.checked};}
   else if(key==='type')this.filters=applyEntryTypeFilter(this.filters,input.value);
   else if(['sources','sizes','ranks'].includes(key))this.filters[key]=Array.from(this.element.querySelectorAll('[data-filter="'+key+'"]:checked')).map(el=>el.value);
   else this.filters[key]=input.type==='checkbox'?input.checked:input.value;
   clearTimeout(this.timer);if(['search','text','number'].includes(input.type)){this.focusField=key;this.focusPosition=input.selectionStart;}
   this.timer=setTimeout(()=>this.render({force:true}),180);
  });
  if(this.focusField){const input=this.element.querySelector('[data-filter="'+this.focusField+'"]');input?.focus({preventScroll:true});if(['search','text'].includes(input?.type)&&typeof this.focusPosition==='number')input.setSelectionRange(this.focusPosition,this.focusPosition);this.focusField=null;}
  if(this.restoreTraitsFocus){this.restoreTraitsFocus=false;this.element.querySelector('[data-catalog-trait-input]')?.focus({preventScroll:true});}
  for(const el of this.element.querySelectorAll('[data-drag-uuid]'))el.addEventListener('dragstart',event=>event.dataTransfer.setData('text/plain',JSON.stringify({type:el.dataset.dragType,uuid:el.dataset.dragUuid})));
 }
 static async loadMore(){this.visibleLimit=(this.visibleLimit??60)+60;await this.render({force:true});}
 static async retry(){this.rows=null;await this.render({force:true});}
 static async switchCategory(event,target){
  const id=target.dataset.category;if(!catalogTabs(game.user.isGM).some(t=>t.id===id)||id===this.activeCategory)return;
  clearTimeout(this.timer);this.savedFilters.set(this.activeCategory,structuredClone(this.filters));this.activeCategory=id;this.filters={...(this.savedFilters.get(id)??defaults()),allCategories:false};await this.render({force:true});
 }
 static async clearFilters(){clearTimeout(this.timer);this.filters=defaults();await this.render({force:true});}
 static async clearTraits(){this.filters.traits=[];this.filters.excludedTraits=[];await this.render({force:true});}
 static async removeTrait(event,target){for(const key of ['traits','excludedTraits'])this.filters[key]=this.filters[key].filter(id=>id!==target.dataset.traitId);await this.render({force:true});}
 static async toggleTrait(event,target){const id=target.dataset.traitId,key=this.filters.excludedTraits.includes(id)?'traits':'excludedTraits',other=key==='traits'?'excludedTraits':'traits';this.filters[other]=this.filters[other].filter(t=>t!==id);this.filters[key]=[...new Set([...this.filters[key],id])];await this.render({force:true});}
 static async reverseSort(){this.filters.direction=this.filters.direction==='asc'?'desc':'asc';await this.render({force:true});}
 static async open(event,target){
  const row=this.rows.find(r=>r.id===target.dataset.id);if(!row||!sourceAvailable(row)||!mayBrowseCatalogRow(row,game.user.isGM))return;
  if(row.uuid){const item=await fromUuid(row.uuid);if(item?.testUserPermission(game.user,'OBSERVER'))await item.sheet.render({force:true});return;}
  const def=POWER_DEFINITIONS.find(d=>d.id===row.id)??EFFECT_DEFINITIONS.find(d=>d.id===row.id);if(!def)return;
  await DialogV2.wait({window:{title:row.name},content:'<h2>'+escapeHtml(row.name)+'</h2><p>'+escapeHtml(row.source)+'</p><p>'+escapeHtml(def.notes??def.access??'Escolha este componente no poder do personagem.')+'</p><p>Componente para criar jutsus. As condições aplicadas aparecem em Efeitos.</p>',buttons:[{action:'close',label:'Fechar',default:true}]});
 }
 static async add(event,target){
  if(!this.actor?.isOwner)return;const row=this.rows.find(r=>r.id===target.dataset.id);if(!row?.canAdd||!sourceAvailable(row)||row.documentName==='Actor'||!mayBrowseCatalogRow(row,game.user.isGM))return;
  const builtin=POWER_DEFINITIONS.find(d=>d.id===row.id);if(builtin){await this.actor.createEmbeddedDocuments('Item',[{name:builtin.name,type:'power',system:{level:0,category:'powers',power:{definitionId:builtin.id},details:{organization:'effects',powerOrigin:'common',keyAttribute:builtin.attribute},source:{id:builtin.source.id,edition:'Básico4.1b',pages:builtin.source.pages}}}]);return ui.notifications.info('Registro criado em nível0. Confira a aquisição na ficha.');}
  const item=await fromUuid(row.uuid);if(!item?.testUserPermission(game.user,'OBSERVER'))return;let data=carryRequirementProfile(item,item.toObject(),item.uuid);delete data._id;data=await chooseCanonicalCopy(data,this.library);if(!data)return;
  if(data.type==='power'&&data.system.power)data.system.power.choices=[];if(data.type==='jutsu'&&this.actor.items.has(this.powerId))data.system.details.powerId=this.powerId;
  const created=await this.actor.createEmbeddedDocuments('Item',[data]);if(created.length){ui.notifications.info('Adicionado à ficha.');await this.render({force:true});}
 }
 async _onClose(options){clearTimeout(this.timer);this.disposeTraits?.();await super._onClose(options);}
}
const EQUIPMENT_TAB_ROWS=new Set(['equipment']);
