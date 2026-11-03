import {DRAWING_EXCLUDED_APTITUDES} from '../data/drawing-aptitudes.mjs';
import {KUCHIYOSE_SPECIES} from '../data/kuchiyose-species.mjs';
import {EVOLUTION,SKILLS} from './rules.mjs';
import {powerSources,summonPact} from './restricted-access.mjs';
import {investmentBudget} from './investment-budget.mjs';
export {KUCHIYOSE_SPECIES};
export const KUCHIYOSE_ATTRIBUTES=['for','des','agi','per','int','vig','esp','car','man'];
export const KUCHIYOSE_SIZES={Miúdo:{min:14,max:20,body:-3,movement:-6,stealth:2},Pequeno:{min:0,max:8,body:-1,movement:-3,stealth:1},Médio:{min:0,max:20,body:0,movement:0,stealth:0},Grande:{min:12,max:20,body:1,movement:3,stealth:-1},Enorme:{min:14,max:20,body:3,movement:6,stealth:-2},Imenso:{min:16,max:20,body:5,movement:9,stealth:-3}};
const ns='sns-v14-dev';
export const SUMMON_GENERATED_PATHS=['system.nc','system.attributes','system.stats','system.statsOriginal','system.recordedSkills','system.recordedSkillsConfigured','system.skillLevels','system.resources.vitality.max','system.resources.chakra.baseMax','system.details.master','system.details.size'];
export function sameSummonData(a,b){const normalized=v=>Array.isArray(v)?v.map(normalized):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalized(v[k])])):v;return JSON.stringify(normalized(a))===JSON.stringify(normalized(b));}
export function generatedSummonEntries(record){if(Array.isArray(record))return record;const get=(o,p)=>p.split('.').reduce((v,k)=>v?.[k],o);return SUMMON_GENERATED_PATHS.map(path=>({path,value:Object.hasOwn(record??{},path)?record[path]:get(record,path)})).filter(r=>r.value!==undefined);}
export function generatedSummonMatches(record,source){return generatedSummonEntries(record).every(({path,value})=>sameSummonData(path.split('.').reduce((v,k)=>v?.[k],source),value));}
export function summonOwnership(current,ownerIds,previous=[]){const ownership={...current},record=[];const rows=Array.isArray(previous)?previous:Object.entries(previous??{}).map(([id,r])=>({id,...r}));for(const r of rows)if(ownership[r.id]===r.applied)ownership[r.id]=r.before??ownership.default??0;for(const id of ownerIds){record.push({id,before:ownership[id]??null,applied:3});ownership[id]=3;}return {ownership,record};}
export const kuchiyoseLink=actor=>actor?.flags?.[ns]?.kuchiyose??null;
export const speciesFor=actor=>Object.values(KUCHIYOSE_SPECIES).find(s=>s.id===actor?.system?.contentId)||KUCHIYOSE_SPECIES[kuchiyoseLink(actor)?.species];
export function summonPower(master,species){if(species==='desenhos'){const power=Array.from(master.items??[]).find(i=>i.type==='power'&&i.system.contentId==='sns:power:pergaminho-da-super-besta');if(!power||power.system.level<1)throw Error('O invocador precisa de Pergaminho da Super Besta.');return power;}const sources=powerSources(master,'sns:power:kuchiyose').filter(p=>p.system.choice?.key===species);if(sources.length!==1)throw Error('O invocador precisa de um único Kuchiyose configurado para esta espécie.');const power=sources[0];if(!Number.isInteger(power.system.level)||power.system.level<1||!summonPact(master,species).met)throw Error('Confira o contrato e o nível de Kuchiyose do invocador.');if(!['common','hijutsu','clan'].includes(power.system.details?.powerOrigin))throw Error('Configure Kuchiyose como poder comum ou de clã/hijutsu antes de construir a criatura.');return power;}
export function summonLimit(master,species,{usedLevel,count=1}={}){
 const def=KUCHIYOSE_SPECIES[species];if(!def)throw Error('Espécie sem perfil de construção.');const power=summonPower(master,species);
 if(!Number.isInteger(usedLevel)||usedLevel<1||usedLevel>power.system.level)throw Error('Nível usado acima do Kuchiyose possuído.');
 if(!Number.isInteger(count)||count<1||count>2||def.unitary&&count!==1)throw Error(def.unitary?'Esta espécie usa invocação unitária.':'Neste perfil, escolha uma ou duas criaturas.');
 return {powerId:power.id,maxNc:Math.min(20,2*usedLevel-(count===2?2:0)),cost:2*usedLevel,common:species!=='desenhos'&&power.system.details?.powerOrigin==='common',origin:power.system.details?.powerOrigin};
}
export function suggestSummonAttributes(nc,species){
 const row=EVOLUTION.find(r=>r.nc===nc),min=row?.minimo_atributo??0,values=Object.fromEntries(KUCHIYOSE_ATTRIBUTES.map(k=>[k,0]));if(nc<4)return values;if(!row)throw Error('NC fora da tabela.');
 for(const k of KUCHIYOSE_ATTRIBUTES.slice(0,7))values[k]=species==='desenhos'&&k==='int'?0:min;
 let remaining=row.atributos-(species==='desenhos'?6:7)*min;const order=[...KUCHIYOSE_SPECIES[species].primary,...KUCHIYOSE_SPECIES[species].primary,...KUCHIYOSE_ATTRIBUTES.slice(0,7)];
 while(remaining>0){let changed=false;for(const k of order)if(!(species==='desenhos'&&k==='int')&&values[k]<nc&&remaining>0){values[k]++;remaining--;changed=true;}if(!changed)throw Error('Não foi possível distribuir os pontos.');}
 values.car=Math.ceil(row.sociais_genin_e_superiores/2);values.man=Math.floor(row.sociais_genin_e_superiores/2);return values;
}
export function summonProjection(master,build,items=[]){
 const species=KUCHIYOSE_SPECIES[build.species],limit=summonLimit(master,build.species,build),nc=build.nc,row=EVOLUTION.find(r=>r.nc===nc),size=KUCHIYOSE_SIZES[build.size];
 if(!Number.isInteger(nc)||nc<1||nc>limit.maxNc||nc>=4&&!row)throw Error('NC deve respeitar o nível usado e a quantidade de criaturas.');
 if(!size||nc<size.min||nc>size.max||Object.keys(KUCHIYOSE_SIZES).indexOf(build.size)>Object.keys(KUCHIYOSE_SIZES).indexOf(species.maxSize)||species.fixedSize&&build.size!==species.fixedSize)throw Error('Tamanho incompatível com o NC ou a espécie.');
 const a=build.attributes;if(!a||KUCHIYOSE_ATTRIBUTES.some(k=>!Number.isInteger(a[k])||a[k]<0))throw Error('Preencha todos os atributos com inteiros não negativos.');
 if(nc<4&&Object.values(a).some(n=>n!==0))throw Error('Abaixo de NC4, não há pontos para distribuir.');
 if(nc>=4){if(KUCHIYOSE_ATTRIBUTES.slice(0,7).some(k=>build.species==='desenhos'&&k==='int'?a[k]!==0:a[k]<row.minimo_atributo||a[k]>nc)||KUCHIYOSE_ATTRIBUTES.slice(0,7).reduce((s,k)=>s+a[k],0)!==row.atributos)throw Error('Distribua exatamente '+row.atributos+' pontos entre os sete atributos, respeitando mínimo '+row.minimo_atributo+' e máximo '+nc+'.');if(a.car+a.man>row.sociais_genin_e_superiores||a.car>Math.floor(nc/2)||a.man>Math.floor(nc/2))throw Error('Confira os pontos sociais.');}
 const bases=build.bases??{cc:3,cd:3,esq:3,lm:3};if(['cc','cd','esq','lm'].some(k=>!Number.isInteger(bases[k])||bases[k]<0)||Object.values(bases).reduce((s,n)=>s+n,0)!==12||Object.values(bases).reduce((s,n)=>s+Math.max(0,n-3),0)>2)throw Error('As bases devem somar12, transferindo até2 pontos das bases3.');
 const actual={...a,for:a.for+size.body,vig:a.vig+size.body},penalty=limit.common?-3:0;
 const stats=Object.fromEntries(['cc','cd','esq','lm'].map((k,i)=>[k,nc<4?0:bases[k]+a[['for','des','agi','per'][i]]+penalty]));
 const velo=!Array.from(items).some(i=>i.type==='armor'&&i.system.equipped&&/pesad/i.test(i.system.details?.weightClass||i.system.details?.category||''))&&(species.grantedAptitudes.includes('sns:apt:velocista')||Array.from(items).some(i=>(i.system.ruleId||i.system.contentId)==='sns:apt:velocista'));
 stats.movement=Math.max(1,10+Math.ceil(a.agi*(velo?2:1)/2)+size.movement+species.movementExtra);stats.initiative=null;
 const skills=SKILLS.map(s=>({key:s.key,precision:nc<4?0:species.skills.includes(s.key)?actual[s.attribute]+(s.key==='furtividade'?size.stealth:0):0,untrained:false}));
 return {species,limit,nc,size:build.size,attributes:actual,originalAttributes:{...a},stats,skillLevels:Object.fromEntries(SKILLS.map(s=>[s.key,nc<4||!species.skills.includes(s.key)?0:Math.max(0,actual[s.attribute])])),statsOriginal:{cc:nc<4?0:bases.cc+a.for,cd:nc<4?0:bases.cd+a.des,esq:nc<4?0:bases.esq+a.agi,lm:nc<4?0:bases.lm+a.per,initiative:null},skills,vitalityMax:build.species==='desenhos'?1:Math.max(1,Math.ceil((10+3*actual.vig+5*nc)/2)),chakraMax:build.species==='desenhos'?0:10+3*a.esp,damage:nc<4?0:Math.max(3,actual.for-3),pp:nc<4?0:Math.floor(nc/2),free:nc<4?0:3};
}
export function summonItemProblems(actor,item,others=actor.items??[]){
 const link=kuchiyoseLink(actor),species=KUCHIYOSE_SPECIES[link?.species];if(!species||link.mode!=='calculated'||!['power','aptitude'].includes(item.type))return [];
 const id=item.system.contentId||item.system.ruleId,problems=[];
 if(item.type==='power'&&(!species.powers.includes(item.system.power?.definitionId||id)||Array.from(others).some(i=>i.id!==item.id&&i.type==='power')))problems.push('A espécie permite no máximo um poder, escolhido da sua lista.');
 if(item.type==='aptitude'&&(link.species==='desenhos'?DRAWING_EXCLUDED_APTITUDES.has(id)||DRAWING_EXCLUDED_APTITUDES.has(item.system.ruleId):!species.aptitudes.includes(id)&&!species.grantedAptitudes.includes(id)))problems.push('Aptidão fora da lista publicada desta espécie.');
 if(actor.system.nc<4)problems.push('Abaixo de NC4, a invocação não possui poderes ou aptidões.');
 if(item.type==='power'&&(item.system.power?.choices??[]).some(c=>!SUMMON_ELEMENTAL_EFFECTS.includes(c.effectId)))problems.push('A invocação só aprende os oito efeitos elementais previstos na sua construção.');
 const list=Array.from(others),candidate={...(item.toObject?.()??item),id:item.id??item._id??'candidate'},budget=investmentBudget({},[...list.filter(i=>i.id!==item.id),candidate]),before=investmentBudget({},list),reducing=list.some(i=>i.id===item.id)&&budget.spent<before.spent;
 if(budget.spent>Math.floor(actor.system.nc/2)&&!reducing)problems.push('Pontos de poder insuficientes para esta invocação.');if(budget.pending.length)problems.push(...budget.pending);
 return problems;
}
export const SUMMON_ELEMENTAL_EFFECTS=['canhao','orbe','flechas','coluna','sopro-destrutivo','raio','missil','ricochete'].map(id=>'sns:effect:'+id);
export function summonUseProblem(actor){const link=kuchiyoseLink(actor);return link?.mode==='calculated'?link.problem||'':link?.mode==='detached'?'Vincule um invocador antes de usar esta construção.':'';}
export function mayEditGeneratedSummonItem(before,after,isGM){if(isGM)return true;const a=before?.flags?.[ns]?.kuchiyoseGenerated,b=after?.flags?.[ns]?.kuchiyoseGenerated;return !a&&!b;}
export function mayEditSummon(before,after,isGM){
 if(isGM)return true;const a=kuchiyoseLink(before),b=kuchiyoseLink(after);if(JSON.stringify(a)!==JSON.stringify(b)||JSON.stringify(before.flags?.[ns]?.kuchiyoseHistory)!==JSON.stringify(after.flags?.[ns]?.kuchiyoseHistory))return false;
 if(a?.mode!=='calculated')return true;
 const fields=['nc','attributes','stats','statsOriginal','skillLevels','recordedSkills','recordedSkillsConfigured'];if(fields.some(k=>JSON.stringify(before.system[k])!==JSON.stringify(after.system[k])))return false;
 return before.system.resources.vitality.max===after.system.resources.vitality.max&&before.system.resources.chakra.baseMax===after.system.resources.chakra.baseMax&&before.system.details.master===after.system.details.master&&before.system.details.size===after.system.details.size;
}
