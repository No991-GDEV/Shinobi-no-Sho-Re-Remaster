import {isGeneratedMinion} from './npc-minion-policy.mjs';
import {fogContexts} from './environment-core.mjs';
import {WEAPON_CLASSES} from '../data/weapon-defense-profiles.mjs';
import {visualPenaltySnapshot} from './visual-attack.mjs';
import {effectiveAttribute,transformationProjection} from './transformation-core.mjs';
import {WEAPON_DAMAGE_PROFILES} from '../data/damage-profiles.mjs';
import {rolledCheck} from './jutsu-outcomes.mjs';
import {supportDamage,creationData,creationUsable,bladeHandDamage,bladeWeaponBonuses} from './support-core.mjs';
export function damageTargets(targets){return [...new Map(Array.from(targets).filter(t=>t.actor&&['shinobi','npc','companion'].includes(t.actor.type)).map(t=>[t.actor.uuid,{uuid:t.actor.uuid,name:t.name??t.actor.name,...(isGeneratedMinion(t.actor)?{minion:true}:{})}])).values()].slice(0,50);}
export function weaponDamageProfile(actor,item,key){
 if(item?.flags?.['sns-v14-dev']?.bladeHand)return bladeHandDamage(actor,item,key);
 const fists=item?.flags?.['sns-v14-dev']?.supportFists===true,profile=WEAPON_DAMAGE_PROFILES[item?.system.contentId]??(fists?{weaponDamage:0,criticalAt:15,source:'Guia Avançado2026 · Energizar; Básico104 · Soco de Pedra'}:null);if(!profile||!['cc','cd'].includes(key)||!creationUsable(item,key))return null;
 // Acuidade changes precision, not the damage attribute (Básico pp.61/257).
 const attribute=key==='cc'?'for':'des',value=effectiveAttribute(actor,attribute,fists?'unarmed':'size');if(!Number.isInteger(value))return null;
 const support=supportDamage(actor,item,key,attribute,value,profile.weaponDamage);if(!support)return null;
 const summon=actor.flags?.['sns-v14-dev']?.kuchiyose?.mode==='calculated'&&key==='cc',summonBase=actor.system.nc<4?0:Math.max(3,support.value-3)+(fists?0:1)+support.weaponDamage-profile.weaponDamage;
 return {base:summon?Math.max(0,summonBase):Math.max(0,Math.ceil(support.value/2)+support.weaponDamage),fixed:0,nature:support.nature,gradeBonus:profile.gradeBonus??0,criticalAt:profile.criticalAt,attackKind:key==='cc'?'melee':'projectile',weaponClass:fists?'Desarmado':WEAPON_CLASSES[item.system.contentId]??'',attackerSize:transformationProjection(actor).size?.name||actor.system.identity?.size||actor.system.details?.size||'',formula:summon?'max(3, FOR − 3)'+(fists?'':' + 1 (arma marcial)'):'⌈'+support.attribute.toUpperCase()+'/2⌉ + '+support.weaponDamage,source:profile.source,...(support.energy?{energy:support.energy}:{}),...(support.unblockable?{allowedDefenses:['dodge','anticipate']}:{}),...bladeWeaponBonuses(actor,item,key,profile.criticalAt),...(creationData(item)?{creation:{element:creationData(item).element,hardness:creationData(item).hardness}}:{})};
}
export function jutsuDamageProfile(projection){
 if(!projection?.valid||projection.noRoll||(!/^\d+$/.test(String(projection.data.damage))&&!projection.combatProfile?.noDamage&&!projection.combatProfile?.projectiles))return null;
 const id=projection.effect?.id?.split(':').at(-1),projectile=['canhao','orbe','raio','flechas'].includes(id),orbe7=id==='orbe'&&projection.formulas?.chakraCost==='⌈nível usado/2⌉';
 const arrows=projection.combatProfile?.projectiles;
 return {...(projection.combatProfile??{}),base:projection.combatProfile?.noDamage?0:arrows?arrows.count*arrows.baseEach+arrows.bonus:Number(projection.data.damage),fixed:0,nature:'lethal',criticalAt:15,attackerSize:projection.attackerSize??'',attackKind:projection.combatProfile?.attackKind??(projectile?'techniqueProjectile':'technique'),...(orbe7?{allowedDefenses:['dodge','anticipate']}:{}),formula:projection.formulas?.damage??'Dano base da técnica',source:projection.combatProfile?.source??'Regra da técnica'};
}
export function recordedDamageProfile(item){
 if(item?.type!=='attack')return null;
 const value=String(item.system.details?.damage??'').trim();
 if(/^([1-9]|1\d|20)d(4|6|8|10|12|20|100)$/.test(value))return {base:0,fixed:0,dice:{formula:value,part:'base'},nature:'lethal',criticalAt:15,formula:'DB '+value,source:'Dado de dano base'};
 if(!/^\d+$/.test(value))return null;
 return {base:Number(item.system.details.damage),fixed:0,nature:'lethal',criticalAt:15,formula:'Dano base do ataque',source:'Ficha do personagem'};
}
export function damageSnapshot(actor,item,profile,targets,roll=null,spec=null){
 if(!profile)return null;
 const vision=visualPenaltySnapshot(actor);
 return {version:1,environmentVision:fogContexts(actor,targets),actorUuid:actor.uuid,itemUuid:item?.uuid??'',name:item?.name??'Ataque',profile:{...profile,...(isGeneratedMinion(actor)?{minionAttack:true}:{})},targets:damageTargets(targets),attack:roll&&spec?rolledCheck(roll,spec):null,...(vision?{visualPenalty:vision}:{})};
}
