import {isProcessor} from './processor-authority.mjs';
import {transformationAreas} from './area-core.mjs';
import {transformationProjection,transformationState,resourcePayment,effectiveAttribute,profileFor} from './transformation-core.mjs';
import {transformationLock,requestTransformation} from './transformation-service.mjs';
import {declareDefenses} from './defense-workflow.mjs';
import {damageSnapshot} from './damage-source.mjs';
import {damageGrade} from './damage-core.mjs';
import {showDamage} from './damage-chat.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {testSpec,escapeHtml as esc} from './kernel.mjs';
import {recordedTransformationRows} from './transformation-core.mjs';
import {resolveRecordedCheck} from './roll-components.mjs';
import {conditionPenalty} from './condition-effects.mjs';
import {rolledCheck,versusDifficulty} from './jutsu-outcomes.mjs';
const ns='sns-v14-dev';
export function transformationTechniquePlan(actor,sourceId,id,{usedLevel,resource='chakra',variant='normal'}={}){
 const p=transformationProjection(actor),grant=p.grants.find(g=>g.sourceId===sourceId&&g.id===id);if(!grant)throw Error('Esta técnica não está disponível no modo/nível atual.');
 const {level,row,profile}=grant;usedLevel??=level;
 const min=id==='boil'&&level>=4?4:grant.minLevel;
 if(!Number.isInteger(usedLevel)||usedLevel<min||usedLevel>level)throw Error('Escolha um nível usado entre '+min+' e '+level+'.');
 if(!['normal','burst','cylinder','create','attack','retract'].includes(variant))throw Error('Variação desconhecida.');
 if(variant==='burst'&&id!=='shot'||variant==='cylinder'&&id!=='bomb'||['create','attack','retract'].includes(variant)&&!['arm','partial'].includes(id))throw Error('Variação não permitida para esta técnica.');
 if(resource==='vitality'&&(profile.control||id==='partial'||id==='boil'||id==='horn'))throw Error('Esta técnica exige Chakra.');
 const strength=effectiveAttribute(actor,'for','size'),spirit=effectiveAttribute(actor,'esp'),force=p.effects.filter(e=>e.kind==='attributeModifier'&&e.target==='for'&&e.scope==='testsAndUnarmed').reduce((n,e)=>n+e.value,0),tail=profile.def.tails.find(t=>t.count===row.tails),fullForm=row.mode==='form';
 const unarmed=Math.ceil((strength+force)/2),beast=Math.ceil(spirit/2)+(level>=6?4:level>=5?3:level>=4?2:1)+(fullForm?Math.ceil((tail?.strength??0)/2):0);
 const damage={beast,unarmed,horn:Math.ceil(strength/2)+6,double:2*usedLevel+(fullForm?2:0),triple:3*usedLevel+(fullForm?2:0),boil:2*usedLevel+(level>=4?2:0)}[grant.damage];
 if(!Number.isSafeInteger(damage)||damage<0)throw Error('Informe os atributos necessários ao dano desta técnica.');
 let cost=grant.cost==='level'?usedLevel:grant.cost==='half'?Math.ceil(usedLevel/2):grant.cost==='bomb'?Math.ceil(3*usedLevel/2):grant.cost;
 if(variant==='burst')cost+=3;
 const sustained=['arm','partial'].includes(id),arm=row.arms?.find(a=>a.id===id);
 if(sustained&&variant==='normal')variant=arm?'attack':'create';
 if(sustained&&variant==='attack'){if(!arm)throw Error('Crie primeiro o braço ou cauda.');cost=0;}
 if(sustained&&variant==='retract'){if(!arm)throw Error('Nenhum braço desta técnica está ativo.');cost=0;}
 return {grant,profile,row,usedLevel,variant,resource,cost,damage,sustained,arm,difficulty:id==='boil'?8+2*level+(level>=4?1:0):null,reach:id==='arm'?10+4*usedLevel:id==='partial'?5:fullForm?p.size?.reach??1:1};
}
export async function useTransformationTechnique(actor,sourceId,id,options={}){
 if(!actor.isOwner)throw Error('Você precisa controlar esta ficha.');
 if(!game.user.isGM)return requestTransformation(actor,{operation:'technique',sourceId,technique:id,options,targets:Array.from(game.user.targets??[]).map(t=>t.document.uuid)});
 const plan=transformationTechniquePlan(actor,sourceId,id,options),source=plan.profile.source;
 const targets=options.targets?await Promise.all(options.targets.map(async uuid=>{const token=await fromUuid(uuid);return {actor:token?.actor,name:token?.name};})):Array.from(game.user.targets??[]);
 const item={uuid:source.uuid,name:plan.grant.name},size=transformationProjection(actor).size;
 const profile={base:plan.damage,fixed:0,nature:'lethal',criticalAt:15,...(plan.row.mode==='form'&&['wave','shot','bomb'].includes(id)?{gradeBonus:0.5}:{}),attackKind:['shot','bomb'].includes(id)?'techniqueProjectile':id==='beast'||id==='horn'||id==='arm'||id==='partial'?'melee':'technique',weaponClass:'Leve',attackerSize:size?.name||actor.system.identity?.size||actor.system.details?.size||'Médio',source:plan.grant.sourcePages,...(id==='boil'?{resistance:{keys:['attribute:agi','skill:prontidao'],difficulty:plan.difficulty,immobileFails:true}}:{})};
 const creating=plan.sustained&&plan.variant==='create',retracting=plan.sustained&&plan.variant==='retract';
 const defenseRequestUuid=creating||retracting?'':await declareDefenses(actor,item,profile,targets);if(defenseRequestUuid===null)return;
 let performed=false;
 await transformationLock(actor,async()=>{
  const latest=transformationTechniquePlan(actor,sourceId,id,options),state=structuredClone(transformationState(actor));let row=state.entries.find(r=>r.sourceId===sourceId);if(!row){row=structuredClone(plan.row);state.entries.push(row);}
  if(options.eventKey&&state.events?.[options.eventKey])return;
  if(latest.cost!==plan.cost||latest.damage!==plan.damage||latest.row.mode!==plan.row.mode)throw Error('A transformação mudou durante a declaração. Reabra o uso.');
  const patch=resourcePayment(actor,plan.cost,plan.resource,sourceId);
  if(creating){row.arms??=[];row.arms.push({id,cost:plan.cost,resource:plan.resource,usedLevel:plan.usedLevel});}
  if(retracting){row.arms=row.arms.filter(a=>a.id!==id);if(plan.arm.resource!=='vitality'){
   if(plan.arm.resource==='chakra')patch['system.resources.chakra.value']=actor.system.resources.chakra.value+plan.arm.cost;
   else{const rows=Array.from(actor.system.specialResources??[]).map(r=>({...r})),r=rows.find(r=>r.kind==='bijuu'&&r.sourceId===sourceId);if(!Number.isInteger(r?.value))throw Error('Confira a reserva antes de recolher o braço.');r.value+=plan.arm.cost;patch['system.specialResources']=rows;}
  }}
  if(plan.resource==='vitality'&&patch['system.resources.vitality.value']<=0){row.domination??={phase:'required',difficulty:9,failures:0,attempts:0};row.problem='Teste de domínio necessário.';}
  state.events??={};if(options.eventKey)state.events[options.eventKey]=true;
  await actor.update({...patch,['flags.'+ns+'.transformations']:state});performed=true;
 });
 if(!performed)return;
 const speaker=foundry.documents.ChatMessage.getSpeaker({actor}),facts=plan.grant.action+' · '+(plan.resource==='vitality'?'Vitalidade ':'Chakra ')+plan.cost+' · '+plan.grant.range;
 if(creating||retracting)return foundry.documents.ChatMessage.create({speaker,content:'<strong>'+esc(plan.grant.name)+'</strong><p>'+esc(creating?'Criado · '+facts:'Recolhido · custo de Chakra devolvido; Vitalidade não é devolvida.')+'</p>'});
 let spec,roll;
 if(plan.grant.test==='none'){spec={precision:0,adjustment:0,formula:'2d8'};roll=await new foundry.dice.Roll('2d8').evaluate();}
 else{const key=plan.grant.test;
  if(actor.type==='shinobi')spec=testSpec(actor.system.toObject(),key,0,'',characteristicEffects(actor));
  else{const precision=actor.system.stats[key];spec=resolveRecordedCheck({key,name:plan.grant.name,precision,die:'2d8'},recordedTransformationRows([{id:'recorded',label:'Precisão',type:'base',enabled:true,value:precision}],characteristicEffects(actor),key,actor.system.toObject()));}
  roll=await new foundry.dice.Roll(spec.formula).evaluate();
 }
 const packet=damageSnapshot(actor,item,profile,targets);packet.defenseRequestUuid=defenseRequestUuid;
 if(plan.grant.test==='none')packet.requestedGrade=damageGrade(roll.total,{automatic:true});else packet.attack=rolledCheck(roll,spec);
 const reminders={wave:'Atingidos: Vigor Dif '+(7+2*plan.usedLevel)+' para não serem empurrados; nível8 acrescenta Caído.',shot:plan.variant==='burst'?'Rajada: resolva os testes adicionais; +2 de dano por sucesso. Grau do primeiro ataque.':'Explosão: 2 m de diâmetro por nível usado.',bomb:'Zona de disparo: distância mínima5m. Remanescente exige AGI Dif '+(9+2*plan.usedLevel)+'.',horn:'Atropelar: Vigor Dif 2 + CC para não cair.',boil:'Resistência AGI ou Prontidão Dif '+plan.difficulty+'. Sem teste para quem não pode se mover.'};
 const message=await roll.toMessage({speaker,flavor:'<strong>'+esc(plan.grant.name)+'</strong><p>'+esc(facts)+'</p>'+((reminders[id])?'<p>'+esc(reminders[id])+'</p>':'')+'<small>'+esc(plan.grant.sourcePages)+'</small>',flags:{[ns]:{areaUse:transformationAreas(actor,plan),damageUse:packet}}});
 await showDamage(message);return message;
}
export async function testDomination(actor,sourceId){
 return transformationLock(actor,()=>resolveDomination(actor,sourceId));
}
async function resolveDomination(actor,sourceId){
 if(!game.user.isGM||!actor.isOwner)throw Error('O mestre conduz o domínio.');
 const p=profileFor(actor,sourceId);if(!p)throw Error('Origem ausente.');
 const before=transformationState(actor),row=before.entries.find(r=>r.sourceId===sourceId);if(!row)throw Error('Ative ou registre o poder antes do teste de domínio.');
 const current=row.domination??{phase:'required',difficulty:9,failures:0,attempts:0};if(current.phase==='lost')throw Error('O mestre resolve o controle da bijuu.');
 const roll=await new foundry.dice.Roll('2d8').evaluate(),result=versusDifficulty({natural:roll.total,total:roll.total,precision:0},current.difficulty);
 const state=structuredClone(before),r=state.entries.find(r=>r.sourceId===sourceId),d={...current,attempts:current.attempts+1,failures:current.failures+(result==='failed'?1:0)};
 if(current.phase==='required'&&result==='failed'){r.mode='mode';r.tails=1;r.usedLevel=Math.max(2,Math.min(p.level,5));r.forced=true;d.phase='contesting';d.difficulty=10;d.attempts=0;d.failures=0;}
 else if(current.phase==='required'){d.phase='contained';}
 else if(d.failures>=2){d.phase='lost';r.playerLocked=true;r.problem='Domínio perdido: mestre controla a bijuu; transformação final e morte dependem de intervenção.';}
 else if(d.attempts>=3){d.phase='contained';r.mode='normal';r.controlPaid=false;r.buffs=[];r.exhausted=true;d.pendingCondition=true;d.consequenceKey='domain-'+foundry.utils.randomID();r.problem='Exausto até descansar. Mestre libera após descanso.';}
 else d.difficulty++;
 r.domination=d;await actor.update({['flags.'+ns+'.transformations']:state});
 return roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:'<strong>Domínio · Dif '+current.difficulty+'</strong><p>'+esc(result==='passed'?'Sucesso':'Falha')+' · '+esc({required:'Teste necessário',contesting:'Disputa pelo controle',lost:'Controle da bijuu com o mestre',contained:r.exhausted?'Transformação contida · Exausto':'Controle mantido'}[d.phase])+'</p>',flags:{[ns]:{check:{actorImg:actor.img,key:'domain'},testOutcome:{dc:current.difficulty,result}}}});
}
export async function reconcileDominationCondition(actor){
 if(!isProcessor())return;
 return transformationLock(actor,async()=>{
  for(const row of transformationState(actor).entries.filter(r=>r.domination?.pendingCondition)){
   const {applyCondition}=await import('./condition-application.mjs');
   await applyCondition(actor,'sns:condition:exausto',{origin:'Domínio da Bijuu',sourceUuid:actor.items.get(row.sourceId)?.uuid??'',applicationKey:row.domination.consequenceKey,duration:'Até descansar'});
   const next=structuredClone(transformationState(actor)),r=next.entries.find(r=>r.sourceId===row.sourceId);if(r?.domination?.consequenceKey===row.domination.consequenceKey){r.domination.pendingCondition=false;await actor.update({'flags.sns-v14-dev.transformations':next});}
  }
 });
}

export async function restTransformation(actor,sourceId){
 if(!game.user.isGM||!actor.isOwner)throw Error('Somente o mestre pode concluir este descanso.');
 return transformationLock(actor,async()=>{
  const state=structuredClone(transformationState(actor)),row=state.entries.find(r=>r.sourceId===sourceId);if(!row)return;
  if(row.mode!=='normal'||row.playerLocked)throw Error('Encerre a transformação e resolva o controle antes do descanso.');
  const key=row.domination?.consequenceKey;
  const {endCondition}=await import('./condition-application.mjs');
  for(const item of actor.items)if(key&&item.system.appliedCondition?.applicationKey===key)await endCondition(actor,item.id);
  row.exhausted=false;row.turns=0;row.domination=null;row.forced=false;row.problem='';row.arms=[];
  await actor.update({'flags.sns-v14-dev.transformations':state});
 });
}
