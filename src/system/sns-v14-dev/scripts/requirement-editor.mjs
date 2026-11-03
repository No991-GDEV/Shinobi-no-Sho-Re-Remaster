import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {ITEM_RULES,itemRuleId,requirementsFor} from './item-requirements.mjs';
import {requirementProfile,validateRequirementProfile,validateRequirementTree} from './requirement-policy.mjs';
import {SKILLS} from './rules.mjs';
import {ATTRIBUTES} from './kernel.mjs';
import {ACCESS_ORIGINS} from './restricted-access.mjs';
import {EFFECT_DEFINITIONS,POWER_DEFINITIONS} from '../data/power-definitions.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const types={attribute:'Atributo mínimo',skillLevel:'Nível de perícia',owned:'Possuir aptidão / regra',ownedChoice:'Possuir regra com uma escolha',powerLevel:'Nível de poder',effectKnown:'Efeito aprendido',access:'Origem / clã',actorType:'Tipo de ficha',nc:'NC mínimo',all:'Todos os requisitos do grupo',any:'Uma das alternativas'};
const opts=(rows,value)=>rows.map(([key,label])=>'<option value="'+esc(key)+'" '+(key===value?'selected':'')+'>'+esc(label)+'</option>').join('');
const make=kind=>kind==='all'?{kind,options:[]}:kind==='any'?{kind,options:[make('attribute')]}:kind==='attribute'?{kind,key:'vig',min:3,label:'Vigor'}:kind==='skillLevel'?{kind,key:'acrobacia',min:1,label:'Nível de Acrobacia'}:kind==='access'?{kind,key:'uchiha'}:kind==='actorType'?{kind,types:['npc'],label:'Exclusivo de NPC'}:kind==='nc'?{kind,min:4,label:'Nível de campanha'}:{kind,id:kind==='effectKnown'?'sns:effect:barreira':kind==='powerLevel'?'sns:power:katon':'sns:apt:acuidade',...(kind==='ownedChoice'?{choice:''}:{}),...(['powerLevel','effectKnown'].includes(kind)?{min:1}:{}),label:kind==='effectKnown'?'Barreira':kind==='powerLevel'?'Katon':'Acuidade'};
export function switchRequirementKind(node,kind){
 if(!Object.hasOwn(types,kind))throw Error('Tipo de requisito inválido.');
 if(['all','any'].includes(kind))return {kind,options:['all','any'].includes(node.kind)?structuredClone(node.options):[structuredClone(node)]};
 return make(kind);
}
export class SnsRequirementEditor extends SnsHandlebarsApplicationMixin(foundry.applications.api.ApplicationV2){
 static DEFAULT_OPTIONS={classes:['sns-editor-dialog','sns-requirement-editor'],position:{width:760,height:640},window:{title:'Requisitos do item',resizable:true},actions:{add:SnsRequirementEditor.add,remove:SnsRequirementEditor.remove,save:SnsRequirementEditor.save,restore:SnsRequirementEditor.restore,useBook:SnsRequirementEditor.useBook}};
 static PARTS={editor:{scrollable:['','.requirement-tree'],template:'systems/sns-v14-dev/templates/requirement-editor.hbs'}};
 constructor(item){super();this.item=item;this.scope=['weapon','armor','shield','equipment','consumable','ammunition','container','treasure','kit','document','service'].includes(item.type)?'use':'acquisition';const profile=requirementProfile(item);this.draft=profile?structuredClone(profile):{mode:'append',scope:this.scope,tree:make('all'),source:item.system.source?.id??'',reason:''};}
 canEdit(){return game.user.isGM&&this.item.isOwner;}
 node(path){return path?path.split('.').reduce((n,index)=>n.options[Number(index)],this.draft.tree):this.draft.tree;}
 nodeHtml(node,path='',root=false){
  const select=(field,rows,value)=>'<select data-path="'+path+'" data-field="'+field+'" aria-label="'+esc(field==='kind'?'Tipo de requisito':field==='key'?'Atributo, perícia ou origem':'Regra exigida')+'">'+opts(rows,value)+'</select>';
  let html='<div class="requirement-node"><div class="requirement-node-controls">'+select('kind',Object.entries(types),node.kind);
  if(node.kind==='attribute')html+=select('key',ATTRIBUTES.map(([k,,label])=>[k,label]),node.key);
  if(node.kind==='skillLevel')html+=select('key',SKILLS.map(s=>[s.key,s.name]),node.key);
  if(node.kind==='access')html+=select('key',Object.entries(ACCESS_ORIGINS),node.key);
  if(['owned','ownedChoice','powerLevel','effectKnown'].includes(node.kind)){
   const rows=node.kind==='effectKnown'?EFFECT_DEFINITIONS.map(e=>[e.id,e.name]):Object.entries(ITEM_RULES).filter(([id])=>node.kind!=='powerLevel'||id.startsWith('sns:power:')).map(([id,r])=>[id,r.name]);
   if(node.kind==='powerLevel')for(const p of POWER_DEFINITIONS)if(!rows.some(([id])=>id===p.id))rows.push([p.id,p.name]);
   if(node.id&&!rows.some(([id])=>id===node.id))rows.push([node.id,node.label||node.id]);
   html+=select('id',rows.sort((a,b)=>a[1].localeCompare(b[1],'pt-BR')),node.id);
  }
  if(['attribute','skillLevel','powerLevel','effectKnown','nc'].includes(node.kind))html+='<label class="requirement-min">Mínimo<input type="number" min="1" max="100" step="1" value="'+node.min+'" data-path="'+path+'" data-field="min"></label>';
  if(node.kind==='ownedChoice')html+='<label>Chave da escolha<input value="'+esc(node.choice??'')+'" placeholder="Ex.: vig, furtividade, desarmado" data-path="'+path+'" data-field="choice"></label>';
  if(node.kind==='actorType')html+=select('types',[['shinobi','Jogador'],['npc','NPC'],['companion','Companheiro']],node.types?.[0]);
  if(node.kind==='effectKnown')html+='<label>Poder específico (opcional)<input value="'+esc(node.powerId??'')+'" placeholder="sns:power:doton" data-path="'+path+'" data-field="powerId"></label>';
  if(!root)html+='<button type="button" data-action="remove" data-path="'+path+'" aria-label="Remover requisito"><i class="fa-solid fa-trash"></i></button>';
  html+='</div>';
  if(['all','any'].includes(node.kind))html+='<div class="requirement-children">'+node.options.map((n,i)=>this.nodeHtml(n,path?path+'.'+i:String(i))).join('')+'<button type="button" data-action="add" data-path="'+path+'"><i class="fa-solid fa-plus"></i> Requisito</button></div>';
  return html+'</div>';
 }
 async _prepareContext(){
  const base=ITEM_RULES[itemRuleId(this.item)];
  return {name:this.item.name,allowed:this.canEdit(),source:this.draft.source,reason:this.draft.reason,append:this.draft.mode==='append',replace:this.draft.mode==='replace',nodes:this.nodeHtml(this.draft.tree,'',true),bookSource:base?.source??base?.pages??'',bookRows:requirementsFor({type:this.item.type,system:this.item.system},this.item.actor).rows};
 }
 async _onRender(context,options){await super._onRender(context,options);this._changeRoot?.removeEventListener('change',this._changeHandler,true);if(!this.canEdit())return;
  this._changeRoot=this.element;this._changeHandler=event=>{
   if(!this.canEdit())return;
   const el=event.target;
   if(el.name&&['mode','source','reason'].includes(el.name)){this.draft[el.name]=el.value;return;}
   if(!el.dataset.field)return;const path=el.dataset.path,node=this.node(path),field=el.dataset.field;
   if(field==='kind'){const next=switchRequirementKind(node,el.value);if(!path)this.draft.tree=next;else{const parts=path.split('.'),index=parts.pop();this.node(parts.join('.')).options[Number(index)]=next;}void this.render({force:true});return;}
   node[field]=field==='min'?Number(el.value):field==='types'?[el.value]:el.value;
   if(['key','id'].includes(field)&&node.kind!=='access')node.label=el.selectedOptions?.[0]?.textContent??el.value;
  };this.element.addEventListener('change',this._changeHandler,true);
 }
 static async add(event,target){if(!this.canEdit())return;const n=this.node(target.dataset.path);if(!['all','any'].includes(n.kind))return;n.options.push(make('attribute'));await this.render({force:true});}
 static async remove(event,target){if(!this.canEdit()||!target.dataset.path)return;const p=target.dataset.path.split('.'),i=Number(p.pop());this.node(p.join('.')).options.splice(i,1);await this.render({force:true});}
 static async useBook(){if(!this.canEdit())return;try{this.draft.tree=validateRequirementTree({kind:'all',options:structuredClone(ITEM_RULES[itemRuleId(this.item)]?.requirements??[])});this.draft.mode='replace';await this.render({force:true});}catch(error){ui.notifications.warn('Esta regra contém condições especiais. Use Complementar para preservá-las. '+error.message);}}
 async write(profile){
  if(!this.canEdit())return;
  const before=structuredClone(requirementProfile(this.item)),at=new Date().toISOString(),user=game.user.id;
  const history=[...(this.item.flags?.['sns-v14-dev']?.requirementsHistory??[]),{before,after:profile,user,at}];
  await this.item.update({'flags.sns-v14-dev.requirements':profile,'flags.sns-v14-dev.requirementsSource':'','flags.sns-v14-dev.requirementsHistory':history});
  await this.close();
 }
 static async save(){if(!this.canEdit())return;try{
  // Read the current controls as well as change events. Some input methods
  // update the visible value without dispatching a final change before Save.
  for(const el of this.element.querySelectorAll('[data-field]')){
   const field=el.dataset.field,node=this.node(el.dataset.path);if(field==='kind'){if(node.kind!==el.value)throw Error('Aguarde a atualização do tipo de requisito antes de salvar.');continue;}
   node[field]=field==='min'?Number(el.value):field==='types'?[el.value]:el.value;
   if(['key','id'].includes(field)&&node.kind!=='access')node.label=el.selectedOptions?.[0]?.textContent??el.value;
  }
  for(const key of ['mode','source','reason'])this.draft[key]=this.element.querySelector('[name="'+key+'"]').value;
  const profile=validateRequirementProfile({...this.draft,scope:this.scope,author:game.user.id,at:new Date().toISOString()});await this.write(profile);
 }catch(error){ui.notifications.warn(error.message);}}
 static async restore(){if(!this.canEdit())return;await this.write(null);}
}
