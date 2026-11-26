import {effectiveAttribute,effectiveHardness} from './transformation-core.mjs';
import {weaponDamageProfile} from './damage-source.mjs';
import {WEAPON_CLASSES} from '../data/weapon-defense-profiles.mjs';
import {recordedSkillLevel} from './recorded-skill-level.mjs';
import {npcPowerProfile,profileValues} from './npc-power-profile.mjs';

const MELEE_CLASSES=new Set(['Leve','Mediana','Longa','Pesada']);

export function hasAptitude(actor,id){
 return Array.from(actor?.items??[]).some(i=>['aptitude','jutsu','feature'].includes(i.type)&&(i.system?.ruleId===id||i.system?.contentId===id));
}

export function findPower(actor,id){
 return Array.from(actor?.items??[]).find(i=>i.type==='power'&&(i.system?.contentId===id||i.system?.power?.definitionId===id))??null;
}

export function recordedSkill(actor,key){
 return recordedSkillLevel(actor,key);
}

function hasSkillChoiceAptitude(actor,key){
 return Array.from(actor?.items??[]).some(i=>i.type==='aptitude'&&['sns:apt:perito','sns:apt:pericia-inata'].includes(i.system?.ruleId||i.system?.contentId)&&i.system?.choice?.key===key);
}

/**
 * Computes official unarmed technique damage (ceil(FOR/2) + Punho de Ferro/Gouken bonus + technique bonus).
 */
export function unarmedTechniqueDamage(actor,bonus=0){
 const strength=effectiveAttribute(actor,'for','unarmed');
 if(!Number.isInteger(strength)){
  const atk=Array.from(actor?.items??[]).find(i=>i.type==='attack'&&/^\d+$/.test(String(i.system?.details?.damage??'').trim()));
  const base=atk?Math.max(0,Number(atk.system.details.damage)+bonus):null;
  return {base,damageNature:'lethal',attackKind:'melee',weaponClass:'Desarmado'};
 }
 const iron=hasAptitude(actor,'sns:apt:punho-de-ferro')||hasAptitude(actor,'sns:jutsu:gouken');
 const origFor=actor?.system?.attributes?.for;
 const ironBonus=iron&&Number.isInteger(origFor)&&origFor>=2?(origFor>=12?4:origFor>=10?3:origFor>=8?2:1):0;
 return {
  base:Math.max(0,Math.ceil(strength/2)+ironBonus+bonus),
  damageNature:iron?'lethal':'nonlethal',
  attackKind:'melee',
  weaponClass:'Desarmado'
 };
}

/**
 * Computes melee damage using the first equipped melee weapon on the actor, falling back to unarmed.
 */
export function equippedMeleeWeapon(actor,bonus=0){
 for(const weapon of Array.from(actor?.items??[])){
  if(weapon.type!=='weapon'||!weapon.system?.equipped||(weapon.system?.quantity??1)<=0)continue;
  const cls=WEAPON_CLASSES[weapon.system?.contentId];
  if(!MELEE_CLASSES.has(cls))continue;
  const profile=weaponDamageProfile(actor,weapon,'cc');
  if(!profile)continue;
  return {
   base:Math.max(0,profile.base+bonus),
   damageNature:profile.nature??'lethal',
   attackKind:'melee',
   weaponClass:profile.weaponClass||cls,
   weaponId:weapon.id
  };
 }
 return unarmedTechniqueDamage(actor,bonus);
}

function linkedPowerValues(item,sourceId,powerId,minLevel,level,actor,library){
 const parent=item.actor?.items.get(item.system?.details?.powerId)??findPower(actor,powerId);
 if(!parent)return null;
 const lvl=Math.max(minLevel,Math.min(level??parent.system?.level??minLevel,parent.system?.level??minLevel));
 const probe={...item,system:{...item.system,details:{...(item.system?.details??{}),powerId:parent.id}}};
 const prof=npcPowerProfile(probe,library).profile;
 const values=profileValues(prof,actor,lvl);
 return values?{lvl,values}:null;
}

/**
 * Deterministic combat/resistance automation profile for canonical book jutsus without elemental effectId.
 */
export function canonicalJutsuCombatPlan(item,sourceId,level,actor,library=[]){
 if(!sourceId||!actor)return null;

 // Taijutsu de Konoha
 if(sourceId==='sns:jutsu:konoha-reppu'){
  const rasteira=hasAptitude(actor,'sns:apt:rasteira'),giratorio=hasAptitude(actor,'sns:apt:ataque-giratorio'),agressivo=hasAptitude(actor,'sns:apt:derrubar-agressivo');
  return {mode:'attack:cc',cost:0,base:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',testAdjustment:rasteira?1:0,...(giratorio?{shape:'circle',size:3}:{}),useNote:'Manobra Derrubar (chute rasteiro giratório).'+(rasteira?' Rasteira: +1 de precisão.':'')+(giratorio?' Ataque Giratório: atinge todos à sua volta.':'')+(agressivo?' Derrubar Agressivo: pode causar dano na modalidade.':'')};
 }
 if(sourceId==='sns:jutsu:konoha-senpu'){
  const chuteGir=hasAptitude(actor,'sns:apt:chute-giratorio'),chuteInv=hasAptitude(actor,'sns:apt:chute-inverso'),u=unarmedTechniqueDamage(actor,chuteGir?2:0);
  return {mode:'attack:cc',cost:0,...u,action:chuteInv?'Padrão':'Completa',...(chuteInv?{allowedDefenses:['dodge','anticipate']}:{}),checks:[{key:'attribute:agi',label:'Finta (chute alto) · Agilidade'}],useNote:'1º chute: finta (Agilidade × Prontidão). 2º chute: ataque corpo a corpo.'+(chuteInv?' Chute Inverso: ação padrão e sem Bloqueio.':'')+(chuteGir?' Chute Giratório: +2 de dano.':'')};
 }
 if(sourceId==='sns:jutsu:konoha-daisenpu'){
  const chuteGir=hasAptitude(actor,'sns:apt:chute-giratorio'),u=unarmedTechniqueDamage(actor,chuteGir?2:0);
  return {mode:'attack:cc',cost:0,...u,multiAttack:true,checks:[{key:'attribute:agi',label:'Finta (1º chute) · Agilidade'}],useNote:'1º chute: finta (Agilidade × Prontidão). Em seguida, 2 ou 3 ataques com Ataque Múltiplo / Chute Duplo.'};
 }
 if(sourceId==='sns:jutsu:konoha-shofu'){
  const agressivo=hasAptitude(actor,'sns:apt:desarme-agressivo')||hasAptitude(actor,'sns:apt:derrubar-agressivo');
  return {mode:'attack:cc',cost:0,base:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',useNote:'Arremessa o oponente para trás/cima (Arremessar) ou desarma.'+(agressivo?' Agressivo: pode causar dano na modalidade.':'')};
 }
 if(sourceId==='sns:jutsu:omote-renge'){
  return {mode:'attack:cc',cost:0,...unarmedTechniqueDamage(actor,0),useNote:'Exige alvo seguido por Kage Buyō e Kaimon ativo. Causa dano de queda pela altura.'};
 }
 if(sourceId==='sns:jutsu:shishi-rendan'){
  return {mode:'attack:cc',cost:0,...unarmedTechniqueDamage(actor,0),multiAttack:true,useNote:'Combo de 3 golpes com Ataque Múltiplo e impacto de queda ao final.'};
 }
 if(sourceId==='sns:jutsu:ura-renge'){
  return {mode:'attack:cc',cost:0,...unarmedTechniqueDamage(actor,0),multiAttack:true,useNote:'Exige Seimon ativo e alvo seguido por Kage Buyō. Múltiplos ataques seguidos de queda.'};
 }
 if(sourceId==='sns:jutsu:asa-kujaku'){
  return {mode:'attack:cc',cost:0,...unarmedTechniqueDamage(actor,0),damageNature:'lethal',multiAttack:true,useNote:'Exige 6º Portão (Keimon). Múltiplos socos incendiados pelo atrito do ar.'};
 }
 if(sourceId==='sns:jutsu:hirudora'){
  return {mode:'attack:cc',cost:0,...unarmedTechniqueDamage(actor,0),allowedDefenses:['dodge','anticipate'],gradeMinimum:4,useNote:'Exige 7º Portão (Kyōmon). Ataque Pesado do Hachimon: não permite Bloqueio e derruba (Acrobacia Dif 9 + 2×Nível).'};
 }
 if(sourceId==='sns:jutsu:sekizo'){
  return {mode:'attack:cc',cost:0,...unarmedTechniqueDamage(actor,0),multiAttack:true,useNote:'Exige 8º Portão (Shimon). Sequência de 5 socos de ar pressurizado.'};
 }
 if(sourceId==='sns:jutsu:yagai'){
  return {mode:'attack:cc',cost:0,...unarmedTechniqueDamage(actor,0),allowedDefenses:[],gradeMinimum:4,useNote:'Exige 8º Portão (Shimon). Ataque Pesado em velocidade extrema: não pode ser defendido por nenhuma técnica.'};
 }

 // Controle de Chakra / Taijutsu
 if(sourceId==='sns:jutsu:oukashou'||sourceId==='sns:jutsu:tsuutenkyaku'){
  const esp=effectiveAttribute(actor,'esp'),iryou=findPower(actor,'sns:power:iryou-ninjutsu')?.system?.level??2;
  const cost=Number.isInteger(esp)?Math.ceil(esp/2):null,base=Number.isInteger(esp)?esp+iryou:null;
  return {mode:'attack:cc',...(cost!==null?{cost}:{}),base,damageNature:'lethal',attackKind:'melee',weaponClass:'Desarmado',allowedDefenses:['dodge','anticipate'],useNote:'Kyoudo Kyouka (não permite Bloqueio com armas comuns/desarmado). Alvo atingido testa Acrobacia Dif '+(Number.isInteger(esp)?9+esp:'9 + ESP')+' ou cai.'};
 }

 // Combinados e invocações ofensivas
 if(sourceId==='sns:jutsu:hb-f05-ino-shika-chou-yooyoo'){
  const u=unarmedTechniqueDamage(actor,0),hardness=effectiveHardness(actor);
  const base=Number.isInteger(u.base)?u.base+hardness:null;
  return {mode:'attack:cc',cost:0,base,damageNature:u.damageNature,attackKind:'melee',weaponClass:'Desarmado',useNote:'Dano = Nikudan Sensha + Dureza de Corpo ('+hardness+'). Alvos fazem Vigor Dif 3 + CC/CD ou caem.'};
 }
 if(sourceId==='sns:jutsu:shukyoku-daikyusetsu-makyo-no-ran'){
  const kuch=findPower(actor,'sns:power:kuchiyose')?.system?.level??level??5,arte=recordedSkill(actor,'arte'),bonus=hasSkillChoiceAptitude(actor,'arte')?1:0;
  const base=Number.isInteger(arte)?kuch+Math.ceil(arte/2)+bonus:null;
  return {mode:'attack:cc',cost:5,base,damageNature:'lethal',attackKind:'melee',weaponClass:'Especial',allowedDefenses:['dodge','anticipate'],ignoreAllHardness:true,ignoreArmor:true,range:'6 m',multiAttack:true,useNote:'Vermes dos Dokis (alcance 6 m, sem Bloqueio, ignora dureza e absorção).'};
 }

 // Outros Taijutsu / Kenjutsu / Armas
 if(sourceId==='sns:jutsu:hb-f05-sennen-goroshi'){
  return {mode:'attack:cc',cost:0,base:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',checks:[{key:'attribute:agi',label:'Finta · Agilidade'}],useNote:'Finta com ação livre; acertando, arremessa o alvo e o deixa Atordoado (ou causa dano).'};
 }
 if(sourceId==='sns:jutsu:hb-f05-uzumaki-rendan'){
  return {mode:'attack:cc',cost:0,...unarmedTechniqueDamage(actor,0),multiAttack:true,useNote:'Combo com clones (Arremessar/Chute Ascendente + Ataque Múltiplo).'};
 }
 if(sourceId==='sns:jutsu:hb-f05-double-lariat'){
  return {mode:'attack:cc',cost:0,...unarmedTechniqueDamage(actor,3),useNote:'Execução em dupla com Lariat Nv 8. Se ambos acertarem, soma (DB1+DB2)/2 + 6.'};
 }
 if(sourceId==='sns:jutsu:hb-f05-mikazuki-no-mai'){
  return {mode:'attack:cc',cost:0,...equippedMeleeWeapon(actor,1),checks:[{key:'attribute:agi',label:'Finta com clones (+1) · Agilidade',adjustment:1}],useNote:'Finta com +1. Ataque corporal com espada (+1 DB; +2 DB se a finta vencer).'};
 }
 if(sourceId==='sns:jutsu:hb-f06-mikazuki-no-mai'){
  return {mode:'attack:cc',cost:5,...equippedMeleeWeapon(actor,1),multiAttack:true,useNote:'Investida com 2 clones (3 testes de acerto: 2 com −3 dos clones e 1 inteiro do usuário).'};
 }
 if(sourceId==='sns:jutsu:akurobatto'){
  return {mode:'attack:cc',cost:0,...equippedMeleeWeapon(actor,0),multiAttack:true,shape:'circle',size:3,useNote:'Ataques considerados Ataque Giratório (sem bônus de dano exceto Dano Extra).'};
 }
 if(sourceId==='sns:jutsu:avanco-ofensivo'){
  return {mode:'attack:cc',cost:0,...equippedMeleeWeapon(actor,1),gradeBonus:0.5,useNote:'Investida com ambas as armas Jashin (+1 DB, +0,5 grau). Defesa bem-sucedida aplica Defesa Debilitada −2.'};
 }
 if(sourceId==='sns:jutsu:pontos-vitais'){
  return {mode:'attack:cc',cost:0,...equippedMeleeWeapon(actor,0),gradeMinimum:2,useNote:'Ataque em si mesmo durante Ritual de Conexão (mínimo grau 2 + 1 nível de sangramento).'};
 }
 if(sourceId==='sns:jutsu:tentaculo-de-fios'){
  const occ=recordedSkill(actor,'ocultismo'),cost=Number.isInteger(occ)?Math.ceil(occ/2):null;
  const str=effectiveAttribute(actor,'for','unarmed'),base=Number.isInteger(str)?Math.ceil(str/2)+3:null;
  return {mode:'attack:cc',...(cost!==null?{cost}:{}),base,damageNature:'lethal',attackKind:'melee',weaponClass:'Especial',...(Number.isInteger(occ)?{range:(10+occ)+' m'}:{}),useNote:'Tentáculo de fios (arma especial, esmagamento). Permite agarrar, derrubar, empurrar e perseguir.'};
 }

 // Toque / Bijuu / Clãs / Genjutsu / Ninjutsu ofensivos
 if(sourceId==='sns:jutsu:sangosho'){
  return {mode:'attack:cc',cost:0,base:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',useNote:'Ataque de toque no Modo Bijuu: sem dano, deixa o alvo Lento e Debilitado.'};
 }
 if(sourceId==='sns:jutsu:tsunoori'){
  const str=effectiveAttribute(actor,'for','unarmed'),base=Number.isInteger(str)?Math.ceil(str/2)+6:null;
  return {mode:'attack:cc',cost:4,base,damageNature:'lethal',attackKind:'melee',weaponClass:'Desarmado',useNote:'Atropelar com chifres (Dano de Arma 6). Alvo faz Vigor Dif (2 + CC) ou cai.'};
 }
 if(sourceId==='sns:jutsu:kagenade'){
  return {mode:'attack:cc',cost:1,...unarmedTechniqueDamage(actor,0),useNote:'Segue as regras de Nikudan Hari Sensha na Forma Bijuu.'};
 }
 if(sourceId==='sns:jutsu:po-de-prata'){
  const j=findPower(actor,'sns:power:jinchuuriki')?.system?.level??level??2;
  return {mode:'attack:cd',cost:0,base:0,noDamage:true,attackKind:'area',allowedDefenses:['block'],shape:'circle',size:2*j,useNote:'Não permite Esquiva nem Antecipar. Atingidos testam Vigor Dif '+(8+2*j)+' ou ficam Cegos.'};
 }
 if(sourceId==='sns:jutsu:rede-de-fios'){
  const j=findPower(actor,'sns:power:jinchuuriki')?.system?.level??level??6;
  return {mode:'attack:cd',cost:0,base:0,noDamage:true,attackKind:'area',shape:'circle',size:j,useNote:'Atingidos que falharem na defesa ficam Impedidos (dureza dos fios '+(2*j)+').'};
 }
 if(sourceId==='sns:jutsu:tornado-do-polvo'){
  const j=findPower(actor,'sns:power:jinchuuriki')?.system?.level??level??10;
  return {mode:'attack:cd',cost:j+2,base:2*j,attackKind:'area',shape:'circle',size:4*j,useNote:'Como Onda de Chakra na Forma Bijuu com o dobro da área (Vigor Dif '+(6+2*j)+').'};
 }
 if(sourceId==='sns:jutsu:senro'){
  return {mode:'attack:cc',cost:1,base:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',useNote:'Ataque de toque para prender kikaichuu fêmea no alvo (rastreável até 50 m).'};
 }
 if(sourceId==='sns:jutsu:keiyaku-fuuin'){
  return {mode:'attack:cc',cost:8,base:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',useNote:'Ataque de toque para cancelar o controle de Hipnose Sharingan sobre uma Bijuu.'};
 }
 if(sourceId==='sns:jutsu:sojasosai-no-jutsu'){
  return {mode:'attack:cc',cost:10,base:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',useNote:'Ataque CC para agarrar a mão do alvo; concluído após 2 rodadas.'};
 }
 if(sourceId==='sns:jutsu:hb-f06-sojasosai-no-jutsu'){
  return {mode:'attack:cc',cost:15,base:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',useNote:'1ª rodada: CC para agarrar; 2ª rodada: morte mútua se o agarramento persistir.'};
 }
 if(sourceId==='sns:jutsu:engolimento'){
  return {mode:'attack:cc',cost:0,base:0,noDamage:true,attackKind:'melee',weaponClass:'Desarmado',useNote:'Manobra Agarrar furtiva ao emergir do solo; confina alvos menores.'};
 }
 if(sourceId==='sns:jutsu:hipnose-sharingan'){
  const intAttr=effectiveAttribute(actor,'int');
  return {mode:'save',cost:5,base:0,noDamage:true,saveKeys:['attribute:int'],...(Number.isInteger(intAttr)?{dc:8+intAttr}:{}),useNote:'Ilusão mental do Sharingan (Dif 8 + INT).'};
 }
 if(sourceId==='sns:jutsu:tsukuyomi'){
  const intAttr=effectiveAttribute(actor,'int');
  return {mode:'save',cost:10,base:0,noDamage:true,saveKeys:['attribute:int'],...(Number.isInteger(intAttr)?{dc:11+intAttr}:{}),visionCost:2,useNote:'Modo Torturador: Inteligência Dif 11 + INT.'};
 }
 if(sourceId==='sns:jutsu:hb-f06-gomon-heya'){
  const intAttr=effectiveAttribute(actor,'int'),magen=findPower(actor,'sns:power:magen')?.system?.level??findPower(actor,'sns:power:genjutsu')?.system?.level??level??6;
  return {mode:'save',cost:6,base:0,noDamage:true,saveKeys:['attribute:int'],...(Number.isInteger(intAttr)?{dc:12+magen+Math.ceil(intAttr/2)}:{}),useNote:'Tortura ilusória (Inteligência Dif 12 + Nível + ⌈INT/2⌉). Usuário fica Desprevenido contra adjacentes.'};
 }
 if(sourceId==='sns:jutsu:hb-f06-reika-no-jutsu'){
  const esp=effectiveAttribute(actor,'esp');
  return {mode:'save',...(Number.isInteger(esp)?{cost:Math.ceil(esp/2),dc:7+esp}:{}),base:0,noDamage:true,saveKeys:['attribute:vig'],useNote:'Alvo Impedido/Agarrado/Atordoado/Indefeso faz Vigor Dif 7 + ESP.'};
 }
 if(sourceId==='sns:jutsu:onsei-sousa'){
  const ototon=findPower(actor,'sns:power:ototon')?.system?.level??1,arte=recordedSkill(actor,'arte')??0;
  return {mode:'save',cost:1,base:0,noDamage:true,saveKeys:['attribute:int'],dc:9+ototon+Math.ceil(arte/2),useNote:'Ouvintes fazem Inteligência para perceber som artificial.'};
 }
 if(sourceId==='sns:jutsu:akumu-no-kyuin'){
  const esp=effectiveAttribute(actor,'esp'),intAttr=effectiveAttribute(actor,'int'),cost=Number.isInteger(esp)?Math.ceil(esp/2)+4:null,sizeAttr=Math.max(Number.isInteger(esp)?esp:0,Number.isInteger(intAttr)?intAttr:0);
  return {mode:'save',...(cost!==null?{cost}:{}),base:0,noDamage:true,saveKeys:['attribute:for','skill:escapar'],...(Number.isInteger(esp)?{dc:8+esp}:{}),shape:'cone',...(sizeAttr>0?{size:10+sizeAttr}:{}),useNote:'Força ou Escapar Dif 8 + ESP ou cai por 1 turno; eleva Fuuton/Katon a grau mínimo 2.'};
 }
 if(sourceId==='sns:jutsu:dokugiri'){
  const intAttr=effectiveAttribute(actor,'int'),ven=recordedSkill(actor,'veneficio'),kuch=findPower(actor,'sns:power:kuchiyose')?.system?.level??6;
  return {mode:'save',cost:5,base:0,noDamage:true,saveKeys:['attribute:vig'],...(Number.isInteger(ven)?{dc:7+ven}:Number.isInteger(intAttr)?{dc:9+kuch+Math.ceil(intAttr/2)}:{}),shape:'cone',...(Number.isInteger(intAttr)?{size:intAttr}:{}),useNote:'Cone venenoso da Salamandra (Vigor contra o veneno).'};
 }
 if(sourceId==='sns:jutsu:mushidama'){
  const linked=linkedPowerValues(item,sourceId,'sns:power:kikai-ninpou',4,level,actor,library);
  return linked?{mode:'attack:cd',cost:linked.lvl,base:linked.values.common,range:linked.values.range+' m',useNote:'Segue Sopro Destrutivo de Kikai Ninpou e drena chakra.'}:{mode:'attack:cd',useNote:'Segue Sopro Destrutivo de Kikai Ninpou.'};
 }
 if(sourceId==='sns:jutsu:daijurin-no-jutsu'){
  const linked=linkedPowerValues(item,sourceId,'sns:power:mokuton',2,level,actor,library);
  return linked?{mode:'attack:cd',cost:linked.lvl,base:linked.values.common,range:linked.values.range+' m',useNote:'Segue o efeito Raio de Mokuton.'}:{mode:'attack:cd',useNote:'Segue o efeito Raio de Mokuton.'};
 }
 if(sourceId==='sns:jutsu:hb-f05-suiryuudan-no-jutsu'){
  const linked=linkedPowerValues(item,sourceId,'sns:power:suiton',6,level,actor,library);
  return linked?{mode:'attack:cd',cost:linked.lvl,base:linked.values.common,range:linked.values.range+' m',gradeBonus:0.5,shape:'ray',size:linked.values.range,useNote:'Segue Míssil de Suiton com Técnica Poderosa (+0,5 grau e testes extras de ataque).'}:{mode:'attack:cd',gradeBonus:0.5,shape:'ray',useNote:'Segue Míssil de Suiton com Técnica Poderosa.'};
 }

 return null;
}
