import {requirementsFor} from './item-requirements.mjs';
import {fillNpcTechniques} from './npc-build-techniques.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {loadCanonicalLibrary} from './canonical-content.mjs';
const ns='sns-v14-dev';
// Work on a disposable projection. Existing levels, selections and IDs remain
// intact; this never runs the NPC purchaser against a player's document.
export function powerRecipes(actor,power,library){
 const data=actor.toObject?actor.toObject():{name:actor.name,type:actor.type,system:structuredClone(actor.system),flags:structuredClone(actor.flags??{}),items:Array.from(actor.items).map(i=>{const {actor:parent,...row}=i;return {...structuredClone(row),_id:i.id??i._id};})},before=new Set(data.items.map(i=>i._id));
 fillNpcTechniques(data,{seed:1,style:'ninjutsu',focus:'clan',excludedTechniques:[]},library,{preserveChoices:true});
 const owned=new Set(Array.from(actor.items).filter(i=>i.system.details?.powerId===power.id).map(i=>i.flags?.[ns]?.npcBuildTechnique?.key||i.system.jutsu?.effectId||i.system.contentId));
 return data.items.filter(i=>!before.has(i._id)&&i.type==='jutsu'&&i.system.details?.powerId===power.id).map(i=>{
  i.flags[ns].sharedRecipe={version:1,powerId:power.id,key:i.flags[ns].npcBuildTechnique.key};
  return {key:i.flags[ns].sharedRecipe.key,name:i.name,data:i,owned:owned.has(i.flags[ns].sharedRecipe.key)||!!i.system.jutsu?.effectId&&owned.has(i.system.jutsu.effectId)};
 });
}
export async function requestPowerRecipe(actor,power,key){
 if(!actor.isOwner||power.actor!==actor||!game.users.activeGM)throw Error('Conecte um mestre para adicionar esta técnica.');
 const message=await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),whisper:[...new Set([game.user.id,game.users.activeGM.id])],content:'Adicionando técnica…',flags:{[ns]:{recipeRequest:{actorUuid:actor.uuid,powerId:power.id,key}}}});
 await processPowerRecipe(message);return message;
}
export async function processPowerRecipe(message){
 if(!isTimekeeper()||!message.getFlag(ns,'recipeRequest')||message.getFlag(ns,'recipeResult'))return;
 return withEffectLock(message,async()=>{
  const r=message.getFlag(ns,'recipeRequest'),actor=await fromUuid(r.actorUuid);
  if(!actor?.testUserPermission(message.author,'OWNER'))return;
  await withEffectLock(actor,async()=>{
   try{
    const library=await loadCanonicalLibrary();if(!library)throw Error('Biblioteca indisponível. Tente novamente.');
    const power=actor.items.get(r.powerId);if(power?.type!=='power')throw Error('Poder não encontrado.');if(!requirementsFor(power,actor).valid||power.system.level<1||actor.type==='shinobi'&&power.system.level>Math.floor(actor.system.nc/2))throw Error('Confira o nível e os requisitos do poder antes de adicionar técnicas.');
    const recipe=powerRecipes(actor,power,library).find(row=>row.key===r.key);if(!recipe)throw Error('Técnica indisponível neste nível ou nesta progressão.');
    if(!recipe.owned){const data=structuredClone(recipe.data);delete data._id;const created=await actor.createEmbeddedDocuments('Item',[data]);if(created.length!==1)throw Error('A técnica não pôde ser adicionada. Confira os requisitos.');}
    await message.update({content:recipe.name+' · adicionada à ficha.',['flags.'+ns+'.recipeResult']:{status:'done',key:r.key}});
   }catch(e){await message.update({content:e.message,['flags.'+ns+'.recipeResult']:{status:'blocked',reason:e.message}});}
  });
 });
}
export function installPowerRecipeHooks(){
 Hooks.on('preUpdateChatMessage',(m,changes,options,userId)=>{if(!game.users.get(userId)?.isGM&&m.getFlag(ns,'recipeRequest'))return false;});
 Hooks.on('createChatMessage',m=>{void processPowerRecipe(m).catch(console.error);});
 Hooks.on('snsProcessorReady',()=>{for(const m of game.messages)if(m.getFlag(ns,'recipeRequest')&&!m.getFlag(ns,'recipeResult'))void processPowerRecipe(m).catch(console.error);});
}
