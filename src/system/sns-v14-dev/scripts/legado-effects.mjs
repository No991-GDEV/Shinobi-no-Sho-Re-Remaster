import {isGeneratedMinion} from './npc-minion-policy.mjs';
import {loadCanonicalLibrary,canonicalCopy} from './canonical-content.mjs';
import {durationClock,actorCombat} from './effect-duration.mjs';
import {legadoState,legadoItems,hasLegado,legadoEternal,legadoTransplant} from './legado-core.mjs';
const ns='sns-v14-dev';
export const legadoEffect=i=>i?.flags?.[ns]?.legadoEffect;
export const activeLegadoEffects=a=>Array.from(a.items??[]).filter(i=>i.system?.appliedCondition?.active&&legadoEffect(i));
export function legadoSaveDifficulty(cast,target){
 let dc=cast.plan.dc;const key=cast.plan.legado?.key,items=legadoItems(target),has=k=>items.some(i=>['sns:apt:'+k,'sns:legado:apt:'+k.replace('mangekyou','mangekyo')].includes(i.system?.ruleId||i.system?.contentId));
 if(key==='tsukuyomi'){if(has('sandan-sharingan'))dc-=2;if(has('mangekyou-sharingan')||legadoEternal(target))dc--;}
 if(key==='kotoamatsukami'&&(has('mangekyou-sharingan')||legadoEternal(target)))dc-=2;
 if(key==='mahikami'&&has('sandan-sharingan'))dc-=2;
 return dc;
}
export function legadoMayReroll(cast,target){return cast?.plan.legado?.key==='mahikami'&&cast.saves?.[target.uuid.replaceAll('.','~')]?.outcome==='failed'&&!cast.saves[target.uuid.replaceAll('.','~')].rerolled&&(hasLegado(target,'mangekyo-sharingan')||legadoItems(target).some(i=>i.system.ruleId==='sns:apt:mangekyou-sharingan'));}
export async function addLegadoEffect(actor,{name,kind,group,sourceUuid='',casterUuid='',description='',condition='',data={},turns=null,phase='end',next=false,permanent=false,persistVision=false}){
 const applicationKey='legado:'+group+':'+kind,prior=Array.from(actor.items).find(i=>i.system.appliedCondition?.applicationKey===applicationKey);if(prior)return prior;
 const library=await loadCanonicalLibrary(),entry=condition?library?.entries.find(e=>e.id==='sns:condition:'+condition):null;
 const doc=entry?canonicalCopy(entry):{name,type:'effect',img:'icons/svg/eye.svg',system:{contentId:'sns:legado:state:'+kind,category:'effects',description,source:{id:'Legado do Ódio',pages:''},details:{}},flags:{}};
 doc.name=name||doc.name;if(description)doc.system.description=description;
 let rule={mode:data.scene?'scene':'manual'},clock={};const combat=actorCombat(actor);
 if(turns&&combat){rule={mode:'turns',turns,phase,anchor:'recipient'};clock=durationClock(rule,combat,actor.uuid);if(next&&combat.combatant?.actor?.uuid===actor.uuid&&phase==='end')clock.firstRound++;}
 doc.system.appliedCondition={managed:true,active:true,scope:'all',origin:'Legado do Ódio',sourceUuid,casterUuid,duration:permanent?'Permanente':turns?turns+' turno(s)':data.duration??'Conforme a técnica',durationRule:rule,durationClock:clock,note:data.note??'',applicationKey,appliedBy:game.user.id,appliedAt:new Date().toISOString(),endedAt:''};
 doc.flags??={};doc.flags[ns]={...doc.flags[ns],legadoEffect:{kind,group,sourceUuid,casterUuid,permanent,persistVision,...structuredClone(data)}};
 const [created]=await actor.createEmbeddedDocuments('Item',[doc]);return created;
}
export async function endLegadoGroup(actor,group){const rows=activeLegadoEffects(actor).filter(i=>legadoEffect(i).group===group||legadoEffect(i).group.startsWith(group+'~'));if(rows.length)await actor.updateEmbeddedDocuments('Item',rows.map(i=>({_id:i.id,'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString()})));}
export async function applyLegadoOcularStates(actor,plan,payment,group){
 const source=actor.items.find(i=>i.system.contentId==='sns:legado:apt:mangekyo-sharingan');if(!source||legadoEternal(actor)||legadoTransplant(actor))return;
 const common={sourceUuid:source.uuid,casterUuid:actor.uuid,description:source.system.description};
 for(const state of payment.states??[]){
  if(['fatigado','exausto','sangramento-ocular'].includes(state)){
   const kind=state==='sangramento-ocular'?'ocular-bleeding':'ocular-'+state;
   if(activeLegadoEffects(actor).some(i=>legadoEffect(i).kind===kind))continue;
   if(state==='fatigado'&&activeLegadoEffects(actor).some(i=>legadoEffect(i).kind==='ocular-exausto'))continue;
   if(state==='exausto')for(const effect of activeLegadoEffects(actor).filter(i=>legadoEffect(i).kind==='ocular-fatigado'))await effect.update({'system.appliedCondition.active':false});
   await addLegadoEffect(actor,{...common,name:state==='sangramento-ocular'?'Sangramento ocular · 1':state==='exausto'?'Exausto · visão':'Fatigado · visão',kind,group:kind+'~'+(legadoState(actor).vision?.spent??0),condition:state==='sangramento-ocular'?'sangrando':state,persistVision:state!=='sangramento-ocular',data:{degree:1,note:state==='sangramento-ocular'?'Sangramento adicional ao dano imediato de2por ponto de visão.':'Permanece até completar o Descanso Sharingan.'}});
  }else if(['atordoado','desprevenido'].includes(state))await addLegadoEffect(actor,{...common,group,kind:'ocular-'+state,condition:state,turns:1,next:true});
 }
 const blind=payment.state?.vision?.blindness??legadoState(actor).vision?.blindness??0;
 if(blind){const old=activeLegadoEffects(actor).filter(i=>legadoEffect(i).kind.startsWith('blindness-'));for(const i of old)if(legadoEffect(i).degree!==blind)await i.update({'system.appliedCondition.active':false});
  if(!old.some(i=>legadoEffect(i).degree===blind))await addLegadoEffect(actor,{...common,name:['','Cegueira Leve','Cegueira Grave','Cegueira Completa'][blind],kind:'blindness-'+blind,group:'vision-'+blind,permanent:true,data:{degree:blind,note:'Penalidade −'+blind+' em ataques, defesas e testes visuais quando o Sharingan está inativo. Visão Prejudicada continua ativa.'}});
 }
}
export async function applyLegadoSelfEffect(actor,message){
 const cast=message.getFlag(ns,'npcJutsuCast'),p=cast?.plan;if(!p?.legado||cast.status==='pending')return;
 const {key,mode}=p.legado,s=legadoState(actor),group=message.id;
 if(['encerrar','tangivel'].includes(mode)){
  const roots=activeLegadoEffects(actor).filter(i=>legadoEffect(i).selfKey===key);for(const r of roots)await endLegadoGroup(actor,legadoEffect(r).group);return;
 }
 if(!p.legado.state&&!p.legado.susanooTransition&&!p.legado.movement&&!p.legado.damageBonus)return;
 if(s.vision?.locked)return;
 const selfKey=p.legado.fortune?'bishamonten-fortune':key==='kamui-curto-alcance'&&mode==='intangivel'?'kamui-curto-alcance':key;
 const existing=activeLegadoEffects(actor).find(i=>legadoEffect(i).selfKey===selfKey);
 if(existing&&key==='mahikami'&&mode==='sustentar'&&!activeLegadoEffects(actor).some(i=>legadoEffect(i).kind==='mahikami-exausto'))await addLegadoEffect(actor,{kind:'mahikami-exausto',group:legadoEffect(existing).group+'~exhaustion',condition:'exausto',sourceUuid:cast.itemUuid,casterUuid:actor.uuid,data:{selfKey:'mahikami'}});
 if(existing&&p.legado.fortune)await endLegadoGroup(actor,legadoEffect(existing).group);
 if(existing&&!p.legado.fortune){await existing.update({name:p.legado.susanooTransition?'Susano’o':p.name,['flags.'+ns+'.legadoEffect.mode']:mode});return;}
 const name=key==='susanoo'?'Susano’o':key==='bishamonten'?p.name:key==='hachiman'?'Hachiman · transe':p.name;
 const turns=p.legado.fortune==='espiral'||p.legado.movement?1:null;
 await addLegadoEffect(actor,{name,kind:'self-'+key,group,sourceUuid:cast.itemUuid,casterUuid:actor.uuid,description:p.description,turns,phase:turns?'start':'end',data:{selfKey,duration:p.duration,mode,concentration:p.duration.includes('Concentração'),movement:p.legado.movement??0,damageBonus:p.legado.damageBonus??0,note:p.useNote||[p.action,'Chakra '+p.cost,'Visão '+p.visionCost].join(' · ')}});
 if(key==='hachiman'&&mode==='ativar')await addLegadoEffect(actor,{kind:'hachiman-speed',group:group+'~speed',condition:'acelerado',sourceUuid:cast.itemUuid,casterUuid:actor.uuid,data:{selfKey:'hachiman'}});
 if(key==='mahikami'&&mode==='sustentar')await addLegadoEffect(actor,{kind:'mahikami-exausto',group,condition:'exausto',sourceUuid:cast.itemUuid,casterUuid:actor.uuid,data:{selfKey:'mahikami',duration:'Enquanto sustentar Mahikami'}});
}
export async function resolveLegadoSave(parent,target,outcome,replyUuid=''){
 const cast=parent.getFlag(ns,'npcJutsuCast'),p=cast?.plan;if(!p?.legado)return;
 const key=p.legado.key,mode=p.legado.mode,caster=await fromUuid(cast.actorUuid),int=caster?.system.attributes?.int??0,esp=caster?.system.attributes?.esp??0,group=parent.id+'~'+target.id;
 const proof=parent.getFlag(ns,'legadoOutcomes')??{},receipt=group+'~'+(replyUuid||outcome);if(proof[receipt])return;
 const common={group,sourceUuid:parent.uuid,casterUuid:caster.uuid,description:p.description};
 if(outcome==='passed'){
  if(key==='tsukuyomi'&&!legadoItems(target).some(i=>['sns:apt:sandan-sharingan','sns:legado:apt:sandan-sharingan'].includes(i.system.ruleId||i.system.contentId)))await addLegadoEffect(target,{...common,kind:'tsukuyomi-success',condition:'fatigado',turns:1,next:true});
  if(key==='mahikami')for(const i of activeLegadoEffects(target).filter(i=>legadoEffect(i).kind==='relativity-stunned'&&legadoEffect(i).group.startsWith(group+'~')))await i.update({'system.appliedCondition.active':false});
 }else if(key==='tsukuyomi'){
  const prior=activeLegadoEffects(target),penalty=Math.floor(int/4),total=penalty+prior.reduce((n,i)=>n+(legadoEffect(i).intPenalty??0),0),coma=prior.some(i=>i.system.contentId==='sns:condition:exausto')||total>=Math.ceil((target.system.attributes.int??Infinity)/2);
  await addLegadoEffect(target,{...common,kind:'tsukuyomi-trauma',condition:'exausto',persistVision:true,data:{intPenalty:penalty,note:'Dano fixo '+int+' no cartão; penalidade de Inteligência −'+penalty+'. Tratamento: Iryou Ninjutsu8 e Medicina conforme a descrição.'}});
  if(coma)await addLegadoEffect(target,{...common,kind:'tsukuyomi-coma',condition:'inconsciente',permanent:true,data:{note:'Coma pelo Tsukuyomi. O tratamento e os intervalos seguem o livro.'}});
  await addLegadoEffect(target,{...common,kind:'tsukuyomi-immunity',name:'Imune a este Tsukuyomi',data:{duration:'Até encerrar a cena',scene:true,immunity:caster.uuid,sceneEpoch:caster.flags?.[ns]?.magenScene??0}});
 }else if(key==='hipnose-sharingan'){
  if(mode==='exaurir'){
   const same=activeLegadoEffects(target).some(i=>legadoEffect(i).kind==='hipnose-exaurir'),other=Array.from(target.items).some(i=>i.system.appliedCondition?.active&&i.system.contentId==='sns:condition:fatigado'&&legadoEffect(i)?.kind!=='hipnose-exaurir');
   const minion=isGeneratedMinion(target);
   if(!same||other)await addLegadoEffect(target,{...common,kind:'hipnose-exaurir',condition:minion?'inconsciente':other?'exausto':'fatigado',data:{duration:'Conforme a condição'}});
  }else await addLegadoEffect(target,{...common,kind:'hipnose-'+mode,name:p.name,condition:mode==='paralisar'?'indefeso-ou-paralisado':'',data:{duration:p.duration,note:mode==='controlar'?'Apenas capangas. O mestre controla as ações.':mode==='bijuu'?'Vínculo de invocação comum; o mestre ajusta a ficha da Bijuu.':mode==='roubar'?'Use a técnica copiada contra o alvo Desprevenido.':'O efeito se aplica conforme a descrição.'}});
 }else if(key==='kotoamatsukami')await addLegadoEffect(target,{...common,kind:'koto-control',name:'Kotoamatsukami · Controle Mental',data:{duration:'Concentração',escape:'attribute:int',dc:legadoSaveDifficulty(cast,target),successes:0,requiredSuccesses:3,note:'Três sucessos libertam o alvo. Sandan preserva a ação padrão; controle apenas de movimento nesse caso.'}});
 if(key==='mahikami'){
  const root=await addLegadoEffect(target,{...common,kind:'mahikami-relativity',name:'Mahikami · Relatividade',data:{duration:'Enquanto permanecer na área',escape:'attribute:vig',dc:7+int,inArea:true,areaCast:parent.uuid,note:'Vigor no início do turno ignora Atordoado neste turno. Sair da área encerra.'}});
  if(outcome!=='passed')await addLegadoEffect(target,{...common,group:group+'~stun',kind:'relativity-stunned',condition:'atordoado',data:{rootUuid:root.uuid}});
 }
 await parent.update({['flags.'+ns+'.legadoOutcomes.'+receipt]:{outcome,targetUuid:target.uuid,replyUuid}});
}
export async function legadoAfterDamage(actor,record){
 const message=record.sourceUuid&&await fromUuid(record.sourceUuid),parentUuid=message?.getFlag?.(ns,'npcCastParent'),parent=parentUuid?await fromUuid(parentUuid):message,cast=parent?.getFlag?.(ns,'npcJutsuCast');
 if(!cast?.plan.legado||record.status!=='applied')return;const p=cast.plan;
 if(p.legado.incendiado&&record.calculation.total>0){
  const active=activeLegadoEffects(actor).find(i=>legadoEffect(i).kind==='incendiado');if(active)return;
  const grade=record.calculation?.effectiveGrade??record.calculation?.grade??record.decision?.grade??1;
  await addLegadoEffect(actor,{name:'Incendiado · '+grade,kind:'incendiado',group:record.id,sourceUuid:parent.uuid,casterUuid:cast.actorUuid,description:p.description,data:{level:grade,initialLevel:grade,damageRecord:record.id,note:'Dano fixo igual ao nível no início do turno. Aumenta1no fim do turno, sem teto. Ignore dureza exceto Jinchuuriki.'}});
 }
}
export function validateLegadoUndo(actor,record){for(const item of activeLegadoEffects(actor).filter(i=>legadoEffect(i).damageRecord===record.id)){const d=legadoEffect(item);if(d.level!==d.initialLevel)throw Error('O efeito já avançou. Confira sua remoção com o mestre.');}}
export async function legadoAfterUndo(actor,record){if(record.virtualArmor&&record.susanooBefore?.active){const effect=Array.from(actor.items).find(i=>legadoEffect(i)?.selfKey==='susanoo');if(effect&&!effect.system.appliedCondition.active)await effect.update({'system.appliedCondition.active':true});}for(const item of activeLegadoEffects(actor).filter(i=>legadoEffect(i).damageRecord===record.id)){const data=legadoEffect(item);await item.update({'system.appliedCondition.active':false});}}
