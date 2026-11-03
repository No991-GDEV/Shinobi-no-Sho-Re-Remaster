import {POISON_RECIPES,RECIPE_SOURCES} from '../data/crafting-sources.mjs';
import {originalSkill} from './advanced-core.mjs';
export {POISON_RECIPES,RECIPE_SOURCES};
export const poisonRecipe=item=>POISON_RECIPES[item?.system?.contentId];
export const isCraftFormula=item=>item?.type==='formula'||!!poisonRecipe(item);
export const CULINARY_STAGES=[{label:'Preparação',key:'attribute:des'},{label:'Técnica',key:'attribute:int'},{label:'Tradição',key:'skill:cultura'},{label:'Finalização',key:'skill:arte'}];
export function poisonProfileFields(p){
 const d=POISON_RECIPES[p.poison?.id],mode=p.poison?.mode??'field',idealMinutes=p.poison?.idealMinutes??null;
 if(!d||!['field','adverse','ideal'].includes(mode))throw Error('Selecione uma fórmula de veneno do Guia vigente.');
 if(idealMinutes!==null&&(!Number.isSafeInteger(idealMinutes)||idealMinutes<1||idealMinutes>1000000))throw Error('Informe o tempo ideal em minutos inteiros positivos.');
 if(mode==='ideal'&&idealMinutes===null)throw Error('O mestre precisa configurar o tempo do preparo ideal.');
 return {poison:{id:d.id,mode,idealMinutes},cost:d.cost,yield:1,minutes:mode==='ideal'?idealMinutes:10,steps:[{label:mode==='ideal'?'Produção · simular 2 dados':'Produção de veneno',key:'skill:veneficio',dc:d.dc+(mode==='adverse'?4:0)}],output:{kind:'reference',uuid:'canonical:'+d.id}};
}
export function poisonProducer(actor,p){
 const d=POISON_RECIPES[p.poison?.id];if(!d)throw Error('Fórmula de veneno indisponível.');
 const items=Array.from(actor.items??[]),level=originalSkill(actor,'veneficio'),trained=actor.system.skills?.veneficio?.bought>0;
 const chemical=items.some(i=>(i.system.ruleId||i.system.contentId)==='sns:apt:quimico');
 const doku=items.find(i=>i.system.power?.definitionId==='sns:power:dokujutsu'&&i.system.level>0);
 if(!chemical||!trained||!Number.isInteger(level)||level+(doku?2:0)<d.minimum)throw Error('Exige Químico e Venefício '+d.minimum+'; Dokujutsu concede +2 apenas para testes e requisitos de fabricação.');
 if(d.dokujutsu&&(!doku||doku.system.level<d.dokujutsu))throw Error('Este veneno exige Dokujutsu '+d.dokujutsu+'.');
 return {producerUuid:actor.uuid,producerSkill:level,dokujutsu:!!doku,category:d.category};
}
export function resolvePoisonMode(profile,mode='field'){
 if(profile?.kind!=='poison')return profile;
 return {...profile,...poisonProfileFields({...profile,poison:{...profile.poison,mode}})};
}
