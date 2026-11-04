import {WEAPON_DAMAGE_PROFILES} from '../data/damage-profiles.mjs';
import {planLegadoCopy} from './legado-copy.mjs';
import {LEGADO_TECHNIQUES,LEGADO_MODE_LABELS} from '../data/legado-rules.mjs';
import {isLegado,legadoId,legadoState,legadoItems,hasLegado,legadoEyeActive,legadoHasMangekyo,legadoEternal,legadoTransplant,legadoSelected,legadoTechniqueAllowed,legadoSusanoo,transitionLegadoSusanoo} from './legado-core.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {resolveJutsu,effectDefinition,powerDefinition} from './power-core.mjs';
import {jutsuAreas} from './area-core.mjs';
export const legadoKey=item=>legadoId(item).replace('sns:legado:jutsu:','');
export const legadoModes=item=>(LEGADO_TECHNIQUES[legadoKey(item)]??[]).map(id=>({id,label:LEGADO_MODE_LABELS[id]??id}));
const integer=(v,label,min=0,max=100)=>{if(!Number.isSafeInteger(v)||v<min||v>max)throw Error(label+' deve estar entre '+min+' e '+max+'.');return v;};
const attr=(a,k)=>integer(a.system.attributes?.[k],k.toUpperCase(),0,100);
const elements=['katon','fuuton','raiton','doton','suiton'];
export function legadoPlan(item,params={},library=[]){
 if(!isLegado(item)||item.type!=='jutsu'||!item.actor)throw Error('Escolha uma técnica do Legado na ficha.');
 const actor=item.actor,key=legadoKey(item),modes=legadoModes(item),mode=params.mode??modes[0]?.id;
 if(!modes.some(m=>m.id===mode))throw Error('Modalidade não disponível nesta técnica.');
 const req=requirementsFor(item,actor,[],false,{scope:'owned'});if(req.configured&&!req.valid)throw Error(req.problems.join(' '));
 const ending=['encerrar','tangivel','esquecer'].includes(mode),s=legadoState(actor),susanoo=legadoSusanoo(actor),per=attr(actor,'per'),esp=attr(actor,'esp'),int=attr(actor,'int'),half=n=>Math.ceil(n/2),quarter=n=>Math.ceil(n/4),cap=Math.floor(actor.system.nc/2);
 if(!ending&&!['carisma','misericordia'].includes(mode)&&!legadoEyeActive(actor))throw Error('Ative o Sharingan antes de usar esta técnica.');
 if(!ending&&!legadoTechniqueAllowed(actor,key))throw Error('Esta técnica não faz parte do par de olhos escolhido.');
 if(s.vision?.locked&&!ending)throw Error('O Sharingan está em recuperação após desativação forçada.');
 const p={version:1,name:item.name+' · '+(LEGADO_MODE_LABELS[mode]??mode),level:1,min:1,max:1,mode:'none',cost:0,visionCost:0,base:null,fixed:0,noDamage:true,gradeBonus:0,saveKeys:[],dc:null,shape:'',size:null,action:'Livre',range:'Pessoal',duration:'Instantânea',description:item.system.description,source:item.system.source,projectionValid:false,natures:[],nature:'',missing:[],legado:{key,mode,itemId:item.id,params:structuredClone(params)},useNote:''};
 const pay=(c,v=0)=>{p.cost=c;p.visionCost=v;},attack=(k,b)=>{p.mode='attack:'+k;p.base=b;p.noDamage=b===null;},save=(keys,dc)=>{p.mode='save';p.saveKeys=keys;p.dc=dc;},continuous=(name)=>{p.duration=name??'Contínua';p.legado.state=true;};
 const requireActive=k=>{if(!s.active?.[k])throw Error('Ative '+k+' primeiro.');};
 const effectPlan=(powerId,bonus=0,granted=false)=>{
  let power=legadoItems(actor).find(i=>i.type==='power'&&(legadoId(i)==='sns:power:'+powerId||i.system.power?.definitionId==='sns:power:'+powerId));
  const effectId=params.effectId,definition=effectDefinition(effectId),used=integer(params.level??power?.system.level,'Nível usado',1,cap);
  if(granted&&definition){power={id:'legado-tormenta',actor,flags:{'sns-v14-dev':{legadoTormenta:true}},system:{level:used,power:{definitionId:'sns:power:'+powerId,choices:[definition.min,...definition.evolutions.filter(n=>n<=used)].map(n=>({id:'tormenta'+n,slot:n,stage:n,effectId}))}}};}
  if(!power||used>power.system.level||!definition)throw Error('Escolha um efeito aprendido no poder e um nível permitido.');
  const projection=resolveJutsu(actor,power,{system:{jutsu:{effectId,selectionId:power.system.power.choices.find(c=>c.effectId===effectId&&c.slot<=used)?.id??'',usedLevel:used,variant:'normal',overrides:[]}}});
  if(!projection.valid)throw Error(projection.problems.join(' '));
  Object.assign(p,{level:used,cost:projection.cost,base:/^\d+$/.test(projection.data.damage)?Number(projection.data.damage)+bonus:null,noDamage:projection.noRoll||projection.data.damage==='Nenhum',mode:projection.resistanceCast?'save':projection.noRoll?'none':'attack:'+(projection.data.test||'cd'),action:projection.data.action,range:projection.data.range,duration:projection.data.duration,dc:projection.data.difficulty??null,size:projection.data.size??null,shape:({cone:'cone',circle:'circle',circulo:'circle',line:'ray',linha:'ray',onda:'ray'})[projection.data.area]??'',saveKeys:projection.resistanceCast?['attribute:int']:[]});if(projection.combatProfile?.projectiles){p.projectiles={...projection.combatProfile.projectiles,bonus:projection.combatProfile.projectiles.bonus+bonus};p.base=p.projectiles.count*p.projectiles.baseEach+p.projectiles.bonus;}p.areas=jutsuAreas({actor,uuid:item.uuid,name:item.name,system:{description:'',jutsu:{effectId,usedLevel:used},details:{powerId:power.id},source:item.system.source}},projection);p.legado.effectId=effectId;p.legado.effectProjection={combatProfile:projection.combatProfile??{},autoBindings:projection.autoBindings??[]};return definition;
 };
 if(ending){p.duration='Encerrada';return p;}
 switch(key){
 case 'mimica-sharingan':
  if(['copiar','copia-rapida','anular'].includes(mode)){const copy=planLegadoCopy(actor,library,{...params,mode});p.legado.mimicCost=copy.record.cost;if(mode==='anular')pay(integer(params.amount,'Chakra da técnica anulada',0,1000));}
  if(!params.copyId&&['memorizar','esquecer','aprender'].includes(mode))throw Error('Escolha a técnica copiada.');
  p.action=mode==='copia-rapida'?'Parcial':mode==='copiar'?'Padrão':'Livre';
  p.useNote='Cópias usam Pontos de Mímica; respeitam requisitos e não concedem pré-requisitos. Controle a técnica na seção Mímica.';break;
 case 'hipnose-sharingan':
  pay(5);p.range='9 m';p.action=['informacao','atitude','roubar'].includes(mode)?'Completa':mode==='falsa-morte'?'Movimento':mode==='reverter'?'Parcial':'Padrão';
  if(['falsa-morte','sobrepor','reverter'].includes(mode)){
   if(mode==='reverter')pay(integer(params.amount,'Chakra da ilusão',0,1000));
   p.useNote=mode==='falsa-morte'?'Uma vez por cena. O ataque é interrompido; mova até seu deslocamento.':mode==='sobrepor'?'Contato olho a olho. Encerre a ilusão sobreposta na ficha do alvo.':'Percepção para detectar a ilusão; não funciona contra Tsukuyomi.';
   if(mode==='reverter')p.checks=[{key:'attribute:per',label:'Detectar ilusão com Percepção',dc:null}];
  }else{save(['attribute:int'],8+int);continuous();p.legado.outcome=mode;
   if(mode==='exaurir')p.duration='Instantânea';
   if(mode==='paralisar'){if(int<10)throw Error('Paralisar exige Inteligência10.');pay(cap);p.level=cap;}
   if(mode==='bijuu'&&!legadoHasMangekyo(actor))throw Error('Controlar Bijuu exige Mangekyo.');
   if(mode==='roubar')pay(5+integer(params.amount,'Chakra da técnica roubada',0,1000));
  }break;
 case 'amaterasu':
  p.action=mode==='completa'?'Completa':mode==='concentrar'?'Concentração':'Padrão';p.range='9 m';
  pay(mode==='concentrar'?half(half(per)):half(per),mode==='concentrar'?2:3);attack('lm',2*integer(legadoItems(actor).find(i=>legadoId(i)==='sns:power:katon'||i.system.power?.definitionId==='sns:power:katon')?.system.level,'Katon',8,cap));
  p.allowedDefenses=['dodge','anticipate'];p.legado.incendiado=true;p.legado.attackPrecision='perception';if(mode==='concentrar')requireActive('amaterasu');else continuous('Instantânea; chamas permanentes');break;
 case 'kagutsuchi':
  if(['enton','imediato','estilo-inferno','armas','muralha','investida'].includes(mode)){
   if(['enton','imediato','estilo-inferno'].includes(mode)){
    const d=effectPlan('katon',mode==='estilo-inferno'?2:0);if(d.id==='sns:effect:dano-continuo'||d.exclusive||d.powers.length===1&&d.powers[0]==='katon')throw Error('Enton não permite Dano Contínuo ou efeitos exclusivos.');
    p.visionCost=mode==='enton'?1:2;if(mode==='estilo-inferno'){p.cost+=2;p.gradeMinimum=2;p.action='Movimento + '+p.action;}
   }else if(mode==='armas'){pay(half(esp),1);const power=legadoItems(actor).find(i=>legadoId(i)==='sns:power:katon'||i.system.power?.definitionId==='sns:power:katon'),level=integer(params.level??power?.system.level,'Nível usado',1,cap);if(!power||level>power.system.level)throw Error('Escolha um nível comprado de Katon.');let base=level+half(esp)+2;if(params.damageMode==='energy'){const weapon=params.weaponId&&actor.items.get(params.weaponId);if(weapon){const profile=WEAPON_DAMAGE_PROFILES[weapon.system.contentId];if(!profile||!weapon.system.equipped||weapon.system.quantity<1)throw Error('Escolha uma arma corporal equipada.');base=half(esp)+profile.weaponDamage;p.legado.weaponId=weapon.id;}else{const iron=legadoItems(actor).some(i=>legadoId(i)==='sns:apt:punho-de-ferro');base=half(esp)+(iron?(esp>=12?4:esp>=10?3:esp>=8?2:1):0);}}attack('cc',base);p.level=level;p.action='Ataque corporal';p.useNote=params.damageMode==='energy'?'Arma/punhos energizados com Enton. Incendiado segue o acerto; o equipamento atingido ao bloquear é conferido pelo mestre.':'Dano comum do Katon. Incendiado segue o acerto.';}
   else{pay(mode==='muralha'?3:2,1);p.action='Defender com Técnica';p.checks=[{key:'lm',label:'Defender com Enton',dc:null}];}
   p.legado.incendiado=true;
  }else if(mode==='proteger'){if(!susanoo)throw Error('Ative o Susano’o.');pay(quarter(per),1);p.action='Parcial';continuous();}
  else{p.action='Padrão';p.range='Alvo ou raio de 2 m';p.shape='circle';p.size=4;}
  break;
 case 'tsukuyomi':
  pay(half(int),mode==='torturador'?3:1);p.action='Padrão';p.range='9 m';
  if(mode==='torturador'){save(['attribute:int'],10+int);p.base=0;p.fixed=int;p.noDamage=false;p.legado.outcome='tsukuyomi';p.ignoreAllHardness=true;p.ignoreArmor=true;}
  else if(mode==='programar')continuous('Permanente até o gatilho');break;
 case 'kamui':
  if(mode==='ativar'){pay(half(per));continuous();}
  else{requireActive('kamui');pay(mode==='levar'?2:1,1);p.action=mode==='levar'?'Completa':'Movimento';p.useNote='Transporte para local conhecido. Mova o token para a dimensão ou posição escolhida.';}break;
 case 'kamui-curto-alcance':
  requireActive('kamui');
  if(mode==='objetos'||mode==='expelir'){
   const count=integer(params.count,'Compartimentos',1,mode==='objetos'?Math.floor(per/2):Math.floor(per/4));pay(count*(mode==='objetos'?1:2),1);p.action=mode==='objetos'?'Movimento':'Padrão';
   if(mode==='expelir'){attack('cd',params.projectiles===false?half(per):per);p.range='18 m';p.gradeBonus=count>=4&&params.singleTarget===true?0.5:0;if(p.gradeBonus)p.allowedDefenses=['dodge','anticipate'];p.maxTargets=count;}
  }else if(mode==='intangivel'){pay(5,2);p.action='Padrão';continuous('Até5minutos');p.legado.expiresSeconds=300;}
  else if(mode==='instantanea'){pay(4,1);p.action='Parcial';p.checks=[{key:'lm',label:'Intangibilidade · LM +'+(params.repeated?1:3),dc:null,adjustment:params.repeated?1:3}];}
  else if(mode==='liberdade'||mode==='escapar'){pay(3,mode==='escapar'?1:0);p.action='Livre durante movimento';continuous('Durante o movimento');}
  else if(mode==='abduzir'){pay(half(per),3);p.action='Completa';p.range='18 m';attack('lm',null);p.noDamage=true;p.useNote='Alvo impedido: defesa −3. Indefeso ou paralisado: acerto automático. A posição/dimensão é controlada no tabuleiro.';}
  break;
 case 'kamui-longo-alcance':
  requireActive('kamui');
  if(mode==='ofensiva'){pay(half(per),3);p.action='Padrão';continuous('Concentração');p.range='Visível, inicialmente além de10m';p.legado.state=true;}
  else if(mode==='manter'){requireActive('kamui-longo-alcance');p.action='Concentração';p.range='Campo de visão';attack('lm',esp);p.noDamage=true;p.useNote='Conte os acertos sobre o mesmo alvo: dois acertos ou um crítico permitem amputar; três abduzem o alvo inteiro. Resolva o dano de Espírito pelo melhor grau quando cumprir a sequência.';p.allowedDefenses=['dodge','anticipate'];p.legado.outcome='kamui-acerto';}
  else if(mode==='defensiva'||mode==='defensiva-parcial'){pay(5,2);p.action=mode==='defensiva'?'Movimento':'Parcial';if(mode.endsWith('parcial'))p.checks=[{key:'lm',label:'Defender com Técnica · LM +3',dc:null,adjustment:3}];}
  else{pay(mode==='teleportar'?5:half(per),mode==='teleportar'?1:3);p.action=mode==='teleportar'?'Movimento':'Padrão';attack('lm',null);p.noDamage=true;p.useNote='Use o dano do cartão do ataque original. Os novos alvos realizam nova defesa.';}break;
 case 'bishamonten':
  if(mode==='ativar'){pay(half(per));continuous();}else{requireActive('bishamonten');pay(mode==='espiral'?5:2,mode==='espiral'?3:1);p.action=mode==='espiral'?'Parcial':'Livre';continuous(mode==='espiral'?'Até o início do próximo turno':'Próximo '+(mode==='ataque'?'ataque':'teste de defesa'));p.legado.fortune=mode;}break;
 case 'kisshouten':
  if(mode==='destino'){pay(10,5);p.duration='Cena';p.useNote='Fora de combate. O mestre descreve a oportunidade favorável.';}
  if(mode==='misericordia'){pay(5,4);p.action='Movimento / reação';if(actor.system.resources.vitality.value>0)throw Error('Misericórdia Divina exige Vitalidade0oumenos.');}
  if(mode==='vida-facil'){pay(5,1);p.useNote='Fora de combate: sucesso automático em um teste de atributo ou perícia.';}
  if(['destino','vida-facil'].includes(mode)&&Array.from(globalThis.game?.combats??[]).some(c=>c.started&&Array.from(c.combatants).some(t=>t.actor?.uuid===actor.uuid)))throw Error('Esta modalidade não pode ser usada em combate.');break;
 case 'kotoamatsukami':pay(half(int),6);p.action='Padrão';p.range='9 m';save(['attribute:int'],10+int);continuous('Concentração');p.legado.outcome='controle-mental';break;
 case 'mahikami':
  if(mode==='sustentar'){requireActive('mahikami');pay(0,1);p.action='Sustentar';continuous('Sustentada');}
  else if(mode==='libertar'){p.checks=[{key:'attribute:vig',label:'Ignorar Relatividade',dc:7+int}];}
  else{pay(half(per),3);p.action='Padrão';p.range=(5+2*esp)+' m';p.shape='circle';p.size=int;save(['attribute:agi','skill:prontidao'],10+esp);continuous('Instantânea / Sustentada');p.legado.outcome='relatividade';}break;
 case 'hachiman':
  if(mode==='ativar'){pay(half(esp),4);p.action='Parcial';continuous();}else{requireActive('hachiman');pay(quarter(esp),s.active?.['hachiman-ketsuyoko']?2:1);p.action='Manutenção';continuous();}break;
 case 'hachiman-migi':requireActive('hachiman');pay(3);continuous('Até o fim do turno');p.legado.movement=half(esp);break;
 case 'hachiman-hidari':requireActive('hachiman');pay(quarter(esp));continuous('Próximo ataque corporal');p.legado.damageBonus=half(esp);break;
 case 'hachiman-ketsuyoko':requireActive('hachiman');p.action='Parcial';continuous();p.useNote='A manutenção total do Hachiman passa a2pontos de visão por turno.';break;
 case 'ame-no-tejikara':{
  const size=integer(params.sizeSurcharge??0,'Custo pelos tamanhos',0,18);p.range=(s.vision?.blindness>=2?9:s.vision?.blindness===1?18:30)+' m';
  if(mode==='portal'){pay(half(per),5);p.action='Padrão';continuous('Concentração · máximo½NCturnos');}
  else if(mode==='manter'){requireActive('ame-no-tejikara');pay(1);p.action='Concentração';}
  else{pay(2+size,mode==='teletransporte'?0:3);p.action=mode==='oportunista'?'Padrão':'Parcial / Movimento';}break;}
 case 'gyaku-sekai-no-jutsu':
  p.range=(s.vision?.blindness>=2?9:s.vision?.blindness===1?18:30)+' m';p.action=mode==='aliado'?'Movimento':'Parcial';pay(mode==='surpreender'?4+integer(params.sizeSurcharge??0,'Custo pelos tamanhos',0,18):5,mode==='surpreender'?2:3);
  if(mode==='surpreender'){attack('lm',null);p.noDamage=true;p.legado.outcome='surpreender';}else p.useNote='Refaça o ataque e mantenha o melhor resultado. Não funciona contra sucesso crítico na defesa.';break;
 case 'susanoo':
  if(['ativar','completa','evoluir','regredir','recuperar','recriar'].includes(mode)){const transition=transitionLegadoSusanoo(actor,mode,params.stage??1,params.turnKey??'');pay(transition.cost,transition.vision);p.action=['evoluir','regredir'].includes(mode)?mode==='evoluir'?'Parcial':'Livre':mode==='completa'?'Completa':'Padrão';continuous('Sustentada');p.legado.susanooTransition=mode;}
  else if(mode==='barreira'){if(susanoo)throw Error('Defesa Rápida exige Susano’o inativo.');pay(6);p.action='Defender com Técnica';p.checks=[{key:'lm',label:'Defesa Rápida · Dureza '+(esp+2),dc:null}];}
  else{
   if(!susanoo)throw Error('Ative o Susano’o primeiro.');
   if(mode==='tormenta'){if(legadoSelected(actor).includes('yata-no-kagami'))throw Error('Yata substitui as demais técnicas do Susano’o.');const effectId=params.effectId;if(!(s.tormenta??[]).includes(effectId))throw Error('Escolha uma das duas Técnicas das Tormentas configuradas.');const def=effectDefinition(effectId);if(!def||!def.powers.includes('ninpou')||def.action==='completa')throw Error('Efeito incompatível com Técnicas das Tormentas.');effectPlan('ninpou',2,true);p.dc=(p.dc??9+p.level+half(esp))+1;p.range=(10+2*esp)+' m';p.size=2*esp;if(p.areas){p.areas.range=10+2*esp;for(const c of p.areas.choices){if(c.shape==='circle')c.diameter=2*esp;else{c.length=2*esp;c.width=2*esp;}c.missing=[];}}p.legado.hardnessBonus=2;}
   else{if(mode!=='braco'&&susanoo.stage<3)throw Error('Armamento exige o3ºestágio.');const kind=mode==='arma-cd'?'cd':'cc',props=s.weapons?.[kind]??[],bonus=susanoo.stage>=5?7:susanoo.stage>=4?3:susanoo.stage>=2?1:0;attack(kind,half(esp+bonus)+(mode==='braco'?3:kind==='cc'?2:1)+props.filter(k=>k==='dano').length);p.range=kind==='cd'?(esp*(1+props.filter(k=>k==='alcance').length))+' m':susanoo.profile.reach+' m';p.action='Ataque';p.criticalAt=props.includes('letal')?14:15;}
  }break;
 case 'takemikazuchi-no-kami':
  if(susanoo?.stage!==5)throw Error('Ative o Susano’o Perfeito.');const level=integer(params.level??9,'Nível usado',9,cap);pay(half(esp));attack('cc',2*level+half(esp)-2);p.level=level;p.criticalAt=14;p.hardnessPolicy='lightning';p.action='Movimento + Padrão / Completa';p.range='Toque';p.ignoreHardness=1;if(mode==='honoikazuchi'){if(!hasLegado(actor,'kagutsuchi'))throw Error('Honoikazuchi exige Kagutsuchi.');p.cost+=2;p.visionCost=2;p.base+=2;p.gradeMinimum=2;p.legado.incendiado=true;}break;
 case 'indra-no-vajra':{
  if(susanoo?.stage!==5)throw Error('Ative o Susano’o Perfeito.');const element=params.element??'katon';if(!elements.includes(element))throw Error('Escolha um elemento básico.');let power=legadoItems(actor).find(i=>legadoId(i)==='sns:power:'+element||i.system.power?.definitionId==='sns:power:'+element),level=integer(params.level??power?.system.level,'Nível usado',10,cap);if(!power||power.system.level<level)throw Error('O elemento deve estar comprado no nível usado.');pay(5+level);attack('cd',level+esp+(powerDefinition('sns:power:'+element)?.damageBonus??0));p.gradeBonus=0.5;p.level=level;p.nature=element;p.shape='circle';p.size=Math.ceil(powerDefinition('sns:power:'+element).sizeFactor*esp);p.range=(powerDefinition('sns:power:'+element).rangeBase+powerDefinition('sns:power:'+element).rangeFactor*esp)+' m';p.action='Completa';p.allowedDefenses=['dodge','anticipate'];p.legado.endSusanoo=true;p.legado.outcome='indra';break;}
 case 'yata-no-kagami':
  if(!susanoo||susanoo.stage<3)throw Error('Yata exige Susano’o no3ºestágio ou superior.');if(mode==='elemento'){if(!elements.includes(params.element))throw Error('Escolha um dos cinco elementos.');pay(half(per));p.action='Movimento';continuous('Sustentada com Susano’o');}else{p.checks=[{key:'lm',label:'Bloquear com Yata · LM +2',dc:null,adjustment:2}];p.action='Bloqueio';}break;
 case 'yomotsu-okami':
  if(!susanoo&&mode!=='restabelecer')throw Error('Ative o Susano’o.');
  if(mode==='absorver')integer(params.amount,'Chakra absorvido',0,5);
  else if(mode==='constituicao'||mode==='escudo'){const need=mode==='constituicao'?2:10;if((susanoo?.yomi??0)<need)throw Error('Chakra de Yomi insuficiente.');}
  else if(!((susanoo?.yomi??s.susanoo?.yomi??0)>0))throw Error('A reserva de Yomi está vazia.');break;
 default:throw Error('Técnica do Legado não configurada.');
 }
 if(p.shape&&!p.areas){const shape=p.shape==='ray'?'line':p.shape;const size=p.size;p.areas={version:1,name:p.name,actorUuid:actor.uuid,itemUuid:item.uuid,usedLevel:p.level,range:Number.parseFloat(p.range)||null,choices:[{id:'0',shape,label:shape==='circle'?'Círculo':shape==='cone'?'Cone':'Linha',count:1,origin:'point',...(shape==='circle'?{diameter:size}:{length:size,width:size}),missing:Number.isFinite(size)&&size>0?[]:shape==='circle'?['diameter']:['length','width']}]};}
 if(legadoEternal(actor)||legadoTransplant(actor))p.visionCost=0;
 integer(p.cost,'Custo de chakra',0,10000);integer(p.visionCost,'Custo de visão',0,100);
 return p;
}
