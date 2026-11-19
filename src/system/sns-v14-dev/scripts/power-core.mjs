import {recordedSkillLevel} from './recorded-skill-level.mjs';
import {summonItemProblems,summonUseProblem,kuchiyoseLink} from './kuchiyose-core.mjs';
import {elementalProjection} from './elemental-projection.mjs';
import {phantasmProjection} from './phantasm-core.mjs';
import {supportProjection} from './support-core.mjs';
import {environmentProjection} from './environment-core.mjs';
import {magenProjection} from './magen-core.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {POWER_DEFINITIONS,EFFECT_DEFINITIONS,ACTIONS,DURATIONS} from '../data/power-definitions.mjs';
import {NPC_REPERTOIRES} from '../data/npc-repertoires.mjs';
import {D115_REPERTOIRES} from '../data/homebrew-d115-sources.mjs';
import {HIBON_BONUSES,hibonBonuses} from '../data/hibon-bonuses.mjs';
const PHASE4_REPERTOIRES={
 'sns:power:yoton':{
  id:'sns:power:yoton',mode:'effects',base:null,
  profile:{attribute:'esp',rangeBase:15,rangeFactor:3,sizeFactor:2,damageBonus:1,difficultyBonus:0},
  source:{id:'F02',pages:[40,42]},
  effects:[
   {id:'sns:effect:canhao',name:'Canhão',min:1,evolutions:[]},
   {id:'sns:effect:dano-continuo',name:'Dano Contínuo',min:2,evolutions:[7]},
   {id:'sns:effect:orbe',name:'Orbe',min:2,evolutions:[7]},
   {id:'sns:effect:restringente',name:'Restringente',min:2,evolutions:[5,8]},
   {id:'sns:effect:raio',name:'Raio',min:2,evolutions:[5,8]},
   {id:'sns:effect:tremor',name:'Tremor',min:2,evolutions:[4]},
   {id:'sns:effect:carga-de-lava',name:'Carga de Lava',min:2,evolutions:[]},
   {id:'sns:effect:flechas',name:'Flechas',min:3,evolutions:[6,9]},
   {id:'sns:effect:barreira',name:'Barreira',min:3,evolutions:[6,9]},
   {id:'sns:effect:lanca',name:'Lança',min:3,evolutions:[6,9]},
   {id:'sns:effect:ricochete',name:'Ricochete',min:3,evolutions:[9]},
   {id:'sns:effect:onda-queimante',name:'Onda Queimante',min:3,evolutions:[]},
   {id:'sns:effect:coluna',name:'Coluna',min:4,evolutions:[7,10]},
   {id:'sns:effect:energizar',name:'Energizar',min:4,evolutions:[6,8]},
   {id:'sns:effect:sopro-destrutivo',name:'Sopro Destrutivo',min:4,evolutions:[]},
   {id:'sns:effect:correnteza',name:'Correnteza',min:5,evolutions:[]},
   {id:'sns:effect:onda-explosiva',name:'Onda Explosiva',min:5,evolutions:[8]},
   {id:'sns:effect:missil',name:'Míssil',min:5,evolutions:[8,10]},
   {id:'sns:effect:petrificacao',name:'Petrificação',min:6,evolutions:[]},
   {id:'sns:effect:desastre',name:'Desastre',min:9,evolutions:[]}
  ]
 },
 'sns:power:kami-ninpou':{
  id:'sns:power:kami-ninpou',mode:'effects',base:null,
  profile:{attribute:'esp',rangeBase:10,rangeFactor:2,sizeFactor:1,damageBonus:0,difficultyBonus:0},
  source:{id:'F02',pages:[28,30]},
  effects:[
   {id:'sns:effect:canhao',name:'Canhão',min:1,evolutions:[]},
   {id:'sns:effect:criar-arma',name:'Criar Arma',min:1,evolutions:[3,5]},
   {id:'sns:effect:orbe',name:'Orbe',min:2,evolutions:[7]},
   {id:'sns:effect:raio',name:'Raio',min:2,evolutions:[5,8]},
   {id:'sns:effect:barreira',name:'Barreira',min:3,evolutions:[6,9]},
   {id:'sns:effect:flechas',name:'Flechas',min:3,evolutions:[6,9]},
   {id:'sns:effect:lanca',name:'Lança',min:3,evolutions:[6,9]},
   {id:'sns:effect:ricochete',name:'Ricochete',min:3,evolutions:[9]},
   {id:'sns:effect:coluna',name:'Coluna',min:4,evolutions:[7,10]},
   {id:'sns:effect:prisao-de-agua',name:'Prisão de Água',min:4,evolutions:[7,9]},
   {id:'sns:effect:sopro-destrutivo',name:'Sopro Destrutivo',min:4,evolutions:[]},
   {id:'sns:effect:correnteza',name:'Correnteza',min:5,evolutions:[]},
   {id:'sns:effect:missil',name:'Míssil',min:5,evolutions:[8,10]},
   {id:'sns:effect:anjo-de-papel',name:'Anjo de Papel',min:5,evolutions:[]},
   {id:'sns:effect:algemar',name:'Algemar',min:6,evolutions:[8,10]},
   {id:'sns:effect:julgamento',name:'Julgamento',min:6,evolutions:[]},
   {id:'sns:effect:emissario-divino',name:'Emissário Divino',min:10,evolutions:[]}
  ]
 },
 'sns:power:kumo-ninpou':{
  id:'sns:power:kumo-ninpou',mode:'effects',base:null,
  profile:{attribute:'esp',rangeBase:15,rangeFactor:3,sizeFactor:1,damageBonus:0,difficultyBonus:1},
  source:{id:'F02',pages:[18,19]},
  effects:[
   {id:'sns:effect:canhao',name:'Canhão',min:1,evolutions:[]},
   {id:'sns:effect:orbe',name:'Orbe',min:2,evolutions:[7]},
   {id:'sns:effect:raio',name:'Raio',min:2,evolutions:[5,8]},
   {id:'sns:effect:restringente',name:'Restringente',min:2,evolutions:[5,8]},
   {id:'sns:effect:flechas',name:'Flechas',min:3,evolutions:[6,9]},
   {id:'sns:effect:ricochete',name:'Ricochete',min:3,evolutions:[9]},
   {id:'sns:effect:sopro-destrutivo',name:'Sopro Destrutivo',min:4,evolutions:[]},
   {id:'sns:effect:missil',name:'Míssil',min:5,evolutions:[8,10]},
   {id:'sns:effect:onda-explosiva',name:'Onda Explosiva',min:5,evolutions:[8]},
   {id:'sns:effect:algemar',name:'Algemar',min:6,evolutions:[8,10]},
   {id:'sns:effect:pele-de-pedra',name:'Pele de Pedra',min:6,evolutions:[8,10]}
  ]
 },
 'sns:power:hebi-ninpou':{
  id:'sns:power:hebi-ninpou',mode:'effects',base:null,
  profile:{attribute:'esp',rangeBase:5,rangeFactor:1,sizeFactor:1,damageBonus:0,difficultyBonus:1},
  source:{id:'F02',pages:[22,24]},
  effects:[
   {id:'sns:effect:canhao',name:'Canhão',min:1,evolutions:[]},
   {id:'sns:effect:orbe',name:'Orbe',min:2,evolutions:[7]},
   {id:'sns:effect:raio',name:'Raio',min:2,evolutions:[5,8]},
   {id:'sns:effect:restringente',name:'Restringente',min:2,evolutions:[5,8]},
   {id:'sns:effect:imergir',name:'Imergir',min:2,evolutions:[5]},
   {id:'sns:effect:infligir-medo',name:'Infligir Medo',min:2,evolutions:[5,7]},
   {id:'sns:effect:barreira',name:'Barreira',min:3,evolutions:[6,9]},
   {id:'sns:effect:flechas',name:'Flechas',min:3,evolutions:[6,9]},
   {id:'sns:effect:lanca',name:'Lança',min:3,evolutions:[6,9]},
   {id:'sns:effect:ricochete',name:'Ricochete',min:3,evolutions:[9]},
   {id:'sns:effect:coluna',name:'Coluna',min:4,evolutions:[7,10]},
   {id:'sns:effect:nuvem',name:'Nuvem',min:4,evolutions:[7,10]},
   {id:'sns:effect:sopro-destrutivo',name:'Sopro Destrutivo',min:4,evolutions:[]},
   {id:'sns:effect:bracos-de-serpente',name:'Braços de Serpente',min:4,evolutions:[]},
   {id:'sns:effect:correnteza',name:'Correnteza',min:5,evolutions:[]},
   {id:'sns:effect:missil',name:'Míssil',min:5,evolutions:[8,10]},
   {id:'sns:effect:onda-explosiva',name:'Onda Explosiva',min:5,evolutions:[8]},
   {id:'sns:effect:venenoso',name:'Venenoso',min:5,evolutions:[]},
   {id:'sns:effect:algemar',name:'Algemar',min:6,evolutions:[8,10]}
  ]
 },
 'sns:power:hb-f05-aoi-katon':{
  id:'sns:power:hb-f05-aoi-katon',mode:'effects',base:'katon',hibonBonuses:true,
  profile:{attribute:'esp',rangeBase:10,rangeFactor:3,sizeFactor:1,damageBonus:0,difficultyBonus:0},
  source:{id:'F05',pages:[1,3]},
  effects:[
   {id:'sns:effect:hb-f05-chama-sombria',name:'Chama Sombria',min:5,evolutions:[]},
   {id:'sns:effect:hb-f05-mini-bolas-de-fogo',name:'Mini Bolas de Fogo',min:6,evolutions:[]}
  ]
 },
 'sns:hijutsu:ranton':{
  id:'sns:hijutsu:ranton',mode:'effects',base:null,
  profile:{attribute:'esp',rangeBase:15,rangeFactor:3,sizeFactor:1,damageBonus:1,difficultyBonus:0},
  source:{id:'F02',pages:[50,52]},
  effects:[
   {id:'sns:effect:canhao',name:'Canhão',min:1,evolutions:[]},
   {id:'sns:effect:orbe',name:'Orbe',min:2,evolutions:[7]},
   {id:'sns:effect:raio',name:'Raio',min:2,evolutions:[5,8]},
   {id:'sns:effect:flechas',name:'Flechas',min:3,evolutions:[6,9]},
   {id:'sns:effect:ricochete',name:'Ricochete',min:3,evolutions:[9]},
   {id:'sns:effect:coluna',name:'Coluna',min:4,evolutions:[7,10]},
   {id:'sns:effect:nuvem',name:'Nuvem',min:4,evolutions:[7,10]},
   {id:'sns:effect:sopro-destrutivo',name:'Sopro Destrutivo',min:4,evolutions:[]},
   {id:'sns:effect:energizar',name:'Energizar',min:4,evolutions:[6,8]},
   {id:'sns:effect:missil',name:'Míssil',min:5,evolutions:[8,10]},
   {id:'sns:effect:onda-explosiva',name:'Onda Explosiva',min:5,evolutions:[8]},
   {id:'sns:effect:feixe-de-luz',name:'Feixe de Luz',min:5,evolutions:[]},
   {id:'sns:effect:descarga',name:'Descarga',min:6,evolutions:[]},
   {id:'sns:effect:nuvem-tempestuosa',name:'Nuvem Tempestuosa',min:6,evolutions:[]},
   {id:'sns:effect:circo-de-laser',name:'Circo de Laser',min:7,evolutions:[]},
   {id:'sns:effect:meteoros',name:'Meteoros',min:9,evolutions:[]}
  ]
 },
 'sns:hijutsu:kibaku-nendo':{
  id:'sns:hijutsu:kibaku-nendo',mode:'effects',base:null,
  profile:{attribute:'skill:arte',rangeBase:15,rangeFactor:3,sizeFactor:2,damageBonus:2,difficultyBonus:0},
  source:{id:'F02',pages:[77,79]},
  effects:[
   {id:'sns:effect:canhao',name:'Canhão',min:1,evolutions:[]},
   {id:'sns:effect:orbe',name:'Orbe',min:2,evolutions:[7]},
   {id:'sns:effect:imergir',name:'Imergir',min:2,evolutions:[5]},
   {id:'sns:effect:montaria',name:'Montaria',min:2,evolutions:[5]},
   {id:'sns:effect:flechas',name:'Flechas',min:3,evolutions:[6,9]},
   {id:'sns:effect:mina-explosiva',name:'Mina Explosiva',min:3,evolutions:[]},
   {id:'sns:effect:coluna',name:'Coluna',min:4,evolutions:[7,10]},
   {id:'sns:effect:nuvem',name:'Nuvem',min:4,evolutions:[7,10]},
   {id:'sns:effect:missil',name:'Míssil',min:5,evolutions:[8,10]},
   {id:'sns:effect:onda-explosiva',name:'Onda Explosiva',min:5,evolutions:[8]},
   {id:'sns:effect:inflamavel',name:'Inflamável',min:5,evolutions:[]},
   {id:'sns:effect:algemar',name:'Algemar',min:6,evolutions:[8,10]},
   {id:'sns:effect:meteoros',name:'Meteoros',min:9,evolutions:[]}
  ]
 }
};
PHASE4_REPERTOIRES['sns:power:ranton']={...PHASE4_REPERTOIRES['sns:hijutsu:ranton'],id:'sns:power:ranton'};
PHASE4_REPERTOIRES['sns:power:kibaku-nendo']={...PHASE4_REPERTOIRES['sns:hijutsu:kibaku-nendo'],id:'sns:power:kibaku-nendo'};
const ALL_REPERTOIRES={...NPC_REPERTOIRES,...D115_REPERTOIRES,...PHASE4_REPERTOIRES};
const ALL_REPERTOIRE_EFFECTS=(()=>{
 const byId=new Map(),baseIds=new Set(EFFECT_DEFINITIONS.map(e=>e.id));
 for(const [pid,rep]of Object.entries(ALL_REPERTOIRES)){
  if(rep.mode!=='effects')continue;
  const slug=pid.split(':').at(-1);
  for(const e of rep.effects??[]){
   if(baseIds.has(e.id))continue;
   const existing=byId.get(e.id);
   if(existing){if(!existing.powers.includes(slug))existing.powers.push(slug);continue;}
   byId.set(e.id,{id:e.id,name:e.name,min:e.min??1,evolutions:e.evolutions??[],powers:[slug],action:'padrao',duration:'instantanea',range:'common',target:'Conforme descrição',damage:'common',test:'cd',seals:true,cost:'level',source:{id:rep.source?.id??'F01',pages:Array.isArray(rep.source?.pages)?rep.source.pages.join('–'):String(rep.source?.pages??'')},traits:['arte:ninjutsu','custo:chakra'],notes:`Efeito de ${pid.replace(/^sns:(?:kibaku-rev:)?power:/,'').replace(/^hb-f05-/,'')}. Consulte a descrição da técnica no poder.`});
  }
 }
 return [...byId.values()];
})();
const REPERTOIRE_EFFECT_MAP=new Map(ALL_REPERTOIRE_EFFECTS.map(e=>[e.id,e]));
const ALL_EFFECTS=[...EFFECT_DEFINITIONS,...ALL_REPERTOIRE_EFFECTS];
export const powerDefinition=id=>POWER_DEFINITIONS.find(x=>x.id===id);
export function repertoirePowerDefinition(power){
 const id=power?.system?.power?.definitionId||power?.system?.contentId,rep=ALL_REPERTOIRES[id];
 if(!rep||rep.mode!=='effects'||!rep.profile)return undefined;
 const baseEffects=rep.base?EFFECT_DEFINITIONS.filter(e=>e.powers.includes(rep.base)).map(e=>e.id):[];
 const ownEffects=(rep.effects??[]).map(e=>e.id);
 const extraEffects=id==='sns:power:kikai-ninpou'?['sns:effect:dano-continuo','sns:effect:purificar']:[];
 const hibon=hibonBonuses(power)||(rep.hibonBonuses&&power?.system?.choice?.kind==='hibonBonuses'?HIBON_BONUSES.find(b=>b.id===power.system.choice.key)??null:null);
 const attrLabel={ 'skill:lidar_com_animais':'Lidar com Animais', 'skill:arte':'Arte', 'skill:veneficio':'Venefício' }[rep.profile.attribute]||'';
 return {
  id,name:power.name||id,mode:'effects',attribute:rep.profile.attribute,attributeLabel:attrLabel,
  rangeBase:rep.profile.rangeBase,rangeFactor:rep.profile.rangeFactor,sizeFactor:rep.profile.sizeFactor,
  damageBonus:(rep.profile.damageBonus??0)+(hibon?.damageBonus??0),
  difficultyBonus:(rep.profile.difficultyBonus??0)+(hibon?.difficultyBonus??0),
  halfCost:!!rep.profile.halfCost,
  allowedEffects:[...new Set([...baseEffects,...ownEffects,...extraEffects])],
  source:{id:rep.source?.id??'F01',pages:Array.isArray(rep.source?.pages)?rep.source.pages.join('–'):String(rep.source?.pages??'')}
 };
}
export const ownedPowerDefinition=power=>powerDefinition(power?.system?.power?.definitionId||power?.system?.contentId)||repertoirePowerDefinition(power);
const allows=(p,e)=>(p.allowedEffects?p.allowedEffects.includes(e.id):e.powers.includes(p.id.split(':').at(-1)))||p.id==='sns:power:kikai-ninpou'&&['sns:effect:dano-continuo','sns:effect:purificar'].includes(e.id);
export const effectDefinition=id=>EFFECT_DEFINITIONS.find(x=>x.id===id)??REPERTOIRE_EFFECT_MAP.get(id);
export function choiceProblems(power,choices=power.system.power.choices){
 const p=ownedPowerDefinition(power),level=power.system.level,errors=[];
 if(!p)return ['Poder manual: selecione uma definição verificada para usar escolhas assistidas.'];
 if(power.flags?.['sns-v14-dev']?.legadoCopy||power.flags?.['sns-v14-dev']?.legadoTormenta){
  const ids=[...new Set(choices.map(c=>c.effectId))];if(ids.length!==1)return ['A concessão da Mímica/Tormenta contém exatamente um efeito.'];
  const e=effectDefinition(ids[0]);if(!e||!allows(p,e))return ['Efeito incompatível com o poder concedido.'];
  const stages=[e.min,...e.evolutions].filter(n=>choices.some(c=>c.stage===n));
  if(stages.length!==choices.length||stages[0]!==e.min||stages.some((n,k)=>n!==[e.min,...e.evolutions][k])||choices.some(c=>c.slot!==c.stage||c.slot>level))return ['A evolução copiada precisa seguir as etapas do efeito.'];
  return [];
 }
 const sorted=[...choices].sort((a,b)=>a.slot-b.slot),seen=new Map();
 for(let slot=1;slot<=level;slot++){
  const rows=sorted.filter(c=>c.slot===slot);if(rows.length!==1){errors.push('Nível '+slot+': escolha '+(rows.length?'duplicada.':'pendente.'));continue;}
  const c=rows[0],e=effectDefinition(c.effectId),stage=c.stage??e?.min;
  if(!e){errors.push('Nível '+slot+': regra indisponível.');continue;}
  const stages=[e.min,...e.evolutions],previous=seen.get(e.id),next=previous===undefined?e.min:stages[stages.indexOf(previous)+1];
  if(!allows(p,e)||stage!==next||stage>slot)errors.push('Nível '+slot+': '+e.name+' exige estágio '+next+' e progressão sem saltos.');
  else seen.set(e.id,stage);
 }
 if(choices.some(c=>c.slot>level))errors.push('Escolhas acima do nível comprado ficam inativas.');
 return errors;
}
export function availableChoices(power,slot){const p=ownedPowerDefinition(power);if(!p)return [];const prior=power.system.power.choices.filter(c=>c.slot<slot),seen=new Map(prior.map(c=>[c.effectId,c.stage]));return ALL_EFFECTS.filter(e=>allows(p,e)).map(e=>{const stages=[e.min,...e.evolutions],old=seen.get(e.id),stage=old===undefined?e.min:stages[stages.indexOf(old)+1];return {...e,stage,allowed:stage!==undefined&&stage<=slot&&slot<=power.system.level,reason:stage===undefined?'Todas as evoluções selecionadas.':'Exige nível '+stage};});}
export function learnedEffects(power){return power.system.power.choices.filter(c=>c.slot<=power.system.level).map(c=>({...c,definition:effectDefinition(c.effectId)})).filter(c=>c.definition);}
export function jutsuVariants(power,effectId,usedLevel){
 const e=effectDefinition(effectId),stages=power?learnedEffects(power).filter(c=>c.effectId===effectId).map(c=>c.stage):[],int=power?.actor?.system?.attributes?.int;
 return (e?.variants??[{id:'normal',name:'Normal'}]).filter(v=>(!v.min||usedLevel>=v.min)&&(!v.stage||stages.some(s=>s>=v.stage))&&(!v.minInt||!Number.isFinite(int)||int>=v.minInt));
}
export function resolveJutsu(actor,power,jutsu,{recordedNpc=false}={}){
 const p=ownedPowerDefinition(power),e=effectDefinition(jutsu.system.jutsu?.effectId),j=jutsu.system.jutsu??{},n=j.usedLevel;
 if(!p||!e)return {valid:false,problems:['Registro manual ou definição indisponível.'],manual:true};
 if(e.execution==='sourceOnly')return {valid:false,manual:true,effect:e,power:p,problems:['Consulte a descrição deste efeito para resolver seu uso. A execução automática ainda não está disponível.']};
 const owned=actor.type==='npc'&&jutsu.id?actor.items?.get?.(jutsu.id):null,
  recorded=recordedNpc&&owned?.actor===actor&&owned.system.details?.powerId===power.id&&(owned.system.contentId===e.id||owned.system.jutsu?.effectId===e.id)&&owned.flags?.['sns-v14-dev']?.animeRepertoire?.sources?.length;
 let choices=learnedEffects(power);
 const problems=recorded?[]:choiceProblems(power);
 if(recorded){
  // A source NPC may have an incomplete list elsewhere in the same power.
  // Keep only sequential, source-recorded stages for this effect. This is an
  // execution view; no item, purchase, slot or PP is written back to the actor.
  let prior;const accepted=[];for(const c of choices.filter(c=>c.effectId===e.id).sort((a,b)=>a.slot-b.slot)){const next=prior===undefined?e.min:[e.min,...e.evolutions][[e.min,...e.evolutions].indexOf(prior)+1];if(c.stage===next&&c.stage<=c.slot){accepted.push(c);prior=c.stage;}}
  if(!accepted.length)accepted.push({id:'recorded_'+owned.id,slot:e.min,stage:e.min,effectId:e.id});
  choices=[...choices.filter(c=>c.effectId!==e.id),...accepted];
 }
 const learned=choices.find(c=>c.id===j.selectionId&&c.effectId===e.id)||(recorded?choices.find(c=>c.effectId===e.id):null);
 if(!allows(p,e))problems.push('Este efeito não é permitido para o elemento deste poder.');
 if(Number.isFinite(actor.system.nc)&&power.system.level>Math.floor(actor.system.nc/2))problems.push('Nível do poder excede o limite de metade do NC; revise a aquisição ou use o registro manual para uma exceção documentada.');
 problems.push(...summonItemProblems(actor,power));const summonProblem=summonUseProblem(actor);if(summonProblem)problems.push(summonProblem);
 if(!learned)problems.push('Este efeito não foi adquirido neste poder.');
 if(!Number.isInteger(n)||n<e.min||n>power.system.level)problems.push('Nível usado deve estar entre '+e.min+' e '+power.system.level+'.');
 const viewPower=recorded?{...power,system:{...power.system,power:{...power.system.power,choices}}}:power;
 if(!jutsuVariants(viewPower,e.id,n).some(v=>v.id===(j.variant||'normal')))problems.push('Forma de uso exige nível e evolução aprendida compatíveis.');
 const attribute=p.attribute.startsWith('skill:')?recordedSkillLevel(actor,p.attribute.slice(6)):actor.system.attributes?.[p.attribute];if(!Number.isFinite(attribute))problems.push('Informe '+(p.attributeLabel||p.attribute.toUpperCase())+' do personagem.');
 if(p.allowedEffects){const requirement=requirementsFor({...power,system:{...power.system,ruleId:p.id}},actor);if(requirement.configured&&!requirement.valid)problems.push(...requirement.problems);}
 if(e.execution==='environment'){
  const requirement=requirementsFor({...power,system:{...power.system,ruleId:p.id}},actor);if(!requirement.valid)problems.push(...requirement.problems);
  if(j.overrides?.length)problems.push('Efeitos de ambiente tipados seguem o livro. Exceções exigem resolução manual.');
  return environmentProjection({actor,power,effect:e,choices,usedLevel:n,problems,parameterProfile:p.allowedEffects?{...p,attributeValue:attribute}:null});
 }
 if(e.execution==='support'){
  const requirement=requirementsFor({...power,system:{...power.system,ruleId:p.id}},actor);if(!requirement.valid)problems.push(...requirement.problems);
  if(j.overrides?.length)problems.push('Armas e proteções tipadas seguem os custos e limites do livro; resolva exceções manualmente.');
  return supportProjection({actor,power,effect:e,choices,usedLevel:n,problems});
 }
 if(e.execution==='genjutsu'){
  if(j.overrides?.length)problems.push('Ilusões tipadas de Genjutsu seguem o livro; resolva exceções manualmente.');
  if(e.id==='sns:effect:genjutsu-miragem'){
   const variantSpec=(e.variants??[]).find(v=>v.id===(j.variant||'normal'))??e.variants?.[0];
   if(Number.isFinite(attribute)&&variantSpec?.minInt&&attribute<variantSpec.minInt)problems.push('Esta categoria de tamanho de Miragem exige Inteligência '+variantSpec.minInt+'.');
   const cost=variantSpec?.cost??1,sizeLabel=variantSpec?.sizeLabel??'Pequeno',duration=variantSpec?.duration??'Contínua';
   const data={action:'Padrão',duration,range:'5 m',target:'Ponto no ambiente ('+sizeLabel+')',area:'',chakraCost:String(cost),damage:'Nenhum',difficulty:null,size:sizeLabel,defenses:'Interação física, Visão de Chakra ou Kai',seals:'Ilusão ambiental',test:''};
   const formulas={chakraCost:'1 por categoria de tamanho',range:'5 m fixo',size:'Pequeno (INT 2), Médio (INT 8), Grande (INT 12), Enorme (INT 16)'};
   return {valid:!problems.length,problems,noRoll:true,genjutsuPower:true,cost,usedLevel:n,data,formulas,provenance:Object.fromEntries(Object.keys(data).map(k=>[k,'regra do efeito'])),traits:e.traits,effect:e,power:p};
  }
  const deep=(attribute??0)>=5&&Array.from(actor.items?.values?.()??actor.items??[]).some(i=>(i?.system?.ruleId||i?.system?.contentId)==='sns:apt:ilusao-profunda')?1:0;
  const cost=3,difficulty=6+(attribute??0)+deep;
  const data={action:'Padrão',duration:'Cena',range:'5 m',target:'Uma criatura',area:'',chakraCost:'3',damage:'Nenhum',difficulty,size:'—',defenses:'Resistência de Inteligência',seals:'Ilusão mental',test:''};
  const formulas={difficulty:'6 + INT'+(deep?' + 1 (Ilusão Profunda)':''),chakraCost:'3 fixo',range:'5 m fixo'};
  const autoBindings=[{id:'book_genjutsu_fascinar_0',conditionId:'sns:condition:fascinado',degree:1,scope:'all',trigger:'failedResistance',recipient:'targets',resistance:'attribute:int',dcMode:'jutsu',dc:0,duration:'Cena',note:'Fascinar · Genjutsu',source:'Básico 4.1b · p. 79'}];
  return {valid:!problems.length,problems,resistanceCast:true,genjutsuPower:true,cost,usedLevel:n,data,formulas,provenance:Object.fromEntries(Object.keys(data).map(k=>[k,k==='difficulty'?'calculado':'regra do efeito'])),traits:e.traits,effect:e,power:p,autoBindings,combatProfile:{base:0,fixed:0,nature:'lethal',criticalAt:15,noDamage:true,attackKind:'melee',weaponClass:'Leve',maxTargets:1},executionNotes:e.notes};
 }
 if(['magen','phantasm'].includes(e.execution)){
  const requirement=requirementsFor({...power,system:{...power.system,ruleId:'sns:power:magen'}},actor);if(!requirement.valid)problems.push(...requirement.problems);
  if(j.overrides?.length)problems.push('Exceções de Magen exigem resolução manual; os custos e dificuldades tipados seguem o livro.');
  return (e.execution==='phantasm'?phantasmProjection:magenProjection)({actor,power,effect:e,choices,usedLevel:n,variant:j.variant||'normal',problems});
 }
 if(j.variant==='sem-chakra'&&(e.id!=='sns:effect:canhao'||n<2))problems.push('A variante sem chakra exige Canhão usado em nível2 ou maior.');
 const half=Math.ceil((attribute??0)/2),bonus=p.damageBonus,orbe7=e.id==='sns:effect:orbe'&&choices.some(c=>c.effectId===e.id&&c.stage>=7)&&n>=7,cost=j.variant==='sem-chakra'?0:(orbe7||p.halfCost)?Math.ceil(n/2):n;
 let damage=e.damage==='double'?2*n+bonus:e.damage==='none'?'Nenhum':e.damage==='projectiles'?null:n+half+bonus;if(j.variant==='sem-chakra')damage=Math.ceil(damage/2);
 const data={action:ACTIONS[e.action],duration:DURATIONS[e.duration],range:(p.rangeBase+p.rangeFactor*(attribute??0))+' m',target:e.target,area:e.area??'',chakraCost:String(cost),damage:damage===null?`${n} projéteis × DB2; +${bonus} uma vez por alvo`:String(damage),difficulty:9+n+half+(p.difficultyBonus??0)-(kuchiyoseLink(actor)?.mode==='calculated'&&kuchiyoseLink(actor).limit?.common?3:0),size:e.fixedSize??Math.ceil(p.sizeFactor*(attribute??0)),defenses:e.area||orbe7?'Esquiva / Antecipar; sem Bloqueio':'Conforme defesa e exceções da fonte',seals:e.seals?'Duas mãos livres':'Sem selos',test:e.test};
 if(e.id==='sns:effect:raio'){
  data.target=j.variant==='multiplos'?`Até ${Math.floor(n/2)} criaturas distintas, a até 4 m entre si`:'Uma criatura';
  data.defenses='Esquiva / Antecipar; Bloqueio somente com arma especial que bloqueie técnicas';
  if(j.variant==='concentrado'){data.action=ACTIONS.completa;data.damage=String(Number(data.damage)+2);}
 }
 const traits=[...e.traits.filter(t=>j.variant!=='sem-chakra'||t!=='custo:chakra'),...(j.variant==='sem-chakra'?['custo:sem-custo']:[]),...(p.id.endsWith(':ninpou')||p.allowedEffects?[]:['elemento:'+p.id.split(':').at(-1)])];
 const formulas={range:p.rangeBase+' + '+p.rangeFactor+' × ESP',damage:e.damage==='double'?'2 × nível usado + '+bonus:e.damage==='projectiles'?'Nível usado × projéteis de DB2':'Nível usado + ⌈ESP/2⌉ + '+bonus,difficulty:'9 + nível usado + ⌈ESP/2⌉'+(p.difficultyBonus?' + '+p.difficultyBonus:'')+(kuchiyoseLink(actor)?.mode==='calculated'&&kuchiyoseLink(actor).limit?.common?' − 3 (Kuchiyose comum)':''),size:e.fixedSize?'':'⌈'+p.sizeFactor+' × ESP⌉',chakraCost:j.variant==='sem-chakra'?'Variante sem chakra':(orbe7||p.halfCost)?'⌈nível usado/2⌉':'Nível usado'};
 if(j.variant==='sem-chakra')formulas.damage='⌈('+formulas.damage+')/2⌉';
 if(e.id==='sns:effect:raio'&&j.variant==='concentrado')formulas.damage+=' + 2 (Raio8)';
 const provenance=Object.fromEntries(Object.keys(data).map(k=>[k,['damage','range','chakraCost','difficulty','size'].includes(k)?'calculado':'herdado']));
 if(p.attributeLabel)for(const key of Object.keys(formulas))formulas[key]=formulas[key].replaceAll('ESP',p.attributeLabel);
 if(e.fixedSize)provenance.size='herdado';
 for(const o of j.overrides??[]){if(o.author&&o.reason&&Object.hasOwn(data,o.key)){data[o.key]=o.value;provenance[o.key]='personalizado';delete formulas[o.key];}}
 if(!Number.isInteger(Number(data.chakraCost))||Number(data.chakraCost)<0)problems.push('Custo de chakra deve ser um inteiro não negativo.');
 const execution=e.execution==='typed'?elementalProjection({effect:e,power:p,choices,usedLevel:n,variant:j.variant||'normal',data,formulas}):null;if(execution)problems.push(...execution.problems);
 return {attackerSize:actor.system.identity?.size||actor.system.details?.size||'',valid:problems.length===0,problems,data,provenance,formulas,traits,effect:e,power:p,cost:Number(data.chakraCost),usedLevel:n,...(execution?{autoBindings:execution.bindings,combatProfile:execution.profile,executionNotes:execution.notes}: {}),...(e.damage==='projectiles'?{combatProfile:{projectiles:{count:n,baseEach:2,bonus}}}:{})};
}

const managedTraits=new Set([...EFFECT_DEFINITIONS.flatMap(e=>e.traits),...POWER_DEFINITIONS.filter(p=>!p.id.endsWith(':ninpou')&&!p.id.endsWith(':genjutsu')&&!p.id.endsWith(':magen')).map(p=>'elemento:'+p.id.split(':').at(-1)),'custo:sem-custo']);
export function jutsuTraits(existing,projection){return projection?.traits?[...new Set([...(existing??[]).filter(id=>!managedTraits.has(id)),...projection.traits])]:existing??[];}
