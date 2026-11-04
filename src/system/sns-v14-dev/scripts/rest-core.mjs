// Básico 4.1b pp.259–260; D078/D080. No inferred recovery from names or prose.
const ns='sns-v14-dev';
export const REST_LABEL='Descanso completo · 8 horas';
export function restRecovery(actor,{prolongedCare=false}={}){
 if(!['shinobi','npc','companion'].includes(actor?.type))throw Error('Esta ficha não utiliza descanso de personagem.');
 const {vig,esp}=actor.system.attributes??{},v=actor.system.resources?.vitality,c=actor.system.resources?.chakra;
 if(![vig,esp,v?.value,v?.max,c?.value,c?.max].every(Number.isSafeInteger)||vig<0||esp<0||v.max<0||c.max<0)throw Error('Informe Vigor, Espírito e os valores atuais e máximos de Vitalidade e Chakra antes de descansar.');
 const metabolism=Array.from(actor.items??[]).some(i=>i.type==='aptitude'&&(i.system.ruleId||i.system.contentId)==='sns:apt:metabolismo-rapido');
 const vitality=(10+2*vig)*(metabolism?2:1)*(prolongedCare?2:1),chakra=(5+2*esp)*(metabolism?2:1);
 // Already over-cap values remain untouched. Rest is never a resource reduction.
 const gain=(current,max,amount)=>Math.max(0,Math.min(amount,max-current));
 return {vitality:{before:v.value,after:v.value+gain(v.value,v.max,vitality),gain:gain(v.value,v.max,vitality),recovery:vitality},chakra:{before:c.value,after:c.value+gain(c.value,c.max,chakra),gain:gain(c.value,c.max,chakra),recovery:chakra},metabolism,prolongedCare};
}
export function endsAtRest(item){
 const c=item.system?.appliedCondition,f=item.flags?.[ns]??{};if(!c?.managed||!c.active)return false;
 if(f.legadoEffect?.persistVision||f.legadoEffect?.permanent||f.legadoEffect?.kind==='incendiado')return false;
 if(f.environment?.permanent||f.support?.solid||f.advancedState?.kind==='venenoso'||f.advancedChild)return false;
 if(f.advancedState)return f.advancedState.kind==='dano-continuo';
 if(['scene','turns'].includes(c.durationRule?.mode))return true;
 return ['sns:condition:fatigado','sns:condition:exausto'].includes(item.system.contentId)&&!c.duration?.trim();
}
export function restBlock(actor){
 const state=actor.flags?.[ns]?.transformations;
 return state?.entries?.some(r=>r.playerLocked||r.domination?.phase==='lost')?'Resolva a disputa de controle da transformação antes de descansar.':'';
}
