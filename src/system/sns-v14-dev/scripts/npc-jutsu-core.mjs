import {isLegado} from './legado-core.mjs';
import {legadoPlan} from './legado-plan.mjs';
import {puppetUsePlan} from './npc-puppet-core.mjs';
import {sourceRepertoirePlan} from './npc-repertoire-core.mjs';
import {resolveBookCanhao} from './book-power-grants.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {jutsuAreas} from './area-core.mjs';
import {npcPowerProfile,profileValues} from './npc-power-profile.mjs';
// Recorded NPC techniques are usable without completing an unrelated PC builder.
// Known arithmetic comes from the same projection/reading code as the item sheet.
import {jutsuProjection} from './item-view.mjs';
import {jutsuReading} from './jutsu-reading.mjs';
import {effectDefinition,resolveJutsu} from './power-core.mjs';
import {RESISTANCE_KEYS} from './jutsu-outcomes.mjs';
import {printedRuleHeaders,jutsuRuleText,genericRule,effectiveRuleItem} from './jutsu-rule-text.mjs';
import {resolveNpcContext} from './npc-cast-context.mjs';
import {effectiveAttribute} from './transformation-core.mjs';
const clean=s=>String(s??'').replace(/<[^>]*>/g,' ').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/\s+/g,' ').trim();
const number=v=>/^\d+$/.test(String(v??'').trim())?Number(v):null;
const first=(rows,...labels)=>rows.find(r=>labels.includes(r.label))?.value;
export const ruleHeaders=printedRuleHeaders;
export function ruleCost(text,level,actor){
 const s=clean(text).replace(/[.]$/,'');if(/^\d+$/.test(s))return Number(s);if(/^\d+\s*\((?:criacao|ativacao)\)$/.test(s))return Number(s.match(/^\d+/)[0]);if(/^\d+\s+[a-z]/.test(s)&&!/^\d+\s+(?:ou|por|para|a cada)/.test(s))return Number(s.match(/^\d+/)[0]);if(/^(?:zero|nenhum|nenhuma|sem custo|gratuito)$/.test(s))return 0;
 if(/^1 por nivel (?:usado )?(?:do poder|do efeito)$/.test(s))return level;
 if(/^(?:nivel (?:usado )?(?:do poder|do efeito)|nivel usado)(?:\s*\+\s*\d+)?$/.test(s))return level+Number(s.match(/\+\s*(\d+)/)?.[1]??0);
 if(/^(?:metade (?:do nivel|do nivel usado)|nivel usado\s*\/\s*2)$/.test(s))return Math.ceil(level/2);
 const multiplied=s.match(/^(\d+)\s*(?:x|por)\s*(?:nivel (?:usado )?(?:do poder|do efeito)|nv do poder)$/);if(multiplied)return Number(multiplied[1])*level;
 const plus=s.match(/^(\d+)\s*\+\s*1 por nivel (?:usado )?do poder$/);if(plus)return Number(plus[1])+level;
 if(/^(?:1\/2|½|metade) (?:do )?espirito$/.test(s)&&Number.isFinite(actor?.system.attributes?.esp))return Math.ceil(actor.system.attributes.esp/2);
 return null;
}
export function npcJutsuPlan(item,library,level,custom={}){
 if(isLegado(item))return legadoPlan(item,custom,library);
 item=effectiveRuleItem(item);
 if(!(item.actor?.type==='npc'||item.flags?.['sns-v14-dev']?.sharedRecipe)&&item.type==='jutsu'||item.type!=='jutsu')throw Error('A origem precisa ser um jutsu de NPC.');
 const sourceId=item.system.jutsu?.effectId||item.system.contentId||(item.flags?.['sns-v14-dev']?.canonicalTextSource?.textOnly?'':item.flags?.['sns-v14-dev']?.canonicalTextSource?.id);
 const reading=jutsuReading(item,library,level),rows=reading?.rows??[],p=item.actor.items.get(item.system.details?.powerId),entry=library.find(e=>e.id===sourceId),headers=ruleHeaders(item.system.description),definition=effectDefinition(sourceId);
 const saved=item.flags?.['sns-v14-dev']?.npcCastParameters?.[level??item.system.jutsu?.usedLevel??p?.system.level]??{},powerProfile=npcPowerProfile(item,library,custom.nature??saved.nature);
 const bookCanhao=resolveBookCanhao(item);
 const min=Math.max(sourceId==='sns:jutsu:chakra-no-souin'?7:1,item.flags?.['sns-v14-dev']?.npcBuildTechnique?.minimumLevel??1,definition?.min??reading?.min??entry?.document.system.level??1),max=Math.max(min,Math.min(bookCanhao?.max??reading?.max??p?.system.level??item.system.jutsu?.usedLevel??min,powerProfile.maxLevel??Infinity));
 if(level===undefined)return npcJutsuPlan(item,library,Math.min(max,Math.max(min,item.system.jutsu?.usedLevel||p?.system.level||item.system.level||min)),custom);
 if(!Number.isInteger(level)||level<min||level>max)throw Error('Nível fora do intervalo '+min+'–'+max+'.');
 let projection=jutsuProjection(item,{usedLevel:level});
 if(!projection&&p?.system.power?.definitionId&&definition)projection=resolveJutsu(item.actor,p,{system:{jutsu:{effectId:sourceId,selectionId:'',usedLevel:level,variant:item.system.jutsu?.variant||'normal',overrides:[]}}});
 const data=projection?.data??{},values=profileValues(powerProfile.profile,item.actor,level),rule=jutsuRuleText(item,library);
 let cost=number(data.chakraCost)??number(first(rows,'Chakra'))??ruleCost(headers['custo de chakra']||rule.fields.chakraCost,level,item.actor),base=number(data.damage)??number(first(rows,'Dano base')),mode=data.test==='cc'?'attack:cc':data.test==='cd'?'attack:cd':'none';
 // Common effect costs inherit the common power. Fixed techniques never do.
 if(cost===null&&(definition||entry?.document.type==='effectDefinition')&&p&&(powerProfile.profile||p.system.power?.definitionId))cost=level;
 if(base===null&&headers.dano&&/comum|padrao/i.test(headers.dano))base=number(first(rows,'Dano comum do poder'));
 const body=clean(item.system.description),rawDamage=clean(headers.dano);
 if(values&&base===null){if(/2 por nivel/.test(rawDamage))base=values.double;else if(/comum|padrao/.test(rawDamage))base=values.common;else if(/ver texto/.test(rawDamage)&&/dano comum/.test(body)&&definition?.execution!=='support')base=values.common;}
 if(base===null&&/^\d+$/.test(rawDamage))base=Number(rawDamage);
 if(!projection?.valid&&base!==null&&(definition?.test==='cd'||values))mode='attack:cd';
 if(projection?.noRoll||projection?.data?.damage==='Nenhum'||!headers.dano&&base===null)mode='none';
 let saveKeys=projection?.resistanceCast?['attribute:int']:[];
 if(saveKeys.length)mode='save';
 if(sourceId==='sns:effect:nuvem'){mode='save';saveKeys=['attribute:vig'];base=0;}
 if(sourceId==='sns:effect:mina-explosiva'){mode='save';saveKeys=['attribute:agi','skill:prontidao'];base=number(first(rows,'Dano base'));cost=level;}
 if(['sns:jutsu:rasengan-basico','sns:jutsu:rasengan-completo','sns:jutsu:oodama-rasengan'].includes(sourceId)){
  const esp=item.actor.system.attributes?.esp;
  if(Number.isInteger(esp)){cost=level;base=sourceId.endsWith('basico')?2+level+Math.ceil(esp/2):level+esp;mode='attack:cc';}
 }
 let projectiles=null;
 if(sourceId==='sns:effect:flechas'&&powerProfile.profile){projectiles={count:level,baseEach:2,bonus:powerProfile.profile.damageBonus};base=2*level+projectiles.bonus;mode='attack:cd';}
 if(sourceId==='sns:effect:lamina-de-vento'&&powerProfile.nature==='fuuton'){mode='attack:cd';base=3*level;cost=level;}
 if(sourceId==='sns:effect:lamina-de-raios'&&values){mode='attack:cc';base=values.common;cost=level;}
 if(sourceId==='sns:effect:bracos-de-serpente'){mode='none';base=null;}
 if(sourceId==='sns:effect:explosao-sonora'&&values){mode='save';saveKeys=['attribute:vig'];base=level>=7?level:2;cost=level>=7?level:4;}
 const katon=Array.from(item.actor.items).find(i=>i.type==='power'&&(i.system.contentId==='sns:power:katon'||i.system.power?.definitionId==='sns:power:katon'));
 if(sourceId==='sns:jutsu:amaterasu'&&Number.isInteger(katon?.system.level)){mode='attack:lm';cost=10;base=0;}
 if(sourceId==='sns:power:kuchiyose'&&p){cost=2*level;mode='none';base=null;}
 if(sourceId==='sns:jutsu:chakra-no-mesu'&&p){cost=level;mode='attack:cc';base=2*level;}
 const section=item.flags?.['sns-v14-dev']?.canonicalTextSource?.section??'',recipe=item.flags?.['sns-v14-dev']?.npcSourceRecipe;
 let noDamage=false,damageNature='lethal';
 if(sourceId==='sns:power:kagejutsu'&&/^NÍVEL [13]:/.test(section)){mode='attack:cd';cost=level;base=0;noDamage=true;}
 if(sourceId==='sns:power:shikakyu'&&section.startsWith('NÍVEL 3:')){const strength=effectiveAttribute(item.actor,'for','unarmed');if(Number.isFinite(strength)){base=Math.ceil(strength/2)+(level>=6?4:level>=5?3:level>=4?2:1);if(recipe?.variant==='gatsuga')base*=2;mode='attack:cc';cost=1;}}
 if(sourceId==='sns:power:baika-ninpou'&&section.startsWith('NÍVEL 2:')){const strength=effectiveAttribute(item.actor,'for','unarmed'),iron=Array.from(item.actor.items).some(i=>i.system.contentId==='sns:apt:punho-de-ferro'||i.system.ruleId==='sns:apt:punho-de-ferro'),original=item.actor.system.attributes?.for;if(Number.isFinite(strength)){base=Math.ceil(strength/2)+(iron?(original>=12?4:original>=10?3:original>=8?2:1):0);mode='attack:cc';cost=1;damageNature=iron?'lethal':'nonlethal';}}
 // A book describes a damage action but the mode/value is unresolved: ask the
 // controller for the missing number instead of fabricating an automatic zero.
 if(sourceId!=='sns:effect:bracos-de-serpente'&&headers.dano&&!/nenhum|nenhuma|b[oô]nus/i.test(headers.dano)&&base===null&&mode==='none'&&!projection?.noRoll&&!projection?.support&&definition?.execution!=='support')mode='unknown';
 const areaText=data.area||headers['area de efeito']||'',shape=/cone/i.test(areaText)?'cone':/circul|esfera|circl/i.test(clean(areaText))?'circle':/linha|raio/i.test(areaText)?'ray':'';
 let size=number(first(rows,'Tamanho máximo (m)','Tamanho máximo'))??(Number.isFinite(data.size)?data.size:null);
 if(size===null&&values)size=values.size;
 if(size===null){const m=String(first(rows,'Tamanho máximo')??'').match(/^(\d+)\s*m$/);if(m)size=Number(m[1]);}
 if(sourceId==='sns:effect:mina-explosiva')size=5;
 let dc=Number.isFinite(data.difficulty)?data.difficulty:number(first(rows,'Dificuldade remota','Dificuldade','Dificuldade comum'))??values?.dc??null;
 if(sourceId==='sns:effect:nuvem'){if(dc!==null)dc-=2;if(projection?.environment)size=projection.environment.size;else if(size!==null)size*=2;}
 if(sourceId==='sns:effect:explosao-sonora'&&dc!==null)dc-=2;
 const overrides={...item.flags?.['sns-v14-dev']?.npcCastParameters?.[level],...custom};
 const plan={version:1,name:item.name,level,min,max,mode,cost,base,fixed:sourceId==='sns:effect:nuvem'?level:0,gradeBonus:sourceId==='sns:jutsu:oodama-rasengan'?0.5:0,saveKeys,dc,shape:sourceId==='sns:effect:nuvem'?'circle':shape,size,action:sourceId==='sns:effect:mina-explosiva'?'Padrão · preparar até 2 minas; livre · detonar':data.action||headers.acao||'',range:data.range||first(rows,'Alcance comum','Alcance')||(values?values.range+' m':headers.alcance)||'',duration:data.duration||headers.duracao||'',description:item.system.description,source:item.system.source,clay:sourceId==='sns:effect:mina-explosiva'||/kibaku/i.test(p?.name??'')?level:null,projectionValid:!!projection?.valid,natures:powerProfile.natures,nature:powerProfile.nature??custom.nature??saved.nature??'',missing:[]};
 if(projectiles)plan.projectiles=projectiles;
 if(noDamage)plan.noDamage=true;if(damageNature!=='lethal')plan.damageNature=damageNature;
 if(sourceId==='sns:jutsu:amaterasu'&&Number.isInteger(katon?.system.level)){plan.fixed=2*katon.system.level;plan.range='10 m';plan.ignoreAllHardness=true;plan.visionCost=2;}
 for(const key of ['action','range','duration'])if(!plan[key]||genericRule(plan[key]))plan[key]=rule.fields[key]??'';
 if(values&&/comum|padr[aã]o/i.test(plan.range))plan.range=values.range+' m';
 if(sourceId==='sns:power:kagejutsu'&&section)plan.range=(5+2*level)+' m';
 plan.costRule=rule.fields.chakraCost??headers['custo de chakra']??'';plan.damageRule=rule.fields.damage??'';
 if(sourceId==='sns:jutsu:chakra-no-souin'){plan.range='Superfície imóvel';plan.costRule='Seu chakra é reduzido a 1; mínimo de 15 contando os Kage Bunshins.';}
 if(sourceId==='sns:apt:rinkaichuu')plan.range=custom.contextChoice==='spread'?'Pessoal':'Contato físico';
 for(const key of ['mode','cost','base','dc','shape','size','saveKeys'])if(Object.hasOwn(overrides,key))plan[key]=overrides[key];
 const grant=item.actor.items.get(item.flags?.['sns-v14-dev']?.generatorTechnique?.grantId);
 if(item.flags?.['sns-v14-dev']?.generatorTechnique&&!(grant?.type==='aptitude'&&grant.system.contentId===sourceId&&requirementsFor(grant,item.actor).valid))throw Error('A aptidão de origem está ausente ou seus requisitos não são cumpridos.');
 if(grant?.type==='aptitude'&&grant.system.contentId===sourceId){
  if(sourceId==='sns:apt:fascinar'){plan.mode='save';plan.cost=3;plan.base=0;plan.noDamage=true;plan.dc=6+effectiveAttribute(item.actor,'int');plan.saveKeys=['attribute:int'];plan.action='Padrão';plan.range='5 m';plan.duration='Cena';plan.useNote='Falha: Fascinado. A partir do segundo turno, a vítima pode repetir o teste antes de agir, com Dif −1 cumulativa. Dano encerra o fascínio. Um uso bem-sucedido por alvo na cena.';}
  if(sourceId==='sns:apt:miragem'){plan.mode='none';plan.cost=1;plan.base=0;plan.action='Padrão';plan.range='5 m';plan.duration='Contínua';plan.useNote='Ilusão pequena e imóvel. Interação, visão de chakra e Kai seguem a descrição.';}
  if(['sns:apt:ataque-giratorio','sns:apt:chute-giratorio'].includes(sourceId)){plan.action='Padrão';plan.range=item.system.details.range;plan.shape='circle';plan.size=2*Number.parseFloat(plan.range);}
 }
 if(bookCanhao&&values){plan.cost=level;plan.base=values.double;plan.mode='attack:cd';plan.range=values.range+' m';}
 const repertoire=sourceRepertoirePlan(item,level,values);if(repertoire)Object.assign(plan,repertoire);
 const puppet=puppetUsePlan(item);if(puppet){Object.assign(plan,puppet);plan.description=item.system.description.split(/<h3>ESTRANGULAR/i)[0];}
 if(p?.system.contentId==='sns:power:kujaku-myoho')plan.healthCost=1;
 const context=resolveNpcContext(item,custom,level);if(context){plan.context=context;if(context.valid){plan.cost=context.cost;for(const key of ['action','duration','mode','base','dc','saveKeys','noDamage'])if(Object.hasOwn(context,key))plan[key]=context[key];if(context.payment)plan.payment=context.payment;if(context.adjustment!==undefined)plan.testAdjustment=context.adjustment;if(context.checks)plan.checks=context.checks;if(context.note)plan.useNote=context.note+(context.selected==='infected'?' Grupos: '+context.value+'. Dano fixo por turno: '+context.value+'.':'');}else plan.missing.push('context');}
 if(powerProfile.isMulti&&!powerProfile.profile)plan.missing.push('nature');
 if(sourceId==='sns:jutsu:chakra-no-souin'&&(p?.system.contentId!=='sns:power:fuuinjutsu'||p.system.level<7))plan.missing.push('power');
 if(!['none','attack:cc','attack:cd','attack:lm','save'].includes(plan.mode))plan.missing.push('mode');
 if(!Number.isInteger(plan.cost)||plan.cost<0)plan.missing.push('cost');
 if(plan.mode.startsWith('attack')&&(!Number.isInteger(plan.base)||plan.base<0))plan.missing.push('base');
 if(plan.mode==='save'&&(!Number.isFinite(plan.dc)||plan.dc<1||!plan.saveKeys?.length||plan.saveKeys.some(k=>!RESISTANCE_KEYS.some(r=>r.key===k))))plan.missing.push('save');
 plan.areas=jutsuAreas(item,projection??{},{usedLevel:level,commonSize:values?.size,commonRange:values?.range});
 if(plan.areas){const first=plan.areas.choices[0];plan.shape=first.shape==='line'?'ray':first.shape;plan.size=first.diameter??first.length??plan.size;}
 if(!plan.areas&&!['','circle','cone','ray'].includes(plan.shape))plan.missing.push('size');
 if(!plan.areas&&plan.shape&&(!Number.isFinite(plan.size)||plan.size<=0))plan.missing.push('size');
 return plan;
}
export function templateSpec(plan,{units='m',user,color='#a93c22'}={}){
 if(!['circle','cone','ray'].includes(plan.shape)||!Number.isFinite(plan.size)||plan.size<=0)throw Error('Área da técnica não configurada.');
 const factor=/^(?:ft|feet|foot|pes|pés)$/i.test(units)?3.280839895:1;
 return {t:plan.shape,distance:plan.size*factor/(plan.shape==='circle'?2:1),direction:0,angle:plan.shape==='cone'?90:360,width:plan.shape==='ray'?factor:undefined,user,fillColor:String(color)};
}
