import {ATTRIBUTES,calculate} from './kernel.mjs';
export const skillColor=s=>!s.trained?'gray':['blue','purple','gold','red'][Math.min(3,Math.floor(Math.max(0,s.precision)/5))];
export function skillPreview(source,key,draft){
 if(!Number.isInteger(draft.bought)||draft.bought<0||!Number.isInteger(draft.bonus))throw Error('Informe níveis não negativos e bônus inteiros.');
 const next=structuredClone(source);if(!next.skills[key])throw Error('Perícia desconhecida.');
 next.skills[key].bought=draft.bought;next.modifiers['skill_'+key]={value:draft.bonus,origin:draft.origin};
 const d=calculate(next),skill=d.skills[key],limit=Math.floor(source.nc/2);
 return {skill,budget:d.budgets.skills,limit,color:skillColor(skill),canUp:draft.bought<limit,canDown:draft.bought>0,base:skill.level-skill.bought};
}
export function stepSkill(source,key,draft,delta){
 if(![1,-1].includes(delta))throw Error('Passo inválido.');
 const p=skillPreview(source,key,draft);
 return {...draft,bought:draft.bought+(delta>0?p.canUp?1:0:p.canDown?-1:0)};
}
export function attributePreview(source,values,effects=[]){
 const next=structuredClone(source);
 for(const [key] of ATTRIBUTES){if(!Number.isInteger(values[key])||values[key]<0)throw Error('Atributos exigem inteiros não negativos.');next.attributes[key]=values[key];}
 return calculate(next,effects);
}
