import {activationCard} from './activation-card.mjs';
import {actorCombat} from './effect-duration.mjs';
import {withEffectLock} from './effect-lifecycle.mjs';
import {ACTIVATION_RULES,activationRows,resolveActiveAptitude,activationChange,upkeepChange} from './active-aptitudes.mjs';
import {escapeHtml} from './kernel.mjs';
const pending=new WeakSet();
export async function configureActiveAptitude(actor,id=''){
 if(!actor.isOwner||!game.user.isGM)return;
 const rows=actor.system.activeAptitudes,baseline=JSON.stringify(rows),existing=rows.find(r=>r.id===id);
 if(existing?.active)return ui.notifications.warn('Desative a aptidão antes de alterar sua configuração.');
 const aptitudes=actor.items.filter(i=>i.type==='aptitude');
 const selected=existing?.sourceId??'';
 const content='<p>Escolha a aptidão e a regra de ativação.</p><label>Aptidão<select name="source"><option value="">Selecione</option>'+aptitudes.map(i=>'<option value="'+i.id+'" '+(i.id===selected?'selected':'')+'>'+escapeHtml(i.name)+'</option>').join('')+'</select></label><label>Regra<select name="rule">'+Object.entries(ACTIVATION_RULES).filter(([key])=>key!=='transplanted').map(([key,r])=>'<option value="'+key+'" '+(key===(existing?.rule??'sharingan')?'selected':'')+'>'+escapeHtml(r.label)+'</option>').join('')+'</select></label><p>Sharingan: Percepção 3 · ação parcial · 1 chakra · uma cena. Para olhos transplantados, use a característica de transplante.</p>'+ (game.user.isGM?'<label>Custo de ativação · exceção<input name="cost" type="number" min="0" step="1" value="'+(existing?.cost??'')+'" placeholder="Definir"></label>':'<p>Custo personalizado: definido pelo mestre.</p>')+'<label>Motivo e restrições<input name="note" value="'+escapeHtml(existing?.note??'')+'"></label><label><input type="checkbox" name="confirmed"> Requisitos atendidos</label>';
 const value=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Configurar aptidão ativa'},position:{width:500},content,ok:{label:'Salvar',callback:(e,b)=>{const f=b.form.elements;return {sourceId:f.source.value,rule:f.rule.value,cost:game.user.isGM?(f.cost.value===''?null:Number(f.cost.value)):existing?.cost??null,note:f.note.value.trim(),confirmed:f.confirmed.checked};}}});
 if(!value||!actor.isOwner)return;
 if(JSON.stringify(actor.system.activeAptitudes)!==baseline)return ui.notifications.warn('A configuração mudou. Abra-a novamente.');
 if(!value.confirmed)return ui.notifications.warn('Verifique os requisitos e marque “Requisitos atendidos”.');
 if(actor.items.get(value.sourceId)?.type!=='aptitude')return ui.notifications.warn('Selecione uma aptidão desta ficha.');
 if(rows.some(r=>r.sourceId===value.sourceId&&r.id!==existing?.id))return ui.notifications.warn('Esta aptidão já está configurada.');
 const row={id:existing?.id??foundry.utils.randomID(),sourceId:value.sourceId,rule:value.rule,cost:value.cost,note:value.note,active:false,history:existing?.history??[]};
 if(value.rule==='sharingan'){const result=resolveActiveAptitude(actor,row);if(!result.valid)return ui.notifications.warn(result.problems.join(' '));}
 if(value.rule==='manual'&&!value.note)return ui.notifications.warn('Informe o motivo da exceção.');
 const updated=rows.map(r=>r.id===row.id?row:r);if(!existing)updated.push(row);
 await actor.update({'system.activeAptitudes':updated});
}
export async function toggleActiveAptitude(actor,id){
 if(!actor.isOwner||pending.has(actor))return;pending.add(actor);
 try{const before=JSON.stringify(actor.system.activeAptitudes),row=activationRows(actor).find(r=>r.id===id);if(!row)return;
  const r=resolveActiveAptitude(actor,row),active=!row.active;
  if(active&&!r.valid)return ui.notifications.warn(r.problems.join(' '));
  const confirmed=r.transplanted||['sharingan','byakugan','legado-sharingan'].includes(r.rule)||await foundry.applications.api.DialogV2.confirm({classes:['sns-editor-dialog'],window:{title:(active?'Ativar ':'Desativar ')+r.sourceName},content:'<p>'+escapeHtml(active?r.action+' · Chakra '+r.cost+' · '+r.duration:'Encerrar a aptidão? O chakra gasto não será recuperado.')+'</p><p>'+escapeHtml(r.hint)+'</p><p>'+escapeHtml(r.note)+'</p><p>'+escapeHtml(r.source)+'</p>',yes:{label:active?'Ativar e gastar chakra':'Desativar'},no:{label:'Cancelar'}});
  if(!confirmed||!actor.isOwner)return;
  if(JSON.stringify(actor.system.activeAptitudes)!==before)return ui.notifications.warn('A ativação mudou. Tente novamente.');
  await withEffectLock(actor,async()=>{
  if(JSON.stringify(actor.system.activeAptitudes)!==before)throw Error('A ativação mudou. Tente novamente.');
  const current=activationRows(actor).find(r=>r.id===id),change=activationChange(actor,current,active,{user:game.user.id,at:new Date().toISOString()});
  const updated=actor.system.activeAptitudes.map(r=>r.id===id?change.row:r);if(!updated.some(r=>r.id===id))updated.push(change.row);
  const patch={'system.activeAptitudes':updated};if(active&&r.cost>0)patch['system.resources.chakra.value']=change.chakra;
  await actor.update(patch);});
  if(r.transplanted)return;
  await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:activationCard(r,active),flags:{'sns-v14-dev':{activation:{sourceId:row.sourceId,active,chakraCost:active?r.cost:0}}}});
 }catch(error){ui.notifications.warn(error.message);}finally{pending.delete(actor);}
}
export async function payAptitudeUpkeep(actor,id){
 if(actorCombat(actor))return ui.notifications.warn('No combate, a manutenção é automática no início do turno.');
 if(!actor.isOwner||pending.has(actor))return;pending.add(actor);
 try{
  const before=JSON.stringify(actor.system.activeAptitudes),row=activationRows(actor).find(r=>r.id===id);if(!row)return;
  const r=resolveActiveAptitude(actor,row);if(!r.valid||!r.transplanted||!row.active)return;
  const confirmed=await foundry.applications.api.DialogV2.confirm({classes:['sns-editor-dialog'],window:{title:'Manutenção · '+r.sourceName},content:'<p>Manter o olho descoberto por <strong>1 turno</strong>: '+r.upkeep+' pontos de chakra, conforme os PP do estágio '+escapeHtml(r.stage)+'.</p><p>As técnicas têm custo separado. Com chakra 0, resolva Colapso do Olho: teste de Vigor e drenagem de chakra.</p>',yes:{label:'Pagar 1 turno'},no:{label:'Cancelar'}});
  if(!confirmed||!actor.isOwner)return;
  if(JSON.stringify(actor.system.activeAptitudes)!==before)return ui.notifications.warn('O estado mudou. Reabra a manutenção.');
  let change;await withEffectLock(actor,async()=>{
  if(actorCombat(actor)||JSON.stringify(actor.system.activeAptitudes)!==before)throw Error('O turno ou a aptidão mudou. Tente novamente.');
  change=upkeepChange(actor,activationRows(actor).find(r=>r.id===id),{user:game.user.id,at:new Date().toISOString()});
  await actor.update({'system.activeAptitudes':actor.system.activeAptitudes.map(s=>s.id===id?change.row:s),'system.resources.chakra.value':change.chakra});});
  await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:'<div class="sns-chat-card"><strong>'+escapeHtml(r.sourceName)+'</strong><p>Manutenção: 1 turno · Chakra '+r.upkeep+' · '+change.chakra+' restantes.</p>'+(change.chakra===0?'<p>Chakra 0 · Colapso do Olho: teste Vigor e resolva a drenagem (Enciclopédia, p.14).</p>':'')+'</div>',flags:{'sns-v14-dev':{activation:{sourceId:row.sourceId,event:'upkeep',chakraCost:r.upkeep}}}});
 }catch(error){ui.notifications.warn(error.message);}finally{pending.delete(actor);}
}
