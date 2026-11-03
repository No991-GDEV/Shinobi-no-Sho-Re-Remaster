import {illusionActionBlock} from './magen-core.mjs';
import {bladeBreaks,energyFor,creationData,supportData,supportKind} from './support-core.mjs';
import {defenseSpec} from './defense-choices.mjs';
import {rolledCheck} from './jutsu-outcomes.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev';
export async function prepareBladeContest(actor,item,profile,targets){
 if(!profile?.edgeContest||!targets.length)return '';
 const spec=defenseSpec(actor,'attribute:esp');if(!spec)throw Error('Informe Espírito para testar a lâmina estendida.');
 const {declareDefenses}=await import('./defense-workflow.mjs'),roll=await new foundry.dice.Roll(spec.formula).evaluate(),attack=rolledCheck(roll,spec);
 const contest={base:0,fixed:0,nature:'lethal',criticalAt:15,noDamage:true,attackKind:'resistance',edgeContestRoll:true,resistance:{keys:['skill:prontidao'],difficulty:attack.total}};
 const uuid=await declareDefenses(actor,item,contest,targets);if(uuid===null)return null;
 const request=await fromUuid(uuid),r=request.getFlag(ns,'defenseRequest');
 const message=await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:'<section class="sns-technique-card"><header class="sns-technique-title"><img src="icons/svg/sword.svg" alt=""><strong>Afiar · Lâmina estendida</strong></header><p>Espírito contra Prontidão · '+esc(item.name)+'</p><p>Falha do alvo: −1 nas reações de defesa deste ataque.</p></section>',flags:{[ns]:{check:{actorImg:actor.img,key:'attribute:esp'},damageUse:{version:1,actorUuid:actor.uuid,itemUuid:item.uuid,name:'Afiar · Lâmina estendida',profile:contest,targets:r.targets,attack,defenseRequestUuid:uuid}}}});
 await new Promise(resolve=>{const check=()=>{const results=message.getFlag(ns,'defenseResults');if(r.targets.every(t=>['hit','miss'].includes(results?.[t.uuid.replaceAll('.','~')]?.hit))){Hooks.off('updateChatMessage',hook);resolve();}};const hook=Hooks.on('updateChatMessage',m=>{if(m.uuid===message.uuid)check();});check();});
 return message.uuid;
}
export async function bladeContestEffects(request,actor){
 const r=request.getFlag(ns,'defenseRequest');if(!r?.edgeUuid)return [];
 const message=await fromUuid(r.edgeUuid),p=message?.getFlag(ns,'damageUse'),result=message?.getFlag(ns,'defenseResults')?.[actor.uuid.replaceAll('.','~')];
 if(!p?.profile.edgeContestRoll||p.actorUuid!==r.actorUuid||p.itemUuid!==r.itemUuid||message.author.id!==request.author.id||JSON.stringify(p.targets)!==JSON.stringify(r.targets)||!['hit','miss'].includes(result?.hit))throw Error('Teste de lâmina estendida ausente ou inválido.');
 return result.hit==='hit'?[{kind:'condition',key:'debilitado',scope:'defenses',degree:1,sourceName:'Afiar · Lâmina estendida',sourceId:message.uuid}]:[];
}
export async function resolveBladeBlock(message,choice,defender,hit){
 if(!isTimekeeper()||!choice.itemId||hit==='pending')return {hit};
 const p=message.getFlag(ns,'damageUse');if(!p?.attack||p.attack.natural<=3)return {hit};
 const block=defender.items.get(choice.itemId),attacker=await fromUuid(p.actorUuid),weapon=await fromUuid(p.itemUuid);
 let victim=null,automatic=false;
 if(bladeBreaks(p.profile.blade,block,defender)){victim=block;automatic=p.profile.blade.kind!=='lamina-de-raios';hit='hit';}
 else if(hit==='miss'&&p.profile.attackKind==='melee'){
  const e=energyFor(defender,block,'cc'),m=e?.meta;if(m&&bladeBreaks({kind:m.kind,stage:m.stage},weapon,attacker))victim=weapon;
 }
 if(!victim)return {hit};
 await withEffectLock(victim.actor,async()=>{
  const key=message.id,prior=victim.flags?.[ns]?.brokenWeapons?.[key];if(prior)return;
  const before=victim.system.quantity;if(!Number.isInteger(before)||before<1)throw Error('Arma indisponível para destruir. Confira o bloqueio.');
  await victim.update({'system.quantity':before-1,...(before===1?{'system.equipped':false}:{}),['flags.'+ns+'.brokenWeapons.'+key]:{attackUuid:message.uuid,before,after:before-1,at:new Date().toISOString(),reason:p.profile.blade?.kind??'Bloqueio com arma aprimorada'}});
 });
 return {hit,weaponBroken:{uuid:victim.uuid,name:victim.name,automatic}};
}
// Highest known body-hardness source wins; equal protections select the least penetration.
export function lightningIgnore(hardness,elements=[]){return elements.includes('fuuton')?0:elements.includes('raiton')?hardness/2:hardness;}

// General opposed tests (Básico249–250) reroll double criticals, unlike attack/defense.
export function bladeContestOutcome(left,right){
 if(!left||!right)return 'pending';
 const lc=left.natural>=15,rc=right.natural>=15,lf=left.natural<=3,rf=right.natural<=3;
 if(lc&&rc||lf&&rf)return 'pending';if(lc||rf)return 'hit';if(rc||lf)return 'miss';
 if(left.total!==right.total)return left.total>right.total?'hit':'miss';
 return left.precision===right.precision?'pending':left.precision>right.precision?'hit':'miss';
}

export async function rollSupportAttack(root,item,key){
 const actor=root.actor,blocked=illusionActionBlock(actor,{attack:true,key});if(blocked)throw Error(blocked);if(!actor?.isOwner||item?.actor!==actor||!root.system.appliedCondition.active)throw Error('Técnica ou arma indisponível.');
 const [{weaponDamageProfile,damageSnapshot},{weaponCheckComponents,weaponChecks},{SnsCheckDialog},{declareDefenses},{checkFlavor,attackTraitLabels}]=await Promise.all(['damage-source','weapon-checks','check-dialog','defense-workflow','chat-card'].map(n=>import('./'+n+'.mjs')));
 const source=actor.system.toObject(),stats=source.stats??Object.fromEntries(Object.entries(actor.system.derived?.combat??{}).map(([k,v])=>[k,v.precision]));
 if(!weaponChecks(item,stats,source,actor.items).some(c=>c.key===key&&c.available))throw Error('Confira a arma, o treinamento e a preparação da técnica.');
 const targets=Array.from(game.user.targets??[]),rows=weaponCheckComponents(source,key,item,actor.items),name=item.name+' · '+key.toUpperCase(),choice=actor.type==='shinobi'?await SnsCheckDialog.prompt(actor,key,name,rows):await SnsCheckDialog.promptRecorded(actor,{key,name,precision:stats[key],die:'2d8'},rows);
 if(!choice)return;const profile=weaponDamageProfile(actor,item,key);if(!profile?.blade||profile.blade.rootUuid!==root.uuid)throw Error('A técnica não está mais disponível.');
 const uuid=await declareDefenses(actor,item,profile,targets);if(uuid===null)return;
 const roll=await new foundry.dice.Roll(choice.spec.formula).evaluate(),packet=damageSnapshot(actor,item,profile,targets,roll,choice.spec);if(uuid)packet.defenseRequestUuid=uuid;
 return roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:checkFlavor(choice.spec,{traits:attackTraitLabels(item)}),flags:{[ns]:{damageUse:packet,check:{actorImg:actor.img,key}}}},{messageMode:choice.messageMode});
}
