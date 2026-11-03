import {planNpcPurchases,npcOriginOptions,npcOriginPurchases} from './npc-build-planner.mjs';
import {materializePuppets} from './npc-puppet-core.mjs';
import {fillNpcTechniques} from './npc-build-techniques.mjs';
import {generatorActorView} from './npc-generator-core.mjs';
import {canonicalCopy} from './canonical-content.mjs';
import {NPC_VILLAGES,NPC_ELEMENTS} from '../data/npc-build-profiles.mjs';
import {SKILLS} from './rules.mjs';
import {escapeHtml} from './kernel.mjs';
import {aptitudeChoiceOptions} from './aptitude-choices.mjs';
import {npcPowerSections} from './npc-build-techniques.mjs';
import {traitMap} from './traits.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {grantedResources,resolveSpecialResource} from './special-resources.mjs';
const ns='sns-v14-dev';
export function buildNpcPreview(input,library){
 const plan=planNpcPurchases(input,library),d=plan.draft,entries=Array.isArray(library)?library:library.entries,a=plan.allocation.attributes,village=NPC_VILLAGES.find(v=>v.id===d.village),has=id=>plan.items.some(i=>(i.system.ruleId||i.system.contentId)===id),styleName={taijutsu:'Taijutsu',ninjutsu:'Ninjutsu',genjutsu:'Genjutsu'}[d.style];
 const original=Object.fromEntries(['cc','cd','esq','lm'].map(k=>[k,plan.bases[k]+a[{cc:'for',cd:'des',esq:'agi',lm:'per'}[k]]])),stats={...original};
 if(has('sns:apt:reflexos'))stats.esq++;if(has('sns:apt:intuicao'))stats.lm++;
 if(d.role==='minion'&&d.reinforcedDefense)stats.esq+=2;
 stats.initiative=a.agi+plan.allocation.skillLevels.prontidao;stats.movement=Math.max(1,10+Math.ceil(a.agi*(has('sns:apt:velocista')?2:1)/2));
 const vitality=d.role==='minion'?1:10+3*a.vig+5*d.nc,chakra=10+3*a.esp;
 const data={name:d.name.trim()||(d.role==='minion'?'Capanga':'NPC')+' · '+(plan.items.find(i=>['clan','hijutsu'].includes(i.type))?.name??styleName)+' · NC '+d.nc,type:'npc',img:'icons/svg/mystery-man.svg',ownership:{default:0},system:{nc:d.nc,attributes:a,stats,statsOriginal:{...original,initiative:stats.initiative},skillLevels:plan.allocation.skillLevels,recordedSkills:SKILLS.filter(s=>!s.training||plan.allocation.bought[s.key]>0).filter(s=>s.key!=='voo'&&s.key!=='veneficio').map(s=>({key:s.key,precision:plan.allocation.skillLevels[s.key],untrained:false})),recordedSkillsConfigured:true,resources:{vitality:{value:vitality,max:vitality},chakra:{value:chakra,baseMax:chakra}},traits:['estilo:'+d.style,...(village?.trait?[village.trait]:[]),...(d.origin?[(plan.items.find(i=>i.system.details?.accessRule===d.origin)?.type==='clan'?'cla:':'hijutsu:')+d.origin]:[]),'porte:'+d.size.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase()],tags:[],details:{rank:d.role==='minion'?'Capanga':'NPC',role:styleName+' · '+({balanced:'Versátil',clan:'Técnicas da origem',summon:'Invocações',puppet:'Marionetes'}[d.focus]),village:village?.name??'',size:d.size,defense:''},source:{id:'Gerador SNS · Básico e compêndios',edition:'D167',pages:'Básico19–22;281–282; fontes de cada item'}},items:structuredClone(plan.items),flags:{[ns]:{npcGenerator:{version:2,role:d.role,defenseKey:'esq',draft:d,budget:{attributes:plan.limits.atributos,skills:plan.limits.pericias,powers:plan.limits.poderes_basico}},prerequisiteEvents:d.events,...(d.role==='minion'?{magenCapanga:true}:{})}}};
 data.flags[ns].npcGenerator.effectNeeds=plan.context.effectNeeds;
 data.system.traits=[...new Set(data.system.traits.filter(t=>traitMap.has(t)))];
 const result=fillNpcTechniques(data,d,library);
 const puppet=materializePuppets(data,d,library);
 if(puppet)for(const item of data.items.filter(i=>i.type==='jutsu'&&i.flags?.[ns]?.puppetUse))result.choices.push({id:'puppet|'+item._id,name:item.name,selected:true,locked:true,description:item.system.description,source:item.system.source,img:item.img});
 const built=generatorActorView(data);for(const item of built.items.filter(i=>plan.items.some(p=>p._id===i.id)&&['power','aptitude','jutsu'].includes(i.type))){const check=requirementsFor(item,built);if(!check.valid)for(const problem of check.problems)if(!plan.problems.includes(item.name+': '+problem))plan.problems.push(item.name+': '+problem);}
 data.system.specialResources=grantedResources(built).map(row=>({...row,value:resolveSpecialResource({...built,system:{...built.system,resources:{...built.system.resources,chakra:{...built.system.resources.chakra,max:chakra}}}},row).max}));
 // A selected weapon is one actual inventory item, not a character-specific rule.
 const weapon=entries.find(e=>e.id===d.weapon&&e.document.type==='weapon');if(d.weapon&&!weapon)throw Error('Escolha uma arma do compêndio.');if(weapon){const item=canonicalCopy(weapon);item._id='nw00000000000001';item.system.equipped=true;data.items.push(item);}
 const name=d.origin?plan.items.find(i=>['clan','hijutsu'].includes(i.type))?.name:styleName;
 data.system.description='<p>'+escapeHtml(name)+' · NC '+d.nc+'.</p>'+(d.role==='minion'?'<p>Capanga: 1 de Vitalidade. Sem crítico, golpe de misericórdia ou ataque oportuno contra não capangas; falha em testes de Atributo/Perícia, salvo exceção expressa. Básico, p.281.</p>':'')+'<p>Compras: '+plan.budget.spent+'/'+plan.limits.poderes_basico+' PP; '+plan.budget.freeUsed+'/3 aptidões gratuitas. As regras e referências estão na descrição de cada item.</p>';
 const selectedIds=new Set(plan.items.map(i=>i.system.ruleId||i.system.contentId)),selectedById=new Map(plan.items.map(i=>[i.system.ruleId||i.system.contentId,i]));
 const abilityRows=(d.origin?npcOriginPurchases(library,d.origin):[]).map(row=>{
  const doc=canonicalCopy(row.entry,row.variant),item=selectedById.get(row.id),notice=plan.notices.filter(n=>n.id===row.id).at(-1);
  return {id:row.id,name:row.name,type:row.type,selected:selectedIds.has(row.id),level:item?.system.level??1,maxLevel:Math.floor(d.nc/2),isPower:row.type==='power',choiceType:row.entry.choiceType,choiceKey:item?.system.choice?.key??d.pins[row.id]?.choiceKey??'',options:aptitudeChoiceOptions(doc).map(o=>({...o,selected:o.id===(item?.system.choice?.key??d.pins[row.id]?.choiceKey)})),reason:item?'':notice?.reason??'',description:row.entry.document.system.description};
 });
 return {draft:d,data,actor:generatorActorView(data),...result,puppet,abilityRows,plan,problems:plan.problems,origins:npcOriginOptions(library,d.village,d.foreignOrigin),budget:plan.budget,budgetMax:plan.limits.poderes_basico,attributes:a,stats,originalStats:original,vitality,chakra,fixedDefense:9+stats.esq,skillSpent:plan.allocation.skillSpent,skillMax:plan.limits.pericias,elementName:NPC_ELEMENTS.find(e=>e.id===plan.element)?.name??plan.element};
}
