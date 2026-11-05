import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {filterCatalog,catalogTabFor,mayBrowseCatalogRow} from '../src/system/sns-v14-dev/scripts/catalog-core.mjs';
import {isAcquisitionPack,resetCanonicalLibrary} from '../src/system/sns-v14-dev/scripts/canonical-content.mjs';
const content=new URL('../src/content/sns-conteudo-dev/content/',import.meta.url),files=['basico-canonico-v1.json','bestiario-canonico-v1.json','bestiario-anime-v1.json','legado-do-odio-v1.json'],libraries=files.map(f=>JSON.parse(fs.readFileSync(new URL(f,content),'utf8'))),entries=libraries.flatMap(l=>l.entries),manifest=JSON.parse(fs.readFileSync(new URL('../src/content/sns-conteudo-dev/module.json',import.meta.url),'utf8'));
globalThis.foundry={applications:{api:{ApplicationV2:class{},HandlebarsApplicationMixin:Base=>Base,DialogV2:class{}}}};
globalThis.fetch=async url=>({ok:true,json:async()=>libraries[files.indexOf(String(url).split('/').at(-1))]});
const {SnsCatalog}=await import('../src/system/sns-v14-dev/scripts/catalog-browser.mjs');
function setup(isGM,optional=true){
 globalThis.game={user:{id:isGM?'gm':'player',isGM},settings:{get:()=>optional},items:[],packs:manifest.packs.map(p=>({collection:'sns-conteudo-dev.'+p.name,documentName:p.type,metadata:p,testUserPermission:()=>isGM||p.ownership?.PLAYER==='OBSERVER'||p.name==='legado-do-odio'&&optional,getIndex:async()=>entries.filter(e=>(e.publicationPack??'basico')===p.name).map(e=>({_id:e.id.replaceAll(':','-'),...structuredClone(e.document)}))}))};resetCanonicalLibrary();
}
const expected=isGM=>entries.filter(e=>isAcquisitionPack({collection:'sns-conteudo-dev.'+(e.publicationPack??'basico')})).filter(e=>isGM||!['npc','companion','hazard'].includes(e.document.type));
for(const role of ['GM/NPC','jogador/PJ'])test('catalogue opened from '+role+' loads every permitted acquisition entry and can find it by name',async()=>{
 const isGM=role==='GM/NPC';setup(isGM);const app=new SnsCatalog({actor:{isOwner:true,type:isGM?'npc':'shinobi'},category:'techniques'});await app.load();const missing=[];
 for(const e of expected(isGM)){const row=app.rows.find(r=>r.contentId===e.id);if(!row){missing.push(e.id);continue;}const hit=filterCatalog(app.rows,{query:row.name,isGM,includeWorld:false});if(!hit.some(r=>r.uuid===row.uuid))missing.push(e.id+': search');const tab=filterCatalog(app.rows,{tab:catalogTabFor(row),isGM,includeWorld:false});assert(tab.some(r=>r.uuid===row.uuid),e.id+': category');}
 assert.deepEqual(missing,[]);const scorpion=filterCatalog(app.rows,{query:'Kuchiyose: Escorpião',isGM});assert(scorpion.some(r=>r.contentId==='sns:feature:hb-f05-kuchiyose-escorpiao'));assert(scorpion.some(r=>r.type==='feature'));
 const inaccessible=app.rows.filter(r=>!mayBrowseCatalogRow(r,isGM));assert.equal(inaccessible.length,0);console.log(JSON.stringify({role,published:expected(isGM).length,catalogRows:app.rows.length,missing:missing.length,scorpion:scorpion.map(r=>({name:r.name,type:r.type}))}));
});
test('optional books stay hidden when disabled, independently of entering from a sheet',async()=>{setup(false,false);const app=new SnsCatalog({actor:{isOwner:true,type:'shinobi'},category:'features'});await app.load();assert(!app.rows.some(r=>r.contentId?.startsWith('sns:legado:')));assert(app.rows.some(r=>r.contentId==='sns:feature:hb-f05-kuchiyose-escorpiao'));});
