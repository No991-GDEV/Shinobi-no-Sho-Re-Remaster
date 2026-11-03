import {decorateLegacyUiCopy} from './ui-copy.mjs';
import {energyFor,creationData} from './support-core.mjs';
import {escapeHtml} from './kernel.mjs';
import {signed,COMPONENT_TYPES} from './roll-components.mjs';
import {traitLabels} from './traits.mjs';
export const attackTraitLabels=item=>item?[...(energyFor(item.actor,item,'cc')||energyFor(item.actor,item,'cd')?['Energizar']:[]),...(creationData(item)?['Arma criada']:[]),...traitLabels(item.system).filter(t=>/^(arma-|dano-tipo|arte|elemento|finalidade|aplicacao|execucao)/.test(t.id)).map(t=>t.label)]:[];
export function checkFlavor(spec,{compact=false,traits=[]}={}){
  const tag=spec.key==='initiative'?'INICIATIVA':spec.key.startsWith('skill:')?'PERÍCIA':spec.key.startsWith('attribute:')?'ATRIBUTO':spec.key==='lm'?'LER MOVIMENTO':'ATAQUE';
  const rows=spec.components.map(r=>'<span class="sns-chat-modifier '+(r.enabled?'':'off')+'" title="'+escapeHtml(COMPONENT_TYPES[r.type]+(r.enabled?'':' · Não aplicado'))+'">'+escapeHtml(r.label)+' '+signed(r.value)+'</span>').join('');
  return '<div class="sns-chat-flavor">'+(compact?'':'<strong class="sns-check-name">'+escapeHtml(spec.name)+'</strong><div class="sns-chat-tags">'+[...new Set([tag,...traits])].map(t=>'<span>'+escapeHtml(t)+'</span>').join('')+'</div>')+(spec.automaticFailure?'<p class="sns-save-verdict is-affected">Falha automática · Capanga</p>':'')+'<div class="sns-chat-modifiers">'+rows+'</div></div>';
}
export function decorateChatCard(message,element){
  decorateLegacyUiCopy(message,element);
  const saved=message.getFlag('sns-v14-dev','check'),actor=game.actors.get(message.speaker?.actor),meta=saved??{actorImg:actor?.visible?actor.img:'icons/svg/mystery-man.svg'};
  if(!element.querySelector('.sns-chat-flavor,.sns-technique-card,.sns-activation-card')&&!message.getFlag('sns-v14-dev','jutsuUse'))return;
  element.classList.add('sns-chat-message');
  element.querySelectorAll('.sns-chat-modifier').forEach(row=>{row.textContent=row.textContent.replace(/^Precisão registrada(?=\s|$)/,'Precisão');});
  element.querySelectorAll('.sns-chat-tags span').forEach(tag=>{if(tag.textContent==='TESTE')tag.remove();});
  const header=element.querySelector('.message-header');
  if(header&&!header.querySelector('.sns-chat-portrait')){
    const portrait=document.createElement('img');portrait.className='sns-chat-portrait';portrait.src=meta.actorImg;portrait.alt='';header.prepend(portrait);
    const author=document.createElement('span');author.className='sns-chat-author';author.textContent=message.author?.name??'';header.append(author);
  }
}
