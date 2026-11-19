import {touches} from './message-index.mjs';
import {kuchiyoseLink,speciesFor,KUCHIYOSE_SPECIES,summonPower,summonLimit,suggestSummonAttributes,summonProjection,generatedSummonMatches,generatedSummonEntries,sameSummonData,summonOwnership} from './kuchiyose-core.mjs';
import {powerSources,summonPact,originGrant} from './restricted-access.mjs';
import {PACKAGE_ORIGINS} from '../data/package-content.mjs';
import {partySummoners} from './party-core.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {canControlTransformation} from './transformation-core.mjs';
import {loadCanonicalLibrary,canonicalCopy} from './canonical-content.mjs';
import {escapeHtml as esc} from './kernel.mjs';
import {SKILLS} from './rules.mjs';
const ns='sns-v14-dev',pending=new Set();
const get=(o,path)=>path.split('.').reduce((v,k)=>v?.[k],o);
export async function requestCompanion(actor,action,selection={}){
 if(actor?.type!=='companion'||!actor.isOwner||!canControlTransformation(actor))throw Error('Use uma ficha de invocação que você controla.');
 const key=actor.uuid;if(pending.has(key))return null;pending.add(key);
 try{const m=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),whisper:[...new Set([game.user.id,...game.users.filter(u=>u.isGM).map(u=>u.id)])],content:'<p>'+esc(game.users.activeGM?'Atualizando vínculo da invocação…':'O vínculo será atualizado quando o mestre estiver conectado.')+'</p>',flags:{[ns]:{companionRequest:{...selection,version:1,action,actorUuid:actor.uuid}}}});if(isTimekeeper())await processCompanionRequest(m);return m;}finally{pending.delete(key);}
}
function ownershipPatch(actor,master,link){
 const ids=master?game.users.filter(u=>!u.isGM&&master.testUserPermission(u,'OWNER')).map(u=>u.id):[],result=summonOwnership(actor.ownership,ids,link?.ownership);
 return {...result,update:result.ownership};
}
async function generatedItems(actor,projection){
 const def=projection.species,existing=actor.items.find(i=>i.flags?.[ns]?.kuchiyoseGenerated?.key==='species');
 let feature=existing;
 if(!feature){[feature]=await actor.createEmbeddedDocuments('Item',[{name:def.name,type:'feature',system:{contentId:def.id,category:'features',description:def.description,source:def.source},flags:{[ns]:{kuchiyoseGenerated:{key:'species'}}}}]);}
 for(const [index,name]of def.naturalAttacks.entries()){
  const key='attack:'+index,item=actor.items.find(i=>i.flags?.[ns]?.kuchiyoseGenerated?.key===key),patch={'system.details.precision':projection.stats.cc,'system.details.damage':String(projection.damage)};
  if(item){if(item.system.details.precision!==projection.stats.cc||String(item.system.details.damage)!==String(projection.damage))await item.update(patch);}
  else await actor.createEmbeddedDocuments('Item',[{name,type:'attack',system:{category:'attacks',description:'<p>Ataque corporal da espécie. Dano: Força −3 (mínimo3); abaixo de NC4, dano0. Ajustes de tamanho contra o alvo e Comandar Parceiro seguem as regras do livro.</p>',details:{precision:projection.stats.cc,damage:String(projection.damage)},source:def.source},flags:{[ns]:{kuchiyoseGenerated:{key}}}}]);
 }
 if(def.grantedAptitudes.length){const library=await loadCanonicalLibrary();for(const id of def.grantedAptitudes)if(!actor.items.some(i=>i.system.contentId===id)){const data=canonicalCopy(library.entries.find(e=>e.id===id));data.flags[ns].acquisition={mode:'granted',sourceId:feature.id,reason:'Concessão publicada da espécie '+def.name,authorizedBy:game.user.id};data.flags[ns].kuchiyoseGenerated={key:'grant:'+id};await actor.createEmbeddedDocuments('Item',[data]);}}
}
async function writeBuild(actor,master,build,{author=game.user.id,automatic=false}={}){
 const before=actor.toObject(),old=kuchiyoseLink(actor),projection=summonProjection(master,build,actor.items),generated={
  'system.nc':projection.nc,'system.attributes':projection.attributes,'system.stats':projection.stats,'system.statsOriginal':projection.statsOriginal,'system.recordedSkills':projection.skills,'system.recordedSkillsConfigured':true,
  'system.skillLevels':projection.skillLevels,
  'system.resources.vitality.max':projection.vitalityMax,'system.resources.chakra.baseMax':projection.chakraMax,'system.details.master':master.uuid,'system.details.size':build.size};
 if(automatic&&old?.generated&&!generatedSummonMatches(old.generated,before)){await actor.update({['flags.'+ns+'.kuchiyose.problem']:'Há valores personalizados na ficha. Revise a construção antes de recalcular.'});return;}
 const entries=generatedSummonEntries(generated),owners=ownershipPatch(actor,master,old),link={version:1,revision:(old?.revision??0)+1,mode:'calculated',masterUuid:master.uuid,species:build.species,build:structuredClone(build),limit:projection.limit,generated:entries,ownership:owners.record,problem:'',updatedBy:author,updatedAt:new Date().toISOString()};
 if(automatic&&sameSummonData(entries,generatedSummonEntries(old?.generated))&&sameSummonData(projection.limit,old?.limit)&&sameSummonData(owners.ownership,actor.ownership)&&!old?.problem)return;
 const history=[...(actor.getFlag(ns,'kuchiyoseHistory')??[]),{at:link.updatedAt,user:author,automatic,before:{link:old??null,system:before.system,ownership:before.ownership}}];
 await actor.update({...generated,'prototypeToken.actorLink':true,ownership:owners.update,...(actor.system.resources.vitality.value===null?{'system.resources.vitality.value':projection.vitalityMax}:{}),...(actor.system.resources.chakra.value===null?{'system.resources.chakra.value':projection.chakraMax}:{}),['flags.'+ns+'.kuchiyose']:link,['flags.'+ns+'.kuchiyoseHistory']:history});
 await generatedItems(actor,projection);return projection;
}
async function ensureMasterKuchiyose(master,species,grant,user){
 if(!user?.isGM||!grant||species==='desenhos')return;
 const originEntry=Object.entries(PACKAGE_ORIGINS).find(([,p])=>p.species===species);
 let pactItem=null;
 if(originEntry){
  const [originKey,originDef]=originEntry;
  const existingPact=Array.from(master.items??[]).find(i=>originGrant(i)===originKey||i.system?.contentId===originDef.contentId);
  if(existingPact){
   pactItem=existingPact;
   if(!summonPact(master,species).met||existingPact.system?.details?.accessRule!==originKey||!existingPact.flags?.[ns]?.kuchiyoseExtraPact){
    await existingPact.update({'system.details.accessRule':originKey,['flags.'+ns+'.kuchiyoseExtraPact']:true});
   }
  }else if(!summonPact(master,species).met){
   const [createdPact]=await master.createEmbeddedDocuments('Item',[{name:originDef.name,type:'feature',system:{contentId:originDef.contentId,category:'features',details:{accessRule:originKey}},flags:{[ns]:{kuchiyoseExtraPact:true,originAuthorization:{rule:originKey,user:user.id,at:new Date().toISOString()}}}}]);
   pactItem=createdPact??null;
  }else{
   pactItem=Array.from(master.items??[]).find(i=>originGrant(i)===originKey)||null;
  }
 }
 if(!pactItem&&species){
  pactItem=Array.from(master.items??[]).find(i=>PACKAGE_ORIGINS[originGrant(i)]?.species===species)||null;
 }
 const level=Math.max(1,Math.min(10,Number(grant.level)||1));
 const powerOrigin=grant.powerOrigin==='common'?'common':'restricted';
 const candidates=powerSources(master,'sns:power:kuchiyose');
 const targetPower=candidates.find(p=>p.system.choice?.key===species)||candidates.find(p=>!p.system.choice?.key);
 const now=new Date().toISOString();
 const acq=pactItem?.id
  ?{mode:'granted',sourceId:pactItem.id,reason:'Concessão extra do mestre no vínculo de invocação',authorizedBy:user.id,user:user.id,at:now}
  :{mode:'manual',cost:0,reason:'Concessão extra do mestre no vínculo de invocação',authorizedBy:user.id,user:user.id,at:now};
 const existingAcq=targetPower?.flags?.[ns]?.acquisition;
 const keepExisting=existingAcq
  ?(existingAcq.mode!=='granted'||(existingAcq.sourceId&&Array.from(master.items??[]).some(i=>i.id===existingAcq.sourceId)))
  :(targetPower?.system?.level>0);
 if(targetPower){
  await targetPower.update({'system.contentId':'sns:power:kuchiyose','system.level':Math.max(level,targetPower.system.level||0),'system.choice':{kind:'summonSpecies',key:species},'system.details.powerOrigin':powerOrigin,...(keepExisting?{}:{['flags.'+ns+'.acquisition']:acq})});
 }else{
  const library=await loadCanonicalLibrary(),entry=library?.entries.find(e=>e.id==='sns:power:kuchiyose');
  let created;
  if(entry){
   const data=canonicalCopy(entry,'',species);
   data.system.level=level;data.system.details.powerOrigin=powerOrigin;data.flags[ns].acquisition=acq;
   created=await master.createEmbeddedDocuments('Item',[data]);
  }else{
   created=await master.createEmbeddedDocuments('Item',[{name:'Kuchiyose (Invocação)',type:'power',system:{contentId:'sns:power:kuchiyose',category:'powers',level,choice:{kind:'summonSpecies',key:species},details:{powerOrigin,organization:'summon'}},flags:{[ns]:{acquisition:acq}}}]);
  }
  if(!created?.length)throw Error('Não foi possível registrar Kuchiyose (Invocação) na ficha do invocador.');
 }
}
async function syncMasterKuchiyoseOrigin(master,species,powerOrigin,user){
 if(!user?.isGM||!['common','restricted'].includes(powerOrigin)||species==='desenhos')return;
 const power=summonPower(master,species);
 const current=power.system.details?.powerOrigin;
 const desired=powerOrigin==='common'?'common':(['restricted','hijutsu','clan'].includes(current)&&current!=='common'?current:'restricted');
 if(current!==desired)await power.update({'system.details.powerOrigin':desired});
}
export async function processCompanionRequest(message){
 const r=message.getFlag(ns,'companionRequest');if(!r||message.getFlag(ns,'companionResult')||!isTimekeeper())return;
 return withEffectLock(message,async()=>{if(message.getFlag(ns,'companionResult'))return;try{
  const actor=await fromUuid(r.actorUuid),user=message.author;if(r.version!==1||actor?.type!=='companion'||actor.pack||actor.isToken||!game.actors.has(actor.id)||!actor.testUserPermission(user,'OWNER')||!canControlTransformation(actor,user))throw Error('Pedido sem permissão para esta invocação.');
  await withEffectLock(actor,async()=>{
   const old=kuchiyoseLink(actor);if((old?.revision??0)!==r.revision)throw Error('O invocador mudou. Abra a construção novamente.');
   if(r.action==='unlink'){
    const owners=ownershipPatch(actor,null,old);await actor.update({'system.details.master':'',ownership:owners.update,['flags.'+ns+'.kuchiyose']:{...old,revision:(old?.revision??0)+1,mode:'detached',masterUuid:'',ownership:[],problem:'Sem invocador vinculado.'}});
   }else{
    const master=await fromUuid(r.masterUuid);if(!master||master.pack||master.isToken||!game.actors.has(master.id)||!['shinobi','npc'].includes(master.type)||!master.testUserPermission(user,'OWNER'))throw Error('Escolha um invocador que você controla.');
    if(!user.isGM&&old?.masterUuid!==master.uuid&&!partySummoners(game.actors,game.actors,user).some(a=>a.uuid===master.uuid))throw Error('Adicione o invocador à equipe antes de vincular esta ficha.');
    const species=speciesFor(actor)?.species||r.species;if(!KUCHIYOSE_SPECIES[species])throw Error('Escolha uma espécie publicada.');
    if(r.action==='bind'){
     if(r.grantPower&&user.isGM)await ensureMasterKuchiyose(master,species,r.grantPower,user);
     const power=summonPower(master,species),empty=Object.values(actor.system.attributes).every(v=>v===null)&&['cc','cd','esq','lm'].every(k=>actor.system.stats[k]===null);
     if(!empty&&!old){const owners=ownershipPatch(actor,master,null);await actor.update({'system.details.master':master.uuid,ownership:owners.ownership,['flags.'+ns+'.kuchiyose']:{version:1,revision:1,mode:'legacy',masterUuid:master.uuid,species,ownership:owners.record,problem:'Ficha existente: aplique uma construção para calcular os atributos.'}});}
     else{const build=old?.build??{species,usedLevel:power.system.level,count:1,nc:Math.min(20,2*power.system.level),size:KUCHIYOSE_SPECIES[species].fixedSize||'Médio',attributes:suggestSummonAttributes(Math.min(20,2*power.system.level),species),bases:{cc:3,cd:3,esq:3,lm:3}};await writeBuild(actor,master,build,{author:user.id});}
    }else if(r.action==='origin'){
     if(!user.isGM||!['common','restricted'].includes(r.powerOrigin))throw Error('Somente o mestre pode alterar a fonte do Kuchiyose.');
     await syncMasterKuchiyoseOrigin(master,species,r.powerOrigin,user);
     const power=summonPower(master,species);
     if(old?.mode==='calculated'&&old?.build){
      await writeBuild(actor,master,{...old.build,powerOrigin:r.powerOrigin},{author:user.id});
     }else{
      await actor.update({['flags.'+ns+'.kuchiyose']:{...(old??{version:1,mode:'legacy'}),revision:(old?.revision??0)+1,masterUuid:master.uuid,species}});
     }
    }else if(r.action==='build'){
     if(r.confirmed!==true)throw Error('Revise a distribuição e aplique a construção.');
     if(user.isGM&&['common','restricted'].includes(r.build?.powerOrigin))await syncMasterKuchiyoseOrigin(master,species,r.build.powerOrigin,user);
     const build={species,usedLevel:r.build?.usedLevel,count:r.build?.count,nc:r.build?.nc,size:r.build?.size,attributes:r.build?.attributes,bases:r.build?.bases};await writeBuild(actor,master,build,{author:user.id});
    }else throw Error('Ação de vínculo inválida.');
   }
   await message.update({content:'<section class="sns-craft-card"><h3>'+esc(actor.name)+'</h3><p>Vínculo atualizado. '+esc(kuchiyoseLink(actor)?.problem||'A criatura age no turno do invocador.')+'</p><p></p></section>',['flags.'+ns+'.companionResult']:{status:'done',actorUuid:actor.uuid,revision:kuchiyoseLink(actor)?.revision}});
  });
 }catch(error){await message.update({content:'<section class="sns-craft-card"><h3>Invocação indisponível</h3><p>'+esc(error.message)+'</p></section>',['flags.'+ns+'.companionResult']:{status:'blocked',reason:error.message}});}});
}
export async function reconcileSummons(master){
 if(!isTimekeeper()||!master)return;
 for(const actor of game.actors.filter(a=>a.type==='companion'&&kuchiyoseLink(a)?.masterUuid===master.uuid&&kuchiyoseLink(a)?.mode==='calculated'))await withEffectLock(actor,async()=>{const link=kuchiyoseLink(actor);try{await writeBuild(actor,master,link.build,{automatic:true});}catch(error){if(link.problem!==error.message)await actor.update({['flags.'+ns+'.kuchiyose.problem']:error.message});}});
}
export async function applyGeneratedSummon(actor,master,build){
 if(!game.user.isGM||!actor.isOwner||!master.isOwner||actor.type!=='companion'||master.type!=='npc'||!master.flags?.[ns]?.npcGenerator)throw Error('Construção disponível para o mestre e seus NPCs gerados.');
 return writeBuild(actor,master,build);
}
export function installKuchiyoseHooks(){
 Hooks.on('createChatMessage',m=>{void processCompanionRequest(m).catch(console.error);});
 Hooks.on('snsProcessorReady',async()=>{for(const m of game.messages.contents.filter(m=>m.getFlag(ns,'companionRequest')&&!m.getFlag(ns,'companionResult')))await processCompanionRequest(m);for(const master of game.actors.filter(a=>['shinobi','npc'].includes(a.type)))await reconcileSummons(master);});
 Hooks.on('preCreateChatMessage',(m,data,options,userId)=>{if(!game.users.get(userId)?.isGM&&m.getFlag(ns,'companionResult'))return false;});
 Hooks.on('preUpdateChatMessage',(m,changes,options,userId)=>{if(!game.users.get(userId)?.isGM&&m.getFlag(ns,'companionRequest'))return false;});
 Hooks.on('updateActor',(a,changes)=>{if(!touches(changes,['system.nc','system.attributes','flags.sns-v14-dev.prerequisiteEvents','flags.sns-v14-dev.kuchiyose']))return;if(['shinobi','npc'].includes(a.type))void reconcileSummons(a).catch(console.error);});
 Hooks.on('deleteActor',async a=>{if(!isTimekeeper())return;for(const child of game.actors.filter(c=>kuchiyoseLink(c)?.masterUuid===a.uuid))await child.update({['flags.'+ns+'.kuchiyose.problem']:'Invocador indisponível. Selecione outro na ficha.'});});
 for(const h of ['createItem','updateItem','deleteItem'])Hooks.on(h,i=>{if(i.actor&&['shinobi','npc'].includes(i.actor.type))void reconcileSummons(i.actor).catch(console.error);else if(i.actor&&kuchiyoseLink(i.actor)?.mode==='calculated'&&!i.getFlag(ns,'kuchiyoseGenerated')){const master=game.actors.get(kuchiyoseLink(i.actor).masterUuid.slice(6));if(master)void reconcileSummons(master).catch(console.error);}});
}
