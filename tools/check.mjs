import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import crypto from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),variant=process.argv.includes('--local')?'local':'github',dist=path.join(root,'dist',variant);
const read=async p=>JSON.parse(await fs.readFile(p,'utf8')),s=await read(path.join(dist,'system.json')),m=await read(path.join(dist,'module.json')),r=await read(path.join(dist,'build-report.json'));
if(!s.socket||s.relationships.requires[0].id!==m.id||s.relationships.requires[0].manifest!==m.manifest||s.version!==m.version||s.version!==r.version)throw Error('Manifestos/dependências divergentes.');
if(m.esmodules.length)throw Error('Módulo de conteúdo não pode carregar fixtures de desenvolvimento.');
for(const manifest of [s,m])for(const key of ['manifest','download']){const u=new URL(manifest[key]);if(variant==='github'&&u.protocol!=='https:')throw Error('Release pública exige HTTPS.');if(variant==='github'&&/localhost|127\.0\.0\.1|SEU_USUARIO|example\.com/.test(u.href))throw Error('URL de desenvolvimento na release.');}
if(r.packs.length!==13||r.packs.find(p=>p.name==='basico').count!==424||r.packs.find(p=>p.name==='bestiario-anime').count!==75)throw Error('Contagens de compêndio divergentes.');
for(const row of r.archives){const bytes=await fs.readFile(path.join(dist,row.filename));if(crypto.createHash('sha256').update(bytes).digest('hex')!==row.sha256)throw Error('ZIP alterado: '+row.filename);}
console.log(JSON.stringify({passed:true,variant,packs:r.packs.length,documents:r.total,version:r.version}));
