import {craftProfile,craftJobs,validateCraftProfile,craftPlan,craftQuality,craftCompletion,craftProductData} from './crafting-core.mjs';
import {isCraftFormula,poisonProducer,resolvePoisonMode} from './poison-crafting.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {checkComponents,resolveCheck} from './roll-components.mjs';
import {versusDifficulty} from './jutsu-outcomes.mjs';
import {contentSha256,loadCanonicalLibrary,canonicalCopy} from './canonical-content.mjs';
import {canControlTransformation} from './transformation-core.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev',pending=new Set();
const copy=value=>structuredClone(value);
export const profileStamp=profile=>JSON.stringify(validateCraftProfile(profile));
const jobKey=id=>{if(typeof id!=='string'||!/^[A-Za-z0-9]{16}$/.test(id))throw Error('Preparo inválido.');return id;};
const putJob=(actor,job)=>{if(!isTimekeeper())throw Error('O mestre ativo mudou. Retome este mesmo preparo.');return actor.update({['flags.'+ns+'.craftJobs.'+job.id]:job});};
const fingerprint=item=>contentSha256(JSON.stringify(item.toObject()));

function formulaFor(actor,id){const f=actor.items.get(id);if(!isCraftFormula(f))throw Error('A fórmula não está mais nesta ficha.');return f;}
function checkRequirements(actor,formula,job=null){const r=requirementsFor(formula,actor);if(r.configured&&!r.valid)throw Error(r.problems.join(' '));if(craftProfile(formula)?.kind==='poison'){const p=poisonProducer(actor,job?.profile??craftProfile(formula));if(job?.producer&&JSON.stringify(p)!==JSON.stringify(job.producer))throw Error('Os valores do produtor mudaram. Interrompa este preparo antes de iniciar outro.');}}
function latestProfile(formula){return validateCraftProfile(craftProfile(formula));}
function sameProfile(formula,job){if(profileStamp(latestProfile(formula))!==(job.sourceStamp??profileStamp(job.profile)))throw Error('O mestre alterou esta fórmula. Interrompa o preparo anterior antes de iniciar outro.');}

export async function requestCraft(actor,action,selection={}){
 if(actor?.type!=='shinobi'||!actor.isOwner||!canControlTransformation(actor))throw Error('Use uma ficha de personagem que você controla.');
 const key=actor.uuid+':'+action+':'+(selection.jobId??selection.formulaId??'');if(pending.has(key))return null;
 pending.add(key);
 try{
  const message=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),whisper:[...new Set([game.user.id,...game.users.filter(u=>u.isGM).map(u=>u.id)])],content:'<section class="sns-craft-card"><h3>Produção</h3><p>'+esc(game.users.activeGM?'Processando preparo…':'O preparo será processado quando o mestre estiver conectado.')+'</p></section>',flags:{[ns]:{craftRequest:{...selection,version:1,actorUuid:actor.uuid,action}}}});
  if(isTimekeeper())await processCraftRequest(message);
  return message;
 }finally{pending.delete(key);}
}

async function start(actor,r,message){
 const prior=craftJobs(actor)[message.id];if(prior)return prior;
 const formula=formulaFor(actor,r.formulaId),original=latestProfile(formula),profile=validateCraftProfile(resolvePoisonMode(original,r.poisonMode));checkRequirements(actor,formula);
 if(r.stamp!==profileStamp(original))throw Error('A fórmula mudou. Abra o preparo novamente.');
 if(profile.kind==='poison'&&profile.poison.mode==='ideal'&&r.idealConfirmed!==true)throw Error('O preparo ideal exige laboratório, materiais e tempo disponível.');
 if(Object.values(craftJobs(actor)).some(j=>j.formulaId===formula.id&&['working','committing','undoing'].includes(j.state)))throw Error('Conclua ou interrompa o preparo em andamento desta fórmula.');
 craftPlan(actor,profile,r.batches);
 let reference=null;
 if(profile.output.kind==='reference'){
  if(profile.output.uuid.startsWith('canonical:')){const entry=(await loadCanonicalLibrary())?.entries.find(e=>e.id===profile.output.uuid.slice(10));if(entry)reference=canonicalCopy(entry);}
  else reference=await fromUuid(profile.output.uuid);
 }
 const producer=profile.kind==='poison'?poisonProducer(actor,profile):null;
 const snapshot={id:formula.id,name:formula.name,img:formula.img,system:{description:formula.system.description,source:copy(formula.system.source)}};
 // Validate the output now. The source snapshot remains stable for this job.
 craftProductData(snapshot,{id:message.id,profile,producer,processedBy:game.user.id},{quantity:1,quality:{key:'success',label:'Sucesso'},benefit:''},reference);
 const job={id:message.id,formulaId:formula.id,name:formula.name,profile,sourceStamp:profileStamp(original),producer,processedBy:game.user.id,batches:r.batches,state:'working',steps:[],createdBy:message.author.id,startedAt:new Date().toISOString(),worldTime:game.time.worldTime,formulaSnapshot:snapshot,referenceSnapshot:reference?(typeof reference.toObject==='function'?reference.toObject():copy(reference)):null};
 await putJob(actor,job);return job;
}

async function rollStep(actor,job,r,message){
 if(!Number.isInteger(r.step)||r.step<0||r.step>=job.profile.steps.length)throw Error('Etapa inválida.');
 if(job.steps[r.step])return job;
 if(job.state!=='working'||r.step!==job.steps.length)throw Error('Role a próxima etapa do preparo em andamento.');
 const formula=formulaFor(actor,job.formulaId);sameProfile(formula,job);checkRequirements(actor,formula,job);
 const stage=job.profile.steps[r.step],effects=characteristicEffects(actor),source=actor.system.toObject();
 const spec=resolveCheck(source,stage.key,checkComponents(source,stage.key,effects),effects);
 const simulated=job.profile.kind==='poison'&&job.profile.poison.mode==='ideal';
 const roll=await new foundry.dice.Roll(simulated?'16 + '+(spec.precision+spec.adjustment):spec.formula).evaluate(),natural=simulated?16:roll.dice[0].results.filter(d=>d.active!==false).reduce((sum,d)=>sum+d.result,0);
 const result=simulated?(roll.total>=stage.dc?'passed':'failed'):versusDifficulty({natural,total:roll.total,precision:spec.precision+spec.adjustment},stage.dc);
 if(result==='pending')throw Error('O resultado da rolagem está incompleto.');
 job.steps.push({requestId:message.id,label:stage.label,key:stage.key,dc:stage.dc,formula:simulated?roll.formula:spec.formula,precision:spec.precision+spec.adjustment,natural,total:roll.total,result,real:!simulated,roll:roll.toJSON(),at:new Date().toISOString(),requestedBy:message.author.id,rolledBy:game.user.id});
 await putJob(actor,job);return job;
}

async function prepareCommit(actor,job,r,message,{interrupted=false}={}){
 if(job.commit)return job;
 if(job.state!=='working')return job;
 if(interrupted&&!job.steps.length){job.state='cancelled';job.endedAt=new Date().toISOString();await putJob(actor,job);return job;}
 if(!interrupted){const formula=formulaFor(actor,job.formulaId);sameProfile(formula,job);checkRequirements(actor,formula,job);const minutes=job.profile.minutes*(job.profile.kind==='poison'?1:job.batches);if(r.timeConfirmed!==true&&game.time.worldTime<job.worldTime+minutes*60)throw Error('Marque o tempo de preparo como concluído.');}
 const commit=craftCompletion(actor,job,{interrupted,benefit:r.benefit??''});
 const product=commit.quantity?craftProductData(job.formulaSnapshot,job,commit,job.referenceSnapshot):null;
 if(product){product._id=foundry.utils.randomID();product.system.description=foundry.utils.cleanHTML(product.system.description);}
 job.commit={...commit,product,productId:product?product._id:'',moneyPaid:false,moneyRefunded:false,requestedBy:message.author.id,at:new Date().toISOString(),timeConfirmed:r.timeConfirmed===true};job.state='committing';
 await putJob(actor,job);return job;
}

// Each debit carries its receipt in the same Item update. Currency and its
// receipt share one Actor update. Recovery resumes these receipts, never guessing
// from a quantity that another player might coincidentally have changed.
export async function resumeCraftCommit(actor,job){
 if(!isTimekeeper())throw Error('O mestre ativo processa a fabricação.');
 if(job.state!=='committing')return job;
 for(const row of job.commit.inputs){
  if(!isTimekeeper())throw Error('O mestre ativo mudou. Retome este mesmo preparo.');
  const item=actor.items.get(row.id);if(!item)throw Error('Material removido durante o preparo: '+row.name+'.');
  const paid=item.getFlag(ns,'craftDebits')?.[job.id];
  if(paid){if(paid.refunded||paid.before!==row.before||paid.after!==row.after)throw Error('O registro de materiais mudou; confira o histórico.');continue;}
  if(item.system.quantity!==row.before)throw Error('A quantidade de '+row.name+' mudou. Peça ao mestre para revisar o preparo.');
  await item.update({'system.quantity':row.after,['flags.'+ns+'.craftDebits.'+job.id]:{before:row.before,after:row.after,refunded:false}});
 }
 if(!job.commit.moneyPaid){
  if(actor.system.finances.ryo!==job.commit.money.before)throw Error('O saldo mudou durante a conclusão; confira antes de retomar.');
  job.commit.moneyPaid=true;
  await actor.update({...((job.commit.cost>0)?{'system.finances.ryo':job.commit.money.after}:{}),['flags.'+ns+'.craftJobs.'+job.id]:job});
 }
 if(job.commit.productId){
  let item=actor.items.get(job.commit.productId);
  if(!item){[item]=await actor.createEmbeddedDocuments('Item',[job.commit.product],{keepId:true});if(!item)throw Error('O produto não foi criado. Retome este mesmo preparo pelo histórico.');}
  if(item.getFlag(ns,'craftProduct')?.jobId!==job.id)throw Error('A identidade do produto está ocupada por outro registro.');
  if(!job.commit.productHash){
   if(item.system.quantity!==job.commit.quantity||item.system.equipped)throw Error('O produto já foi usado. Peça ao mestre para revisar o preparo.');
   job.commit.productHash=await fingerprint(item);await putJob(actor,job);
  }
 }
 job.state=job.commit.quality.produces?'done':job.commit.quality.key==='interrupted'?'interrupted':'failed';job.endedAt=new Date().toISOString();await putJob(actor,job);return job;
}

async function undo(actor,job){
 if(job.state==='undone')return job;
 if(!job.commit||!['done','failed','interrupted','committing','undoing'].includes(job.state))throw Error('Este preparo não tem movimentações para desfazer.');
 if(job.state!=='undoing'){
  for(const row of job.commit.inputs){const item=actor.items.get(row.id),debit=item?.getFlag(ns,'craftDebits')?.[job.id];if(!item||debit&&(item.system.quantity!==row.after||debit.refunded))throw Error('Os materiais já foram alterados; não é seguro desfazer automaticamente.');}
  if(job.commit.moneyPaid&&actor.system.finances.ryo!==job.commit.money.after)throw Error('O saldo já foi alterado; confira a devolução manualmente.');
  const product=job.commit.productId?actor.items.get(job.commit.productId):null;
  if(job.commit.productId&&(!product||!job.commit.productHash||await fingerprint(product)!==job.commit.productHash))throw Error('O produto já foi alterado ou usado; não é seguro desfazer automaticamente.');
  job.state='undoing';await putJob(actor,job);
 }
 for(const row of job.commit.inputs){const item=actor.items.get(row.id),debit=item?.getFlag(ns,'craftDebits')?.[job.id];if(!debit||debit.refunded)continue;if(item.system.quantity!==row.after)throw Error('O estoque mudou durante a devolução.');await item.update({'system.quantity':row.before,['flags.'+ns+'.craftDebits.'+job.id]:{...debit,refunded:true}});}
 if(job.commit.moneyPaid&&!job.commit.moneyRefunded){if(actor.system.finances.ryo!==job.commit.money.after)throw Error('O saldo mudou durante a devolução.');job.commit.moneyRefunded=true;await actor.update({...((job.commit.cost>0)?{'system.finances.ryo':job.commit.money.before}:{}),['flags.'+ns+'.craftJobs.'+job.id]:job});}
 if(job.commit.productId){const product=actor.items.get(job.commit.productId);if(!product)throw Error('O produto não foi encontrado para arquivar.');if(!product.getFlag(ns,'craftProduct').undone)await product.update({'system.quantity':0,['flags.'+ns+'.craftProduct.undone']:true});}
 job.state='undone';job.undoneAt=new Date().toISOString();job.undoneBy=game.user.id;await putJob(actor,job);return job;
}

const stateLabels={working:'Em preparo',committing:'Concluir registro',done:'Concluído',failed:'Falha',cancelled:'Cancelado',interrupted:'Interrompido',undoing:'Devolução em andamento',undone:'Desfeito'};
export function craftCard(actor,job){
 const quality=job.commit?.quality??craftQuality(job.profile,job.steps),rows=job.steps.map(s=>'<li>'+esc(s.label)+' · Dif '+s.dc+' · <strong>'+esc(s.result==='passed'?'Sucesso':'Falha')+'</strong> ('+s.total+')</li>').join('');
 return '<section class="sns-craft-card" data-craft-actor="'+esc(actor.uuid)+'" data-craft-job="'+job.id+'"><header><i class="fa-solid fa-hammer" aria-hidden="true"></i><div><h3>'+esc(job.name)+'</h3><small>'+esc(stateLabels[job.state])+'</small></div></header><p>'+job.batches+(job.profile.kind==='poison'?' dose(s)':' preparo(s)')+' · '+job.profile.minutes*(job.profile.kind==='poison'?1:job.batches)+' min · '+job.profile.cost*job.batches+' Ryo</p>'+(rows?'<ol>'+rows+'</ol>':'')+'<p>'+esc(quality.label)+(job.commit?.quantity?' · '+job.commit.quantity+' unidade(s) produzida(s)':'')+'</p><button type="button" data-craft-open="'+esc(actor.uuid)+'" data-craft-formula="'+job.formulaId+'">Ver preparo</button></section>';
}

export async function processCraftRequest(message){
 const r=message.getFlag(ns,'craftRequest');if(!r||message.getFlag(ns,'craftResult')||!isTimekeeper())return;
 return withEffectLock(message,async()=>{
  if(message.getFlag(ns,'craftResult'))return;
  let actor;
  try{
   actor=await fromUuid(r.actorUuid);if(r.version!==1||actor?.type!=='shinobi'||!actor.testUserPermission(message.author,'OWNER')||!canControlTransformation(actor,message.author))throw Error('Pedido sem permissão para esta ficha.');
   await withEffectLock(actor,async()=>{
    let job=r.action==='start'?await start(actor,r,message):copy(craftJobs(actor)[jobKey(r.jobId)]);
    if(!job)throw Error('Preparo não encontrado.');
    if(!message.author.isGM&&job.createdBy!==message.author.id)throw Error('Este preparo foi iniciado por outro jogador.');
    if(r.action==='roll')job=await rollStep(actor,job,r,message);
    else if(['finish','cancel'].includes(r.action)){job=await prepareCommit(actor,job,r,message,{interrupted:r.action==='cancel'});job=await resumeCraftCommit(actor,job);}
    else if(r.action==='undo'){if(!message.author.isGM)throw Error('O mestre desfaz movimentações de fabricação.');job=await undo(actor,job);}
    else if(r.action!=='start')throw Error('Ação de preparo inválida.');
    const step=job.steps.find(s=>s.requestId===message.id);
    // Foundry preserves custom message HTML instead of automatically rendering
    // its rolls. Include the native dice markup so the verdict appears above it.
    const roll=step?foundry.dice.Roll.fromData(step.roll):null;
    await message.update({content:craftCard(actor,job)+(roll?await roll.render():''),...(step?{rolls:[roll],['flags.'+ns+'.testOutcome']:{dc:step.dc,result:step.result,critical:step.real!==false}}:{}),['flags.'+ns+'.craftResult']:{jobId:job.id,state:job.state,at:new Date().toISOString()}});
   });
  }catch(error){await message.update({content:'<section class="sns-craft-card"><h3>Preparo indisponível</h3><p>'+esc(error.message)+'</p></section>',['flags.'+ns+'.craftResult']:{status:'blocked',reason:error.message}});}
 });
}

export function installCraftHooks(){
 Hooks.on('createChatMessage',m=>{void processCraftRequest(m).catch(console.error);});
 Hooks.on('snsProcessorReady',async()=>{for(const m of game.messages.contents.filter(m=>m.getFlag(ns,'craftRequest')&&!m.getFlag(ns,'craftResult')))await processCraftRequest(m);});
 Hooks.on('preCreateChatMessage',(m,data,options,userId)=>{if(game.users.get(userId)?.isGM)return;if(m.getFlag(ns,'craftResult'))return false;});
 Hooks.on('preUpdateChatMessage',(m,changes,options,userId)=>{if(game.users.get(userId)?.isGM)return;if(m.getFlag(ns,'craftRequest'))return false;});
}
