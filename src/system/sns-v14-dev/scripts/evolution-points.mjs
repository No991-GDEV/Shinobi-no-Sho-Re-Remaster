import {initialPointProposal} from './initial-grants.mjs';
// Diferenças da tabela D031, não uma quantidade fixa por NC (19→20 é especial).
export function evolutionPointProposal(system,targetNc){
 const old=initialPointProposal(system.nc);initialPointProposal(targetNc);
 if(targetNc<=system.nc)return [];
 const ids=new Set((system.budgets?.grants??[]).map(g=>g.id));
 const entries=[];
 for(let nc=system.nc+1;nc<=targetNc;nc++){
  const a=initialPointProposal(nc-1),b=initialPointProposal(nc);
  for(const category of Object.keys(old)){
   const id='nc:'+nc+':'+category,amount=b[category]-a[category];
   if(amount>0&&!ids.has(id))entries.push({id,category,amount,note:'Evolução NC '+(nc-1)+' → '+nc});
  }
 }
 return entries;
}
