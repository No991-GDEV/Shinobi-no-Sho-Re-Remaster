// Explicit GM-authored timing. Never interpret the book's free-text duration as a timer.
export function durationRule(value={}){
 const mode=value?.mode||'manual';
 if(!['manual','turns','scene'].includes(mode))throw Error('Duração automática desconhecida.');
 if(mode!=='turns')return {mode,turns:1,phase:'end',anchor:'recipient'};
 const {turns,phase,anchor}=value;
 if(!Number.isInteger(turns)||turns<1||turns>100||!['start','end'].includes(phase)||!['recipient','caster'].includes(anchor))throw Error('Informe de 1 a 100 turnos, início/fim e personagem de referência.');
 return {mode,turns,phase,anchor};
}
export function durationClock(rule,combat,anchorUuid){
 rule=durationRule(rule);if(rule.mode!=='turns')return {};
 const turns=Array.from(combat?.turns??[]),matching=turns.filter(c=>c.actor?.uuid===anchorUuid);
 if(!combat?.started||!Number.isInteger(combat.round)||combat.round<1||!Number.isInteger(combat.turn))throw Error('Inicie um combate antes de aplicar uma duração por turnos.');
 if(matching.length!==1)throw Error('O personagem de referência precisa ter uma única entrada neste combate.');
 const index=turns.indexOf(matching[0]);
 const passed=rule.phase==='start'?index<=combat.turn:index<combat.turn;
 const seen=combat.flags?.['sns-v14-dev']?.turnEvents?.[matching[0].id+'~'+rule.phase]??0;
 return {combatId:combat.id,combatantId:matching[0].id,remaining:rule.turns,firstRound:Math.max(combat.round+Number(passed),seen+1),lastRound:0};
}
export function advanceDuration(condition,event){
 const rule=durationRule(condition.durationRule),clock=condition.durationClock;
 if(!condition.active||rule.mode!=='turns'||!clock||clock.combatId!==event.combatId||clock.combatantId!==event.combatantId||rule.phase!==event.phase||event.round<clock.firstRound||event.round<=clock.lastRound||clock.remaining<=0)return null;
 const next={...clock,lastRound:event.round,remaining:clock.remaining-1};
 return {clock:next,expired:next.remaining===0};
}
export function durationLabel(condition){
 const rule=durationRule(condition.durationRule);
 if(rule.mode==='scene')return 'Até encerrar a cena desta ficha';
 if(rule.mode==='manual')return condition.duration||'Até ser encerrado';
 const clock=condition.durationClock;
 return (clock?.remaining??rule.turns)+' turno(s) restante(s) · '+(rule.phase==='start'?'início':'fim')+' · '+(rule.anchor==='caster'?'usuário da técnica':'afetado');
}
const rawDurationFields=()=>'<fieldset><legend>Encerramento</legend><label>Controle<select name="durationMode"><option value="manual">Manual / conforme o texto</option><option value="turns">Contar turnos no combate</option><option value="scene">Ao encerrar a cena desta ficha</option></select></label><label>Quantidade de turnos<input name="durationTurns" type="number" min="1" max="100" step="1" value="1"></label><label>Contar no<select name="durationPhase"><option value="end">Fim do turno</option><option value="start">Início do turno</option></select></label><label>Turno de referência<select name="durationAnchor"><option value="recipient">Personagem afetado</option><option value="caster">Usuário da técnica</option></select></label><small>O fim do turno atual conta se ainda não ocorreu. Inícios já ocorridos não contam. A descrição do livro continua disponível.</small></fieldset>';
export function durationFields(value={}){
 const rule=durationRule(value);let html=rawDurationFields();
 for(const [name,value] of Object.entries({durationMode:rule.mode,durationPhase:rule.phase,durationAnchor:rule.anchor})){
  const pattern=new RegExp('(<select name="'+name+'">)([\\s\\S]*?)(</select>)');
  html=html.replace(pattern,(_,start,options,end)=>start+options.replace('value="'+value+'"','value="'+value+'" selected')+end);
 }
 return html.replace('step="1" value="1"','step="1" value="'+rule.turns+'"');
}
export function actorCombat(actor){
 const matches=Array.from(globalThis.game?.combats??[]).filter(c=>c.started&&Array.from(c.combatants??c.turns??[]).some(t=>t.actor?.uuid===actor.uuid)),viewed=globalThis.game?.combat;
 const explicit=matches.find(c=>c.id===viewed?.id);if(explicit)return explicit;
 const active=matches.filter(c=>c.isActive);return active.length===1?active[0]:matches.length===1?matches[0]:null;
}
export function mayEditTurnLedger(before,expanded,isGM){
 if(isGM)return true;
 const flags=expanded.flags,namespace=flags?.['sns-v14-dev'];
 if(namespace&&['turnMaintenance','-=turnMaintenance'].some(k=>Object.hasOwn(namespace,k)))return false;
 if(before!==undefined&&(Object.hasOwn(expanded,'-=flags')||flags===null||namespace===null||Object.hasOwn(flags??{},'-=sns-v14-dev')))return false;
 return true;
}
export function maintenanceLabel(actor,row){
 const combat=actorCombat(actor);if(!combat)return 'Fora de combate: manutenção manual.';
 const record=actor.flags?.['sns-v14-dev']?.turnMaintenance?.[[combat.id,combat.round,row.sourceId].join('~')];
 return record?(record.status==='paid'?'Rodada '+record.round+': manutenção paga ('+record.cost+' chakra).':'Rodada '+record.round+': manutenção pendente. '+record.reason):'Manutenção automática no próximo início de turno.';
}
export const durationFromForm=f=>durationRule({mode:f.durationMode.value,turns:Number(f.durationTurns.value),phase:f.durationPhase.value,anchor:f.durationAnchor.value});
// Only actual round/turn updates call this; initiative edits are deliberately excluded.
export function combatEvents(prior,current,turns,combatId){
 const n=turns.length;if(!n||current.round<1||current.turn===null)return [];
 const before=prior.round>0?prior.round*n+(prior.turn??0):n-1,after=current.round*n+current.turn;
 if(after<=before)return [];
 if(after-before>1000)throw Error('Avanço de combate muito grande. Avance em etapas para conferir os efeitos.');
 const events=[];
 for(let pos=before+1;pos<=after;pos++){
  if(pos>n){const previous=pos-1;events.push({combatId,combatantId:turns[previous%n].id,actor:turns[previous%n].actor,round:Math.floor(previous/n),phase:'end'});}
  events.push({combatId,combatantId:turns[pos%n].id,actor:turns[pos%n].actor,round:Math.floor(pos/n),phase:'start'});
 }
 return events;
}

export function mountDurationFields(root){const update=()=>{const turns=root.querySelector('[name=durationMode]')?.value==='turns';for(const name of ['durationTurns','durationPhase','durationAnchor']){const input=root.querySelector('[name='+name+']');if(input)input.closest('label').hidden=!turns;}};root.querySelector('[name=durationMode]')?.addEventListener('change',update);update();}
