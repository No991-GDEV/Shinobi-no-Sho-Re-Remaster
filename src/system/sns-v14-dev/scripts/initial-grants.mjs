import {EVOLUTION} from './rules.mjs';
export const INITIAL_POINT_LABELS={attributes:'Atributos',skills:'Perícias',powers:'Poderes',social:'Sociais'};
export function initialPointProposal(nc){
 const row=EVOLUTION.find(r=>r.nc===nc);
 if(!row)throw Error('NC inválido para a distribuição inicial.');
 return {attributes:row.atributos,skills:row.pericias,powers:row.poderes_basico,social:row.sociais_genin_e_superiores};
}
export function initialGrants(values,note,current=[]){
 if(current.length)throw Error('Já existem concessões nesta ficha. Use as concessões por categoria para ajustes posteriores.');
 if(typeof note!=='string'||!note.trim())throw Error('Informe o motivo da concessão.');
 const entries=Object.keys(INITIAL_POINT_LABELS).map(category=>{
  const amount=values[category];
  if(!Number.isInteger(amount)||amount<0)throw Error('Use quantidades inteiras não negativas.');
  return {id:'initial:'+category,category,amount,note:note.trim()};
 }).filter(g=>g.amount>0);
 if(!entries.length)throw Error('Informe pelo menos uma quantidade positiva.');
 return entries;
}
