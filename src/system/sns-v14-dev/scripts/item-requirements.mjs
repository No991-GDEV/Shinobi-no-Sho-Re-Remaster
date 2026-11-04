import {legadoRequirement} from './legado-core.mjs';
// Canonical requirements are code, never editable thresholds stored on an owned item.
import {TRANSPLANT_RULE,EYE_STAGES} from './characteristic-effects.mjs';
import {LEGADO_REQUIREMENTS} from '../data/legado-requirements.mjs';
import {sourceAvailable} from '../data/optional-sources.mjs';
import {aptitudeChoiceStatus,choiceFieldLabel,aptitudeChoiceOptions} from './aptitude-choices.mjs';
import {SKILLS} from './rules.mjs';
import {accessSources,eyeAccess,powerLevel,powerSources,ACCESS_ORIGINS,originGrant,summonPact} from './restricted-access.mjs';
import {COMMON_APTITUDE_RULES,COMMON_APTITUDE_CHOICES} from '../data/common-aptitudes.mjs';
import {CATALOG_ACQUISITION_RULES} from '../data/package-content.mjs';
import {RELATED_ACQUISITION_RULES} from '../data/related-content.mjs';
import {completeRequirements} from '../data/requirement-completion.mjs';
import {requirementProfile,validateRequirementProfile} from './requirement-policy.mjs';
import {recordedSkillLevel} from './recorded-skill-level.mjs';
import {sourceReviewedItem} from './source-review-compat.mjs';
const attr=(key,min,label)=>({kind:'attribute',key,min,label});
const owns=(id,label)=>({kind:'owned',id,label});
const either=(...options)=>({kind:'any',options});
const skill=(key,min,label)=>({kind:'skillLevel',key,min,label});
const access=key=>({kind:'access',key});
const eye=stage=>({kind:'eyeAccess',stage});
const definitions={
 'sns:jutsu:amaterasu':{name:'Amaterasu',source:'Básico 4.1b · Amaterasu',requirements:[owns('sns:apt:mangekyou-sharingan','Mangekyou Sharingan'),{kind:'powerLevel',id:'sns:power:katon',min:8,label:'Katon'}]},
 'sns:jutsu:tsukuyomi':{name:'Tsukuyomi',source:'Básico 4.1b · Tsukuyomi',requirements:[owns('sns:apt:mangekyou-sharingan','Mangekyou Sharingan'),owns('sns:apt:fascinar','Fascinar'),owns('sns:apt:ilusao-profunda','Ilusão Profunda'),attr('int',16,'Inteligência')]},
 'sns:jutsu:susanoo':{name:'Susanoo',source:'Básico 4.1b · Susanoo',requirements:[owns('sns:apt:mangekyou-sharingan','Mangekyou Sharingan'),{kind:'pending',label:'dominar o par de técnicas do Mangekyou Sharingan'}]},
 'sns:jutsu:armadura-a-vapor':{name:'Armadura a Vapor',source:'Livro de Hijutsus 4.1b · p.43',requirements:[either(attr('for',10,'Força'),attr('vig',15,'Vigor')),owns('sns:apt:usar-armaduras-pesadas','Usar Armaduras Pesadas')]},
 'sns:apt:acuidade':{name:'Acuidade',pages:'61',requirements:[attr('des',3,'Destreza')]},
 'sns:apt:diligente':{name:'Diligente',pages:'63',requirements:[]},
 'sns:apt:velocista':{name:'Velocista',pages:'67',requirements:[]},
 'sns:apt:ataque-em-movimento':{name:'Ataque em Movimento',pages:'61–62',requirements:[attr('agi',4,'Agilidade')]},
 'sns:apt:intuicao':{name:'Intuição',pages:'63',requirements:[]},
 'sns:apt:lutador':{name:'Lutador',pages:'63',requirements:[]},
 'sns:apt:ponto-cego':{name:'Ponto Cego',pages:'65',requirements:[either(attr('agi',6,'Agilidade'),skill('prestidigitacao',6,'Nível de Prestidigitação'))]},
 'sns:apt:saque-rapido':{name:'Saque Rápido',pages:'66',requirements:[]},
 'sns:apt:perito':{name:'Perito',pages:'76',requirements:[]},
 'sns:apt:pericia-inata':{name:'Perícia Inata',pages:'76',requirements:[]},
 'sns:apt:resistencia-maior':{name:'Resistência Maior',pages:'76',requirements:[]},
 'sns:apt:clone-kage':{name:'Clone · Kage Bunshin',pages:'76–78',requirements:[attr('esp',6,'Espírito')]},
 'sns:apt:clone-kage-2':{name:'Clone · Kage Bunshin · nível 2',pages:'77',requirements:[attr('esp',8,'Espírito'),owns('sns:apt:clone-kage','Clone · Kage Bunshin · nível 1')]},
 'sns:apt:clone-verdadeiro-kage':{name:'Clone Verdadeiro · Kage Bunshin',pages:'78',requirements:[attr('esp',10,'Espírito'),owns('sns:apt:clone-kage','Clone · Kage Bunshin')]},
 'sns:apt:shunjutsu-1':{name:'Shunjutsu · estágio 1',pages:'83',requirements:[either(attr('des',10,'Destreza'),attr('int',10,'Inteligência')),owns('sns:apt:diligente','Diligente'),owns('sns:apt:velocista','Velocista')]},
 'sns:apt:shunjutsu-2':{name:'Shunjutsu · estágio 2',pages:'83',requirements:[either(attr('des',12,'Destreza'),attr('int',12,'Inteligência')),owns('sns:apt:shunjutsu-1','Shunjutsu · estágio 1')]},
 'sns:apt:shunjutsu-3':{name:'Shunjutsu · estágio 3',pages:'83',requirements:[either(attr('des',16,'Destreza'),attr('int',16,'Inteligência')),owns('sns:apt:shunjutsu-2','Shunjutsu · estágio 2')]},
 'sns:apt:sharingan':{name:'Sharingan',pages:'181–182',requirements:[eye('Sharingan'),attr('per',3,'Percepção')]},
 'sns:apt:nidan-sharingan':{name:'Nidan Sharingan',pages:'182',requirements:[eye('Nidan Sharingan'),attr('per',6,'Percepção'),owns('sns:apt:sharingan','Sharingan')]},
 'sns:apt:sandan-sharingan':{name:'Sandan Sharingan',pages:'182–183',requirements:[eye('Sandan Sharingan'),attr('per',9,'Percepção'),owns('sns:apt:nidan-sharingan','Nidan Sharingan')]},
 'sns:apt:elemento-natural-katon':{name:'Elemento Natural: Katon',pages:'180–181',requirements:[access('uchiha'),attr('esp',1,'Espírito')]},
 'sns:apt:aprendizagem-rapida':{name:'Aprendizagem Rápida',pages:'243',requirements:[access('tensai'),{kind:'powerLevel',id:'sns:power:versatilidade',min:5,label:'Versatilidade'}]},
 'sns:apt:presa-de-prata':{name:'Presa de Prata',pages:'155–156',requirements:[access('hatake'),access('tensai')]},
 'sns:power:versatilidade':{name:'Versatilidade',pages:'242–243',requirements:[access('tensai')]},
 'sns:power:rinne-ninpou':{name:'Rinne Ninpou',source:'Livro de Hijutsus 4.1b · p.65–66',requirements:[access('rinnegan'),owns('sns:apt:rinnegan','Rinnegan')]},
 'sns:power:kibaku-nendo':{name:'Kibaku Nendo',source:'Livro de Hijutsus Vol.2 · p.77',requirements:[access('kibaku-nendo'),skill('arte',4,'Nível de Arte')]},
 'sns:power:kuchiyose':{name:'Kuchiyose',pages:'224–233',requirements:[{kind:'summonPact'},either(attr('esp',6,'Espírito'),attr('int',6,'Inteligência'))]},
 'sns:power:jinchuuriki':{name:'Jinchuuriki',pages:'213–222',requirements:[{kind:'selfOrigin',key:'jinchuuriki'}]},
 'sns:feature:transplante':{name:'Transplante de doujutsu · mesa',pages:'',source:'Enciclopédia2.4.0 · p.13–14 + regra da mesa D108',requirements:[attr('vig',10,'Vigor'),attr('esp',12,'Espírito')]}
};
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const ITEM_RULES=freeze(completeRequirements({...CATALOG_ACQUISITION_RULES,...RELATED_ACQUISITION_RULES,...COMMON_APTITUDE_RULES,...definitions,...LEGADO_REQUIREMENTS}));
export const RULE_GRANTS={'sns:legado:apt:elemento-natural-katon':'Elemento Natural: Katon','sns:apt:clone-kage':'Clone: Kage Bunshin','sns:apt:shunjutsu-1':'Shunjutsu · estágio 1','sns:apt:shunjutsu-2':'Shunjutsu · estágio 2','sns:apt:shunjutsu-3':'Shunjutsu · estágio 3','sns:apt:elemento-natural-katon':'Elemento Natural: Katon'};
export function itemRuleId(item){return item?.system?.ruleId||(item?.system?.details?.featureRule===TRANSPLANT_RULE?'sns:feature:transplante':'')||Object.keys(RULE_GRANTS).find(id=>RULE_GRANTS[id]===item?.system?.details?.grantRule)||(ITEM_RULES[item?.system?.contentId]?item.system.contentId:'');}
export function requirementsFor(item,actor=null,trail=[],allowPendingChoice=false,{scope='acquisition'}={}){
 if(scope==='acquisition'&&!sourceAvailable(item))return {configured:true,valid:false,id:item?.system?.ruleId??'',name:item.name,rows:[{label:'Legado do Ódio ativado pelo mestre',current:'Fonte desativada',met:false}],problems:['O mestre não ativou o Legado do Ódio nesta mesa.']};
 item=sourceReviewedItem(item);
 if(Array.from(actor?.items??[]).some(i=>i.flags?.['sns-v14-dev']?.legadoCopy||i.flags?.['sns-v14-dev']?.legadoMemory))actor={type:actor.type,flags:actor.flags,id:actor.id,uuid:actor.uuid,isOwner:actor.isOwner,system:actor.system,items:Array.from(actor.items).filter(i=>!i.flags?.['sns-v14-dev']?.legadoCopy&&!i.flags?.['sns-v14-dev']?.legadoMemory)};
 if(actor?.type==='npc'&&actor.flags?.['sns-v14-dev']?.animeProfile)actor={type:actor.type,flags:actor.flags,id:actor.id,uuid:actor.uuid,isOwner:actor.isOwner,system:actor.system,items:Array.from(actor.items??[]).map(i=>sourceReviewedItem(i))};
 const id=itemRuleId(item),recursionKey=id||item?.uuid||item?.id||item;let definition=['acquisition','owned'].includes(scope)?ITEM_RULES[id]:undefined;
 if(requirementProfile(item)&&(requirementProfile(item).scope??'acquisition')===scope){
  try{const profile=validateRequirementProfile(requirementProfile(item));definition={name:definition?.name??item.name??'Item',source:profile.source+' · ajuste do mestre',requirements:[...(profile.mode==='append'?definition?.requirements??[]:[]),profile.tree]};}
  catch(error){return {configured:true,valid:false,id,rows:[],problems:[error.message]};}
 }
 if(!definition)return {configured:false,valid:false,id,rows:[],problems:[id?'Regra mecânica desconhecida.':'Requisitos: ver descrição.']};
 const evaluate=req=>{
  if(req.kind?.startsWith('legado'))return legadoRequirement(actor,req);
  if(req.kind==='selfOrigin')return {label:'Origem Jinchuuriki',current:originGrant(item)===req.key?'Registrada':'Ausente',met:originGrant(item)===req.key};
  if(req.kind==='access'){const sources=accessSources(actor,req.key);return {label:'Origem · '+(ACCESS_ORIGINS[req.key]??req.key),current:sources.length?sources.map(i=>i.name).join(', '):'Ausente',met:!!sources.length};}
  if(req.kind==='nc'){const n=actor?.system?.nc;return {label:(req.label||'Nível de campanha')+' ≥ '+req.min,current:Number.isInteger(n)?String(n):'Não informado',met:Number.isInteger(n)&&n>=req.min};}
  if(req.kind==='summonSpecies')return {label:req.label,...summonPact(actor,req.species)};
  if(req.kind==='summonPact'){if(allowPendingChoice&&!item?.system?.choice?.key)return {label:'Contrato de sangue com uma espécie',current:'Escolha a espécie',met:aptitudeChoiceOptions(item).some(o=>summonPact(actor,o.id).met)};return {label:'Contrato de sangue da espécie escolhida',...summonPact(actor,item?.system?.choice?.key)};}
  if(req.kind==='eyeAccess')return {label:'Origem Uchiha ou transplante · '+req.stage,...eyeAccess(actor,req.stage)};
  if(req.kind==='powerLevel'){
   const n=powerLevel(actor,req.id),candidates=powerSources(actor,req.id);
   const validSource=candidates.some(i=>{const sourceId=itemRuleId(i)||req.id;return (i.system.level??0)>=req.min&&(!ITEM_RULES[sourceId]&&!requirementProfile(i)||!trail.includes(sourceId)&&requirementsFor({type:i.type,flags:i.flags,system:{...i.system,ruleId:sourceId}},actor,[...trail,recursionKey],false,{scope}).valid);});
   return {label:req.label+' ≥ '+req.min,current:n===null?'Não informado':!validSource?'Requisitos do poder não atendidos':String(n),met:n!==null&&n>=req.min&&validSource};
  }
  if(req.kind==='attribute'){const value=actor?.system?.attributes?.[req.key];return {label:req.label+' ≥ '+req.min,current:Number.isInteger(value)?String(value):'Não informado',met:Number.isInteger(value)&&value>=req.min};}
  if(req.kind==='skillLevel'){
   const value=recordedSkillLevel(actor,req.key);
   return {label:req.label+' ≥ '+req.min,current:value===null?'Nível não informado':String(value),met:value!==null&&value>=req.min};
  }
  if(req.kind==='any'){const options=req.options.map(evaluate);return {label:options.map(o=>o.label).join(' ou '),current:options.map(o=>o.current).join(' / '),met:options.some(o=>o.met)};}
  if(req.kind==='all'){const options=req.options.map(evaluate);return {label:options.length?options.map(o=>o.label).join('; '):'Sem requisito adicional',current:options.length?options.map(o=>o.current).join(' / '):'—',met:options.every(o=>o.met)};}
  if(req.kind==='pending'){
   const event=id==='sns:apt:mangekyou-sharingan'&&req.label==='um evento traumático'&&actor?.type==='npc'&&actor.flags?.['sns-v14-dev']?.npcGenerator?.version===2&&actor.flags?.['sns-v14-dev']?.prerequisiteEvents?.mangekyouTrauma===true;
   const pair=id==='sns:jutsu:susanoo'&&actor?.type==='npc'&&actor.flags?.['sns-v14-dev']?.npcGenerator?.version===2&&['sns:jutsu:amaterasu','sns:jutsu:tsukuyomi'].every(key=>Array.from(actor.items??[]).some(i=>i.system.contentId===key&&requirementsFor(i,actor,[...trail,recursionKey],false,{scope}).valid));
   return {label:req.label,current:event?'Evento definido na criação do NPC':pair?'Amaterasu e Tsukuyomi':'Requisito sem verificação disponível',met:event||pair};
  }
  if(req.kind==='combatBase'){
   const key={cc:'for',cd:'des',esq:'agi',lm:'per'}[req.key],s=actor?.system;
   const value=Number.isInteger(s?.bases?.[req.key])&&Number.isInteger(s?.attributes?.[key])?s.bases[req.key]+s.attributes[key]:s?.statsOriginal?.[req.key];
   return {label:req.label+' ≥ '+req.min,current:Number.isInteger(value)?String(value):'Precisão original não informada',met:Number.isInteger(value)&&value>=req.min};
  }
  if(req.kind==='initiativeBase'){
   const s=actor?.system,skill=SKILLS.find(x=>x.key==='prontidao'),bought=s?.skills?.prontidao?.bought;
   const value=Number.isInteger(s?.attributes?.agi)&&Number.isInteger(s?.attributes?.[skill.attribute])&&Number.isInteger(bought)?s.attributes.agi+Math.ceil(s.attributes[skill.attribute]/2)+bought:s?.statsOriginal?.initiative;
   return {label:req.label+' ≥ '+req.min,current:Number.isInteger(value)?String(value):'Iniciativa original não informada',met:Number.isInteger(value)&&value>=req.min};
  }
  if(req.kind==='warriorChoice'){
   const selected=item?.system?.choice?.key,min=selected==='leve'||!selected&&allowPendingChoice?8:10,s=actor?.system?.attributes;
   return {label:'Força ou Destreza ≥ '+min+' para a categoria escolhida',current:[s?.for,s?.des].map(n=>Number.isInteger(n)?String(n):'Não informado').join(' / '),met:[s?.for,s?.des].some(n=>Number.isInteger(n)&&n>=min)};
  }
  if(req.kind==='actorType')return {label:req.label,current:actor?.type??'Tipo não informado',met:req.types.includes(actor?.type)};
  if(req.kind==='noClanOrHijutsu'){
   const restricted=Array.from(actor?.items??[]).filter(i=>['clan','hijutsu'].includes(i.type)&&!['sns:hijutsu:hachimon-tonkou'].includes(i.system?.contentId));
   return {label:req.label,current:restricted.length?restricted.map(i=>i.name).join(', '):'Sem outra origem',met:!restricted.length};
  }
  if(req.kind==='effectKnown'){
   const found=Array.from(actor?.items??[]).some(i=>{
    if((req.powerId&&i.system?.contentId!==req.powerId&&i.system?.power?.definitionId!==req.powerId)||!(i.system?.power?.choices??[]).some(c=>c.effectId===req.id&&c.stage>=req.min))return false;
    const sourceId=itemRuleId(i),sourceKey=sourceId||i.uuid||i.id||i;return !ITEM_RULES[sourceId]&&!requirementProfile(i)||sourceKey!==recursionKey&&!trail.includes(sourceKey)&&requirementsFor(i,actor,[...trail,recursionKey],false,{scope}).valid;
   });
   return {label:req.label,current:found?'Aprendido':'Não aprendido',met:found};
  }
  if(['ownedChoice','ownedWeaponFamily','ownedWeaponClass','ownedWeaponUse','ownedLevel'].includes(req.kind)){
   const candidates=Array.from(actor?.items??[]).filter(i=>req.contentId?i.system?.contentId===req.contentId:itemRuleId(i)===req.id);
   const matching=candidates.filter(i=>{
    const choice=i.system?.choice?.key,weapon=COMMON_APTITUDE_CHOICES.combatStyle.find(w=>w.id===choice);
    // Only a typed, validated second purchase unlocks Clone 2. Display level and
    // duplicate first-level items cannot grant the progression.
    const fixedLevel=req.contentId==='sns:apt:clone'?({'sns:apt:clone-kage':1,'sns:apt:clone-kage-2':2}[itemRuleId(i)]??0):0;
    return req.kind==='ownedChoice'?choice===req.choice:req.kind==='ownedWeaponFamily'?choice?.startsWith(req.prefix):req.kind==='ownedWeaponClass'?weapon?.weaponClass?.toLocaleLowerCase()===req.weaponClass:req.kind==='ownedWeaponUse'?weapon?.ranged:fixedLevel>=req.min;
   });
   const met=!trail.includes(req.id)&&matching.some(i=>requirementsFor(i,actor,[...trail,recursionKey],false,{scope}).valid);
   return {label:req.label,current:met?'Possuída e válida':'Não atendido',met};
  }
  const candidates=Array.from(actor?.items??[]).filter(i=>!i.flags?.['sns-v14-dev']?.legadoCopy&&itemRuleId(i)===req.id);
  const met=!trail.includes(req.id)&&candidates.some(i=>requirementsFor(i,actor,[...trail,recursionKey],false,{scope}).valid);
  return {label:req.label,current:candidates.length?(met?'Possuída':'Requisitos pendentes'):'Não possuída',met};
 };
 const rules=[...definition.requirements];
 const stage=EYE_STAGES[item?.system?.details?.eyeStage];if(id==='sns:feature:transplante'&&stage)rules.push(attr('per',stage.per,'Percepção do estágio'));
 const rows=rules.map(evaluate);
 const choice=aptitudeChoiceStatus(item);
 if(choice.required)rows.push({kind:'choice',label:choiceFieldLabel(choice.kind),current:choice.valid?choice.label:'Escolha ao adicionar à ficha',met:choice.valid||allowPendingChoice});
 return {configured:true,id,name:definition.name,referenceException:actor?.type==='npc'&&item.flags?.['sns-v14-dev']?.sourceRequirementReview?.status==='reference-exception',source:definition.source??'Básico 4.1b · p. '+definition.pages,rows,valid:!!actor&&rows.every(r=>r.met),problems:actor?rows.filter(r=>!r.met).map(r=>'Requer '+r.label+' ('+r.current+').'):[]};
}
const protectedPaths=['details.price','details.sourceDefinitionId','targetEffects','appliedCondition.casterUuid','appliedCondition.durationRule','appliedCondition.durationClock','appliedCondition.applicationKey','appliedCondition.managed','appliedCondition.scope','appliedCondition.origin','appliedCondition.sourceUuid','appliedCondition.appliedBy','appliedCondition.appliedAt','details.degree','contentId','ruleId','choice','power.definitionId','details.accessRule','details.grantRule','details.featureRule','details.resourceRule','details.eyeStage','details.stagePowerCost','details.powerCost','details.powerOrigin'];
const get=(s,path)=>path.split('.').reduce((v,k)=>v?.[k],s);
export function mayEditItemRules(before,after,isGM){
 if(isGM)return true;
 return protectedPaths.every(path=>JSON.stringify(get(before,path))===JSON.stringify(get(after,path)));
}
export const narrativeFields=['requirements','restrictions'];
