import {itemArt,assignedItemArt,isPlaceholderArt} from './item-art.mjs';
import {escapeHtml as esc} from './kernel.mjs';
import {traitMap} from './traits.mjs';
import {CONDITION_STATUSES} from '../data/condition-statuses.mjs';
import {RUNTIME_STATES} from '../data/runtime-states.mjs';
import {jutsuRuleText,techniqueSummary,genericRule,readableRuleHtml} from './jutsu-rule-text.mjs';
export const effectLabel=id=>CONDITION_STATUSES.find(s=>s.contentId===id)?.name??RUNTIME_STATES[id]?.name??'Efeito';
export const plainRule=html=>String(html??'').replace(/<\/(?:p|h\d|li|tr)>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s*\n\s*/g,'\n').replace(/[ \t]+/g,' ').trim();
export function techniqueCard(item,projection,use=null){
 const rule=jutsuRuleText(item),data={...projection.data},mental=projection.magen,definition=projection.effect??{},text=readableRuleHtml(definition.text||item.system?.description||definition.notes||'',rule.fields),plain=plainRule(text),paragraphs=plain.split('\n').filter(Boolean),summary=projection.summary??(techniqueSummary(text)||plainRule(definition.notes??''));
 for(const key of ['action','range','duration','target'])if(!data[key]||genericRule(data[key]))data[key]=rule.fields[key]??'';
 const traits=[...new Set([...(projection.traits??[]).map(id=>traitMap.get(id)?.label).filter(Boolean),...(mental?[mental.category==='compulsao'?'Compulsão':'Aflição']:[])])].filter(t=>!['Chakra','Selos de Mão'].includes(t));
 const conditions=[...new Set((projection.autoBindings??[]).map(b=>effectLabel(b.conditionId)))],rank=item.system?.details?.rank,level=projection.legado?'Legado do Ódio':rank?'Rank '+rank:(mental||projection.phantasm)?'Magen '+(item.actor?.items?.get?.(item.system?.details?.powerId)?.system.level??projection.usedLevel):'Nível '+projection.usedLevel;
 const targetCount=use?.targets.length??0,difficulty=use?.difficulty??data.difficulty,targetLabel=targetCount?(targetCount===1?'1 criatura':targetCount+' criaturas'):data.target;
 const fact=(label,value)=>value?'<span><b>'+esc(label)+'</b> '+esc(value)+'</span>':'';
 const outcomes=mental?'<div class="sns-technique-outcomes">'+(!mental.unresistable?'<p><b>Sucesso</b> O alvo resiste à ilusão.</p>':'')+'<p><b>'+(!mental.unresistable?'Falha':'Efeito')+'</b> '+conditions.map(name=>'<span class="sns-condition-chip">'+esc(name)+'</span>').join(' ')+'</p></div>':'';
 return '<section class="sns-technique-card"><header class="sns-technique-title"><img src="'+esc(itemArt(item))+'" alt=""><strong>'+esc(item.name)+'</strong><span>'+esc(level)+'</span></header><div class="sns-chat-tags">'+traits.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><div class="sns-technique-facts">'+fact('Ação',data.action)+fact('Chakra',data.chakraCost)+fact('Alcance',data.range)+fact('Alvos',targetLabel)+fact('Duração',data.duration)+(data.damage&&data.damage!=='Nenhum'?fact(data.damageType==='fixed'?'Dano fixo':'DB',data.damage):'')+(mental&&!mental.unresistable?fact('Resistência','INT · Dif '+difficulty):'')+'</div>'+(summary?'<p class="sns-technique-summary">'+esc(summary)+'</p>':'')+outcomes+(paragraphs.length?'<details class="sns-technique-description"><summary>Descrição completa</summary>'+paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</details>':'')+'</section>';
}

// Old cards also receive readable rule text. Never change their rolls/costs.
export async function decorateTechniqueText(message,element){
 const cast=message.getFlag('sns-v14-dev','npcJutsuCast');if(!cast)return;
 const item=await fromUuid(cast.itemUuid);if(!item)return;const rule=jutsuRuleText(item),labels={'Ação':'action','Alcance':'range','Duração':'duration','Alvos':'target'};
 for(const field of element.querySelectorAll('.sns-technique-facts span')){const label=field.querySelector('b')?.textContent,key=labels[label],old=field.textContent?.slice(label?.length??0).trim();if(key&&genericRule(old)&&rule.fields[key]){field.replaceChildren();const b=document.createElement('b');b.textContent=label;field.append(b,document.createTextNode(' '+rule.fields[key]));}}
 for(const p of element.querySelectorAll('.sns-technique-summary'))if(/^[❖•▪]|^(?:Ação|Custo|Dano|Duração|Alcance):/i.test(p.textContent))p.textContent=techniqueSummary(item.system.description);
}
