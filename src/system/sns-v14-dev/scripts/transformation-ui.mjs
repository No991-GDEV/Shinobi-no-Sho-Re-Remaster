import {requestTransformation} from './transformation-service.mjs';
import {profileFor,transformationState,transformationTurnPlan} from './transformation-core.mjs';
import {escapeHtml as esc} from './kernel.mjs';
import {actorCombat} from './effect-duration.mjs';
export async function transformationMode(event,target){
 if(!this.isEditable)return;
 const row=target.closest('[data-mode-source]'),read=key=>row?.querySelector('[data-mode-option="'+key+'"]')?.value;
 try{await requestTransformation(this.actor,{sourceId:target.dataset.sourceId,mode:target.dataset.mode,buff:target.dataset.buff,tails:Number(read('tails')||1),usedLevel:Number(read('level')||2),resource:read('resource')??'chakra'});}catch(e){ui.notifications.warn(e.message);}
}
export async function configureTransformation(event,target){
 if(!this.isEditable||!game.user.isGM)return;const source=this.actor.items.get(target.dataset.sourceId),p=profileFor(this.actor,source?.id);if(!p)return;
 const prior=source.flags?.['sns-v14-dev']??{};
 const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Transformações · '+p.def.name},content:'<label><input name="delay" type="checkbox" '+(prior.delayControl?'checked':'')+'>Retardar Controle Total por decisão do mestre</label>'+p.def.modes.filter(m=>m.rank).map(m=>'<label>'+esc(m.name)+' · imagem opcional<input name="image_'+m.id+'" value="'+esc(prior.transformationImages?.[m.id]??'')+'"></label>').join(''),ok:{label:'Salvar',callback:(e,b)=>({delayControl:b.form.elements.delay.checked,transformationImages:Object.fromEntries(p.def.modes.filter(m=>m.rank).map(m=>[m.id,b.form.elements['image_'+m.id].value.trim()]))})}});
 if(result)await source.update({'flags.sns-v14-dev.delayControl':result.delayControl,'flags.sns-v14-dev.transformationImages':result.transformationImages});
}
export async function transformationTechnique(event,target){const {useTransformationTechnique}=await import('./transformation-techniques.mjs');const row=target.closest('[data-mode-source]'),read=key=>row?.querySelector('[data-mode-option="'+key+'"]')?.value;const variant=target.dataset.variant||target.closest('li')?.querySelector('[data-technique-variant]')?.value||'normal';if(this.isEditable)try{await useTransformationTechnique(this.actor,target.dataset.sourceId,target.dataset.technique,{usedLevel:read('level')?Number(read('level')):undefined,resource:read('resource')??'chakra',variant});}catch(e){ui.notifications.warn(e.message);}}
export async function transformationDomain(event,target){const {testDomination}=await import('./transformation-techniques.mjs');if(this.isEditable&&game.user.isGM)try{await testDomination(this.actor,target.dataset.sourceId);}catch(e){ui.notifications.warn(e.message);}}
export async function transformationManualTurn(){
 if(!this.isEditable||!game.user.isGM)return;if(actorCombat(this.actor))return ui.notifications.warn('O combate já controla os inícios de turno.');
 const state=transformationState(this.actor),round=(state.manualRound??0)+1,plan=transformationTurnPlan(this.actor,{phase:'start',combatId:'manual-'+this.actor.uuid,combatantId:this.actor.id,round});
 if(plan){plan.state.manualRound=round;await this.actor.update({...plan.patch,'flags.sns-v14-dev.transformations':plan.state});}
}

export async function transformationRest(event,target){
 if(!this.isEditable||!game.user.isGM)return;
 try{const {restTransformation}=await import('./transformation-techniques.mjs');await restTransformation(this.actor,target.dataset.sourceId);}catch(e){ui.notifications.warn(e.message);}
}
