import {minionTestPolicy} from './npc-minion-policy.mjs';
import {poisonContextEffects} from './advanced-core.mjs';
import {energyFor,creationData,creationUsable} from './support-core.mjs';
import {WEAPON_CLASSES} from '../data/weapon-defense-profiles.mjs';
import {defenseContext,fixedDefensePrecision} from './defense-context.mjs';
import {npcFixedDefenseKey} from './npc-generator-defense.mjs';
import {transformationProjection,recordedTransformationRows} from './transformation-core.mjs';
import {SKILLS} from './rules.mjs';
import {ATTRIBUTES} from './kernel.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {isManagedCondition,conditionCheckRows} from './condition-effects.mjs';
import {checkComponents,resolveCheck,resolveRecordedCheck} from './roll-components.mjs';
import {weaponChecks,weaponCheckComponents} from './weapon-checks.mjs';
export function defenseController(actor,users){
 return Array.from(users).filter(u=>u.active&&!u.isGM&&actor.testUserPermission(u,'OWNER')).sort((a,b)=>Number(b.character?.uuid===actor.uuid)-Number(a.character?.uuid===actor.uuid)||a.id.localeCompare(b.id))[0]??users.activeGM;
}
export function defenseSpec(actor,key,item=null,penalty=0,extra=[],profile={}){const spec=rawDefenseSpec(actor,key,item,penalty,extra,profile);return spec?{...spec,...minionTestPolicy(actor,key)}:spec;}
function rawDefenseSpec(actor,key,item=null,penalty=0,extra=[],profile={}){
 if(key.startsWith('attribute:')||key.startsWith('skill:')){
  const source=actor.system.toObject(),effects=[...characteristicEffects(actor),...poisonContextEffects(actor,profile)].filter(e=>!profile.resistance||!e.exceptResistance&&e.kind!=='poisonPenalty');if(actor.type==='shinobi')return resolveCheck(source,key,checkComponents(source,key,effects),effects);
  const override=key.startsWith('skill:')&&effects.find(e=>e.kind==='skillOverride'&&e.target===key.slice(6)),precision=override?.value??(key.startsWith('attribute:')?source.attributes[key.slice(10)]:source.recordedSkills?.find(s=>s.key===key.slice(6))?.precision);
  if(!Number.isInteger(precision))return null;return resolveRecordedCheck({key,name:key,precision,die:'2d8'},conditionCheckRows(recordedTransformationRows([{id:'recorded',label:'Precisão',value:precision,type:'base',enabled:true}],effects,key,source),effects,key));
 }
 const source=actor.system.toObject(),context=defenseContext([...characteristicEffects(actor),...extra],profile),effects=context.effects,rows=item?weaponCheckComponents(source,'cc',item,actor.items):actor.type==='shinobi'?checkComponents(source,key,effects):[{id:'recorded',label:'Precisão',type:'base',value:source.stats[key],enabled:true}];
 if(actor.type!=='shinobi'&&!Number.isInteger(source.stats[key]))return null;
 const adjusted=conditionCheckRows(actor.type!=='shinobi'&&!item?recordedTransformationRows(rows,effects,key,source):rows,effects,key==='cc'?'defense:cc':key);if(context.bonus)adjusted.push({id:'prone-cover',label:'Caído · cobertura parcial',type:'context',value:context.bonus,enabled:true});if(penalty<0){const negative=adjusted.filter(r=>r.enabled&&r.value<0).reduce((n,r)=>n+r.value,0),value=-Math.min(-penalty,Math.max(0,3+negative));if(value)adjusted.push({id:'heavyBlock',label:'Bloquear arma pesada',type:'penalty',value,enabled:true});}return actor.type==='shinobi'?resolveCheck(source,key,adjusted,effects):resolveRecordedCheck({key,name:key==='cc'?'Bloquear':'Antecipar',precision:source.stats[key],die:'2d8'},adjusted);
}
export function defenseChoices(actor,profile,extra=[]){
 const conditions=new Set(Array.from(actor.items).filter(i=>isManagedCondition(i)&&i.system.appliedCondition.active).map(i=>i.system.contentId));
 if(profile.resistance){
  if(profile.resistance.immobileFails&&['impedido','agarrado','indefeso-ou-paralisado','inconsciente'].some(c=>conditions.has('sns:condition:'+c)))return [{id:'immobile',label:'Sem deslocamento · atingido',kind:'none'}];
  const choices=profile.resistance.keys.map(key=>({id:'save-'+key,label:key.startsWith('attribute:')?ATTRIBUTES.find(([id])=>id===key.slice(10))?.[2]??key:SKILLS.find(s=>s.key===key.slice(6))?.name??key,kind:'resistance',key})).filter(c=>defenseSpec(actor,c.key,null,0,[],profile));return [...(profile.resistance.optional?[{id:'decline',label:'Aceitar consequência · sem movimento',kind:'none'}]:[]),...choices.map(c=>({...c,detail:profile.resistance.optional?'Gastar ação de movimento':''})),...(choices.length?[]:[{id:'manual',label:'Resistência não informada',kind:'manual'}])];
 }
 if(['inconsciente','indefeso-ou-paralisado','morrendo'].some(c=>conditions.has('sns:condition:'+c)))return [{id:'manual',label:'Sem defesa · sucesso automático',kind:'manual'}];
 const source=actor.system.toObject(),effects=characteristicEffects(actor),choices=[],esq=fixedDefensePrecision(actor,[...effects,...extra],profile);
 if(Number.isInteger(esq))choices.push({id:'dodge',label:npcFixedDefenseKey(actor)==='lm'?'Antecipar · defesa fixa':'Esquivar',detail:'Reação · dificuldade fixa',kind:'fixed',key:npcFixedDefenseKey(actor)});
 const lm=defenseSpec(actor,'lm',null,0,extra,profile);if(lm)choices.push({id:'anticipate',label:'Antecipar',detail:'Reação · LM '+(lm.precision+lm.adjustment),kind:'opposed',key:'lm'});
 // Technique projectiles require a specifically authorized blocking ability. Never infer Energizar by name.
 const projection=transformationProjection(actor),sizes=['Minusculo','Diminuto','Miudo','Pequeno','Medio','Grande','Enorme','Imenso','Colossal','Incrivel'],normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),size=v=>sizes.findIndex(s=>normalize(s)===normalize(v)),attacker=size(profile.attackerSize),defender=size(projection.size?.name||source.identity?.size||source.details?.size);
 if(projection.blockProjectiles&&attacker>=0&&defender>=0&&attacker-defender<2&&['melee','projectile','techniqueProjectile'].includes(profile.attackKind)){const spec=defenseSpec(actor,'cc',null,0,extra,profile);if(spec)choices.push({id:'block-bijuu',label:'Bloquear · Manto Bijuu',detail:'Reação · CC '+(spec.precision+spec.adjustment),kind:'opposed',key:'cc'});}
 if(['melee','projectile','techniqueProjectile'].includes(profile.attackKind)&&attacker>=0&&defender>=0&&attacker-defender<2)for(const item of actor.items){
  if(item.type!=='weapon')continue;
  const ratings=actor.type==='shinobi'?Object.fromEntries(Object.entries(actor.system.derived.combat).map(([k,v])=>[k,v.precision])):source.stats;
  const check=weaponChecks(item,ratings,source,actor.items).find(c=>c.key==='cc'&&c.available);
  const weaponClass=WEAPON_CLASSES[item.system.contentId],special=creationData(item)&&creationUsable(item,'cc')||energyFor(actor,item,'cc');if(profile.attackKind==='techniqueProjectile'&&!special)continue;if(!['Leve','Mediana','Longa','Pesada'].includes(weaponClass)&&!(special&&item.flags?.['sns-v14-dev']?.supportFists&&profile.attackKind==='techniqueProjectile'))continue;if(profile.attackKind==='melee'&&!['Desarmado','Leve','Mediana','Longa','Pesada'].includes(profile.weaponClass))continue;const penalty=profile.weaponClass==='Pesada'&&['Leve','Mediana'].includes(weaponClass)?-1:0;
  if(check){const spec=defenseSpec(actor,'cc',item,penalty,extra,profile);if(spec)choices.push({id:'block-'+item.id,label:'Bloquear · '+item.name,detail:'Reação · CC '+(spec.precision+spec.adjustment),kind:'opposed',key:'cc',itemId:item.id,penalty});}
 }
 const allowed=profile.allowedDefenses?choices.filter(c=>profile.allowedDefenses.includes(c.id==='dodge'?(c.key==='lm'?'anticipate':'dodge'):c.id==='anticipate'?'anticipate':'block')):choices;
 return allowed.length?allowed:[{id:'manual',label:'Resolver com o mestre',kind:'manual'}];
}
