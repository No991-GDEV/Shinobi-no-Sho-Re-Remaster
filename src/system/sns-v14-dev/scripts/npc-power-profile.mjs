import {sourceRepertoireProfile,jionguHearts} from './npc-repertoire-core.mjs';
import {puppetUsePlan} from './npc-puppet-core.mjs';
import {POWER_DEFINITIONS,EFFECT_DEFINITIONS} from '../data/power-definitions.mjs';
import {sourceReviewedItem} from './source-review-compat.mjs';
import {hibonBonuses} from '../data/hibon-bonuses.mjs';
import {recordedSkillLevel} from './recorded-skill-level.mjs';
const norm=s=>String(s??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const text=s=>norm(s).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
const names={katon:['katon','fogo'],doton:['doton','terra'],suiton:['suiton','agua'],fuuton:['fuuton','futon','vento'],raiton:['raiton','trovao','relampago']};
export function npcPowerProfile(item,library,nature=''){
 const rawParent=item.actor.items.get(item.system.details.powerId),p=rawParent?sourceReviewedItem(rawParent):null;if(!p)return {profile:null,natures:[]};
 const source=norm(p.flags?.['sns-v14-dev']?.animeSource?.recordedName||p.name),isMulti=/versatilidade|rinne ninpou|estilo.*\/.*estilo/.test(source);
 let natures=isMulti?Object.entries(names).filter(([,words])=>/rinne ninpou/.test(source)||words.some(w=>source.includes(w))).map(([key])=>key):[];
 if(isMulti){
  const effect=EFFECT_DEFINITIONS.find(e=>e.id===(item.system.jutsu?.effectId||item.system.contentId));if(effect)natures=natures.filter(n=>effect.powers.includes(n));
  const recipe=norm(item.name+' '+(item.system.personalNotes??'').split('\n')[0]);
  const specific=natures.filter(key=>names[key].some(w=>new RegExp('\\b'+w+'\\b').test(recipe)));
  if(!nature&&specific.length===1)nature=specific[0];
  const recorded=norm(p.flags?.['sns-v14-dev']?.animeRepertoire?.sourceText||p.flags?.['sns-v14-dev']?.animeSource?.recordedNotes||p.system.personalNotes),limits={};
  // A combined source row explicitly records Água10 + Terra8 (Hashirama).
  // Ordinary Versatilidade/Rinne Ninpou retains its single purchased level.
  if(/estilo.*\/.*estilo/.test(source))for(const key of natures){const match=names[key].map(w=>recorded.match(new RegExp('\\b'+w+'\\s*(\\d+)\\b'))).find(Boolean);if(match)limits[key]=Number(match[1]);}
  return {profile:natures.includes(nature)?POWER_DEFINITIONS.find(p=>p.id==='sns:power:'+nature):null,natures,nature,isMulti:true,maxLevel:limits[nature]??p.system.level,natureLevels:limits};
 }
 if(p.system.contentId==='sns:power:jiongu'){const selected=item.flags?.['sns-v14-dev']?.jionguNature||nature,hearts=jionguHearts(p);if(!hearts.includes(selected))return {profile:null,natures:hearts,isMulti:true};return {profile:POWER_DEFINITIONS.find(d=>d.id==='sns:power:'+selected),natures:[],nature:selected};}
 const reviewed=sourceRepertoireProfile(p,item.actor);if(reviewed&&p.system.contentId!=='sns:power:hibon-ninpou')return {profile:reviewed,natures:[],source:'D168 · parâmetros do livro'};
 const common=POWER_DEFINITIONS.find(d=>d.id===(p.system.power?.definitionId||p.system.contentId));
 if(common&&Number.isFinite(common.damageBonus))return {profile:common,natures:[],nature:common.id.split(':').at(-1)};
 if(p.system.contentId==='sns:power:hibon-ninpou'){
  const bonus=hibonBonuses(p),ninpou=POWER_DEFINITIONS.find(d=>d.id==='sns:power:ninpou');
  return {profile:bonus?{...ninpou,...bonus}:null,natures:[],missingBonus:!bonus};
 }
 if(p.system.contentId==='sns:power:kikai-ninpou')return {profile:{attribute:'skill:lidar_com_animais',rangeBase:10,rangeFactor:2,sizeFactor:1,damageBonus:0},natures:[],source:'Básico · Kikai Ninpou: parâmetros de Ninpou com Lidar com Animais'};
 if(p.system.contentId==='sns:power:sumi-ninpou')return {profile:{attribute:'skill:arte',rangeBase:15,rangeFactor:3,sizeFactor:1,damageBonus:0,difficultyBonus:1},natures:[],source:'Básico · Sumi Ninpou'};
 const origin=Array.from(item.actor.items).find(i=>i!==p&&i.flags?.['sns-v14-dev']?.animeSource?.derivedOrigin&&i.flags?.['sns-v14-dev']?.animeSource?.cell===p.flags?.['sns-v14-dev']?.animeSource?.cell);
 const book=library.find(e=>e.id===p.system.contentId||e.id===p.system.details?.sourceDefinitionId||e.id===origin?.system.contentId),body=text(book?.document.system.description);
 if(book?.id==='sns:hijutsu:kibaku-nendo')return {profile:{attribute:'skill:arte',rangeBase:15,rangeFactor:3,sizeFactor:2,damageBonus:2},natures:[]};
 if(book?.id==='sns:power:senninka')return {profile:{attribute:'esp',rangeBase:10,rangeFactor:2,sizeFactor:1,damageBonus:0,commonMultiplier:2},natures:[],source:'F02 PDF 81: efeitos seguem Ninpou; dano comum igual a 2 × nível usado'};
 // Only parse explicitly printed standard parameters. Unique powers with no
 // such declaration do not receive a guessed generic Ninpou profile.
 const range=body.match(/alcance:\s*[^()]{0,30}\(\s*(\d+)m\s*\+\s*(\d+)m/),size=body.match(/tamanho:[\s\S]{0,180}?ate\s*(\d+(?:[.,]\d+)?)m/);
 if(!range||!size)return {profile:null,natures:[]};
 let bonus=Number(body.match(/dano adicional:[^.]{0,160}?\+(\d+)/)?.[1]??body.match(/dano adicional:[^.]{0,90}?(\d+) pontos? (?:a mais|de dano)/)?.[1]??0);
 return {profile:{attribute:'esp',rangeBase:Number(range[1]),rangeFactor:Number(range[2]),sizeFactor:Number(size[1].replace(',','.')),damageBonus:bonus,difficultyBonus:book.id==='sns:power:mokuton'?1:0},natures:[]};
}
export function profileValues(profile,actor,level){
 if(!profile)return null;
 const a=profile.attribute.startsWith('skill:')?recordedSkillLevel(actor,profile.attribute.slice(6)):actor.system.attributes?.[profile.attribute];
 if(!Number.isFinite(a))return null;
 return {common:profile.commonMultiplier?profile.commonMultiplier*level:level+Math.ceil(a/2)+profile.damageBonus,double:2*level+profile.damageBonus,range:profile.rangeBase+profile.rangeFactor*a,size:Math.ceil(profile.sizeFactor*a),dc:9+level+Math.ceil(a/2)+(profile.difficultyBonus??0)};
}
export function npcPowerSummary(item,details){
 if(item.actor?.type!=='npc'||item.type!=='jutsu')return details;
 if(item.flags?.['sns-v14-dev']?.puppetUse){try{const p=puppetUsePlan(item);return {...details,action:p.action,range:p.range,chakraCost:String(p.cost),duration:p.duration,damage:p.base===null?'Nenhum':String(p.base)};}catch{return details;}}
 const id=item.system.jutsu?.effectId||item.system.contentId||item.flags?.['sns-v14-dev']?.canonicalTextSource?.id;
 if(id==='sns:jutsu:chakra-no-souin')return {...details,chakraCost:'Deixa 1 chakra',range:'Superfície imóvel'};
 if(id==='sns:apt:rinkaichuu')return {...details,chakraCost:'0',range:'Contato físico'};
 if(!['canhao','orbe','flechas','coluna','correnteza'].some(k=>id==='sns:effect:'+k))return details;
 const parent=item.actor.items.get(item.system.details?.powerId);if(parent?.system.contentId!=='sns:power:hibon-ninpou')return details;
 const v=profileValues(npcPowerProfile(item,[]).profile,item.actor,1);return v?{...details,chakraCost:'Nível usado',range:v.range+' m'}:details;
}
