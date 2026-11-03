import {isProcessor} from './processor-authority.mjs';
import {LEGACY_BASIC_PACK,HISTORICAL_PACK} from './canonical-content.mjs';
// Normal Foundry migration: retain old UUIDs and documents, archive only these
// two explicitly known development packs. No Actor or Item mutation.
export async function archiveLegacyCompendia(){
 if(!isProcessor())return;
 const packs=[LEGACY_BASIC_PACK,HISTORICAL_PACK].map(id=>game.packs.get(id)).filter(Boolean);
 if(!packs.length)return;
 const name='Arquivo · Referências de montagem';
 const folder=game.folders.find(f=>f.type==='Compendium'&&f.name===name)??await foundry.documents.Folder.create({name,type:'Compendium',color:'#625c51'});
 for(const pack of packs){
  if(pack.folder?.id!==folder.id)await pack.setFolder(folder);
  await pack.configure({locked:true,ownership:{GAMEMASTER:'OWNER',ASSISTANT:'OWNER',TRUSTED:'NONE',PLAYER:'NONE'}});
 }
}
