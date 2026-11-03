// Explicit book rules. Membership/line of cover is confirmed in the scene, never guessed from names.
import {ADVANCED_KINDS,advancedProjection,advancedPlan,advancedState,liveAdvanced,advancedStates} from './advanced-core.mjs';
const ns='sns-v14-dev';
export const ENVIRONMENT_IDS=['restringente','barreira','repelir','prisao-de-agua','nuvem','nevoa','deslocamento-de-vacuo','purificar'].map(k=>'sns:effect:'+k);
export const environmentData=i=>i?.flags?.[ns]?.environment;
export const environmentMember=i=>i?.flags?.[ns]?.environmentMember;
export const environmentRoots=a=>Array.from(a?.items??[]).filter(i=>environmentData(i));
export const activeEnvironments=a=>environmentRoots(a).filter(i=>i.system.appliedCondition?.active);
const list=a=>Array.from(a?.items??[]);
export const hasFlight=a=>liveAdvanced(a).some(i=>i.flags[ns].environment.kind==='flutuar'&&i.flags[ns].environment.mode!=='land')||(a.system.skills?.voo?.bought>0&&a.system.access?.voo)||a.system.recordedSkills?.some(s=>s.key==='voo'&&s.precision>0)||list(a).some(i=>i.system.appliedCondition?.active&&i.system.contentId==='sns:condition:alado');
export function environmentProjection({actor,power,effect:e,choices,usedLevel:n,problems=[]}){
 if(ADVANCED_KINDS.includes(e.id.split(':').at(-1)))return advancedProjection({actor,power,effect:e,choices,usedLevel:n,problems});
 const kind=e.id.split(':').at(-1),element=power.system.power.definitionId.split(':').at(-1),esp=actor.system.attributes.esp,stage=Math.max(e.min,...choices.filter(c=>c.effectId===e.id&&c.stage<=n).map(c=>c.stage)),half=Math.ceil(esp/2),hardness=n+half+(element==='doton'?2:0),size=Math.ceil((element==='raiton'?.5:element==='katon'?2:1)*esp),range=element==='doton'?5+esp:element==='raiton'?15+3*esp:10+2*esp,dc=9+n+half;
 
 if(kind==='nevoa'&&!list(actor).some(i=>(i.system.ruleId||i.system.contentId)==='sns:apt:lutar-as-cegas'||(i.system.ruleId||i.system.contentId)?.startsWith('sns:apt:sensor'))&&!actor.system.activeAptitudes?.some(a=>a.active&&a.rule==='sensor'))problems.push('Névoa exige Lutar às Cegas ou habilidade de Sensor autorizada.');
 const cost=kind==='deslocamento-de-vacuo'?(stage>=7?3:2):n,action=['barreira','repelir'].includes(kind)?'Movimento':kind==='deslocamento-de-vacuo'?'Parcial':'Padrão',duration=kind==='restringente'?'Contínua':kind==='prisao-de-agua'||kind==='nuvem'&&stage<7?'Concentração':['barreira','nuvem','nevoa'].includes(kind)?'Sustentada':kind==='deslocamento-de-vacuo'?'Até o início do próximo turno do usuário':'Instantânea';
 const meta={kind,element,stage,usedLevel:n,cost,dc,hardness:kind==='prisao-de-agua'?hardness/2:hardness+(kind==='barreira'&&stage>=9?2:kind==='nuvem'&&stage>=10?3:0),size:kind==='nevoa'?30+3*esp:kind==='nuvem'?2*size:kind==='barreira'?size/2:size,range:kind==='prisao-de-agua'||kind==='nevoa'?1:range,duration,action,damage:kind==='nuvem'?n*(stage>=10?2:1):0,maxTargets:kind==='prisao-de-agua'?1:kind==='deslocamento-de-vacuo'?(stage>=7?5:1):50,movementBonus:esp/2};
 const summary={restringente:'Restringe quem estiver na área; defesa inicial, libertação no próprio turno e retorno da restrição enquanto permanecer nela.',barreira:'Cria cobertura com dureza própria. Como defesa, paga antes de testar LM+2; a dureza da barreira não é dureza corporal.',repelir:'Defesa instantânea com LM+1 e dureza comum. Evolução7 permite repetir como ação livre com metade do custo até seu próximo turno.','prisao-de-agua':'Aprisiona a1m com CD−3 e exige contato/concentração. A vítima pode testar Força ou Vigor para conseguir atacar a prisão.',nuvem:'No início dos seus turnos, os participantes testam Vigor. Falhar causa dano fixo e Lento; sair ou passar no próximo teste encerra a lentidão.',nevoa:'Prejudica a visão conforme distância, com dureza imaginária que não absorve dano. Defina Sensor e localização antes do ataque.','deslocamento-de-vacuo':'Aumenta o deslocamento de alvos voluntários até o início do próximo turno do usuário.','purificar':'Remove uma substância do ambiente: compara níveis e testa Espírito no empate.'}[kind];
 const data={action,duration,range:meta.range+' m',target:['prisao-de-agua','deslocamento-de-vacuo'].includes(kind)?'Alvos marcados':'Ambiente / participantes marcados',area:['restringente','nuvem','nevoa','purificar'].includes(kind)?'Círculo · '+meta.size+' m de diâmetro':'',chakraCost:String(cost),damage:'Nenhum',test:'',seals:'Conforme a descrição'};
 return {valid:!problems.length,problems,noRoll:true,summary,cost,usedLevel:n,data,effect:e,power,environment:meta,traits:['arte:ninjutsu','custo:chakra',...(element==='ninpou'?[]:['elemento:'+element])],formulas:{chakraCost:kind==='deslocamento-de-vacuo'?'2 / evolução7:3':'Nível usado'},provenance:Object.fromEntries(Object.keys(data).map(k=>[k,'regra do efeito']))};
}
export function environmentPlan(meta,selection={},targets=[],actor=null,useUuid=''){
 if(meta.advanced)return advancedPlan(actor,meta,selection,targets,useUuid);
 if(!Array.isArray(targets)||targets.length>meta.maxTargets)throw Error('Confira a quantidade de alvos permitida.');
 const mode=selection.mode||'normal';if(!['normal','cage','defense'].includes(mode)||mode==='cage'&&(meta.kind!=='barreira'||meta.stage<6))throw Error('Modo de uso indisponível neste estágio.');
 if(meta.kind==='prisao-de-agua'&&targets.length!==1)throw Error('Prisão de Água exige um alvo a 1 m. Para usar por um clone, selecione-o como origem.');
 if(meta.kind==='deslocamento-de-vacuo'&&selection.willing!==true)throw Error('Selecione alvos voluntários no meio elemental apropriado.');
 if(meta.kind==='deslocamento-de-vacuo'&&!targets.length)throw Error('Marque os alvos voluntários.');
 if(meta.kind==='barreira'&&typeof selection.solid!=='boolean')throw Error('Informe o material da barreira.');
 if(meta.kind==='barreira'&&(meta.element==='doton'&&!selection.solid||['fuuton','suiton'].includes(meta.element)&&selection.solid))throw Error('Doton é sólido; vento e água são sustentados.');
 if(meta.kind==='repelir'&&mode!=='defense')throw Error('Repelir é uma reação a um ataque; escolha-o na declaração de defesa.');
 if(meta.kind==='purificar'&&!selection.rootUuid)throw Error('Escolha a substância de ambiente a purificar.');
 return {...meta,mode,solid:selection.solid===true,concentration:meta.duration==='Concentração',pending:false,keep:true,remainingHardness:meta.hardness,maxHardness:meta.hardness,members:{},hits:{},cost:meta.cost};
}
export function objectImpact({hardness,base=0,fixed=0,ignore=0}){
 if(!Number.isFinite(hardness)||hardness<0||![base,fixed,ignore].every(n=>Number.isFinite(n)&&n>=0))throw Error('Parâmetros inválidos para a dureza do objeto.');
 const effective=Math.max(0,hardness-ignore),broken=base>=effective&&base>0||fixed>=2*effective&&fixed>0;
 const after=broken?0:Math.max(0,hardness-(base>0||fixed>0?2:0));
 return {before:hardness,effective,broken:broken||after===0,after,base:Math.max(0,base-effective),fixed:Math.max(0,fixed-2*effective)};
}
export function purificationPlan(level,substance){
 if(!Number.isInteger(level)||level<1)throw Error('Nível inválido.');
 if(substance.poison){if(!Number.isInteger(substance.producerSkill))throw Error('Informe Venefício do produtor.');return {automatic:2*level>substance.producerSkill,test:false,allowed:2*level>substance.producerSkill};}
 if(!Number.isInteger(substance.usedLevel))throw Error('Substância mundana: o mestre precisa determinar se pode ser purificada.');
 return {automatic:level>substance.usedLevel,test:level===substance.usedLevel,allowed:level>=substance.usedLevel};
}
export const memberCondition=m=>m.kind==='restringente'?(m.stage>=6?'sns:condition:impedido':'sns:condition:lento'):m.kind==='prisao-de-agua'?'sns:condition:indefeso-ou-paralisado':m.kind==='nuvem'?'sns:condition:lento':null;
export function environmentSummary(root){const m=environmentData(root);if(!m)return '';const count=Object.values(m.members??{}).filter(r=>r.inside).length;return ['barreira','repelir','prisao-de-agua'].includes(m.kind)?'Dureza '+m.remainingHardness+'/'+m.maxHardness+' · '+m.duration+(m.kind==='prisao-de-agua'?' · contato obrigatório':''):m.kind==='nuvem'?'Vigor Dif'+(m.dc-2)+' · dano fixo'+m.damage+' · '+count+' participantes · dureza imaginária'+m.remainingHardness:m.kind==='nevoa'?'Névoa'+(m.stage>=5?' densa':'')+' · '+m.size+'m · dureza imaginária'+m.remainingHardness:m.kind==='deslocamento-de-vacuo'?'Deslocamento +'+m.movementBonus+'m · até seu próximo turno':count+' participantes · '+m.duration;}
export function mayEditEnvironment(before,after,isGM){return isGM||['environment','environmentMember','environmentLedger','environmentRepelirWindow','advancedState','advancedChild','poisonBatch','advancedScene'].every(k=>JSON.stringify(before?.flags?.[ns]?.[k])===JSON.stringify(after?.flags?.[ns]?.[k]))&&(!(environmentData(before)||environmentMember(before)||advancedState(before)||before?.flags?.[ns]?.poisonBatch||before?.flags?.[ns]?.advancedChild)||JSON.stringify(before.system)===JSON.stringify(after.system));}
export function environmentMovementEffects(actor){const rows=list(actor).filter(i=>i.system.appliedCondition?.active&&environmentMember(i)?.kind==='deslocamento-de-vacuo');const value=Math.max(0,...rows.map(i=>environmentMember(i).movementBonus??0));return value?[{kind:'flatModifier',target:'movement',value,sourceId:rows[0].id,sourceName:'Deslocamento de Vácuo'}]:[];}
export function environmentEscapeOptions(member){const m=environmentMember(member);if(!m)return [];if(m.kind==='restringente')return [{key:'attribute:for',label:'Força · livre'},{key:'skill:escapar',label:'Escapar · livre'}];if(m.kind==='prisao-de-agua'&&!m.escaped)return [{key:'attribute:for',label:'Força · padrão'},{key:'attribute:vig',label:'Vigor · padrão'}];return [];}

export function fogContexts(actor,targets){
 const fog=a=>list(a).filter(i=>i.system.appliedCondition?.active&&environmentMember(i)?.kind==='nevoa').map(i=>({rootUuid:environmentMember(i).rootUuid,stage:environmentMember(i).stage}));
 const own=fog(actor),rows={};for(const t of targets??[]){const a=t.actor??t;if(!a?.uuid)continue;const f=[...own,...fog(a)].sort((a,b)=>b.stage-a.stage)[0];if(f)rows[a.uuid.replaceAll('.','~')]=f;}return rows;
}
export function fogThreshold(stage,mode){if(!['near','far','sensor','unknown','area'].includes(mode))throw Error('Defina a distância e a localização.');return ['sensor','area','unknown'].includes(mode)?0:mode==='near'?(stage>=5?2:0):stage>=5?4:2;}
