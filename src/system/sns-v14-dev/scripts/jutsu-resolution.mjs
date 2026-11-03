import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {damageTriggerState,jutsuDamageRecord} from './jutsu-damage-trigger.mjs';
import {SnsCheckDialog} from './check-dialog.mjs';
import {readJutsuUse,resolveJutsuEffects,isResolver,effectRows,effectOutcome,needsHit,needsResistance,attackOutcome,versusDifficulty,rolledCheck} from './jutsu-application.mjs';
import {recordedSkills} from './recorded-skills.mjs';
import {checkFlavor} from './chat-card.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {conditionPenalty} from './condition-effects.mjs';
import {loadCanonicalLibrary} from './canonical-content.mjs';
export class SnsJutsuResolution extends SnsHandlebarsApplicationMixin(foundry.applications.api.ApplicationV2){
 static DEFAULT_OPTIONS={tag:'form',classes:['sns-editor-dialog','sns-jutsu-resolution'],position:{width:690,height:650},window:{title:'Resolver efeitos do jutsu'},form:{handler:SnsJutsuResolution.apply,closeOnSubmit:false},actions:{defend:SnsJutsuResolution.defend,resist:SnsJutsuResolution.resist}};
 static PARTS={resolution:{scrollable:[''],template:'systems/sns-v14-dev/templates/jutsu-resolution.hbs'}};
 constructor(message){super();this.message=message;this.decisions={};}
 async _prepareContext(){
  if(!isResolver())throw Error('O mestre ativo precisa resolver os efeitos.');
  const {use}=await readJutsuUse(this.message),library=await loadCanonicalLibrary();this.use=use;this.rows=effectRows(use);
  return {name:use.name,attack:use.attack?use.attack.total:'Sem teste',rows:this.rows.map((r,index)=>{const d=this.decisions[r.key]??{},status=use.results[r.key]?.status;return {...r,index,condition:library?.entries.find(e=>e.id===r.binding.conditionId)?.document.name??r.binding.conditionId.slice(14),needsHit:needsHit(r.binding),needsResistance:needsResistance(r.binding),done:!!status,status:({applied:'Aplicado',miss:'Não acertou',resisted:'Resistiu'})[status]??'',hitChoices:[['pending','Aguardando defesa'],['hit','Acertou'],['miss','Não acertou']].map(([id,name])=>({id,name,selected:id===(d.hit??'pending')})),resistanceChoices:[['pending','Aguardando resistência'],['failed','Falhou'],['passed','Resistiu']].map(([id,name])=>({id,name,selected:id===(d.resistance??'pending')})),defense:d.defense?.total,resistance:d.resistanceRoll?.total,pending:effectOutcome(r.binding,d)==='pending'};})};
 }
 capture(){for(const [i,r] of this.rows.entries()){if(this.use.results[r.key])continue;const f=this.element.elements;this.decisions[r.key]={...this.decisions[r.key],hit:f['hit'+i]?.value??'pending',resistance:f['resistance'+i]?.value??'pending'};}}
 async _onRender(context,options){await super._onRender(context,options);this.element.querySelectorAll('select').forEach(s=>s.addEventListener('change',()=>this.capture()));}
 async rollFor(row,key,resistance=false){
  const actor=await fromUuid(row.target.uuid);if(!actor?.isOwner)throw Error('O alvo não está disponível.');
  let dialog;
  if(actor.type==='shinobi')dialog=await SnsCheckDialog.prompt(actor,key,'Resistência / defesa · '+this.use.name);
  else{let precision=key.startsWith('attribute:')?actor.system.attributes[key.slice(10)]:key.startsWith('skill:')?recordedSkills(actor.system).find(s=>s.key===key.slice(6)&&!s.untrained)?.precision:actor.system.stats[key];if(!Number.isInteger(precision))throw Error('Informe a precisão do alvo para este teste.');dialog=await SnsCheckDialog.promptRecorded(actor,{key,name:'Resistência / defesa · '+this.use.name,precision});}
  if(!dialog||!isResolver())return null;
  const roll=await new foundry.dice.Roll(dialog.spec.formula).evaluate();
  await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:checkFlavor(dialog.spec),flags:{'sns-v14-dev':{check:{actorImg:actor.img,key},...(resistance?{testOutcome:{dc:row.dc,result:versusDifficulty(rolledCheck(roll,dialog.spec),row.dc)}}:{}),jutsuDefense:{messageUuid:this.message.uuid,targetUuid:actor.uuid}}}},{messageMode:dialog.messageMode});
  return rolledCheck(roll,dialog.spec);
 }
 static async defend(event,target){
  this.capture();const index=Number(target.dataset.index),row=this.rows[index];if(!row||this.use.results[row.key])return;const key=this.element.elements['defense'+index].value;
  try{let hit,defense;
   if(key==='fixed'){const actor=await fromUuid(row.target.uuid);let fixed=actor?.type==='shinobi'?actor.system.derived.fixedDodge:null;if(actor&&actor.type!=='shinobi'&&Number.isInteger(actor.system.stats.esq))fixed=9+actor.system.stats.esq+conditionPenalty(characteristicEffects(actor),'esq');if(!Number.isFinite(fixed))throw Error('Esquiva fixa não informada. O mestre pode inserir o resultado.');hit=attackOutcome(this.use.attack,fixed,{fixed:true});defense={total:fixed,fixed:true};}
   else{defense=await this.rollFor(row,key);if(!defense)return;hit=attackOutcome(this.use.attack,defense);}
   // All bindings share the attack against this same target, not its resistance tests.
   for(const r of this.rows.filter(r=>r.target.uuid===row.target.uuid))this.decisions[r.key]={...this.decisions[r.key],hit,defense};
   await this.render({force:true});if(hit==='pending')ui.notifications.warn('Empate: é preciso novo teste ou decisão do mestre.');
  }catch(e){ui.notifications.warn(e.message);}
 }
 static async resist(event,target){
  this.capture();const row=this.rows[Number(target.dataset.index)];if(!row||this.use.results[row.key])return;
  if(needsHit(row.binding)&&this.decisions[row.key]?.hit!=='hit')return ui.notifications.warn('Resolva o acerto antes da resistência.');
  if(row.binding.requiresDamage&&damageTriggerState(jutsuDamageRecord(this.message,await fromUuid(row.target.uuid)))!=='taken')return ui.notifications.warn('Aplique primeiro o dano: este efeito exige perda de Vitalidade ou Vitalidade temporária.');
  try{const resistanceRoll=await this.rollFor(row,row.binding.resistance,true);if(!resistanceRoll)return;this.decisions[row.key]={...this.decisions[row.key],resistanceRoll,resistance:versusDifficulty(resistanceRoll,row.dc)};await this.render({force:true});}catch(e){ui.notifications.warn(e.message);}
 }
 static async apply(){this.capture();try{await resolveJutsuEffects(this.message,this.decisions);await this.render({force:true});}catch(e){ui.notifications.error(e.message);}}
}
