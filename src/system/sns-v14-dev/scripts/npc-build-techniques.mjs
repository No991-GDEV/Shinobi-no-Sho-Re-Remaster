import {repertoireFor,repertoireChoices,groupedPowerSections,prerequisitePowerSections,repertoireEffectPrerequisites,jionguHearts} from './npc-repertoire-core.mjs';
import {resolveBookCanhao} from './book-power-grants.mjs';
import {canonicalCopy,canonicalIndex} from './canonical-content.mjs';
import {availableChoices,jutsuVariants,powerDefinition,effectDefinition,resolveJutsu} from './power-core.mjs';
import {isGrantSource,resolveGrantedJutsu} from './granted-jutsus.mjs';
import {fixedJutsuSpec,grantRuleFor} from './aptitude-jutsus.mjs';
import {requirementsFor,ITEM_RULES} from './item-requirements.mjs';
import {printedRuleHeaders} from './jutsu-rule-text.mjs';
import {npcJutsuPlan} from './npc-jutsu-core.mjs';
import {generatorActorView} from './npc-generator-core.mjs';
import {npcRandom,npcShuffle,NPC_DERIVED_EFFECTS} from '../data/npc-build-profiles.mjs';
import {EFFECT_DEFINITIONS} from '../data/power-definitions.mjs';
const ns='sns-v14-dev',plain=s=>String(s??'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const sectionsCache=new WeakMap();
export function npcPowerSections(entry){
 if(sectionsCache.has(entry))return sectionsCache.get(entry);
 const grouped=groupedPowerSections(entry);
 const html=entry.document.system.description,matches=[...html.matchAll(/<h[23][^>]*>\s*(N[ÍI]VEL\s*(\d+)\s*[:–-]\s*[^<]+)<\/h[23]>/gi)];
 const result=[...matches.map((m,i)=>({name:plain(m[1].replace(/^N[ÍI]VEL\s*\d+\s*[:–-]\s*/i,'')),title:m[1],minimum:Number(m[2]),html:html.slice(m.index,matches[i+1]?.index??html.length)})),...grouped];sectionsCache.set(entry,result);return result;
}
function rowsOf(library){return Array.isArray(library)?library:library.entries;}
export function fillNpcTechniques(data,draft,library,{preserveChoices=false}={}){
 const entries=rowsOf(library),random=npcRandom(draft.seed),get=id=>canonicalIndex(entries).get(id),choices=[],notices=[],excluded=new Set(draft.excludedTechniques??[]),effectRows=[];
 for(const j of data.items.filter(i=>i.type==='jutsu'))choices.push({id:'purchase|'+j.system.contentId,name:j.name,selected:true,locked:true,description:j.system.description,source:j.system.source,img:j.img});
 const id=()=>('nj'+String(data.items.length+1).padStart(14,'0')),actor=()=>generatorActorView(data,{copy:false}),byRule=id=>data.items.find(i=>(i.system.ruleId||i.system.contentId)===id);
 const create=(entry,{key=entry.id,power=null,section=null,grant=null,selection=null,usedLevel=1,params=null,name=''}={})=>{
  const info={id:key,name:name||entry.document.name,selected:!excluded.has(key),description:section?.html??entry.document.system.description,source:entry.document.system.source,img:entry.document.img};choices.push(info);if(excluded.has(key))return null;
  const row=canonicalCopy(entry);row._id=id();row.type='jutsu';row.name=info.name;row.system.description=info.description;row.system.category='techniques';row.system.details={...row.system.details,powerCost:0};
  const h=printedRuleHeaders(info.description);for(const [field,label]of [['action','acao'],['range','alcance'],['duration','duracao'],['chakraCost','custo de chakra'],['damage','dano'],['target','alvo']])if(h[label])row.system.details[field]=h[label];
  if(power)row.system.details.powerId=power._id;
  row.flags[ns].npcBuildTechnique={key,minimumLevel:section?.minimum??effectDefinition(entry.id)?.min??1,sourceId:entry.id};
  if(section){row.system.level=section.minimum;row.flags[ns].canonicalTextSource={id:entry.id,revision:entry.revision,bodySha256:entry.verifiedSource.bodySha256,section:section.title};row.system.jutsu={effectId:'',selectionId:'',usedLevel,variant:'normal',overrides:[],grantSourceId:''};}
  if(selection){row.system.jutsu={effectId:selection.effectId,selectionId:selection.id,usedLevel,variant:jutsuVariants(power,selection.effectId,usedLevel)[0]?.id??'normal',overrides:[]};}
  if(grant){row.flags[ns].generatorTechnique={grantId:grant._id};row.system.details={...row.system.details,action:'Padrão',range:draft.style==='genjutsu'?'5 m':'1 m',chakraCost:String(params?.cost??0),duration:entry.id.endsWith('fascinar')?'Cena':entry.id.endsWith('miragem')?'Contínua':'Instantânea'};}
  if(params)row.flags[ns].npcCastParameters={1:params};
  data.items.push(row);return row;
 };
 const priority=['canhao','orbe','raio','flechas','sopro-destrutivo','barreira','coluna','missil','algemar','confundir'];
 for(const power of data.items.filter(i=>i.type==='power')){
  const repertoire=repertoireFor(power),derived=repertoireChoices(power,1,data.items)?'book':NPC_DERIVED_EFFECTS[power.system.contentId],definition=powerDefinition(power.system.power?.definitionId||power.system.contentId)||(derived?powerDefinition('sns:power:ninpou'):null);
  const choicePower=derived?{...power,system:{...power.system,power:{definitionId:definition.id,choices:[]}}}:power;
  if(definition){if(!preserveChoices){power.system.power={definitionId:definition.id,choices:[]};
   if(derived)power.system.power.definitionId='';
   choicePower.system.power.choices=power.system.power.choices;
   for(let slot=1;slot<=power.system.level;slot++){
    const own=derived==='book'?repertoireChoices(power,slot,data.items):Array.isArray(derived)?EFFECT_DEFINITIONS.filter(e=>derived.includes(e.id.split(':').at(-1))).map(e=>{const old=power.system.power.choices.filter(c=>c.effectId===e.id).at(-1)?.stage,stages=[e.min,...e.evolutions],stage=old===undefined?e.min:stages[stages.indexOf(old)+1];return {...e,stage,allowed:stage!==undefined&&stage<=slot};}):availableChoices(choicePower,slot);
    const allowed=own.filter(e=>e.allowed&&repertoireEffectPrerequisites(e.id,actor(),power)),requested=draft.effects?.[power.system.contentId]?.[slot];
    const ranked=[...allowed].sort((a,b)=>{const ai=priority.indexOf(a.id.split(':').at(-1)),bi=priority.indexOf(b.id.split(':').at(-1));return (ai<0?100:ai)-(bi<0?100:bi)||a.stage-b.stage;});
    const need=(data.flags?.[ns]?.npcGenerator?.effectNeeds??[]).find(n=>n.powerId===power.system.contentId&&allowed.some(e=>e.id===n.id)&&!power.system.power.choices.some(c=>c.effectId===n.id&&c.stage>=n.min));
    const obligatory=repertoire?.mandatory?.find(slug=>allowed.some(e=>e.id==='sns:effect:'+slug&&e.min===slot)&&!power.system.power.choices.some(c=>c.effectId==='sns:effect:'+slug));
    const selected=(obligatory?allowed.find(e=>e.id==='sns:effect:'+obligatory):null)??(requested?allowed.find(e=>(e.nature?e.nature+'|':'')+e.id===requested):null)??(need?allowed.find(e=>e.id===need.id):null)??npcShuffle(ranked.slice(0,Math.min(4,ranked.length)),random)[0]??allowed[0];
    if(requested&&!allowed.some(e=>(e.nature?e.nature+'|':'')+e.id===requested))notices.push({name:power.name+' · nível '+slot,reason:'A escolha anterior foi substituída por uma opção permitida nesta progressão.'});
    if(!selected)throw Error('Sem efeito permitido para '+power.name+' no nível '+slot+'.');
    const choice={id:'ne'+String(slot).padStart(14,'0'),slot,effectId:selected.id,stage:selected.stage,...(selected.nature?{note:'nature:'+selected.nature}:{})};power.system.power.choices.push(choice);
    effectRows.push({powerId:power.system.contentId,powerName:power.name,slot,selected:(selected.nature?selected.nature+'|':'')+selected.id,options:allowed.map(e=>({id:(e.nature?e.nature+'|':'')+e.id,name:e.name+' · '+e.stage+(e.nature?' · '+e.nature:''),selected:e.id===selected.id&&e.nature===selected.nature}))});
   }
   }
   const grouped=[...new Map((power.system.power?.choices??[]).map(c=>[c.effectId+'|'+(c.note??''),c])).values()];
   if(repertoire?.mode==='hearts'){const canhao=grouped.find(c=>c.effectId==='sns:effect:canhao');for(const nature of new Set(jionguHearts(power)))if(canhao&&!grouped.some(c=>c.effectId===canhao.effectId&&c.note==='nature:'+nature))grouped.push({...canhao,note:'nature:'+nature});}
   for(const selection of grouped){const effectId=selection.effectId,nature=selection.note?.startsWith('nature:')?selection.note.slice(7):'';
    const entry=get(effectId);if(!entry)throw Error('Efeito ausente no compêndio.');
    const row=create(entry,{key:power.system.contentId+'|'+effectId+(nature?'|'+nature:''),power,selection,usedLevel:definition.id==='sns:power:magen'?selection.stage:power.system.level,name:power.name.split(' (')[0]+' · '+entry.document.name+(nature?' ('+nature+')':'')});
    if(row&&power.system.contentId==='sns:power:jiongu')row.flags[ns].jionguNature=nature;
    if(row&&power.flags?.[ns]?.bookPowerGrant&&effectId==='sns:effect:canhao')row.flags[ns].bookCanhao={sourceId:power.flags[ns].bookPowerGrant.sourceId};
   }
  }else{
   const parent=get(power.system.contentId);if(!parent)continue;
   const sectionEntry=get(repertoire?.sourceSections)??parent,sections=(repertoire?.mode==='falseBijuu'?prerequisitePowerSections(sectionEntry).filter(s=>/POTÊNCIA|ONDA DE|BRAÇO DE|DISPARO DE/.test(s.name)):npcPowerSections(sectionEntry)).filter(s=>s.minimum<=power.system.level);
   if(repertoire?.mode==='encenacoes'){
    const chosen=[];for(let slot=1;slot<=power.system.level;slot++){const allowed=sections.filter(s=>s.minimum<=slot&&!chosen.includes(s.title)),requested=draft.effects?.[power.system.contentId]?.[slot],selected=allowed.find(s=>s.title===requested)??npcShuffle(allowed,random)[0];if(!selected)continue;chosen.push(selected.title);effectRows.push({powerId:power.system.contentId,powerName:power.name,slot,selected:selected.title,options:allowed.map(s=>({id:s.title,name:s.name+' · '+s.minimum,selected:s===selected}))});create(parent,{key:power.system.contentId+'|'+selected.title,power,section:selected,usedLevel:power.system.level,name:selected.name});}
   }else if(repertoire?.mode==='drawings')create(parent,{key:parent.id+'|drawings',power,usedLevel:power.system.level,name:'Pergaminho da Super Besta'});
   else if(repertoire?.mode==='fixed'){for(const spec of repertoire.fixed)create(parent,{key:parent.id+'|'+spec.title,power,usedLevel:power.system.level,name:spec.title});}
   else for(const section of sections)create(sectionEntry,{key:power.system.contentId+'|'+section.title,power,section,usedLevel:power.system.level,name:section.name});
   if(repertoire?.mode==='falseBijuu')create(sectionEntry,{key:power.system.contentId+'|seal-test',power,section:{name:'Instabilidade do Selo',title:'INSTABILIDADE DO SELO',minimum:1,html:sectionEntry.document.system.description},usedLevel:power.system.level,name:'Instabilidade do Selo'});
   if(parent.id==='sns:power:kuchiyose')create(parent,{key:parent.id+'|summon',power,usedLevel:power.system.level,name:'Kuchiyose no Jutsu'});
   else if(!sections.length&&!repertoire)notices.push({name:power.name,reason:'Consulte as técnicas na descrição do poder; este poder ainda não possui receitas prontas no gerador.'});
  }
 }
 for(const source of data.items.filter(i=>i.type==='aptitude'&&isGrantSource(i))){
  const natural=grantRuleFor(source)==='Elemento Natural: Katon',spec=fixedJutsuSpec(source),effectId=natural?'sns:effect:sopro-destrutivo':spec?.id;if(!effectId)continue;
  const entry=get(effectId)??(spec?get('sns:jutsu:shunshin-no-jutsu'):null);if(!entry)continue;
  const power=natural?data.items.find(p=>p.type==='power'&&p.system.contentId==='sns:power:katon'):null;
  const row=create(entry,{key:'grant|'+source.system.contentId,usedLevel:1,name:natural?'Katon: Gōkakyū no Jutsu':spec.name});if(!row)continue;
  row.system.details.powerId=power?._id??'';row.system.jutsu={effectId,selectionId:'',grantSourceId:source._id,usedLevel:natural?Math.max(4,power?.system.level??4):1,variant:effectId==='sns:jutsu:kage-bunshin'?'1':'normal',overrides:[]};
  const a=actor(),j=a.items.get(row._id),p=resolveGrantedJutsu(a,j);if(p.data)Object.assign(row.system.details,p.data);if(spec)row.system.personalNotes=spec.notes;
 }
 for(const key of ['fascinar','miragem','ataque-giratorio','chute-giratorio']){if(draft.focus==='clan')continue;const grant=byRule('sns:apt:'+key),entry=get('sns:apt:'+key);if(!grant||!entry)continue;
  const a=data.system.attributes,base=Math.max(0,Math.ceil(a.for/2));create(entry,{key:'apt|'+entry.id,grant,params:key==='fascinar'?{mode:'save',cost:3,base:0,dc:6+a.int,saveKeys:['attribute:int']}:key==='miragem'?{mode:'none',cost:1,base:0}:{mode:'attack:cc',cost:0,base:base+(key==='chute-giratorio'?2:0)}});
 }
 const mandatory=['sns:jutsu:henge-no-jutsu','sns:jutsu:kinobori','sns:jutsu:bunshin-no-jutsu'];
 for(const entry of entries.filter(e=>e.document.type==='jutsu')){
  if(data.items.some(i=>i.type==='jutsu'&&i.system.contentId===entry.id))continue;
  const rule=ITEM_RULES[entry.document.system.ruleId||entry.id];if(!rule)continue;
  const related=mandatory.includes(entry.id)||(rule.requirements.length>0&&JSON.stringify(rule.requirements).match(/powerLevel|owned|eyeAccess/));if(!related)continue;
  const a=actor(),candidate=canonicalCopy(entry);if(!requirementsFor(candidate,a).valid)continue;
  const refs=JSON.stringify(rule.requirements),power=data.items.find(i=>i.type==='power'&&refs.includes('"'+i.system.contentId+'"'))??null;
  create(entry,{power,usedLevel:Math.max(1,power?.system.level??1)});
 }
 const a=actor();for(const j of a.items.filter(i=>i.type==='jutsu')){try{const plan=npcJutsuPlan(j,entries);const structural=plan.missing.filter(k=>!['context','nature'].includes(k)&&!(k==='cost'&&plan.context));if(structural.length)notices.push({name:j.name,fields:structural,reason:'Defina '+structural.map(k=>({cost:'chakra',base:'dano',mode:'forma de uso',save:'teste/Dif',size:'área'}[k]??k)).join(', ')+' antes do uso.'});}catch(e){notices.push({name:j.name,reason:e.message});}}
 return {choices,effectRows,notices};
}
