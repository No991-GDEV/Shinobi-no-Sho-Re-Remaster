import {legadoState,legadoId,legadoItems,legadoSusanoo,spendLegadoVision,transitionLegadoSusanoo} from './legado-core.mjs';
const ns='sns-v14-dev';
export function legadoPayment(actor,plan,{receiptKey='',worldTime=0,turnKey=''}={}){
 if(!plan.legado)return {patch:{},states:[],spent:0};
 const before=legadoState(actor);if(receiptKey&&before.receipts?.[receiptKey])return {duplicate:true,patch:{},states:[],spent:0};
 let state=structuredClone(before);const {key,mode,params={}}=plan.legado,states=[];
 const chakra=actor.system.resources?.chakra?.value,vitality=actor.system.resources?.vitality?.value;
 if(!Number.isSafeInteger(chakra)||chakra<plan.cost)throw Error('Chakra atual desconhecido ou insuficiente.');
 const vision=spendLegadoVision(actor,plan.visionCost??0);if(vision.vitalityLoss&&!Number.isInteger(vitality))throw Error('Informe a Vitalidade antes de gastar visão.');
 if(plan.legado.susanooTransition)state=transitionLegadoSusanoo(actor,mode,params.stage??1,turnKey).state;
 state.vision=vision.vision;states.push(...vision.states);
 const patch={'system.resources.chakra.value':chakra-plan.cost};
 if(vision.vitalityLoss)patch['system.resources.vitality.value']=vitality-vision.vitalityLoss;
 const scene=actor.flags?.[ns]?.magenScene??0,once=state.once??{},day=Math.floor(worldTime/86400),onceKey=key+'~'+mode+'~'+(['misericordia'].includes(mode)?'day'+day:'scene'+scene);
 if(['falsa-morte','misericordia','revitalizar','restabelecer'].includes(mode)){
  if(once[onceKey])throw Error('Este uso já foi realizado '+(mode==='misericordia'?'hoje.':'nesta cena.'));state.once={...once,[onceKey]:true};
 }
 state.active??={};
 if(['encerrar','tangivel'].includes(mode)){delete state.active[key];if(key==='susanoo'&&state.susanoo)state.susanoo.active=false;if(key==='hachiman')for(const name of Object.keys(state.active))if(name.startsWith('hachiman-'))delete state.active[name];}
 else if(plan.legado.state||plan.legado.fortune){state.active[plan.legado.fortune?key+'-fortune':key]={...(state.active[key]??{}),mode:['manter','sustentar'].includes(mode)?state.active[key]?.mode??mode:mode,itemId:plan.legado.itemId??'',at:worldTime,turns:['manter','sustentar'].includes(mode)?(state.active[key]?.turns??0)+1:0,castUuid:(['manter','sustentar'].includes(mode)?state.active[key]?.castUuid:null)??(/^[a-zA-Z0-9]{16}$/.test(receiptKey)?'ChatMessage.'+receiptKey:''),turnKey,...(plan.legado.damageBonus?{damageBonus:plan.legado.damageBonus}:{}),...(plan.legado.expiresSeconds?{expires:worldTime+plan.legado.expiresSeconds}:{}),...(plan.legado.fortune?{fortune:plan.legado.fortune}:{}),...(['mahikami'].includes(key)?{sustained:mode==='sustentar'}:{})};}
 if(key==='hachiman'&&mode==='ativar'){
  for(const name of Object.keys(state.active))if(!['hachiman','hachiman-ketsuyoko'].includes(name))delete state.active[name];if(state.susanoo)state.susanoo.active=false;
 }
 if(key==='kamui-curto-alcance'&&mode==='objetos')state.kamuiStock=(state.kamuiStock??0)+params.count;
 if(key==='kamui-curto-alcance'&&mode==='expelir'){if((state.kamuiStock??0)<params.count)throw Error('Não há compartimentos suficientes na dimensão Kamui.');state.kamuiStock-=params.count;}
 if(key==='kisshouten'&&mode==='misericordia')patch['system.resources.vitality.value']=actor.system.attributes.vig;
 if(key==='yata-no-kagami'&&mode==='elemento')state.yataElement=params.element;
 if(key==='yomotsu-okami'){
  const s=state.susanoo??{},amount=s.yomi??0;
  if(mode==='absorver')s.yomi=Math.min(20,amount+params.amount);
  if(mode==='constituicao'){s.yomi=amount-2;s.yomiHardness=(s.yomiHardness??0)+1;s.yomiHardnessTurn=turnKey;}
  if(mode==='escudo'){s.yomi=amount-10;s.yomiHardness=actor.system.attributes.esp-(legadoSusanoo(actor)?.profile.hardness??0);s.yomiShield=true;}
  if(mode==='revitalizar'){const hp=patch['system.resources.vitality.value']??vitality,max=actor.system.resources.vitality.max;if(!Number.isInteger(hp)||!Number.isInteger(max))throw Error('Informe Vitalidade atual/máxima.');patch['system.resources.vitality.value']=Math.min(max,hp+2*amount);s.yomi=0;}
  if(mode==='restabelecer'){if(!s.destroyed)throw Error('O Susano’o precisa ter sido destruído neste turno.');s.active=true;s.destroyed=false;s.value=Math.ceil((legadoSusanoo({...actor,flags:{...actor.flags,[ns]:{...actor.flags?.[ns],legado:{...state,susanoo:{...s,active:true}}}}})?.max??0)/2);s.yomi=0;}
  state.susanoo=s;
 }
 if(state.vision)state.vision.restDays=0;
 if(plan.legado.endSusanoo){if(state.susanoo)state.susanoo.active=false;state.susanooCooldown=3;states.push('indra-fatigue');}
 if(vision.forced){state.active={};if(state.susanoo)state.susanoo.active=false;patch['system.activeAptitudes']=Array.from(actor.system.activeAptitudes??[]).map(r=>['sharingan','legado-sharingan','transplanted'].includes(r.rule)?{...r,active:false}:r);}
 const source=legadoItems(actor).find(i=>legadoId(i)==='sns:legado:apt:mangekyo-sharingan');
 if(source){const rows=structuredClone(Array.from(actor.system.specialResources??[])),r=rows.find(r=>r.kind==='vision'&&r.sourceId===source.id);if(r)r.value=vision.vision.value;else rows.push({id:'grant-'+source.id+'-vision',sourceId:source.id,kind:'vision',value:vision.vision.value,history:[]});patch['system.specialResources']=rows;}
 if(receiptKey)state.receipts={...state.receipts,[receiptKey]:{cost:plan.cost,vision:vision.spent,vitality:vision.vitalityLoss,key,mode,worldTime}};
 patch['flags.'+ns+'.legado']=state;
 return {patch,states,spent:vision.spent,forced:vision.forced,state};
}
