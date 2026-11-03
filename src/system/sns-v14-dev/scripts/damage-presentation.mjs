import {damageGrade,damageCalculation} from './damage-core.mjs';
import {projectileBase} from './projectile-allocation.mjs';
// Dice require an explicit part. Existing book profiles remain entirely fixed.
export function damageDice(profile){
 if(profile.dice===undefined)return null;
 const d=profile.dice,m=typeof d?.formula==='string'&&/^([1-9]|1\d|20)d(4|6|8|10|12|20|100)$/.exec(d.formula);
 if(!m||!['base','fixed'].includes(d.part))throw Error('Dados de dano precisam de fórmula simples e indicação explícita: DB ou fixo.');
 return {...d,min:Number(m[1]),max:Number(m[1])*Number(m[2])};
}
export function damagePresentation(packet,diceTotal=null){
 const grade=packet.attack?damageGrade(packet.attack.natural,{criticalAt:packet.profile.criticalAt}):(packet.requestedGrade??1);
 if(!Number.isInteger(grade)||grade<0||grade>4)throw Error('Grau de dano inválido.');
 if(grade===0)return {version:1,miss:true,grade:0,total:0};
 const dice=damageDice(packet.profile),spec={base:packet.profile.base,fixed:packet.profile.fixed??0,nature:packet.profile.nature??'lethal',grade};
 if(packet.profile.gradeBonus)spec.gradeBonus=packet.profile.gradeBonus;
 if(dice){if(!Number.isInteger(diceTotal)||diceTotal<dice.min||diceTotal>dice.max)throw Error('Resultado dos dados de dano inválido.');spec[dice.part]+=diceTotal;}
 const calc=damageCalculation(spec);
 return {version:1,miss:false,spec,total:calc.total,diceTotal:dice?diceTotal:null,formula:dice?.formula??''};
}
export function readDamagePresentation(message,packet){
 const shown=message.getFlag('sns-v14-dev','damagePresentation');if(!shown)return null;
 const expected=damagePresentation(packet,shown.diceTotal);
 if(JSON.stringify(shown)!==JSON.stringify(expected))throw Error('A apresentação do dano não corresponde a este ataque.');
 return expected;
}
export function mayWriteDamagePresentation(message,expanded,userId){
 if(!message.getFlag('sns-v14-dev','damageUse')||message.author?.id!==userId)return false;
 if(Object.keys(expanded).some(k=>k!=='flags')||Object.keys(expanded.flags??{}).some(k=>k!=='sns-v14-dev')||Object.keys(expanded.flags?.['sns-v14-dev']??{}).some(k=>k!=='damagePresentation'))return false;
 if(message.getFlag('sns-v14-dev','damagePresentation'))return false;
 try{const packet=message.getFlag('sns-v14-dev','damageUse'),value=expanded.flags['sns-v14-dev'].damagePresentation;return JSON.stringify(damagePresentation(packet,value.diceTotal))===JSON.stringify(value);}catch{return false;}
}

export function packetTargetSpec(packet,shown,targetUuid,{hardness=0,bonus=0}={}){
 if(!packet.targets.some(t=>t.uuid===targetUuid))throw Error('Alvo não pertence à técnica.');
 const result={...shown};if(packet.profile.minionAttack&&!packet.targets.find(t=>t.uuid===targetUuid)?.minion&&result.grade+(result.gradeBonus??0)>3){result.grade=Math.min(result.grade,3);result.gradeBonus=Math.max(0,3-result.grade);}if(packet.profile.targetFixed){const fixed=packet.profile.targetFixed[targetUuid.replaceAll('.','~')];if(!Number.isInteger(fixed)||fixed<0)throw Error('Dano fixo por alvo inválido.');result.fixed=fixed;}
 if(packet.profile.projectiles)result.base=projectileBase(packet.profile,packet.targets,targetUuid);
 if(packet.profile.splitTargets)result.base=Math.ceil(result.base/packet.targets.length);
 if(packet.profile.ricochetBonus)result.base+=Math.min(5,packet.targets.findIndex(t=>t.uuid===targetUuid));
 result.base+=bonus;
 if(packet.profile.ignoreAllHardness)result.ignoreHardness=hardness;
 else if(packet.profile.ignoreHardness)result.ignoreHardness=packet.profile.ignoreHardness;
 return result;
}
