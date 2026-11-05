import {defenseChoices,defenseSpec,mayRespondToDefense} from './defense-choices.mjs';
import {requestDefenseChoice} from './defense-workflow.mjs';
import {transformationProjection,canControlTransformation} from './transformation-core.mjs';
import {rollWithLegado} from './legado-fortune.mjs';
import {checkFlavor} from './chat-card.mjs';
import {escapeHtml} from './kernel.mjs';
import {actorSizeId} from './actor-defenses.mjs';
const ns='sns-v14-dev';
const sizeOf=actor=>transformationProjection(actor).size?.name||actor.system.identity?.size||actor.system.details?.size||'';

// Pending attacks use their exact profile. The free roll has no opponent or
// outcome and must never create an attack, damage card or successful defense.
export function sheetBlockOptions(actor,messages=game.messages){
 const pending=Array.from(messages).filter(m=>{const r=m.getFlag(ns,'defenseRequest');return r?.status==='pending'&&r.targets?.some(t=>t.uuid===actor.uuid)&&!r.responses?.[actor.uuid.replaceAll('.','~')];});
 if(pending.length)return {linked:true,options:pending.flatMap(message=>{const r=message.getFlag(ns,'defenseRequest');if(!mayRespondToDefense(actor,game.user,game.users))return [];return defenseChoices(actor,r.profile).filter(c=>c.id.startsWith('block-')).map(choice=>({message,choice,label:(pending.length>1?r.name+' · ':'')+choice.label}));})};
 const profile={attackKind:'melee',weaponClass:'Desarmado',attackerSize:sizeOf(actor)};
 return {linked:false,options:defenseChoices(actor,profile).filter(c=>c.id.startsWith('block-')).map(choice=>({choice,profile,label:choice.label}))};
}
async function chooseBlock(options,linked){
 if(options.length===1)return options[0];
 const selected=await foundry.applications.api.DialogV2.wait({classes:['sns-editor-dialog','sns-block-choice'],window:{title:'Bloquear'},position:{width:400},content:'<p>'+(linked?'Escolha a defesa para este ataque.':'Escolha a arma ou defesa para o teste avulso.')+'</p>',buttons:options.map((option,index)=>({action:'block-'+index,label:escapeHtml(option.label),callback:()=>index}))});
 return Number.isInteger(selected)?options[selected]:null;
}
export async function useSheetBlock(actor,{choose=chooseBlock,declare=requestDefenseChoice,roll=rollWithLegado}={}){
 if(!actor?.isOwner||!canControlTransformation(actor))throw Error('Somente o dono da ficha pode bloquear.');
 const state=sheetBlockOptions(actor);
 if(!state.options.length){if(!actorSizeId({details:{size:sizeOf(actor)}}))throw Error('Informe o tamanho do personagem na ficha para conferir o Bloqueio.');throw Error(state.linked?'Bloqueio não é permitido nos ataques pendentes.':'Equipe uma arma ou ative uma defesa apropriada para bloquear.');}
 const selected=await choose(state.options,state.linked);if(!selected||!state.options.includes(selected))return null;
 if(!actor.isOwner||!canControlTransformation(actor))throw Error('A ficha não está disponível para bloquear.');
 if(state.linked){await declare(selected.message,actor,selected.choice.id);return {linked:true};}
 // Revalidate equipment, conditions and active modes after a choice dialog.
 const current=sheetBlockOptions(actor);if(current.linked)throw Error('Há um ataque pendente. Clique em Bloquear para declarar a defesa.');
 const selectedNow=current.options.find(o=>o.choice.id===selected.choice.id);if(!selectedNow)throw Error('Essa defesa não está mais disponível.');
 const c=selectedNow.choice,spec=defenseSpec(actor,c.key,c.itemId?actor.items.get(c.itemId):null,c.penalty??0,c.environmentBonus?[{kind:'flatModifier',target:'lm',value:c.environmentBonus,sourceName:c.label}]:[],selectedNow.profile);
 if(!spec)throw Error('Informe a precisão de combate para bloquear.');
 spec.name=c.label;
 const result=await roll(actor,spec,{kind:'defense'});
 await result.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:checkFlavor(spec,{tag:'DEFESA'})+'<p class="sns-roll-context">Teste avulso · sem ataque vinculado</p>',flags:{[ns]:{check:{actorImg:actor.img,key:c.key,defense:true},sheetBlock:{version:1,actorUuid:actor.uuid,itemId:c.itemId??'',mode:'free'}}}},{messageMode:game.settings.get('core','messageMode')});
 return {linked:false,spec};
}
