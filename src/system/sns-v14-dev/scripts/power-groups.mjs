import {ownedPowerDefinition} from './power-core.mjs';
import {grantedSourceGroups} from './granted-jutsus.mjs';
import {isAptitudePower} from './aptitude-jutsus.mjs';
export const POWER_ORIGINS={restricted:'Restrito',common:'Comum',clan:'Clã / linhagem',hijutsu:'Hijutsu',other:'Outro · mestre'};
export const POWER_FORMS={list:'Técnicas próprias',effects:'Efeitos por nível',techniques:'Técnicas próprias',summon:'Invocação / vínculo',free:'Organização livre'};
export function groupPowers(items){
 const powers=items.filter(i=>i.category==='powers'),techniques=items.filter(i=>i.category==='techniques'&&!i.system?.jutsu?.grantSourceId&&!i.referenceOnly),ids=new Set(powers.map(p=>p.id));
 const stages=items.filter(isAptitudePower).map(i=>({...i,stageLabel:'Estágio '+(i.system.ruleId||i.system.details.grantRule).slice(-1)})),primary=stages.find(i=>(i.system.ruleId||i.system.details.grantRule).endsWith('1'))??stages[0];
 const aptitudePowerGroups=primary?[{id:primary.id,name:'Shunjutsu',stages,techniques:items.filter(i=>i.type==='jutsu'&&stages.some(s=>s.id===i.system.jutsu?.grantSourceId))}]:[];
 return {aptitudePowerGroups,grantGroups:grantedSourceGroups(items),powerGroups:powers.map(p=>({...p,displayName:p.displayName||p.name,guided:!!ownedPowerDefinition({system:p.system??{power:p.power,contentId:p.contentId}}),originLabel:POWER_ORIGINS[p.details.powerOrigin]??(p.details.powerOrigin==='manual'?'Outro · mestre':p.details.powerOrigin),formLabel:POWER_FORMS[p.details.organization]??(p.details.organization==='manual'?'Organização livre':p.details.organization),techniques:techniques.filter(t=>t.details.powerId===p.id)})),looseTechniques:techniques.filter(t=>!ids.has(t.details.powerId))};
}
