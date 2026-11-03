import {jutsuProjection} from './item-view.mjs';
import {effectDefinition,resolveJutsu} from './power-core.mjs';
import {jutsuRuleText,genericRule,effectiveRuleItem,readableRuleHtml} from './jutsu-rule-text.mjs';
import {recordedSkillLevel} from './recorded-skill-level.mjs';
import {npcPowerProfile,profileValues} from './npc-power-profile.mjs';
const ns='sns-v14-dev';
const items=a=>Array.from(a?.items??[]);
const plain=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const row=(label,value,formula='')=>({label,value:String(value),formula});
export function jutsuReading(item,library=[],usedLevel){
 if(!['jutsu','effectDefinition'].includes(item.type))return null;
 item=effectiveRuleItem(item);
 const p=items(item.actor).find(p=>p.id===item.system.details?.powerId),effectId=item.system.jutsu?.effectId||item.system.contentId;
 const entry=library.find(e=>e.id===effectId),min=effectId==='sns:jutsu:chakra-no-souin'?7:effectDefinition(effectId)?.min??entry?.document.system.level??1;
 const max=item.system.jutsu?.grantSourceId?Math.max(min,p?.system.level??min):p?.system.level??Math.max(min,item.system.jutsu?.usedLevel??min);
 const n=usedLevel??(item.system.jutsu?.effectId?item.system.jutsu.usedLevel:max);
 let projection=jutsuProjection(item,{usedLevel:n});
 if(!projection&&p?.system.power?.definitionId&&effectDefinition(effectId))projection=resolveJutsu(item.actor,p,{system:{jutsu:{effectId,selectionId:'',usedLevel:n,variant:'normal',overrides:[]}}});
 const rows=[],data=projection?.data,formulas=projection?.formulas??{};
 if(p)rows.push(row('Poder',p.name),row('Nível usado',n+' / '+max));
 if(data)for(const [key,label] of [['action','Ação'],['chakraCost','Chakra'],['damage','Dano base'],['range','Alcance'],['size','Tamanho máximo (m)'],['area','Área'],['difficulty','Dificuldade'],['target','Alvos'],['duration','Duração'],['defenses','Defesas']])if(data[key]!==undefined&&data[key]!=='')rows.push(row(label,data[key],formulas[key]));
 const printed=jutsuRuleText(item,library),related=[];
 let parent=library.find(e=>e.id===p?.system.contentId);
 if(!parent&&p){const origin=items(item.actor).find(i=>i!==p&&i.flags?.[ns]?.animeSource?.derivedOrigin&&i.flags?.[ns]?.animeSource?.cell===p.flags?.[ns]?.animeSource?.cell);parent=library.find(e=>e.id===origin?.system.contentId);}
 if(parent){const text=parent.document.system.description;related.push({name:'Parâmetros de '+parent.document.name,html:text.split(/<h3>EFEITOS|<h3>APTID[ÕO]ES|<h3>T[ÉE]CNICAS/i)[0],source:parent.document.system.source});}
 if(!data&&p&&['sns:power:mokuton','sns:hijutsu:kibaku-nendo'].includes(parent?.id)){
  const clay=parent.id==='sns:hijutsu:kibaku-nendo',v=clay?recordedSkillLevel(item.actor,'arte'):item.actor.system.attributes?.esp;
  const label=clay?'Arte':'ESP',bonus=clay?2:1;
  if(Number.isInteger(v)&&Number.isInteger(n)&&n>=min&&n<=max){
   const common=n+Math.ceil(v/2)+bonus,e=effectDefinition(effectId);
   rows.push(row('Alcance comum',(clay?15+3*v:10+2*v)+' m',clay?'15 + 3 × Arte':'10 + 2 × ESP'),row('Tamanho máximo',(clay?2*v:v)+' m',clay?'2 × Arte':'ESP'));
   if(e?.damage==='double')rows.push(row('Dano base',2*n+bonus,'2 × nível usado + '+bonus));
   else if(e?.damage==='projectiles')rows.push(row('Projéteis',n+' × DB 2; +'+bonus+' uma vez por alvo'));
   else rows.push(row(['sns:effect:orbe','sns:effect:sopro-destrutivo'].includes(effectId)?'Dano base':'Dano comum do poder',common,'Nível usado + ⌈'+label+'/2⌉ + '+bonus));
   rows.push(row('Dificuldade comum',9+n+Math.ceil(v/2)+(clay?0:1),'9 + nível usado + ⌈'+label+'/2⌉'+(clay?'':' + 1')));
   if(e&&['sns:effect:canhao','sns:effect:raio','sns:effect:orbe','sns:effect:flechas','sns:effect:sopro-destrutivo'].includes(effectId))rows.push(row('Chakra',n,'Nível usado do efeito'));
   if(clay)rows.push(row('Bombas de argila',n,'Nível usado; salvo custo próprio do efeito'));
  }
 }
 if(!data&&p?.system.contentId==='sns:power:hibon-ninpou'&&item.actor?.type==='npc'){
  const profile=npcPowerProfile(item,library).profile,v=profileValues(profile,item.actor,n),effect=effectDefinition(effectId);
  if(v){rows.push(row('Alcance comum',v.range+' m','10 + 2 × ESP'),row('Tamanho máximo',v.size+' m','ESP'),row('Dificuldade comum',v.dc,'9 + nível usado + ⌈ESP/2⌉ + '+profile.difficultyBonus),row('Bônus de dureza',profile.hardnessBonus));
   if(effect?.damage==='projectiles')rows.push(row('Projéteis',n+' × DB 2; +'+profile.damageBonus+' uma vez por alvo'));
   else rows.push(row('Dano base',effect?.damage==='double'?v.double:v.common));
   rows.push(row('Chakra',n,'Nível usado do efeito'));
  }
 }
 // Arte is the complete trained level F+G, excluding Perito/other precision
 // bonuses. The former import mistakenly stored only G (purchased points).
 if(effectId==='sns:effect:mina-explosiva'&&p&&items(item.actor).some(i=>i.system.contentId==='sns:hijutsu:kibaku-nendo')){
  const art=recordedSkillLevel(item.actor,'arte');
  if(Number.isInteger(art)&&Number.isInteger(n)&&n>=3&&n<=max){
   rows.length=0;rows.push(row('Nível usado',n+' / '+max),row('Dano base',n+Math.ceil(art/2)+2,'Nível usado + ⌈Arte/2⌉ + 2'),row('Dificuldade remota',9+n+Math.ceil(art/2),'9 + nível usado + ⌈Arte/2⌉'),row('Explosão','Círculo de 5 m de diâmetro','Área da tarja explosiva; sem acréscimo por quantidade'),row('Plantar','Toque'),row('Ativação remota',(15+3*art)+' m','15 + 3 × Arte'),row('Gatilho de proximidade','2 m'),row('Bombas de argila',n,'Nível usado do poder'),row('Duração','Contínua até a detonação'),row('Preparar','Ação padrão · até 2 minas'),row('Detonar remotamente','Ação livre; ou após 3 turnos'),row('Defesa','Agilidade ou Prontidão contra a dificuldade remota'));
  }
  const tag=library.find(e=>e.id==='sns:equipment:tarja-explosiva');if(tag)related.push({name:'Regras de preparação e detonação',html:tag.document.system.description,source:tag.document.system.source});
 }
 // Fill each missing fact, even when the parent already supplied other rows.
 // Previously a single "Poder" row suppressed every printed technique field.
 for(const [key,label] of [['action','Ação'],['chakraCost','Chakra'],['damage','Dano / efeito'],['range','Alcance'],['target','Alvos'],['duration','Duração'],['area','Área'],['vision','Visão'],['clay','Argila']]){
  const value=printed.fields[key];if(!value)continue;
  const previous=rows.find(r=>r.label===label||(key==='damage'&&r.label==='Dano base'));
  if(previous){if(genericRule(previous.value))previous.value=value;}
  else rows.push(row(label,value));
 }
 for(const entry of printed.related)if(!related.some(r=>r.name.includes(entry.document.name)))related.push({name:'Regra relacionada: '+entry.document.name,html:entry.document.system.description,source:entry.document.system.source});
 return {description:readableRuleHtml(item.system.description,printed.fields),rows,fields:printed.fields,level:n,min,max,related,problems:projection?.problems??[],hasValues:!!rows.length,sourceSummary:plain(item.system.personalNotes)};
}
