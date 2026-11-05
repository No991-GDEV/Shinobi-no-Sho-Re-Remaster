import {recordedSkillLevel} from './recorded-skill-level.mjs';
import {summonItemProblems,summonUseProblem,kuchiyoseLink} from './kuchiyose-core.mjs';
import {elementalProjection} from './elemental-projection.mjs';
import {phantasmProjection} from './phantasm-core.mjs';
import {supportProjection} from './support-core.mjs';
import {environmentProjection} from './environment-core.mjs';
import {magenProjection} from './magen-core.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {POWER_DEFINITIONS,EFFECT_DEFINITIONS,ACTIONS,DURATIONS} from '../data/power-definitions.mjs';
export const powerDefinition=id=>POWER_DEFINITIONS.find(x=>x.id===id);
export const ownedPowerDefinition=power=>powerDefinition(power?.system?.power?.definitionId||power?.system?.contentId);
const allows=(p,e)=>p.allowedEffects?p.allowedEffects.includes(e.id):e.powers.includes(p.id.split(':').at(-1));
export const effectDefinition=id=>EFFECT_DEFINITIONS.find(x=>x.id===id);
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
export function availableChoices(power,slot){const p=ownedPowerDefinition(power);if(!p)return [];const prior=power.system.power.choices.filter(c=>c.slot<slot),seen=new Map(prior.map(c=>[c.effectId,c.stage]));return EFFECT_DEFINITIONS.filter(e=>allows(p,e)).map(e=>{const stages=[e.min,...e.evolutions],old=seen.get(e.id),stage=old===undefined?e.min:stages[stages.indexOf(old)+1];return {...e,stage,allowed:stage!==undefined&&stage<=slot&&slot<=power.system.level,reason:stage===undefined?'Todas as evoluções selecionadas.':'Exige nível '+stage};});}
export function learnedEffects(power){return power.system.power.choices.filter(c=>c.slot<=power.system.level).map(c=>({...c,definition:effectDefinition(c.effectId)})).filter(c=>c.definition);}
export function jutsuVariants(power,effectId,usedLevel){
 const e=effectDefinition(effectId),stages=power?learnedEffects(power).filter(c=>c.effectId===effectId).map(c=>c.stage):[];
 return (e?.variants??[{id:'normal',name:'Normal'}]).filter(v=>(!v.min||usedLevel>=v.min)&&(!v.stage||stages.some(s=>s>=v.stage)));
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
 if(p.allowedEffects){const requirement=requirementsFor({...power,system:{...power.system,ruleId:p.id}},actor);if(!requirement.valid)problems.push(...requirement.problems);}
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
 if(['magen','phantasm'].includes(e.execution)){
  const requirement=requirementsFor({...power,system:{...power.system,ruleId:'sns:power:magen'}},actor);if(!requirement.valid)problems.push(...requirement.problems);
  if(j.overrides?.length)problems.push('Exceções de Magen exigem resolução manual; os custos e dificuldades tipados seguem o livro.');
  return (e.execution==='phantasm'?phantasmProjection:magenProjection)({actor,power,effect:e,choices,usedLevel:n,variant:j.variant||'normal',problems});
 }
 if(j.variant==='sem-chakra'&&(e.id!=='sns:effect:canhao'||n<2))problems.push('A variante sem chakra exige Canhão usado em nível2 ou maior.');
 const half=Math.ceil((attribute??0)/2),bonus=p.damageBonus,cost=j.variant==='sem-chakra'?0:e.id==='sns:effect:orbe'&&choices.some(c=>c.effectId===e.id&&c.stage>=7)&&n>=7?Math.ceil(n/2):n;
 let damage=e.damage==='double'?2*n+bonus:e.damage==='none'?'Nenhum':e.damage==='projectiles'?null:n+half+bonus;if(j.variant==='sem-chakra')damage=Math.ceil(damage/2);
 const orbe7=e.id==='sns:effect:orbe'&&choices.some(c=>c.effectId===e.id&&c.stage>=7)&&n>=7;
 const data={action:ACTIONS[e.action],duration:DURATIONS[e.duration],range:(p.rangeBase+p.rangeFactor*(attribute??0))+' m',target:e.target,area:e.area??'',chakraCost:String(cost),damage:damage===null?`${n} projéteis × DB2; +${bonus} uma vez por alvo`:String(damage),difficulty:9+n+half-(kuchiyoseLink(actor)?.mode==='calculated'&&kuchiyoseLink(actor).limit?.common?3:0),size:e.fixedSize??Math.ceil(p.sizeFactor*(attribute??0)),defenses:e.area||orbe7?'Esquiva / Antecipar; sem Bloqueio':'Conforme defesa e exceções da fonte',seals:e.seals?'Duas mãos livres':'Sem selos',test:e.test};
 if(e.id==='sns:effect:raio'){
  data.target=j.variant==='multiplos'?`Até ${Math.floor(n/2)} criaturas distintas, a até 4 m entre si`:'Uma criatura';
  data.defenses='Esquiva / Antecipar; Bloqueio somente com arma especial que bloqueie técnicas';
  if(j.variant==='concentrado'){data.action=ACTIONS.completa;data.damage=String(Number(data.damage)+2);}
 }
 const traits=[...e.traits.filter(t=>j.variant!=='sem-chakra'||t!=='custo:chakra'),...(j.variant==='sem-chakra'?['custo:sem-custo']:[]),...(p.id.endsWith(':ninpou')||p.allowedEffects?[]:['elemento:'+p.id.split(':').at(-1)])];
 const formulas={range:p.rangeBase+' + '+p.rangeFactor+' × ESP',damage:e.damage==='double'?'2 × nível usado + '+bonus:e.damage==='projectiles'?'Nível usado × projéteis de DB2':'Nível usado + ⌈ESP/2⌉ + '+bonus,difficulty:'9 + nível usado + ⌈ESP/2⌉'+(kuchiyoseLink(actor)?.mode==='calculated'&&kuchiyoseLink(actor).limit?.common?' − 3 (Kuchiyose comum)':''),size:e.fixedSize?'':'⌈'+p.sizeFactor+' × ESP⌉',chakraCost:j.variant==='sem-chakra'?'Variante sem chakra':orbe7?'⌈nível usado/2⌉':'Nível usado'};
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

const managedTraits=new Set([...EFFECT_DEFINITIONS.flatMap(e=>e.traits),...POWER_DEFINITIONS.filter(p=>!p.id.endsWith(':ninpou')).map(p=>'elemento:'+p.id.split(':').at(-1)),'custo:sem-custo']);
export function jutsuTraits(existing,projection){return projection?.traits?[...new Set([...(existing??[]).filter(id=>!managedTraits.has(id)),...projection.traits])]:existing??[];}
