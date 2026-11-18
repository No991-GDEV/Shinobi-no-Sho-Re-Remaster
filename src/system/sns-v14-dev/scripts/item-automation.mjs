import {ITEM_AUTOMATION_PROFILES} from '../data/item-automation-profiles.mjs';
import {EFFECT_TARGETS,validateEffectRules} from './effect-item-rules.mjs';
import {recordedSkillLevel} from './recorded-skill-level.mjs';

// Keep top-level imports restricted to leaf modules to prevent ESM init cycles
// when characteristic-effects.mjs and kernel.mjs are loaded.
const ns='sns-v14-dev';
const EQUIPMENT_TYPES=new Set(['weapon','armor','equipment']);
const TARGET_LABELS=Object.fromEntries(EFFECT_TARGETS.map(t=>[t.id,t.label]));
const signed=n=>(n>=0?'+':'−')+Math.abs(n);
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const itemIdOf=item=>item?.id??item?._id??'';
const ruleKeyOf=item=>item?.system?.ruleId||item?.system?.contentId||'';

export function formatAutomationRules(rules=[]){
 try{
  return validateEffectRules(rules).map(r=>`${TARGET_LABELS[r.target]??r.target} ${r.target==='hardness'?'+':''}${r.target==='hardness'?r.value:signed(r.value)}`).join(', ');
 }catch{return '';}
}

export function itemAutomationFor(item){
 if(!item)return null;
 const preset=ITEM_AUTOMATION_PROFILES[ruleKeyOf(item)]??null;
 const custom=item.flags?.[ns]?.itemAutomation??null;
 if(!preset&&!custom)return null;
 const passiveRules=custom?.passiveRules!==undefined?custom.passiveRules:(preset?.passiveRules??[]);
 const toggle=custom?.toggle?.enabled===false?null:(custom?.toggle?.enabled?{key:'item-'+itemIdOf(item),...custom.toggle}:(preset?.toggle??null));
 const quickAction=custom?.quickAction?.enabled===false?null:(custom?.quickAction?.enabled?{key:'action-'+itemIdOf(item),...custom.quickAction}:(preset?.quickAction??null));
 const chargePool=custom?.chargePool?.enabled===false?null:(custom?.chargePool?.enabled?{key:'charge-'+itemIdOf(item),...custom.chargePool}:(preset?.chargePool??null));
 if(!passiveRules.length&&!toggle&&!quickAction&&!chargePool)return null;
 return {passiveRules,toggle,quickAction,chargePool,hasCustom:!!custom,hasPreset:!!preset};
}

export function isItemPassiveActive(item){
 if(!item)return false;
 return EQUIPMENT_TYPES.has(item.type)?!!item.system?.equipped:true;
}

export function itemModesState(actor){
 return actor?.flags?.[ns]?.itemModes??{};
}

export function itemChargesState(actor){
 return actor?.flags?.[ns]?.itemCharges??{};
}

function resolveChargeMax(actor,item,pool){
 const skillLevel=key=>actor?.system?.derived?.skills?.[key]?.level??recordedSkillLevel(actor,key)??0;
 if(pool.maxFormula==='skill:lidar_com_animais')return Math.max(1,skillLevel('lidar_com_animais'));
 if(pool.maxFormula==='2*skill:arte')return Math.max(1,2*skillLevel('arte'));
 if(pool.maxFormula==='level')return Math.max(1,Number(item?.system?.level)||1);
 return Math.max(1,Number(pool.max)||1);
}

export function resolveItemChargePool(actor,item,pool=itemAutomationFor(item)?.chargePool){
 if(!pool)return null;
 const max=resolveChargeMax(actor,item,pool),stored=itemChargesState(actor)[pool.key];
 const value=Number.isInteger(stored?.value)?Math.min(max,Math.max(0,stored.value)):max;
 return {key:pool.key,itemId:itemIdOf(item),label:pool.label||item.name,value,max,unit:pool.unit||'cargas',rechargeLabel:pool.rechargeLabel||'Recarregar',rechargeMode:pool.rechargeMode||'full',note:pool.note||''};
}

function activeModeRules(actor,item,automation){
 const t=automation?.toggle;if(!t)return [];
 const state=itemModesState(actor)[t.key];
 if(!state?.active)return [];
 if(Array.isArray(t.stages)&&t.stages.length){
  const stage=t.stages.find(s=>s.id===state.stageId)??t.stages[0];
  return stage?.rules??[];
 }
 return t.rules??[];
}

function rulesToModifiers(rules,sourceId,sourceName){
 let validated=[];
 try{validated=validateEffectRules(rules);}catch{return [];}
 return validated.filter(r=>r.target!=='hardness').map(r=>({
  kind:r.target.startsWith('attribute:')?'attributeModifier':'flatModifier',
  target:r.target.replace(/^attribute:/,''),
  scope:'all',
  value:r.value,
  sourceId,
  sourceName
 }));
}

export function itemPassiveModifiers(actor){
 const out=[];
 for(const item of actor?.items??[]){
  const auto=itemAutomationFor(item);if(!auto)continue;
  if(auto.passiveRules?.length&&isItemPassiveActive(item)){
   out.push(...rulesToModifiers(auto.passiveRules,itemIdOf(item),item.name));
  }
  const modeRules=activeModeRules(actor,item,auto);
  if(modeRules.length){
   const state=itemModesState(actor)[auto.toggle.key];
   const stage=auto.toggle.stages?.find(s=>s.id===state?.stageId);
   out.push(...rulesToModifiers(modeRules,itemIdOf(item),stage?`${auto.toggle.label} (${stage.label})`:auto.toggle.label));
  }
 }
 return out;
}

export function itemPassiveHardness(actor){
 let max=0;
 for(const item of actor?.items??[]){
  const auto=itemAutomationFor(item);if(!auto)continue;
  const check=rules=>{try{for(const r of validateEffectRules(rules))if(r.target==='hardness')max=Math.max(max,r.value);}catch{}};
  if(auto.passiveRules?.length&&isItemPassiveActive(item))check(auto.passiveRules);
  const modeRules=activeModeRules(actor,item,auto);
  if(modeRules.length)check(modeRules);
 }
 return max;
}

export function actorItemActivations(actor){
 const states=itemModesState(actor),seenToggles=new Set(),seenActions=new Set(),seenCharges=new Set(),rows=[];
 // Prefer powers over clans/hijutsus when both provide the same toggle key.
 const ordered=[...Array.from(actor?.items??[])].sort((a,b)=>(a.type==='power'?0:1)-(b.type==='power'?0:1));
 for(const item of ordered){
  const auto=itemAutomationFor(item);if(!auto)continue;
  const itemId=itemIdOf(item);
  if(auto.toggle&&!seenToggles.has(auto.toggle.key)){
   seenToggles.add(auto.toggle.key);
   const t=auto.toggle,state=states[t.key],active=!!state?.active;
   const stages=Array.isArray(t.stages)&&t.stages.length?t.stages:null;
   const currentStage=stages?(stages.find(s=>s.id===state?.stageId)??stages[0]):null;
   const cost=currentStage?currentStage.cost:(t.cost??0);
   const rules=currentStage?currentStage.rules:(t.rules??[]);
   rows.push({
    id:t.key,kind:'toggle',itemId,sourceId:itemId,sourceName:item.name,
    sourceImg:item.img&&item.img!=='icons/svg/item-bag.svg'?item.img:'icons/svg/aura.svg',
    label:t.label||item.name,active,action:t.action||'Livre',duration:t.duration||'Sustentada',
    cost,costLabel:String(cost),summary:formatAutomationRules(rules),note:t.note||'',
    stages:stages?stages.map(s=>({id:s.id,label:s.label,cost:s.cost,summary:formatAutomationRules(s.rules),selected:s.id===(currentStage?.id)})):null,
    selectedStageId:currentStage?.id??'',selectedStageLabel:currentStage?.label??''
   });
  }
  if(auto.quickAction&&!seenActions.has(auto.quickAction.key)){
   seenActions.add(auto.quickAction.key);
   const q=auto.quickAction;
   rows.push({
    id:q.key,kind:'action',itemId,sourceId:itemId,sourceName:item.name,
    sourceImg:item.img&&item.img!=='icons/svg/item-bag.svg'?item.img:'icons/svg/dice-target.svg',
    label:q.label||item.name,active:false,action:q.action||'Padrão',duration:'Instantânea',
    cost:q.cost??0,costLabel:String(q.cost??0),summary:q.note||'',note:''
   });
  }
  if(auto.chargePool&&!seenCharges.has(auto.chargePool.key)){
   seenCharges.add(auto.chargePool.key);
   const c=resolveItemChargePool(actor,item,auto.chargePool);
   rows.push({
    id:c.key,kind:'charge',itemId,sourceId:itemId,sourceName:item.name,
    sourceImg:item.img&&item.img!=='icons/svg/item-bag.svg'?item.img:'icons/svg/chest.svg',
    label:c.label,active:c.value>0,action:`${c.value} / ${c.max} ${c.unit}`,duration:c.rechargeLabel,
    cost:0,costLabel:'0',summary:c.note,note:'',charge:c
   });
  }
 }
 return rows;
}

export function itemAutomationSummary(actor,item){
 const auto=itemAutomationFor(item);
 if(!auto)return null;
 const states=itemModesState(actor);
 const t=auto.toggle,q=auto.quickAction;
 const active=!!(t&&states[t.key]?.active);
 const stage=t?.stages?.find(s=>s.id===states[t.key]?.stageId);
 const charge=auto.chargePool?resolveItemChargePool(actor,item,auto.chargePool):null;
 return {
  hasPassive:!!auto.passiveRules?.length,
  passiveText:formatAutomationRules(auto.passiveRules??[]),
  hasToggle:!!t,
  hasQuickAction:!!q,
  hasChargePool:!!charge,
  charge,
  active,
  label:t?.label||q?.label||charge?.label||item.name,
  stageLabel:stage?.label||'',
  toggleSummary:t?formatAutomationRules(stage?.rules??t.stages?.[0]?.rules??t.rules??[]):'',
  actionSummary:q?`${q.action||'Padrão'} · Chakra ${q.cost??0}`:''
 };
}

export async function adjustItemCharge(actor,itemId,delta=-1){
 const item=actor?.items?.get?.(itemId),auto=itemAutomationFor(item);
 if(!actor?.isOwner||!item||!auto?.chargePool)return null;
 const c=resolveItemChargePool(actor,item,auto.chargePool);
 const next=delta==='recharge'?(c.rechargeMode==='half'?Math.min(c.max,c.value+Math.max(1,Math.ceil(c.max/2))):c.max):Math.min(c.max,Math.max(0,c.value+Number(delta)));
 await actor.update({[`flags.${ns}.itemCharges.${c.key}`]:{value:next,max:c.max,itemId:item.id,at:new Date().toISOString()}});
 return {key:c.key,value:next,max:c.max};
}

export function virtualItemEffectRows(actor){
 return actorItemActivations(actor).filter(r=>r.kind==='toggle'&&r.active).map(r=>({
  id:'itemMode:'+r.id,
  itemModeKey:r.id,
  sourceId:r.sourceId,
  sourceName:r.sourceName,
  hasSource:true,
  img:r.sourceImg,
  name:r.selectedStageLabel?`${r.label} · ${r.selectedStageLabel}`:r.label,
  duration:r.duration,
  summary:r.summary||'Modo ativo',
  description:r.note||r.summary||'',
  note:'',
  problems:[],
  valid:true,
  endLabel:'Desativar'
 }));
}

export async function deactivateItemMode(actor,key){
 if(!actor?.isOwner||!key)return false;
 if(!itemModesState(actor)[key]?.active)return false;
 await actor.update({[`flags.${ns}.itemModes.${key}.active`]:false,[`flags.${ns}.itemModes.${key}.endedAt`]:new Date().toISOString()});
 return true;
}

export async function toggleItemActivation(actor,itemId,stageId=''){
 const item=actor?.items?.get?.(itemId);
 const auto=itemAutomationFor(item);
 if(!actor?.isOwner||!item||!auto?.toggle)return;
 const t=auto.toggle,states=itemModesState(actor),current=states[t.key];
 const stages=Array.isArray(t.stages)&&t.stages.length?t.stages:null;
 const nextStageId=stages?(stageId||current?.stageId||stages[0].id):'';
 const switchingStage=!!(current?.active&&stages&&stageId&&stageId!==current.stageId);
 const nextActive=switchingStage?true:!current?.active;
 const stage=stages?(stages.find(s=>s.id===nextStageId)??stages[0]):t;
 const cost=Number(stage.cost??0);
 const patch={[`flags.${ns}.itemModes.${t.key}`]:{active:nextActive,stageId:nextStageId,itemId:item.id,sourceName:item.name,at:new Date().toISOString()}};
 if(nextActive&&cost>0){
  const chakra=actor.system.resources?.chakra?.value;
  if(!Number.isInteger(chakra)||chakra<cost)return ui.notifications.warn(`Chakra insuficiente (${chakra??'—'}/${cost}) para ativar ${t.label}.`);
  patch['system.resources.chakra.value']=chakra-cost;
 }
 await actor.update(patch);
 const summary=formatAutomationRules(stage.rules??[]);
 const title=stages&&nextActive?`${t.label} · ${stage.label}`:t.label;
 await foundry.documents.ChatMessage.create({
  speaker:foundry.documents.ChatMessage.getSpeaker({actor}),
  content:`<div class="sns-activation-card"><header><img src="${escapeHtml(item.img||'icons/svg/aura.svg')}" alt=""><div><strong>${escapeHtml(title)}</strong><span>${nextActive?'Ativado':'Encerrado'}</span></div></header><div class="sns-activation-facts"><span>${escapeHtml(t.action||'Livre')}</span><span>Chakra ${nextActive?cost:0}</span><span>${escapeHtml(t.duration||'Sustentada')}</span></div>${summary?`<p>${escapeHtml(summary)}</p>`:''}${t.note?`<p><small>${escapeHtml(t.note)}</small></p>`:''}</div>`,
  flags:{[ns]:{itemActivation:{key:t.key,itemId:item.id,active:nextActive,stageId:nextStageId,cost:nextActive?cost:0}}}
 });
}

export async function runItemQuickAction(actor,itemId){
 const item=actor?.items?.get?.(itemId);
 const auto=itemAutomationFor(item);
 if(!actor?.isOwner||!item||!auto?.quickAction)return;
 const q=auto.quickAction,cost=Number(q.cost??0);
 let nextChakra=null;
 if(cost>0){
  const chakra=actor.system.resources?.chakra?.value;
  if(!Number.isInteger(chakra)||chakra<cost)return ui.notifications.warn(`Chakra insuficiente (${chakra??'—'}/${cost}) para usar ${q.label}.`);
  nextChakra=chakra-cost;
 }
 const mode=q.mode||'none';
 if(mode.startsWith('attack:')||mode==='check'){
  const key=mode==='check'?(q.checkKey||'attribute:esp'):mode.slice(7);
  const {SnsCheckDialog}=await import('./check-dialog.mjs');
  const {rollWithLegado}=await import('./legado-fortune.mjs');
  const {checkFlavor}=await import('./chat-card.mjs');
  let dialog;
  if(actor.type==='shinobi'){
   dialog=await SnsCheckDialog.prompt(actor,key,q.label);
  }else{
   const precision=key.startsWith('attribute:')?actor.system.attributes?.[key.slice(10)]:key.startsWith('skill:')?actor.system.recordedSkills?.find(s=>s.key===key.slice(6))?.precision:actor.system.stats?.[key];
   if(!Number.isInteger(precision))return ui.notifications.warn(`Informe a precisão de ${key} na ficha antes de rolar.`);
   dialog=await SnsCheckDialog.promptRecorded(actor,{key,name:q.label,precision,die:'2d8'});
  }
  if(!dialog)return;
  if(nextChakra!==null)await actor.update({'system.resources.chakra.value':nextChakra});
  const roll=await rollWithLegado(actor,dialog.spec,{kind:mode.startsWith('attack:')?'attack':'test'});
  const baseDamage=q.baseFormula==='halfFor'?Math.ceil((actor.system.attributes?.for??0)/2)+(q.bonus??0):(Number.isInteger(q.base)?q.base:null);
  const extra=baseDamage!==null?`<p>Dano base de referência: <strong>${baseDamage}</strong></p>`:'';
  return roll.toMessage({
   speaker:foundry.documents.ChatMessage.getSpeaker({actor}),
   flavor:`<div class="sns-activation-card"><header><img src="${escapeHtml(item.img||'icons/svg/dice-target.svg')}" alt=""><div><strong>${escapeHtml(q.label)}</strong><span>${escapeHtml(item.name)}</span></div></header><div class="sns-activation-facts"><span>${escapeHtml(q.action||'Padrão')}</span><span>Chakra ${cost}</span></div>${extra}${q.note?`<p>${escapeHtml(q.note)}</p>`:''}</div>`+checkFlavor(dialog.spec,{compact:true}),
   flags:{[ns]:{check:{actorImg:actor.img,key},itemQuickAction:{itemId:item.id,key:q.key}}}
  },{messageMode:dialog.messageMode});
 }
 if(nextChakra!==null)await actor.update({'system.resources.chakra.value':nextChakra});
 const dc=q.dcFormula==='6+int'?6+(actor.system.attributes?.int??0):(Number.isInteger(q.dc)?q.dc:null);
 const dcText=dc!==null?` · Resistência Dif ${dc}`:'';
 return foundry.documents.ChatMessage.create({
  speaker:foundry.documents.ChatMessage.getSpeaker({actor}),
  content:`<div class="sns-activation-card"><header><img src="${escapeHtml(item.img||'icons/svg/dice-target.svg')}" alt=""><div><strong>${escapeHtml(q.label)}</strong><span>${escapeHtml(item.name)}</span></div></header><div class="sns-activation-facts"><span>${escapeHtml(q.action||'Padrão')}</span><span>Chakra ${cost}</span>${dcText?`<span>${escapeHtml(dcText.slice(3))}</span>`:''}</div>${q.note?`<p>${escapeHtml(q.note)}</p>`:''}</div>`,
  flags:{[ns]:{itemQuickAction:{itemId:item.id,key:q.key}}}
 });
}

export async function configureItemAutomation(item){
 if(!item?.isOwner&&!game.user.isGM)return;
 const {RESISTANCE_KEYS}=await import('./jutsu-outcomes.mjs');
 const ACTION_CHECKS=[['cc','Combate corpo a corpo'],['cd','Combate à distância'],['lm','Ler movimento'],...RESISTANCE_KEYS.map(r=>[r.key,r.name])];
 const existing=item.flags?.[ns]?.itemAutomation??{};
 const preset=ITEM_AUTOMATION_PROFILES[ruleKeyOf(item)]??{};
 const passive=existing.passiveRules??preset.passiveRules??[];
 const toggle=existing.toggle??(preset.toggle?{enabled:true,label:preset.toggle.label,action:preset.toggle.action,cost:preset.toggle.cost??0,duration:preset.toggle.duration,rules:preset.toggle.rules??preset.toggle.stages?.[0]?.rules??[],note:preset.toggle.note??''}:{enabled:false,label:item.name,action:'Livre',cost:0,duration:'Sustentada',rules:[],note:''});
 const qa=existing.quickAction??(preset.quickAction?{enabled:true,label:preset.quickAction.label,action:preset.quickAction.action,cost:preset.quickAction.cost??0,mode:preset.quickAction.mode??'none',checkKey:preset.quickAction.checkKey??'attribute:esp',base:preset.quickAction.base??'',note:preset.quickAction.note??''}:{enabled:false,label:item.name,action:'Padrão',cost:0,mode:'none',checkKey:'attribute:esp',base:'',note:''});
 const charge=existing.chargePool??(preset.chargePool?{enabled:true,label:preset.chargePool.label,max:preset.chargePool.max??10,unit:preset.chargePool.unit??'cargas',note:preset.chargePool.note??''}:{enabled:false,label:item.name,max:5,unit:'cargas',note:''});
 const targetOptions=(selected='')=>'<option value="">— Nenhum —</option>'+EFFECT_TARGETS.map(t=>`<option value="${escapeHtml(t.id)}" ${t.id===selected?'selected':''}>${escapeHtml(t.label)}</option>`).join('');
 const checkOptions=(selected='')=>ACTION_CHECKS.map(([k,l])=>`<option value="${escapeHtml(k)}" ${k===selected?'selected':''}>${escapeHtml(l)}</option>`).join('');
 const passiveRows=passive.map((r,i)=>`<li><span>${escapeHtml(TARGET_LABELS[r.target]??r.target)} ${r.value>=0?'+':''}${r.value}</span><label><input type="checkbox" name="rmPassive${i}"> Remover</label></li>`).join('');
 const toggleRuleRows=[0,1,2].map(i=>{const r=toggle.rules?.[i]??{};return `<div class="sns-auto-rule-row"><select name="tTarget${i}">${targetOptions(r.target||'')}</select><input name="tValue${i}" type="number" min="-100" max="100" step="1" value="${Number.isInteger(r.value)?r.value:''}" placeholder="0"></div>`;}).join('');
 const modes=[['none','Somente postar / descrição'],['check','Teste de atributo ou perícia'],['attack:cc','Ataque corpo a corpo (CC)'],['attack:cd','Ataque à distância (CD)'],['attack:lm','Ataque Ler Movimento (LM)']];
 const content=`
  <fieldset><legend>Bônus passivos (enquanto na ficha / equipado)</legend>
   ${passiveRows?`<ul class="sns-effect-binding-list">${passiveRows}</ul>`:'<p class="hint">Nenhum bônus passivo configurado.</p>'}
   <div class="sns-auto-rule-row"><select name="addTarget">${targetOptions('')}</select><input name="addValue" type="number" min="-100" max="100" step="1" placeholder="Valor (+2, -1...)"></div>
  </fieldset>
  <fieldset><legend>Botão de Modo / Ativação na Ficha (Toggle)</legend>
   <label class="sns-auto-check"><input type="checkbox" name="tEnabled" ${toggle.enabled?'checked':''}> Exibir botão de ativar/desativar na ficha</label>
   <div class="sns-auto-grid"><label>Nome do botão<input name="tLabel" value="${escapeHtml(toggle.label??item.name)}"></label><label>Ação<input name="tAction" value="${escapeHtml(toggle.action??'Livre')}"></label><label>Custo de chakra<input name="tCost" type="number" min="0" step="1" value="${toggle.cost??0}"></label><label>Duração<input name="tDuration" value="${escapeHtml(toggle.duration??'Sustentada')}"></label></div>
   <p class="hint">Modificadores aplicados enquanto o modo estiver ativo:</p>
   ${toggleRuleRows}
   <label>Nota<input name="tNote" value="${escapeHtml(toggle.note??'')}"></label>
  </fieldset>
  <fieldset><legend>Botão de Ação / Rolagem Rápida na Ficha</legend>
   <label class="sns-auto-check"><input type="checkbox" name="qEnabled" ${qa.enabled?'checked':''}> Exibir botão de ação rápida na ficha</label>
   <div class="sns-auto-grid"><label>Nome do botão<input name="qLabel" value="${escapeHtml(qa.label??item.name)}"></label><label>Ação<input name="qAction" value="${escapeHtml(qa.action??'Padrão')}"></label><label>Custo de chakra<input name="qCost" type="number" min="0" step="1" value="${qa.cost??0}"></label><label>Modo<select name="qMode">${modes.map(([id,l])=>`<option value="${id}" ${id===(qa.mode||'none')?'selected':''}>${l}</option>`).join('')}</select></label></div>
   <div class="sns-auto-grid"><label>Teste (se modo Teste)<select name="qCheckKey">${checkOptions(qa.checkKey||'attribute:esp')}</select></label><label>Dano base (opcional)<input name="qBase" type="number" min="0" step="1" value="${Number.isInteger(qa.base)?qa.base:''}" placeholder="—"></label></div>
   <label>Nota<input name="qNote" value="${escapeHtml(qa.note??'')}"></label>
  </fieldset>
  <fieldset><legend>4. Contador de cargas / reserva (ex.: insetos, bombas de argila, tarjas, pílulas)</legend>
   <label class="sns-auto-check"><input type="checkbox" name="cEnabled" ${charge.enabled?'checked':''}> Exibir contador de cargas / enxame na ficha</label>
   <div class="sns-auto-grid"><label>Nome da reserva<input name="cLabel" value="${escapeHtml(charge.label??item.name)}"></label><label>Máximo<input name="cMax" type="number" min="1" step="1" value="${Number.isInteger(charge.max)?charge.max:5}"></label><label>Unidade<input name="cUnit" value="${escapeHtml(charge.unit??'cargas')}"></label></div>
   <label>Nota<input name="cNote" value="${escapeHtml(charge.note??'')}"></label>
  </fieldset>`;
 const result=await foundry.applications.api.DialogV2.prompt({
  classes:['sns-editor-dialog','sns-jutsu-effect-editor','sns-item-automation-dialog'],
  window:{title:'Regras e botões da ficha · '+item.name},
  position:{width:640},
  content,
  ok:{label:'Salvar regras e botões',callback:(e,b)=>{
   const f=b.form.elements;
   const nextPassive=passive.filter((_,i)=>!f['rmPassive'+i]?.checked);
   if(f.addTarget.value&&f.addValue.value!=='')nextPassive.push({target:f.addTarget.value,value:Number(f.addValue.value)});
   const tRules=[0,1,2].map(i=>({target:f['tTarget'+i].value,value:f['tValue'+i].value===''?null:Number(f['tValue'+i].value)})).filter(r=>r.target&&Number.isInteger(r.value));
   return {
    passiveRules:validateEffectRules(nextPassive),
    toggle:{enabled:f.tEnabled.checked,label:f.tLabel.value.trim()||item.name,action:f.tAction.value.trim()||'Livre',cost:Math.max(0,Number(f.tCost.value)||0),duration:f.tDuration.value.trim()||'Sustentada',rules:validateEffectRules(tRules),note:f.tNote.value.trim()},
    quickAction:{enabled:f.qEnabled.checked,label:f.qLabel.value.trim()||item.name,action:f.qAction.value.trim()||'Padrão',cost:Math.max(0,Number(f.qCost.value)||0),mode:f.qMode.value,checkKey:f.qCheckKey.value,base:f.qBase.value===''?null:Math.max(0,Number(f.qBase.value)||0),note:f.qNote.value.trim()},
    chargePool:{enabled:f.cEnabled.checked,label:f.cLabel.value.trim()||item.name,max:Math.max(1,Number(f.cMax.value)||1),unit:f.cUnit.value.trim()||'cargas',note:f.cNote.value.trim()}
   };
  }}
 });
 if(result&&(item.isOwner||game.user.isGM))await item.update({[`flags.${ns}.itemAutomation`]:result});
}
