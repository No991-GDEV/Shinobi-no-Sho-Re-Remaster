import {environmentData,environmentMember,activeEnvironments,objectImpact} from './environment-core.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {jutsuProjection} from './item-view.mjs';
import {supportUnable} from './support-core.mjs';
import {lightningIgnore} from './blade-workflow.mjs';
import {readDamagePresentation} from './damage-presentation.mjs';
const ns='sns-v14-dev',safe=s=>s.replaceAll('.','~');
export function environmentDefenses(actor,profile){
 if(profile.noDamage||profile.followups||profile.ricochet||profile.resistance||supportUnable(actor)||!['melee','projectile','techniqueProjectile','technique','area'].includes(profile.attackKind))return [];
 const learned=Array.from(actor.items).filter(i=>i.type==='jutsu').flatMap(item=>{const p=jutsuProjection(item),m=p?.environment;if(!p?.valid||!['barreira','repelir'].includes(m?.kind)||m.kind==='repelir'&&profile.attackKind==='area')return [];const repeats=m.kind==='repelir'&&m.stage>=7&&actor.flags?.[ns]?.environmentRepelirWindow,cost=repeats?Math.ceil(m.cost/2):m.cost;if(actor.system.resources.chakra.value<cost)return [];return [{id:'environment-'+item.id,label:m.kind==='barreira'?'Barreira · espaço entre combatentes':'Repelir',detail:'LM+'+(m.kind==='barreira'?2:1)+' · '+(repeats?'Livre':'Movimento')+' · Chakra'+cost,kind:'opposed',key:'lm',environmentId:item.id,environmentBonus:m.kind==='barreira'?2:1}];});
 const existing=activeEnvironments(actor).filter(r=>environmentData(r).kind==='barreira'&&environmentData(r).remainingHardness>0&&environmentData(r).defenseStatus!=='pending').map(r=>({id:'cover-'+r.id,label:'Cobertura · '+r.name,detail:'Objeto · dureza'+environmentData(r).remainingHardness+' · cobertura na cena',kind:'object',key:'',environmentRootUuid:r.uuid}));
 return [...learned,...existing];
}
export async function prepareEnvironmentDefense(actor,choice,replyUuid){
 if(!choice.environmentId)return null;const item=actor.items.get(choice.environmentId),p=jutsuProjection(item),m=p?.environment;if(!m)throw Error('Técnica defensiva inválida.');
 const {createEnvironmentDefenseRoot}=await import('./environment-service.mjs');return createEnvironmentDefenseRoot(actor,item,replyUuid);
}
export async function resolveEnvironmentDefense(root,success,attackUuid){
 if(!isTimekeeper()||!environmentData(root))throw Error('Registro de proteção inválido.');
 return withEffectLock(root.actor,async()=>{const m=environmentData(root);if(m.defenseStatus!=='pending'){if(m.defenseAttackUuid!==attackUuid)throw Error('Proteção já usada por outro ataque.');return;}
  await root.update({'system.appliedCondition.active':success,['flags.'+ns+'.environment.defenseStatus']:success?'succeeded':'failed',['flags.'+ns+'.environment.defenseAttackUuid']:attackUuid,'system.appliedCondition.note':success?'Proteção criada a tempo; o ataque é comparado com a dureza do objeto.':'Não foi criada a tempo de proteger deste ataque.'});
 });
}
export function protectionFor(message,packet,actor){
 const result=message.getFlag(ns,'defenseResults')?.[safe(actor.uuid)],uuid=result?.environmentRootUuid;
 if(!uuid||result.environmentSuccess===false||typeof fromUuidSync!=='function')return null;
 const root=fromUuidSync(uuid),m=environmentData(root);if(!m)return null;
 const prior=m.hits?.[message.id];if(!prior&&!root.system.appliedCondition.active)return null;
 const before=prior?.impact.before??m.remainingHardness,profile=packet.profile,shown=readDamagePresentation(message,packet)?.spec??profile;
 const ignore=profile.ignoreAllHardness?before:profile.hardnessPolicy==='lightning'?lightningIgnore(before,[m.element]):profile.objectIgnoreHardness??profile.ignoreHardness??0;
 return {root,meta:m,impact:prior?.impact??objectImpact({hardness:before,base:shown.base,fixed:shown.fixed??0,ignore}),prior};
}
export function protectedDamageSpec(message,packet,actor,spec){const protection=protectionFor(message,packet,actor);if(!protection)return spec;return {...spec,base:protection.impact.base,fixed:protection.impact.fixed};}
async function childSnapshot(root){
 const rows=[];for(const entry of Object.values(environmentData(root).members)){const a=await fromUuid(entry.uuid),i=a?.items.get(entry.itemId);if(i)rows.push({uuid:i.uuid,applied:structuredClone(i.system.appliedCondition),member:structuredClone(environmentMember(i))});}return rows;
}
async function checkChildren(rows){for(const row of rows??[]){const item=await fromUuid(row.uuid);if(!item||JSON.stringify(item.system.appliedCondition)!==JSON.stringify(row.applied)||JSON.stringify(environmentMember(item))!==JSON.stringify(row.member))throw Error('Os participantes mudaram após a destruição. Peça ao mestre para revisar a restauração.');}}
async function restoreChildren(rows){for(const row of rows??[]){const item=await fromUuid(row.uuid);await item.update({'system.appliedCondition':row.applied,['flags.'+ns+'.environmentMember']:row.member});}}
export async function applyWithEnvironmentProtection(message,packet,actor,apply){
 const protection=protectionFor(message,packet,actor);if(!protection)return apply();
 return withEffectLock(protection.root.actor,async()=>{
  const current=protectionFor(message,packet,actor);if(!current)throw Error('A proteção mudou. Reabra o dano.');
  const {root,meta:m,impact,prior}=current,id=message.id,target=safe(actor.uuid),at=new Date().toISOString();
  if(prior?.targets?.[target]==='applied')return apply();
  const replay=prior?.restored===true;
  if(replay&&(m.latestHit!==prior.previousHit||m.remainingHardness!==impact.before||root.system.appliedCondition.active!==prior.wasActive||root.system.appliedCondition.endedAt!==prior.beforeEndedAt))throw Error('A proteção mudou após o desfazer. Confira antes de reaplicar.');
  let entry=prior;
  if(!prior||replay){
   const beforeMembers=structuredClone(m.members),beforeChildren=await childSnapshot(root),wasActive=root.system.appliedCondition.active,beforeEndedAt=root.system.appliedCondition.endedAt??'',previousHit=m.latestHit??'';
   await root.update({['flags.'+ns+'.environment.remainingHardness']:impact.after});
   if(impact.broken||m.kind==='repelir')await (await import('./environment-service.mjs')).endEnvironment(root,impact.broken?'Proteção destruída pelo ataque.':'Repelir absorveu este ataque.');
   entry={impact,targets:prior?.targets??{},wasActive,beforeEndedAt,previousHit,beforeMembers,beforeChildren,afterMembers:structuredClone(environmentData(root).members),afterChildren:await childSnapshot(root),afterActive:root.system.appliedCondition.active,afterEndedAt:root.system.appliedCondition.endedAt??'',restored:false,at};
   await root.update({['flags.'+ns+'.environment.hits.'+id]:entry,['flags.'+ns+'.environment.latestHit']:id});
  }
  try{const result=await apply();await root.update({['flags.'+ns+'.environment.hits.'+id+'.targets.'+target]:'applied'});return result;}
  catch(e){if(!prior||replay){await root.update({['flags.'+ns+'.environment.remainingHardness']:impact.before,['flags.'+ns+'.environment.members']:entry.beforeMembers,['flags.'+ns+'.environment.latestHit']:entry.previousHit,'system.appliedCondition.active':entry.wasActive,'system.appliedCondition.endedAt':entry.beforeEndedAt,['flags.'+ns+'.environment.hits.'+id+'.restored']:true});await restoreChildren(entry.beforeChildren);}throw e;}
 });
}
export async function undoWithEnvironmentProtection(message,packet,actor,undo){
 const protection=protectionFor(message,packet,actor);if(!protection?.prior)return undo();
 return withEffectLock(protection.root.actor,async()=>{
  const current=protectionFor(message,packet,actor);if(!current?.prior)throw Error('Registro da proteção indisponível.');
  const {root,meta:m,prior}=current,target=safe(actor.uuid),allOthers=Object.entries(prior.targets).filter(([id])=>id!==target).every(([,status])=>status==='undone');
  if(prior.restored||m.latestHit!==message.id||m.remainingHardness!==prior.impact.after||root.system.appliedCondition.active!==prior.afterActive||root.system.appliedCondition.endedAt!==prior.afterEndedAt||JSON.stringify(m.members)!==JSON.stringify(prior.afterMembers))throw Error('A proteção mudou novamente. Peça ao mestre para revisar a restauração.');
  if(allOthers)await checkChildren(prior.afterChildren);
  const result=await undo();
  await root.update({['flags.'+ns+'.environment.hits.'+message.id+'.targets.'+target]:'undone',...(allOthers?{['flags.'+ns+'.environment.remainingHardness']:prior.impact.before,['flags.'+ns+'.environment.members']:prior.beforeMembers,['flags.'+ns+'.environment.latestHit']:prior.previousHit,['flags.'+ns+'.environment.hits.'+message.id+'.restored']:true,'system.appliedCondition.active':prior.wasActive,'system.appliedCondition.endedAt':prior.beforeEndedAt}: {})});if(allOthers)await restoreChildren(prior.beforeChildren);return result;
 });
}
export async function damageEnvironmentObject(root,attackUuid){
 if(!isTimekeeper()||!root.system.appliedCondition.active)throw Error('Objeto indisponível.');const message=await fromUuid(attackUuid),p=message?.getFlag(ns,'damageUse');if(!p?.attack||p.attack.natural<=3||p.attack.total<5)throw Error('Escolha um ataque real que acertou o objeto (Dif5 imóvel).');const caster=await fromUuid(p.actorUuid);if(!caster?.testUserPermission(message.author,'OWNER'))throw Error('Origem de ataque inválida.');
 return withEffectLock(root.actor,async()=>{const m=environmentData(root);if(m.objectHits?.[message.id])return;if(['nuvem','nevoa'].includes(m.kind)){const item=await fromUuid(p.itemUuid),element=jutsuProjection(item)?.environment?.element??jutsuProjection(item)?.power?.system.power.definitionId?.split(':').at(-1);if(p.profile.attackKind!=='area'||!['katon','fuuton'].includes(element))throw Error('Dureza imaginária: exige explosão ou vento em área compatível.');}const ignore=p.profile.ignoreAllHardness?m.remainingHardness:p.profile.objectIgnoreHardness??p.profile.ignoreHardness??0,impact=objectImpact({hardness:m.remainingHardness,base:p.profile.base,fixed:p.profile.fixed??0,ignore});await root.update({['flags.'+ns+'.environment.remainingHardness']:impact.after,['flags.'+ns+'.environment.objectHits.'+message.id]:{impact,attackUuid:message.uuid,at:new Date().toISOString()},['flags.'+ns+'.environment.latestHit']:message.id});if(impact.broken||impact.after===0)await (await import('./environment-service.mjs')).endEnvironment(root,'Objeto destruído.');});
}
