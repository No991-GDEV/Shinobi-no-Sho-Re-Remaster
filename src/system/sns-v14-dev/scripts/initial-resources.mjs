export function initialResourcePatch(actor,derived,{creation=false,fill=false}={}){
 const patch={};if(!creation||!fill||actor.system.phase!=='creation')return patch;
 for(const [key,max]of [['vitality',derived.vitalityMax],['chakra',derived.chakraMax]])if(actor.system.resources[key].value===null&&Number.isSafeInteger(max)&&max>=0)patch['system.resources.'+key+'.value']=max;
 return patch;
}
