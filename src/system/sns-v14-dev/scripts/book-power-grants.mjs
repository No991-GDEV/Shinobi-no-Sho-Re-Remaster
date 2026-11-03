// Intrinsic book benefits. No manual/free acquisition authorization is fabricated.
export const BOOK_POWER_GRANTS=Object.freeze({mokuton:['doton','suiton'],hyouton:['fuuton','suiton'],sakin:['fuuton','doton'],satetsu:['fuuton','doton'],bakuton:['doton','raiton'],jinton:['doton','fuuton','katon'],futton:['katon','suiton'],shakuton:['katon','fuuton'],shouton:['doton'],yoton:['doton','katon']});
const ns='sns-v14-dev',id=i=>i?.system?.contentId;
export function bookGrantLabel(item){
 const grant=item.flags?.[ns]?.bookPowerGrant;
 if(!grant)return '';
 const source=Array.from(item.actor?.items??[]).find(i=>(i.id??i._id)===grant.sourceId);
 return source?.name?'Concedido por '+source.name:'';
}
export function bookGrantSources(items,element){return Array.from(items??[]).filter(i=>i.type==='power'&&Number.isSafeInteger(i.system.level)&&i.system.level>=1&&BOOK_POWER_GRANTS[id(i)?.replace('sns:power:','')]?.includes(element));}
export function bookPowerDiscount(item,items){const element=id(item)?.replace('sns:power:',''),jiongu=Array.from(items??[]).find(i=>i.type==='power'&&id(i)==='sns:power:jiongu'),hearts=(jiongu?.flags?.[ns]?.jionguHearts??[]).slice(0,[1,2,4,6,8].filter(n=>n<=jiongu?.system.level).length);return item?.type==='power'&&Number.isSafeInteger(item.system.level)&&item.system.level>0&&(bookGrantSources(items,element).length||hearts.includes(element))?1:0;}
export function materializeBookPowerGrants(items,copy,cap){
 for(const source of [...items])for(const element of BOOK_POWER_GRANTS[id(source)?.replace('sns:power:','')]??[]){
  let target=items.find(i=>i.type==='power'&&id(i)==='sns:power:'+element);
  if(!target){target=copy('sns:power:'+element);target._id='bg'+String(items.length+1).padStart(14,'0');target.system.level=1;target.flags??={};target.flags[ns]??={};target.flags[ns].acquisition={mode:'paid'};items.push(target);}
  const previous=target.flags?.[ns]?.bookPowerGrant;
  if(id(source)==='sns:power:jinton'&&!previous&&target.system.level>1)target.system.level=Math.min(cap,target.system.level+1);
  target.flags??={};target.flags[ns]??={};target.flags[ns].bookPowerGrant={sourceId:source._id??source.id,sourceContentId:id(source),element};
 }
 return items;
}
export function resolveBookCanhao(item){
 const grant=item.flags?.[ns]?.bookCanhao;if(!grant)return null;
 const source=item.actor.items.get(grant.sourceId),parent=item.actor.items.get(item.system.details?.powerId),element=id(parent)?.replace('sns:power:','');
 if(!source||!parent||item.system.jutsu?.effectId!=='sns:effect:canhao'||!BOOK_POWER_GRANTS[id(source)?.replace('sns:power:','')]?.includes(element)||parent.system.level<1)throw Error('A origem deste Canhão concedido está ausente.');
 return {source,max:Math.max(source.system.level,parent.system.level)};
}
