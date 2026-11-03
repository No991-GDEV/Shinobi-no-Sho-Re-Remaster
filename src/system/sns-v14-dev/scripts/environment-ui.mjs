import {appendAdvancedChoose,appendAdvancedActive} from './advanced-ui.mjs';
import {environmentData,environmentMember,environmentSummary,activeEnvironments} from './environment-core.mjs';
import {requestEnvironmentCast,requestEnvironmentControl} from './environment-service.mjs';
import {jutsuProjection} from './item-view.mjs';
import {clockActors} from './effect-lifecycle.mjs';
import {actorCombat} from './effect-duration.mjs';
const ns='sns-v14-dev',node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
function button(label,fn){const b=node('button',label);b.type='button';b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});return b;}
function select(label,rows){const field=node('label',label),input=node('select');for(const row of rows){const o=node('option',row.label);o.value=row.id;input.append(o);}field.append(input);return {field,input};}
function checkbox(label,checked=false){const field=node('label',label),input=node('input');input.type='checkbox';input.checked=checked;field.prepend(input);return {field,input};}
export async function environmentAction(event,target){const uuid=target.dataset.environmentRoot,action=target.dataset.environmentCommand;await requestEnvironmentControl(uuid,action,{targetUuid:this.actor.uuid,key:target.dataset.environmentKey,stateId:target.dataset.environmentState});}
export async function decorateEnvironmentMessage(message,element){
 const f=message.flags?.[ns]??{};if(f.environmentCast||f.environmentControl){element.classList.add('sns-internal-message');return;}
 if(f.environmentPulse&&!element.querySelector('[data-environment-pulse]')){const actor=await fromUuid(f.environmentPulse.targetUuid),packet=f.damageUse,request=await fromUuid(packet?.defenseRequestUuid),result=f.defenseResults?.[actor?.uuid.replaceAll('.','~')],row=node('section','','sns-target-resolution');row.dataset.environmentPulse='';if(actor&&request){if(f.environmentPulse.cancelled){row.append(node('p','Saiu da área · resistência encerrada','sns-save-state'));(element.querySelector('.message-content')??element).append(row);return;}row.append(node('strong',actor.name));if(result)row.append(node('p',result.hit==='hit'?'Falhou · dano fixo e Lento':result.hit==='miss'?'Resistiu · sem dano; Lento encerrado':'Aguardando resultado','sns-save-state'));else await (await import('./combat-chat-ui.mjs')).appendResistanceButtons(request,actor,row);(element.querySelector('.message-content')??element).append(row);}return;}
 const r=f.environmentUse;if(!r||element.querySelector('[data-sns-environment]'))return;const actor=await fromUuid(r.actorUuid),item=await fromUuid(r.itemUuid),p=item&&jutsuProjection(item),box=node('section','','sns-target-resolution sns-support-controls');box.dataset.snsEnvironment='';
 if(r.rootUuid){const root=await fromUuid(r.rootUuid),m=environmentData(root);if(!m)return;box.append(node('strong',root.system.appliedCondition.active?'Efeito ativo':'Efeito encerrado','sns-save-state'),node('small','Chakra '+r.cost),node('p',environmentSummary(root)));
  appendAdvancedActive(box,root,actor);
  if(actor.isOwner&&root.system.appliedCondition.active){
   if(m.pending)box.append(button('Manter · '+(m.concentration?'ação padrão':'ação parcial'),()=>requestEnvironmentControl(root,'sustain')));
   if(m.concentration)box.append(button('Testar concentração · distração',()=>requestEnvironmentControl(root,'concentration')));
   if(m.kind==='prisao-de-agua')box.append(button('Restaurar dureza · Chakra'+m.cost,()=>requestEnvironmentControl(root,'restore')));
   if((!m.permanent||game.user.isGM)&&!m.drifting)box.append(button(m.permanent?'Remover registro da cobertura':'Encerrar',()=>requestEnvironmentControl(root,'end')));
  }
  if(game.user.isGM&&root.system.appliedCondition.active){
   if(['restringente','nuvem','nevoa'].includes(m.kind))box.append(button('Atualizar participantes',()=>requestEnvironmentControl(root,'members',{targets:[...new Set(Array.from(game.user.targets??[]).filter(t=>t.actor).map(t=>t.actor.uuid))]})));
   if(m.kind==='nuvem'&&!actorCombat(actor)?.started)box.append(button('Contar turno da Nuvem · fora de combate',()=>requestEnvironmentControl(root,'pulse')));
   if(['barreira','prisao-de-agua','nuvem','nevoa'].includes(m.kind)){const entries=Array.from(game.messages).filter(m=>m.getFlag(ns,'damageUse')?.attack&&!m.getFlag(ns,'damageUse')?.profile.noDamage).slice(-30).reverse(),attack=select('Ataque contra o objeto / área',entries.map(m=>({id:m.uuid,label:m.getFlag(ns,'damageUse').name+' · '+(m.speaker.alias??m.author.name)})));box.append(attack.field,button('Aplicar ao objeto',()=>requestEnvironmentControl(root,'objectDamage',{attackUuid:attack.input.value})));}
  }
  for(const member of Object.values(m.members).filter(m=>m.inside)){const a=await fromUuid(member.uuid);if(!a?.isOwner||!['restringente','prisao-de-agua'].includes(m.kind))continue;const row=node('div','','sns-save-controls');row.append(node('small',a.name));for(const [key,label]of [['attribute:for','Força'],[m.kind==='restringente'?'skill:escapar':'attribute:vig',m.kind==='restringente'?'Escapar':'Vigor']])row.append(button(label+' · libertar-se',()=>requestEnvironmentControl(root,'escape',{targetUuid:a.uuid,key})));box.append(row);}
 }else if(p?.valid&&p.environment&&actor.isOwner){
  const m=p.environment;if(r.reason)box.append(node('p',r.reason,'sns-effect-warning'));box.append(node('small',r.targets.length+' alvo(s) marcado(s). Selecione quem está dentro da área e do alcance.'));
  if(m.advanced){appendAdvancedChoose(box,message,actor,p);}
  else if(m.kind==='repelir')box.append(node('p','Escolha Repelir ao declarar a defesa de um ataque. Custo e teste serão feitos nessa reação.'));
  else{
   const mode=select('Uso',m.kind==='barreira'?[{id:'normal',label:'Criar cobertura'},...(m.stage>=6?[{id:'cage',label:'Enjaular · padrão, CD−2'}]:[])]:[{id:'normal',label:'Normal'}]),material=select('Material',m.element==='ninpou'?[{id:'solid',label:'Sólido · permanente'},{id:'fluid',label:'Não sólido · sustentado'}]:[{id:m.element==='doton'?'solid':'fluid',label:m.element==='doton'?'Sólido · permanente':'Não sólido · sustentado'}]),willing=checkbox('Alvos voluntários, no meio elemental apropriado'),includeSelf=checkbox('Usuário também está dentro da área',true);
   if(m.kind==='barreira')box.append(mode.field,material.field);if(m.kind==='deslocamento-de-vacuo')box.append(willing.field);if(m.kind==='nevoa')box.append(includeSelf.field);
   let substance;if(m.kind==='purificar'){const rows=clockActors().filter(a=>a.isOwner||a.testUserPermission(game.user,'OBSERVER')).flatMap(a=>activeEnvironments(a).filter(r=>['nuvem','nevoa','restringente'].includes(environmentData(r).kind)).map(root=>({id:root.uuid,label:root.name+' · Nv'+environmentData(root).usedLevel+' · '+a.name})));substance=select('Substância no ambiente',rows);box.append(substance.field);}
   box.append(button('Usar · Chakra '+m.cost,()=>requestEnvironmentCast(message,{mode:mode.input.value,solid:material.input.value==='solid',willing:willing.input.checked,includeSelf:includeSelf.input.checked,...(substance?{rootUuid:substance.input.value}:{})})));
  }
 }
 if(box.children.length)(element.querySelector('.message-content')??element).append(box);
}
export function refreshEnvironmentMessage(item){const m=environmentData(item),uuid=m?.activationUuid,message=uuid&&game.messages.find(m=>m.uuid===uuid);if(message)ui.chat?.updateMessage(message);}
