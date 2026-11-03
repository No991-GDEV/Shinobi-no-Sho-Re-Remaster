import {ITEM_RULES,requirementsFor} from './item-requirements.mjs';
import {PACKAGE_ORIGINS} from '../data/package-content.mjs';
import {packageAcquisitionProblems,accessSources,summonPact} from './restricted-access.mjs';
import {canonicalCopy} from './canonical-content.mjs';
import {materializeBookPowerGrants} from './book-power-grants.mjs';
import {investmentBudget,freeEligible} from './investment-budget.mjs';
import {aptitudeChoiceOptions,aptitudeChoiceStatus,aptitudeChoiceType} from './aptitude-choices.mjs';
import {SKILLS,EVOLUTION} from './rules.mjs';
import {generatorActorView} from './npc-generator-core.mjs';
import {EQUIPMENT_DEFINITIONS} from '../data/equipment-definitions.mjs';
import {npcElementalRequirements,BASIC_NPC_ELEMENTS} from './npc-elemental-policy.mjs';
import {NPC_VILLAGES,NPC_ORIGIN_VILLAGES,NPC_COMMON_PRIORITIES,NPC_STYLES,NPC_FOCUSES,NPC_ROLES,NPC_ELEMENTS,npcRandom,npcShuffle} from '../data/npc-build-profiles.mjs';
const ns='sns-v14-dev',keys=['for','des','agi','per','int','vig','esp'],fold=s=>String(s??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase(),fail=m=>{throw Error(m);};
export function newNpcBuildDraft(){return {version:2,createCompanion:true,name:'',nc:4,role:'npc',style:'ninjutsu',focus:'balanced',village:'',origin:'',element:'auto',secondElement:'none',size:'Médio',foreignOrigin:false,reinforcedDefense:true,seed:1,pins:{},effects:{},excludedTechniques:[],events:{mangekyouTrauma:false},summonSpecies:'caes',jionguHearts:['katon','','','',''],falseBijuuTails:1,puppetSize:'auto',puppetCount:1,puppetPreset:'attack',puppetDevices:[],drawingsCount:1,weapon:'sns:equipment:kunai',partyNC:4,players:3,partyArea:false};}
export function validateNpcBuildDraft(input){
 if(!input||typeof input!=='object'||Array.isArray(input))fail('Configuração de NPC inválida.');
 const d={...newNpcBuildDraft(),...structuredClone(input)};
 d.puppetSize??='auto';d.puppetCount??=1;d.puppetPreset??='attack';d.puppetDevices??=[];d.drawingsCount??=1;
 if(!Number.isSafeInteger(d.nc)||d.nc<4||d.nc>20)fail('Escolha um NC de 4 a 20.');
 for(const [key,rows]of [['role',NPC_ROLES],['style',NPC_STYLES],['focus',NPC_FOCUSES],['village',NPC_VILLAGES],['element',NPC_ELEMENTS]])if(!rows.some(r=>r.id===d[key]))fail('Opção inválida: '+key+'.');
 if(!['none',...BASIC_NPC_ELEMENTS].includes(d.secondElement))fail('Segundo elemento inválido.');
 if(typeof d.foreignOrigin!=='boolean'||typeof d.reinforcedDefense!=='boolean'||!Number.isSafeInteger(d.seed)||d.seed<1||d.seed>4294967295)fail('Opção de geração inválida.');
 if(typeof d.name!=='string'||d.name.length>100||typeof d.origin!=='string'||typeof d.pins!=='object'||!d.pins||Array.isArray(d.pins)||Object.keys(d.pins).length>200)fail('Escolhas de compra inválidas.');
 if(!['auto','Pequeno','Médio','Grande'].includes(d.puppetSize)||!Number.isSafeInteger(d.puppetCount)||d.puppetCount<1||d.puppetCount>4||!['attack','defense','capture','custom'].includes(d.puppetPreset)||!Array.isArray(d.puppetDevices)||d.puppetDevices.length>12||d.puppetDevices.some(d=>!d||typeof d.slug!=='string'||!['l','p','g',''].includes(d.slot)))fail('Construção de marionete inválida.');
 if(![1,2].includes(d.drawingsCount))fail('Escolha um ou dois Desenhos.');
 if(typeof d.createCompanion!=='boolean')fail('Opção de invocação inválida.');
 if(!Array.isArray(d.jionguHearts)||d.jionguHearts.length!==5||!BASIC_NPC_ELEMENTS.includes(d.jionguHearts[0])||d.jionguHearts.some(n=>n!==''&&!BASIC_NPC_ELEMENTS.includes(n)))fail('Escolha as naturezas dos corações. O primeiro coração precisa de um elemento.');
 if(!Number.isSafeInteger(d.falseBijuuTails)||d.falseBijuuTails<1||d.falseBijuuTails>9)fail('Escolha de uma a nove caudas para a bijuu.');
 if(typeof d.events?.mangekyouTrauma!=='boolean')fail('Informe a condição de despertar.');
 if(!['Minúsculo','Diminuto','Miúdo','Pequeno','Médio','Grande','Enorme','Imenso','Colossal','Incrível'].includes(d.size))fail('Tamanho inválido.');
 if(typeof d.summonSpecies!=='string'||!Object.values(PACKAGE_ORIGINS).some(p=>p.species===d.summonSpecies))fail('Contrato de invocação inválido.');
 if(typeof d.weapon!=='string'||d.weapon.length>150||typeof d.effects!=='object'||!d.effects||Array.isArray(d.effects))fail('Escolhas de equipamento ou efeitos inválidas.');
 for(const [id,p]of Object.entries(d.pins))if(id==='__proto__'||!p||typeof p!=='object'||typeof p.selected!=='boolean'||p.level!==undefined&&(!Number.isSafeInteger(p.level)||p.level<1||p.level>10)||p.choiceKey!==undefined&&(typeof p.choiceKey!=='string'||p.choiceKey.length>150))fail('Escolha de compra inválida.');
 if(!Array.isArray(d.excludedTechniques)||d.excludedTechniques.length>500||d.excludedTechniques.some(s=>typeof s!=='string'||s.length>250))fail('Seleção de técnicas inválida.');
 if(!Number.isSafeInteger(d.partyNC)||d.partyNC<4||d.partyNC>20||!Number.isSafeInteger(d.players)||d.players<1||d.players>20||typeof d.partyArea!=='boolean')fail('Dados do encontro inválidos.');
 return d;
}
export function npcOriginOptions(library,village='',allowForeign=false){
 const entries=Array.isArray(library)?library:library.entries;
 const rows=Object.entries(PACKAGE_ORIGINS).filter(([key,p])=>entries.some(e=>e.id===p.contentId&&['clan','hijutsu'].includes(e.document.type))).map(([key,p])=>{
  const e=entries.find(e=>e.id===p.contentId),base=key.replace(/^hb-f05-/,''),villages=NPC_ORIGIN_VILLAGES[key]??NPC_ORIGIN_VILLAGES[base];
  const compatible=!village||allowForeign||villages?.includes(village)||!villages&&e.document.type==='hijutsu';
  return {id:key,name:e.document.name,contentId:p.contentId,type:e.document.type,compatible,villages:villages??[],source:e.document.system.source};
 }).filter((r,i,all)=>all.findIndex(x=>x.id===r.id)===i).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 return rows.map(r=>({...r,name:r.name+(rows.filter(o=>o.name===r.name).length>1?' · '+(r.id.startsWith('hb-')?'Enciclopédia':'Básico'):'')}));
}
const catalogCache=new WeakMap();
export function npcBuildCatalog(library){
 const entries=Array.isArray(library)?library:library.entries;if(catalogCache.has(entries))return catalogCache.get(entries);const map=new Map();
 for(const e of entries){if(!['power','aptitude'].includes(e.document.type)&&!['sns:jutsu:amaterasu','sns:jutsu:tsukuyomi','sns:jutsu:susanoo'].includes(e.id))continue;
  if(e.variants?.length){for(const v of e.variants){const id=v.ruleId||e.id;if(!map.has(id))map.set(id,{id,entry:e,variant:v.id,name:e.document.name+(e.variants.length>1?' · '+v.label:''),type:e.document.type});}}
  else map.set(e.document.system.ruleId||e.id,{id:e.document.system.ruleId||e.id,entry:e,variant:'',name:e.document.name,type:e.document.type});
 }
 catalogCache.set(entries,map);return map;
}
function originKeys(req){if(req.kind==='access')return [req.key];if(req.kind==='eyeAccess')return ['uchiha'];return (req.options??[]).flatMap(originKeys);}
export function npcOriginPurchases(library,origin){
 const catalog=npcBuildCatalog(library),root=PACKAGE_ORIGINS[origin],related=(root?.related??[]).map(fold),selected=new Set();
 for(const [id,row]of catalog){const rule=ITEM_RULES[id]??ITEM_RULES[row.entry.id],access=(rule?.requirements??[]).flatMap(originKeys);
  if(access.includes(origin)||origin==='uchiha'&&/sharingan/.test(id)||related.some(s=>fold(row.entry.document.name)===s||fold(row.entry.document.name).startsWith(s+' (')))selected.add(id);
 }
 // Additional purchases depending on a clan technique stay in the same origin list.
 for(let pass=0;pass<5;pass++)for(const [id,row]of catalog){const refs=JSON.stringify((ITEM_RULES[id]??ITEM_RULES[row.entry.id])?.requirements??[]);if([...selected].some(k=>refs.includes('"'+k+'"')))selected.add(id);}
 for(const power of ({uchiha:['katon'],sarutobi:['katon'],hoshigaki:['suiton'],hozuki:['suiton'],yotsuki:['raiton']}[origin]??[]))if(catalog.has('sns:power:'+power))selected.add('sns:power:'+power);
 return [...selected].map(id=>catalog.get(id));
}
export function npcBases(style){return style==='taijutsu'?{cc:5,cd:3,esq:3,lm:1}:style==='genjutsu'?{cc:3,cd:3,esq:5,lm:1}:{cc:3,cd:5,esq:3,lm:1};}
function freshContext(d,entries,catalog){const row=EVOLUTION.find(r=>r.nc===d.nc);return {d,entries,catalog,row,items:[],min:Object.fromEntries(keys.map(k=>[k,row.minimo_atributo])),skills:{},effectNeeds:[],visiting:[],notices:[]};}
function cloneContext(c){return {...c,items:structuredClone(c.items),min:{...c.min},skills:{...c.skills},effectNeeds:structuredClone(c.effectNeeds),visiting:[...c.visiting],notices:[...c.notices]};}
function identity(i){return i.system.ruleId||i.system.contentId;}
function makeActor(c){
 const values=allocate(c),bases=npcBases(c.d.style),stats=Object.fromEntries(['cc','cd','esq','lm'].map(k=>[k,bases[k]+values.attributes[{cc:'for',cd:'des',esq:'agi',lm:'per'}[k]] ]));stats.initiative=values.attributes.agi+values.skillLevels.prontidao;
 return generatorActorView({type:'npc',system:{nc:c.d.nc,attributes:values.attributes,stats,statsOriginal:stats,skillLevels:values.skillLevels,recordedSkills:[],resources:{chakra:{value:10+3*values.attributes.esp,baseMax:10+3*values.attributes.esp}},details:{}},flags:{[ns]:{npcGenerator:{version:2},prerequisiteEvents:c.d.events}},items:c.items},{copy:false});
}
export function allocate(c){
 const a={...c.min},total=c.row.atributos;if(keys.some(k=>a[k]>c.d.nc)||keys.reduce((n,k)=>n+a[k],0)>total)fail('Os atributos necessários não cabem no NC '+c.d.nc+'.');
 const priority=c.d.focus==='puppet'?['int','des','agi','esp','vig','per','for']:c.d.origin==='nara'?['int','des','agi','esp','vig','per','for']:c.d.style==='taijutsu'?['for','agi','vig','des','esp','per','int']:c.d.style==='genjutsu'?['int','agi','esp','per','vig','des','for']:['des','agi','esp','vig','per','int','for'];
 let left=total-keys.reduce((n,k)=>n+a[k],0);for(const k of priority){const buy=Math.min(left,c.d.nc-a[k]);a[k]+=buy;left-=buy;}
 if(left)fail('Não foi possível distribuir os atributos.');
 const bought={},skillLevels={};let spent=0;
 for(const [key,min]of Object.entries(c.skills)){const s=SKILLS.find(s=>s.key===key);if(!s)fail('Perícia desconhecida: '+key);bought[key]=Math.max(s.training?1:0,min-Math.ceil(a[s.attribute]/2));if(bought[key]>Math.floor(c.d.nc/2))fail(s.name+' excede o limite de compra do NC.');spent+=bought[key];}
 if(spent>c.row.pericias)fail('Os requisitos excedem os pontos de perícia.');
 const favorites=c.d.focus==='puppet'?['mecanismos','concentracao','prontidao','furtividade']:c.d.focus==='summon'?['lidar_com_animais','concentracao','prontidao','furtividade']:c.d.style==='taijutsu'?['acrobacia','atletismo','prontidao','furtividade']:c.d.style==='genjutsu'?['prestidigitacao','ocultismo','concentracao','prontidao']:['concentracao','prontidao','furtividade','acrobacia'];
 for(const key of [...favorites,...SKILLS.map(s=>s.key)]){const s=SKILLS.find(s=>s.key===key);if(!s||key==='voo'||key==='veneficio')continue;const n=Math.min(c.row.pericias-spent,Math.floor(c.d.nc/2)-(bought[key]??0));if(n>0){bought[key]=(bought[key]??0)+n;spent+=n;}}
 for(const s of SKILLS)skillLevels[s.key]=Math.ceil(a[s.attribute]/2)+(bought[s.key]??0);
 return {attributes:{...a,car:Math.ceil(c.row.sociais_genin_e_superiores/2),man:Math.floor(c.row.sociais_genin_e_superiores/2)},bought,skillLevels,skillSpent:spent};
}
function setAcquisitions(c){materializeBookPowerGrants(c.items,id=>canonicalCopy(c.entries.find(e=>e.id===id)),Math.floor(c.d.nc/2));let used=0;for(const i of c.items){if(!['power','aptitude'].includes(i.type))continue;const free=i.type==='aptitude'&&freeEligible(i)&&used<3;if(free)used++;i.flags??={};i.flags[ns]??={};i.flags[ns].acquisition={mode:free?'free':'paid'};}return investmentBudget({},c.items);}
function addOrigin(c,key){const p=PACKAGE_ORIGINS[key];if(!p)fail('Origem desconhecida: '+key);if(c.items.some(i=>i.system.details?.accessRule===key))return;
 const e=c.entries.find(e=>e.id===p.contentId);if(!e)fail('Origem ausente no compêndio: '+p.name);
 const doc=canonicalCopy(e),problems=packageAcquisitionProblems(doc,makeActor(c));if(problems.length)fail(problems.join(' '));doc._id='nb'+String(c.items.length+1).padStart(14,'0');c.items.push(doc);
}
function requireAccess(c,key){
 const actor=makeActor(c);if(accessSources(actor,key).length)return;
 const origin=PACKAGE_ORIGINS[key];if(!origin)fail('Acesso não concedido: '+key);
 const allowed=!origin.primary||[['hatake','sarutobi','senju','shimura','hibon-ninpou'].includes(c.d.origin)&&key==='tensai'].some(Boolean);
 if(!allowed)fail('Requer a origem '+origin.name+'.');addOrigin(c,key);
}
function requirement(c,r,choiceKey=''){
 if(r.kind==='attribute'){if(!keys.includes(r.key))fail('Atributo especial exige escolha: '+r.label);c.min[r.key]=Math.max(c.min[r.key],r.min);if(r.min>c.d.nc)fail(r.label+' '+r.min+' exige NC maior.');return;}
 if(r.kind==='all'){for(const x of r.options)requirement(c,x,choiceKey);return;}
 if(r.kind==='any'){const results=[];for(const x of r.options){const copy=cloneContext(c);try{requirement(copy,x,choiceKey);allocate(copy);results.push(copy);}catch{}}if(!results.length)fail('Nenhuma alternativa de requisito cabe nesta origem e NC.');results.sort((a,b)=>setAcquisitions(a).spent-setAcquisitions(b).spent||keys.reduce((n,k)=>n+a.min[k]-b.min[k],0));Object.assign(c,results[0]);return;}
 if(r.kind==='access')return requireAccess(c,r.key);
 if(r.kind==='eyeAccess')return requireAccess(c,'uchiha');
 if(r.kind==='owned')return addPurchase(c,r.id,1,true);
 if(r.kind==='powerLevel')return addPurchase(c,r.id,r.min,true);
 if(r.kind==='skillLevel'){c.skills[r.key]=Math.max(c.skills[r.key]??0,r.min);return;}
 if(r.kind==='warriorChoice')return requirement(c,{kind:'any',options:['for','des'].map(key=>({kind:'attribute',key,min:choiceKey==='leve'?8:10,label:key.toUpperCase()}))});
 if(r.kind==='ownedLevel')return addPurchase(c,r.id??'sns:apt:clone-kage-2',1,true);
 if(['ownedChoice','ownedWeaponFamily','ownedWeaponClass','ownedWeaponUse'].includes(r.kind)){
  const source=c.catalog.get(r.id);if(!source)fail('Compra de requisito indisponível: '+r.label);
  const options=aptitudeChoiceOptions(canonicalCopy(source.entry,source.variant)),key=r.choice??options.find(o=>r.kind==='ownedWeaponFamily'?o.id.startsWith(r.prefix):r.kind==='ownedWeaponClass'?o.weaponClass?.toLowerCase()===r.weaponClass:!!o.ranged)?.id;
  if(!key)fail('Escolha compatível indisponível: '+r.label);return addPurchase(c,r.id,1,true,key);
 }
 if(r.kind==='combatBase'){const attr={cc:'for',cd:'des',esq:'agi',lm:'per'}[r.key];c.min[attr]=Math.max(c.min[attr],r.min-npcBases(c.d.style)[r.key]);return;}
 if(r.kind==='initiativeBase'){c.min.agi=Math.max(c.min.agi,r.min-allocate(c).skillLevels.prontidao);return;}
 if(r.kind==='actorType'){if(!r.types.includes('npc'))fail(r.label);return;}
 if(r.kind==='pending'){if(r.label==='um evento traumático'&&c.d.events.mangekyouTrauma)return;if(r.label==='dominar o par de técnicas do Mangekyou Sharingan'){addPurchase(c,'sns:jutsu:amaterasu',1,true);addPurchase(c,'sns:jutsu:tsukuyomi',1,true);return;}fail(r.label+' precisa ser definido.');}
 if(r.kind==='effectKnown'){addPurchase(c,r.powerId,r.min,true);c.effectNeeds.push(r);return;}
 if(r.kind==='summonPact'||r.kind==='summonSpecies'){
  const species=r.species??c.d.summonSpecies,key=Object.keys(PACKAGE_ORIGINS).find(k=>PACKAGE_ORIGINS[k].species===species&&!PACKAGE_ORIGINS[k].primary);if(!key)fail('Escolha um contrato de invocação disponível.');addOrigin(c,key);return;
 }
 if(r.kind==='noClanOrHijutsu'){if(c.d.origin&&c.d.origin!=='hachimon-tonkou')fail('Exige personagem sem outro clã ou hijutsu.');return;}
 if(r.kind==='selfOrigin')return;
 fail('Requisito exige escolha própria: '+(r.label??r.kind));
}
function addPurchase(c,id,level=1,dependency=false,forcedChoice=''){
 const row=c.catalog.get(id)??[...c.catalog.values()].find(r=>r.entry.id===id),existing=c.items.find(i=>(identity(i)===id||i.system.contentId===id)&&(!forcedChoice||i.system.choice?.key===forcedChoice));
 if(!row)fail('Regra ausente no compêndio: '+id);
 if(c.d.pins[id]?.selected===false)fail(row.name+' foi desmarcada e é um requisito.');
 if(c.visiting.includes(id))fail('Dependência circular de '+row.name+'.');
 const target=row.type==='power'?Math.min(Math.floor(c.d.nc/2),Math.max(1,level)):1;if(row.type==='power'&&level>Math.floor(c.d.nc/2)&&dependency)fail(row.name+' '+level+' excede o limite do NC.');
 if(existing){if(existing.type==='power')existing.system.level=Math.max(existing.system.level,target);if(setAcquisitions(c).spent>c.row.poderes_basico)fail('Pontos de poder insuficientes para '+row.name+'.');return;}
 c.visiting.push(id);const rule=ITEM_RULES[id]??ITEM_RULES[row.entry.id];if(!rule)fail('Requisitos ainda não disponíveis para '+row.name+'.');
 for(const r of rule.requirements)requirement(c,r,forcedChoice||c.d.pins[id]?.choiceKey||'');
 const doc=canonicalCopy(row.entry,row.variant),pinned=c.d.pins[id],options=aptitudeChoiceOptions(doc,makeActor(c));
 const choiceType=aptitudeChoiceType(doc);
 if(choiceType){let key=forcedChoice||pinned?.choiceKey;if(!key&&['skill','attribute','combatStyle'].includes(choiceType))key=options.find(o=>o.id===(choiceType==='combatStyle'?'desarmado':choiceType==='attribute'?'vig':'concentracao'))?.id??options[0]?.id;
  if(!key&&choiceType==='summonSpecies')key=c.d.summonSpecies;
  if(!key&&choiceType==='hibonBonuses')key='hardness-difficulty';if(!key)fail('Escolha a opção de '+row.name+'.');doc.system.choice={kind:choiceType,key};if(!aptitudeChoiceStatus(doc).valid)fail('Escolha inválida em '+row.name+'.');}
 doc._id='nb'+String(c.items.length+1).padStart(14,'0');if(doc.type==='power'){doc.system.level=target;doc.system.power??={definitionId:'',choices:[]};}
 if(id==='sns:power:jiongu')doc.flags[ns].jionguHearts=[...c.d.jionguHearts];
 if(id==='sns:power:hb-f05-jinchuuriki-falso')doc.flags[ns].falseBijuuTails=c.d.falseBijuuTails;
 c.items.push(doc);c.visiting.pop();const affinity=npcElementalRequirements(c.items);if(affinity.minimumSpirit>c.d.nc)fail('O segundo elemento básico exige Espírito 10 (Básico, p.89).');c.min.esp=Math.max(c.min.esp,affinity.minimumSpirit);allocate(c);if(setAcquisitions(c).spent>c.row.poderes_basico)fail('Pontos de poder insuficientes para '+row.name+'.');
}
export function planNpcPurchases(input,library){
 const d=validateNpcBuildDraft(input),entries=Array.isArray(library)?library:library.entries,catalog=npcBuildCatalog(entries),originRows=npcOriginOptions(entries,d.village,d.foreignOrigin);
 if(d.origin&&!originRows.some(o=>o.id===d.origin&&o.compatible))fail('A origem escolhida não pertence à vila. Escolha outra origem ou permita uma origem de fora.');
 let c=freshContext(d,entries,catalog);if(d.origin)addOrigin(c,d.origin);
 const weapon=EQUIPMENT_DEFINITIONS[d.weapon];
 function weaponRequirement(r){if(r.alternatives)return requirement(c,{kind:'any',options:r.alternatives.map(x=>x.ownedRule?{kind:'owned',id:x.ownedRule}:{kind:'any',options:(x.anyAttributes??[x.attribute]).map(key=>({kind:'attribute',key,min:x.min,label:key.toUpperCase()}))})});if(r.ownedRule)return addPurchase(c,r.ownedRule,1,true);return requirement(c,{kind:'any',options:(r.anyAttributes??[r.attribute]).map(key=>({kind:'attribute',key,min:r.min,label:key.toUpperCase()}))});}
 for(const req of weapon?.requirements??[])weaponRequirement(req);
 if(d.focus==='puppet'){if(d.origin&&d.origin!=='kugutsu')fail('Marionetes exige selecionar Kugutsu como hijutsu ou um foco compatível.');if(!d.origin){d.origin='kugutsu';c.d.origin='kugutsu';addOrigin(c,'kugutsu');}}
 const rootRows=npcOriginPurchases(entries,d.origin),selected=new Set(),mandatory=Object.entries(d.pins).filter(([,p])=>p.selected===true);
 const attempt=(id,level=1,required=false)=>{const copy=cloneContext(c);try{addPurchase(copy,id,level);allocate(copy);c=copy;selected.add(id);return true;}catch(e){if(required)throw e;c.notices.push({id,name:catalog.get(id)?.name??id,reason:e.message});return false;}};
 mandatory.sort(([a],[b])=>Number(b==='sns:apt:elemento-natural-katon')-Number(a==='sns:apt:elemento-natural-katon'));
 for(const [id,pin]of mandatory){if(!catalog.has(id))fail('Compra desconhecida.');if(catalog.get(id).type==='power'&&(pin.level??1)>Math.floor(d.nc/2))fail('Nível da compra excede NC/2.');attempt(id,pin.level??1,true);}
 const order=r=>d.origin==='uchiha'?({'sns:apt:mangekyou-sharingan':-5,'sns:apt:sandan-sharingan':-4,'sns:apt:nidan-sharingan':-3,'sns:apt:sharingan':-2,'sns:power:katon':-1}[r.id]??1):r.type==='power'?0:1;
 const defaultIds=rootRows.filter(r=>d.pins[r.id]?.selected!==false).sort((a,b)=>order(a)-order(b));
 for(const row of defaultIds){if(selected.has(row.id))continue;for(let level=row.type==='power'?Math.floor(d.nc/2):1;level>=1;level--)if(attempt(row.id,level))break;}
 if(d.focus==='summon')attempt('sns:power:kuchiyose',Math.floor(d.nc/2),true);
 if(d.focus==='puppet')attempt('sns:apt:kugutsu',1,true);
 if((d.focus==='puppet'||c.items.some(i=>i.system.contentId==='sns:apt:kugutsu'))&&(d.puppetSize!=='auto'&&d.puppetSize!=='Pequeno'||d.puppetCount>1)){attempt('sns:apt:kurohigi',1,true);const copy=cloneContext(c),minimum=d.puppetSize==='Grande'||d.puppetCount>=3?12:d.puppetCount>=2?10:6;copy.skills.prestidigitacao=Math.max(copy.skills.prestidigitacao??0,minimum+(d.puppetCount===4?2:0));copy.skills.mecanismos=Math.max(copy.skills.mecanismos??0,d.puppetSize==='Grande'||d.puppetCount>=3?12:6);allocate(copy);c=copy;}
 if(d.style==='genjutsu'&&!d.origin&&d.nc>=6){try{const copy=cloneContext(c);addOrigin(copy,'magen');addPurchase(copy,'sns:power:magen',Math.floor(d.nc/2));allocate(copy);c=copy;}catch{}}
 const element=d.element==='auto'?(NPC_VILLAGES.find(v=>v.id===d.village)?.element??'ninpou'):d.element;
 if(d.focus!=='clan'&&d.focus!=='puppet'&&element!=='none'&&(d.style==='ninjutsu'||d.element!=='auto'||d.village)){
  let bought=false;for(let level=Math.floor(d.nc/2);level>=1;level--)if(attempt('sns:power:'+element,level)){bought=true;break;}if(!bought&&d.element!=='auto')fail(c.notices.at(-1)?.reason??'Não foi possível comprar este elemento.');
 }
 if(d.secondElement!=='none'){if(d.secondElement===element)fail('Escolha elementos diferentes.');let bought=false;for(let level=Math.floor(d.nc/2);level>=1;level--)if(attempt('sns:power:'+d.secondElement,level)){bought=true;break;}if(!bought)fail(c.notices.at(-1)?.reason??'Não foi possível comprar o segundo elemento.');}
 for(const slug of NPC_COMMON_PRIORITIES[d.style]){const id='sns:apt:'+slug;if(d.pins[id]?.selected===false||d.focus==='clan'&&['fascinar','miragem','ataque-giratorio','chute-giratorio'].includes(slug))continue;attempt(id);}
 const allocation=allocate(c),budget=setAcquisitions(c),actor=makeActor(c),problems=[];
 for(const item of actor.items)if(['power','aptitude','jutsu'].includes(item.type)){const check=requirementsFor(item,actor);if(!check.valid&&!(ITEM_RULES[item.system.ruleId||item.system.contentId]?.requirements??[]).some(r=>r.kind==='effectKnown'))problems.push(item.name+': '+check.problems.join(' '));}
 if(!budget.complete||budget.spent>c.row.poderes_basico)problems.push(...budget.pending,'Compras acima do orçamento.');
 return {draft:d,context:c,items:c.items,allocation,budget,limits:c.row,bases:npcBases(d.style),rootRows,catalog,element,notices:c.notices,problems};
}
