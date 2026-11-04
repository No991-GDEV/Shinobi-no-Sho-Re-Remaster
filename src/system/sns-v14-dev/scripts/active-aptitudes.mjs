import {legadoEyeSource,legadoState} from './legado-core.mjs';
import {actorCombat,maintenanceLabel} from './effect-duration.mjs';
import {transplantSources,transplantProfile} from './characteristic-effects.mjs';
import {itemRuleId,requirementsFor} from './item-requirements.mjs';
import {accessSources} from './restricted-access.mjs';
export const ACTIVATION_RULES={'legado-sharingan':{label:'Sharingan · Legado',cost:1,action:'Parcial',duration:'Uma cena',source:'Legado do Ódio · PDF4–6',hint:'Visão de chakra, medir poder e esquiva perceptiva. Nidan e Sandan ampliam os benefícios conforme suas aptidões.'},byakugan:{label:'Byakugan',cost:1,action:'Parcial',duration:'Uma cena',source:'Básico4.1b · p.157–158',hint:'Visão em 360°, raio-X e visão de chakra; ignora camuflagem do ambiente. Não sofre ataque surpresa nem flanqueamento. Consulte a aptidão para alcance, concentração e simulação de dado por cena.'},sharingan:{label:'Sharingan · Básico',cost:1,action:'Parcial',duration:'Uma cena',source:'Básico4.1b · p.181–183',hint:'Visão de chakra, medir poder e esquiva perceptiva. Esta usa LM como base, admite bônus de Esquiva e exclui bônus de LM, como Intuição. Nidan/Sandan e demais manobras exigem suas aptidões e condições. Ajuste os bônus contextuais na rolagem.'},manual:{label:'Exceção da referência · mestre',action:'Ver descrição',duration:'Ver descrição',source:'Registro manual com justificativa',hint:'Ativação com custo personalizado. Aplique manutenção, benefícios e duração conforme a descrição.'},transplanted:{label:'Transplante de doujutsu · mesa',cost:0,action:'Revelar o olho',duration:'Enquanto descoberto',source:'Enciclopédia2.4.0 p.13–14 + decisão D108',hint:'O olho é permanente: cobri-lo suspende os benefícios e a manutenção. O máximo de chakra continua reduzido em10%, mesmo coberto. Este transplante não perde pontos de visão nem causa cegueira. Técnicas gastam seus custos próprios. No combate, a manutenção é cobrada no início do turno. Fora de combate, use Pagar 1 turno. Ajuste os bônus contextuais na rolagem.'}};
export const grantedActivations=actor=>[...(legadoEyeSource(actor)&&legadoEyeSource(actor).system.contentId==='sns:legado:apt:sharingan'?[{id:'grant-legado-eye-'+legadoEyeSource(actor).id,sourceId:legadoEyeSource(actor).id,rule:'legado-sharingan',cost:1,note:'',active:false,history:[]}]:[]),...Array.from(actor.items??[]).filter(i=>i.type==='aptitude'&&itemRuleId(i)==='sns:apt:byakugan').map(i=>({id:'grant-byakugan-'+i.id,sourceId:i.id,rule:'byakugan',cost:1,note:'',active:false,history:[]})),...transplantSources(actor).map(i=>({id:'grant-transplant-'+i.id,sourceId:i.id,rule:'transplanted',cost:0,note:'',active:false,history:[]})),...Array.from(actor.items??[]).filter(i=>i.type==='aptitude'&&itemRuleId(i)==='sns:apt:sharingan'&&(accessSources(actor,'uchiha').length||!transplantSources(actor).length)).map(i=>({id:'grant-sharingan-'+i.id,sourceId:i.id,rule:'sharingan',cost:1,note:'',active:false,history:[]}))];
export const activationRows=actor=>[...Array.from(actor.system.activeAptitudes??[]),...grantedActivations(actor).filter(g=>!(actor.system.activeAptitudes??[]).some(r=>r.sourceId===g.sourceId&&r.rule===g.rule))];
export function resolveActiveAptitude(actor,row){
 const rule=ACTIVATION_RULES[row.rule],source=Array.from(actor.items??[]).find(i=>i.id===row.sourceId),problems=[];
 if(!rule)return {...row,valid:false,problems:['Regra de ativação desconhecida.']};
 const transplanted=row.rule==='transplanted';
 if(!source||(!transplanted&&source.type!=='aptitude'))problems.push('A aptidão de origem está ausente.');
 const profile=transplanted?transplantProfile(actor,source):null;if(profile)problems.push(...profile.problems);
 if(row.rule==='byakugan'&&(itemRuleId(source)!=='sns:apt:byakugan'||!requirementsFor(source,actor).valid))problems.push('Byakugan exige sua aptidão e os requisitos atendidos.');
 if(row.rule==='legado-sharingan'&&(!Number.isInteger(actor.system.attributes?.per)||actor.system.attributes.per<3||source?.system.contentId!=='sns:legado:apt:sharingan'||!requirementsFor(source,actor,[],false,{scope:'owned'}).valid||legadoState(actor).vision?.locked))problems.push('Confira os requisitos e a recuperação dos olhos do Legado.');
 if(row.rule==='sharingan'&&(!Number.isInteger(actor.system.attributes?.per)||actor.system.attributes.per<3))problems.push('Sharingan exige Percepção3.');
 if(row.rule==='sharingan'&&(itemRuleId(source)!=='sns:apt:sharingan'||!requirementsFor(source,actor).valid))problems.push('A origem precisa ser a aptidão Sharingan com os requisitos atendidos.');
 if(row.rule==='sharingan'&&transplantSources(actor).length&&!accessSources(actor,'uchiha').length)problems.push('Use a ativação da característica de transplante.');
 const cost=row.rule==='manual'?row.cost:rule.cost;
 if(!Number.isInteger(cost)||cost<0)problems.push('Falta definir o custo de ativação.');
 if(row.rule==='manual'&&!row.note?.trim())problems.push('Identifique a exceção e suas limitações.');
 return {...row,...rule,eyeControl:['sharingan','byakugan','legado-sharingan'].includes(row.rule)||transplanted,canToggle:!!row.active||!problems.length,eyeLabel:transplanted?(row.active?'Cobrir olho':'Revelar olho'):(row.active?'Fechar olho · desativar '+rule.label:'Abrir olho · ativar '+rule.label),transplanted,upkeep:profile?.upkeep,stage:profile?.stage,sourceImg:source?.img&&source.img!=='icons/svg/sun.svg'?source.img:'icons/svg/eye.svg',sourceName:source?.name??'Origem indisponível',hasSource:!!source,cost,costLabel:Number.isInteger(cost)?String(cost):'a definir',valid:!problems.length,problems,status:transplanted?(row.active?'Descoberto':'Coberto'):(row.active?'Ativa':'Inativa'),needsCollapse:transplanted&&row.active&&actor.system.resources?.chakra?.value===0};
}
export const activeAptitudeView=actor=>activationRows(actor).map(r=>({...resolveActiveAptitude(actor,r),automaticUpkeep:!!actorCombat(actor),maintenance:r.rule==='transplanted'?maintenanceLabel(actor,r):''}));
export function activationChange(actor,row,active,{user='',at=''}={}){
 if(typeof active!=='boolean'||active===row.active)throw Error('A ativação mudou. Tente novamente.');
 const r=resolveActiveAptitude(actor,row),chakra=actor.system.resources?.chakra?.value;
 if(active&&!r.valid)throw Error(r.problems.join(' '));
 if(active&&(!Number.isInteger(chakra)||chakra<r.cost))throw Error('Chakra atual desconhecido ou insuficiente. Nenhuma ativação realizada.');
 const cost=active?r.cost:0;
 return {row:{...row,active,history:[...(row.history??[]),{event:active?'activate':'deactivate',from:row.active,to:active,chakraCost:cost,user,at}]},chakra:active?chakra-cost:chakra};
}
export function upkeepChange(actor,row,{user='',at=''}={}){
 const r=resolveActiveAptitude(actor,row),chakra=actor.system.resources?.chakra?.value;
 if(!row.active||!r.transplanted||!r.valid)throw Error('Revele um transplante válido antes de registrar sua manutenção.');
 if(!Number.isInteger(chakra)||chakra<r.upkeep)throw Error('Chakra desconhecido ou insuficiente para um turno completo. Cubra o olho e confira o uso com o mestre.');
 return {row:{...row,history:[...(row.history??[]),{event:'upkeep',from:true,to:true,chakraCost:r.upkeep,user,at}]},chakra:chakra-r.upkeep};
}
