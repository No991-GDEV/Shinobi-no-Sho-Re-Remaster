const ns='sns-v14-dev';
export const isPartyActor=actor=>actor?.type==='party';
export const isManagedParty=actor=>actor?.type==='party'&&actor.flags?.[ns]?.partyManaged?.version===1;
export const isPartyCreature=actor=>['shinobi','npc','companion'].includes(actor?.type);
export const PHYSICAL_ITEM_CATEGORIES=Object.freeze(['weapons','armor','equipment','consumables','ammunition','treasures','containers']);
export function shouldRefreshPartyDirectory(actor,changes={}){
 const keys=Object.keys(changes??{});
 return ['name','img','ownership','sort','folder'].some(k=>Object.hasOwn(changes,k))||keys.some(k=>k.startsWith('ownership.'))||actor?.type==='party'&&(Object.hasOwn(changes.system??{},'members')||Object.hasOwn(changes,'system.members')||changes.flags?.[ns]?.partyManaged!==undefined||Object.hasOwn(changes,'flags.'+ns+'.partyManaged'))||isPartyCreature(actor)&&(Object.hasOwn(changes.system??{},'nc')||Object.hasOwn(changes,'system.nc'));
}
export function memberUuids(party){return [...new Set(party?.system?.members??[])].filter(uuid=>typeof uuid==='string'&&/^Actor\.[A-Za-z0-9]{16}$/.test(uuid)&&uuid!==party.uuid);}
export function validatePartyMembers(party,uuids,actors){
 if(!Array.isArray(uuids)||uuids.length>100||new Set(uuids).size!==uuids.length)throw Error('A equipe aceita até 100 integrantes, sem repetições.');
 for(const uuid of uuids){const actor=Array.from(actors).find(a=>a.uuid===uuid);if(!actor||!isPartyCreature(actor)||uuid===party.uuid)throw Error('Escolha uma ficha de personagem, NPC ou companheiro deste mundo.');}
 return uuids;
}
export function mayEditParty(before,after,isGM){return isGM||(!isPartyActor(before)&&!isPartyActor(after))||(JSON.stringify(before.flags?.[ns]?.partyManaged)===JSON.stringify(after.flags?.[ns]?.partyManaged)&&JSON.stringify(before.system?.members)===JSON.stringify(after.system?.members));}
export function partySummoners(parties,actors,user){
 const uuids=new Set(Array.from(parties).filter(p=>p.type==='party'&&p.testUserPermission(user,'OBSERVER')).flatMap(memberUuids));
 return Array.from(actors).filter(a=>uuids.has(a.uuid)&&['shinobi','npc'].includes(a.type)&&a.testUserPermission(user,'OWNER')).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
}
export function resolveActiveParty(actors,settingId=''){
 if(settingId==='none')return null;
 const parties=Array.from(actors??[]).filter(isPartyActor).sort((a,b)=>(a.sort??0)-(b.sort??0)||String(a.name??'').localeCompare(String(b.name??''),'pt-BR'));
 if(!parties.length)return null;
 if(settingId){const found=parties.find(p=>p.id===settingId);if(found)return found;}
 return parties.find(p=>p.flags?.[ns]?.partyManaged?.primary)??parties[0];
}
export function partitionParties(parties,activeParty=null){
 const list=Array.from(parties??[]).filter(isPartyActor).sort((a,b)=>(a.sort??0)-(b.sort??0)||String(a.name??'').localeCompare(String(b.name??''),'pt-BR'));
 const active=activeParty&&list.some(p=>p.id===activeParty.id)?activeParty:null;
 return {activeParty:active,otherParties:list.filter(p=>p.id!==active?.id)};
}
export function filterPartyTree(tree,hiddenIds){
 const hidden=hiddenIds instanceof Set?hiddenIds:new Set(hiddenIds??[]);
 if(!tree||typeof tree!=='object')return tree;
 return {
  ...tree,
  entries:Array.isArray(tree.entries)?tree.entries.filter(e=>!hidden.has(e?.id??e?._id)):[],
  children:Array.isArray(tree.children)?tree.children.map(c=>filterPartyTree(c,hidden)):[]
 };
}
export function partyDepositOffsets(count,gridSize=100){
 const size=Number.isFinite(gridSize)&&gridSize>0?gridSize:100,total=Math.max(0,Number(count)||0),offsets=[];
 let ring=1;
 while(offsets.length<total){
  for(let dy=-ring;dy<=ring;dy++){
   for(let dx=-ring;dx<=ring;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==ring)continue;
    offsets.push({dx:dx*size,dy:dy*size});
    if(offsets.length>=total)return offsets;
   }
  }
  ring++;
 }
 return offsets;
}
export function planRyoDistribution(totalAmount,recipientUuids,{availableFunds=null,deductFromStash=true}={}){
 const recipients=Array.isArray(recipientUuids)?[...new Set(recipientUuids.filter(Boolean))]:[];
 if(!recipients.length)throw Error('Selecione ao menos um integrante para receber Ryo.');
 if(!Number.isSafeInteger(totalAmount)||totalAmount<=0)throw Error('Informe uma quantidade inteira positiva de Ryo.');
 if(deductFromStash){
  if(!Number.isSafeInteger(availableFunds)||availableFunds<0)throw Error('Informe o saldo do depósito antes de descontar.');
  if(totalAmount>availableFunds)throw Error('Saldo insuficiente no depósito para distribuir '+totalAmount+' Ryo.');
 }
 const perMember=Math.floor(totalAmount/recipients.length);
 if(perMember<1)throw Error('O valor total precisa garantir ao menos 1 Ryo por integrante.');
 const totalDistributed=perMember*recipients.length,remainder=totalAmount-totalDistributed;
 const remainingStash=deductFromStash?availableFunds-totalDistributed:availableFunds;
 return {perMember,totalDistributed,remainder,remainingStash,recipients};
}
export function planItemTransfer(item,quantity,itemCategoryFn){
 const category=typeof itemCategoryFn==='function'?itemCategoryFn(item):item?.system?.category;
 if(!PHYSICAL_ITEM_CATEGORIES.includes(category))throw Error('Somente itens físicos do depósito podem ser transferidos.');
 const current=item?.system?.quantity??1;
 if(!Number.isSafeInteger(current)||current<1)throw Error('Quantidade disponível inválida.');
 const qty=quantity===null||quantity===undefined?current:Number(quantity);
 if(!Number.isSafeInteger(qty)||qty<1||qty>current)throw Error('Informe uma quantidade inteira entre 1 e '+current+'.');
 const raw=typeof item.toObject==='function'?item.toObject():structuredClone(item);
 delete raw._id;delete raw.folder;
 raw.system={...(raw.system??{}),quantity:qty,equipped:false};
 const remainingQuantity=current-qty;
 return {copyData:raw,quantity:qty,remainingQuantity,sourceAction:remainingQuantity===0?'delete':'update'};
}
export function travelPace(speedMeters){
 if(!Number.isFinite(speedMeters)||speedMeters<0)return {metersPerAction:null,metersPerMinute:null,kmPerHour:null,kmPerDay:null};
 const metersPerMinute=Math.round(speedMeters*10);
 const kmPerHour=Math.round((speedMeters*600/1000)*10)/10;
 const kmPerDay=Math.round(kmPerHour*8*10)/10;
 return {metersPerAction:speedMeters,metersPerMinute,kmPerHour,kmPerDay};
}
export function isPartyStatsVisible(isGM,showPartyStats=true){return !!isGM||showPartyStats!==false;}
