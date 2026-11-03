import {actorMessages,touches} from './message-index.mjs';
import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {craftProfile,craftJobs,validateCraftProfile,craftPlan,craftQuality,CRAFT_BENEFITS,matchingCraftItems} from './crafting-core.mjs';
import {requestCraft,profileStamp} from './crafting-service.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {canControlTransformation} from './transformation-core.mjs';
import {poisonProducer,resolvePoisonMode} from './poison-crafting.mjs';
const ns='sns-v14-dev',path='systems/sns-v14-dev';
export class SnsCrafting extends SnsHandlebarsApplicationMixin(foundry.applications.api.ApplicationV2){
 static DEFAULT_OPTIONS={classes:['sns-editor-dialog','sns-crafting'],position:{width:640,height:650},window:{title:'Fabricar',resizable:true},actions:{configure:SnsCrafting.configure,start:SnsCrafting.start,roll:SnsCrafting.roll,finish:SnsCrafting.finish,cancel:SnsCrafting.cancel,undo:SnsCrafting.undo,selectJob:SnsCrafting.selectJob,newJob:SnsCrafting.newJob,description:SnsCrafting.description}};
 static PARTS={body:{template:path+'/templates/crafting.hbs',scrollable:['']}};
 constructor(actor,formulaId,options={}){
  super(options);this.actor=actor;this.formulaId=formulaId;this.batches=1;this.poisonMode='field';this.jobId='';this.pendingId='';this.busy=false;
  const refresh=doc=>{if(this.rendered&&(doc.uuid===this.actor.uuid||doc.actor?.uuid===this.actor.uuid||doc.id===this.pendingId))void this.render({force:true});};
  this.hooks=['updateActor','updateItem','createItem','deleteItem','updateChatMessage'].map(h=>[h,Hooks.on(h,refresh)]);
 }
 canUse(){return this.actor.isOwner&&canControlTransformation(this.actor);}
 async _onClose(options){for(const [name,id]of this.hooks)Hooks.off(name,id);await super._onClose(options);}
 async _prepareContext(){
  const formula=this.actor.items.get(this.formulaId),all=Object.values(craftJobs(this.actor)).filter(j=>j.formulaId===this.formulaId).reverse(),job=craftJobs(this.actor)[this.jobId]??all.find(j=>['working','committing','undoing'].includes(j.state));
  if(!formula)throw Error('Esta fórmula não está mais na ficha.');
  let profile=null,preview=null,error='';try{if(craftProfile(formula)){profile=validateCraftProfile(resolvePoisonMode(craftProfile(formula),this.poisonMode));if(!job){if(profile.kind==='poison')poisonProducer(this.actor,profile);preview=craftPlan(this.actor,profile,this.batches);}}}catch(e){error=e.message;}
  const request=this.pendingId?game.messages.get(this.pendingId):null,result=request?.getFlag(ns,'craftResult'),waiting=!!request&&!result;
  if(result?.reason)error=result.reason;
  if(result?.jobId&&craftJobs(this.actor)[result.jobId]){this.jobId=result.jobId;this.pendingId='';}
  const r=requirementsFor(formula,this.actor);if(!job&&r.configured&&!r.valid)error=r.problems.join(' ');
  const quality=job?craftQuality(job.profile,job.steps):null,working=job?.state==='working',committing=job?.state==='committing',undoing=job?.state==='undoing',done=job&&!working&&!committing&&!undoing;
  const p=job?.profile??profile,can=this.canUse();
  const isPoison=p?.kind==='poison';
  return {name:formula.name,isGM:game.user.isGM,editable:can,configured:!!profile,error,waiting,busy:this.busy,batches:this.batches,preview,profile:p,isPoison,ideal:isPoison&&p.poison.mode==='ideal',maxBatches:isPoison&&this.poisonMode!=='ideal'?15:100,poisonModes:[['field','Em campo · teste, 10 min'],['adverse','Condições adversas · Dif +4'],['ideal','Condições ideais · simular 2 dados']].map(([id,label])=>({id,label,selected:id===this.poisonMode,disabled:id==='ideal'&&!p?.poison?.idealMinutes})),job:job?{...job,working,committing,undoing,done,quality,undone:job.state==='undone',stateLabel:{done:'Concluído',failed:'Falha',cancelled:'Cancelado',interrupted:'Interrompido',undone:'Desfeito'}[job.state]}:null,
   canStart:can&&!!profile&&!!preview&&!error&&!waiting&&!this.busy&&!job,
   canUndo:game.user.isGM&&!!job?.commit&&['done','failed','interrupted','committing','undoing'].includes(job.state),
   ingredients:p?.ingredients.map(row=>({...row,required:row.quantity*(job?.batches??this.batches),available:matchingCraftItems(this.actor,row.identity).reduce((n,i)=>n+i.system.quantity,0)})),tools:p?.tools,
   steps:p?.steps.map((step,index)=>{const result=job?.steps[index];return {...step,index,result,next:working&&!waiting&&index===job.steps.length,passed:result?.result==='passed',failed:result?.result==='failed'};}),
   canFinish:can&&working&&!waiting&&job.steps.length===job.profile.steps.length&&!this.busy,
   great:quality?.key==='great',benefits:Object.entries(CRAFT_BENEFITS).map(([id,label])=>({id,label})),
   history:all.slice(0,20).map(j=>({id:j.id,name:j.name,date:new Date(j.startedAt).toLocaleString('pt-BR'),state:{working:'Em preparo',committing:'Concluir registro',done:'Concluído',failed:'Falha',cancelled:'Cancelado',interrupted:'Interrompido',undoing:'Devolução em andamento',undone:'Desfeito'}[j.state],quantity:j.commit?.quantity??0}))};
 }
 async _onRender(context,options){await super._onRender(context,options);this.element.querySelector('[name="batches"]')?.addEventListener('input',event=>{this.batches=Number(event.target.value);this.updatePreview();});this.element.querySelector('[name="batches"]')?.addEventListener('change',()=>void this.render({force:true}));this.element.querySelector('[name="poisonMode"]')?.addEventListener('change',event=>{this.poisonMode=event.target.value;void this.render({force:true});});}
 updatePreview(){
  const formula=this.actor.items.get(this.formulaId),profile=resolvePoisonMode(craftProfile(formula),this.poisonMode);if(!profile||this.currentJob())return;
  let preview,error='';try{if(profile.kind==='poison')poisonProducer(this.actor,profile);preview=craftPlan(this.actor,profile,this.batches);const r=requirementsFor(formula,this.actor);if(r.configured&&!r.valid)error=r.problems.join(' ');}catch(e){error=e.message;}
  const total=this.element.querySelector('[data-craft-total]'),notice=this.element.querySelector('[data-craft-preview-error]'),start=this.element.querySelector('[data-action="start"]');
  if(total){total.hidden=!preview;total.textContent=preview?'Total: '+preview.cost+' Ryo · '+preview.minutes+' min · '+preview.quantity+' unidade(s)':'';}
  if(notice){notice.hidden=!error;notice.textContent=error;}
  if(start)start.disabled=!this.canUse()||!preview||!!error||this.busy||!!this.pendingId;
  const batches=this.element.querySelector('[data-craft-batches]');if(batches)batches.textContent=String(this.batches);
  for(const row of this.element.querySelectorAll('[data-craft-required]'))row.textContent=String(Number(row.dataset.craftRequired)*this.batches);
 }
 currentJob(){return craftJobs(this.actor)[this.jobId]??Object.values(craftJobs(this.actor)).find(j=>j.formulaId===this.formulaId&&['working','committing','undoing'].includes(j.state));}
 async send(action,selection){if(!this.canUse()||this.busy||this.pendingId&&!game.messages.get(this.pendingId)?.getFlag(ns,'craftResult'))return;this.busy=true;try{const m=await requestCraft(this.actor,action,selection);if(m){this.pendingId=m.id;const r=m.getFlag(ns,'craftResult');if(r?.jobId)this.jobId=r.jobId;}}catch(error){ui.notifications.warn(error.message);}finally{this.busy=false;await this.render({force:true});}}
 static async configure(){if(!game.user.isGM||!this.canUse())return;const {SnsCraftProfileEditor}=await import('./crafting-editor.mjs');await new SnsCraftProfileEditor(this.actor.items.get(this.formulaId)).render({force:true});}
 static async description(){await this.actor.items.get(this.formulaId)?.sheet.render({force:true});}
 static async start(){const p=craftProfile(this.actor.items.get(this.formulaId));try{await this.send('start',{formulaId:this.formulaId,stamp:profileStamp(p),batches:this.batches,...(p?.kind==='poison'?{poisonMode:this.poisonMode,idealConfirmed:this.element.querySelector('[name="idealConfirmed"]')?.checked===true}:{})});}catch(e){ui.notifications.warn(e.message);}}
 static async roll(event,target){const job=this.currentJob();if(job)await this.send('roll',{jobId:job.id,step:Number(target.dataset.step)});}
 static async finish(){const job=this.currentJob();if(job)await this.send('finish',{jobId:job.id,timeConfirmed:this.element.querySelector('[name="timeConfirmed"]')?.checked===true,benefit:this.element.querySelector('[name="benefit"]')?.value??''});}
 static async cancel(){const job=this.currentJob();if(job)await this.send('cancel',{jobId:job.id});}
 static async undo(){const job=this.currentJob();if(game.user.isGM&&job)await this.send('undo',{jobId:job.id});}
 static async selectJob(event,target){this.jobId=target.dataset.jobId;this.pendingId='';await this.render({force:true});}
 static async newJob(){this.jobId='';this.pendingId='';await this.render({force:true});}
}

export function decorateCraftMessage(message,element){
 for(const button of element.querySelectorAll('[data-craft-open]')){button.addEventListener('click',async()=>{const actor=await fromUuid(button.dataset.craftOpen);if(actor?.testUserPermission(game.user,'OBSERVER'))await new SnsCrafting(actor,button.dataset.craftFormula).render({force:true});});}
 const card=element.querySelector('[data-craft-job]');if(!card)return;
 void fromUuid(card.dataset.craftActor).then(actor=>{
  if(!actor?.isOwner||!canControlTransformation(actor))return;const job=craftJobs(actor)[card.dataset.craftJob];if(!job)return;
  if(job.state==='working'&&job.steps.length<job.profile.steps.length){const stage=job.profile.steps[job.steps.length],button=document.createElement('button');button.type='button';button.className='craft-chat-roll';button.textContent='Rolar '+stage.label+' · Dif '+stage.dc;button.addEventListener('click',async()=>{button.disabled=true;try{await requestCraft(actor,'roll',{jobId:job.id,step:job.steps.length});}catch(e){ui.notifications.warn(e.message);}finally{button.disabled=false;}});card.append(button);}
 }).catch(console.error);
}
export function refreshCraftMessages(actor,changes){if(changes&&!touches(changes,['flags.sns-v14-dev.craftJobs','flags.sns-v14-dev.craftRequests','system.finances','system.attributes','system.skills']))return;for(const message of actorMessages(actor.uuid))if(message.getFlag(ns,'craftRequest')?.actorUuid===actor.uuid&&message.getFlag(ns,'craftResult')?.jobId)ui.chat?.updateMessage(message);}
