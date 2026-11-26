import {ruleIdentity} from './jutsu-rule-text.mjs';
import {recordedSkillLevel} from './recorded-skill-level.mjs';
import {hasAptitude,findPower,recordedSkill,unarmedTechniqueDamage} from './canonical-jutsu-profiles.mjs';
import {effectiveAttribute} from './transformation-core.mjs';
const option=(id,label,cost,extra={})=>({id,label,cost,...extra});
const parameter=(label,min=0,max=null)=>({label,min,max});
export function npcContextSchema(item,usedLevel=null){
 const id=ruleIdentity(item),section=item.flags?.['sns-v14-dev']?.canonicalTextSource?.section??'',p=item.actor?.items.get(item.system.details?.powerId),level=p?.system.level??1;
 if(id==='sns:jutsu:konoha-reppu'){
  const agg=hasAptitude(item.actor,'sns:apt:derrubar-agressivo'),thr=hasAptitude(item.actor,'sns:apt:arremessar');
  if(agg||thr){
   const str=effectiveAttribute(item.actor,'for','unarmed'),wall=Number.isInteger(str)?Math.min(10,Math.max(0,str)):null;
   return {options:[
    ...(agg?[option('damage','Derrubar com dano',0,{...unarmedTechniqueDamage(item.actor),fixed:0,noDamage:false,note:'Derrubar Agressivo: causa dano e derruba (Vigor Dif 2 + CC para ficar de pé).'})]:[]),
    ...(thr&&wall!==null?[option('throw-wall','Arremessar contra obstáculo (dano fixo '+wall+')',0,{base:0,fixed:wall,damageNature:'lethal',noDamage:false,attackKind:'melee',weaponClass:'Desarmado',note:'Arremessar contra obstáculo: dano fixo igual à Força (máx. 10).'})]:[]),
    option('trip','Apenas derrubar (sem dano)',0,{base:0,fixed:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado'})
   ]};
  }
 }
 if(id==='sns:jutsu:konoha-shofu'){
  const agg=hasAptitude(item.actor,'sns:apt:desarme-agressivo')||hasAptitude(item.actor,'sns:apt:derrubar-agressivo');
  const str=effectiveAttribute(item.actor,'for','unarmed'),wall=Number.isInteger(str)?Math.min(10,Math.max(0,str)):0;
  return {options:[
   ...(agg?[option('damage','Arremessar / desarmar com dano',0,{...unarmedTechniqueDamage(item.actor),fixed:0,noDamage:false,note:'Agressivo: causa dano além da manobra.'})]:[]),
   option('throw-wall','Arremessar contra obstáculo (dano fixo '+wall+')',0,{base:0,fixed:wall,damageNature:'lethal',noDamage:false,attackKind:'melee',weaponClass:'Desarmado',note:'Arremessar contra obstáculo: dano fixo igual à Força (máx. 10).'}),
   option('maneuver','Arremessar para cima / Desarmar (sem dano direto)',0,{base:0,fixed:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado'})
  ]};
 }
 if(id==='sns:jutsu:oukashou'||id==='sns:jutsu:tsuutenkyaku'){
  const esp=effectiveAttribute(item.actor,'esp'),iryou=findPower(item.actor,'sns:power:iryou-ninjutsu')?.system?.level??2;
  const cost=Number.isInteger(esp)?Math.ceil(esp/2):null,baseNv2=Number.isInteger(esp)?esp+iryou:null,baseNv1=Number.isInteger(esp)?Math.ceil(esp/2)+iryou:null;
  const halfNv2=Number.isInteger(baseNv2)?Math.floor(baseNv2/2):null,halfNv1=Number.isInteger(baseNv1)?Math.floor(baseNv1/2):null;
  const crater=(Number.isInteger(esp)?1.5*esp:'1,5×ESP')+' m',dcTxt=Number.isInteger(esp)?9+esp:'9+ESP';
  const common={damageNature:'lethal',noDamage:false,allowedDefenses:['dodge','anticipate']};
  return {options:[
   option('direct-nv2','Golpe direto · Nv 2 (Movimento · ESP + Iryou)',cost,{...common,...(baseNv2!==null?{base:baseNv2}:{}),attackKind:'melee',weaponClass:'Desarmado'}),
   option('direct-nv1','Golpe direto · Nv 1 (Parcial · ⌈ESP/2⌉ + Iryou)',cost,{...common,...(baseNv1!==null?{base:baseNv1}:{}),attackKind:'melee',weaponClass:'Desarmado'}),
   option('ground-nv2','Golpear o chão · Nv 2 (área · metade do DB)',cost,{...common,...(halfNv2!==null?{base:halfNv2}:{}),attackKind:'area',shape:'circle',...(Number.isInteger(esp)?{size:1.5*esp}:{}),note:'Cratera de '+crater+': metade do dano comum e Acrobacia Dif '+dcTxt+' para não cair.'}),
   option('ground-nv1','Golpear o chão · Nv 1 (área · metade do DB)',cost,{...common,...(halfNv1!==null?{base:halfNv1}:{}),attackKind:'area',shape:'circle',...(Number.isInteger(esp)?{size:1.5*esp}:{}),note:'Cratera de '+crater+': metade do dano comum e Acrobacia Dif '+dcTxt+' para não cair.'})
  ]};
 }
 if(id==='sns:jutsu:hb-f05-sennen-goroshi'){
  const str=effectiveAttribute(item.actor,'for','unarmed'),wall=Number.isInteger(str)?Math.min(10,Math.max(0,str)):0;
  return {options:[
   option('damage','Arremessar + Causar dano',0,{...unarmedTechniqueDamage(item.actor,0),fixed:0,noDamage:false}),
   option('stun-wall','Arremessar contra obstáculo (dano fixo '+wall+') + Atordoar',0,{base:0,fixed:wall,damageNature:'lethal',noDamage:false,attackKind:'melee',weaponClass:'Desarmado',note:'Arremessa contra obstáculo (dano fixo = FOR, máx. 10) e deixa o alvo Atordoado.'}),
   option('stun','Arremessar + Atordoar (sem dano)',0,{base:0,fixed:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado'})
  ]};
 }
 if(id==='sns:jutsu:hirudora'||id==='sns:jutsu:yagai')return {options:[option('t4','Ataque Pesado · 4 turnos futuros (Grau mín. 4)',0,{gradeMinimum:4}),option('t3','Ataque Pesado · 3 turnos futuros (Grau mín. 3)',0,{gradeMinimum:3}),option('t2','Ataque Pesado · 2 turnos futuros (Grau mín. 2)',0,{gradeMinimum:2}),option('t1','Ataque Pesado · 1 turno futuro (Grau mín. 1)',0,{gradeMinimum:1})]};
 if(id==='sns:jutsu:engolimento'){
  const str=effectiveAttribute(item.actor,'for','unarmed'),ven=recordedSkill(item.actor,'veneficio');
  return {options:[
   option('grab','Agarrar e engolir · ataque CC furtivo',0,{mode:'attack:cc',base:0,fixed:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',note:'Ao emergir do solo: manobra Agarrar furtiva; confina alvos menores e os deixa Atordoados.'}),
   option('inside','Vítima engolida · escapar ou dano fixo (Venefício)',0,{mode:'save',saveKeys:['attribute:for','skill:escapar'],...(Number.isInteger(str)?{dc:9+str}:{}),base:0,fixed:ven??0,noDamage:false,note:'Na falha para se soltar: dano fixo igual a Venefício ('+(ven??0)+'). Veneno dentro da Salamandra tem fracasso automático em Vigor.'})
  ]};
 }
 if(id==='sns:jutsu:hb-f05-ino-shika-chou-yooyoo')return {options:[option('cc','Ataque CC · Akimichi',0,{mode:'attack:cc'}),option('cd','Ataque CD · Nara',0,{mode:'attack:cd'})]};
 if(id==='sns:jutsu:tsukuyomi'){
  const intAttr=effectiveAttribute(item.actor,'int');
  return {options:[option('torture','Modo Torturador · 2 Visão',10,{mode:'save',base:0,noDamage:true,saveKeys:['attribute:int'],...(Number.isInteger(intAttr)?{dc:11+intAttr}:{}),visionCost:2,note:'Inteligência Dif '+(Number.isInteger(intAttr)?11+intAttr:'11+INT')+'; Exausto + −4 INT.'}),option('messenger','Modo Mensageiro · 1 Visão',10,{mode:'none',base:0,noDamage:true,saveKeys:[],dc:null,visionCost:1,note:'Comunicação ilusória sem penalidades ao alvo.'})]};
 }
 if(id==='sns:jutsu:hb-f06-sanzengarasu-no-jutsu')return {options:[option('cloud','Nuvem ofuscante (sem ataque)',5,{mode:'none',base:null,noDamage:true,shape:'circle',size:6,note:'Criaturas na área ficam Ofuscadas.'}),option('attack','Forma ofensiva · rasantes',5,{mode:'attack:cd',base:'value',noDamage:false,attackKind:'area',parameter:parameter('Quantidade de corvos (1 de dano de corte por corvo)',1),note:'1 de dano de corte por corvo invocado (CD); invocação desfeita após o ataque.'})]};
 if(id==='sns:jutsu:bunshin-no-jutsu')return {options:[option('images','Criar 1 ou 2 imagens ilusórias',1,{action:'Movimento'}),option('feint','Fintar com os clones',4,{action:'Padrão',checks:[{key:'skill:prestidigitacao',label:'Fintar · Prestidigitação'}],note:'Prestidigitação contra Prontidão do alvo. Os clones não causam dano e desaparecem após o próximo ataque.'})]};
 if(id==='sns:jutsu:kai')return {options:[option('cancel','Cancelar genjutsu','value',{parameter:parameter('Custo de chakra do genjutsu cancelado',0),checks:[{key:'attribute:esp',label:'Kai · Espírito'},{key:'attribute:int',label:'Kai · Inteligência'}],note:'Gaste chakra igual ao custo do genjutsu cancelado e role Espírito ou Inteligência contra a Dificuldade do genjutsu.'})]};
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
 if(id==='sns:jutsu:bakudan'){const fuuinLvl=Math.max(4,usedLevel??p?.system?.level??4);return {options:[option('create','Criar tarjas explosivas','value',{parameter:parameter('Quantidade de tarjas',1),mode:'none',base:null,noDamage:true}),option('activate','Ativar o selo','half-level',{mode:'save',saveKeys:['attribute:agi','skill:prontidao'],dc:9+2*fuuinLvl,base:2*fuuinLvl,noDamage:false,shape:'circle',size:2*fuuinLvl,note:'Explosão de Bakudan ('+(2*fuuinLvl)+' m, DB '+(2*fuuinLvl)+', Dif '+(9+2*fuuinLvl)+').'})]};}
 if(id==='sns:jutsu:wana')return {options:[option('store','Preparar armadilha de ninjutsu','four-plus-value',{parameter:parameter('Custo de chakra do ninjutsu armazenado'),note:'Inclui os 4 pontos da armadilha. Confira a técnica armazenada e suas condições.'})]};
 if(id==='sns:jutsu:inyu-shometsu')return {options:[option('heal','Recuperar ferimentos','half-value',{parameter:parameter('Vitalidade a recuperar',1),note:'Até o dano recebido em um ataque. Não funciona contra crítico ou área; uma vez por dia. Confira a cura na ficha após resolver o ataque.'})]};
 if(id==='sns:jutsu:mimica-sharingan')return {options:[option('study','Analisar / copiar / memorizar',0,{action:'Completa para analisar; demais ações conforme a técnica',note:'Técnicas copiadas conservam seus parâmetros e custos próprios.'}),option('counter','Anular Técnica','value',{parameter:parameter('Custo da técnica anulada'),action:'Reação · Anular Técnica'})]};
 if(id==='sns:power:baika-ninpou'&&section.startsWith('NÍVEL 1:'))return {options:[option('expand','Expansão do abdome',1,{action:'Movimento',duration:'Contínua'}),option('prepare','Preparar Nikudan Sensha',1,{action:'Parcial',duration:'Instantânea'}),...(level>=4?[option('large','Corpo Grande',3,{action:'Movimento'})]:[]),...(level>=5?[option('huge','Corpo Enorme',4,{action:'Movimento'})]:[]),...(level>=6?[option('immense','Corpo Imenso',5,{action:'Movimento'})]:[])]};
 if(id==='sns:power:kagejutsu'&&/^NÍVEL [13]:/.test(section))return {options:[option('visible','Técnica vista pelo alvo','level',{adjustment:-3,note:'CD −3 quando o alvo percebe a técnica.'}),option('hidden','Sob camuflagem, cobertura ou ataque furtivo','level',{adjustment:0,note:'Técnica silenciosa: alvo tem −3 na Esquiva/Antecipar; demais defesas não se aplicam. Confira iluminação, sombras e condições.'})]};
 return null;
}
export function resolveNpcContext(item,input,usedLevel){
 const schema=npcContextSchema(item,usedLevel);if(!schema)return null;
 const selected=schema.options.find(o=>o.id===input.contextChoice)||(schema.options.length===1?schema.options[0]:null),value=input.contextValue;
 let valid=!!selected;
 if(selected?.parameter)valid=valid&&Number.isSafeInteger(value)&&value>=selected.parameter.min&&(selected.parameter.max===null||value<=selected.parameter.max);
 let cost=null,payment;
 if(valid){const c=selected.cost;cost=typeof c==='number'?c:c==='level'?usedLevel:c==='half-level'?Math.ceil(usedLevel/2):c==='value'?value:c==='half-value'?Math.ceil(value/2):c==='four-plus-value'?4+value:null;
  if(c==='souin'){const current=item.actor?.system.resources?.chakra?.value;valid=Number.isSafeInteger(current)&&current>=1&&current+value>=15;if(valid){cost=current-1;payment={kind:'souin',before:current,clones:value,after:1};}}
 }
 const resolved=selected?Object.fromEntries(['action','duration','adjustment','checks','note','mode','base','fixed','dc','saveKeys','noDamage','shape','size','attackKind','allowedDefenses','weaponClass','damageNature','visionCost','gradeMinimum'].filter(k=>Object.hasOwn(selected,k)).map(k=>[k,k==='base'&&selected[k]==='value'?(valid?value:null):selected[k]])):{};
 return {...schema,selected:selected?.id??'',parameter:selected?.parameter??null,valid,cost,payment,...resolved,value};
}
