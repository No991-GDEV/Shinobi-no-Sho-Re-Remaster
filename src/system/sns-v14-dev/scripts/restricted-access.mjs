import {transplantSources,transplantProfile,EYE_STAGES} from './characteristic-effects.mjs';
import {PACKAGE_ORIGINS} from '../data/package-content.mjs';
// These are explicit mechanical grants on an origin item, never names or traits.
export const ACCESS_ORIGINS=Object.freeze({...Object.fromEntries(Object.entries(PACKAGE_ORIGINS).map(([id,p])=>[id,p.name])),uchiha:'Clã Uchiha',hatake:'Clã Hatake',tensai:'Tensai (Hijutsu)',jinchuuriki:'Jinchuuriki','monges-templo-fogo':'Aprendizado com monges do Templo do Fogo'});
export const ORIGIN_TYPES=Object.freeze(['clan','hijutsu','feature']);
export function isOriginItem(item){return ORIGIN_TYPES.includes(item?.type)||item?.type==='power'&&item?.system?.contentId==='sns:power:jinchuuriki';}
export function originGrant(item){const key=item?.system?.details?.accessRule;return isOriginItem(item)&&ACCESS_ORIGINS[key]&&(item.type!=='power'||key==='jinchuuriki')?key:'';}
export function accessSources(actor,key){return Array.from(actor?.items??[]).filter(i=>{const grant=originGrant(i);return grant===key||PACKAGE_ORIGINS[grant]?.aliases?.includes(key);});}
export function packageAcquisitionProblems(item,actor){
 const key=originGrant(item),spec=PACKAGE_ORIGINS[key];if(!key||!actor)return [];
 const existing=Array.from(actor.items??[]).filter(i=>i!==item).map(originGrant).filter(Boolean);
 if(existing.includes(key))return ['A ficha já possui esta origem.'];
 if(!spec?.primary&&key!=='jinchuuriki')return [];
 const primary=[...new Set([...existing.filter(k=>PACKAGE_ORIGINS[k]?.primary||k==='jinchuuriki'),key])];
 // Explicit Basic/Vol.2 choices and complementary Hibon/Tensai form one package.
 const pairs=[['tensai','hatake'],['tensai','sarutobi'],['tensai','senju'],['tensai','shimura'],['tensai','hibon-ninpou']];
 const connected=new Set([primary[0]]);let changed=true;
 while(changed){changed=false;for(const [a,b] of pairs)if(primary.includes(a)&&primary.includes(b)&&(connected.has(a)||connected.has(b))){const n=connected.size;connected.add(a);connected.add(b);changed||=connected.size>n;}}
 return primary.some(k=>!connected.has(k))?['A ficha já possui outro clã ou hijutsu. Esta combinação não é permitida pelas regras.']:[];
}
export function summonPact(actor,species){
 const pacts=Array.from(actor?.items??[]).filter(i=>PACKAGE_ORIGINS[originGrant(i)]?.species);
 const matching=pacts.filter(i=>PACKAGE_ORIGINS[originGrant(i)].species===species);
 // Preserve the already-authorized Hatake/Cães path in historical owned copies.
 const legacy=species==='caes'&&accessSources(actor,'hatake').length>0;
 const exclusive={baku:'shimura',doki:'mateki',tubaroes:'hoshigaki'}[species];
 const met=(!exclusive||accessSources(actor,exclusive).length>0)&&(matching.length>0||legacy)&&pacts.every(i=>PACKAGE_ORIGINS[originGrant(i)].species===species);
 return {met,current:met?'Contrato':pacts.length?pacts.map(i=>i.name).join(', '):'Contrato ausente'};
}
export function eyeAccess(actor,stage='Sharingan'){
 const natural=accessSources(actor,'uchiha');
 if(natural.length)return {met:true,current:natural.map(i=>i.name).join(', ')};
 const needed=EYE_STAGES[stage]?.pp;
 const transplanted=transplantSources(actor).filter(i=>{const p=transplantProfile(actor,i);return p.valid&&needed!==undefined&&EYE_STAGES[p.stage]?.pp>=needed;});
 return {met:!!transplanted.length,current:transplanted.length?transplanted.map(i=>i.name+' · '+i.system.details.eyeStage).join(', '):'Origem Uchiha ou transplante compatível não autorizado'};
}
// Explicit identities of the two historical paired purchases; do not split their PP.
const LEGACY_PAIRED=new Set(['224bc8540354641d','2767ef51c74fcc5b']);
export function powerSources(actor,id){return Array.from(actor?.items??[]).filter(i=>i.type==='power'&&(i.system?.contentId===id||i.system?.power?.definitionId===id||i.system?.contentId==='sns:power:versatilidade'&&i.system.choice?.kind==='powerPair'&&String(i.system.choice.key??'').split('|').includes(id.replace('sns:power:',''))||id==='sns:power:versatilidade'&&LEGACY_PAIRED.has(i.flags?.['sns-v14-dev']?.d108ReferenceKey)));}
export function powerLevel(actor,id){
 const candidates=powerSources(actor,id);
 const levels=candidates.map(i=>i.system?.level).filter(n=>Number.isInteger(n)&&n>=0);
 return levels.length?Math.max(...levels):null;
}
export function mayAcquireOrigin(item,isGM,actor=item?.actor??item?.parent){return !originGrant(item)||isGM||!!actor?.isOwner;}
