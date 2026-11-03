// Read the printed rules independently from combat execution. The book body is
// never rewritten to hide a missing field or to invent a numerical rule.
import {JUTSU_TEXT_UPDATES} from '../data/jutsu-text-updates.mjs';
import {BOOK_EFFECTS} from '../data/book-effects.mjs';
import {NPC_REVIEW_PATCHES} from '../data/bestiary-review-d162.mjs';
import {sourceReviewedItem} from './source-review-compat.mjs';
const quoteEncoding=s=>String(s??'').replace(/&quot;/g,'"').replace(/&#(?:x27|0*39);/gi,"'");
export function effectiveRuleItem(item){
 const update=JUTSU_TEXT_UPDATES.find(u=>(u.contentId?item.system?.contentId===u.contentId:item.name===u.name)&&quoteEncoding(item.system?.description)===quoteEncoding(u.before));
 let result=update?{type:item.type,name:item.name,id:item.id,uuid:item.uuid,img:item.img,actor:item.actor,flags:{...item.flags,'sns-v14-dev':{...item.flags?.['sns-v14-dev'],...(update.textSource?{canonicalTextSource:update.textSource}:{})}},system:{...item.system,description:update.description,source:update.source}}:item;
 for(const patch of NPC_REVIEW_PATCHES){
  const f=result.flags?.['sns-v14-dev']??{};
  if(patch.contentId&&patch.contentId!==result.system.contentId||!patch.contentId&&patch.name!==result.name||quoteEncoding(result.system.description)!==quoteEncoding(patch.before))continue;
  if(patch.actorSource&&patch.actorSource!==result.actor?.flags?.['sns-v14-dev']?.animeProfile?.sourcePath||patch.recordedName&&patch.recordedName!==f.animeSource?.recordedName||patch.cell&&patch.cell!==f.animeSource?.cell||patch.sourcePath&&patch.sourcePath!==f.animeRepertoire?.sourcePath)continue;
  const details=Object.fromEntries(Object.entries(patch.details??{}).filter(([k])=>!result.system.details?.[k])),choice=patch.choice&&!result.system.choice?.key?patch.choice:null,flags=Object.fromEntries(Object.entries(patch.flags??{}).filter(([k])=>!Object.hasOwn(f,k)));
  if(!Object.keys(details).length&&!choice&&!Object.keys(flags).length&&!patch.description)continue;
  result={type:result.type,name:result.name,id:result.id,uuid:result.uuid,img:result.img,actor:result.actor,flags:{...result.flags,'sns-v14-dev':{...f,...flags}},system:{...result.system,details:{...result.system.details,...details},...(patch.description?{description:patch.description,source:patch.source}:{}),...(choice?{choice}:{})}};
 }
 // Old generated Bunshin copies inherited two prose paragraphs as table fields.
 // Change only those exact stale values in the presentation, never personal edits.
 if(result.actor?.flags?.['sns-v14-dev']?.npcGenerator?.version===1&&result.system?.contentId==='sns:jutsu:bunshin-no-jutsu'){
  const d={...result.system.details};let changed=false;
  for(const [key,before,after]of [['action','Os clones possuem todas as ações de combate, porém não têm iniciativa e agem no mesmo turno do usuário. Fazer isso aumenta o tempo da técnica para uma ação padrão e o custo de chakra para 4.','Movimento ou Padrão (ver texto)'],['chakraCost','Seja qual for a quantidade de clones criados, o usuário sempre gastará 1 ponto de chakra na execução da técnica.','1 ou 4 (ver texto)']])if(d[key]===before){d[key]=after;changed=true;}
  if(changed)result={type:result.type,name:result.name,id:result.id,uuid:result.uuid,img:result.img,actor:result.actor,flags:result.flags,system:{...result.system,details:d}};
 }
 return sourceReviewedItem(result);
}
export const rulePlain=s=>String(s??'').replace(/<\/(?:p|h\d|li|tr)>/gi,'\n').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|#160);/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#(?:39|x27);/gi,"'").replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').trim();
export const ruleFold=s=>rulePlain(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/\s+/g,' ').trim();
export const genericRule=s=>/^(?:texto|ver (?:texto|descri[cç][aã]o)|conforme (?:o )?texto)[.!]?$/i.test(String(s??'').trim());
const fieldNames='(?:Disponível para|Pré[- ]?requisitos?|Ação|Alcance|Área d[eo] Efeito|Alvos?|Dano|Duração|Custo(?: de (?:Chakra|Argila|Visão|Corações))?|Selos de Mão|Dificuldade|Tamanho|Dureza)';
const keys={acao:'action',alcance:'range','area de efeito':'area','area do efeito':'area',alvo:'target',alvos:'target',dano:'damage',duracao:'duration','custo de chakra':'chakraCost',custo:'chakraCost',dificuldade:'difficulty',tamanho:'size','custo de argila':'clay','custo de visao':'vision'};
export function printedRuleHeaders(html){
 const result={};
 for(const paragraph of String(html??'').matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)){
  const text=rulePlain(paragraph[1]);
  // Two or more printed bullets can share a PDF line/HTML paragraph.
  const re=new RegExp('(?:^|[❖•▪\\uf076]\\s*)('+fieldNames+')\\s*:\\s*','gi'),matches=Array.from(text.matchAll(re));
  for(let n=0;n<matches.length;n++){
   const m=matches[n],key=ruleFold(m[1]).replace('area do efeito','area de efeito');
   if(Object.hasOwn(result,key))continue;
   let value=text.slice(m.index+m[0].length,matches[n+1]?.index??text.length).trim();
   // A column extraction can join the last header and the first prose sentence.
   value=value.split(/\s+(?=(?:Você|Voce|O usuário|O personagem|Esta técnica|Este efeito|Esse efeito|Arma Elétrica|Benefício|Ao usar|Para executar|Para essa técnica|Com o passar do tempo)(?:\s|:|$))/i)[0].trim();
   if(value)result[key]=value;
  }
 }
 return result;
}
const evidencePatterns={action:/\ba[cç][aã]o\b|\bações\b|\ba[cç][oõ]es\b/i,chakraCost:/(?:(?:custa|custo|gasta|consom|paga)[^.!?]{0,100}(?:\d|nível|metade)[^.!?]{0,50}chakra|(?:\d|nível|metade)[^.!?]{0,60}(?:de chakra|ponto de chakra|pontos de chakra))/i,damage:/\bdano\b|\bdanos\b|\bgrau\b/i,range:/alcance|distância|distancia|toque/i,target:/alvo|criatura/i,duration:/dura[cç][aã]o|durante|permanece|sustentad|cont[ií]nu|permanente|minutos|turnos/i,area:/di[aâ]metro|[aá]rea|largura|comprimento|cone|esfera|c[ií]rculo/i};
export function ruleEvidence(html,key){
 const pattern=evidencePatterns[key];if(!pattern)return [];
 // Only prose, never another header, prerequisite or section title.
 return Array.from(String(html??'').matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)).map(m=>rulePlain(m[1]))
  .filter(p=>p&&!/^[❖•▪\uf076]/.test(p)&&!new RegExp('^'+fieldNames+'\\s*:','i').test(p))
  .flatMap(p=>p.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÇ])/u)).filter(s=>pattern.test(s));
}
// Explicit cross-references, not name heuristics granting new purchases.
const inherited={
 'sns:jutsu:kagenade':['sns:apt:nikudan-hari-sensha'],
 'sns:jutsu:tornado-do-polvo':['sns:power:jinchuuriki'],
 'sns:jutsu:tinta-do-polvo':['sns:effect:nevoa','sns:jutsu:mizu-bunshin'],
 'sns:jutsu:aoi-katon':['sns:power:katon'],
 'sns:jutsu:sanbi-suiton':['sns:power:suiton'],
 'sns:jutsu:rasengan-completo':['sns:jutsu:rasengan-basico'],
 'sns:jutsu:oodama-rasengan':['sns:jutsu:rasengan-completo'],
 'sns:jutsu:mushi-bunshin':['sns:apt:clone'],
 'sns:jutsu:moku-bunshin':['sns:apt:clone'],
 'sns:effect:mina-explosiva':['sns:equipment:tarja-explosiva'],
 'sns:jutsu:selo-de-armazenamento-maior':['sns:jutsu:selo-de-armazenamento'],
 'sns:effect:areia-selada':['sns:jutsu:selo-de-armazenamento'],
 'sns:effect:vulcao':['sns:effect:meteoros'],
 'sns:effect:hell-stab':['sns:effect:lamina-de-raios'],
 'sns:effect:cortina-de-poeira':['sns:effect:tremor','sns:effect:nevoa'],
};
const fieldNotes={
 'sns:effect:arma-eletrica':{chakraCost:'Energizar: 3; criar projéteis: 1; criar lâmina: 4; estender lâmina: sem custo adicional'},
 'sns:effect:vulcao':{damage:'1 de dano fixo por nível usado por foco de erupção (regras de Meteoros); danos de focos sobrepostos se somam'},
 'sns:effect:anjo-de-papel':{chakraCost:'Voar: 2 Pontos Kami; Voo Rápido: 1 Ponto Kami; Flechas: custo do efeito Flechas'},
 'sns:effect:adicao-de-peso':{chakraCost:'Socos Pesados: custo de Pele de Pedra; Aumentar Peso: 4'},
 'sns:jutsu:gensou-no-in':{area:'Até 1 m por nível de Inteligência em cada dimensão'},
 'sns:jutsu:selo-de-armazenamento-maior':{action:'1 rodada para selar; liberar: ação do objeto ou jutsu armazenado',chakraCost:'1 por compartimento para armazenar/retirar; jutsu: 1 + custo da técnica para armazenar e custo da técnica ao liberar'},
 'sns:effect:braco-de-agua':{damage:'Espírito substitui Força no cálculo do dano de ataques corporais'},
 'sns:effect:badalar-do-sino':{damage:'Sem dano direto: Vigor (Dif padrão −2); falha causa Impedido. Nv 8: também Atordoado; Nv 10: Paralisado por 2 turnos'},
 'sns:effect:areia-selada':{chakraCost:'Selo de Armazenamento Maior: 1 chakra por compartimento; capacidade de areia conforme o nível do poder'},
 'sns:effect:areia-de-ferro-venenosa':{action:'2 minutos de concentração por compartimento',range:'Aplicação na própria areia; técnicas conservam seu alcance',chakraCost:'Usa 2 doses de veneno por compartimento; não há custo de chakra expresso para imbuir'},
 'sns:effect:hell-stab':{action:'Parcial: preparar; padrão: ataque de toque (Lâmina de Raios Nv 5)'},
 'sns:jutsu:kagutsuchi':{action:'Ação do efeito usado para moldar o Enton',chakraCost:'Custo do efeito de Katon escolhido; também consome 1 ponto de visão'},
 'sns:jutsu:hb-f06-mikazuki-no-mai':{action:'Padrão + movimento do usuário e dos 2 clones (Investida)',range:'Alcance da Investida, seguido de ataque corporal com espada'},
 'sns:jutsu:hb-f05-mikazuki-no-mai':{range:'Alcance corporal da espada'},
 'sns:jutsu:hb-f05-enton-rasenshuriken':{duration:'Execução instantânea; Incendiado continua até ser removido, aumentando 1 no fim de cada turno'},
};
const actionNotes={
 'sns:jutsu:aoi-katon':'Ação da técnica elemental escolhida',
 'sns:jutsu:sanbi-suiton':'Ação da técnica elemental escolhida',
 'sns:jutsu:mimica-sharingan':'Completa: analisar; anular e executar: ação da técnica copiada',
 'sns:jutsu:hipnose-sharingan':'Escolha a modalidade: padrão, movimento, completa ou 1 rodada',
 'sns:jutsu:kamui':'Livre: ativar; movimento: teleportar/abduzir; padrão: expelir/intangibilidade; completa: transportar outra criatura',
 'sns:jutsu:tsunoori':'Manobra Atropelar',
 'sns:jutsu:cauda-morta':'Uso extra de Kawarimi: soltar a cauda e criar um clone imóvel',
 'sns:jutsu:tinta-do-polvo':'Névoa e clones: ação das técnicas correspondentes; Selamento do Polvo: completa',
 'sns:jutsu:tornado-do-polvo':'Ação da Onda de Chakra de Jinchuuriki; dobro da área',
 'sns:jutsu:kagenade':'Ação de Nikudan Hari Sensha (Forma Bijuu)',
 'sns:jutsu:hb-f05-uzumaki-rendan':'Ataques com Chute Ascendente/Arremessar, Seguir Sombra e Ataque Múltiplo; os clones gastam seus turnos',
 'sns:effect:mina-explosiva':'Padrão · preparar até 2 minas; livre · detonar',
 'sns:jutsu:hb-f05-chikatsu-saisei-no-jutsu':'Ritual com 5 ninjas médicos imóveis; duração conforme o tratamento',
};
export function ruleIdentity(item){return item.system?.jutsu?.effectId||item.system?.contentId||item.flags?.['sns-v14-dev']?.canonicalTextSource?.id||'';}
export function jutsuRuleText(item,library=[]){
 item=effectiveRuleItem(item);
 const id=ruleIdentity(item),html=item.system?.description??'',headers=printedRuleHeaders(html),fields={},notes={},unresolved=[],sourceGaps=[];
 for(const [key,value]of Object.entries(headers))if(keys[key])fields[keys[key]]=value;
 const related=(inherited[id]??[]).map(id=>library.find(e=>e.id===id)).filter(Boolean);
 if(/sns:effect:(?:extase|amedrontar|confundir|fadigar|segurar|adormecer|anular-sentido|desequilibrar|desorientar|falsa-velocidade|aliviamento|falsa-posicao|petrificar|adoecer|atordoar|paralisar)$/.test(id)){
  fields.action??='Padrão';fields.chakraCost??=/falsa-velocidade$/.test(id)?'2 por uso':'Nível do efeito usado';fields.range??='Comum de Magen';
  const magen=library.find(e=>e.id==='sns:power:magen');if(magen)related.push(magen);
 }
 if(actionNotes[id])fields.action=actionNotes[id];
 Object.assign(fields,fieldNotes[id]??{});
 // The reviewed common-effect family inherits Ninpou's printed default cost.
 // This does not extend that default to unrelated exclusive techniques.
 if(!fields.chakraCost&&BOOK_EFFECTS.some(e=>e.id===id))fields.chakraCost=ruleEvidence(html,'chakraCost')[0]??'Nível usado do poder';
 if(['sns:jutsu:hb-f05-amegakure','sns:jutsu:hb-f05-kami-no-ki'].includes(id)){fields.action='A fonte não define a ação de ativação';sourceGaps.push('action');}
 for(const key of ['action','chakraCost','damage','range','target','duration','area']){
  const value=fields[key];
  if(!value)continue;
  if(value&&!genericRule(value)&&!/ver texto/i.test(value))continue;
  const evidence=ruleEvidence(html,key);
  if(evidence.length){notes[key]=evidence;fields[key]=evidence.slice(0,2).join(' ');continue;}
  // A reference is explicit, but remains a formula/reference until a power or
  // mode is chosen. It must not become a made-up fixed number.
  const printed=related.map(e=>({entry:e,header:printedRuleHeaders(e.document.system.description)})).find(r=>Object.entries(r.header).some(([k,v])=>keys[k]===key&&!genericRule(v)));
  if(printed){const v=Object.entries(printed.header).find(([k,v])=>keys[k]===key&&!genericRule(v))[1];fields[key]=v+' · '+printed.entry.document.name;continue;}
  if(genericRule(value)){delete fields[key];unresolved.push(key);}
 }
 return {id,headers,fields,notes,related,unresolved,sourceGaps};
}
export function techniqueSummary(html){
 return Array.from(String(html??'').matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)).map(m=>rulePlain(m[1])).find(p=>p.length>35&&!/^[❖•▪\uf076]/.test(p)&&!new RegExp('^'+fieldNames+'\\s*:','i').test(p))??'';
}
export function readableRuleHtml(html,fields){
 const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const labels={action:'Ação',range:'Alcance',duration:'Duração',damage:'Dano',area:'Área d[eo] Efeito',chakraCost:'Custo de Chakra'};
 let result=String(html??'');
 for(const [key,label]of Object.entries(labels))if(fields[key])result=result.replace(new RegExp('('+label+'\\s*:\\s*)(?:ver (?:texto|descrição)|texto)(?=[\\s<.!]|$)','gi'),(_,prefix)=>prefix+escape(fields[key]));
 return result;
}
