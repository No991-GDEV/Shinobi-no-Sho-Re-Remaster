import {RUNTIME_STATES} from '../data/runtime-states.mjs';
import {useDifficulty,targetResistanceBonus} from './magen-core.mjs';
import {durationRule} from './effect-duration.mjs';
import {CONDITION_SCOPES} from './condition-effects.mjs';
import {ATTRIBUTES} from './kernel.mjs';
import {SKILLS} from './rules.mjs';
export const EFFECT_TRIGGERS={use:'Ao usar',hit:'Ao acertar',failedResistance:'Ao falhar na resistência',hitFailedResistance:'Ao acertar e falhar na resistência'};
export const needsHit=b=>['hit','hitFailedResistance'].includes(b.trigger);
export const needsResistance=b=>['failedResistance','hitFailedResistance'].includes(b.trigger);
export const RESISTANCE_KEYS=[...ATTRIBUTES.map(([k,,name])=>({key:'attribute:'+k,name})),...SKILLS.map(s=>({key:'skill:'+s.key,name:s.name}))];
export function validateTargetEffects(rows){
 if(!Array.isArray(rows)||rows.length>20)throw Error('Use até 20 efeitos por jutsu.');
 const ids=new Set();
 return rows.map(b=>{
  if(typeof b.id!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(b.id)||ids.has(b.id)||(!/^sns:condition:[a-z0-9-]+$/.test(b.conditionId)&&!RUNTIME_STATES[b.conditionId])||!Object.hasOwn(EFFECT_TRIGGERS,b.trigger)||!['targets','self'].includes(b.recipient)||!CONDITION_SCOPES.includes(b.scope)||!Number.isInteger(b.degree)||b.degree<1||b.degree>3)throw Error('Efeito de jutsu inválido.');
  ids.add(b.id);
  if(needsResistance(b)&&(!RESISTANCE_KEYS.some(r=>r.key===b.resistance)||!['jutsu','fixed'].includes(b.dcMode)||b.dcMode==='fixed'&&(!Number.isInteger(b.dc)||b.dc<1)))throw Error('Informe o teste e a dificuldade da resistência.');
  return {id:b.id,conditionId:b.conditionId,trigger:b.trigger,recipient:b.recipient,scope:b.scope,degree:b.degree,resistance:b.resistance??'',dcMode:b.dcMode??'jutsu',dc:b.dc??0,duration:String(b.duration??''),...(durationRule(b.durationRule).mode!=='manual'?{durationRule:durationRule(b.durationRule)}:{}),note:String(b.note??''),source:String(b.source??''),...(b.criticalOnly===true?{criticalOnly:true}:{}),...(b.optionalResistance===true?{optionalResistance:true}:{}),...(b.requiresDamage===true?{requiresDamage:true}:{}),...(b.untilNextTurnEnd===true?{untilNextTurnEnd:true}:{}),...(b.upgradeIfRepeated==='sns:condition:indefeso-ou-paralisado'?{upgradeIfRepeated:b.upgradeIfRepeated}:{})};
 });
}
// Natural sums 2–3 fail; 15–16 succeed (Básico pp.248–250).
export function versusDifficulty(roll,dc){
 if(!Number.isFinite(dc)||!validRoll(roll))return 'pending';
 if(roll.automaticFailure)return 'failed';
 return roll.natural<=3?'failed':roll.natural>=15?'passed':roll.total>=dc?'passed':'failed';
}
export function validRoll(r){return !!r&&Number.isFinite(r.total)&&Number.isInteger(r.natural)&&r.natural>=2&&r.natural<=16&&Number.isFinite(r.precision);}
// Attack is rolled first. Its critical prevents defense; its automatic failure dispenses it.
export function attackOutcome(attack,defense,{fixed=false,criticalAt=15,criticalAllowed=true}={}){
 if(!validRoll(attack))return 'pending';
 if(attack.natural<=3)return 'miss';if(criticalAllowed&&attack.natural>=criticalAt)return 'hit';
 if(fixed)return Number.isFinite(defense)?(attack.total>=defense?'hit':'miss'):'pending';
 if(!validRoll(defense))return 'pending';
 if(defense.natural>=15)return 'miss';if(defense.natural<=3)return 'hit';
 if(attack.total!==defense.total)return attack.total>defense.total?'hit':'miss';
 return attack.precision===defense.precision?'pending':attack.precision>defense.precision?'hit':'miss';
}
export function rolledCheck(roll,spec){
 const dice=roll?.dice??[],results=dice.length===1&&dice[0].faces===8?dice[0].results.filter(r=>r.active!==false):[];
 return results.length===2?{total:roll.total,natural:results.reduce((s,r)=>s+r.result,0),precision:spec.precision+spec.adjustment,...(spec.automaticFailure?{automaticFailure:true}:{})}:null;
}
export function effectRows(use){
 // Dots are document update path separators in Foundry, even inside nested flag objects.
 return use.bindings.flatMap(b=>(b.recipient==='self'?[use.caster]:use.targets).map(target=>({key:b.id+'@'+target.uuid.replaceAll('.','~'),binding:b,target,dc:b.dcMode==='fixed'?b.dc:Number.isFinite(use.difficulty)?use.difficulty+(target.resistanceBonus??0):null})));
}
export function effectOutcome(binding,decision={}){
 if(needsHit(binding)){if(decision.hit==='miss')return 'miss';if(decision.hit!=='hit')return 'pending';}
 if(needsResistance(binding)){if(decision.resistance==='passed')return 'resisted';if(decision.resistance!=='failed')return 'pending';if(binding.criticalOnly&&!(decision.resistanceRoll?.natural<=3))return 'resisted';}
 return 'apply';
}
export function useSnapshot(actor,item,projection,targets,{allowUntargeted=false}={}){
 const bindings=projectedTargetEffects(item,projection);if(!bindings.length)return null;
 if(projection.noRoll&&bindings.some(needsHit))throw Error('Esta técnica não tem teste de acerto. Revise o gatilho dos efeitos.');
 if(bindings.some(b=>needsResistance(b)&&b.dcMode==='jutsu')&&!Number.isFinite(projection.data.difficulty))throw Error('A técnica não tem dificuldade calculada. O mestre precisa informar uma dificuldade fixa.');
 const selected=[...new Map(targets.filter(t=>t.actor&&['shinobi','npc','companion'].includes(t.actor.type)).map(t=>[t.actor.uuid,{uuid:t.actor.uuid,name:t.name??t.actor.name,tokenUuid:t.document?.uuid??'',...(projection.magen?{resistanceBonus:targetResistanceBonus(t.actor)}:{})}])).values()];
 if(bindings.some(b=>b.recipient==='targets')&&!selected.length&&!allowUntargeted)throw Error('Marque pelo menos um alvo para receber os efeitos do jutsu.');
 if(selected.length>50)throw Error('Selecione até 50 alvos por uso.');
 return {version:2,...(Number.isInteger(projection.usedLevel)?{usedLevel:projection.usedLevel}:{}),caster:{uuid:actor.uuid,name:actor.name},itemUuid:item.uuid,name:item.name,bindings,targets:selected,difficulty:useDifficulty(projection,selected.length),attack:null,results:{}};
}

export const projectedTargetEffects=(item,projection)=>validateTargetEffects([...(projection?.autoBindings??[]),...(item.system.targetEffects??[])]);
