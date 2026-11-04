import {validateLegadoPair,validateLegadoWeapons} from './legado-core.mjs';
const ns='sns-v14-dev',state=x=>x?.flags?.[ns]?.legado??{},flags=x=>x?.flags?.[ns]??{};
export function mayEditLegadoActor(before,after,isGM,{customEyes=false}={}){
 if(isGM)return true;
 const sources=new Set(Array.from(before.items??[]).filter(i=>i.system?.contentId==='sns:legado:apt:mangekyo-sharingan').map(i=>i._id??i.id));
 const vision=x=>Array.from(x.system?.specialResources??[]).filter(r=>r.kind==='vision'&&sources.has(r.sourceId));if(JSON.stringify(vision(before))!==JSON.stringify(vision(after)))return false;
 if(JSON.stringify(state(before))===JSON.stringify(state(after)))return true;
 const a=state(before),b=state(after),choices=new Set(['pair','customPair','events','weapons','tormenta','visionRestDays']);
 for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(!choices.has(k)&&JSON.stringify(a[k])!==JSON.stringify(b[k]))return false;
 if((a.visionRestDays??7)!==(b.visionRestDays??7))return false;
 try{validateLegadoPair(b.customPair?.length?b.customPair:b.pair,{custom:customEyes});validateLegadoWeapons(b.weapons);}catch{return false;}
 if((a.susanooUnlocked??1)>=3&&a.weapons&&JSON.stringify(a.weapons)!==JSON.stringify(b.weapons))return false;
 if(!Array.isArray(b.tormenta)||b.tormenta.length>2||new Set(b.tormenta).size!==b.tormenta.length||b.tormenta.some(v=>typeof v!=='string'||!v.startsWith('sns:effect:')))return false;
 if(!b.events||Object.keys(b.events).some(k=>!['trauma','price','transplant'].includes(k)||typeof b.events[k]!=='boolean'))return false;
 return true;
}
export function mayEditLegadoItem(before,after,isGM){
 if(isGM)return true;const a=flags(before),b=flags(after),keys=['legadoCopy','legadoMemory','legadoGrant','legadoMechanics','optionalSource','legadoEffect'];
 if(keys.some(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])))return false;
 if(!a.legadoCopy&&!a.legadoMemory)return true;
 return ['contentId','ruleId','power','jutsu','details','level','choice','appliedCondition','targetEffects'].every(k=>JSON.stringify(before.system?.[k])===JSON.stringify(after.system?.[k]));
}
