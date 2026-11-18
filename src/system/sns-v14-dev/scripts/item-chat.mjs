import {displayItemArt} from './item-art.mjs';
import {ATTRIBUTES,escapeHtml} from './kernel.mjs';
import {itemProfile,itemCategory} from './sheet-profiles.mjs';
import {traitLabels,fold} from './traits.mjs';
import {plainRule} from './technique-card.mjs';
import {effectiveRuleItem,jutsuRuleText,readableRuleHtml,techniqueSummary} from './jutsu-rule-text.mjs';
import {shareTechniqueToChat} from './standalone-technique.mjs';
import {itemAutomationSummary} from './item-automation.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {selectedAptitudeName} from './aptitude-choices.mjs';
import {POWER_ORIGINS} from './power-groups.mjs';
import {ACCESS_ORIGINS} from './restricted-access.mjs';
import {cleanRuntimeDescription} from './ui-copy.mjs';
import {WEAPON_DAMAGE_PROFILES} from '../data/damage-profiles.mjs';
import {WEAPON_CLASSES} from '../data/weapon-defense-profiles.mjs';

const REQUIREMENT_TYPES=new Set(['aptitude','feature','power','clan','hijutsu']);
const PASSIVE_EQUIP_TYPES=new Set(['weapon','armor','shield','equipment']);
const NO_LEVEL_TYPES=new Set(['aptitude','feature','clan','hijutsu','background']);
const ATTR_LABELS=Object.fromEntries(ATTRIBUTES.map(([k,abbr,label])=>[k,`${abbr} (${label})`]));

const cleanText=html=>plainRule(String(html??'').replace(/<br\s*\/?>/gi,'\n'))
 .replace(/&quot;/g,'"').replace(/&#(?:39|x27);/gi,"'").replace(/&#160;/g,' ');

const hasValue=v=>v!==null&&v!==undefined&&String(v).trim()!=='';

const clip=(text,max=240)=>{
 const s=String(text??'').trim();
 if(s.length<=max)return s;
 const cut=s.slice(0,max).replace(/\s+\S*$/,'').trim();
 return (cut||s.slice(0,max).trim())+'…';
};

function rightHeaderLabel(item,sys,profile){
 const base=String(profile?.label||'Item').split(' / ')[0];
 const lvl=Number(sys.level);
 if(item?.type==='power')return Number.isInteger(lvl)&&lvl>0?`${base} · Nível ${lvl}`:base;
 if(!NO_LEVEL_TYPES.has(item?.type)&&Number.isInteger(lvl)&&lvl>0)return `${base} · Nível ${lvl}`;
 return base;
}

function collectTags(sys,profile){
 const out=[profile.label];
 const seen=new Set([fold(profile.label),fold(String(profile.label).split(' / ')[0])]);
 for(const label of [...traitLabels(sys).map(t=>t.label),...(sys.tags??[])]){
  const text=String(label??'').trim();
  const key=fold(text);
  if(!text||seen.has(key))continue;
  seen.add(key);
  out.push(text);
 }
 return out;
}

function formatAutomation(auto){
 if(!auto)return '';
 const parts=[];
 if(auto.hasPassive&&auto.passiveText)parts.push(`Passivo: ${auto.passiveText}`);
 if(auto.hasToggle)parts.push(`${auto.active?'Ativo':'Modo'}: ${auto.toggleSummary||auto.label}`);
 if(auto.hasQuickAction&&auto.actionSummary)parts.push(`Ação: ${auto.actionSummary}`);
 if(auto.hasChargePool&&auto.charge)parts.push(`${auto.charge.label}: ${auto.charge.value}/${auto.charge.max} ${auto.charge.unit}`);
 return parts.join(' · ');
}

function collectFacts(item,sys,profile,actor){
 const d=sys.details??{},facts=[];
 const add=(label,value)=>{if(hasValue(value))facts.push([label,String(value).trim()]);};

 if(profile.physical){
  if(item.type==='weapon'){
   const dmgProfile=WEAPON_DAMAGE_PROFILES[sys.contentId];
   add('Dano',hasValue(d.damage)?d.damage:(dmgProfile?String(dmgProfile.weaponDamage):''));
   add('Alcance',d.range);
   if(dmgProfile?.criticalAt)add('Crítico',dmgProfile.criticalAt>=16?String(dmgProfile.criticalAt):`${dmgProfile.criticalAt}–16`);
   add('Forma',d.attackMode);
   add('Classe',d.weaponClass||WEAPON_CLASSES[sys.contentId]);
   add('Atributo CC',d.ccAttribute);
   add('Recarga',d.reload);
  }else if(['armor','shield'].includes(item.type)){
   add('Absorção',d.absorption);
   add('Resistência',d.resistance);
   add('Penalidades',d.penalty);
   if(hasValue(d.capacityModifier)&&Number(d.capacityModifier)!==0)add('Ajuste de carga',d.capacityModifier);
   add('Restrições',d.restrictions);
  }else if(['consumable','kit'].includes(item.type)){
   add('Ação',d.action);
   add('Duração',d.duration);
   if(hasValue(d.uses)||hasValue(d.usesMax))add('Usos',`${d.uses??0}/${d.usesMax??'—'}`);
   add('Efeito',d.effect);
   add('Conteúdo',d.contents);
  }else if(item.type==='ammunition'){
   add('Compatível',d.compatible);
   add('Por compartimento',d.perCompartment);
  }else if(item.type==='container'){
   add('Capacidade',d.capacity);
   add('Conteúdo',d.contents);
  }else if(item.type==='document'){
   add('Autor',d.author);
   add('Conteúdo',d.contents);
  }
  add('Uso',d.usage);
  add('Tamanho',d.size);
  add('Compartimentos',sys.compartments);
  if(hasValue(d.price))add('Preço',`${d.price} Ryo`);
  add('Quantidade',sys.quantity);
  if(sys.equipped)add('Estado','Em uso');
  else if(PASSIVE_EQUIP_TYPES.has(item.type))add('Estado','Guardado');
  add('Propriedade',d.ownership);
 }else if(['power','clan','hijutsu','aptitude','feature','background'].includes(item.type)){
  const pp=d.stagePowerCost??d.powerCost;
  if(hasValue(pp))add('Custo',`${pp} PP`);
  const origin=item.type==='power'?(POWER_ORIGINS[d.powerOrigin]??(d.powerOrigin==='manual'?'Outro · mestre':d.powerOrigin)):(ACCESS_ORIGINS[d.accessRule]||d.village||d.donor);
  add('Origem',origin);
  if(hasValue(d.keyAttribute))add('Atributo-chave',ATTR_LABELS[d.keyAttribute]??d.keyAttribute);
  add('Natureza',d.nature);
  add('Estágio',d.eyeStage);
  add('Ação',d.action);
  add('Chakra',d.chakraCost);
  add('Alcance',d.range);
  add('Duração',d.duration);
  add('Recurso',d.resourceRule);
  add('Acesso',d.access);
  let reqStatus='';
  if(actor&&REQUIREMENT_TYPES.has(item.type)){
   try{const req=requirementsFor(item,actor);if(req.configured)reqStatus=req.valid?'Atendidos':'Não atendidos';}catch{}
  }
  add('Requisitos',reqStatus||d.requirements);
  add('Restrições',d.restrictions);
 }else{
  add('Ação',d.action);
  add('Chakra',d.chakraCost);
  add('Alcance',d.range);
  add('Alvos',d.target);
  add('Duração',d.duration||sys.appliedCondition?.duration);
  add('Dificuldade',d.difficulty);
  add('Dano',d.damage);
  add('Precisão',d.precision);
  add('Defesas',d.defenses);
  add('Tempo',d.time);
  add('Ingredientes',d.ingredients);
  add('Produto',d.output);
  if(hasValue(d.price))add('Preço',`${d.price} Ryo`);
  add('Grau',d.degree);
  add('Categoria',d.poisonCategory);
  add('Início',d.onset);
  add('Resistência',d.resistance);
  add('Estágios',d.stages);
  add('Tratamento',d.treatment);
  add('Origem',d.sourceActor||sys.appliedCondition?.origin);
  add('Efeito',d.effect);
  add('Término',d.ending);
  add('Requisitos',d.requirements);
 }

 try{
  const autoText=formatAutomation(itemAutomationSummary(actor,item));
  add('Automação',autoText);
 }catch{}

 return facts;
}

function renderDescription(ruleItem,sys){
 let raw=sys.description??'';
 if(sys.contentId?.startsWith('sns:state:'))raw=cleanRuntimeDescription(raw);
 let fields={};
 try{fields=jutsuRuleText(ruleItem).fields;}catch{}
 const html=readableRuleHtml(raw,fields);
 const plain=cleanText(html);
 const paragraphs=plain.split('\n').map(p=>p.trim()).filter(Boolean);
 let out='';
 if(paragraphs.length){
  if(plain.length<=280&&paragraphs.length<=2){
   out+=paragraphs.map((p,i)=>`<p${i===0?' class="sns-technique-summary"':''}>${escapeHtml(p)}</p>`).join('');
  }else{
   const summaryText=cleanText(techniqueSummary(html))||paragraphs[0];
   out+=`<p class="sns-technique-summary">${escapeHtml(clip(summaryText,260))}</p>`;
   out+=`<details class="sns-technique-description"><summary>Descrição completa</summary>${paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}</details>`;
  }
 }
 const notes=String(sys.personalNotes??'').trim();
 if(notes)out+=`<p class="sns-item-chat-notes"><b>Notas</b> ${escapeHtml(notes)}</p>`;
 return out;
}

export function itemChatCard(item,actor=item?.actor??null){
 const normalized=item?.system?item:{...item,system:{}};
 let ruleItem=normalized;
 try{ruleItem=effectiveRuleItem(normalized);}catch{}
 const sys=ruleItem.system??{};
 const profile=itemProfile(ruleItem);
 let title=ruleItem.name??'Item';
 try{title=selectedAptitudeName(ruleItem);}catch{}
 const rightLabel=rightHeaderLabel(ruleItem,sys,profile);
 const tags=collectTags(sys,profile).map(t=>`<span>${escapeHtml(t)}</span>`).join('');
 const facts=collectFacts(ruleItem,sys,profile,actor)
  .map(([label,value])=>`<span><b>${escapeHtml(label)}</b> ${escapeHtml(value)}</span>`).join('');
 const body=renderDescription(ruleItem,sys);
 return `<section class="sns-technique-card sns-item-chat-card"><header class="sns-technique-title"><img src="${escapeHtml(displayItemArt(ruleItem))}" alt=""><strong>${escapeHtml(title)}</strong><span>${escapeHtml(rightLabel)}</span></header><div class="sns-chat-tags">${tags}</div>${facts?`<div class="sns-technique-facts">${facts}</div>`:''}${body}</section>`;
}

export async function shareItemToChat(actor,item){
 if(!actor||(!actor.isOwner&&!globalThis.game?.user?.isGM)||item?.actor!==actor)return;
 if(item.type==='jutsu')return shareTechniqueToChat(actor,item);
 return foundry.documents.ChatMessage.create({
  speaker:foundry.documents.ChatMessage.getSpeaker({actor}),
  content:itemChatCard(item,actor),
  flags:{
   'sns-v14-dev':{
    sharedItemCard:{actorUuid:actor.uuid,itemUuid:item.uuid},
    check:{actorImg:actor.img,key:item.type}
   }
  }
 });
}
