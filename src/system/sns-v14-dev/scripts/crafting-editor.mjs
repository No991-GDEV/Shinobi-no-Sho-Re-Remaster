import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {CRAFT_TESTS,CRAFT_PHYSICAL,craftProfile,validateCraftProfile} from './crafting-core.mjs';
import {loadCanonicalLibrary} from './canonical-content.mjs';
import {isCraftFormula,poisonRecipe,poisonProfileFields,RECIPE_SOURCES,CULINARY_STAGES} from './poison-crafting.mjs';
const ns='sns-v14-dev',path='systems/sns-v14-dev';

export async function craftChoices(actor){
 const library=await loadCanonicalLibrary(),materials=new Map(),products=new Map();
 for(const e of library?.entries??[])if(CRAFT_PHYSICAL.includes(e.document.type)){
  materials.set(e.id,{value:e.id,label:e.document.name});products.set('canonical:'+e.id,{value:'canonical:'+e.id,label:e.document.name+' · livro'});
 }
 for(const item of [...game.items.contents,...Array.from(actor?.items??[])])if(CRAFT_PHYSICAL.includes(item.type)&&item.testUserPermission(game.user,'OBSERVER')){
  const id=item.system.contentId||item._stats?.compendiumSource||item.uuid;
  materials.set(id,{value:id,label:item.name});products.set(item.uuid,{value:item.uuid,label:item.name+(item.actor?' · ficha':' · mundo')});
 }
 const sorted=map=>[...map.values()].sort((a,b)=>a.label.localeCompare(b.label,'pt-BR'));
 return {materials:sorted(materials),products:sorted(products)};
}

export class SnsCraftProfileEditor extends SnsHandlebarsApplicationMixin(foundry.applications.api.ApplicationV2){
 static DEFAULT_OPTIONS={classes:['sns-editor-dialog','sns-craft-editor'],position:{width:760,height:720},window:{title:'Configurar preparo',resizable:true},actions:{add:SnsCraftProfileEditor.add,remove:SnsCraftProfileEditor.remove,save:SnsCraftProfileEditor.save,requirements:SnsCraftProfileEditor.requirements}};
 static PARTS={form:{template:path+'/templates/crafting-editor.hbs',scrollable:['']}};
 constructor(item,options={}){
  super(options);this.item=item;this.original=JSON.stringify(craftProfile(item));
  const poison=poisonRecipe(item),recipe=RECIPE_SOURCES[item.system.contentId];
  this.draft=structuredClone(craftProfile(item)??{version:1,revision:1,kind:poison?'poison':recipe?'cooking':'simple',source:poison?.source??recipe?.source??[item.system.source?.id,item.system.source?.pages].filter(Boolean).join(' · '),note:'',requirementsReviewed:false,minutes:null,cost:null,yield:1,failure:'',steps:[],ingredients:[],tools:[],output:{kind:'formula'},...(poison?poisonProfileFields({poison:{id:poison.id,idealMinutes:null}}):{})});
 }
 canEdit(){return game.user.isGM&&this.item.isOwner&&isCraftFormula(this.item);}
 async _prepareContext(){
  if(!this.canEdit())throw Error('O mestre configura as fórmulas que pode editar.');
  this.choices=await craftChoices(this.item.actor);
  const options=(rows,value)=>[{value:'',label:'Selecionar…',selected:!value},...rows.map(row=>({...row,selected:row.value===value})),...(value&&!rows.some(row=>row.value===value)?[{value,label:'Referência · '+value,selected:true}]:[])];
  const rows=key=>this.draft[key].map((row,index)=>({...row,index,options:options(this.choices.materials,row.identity)}));
  const recipe=RECIPE_SOURCES[this.item.system.contentId],poison=poisonRecipe(this.item),difficulty=recipe?.difficulty??Number(this.item.system.details.difficulty),band=recipe?.band;
  return {name:this.item.name,draft:this.draft,recipe,poison,simple:this.draft.kind==='simple',cooking:this.draft.kind==='cooking',culinaryStages:CULINARY_STAGES.map((s,index)=>({...s,index})),reference:this.draft.output.kind==='reference',failureAll:this.draft.failure==='all',failureNone:this.draft.failure==='none',steps:this.draft.steps.map((row,index)=>({...row,index,tests:CRAFT_TESTS.map(t=>({...t,selected:t.key===row.key}))})),ingredients:rows('ingredients'),tools:rows('tools'),outputs:options(this.choices.products,this.draft.output.uuid),hint:recipe?(band?'Referência para Dif '+difficulty+': '+band[0]+'–'+band[1]+' Ryo por porção; '+band[2]+'–'+band[3]+' minutos (Ryōri no Sho1.2, p.8). Escolha os valores desta fórmula.':'O livro não fornece uma faixa numérica de custo/tempo para esta dificuldade. Defina os valores da mesa.'):'',difficulty};
 }
 capture(){
  if(!this.element?.isConnected)return;const value=name=>this.element.querySelector('[name="'+name+'"]')?.value;
  for(const key of ['kind','source','note','failure'])this.draft[key]=value(key)??this.draft[key];
  for(const key of ['minutes','cost','yield']){const raw=value(key);this.draft[key]=raw===''?null:Number(raw);}
  this.draft.requirementsReviewed=this.element.querySelector('[name="requirementsReviewed"]')?.checked===true;
  if(this.draft.kind==='poison'){const raw=value('idealMinutes');this.draft.poison={...this.draft.poison,mode:'field',idealMinutes:raw===''?null:Number(raw)};}
  this.draft.output={kind:value('outputKind')??'formula',uuid:value('outputUuid')??this.draft.output.uuid??''};
  this.draft.steps=Array.from(this.element.querySelectorAll('[data-craft-step]')).map(row=>({label:row.querySelector('[data-field="label"]').value,key:row.querySelector('[data-field="key"]').value,dc:Number(row.querySelector('[data-field="dc"]').value)}));
  for(const key of ['ingredients','tools'])this.draft[key]=Array.from(this.element.querySelectorAll('[data-craft-group="'+key+'"]')).map(row=>{const identity=row.querySelector('select').value;return {identity,name:this.choices.materials.find(r=>r.value===identity)?.label??this.draft[key][Number(row.dataset.index)]?.name??'',quantity:Number(row.querySelector('input').value)};});
 }
 async _onRender(context,options){await super._onRender(context,options);this.element.querySelector('[name="outputKind"]')?.addEventListener('change',async()=>{this.capture();await this.render({force:true});});}
 static async add(event,target){if(!this.canEdit())return;this.capture();const key=target.dataset.group;if(!['steps','ingredients','tools'].includes(key))return;const stage=CULINARY_STAGES[Number(target.dataset.stage)];this.draft[key].push(key==='steps'?{...(stage??{label:'Etapa '+(this.draft.steps.length+1),key:'attribute:des'}),dc:RECIPE_SOURCES[this.item.system.contentId]?.difficulty??(Number(this.item.system.details.difficulty)||8)}:{identity:'',name:'',quantity:1});await this.render({force:true});}
 static async remove(event,target){if(!this.canEdit())return;this.capture();const key=target.dataset.group,index=Number(target.dataset.index);if(['steps','ingredients','tools'].includes(key)&&Number.isInteger(index))this.draft[key].splice(index,1);await this.render({force:true});}
 static async requirements(){if(!this.canEdit())return;this.capture();const {SnsRequirementEditor}=await import('./requirement-editor.mjs');await new SnsRequirementEditor(this.item).render({force:true});}
 static async save(){
  if(!this.canEdit())return;try{
   this.capture();if(JSON.stringify(craftProfile(this.item))!==this.original)throw Error('A configuração mudou em outra janela. Reabra o editor.');
   const before=craftProfile(this.item),after=validateCraftProfile({...this.draft,revision:(before?.revision??0)+1});
   await this.item.update({['flags.'+ns+'.craftProfile']:after,['flags.'+ns+'.craftProfileSource']:this.item.uuid,['flags.'+ns+'.craftProfileHistory']:[...(this.item.getFlag(ns,'craftProfileHistory')??[]),{before,after,user:game.user.id,at:new Date().toISOString()}]});
   await this.close();
  }catch(error){ui.notifications.warn(error.message);}
 }
}
