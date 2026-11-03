// Explicit rule selection and owned source IDs; names and descriptive tags grant nothing.
import {isFixedGrantSource,resolveFixedJutsu,grantRuleFor,isAptitudePower} from './aptitude-jutsus.mjs';
export const NATURAL_KATON='Elemento Natural: Katon';
const contents=actor=>Array.from(actor.items??[]);
const find=(actor,id)=>contents(actor).find(i=>i.id===id);
export const isGrantSource=item=>item?.type==='aptitude'&&(grantRuleFor(item)===NATURAL_KATON||isFixedGrantSource(item));
export function resolveGrantedJutsu(actor,item){
 const j=item.system.jutsu??{},source=find(actor,j.grantSourceId),problems=[];
 if(!isGrantSource(source))return {valid:false,problems:['A aptidão de origem está ausente ou sua regra de concessão mudou.'],manual:false};
 if(isFixedGrantSource(source))return resolveFixedJutsu(actor,item,source);
 const esp=actor.system.attributes?.esp,n=j.usedLevel,powerId=item.system.details?.powerId,power=powerId?find(actor,powerId):null;
 if(!Number.isInteger(esp)||esp<1)problems.push('Elemento Natural: Katon exige Espírito 1.');
 if(!Number.isInteger(actor.system.nc)||actor.system.nc<4)problems.push('Informe um NC válido.');
 if(powerId&&power?.system.power?.definitionId!=='sns:power:katon')problems.push('O poder vinculado precisa ser um Katon possuído e configurado.');
 const bought=power?.system.power?.definitionId==='sns:power:katon'&&power.system.level>=4;
 if(!powerId&&contents(actor).some(p=>p.system.power?.definitionId==='sns:power:katon'&&p.system.level>=4))problems.push('Vincule o Katon comprado para usar as regras comuns do poder.');
 if(bought&&power.system.level>Math.floor(actor.system.nc/2))problems.push('Katon comprado excede metade do NC.');
 if(!Number.isInteger(n)||n<4||n>(bought?power.system.level:4))problems.push(bought?'Nível usado deve estar entre 4 e o nível comprado de Katon.':'A concessão independente usa Sopro Destrutivo 4.');
 if(j.effectId!=='sns:effect:sopro-destrutivo')problems.push('Esta concessão fornece somente Sopro Destrutivo.');
 if(j.variant&&j.variant!=='normal'||j.overrides?.length)problems.push('Forma de uso ou personalização incompatível com esta concessão.');
 const half=Math.ceil((esp??0)/2),cost=bought?n:half,damage=bought?n+half+2:(esp??0)+2;
 const data={action:'Padrão',duration:'Instantânea',range:(10+2*(esp??0))+' m',target:'Criaturas na área',area:'cone',chakraCost:String(cost),damage:String(damage),difficulty:9+n+half,size:2*(esp??0),defenses:'Esquiva / Antecipar; sem Bloqueio',seals:'Duas mãos livres',test:'cd'};
 const stage=bought?(power.system.level>=10?10:power.system.level>=7?7:4):4;
 const notes=stage>=7?'Sopro7: após Esquiva/Antecipar bem-sucedido, Acrobacia evita dano remanescente grau1; acelerado tem sucesso automático. '+(stage>=10?'Sopro10: grau2 somente se o ataque alcançou grau2 ou mais. ':'')+'Resolva as defesas e o dano remanescente conforme a descrição.':'Sopro em cone. Resolva as defesas e aplique o dano.';
 return {valid:!problems.length,problems,data,cost,usedLevel:n,grantSourceId:source.id,grantName:source.name,
  effect:{id:'sns:effect:sopro-destrutivo',name:'Sopro Destrutivo',source:{id:'F01',pages:'101; 180–181'},notes},
  provenance:Object.fromEntries(Object.keys(data).map(k=>[k,['range','damage','chakraCost','difficulty','size'].includes(k)?'calculado':'herdado'])),
  formulas:{range:'10 + 2 × ESP',size:'2 × ESP',damage:bought?'Nível usado + ⌈ESP/2⌉ + 2':'ESP + 2 · Elemento Natural',chakraCost:bought?'Nível usado':'⌈ESP/2⌉ · Elemento Natural',difficulty:'9 + nível usado + ⌈ESP/2⌉'},
  traits:['arte:ninjutsu','elemento:katon','finalidade:dano','aplicacao:ataque-area','area:cone','custo:chakra','execucao:selos-de-mao']};
}
export function grantedSourceGroups(items){
 const grants=items.filter(i=>i.type==='jutsu'&&i.system?.jutsu?.grantSourceId);
 const sources=items.filter(i=>isGrantSource(i)&&!isAptitudePower(i)),known=new Set(items.filter(isGrantSource).map(s=>s.id));
 return [...sources.map(s=>({id:s.id,name:s.name,available:true,techniques:grants.filter(j=>j.system.jutsu.grantSourceId===s.id)})),
  ...grants.filter(j=>!known.has(j.system.jutsu.grantSourceId)).map(j=>({id:j.system.jutsu.grantSourceId,name:'Origem indisponível · revisar',available:false,techniques:[j]}))];
}
