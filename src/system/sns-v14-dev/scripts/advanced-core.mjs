// SNS Básico103–114; Guia Avançado2026 PDF49–57,74–81. No prose/name matching grants mechanics.
import {SKILLS} from './rules.mjs';
const ns='sns-v14-dev';
export const ADVANCED_KINDS=['imergir','venenoso','lamina-de-vento','inflamavel','meteoros','colisao-de-ondas','dano-continuo','flutuar','desastre'];
export const ADVANCED_IDS=ADVANCED_KINDS.map(k=>'sns:effect:'+k);
export const advancedState=i=>i?.flags?.[ns]?.advancedState;
export const advancedRoots=a=>Array.from(a?.items??[]).filter(i=>i.flags?.[ns]?.environment&&ADVANCED_KINDS.includes(i.flags[ns].environment.kind));
export const liveAdvanced=a=>advancedRoots(a).filter(i=>i.system.appliedCondition?.active);
export const advancedStates=a=>Array.from(a?.items??[]).filter(i=>advancedState(i)&&i.system.appliedCondition?.active);
const items=a=>Array.from(a?.items??[]),identity=i=>i?.system.ruleId||i?.system.contentId;
export const hasChosen=(a,id,key)=>items(a).some(i=>identity(i)===id&&i.system.choice?.key===key);
export function originalSkill(a,key,attribute='int'){
 const bought=a.system.skills?.[key]?.bought,value=a.system.attributes?.[attribute];
 return Number.isInteger(bought)&&Number.isInteger(value)?Math.ceil(value/2)+bought:Number.isInteger(a.system.skillLevels?.[key])?a.system.skillLevels[key]:null;
}
export function advancedProjection({actor,power,effect:e,choices,usedLevel:n,problems=[]}){
 const kind=e.id.split(':').at(-1),element=power.system.power.definitionId.split(':').at(-1),esp=actor.system.attributes.esp,half=Math.ceil(esp/2),stage=Math.max(e.min,...choices.filter(c=>c.effectId===e.id&&c.stage<=n).map(c=>c.stage));
 const size=Math.ceil((element==='katon'?2:element==='raiton'?.5:1)*esp),range=element==='doton'?5+esp:element==='raiton'?15+3*esp:10+2*esp,dc=9+n+half;
 if(kind==='lamina-de-vento'&&!choices.some(c=>c.effectId==='sns:effect:energizar'))problems.push('Lâmina de Vento exige Energizar adquirido no mesmo poder.');
 if(kind==='flutuar'){
  if(!hasChosen(actor,'sns:apt:maestria','sns:power:'+element))problems.push('Flutuar exige Maestria no poder usado.');
  if(!hasChosen(actor,'sns:apt:usar-arma','sns:equipment:leque-gigante'))problems.push('Flutuar exige Usar Arma: Leque Gigante.');
 }
 const turns=originalSkill(actor,'concentracao');if(kind==='desastre'&&(!Number.isInteger(turns)||turns<1))problems.push('Informe o nível original de Concentração para a duração de Desastre.');
 const cost=kind==='flutuar'?5:kind==='desastre'?3*n:n,action=['imergir','lamina-de-vento','meteoros'].includes(kind)?'Completa':kind==='flutuar'?'Movimento':kind==='desastre'?'Concentração':'Padrão',duration=['imergir','inflamavel'].includes(kind)?'Contínua':kind==='flutuar'?'Sustentada':['desastre','colisao-de-ondas'].includes(kind)?'Concentração':'Instantânea';
 const damage=kind==='lamina-de-vento'?3*n:kind==='colisao-de-ondas'?(stage>=10?18:stage>=8?14:10):kind==='desastre'?3*n:0;
 const m={advanced:true,kind,element,stage,usedLevel:n,cost,dc,damage,commonDamage:n+half+(['katon','fuuton'].includes(element)?2:element==='raiton'?1:0),range:kind==='lamina-de-vento'?5:kind==='imergir'||kind==='flutuar'?0:kind==='desastre'?2*range:range,size:kind==='desastre'?3*size:size,maxTargets:['dano-continuo','lamina-de-vento'].includes(kind)?1:50,duration,action,maxTurns:turns,concentration:duration==='Concentração',doses:kind==='dano-continuo'?(stage>=7?5:3):0};
 const data={action,duration,range:m.range?m.range+' m':'Pessoal',target:['imergir','flutuar'].includes(kind)?'O usuário':'Alvos marcados',area:kind==='meteoros'?'6 esferas · diâmetro5m':kind==='venenoso'?'Cone · '+size+'m':['desastre','inflamavel','colisao-de-ondas'].includes(kind)?'Área · '+m.size+'m':'',chakraCost:kind==='inflamavel'?'3 + combustão / '+n:String(cost),damage:damage?String(damage):kind==='meteoros'?n+' fixo por meteoro':kind==='dano-continuo'?n+' fixo por dose':'Nenhum',difficulty:dc,seals:kind==='lamina-de-vento'?'Sem selos':'Conforme a descrição'};
 const summary={imergir:'Imersão no elemento; Furtividade como Perito enquanto oculto, saída com movimento.',venenoso:'Consome uma dose produzida de veneno até categoriaII; a injeção é garantida e os alvos resistem ao veneno.','lamina-de-vento':n+' lâminas de DB3, um ataque/defesa. Prontidão antes da defesa; não recebe outros bônus de dano.',inflamavel:'Escolha preparar uma combustão ou manter uma área inflamável.',meteoros:'Seis explosões de dano fixo, somadas por alvo conforme sobreposição. Mira direta: CD−3, sem Esquiva/Antecipar.','colisao-de-ondas':'Onda com dano próprio, captura de alvos e natação/respiração no início dos turnos.','dano-continuo':'Dano imediato; primeiro turno sem nova cobrança, depois até '+(m.doses-1)+' doses. Ação completa e Vigor para retirar.',flutuar:'Voo com precisão igual ao Espírito e Alado; o leque usado fica indisponível.',desastre:'Uma vez por cena. Lento e ataque no início do turno dos participantes; continua uma rodada após perder concentração.'}[kind];
 return {valid:!problems.length,problems,noRoll:true,cost,usedLevel:n,data,effect:e,power,environment:m,summary,traits:['arte:ninjutsu','custo:chakra',...(element==='ninpou'?[]:['elemento:'+element])],formulas:{chakraCost:kind==='flutuar'?'5':kind==='desastre'?'3 × nível usado':'Conforme modo de uso'},provenance:Object.fromEntries(Object.keys(data).map(k=>[k,'regra do efeito']))};
}
export function advancedPlan(actor,m,s={},targets=[],useUuid=''){
 if(targets.length>m.maxTargets||new Set(targets.map(t=>t.uuid)).size!==targets.length)throw Error('Quantidade de alvos inválida.');
 const plan={...m,mode:s.mode||'normal',selection:structuredClone(s),members:{},hits:{},events:{},pending:false,remainingHardness:0,maxHardness:0};
 if(m.kind==='imergir'&&s.validMedium!==true)throw Error('Escolha um meio elemental, Criação Livre ou Barreira com espaço para o corpo.');
 if(m.kind==='flutuar'){
  const fan=items(actor).find(i=>i.id===s.fanId&&i.system.contentId==='sns:equipment:leque-gigante'&&i.system.equipped&&i.system.quantity>0);
  if(!fan||s.clearSpace!==true)throw Error('Empunhe o leque. É preciso espaço livre e nenhum inimigo adjacente.');
  if(!['normal','fall','land'].includes(plan.mode))throw Error('Forma de voo indisponível.');
  if(plan.mode!=='normal'&&s.movementAvailable!==true)throw Error('A reação à queda exige movimento disponível.');plan.fanId=fan.id;plan.flightPrecision=actor.system.attributes.esp;
 }
 if(m.kind==='venenoso'){
  const poison=items(actor).find(i=>i.id===s.poisonId),definition=poisonDefinition(poison?.system.contentId),batch=poison?.flags?.[ns]?.poisonBatch;
  if(!targets.length||!definition||!batch||typeof batch.producerUuid!=='string'||batch.category!==definition.category||!Number.isInteger(batch.producerSkill)||batch.producerSkill+(batch.dokujutsu?2:0)<4+2*definition.category||poison.system.quantity<1)throw Error('Selecione uma dose com fabricante definido, até categoria II.');
  plan.poison={...definition,itemId:poison.id,producerSkill:batch.producerSkill,dc:batch.dokujutsu?8+batch.producerSkill:9+definition.category+Math.ceil(batch.producerSkill/2),name:poison.name,description:poison.system.description};
 }
 if(m.kind==='meteoros'){
  if(!targets.length||!['normal','aimed'].includes(plan.mode))throw Error('Marque os alvos atingidos pelas explosões.');
  const counts=s.counts??{};for(const t of targets)if(!Number.isInteger(counts[t.uuid.replaceAll('.','~')])||counts[t.uuid.replaceAll('.','~')]<1||counts[t.uuid.replaceAll('.','~')]>6)throw Error('Distribua de 1 a 6 meteoros por alvo.');plan.counts=counts;
 }
 if(['dano-continuo','lamina-de-vento','colisao-de-ondas'].includes(m.kind)&&!targets.length)throw Error('Marque os alvos.');
 if(m.kind==='inflamavel'){
  if(!['continuous','meta'].includes(plan.mode))throw Error('Escolha a forma de Inflamável.');
  plan.cost=plan.mode==='meta'?3:m.cost;plan.concentration=false;
 }
 if(m.kind==='desastre'&&actor.flags?.[ns]?.advancedScene?.disasterUsed&&actor.flags[ns].advancedScene.disasterUseUuid!==useUuid)throw Error('Desastre já foi usado nesta cena.');
 return plan;
}
export function advancedDamage(m){
 const common={base:m.damage??0,fixed:0,nature:'lethal',criticalAt:15,attackKind:['meteoros','colisao-de-ondas','desastre','inflamavel'].includes(m.kind)?'area':'techniqueProjectile',advancedKind:m.kind};
 if(m.kind==='meteoros')return {...common,base:0,fixed:m.usedLevel,targetFixed:Object.fromEntries(Object.entries(m.counts).map(([id,n])=>[id,m.usedLevel*n])),...(m.mode==='aimed'?{allowedDefenses:['block'],attackKind:'techniqueProjectile'}:{})};
 if(m.kind==='dano-continuo')return {...common,base:0,fixed:m.usedLevel};
 if(m.kind==='venenoso')return {...common,base:0,noDamage:true};
 if(m.kind==='lamina-de-vento')return {...common,preDefense:{key:'skill:prontidao',dc:m.dc,condition:m.stage>=10?'desprevenido':'fintado',chakraVisionAuto:true,sensorReduction:2}};
 return common;
}
export function continuousStep(state,event){
 if(state.kind!=='dano-continuo'||event.phase!=='start'||event.actor?.uuid!==state.targetUuid||state.lastEvent===event.key||state.remaining<=0)return null;
 return {lastEvent:event.key,seen:(state.seen??0)+1,remaining:state.remaining-((state.seen??0)>=1?1:0),tickDamage:(state.seen??0)>=1?state.damage:0};
}
export function advancedEffects(actor){
 const rows=[];const doku=items(actor).find(i=>i.system.power?.definitionId==='sns:power:dokujutsu'&&i.system.level>0);if(doku)rows.push({kind:'flatModifier',target:'skill:veneficio',value:2,sourceId:doku.id,sourceName:'Dokujutsu · testes de Venefício'});for(const root of liveAdvanced(actor)){const m=root.flags[ns].environment;
  if(m.kind==='imergir')rows.push({kind:'movementLimit',value:m.stage<4?0:.5,sourceId:root.id,sourceName:'Imergir'});
  if(m.kind==='imergir'&&m.hidden!==false&&!hasChosen(actor,'sns:apt:perito','furtividade'))rows.push({kind:'flatModifier',target:'skill:furtividade',value:2,sourceId:root.id,sourceName:'Imergir · Perito'});
  if(m.kind==='flutuar'&&m.mode!=='land')rows.push({kind:'skillOverride',target:'voo',value:m.flightPrecision,sourceId:root.id,sourceName:'Flutuar'});
 }
 for(const item of advancedStates(actor)){const m=advancedState(item);if(m.kind==='venenoso'&&m.activePoison&&!m.suppressed&&m.failures>0)for(const [target,value]of poisonDefinition(m.poison.id)?.penalties??[])rows.push({kind:'condition',key:'poison:'+item.id+':'+target,scope:target,degree:-value,sourceId:item.id,sourceName:item.name,exceptResistance:true,poison:true});}
 for(const item of advancedStates(actor)){const m=advancedState(item),p=m.kind==='venenoso'&&m.activePoison&&!m.suppressed&&m.failures>0?poisonDefinition(m.poison.id):null;if(p?.allTestsPenalty)rows.push({kind:'condition',key:'poison:'+item.id,scope:'all',degree:-p.allTestsPenalty,sourceId:item.id,sourceName:item.name,exceptResistance:true,poison:true});if(p?.vision)rows.push({kind:'condition',key:'ofuscado',scope:'attacks',degree:1,sourceId:item.id,sourceName:item.name,poison:true,exceptResistance:true});}
 return rows;
}
export function advancedMovement(value,actor){const roots=liveAdvanced(actor).filter(i=>i.flags[ns].environment.kind==='imergir');return roots.length?roots.some(i=>i.flags[ns].environment.stage<4)?0:value/2:value;}
export function unavailableFan(actor,id){return liveAdvanced(actor).some(i=>i.flags[ns].environment.kind==='flutuar'&&i.flags[ns].environment.fanId===id);}
export const submerged=a=>advancedStates(a).some(i=>advancedState(i).kind==='colisao-de-ondas'&&advancedState(i).submerged);
const poisonRows=[
 ['veneno-de-coceira',0,1,[['attribute:agi',-1],['skill:acrobacia',-1],['skill:escapar',-1],['skill:furtividade',-1]]],
 ['veneno-laxante',0,48,[['attribute:car',-1],['attribute:man',-1],...SKILLS.filter(s=>['car','man'].includes(s.attribute)).map(s=>['skill:'+s.key,-1])]],['veneno-urticante',0,8,[['attribute:car',-1],['attribute:man',-1],...SKILLS.filter(s=>['car','man'].includes(s.attribute)).map(s=>['skill:'+s.key,-1])]],
 ['veneno-de-inflamacao-nasal',0,1,[],{dokujutsu:1,suffocationPenalty:-1}],
 ['sonifero-menor',1,2,[],{sleepFailures:6}],['veneno-enfraquecedor-menor',1,2,[['attribute:for',-1]],{damageStrength:-2}],
 ['sonifero',2,2,[['lm',-1],['attribute:per',-1],['skill:prontidao',-1],['skill:procurar',-1],['skill:rastrear',-1]],{sleepFailures:5}],
 ['veneno-debilitante-menor',2,4,[],{allTestsPenalty:-1}],['veneno-de-embriagues',2,0,[],{narrative:true,socialResistance:true}],
 ['veneno-ocular-menor',2,2,[],{vision:true}],['veneno-de-tontura',2,4,[['attribute:int',-1],['skill:concentracao',-1]],{dokujutsu:3}]
];
export const POISON_DEFINITIONS=Object.fromEntries(poisonRows.map(([key,category,hours,penalties,extra={}])=>['sns:poison:'+key,{id:'sns:poison:'+key,category,hours,penalties,...extra}]));
export const poisonDefinition=id=>POISON_DEFINITIONS[id];
export function poisonContextEffects(actor,context={}){
 const effects=[];for(const item of advancedStates(actor)){const m=advancedState(item),p=m.kind==='venenoso'&&m.activePoison&&!m.suppressed&&m.failures>0?poisonDefinition(m.poison.id):null;if(!p)continue;
  const degree=context.suffocation?-(p.suffocationPenalty??0):context.sense==='vision'&&p.vision?2:context.socialResistance&&p.socialResistance?2:0;if(degree)effects.push({kind:'condition',key:'poison-context:'+item.id,scope:context.suffocation?'attribute:vig':'all',degree,sourceId:item.id,sourceName:item.name});
 }return effects;
}
export function poisonStrengthAdjustment(actor){return Math.min(0,...advancedStates(actor).filter(i=>{const m=advancedState(i);return m.kind==='venenoso'&&m.activePoison&&!m.suppressed&&m.failures>0;}).map(i=>poisonDefinition(advancedState(i).poison.id)?.damageStrength??0));}
export function virtualRecordedSkills(rows,effects){const override=effects.find(e=>e.kind==='skillOverride'&&e.target==='voo');return override?[...rows.filter(r=>r.key!=='voo'),{key:'voo',name:'Voo',precision:override.value,display:'+'+override.value,signedPrecision:'+'+override.value,untrained:false}]:rows;}

export function advancedPresentation(item){
 const state=advancedState(item),root=item?.flags?.[ns]?.environment;if(state){const desc=state.kind==='dano-continuo'?state.remaining+' doses restantes · Vigor Dif '+(state.dc-(state.stage>=7?0:3))+' · ação completa':state.kind==='colisao-de-ondas'?'Submerso · natação ou respiração no início do turno':state.kind==='prisao-de-agua'?'Sufocamento · respiração no início do turno':state.kind==='venenoso'?(state.suppressed?'Efeitos suspensos até o fim da cena':state.activePoison?'Veneno ativo':'Adaptado a outro veneno')+' · '+state.successes+'/3 sucessos · '+state.failures+(state.failures===1?' falha':' falhas'):state.kind==='decapitation'?'Impedido · libertar-se: Força/Escapar Dif10, movimento':state.kind==='desastre'?'Na área do desastre · Lento e ataques no início do turno':'Na área inflamável';
  return {environmentRootUuid:state.rootUuid,advancedStateId:item.id,displaySummary:desc,...(state.kind==='dano-continuo'?{durationShort:state.remaining+' doses'}:{}),advancedActions:state.kind==='dano-continuo'?[{key:'attribute:vig',label:'Retirar · Vigor · completa'}]:state.kind==='decapitation'?[{key:'attribute:for',label:'Força · movimento'},{key:'skill:escapar',label:'Escapar · movimento'}]:[]};
 }
 if(root?.advanced)return {displaySummary:root.kind==='imergir'?(root.hidden!==false?'Oculto · Perito em Furtividade':'Posição revelada')+' · '+(root.stage>=4?'deslocamento pela metade':'sem deslocamento'):root.kind==='flutuar'?'Alado · Voo '+root.flightPrecision+' · leque reservado':root.kind==='desastre'?(root.drifting?'Rodada residual · sem proteção':'Concentração · '+(root.elapsedTurns??0)+'/'+root.maxTurns+' turnos')+' · DB'+root.damage:root.kind==='colisao-de-ondas'?'DB'+root.damage+' · manutenção Chakra'+Math.ceil(root.cost/2):root.kind==='inflamavel'?root.mode==='meta'?'Preparação de combustão · +2DB':'Área inflamável · aguarda ignição':'Uso da técnica · consulte o resultado no chat'};
 return {};
}
