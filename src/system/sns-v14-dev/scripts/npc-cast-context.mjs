import {ruleIdentity} from './jutsu-rule-text.mjs';
import {recordedSkillLevel} from './recorded-skill-level.mjs';
const option=(id,label,cost,extra={})=>({id,label,cost,...extra});
const parameter=(label,min=0,max=null)=>({label,min,max});
export function npcContextSchema(item){
 const id=ruleIdentity(item),section=item.flags?.['sns-v14-dev']?.canonicalTextSource?.section??'',p=item.actor?.items.get(item.system.details?.powerId),level=p?.system.level??1;
 if(id==='sns:jutsu:bunshin-no-jutsu')return {options:[option('images','Criar 1 ou 2 imagens ilusórias',1,{action:'Movimento'}),option('feint','Fintar com os clones',4,{action:'Padrão',checks:[{key:'skill:prestidigitacao',label:'Fintar · Prestidigitação'}],note:'Prestidigitação contra Prontidão do alvo. Os clones não causam dano e desaparecem após o próximo ataque.'})]};
 if(id==='sns:jutsu:kai')return {options:[option('cancel','Cancelar genjutsu','value',{parameter:parameter('Custo de chakra do genjutsu cancelado')})]};
 if(id==='sns:jutsu:chakra-no-souin')return {options:[option('activate','Ativar o selo','souin',{parameter:parameter('Chakra dividido entre Kage Bunshins (0 se não houver)'),action:'Completa',duration:'Permanente',note:'O selo deixa seu chakra em 1. Exige pelo menos 15, contando o chakra dividido em clones. Área imóvel: drena 2 chakra por turno, até o mínimo de 1, exceto da mesma assinatura de chakra. Confira o contato com a área e a drenagem na ficha.'})]};
 if(id==='sns:apt:rinkaichuu'){
  const skill=recordedSkillLevel(item.actor,'lidar_com_animais');
  return {options:[
   option('touch','Transferir 1 grupo com um toque',0,{action:'Padrão · toque',mode:'attack:cc',base:0,noDamage:true,note:'Transfere 1 grupo somente após o contato. Depois, use Contaminação confirmada para o teste de Vigor. Contato mantido por um turno permite transferir mais grupos.'}),
   option('infected','Contaminação confirmada · resistência',0,{action:'Contato confirmado',mode:'save',base:null,saveKeys:['attribute:vig'],dc:Number.isInteger(skill)?7+skill:null,parameter:parameter('Grupos que infectam o alvo',1,skill),note:'Dano fixo por turno: 1 por grupo. Na falha em Vigor: Atordoado por 1 turno e Fatigado até tratamento. Repita o teste ao receber mais insetos. A Vitalidade não cai abaixo de 0; nesse limite, a vítima fica Paralisada e não pode recuperar Vitalidade. Controle a transferência, o dano e o tratamento conforme a descrição.'}),
   option('spread','Espalhar os insetos pelo próprio corpo',0,{action:'Reação',mode:'none',base:null,note:'A pele fica exposta. Os insetos passam automaticamente a quem tocar o hospedeiro; confira o contato e depois use Contaminação confirmada.'})
  ]};
 }
 if(id==='sns:jutsu:moku-bunshin'){const trueClone=Array.from(item.actor.items).some(i=>i.system.ruleId?.startsWith('sns:apt:clone-verdadeiro')||i.system.contentId==='sns:apt:clone-verdadeiro');return {options:[option('clones','Criar clones de madeira','value',{parameter:parameter('Quantidade de clones',1,trueClone?1:2),note:'Confira clones já existentes e o limite simultâneo. Clone Verdadeiro permite um único clone de madeira.'})]};}
 if(id==='sns:jutsu:bakudan')return {options:[option('create','Criar tarjas explosivas','value',{parameter:parameter('Quantidade de tarjas',1)}),option('activate','Ativar o selo','half-level')]};
 if(id==='sns:jutsu:wana')return {options:[option('store','Preparar armadilha de ninjutsu','four-plus-value',{parameter:parameter('Custo de chakra do ninjutsu armazenado'),note:'Inclui os 4 pontos da armadilha. Confira a técnica armazenada e suas condições.'})]};
 if(id==='sns:jutsu:inyu-shometsu')return {options:[option('heal','Recuperar ferimentos','half-value',{parameter:parameter('Vitalidade a recuperar',1),note:'Até o dano recebido em um ataque. Não funciona contra crítico ou área; uma vez por dia. Confira a cura na ficha após resolver o ataque.'})]};
 if(id==='sns:jutsu:mimica-sharingan')return {options:[option('study','Analisar / copiar / memorizar',0,{action:'Completa para analisar; demais ações conforme a técnica',note:'Técnicas copiadas conservam seus parâmetros e custos próprios.'}),option('counter','Anular Técnica','value',{parameter:parameter('Custo da técnica anulada'),action:'Reação · Anular Técnica'})]};
 if(id==='sns:power:baika-ninpou'&&section.startsWith('NÍVEL 1:'))return {options:[option('expand','Expansão do abdome',1,{action:'Movimento',duration:'Contínua'}),option('prepare','Preparar Nikudan Sensha',1,{action:'Parcial',duration:'Instantânea'}),...(level>=4?[option('large','Corpo Grande',3,{action:'Movimento'})]:[]),...(level>=5?[option('huge','Corpo Enorme',4,{action:'Movimento'})]:[]),...(level>=6?[option('immense','Corpo Imenso',5,{action:'Movimento'})]:[])]};
 if(id==='sns:power:kagejutsu'&&/^NÍVEL [13]:/.test(section))return {options:[option('visible','Técnica vista pelo alvo','level',{adjustment:-3,note:'CD −3 quando o alvo percebe a técnica.'}),option('hidden','Sob camuflagem, cobertura ou ataque furtivo','level',{adjustment:0,note:'Técnica silenciosa: alvo tem −3 na Esquiva/Antecipar; demais defesas não se aplicam. Confira iluminação, sombras e condições.'})]};
 return null;
}
export function resolveNpcContext(item,input,usedLevel){
 const schema=npcContextSchema(item);if(!schema)return null;
 const selected=schema.options.find(o=>o.id===input.contextChoice)||(schema.options.length===1?schema.options[0]:null),value=input.contextValue;
 let valid=!!selected;
 if(selected?.parameter)valid=valid&&Number.isSafeInteger(value)&&value>=selected.parameter.min&&(selected.parameter.max===null||value<=selected.parameter.max);
 let cost=null,payment;
 if(valid){const c=selected.cost;cost=typeof c==='number'?c:c==='level'?usedLevel:c==='half-level'?Math.ceil(usedLevel/2):c==='value'?value:c==='half-value'?Math.ceil(value/2):c==='four-plus-value'?4+value:null;
  if(c==='souin'){const current=item.actor?.system.resources?.chakra?.value;valid=Number.isSafeInteger(current)&&current>=1&&current+value>=15;if(valid){cost=current-1;payment={kind:'souin',before:current,clones:value,after:1};}}
 }
 return {...schema,selected:selected?.id??'',parameter:selected?.parameter??null,valid,cost,payment,...(selected?Object.fromEntries(['action','duration','adjustment','checks','note','mode','base','dc','saveKeys','noDamage'].filter(k=>Object.hasOwn(selected,k)).map(k=>[k,selected[k]])):{}),value};
}
