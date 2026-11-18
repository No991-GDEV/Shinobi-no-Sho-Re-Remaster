import {durationFields,durationFromForm,mountDurationFields} from './effect-duration.mjs';
import {loadCanonicalLibrary} from './canonical-content.mjs';
import {CONDITION_SCOPES} from './condition-effects.mjs';
import {EFFECT_TRIGGERS,RESISTANCE_KEYS,validateTargetEffects,needsResistance} from './jutsu-outcomes.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const options=(rows,selected)=>rows.map(([id,label])=>'<option value="'+esc(id)+'" '+(id===selected?'selected':'')+'>'+esc(label)+'</option>').join('');
function mountJutsuEffectFields(root){
 const update=()=>{
  const condition=root.querySelector('[name="condition"]')?.value??'';
  const trigger=root.querySelector('[name="trigger"]')?.value??'';
  const dcMode=root.querySelector('[name="dcMode"]')?.value??'jutsu';
  const debilitado=condition==='sns:condition:debilitado';
  const usesResistance=needsResistance({trigger});
  for(const el of root.querySelectorAll('[data-debilitado-only]'))el.hidden=!debilitado;
  for(const el of root.querySelectorAll('[data-resistance-only]'))el.hidden=!usesResistance;
  for(const el of root.querySelectorAll('[data-fixed-dc-only]'))el.hidden=!usesResistance||dcMode!=='fixed';
 };
 for(const name of ['condition','trigger','dcMode'])root.querySelector('[name="'+name+'"]')?.addEventListener('change',update);
 mountDurationFields(root);
 update();
}
export async function configureJutsuEffects(item){
 if(!game.user.isGM||!item.isOwner||item.type!=='jutsu')return;
 const library=await loadCanonicalLibrary(),conditions=library.entries.filter(e=>e.document.type==='condition'),rows=validateTargetEffects(item.system.targetEffects??[]);
 const existing=rows.map((b,i)=>'<li><span>'+esc(conditions.find(c=>c.id===b.conditionId)?.document.name??b.conditionId)+' · '+esc(EFFECT_TRIGGERS[b.trigger])+' · '+(b.recipient==='self'?'Usuário':'Alvos')+'</span><label><input type="checkbox" name="remove'+i+'"> Remover</label></li>').join('');
 const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog','sns-jutsu-effect-editor'],window:{title:'Efeitos do jutsu · '+item.name},position:{width:640},content:(existing?'<fieldset><legend>Efeitos configurados</legend><ul class="sns-effect-binding-list">'+existing+'</ul></fieldset>':'')+'<fieldset><legend>Condição e alvo</legend><label>Adicionar condição<select name="condition"><option value="">Manter somente os efeitos atuais</option>'+options(conditions.map(c=>[c.id,c.document.name]))+'</select></label><label>Recebe o efeito<select name="recipient">'+options([['targets','Alvos marcados'],['self','Usuário']])+'</select></label><label data-debilitado-only>Grau de Debilitado<input name="degree" type="number" min="1" max="3" value="1"></label><label data-debilitado-only>Escopo de Debilitado<select name="scope">'+options(CONDITION_SCOPES.map(k=>[k,({all:'Todos os testes',attacks:'Ataques',defenses:'Defesas e Esquiva',initiative:'Iniciativa'})[k]??RESISTANCE_KEYS.find(r=>r.key===k)?.name??k]),'all')+'</select></label></fieldset><fieldset><legend>Gatilho e resistência</legend><label>Quando aplicar<select name="trigger">'+options(Object.entries(EFFECT_TRIGGERS),'hit')+'</select></label><label data-resistance-only>Resistência<select name="resistance">'+options(RESISTANCE_KEYS.map(r=>[r.key,r.name]),'attribute:vig')+'</select></label><label data-resistance-only>Dificuldade da resistência<select name="dcMode">'+options([['jutsu','Calculada pelo jutsu'],['fixed','Fixa, conforme a regra']])+'</select></label><label data-fixed-dc-only>Dificuldade fixa<input name="dc" type="number" min="1" step="1" placeholder="Somente se fixa"></label><small>“Ao acertar” exige defesa resolvida; resistência é um teste separado.</small></fieldset><fieldset><legend>Duração e observações</legend><label>Duração no texto<input name="duration" placeholder="Conforme o jutsu; encerramento manual"></label><label>Fonte / regra<input name="source" placeholder="Livro e página ou regra da mesa"></label><label>Observação<input name="note"></label></fieldset>'+durationFields(),render:(e,dialog)=>mountJutsuEffectFields(dialog.element),ok:{label:'Salvar efeitos',callback:(event,button)=>{
  const f=button.form.elements,kept=rows.filter((_,i)=>!f['remove'+i]?.checked);if(f.condition.value)kept.push({id:foundry.utils.randomID(),conditionId:f.condition.value,recipient:f.recipient.value,trigger:f.trigger.value,degree:Number(f.degree.value),scope:f.scope.value,resistance:f.resistance.value,dcMode:f.dcMode.value,dc:f.dc.value?Number(f.dc.value):0,duration:f.duration.value.trim(),durationRule:durationFromForm(f),source:f.source.value.trim(),note:f.note.value.trim()});return validateTargetEffects(kept);
 }}});
 if(result&&game.user.isGM&&item.isOwner)await item.update({'system.targetEffects':result});
}
