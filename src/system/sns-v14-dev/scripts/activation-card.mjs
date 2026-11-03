import {escapeHtml as esc} from './kernel.mjs';
export function activationCard(row,active){
 const state=row.transplanted?(active?'Olho descoberto':'Olho coberto'):(active?'Ativado':'Desativado');
 const summary=row.transplanted?'Manutenção de '+row.upkeep+' chakra por turno, enquanto descoberto.':active?(row.rule==='sharingan'?'Percepção ampliada e visão de chakra.':'Aptidão ativada.'):'Aptidão desativada.';
 return '<article class="sns-activation-card '+(active?'is-active':'')+'"><header><img src="'+esc(row.sourceImg||'icons/svg/eye.svg')+'" alt=""><div><strong>'+esc(row.sourceName)+'</strong><span>'+state+'</span></div></header><div class="sns-activation-facts"><span><i class="fa-solid fa-circle-dot" aria-hidden="true"></i> Chakra '+(active?row.cost:0)+'</span><span>'+esc(active?row.duration:'Encerrado')+'</span></div><p>'+esc(summary)+'</p><details><summary>Benefícios e regras</summary><p>'+esc(row.hint)+'</p>'+(row.note?'<p>'+esc(row.note)+'</p>':'')+'<small>'+esc(row.source)+'</small></details></article>';
}
