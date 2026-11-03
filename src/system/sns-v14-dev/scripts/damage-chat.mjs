import {actorMessages} from './message-index.mjs';
import {withEffectLock,isTimekeeper} from './effect-lifecycle.mjs';
import {protectedDamageSpec,applyWithEnvironmentProtection,undoWithEnvironmentProtection} from './environment-protection.mjs';
import {lightningIgnore} from './blade-workflow.mjs';
import {supportHardnessRecords} from './support-core.mjs';
import {mayResolveDamage,applyDamage,undoDamage,armorProtection} from './damage-application.mjs';
import {sequenceReady,sequenceBonus} from './attack-sequences.mjs';
import {ensurePhantasmVisual} from './phantasm-service.mjs';
import {messageVisualState} from './visual-attack.mjs';
import {effectiveHardness} from './transformation-core.mjs';
import {latestDamage,damageGrade,safeTargetKey,damageCalculation,damageResources,damageInputsSignature} from './damage-core.mjs';
import {damagePresentation,readDamagePresentation,damageDice,mayWriteDamagePresentation,packetTargetSpec} from './damage-presentation.mjs';
import {escapeHtml} from './kernel.mjs';
const ns='sns-v14-dev',showing=new Set();
export async function postFreeDamage(message,grade){
 if(!message.isOwner&&!mayResolveDamage())throw Error('O autor ou o mestre precisa mostrar o dano.');
 const packet=await readDamagePacket(message);
 if(packet.targets.length||!packet.attack||![1,2,3,4].includes(grade))throw Error('Dano livre disponível apenas para ataques sem alvo.');
 const copy={...packet,targets:[],attack:null,requestedGrade:grade};delete copy.defenseRequestUuid;
 const card=await foundry.documents.ChatMessage.create({speaker:message.speaker,content:'<div class="sns-chat-flavor"><strong>'+escapeHtml(packet.name)+'</strong><p>Dano livre</p></div>',flags:{[ns]:{damageUse:copy,freeDamage:{parentUuid:message.uuid,grade}}}});
 await showDamage(card);return card;
}
export function packetSpecFor(message,packet,shown,actor){const hardness=effectiveHardness(actor),spec=packetTargetSpec(packet,shown,actor.uuid,{hardness,bonus:sequenceBonus(message,actor.uuid)}),resolved=message.getFlag(ns,'defenseResults')?.[safeTargetKey(actor.uuid)];if(resolved?.weaponBroken?.automatic)spec.grade=Math.max(spec.grade??(packet.attack?damageGrade(packet.attack.natural,{criticalAt:packet.profile.criticalAt}):1),3);if(packet.profile.hardnessPolicy==='lightning'){const elements=supportHardnessRecords(actor).filter(r=>r.hardness===hardness).map(r=>r.element);spec.ignoreHardness=lightningIgnore(hardness,elements);}return protectedDamageSpec(message,packet,actor,spec);}
export async function readDamagePacket(message){
 const packet=message.getFlag(ns,'damageUse');if(message.getFlag(ns,'npcJutsuCast')?.status==='pending')throw Error('Conclua o uso antes de mostrar o dano.');if(!packet||packet.version!==1||!packet.profile||!Array.isArray(packet.targets)||packet.targets.length>50||new Set(packet.targets.map(t=>t.uuid)).size!==packet.targets.length)throw Error('Registro de dano indisponível.');
 if(message.getFlag(ns,'environmentPulse')?.cancelled)throw Error('Esta solicitação da Nuvem foi encerrada com a saída da área.');
 const caster=await fromUuid(packet.actorUuid);if(packet.attack&&packet.profile.blade?.kind==='lamina-de-raios'){const root=await fromUuid(packet.profile.blade.rootUuid);if(root?.flags?.[ns]?.support?.lastAttackUuid!==message.uuid)throw Error('A preparação está em andamento ou já foi usada.');}
 if(!caster||!message.author||!caster.testUserPermission(message.author,'OWNER'))throw Error('O autor do ataque precisa ser proprietário da ficha.');
 return packet;
}
export async function showDamage(message){
 if(!message.isOwner&&!mayResolveDamage())throw Error('O autor ou o mestre precisa mostrar o dano.');
 if(showing.has(message.id))return;showing.add(message.id);
 try{const packet=await readDamagePacket(message);if(!sequenceReady(message))throw Error('Aguarde os ataques adicionais e a sequência de defesas.');if(packet.profile.noDamage)throw Error('Esta técnica não causa dano. Resolva os efeitos nos alvos.');const prior=readDamagePresentation(message,packet);if(prior)return prior;
  const dice=damageDice(packet.profile);let total=null;
  if(dice&&(!packet.attack||damageGrade(packet.attack.natural,{criticalAt:packet.profile.criticalAt})>0)){const roll=await new foundry.dice.Roll(dice.formula).evaluate();total=roll.total;}
  const value=damagePresentation(packet,total);await message.update({'flags.sns-v14-dev.damagePresentation':value});return value;
 }finally{showing.delete(message.id);}
}
export async function applyPacketDamage(message,actor,{spec,decision,expectedSignature}){
 if(!mayResolveDamage())throw Error('O mestre ativo precisa resolver o dano.');
 const npcCast=message.getFlag(ns,'npcJutsuCast');if(npcCast?.plan?.mode==='save'&&!npcCast.saves?.[safeTargetKey(actor.uuid)])throw Error('Aguardando a resistência deste alvo.');
 const packet=await readDamagePacket(message);
 if(!sequenceReady(message)&&!decision?.note?.trim())throw Error('A sequência de ataques ainda não terminou.');
 if((['pending','miss'].includes(messageVisualState(message))||['pending','miss'].includes(await ensurePhantasmVisual(message,actor.uuid)))&&!decision?.note?.trim())throw Error('Resolva o erro de camuflagem antes de aplicar dano.');
 if(packet.profile.noDamage)throw Error('Esta técnica não causa dano.');
 if(!packet.targets.some(t=>t.uuid===actor.uuid))throw Error('Este ator não era alvo do ataque.');
 const resolved=message.getFlag(ns,'defenseResults')?.[safeTargetKey(actor.uuid)];
 if((resolved&&resolved.hit!=='hit'||packet.defenseRequestUuid&&!resolved)&&!decision?.note?.trim())throw Error('O ataque não acertou este alvo.');
 if(decision?.hit!=='hit')throw Error('Resolva a defesa antes de aplicar o dano.');
 if(packet.attack&&damageGrade(packet.attack.natural,{criticalAt:packet.profile.criticalAt})===0)throw Error('O ataque teve falha automática. Não há dano deste acerto para aplicar.');
 const shown=readDamagePresentation(message,packet),grade=packet.attack?damageGrade(packet.attack.natural,{criticalAt:packet.profile.criticalAt}):null,expected=packetSpecFor(message,packet,shown?.spec??packet.profile,actor);
 if(damageDice(packet.profile)&&!shown)throw Error('Mostre e role os dados do dano antes de aplicar.');
 if(((spec.ignoreHardness??0)!==(expected.ignoreHardness??0)||spec.base!==expected.base||spec.fixed!==expected.fixed||spec.nature!==expected.nature||(spec.gradeBonus??0)!==(expected.gradeBonus??0)||grade!==null&&(expected.grade??grade)!==spec.grade)&&!decision.note?.trim())throw Error('Identifique a regra do ajuste de dano, grau ou da conversão de natureza.');
 const key='chat:'+message.id+':'+safeTargetKey(actor.uuid);
 return applyWithEnvironmentProtection(message,packet,actor,()=>applyDamage(actor,{requestKey:key,source:packet.name,sourceUuid:packet.itemUuid,spec,decision,expectedSignature}));
}
export async function undoPacketDamage(message,actor,id){
 if(!mayResolveDamage())throw Error('O mestre ativo precisa desfazer o dano.');
 const packet=await readDamagePacket(message),entry=latestDamage(actor).find(e=>e.id===id);
 if(!packet.targets.some(t=>t.uuid===actor.uuid)||entry?.requestKey!=='chat:'+message.id+':'+safeTargetKey(actor.uuid))throw Error('Este dano não pertence ao cartão e alvo selecionados.');
 return undoWithEnvironmentProtection(message,packet,actor,()=>undoDamage(actor,id));
}
const node=(tag,text='',className='')=>{const e=document.createElement(tag);e.textContent=text;if(className)e.className=className;return e;};
const action=(label,fn,icon='')=>{const b=node('button',label);b.type='button';if(icon){const i=document.createElement('i');i.className='fa-solid '+icon;i.setAttribute('aria-hidden','true');b.prepend(i,document.createTextNode(' '));}b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});return b;};
export async function decorateDamageMessage(message,element){
 if(message.isContentVisible===false||message.getFlag(ns,'npcJutsuCast')?.status==='pending')return;
 const packet=message.getFlag(ns,'damageUse');if(!packet||packet.version!==1||!packet.profile||packet.profile.noDamage||!Array.isArray(packet.targets)||element.querySelector('[data-sns-damage]'))return;
 const box=node('section','','sns-damage-chat');box.dataset.snsDamage='';
 const title=node('header','','sns-damage-heading');title.append(node('strong','Dano · '+packet.name));box.append(title);
 let shown;try{shown=readDamagePresentation(message,packet);}catch(e){box.append(node('small',e.message,'damage-note'));}
 box.dataset.shown=String(!!shown);
 const openAdjustment=async()=>{const {SnsDamageDialog}=await import('./damage-dialog.mjs');const current=await readDamagePacket(message);await new SnsDamageDialog({message,packet:current}).render({force:true});};
 if(packet.attack&&!packet.targets.length){
  if(packet.attack.natural<=3)box.append(node('small','Falha automática no ataque.','damage-note'));
  if(message.isOwner||mayResolveDamage()){
   const controls=node('div','','damage-controls');
   controls.append(action('Dano',()=>postFreeDamage(message,Math.max(1,damageGrade(packet.attack.natural,{criticalAt:packet.profile.criticalAt})))),action('Crítico',()=>postFreeDamage(message,4)));box.append(controls);
  }
  (element.querySelector('.message-content')??element).append(box);return;
 }
 if(!shown){
  if(!sequenceReady(message))box.append(node('small','Aguardando ataques adicionais / sequência de defesas.','damage-note'));
  else if(message.isOwner||mayResolveDamage())box.append(action('Mostrar dano',()=>showDamage(message),'fa-burst'));
  else box.append(node('small','Aguardando o autor mostrar o dano.','damage-note'));
 }else{
  const result=node('div','','sns-damage-result'),sole=packet.targets.length===1?await fromUuid(packet.targets[0].uuid):null,displaySpec=shown.miss?null:sole?packetSpecFor(message,packet,shown.spec,sole):shown.spec;
  if(!shown.miss){const traits=node('div','','sns-damage-traits');traits.append(node('span',shown.spec.nature==='nonlethal'?'Não letal':'Letal'),node('span','Grau '+String(displaySpec.grade+(displaySpec.gradeBonus??0)).replace('.',',')));if(packet.profile.energy)traits.append(node('span','Energizar · '+packet.profile.energy.element));box.append(traits);}
  const distributed=packet.profile.projectiles&&packet.targets.length>1;
  result.append(node('small',shown.miss?'Falha automática':distributed?packet.profile.projectiles.count+' projéteis · DB calculado por alvo':('DB '+displaySpec.base+' × '+String(displaySpec.grade+(displaySpec.gradeBonus??0)).replace('.',',')+(displaySpec.fixed?' + '+displaySpec.fixed:''))));
  if(packet.profile.energy)result.append(node('small',packet.profile.formula));
  if(shown.formula)result.append(node('small',shown.formula+' = '+shown.diceTotal));
  result.append(node('strong',shown.miss?'Sem acerto':distributed?'Por alvo':String(damageCalculation(displaySpec).total)));box.append(result);
 }
 if(packet.targets.length){
  for(const target of packet.targets){
   const actor=await fromUuid(target.uuid);if(!actor||!mayResolveDamage()&&!actor.isOwner)continue;
   const entry=latestDamage(actor).find(e=>e.requestKey==='chat:'+message.id+':'+safeTargetKey(target.uuid)),row=node('div','','sns-damage-target'),head=node('header');head.append(node('strong',target.name));row.append(head);
   if(!shown&&entry?.status!=='applied')continue;
   if(entry?.status==='applied'){
    row.append(node('p',entry.calculation.total+' de dano · Vitalidade '+entry.resources.before.vitality+' → '+entry.resources.after.vitality));
    const controls=node('div','','damage-controls'),undo=action('Desfazer dano',()=>undoPacketDamage(message,actor,entry.id),'fa-rotate-left');undo.disabled=actor.system.damageState?.head!==entry.id||(actor.system.damageState?.externalRevision??0)!==entry.externalRevision;if(mayResolveDamage())controls.append(undo);row.append(controls);
    if(undo.disabled)row.append(node('small','Há alterações posteriores. Confira o histórico.'));
   }else if(shown&&!shown.miss){
    if(entry?.status==='undone')row.append(node('p','Dano desfeito'));
    try{
     const npcCast=message.getFlag(ns,'npcJutsuCast');if(npcCast?.plan?.mode==='save'&&!npcCast.saves?.[safeTargetKey(actor.uuid)]){row.append(node('p','Aguardando a resistência do alvo.'));box.append(row);continue;}
     const resolved=message.getFlag(ns,'defenseResults')?.[safeTargetKey(actor.uuid)];
     if(resolved)row.append(node('p',resolved.stopped?'Ricochete interrompido · não atingido':resolved.choice+' · '+(resolved.defenseTechnique?(resolved.hit==='miss'?'Ataque falhou':resolved.techniqueSuccess?'Executada · dano contra a dureza':'Falhou · proteção anterior'):resolved.hit==='hit'?'Acertou':resolved.hit==='miss'?'Defendeu · sem dano':'Desempate pendente')));
     if(['pending','miss'].includes(messageVisualState(message))||resolved?.hit!=='hit'&&(resolved||packet.defenseRequestUuid)){
      if(!resolved)row.append(node('p','Aguardando a defesa do alvo.'));
      box.append(row);continue;
     }
     const armor=armorProtection(actor);if(armor.value===null)throw Error('Informe a absorção atual em Ajustar dano e defesas.');
     if(resolved?.weaponBroken)row.append(node('p',resolved.weaponBroken.name+' destruída no bloqueio'+(resolved.weaponBroken.automatic?' · sucesso automático':''),'sns-effect-warning'));
     const spec={ignoreHardness:0,...packetSpecFor(message,packet,shown.spec,actor)},calculation=damageCalculation({...spec,hardness:effectiveHardness(actor)}),resources=damageResources(calculation,{vitality:actor.system.resources.vitality.value,temp:actor.system.resources.vitality.temp??0,absorption:armor.value}),signature=damageInputsSignature(actor,armor.id);
     if(packet.profile.followups)row.append(node('p','Disparos adicionais: +'+sequenceBonus(message,actor.uuid)+' DB'));if(packet.profile.ricochetBonus)row.append(node('p','Ricochete: +'+Math.min(5,packet.targets.findIndex(t=>t.uuid===actor.uuid))+' DB'));
     if(packet.profile.splitTargets)row.append(node('p','DB dividido entre '+packet.targets.length+' alvos: '+spec.base));if(spec.ignoreHardness)row.append(node('p','Ignora '+spec.ignoreHardness+' de Dureza de Corpo'));
     if(packet.profile.projectiles)row.append(node('p',packet.profile.projectileAllocation[safeTargetKey(actor.uuid)]+' projétil(eis) · DB '+spec.base));
     row.append(node('p','Vitalidade '+resources.before.vitality+' → '+resources.after.vitality+(resources.absorbed?' · Absorção '+resources.absorbed:'')+(resources.temporaryLost?' · Temporária '+resources.temporaryLost:'')));
     const confirm=node('label'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=resolved?resolved.hit==='hit':packet.attack?.natural>=packet.profile.criticalAt;confirm.append(checkbox,document.createTextNode('Acertou'));if(!resolved)row.append(confirm);
     const controls=node('div','','damage-controls');
     const apply=action('Aplicar dano',()=>mayResolveDamage()?applyPacketDamage(message,actor,{spec,decision:{hit:'hit'},expectedSignature:signature}):requestOwnedDamage(message,actor,signature),'fa-heart-crack');apply.disabled=!checkbox.checked;checkbox.addEventListener('change',()=>apply.disabled=!checkbox.checked);controls.append(apply);
     if(armor.id){const protection=node('button','Armadura · '+armor.value+' / '+armor.max);protection.type='button';protection.className='sns-protection-active';protection.title='Absorção automática da armadura equipada · Básico p.136';protection.addEventListener('click',()=>actor.items.get(armor.id)?.sheet.render({force:true}));controls.append(protection);}
     row.append(controls);
    }catch(e){row.append(node('small',e.message));}
   }
   box.append(row);
  }
  if(mayResolveDamage()){const advanced=node('details','','damage-advanced');advanced.append(node('summary','Opções do mestre'));
  const adjust=action('Ajustar dano e defesas',openAdjustment);adjust.className='damage-adjust';advanced.append(adjust);box.append(advanced);}
 }else if(shown&&packet.targets.length)box.append(node('small','Aguardando aplicação do dano.','damage-note'));
 (element.querySelector('.message-content')??element).append(box);
}
export function guardDamageMessage(message,changes,options,userId){
 if(!game.users.get(userId)?.isGM&&message.getFlag(ns,'ownedDamageRequest'))return false;
 if(game.users.get(userId)?.isGM||!message.getFlag(ns,'damageUse'))return;
 const expanded=foundry.utils.expandObject(changes);if(mayWriteDamagePresentation(message,expanded,userId))return;
 if(['flags','author','speaker','-=flags','-=author','-=speaker'].some(k=>Object.hasOwn(expanded,k)))return false;
}
export function refreshDamageMessages(actor,changes){
 const raw=JSON.stringify(changes);if(!['damageLedger','damageState','vitality','armorPools'].some(k=>raw.includes(k)))return;
 for(const message of actorMessages(actor.uuid)){const packet=message.getFlag(ns,'damageUse');if(packet?.targets?.some(t=>t.uuid===actor.uuid))ui.chat?.updateMessage(message);}
}

export async function requestOwnedDamage(message,actor,signature){
 if(!actor?.testUserPermission(game.user,'OWNER')||!mayReadDamageCard(message,game.user)||!game.users.activeGM)throw Error('Controle esta ficha e conecte um mestre para aplicar o dano.');
 return foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),whisper:[...new Set([game.user.id,game.users.activeGM.id])],content:'Aplicando dano…',flags:{[ns]:{ownedDamageRequest:{messageUuid:message.uuid,actorUuid:actor.uuid,signature}}}});
}
export async function processOwnedDamage(request){
 if(!isTimekeeper()||!request.getFlag(ns,'ownedDamageRequest')||request.getFlag(ns,'ownedDamageResult'))return;
 return withEffectLock(request,async()=>{
  if(request.getFlag(ns,'ownedDamageResult'))return;
  try{
   const r=request.getFlag(ns,'ownedDamageRequest'),actor=await fromUuid(r.actorUuid),message=await fromUuid(r.messageUuid);
   if(!actor?.testUserPermission(request.author,'OWNER')||!mayReadDamageCard(message,request.author))throw Error('Sem permissão para este alvo ou ataque.');
   const packet=await readDamagePacket(message),shown=readDamagePresentation(message,packet);if(!shown||shown.miss)throw Error('Mostre o dano antes de aplicá-lo.');
   await withEffectLock(actor,async()=>{
    const existing=latestDamage(actor).find(e=>e.requestKey==='chat:'+message.id+':'+safeTargetKey(actor.uuid)&&e.status==='applied');
    const record=existing??await applyPacketDamage(message,actor,{spec:{ignoreHardness:0,...packetSpecFor(message,packet,shown.spec,actor)},decision:{hit:'hit'},expectedSignature:r.signature});
    await request.update({content:record.calculation.total+' de dano · '+actor.name,['flags.'+ns+'.ownedDamageResult']:{status:'done',recordId:record.id}});
   });
  }catch(e){await request.update({content:e.message,['flags.'+ns+'.ownedDamageResult']:{status:'blocked',reason:e.message}});}
 });
}
export function installOwnedDamageHooks(){Hooks.on('createChatMessage',m=>{void processOwnedDamage(m).catch(console.error);});Hooks.on('snsProcessorReady',()=>{for(const m of game.messages)if(m.getFlag(ns,'ownedDamageRequest')&&!m.getFlag(ns,'ownedDamageResult'))void processOwnedDamage(m).catch(console.error);});}

// ChatMessage has its own visibility rules, independent of Document ownership.
export function mayReadDamageCard(message,user){
 if(!message||!user)return false;const author=message.author?.id===user.id,whisper=Array.from(message.whisper??[]);
 if(author&&message.blind&&!user.isGM)return false;
 if(!author&&whisper.length&&!whisper.includes(user.id))return false;
 return !whisper.length||message.isRoll||author||whisper.includes(user.id);
}
