import {conditionPenalty} from './condition-effects.mjs';
import {npcFixedDefenseKey} from './npc-generator-defense.mjs';
import {calculate} from './kernel.mjs';
import {recordedTransformationRows} from './transformation-core.mjs';
export function preDefenseEffects(profile,result){
 if(!profile.preDefense||result?.hit!=='hit')return [];
 const surprise=profile.preDefense.condition==='desprevenido',feint=profile.preDefense.condition==='fintado';
 return [{kind:'condition',key:surprise?'desprevenido':feint?'fintado':'debilitado',sourceName:surprise?'Desprevenido':feint?'Lâmina de Vento · Fintado':'Defesa debilitada',scope:'defenses',degree:surprise?3:2,sourceId:'pre-defense'}];
}
export function defenseContext(effects,profile={}){
 const prone=effects.some(e=>e.kind==='condition'&&e.key==='caido'),context=effects.map(e=>e.key==='caido'?{...e,degree:0}:e);
 if(prone&&['melee','area'].includes(profile.attackKind))context.push({kind:'condition',key:'caido',scope:'defenses',degree:3,sourceName:'Caído · ataque corporal/área'});
 const bonus=prone&&!profile.ignoreProneCover&&['projectile','techniqueProjectile','technique'].includes(profile.attackKind)?3:0;
 return {effects:context,bonus};
}
export function fixedDefensePrecision(actor,effects,profile={}){
 const system=actor.system.toObject?.()??actor.system,ctx=defenseContext(effects,profile);
 const key=npcFixedDefenseKey(actor);let precision=actor.type==='shinobi'?calculate(system,ctx.effects).combat.esq.precision:system.stats?.[key];
 if(!Number.isInteger(precision))return null;
 if(actor.type!=='shinobi')precision=recordedTransformationRows([{id:'recorded',label:'Precisão',type:'base',value:precision,enabled:true}],ctx.effects,key,system).reduce((n,r)=>n+r.value,0)+conditionPenalty(ctx.effects,key);
 if(actor.type!=='shinobi'&&ctx.effects.some(e=>e.kind==='condition'&&e.key==='desprevenido'))precision-=ctx.effects.filter(e=>e.kind==='flatModifier'&&e.target===key&&e.value>0).reduce((n,e)=>n+e.value,0);
 return precision+ctx.bonus;
}
