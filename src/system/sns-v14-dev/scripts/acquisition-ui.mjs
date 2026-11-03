import {escapeHtml} from './kernel.mjs';
import {acquisitionOf,freeEligible,investmentBudget,acquisitionProblems} from './investment-budget.mjs';
import {kuchiyoseLink} from './kuchiyose-core.mjs';
const ns='sns-v14-dev';
export async function chooseAcquisition(actor,item){
 const a=acquisitionOf(item),budget=investmentBudget(actor.system,actor.items);
 const remaining=budget.freeLimit-budget.freeUsed+(a?.mode==='free'?1:0);
 const canFree=freeEligible(item)&&remaining>0;
 const options=[...(canFree?[['free','Escolha gratuita · '+remaining+' vaga(s) disponível(is)']]:[]),...(!canFree&&game.user.isGM&&remaining>0?[['free-gm','Gratuita · liberação individual do mestre']]:[]),['paid','Comprar com pontos de poder · 2 PP']];
 const mode=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Aquisição · '+item.name},content:'<p>Três aptidões elegíveis são gratuitas. Cada aptidão adicional custa 2 PP.</p><p>Saldo atual: <strong>'+((kuchiyoseLink(actor)?.mode==='calculated'?Math.floor(actor.system.nc/2):actor.system.derived?.budgets?.powers?.granted??actor.system.budgets?.grants?.filter(g=>g.category==='powers').reduce((n,g)=>n+g.amount,0)??0)-budget.spent)+' PP</strong>.</p><label>Como adquirir<select name="mode">'+options.map(([value,label])=>'<option value="'+value+'" '+(value===a?.mode?'selected':'')+'>'+escapeHtml(label)+'</option>').join('')+'</select></label>'+(!canFree?'<p>Sem vaga gratuita elegível para esta aptidão.</p>':''),ok:{label:'Adicionar',callback:(e,b)=>b.form.elements.mode.value}});
 if(!mode)return null;
 if(mode==='free-gm'){
  if(!game.user.isGM)return null;
  const reason=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Liberação individual de gratuidade'},content:'<p>Esta aptidão não está na lista publicada. A liberação ocupa uma das três vagas.</p><label>Motivo<input name="reason" required></label>',ok:{label:'Liberar esta aptidão',callback:(e,b)=>b.form.elements.reason.value.trim()}});
  if(!reason||!game.user.isGM)return null;return {mode:'free',freeAuthorization:true,authorizedBy:game.user.id,reason,user:game.user.id,at:new Date().toISOString()};
 }
 return {mode,user:game.user.id,at:new Date().toISOString()};
}
export async function configureAcquisition(actor,id){
 if(!actor.isOwner)return;const item=actor.items.get(id);if(!item||!['power','aptitude'].includes(item.type))return;
 if(['manual','granted'].includes(acquisitionOf(item)?.mode)||acquisitionOf(item)?.freeAuthorization)return ui.notifications.info('Aquisição personalizada pelo mestre.');
 const a=item.type==='aptitude'?await chooseAcquisition(actor,item):{mode:'paid',user:game.user.id,at:new Date().toISOString()};
 if(!a)return;const after={...item.toObject(),id:item.id,flags:{...item.flags,[ns]:{...item.flags?.[ns],acquisition:a}}};
 const problems=acquisitionProblems(after,actor.items);if(problems.length)return ui.notifications.warn(problems.join(' '));
 await item.update({['flags.'+ns+'.acquisition']:a});
}
