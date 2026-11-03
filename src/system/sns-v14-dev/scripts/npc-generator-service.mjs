import {generatedNpcPreview} from './npc-generator-core.mjs';
import {buildNpcPreview} from './npc-build-core.mjs';
import {generatedSummonBuild} from './npc-build-summon.mjs';
import {puppetConstruction,puppetActorData} from './npc-puppet-core.mjs';
const pending=new Map(),ns='sns-v14-dev';
export async function createGeneratedNpc(draft,library,requestId){
 if(!game.user.isGM)throw Error('Somente o mestre pode gerar NPCs.');
 if(typeof requestId!=='string'||!/^[-a-z0-9]{20,80}$/i.test(requestId))throw Error('Pedido de criação inválido.');
 if(pending.has(requestId))return pending.get(requestId);
 const frozen=structuredClone(draft),operation=Promise.resolve().then(async()=>{
  if(!game.user.isGM)throw Error('Somente o mestre pode gerar NPCs.');
  let actor=game.actors.find(a=>a.flags?.[ns]?.npcGenerator?.requestId===requestId);
  if(!actor){
  const preview=frozen.version===2?buildNpcPreview(frozen,library):generatedNpcPreview(frozen,library);
  if(preview.problems?.length)throw Error(preview.problems.join(' '));
  preview.data.flags[ns].npcGenerator.requestId=requestId;
  actor=await foundry.documents.Actor.create(preview.data);
  }
  const saved=actor.flags?.[ns]?.npcGenerator?.draft,power=actor.items?.find(i=>i.type==='power'&&i.system.contentId==='sns:power:kuchiyose');
  if(saved?.createCompanion!==false&&power){
   const build=generatedSummonBuild(actor,power.system.choice.key);
   let companion=game.actors.find(a=>a.flags?.[ns]?.npcGeneratorCompanion===requestId);
   if(!companion)companion=await foundry.documents.Actor.create({name:power.name+' · '+actor.name,type:'companion',ownership:{default:0},flags:{[ns]:{npcGeneratorCompanion:requestId}}});
   if(!companion.flags?.[ns]?.kuchiyose){const {applyGeneratedSummon}=await import('./kuchiyose-service.mjs');await applyGeneratedSummon(companion,actor,build);}
  }
  const drawing=actor.items?.find(i=>i.type==='power'&&i.system.contentId==='sns:power:pergaminho-da-super-besta');
  if(saved?.createCompanion!==false&&drawing){const count=saved.drawingsCount??1,build=generatedSummonBuild(actor,'desenhos',count);for(let index=0;index<count;index++){const key=requestId+'-drawing-'+index;let companion=game.actors.find(a=>a.flags?.[ns]?.npcGeneratorCompanion===key);if(!companion)companion=await foundry.documents.Actor.create({name:'Desenho '+(index+1)+' · '+actor.name,type:'companion',ownership:{default:0},flags:{[ns]:{npcGeneratorCompanion:key}}});if(!companion.flags?.[ns]?.kuchiyose){const {applyGeneratedSummon}=await import('./kuchiyose-service.mjs');await applyGeneratedSummon(companion,actor,build);}}}
  if(actor.items?.some(i=>i.system.contentId==='sns:apt:kugutsu')){const build=puppetConstruction(actor,saved);for(let index=0;index<build.count;index++){const key=requestId+'-puppet-'+index;if(!game.actors.some(a=>a.flags?.[ns]?.npcGeneratorCompanion===key)){const data=puppetActorData(actor,build,index);data.flags[ns].npcGeneratorCompanion=key;await foundry.documents.Actor.create(data);}}}
  return actor;
 });pending.set(requestId,operation);try{return await operation;}finally{pending.delete(requestId);}
}
