const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function damageUpdateGuard(actor,changes,options,user){
 const expanded=foundry.utils.expandObject(changes),sys=expanded.system??{},flags=expanded.flags??{},ownFlags=flags['sns-v14-dev']??{},hasLog=!!actor.flags?.['sns-v14-dev']?.damageLedger;
 if(!user.isGM&&(Object.hasOwn(sys,'damageState')||Object.hasOwn(sys,'-=damageState')||Object.hasOwn(ownFlags,'damageLedger')||Object.hasOwn(ownFlags,'-=damageLedger')||hasLog&&['-=flags'].some(k=>Object.hasOwn(expanded,k))||hasLog&&(Object.hasOwn(flags,'-=sns-v14-dev')||Object.hasOwn(expanded,'-=system'))))return false;
 if(options.snsDamageOperation===true&&user.isGM)return true;
 const vital=sys.resources?.vitality??{},before=actor.system.resources?.vitality??{},changedVital=['value','temp'].some(k=>Object.hasOwn(vital,k)&&!same(vital[k],before[k]));
 const balances=rows=>Array.from(rows??[]).map(p=>[p.itemId,p.value,p.max]).sort((a,b)=>a[0].localeCompare(b[0]));
 const changedPool=Object.hasOwn(sys.damageState??{},'armorPools')&&!same(balances(sys.damageState.armorPools),balances(actor.system.damageState?.armorPools));
 if(changedVital||changedPool)changes['system.damageState.externalRevision']=(actor.system.damageState?.externalRevision??0)+1;
 return true;
}
