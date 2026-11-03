import {packetTargetSpec} from './damage-presentation.mjs';
import {effectiveHardness} from './transformation-core.mjs';
import {readDamagePresentation} from './damage-presentation.mjs';
import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {damageGrade,damageCalculation,damageResources,damageInputsSignature,latestDamage,safeTargetKey} from './damage-core.mjs';
import {mayResolveDamage,armorProtection,registerProtection,applyDamage,undoDamage} from './damage-application.mjs';
import {applyPacketDamage,packetSpecFor} from './damage-chat.mjs';
import {attackOutcome,rolledCheck} from './jutsu-outcomes.mjs';
import {SnsCheckDialog} from './check-dialog.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {conditionPenalty} from './condition-effects.mjs';
import {checkFlavor} from './chat-card.mjs';
import {escapeHtml as esc} from './kernel.mjs';
export class SnsDamageDialog extends SnsHandlebarsApplicationMixin(foundry.applications.api.ApplicationV2){
 static DEFAULT_OPTIONS={tag:'form',classes:['sns-editor-dialog','sns-damage-dialog'],position:{width:660,height:650},window:{title:'Ferramentas de dano'},actions:{preview:SnsDamageDialog.preview,apply:SnsDamageDialog.apply,undo:SnsDamageDialog.undo,protection:SnsDamageDialog.protection,defend:SnsDamageDialog.defend}};
 static PARTS={damage:{scrollable:[''],template:'systems/sns-v14-dev/templates/damage-dialog.hbs'}};
 constructor({actor=null,message=null,packet=null}={}){super();this.actor=actor;this.message=message;this.packet=packet;this.requestKey='manual:'+foundry.utils.randomID();this.drafts={};this.signatures={};}
 async _prepareContext(){
  if(!mayResolveDamage())throw Error('O mestre ativo precisa abrir a aplicação de dano.');
  this.targets=this.actor?[this.actor]:(await Promise.all(this.packet.targets.map(t=>fromUuid(t.uuid)))).filter(Boolean);
  const shown=this.message?readDamagePresentation(this.message,this.packet):null;
  const grade=this.packet?.attack?damageGrade(this.packet.attack.natural,{criticalAt:this.packet.profile.criticalAt}):1;
  const rows=this.targets.map((actor,index)=>{
   const targetSpec=this.packet?packetSpecFor(this.message,this.packet,shown?.spec??this.packet.profile,actor):null;
   const key=safeTargetKey(actor.uuid),draft=this.drafts[key]??={base:targetSpec?.base??'',fixed:shown?.spec?.fixed??this.packet?.profile.fixed??0,...(shown?.spec?.gradeBonus?{gradeBonus:shown.spec.gradeBonus}:{}),grade:shown?.spec?.grade??(grade||1),nature:this.packet?.profile.nature??'lethal',ignoreHardness:targetSpec?.ignoreHardness??0,note:'',hit:this.packet?(grade===0?'miss':this.packet.attack?.natural>=this.packet.profile.criticalAt?'hit':'pending'):'hit'};
   let armor,calculation,resources,error='';try{armor=armorProtection(actor);this.signatures[key]=damageInputsSignature(actor,armor.id);calculation=damageCalculation({...draft,base:draft.base===''?NaN:Number(draft.base),hardness:effectiveHardness(actor)});if(armor.value===null)throw Error('Registre a absorção atual em Proteções.');resources=damageResources(calculation,{vitality:actor.system.resources.vitality.value,temp:actor.system.resources.vitality.temp??0,absorption:armor.value});}catch(e){error=e.message;}
   const requestKey=this.message?'chat:'+this.message.id+':'+key:this.requestKey,applied=latestDamage(actor).find(e=>e.requestKey===requestKey&&e.status==='applied');
   if(applied){calculation=applied.calculation;resources=applied.resources;error='';draft.hit=applied.decision?.hit??draft.hit;}
   const history=latestDamage(actor).filter(e=>e.status==='applied').slice(0,20).concat(latestDamage(actor).filter(e=>e.status==='undone').slice(0,3)).map(e=>({...e,canUndo:e.status==='applied'&&actor.system.damageState?.head===e.id&&(actor.system.damageState?.externalRevision??0)===e.externalRevision,undoBlocked:e.status==='applied'&&actor.system.damageState?.head===e.id&&(actor.system.damageState?.externalRevision??0)!==e.externalRevision,natureLabel:e.calculation.nature==='nonlethal'?'Não letal':'Letal',undone:e.status==='undone'}));
   return {index,key,name:actor.name,draft,armor,calculation,resources,error,hardness:effectiveHardness(actor),hardnessSource:actor.system.damageState?.hardnessSource??'',canApply:!error&&!applied&&draft.hit==='hit'&&grade!==0,applied:!!applied,packet:!!this.packet,history,hitChoices:[['pending','Aguardando defesa'],['hit','Acertou'],['miss','Não acertou']].map(([value,label])=>({value,label,selected:value===draft.hit})),grades:[1,2,3,4].map(n=>({value:n,selected:n===draft.grade})),natures:[['lethal','Letal'],['nonlethal','Não letal']].map(([value,label])=>({value,label,selected:value===draft.nature})),bleeding:Number.isFinite(this.packet?.attack?.natural)&&this.packet.attack.natural>=this.packet.profile.criticalAt&&draft.nature==='lethal'&&resources?.vitalityLost>0?Math.ceil(calculation.effectiveBase/4):0};
  });
  return {name:this.packet?.name??this.actor?.name,attack:this.packet?.attack?.total,rows,manual:!this.packet};
 }
 capture(){for(const actor of this.targets){const key=safeTargetKey(actor.uuid),get=name=>this.element.querySelector('[name="'+key+'_'+name+'"]')?.value,d=this.drafts[key];for(const name of ['base','fixed','grade','ignoreHardness']){const raw=get(name);if(raw!==undefined)d[name]=raw===''?'':Number(raw);}for(const name of ['nature','note','hit']){const raw=get(name);if(raw!==undefined)d[name]=raw;}}}
 async _onRender(context,options){await super._onRender(context,options);this.element.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('change',()=>{this.capture();this.element.querySelectorAll('[data-action="apply"]').forEach(b=>{b.disabled=true;b.textContent='Recalcule para aplicar';});}));}
 static async preview(){this.capture();await this.render({force:true});}
 static async apply(event,target){
  this.capture();const actor=this.targets[Number(target.dataset.index)];if(!actor)return;
  const key=safeTargetKey(actor.uuid),draft=this.drafts[key],spec={base:Number(draft.base),fixed:Number(draft.fixed),grade:Number(draft.grade),...(draft.gradeBonus?{gradeBonus:draft.gradeBonus}:{}),ignoreHardness:Number(draft.ignoreHardness),nature:draft.nature};
  try{if(draft.base==='')throw Error('Informe o dano base.');const canonicalIgnore=this.packet?(packetSpecFor(this.message,this.packet,this.packet.profile,actor).ignoreHardness??0):0;if(spec.ignoreHardness>0&&spec.ignoreHardness!==canonicalIgnore&&!draft.note.trim())throw Error('Identifique a regra que permite ignorar dureza.');
   if(this.message)await applyPacketDamage(this.message,actor,{spec,decision:{hit:draft.hit,note:draft.note},expectedSignature:this.signatures[key]});
   else await applyDamage(actor,{requestKey:this.requestKey,source:draft.note.trim()||'Dano manual',spec,expectedSignature:this.signatures[key],decision:{note:draft.note}});
   await this.render({force:true});
  }catch(e){ui.notifications.warn(e.message);}
 }
 static async undo(event,target){const actor=this.targets[Number(target.dataset.index)];try{await undoDamage(actor,target.dataset.id);await this.render({force:true});}catch(e){ui.notifications.warn(e.message);}}
 static async protection(event,target){
  this.capture();const actor=this.targets[Number(target.dataset.index)];if(!actor)return;
  try{const armor=armorProtection(actor),state=actor.system.damageState??{},result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Proteções · '+actor.name},content:'<label>Dureza corporal aplicável<input name="hardness" type="number" min="0" step="1" value="'+(state.hardness??0)+'"></label><label>Origem da dureza<input name="hardnessSource" value="'+esc(state.hardnessSource??'')+'"></label><p>Use a maior dureza corporal aplicável. Barreiras e objetos têm proteção separada.</p>'+(armor.id?'<p>'+esc(armor.name)+'</p><label>Absorção atual<input name="value" type="number" min="0" step="1" value="'+(armor.value??'')+'" required></label><label>Absorção máxima<input name="max" type="number" min="0" step="1" value="'+(armor.max??'')+'" '+(!armor.custom?'readonly':'')+'></label><label>Origem da armadura<input name="source" value="'+esc(armor.source??'')+'" '+(!armor.custom?'readonly':'')+'></label>':'<p>Sem armadura de absorção em uso.</p>'),ok:{label:'Registrar proteções',callback:(e,b)=>{const f=b.form.elements;if(armor.id&&f.value.value==='')throw Error('Informe a absorção atual; não presumimos que a armadura está nova.');return {hardness:Number(f.hardness.value),hardnessSource:f.hardnessSource.value,armorId:armor.id,value:f.value?Number(f.value.value):0,max:f.max?Number(f.max.value):0,source:f.source?.value??''};}}});
   if(result)await registerProtection(actor,result);await this.render({force:true});
  }catch(e){ui.notifications.warn(e.message);}
 }
 static async defend(event,target){
  this.capture();const actor=this.targets[Number(target.dataset.index)],key=safeTargetKey(actor.uuid),mode=this.element.querySelector('[name="'+key+'_defense"]').value;let hit;
  try{
   if(mode==='fixed'){const fixed=actor.type==='shinobi'?actor.system.derived.fixedDodge:Number.isInteger(actor.system.stats.esq)?9+actor.system.stats.esq+conditionPenalty(characteristicEffects(actor),'esq'):null;if(!Number.isFinite(fixed))throw Error('Esquiva fixa não informada.');hit=attackOutcome(this.packet.attack,fixed,{fixed:true,criticalAt:this.packet.profile.criticalAt});}
   else{const name='Defesa · '+this.packet.name;const dialog=actor.type==='shinobi'?await SnsCheckDialog.prompt(actor,mode,name):await SnsCheckDialog.promptRecorded(actor,{key:mode,name,precision:actor.system.stats[mode]});if(!dialog||!mayResolveDamage())return;const roll=await new foundry.dice.Roll(dialog.spec.formula).evaluate();await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:checkFlavor(dialog.spec)},{messageMode:dialog.messageMode});hit=attackOutcome(this.packet.attack,rolledCheck(roll,dialog.spec),{criticalAt:this.packet.profile.criticalAt});}
   this.drafts[key].hit=hit;await this.render({force:true});if(hit==='pending')ui.notifications.warn('Empate. Informe o desempate e o grau da última rolagem.');
  }catch(e){ui.notifications.warn(e.message);}
 }
}
