import {effectItemModifiers,effectItemHardness} from './effect-item-rules.mjs';
import {legadoSusanoo,legadoState,hasLegado} from './legado-core.mjs';
import {supportHardness} from './support-core.mjs';
import {SKILLS} from './rules.mjs';
import {conditionHaste,conditionMovement} from './condition-effects.mjs';
import {TRANSFORMATION_PROFILES} from '../data/transformation-profiles.mjs';
export const transformationState=actor=>actor?.flags?.['sns-v14-dev']?.transformations??{version:1,entries:[],events:{}};
export const canControlTransformation=(actor,user=globalThis.game?.user)=>!!user?.isGM||!transformationState(actor).entries.some(r=>r.playerLocked);
const list=actor=>Array.from(actor?.items??[]);
const highest=(steps,level)=>steps?.filter(s=>s.level<=level).at(-1);
export function transformationSources(actor){
 return Object.values(TRANSFORMATION_PROFILES).flatMap(def=>list(actor).filter(i=>i.type==='power'&&i.system.contentId===def.sourceId&&(def.falseBijuu?list(actor).some(o=>o.system.contentId===def.originId):i.system.details?.accessRule==='jinchuuriki'&&i.system.choice?.key==='gobi'&&list(actor).some(o=>o.system.contentId===def.originId&&o.system.details?.accessRule==='gobi-gobi-futton'))).map(source=>({def,source,level:source.system.level,control:source.system.level>=def.controlLevel&&source.flags?.['sns-v14-dev']?.delayControl!==true})));
}
export function profileFor(actor,id){return transformationSources(actor).find(p=>p.source.id===id);}
export function transformationRecord(actor,id){return transformationState(actor).entries.find(e=>e.sourceId===id);}
export function transformationProjection(actor){
 const result={effects:[],grants:[],active:[],size:null,hardness:0,blockProjectiles:false,restricted:false,accelerated:false,armorPenaltyExempt:false};
 for(const sourceProfile of transformationSources(actor)){
  const row=transformationState(actor).entries.find(r=>r.sourceId===sourceProfile.source.id)??{id:sourceProfile.source.id+'~'+sourceProfile.def.id,sourceId:sourceProfile.source.id,profileId:sourceProfile.def.id,mode:'normal',tails:1,usedLevel:sourceProfile.level,buffs:[],turns:0};
  const profile=sourceProfile;if(!Number.isInteger(profile.level)||profile.level<1||profile.level>profile.def.maxLevel)continue;
  const {def,level,source,control}=profile,mode=def.modes.find(m=>m.id===row.mode),live=mode&&mode.rank>0&&(level>=mode.minLevel||row.forced)&&row.usedLevel<=level&&(!mode.control||control)&&(!control||row.controlPaid===true)&&!row.suspended;
  const effect=(kind,values)=>result.effects.push({kind,...values,sourceId:source.id,sourceName:source.name,rule:'transformation:'+def.id});
  if(live){
   const tail=mode.tails?def.tails.find(t=>t.count===row.tails&&t.level<=row.usedLevel&&t.level<=level):null;
   if(mode.tails&&(!tail||def.falseBijuu&&tail.count>(source.flags?.['sns-v14-dev']?.falseBijuuTails??1)))continue;
   const size=mode.size?highest(def.sizes,level):null,strength=(tail?.strength??mode.strength??0)+(def.falseBijuu&&mode.id==='mode'&&row.tails>=2?2:0);
   if(strength)effect('attributeModifier',{target:'for',value:strength,scope:'all'});
   if(mode.agility)effect('attributeModifier',{target:'agi',value:mode.agility,scope:'all'});
   if(size){result.size=size;effect('attributeModifier',{target:'for',value:size.body,scope:'size'});effect('attributeModifier',{target:'vig',value:size.body,scope:'size'});effect('flatModifier',{target:'movement',value:size.movement});effect('flatModifier',{target:'skill:furtividade',value:size.stealth});}
   result.hardness=Math.max(result.hardness,mode.hardness??0);result.blockProjectiles||=!!mode.blockProjectiles;result.restricted||=!!mode.restrictTechniques;result.accelerated||=!!mode.accelerated;
   result.active.push({row,profile,mode,size});
   for(const id of mode.grants??[]){const t=def.techniques.find(t=>t.id===id&&t.minLevel<=level);if(t)result.grants.push({...t,sourceId:source.id,sourceName:source.name,level,row,profile,grantId:source.id+'~'+t.id});}
  }
  for(const buffId of row.buffs??[]){
   const buff=def.buffs.find(b=>b.id===buffId&&b.minLevel<=level);if(!buff||buff.incompatibleModes.includes(live?mode.id:'normal')||!hasVaporArmor(actor,def))continue;
   const step=highest(buff.steps,level),alternate=globalThis.game?.settings?.get?.('sns-v14-dev','gobiVaporRevision')===true;
   const agility=buff.id==='acceleration'&&alternate?Math.max(0,Math.min(3,level-5)):highest(buff.agilityTests,level)?.value??0;
   if(agility){effect('attributeModifier',{target:'agi',value:agility,scope:'tests'});effect('attributeModifier',{target:'agi',value:agility,scope:'movement'});}
   if(step)effect('attributeModifier',{target:'for',value:step.value,scope:'testsAndUnarmed'});
   result.accelerated||=!!buff.accelerated;result.armorPenaltyExempt||=!!buff.armorPenaltyExempt;
   result.active.push({row,profile,buff});
  }
  // The inherited elemental technique is available outside the main modes too.
  if(!def.falseBijuu&&level>=2)for(const id of ['boil',...(live&&mode.id==='presence'&&control?['partial']:[])]){const t=def.techniques.find(t=>t.id===id&&t.minLevel<=level);if(t)result.grants.push({...t,sourceId:source.id,sourceName:source.name,level,row,profile,grantId:source.id+'~'+t.id});}
 }
 if(hasVaporArmor(actor,TRANSFORMATION_PROFILES.gobi)&&!result.armorPenaltyExempt)for(const target of ['esq','attribute:agi','skill:acrobacia','skill:atletismo','skill:escapar','skill:furtividade'])result.effects.push({kind:'flatModifier',target,value:-4,sourceId:'vapor-armor',sourceName:'Armadura a Vapor',rule:'armorPenalty'});
 if(result.accelerated)result.effects.push({kind:'condition',key:'acelerado',sourceId:'transformation',sourceName:'Transformação',scope:'none',degree:0,slow:false,automated:true});
 return result;
}
export function hasVaporArmor(actor,def){const a=actor?.system?.attributes??{};return (a.for>=10||a.vig>=15)&&list(actor).some(i=>i.type==='aptitude'&&(i.system.contentId==='sns:apt:usar-armaduras-pesadas'||i.system.ruleId==='sns:apt:usar-armaduras-pesadas'))&&list(actor).some(i=>i.type==='armor'&&i.system.contentId===def.armorId&&i.system.equipped&&i.system.quantity>0&&i.flags?.['sns-v14-dev']?.vaporSealBroken!==true);}
export function attributeEffect(effects,key,scope='all'){
 return effects.filter(e=>e.kind==='attributeModifier'&&e.target===key&&(e.scope==='all'||e.scope===scope||scope==='tests'&&e.scope==='testsAndUnarmed'||scope==='unarmed'&&e.scope==='testsAndUnarmed')).reduce((n,e)=>n+e.value,0);
}
export const flatEffect=(effects,key)=>effects.filter(e=>e.kind==='flatModifier'&&e.target===key).reduce((n,e)=>n+e.value,0);
export function effectiveAttribute(actor,key,scope='all'){
 const base=key==='for'&&legadoState(actor).active?.hachiman&&hasLegado(actor,'hachiman-hidari')?actor.system.attributes?.esp:actor.system.attributes?.[key];return Number.isInteger(base)?base+attributeEffect([...transformationProjection(actor).effects,...effectItemModifiers(actor)],key,scope):base;
}
export const effectiveHardness=actor=>Math.max(effectItemHardness(actor),legadoSusanoo(actor)?.hardness??0,actor.system.damageState?.hardness??0,transformationProjection(actor).hardness,hasVaporArmor(actor,TRANSFORMATION_PROFILES.gobi)?2:0,supportHardness(actor));
export function recordedAttributeView(value,effects,key){const effectiveValue=Number.isFinite(value)?value+attributeEffect(effects,key,'size'):value;return {value,effectiveValue,adjusted:effectiveValue!==value};}
export function recordedTransformationRows(rows,effects,key,system={},attributeOverride=''){
 let value=0;const attr=attributeOverride||(key.startsWith('skill:')?SKILLS.find(s=>s.key===key.slice(6))?.attribute:'')||({cc:'for',cd:'des',lm:'per',esq:'agi',initiative:'agi'}[key]);
 if(attr)value=attributeEffect(effects,attr)+(key.startsWith('skill:')?attributeEffect(effects,attr,'size')-attributeEffect(effects,attr):0);
 if(key.startsWith('attribute:')){const k=key.slice(10);value=attributeEffect(effects,k,'tests')+attributeEffect(effects,k,'size')-attributeEffect(effects,k);}
 value+=flatEffect(effects,key);
 const clean=rows.filter(r=>r.id!=='recorded-transformation');return value?[...clean,{id:'recorded-transformation',label:'Técnicas e efeitos · '+effects.filter(e=>['attributeModifier','flatModifier'].includes(e.kind)).map(e=>e.sourceName).filter((v,i,a)=>a.indexOf(v)===i).join(', '),type:'technique',value,enabled:true}]:clean;
}
export function techniqueRestriction(actor,item){
 if(legadoState(actor).active?.hachiman&&!item?.system?.contentId?.startsWith('sns:legado:jutsu:hachiman'))return 'Hachiman permite apenas suas técnicas e ataques/manobras corporais durante o transe.';
 const p=transformationProjection(actor);if(!p.restricted)return '';
 if(p.active.some(a=>a.profile.def.falseBijuu&&a.mode?.restrictTechniques)&&item?.system.details?.powerId===p.active.find(a=>a.profile.def.falseBijuu&&a.mode?.restrictTechniques)?.profile.source.id)return '';
 return 'O modo bijuu ativo impede esta técnica. Somente técnicas gerais do Jinchuuriki e as exceções da bijuu estão disponíveis (Básico216).';
}
export function transitionPlan(actor,{sourceId,mode:modeId,tails=1,usedLevel,resource='chakra',buff=null},eventKey=''){
 const profile=profileFor(actor,sourceId);if(!profile)throw Error('Origem e poder de transformação precisam estar na ficha.');
 const {def,source,level,control}=profile;if(!Number.isInteger(level)||level<1||level>def.maxLevel)throw Error('Confira o nível do poder, entre 1 e '+def.maxLevel+'.');
 const state=structuredClone(transformationState(actor));if(state.version!==1||!Array.isArray(state.entries))throw Error('Registro de transformação inválido.');
 if(eventKey&&state.events?.[eventKey])return {duplicate:true,state};
 let row=state.entries.find(r=>r.sourceId===sourceId);if(!row){row={id:sourceId+'~'+def.id,sourceId,profileId:def.id,mode:'normal',tails:1,usedLevel:2,buffs:[],turns:0,controlPaid:false,resource,history:[]};state.entries.push(row);}
 const prior=def.modes.find(m=>m.id===row.mode)??def.modes[0],mode=def.modes.find(m=>m.id===(modeId??row.mode));
 if(!mode)throw Error('Modo desconhecido.');
 let cost=0,payment='chakra',action='Livre';
 if(buff){
  if(resource==='vitality')throw Error('As técnicas de Vapor exigem Chakra.');
  payment=resource;
  const b=def.buffs.find(b=>b.id===buff);if(!b||level<b.minLevel)throw Error('Este benefício ainda não está disponível no nível do poder.');
  if(row.buffs.includes(buff))row.buffs=row.buffs.filter(id=>id!==buff);
  else{
   if(b.incompatibleModes.includes(row.mode)||!hasVaporArmor(actor,def))throw Error('Exige Armadura a Vapor equipada e selada, sem Manto/Modo/Forma Bijuu.');
   cost=highest(b.steps,level)?.cost??b.cost;row.buffs.push(buff);action=b.action;
  }
 }else{
  if(level<mode.minLevel||mode.control&&!control)throw Error('Modo não disponível neste nível/Controle Total.');
  if(row.exhausted&&mode.rank>0)throw Error('Poder bloqueado por exaustão até o próximo descanso.');
  if(mode.rank>prior.rank+1)throw Error('Ative primeiro o modo anterior.');
  if(mode.tails){
   usedLevel??=Math.max(mode.minLevel,tails+1);const tail=def.tails.find(t=>t.count===tails&&t.level<=usedLevel);
   if(!tail||!Number.isInteger(usedLevel)||usedLevel<(mode.minUsedLevel??mode.minLevel)||usedLevel>level||def.falseBijuu&&tails>(source.flags?.['sns-v14-dev']?.falseBijuuTails??1))throw Error('Caudas ou nível usado não estão disponíveis.');
  }else usedLevel=level;
  if(mode.id===prior.id&&row.tails===tails&&row.usedLevel===usedLevel&&!row.suspended&&(!control||row.controlPaid))return {duplicate:true,state};
  action=mode.rank>prior.rank?mode.action:'Livre';
  if(mode.rank>0&&control&&!row.controlPaid){cost=level;row.controlPaid=true;payment=resource;}
  else if(mode.wear&&!control&&(mode.rank>prior.rank||row.usedLevel!==usedLevel||row.tails!==tails)){cost=usedLevel*(row.turns>1+level?2:1);payment='vitality';}
  row.mode=mode.id;row.tails=tails;row.usedLevel=usedLevel;row.suspended=false;row.resource=resource;
  if(mode.rank>0&&!row.turns)row.turns=1;
  if(mode.rank===0){row.controlPaid=false;row.arms=[];row.playerLocked=false;row.forced=false;}
  if(mode.id==='form')row.arms=[];
  if(mode.rank>1)row.buffs=row.buffs.filter(id=>!def.buffs.find(b=>b.id===id)?.incompatibleModes.includes(mode.id));
 }
 if(!['chakra','bijuu','vitality'].includes(payment)||payment==='vitality'&&control)throw Error('Esta forma não permite pagar com Vitalidade.');
 const patch=resourcePayment(actor,cost,payment,source.id);
 if(!def.falseBijuu&&payment==='vitality'&&patch['system.resources.vitality.value']<=0){row.domination??={phase:'required',difficulty:9,failures:0,attempts:0};row.problem='Teste de domínio necessário.';}
 row.history=[...(row.history??[]),{event:buff??mode.id,action,cost,resource:payment,at:new Date().toISOString()}].slice(-200);
 state.events??={};if(eventKey)state.events[eventKey]=true;
 return {state,patch,action,cost,payment,row,profile};
}
export function resourcePayment(actor,cost,kind,sourceId){
 if(!Number.isSafeInteger(cost)||cost<0)throw Error('Custo inválido.');if(!cost)return {};
 if(kind==='bijuu'){
  const rows=Array.from(actor.system.specialResources??[]).map(r=>({...r})),r=rows.find(r=>r.kind==='bijuu'&&r.sourceId===sourceId);
  if(!Number.isInteger(r?.value)||r.value<cost)throw Error('Chakra bijuu desconhecido ou insuficiente.');r.value-=cost;return {'system.specialResources':rows};
 }
 const key=kind==='vitality'?'vitality':'chakra',current=actor.system.resources?.[key]?.value;
 if(!Number.isInteger(current)||kind!=='vitality'&&current<cost)throw Error('Recurso desconhecido ou insuficiente.');
 return {['system.resources.'+key+'.value']:current-cost};
}
export function transformationTurnPlan(actor,event){
 const state=structuredClone(transformationState(actor)),key=[event.combatId,event.combatantId,event.round,'start'].join('~');
 if(event.phase!=='start'||state.events?.[key])return null;
 let vitality=actor.system.resources?.vitality?.value,changed=false;
 for(const row of state.entries){
  const p=profileFor(actor,row.sourceId),mode=p?.def.modes.find(m=>m.id===row.mode);if(!p||!mode?.rank||row.suspended)continue;
  row.turns=(row.turns??0)+1;changed=true;
  if(p.control){if(!row.controlPaid)row.suspended=true;continue;}
  const aggravated=row.turns>1+p.level,cost=(p.def.falseBijuu?1:mode.wear||aggravated?row.usedLevel:0)*(aggravated?2:1);
  if(cost&&Number.isInteger(vitality))vitality-=cost;
  else if(cost){row.suspended=true;row.problem='Vitalidade desconhecida; manutenção pendente.';}
  if(vitality<=0&&!p.def.falseBijuu){row.domination??={phase:'required',difficulty:9,failures:0,attempts:0};row.problem='Teste de domínio necessário.';}
 }
 if(!changed)return null;state.events??={};state.events[key]=true;
 return {state,patch:Number.isInteger(vitality)?{'system.resources.vitality.value':vitality}:{}};
}

export function recordedMovement(value,effects,system){
 if(!Number.isFinite(value))return value;
 const base=system.attributes?.agi,delta=attributeEffect(effects,'agi','movement'),haste=!!conditionHaste(effects);
 // Recorded NPC movement stays authoritative; only the known AGI contribution changes.
 const difference=Number.isFinite(base)?Math.ceil((base+delta)*(haste?2:1)/2)-Math.ceil(base/2):0;
 return Math.min(1,...effects.filter(e=>e.kind==='movementLimit').map(e=>e.value))*conditionMovement(Math.max(1,value+difference+flatEffect(effects,'movement')),effects);
}
