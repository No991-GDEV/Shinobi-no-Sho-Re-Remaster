import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {loadCanonicalLibrary,canonicalCopy} from './canonical-content.mjs';
import {newNpcBuildDraft,npcBuildCatalog,npcOriginOptions} from './npc-build-planner.mjs';
import {buildNpcPreview} from './npc-build-core.mjs';
import {NPC_VILLAGES,NPC_ELEMENTS,NPC_FOCUSES,NPC_ROLES,NPC_STYLES} from '../data/npc-build-profiles.mjs';
import {PUPPET_DEVICES} from '../data/npc-puppet-devices.mjs';
import {jionguCapacity} from './npc-repertoire-core.mjs';
import {PACKAGE_ORIGINS} from '../data/package-content.mjs';
import {aptitudeChoiceOptions} from './aptitude-choices.mjs';
import {createGeneratedNpc} from './npc-generator-service.mjs';
import {encounterAdvice,encounterTable} from './npc-encounter.mjs';
import {captureGeneratorView,restoreGeneratorView,revealGeneratorSection} from './npc-generator-view-state.mjs';
const choose=(rows,current)=>rows.map(r=>({...r,value:r.id,selected:current===r.id}));
export class SnsNpcGenerator extends SnsHandlebarsApplicationMixin(foundry.applications.api.ApplicationV2){
 static DEFAULT_OPTIONS={tag:'form',classes:['sns-editor-dialog','sns-npc-generator'],position:{width:900,height:850},window:{title:'Gerador de NPCs e capangas',resizable:true},form:{closeOnSubmit:false,handler:()=>{}},actions:{retry:SnsNpcGenerator.retry,create:SnsNpcGenerator.create,reset:SnsNpcGenerator.reset,shuffle:SnsNpcGenerator.shuffle,cancel:SnsNpcGenerator.cancel}};
 static PARTS={body:{template:'systems/sns-v14-dev/templates/npc-generator.hbs',scrollable:['','.npc-generator-preview']}};
 constructor(options={}){super();this.draft={...newNpcBuildDraft(),...options};this.library=null;this.pending=false;this.requestId=crypto.randomUUID();this.search='';}
 async _replaceHTML(result,content,options){const state=captureGeneratorView(content);await super._replaceHTML(result,content,options);restoreGeneratorView(content,state);}
 async _prepareContext(){
  if(!this.library)this.library=await loadCanonicalLibrary();let preview=null,error='',fallback=null;
  try{preview=buildNpcPreview(this.draft,this.library);if(preview.problems.length)error=preview.problems.join(' ');}catch(e){error=e.message;try{fallback=buildNpcPreview({...this.draft,pins:{}},this.library);}catch{}}
  const p=preview??fallback,catalog=this.library?npcBuildCatalog(this.library):new Map(),rows=p?.abilityRows??[],originIds=new Set(rows.map(r=>r.id)),actual=new Map(p?.plan.items.map(i=>[i.system.ruleId||i.system.contentId,i])??[]);
  const buys=(this.additionalOpen?[...catalog.values()]:[]).filter(r=>!originIds.has(r.id)).map(r=>{const item=actual.get(r.id),pin=this.draft.pins[r.id],doc=canonicalCopy(r.entry,r.variant);return {id:r.id,name:r.name,isPower:r.type==='power',level:pin?.level??item?.system.level??1,maxLevel:Math.floor(this.draft.nc/2),selected:pin?.selected??!!item,description:r.entry.document.system.description,options:aptitudeChoiceOptions(doc).map(o=>({...o,selected:o.id===(pin?.choiceKey??item?.system.choice?.key)}))};});
  for(const r of rows){const pin=this.draft.pins[r.id];if(pin){r.selected=pin.selected;r.level=pin.level??r.level;for(const o of r.options)o.selected=o.id===(pin.choiceKey??r.choiceKey);}}
  const origins=(this.library?npcOriginOptions(this.library,this.draft.village,this.draft.foreignOrigin):[]).filter(o=>o.compatible),species=Object.values(PACKAGE_ORIGINS).filter(p=>p.species).map(p=>({id:p.species,name:p.name.replace('Kuchiyose: ','')}));
  const totals=p?.attributes?Object.entries(p.attributes).map(([key,value])=>({label:key.toUpperCase(),value})):[];
  let encounter=null,table=null;try{encounter=encounterAdvice({partyNC:this.draft.partyNC,players:this.draft.players,hasArea:this.draft.partyArea});table=encounterTable({partyNC:this.draft.partyNC,hasArea:this.draft.partyArea});}catch{}
  this.descriptions=new Map((p?.choices??[]).map(r=>[r.id,r.description]));for(const r of rows)this.descriptions.set(r.id,r.description);
  return {summaryStyle:NPC_STYLES.find(r=>r.id===this.draft.style)?.name??'',summaryOrigin:origins.find(r=>r.id===this.draft.origin)?.name??'Sem origem especial',libraryError:!this.library,draft:this.draft,preview,error,canCreate:!!preview&&!error&&!this.pending,isBusy:this.pending,styles:choose(NPC_STYLES,this.draft.style),roles:choose(NPC_ROLES,this.draft.role),focuses:choose(NPC_FOCUSES,this.draft.focus),villages:choose(NPC_VILLAGES,this.draft.village),elements:choose(NPC_ELEMENTS,this.draft.element),origins:choose(origins,this.draft.origin),species:choose(species,this.draft.summonSpecies),isMinion:this.draft.role==='minion',isUchiha:this.draft.origin==='uchiha'&&this.draft.nc>=16,isSummoner:this.draft.focus==='summon',isPuppeteer:this.draft.focus==='puppet'||this.draft.origin==='kugutsu',isJiongu:this.draft.origin==='jiongu',isFalseBijuu:this.draft.origin==='hb-f05-jinchuuriki-falso',isDrawing:!!actual.get('sns:power:pergaminho-da-super-besta'),
   hearts:this.draft.jionguHearts.map((value,index)=>({index,label:'Coração '+(index+1),disabled:index>=jionguCapacity(actual.get('sns:power:jiongu')?.system.level??1),options:choose([{id:'',name:'Espaço vazio'},...NPC_ELEMENTS.filter(e=>['katon','suiton','doton','raiton','fuuton'].includes(e.id))],value)})),
   puppetSizes:choose([{id:'auto',name:'Maior permitido'},...['Pequeno','Médio','Grande'].map(id=>({id,name:id}))],this.draft.puppetSize),puppetPresets:choose([{id:'attack',name:'Ofensiva'},{id:'defense',name:'Defensiva'},{id:'capture',name:'Captura'},{id:'custom',name:'Escolher dispositivos'}],this.draft.puppetPreset),customPuppet:this.draft.puppetPreset==='custom',devices:Object.entries(PUPPET_DEVICES).map(([slug,def])=>({slug,name:((this.library?.entries??[]).find(e=>e.id==='sns:equipment:dispositivo-'+slug)?.document.name??slug).replace(/^Dispositivo:\s*/,''),checked:this.draft.puppetDevices.some(d=>d.slug===slug),slots:choose((def.slots.length?def.slots:['']).map(id=>({id,name:{l:'Leve',p:'Padrão',g:'Grande','':'Sem encaixes'}[id]})),this.draft.puppetDevices.find(d=>d.slug===slug)?.slot??def.slots[0]??'')})),
   secondElements:choose(NPC_ELEMENTS.filter(e=>['none','katon','suiton','doton','raiton','fuuton'].includes(e.id)).map(e=>e.id==='none'?{id:e.id,name:'Nenhum'}:e),this.draft.secondElement),sizes:choose(['Minúsculo','Diminuto','Miúdo','Pequeno','Médio','Grande','Enorme','Imenso','Colossal','Incrível'].map(id=>({id,name:id})),this.draft.size),attributes:totals,stats:p?Object.entries(p.stats).map(([key,value])=>({value,label:{cc:'Corpo a corpo',cd:'À distância',esq:'Esquiva',lm:'Ler movimento',initiative:'Iniciativa',movement:'Movimento (m)'}[key]})):[],abilityRows:rows,purchases:buys,encounter,table,search:this.search,
   weapons:choose([{id:'',name:'Sem arma'},...(this.library?.entries??[]).filter(e=>e.document.type==='weapon').map(e=>({id:e.id,name:e.document.name}))],this.draft.weapon)};
 }
 capture(){
  for(const f of this.element.querySelectorAll('[data-field]')){const k=f.dataset.field;this.draft[k]=f.type==='checkbox'?f.checked:f.type==='number'?Number(f.value):f.value;}
  for(const f of this.element.querySelectorAll('[data-heart]'))this.draft.jionguHearts[Number(f.dataset.heart)]=f.value;
  if(this.draft.puppetPreset==='custom')this.draft.puppetDevices=[...this.element.querySelectorAll('[data-device]')].filter(e=>e.querySelector('[data-device-check]').checked).map(e=>({slug:e.dataset.device,slot:e.querySelector('[data-device-slot]').value}));
  const event=this.element.querySelector('[data-trauma]');if(event)this.draft.events.mangekyouTrauma=event.checked;
  const boxes=[...this.element.querySelectorAll('[data-technique]')];if(boxes.length)this.draft.excludedTechniques=boxes.filter(e=>!e.checked).map(e=>e.dataset.technique);
 }
 static async retry(){this.library=null;await this.render({force:true});}
 async _onRender(context,options){
  await super._onRender(context,options);
  for(const e of this.element.querySelectorAll('[data-field],[data-trauma],[data-technique],[data-effect],[data-purchase-check],[data-purchase-level],[data-purchase-choice],[data-heart],[data-device-check],[data-device-slot]'))e.addEventListener('change',async()=>{
   this.capture();
   if(e.dataset.field==='nc')for(const pin of Object.values(this.draft.pins))if(pin.level)pin.level=Math.min(pin.level,Math.floor(this.draft.nc/2));
   if(e.dataset.field==='village'||e.dataset.field==='foreignOrigin')if(this.draft.origin&&!npcOriginOptions(this.library,this.draft.village,this.draft.foreignOrigin).some(o=>o.id===this.draft.origin&&o.compatible)){this.draft.origin='';this.draft.pins={};this.draft.effects={};}
   if(e.dataset.field==='origin'){this.draft.pins={};this.draft.effects={};this.draft.excludedTechniques=[];}
   if(e.dataset.field==='focus'&&this.draft.focus==='puppet'&&!this.draft.origin)this.draft.origin='kugutsu';
   const row=e.closest('[data-purchase]');if(row){const id=row.dataset.purchase;this.draft.pins[id]={selected:row.querySelector('[data-purchase-check]').checked,level:Number(row.querySelector('[data-purchase-level]')?.value??1),...(row.querySelector('[data-purchase-choice]')?{choiceKey:row.querySelector('[data-purchase-choice]').value}:{})};}
   if(e.dataset.effect){this.draft.effects[e.dataset.effect]??={};this.draft.effects[e.dataset.effect][e.dataset.slot]=e.value;}
   clearTimeout(this.recalculateTimer);this.recalculateTimer=setTimeout(()=>this.render({force:true}),120);
  });
  const additional=this.element.querySelector('[data-view-key=additional-purchases]');additional?.addEventListener('toggle',()=>{if(this.additionalOpen!==additional.open){this.additionalOpen=additional.open;void this.render({force:true});}});
  for(const detail of this.element.querySelectorAll('details[data-view-key]')){const load=()=>{if(!detail.open)return;const content=detail.querySelector('[data-lazy-description]');if(content&&!content.childNodes.length)content.innerHTML=this.descriptions.get(content.dataset.lazyDescription)??'';};detail.addEventListener('toggle',load);load();}
  const search=this.element.querySelector('[data-search]');search?.addEventListener('input',()=>{this.search=search.value;this.filterPurchases();});this.filterPurchases();
  for(const detail of this.element.querySelectorAll('details[data-view-key]'))detail.addEventListener('toggle',()=>{if(detail.open&&detail.firstElementChild===detail.ownerDocument.activeElement)requestAnimationFrame(()=>{const panel=detail.closest('.npc-generator-preview');if(panel)revealGeneratorSection(panel,detail);});});
 }
 filterPurchases(){const s=this.search.toLocaleLowerCase('pt-BR');for(const row of this.element.querySelectorAll('[data-search-name]'))row.hidden=!row.dataset.searchName.toLocaleLowerCase('pt-BR').includes(s);}
 static async reset(){if(this.pending)return;this.capture();this.draft.pins={};this.draft.effects={};this.draft.excludedTechniques=[];await this.render({force:true});}
 static async shuffle(){if(this.pending)return;this.capture();this.draft.seed=crypto.getRandomValues(new Uint32Array(1))[0]||1;this.draft.effects={};await this.render({force:true});}
 static async cancel(){if(!this.pending)await this.close();}
 static async create(){
  if(!game.user.isGM||this.pending)return;this.capture();this.pending=true;await this.render({force:true});
  try{const actor=await createGeneratedNpc(this.draft,this.library,this.requestId);await this.close();await actor.sheet.render({force:true});}catch(e){ui.notifications.warn(e.message);}finally{this.pending=false;if(this.rendered)await this.render({force:true});}
 }
}
let generator;
export async function openNpcGenerator(){if(!game.user.isGM)return null;if(!generator?.rendered)generator=new SnsNpcGenerator();await generator.render({force:true});return generator;}
export function installNpcGeneratorHooks(){
 Hooks.on('renderActorDirectory',(app,element)=>{const root=element instanceof HTMLElement?element:element?.[0];if(!root)return;root.querySelector('.sns-open-npc-generator')?.remove();if(!game.user.isGM)return;const host=root.querySelector('.header-actions')??root.querySelector('.directory-header')??root;const b=document.createElement('button');b.type='button';b.className='sns-open-npc-generator';b.innerHTML='<i class="fa-solid fa-dice"></i> Gerar NPC / capanga';b.addEventListener('click',()=>openNpcGenerator().catch(e=>ui.notifications.warn(e.message)));host.append(b);});
}
