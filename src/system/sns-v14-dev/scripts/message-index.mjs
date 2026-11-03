const ns='sns-v14-dev',byActor=new Map(),byMessage=new Map();let initialized=false;
export function touches(changes,paths){
 const flat=[];const walk=(v,p='')=>{for(const [k,x]of Object.entries(v??{})){const key=p?p+'.'+k:k;if(x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length)walk(x,key);else flat.push(key);}};walk(changes);
 return flat.some(k=>paths.some(p=>k===p||k.startsWith(p+'.')||p.startsWith(k+'.')));
}
function remove(id){for(const uuid of byMessage.get(id)??[]) {const rows=byActor.get(uuid);rows?.delete(id);if(!rows?.size)byActor.delete(uuid);}byMessage.delete(id);}
export function indexMessage(message){
 remove(message.id);const f=message.flags?.[ns]??{},targets=value=>(Array.isArray(value)?value:[]).map(t=>t?.uuid),refs=new Set([f.craftRequest?.actorUuid,f.jutsuUse?.actorUuid,...targets(f.jutsuUse?.targets),...targets(f.damageUse?.targets)].filter(Boolean));
 byMessage.set(message.id,refs);for(const uuid of refs){if(!byActor.has(uuid))byActor.set(uuid,new Map());byActor.get(uuid).set(message.id,message);}
}
export function actorMessages(uuid){if(!initialized){initialized=true;for(const m of globalThis.game?.messages??[])indexMessage(m);}return [...(byActor.get(uuid)?.values()??[])];}
export function installMessageIndex(){Hooks.on('createChatMessage',indexMessage);Hooks.on('updateChatMessage',indexMessage);Hooks.on('deleteChatMessage',m=>remove(m.id));}
