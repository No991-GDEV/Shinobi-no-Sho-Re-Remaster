import {legadoSaveDifficulty} from './legado-effects.mjs';
import {NPC_REPERTOIRES} from '../data/npc-repertoires.mjs';
import {EFFECT_DEFINITIONS} from '../data/power-definitions.mjs';
import {isGeneratedMinion} from './npc-minion-policy.mjs';
const ns='sns-v14-dev',identity=i=>i?.system?.contentId;
export const repertoireFor=power=>NPC_REPERTOIRES[identity(power)]??null;
export function repertoireEffects(power,items=[]){
 const r=repertoireFor(power);if(!r||!['effects','hearts'].includes(r.mode))return null;
 let rows=r.base?EFFECT_DEFINITIONS.filter(e=>e.powers.includes(r.base)):[];
 if(r.mode==='hearts'){const heart=jionguHearts(power)[0];rows=EFFECT_DEFINITIONS.filter(e=>e.powers.includes(heart));}
 rows=[...rows,...r.effects.filter(e=>!rows.some(x=>x.id===e.id))];
 if(r.inherit&&items.some(i=>(i.system.ruleId||identity(i))==='sns:apt:shikigami-no-mai'))rows=[...rows,...EFFECT_DEFINITIONS.filter(e=>['algemar','orbe','barreira','prisao-de-agua'].includes(e.id.split(':').at(-1))&&!rows.some(x=>x.id===e.id))];
 return rows;
}
export function repertoireChoices(power,slot,items=[]){
 if(repertoireFor(power)?.mode==='hearts')return [...new Set(jionguHearts(power))].flatMap(nature=>EFFECT_DEFINITIONS.filter(e=>e.powers.includes(nature)).map(e=>{const stages=[e.min,...(e.evolutions??[])],prior=power.system.power.choices.filter(c=>c.slot<slot&&c.effectId===e.id&&c.note==='nature:'+nature).at(-1)?.stage,stage=prior===undefined?e.min:stages[stages.indexOf(prior)+1];return {...e,nature,stage,allowed:stage!==undefined&&stage<=slot&&(slot===1||e.id!=='sns:effect:canhao')};}));
 const rows=repertoireEffects(power,items);if(!rows)return null;
 return rows.map(e=>{const stages=[e.min,...(e.evolutions??[])],prior=power.system.power.choices.filter(c=>c.slot<slot&&c.effectId===e.id).at(-1)?.stage,stage=prior===undefined?e.min:stages[stages.indexOf(prior)+1];return {...e,stage,allowed:stage!==undefined&&stage<=slot};});
}
export function repertoireEffectPrerequisites(id,actor,power){
 const has=id=>Array.from(actor.items).some(i=>(i.system.ruleId||identity(i))===id),level=(id,n)=>Array.from(actor.items).some(i=>identity(i)===id&&i.system.level>=n),effect=(id,n)=>power.system.power.choices.some(c=>c.effectId==='sns:effect:'+id&&c.stage>=n),skill=(k,n)=>(actor.system.skillLevels?.[k]??0)>=n;
 const checks={'espelhos-demoniacos':()=>has('sns:apt:ataque-em-movimento')&&effect('imergir',1),'areia-selada':()=>actor.system.attributes.int>=6&&effect('areia-especial',2),'membros-de-ferro':()=>effect('manto-de-areia-de-ferro',3),'areia-de-ferro-venenosa':()=>skill('veneficio',12),'prisma':()=>effect('barreira',6)&&has('sns:apt:barreira-regenerativa'),'labirinto':()=>effect('barreira',9),'hb-f05-emissario-divino':()=>level('sns:power:fuuinjutsu',8)&&has('sns:apt:anjo-de-papel')&&has('sns:apt:shikigami-no-mai')};
 return checks[id.replace('sns:effect:','')]?.()??true;
}
// Named techniques embedded in level-grouped chapters (not one effect per heading).
export function groupedPowerSections(entry){
 const html=entry.document.system.description,headings=[...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)],rows=[];
 let minimum=null;
 for(let i=0;i<headings.length;i++){
  const h=headings[i],title=h[1].replace(/<[^>]+>/g,'').trim(),group=title.match(/^EFEITOS? DE N[ÍI]VEL\s*(\d+)/i);
  if(group){minimum=Number(group[1]);continue;}
  if(minimum!==null&&!/^Evolu/i.test(title))rows.push({name:title,title,minimum,html:html.slice(h.index,headings[i+1]?.index??html.length)});
 }
 return rows;
}
export function prerequisitePowerSections(entry){
 const html=entry.document.system.description,hs=[...html.matchAll(/<h[23][^>]*>([^<]+)<\/h[23]>/gi)];
 return hs.flatMap((h,i)=>{const body=html.slice(h.index,hs[i+1]?.index??html.length),minimum=body.match(/Pr[éeÉ]?-requisitos?:[^<]{0,80}?n[íi]vel\s*(\d+)/i);return minimum?[{name:h[1].trim(),title:h[1].trim(),minimum:Number(minimum[1]),html:body}]:[];});
}
export function sourceRepertoireProfile(power,actor){
 const row=repertoireFor(power);if(!row?.profile)return null;
 const profile={...row.profile};
 if(row.inherit){const has=id=>Array.from(actor.items).some(i=>(i.system.ruleId||identity(i))===id);if(has('sns:apt:shikigami-no-mai')){profile.damageBonus++;profile.difficultyBonus++;}if(has('sns:apt:kami-ninpou-arte'))profile.attribute='skill:arte';}
 return profile;
}
export function sourceRepertoirePlan(item,level,values){
 if(!item.flags?.[ns]?.npcBuildTechnique)return null;
 const parent=item.actor.items.get(item.system.details?.powerId),r=repertoireFor(parent);if(!r)return null;
 const id=item.system.jutsu?.effectId||identity(item),section=item.flags?.[ns]?.canonicalTextSource?.section??'',a=item.actor.system.attributes,patch={};
 if(r.mode==='fixed'&&r.id==='sns:power:jinton')return {mode:'attack:cd',cost:level,base:level+a.esp,range:(5+a.esp)+' m',shape:'circle',size:a.esp/2,action:'Padrão · preparar; padrão no turno seguinte · atacar',duration:'Sustentada (1 ataque)'};
 if(r.mode==='drawings')return {mode:'none',cost:2*level,base:null,action:'Padrão',range:'Pessoal',duration:'Contínua',useNote:'Uma ou duas criaturas; uma invocação por cena. Abra os Desenhos vinculados para consultar as fichas.'};
 if(r.mode==='encenacoes')return {mode:'save',cost:item.flags?.[ns]?.npcBuildTechnique?.minimumLevel??1,base:0,noDamage:true,dc:8+parent.system.level+Math.ceil(a.int/2)+(Array.from(item.actor.items).some(i=>(i.system.ruleId||identity(i))==='sns:apt:ilusao-profunda')?1:0),theatre:true,saveKeys:['attribute:int'],range:(5+a.int)+' m',shape:'',size:null,action:'Padrão',useNote:'Um uso bem-sucedido por alvo na cena. A partir do segundo turno, a vítima pode repetir Inteligência, com Dif −1 cumulativa. A resistência de imagens externas ocorre ao interagir. Condições e cancelamento seguem a descrição.'};
 if(r.mode==='falseBijuu'){
  const state=item.actor.flags?.[ns]?.transformations?.entries?.find(e=>e.sourceId===parent.id),mode=state?.mode??'normal';
  if(section==='INSTABILIDADE DO SELO'){const controlled=parent.system.level>=10&&!parent.flags?.[ns]?.delayControl,unsafe=(state?.turns??0)>1+parent.system.level,dc=(unsafe?9:7)+level;return {mode:'none',cost:0,base:null,checks:controlled?[]:[...(!unsafe?[{key:'attribute:int',label:'Inteligência · Dif '+dc,dc}]:[]),{key:'attribute:esp',label:'Espírito · Dif '+dc,dc},...(mode==='mode'?[{key:'attribute:esp',label:'Instabilidade mental (a cada 3 turnos) · Dif '+(3+level+a.esp),dc:3+level+a.esp}]:[])],action:'Fim do turno',range:'Pessoal',useNote:controlled?'Controle Total: sem instabilidade mental.':'Escolha um teste do selo ao final do turno. Falhas, fúria, segundo rompimento e colapso são conferidos conforme a descrição.'};}
  if(/POTÊNCIA/.test(section)){if(mode==='normal')throw Error('Ative a Presença do Selo ou um modo superior.');return {mode:'attack:cc',cost:0,base:Math.ceil(a.esp/2)+(parent.system.level>=6?4:parent.system.level>=5?3:parent.system.level>=4?2:1),action:'Ataque corporal',range:'Alcance corporal',useNote:'Crítico: acrescente o dano de arma ao golpe e sofra o mesmo valor como dano fixo na Vitalidade.'};}
  if(/ONDA|BRAÇO|DISPARO/.test(section)&&!['cloak','mode'].includes(mode))throw Error('Ative o Manto Corrompido ou o Modo Besta Instável.');
  if(/DISPARO/.test(section)&&mode!=='mode')throw Error('Disparo Brutal exige Modo Besta Instável.');
  if(/ONDA/.test(section))return {mode:'attack:cd',cost:level+2,base:2*level,shape:'circle',size:2*level,action:'Padrão',range:'Pessoal',useNote:'Após atingir: Vigor Dif '+(6+2*level)+' ou empurrado até o limite da área'+(level>=8?' e Caído.':'.')};
  if(/DISPARO/.test(section))return {mode:'attack:cd',cost:level+2,base:2*level,shape:'circle',size:2*level,action:'Padrão',range:(15+5*level)+' m',useNote:'Tiro único. Rajada: ação completa e +3 chakra; testes adicionais e refluxo seguem a descrição.'};
  if(/BRAÇO/.test(section))return {mode:'none',base:null,range:(5+5*level)+' m',useNote:'Informe o custo da criação; a Enciclopédia não fornece um valor no cabeçalho desta técnica. Reembolso, braços adicionais e manutenção seguem a descrição.'};
 }
 if(r.mode==='hearts'){const nature=item.flags?.[ns]?.jionguNature;if(nature&&!jionguHearts(parent).includes(nature))throw Error('O coração de '+nature+' está ausente.');}
 if(!values)return null;
 const support=['areia-especial','areia-suspensa','terceiro-olho','areia-selada','armadura-de-po-de-ouro','manto-de-areia-de-ferro','areia-de-ferro-venenosa','esfera-de-cristal','prisma','aprimorar-tecnica','labirinto','voo','transmissor','selar-chakra','golem','espelhos-demoniacos','hb-f05-emissario-divino','hb-f05-constelacao-viva','hb-f05-arma-de-sangue'];
 if(support.some(k=>id==='sns:effect:'+k))Object.assign(patch,{mode:'none',base:null});
 if(['sons-de-guizo','badalar-do-sino'].some(k=>id==='sns:effect:'+k))Object.assign(patch,{mode:'save',base:0,noDamage:true,dc:values.dc-2,saveKeys:['attribute:vig']});
 const costs={'armadura-de-po-de-ouro':3,'manto-de-areia-de-ferro':1,'esfera-de-cristal':2,'prisma':7,'espelhos-demoniacos':level>=8?4:3,'voo':4};
 const slug=id.replace('sns:effect:','');if(Object.hasOwn(costs,slug))patch.cost=costs[slug];
 if(slug==='esfera-de-cristal')patch.range=(50*(item.actor.system.skillLevels?.rastrear??0))+' m';
 if(slug==='kajousatsu')Object.assign(patch,{base:values.common,mode:'attack:cd',shape:'circle',size:0.5});
 if(slug==='labirinto')Object.assign(patch,{shape:'circle',size:values.size,dc:values.dc,saveKeys:[]});
 if(slug==='neblina-acida')Object.assign(patch,{mode:'attack:cd',base:values.common,shape:'circle',size:2*values.size,useNote:'Após atingir: Vigor Dif '+(values.dc-2)+'. Falha causa o envenenamento descrito no efeito. Concentração e expansão seguem a descrição.'});
 if(slug==='sopro-concentrado')Object.assign(patch,{mode:'attack:cd',base:values.common});
 if(slug==='dano-continuo')Object.assign(patch,{mode:'attack:cd',base:values.common,cost:level});
 if(r.mode==='hearts'){
  const nature=item.flags?.[ns]?.jionguNature;if(nature&&!jionguHearts(parent).includes(nature))throw Error('O coração de '+nature+' está ausente.');
 }
 return patch;
}
export function jionguCapacity(level){return [1,2,4,6,8].filter(n=>n<=level).length;}
export function jionguHearts(power){return (power?.flags?.[ns]?.jionguHearts??[]).slice(0,jionguCapacity(power?.system.level??0)).filter(v=>['katon','suiton','doton','raiton','fuuton'].includes(v));}
export function npcSaveDifficulty(cast,target){if(cast.plan.legado)return legadoSaveDifficulty(cast,target);return cast.plan.dc+(cast.plan.theatre?(isGeneratedMinion(target)?3:0)-(cast.targets.length>1?cast.targets.length:0):0);}
