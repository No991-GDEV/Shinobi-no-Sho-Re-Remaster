import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {ATTRIBUTES,escapeHtml} from './kernel.mjs';
import {investmentBudget} from './investment-budget.mjs';
import {partySummoners} from './party-core.mjs';
import {powerSources,originGrant} from './restricted-access.mjs';
import {PACKAGE_ORIGINS} from '../data/package-content.mjs';
import {kuchiyoseLink,speciesFor,summonPower,summonLimit,suggestSummonAttributes,summonProjection,KUCHIYOSE_SIZES,KUCHIYOSE_SPECIES} from './kuchiyose-core.mjs';
import {requestCompanion} from './kuchiyose-service.mjs';
const ns='sns-v14-dev';
const originMode=value=>value==='common'?'common':'restricted';
export const kuchiyoseOriginChoices=value=>[
 {value:'common',label:'Kuchiyose Padrão (Comum · −3)',selected:originMode(value)==='common'},
 {value:'restricted',label:'Kuchiyose Restrito (Invocação · sem −3)',selected:originMode(value)!=='common'}
];
export async function companionLinkView(actor){
 if(actor.type!=='companion')return null;const link=kuchiyoseLink(actor),species=speciesFor(actor);if(!species&&!link&&actor.system.details.kind!=='Invocação')return null;
 const uuid=link?.masterUuid||actor.system.details.master||'',master=uuid?await fromUuid(uuid):null,candidates=partySummoners(game.actors,game.actors,game.user);
 const extraCandidates=game.user?.isGM?Array.from(game.actors??[]).filter(a=>!a.pack&&!a.isToken&&['shinobi','npc'].includes(a.type)&&!candidates.some(c=>c.uuid===a.uuid)).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')):[];
 const choices=[
  {value:'',label:game.user?.isGM?'Selecionar invocador':'Selecionar invocador da equipe',selected:!uuid},
  ...candidates.map(a=>({value:a.uuid,label:a.name,selected:a.uuid===uuid})),
  ...extraCandidates.map(a=>({value:a.uuid,label:a.name+' · fora da equipe',selected:a.uuid===uuid}))
 ];
 if(uuid&&!choices.some(c=>c.value===uuid))choices.push({value:uuid,label:master?.testUserPermission(game.user,'OBSERVER')?master.name+' · fora da equipe':'Invocador indisponível',selected:true});
 let problem=link?.problem??'',limit=null;try{if(master&&species){const power=summonPower(master,species.species);limit=summonLimit(master,species.species,link?.build??{usedLevel:power.system.level,count:1});}}catch(e){problem=e.message;}
 if(uuid&&!master)problem='Invocador indisponível. Selecione outro na ficha.';
 const matchedPower=master&&species?powerSources(master,'sns:power:kuchiyose').find(p=>p.system.choice?.key===species.species):null;
 const currentOrigin=originMode(limit?.origin??matchedPower?.system?.details?.powerOrigin??link?.limit?.origin??'common');
 const canChangeOrigin=!!(game.user?.isGM&&master&&species&&species.species!=='desenhos');
 const originChoices=kuchiyoseOriginChoices(currentOrigin);
 const originLabel=currentOrigin==='common'?'Kuchiyose Padrão (Comum · −3)':'Kuchiyose Restrito (Invocação · sem −3)';
 const budget=investmentBudget({},actor.items),pp=actor.system.nc>=4?Math.floor(actor.system.nc/2):0;
 return {choices,species:species?.name??'Invocação',hasMaster:!!master,canBuild:actor.isOwner&&!!master&&master.testUserPermission(game.user,'OWNER'),canChangeOrigin,originChoices,originLabel,calculated:link?.mode==='calculated',legacy:link?.mode==='legacy',problem,limit,pp,spent:budget.spent,balance:pp-budget.spent,freeUsed:budget.freeUsed,freeLimit:actor.system.nc>=4?3:0};
}
export async function changeCompanionMaster(event){
 if(!this.isEditable)return;const actor=this.actor,uuid=event.target.value,link=kuchiyoseLink(actor),master=uuid?await fromUuid(uuid):null;
 const species=speciesFor(actor)?.species||powerSources(master,'sns:power:kuchiyose')[0]?.system.choice?.key||Array.from(master?.items??[]).map(i=>PACKAGE_ORIGINS[originGrant(i)]?.species).find(Boolean);
 let grantPower=null;
 if(uuid&&master&&species&&species!=='desenhos'&&game.user?.isGM){
  let needsGrant=false;try{summonPower(master,species);}catch{needsGrant=true;}
  if(needsGrant){
   const existing=powerSources(master,'sns:power:kuchiyose').find(p=>p.system.choice?.key===species)||powerSources(master,'sns:power:kuchiyose').find(p=>!p.system.choice?.key);
   const defaultLevel=Math.max(1,Math.min(10,existing?.system?.level>0?existing.system.level:Math.floor((master.system?.nc||4)/2)));
   const defaultOrigin=originMode(existing?.system?.details?.powerOrigin??'restricted');
   const spName=KUCHIYOSE_SPECIES[species]?.name??species;
   grantPower=await foundry.applications.api.DialogV2.prompt({
    classes:['sns-editor-dialog'],
    window:{title:'Configurar Kuchiyose · '+master.name},
    content:'<p>Para vincular <strong>'+escapeHtml(spName)+'</strong>, confirme o nível e a fonte do poder <strong>Kuchiyose (Invocação)</strong> em <strong>'+escapeHtml(master.name)+'</strong> (será registrado como concessão extra do mestre, 0 PP).</p><label>Fonte do Kuchiyose<select name="powerOrigin"><option value="common" '+(defaultOrigin==='common'?'selected':'')+'>Kuchiyose Padrão (Comum · −3 combate)</option><option value="restricted" '+(defaultOrigin!=='common'?'selected':'')+'>Kuchiyose Restrito (Invocação · sem −3)</option></select></label><label>Nível do poder Kuchiyose<input type="number" name="level" min="1" max="10" step="1" value="'+defaultLevel+'"></label>',
    ok:{label:'Conceder e vincular',callback:(e,b)=>({powerOrigin:b.form.elements.powerOrigin.value,level:Math.max(1,Math.min(10,Number(b.form.elements.level.value)||1))})}
   });
   if(!grantPower){await this.render({force:true});return;}
  }
 }
 try{const message=await requestCompanion(actor,uuid?'bind':'unlink',{masterUuid:uuid,species,revision:link?.revision??0,...(grantPower?{grantPower}:{})});if(message?.getFlag(ns,'companionResult')?.reason)ui.notifications.warn(message.getFlag(ns,'companionResult').reason);else if(!message?.getFlag(ns,'companionResult'))ui.notifications.info('Vínculo solicitado. O mestre conectado processa automaticamente.');}catch(error){ui.notifications.warn(error.message);}await this.render({force:true});
}
export async function changeCompanionOrigin(event){
 if(!this.isEditable||!game.user?.isGM)return;
 const actor=this.actor,link=kuchiyoseLink(actor),uuid=link?.masterUuid||actor.system.details.master||'',species=speciesFor(actor)?.species||link?.species,powerOrigin=originMode(event.target.value);
 if(!uuid||!species)return;
 try{const message=await requestCompanion(actor,'origin',{masterUuid:uuid,species,powerOrigin,revision:link?.revision??0});if(message?.getFlag(ns,'companionResult')?.reason)ui.notifications.warn(message.getFlag(ns,'companionResult').reason);}catch(error){ui.notifications.warn(error.message);}
 await this.render({force:true});
}
export class SnsKuchiyoseBuilder extends SnsHandlebarsApplicationMixin(foundry.applications.api.ApplicationV2){
 static DEFAULT_OPTIONS={classes:['sns-editor-dialog','sns-kuchiyose-builder'],position:{width:700,height:740},window:{title:'Construção da invocação',resizable:true},actions:{suggest:SnsKuchiyoseBuilder.suggest,save:SnsKuchiyoseBuilder.save}};
 static PARTS={body:{template:'systems/sns-v14-dev/templates/kuchiyose-builder.hbs',scrollable:['']}};
 constructor(actor,options={}){super(options);this.actor=actor;this.link=kuchiyoseLink(actor);this.revision=this.link?.revision??0;this.draft=structuredClone(this.link?.build??null);this.pendingId='';this.hook=Hooks.on('updateChatMessage',m=>{if(m.id===this.pendingId)void this.render({force:true});});}
 async _onClose(options){Hooks.off('updateChatMessage',this.hook);await super._onClose(options);}
 async _prepareContext(){
  this.master=await fromUuid(this.link?.masterUuid||this.actor.system.details.master);this.species=speciesFor(this.actor);if(!this.master||!this.species)throw Error('Vincule um invocador e uma espécie antes de construir a ficha.');
  const power=summonPower(this.master,this.species.species);
  const currentOrigin=originMode(power.system.details?.powerOrigin);
  this.draft??={species:this.species.species,usedLevel:power.system.level,count:1,nc:Math.min(20,2*power.system.level),size:this.species.fixedSize||'Médio',powerOrigin:currentOrigin,attributes:suggestSummonAttributes(Math.min(20,2*power.system.level),this.species.species),bases:{cc:3,cd:3,esq:3,lm:3}};
  this.draft.powerOrigin??=currentOrigin;
  let preview=null,error='';try{preview=summonProjection(this.master,this.draft,this.actor.items);}catch(e){error=e.message;}
  const result=this.pendingId?game.messages.get(this.pendingId)?.getFlag(ns,'companionResult'):null,waiting=!!this.pendingId&&!result;if(result?.reason)error=result.reason;
  return {name:this.actor.name,master:this.master.name,species:this.species.name,draft:this.draft,preview,error,waiting,resultDone:result?.status==='done',canSave:this.actor.isOwner&&!!preview&&!waiting,legacy:this.link?.mode!=='calculated',isGM:game.user.isGM,showOriginSelect:this.species.species!=='desenhos',originChoices:kuchiyoseOriginChoices(this.draft.powerOrigin),attributes:ATTRIBUTES.map(([key,abbr,label])=>({key,abbr,label,value:this.draft.attributes[key],current:this.actor.system.attributes[key]})),bases:['cc','cd','esq','lm'].map(key=>({key,label:{cc:'CC',cd:'CD',esq:'Esquiva',lm:'LM'}[key],value:this.draft.bases[key]})),sizes:Object.keys(KUCHIYOSE_SIZES).map(name=>({name,selected:name===this.draft.size})),countChoices:[1,...(this.species.unitary?[]:[2])].map(value=>({value,selected:value===this.draft.count})),spent:investmentBudget({},this.actor.items).spent};
 }
 capture(){const value=name=>this.element.querySelector('[name="'+name+'"]')?.value;for(const k of ['nc','usedLevel','count'])this.draft[k]=Number(value(k));this.draft.size=value('size');if(value('powerOrigin'))this.draft.powerOrigin=originMode(value('powerOrigin'));for(const [key]of ATTRIBUTES)this.draft.attributes[key]=Number(value('attributes.'+key));for(const key of ['cc','cd','esq','lm'])this.draft.bases[key]=Number(value('bases.'+key));}
 async _onRender(context,options){await super._onRender(context,options);for(const input of this.element.querySelectorAll('input[type="number"],select'))input.addEventListener('input',()=>{this.capture();let preview=null,error='';try{preview=summonProjection(this.master,this.draft,this.actor.items);}catch(e){error=e.message;}this.element.querySelector('[data-build-error]').textContent=error;this.element.querySelector('[data-build-preview]').textContent=preview?'Vitalidade máxima '+preview.vitalityMax+' · Chakra máximo '+preview.chakraMax+' · PP '+investmentBudget({},this.actor.items).spent+' / '+preview.pp+' · CC '+preview.stats.cc+' · CD '+preview.stats.cd+' · Esquiva '+preview.stats.esq+' · LM '+preview.stats.lm+' · Dano corporal '+preview.damage:'';this.element.querySelector('[data-action="save"]').disabled=!preview;});}
 static async suggest(){this.capture();try{this.draft.attributes=suggestSummonAttributes(this.draft.nc,this.species.species);await this.render({force:true});}catch(error){ui.notifications.warn(error.message);}}
 static async save(){if(!this.actor.isOwner||this.pendingId&&!game.messages.get(this.pendingId)?.getFlag(ns,'companionResult'))return;this.capture();try{summonProjection(this.master,this.draft,this.actor.items);const confirmed=this.element.querySelector('[name="confirmed"]')?.checked===true;const message=await requestCompanion(this.actor,'build',{masterUuid:this.master.uuid,species:this.species.species,revision:this.revision,build:this.draft,confirmed});if(message){this.pendingId=message.id;if(message.getFlag(ns,'companionResult')?.status==='done'){await this.close();return;}}await this.render({force:true});}catch(error){ui.notifications.warn(error.message);}}
}
