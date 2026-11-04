import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {releaseManifests} from './manifest.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(process.env.SNS_CLASSIC_LEVEL_PACKAGE??path.join(root,'package.json'));
const {ClassicLevel}=require('classic-level');
const config=JSON.parse(await fs.readFile(path.join(root,'release.config.json'),'utf8'));
const baseUrl=process.argv.find(a=>a.startsWith('--base-url='))?.slice(11);
if(baseUrl&&!/^http:\/\/127\.0\.0\.1:\d+$/.test(baseUrl))throw Error('URL de teste deve ser loopback.');
const variant=baseUrl?'local':'github',run=path.join(root,'build',variant+'-'+Date.now()),dist=path.join(root,'dist',variant),staging=path.join(run,'packages');
await fs.mkdir(staging,{recursive:true});await fs.mkdir(dist,{recursive:true});
const source=path.join(root,'src'),systemSource=path.join(source,'system',config.systemId),moduleSource=path.join(source,'content',config.moduleId);
const systemTarget=path.join(staging,config.systemId),moduleTarget=path.join(staging,config.moduleId);
async function copy(from,to){await fs.mkdir(to,{recursive:true});for(const e of await fs.readdir(from,{withFileTypes:true})){const src=path.join(from,e.name),dst=path.join(to,e.name);if(e.isSymbolicLink())throw Error('Symlink proibido: '+src);if(e.isDirectory())await copy(src,dst);else await fs.copyFile(src,dst);}}
await copy(systemSource,systemTarget);await copy(moduleSource,moduleTarget);
const read=async file=>JSON.parse(await fs.readFile(file,'utf8')),write=async(file,data)=>fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
const manifests=releaseManifests(await read(path.join(systemSource,'system.json')),await read(path.join(moduleSource,'module.json')),config,baseUrl);
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const libraries=await Promise.all(['basico-canonico-v1.json','bestiario-canonico-v1.json','bestiario-anime-v1.json','legado-do-odio-v1.json'].map(n=>read(path.join(moduleSource,'content',n))));
const entries=libraries.flatMap(l=>l.entries),definitions=manifests.content.packs,packFor=e=>e.publicationPack??'basico';
if(new Set(entries.map(e=>e.id)).size!==entries.length)throw Error('Identidades duplicadas.');
const unknown=entries.filter(e=>!definitions.some(p=>p.name===packFor(e)));if(unknown.length)throw Error('Pack sem manifesto: '+unknown[0].id);
const packs=[];
for(const def of definitions){
 const selected=entries.filter(e=>packFor(e)===def.name),documents=selected.map((e,n)=>({...structuredClone(e.document),_id:hash(e.id).slice(0,16),folder:null,sort:(n+1)*100000,ownership:{default:0},effects:[],flags:{...structuredClone(e.document.flags??{}),[config.systemId]:{...structuredClone(e.document.flags?.[config.systemId]??{}),canonicalContent:{id:e.id,revision:e.revision,bodySha256:e.verifiedSource.bodySha256}}},_stats:{coreVersion:'14.367',systemId:config.systemId,systemVersion:config.version,createdTime:null,modifiedTime:null,lastModifiedBy:null,compendiumSource:null,duplicateSource:null,exportSource:null}}));
 if(!documents.length)throw Error('Pack vazio: '+def.name);
 const db=new ClassicLevel(path.join(moduleTarget,def.path),{keyEncoding:'utf8',valueEncoding:'json'});await db.open();
 try{
  const store=db.sublevel(def.type==='Actor'?'actors':'items',{keyEncoding:'utf8',valueEncoding:'json'}),records=structuredClone(documents),embedded=[];
  if(def.type==='Actor')for(const actor of records){for(const item of actor.items??[])embedded.push({type:'put',key:actor._id+'.'+item._id,value:item});actor.items=(actor.items??[]).map(i=>i._id);}
  if(embedded.length)await db.sublevel('actors.items',{keyEncoding:'utf8',valueEncoding:'json'}).batch(embedded);
  await store.batch(records.map(d=>({type:'put',key:d._id,value:d})));
  const saved=await store.values().all();if(saved.length!==records.length)throw Error('Falha de contagem: '+def.name);
  const savedMap=new Map(saved.map(d=>[d._id,d]));for(const doc of records)if(JSON.stringify(doc)!==JSON.stringify(savedMap.get(doc._id)))throw Error('Falha de persistência: '+doc.name);
  packs.push({name:def.name,type:def.type,count:records.length,embeddedItems:embedded.length,ids:documents.map(d=>d._id)});
 }finally{await db.close();}
 // Remove only non-data files from this brand-new, already closed build DB.
 for(const name of await fs.readdir(path.join(moduleTarget,def.path)))if(name==='LOCK'||name==='LOG'||name.startsWith('LOG.old'))await fs.unlink(path.join(moduleTarget,def.path,name));
}
await write(path.join(systemTarget,'system.json'),manifests.system);await write(path.join(moduleTarget,'module.json'),manifests.content);
if(!baseUrl){await write(path.join(root,'system.json'),manifests.system);await write(path.join(root,'module.json'),manifests.content);}
for(const [target,manifest,name]of [[systemTarget,manifests.system,'system'],[moduleTarget,manifests.content,'module']]){
 const filename=`${manifest.id}-${config.version}.zip`,temp=path.join(run,filename);
 const zip=spawnSync(process.env.SNS_PYTHON??'python3',[path.join(root,'tools/zip.py'),target,temp],{encoding:'utf8'});if(zip.status!==0)throw Error(zip.stderr||zip.stdout||'Falha de ZIP.');
 await fs.copyFile(temp,path.join(dist,filename));await write(path.join(dist,name+'.json'),manifest);
}
const archives=await Promise.all(['system','content'].map(async key=>{const filename=`${manifests[key].id}-${config.version}.zip`,bytes=await fs.readFile(path.join(dist,filename));return {filename,bytes:bytes.length,sha256:hash(bytes)};}));
const summary={version:config.version,variant,total:entries.length,packs,archives,manifests:{system:manifests.system.manifest,content:manifests.content.manifest},sourceHashes:await Promise.all(['basico-canonico-v1.json','bestiario-canonico-v1.json','bestiario-anime-v1.json','legado-do-odio-v1.json'].map(async file=>({file,sha256:hash(await fs.readFile(path.join(moduleSource,'content',file)))})))};
await write(path.join(dist,'build-report.json'),summary);await fs.writeFile(path.join(dist,'SHA256SUMS'),archives.map(r=>`${r.sha256}  ${r.filename}`).join('\n')+'\n');
console.log(JSON.stringify({version:config.version,variant,total:entries.length,packs:packs.map(({ids,...r})=>r),archives}));
