import {isProcessor} from './processor-authority.mjs';
import {attackDefenseRows} from './defense-summary.mjs';
import {effectRows,needsResistance,needsHit,validateTargetEffects} from './jutsu-outcomes.mjs';
import {effectLabel} from './technique-card.mjs';
import {defenseController,defenseChoices} from './defense-choices.mjs';
import {requestDefenseChoice} from './defense-workflow.mjs';
const ns='sns-v14-dev',node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
const activeGM=()=>isProcessor();
function button(label,fn){const b=node('button',label);b.type='button';b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){ui.notifications.warn(e.message);}finally{if(b.isConnected)b.disabled=false;}});return b;}
export async function appendResistanceButtons(request,actor,container){
 const r=request.getFlag(ns,'defenseRequest'),response=r.responses[actor.uuid.replaceAll('.','~')],controller=defenseController(actor,game.users),mine=game.user.isGM||controller?.id===game.user.id;
 if(response&&r.profile.edgeContestRoll){const result=request.getFlag(ns,'edgeResults')?.[actor.uuid.replaceAll('.','~')];container.append(node('small',result?.hit==='hit'?'Lâmina estendida · −1 nas reações deste ataque':result?.hit==='miss'?'Lâmina percebida · defesa sem penalidade':'Prontidão declarada · aguardando resultado','sns-save-state'));return;}
 if(response){const outcome=request.getFlag(ns,'phantasmNoticeResult');container.append(node('small',outcome?(outcome.noticed?'Ilusão reconhecida':'Não reconheceu a ilusão'):'Resistência declarada · aguardando resultado','sns-save-state'));return;}
 if(r.status==='cancelled'){container.append(node('small','Solicitação cancelada','sns-save-state'));return;}
 const controls=node('div','','sns-save-controls');
 for(const choice of defenseChoices(actor,r.profile)){
  const label=choice.kind==='resistance'?(r.profile.edgeContestRoll?'Perceber lâmina · ':r.profile.phantasmNotice?'Notar Genjutsu · ':'Resistir · ')+choice.label+(r.profile.edgeContestRoll?' · Espírito ':' · Dif ')+r.profile.resistance.difficulty:choice.label;
  const b=button(label,()=>requestDefenseChoice(request,actor,choice.id));b.className='sns-save-button';const icon=node('i');icon.className='fa-solid fa-dice-d8';icon.setAttribute('aria-hidden','true');b.prepend(icon);b.disabled=!mine;b.title=mine?'Rolar 2d8 e resolver esta resistência':(controller?.name??'Dono do alvo')+' faz esta resistência';controls.append(b);
 }
 container.append(controls);if(!mine)container.append(node('small','Aguardando '+(controller?.name??'o dono do alvo'),'sns-save-state'));
}
export async function decorateJutsuTargets(message,element){
 const use=message.getFlag(ns,'jutsuUse');if(!use||use.version!==2||element.querySelector('[data-sns-jutsu-resolution]'))return;
 try{validateTargetEffects(use.bindings);if(!Array.isArray(use.targets)||!use.results||!use.caster?.uuid)return;}catch{return;}
 const box=node('section','','sns-target-resolution');box.dataset.snsJutsuResolution='';(element.querySelector('.message-content')??element).append(box);
 for(const target of [...new Map(effectRows(use).map(r=>[r.target.uuid,r.target])).values()]){
  const rows=effectRows(use).filter(r=>r.target.uuid===target.uuid);if(!rows.length)continue;
  const actor=await fromUuid(target.uuid),row=node('article','','sns-effect-target'),header=node('header'),name=node('strong',target.name);header.append(name);row.append(header);
  const results=rows.map(r=>use.results[r.key]),done=results.every(Boolean),applied=results.filter(r=>r?.status==='applied');
  if(done){
   const roots=await Promise.all([...new Set(applied.map(r=>r.rootUuid).filter(Boolean))].map(uuid=>fromUuid(uuid))),states=roots.length?Array.from(actor?.items??[]).filter(i=>!i.flags?.[ns]?.illusion?.root&&roots.some(root=>root?.system.appliedCondition.active&&root.flags[ns].illusion.group===i.flags?.[ns]?.illusion?.group)&&i.system.appliedCondition.active):await Promise.all(applied.map(r=>r.itemUuid&&fromUuid(r.itemUuid)));
   const live=states.filter(i=>i?.system.appliedCondition?.active),status=applied.length?(live.length?'Afetado':'Encerrado'):results.some(r=>r.status==='resisted')?'Resistiu':results.some(r=>r.status==='immune')?'Imune':results.some(r=>r.status==='noDamage')?'Sem dano recebido':'Não afetado';
   header.append(node('span',status,'sns-result-status '+(status==='Afetado'?'is-affected':status==='Resistiu'?'is-resisted':'is-neutral')));
   if(live.length){const chips=node('div','','sns-applied-chips');for(const state of live){const chip=button(state.name,()=>state.sheet.render({force:true}));chip.className='sns-condition-chip';chip.disabled=!state.visible;chip.title='Consultar condição';chips.append(chip);}row.append(chips);}
   const reason=results.find(r=>r.reason)?.reason;if(reason)row.append(node('small',reason));
  }else{
   const requests=[...new Set(rows.map(r=>message.getFlag(ns,'effectResistances')?.[r.key]?.requestUuid).filter(Boolean))];
   if(requests.length&&actor)for(const uuid of requests){const request=await fromUuid(uuid);if(request)await appendResistanceButtons(request,actor,row);}
   else row.append(node('small',rows.some(r=>r.binding.requiresDamage)?'A resistência fica disponível após aplicar o dano.':rows.some(r=>needsHit(r.binding))?'Aguardando o resultado do ataque.':rows.some(r=>needsResistance(r.binding))?'Preparando resistência…':'Aplicando efeito…','sns-save-state'));
  }
  box.append(row);
 }
 if(activeGM()&&!effectRows(use).every(r=>use.results[r.key])){const details=node('details','','sns-resolution-adjust'),open=button('Ajustar resolução',async()=>{const {SnsJutsuResolution}=await import('./jutsu-resolution.mjs');await new SnsJutsuResolution(message).render({force:true});});details.append(node('summary','Opções do mestre'),open);box.append(details);}
}
export function decorateCombatInternals(message,element){
 const packet=message.getFlag(ns,'damageUse');if(packet?.defenseRequestUuid&&!element.querySelector('.sns-attack-defense')){const rows=attackDefenseRows(packet,message.getFlag(ns,'defenseResults')),box=node('section','','sns-attack-defense');for(const r of rows){const line=node('div','','sns-defense-line');line.append(node('strong',r.name),node('span',r.choice),node('small',r.test),node('b',r.verdict,r.pending?'pending':r.hit?'hit':'miss'));box.append(line);}const roll=element.querySelector('.dice-roll');if(roll)roll.insertAdjacentElement('afterend',box);else (element.querySelector('.message-content')??element).append(box);}
 element.querySelectorAll('.sns-jutsu-use').forEach(e=>e.remove());
 const r=message.getFlag(ns,'defenseRequest'),reply=message.getFlag(ns,'defenseReply'),result=message.getFlag(ns,'defenseResult');
 const resultParent=result&&game.messages.get(result.attackUuid?.split('.').at(-1)),ordinaryDefense=resultParent?.getFlag(ns,'damageUse')&&!resultParent.getFlag(ns,'damageUse').profile?.resistance;
 const technical=message.getFlag(ns,'defenseCancel')||message.getFlag(ns,'preDefenseBatch')||reply||message.getFlag(ns,'jutsuSecondary')||message.getFlag(ns,'illusionReply')||message.getFlag(ns,'damageUse')?.profile?.resistance&&!message.getFlag(ns,'jutsuUse')&&!message.getFlag(ns,'environmentPulse')||result&&(!message.rolls.length||ordinaryDefense)||r&&(r.profile?.environmentPulse||message.getFlag(ns,'jutsuResistanceRequest')||r.status==='pending'&&Array.isArray(r.targets)&&r.targets.every(t=>r.responses?.[t.uuid.replaceAll('.','~')]));
 if(technical){element.classList.add('sns-internal-message');return;}
 const outcome=message.getFlag(ns,'defenseOutcome');if(outcome?.resistance&&!element.querySelector('.sns-save-verdict')){const verdict=node('p',outcome.hit==='miss'?'Sucesso · resistiu':outcome.hit==='hit'?'Falha na resistência':'Resultado pendente','sns-save-verdict '+(outcome.hit==='miss'?'is-resisted':'is-affected'));(element.querySelector('.message-content')??element).append(verdict);}
}
export function refreshEffectMessages(item){const key=item.system?.appliedCondition?.applicationKey,uuid=key?.startsWith('ChatMessage.')?key.split('#')[0]:null,message=uuid&&game.messages.find(m=>m.uuid===uuid);if(message)ui.chat?.updateMessage(message);}
