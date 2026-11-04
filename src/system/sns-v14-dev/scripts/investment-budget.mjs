import {powerInvestment} from './power-investment.mjs';
import {bookPowerDiscount} from './book-power-grants.mjs';
import {mayApplyStandardProgression} from './progression-policy.mjs';
// Básico p.58; catálogo B2 conferido; D043: 36 opções, três vagas.
export const FREE_APTITUDES=Object.freeze(new Set(('acuidade ataque-em-movimento combate-defensivo de-pe diligente especialista intuicao lutador lutar-as-cegas maestria mobilidade oportunista punho-de-ferro reflexos rolamento saque-rapido trespassar usar-arma velocista apanhar-objetos ataque-giratorio ataque-poderoso bloquear-arma derrubar-agressivo desarme-agressivo rasteira soco-agarrado voadora duro-de-matar engenheiro pericia-inata perito resistencia-maior fascinar miragem trabalho-duro').split(' ').map(id=>'sns:apt:'+id)));
export const acquisitionOf=item=>item?.flags?.['sns-v14-dev']?.acquisition??null;
const sys=item=>item?.system?.toObject?.()??item?.system??{};
export function freeEligible(item){const s=sys(item);return item?.type==='aptitude'&&FREE_APTITUDES.has(s.ruleId||s.contentId);}
export function investmentBudget(system,items=[]){
 const list=Array.from(items??[]).filter(i=>!i.flags?.['sns-v14-dev']?.legadoCopy).map(i=>({id:i.id??i._id,name:i.name,type:i.type,system:sys(i),flags:i.flags}));
 const result=powerInvestment(list,{legacySpent:system?.budgets?.powersSpent??0,isFreeEligible:item=>freeEligible(item)||acquisitionOf(item)?.freeAuthorization===true&&!!acquisitionOf(item)?.authorizedBy&&!!acquisitionOf(item)?.reason?.trim()});
 for(const row of result.rows){const item=list.find(i=>i.id===row.id),discount=row.known&&row.mode==='paid'?Math.min(row.cost,bookPowerDiscount(item,list)):0;if(discount){row.cost-=discount;result.spent-=discount;result.powerSpent-=discount;row.notes.push('1 nível concedido pelo poder de origem.');}}
 // Exceções individuais só valem após registro do mestre. A existência da origem
 // não autoriza uma concessão: é preciso o aceite explícito, com motivo.
 for(const row of result.rows){
  const a=acquisitionOf(list.find(i=>i.id===row.id));
  if(['granted','manual'].includes(a?.mode)&&(!a.authorizedBy||!a.reason?.trim())&&row.known){
   result.spent-=row.cost;if(row.type==='power')result.powerSpent-=row.cost;else result.aptitudeSpent-=row.cost;
   row.known=false;row.pending=true;row.notes.push('Somente o mestre pode conceder pontos extras.');result.pending.push(row.name+': '+row.notes.at(-1));
  }
 }
 const legacy=Number.isSafeInteger(result.legacySpent)&&result.legacySpent>0?result.legacySpent:0;
 const legacyPending=legacy>0&&!system?.budgets?.investmentReviewed;
 // Nunca somar legado+itens nem descartar silenciosamente o registro anterior.
 const spent=legacyPending?Math.max(legacy,result.spent):result.spent;
 const pending=[...result.pending];if(legacyPending)pending.push('Contador anterior de '+legacy+' PP: revise as aquisições antes de substituir o contador anterior.');
 return {...result,computedSpent:result.spent,spent,legacyPending,pending,complete:!pending.length&&!result.overflow};
}
export function acquisitionProblems(item,items=[]){
 const a=acquisitionOf(item);if(!['power','aptitude'].includes(item.type))return [];
 if(!a)return item.type==='aptitude'?['Escolha como esta aptidão foi adquirida.']:[];
 const list=Array.from(items).filter(i=>(i.id??i._id)!==(item.id??item._id));
 const candidate={...item,id:item.id??item._id??'new-acquisition',system:sys(item)};
 const result=investmentBudget({},[...list,candidate]),row=result.rows.find(r=>r.id===candidate.id);
 return row?.pending?row.notes:[];
}
export function mayEditAcquisition(before,after,isGM){
 if(isGM)return true;
 const a=acquisitionOf(before),b=acquisitionOf(after);
 if(JSON.stringify(a)===JSON.stringify(b))return true;
 if(['granted','manual'].includes(a?.mode)||a?.freeAuthorization)return false;
 if(!b||!['paid','free'].includes(b.mode))return false;
 return Object.keys(b).every(k=>['mode','user','at'].includes(k))&&(b.mode!=='free'||freeEligible(after));
}
export function mayEditBudgets(before,after,isGM){
 if(isGM)return true;
 return mayApplyStandardProgression(before?.system,after?.system);
}
export function mayCreateBudgets(data,isGM){
 if(isGM||data?.type!=='shinobi')return true;
 const s=data.system??{},b=s.budgets??{};
 if((s.nc!==undefined&&s.nc!==4)||(s.phase!==undefined&&s.phase!=='creation')||b.grants?.length||b.powersSpent||b.investmentReviewed)return false;
 return !(data.items??[]).some(i=>['granted','manual'].includes(acquisitionOf(i)?.mode)||acquisitionOf(i)?.authorizedBy||acquisitionOf(i)?.freeAuthorization);
}
