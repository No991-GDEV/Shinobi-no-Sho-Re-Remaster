const ns='sns-v14-dev';
export const isManagedParty=actor=>actor?.type==='party'&&actor.flags?.[ns]?.partyManaged?.version===1;
export const isPartyCreature=actor=>['shinobi','npc','companion'].includes(actor?.type);
export function shouldRefreshPartyDirectory(actor,changes={}){return ['name','img','ownership'].some(k=>Object.hasOwn(changes,k))||Object.keys(changes).some(k=>k.startsWith('ownership.'))||actor?.type==='party'&&(Object.hasOwn(changes.system??{},'members')||Object.hasOwn(changes,'system.members')||changes.flags?.[ns]?.partyManaged!==undefined||Object.hasOwn(changes,'flags.'+ns+'.partyManaged'));}
export function memberUuids(party){return [...new Set(party?.system?.members??[])].filter(uuid=>typeof uuid==='string'&&/^Actor\.[A-Za-z0-9]{16}$/.test(uuid)&&uuid!==party.uuid);}
export function validatePartyMembers(party,uuids,actors){
 if(!Array.isArray(uuids)||uuids.length>100||new Set(uuids).size!==uuids.length)throw Error('A equipe aceita até 100 integrantes, sem repetições.');
 for(const uuid of uuids){const actor=Array.from(actors).find(a=>a.uuid===uuid);if(!actor||!isPartyCreature(actor)||uuid===party.uuid)throw Error('Escolha uma ficha de personagem, NPC ou companheiro deste mundo.');}
 return uuids;
}
export function mayEditParty(before,after,isGM){return isGM||!isManagedParty(before)&&!isManagedParty(after)||(JSON.stringify(before.flags?.[ns]?.partyManaged)===JSON.stringify(after.flags?.[ns]?.partyManaged)&&JSON.stringify(before.system.members)===JSON.stringify(after.system.members));}
export function partySummoners(parties,actors,user){
 const uuids=new Set(Array.from(parties).filter(p=>p.type==='party'&&p.testUserPermission(user,'OBSERVER')).flatMap(memberUuids));
 return Array.from(actors).filter(a=>uuids.has(a.uuid)&&['shinobi','npc'].includes(a.type)&&a.testUserPermission(user,'OWNER')).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
}
