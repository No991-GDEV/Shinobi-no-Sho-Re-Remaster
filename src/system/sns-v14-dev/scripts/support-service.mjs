import {touches} from './message-index.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {activeSupports,supportData,supportKind,supportItems,creationData,supportUnable,creationPlan,energyPlan,supportSummary,supportNeedsMaintenance,stoneCombo,supportMaintenanceAction,bladePlan,isEnergy,bladeHandRoot} from './support-core.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {jutsuProjection} from './item-view.mjs';
import {actorCombat,durationRule} from './effect-duration.mjs';
import {illusionActionBlock} from './magen-core.mjs';
import {techniqueCard} from './technique-card.mjs';
const ns='sns-v14-dev',busy=new Set();
export async function postSupportUse(actor,item,{usedLevel}={}){
 if(!['shinobi','npc','companion'].includes(actor.type)||!actor.isOwner||item.actor!==actor||!game.users.activeGM)throw Error('Um mestre ativo precisa acompanhar esta técnica.');
 const p=jutsuProjection(item,{usedLevel});if(!p?.valid||!p.support)throw Error('Revise os requisitos da técnica.');
 return foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:techniqueCard(item,p),flags:{[ns]:{check:{actorImg:actor.img,key:'jutsu'},supportUse:{actorUuid:actor.uuid,itemUuid:item.uuid,usedLevel:p.usedLevel,status:'choose'}}}});
}
export async function requestSupportChoice(message,selection){
 const r=message.getFlag(ns,'supportUse'),actor=await fromUuid(r?.actorUuid);if(!actor?.isOwner||!['choose','blocked'].includes(r.status)||!game.users.activeGM)throw Error('Este uso já foi resolvido ou está indisponível.');
 return foundry.documents.ChatMessage.create({whisper:[game.users.activeGM.id],content:'Escolha de arma ou proteção temporária.',flags:{[ns]:{supportChoice:{useUuid:message.uuid,selection}}}});
}
export async function requestSupportControl(root,action){
 if(!root.actor?.isOwner||!supportData(root)||!game.users.activeGM)throw Error('Ação indisponível.');
 return foundry.documents.ChatMessage.create({whisper:[game.users.activeGM.id],content:'Técnica sustentada.',flags:{[ns]:{supportControl:{rootUuid:root.uuid,action}}}});
}
function usePlan(actor,item,selection){
 const p=jutsuProjection(item,{usedLevel:selection?.usedLevel}),m=p?.support;if(!p?.valid||!m||item.system.targetEffects?.length)throw Error('Revise os requisitos e os efeitos personalizados da técnica.');
 const blocked=illusionActionBlock(actor);if(blocked||supportUnable(actor))throw Error(blocked||'O usuário não pode agir para sustentar esta técnica.');
 if(m.kind==='energizar'&&selection?.targets?.length>1){const apt=actor.items.find(i=>i.system.ruleId==='sns:apt:ambidestria'||i.system.contentId==='sns:apt:ambidestria');if(!apt||!requirementsFor(apt,actor).valid)throw Error('Ambidestria exige seus requisitos originais.');}
 if(m.kind==='energizar'&&m.element==='doton'&&selection?.targets?.length===1&&selection.targets[0]==='fists'&&activeSupports(actor).some(i=>supportKind(i)==='pele-de-pedra'))m.action='Livre · Soco de Pedra';
 if(selection?.freeAfter&&!creationChain(actor,item,selection.freeAfter))throw Error('A ação livre exige uso imediatamente após Criar Arma do mesmo elemento e sobre a arma criada.');
 const body=['afiar','lamina-de-raios','arma-eletrica'].includes(m.kind)?bladePlan(actor,m,selection):m.kind==='criar-arma'?creationPlan(m,selection):m.kind==='energizar'?energyPlan(actor,selection):{keep:selection?.keep===true,cost:m.cost};
 if(selection?.freeAfter&&(m.kind!=='energizar'||body.targets.length!==1||!body.targets[0].itemIds.includes(actor.getFlag(ns,'supportCreationChain').createdId)))throw Error('A ação livre aplica-se somente à criação anterior.');
 return {p,meta:{version:1,...m,...body,sourceId:item.id,phase:m.kind==='pele-de-pedra'?'burst':'sustained',keep:selection?.keep!==false,pending:false},cost:body.cost};
}
const turnStamp=actor=>{const c=actorCombat(actor);return c?.started?{combatId:c.id,round:c.round,combatantId:c.combatant?.id??'',actorUuid:c.combatant?.actor?.uuid??''}:null;};
export function creationChain(actor,item,uuid=''){
 const chain=actor.getFlag(ns,'supportCreationChain'),p=jutsuProjection(item),root=chain?.rootUuid&&actor.items.find(i=>i.uuid===chain.rootUuid);
 return chain?.available&&(!uuid||chain.rootUuid===uuid)&&root&&creationData(actor.items.get(chain.createdId))&&!creationData(actor.items.get(chain.createdId)).dissolved&&p?.support?.kind==='energizar'&&p.support.element===chain.element&&JSON.stringify(chain.turn)===JSON.stringify(turnStamp(actor))?chain:null;
}
// Called only by the active GM, inside the Actor lock. The paid ledger also locks the chosen configuration.
async function applyUse(actor,item,selection,useUuid,{pendingDefense=false}={}){
 if(!isTimekeeper())throw Error('Somente o mestre ativo aplica esta técnica.');
 const key=useUuid.replaceAll('.','~'),paid=actor.getFlag(ns,'supportActivations')?.[key];
 if(paid&&JSON.stringify(paid.selection)!==JSON.stringify(selection))throw Error('Este uso já foi cobrado com outra configuração.');
 let root=supportItems(actor).find(i=>supportData(i).activationUuid===useUuid),plan;
 if(!root){plan=usePlan(actor,item,selection);if(!paid){const chakra=actor.system.resources.chakra.value;if(!Number.isInteger(chakra)||chakra<plan.cost)throw Error('Chakra insuficiente.');await actor.update({'system.resources.chakra.value':chakra-plan.cost,['flags.'+ns+'.supportActivations.'+key]:{itemUuid:item.uuid,cost:plan.cost,selection,at:new Date().toISOString()}});}
  const m=plan.meta,permanent=m.kind==='criar-arma'&&m.solid;
  [root]=await actor.createEmbeddedDocuments('Item',[{name:plan.p.effect.name,type:'effect',img:m.kind==='pele-de-pedra'?'icons/svg/shield.svg':m.kind==='energizar'?'icons/svg/lightning.svg':'icons/svg/sword.svg',system:{contentId:'sns:state:suporte',description:plan.p.effect.text,source:plan.p.effect.source,appliedCondition:{managed:true,active:!permanent&&!pendingDefense,scope:'all',origin:item.name,sourceUuid:item.uuid,casterUuid:actor.uuid,duration:permanent?'Permanente':'Sustentada',durationRule:durationRule({mode:'manual'}),applicationKey:useUuid,appliedBy:game.user.id,appliedAt:new Date().toISOString(),endedAt:''}},flags:{[ns]:{support:{...m,activationUuid:useUuid,...(pendingDefense?{defenseStatus:'pending'}:{}),activationTurn:turnStamp(actor)}}}}]);
  if(!root)throw Error('A técnica foi cobrada, mas o registro não foi criado. Tente novamente com a mesma configuração.');
 }
 const m=supportData(root);
 if(m.kind==='pele-de-pedra'&&!pendingDefense)for(const prior of activeSupports(actor))if(prior.id!==root.id&&supportKind(prior)==='pele-de-pedra')await endSupport(prior,'Pele de Pedra renovada.');
 if(m.kind==='criar-arma'||m.kind==='arma-eletrica'&&m.mode!=='energize'){
  let weapon=actor.items.find(i=>creationData(i)?.activationUuid===useUuid);
  if(!weapon){const data=structuredClone(m.definition.document);delete data._id;data.system={...data.system,quantity:m.quantity,equipped:true,details:{...data.system.details,size:m.size}};if(m.kind==='arma-eletrica'&&m.mode==='blade')data.system.details.attackMode='Corpo a corpo e à distância';data.flags={[ns]:{creation:{version:1,activationUuid:useUuid,rootId:root.id,sourceId:item.id,element:m.element,hardness:m.hardness??m.usedLevel,solid:m.solid,dissolved:false,...(m.kind==='arma-eletrica'?{ranged:true,electric:true}:{})}}};[weapon]=await actor.createEmbeddedDocuments('Item',[data]);if(!weapon)throw Error('Não foi possível registrar a arma criada.');}
  if(!m.createdId)await root.update({['flags.'+ns+'.support.createdId']:weapon.id,...(m.kind==='arma-eletrica'&&m.mode==='blade'?{['flags.'+ns+'.support.targets']:[{id:weapon.id,label:weapon.name,itemIds:[weapon.id],projectile:false,remaining:0,launched:[]}]}:{})});
 }
 if(isEnergy(root)&&m.targets.some(t=>t.fists)&&!actor.items.some(i=>i.flags?.[ns]?.supportFists)){
  await actor.createEmbeddedDocuments('Item',[{name:'Punhos energizados',type:'weapon',img:'icons/svg/lightning.svg',system:{contentId:'sns:weapon:punhos-energizados',category:'weapons',quantity:1,equipped:true,details:{attackMode:'Corpo a corpo',damage:'0'},description:'Energizar aplica-se aos punhos enquanto o efeito estiver ativo. Punho de Ferro e Soco de Pedra seguem suas regras próprias.'},flags:{[ns]:{supportFists:true}}}]);
 }
 if(m.kind==='lamina-de-raios'&&!actor.items.some(i=>i.flags?.[ns]?.bladeHand===root.id)){await actor.createEmbeddedDocuments('Item',[{name:'Lâmina de Raios',type:'weapon',img:'icons/svg/lightning.svg',system:{contentId:'sns:weapon:lamina-de-raios',category:'weapons',quantity:1,equipped:true,details:{attackMode:'Corpo a corpo',damage:'0'},description:root.system.description},flags:{[ns]:{bladeHand:root.id}}}]);}
 for(const combined of stoneCombo(actor))if(supportData(combined).pending)await combined.update({['flags.'+ns+'.support.pending']:false});
 if(m.kind==='criar-arma')await actor.update({['flags.'+ns+'.supportCreationChain']:{rootUuid:root.uuid,createdId:supportData(root).createdId,element:m.element,turn:turnStamp(actor),available:true}});
 else if(actor.getFlag(ns,'supportCreationChain')?.available)await actor.update({['flags.'+ns+'.supportCreationChain.available']:false});
 await root.update({'system.appliedCondition.note':supportSummary(root,actor)});
 return root;
}
async function acceptChoice(reply){
 const choice=reply.getFlag(ns,'supportChoice');if(!choice)return;
 const use=await fromUuid(choice.useUuid),r=use?.getFlag(ns,'supportUse'),actor=await fromUuid(r?.actorUuid),item=await fromUuid(r?.itemUuid);
 if(!actor||item?.actor!==actor||!actor.testUserPermission(reply.author,'OWNER')||!actor.testUserPermission(use.author,'OWNER'))throw Error('A origem não está disponível ou você não tem permissão.');
 await withEffectLock(actor,async()=>{
  if(!['choose','blocked'].includes(use.getFlag(ns,'supportUse').status))return;
  try{const root=await applyUse(actor,item,{...choice.selection,usedLevel:r.usedLevel??item.system.jutsu.usedLevel},use.uuid),p=jutsuProjection(item,{usedLevel:r.usedLevel});await use.update({content:techniqueCard(item,{...p,data:{...p.data,chakraCost:String(actor.getFlag(ns,'supportActivations')[use.uuid.replaceAll('.','~')].cost),target:isEnergy(root)?supportData(root).targets.map(t=>t.label).join(' e '):p.data.target,action:choice.selection.freeAfter?'Livre · após Criar Arma':supportData(root).action??p.data.action}}),['flags.'+ns+'.supportUse']:{...r,status:'active',rootUuid:root.uuid,cost:actor.getFlag(ns,'supportActivations')[use.uuid.replaceAll('.','~')].cost}});}
  catch(e){await use.update({['flags.'+ns+'.supportUse.status']:'blocked',['flags.'+ns+'.supportUse.reason']:e.message});throw e;}
 });
}
export async function endSupport(root,reason='Encerrado'){
 if(!isTimekeeper()||!supportData(root))return;
 const m=supportData(root);if(isEnergy(root)&&m.targets.some(t=>t.launched.some(l=>!l.expired))){const next=structuredClone(m);for(const t of next.targets)for(const l of t.launched)l.expired=true;await root.update({['flags.'+ns+'.support']:next});}if((m.kind==='criar-arma'||m.kind==='arma-eletrica'&&m.createdId)&&!m.solid){const weapon=root.actor.items.get(m.createdId);if(weapon&&!creationData(weapon)?.dissolved)await weapon.update({['flags.'+ns+'.creation.dissolved']:true,'system.equipped':false,'system.quantity':0});}
 if(root.system.appliedCondition.active)await root.update({'system.appliedCondition.active':false,'system.appliedCondition.endedAt':new Date().toISOString(),'system.appliedCondition.note':reason});
}
async function acceptControl(reply){
 const r=reply.getFlag(ns,'supportControl');if(!r)return;const root=await fromUuid(r.rootUuid),actor=root?.actor;
 if(!supportData(root)||!actor.testUserPermission(reply.author,'OWNER'))throw Error('Somente o usuário da técnica pode controlá-la.');
 await withEffectLock(actor,async()=>{
  if(!root.system.appliedCondition.active)return;
  const m=structuredClone(supportData(root)),c=actorCombat(actor);
  if(r.action==='end')return endSupport(root);
  if(r.action==='capanga'&&reply.author.isGM&&m.kind==='lamina-de-raios'&&m.spent&&m.lastAttackUuid){const attack=await fromUuid(m.lastAttackUuid),p=attack?.getFlag(ns,'damageUse');const hit=p?.targets.some(t=>attack.getFlag(ns,'defenseResults')?.[t.uuid.replaceAll('.','~')]?.hit==='hit');if(!hit||m.renewedAttack===m.lastAttackUuid)throw Error('Marque um capanga abatido por este ataque. Cada ataque permite uma continuação.');m.renewedAttack=m.lastAttackUuid;m.spent=false;await root.update({['flags.'+ns+'.support']:m,'system.appliedCondition.note':supportSummary({flags:{[ns]:{support:m}}},actor)});return;}
  if(r.action==='sustain'){if(c?.started&&c.combatant?.actor?.uuid!==actor.uuid)throw Error('Use Sustentar durante seu turno.');if(supportUnable(actor))throw Error('O usuário está incapaz de agir.');m.pending=false;m.maintainedTurn=turnStamp(actor);m.keep=true;}
  else if(r.action==='turnEnd'&&reply.author.isGM&&!c?.started){if(m.kind==='pele-de-pedra'&&m.phase==='burst')m.phase='sustained';for(const t of m.targets??[])t.launched=t.launched.map(l=>({...l,expired:true}));}
  else throw Error('Ação indisponível.');
  await root.update({['flags.'+ns+'.support']:m,'system.appliedCondition.note':supportSummary({flags:{[ns]:{support:m}}},actor)});
 });
}
export function skinDefenses(actor){
 if(supportUnable(actor)||illusionActionBlock(actor))return [];
 return Array.from(actor.items).filter(i=>i.type==='jutsu').map(item=>({item,p:jutsuProjection(item)})).filter(({p})=>p?.valid&&p.support?.kind==='pele-de-pedra'&&actor.system.resources.chakra.value>=p.cost).map(({item,p})=>({id:'skin-'+item.id,label:'Pele de Pedra',detail:'LM · movimento · Chakra '+p.cost+' · Dureza '+p.support.hardness,kind:'opposed',key:'lm',supportId:item.id}));
}
export async function applySkinDefense(actor,choice,replyUuid){
 if(!choice.supportId)return null;
 return withEffectLock(actor,()=>applyUse(actor,actor.items.get(choice.supportId),{keep:true},replyUuid,{pendingDefense:true}));
}
export async function resolveSkinDefense(root,success,attackUuid){
 if(!isTimekeeper()||supportKind(root)!=='pele-de-pedra')throw Error('Registro de defesa inválido.');
 return withEffectLock(root.actor,async()=>{
  const m=supportData(root);if(m.defenseStatus!=='pending'){if(m.defenseAttackUuid!==attackUuid)throw Error('Defesa já usada em outro ataque.');return;}
  if(success){const now=turnStamp(root.actor);if(m.activationTurn&&JSON.stringify(now)!==JSON.stringify(m.activationTurn))throw Error('O turno mudou durante a defesa. Revise o uso antes de aplicar o dano.');}
  const previous=activeSupports(root.actor).filter(i=>supportKind(i)==='pele-de-pedra');
  await root.update({'system.appliedCondition.active':success,'system.appliedCondition.note':success?'Técnica defensiva executada a tempo. O ataque ainda causa dano contra a dureza.':'LM não executou a técnica a tempo; permanece somente a proteção anterior.',['flags.'+ns+'.support.defenseStatus']:success?'succeeded':'failed',['flags.'+ns+'.support.defenseAttackUuid']:attackUuid});
  if(success)for(const old of previous)if(old.id!==root.id)await endSupport(old,'Pele de Pedra renovada como defesa.');
 });
}
export async function processSupportTurn(actor,event){
 if(!isTimekeeper())return;
 for(const root of supportItems(actor).filter(r=>r.system.appliedCondition.active||supportKind(r)==='arma-eletrica'&&supportData(r).mode==='projectiles'&&supportData(r).launched?.some(l=>!l.expired))){
  const m=structuredClone(supportData(root));let changed=false;
  if(!root.system.appliedCondition.active){if(event.actor?.uuid===actor.uuid&&event.phase==='start'&&supportNeedsMaintenance(m,event)){m.launched=m.launched.map(l=>({...l,expired:true}));await root.update({['flags.'+ns+'.support']:m});}continue;}
  if(event.phase==='end'&&m.kind==='pele-de-pedra'&&m.phase==='burst'&&m.activationTurn?.combatId===event.combatId&&m.activationTurn.combatantId===event.combatantId&&m.activationTurn.round<=event.round){if(!m.keep){await endSupport(root,'Fim do turno de uso.');continue;}m.phase='sustained';changed=true;}
  if(event.actor?.uuid===actor.uuid){
   if(event.phase==='start'&&m.kind==='arma-eletrica'&&m.mode==='projectiles'&&m.launched?.length&&supportNeedsMaintenance(m,event)){m.launched=m.launched.map(l=>({...l,expired:true}));changed=true;}
   if(event.phase==='start'&&supportNeedsMaintenance(m,event)){m.pending=supportMaintenanceAction(actor,root)==='Parcial';changed=true;}
   else if(event.phase==='end'){if(m.pending){await endSupport(root,'Não sustentada neste turno.');continue;}for(const t of m.targets??[]){for(const l of t.launched)if(!l.expired){l.expired=true;changed=true;}}}
  }
  if(changed)await root.update({['flags.'+ns+'.support']:m,'system.appliedCondition.note':supportSummary({flags:{[ns]:{support:m}}},actor)});
 }
 await reconcileSupports(actor);
}
export async function reconcileSupports(actor){
 if(!isTimekeeper()||!actor?.items)return;
 for(const root of activeSupports(actor)){
  const m=supportData(root);if(!actor.items.has(m.sourceId)||!jutsuProjection(actor.items.get(m.sourceId),{usedLevel:m.usedLevel})?.valid){await endSupport(root,'Origem da técnica removida ou indisponível.');continue;}if(supportUnable(actor)){await endSupport(root,'Usuário incapaz de agir.');continue;}
  if(m.kind==='criar-arma'||m.kind==='arma-eletrica'&&m.createdId){const weapon=actor.items.get(m.createdId);if(!weapon){await endSupport(root,'Criação indisponível.');continue;}const c=creationData(weapon);if(!weapon.system.equipped&&m.mode!=='projectiles')await endSupport(root,'A criação deixou a mão do usuário.');}
  if(isEnergy(root)){
   const meta=structuredClone(m);let changed=false;
   meta.targets=meta.targets.filter(t=>{if(t.fists)return true;const physical=t.itemIds.map(id=>actor.items.get(id));if(physical.some(i=>!i||creationData(i)?.dissolved)){changed=true;return false;}if(!t.projectile&&physical.some(i=>!i.system.equipped)){changed=true;return false;}if(t.projectile){const q=Math.min(t.remaining,physical[0].system.quantity,...(m.kind==='afiar'?[physical[0].system.contentId==='sns:equipment:shuriken'?3:1]:[]));if(m.kind==='afiar'){const label=physical[0].name+(physical[0].system.contentId==='sns:equipment:shuriken'?' · até3 shurikens':' · uma arma');if(t.label!==label){t.label=label;changed=true;}}if(q!==t.remaining){t.remaining=q;changed=true;}return q>0||t.launched.some(l=>!l.expired);}return true;});
   if(!meta.targets.length){await endSupport(root,'Armas guardadas ou lote concluído.');continue;}if(changed)await root.update({['flags.'+ns+'.support']:meta});
  }
 }
}
async function recordProjectile(message){
 const p=message.getFlag(ns,'damageUse'),e=p?.profile.energy;if(!p?.attack||!e?.projectile)return;
 const root=await fromUuid(e.rootUuid),actor=root?.actor;if(!actor||actor.uuid!==p.actorUuid||!actor.testUserPermission(message.author,'OWNER')||!isEnergy(root))return;
 await withEffectLock(actor,async()=>{
  const m=structuredClone(supportData(root)),t=m.targets.find(t=>t.id===e.targetId),key=message.id;let spent=actor.getFlag(ns,'supportActivations')?.[key];
  if(!t||spent?.status==='done'||!spent&&!root.system.appliedCondition.active)return;
  const weapon=actor.items.get(t.itemIds[0]),attackItem=await fromUuid(p.itemUuid);
  if(!weapon||attackItem?.actor!==actor||(t.launcherId?attackItem.id!==t.launcherId:attackItem.id!==weapon.id))throw Error('Origem do projétil inválida.');
  const quantity=p.profile.blade?.projectileCount??1;
  if(!spent){if(Math.min(t.remaining,weapon.system.quantity)<quantity)throw Error('Lote de projéteis esgotado. Confira este ataque antes de aplicar dano.');spent={projectile:true,status:'pending',rootUuid:root.uuid,targetId:t.id,itemId:weapon.id,before:weapon.system.quantity,after:weapon.system.quantity-quantity,quantity,attackUuid:message.uuid};await actor.update({['flags.'+ns+'.supportActivations.'+key]:spent});}
  // A persisted journal permits a retry after interruption without spending a second projectile.
  if(!t.launched.some(l=>l.attackUuid===message.uuid)){t.remaining-=spent.quantity??1;t.launched.push({attackUuid:message.uuid,quantity:spent.quantity??1,expired:false,turn:turnStamp(actor)});await root.update({['flags.'+ns+'.support']:m});}
  if(weapon.system.quantity===spent.before)await weapon.update({'system.quantity':spent.after});
  else if(weapon.system.quantity!==spent.after)throw Error('A quantidade de projéteis mudou. Revise o lote.');
  await actor.update({['flags.'+ns+'.supportActivations.'+key+'.status']:'done'});
 });
}
export function installSupportHooks(){
 const process=async message=>{if(!isTimekeeper()||busy.has(message.uuid))return;busy.add(message.uuid);try{const f=message.flags?.[ns]??{},uuid=f.damageUse?.attack?f.damageUse.actorUuid:f.jutsuUse?.actorUuid??f.phantasmActivation?.actorUuid;if(uuid){const actor=await fromUuid(uuid);if(actor?.getFlag(ns,'supportCreationChain')?.available&&actor.testUserPermission(message.author,'OWNER'))await withEffectLock(actor,()=>actor.update({['flags.'+ns+'.supportCreationChain.available']:false}));}await acceptChoice(message);await acceptControl(message);await recordProjectile(message);await recordBladeAttack(message);}catch(e){ui.notifications.warn(e.message);console.error('SNS · suporte',e);}finally{busy.delete(message.uuid);}};
 Hooks.on('createChatMessage',process);Hooks.on('updateChatMessage',process);
 const refresh=item=>{const actor=item.actor;if(isTimekeeper()&&actor)void withEffectLock(actor,()=>reconcileSupports(actor));};
 Hooks.on('snsProcessorReady',()=>{if(isTimekeeper())for(const actor of game.actors)void withEffectLock(actor,()=>reconcileSupports(actor));});
 Hooks.on('updateActor',(actor,changes)=>{if(!touches(changes,['system.resources','system.attributes','system.nc','system.modifiers','system.damageState','system.activeAptitudes','flags.sns-v14-dev.support','flags.sns-v14-dev.transformations']))return;if(isTimekeeper()&&['shinobi','npc','companion'].includes(actor.type))void withEffectLock(actor,()=>reconcileSupports(actor));});
 Hooks.on('createItem',refresh);Hooks.on('updateItem',refresh);Hooks.on('deleteItem',refresh);
 Hooks.on('preUpdateChatMessage',(message,changes,options,userId)=>{if(game.users.get(userId)?.isGM)return;const expanded=foundry.utils.expandObject(changes),f=message.flags?.[ns]??{};if(['supportUse','supportChoice','supportControl'].some(k=>f[k])&&['flags','author','speaker','rolls','-=flags'].some(k=>Object.hasOwn(expanded,k)))return false;});
}

async function recordBladeAttack(message){
 const p=message.getFlag(ns,'damageUse');if(!p?.attack)return;
 const root=p.profile.blade?.rootUuid&&await fromUuid(p.profile.blade.rootUuid),actor=root?.actor;
 if(root&&supportKind(root)==='lamina-de-raios'&&actor.uuid===p.actorUuid&&actor.testUserPermission(message.author,'OWNER'))await withEffectLock(actor,async()=>{const m=supportData(root);if(m.lastAttackUuid===message.uuid)return;if(m.spent||!root.system.appliedCondition.active)throw Error('Esta preparação de Lâmina de Raios já foi usada.');await root.update({['flags.'+ns+'.support.spent']:true,['flags.'+ns+'.support.lastAttackUuid']:message.uuid,'system.appliedCondition.note':'Ataque realizado. Se abateu um capanga, use Manter técnica.'});});
 const item=await fromUuid(p.itemUuid),c=creationData(item),electric=c?.electric&&actorFor(item);if(!electric||p.profile.attackKind!=='projectile'||!electric.testUserPermission(message.author,'OWNER'))return;
 const created=electric.items.get(c.rootId);if(supportData(created)?.mode!=='projectiles')return;
 await withEffectLock(electric,async()=>{const m=structuredClone(supportData(created)),key=message.id,spent=electric.getFlag(ns,'supportActivations')?.[key];if(spent?.status==='done')return;if(!spent){if(item.system.quantity<1)throw Error('Projéteis elétricos esgotados.');await electric.update({['flags.'+ns+'.supportActivations.'+key]:{status:'pending',before:item.system.quantity,after:item.system.quantity-1}});}const paid=electric.getFlag(ns,'supportActivations')[key];if(!m.launched?.some(l=>l.attackUuid===message.uuid)){m.launched??=[];m.launched.push({attackUuid:message.uuid,quantity:1,expired:false,turn:turnStamp(electric)});await created.update({['flags.'+ns+'.support']:m});}if(item.system.quantity===paid.before)await item.update({'system.quantity':paid.after});else if(item.system.quantity!==paid.after)throw Error('A quantidade de projéteis mudou. Revise o lote.');await electric.update({['flags.'+ns+'.supportActivations.'+key+'.status']:'done'});});
}
const actorFor=item=>item?.actor;
