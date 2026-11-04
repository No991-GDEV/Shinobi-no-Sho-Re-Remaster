import {weaponCheckComponents} from './weapon-checks.mjs';
import {rollWithLegado} from './legado-fortune.mjs';
import {checkComponents} from './roll-components.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import {isLegado} from './legado-core.mjs';
import {legadoPayment} from './legado-payment.mjs';
import {legadoPlan} from './legado-plan.mjs';
import {legadoSaveDifficulty,legadoMayReroll,resolveLegadoSave} from './legado-effects.mjs';
import {isProcessor} from './processor-authority.mjs';
import {npcSaveDifficulty} from './npc-repertoire-core.mjs';
import {minionTestPolicy} from './npc-minion-policy.mjs';
import {withEffectLock} from './effect-lifecycle.mjs';
import {illusionActionBlock} from './magen-core.mjs';
import {techniqueRestriction} from './transformation-core.mjs';
import {npcJutsuPlan,templateSpec} from './npc-jutsu-core.mjs';
import {loadCanonicalLibrary} from './canonical-content.mjs';
import {jutsuProjection} from './item-view.mjs';
import {techniqueCard} from './technique-card.mjs';
import {chooseNpcCast} from './npc-cast-dialog.mjs';
import {damageSnapshot,damageTargets,jutsuDamageProfile} from './damage-source.mjs';
import {prepareProjectilePacket} from './projectile-allocation.mjs';
import {resolveSpecialResource,specialResourceChange} from './special-resources.mjs';
import {transplantSources} from './characteristic-effects.mjs';
import {effectiveRuleItem} from './jutsu-rule-text.mjs';
import {SnsCheckDialog} from './check-dialog.mjs';
import {checkFlavor} from './chat-card.mjs';
import {npcChakraPayment} from './npc-chakra-payment.mjs';
import {npcExtraResources} from './npc-cast-resources.mjs';
import {PUPPET_DEVICES} from '../data/npc-puppet-devices.mjs';
import {useSnapshot,rolledCheck,versusDifficulty,validRoll,RESISTANCE_KEYS} from './jutsu-outcomes.mjs';
const ns='sns-v14-dev',busy=new Set(),saveBusy=new Set();
const owns=a=>a?.isOwner||game.user.isGM;
const flag=m=>m.getFlag(ns,'npcJutsuCast');
const msgClass=()=>foundry.documents.ChatMessage;
function npcUseSnapshot(actor,item,projection,targets){
 if(!projection?.valid)return null;
 const self=[...(projection.autoBindings??[]),...(item.system.targetEffects??[])].some(b=>b.recipient==='self');
 return targets.length||self?useSnapshot(actor,item,projection,targets,{allowUntargeted:true}):null;
}

export async function writableNpc(actor,item){
 if(!actor.compendium)return {actor,item};
 if(!game.user.isGM)throw Error('Somente o mestre pode trazer este NPC para a mesa.');
 let copy=Array.from(game.actors).find(a=>a.getFlag(ns,'npcEncounterSource')===actor.uuid);
 if(!copy){const pack=actor.compendium;copy=await game.actors.importFromCompendium(pack,actor.id,{['flags.'+ns+'.npcEncounterSource']:actor.uuid},{renderSheet:false});}
 const technique=copy.items.get(item.id);if(!technique)throw Error('A técnica não foi encontrada na cópia da mesa.');
 if(copy.sheet){copy.sheet.activeTab='jutsus';await copy.sheet.render({force:true});}
 ui.notifications.info('Usando a ficha da mesa: '+copy.name);
 return {actor:copy,item:technique};
}
function asProjection(plan,item){
 const original=jutsuProjection(item,{usedLevel:plan.level});
 return {...(original??{}),legado:plan.legado,summary:plan.legado?plan.name:original?.summary,valid:true,usedLevel:plan.level,cost:plan.cost,noRoll:plan.mode==='none',combatProfile:{...original?.combatProfile,...plan.legado?.effectProjection?.combatProfile,...(plan.hardnessPolicy?{hardnessPolicy:plan.hardnessPolicy}:{}),...(plan.ignoreHardness?{ignoreHardness:plan.ignoreHardness}:{}),...(plan.projectiles?{projectiles:plan.projectiles}:{}),...(plan.noDamage?{noDamage:true}:{}),...(plan.ignoreAllHardness?{ignoreAllHardness:true}:{}),...(plan.allowedDefenses?{allowedDefenses:plan.allowedDefenses}:{}),...(plan.gradeMinimum?{minimumGrade:plan.gradeMinimum}:{}),...(plan.ignoreArmor?{ignoreArmor:true}:{})},data:{...(original?.data??{}),action:plan.action,chakraCost:String(plan.cost),damage:plan.noDamage?'Nenhum':plan.fixed?String(plan.fixed):plan.base===null?'Nenhum':String(plan.base),damageType:plan.fixed?'fixed':'base',range:plan.range,duration:plan.duration,difficulty:plan.dc,area:plan.shape,size:plan.size,target:'Alvos marcados'},effect:{...(original?.effect??{}),text:plan.description,id:item.system.jutsu?.effectId||item.system.contentId},traits:original?.traits??item.system.traits};
}
function packetFor(actor,item,plan,projection,targets){
 if(plan.base===null||plan.mode==='none')return null;
 const profile=jutsuDamageProfile(projection)??{base:plan.base,fixed:0,nature:'lethal',criticalAt:plan.criticalAt??15,attackKind:plan.shape?'area':'techniqueProjectile',source:'Parâmetros do jutsu do NPC'};
 return damageSnapshot(actor,item,{...profile,base:plan.base,criticalAt:plan.criticalAt??profile.criticalAt,...(plan.attackKind?{attackKind:plan.attackKind}:{}),...(plan.allowedDefenses?{allowedDefenses:plan.allowedDefenses}:{}),...(plan.ignoreArmor?{ignoreArmor:true}:{}),fixed:plan.fixed??profile.fixed??0,nature:plan.damageNature??profile.nature,gradeBonus:plan.gradeBonus??profile.gradeBonus??0,...(plan.shape?{attackKind:'area',allowedDefenses:['dodge','anticipate']}:{})},targets);
}
export async function useNpcJutsu(actor,item){
 if(!owns(actor)||item.actor!==actor||busy.has(actor.uuid))return;
 if(!isLegado(item)&&effectiveRuleItem(item).flags?.[ns]?.npcReferenceOnly)return ui.notifications.info('Esta anotação complementa a técnica principal; não é outro uso com novo custo.');
 const lockKey=actor.uuid;busy.add(lockKey);
 try{
  const blocked=illusionActionBlock(actor)||techniqueRestriction(actor,item);if(blocked)throw Error(blocked);
  if(isLegado(item)&&!game.users.activeGM)throw Error('Um mestre ativo precisa acompanhar o uso da técnica.');
  const library=await loadCanonicalLibrary();if(!library)throw Error('Catálogo de regras indisponível.');
  const choice=await chooseNpcCast(actor,item,library.entries);
  if(!choice)return;
  let plan=npcJutsuPlan(item,library.entries,choice.level,choice.custom);if(plan.missing.length)throw Error('Complete os parâmetros: '+plan.missing.map(k=>({power:'Fuuinjutsu 7',cost:'chakra',base:'dano base',mode:'modo de uso',nature:'natureza do poder',save:'resistência/dificuldade',size:'tamanho da área',context:'modalidade e quantidade deste uso'}[k])).join(', ')+'. Nenhum recurso gasto.');
  ({actor,item}=await writableNpc(actor,item));if(!owns(actor))return;
  const remembered=Object.fromEntries(Object.entries(choice.custom).filter(([k])=>!['contextChoice','contextValue'].includes(k)));if(!isLegado(item)&&Object.keys(remembered).length)await item.update({['flags.'+ns+'.npcCastParameters.'+choice.level]:remembered});
  plan=npcJutsuPlan(item,library.entries,choice.level,choice.custom);
  if(plan.missing.length)throw Error('Os parâmetros mudaram. Confira o uso novamente; nenhum recurso gasto.');
  const currentBlock=illusionActionBlock(actor,{attack:plan.mode!=='none'})||techniqueRestriction(actor,item);if(currentBlock)throw Error(currentBlock);
  const verified=jutsuProjection(item,{usedLevel:plan.level});
  if(verified?.valid&&verified.support)return (await import('./support-service.mjs')).postSupportUse(actor,item,{usedLevel:plan.level});
  if(verified?.valid&&verified.environment)return (await import('./environment-service.mjs')).postEnvironmentUse(actor,item,{usedLevel:plan.level});
  if(verified?.valid&&verified.phantasm)return (await import('./phantasm-service.mjs')).activatePhantasm(actor,item,verified);
  if(plan.mode==='save'&&!game.users.activeGM)throw Error('Um mestre ativo precisa acompanhar as resistências. Nenhum chakra gasto.');
  const projection=asProjection(plan,item),targets=Array.from(game.user.targets??[]),selectedTargets=damageTargets(targets);
  const original=jutsuProjection(item,{usedLevel:plan.level}),use=npcUseSnapshot(actor,item,original,targets);
  const cast={version:1,actorUuid:actor.uuid,itemUuid:item.uuid,plan,status:'pending',targets:selectedTargets,saves:{},pendingUse:!plan.mode.startsWith('attack:')?use:null};
  const packet=packetFor(actor,item,plan,projection,targets);
  const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const message=await msgClass().create({speaker:msgClass().getSpeaker({actor}),content:techniqueCard(item,projection,use)+(plan.useNote?'<p>'+escape(plan.useNote)+'</p>':'')+(plan.visionCost?'<p>Visão '+plan.visionCost+'</p>':'')+(plan.legado?.mimicCost?'<p>Mímica '+plan.legado.mimicCost+' PM</p>':'')+(plan.clay?'<p class="sns-npc-material">Argila: '+plan.clay+' bomba(s).</p>':''),flags:{[ns]:{npcJutsuCast:cast,areaUse:plan.areas,...(packet&&plan.mode==='save'?{damageUse:packet}:{}),check:{actorImg:actor.img,key:'jutsu'}}}});
  await completeNpcCast(message);return message;
 }catch(error){ui.notifications.warn(error.message);}finally{busy.delete(lockKey);}
}
export async function completeNpcCast(message){
 const cast=flag(message),actor=await fromUuid(cast?.actorUuid),item=await fromUuid(cast?.itemUuid);
 if(!cast||!owns(actor)||item?.actor!==actor||cast.status!=='pending'||cast.plan.legado&&!isProcessor())return;
 await withEffectLock(actor,async()=>{
 if(flag(message).status!=='pending')return;
 const prior=actor.getFlag(ns,'npcCastLedger')?.[message.id];
 if(!prior){
  if(cast.plan.legado){
   if(!actor.testUserPermission(message.author,'OWNER'))throw Error('Sem permissão para usar a técnica.');
   const library=await loadCanonicalLibrary(),verified=legadoPlan(item,cast.plan.legado.params,library.entries);
   if(JSON.stringify(verified)!==JSON.stringify(cast.plan))throw Error('A técnica mudou. Abra um novo uso.');
   await (await import('./legado-validation.mjs')).validateLegadoTargets(actor,verified,cast.targets,message.author);
  }
  const after=npcChakraPayment(actor,cast.plan),resources=npcExtraResources(actor,cast.plan);
  const extra=cast.plan.legado?legadoPayment(actor,cast.plan,{receiptKey:message.id,worldTime:game.time?.worldTime??0,turnKey:[game.combat?.id,game.combat?.round,game.combat?.turn].join('~')}):npcVisionPayment(actor,cast.plan,{user:game.user.id,at:new Date().toISOString()});
  await actor.update({'system.resources.chakra.value':after,...extra.patch,...resources.patch,['flags.'+ns+'.npcCastLedger.'+message.id]:{cost:cast.plan.cost,level:cast.plan.level,itemUuid:item.uuid,vision:extra.spent,legadoStates:extra.states??[],...resources.receipt}});
 }
 else if(prior.cost!==cast.plan.cost||prior.level!==cast.plan.level||prior.itemUuid!==item.uuid)throw Error('Este cartão já foi pago com outros parâmetros.');
 await message.update({['flags.'+ns+'.npcJutsuCast.status']:'paid',...(cast.pendingUse?{['flags.'+ns+'.jutsuUse']:cast.pendingUse}:{})});
 });
 if(message.getFlag(ns,'jutsuUse'))await (await import('./jutsu-application.mjs')).afterJutsuMessage(message);
 if(cast.plan.legado)await (await import('./legado-service.mjs')).finalizeLegadoCast(message);
}
export async function reloadNpcDevice(message){
 const cast=flag(message),actor=await fromUuid(cast?.actorUuid),id=cast?.plan?.deviceUse?.itemId,item=actor?.items.get(id),def=PUPPET_DEVICES[item?.flags?.[ns]?.puppetDevice?.slug];
 if(!game.user.isGM||!actor?.isOwner||!def?.uses||cast.status==='pending')throw Error('O mestre recarrega o dispositivo quando houver munição disponível.');
 return withEffectLock(actor,async()=>{if(actor.flags?.[ns]?.puppetReloads?.[message.id])return;await actor.update({['flags.'+ns+'.puppetUses.'+id]:def.uses,['flags.'+ns+'.puppetReloads.'+message.id]:{itemId:id,to:def.uses,user:game.user.id,at:new Date().toISOString()}});ui.notifications.info('Dispositivo recarregado · '+def.uses+' usos.');ui.chat?.updateMessage(message);});
}
export function npcVisionPayment(actor,plan,options={}){
 if(!plan.visionCost)return {patch:{},spent:0};
 const rows=Array.from(actor.system.specialResources??[]),row=rows.find(r=>r.kind==='vision');
 if(!row&&transplantSources(actor).length)return {patch:{},spent:0};
 if(!row)throw Error('Informe os Pontos de visão atuais nos Recursos especiais antes de usar a técnica. Nenhum recurso gasto.');
 const resolved=resolveSpecialResource(actor,row);if(!resolved.valid||!resolved.known)throw Error('Confira a origem e o valor atual dos Pontos de visão. Nenhum recurso gasto.');
 if(row.value<plan.visionCost)throw Error('Pontos de visão insuficientes. Nenhum recurso gasto.');
 const changed=specialResourceChange(actor,row,row.value-plan.visionCost,'Uso de '+plan.name,options);
 return {patch:{'system.specialResources':rows.map(r=>r===row?changed:r)},spent:plan.visionCost};
}
async function promptRoll(actor,key,title,adjustment=0){
 if(actor.type==='shinobi'){const rows=adjustment?[...checkComponents(actor.system.toObject(),key,characteristicEffects(actor)),{id:'technique-rule',label:'Regra da técnica',value:adjustment,type:'technique',enabled:true}]:null;return SnsCheckDialog.prompt(actor,key,title,rows);}
 const precision=key.startsWith('attribute:')?actor.system.attributes[key.slice(10)]:key.startsWith('skill:')?actor.system.recordedSkills?.find(s=>s.key===key.slice(6))?.precision:actor.system.stats[key];
 if(!Number.isInteger(precision))throw Error('Precisão não informada para '+key+'.');
 return SnsCheckDialog.promptRecorded(actor,{key,name:title,precision,die:'2d8',techniqueAdjustment:adjustment,techniqueLabel:'Regra de '+title});
}
export async function rollNpcTechniqueCheck(message,index){
 const cast=flag(message),actor=await fromUuid(cast?.actorUuid),check=cast?.plan.checks?.[index];
 if(!owns(actor)||cast.status!=='paid'||!check||!RESISTANCE_KEYS.some(r=>r.key===check.key)&&!(cast.plan.legado&&['cc','cd','lm'].includes(check.key)))return;
 const dialog=await promptRoll(actor,check.key,check.label,check.adjustment??0);if(!dialog)return;
 const roll=await rollWithLegado(actor,dialog.spec),outcome=Number.isFinite(check.dc)?versusDifficulty(rolledCheck(roll,dialog.spec),check.dc):null;return roll.toMessage({speaker:msgClass().getSpeaker({actor}),flavor:checkFlavor(dialog.spec),flags:{[ns]:{check:{actorImg:actor.img,key:check.key},...(outcome?{testOutcome:{dc:check.dc,result:outcome}}:{}),npcTechniqueCheck:{parentUuid:message.uuid,key:check.key}}}},{messageMode:dialog.messageMode});
}
export async function attackNpcCast(message){
 const cast=flag(message),actor=await fromUuid(cast?.actorUuid),item=await fromUuid(cast?.itemUuid);
 if(!owns(actor)||item?.actor!==actor||cast.status!=='paid'||!cast.plan.mode.startsWith('attack:')||busy.has(message.uuid))return;
 busy.add(message.uuid);
 try{
  const blocked=illusionActionBlock(actor,{attack:true})||techniqueRestriction(actor,item);if(blocked)throw Error(blocked);
  const key=cast.plan.mode.slice(7),precision=cast.plan.legado?.attackPrecision==='perception'?Number.isInteger(actor.system.bases?.lm)?actor.system.bases.lm+actor.system.attributes.per:actor.system.statsOriginal?.lm??actor.system.stats?.lm:null,weapon=actor.items.get(cast.plan.legado?.weaponId),dialog=weapon?(actor.type==='shinobi'?await SnsCheckDialog.prompt(actor,key,item.name,weaponCheckComponents(actor.system.toObject(),key,weapon,actor.items)):await SnsCheckDialog.promptRecorded(actor,{key,name:item.name,precision:actor.system.stats[key],die:'2d8'},weaponCheckComponents(actor.system.toObject(),key,weapon,actor.items))):Number.isInteger(precision)?await SnsCheckDialog.promptRecorded(actor,{key,name:item.name,precision,die:'2d8'}):await promptRoll(actor,key,item.name,cast.plan.testAdjustment??0);if(!dialog)return;
  const targets=Array.from(game.user.targets??[]);
  const projection=asProjection(cast.plan,item),packet=packetFor(actor,item,cast.plan,projection,targets);
  if(!await prepareProjectilePacket(packet))return;
  const {declareJutsuDefenses}=await import('./pre-defense.mjs');
  const defense=await declareJutsuDefenses(actor,item,packet?.profile,targets);if(defense===null)return;
  if(flag(message).status!=='paid')return;
  const roll=await rollWithLegado(actor,dialog.spec,{kind:'attack'}),attack=rolledCheck(roll,dialog.spec);
  if(packet){packet.attack=attack;if(defense)packet.defenseRequestUuid=defense;}
  const original=jutsuProjection(item,{usedLevel:cast.plan.level}),use=npcUseSnapshot(actor,item,original,targets);if(use)use.attack=attack;
  const child=await roll.toMessage({speaker:msgClass().getSpeaker({actor}),flavor:techniqueCard(item,projection,use)+checkFlavor(dialog.spec,{compact:true}),flags:{[ns]:{...(packet?{damageUse:packet}:{}),...(use?{jutsuUse:use}:{}),npcCastParent:message.uuid,check:{actorImg:actor.img,key}}}},{messageMode:dialog.messageMode});
  await message.update({['flags.'+ns+'.npcJutsuCast.status']:'attacked',['flags.'+ns+'.npcJutsuCast.attackUuid']:child.uuid,['flags.'+ns+'.npcJutsuCast.targets']:damageTargets(targets)});
  if(use)await (await import('./jutsu-application.mjs')).afterJutsuMessage(child);
  return child;
 }finally{busy.delete(message.uuid);}
}
export async function rollNpcSave(message,target,key){
 const cast=flag(message),busyKey=message.uuid+'|'+target.uuid;
 if(!cast||cast.status!=='paid'||!owns(target)||!cast.targets.some(t=>t.uuid===target.uuid)||!cast.plan.saveKeys.includes(key)||cast.saves[target.uuid.replaceAll('.','~')]&&!legadoMayReroll(cast,target)||saveBusy.has(busyKey))return;
 saveBusy.add(busyKey);
 try{const dialog=await promptRoll(target,key,'Resistência · '+cast.plan.name);if(!dialog)return;const roll=await rollWithLegado(target,dialog.spec),result=rolledCheck(roll,dialog.spec),dc=npcSaveDifficulty(cast,target),outcome=versusDifficulty(result,dc);return roll.toMessage({speaker:msgClass().getSpeaker({actor:target}),flavor:checkFlavor(dialog.spec),flags:{[ns]:{npcJutsuSave:{parentUuid:message.uuid,targetUuid:target.uuid,key,roll:result,...(legadoMayReroll(cast,target)?{reroll:true}:{})},testOutcome:{dc,result:outcome},check:{actorImg:target.img,key}}}},{messageMode:dialog.messageMode});}finally{saveBusy.delete(busyKey);}
}
export async function rollFreeNpcSave(message,key){
 const cast=flag(message);if(!cast||cast.status!=='paid'||cast.plan.mode!=='save'||cast.targets.length||!cast.plan.saveKeys.includes(key))return;
 const controlled=Array.from(canvas?.tokens?.controlled??[]).map(t=>t.actor).filter(a=>a?.isOwner&&['shinobi','npc','companion'].includes(a.type));
 let actor=controlled.length===1?controlled[0]:game.user.character?.isOwner?game.user.character:null;
 if(!actor){
  const actors=Array.from(game.actors).filter(a=>a.isOwner&&['shinobi','npc','companion'].includes(a.type));
  if(!actors.length)throw Error('Selecione um token de uma ficha que você controla.');
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const id=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Quem faz a resistência?'},content:'<label>Personagem<select name="actor">'+actors.map(a=>'<option value="'+a.id+'">'+esc(a.name)+'</option>').join('')+'</select></label>',ok:{label:'Continuar',callback:(e,b)=>b.form.elements.actor.value}});
  actor=actors.find(a=>a.id===id);if(!actor)return;
 }
 if(!actor.isOwner)return;
 const dialog=await promptRoll(actor,key,'Resistência · '+cast.plan.name);if(!dialog)return;
 const roll=await rollWithLegado(actor,dialog.spec),result=rolledCheck(roll,dialog.spec),dc=npcSaveDifficulty(cast,actor),outcome=versusDifficulty(result,dc);
 return roll.toMessage({speaker:msgClass().getSpeaker({actor}),flavor:checkFlavor(dialog.spec),flags:{[ns]:{npcFreeSave:{parentUuid:message.uuid,key},testOutcome:{dc,result:outcome},check:{actorImg:actor.img,key}}}},{messageMode:dialog.messageMode});
}
export async function updateNpcTargets(message){
 const cast=flag(message),actor=await fromUuid(cast?.actorUuid),item=await fromUuid(cast?.itemUuid);
 if(!owns(actor)||cast.status!=='paid'||Object.keys(cast.saves).length)throw Error('Os alvos só podem mudar antes das rolagens.');
 const targets=Array.from(game.user.targets??[]),selected=damageTargets(targets),projection=jutsuProjection(item,{usedLevel:cast.plan.level}),use=npcUseSnapshot(actor,item,projection,targets);
 const patch={['flags.'+ns+'.npcJutsuCast.targets']:selected};
 if(message.getFlag(ns,'damageUse'))patch['flags.'+ns+'.damageUse.targets']=selected;
 if(use&&!cast.plan.mode.startsWith('attack:'))patch['flags.'+ns+'.jutsuUse']=use;
 await message.update(patch);
}
export async function acceptNpcSave(reply){
 if(!isProcessor())return;
 const proof=reply.getFlag(ns,'npcJutsuSave');if(!proof)return;
 const parent=await fromUuid(proof.parentUuid),cast=parent&&flag(parent),target=await fromUuid(proof.targetUuid),safe=proof.targetUuid.replaceAll('.','~');
 if(!cast||cast.status!=='paid'||!target?.testUserPermission(reply.author,'OWNER')||!cast.targets.some(t=>t.uuid===target.uuid)||!cast.plan.saveKeys.includes(proof.key)||cast.saves[safe]&&!(proof.reroll&&legadoMayReroll(cast,target))||!validRoll(proof.roll))return;
 const native=rolledCheck(reply.rolls?.[0],{precision:proof.roll.precision,adjustment:0,...minionTestPolicy(target,proof.key)});if(!native||native.total!==proof.roll.total||native.natural!==proof.roll.natural)return;
 const outcome=versusDifficulty(native,npcSaveDifficulty(cast,target));
 const accepted=await withEffectLock(parent,async()=>{if(flag(parent).saves[safe]&&!(proof.reroll&&legadoMayReroll(flag(parent),target)))return false;await parent.update({['flags.'+ns+'.npcJutsuCast.saves.'+safe]:{outcome,replyUuid:reply.uuid,key:proof.key,...(proof.reroll?{rerolled:true}:{})},['flags.'+ns+'.defenseResults.'+safe]:{hit:outcome==='passed'?'miss':'hit',choice:outcome==='passed'?'Resistiu':'Falhou na resistência',defense:native}});return true;});
 if(!accepted)return;
 if(cast.plan.legado)await resolveLegadoSave(parent,target,outcome,reply.uuid);
 const use=parent.getFlag(ns,'jutsuUse');
 if(use){const {effectRows,resolveJutsuEffects}=await import('./jutsu-application.mjs');const decisions={};for(const row of effectRows(use))if(row.target.uuid===target.uuid&&row.binding.trigger==='failedResistance'&&row.binding.resistance===proof.key)decisions[row.key]={resistance:outcome,resistanceRoll:native};if(Object.keys(decisions).length)await resolveJutsuEffects(parent,decisions);}
}
export async function placeNpcTemplate(message){
 const cast=flag(message),actor=await fromUuid(cast?.actorUuid);if(!owns(actor)||cast.status==='pending'||!canvas?.ready)throw Error('Abra uma cena e conclua o uso antes de posicionar a área.');
 const spec=templateSpec(cast.plan,{units:canvas.scene.grid.units,user:game.user.id,color:game.user.color?.css??game.user.color}),doc=new CONFIG.MeasuredTemplate.documentClass({...spec,x:0,y:0,flags:{[ns]:{npcJutsuCast:message.uuid}}},{parent:canvas.scene}),preview=new CONFIG.MeasuredTemplate.objectClass(doc),prior=canvas.activeLayer;
 await preview.draw();canvas.templates.activate();canvas.templates.preview.addChild(preview);
 return new Promise((resolve,reject)=>{
  const cleanup=()=>{canvas.stage.off('pointermove',move);canvas.stage.off('pointerdown',down);window.removeEventListener('keydown',cancel);preview.destroy({children:true});prior?.activate();};
  const move=e=>{const p=e.getLocalPosition(canvas.stage);doc.updateSource({x:p.x,y:p.y});preview.refresh();};
  const cancel=e=>{if(e.key==='Escape'){cleanup();resolve(null);}else if(e.key==='r'||e.key==='R'){doc.updateSource({direction:(doc.direction+15)%360});preview.refresh();}};
  const down=async e=>{e.stopPropagation();if(e.button===2){cleanup();return resolve(null);}if(e.button!==0)return;const data=doc.toObject();cleanup();try{resolve(await canvas.scene.createEmbeddedDocuments('MeasuredTemplate',[data]));}catch(error){reject(error);}};
  canvas.stage.on('pointermove',move);canvas.stage.on('pointerdown',down);window.addEventListener('keydown',cancel);ui.notifications.info('Clique para posicionar a área. R gira; Esc cancela.');
 });
}
