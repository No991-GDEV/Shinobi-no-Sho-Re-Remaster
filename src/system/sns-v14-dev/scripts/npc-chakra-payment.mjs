// The preview is not permission to spend a different resource state later.
export function npcChakraPayment(actor,plan){
 const current=actor.system.resources.chakra.value;
 if(!Number.isSafeInteger(current)||!Number.isSafeInteger(plan.cost)||plan.cost<0||current<plan.cost)throw Error('Chakra insuficiente. O cartão ficou pendente e nenhum recurso foi gasto.');
 if(plan.payment){const p=plan.payment;
  if(p.kind!=='souin'||!Number.isSafeInteger(p.before)||!Number.isSafeInteger(p.clones)||p.clones<0||p.after!==1||p.before!==current||current<1||current+p.clones<15||plan.cost!==current-1)throw Error('O chakra mudou ou não atende ao mínimo de 15 do selo. Abra um novo uso; nenhum recurso gasto.');
 }
 return current-plan.cost;
}
