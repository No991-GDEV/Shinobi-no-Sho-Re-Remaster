import {legadoState,legadoSusanoo} from './legado-core.mjs';
// SNS Básico 4.1b pp.136,257–260,274–275; temporary vitality order: D123.
import {effectiveHardness} from './transformation-core.mjs';
const nonnegative=(n,label)=>{if(!Number.isSafeInteger(n)||n<0)throw Error(label+' deve ser um inteiro não negativo.');return n;};
export function damageGrade(natural,{automatic=false,criticalAt=15}={}){
 if(!Number.isInteger(natural)||natural<2||natural>16)throw Error('Informe a soma natural de 2d8.');
 if(!Number.isInteger(criticalAt)||criticalAt<4||criticalAt>15)throw Error('Margem de crítico inválida.');
 if(natural<=3)return automatic?1:0;
 return natural>=criticalAt?4:natural>=12?3:natural>=9?2:1;
}
export function damageCalculation({base,fixed=0,grade,gradeBonus=0,hardness=0,ignoreHardness=0,nature='lethal'}){
 if(!Number.isSafeInteger(base*2)||base<0)throw Error('Dano base deve ser não negativo, em pontos inteiros ou meios pontos.');nonnegative(fixed,'Dano fixo');for(const [n,label]of [[hardness,'Dureza'],[ignoreHardness,'Dureza ignorada']])if(!Number.isSafeInteger(n*2)||n<0)throw Error(label+' deve ser não negativa, em pontos inteiros ou meios pontos.');
 if(!Number.isInteger(grade)||grade<1||grade>4)throw Error('Grau de dano deve estar entre 1 e 4.');
 if(![0,0.5].includes(gradeBonus))throw Error('Bônus de grau não reconhecido.');
 if(!['lethal','nonlethal'].includes(nature))throw Error('Natureza do dano inválida.');
 const effectiveHardness=Math.max(0,hardness-ignoreHardness),effectiveBase=Math.max(0,base-effectiveHardness),effectiveFixed=Math.max(0,fixed-2*effectiveHardness),total=Math.ceil(effectiveBase*(grade+gradeBonus))+effectiveFixed;
 if(!Number.isSafeInteger(total))throw Error('Dano excede o limite numérico.');
 return {base,fixed,grade,...(gradeBonus?{gradeBonus,effectiveGrade:grade+gradeBonus}:{}),hardness,ignoreHardness,effectiveHardness,effectiveBase,effectiveFixed,total,nature};
}
export function damageResources(calculation,{vitality,temp=0,absorption=0}){
 if(!Number.isSafeInteger(vitality))throw Error('Informe a Vitalidade atual antes de aplicar dano.');
 nonnegative(temp,'Vitalidade temporária');nonnegative(absorption,'Absorção atual');
 const absorbed=Math.min(absorption,calculation.total),afterArmor=calculation.total-absorbed,temporaryLost=Math.min(temp,afterArmor),remaining=afterArmor-temporaryLost;
 // A common blow from positive vitality ends at zero; subsequent damage can make it negative.
 const afterVitality=vitality>0?Math.max(0,vitality-remaining):vitality-remaining;
 if(!Number.isSafeInteger(afterVitality))throw Error('Vitalidade excede o limite numérico.');
 return {before:{vitality,temp,absorption},after:{vitality:afterVitality,temp:temp-temporaryLost,absorption:absorption-absorbed},absorbed,temporaryLost,vitalityLost:vitality-afterVitality,unappliedOverkill:Math.max(0,remaining-(vitality-afterVitality))};
}
export const safeTargetKey=uuid=>String(uuid).replaceAll('.','~');
export function latestDamage(actor){
 const log=actor.flags?.['sns-v14-dev']?.damageLedger??{};
 return Object.values(log).filter(e=>e?.version===1).sort((a,b)=>b.sequence-a.sequence);
}
export function damageInputsSignature(actor,armorId=''){
 const state=actor.system.damageState??{},pool=armorId==='legado-susanoo'?{value:legadoState(actor).susanoo?.value??0,max:legadoSusanoo(actor)?.max??null}:Array.from(state.armorPools??[]).find(p=>p.itemId===armorId);
 return JSON.stringify({vitality:actor.system.resources.vitality.value,temp:actor.system.resources.vitality.temp??0,hardness:effectiveHardness(actor),externalRevision:state.externalRevision??0,head:state.head??'',armorId,absorption:armorId?pool?.value??null:0,armorMax:pool?.max??null});
}
