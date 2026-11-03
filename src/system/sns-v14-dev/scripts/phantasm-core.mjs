// Básico 4.1b, pp.233–237. External illusions live on their user, not in the observer's body.
export const phantasmData=item=>item?.flags?.['sns-v14-dev']?.phantasm;
export const activePhantasms=actor=>Array.from(actor?.items??[]).filter(i=>phantasmData(i)&&i.system.appliedCondition?.active);
export const unusedSpeedPhantasms=actor=>activePhantasms(actor).filter(i=>phantasmData(i).effectId.endsWith(':falsa-velocidade')&&!phantasmData(i).usedAttackUuid);
export const speedUsedThisRound=(actor,combat)=>!!combat?.started&&Object.values(actor?.flags?.['sns-v14-dev']?.phantasmActivations??{}).some(r=>r.effectId==='sns:effect:falsa-velocidade'&&r.combatId===combat.id&&r.round===combat.round);
export const phantasmKey=uuid=>uuid.replaceAll('.','~');
export function phantasmProjection({actor,power,effect,choices,usedLevel,problems=[]}){
 const speed=effect.id.endsWith(':falsa-velocidade'),stage=Math.max(effect.min,...choices.filter(c=>c.effectId===effect.id&&c.stage<=usedLevel).map(c=>c.stage)),int=actor.system.attributes?.int;
 const blind=Array.from(actor.items??[]).some(i=>i.system.ruleId==='sns:apt:ponto-cego'||i.system.contentId==='sns:apt:ponto-cego');
 const cost=speed?2:stage,difficulty=9+power.system.level+Math.ceil((int??0)/2),data={action:speed?(blind?'Padrão ou movimento (Ponto Cego)':'Padrão'):'Padrão',chakraCost:String(cost),range:'Pessoal',target:'O usuário',duration:speed?'Até o final do seu turno':'Sustentada',damage:'Nenhum',difficulty,defenses:'Observador: Notar Genjutsu ao interagir',seals:'Ilusão externa',test:''};
 return {valid:!problems.length,problems,noRoll:true,cost,usedLevel,data,effect,power:power.system.power,traits:['arte:genjutsu','custo:chakra'],phantasm:{effectId:effect.id,stage,cost,difficulty,threshold:speed?0:stage>=7?4:2},formulas:{chakraCost:speed?'2 por uso':'Estágio do efeito',difficulty:'9 + nível total de Magen + ⌈INT/2⌉'},provenance:Object.fromEntries(Object.keys(data).map(k=>[k,'regra do efeito']))};
}
export function observerMemory(actor,effectId){const m=actor?.flags?.['sns-v14-dev']?.phantasmMemory?.[effectId.split(':').at(-1)];return m?.epoch===(actor?.flags?.['sns-v14-dev']?.magenScene??0)?m:null;}
export function observationPlan(meta,observer,{vision=false,afterHit=false}={}){
 const prior=meta.observers?.[phantasmKey(observer.uuid)],speed=meta.effectId.endsWith(':falsa-velocidade');
 if(vision)return {automatic:true,noticed:true,reason:'Visão de chakra: Fantasma identificado automaticamente.'};
 if(prior?.noticed)return {automatic:true,noticed:true,reason:'Ilusão já reconhecida.'};
 if(!prior&&observerMemory(observer,meta.effectId))return {automatic:true,noticed:true,reason:'Este efeito já enganou o observador nesta cena.'};
 if(prior&&!speed&&!afterHit)return {automatic:true,noticed:false,threshold:meta.threshold};
 if(prior&&speed)return {automatic:true,noticed:prior.noticed,fintado:!prior.noticed};
 const attempts=prior?.attempts??0;
 return {automatic:false,difficulty:meta.difficulty-1-attempts+(observer.flags?.['sns-v14-dev']?.magenCapanga?3:0),attempts};
}
export function phantasmDefenseEffects(context){return context?.fintado?[{kind:'condition',key:'fintado',scope:'defenses',degree:2,sourceName:'Falsa Velocidade · Fintado',sourceId:'phantasm'}]:[];}
export function phantasmVisualOutcome(attack,criticalAt,threshold,natural){
 if(![2,4].includes(threshold))return 'clear';
 if(attack?.natural<=3)return 'attackFailure';if(attack?.natural>=criticalAt)return 'critical';
 if(!Number.isInteger(natural)||natural<1||natural>8)return 'pending';return natural<=threshold?'miss':'clear';
}
export const mayEditPhantasm=(before,after,isGM)=>isGM||JSON.stringify(phantasmData(before))===JSON.stringify(phantasmData(after))&&(!phantasmData(before)||JSON.stringify(before.system)===JSON.stringify(after.system));
export const mayEditPhantasmActor=(before,after,isGM)=>isGM||['phantasmMemory','phantasmActivations'].every(k=>JSON.stringify(before.flags?.['sns-v14-dev']?.[k])===JSON.stringify(after.flags?.['sns-v14-dev']?.[k]));
