import {summonPower,summonLimit,suggestSummonAttributes,KUCHIYOSE_SPECIES,KUCHIYOSE_SIZES,summonProjection} from './kuchiyose-core.mjs';
export function generatedSummonBuild(master,species,count=1){
 const def=KUCHIYOSE_SPECIES[species];if(!def)throw Error('Espécie sem perfil de construção.');
 const power=summonPower(master,species),limit=summonLimit(master,species,{usedLevel:power.system.level,count});
 const size=def.fixedSize||'Médio',nc=Math.min(limit.maxNc,KUCHIYOSE_SIZES[size].max);
 const build={species,usedLevel:power.system.level,count,nc,size,attributes:suggestSummonAttributes(nc,species),bases:{cc:3,cd:3,esq:3,lm:3}};
 summonProjection(master,build);return build;
}
