import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../src/system/sns-v14-dev/',import.meta.url));
async function walk(dir){const files=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);files.push(...(e.isDirectory()?await walk(p):[p]));}return files;}
test('the shipped system contains every relative ESM dependency, including the rules data directory',async()=>{
 const all=await walk(root),modules=all.filter(f=>f.endsWith('.mjs')),missing=[];assert(modules.length>=240);
 for(const file of modules){const text=await fs.readFile(file,'utf8');for(const match of text.matchAll(/(?:from\s*|import\s*\()\s*['"](\.[^'"]+)['"]/g)){
  const target=path.resolve(path.dirname(file),match[1].split('?')[0]);assert(target.startsWith(root),'Import escaped the package: '+file);try{await fs.access(target);}catch{missing.push({file:path.relative(root,file),dependency:match[1]});}
 }}assert.deepEqual(missing,[]);
 const data=await fs.readdir(path.join(root,'data'));for(const name of ['power-definitions.mjs','condition-statuses.mjs','optional-sources.mjs','legado-rules.mjs'])assert(data.includes(name),'Missing rules: '+name);
});
