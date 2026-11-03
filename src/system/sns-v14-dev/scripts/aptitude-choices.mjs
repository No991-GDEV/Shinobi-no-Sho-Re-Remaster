import {EQUIPMENT_DEFINITIONS} from '../data/equipment-definitions.mjs';
import {SKILLS} from './rules.mjs';
import {ATTRIBUTES} from './kernel.mjs';
import {COMMON_APTITUDE_RULES,COMMON_APTITUDE_CHOICES} from '../data/common-aptitudes.mjs';
import {PACKAGE_ORIGINS} from '../data/package-content.mjs';
import {BOOK_TECHNIQUE_CHOICES} from '../data/related-content.mjs';
import {BOOK_WEAPON_CHOICES} from '../data/book-weapon-profiles.mjs';
import {effectiveRuleItem} from './jutsu-rule-text.mjs';
import {HIBON_BONUSES} from '../data/hibon-bonuses.mjs';
import {SPECIAL_WEAPON_CHOICES} from '../data/source-review-d165.mjs';
// Rule identity determines the allowed choices. Item prose never grants a rule.
const types={'sns:apt:perito':'skill','sns:apt:pericia-inata':'skill','sns:apt:resistencia-maior':'attribute','sns:power:versatilidade':'powerPair','sns:power:jinchuuriki':'bijuu','sns:power:kuchiyose':'summonSpecies','sns:power:hibon-ninpou':'hibonBonuses'};
const versatile=['doton','fuinjutsu','fuuton','katon','ninpou','raiton','suiton'];
const powerNames={doton:'Doton',fuinjutsu:'Fuuinjutsu',fuuton:'Fuuton',katon:'Katon',ninpou:'Ninpou',raiton:'Raiton',suiton:'Suiton'};
const summonOptions=Object.values(PACKAGE_ORIGINS).filter(p=>p.species).map(p=>({id:p.species,label:p.name.replace(/^Kuchiyose:\s*/, '')}));
export const choiceFieldLabel=kind=>({powerPair:'Par de poderes',bijuu:'Bijuu',summonSpecies:'Espécie de invocação',skill:'Perícia',attribute:'Atributo',weapon:'Arma',weaponClass:'Categoria de arma',damageCategory:'Categoria de dano',combatStyle:'Arma ou combate desarmado',shooter:'Forma de tiro',sensor:'Tipo de sensor',powerOrTechnique:'Poder ou técnica'}[kind]??(kind==='hibonBonuses'?'Bonificações do Hibon':'Escolha'));
export function aptitudeChoiceType(item){return types[item?.system?.ruleId]??types[item?.system?.contentId]??COMMON_APTITUDE_RULES[item?.system?.ruleId]?.choiceType??COMMON_APTITUDE_RULES[item?.system?.contentId]?.choiceType??'';}
export function aptitudeChoiceOptions(item){const kind=aptitudeChoiceType(item);return kind==='hibonBonuses'?HIBON_BONUSES:kind==='bijuu'?[{id:'shukaku',label:'Shukaku (Uma Cauda)'},{id:'kyuubi',label:'Kyuubi (Nove Caudas)'},{id:'gobi',label:'Gobi (Cinco Caudas)'}]:kind==='summonSpecies'?summonOptions:kind==='powerPair'?versatile.flatMap((id,n)=>versatile.slice(n+1).map(other=>({id:id+'|'+other,label:powerNames[id]+' / '+powerNames[other]}))):kind==='skill'?SKILLS.map(s=>({id:s.key,label:s.name})):kind==='attribute'?ATTRIBUTES.map(([id,,label])=>({id,label})):kind==='powerOrTechnique'?[...new Map([...(COMMON_APTITUDE_CHOICES.powerOrTechnique??[]),...BOOK_TECHNIQUE_CHOICES.filter(x=>!x.id.includes(':hb-'))].map(x=>[x.id,x])).values()]:kind==='weapon'?[...new Map([...(COMMON_APTITUDE_CHOICES.weapon??[]),...SPECIAL_WEAPON_CHOICES,...BOOK_WEAPON_CHOICES.filter(x=>['marcial','especial'].includes((EQUIPMENT_DEFINITIONS[x.id]?.training??x.training)))].map(x=>[x.id,x])).values()]:COMMON_APTITUDE_CHOICES[kind]??[];}
export function aptitudeChoiceStatus(item){
 item=effectiveRuleItem(item);
 const kind=aptitudeChoiceType(item),choice=item?.system?.choice,options=aptitudeChoiceOptions(item),found=options.find(o=>o.id===choice?.key);
 return {required:!!kind,kind,valid:!kind||choice?.kind===kind&&!!found,label:kind&&choice?.kind===kind?found?.label??'':'',key:choice?.key??''};
}
export function selectedAptitudeName(item){const choice=aptitudeChoiceStatus(item);return item.name+(choice.label?' · '+choice.label:'');}
