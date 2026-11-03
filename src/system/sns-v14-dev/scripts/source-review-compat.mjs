import {NPC_SOURCE_PATCHES,RINKAICHUU_UPDATE} from '../data/source-review-d165.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),ns='sns-v14-dev';
// Presentation/use compatibility, never a persisted migration of world actors.
export function sourceReviewedItem(item){
 const profile=item.actor?.flags?.[ns]?.animeProfile,patch=profile&&item.actor?.type==='npc'?NPC_SOURCE_PATCHES.find(p=>p.sourcePath===profile.sourcePath&&p.sha256===profile.sha256&&p.itemId===(item.id??item._id)&&p.before.level===item.system.level&&p.before.details?.powerCost===item.system.details?.powerCost):null;
 let system=item.system,changed=false;
 const set=(key,value)=>{if(!changed){system={...system};changed=true;}system[key]=value;};
 if(patch)for(const key of ['contentId','ruleId','choice','description','source','details']){
  if(same(patch.before[key],patch.after[key]))continue;
  if(key==='source'&&!same(patch.before.description,patch.after.description)&&item.system.description!==patch.before.description)continue;
  if(key==='details'){const delta={};for(const k of Object.keys(patch.after.details??{}))if(!same(patch.before.details?.[k],patch.after.details[k])&&same(system.details?.[k],patch.before.details?.[k]))delta[k]=patch.after.details[k];if(Object.keys(delta).length)set('details',{...system.details,...delta});}
  else if(same(system[key],patch.before[key]))set(key,patch.after[key]);
 }
 const id=system?.contentId||item.flags?.[ns]?.canonicalTextSource?.id;
 if(id==='sns:apt:rinkaichuu'&&system.description===RINKAICHUU_UPDATE.before){set('description',RINKAICHUU_UPDATE.description);set('source',RINKAICHUU_UPDATE.source);}
 return changed?{type:item.type,name:item.name,id:item.id,uuid:item.uuid,img:item.img,actor:item.actor,flags:item.flags,system}:item;
}
