// Básico p.89. Elemental combinations use their explicitly printed restrictions.
export const BASIC_NPC_ELEMENTS=['katon','suiton','doton','raiton','fuuton'];
const combinations={mokuton:['suiton','doton'],hyouton:['suiton','fuuton'],sakin:['fuuton','doton'],satetsu:['fuuton','doton'],bakuton:['doton','raiton'],jinton:['doton','fuuton','katon'],futton:['katon','suiton'],shakuton:['katon','fuuton'],shouton:['doton'],yoton:['doton','katon'],'hb-f05-kaiju-ninpou':['suiton'],'hb-f05-aoi-katon':['katon'],'kumo-ninpou':[]};
export function npcElementalRequirements(items){
 const powers=items.filter(i=>i.type==='power').map(i=>i.system.contentId?.replace('sns:power:','')),elements=[...new Set(powers.filter(p=>BASIC_NPC_ELEMENTS.includes(p)))],has=id=>items.some(i=>(i.system.ruleId||i.system.contentId)===id);
 const restrictions=powers.filter(p=>Object.hasOwn(combinations,p));
 const jiongu=items.find(i=>i.type==='power'&&i.system.contentId==='sns:power:jiongu');
 if(jiongu){const hearts=(jiongu.flags?.['sns-v14-dev']?.jionguHearts??[]).slice(0,[1,2,4,6,8].filter(n=>n<=jiongu.system.level).length);if(elements.some(e=>!hearts.includes(e)))throw Error('Jiongu exige um coração correspondente ao elemento comprado.');return {elements,minimumSpirit:0,source:'Jiongu · corações presentes'};}
 for(const power of restrictions){if(['futton','yoton'].includes(power)&&has('sns:apt:dupla-linhagem'))continue;const invalid=elements.filter(e=>!combinations[power].includes(e));if(invalid.length)throw Error('A restrição de '+power+' não permite '+invalid.join(', ')+'.');}
 if(restrictions.length)return {elements,minimumSpirit:0,source:'Restrição de elemento do poder'};
 const counted=elements.filter(e=>e!=='katon'||!has('sns:apt:elemento-natural-katon'));
 if(counted.length>2)throw Error('Mais de dois elementos básicos exige uma regra específica de afinidade.');
 return {elements,minimumSpirit:counted.length>1?10:0,source:'Básico 4.1b · p.89; Elemento Natural: Katon · p.180'};
}
