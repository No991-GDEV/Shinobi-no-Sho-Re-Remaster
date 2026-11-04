// One book definition; actor-specific investment, choices and links remain on the owned copy.
import {aptitudeChoiceStatus} from './aptitude-choices.mjs';
import {OPTIONAL_SOURCES,sourceEnabled,sourceAvailable,optionalSourceId} from '../data/optional-sources.mjs';
export const BASIC_PACK='sns-conteudo-dev.basico';
export const LEGACY_BASIC_PACK='world.sns-basico-canonico';
export const HISTORICAL_PACK='world.time7-referencias-d108';
export const isAcquisitionPack=pack=>sourceAvailable(pack)&&![HISTORICAL_PACK,LEGACY_BASIC_PACK,'sns-conteudo-dev.venenos-basico-historico'].includes(pack.collection);
export const isCatalogWorldItem=item=>!Object.hasOwn(item.flags?.['sns-v14-dev']??{},'d099');
export const LIBRARY_URL='modules/sns-conteudo-dev/content/basico-canonico-v1.json';
let libraryPromise;
export async function contentSha256(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),n=>n.toString(16).padStart(2,'0')).join('');}
const decodedQuotes=text=>String(text??'').replace(/&quot;/g,'"').replace(/&#(?:x27|0*39);/gi,"'");
// Foundry serializes quotes in text nodes. This is not an edit to a book's words.
export const sameBookHtml=(a,b)=>decodedQuotes(a)===decodedQuotes(b);
export function sourceQuoteEncoding(html){return String(html??'').split(/(<[^>]*>)/g).map((part,n)=>n%2?part:decodedQuotes(part).replace(/"/g,'&quot;').replace(/'/g,'&#x27;')).join('');}
export async function hasPublishedTextEdits(item){const record=item.flags?.['sns-v14-dev']?.canonicalContent;if(!record?.bodySha256)return false;return await contentSha256(item.system.description)!==record.bodySha256&&await contentSha256(sourceQuoteEncoding(item.system.description))!==record.bodySha256;}
async function loadBaseLibrary(){
 if(!libraryPromise){const task=fetch(LIBRARY_URL).then(r=>{if(!r.ok)throw Error('Biblioteca indisponível.');return r.json();}).then(value=>{if(!Array.isArray(value?.entries))throw Error('Biblioteca incompleta.');return value;}).catch(()=>{if(libraryPromise===task)libraryPromise=null;return null;});libraryPromise=task;}
 return libraryPromise;
}
const optionalPromises=new Map(),mergedLibraries=new WeakMap();
export function resetCanonicalLibrary(){libraryPromise=null;optionalPromises.clear();}
export async function loadCanonicalLibrary(){
 const base=await loadBaseLibrary();if(!base)return null;
 const active=OPTIONAL_SOURCES.filter(s=>sourceEnabled(s.id));if(!active.length)return base;
 const libraries=[],errors=[];
 for(const source of active){
  if(!optionalPromises.has(source.id)){const task=fetch(source.file).then(r=>{if(!r.ok)throw Error(source.label);return r.json();}).then(l=>{if(!Array.isArray(l?.entries)||l.entries.some(e=>!e.id?.startsWith('sns:legado:')))throw Error(source.label);return l;}).catch(()=>{optionalPromises.delete(source.id);return null;});optionalPromises.set(source.id,task);}
  const library=await optionalPromises.get(source.id);if(library)libraries.push(library);else errors.push(source.label);
 }
 if(errors.length)return {...base,optionalErrors:errors};
 const signature=active.map(s=>s.id).join('|');let cache=mergedLibraries.get(base);if(!cache){cache=new Map();mergedLibraries.set(base,cache);}if(cache.has(signature))return cache.get(signature);
 const entries=[...base.entries,...libraries.flatMap(l=>l.entries)];if(new Set(entries.map(e=>e.id)).size!==entries.length)throw Error('Identidades de conteúdo duplicadas.');
 const merged={...base,entries};cache.set(signature,merged);return merged;
}
export function canonicalEntry(item,library){
 if(!library)return null;
 const system=item.system??{},key=item.flags?.['sns-v14-dev']?.d108ReferenceKey;
 const id=system.contentId||library.referenceMap?.[key]?.id||system.power?.definitionId;
 return canonicalIndex(library).get(id)||library.entries.find(e=>e.ruleIds.includes(system.ruleId))||null;
}
export function canonicalVariant(item,entry){return aptitudeChoiceStatus(item).label||entry?.variants.find(v=>v.ruleId===item.system?.ruleId)?.label||'';}
export function canonicalCopy(entry,variantId='',choiceKey=''){
 const data=structuredClone(entry.document),variant=entry.variants.find(v=>v.id===variantId)??entry.variants[0];
 if(variant){data.system.ruleId=variant.ruleId;if(variant.level)data.system.level=variant.level;}
 if(choiceKey){data.system.choice={kind:entry.choiceType,key:choiceKey};if(!aptitudeChoiceStatus(data).valid)throw Error('Escolha inválida para esta aptidão.');}
 const sourceFlags=optionalSourceId(data)?structuredClone(data.flags?.['sns-v14-dev']??{}):{};
 data.flags={'sns-v14-dev':{...sourceFlags,canonicalContent:{id:entry.id,revision:entry.revision,bodySha256:entry.verifiedSource.bodySha256}}};
 return data;
}
const auditTags=new Set(['Time 7','Clássico','Referência D108']);
export function canonicalTextPatch(item,entry,library,{user='',at=''}={}){
 const current=item.system,book=entry.document.system;
 const sameId=current.contentId===entry.id,sameText=sameBookHtml(current.description,book.description);
 const reference=library.referenceMap?.[item.flags?.['sns-v14-dev']?.d108ReferenceKey];
 const knownNames=new Set([entry.document.name,...Object.values(library.referenceMap??{}).filter(r=>r.id===entry.id).map(r=>r.referenceName)]);
 // A custom name is a character choice, not a second definition of the rule.
 const rename=knownNames.has(item.name)||reference?.referenceName===item.name;
 const name=rename?entry.document.name:item.name;
 const rulePatch={};
 if(reference?.personalNotes&&!sameId&&!current.personalNotes)rulePatch['system.personalNotes']=reference.personalNotes;
 if(reference&&!current.ruleId&&entry.document.system.ruleId)rulePatch['system.ruleId']=entry.document.system.ruleId;
 if(reference&&(!sameId||reference.migrateManualOrigin&&['manual','other'].includes(current.details?.powerOrigin))){
  if(reference.powerOrigin&&current.details?.powerOrigin!==reference.powerOrigin)rulePatch['system.details.powerOrigin']=reference.powerOrigin;
  for(const [key,value] of Object.entries(reference.grants??{}))if(!current.details?.[key])rulePatch['system.details.'+key]=value;
 }
 if(reference?.choice&&!current.choice?.key){const proposed={system:{...current,ruleId:rulePatch['system.ruleId']??current.ruleId,contentId:entry.id,choice:reference.choice}};if(aptitudeChoiceStatus(proposed).valid)rulePatch['system.choice']=structuredClone(reference.choice);}
 const tags=(current.tags??[]).filter(t=>!auditTags.has(t));
 const sameSource=JSON.stringify(current.source)===JSON.stringify(book.source);
 if(!Object.keys(rulePatch).length&&sameId&&sameText&&sameSource&&name===item.name&&JSON.stringify(tags)===JSON.stringify(current.tags??[]))return null;
 const history=Array.from(item.flags?.['sns-v14-dev']?.contentHistory??[]);
 history.push({at,user,contentId:entry.id,before:{name:item.name,personalNotes:current.personalNotes??'',description:current.description,source:structuredClone(current.source),tags:[...(current.tags??[])],contentId:current.contentId??'',ruleId:current.ruleId??'',choice:structuredClone(current.choice??{}),details:structuredClone(current.details??{})}});
 return {name,...rulePatch,'system.contentId':entry.id,'system.description':book.description,'system.source':structuredClone(book.source),'system.tags':tags,
  'flags.sns-v14-dev.canonicalContent':{id:entry.id,revision:entry.revision,bodySha256:entry.verifiedSource.bodySha256},'flags.sns-v14-dev.contentHistory':history};
}
export function preferCanonicalRows(rows,library){
 const published=new Set(rows.filter(r=>r.contentId).map(r=>r.contentId));
 return rows.filter(row=>{
  const id=library?.referenceMap?.[row.referenceKey]?.id;
  if(id&&published.has(id))return false;
  return !(row.builtin&&published.has(row.id));
 });
}

const canonicalIndexes=new WeakMap();
export function canonicalIndex(library){const rows=Array.isArray(library)?library:library.entries;if(!canonicalIndexes.has(rows))canonicalIndexes.set(rows,new Map(rows.map(e=>[e.id,e])));return canonicalIndexes.get(rows);}
