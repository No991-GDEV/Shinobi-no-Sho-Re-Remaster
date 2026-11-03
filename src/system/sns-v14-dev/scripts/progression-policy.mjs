import {initialGrants,initialPointProposal} from './initial-grants.mjs';
import {progressionBudget,progressionChanges} from './progression-budget.mjs';
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));

// A normal owner operation uses exactly the published table and the existing
// grant identifiers. Arbitrary grants and legacy overrides remain GM tools.
export function standardProgression(system,targetNc){
 if(!Number.isInteger(targetNc))throw Error('Informe um NC inteiro entre 4 e 20.');
 const values=initialPointProposal(targetNc),existing=system.budgets?.grants??[];
 const initial=!existing.length&&system.phase==='creation';
 if(!existing.length&&!initial)throw Error('Defina os pontos iniciais no assistente de criação.');
 const start=initial?{...system,nc:targetNc,budgets:{...system.budgets,grants:initialGrants(values,'Pontos iniciais · NC '+targetNc)}}:system;
 const next=progressionBudget(start,targetNc),current=initial?{attributes:0,skills:0,powers:0,social:0}:progressionBudget(system).totals;
 const changes=progressionChanges(current,next.totals),added=changes.filter(r=>r.increase),removed=changes.filter(r=>!r.increase);
 return {nc:targetNc,initial,added,removed,changes,grants:next.grants,reference:next.reference,extra:next.extra,lowering:targetNc<system.nc};
}

export function standardProgressionUpdate(system,targetNc){
 const proposal=standardProgression(system,targetNc);
 return {...proposal,update:{'system.nc':targetNc,...(!same(system.budgets?.grants??[],proposal.grants)?{'system.budgets.grants':proposal.grants}:{})}};
}

export function progressionHistory(actor,proposal,user,at=new Date().toISOString()){
 if(actor.system.nc===proposal.nc&&same(actor.system.budgets?.grants??[],proposal.grants))return {};
 return {'flags.sns-v14-dev.progressionHistory':[...(actor.flags?.['sns-v14-dev']?.progressionHistory??[]),{from:actor.system.nc,to:proposal.nc,before:structuredClone(actor.system.budgets?.grants??[]),after:structuredClone(proposal.grants),user,at}]};
}

export function mayEditProgressionHistory(before,after,isGM,user){
 if(isGM)return true;
 const a=before.flags?.['sns-v14-dev']?.progressionHistory??[],b=after.flags?.['sns-v14-dev']?.progressionHistory??[];
 if(same(a,b))return true;
 if(!Array.isArray(a)||!Array.isArray(b)||b.length!==a.length+1||!same(a,b.slice(0,-1)))return false;
 const receipt=b.at(-1),old=before.system,next=after.system;
 if(same(old.nc,next.nc)&&same(old.budgets?.grants,next.budgets?.grants))return false;
 return receipt.from===old.nc&&receipt.to===next.nc&&receipt.user===user&&typeof receipt.at==='string'&&!Number.isNaN(Date.parse(receipt.at))&&same(receipt.before,old.budgets?.grants??[])&&same(receipt.after,next.budgets?.grants??[])&&mayApplyStandardProgression(old,next);
}

export function mayApplyStandardProgression(before,after){
 const a=before??{},b=after??{};
 if(same(a.nc,b.nc)&&same(a.phase,b.phase)&&same(a.budgets,b.budgets))return true;
 if(a.phase!==b.phase&&!(a.phase==='creation'&&b.phase==='evolution'))return false;
 const {grants:old=[],...oldBudget}=a.budgets??{},{grants:next=[],...nextBudget}=b.budgets??{};
 if(!same(oldBudget,nextBudget))return false;
 if(a.nc===b.nc&&same(old,next))return true;
 try{return same(standardProgression(a,b.nc).grants,next);}catch{return false;}
}
