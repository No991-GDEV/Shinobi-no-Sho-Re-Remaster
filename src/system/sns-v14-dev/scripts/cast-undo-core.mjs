// Reversal is an exact change journal, never a second evaluation of today's rules.
const ns='sns-v14-dev',own=(o,k)=>Object.hasOwn(o??{},k),copy=v=>structuredClone(v);
export const castStorageKey=uuid=>uuid.replaceAll('.','~');
export const castStorageUuid=key=>key.replaceAll('~','.');
// Foundry expands dots in dictionary keys during document updates.
// Normalize the first local journal format; new journals store encoded UUID keys.
export function normalizeCastJournal(raw){
 if(!raw)return raw;if(raw.version>=2&&['guards','scopes','areas'].every(k=>Object.keys(raw[k]??{}).every(key=>key.includes('~')&&!key.includes('.'))))return raw;const result=copy(raw);
 const flatten=(value,leaf,prefix='',out={})=>{for(const [key,node]of Object.entries(value??{})){const path=prefix?prefix+'.'+key:key;if(leaf(node))out[castStorageKey(path)]=node;else if(node&&typeof node==='object')flatten(node,leaf,path,out);}return out;};
 result.guards=flatten(result.guards,v=>typeof v==='string');result.scopes=flatten(result.scopes,v=>v&&own(v,'full'));result.areas=flatten(result.areas,v=>v&&own(v,'flags'));if(result.undo)result.undo.guards=flatten(result.undo.guards,v=>typeof v==='string');result.version=2;return result;
}
const cleanFlags=flags=>({[ns]:copy(flags?.[ns]??{})});
export function castActorSnapshot(actor){
 const raw=actor.toObject(),items={};
 for(const item of actor.items??[]){if(item.flags?.[ns]?.effectBinding)continue;const d=item.toObject();items[item.id]={name:d.name,img:d.img,type:d.type,system:d.system,flags:d.flags??{}};}
 const system=Object.fromEntries(['resources','damageState','specialResources','activeAptitudes','attributes','bases','stats','movement','nc'].filter(k=>own(raw.system,k)).map(k=>[k,copy(raw.system[k])]));
 const runtime=Object.fromEntries(Object.entries(raw.flags?.[ns]??{}).filter(([k])=>/^(damageLedger|legado|npcCastLedger|support|environment|advanced|phantasm|magen|puppetUses|puppetReloads|turnMaintenance|transformations)/.test(k)));
 return {actor:{system,flags:cleanFlags({[ns]:runtime})},items};
}
const sorted=v=>Array.isArray(v)?v.map(sorted):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v;
export const stateText=v=>JSON.stringify(sorted(v));
export async function stateHash(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(stateText(value)));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');}
export function castGuard(snapshot,scope={full:true}){
 if(scope.full)return snapshot;
 const fields={};for(const path of scope.fields??[]){let value=snapshot.actor,exists=true;for(const key of path.split('.')){if(!own(value,key)){exists=false;break;}value=value[key];}fields[path]=exists?{exists:true,value}:{exists:false};}
 return {fields,items:Object.fromEntries((scope.items??[]).map(id=>[id,snapshot.items[id]??null]))};
}
export function castGuardScope(steps,uuid,casterUuid){
 if(uuid===casterUuid)return {full:true};const fields=new Set(['system.resources.vitality','system.damageState']),items=new Set();
 for(const step of steps)for(const op of step.operations)if(op.actorUuid===uuid){if(op.kind==='actor')for(const f of op.fields)fields.add(f.path);else items.add(op.itemId);}
 return {full:false,fields:[...fields],items:[...items]};
}
const node=(o,k)=>own(o,k)?{exists:true,value:copy(o[k])}:{exists:false};
export function changedFields(before,after,prefix=''){
 const rows=[];for(const key of new Set([...Object.keys(before??{}),...Object.keys(after??{})])){
  if(['__proto__','constructor','prototype'].includes(key))throw Error('Campo não permitido no registro de reversão.');
  const a=node(before,key),b=node(after,key),path=prefix?prefix+'.'+key:key;if(stateText(a)===stateText(b))continue;
  const objects=a.exists&&b.exists&&a.value&&b.value&&typeof a.value==='object'&&typeof b.value==='object'&&!Array.isArray(a.value)&&!Array.isArray(b.value);
  // A dotted dictionary key must stay inside an atomic parent object.
  if(objects&&![...Object.keys(a.value),...Object.keys(b.value)].some(k=>k.includes('.')))rows.push(...changedFields(a.value,b.value,path));else rows.push({path,before:a,after:b});
 }return rows;
}
export function snapshotChanges(uuid,before,after){
 const operations=[],actorFields=changedFields(before.actor,after.actor);
 if(actorFields.length)operations.push({actorUuid:uuid,kind:'actor',fields:actorFields});
 for(const id of new Set([...Object.keys(before.items),...Object.keys(after.items)])){
  const a=before.items[id],b=after.items[id];if(!a&&b)operations.push({actorUuid:uuid,kind:'created',itemId:id,data:copy(b)});
  else if(a&&!b)operations.push({actorUuid:uuid,kind:'deleted',itemId:id,data:copy(a)});
  else{const fields=changedFields(a,b);if(fields.length)operations.push({actorUuid:uuid,kind:'item',itemId:id,fields});}
 }return operations;
}
function assign(target,path,node){const parts=path.split('.');if(parts.some(k=>['__proto__','constructor','prototype'].includes(k)))throw Error('Campo inválido.');let current=target;for(const key of parts.slice(0,-1))current=current[key]??={};if(node.exists)current[parts.at(-1)]=copy(node.value);else delete current[parts.at(-1)];}
export function simulateReversal(snapshot,operation,{forward=false}={}){
 const state=copy(snapshot),op=operation;
 if(op.kind==='created'){if(forward)state.items[op.itemId]=copy(op.data);else delete state.items[op.itemId];}
 else if(op.kind==='deleted'){if(forward)delete state.items[op.itemId];else state.items[op.itemId]=copy(op.data);}
 else{const target=op.kind==='actor'?state.actor:state.items[op.itemId];if(!target)throw Error('O item foi removido após o uso.');for(const field of op.fields)assign(target,field.path,field[forward?'after':'before']);}
 return state;
}
export const reversalOperations=steps=>steps.slice().reverse().flatMap(step=>step.operations.slice().reverse());
export function castParentUuid(message){const f=message?.flags?.[ns]??{};return f.npcCastParent||f.freeDamage?.parentUuid||f.jutsuSecondary?.parentUuid||f.jutsuResistanceRequest?.parentUuid||f.npcJutsuSave?.parentUuid||f.npcTechniqueCheck?.parentUuid||f.npcFreeSave?.parentUuid||f.castRootUuid||'';}
export function messageCastRoot(message,messages=globalThis.game?.messages){let current=message;const seen=new Set();while(current&&!seen.has(current.uuid)){seen.add(current.uuid);const parent=castParentUuid(current);if(!parent)return current;current=messages?.get(parent.split('.').at(-1));}return null;}
export const castUndone=message=>['undoing','undone'].includes(messageCastRoot(message)?.flags?.[ns]?.castUndo?.status);
export function assertCastActive(message){if(castUndone(message))throw Error('Este uso foi desfeito. Use a técnica novamente pela ficha.');}
