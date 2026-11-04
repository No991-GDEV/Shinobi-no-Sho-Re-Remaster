import {SKILLS} from './rules.mjs';
import {LEGADO_PAIRS,LEGADO_STAGES,LEGADO_WEAPON_PROPERTIES} from '../data/legado-rules.mjs';
export const LEGADO_NS='sns-v14-dev',legadoId=i=>i?.system?.contentId||i?.system?.ruleId||'';
export const isLegado=i=>legadoId(i).startsWith('sns:legado:');
export const legadoItems=a=>Array.from(a?.items??[]).filter(i=>!i.flags?.[LEGADO_NS]?.legadoCopy);
export const hasLegado=(a,key)=>legadoItems(a).some(i=>legadoId(i)==='sns:legado:apt:'+key||legadoId(i)==='sns:legado:jutsu:'+key);
export const legadoState=a=>a?.flags?.[LEGADO_NS]?.legado??{};
export const legadoEternal=a=>hasLegado(a,'eien-mangekyo-sharingan');
export const legadoTransplant=a=>legadoItems(a).some(i=>i.system?.details?.featureRule==='Transplante de doujutsu · regra da mesa');
export const legadoHasMangekyo=a=>hasLegado(a,'mangekyo-sharingan')||legadoEternal(a);
export const legadoEyeSource=a=>legadoItems(a).find(i=>legadoId(i)==='sns:legado:apt:sharingan')??(legadoHasMangekyo(a)?legadoItems(a).find(i=>legadoId(i)==='sns:apt:sharingan'):null);
export const legadoEyeActive=a=>Array.from(a?.system?.activeAptitudes??[]).some(r=>r.active&&(r.rule==='legado-sharingan'||r.rule==='sharingan'||r.rule==='transplanted'));
export const legadoPair=a=>LEGADO_PAIRS.find(p=>p.id===legadoState(a).pair);
export const legadoSelected=a=>{const state=legadoState(a),pair=legadoPair(a);return state.customPair?.length===2?state.customPair:pair?.techniques??[];};
export const legadoTechniqueAllowed=(a,key)=>['mimica-sharingan','hipnose-sharingan','susanoo','takemikazuchi-no-kami','indra-no-vajra'].includes(key)||legadoSelected(a).includes(key)||LEGADO_PAIRS.some(p=>p.techniques.every(k=>legadoSelected(a).includes(k))&&p.shared?.includes(key));
const safe=(n,label,min=0,max=100000)=>{if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(label+' inválido.');return n;};
export function legadoVision(a){
 const max=safe(a?.system?.attributes?.per,'Percepção',1),s=legadoState(a),row=Array.from(a.system.specialResources??[]).find(r=>r.kind==='vision'&&legadoItems(a).some(i=>i.id===r.sourceId&&legadoId(i)==='sns:legado:apt:mangekyo-sharingan'));
 const value=Number.isInteger(row?.value)?row.value:s.vision?.value??max;safe(value,'Visão atual',0,max);
 return {max,value,spent:s.vision?.spent??0,cycle:s.vision?.cycle??0,blindness:s.vision?.blindness??0,pricePaid:s.vision?.pricePaid??false,locked:s.vision?.locked??false,restDays:s.vision?.restDays??0};
}
// Legado pp.6–9. Debt carries to a new pool; ordinary rest never refreshes vision.
export function spendLegadoVision(a,cost){
 safe(cost,'Custo de visão',0,100);const before=legadoVision(a),vision={...before},states=[];
 if(!cost||legadoEternal(a)||legadoTransplant(a))return {vision,spent:0,vitalityLoss:0,states,forced:false};
 if(vision.locked)throw Error('O Sharingan está em recuperação após a desativação forçada.');
 if(!legadoHasMangekyo(a))throw Error('Esta técnica exige o Mangekyo do Legado.');
 const remaining=vision.value-cost;vision.spent+=cost;vision.cycle+=cost;
 if(remaining<=0){
  vision.value=((remaining%vision.max)+vision.max)%vision.max||vision.max;vision.locked=true;
  if(!vision.pricePaid){vision.pricePaid=true;vision.blindness=Math.max(1,vision.blindness);vision.cycle=Math.max(0,cost-before.value);}
  states.push('atordoado','desprevenido','exausto');
 }else vision.value=remaining;
 if(before.pricePaid)while(vision.cycle>=vision.max){vision.cycle-=vision.max;vision.blindness=Math.min(3,vision.blindness+1);}
 const lost=vision.max-Math.min(vision.value,vision.max);
 if(lost>=Math.ceil(vision.max/4))states.push('sangramento-ocular');
 if(lost>=Math.ceil(vision.max/2))states.push('fatigado');
 return {vision,spent:cost,vitalityLoss:2*cost,states:[...new Set(states)],forced:remaining<=0};
}
export function restLegadoVision(a,days){
 safe(days,'Dias de repouso',1,365);const v=legadoVision(a),s=legadoState(a),required=s.visionRestDays??7;
 if(!v.pricePaid)throw Error('Antes de cumprir o Preço do Ódio, os pontos de visão não se recuperam por descanso.');
 if(!Number.isInteger(required)||required<7||required>14)throw Error('O mestre precisa definir de 7 a 14 dias para Descanso Sharingan.');
 v.restDays+=days;const recovered=v.restDays>=required;if(recovered){v.value=v.max;v.restDays=0;v.locked=false;}
 return {vision:v,recovered};
}
export function validateLegadoPair(value,{custom=false}={}){
 if(typeof value==='string'){const p=LEGADO_PAIRS.find(p=>p.id===value);if(!p)throw Error('Escolha um par de olhos do livro.');return {pair:p.id,customPair:[]};}
 const options=new Set(LEGADO_PAIRS.flatMap(p=>p.techniques));if(!custom||!Array.isArray(value)||value.length!==2||new Set(value).size!==2||value.some(k=>!options.has(k)))throw Error('Par customizado não permitido ou inválido.');return {pair:'custom',customPair:[...value]};
}
export function validateLegadoWeapons(value={}){
 const result={};for(const kind of ['cc','cd']){const props=value[kind]??[];if(!Array.isArray(props)||props.length>4||props.some(k=>!LEGADO_WEAPON_PROPERTIES[kind].includes(k)))throw Error('Escolha até quatro propriedades válidas por arma.');
  const count=k=>props.filter(x=>x===k).length;if(count('dano')>3||count('alcance')>2||count('ambidestra')&&count('dano')>1||props.some(k=>!['dano','alcance'].includes(k)&&count(k)>1))throw Error('As propriedades da arma ultrapassam os limites do livro.');result[kind]=[...props];}return result;
}
export function legadoSusanoo(a){const row=legadoState(a).susanoo??{},stage=row.active?LEGADO_STAGES.find(s=>s.stage===row.stage):null,esp=a.system.attributes?.esp;return stage&&Number.isInteger(esp)?{...row,active:true,profile:stage,max:stage.absorption(esp),value:row.value??0,hardness:stage.hardness+(row.yomiHardness??0),size:stage.size}:null;}
export function canLegadoStage(a,n){const stage=LEGADO_STAGES.find(s=>s.stage===n);return !!stage&&Number.isInteger(a?.system?.attributes?.esp)&&a.system.attributes.esp>=stage.esp&&(!stage.eternal||legadoEternal(a));}
export function transitionLegadoSusanoo(a,op,stage=1,turnKey=''){
 const esp=safe(a.system.attributes?.esp,'Espírito',1),state=structuredClone(legadoState(a)),old=state.susanoo??{},current=legadoSusanoo(a);let cost=0,vision=0;
 if(['ativar','completa','recriar'].includes(op)){
  if((state.susanooCooldown??0)>0)throw Error('Aguarde encerrar a fadiga do Indra-no-Vajra antes de reativar o Susano’o.');
  if(current)throw Error('O Susano’o já está ativo.');if(op==='ativar')stage=1;
  if(!canLegadoStage(a,stage)||stage>(state.susanooUnlocked??1))throw Error('Estágio indisponível: evolua e cumpra seus requisitos primeiro.');
  if(op==='recriar'&&(!old.destroyed||old.recreated))throw Error('Só é possível recriar uma vez na mesma cena após destruição.');
  state.susanoo={active:true,stage,value:LEGADO_STAGES[stage-1].absorption(esp),yomi:0,recreated:op==='recriar'||old.recreated===true};cost=Math.ceil(esp/2);vision=op==='recriar'?2:4;
  if(stage>=3&&legadoSelected(a).includes('yata-no-kagami'))vision++;
 }else if(op==='evoluir'){
  if(!current||!canLegadoStage(a,current.stage+1))throw Error('O próximo estágio não está disponível.');
  if(turnKey&&[old.evolvedTurn,old.regressedTurn].includes(turnKey))throw Error('Só é possível evoluir uma vez por turno, sem regredir no mesmo turno.');
  const next=LEGADO_STAGES[current.stage],gain=typeof next.gain==='function'?next.gain(esp):next.gain;
  state.susanoo={...old,stage:next.stage,value:Math.min(next.absorption(esp),old.value+gain),evolvedTurn:turnKey};state.susanooUnlocked=Math.max(state.susanooUnlocked??1,next.stage);
 }else if(op==='regredir'){
  if(!current||!Number.isInteger(stage)||stage<1||stage>=current.stage)throw Error('Escolha um estágio menor que o atual.');state.susanoo={...old,stage,value:Math.min(LEGADO_STAGES[stage-1].absorption(esp),old.value),regressedTurn:turnKey};
 }else if(op==='recuperar'){
  if(!current)throw Error('Ative o Susano’o primeiro.');state.susanoo={...old,value:current.max};vision=2;
 }else if(op==='encerrar'){state.susanoo={...old,active:false};}
 else throw Error('Controle do Susano’o desconhecido.');
 return {state,cost,vision};
}
export function legadoRequirement(a,req){
 const s=legadoState(a),keys=legadoSelected(a);let met=false,current='Não atendido';
 if(req.kind==='legadoEvent'){met=s.events?.[req.event]===true||req.event==='price'&&s.vision?.pricePaid===true;current=met?'Registrado na ficha':'Registre o acontecimento na configuração ocular';}
 if(req.kind==='legadoStage'){met=canLegadoStage(a,req.min)&&(s.susanooUnlocked??1)>=req.min;current='Estágio liberado '+(s.susanooUnlocked??1);}
 if(req.kind==='legadoPair'){met=keys.length===2&&(legadoPair(a)?.susanooException||keys.every(k=>hasLegado(a,k)));current=met?'Par escolhido e dominado':'Escolha e domine as duas técnicas do par';}
 if(req.kind==='legadoSelected'){met=legadoTechniqueAllowed(a,req.key);current=met?'Técnica do par escolhido':'Fora do par escolhido';}
 return {label:req.label,current,met};
}
export function legadoModifiers(a){
 const s=legadoState(a),out=[],add=(target,value,name)=>{if(value)out.push({kind:'flatModifier',target,value,sourceId:'legado',sourceName:name});};
 const blind=!legadoEternal(a)&&!legadoTransplant(a)&&(s.vision?.blindness??0),active=legadoEyeActive(a);
 if(blind&&!active)for(const key of ['cc','cd','esq','lm','attribute:per',...SKILLS.filter(s=>s.attribute==='per').map(s=>'skill:'+s.key)])add(key,-blind,'Cegueira · Legado');
 if(active&&(hasLegado(a,'sharingan')||legadoHasMangekyo(a))){const per=a.system.attributes?.per,agi=a.system.attributes?.agi,lm=Number.isInteger(a.system.bases?.lm)?a.system.bases.lm+per:a.system.statsOriginal?.lm??a.system.stats?.lm,esq=Number.isInteger(a.system.bases?.esq)?a.system.bases.esq+agi:a.system.stats?.esq;if(Number.isInteger(lm)&&Number.isInteger(esq))add('esq',lm-esq,'Esquiva perceptiva · Legado');}
 const effects=Array.from(a.items??[]).filter(i=>i.system?.appliedCondition?.active&&i.flags?.[LEGADO_NS]?.legadoEffect);
 for(const i of effects){const e=i.flags[LEGADO_NS].legadoEffect;if(e.intPenalty)add('attribute:int',-e.intPenalty,i.name);if(e.movement)add('movement',e.movement,i.name);}
 if(s.active?.hachiman&&hasLegado(a,'hachiman-hidari')){const strength=a.system.attributes?.for,esp=a.system.attributes?.esp;if(Number.isInteger(strength)&&Number.isInteger(esp))out.push({kind:'attributeModifier',target:'for',scope:'all',value:esp-strength,sourceId:'legado',sourceName:'Força de um Tufão'});}
 if(hasLegado(a,'kisshouten')){const base=a.system.attributes?.car;if(Number.isInteger(base))out.push({kind:'attributeModifier',target:'car',scope:'all',value:Math.floor(a.system.nc/2)+2-base,sourceId:'legado',sourceName:'Carisma Sobrenatural'});}
 return out;
}
export function legadoRowDetails(item,details={}){
 if(!isLegado(item)||item.type!=='jutsu')return details;
 const key=legadoId(item).split(':').at(-1),a=item.actor?.system?.attributes??{},half=n=>Number.isInteger(n)?String(Math.ceil(n/2)):'Variável';
 const cost=key==='mimica-sharingan'?'0 / variável':['amaterasu','kamui','bishamonten','mahikami'].includes(key)?half(a.per):['tsukuyomi','kotoamatsukami'].includes(key)?half(a.int):['susanoo','hachiman'].includes(key)?half(a.esp):key==='hipnose-sharingan'?'5 / variável':'Variável';
 return {...details,action:'Por modalidade',chakraCost:cost,range:String(details.range??'').length>35?'Por modalidade':details.range};
}
export function legadoMeleeProfile(actor,profile){
 const s=legadoState(actor);if(!profile||profile.attackKind!=='melee'||!s.active?.hachiman)return profile;
 const bonus=s.active['hachiman-hidari'],kets=s.active['hachiman-ketsuyoko'];
 return {...profile,base:profile.base+(bonus?.damageBonus??0),...(bonus?{legadoBonusReceipt:bonus.castUuid}:{}),...(kets&&profile.weaponClass==='Desarmado'?{gradeBonus:0.5,ignoreNonBijuuHardness:true}:{})};
}
