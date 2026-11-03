import {EVOLUTION} from './rules.mjs';
import {initialPointProposal,INITIAL_POINT_LABELS} from './initial-grants.mjs';
const categories=Object.keys(INITIAL_POINT_LABELS);
const zero=()=>Object.fromEntries(categories.map(k=>[k,0]));
const totals=grants=>grants.reduce((a,g)=>{if(g.category in a)a[g.category]+=g.amount;return a;},zero());
const same=(a,b)=>categories.every(k=>a[k]===b[k]);
const baseId=/^nc-base:(\d+):(attributes|skills|powers|social)$/;
const stepId=/^nc:(\d+):(attributes|skills|powers|social)$/;
const initialId=/^initial:(attributes|skills|powers|social)$/;

// The current base carries an explicit NC in its ID. It can be projected onto
// another NC without positive-only deltas or guessing a level from human notes.
// Legacy initial/step records are read once; arbitrary GM grants stay separate.
export function progressionBudget(system,targetNc=system.nc){
 const target=initialPointProposal(targetNc),raw=system.budgets?.grants??[];
 if(!raw.length)return {grants:[],totals:zero(),extra:zero(),reference:target,legacy:false};
 const ids=new Set(),bases=[],initial=[],steps=[],manual=[];
 for(const g of raw){
  if(!g.id||ids.has(g.id))throw Error('Há concessões duplicadas ou sem identificação. Confira o histórico.');
  ids.add(g.id);
  if(!categories.includes(g.category)||!Number.isSafeInteger(g.amount)||g.amount<1)throw Error('Concessão inválida no orçamento da ficha.');
  const b=g.id.match(baseId),i=g.id.match(initialId),s=g.id.match(stepId);
  if(b){if(b[2]!==g.category)throw Error('Categoria inválida na base de NC.');bases.push({...g,nc:Number(b[1])});}
  else if(i){if(i[1]!==g.category)throw Error('Categoria inválida nos pontos iniciais.');initial.push(g);}
  else if(s){if(s[2]!==g.category)throw Error('Categoria inválida na evolução.');steps.push({...g,nc:Number(s[1])});}
  else manual.push({...g});
 }
 let anchor,amounts,extra=zero(),extras=manual;
 if(bases.length){
  anchor=bases[0].nc;if(bases.some(g=>g.nc!==anchor)||initial.length||steps.length)throw Error('Bases de progressão incompatíveis. Confira as concessões.');
  amounts=totals(bases);
 }else if(initial.length){
  amounts=totals(initial);
  // A legacy actor created at NC10 then lowered to NC4 may also have received
  // duplicate NC5..10 entries. Its exact initial table is the reliable anchor.
  anchor=EVOLUTION.find(r=>same(initialPointProposal(r.nc),amounts))?.nc??(steps.length?Math.min(...steps.map(g=>g.nc))-1:system.nc);
 }else{
  anchor=steps.length?Math.min(...steps.map(g=>g.nc))-1:system.nc;
  const reference=initialPointProposal(anchor),all=totals(manual);
  amounts=Object.fromEntries(categories.map(k=>[k,Math.min(all[k],reference[k])]));
  // Old arbitrary IDs may contain both the original budget and GM extras.
  // Split the table portion without discarding an extra or inventing points.
  const needed={...amounts};extras=[];
  for(const g of manual){const used=Math.min(needed[g.category],g.amount);needed[g.category]-=used;if(g.amount>used)extras.push({...g,amount:g.amount-used});}
 }
 const reference=initialPointProposal(anchor);
 for(const k of categories)extra[k]=amounts[k]-reference[k];
 for(const g of steps){
  initialPointProposal(g.nc);
  const amount=initialPointProposal(g.nc)[g.category]-initialPointProposal(g.nc-1)[g.category];
  if(g.amount!==amount)throw Error('A concessão '+g.id+' foi ajustada. O mestre precisa separar esse ajuste da progressão normal.');
  if(g.nc<=anchor)continue; // duplicate legacy ascent below the initial NC
 }
 const normalized=categories.flatMap(category=>{
  const amount=target[category]+extra[category];
  if(amount<0)throw Error('Os ajustes iniciais de '+INITIAL_POINT_LABELS[category]+' não permitem esse NC. Confira a concessão do mestre.');
  return amount?[{id:'nc-base:'+targetNc+':'+category,category,amount,note:'Orçamento de NC '+targetNc+(extra[category]?' · ajuste inicial '+(extra[category]>0?'+':'')+extra[category]:'')}]:[];
 });
 const grants=[...normalized,...extras];
 return {grants,totals:totals(grants),extra:totals(extras),reference:target,legacy:!bases.length,initialAdjustments:extra};
}

export function progressionChanges(before,after){
 return categories.map(category=>({category,label:INITIAL_POINT_LABELS[category],before:before[category],after:after[category],delta:after[category]-before[category]})).filter(r=>r.delta!==0).map(r=>({...r,amount:Math.abs(r.delta),increase:r.delta>0,signed:(r.delta>0?'+':'−')+Math.abs(r.delta)}));
}
