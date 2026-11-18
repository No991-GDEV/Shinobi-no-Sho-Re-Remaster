import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {mountAutocomplete} from './autocomplete.mjs';
import {learnedEffects,resolveJutsu,availableChoices,jutsuTraits,jutsuVariants,ownedPowerDefinition} from './power-core.mjs';
import {loadCanonicalLibrary} from './canonical-content.mjs';
import {SnsJutsuManager} from './jutsu-manager.mjs';
import {itemCategory} from './sheet-profiles.mjs';
import {OVERRIDE_FIELDS,overrideProblems} from './override-policy.mjs';
import {RESISTANCE_KEYS} from './jutsu-outcomes.mjs';
import {escapeHtml} from './kernel.mjs';
const {ApplicationV2}=foundry.applications.api;
const DIRECT_CHECKS=[['cc','Combate corpo a corpo'],['cd','Combate à distância'],['lm','Ler movimento'],...RESISTANCE_KEYS.map(r=>[r.key,r.name])];
const DIRECT_SAVES=RESISTANCE_KEYS.slice(0,12);
const DIRECT_MODES=[['none','Sem teste automático (apenas custo e descrição)'],['check','Teste de atributo ou perícia (ex.: Kai, Henge)'],['attack:cc','Ataque corpo a corpo (CC)'],['attack:cd','Ataque à distância (CD)'],['attack:lm','Ataque com Ler Movimento (LM)'],['save','Resistência do alvo (ex.: Vigor, Agilidade, Inteligência)']];
const plainText=html=>String(html??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
export function initialDirectDraft(item=null){
 const cfg=item?.flags?.['sns-v14-dev']?.directJutsuConfig??{},d=item?.system?.details??{};
 const costRaw=Number.isInteger(cfg.cost)?cfg.cost:(/^\d+$/.test(String(d.chakraCost??'').trim())?String(Number(d.chakraCost)):'1');
 const baseRaw=Number.isInteger(cfg.base)&&!cfg.noDamage?cfg.base:(/^\d+$/.test(String(d.damage??'').trim())?String(Number(d.damage)):'');
 return {action:cfg.action||d.action||'Padrão',range:cfg.range||d.range||'Pessoal',duration:cfg.duration||d.duration||'Instantânea',cost:String(costRaw),mode:cfg.mode||'none',checkKey:cfg.checkKey||'attribute:esp',saveKey:cfg.saveKeys?.[0]||'attribute:vig',dc:Number.isInteger(cfg.dc)?String(cfg.dc):'12',base:String(baseRaw),descriptionText:plainText(item?.system?.description),descriptionDirty:false};
}
export function buildDirectJutsuPayload({name,powerId='',direct={},existingItem=null}){
 const cleanName=String(name??'').trim();
 if(!cleanName)throw Error('Informe o nome da técnica.');
 const cost=Number(direct.cost);
 if(!Number.isInteger(cost)||cost<0)throw Error('Informe um custo de chakra inteiro (0 ou maior).');
 const mode=DIRECT_MODES.some(([id])=>id===direct.mode)?direct.mode:'none';
 const hasBase=direct.base!==''&&direct.base!==null&&direct.base!==undefined;
 const base=hasBase?Number(direct.base):null;
 if(hasBase&&(!Number.isInteger(base)||base<0))throw Error('Dano base deve ser um inteiro (0 ou maior) ou ficar em branco.');
 const dc=mode==='save'?Number(direct.dc):null;
 if(mode==='save'&&(!Number.isInteger(dc)||dc<1))throw Error('Informe uma dificuldade inteira (1 ou maior) para a resistência.');
 const action=String(direct.action??'').trim()||'Padrão',range=String(direct.range??'').trim()||'Pessoal',duration=String(direct.duration??'').trim()||'Instantânea';
 const checkEntry=DIRECT_CHECKS.find(([k])=>k===direct.checkKey)??DIRECT_CHECKS[0];
 const config={mode,cost,action,range,duration};
 if(mode==='check'){config.checkKey=checkEntry[0];config.checkLabel=cleanName+' · '+checkEntry[1];}
 if(mode==='save'){config.saveKeys=[DIRECT_SAVES.some(s=>s.key===direct.saveKey)?direct.saveKey:'attribute:vig'];config.dc=dc;}
 if(mode.startsWith('attack:')||mode==='save'){if(base===null){config.noDamage=true;config.base=0;}else{config.base=base;config.noDamage=false;}}
 const details={powerId,action,range,duration,chakraCost:String(cost),damage:base!==null?String(base):''};
 const rawText=String(direct.descriptionText??'').trim();
 const description=existingItem&&!direct.descriptionDirty?existingItem.system.description:(rawText?'<p>'+escapeHtml(rawText).replace(/\n+/g,'</p><p>')+'</p>':'');
 return {name:cleanName,details,description,jutsu:{effectId:'',selectionId:'',usedLevel:1,variant:'normal',overrides:[]},config};
}
export class SnsJutsuBuilder extends SnsHandlebarsApplicationMixin(ApplicationV2){
 static DEFAULT_OPTIONS={tag:'form',classes:['sns-editor-dialog','sns-jutsu-builder'],position:{width:680,height:'auto'},window:{title:'Construir jutsu'},form:{handler:SnsJutsuBuilder.save,closeOnSubmit:false},actions:{setMode:SnsJutsuBuilder.setMode,addOverride:SnsJutsuBuilder.addOverride,removeOverride:SnsJutsuBuilder.removeOverride,openBookTechniques:SnsJutsuBuilder.openBookTechniques}};
 static PARTS={builder:{scrollable:[""],template:'systems/sns-v14-dev/templates/jutsu-builder.hbs'}};
 constructor(actor,power=null,item=null){
  super();this.actor=actor;this.item=item;this.powerId=power?.id??item?.system.details.powerId??'';
  this.draft={...item?.system.toObject().jutsu,effectId:item?.system.jutsu.effectId??'',selectionId:item?.system.jutsu.selectionId??'',usedLevel:item?.system.jutsu.usedLevel??1,variant:item?.system.jutsu.variant||'normal',overrides:item?.system.jutsu.overrides.map(x=>({...x}))??[]};
  this.name=item?.name??'';this.selectionConfirmed=!!this.draft.selectionId;
  const guidedPowers=actor.items.filter(i=>itemCategory(i)==='powers'&&!!ownedPowerDefinition(i));
  this.builderMode=item?(this.draft.effectId?'effect':'direct'):(power?!ownedPowerDefinition(power)?'direct':'effect':(guidedPowers.length?'effect':'direct'));
  this.direct=initialDirectDraft(item);
 }
 get power(){return this.actor.items.get(this.powerId);}
 projection(){return resolveJutsu(this.actor,this.power,{system:{jutsu:this.draft}});}
 canSaveDirect(){const cost=Number(this.direct.cost);if(!this.name.trim()||this.direct.cost===''||!Number.isInteger(cost)||cost<0)return false;if(this.direct.mode==='save'){const dc=Number(this.direct.dc);if(!Number.isInteger(dc)||dc<1)return false;}if(this.direct.base!==''&&(!Number.isInteger(Number(this.direct.base))||Number(this.direct.base)<0))return false;return true;}
 async _prepareContext(){
  const effects=this.power?learnedEffects(this.power):[],known=new Map(effects.map(c=>[c.effectId,c])),selected=effects.find(c=>c.id===this.draft.selectionId),project=this.projection();const rule=ownedPowerDefinition(this.power);
  const directMode=this.builderMode==='direct';
  return {directMode,effectMode:!directMode,genjutsu:!directMode&&rule?.id==='sns:power:magen',kikai:!directMode&&rule?.id==='sns:power:kikai-ninpou',hasPower:!!this.power,hasEffectsPower:!!rule,appId:this.id,name:this.name,editing:!!this.item,editable:this.actor.isOwner,canSave:directMode?this.canSaveDirect():(project.valid&&this.selectionConfirmed),
   direct:this.direct,directModes:DIRECT_MODES.map(([id,label])=>({id,label,selected:id===this.direct.mode})),directChecks:DIRECT_CHECKS.map(([id,label])=>({id,label,selected:id===this.direct.checkKey})),directSaves:DIRECT_SAVES.map(r=>({id:r.key,label:r.name,selected:r.key===this.direct.saveKey})),showDirectCheck:this.direct.mode==='check',showDirectSave:this.direct.mode==='save',showDirectDamage:this.direct.mode==='save'||this.direct.mode.startsWith('attack:'),hasExistingHtml:!!(this.item?.system?.description&&!this.direct.descriptionDirty&&/<[a-z][\s\S]*>/i.test(this.item.system.description)),
   overrides:this.draft.overrides.map((x,i)=>({...x,index:i,label:OVERRIDE_FIELDS[x.key]??x.key,authorLabel:game.users.get(x.author)?.name??'Mestre indisponível'})),overrideFields:Object.entries(OVERRIDE_FIELDS).map(([value,label])=>({value,label})),
   powers:this.actor.items.filter(i=>itemCategory(i)==='powers').map(i=>({id:i.id,name:i.name,selected:i.id===this.powerId})),effects:[...known.values()].map(c=>({id:c.id,label:c.definition.name+' · adquirido no nível '+c.slot,selected:c.id===this.draft.selectionId})),effectSearch:selected?selected.definition.name+' · adquirido no nível '+selected.slot:'',usedLevel:this.draft.usedLevel,min:selected?.definition.min??1,max:this.power?.system.level??1,variant:this.draft.variant,variants:jutsuVariants(this.power,this.draft.effectId,this.draft.usedLevel).map(v=>({...v,selected:v.id===(this.draft.variant||'normal')})),project,fields:Object.entries(project.data??{}).filter(([key])=>key!=='test').map(([key,value])=>({key,label:{action:'Ação',duration:'Duração',range:'Alcance',target:'Alvos',area:'Área',chakraCost:'Chakra',damage:'Dano base',difficulty:'Dificuldade',size:'Tamanho (m)',defenses:'Defesas',seals:'Selos'}[key]??key,value,origin:project.provenance[key],formula:project.formulas[key]})),locked:this.power?availableChoices(this.power,this.power.system.level).filter(e=>!known.has(e.id)).map(e=>({name:e.name,reason:e.min>this.power.system.level?'Exige poder nível '+e.min:'Efeito não aprendido neste poder'})):[],notes:project.effect?.notes,source:project.effect?project.effect.source.id+' · '+project.effect.source.pages:'',isGM:game.user.isGM};
 }
 async _onRender(context,options){
  await super._onRender(context,options);const root=this.element;
  const syncSubmit=()=>{const btn=root.querySelector('[type="submit"]');if(btn)btn.disabled=this.builderMode==='direct'?!this.canSaveDirect():!(this.projection().valid&&this.selectionConfirmed&&this.name.trim());};
  root.querySelector('[name="jutsuName"]')?.addEventListener('input',e=>{this.name=e.target.value;syncSubmit();});
  root.querySelector('[name="powerId"]')?.addEventListener('change',async e=>{this.powerId=e.target.value;if(this.builderMode==='effect'){this.draft.selectionId='';this.selectionConfirmed=false;this.draft.effectId='';this.draft.overrides=[];await this.render({force:true});}});
  if(this.builderMode==='direct'){
   for(const [field,key]of [['directAction','action'],['directRange','range'],['directDuration','duration'],['directCost','cost'],['directBase','base'],['directDc','dc'],['directCheckKey','checkKey'],['directSaveKey','saveKey']]){
    root.querySelector('[name="'+field+'"]')?.addEventListener('input',e=>{this.direct[key]=e.target.value;syncSubmit();});
   }
   root.querySelector('[name="directDescription"]')?.addEventListener('input',e=>{this.direct.descriptionText=e.target.value;this.direct.descriptionDirty=true;});
   root.querySelector('[name="directMode"]')?.addEventListener('change',async e=>{this.direct.mode=e.target.value;await this.render({force:true});});
   syncSubmit();return;
  }
  const effectInput=root.querySelector('[data-effect-input]');
  if(effectInput)mountAutocomplete(effectInput,root.querySelector('[data-effect-suggestions]'),context.effects,{select:async c=>{const choice=learnedEffects(this.power).find(x=>x.id===c.id);this.draft.selectionId=choice.id;this.draft.effectId=choice.effectId;this.draft.usedLevel=Math.max(choice.definition.min,Math.min(this.draft.usedLevel,this.power.system.level));this.draft.variant='normal';this.draft.overrides=[];this.selectionConfirmed=true;await this.render({force:true});},onType:()=>{this.selectionConfirmed=false;const btn=root.querySelector('[type="submit"]');if(btn)btn.disabled=true;}});
  for(const [name,key] of [['usedLevel','usedLevel'],['variant','variant']])root.querySelector('[name="'+name+'"]')?.addEventListener('change',async e=>{this.draft[key]=key==='usedLevel'?Number(e.target.value):e.target.value;if(!jutsuVariants(this.power,this.draft.effectId,this.draft.usedLevel).some(v=>v.id===this.draft.variant))this.draft.variant='normal';await this.render({force:true});});
 }
 static async setMode(event,target){const mode=target.dataset.mode;if(!['effect','direct'].includes(mode)||mode===this.builderMode)return;this.builderMode=mode;await this.render({force:true});}
 static async openBookTechniques(){if(this.power)await new SnsJutsuManager(this.actor,this.power).render({force:true});}
 static async addOverride(){if(!game.user.isGM||!this.actor.isOwner)return;const root=this.element;const row={key:root.querySelector('[name=overrideKey]').value,value:root.querySelector('[name=overrideValue]').value.trim(),reason:root.querySelector('[name=overrideReason]').value.trim(),author:game.user.id};const rows=[...this.draft.overrides.filter(x=>x.key!==row.key),row],errors=overrideProblems(rows);if(errors.length)return ui.notifications.warn(errors.join(' '));this.draft.overrides=rows;await this.render({force:true});}
 static async removeOverride(event,target){if(!game.user.isGM||!this.actor.isOwner)return;this.draft.overrides.splice(Number(target.dataset.index),1);await this.render({force:true});}
 static async save(){
  if(!this.actor.isOwner)return;this.name=this.element.querySelector('[name="jutsuName"]').value.trim();
  if(this.item&&this.item.actor!==this.actor)return;
  if(this.builderMode==='direct'){
   let payload;try{payload=buildDirectJutsuPayload({name:this.name,powerId:this.powerId,direct:this.direct,existingItem:this.item});}catch(error){return ui.notifications.warn(error.message);}
   if(this.item){await this.item.update({name:payload.name,'system.description':payload.description,'system.jutsu':payload.jutsu,'system.details':{...(this.item.system.toObject().details??{}),...payload.details},'flags.sns-v14-dev.directJutsuConfig':payload.config});}
   else{await this.actor.createEmbeddedDocuments('Item',[{name:payload.name,type:'jutsu',system:{category:'techniques',description:payload.description,jutsu:payload.jutsu,details:payload.details},flags:{'sns-v14-dev':{directJutsuConfig:payload.config}}}]);}
   await this.close();return;
  }
  const result=this.projection();if(!this.name||!result.valid||!this.selectionConfirmed||overrideProblems(this.draft.overrides).length)return ui.notifications.warn(result.problems?.join(' ')||'Informe o nome e escolha um efeito aprendido.');const library=await loadCanonicalLibrary(),book=library?.entries.find(e=>e.id===result.effect.id);let description=book?.document.system.description||'';if(!description&&result.power?.id){const powerEntry=library?.entries.find(e=>e.id===result.power.id);if(powerEntry){const {npcPowerSections}=await import('./npc-build-techniques.mjs');const match=npcPowerSections(powerEntry).find(s=>s.name.toLocaleLowerCase('pt-BR')===result.effect.name.toLocaleLowerCase('pt-BR'));description=match?.html||'';}}description=description||this.item?.system.description||(result.effect.notes?'<p>'+escapeHtml(result.effect.notes)+'</p>':'');const details={powerId:this.powerId};for(const key of ['action','range','target','duration','chakraCost','damage','defenses'])details[key]=result.data[key];const patch={name:this.name,'system.description':description,'system.jutsu':this.draft,'system.details':{...(this.item?.system.toObject().details??{}),...details},'system.traits':jutsuTraits(this.item?.system.traits,result),'system.source':{id:result.effect.revision?.id??result.effect.source.id,edition:result.effect.revision?'Guia2026 · D049':'Básico4.1b',pages:result.effect.revision?result.effect.source.pages+' / revisão '+result.effect.revision.pages:result.effect.source.pages}};if(this.item)await this.item.update(patch);else{const system={category:'techniques',description,jutsu:this.draft,details,traits:result.traits,source:patch['system.source']};await this.actor.createEmbeddedDocuments('Item',[{name:this.name,type:'jutsu',system}]);}await this.close();
 }
}
