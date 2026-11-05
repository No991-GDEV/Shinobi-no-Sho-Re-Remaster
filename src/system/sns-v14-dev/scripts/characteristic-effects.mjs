import {effectItemModifiers} from './effect-item-rules.mjs';
import {legadoModifiers,legadoEyeSource} from './legado-core.mjs';
import {perceptiveDodgeEffects} from './perceptive-dodge.mjs';
import {advancedEffects} from './advanced-core.mjs';
import {environmentMovementEffects} from './environment-core.mjs';
import {conditionEffects} from './condition-effects.mjs';
import {transformationProjection} from './transformation-core.mjs';
// Reusable mechanical profiles. A descriptive trait or an item name never grants a rule.
export const TRANSPLANT_RULE='Transplante de doujutsu · regra da mesa';
export const EYE_STAGES={'Sharingan':{pp:2,per:3},'Nidan Sharingan':{pp:4,per:6},'Sandan Sharingan':{pp:6,per:9},'Mangekyou Sharingan':{pp:8,per:16}};
export function transplantSources(actor){return Array.from(actor?.items??[]).filter(i=>['feature','aptitude'].includes(i.type)&&i.system?.details?.featureRule===TRANSPLANT_RULE);}
export function transplantProfile(actor,source){
 const stage=EYE_STAGES[source?.system?.details?.eyeStage],pp=source?.system?.details?.stagePowerCost,problems=[];
 if(!transplantSources(actor).some(i=>i.id===source?.id))problems.push('A característica de transplante está ausente.');
 if(!stage)problems.push('Confira o estágio do olho recebido.');
 if(!Number.isInteger(pp)||pp<stage?.pp)problems.push('Informe os PP investidos no estágio ocular, incluindo os estágios anteriores.');
 if(!Number.isInteger(actor.system.attributes?.vig)||actor.system.attributes.vig<10)problems.push('Transplante exige Vigor10.');
 if(!Number.isInteger(actor.system.attributes?.esp)||actor.system.attributes.esp<12)problems.push('Transplante exige Espírito12.');
 if(stage&&(!Number.isInteger(actor.system.attributes?.per)||actor.system.attributes.per<stage.per))problems.push('O estágio recebido exige Percepção'+stage.per+'.');
 return {valid:!problems.length,problems,stage:source?.system?.details?.eyeStage,upkeep:pp,visionLoss:false,sourceId:source?.id,donor:source?.system?.details?.donor??'',source:'Enciclopédia2.4.0 · p.13–14 + decisão da mesa D108'};
}
export function characteristicEffects(actor){
 const sources=transplantSources(actor);
 const chemical=Array.from(actor?.items??[]).find(i=>(i.system.ruleId||i.system.contentId)==='sns:apt:quimico');
 const reflexes=actor?.type==='shinobi'&&Array.from(actor.items??[]).find(i=>i.type==='aptitude'&&(i.system.ruleId||i.system.contentId)==='sns:apt:reflexos');
 // Duplicate copies do not multiply the same permanent penalty.
 const effects=[...effectItemModifiers(actor),...legadoModifiers(actor),...(reflexes?[{kind:'flatModifier',target:'esq',value:1,sourceId:reflexes.id,sourceName:'Reflexos'}]:[]),...(chemical?[{kind:'skillAccess',target:'veneficio',sourceId:chemical.id,sourceName:chemical.name}]:[]),...advancedEffects(actor),...environmentMovementEffects(actor),...conditionEffects(actor),...transformationProjection(actor).effects,...(sources.length?[{kind:'resourceMaximumRatio',target:'chakra',numerator:9,denominator:10,sourceId:sources[0].id,sourceName:sources[0].name,rule:TRANSPLANT_RULE,permanent:true}]:[])];
 return [...effects,...(legadoEyeSource(actor)?[]:perceptiveDodgeEffects(actor,effects))];
}
export function applyResourceMaximum(base,effects,target='chakra'){
 if(!Number.isInteger(base)||base<0)return null;
 const effect=effects.find(e=>e.kind==='resourceMaximumRatio'&&e.target===target&&e.rule===TRANSPLANT_RULE);
 return effect?Math.ceil(base*effect.numerator/effect.denominator):base;
}
export function migrateSupportingChakra(input){
 const source=structuredClone(input),chakra=source.resources?.chakra;
 if(chakra&&chakra.baseMax===undefined&&Object.hasOwn(chakra,'max')){chakra.baseMax=chakra.max;delete chakra.max;}
 return source;
}
