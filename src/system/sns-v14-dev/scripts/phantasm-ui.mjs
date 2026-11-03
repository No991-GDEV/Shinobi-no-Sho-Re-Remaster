import {isProcessor} from './processor-authority.mjs';
import {phantasmData} from './phantasm-core.mjs';
import {requestPhantasmEnd,attackPhantasmContext,resolvePhantasmLocation} from './phantasm-service.mjs';
const ns='sns-v14-dev',node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,callback)=>{const b=node('button',text);b.type='button';b.addEventListener('click',async()=>{b.disabled=true;try{await callback();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});return b;};
export async function decoratePhantasmMessage(message,element){
 const f=message.flags?.[ns]??{};if(f.phantasmAttack||f.phantasmEnd||f.phantasmDirection||f.phantasmResolution||f.phantasmVisualProof||f.phantasmLocationProof||f.phantasmObservationProof){element.classList.add('sns-internal-message');return;}
 if(element.querySelector('[data-sns-phantasm]'))return;
 const box=node('section','','sns-target-resolution');box.dataset.snsPhantasm='';
 if(f.phantasmActivation){
  const status=f.phantasmActivation,root=status.rootUuid&&await fromUuid(status.rootUuid);box.append(node('p',status.status==='blocked'?status.reason:status.status==='pending'?'Aplicando ilusão…':root?.system.appliedCondition.active?'Ilusão ativa · Chakra '+status.cost:'Ilusão encerrada','sns-save-state'));
  if(root?.system.appliedCondition.active){const meta=phantasmData(root);box.append(node('p',meta.effectId.endsWith(':falsa-velocidade')?(meta.usedAttackUuid?'Finta utilizada neste turno.':'No próximo ataque contra um inimigo, ele testa Notar Genjutsu.'):'Ao ser atacado, cada inimigo testa Notar Genjutsu.'));if(root.actor.isOwner)box.append(button('Encerrar ilusão',()=>requestPhantasmEnd(root)));}
 }
 if(f.damageUse?.defenseRequestUuid&&f.damageUse.attack){const request=await fromUuid(f.damageUse.defenseRequestUuid);for(const target of f.damageUse.targets){const key=target.uuid.replaceAll('.','~');if(f.phantasmVisual?.[key])continue;const context=await attackPhantasmContext(request,{uuid:target.uuid});if(!context.position?.threshold)continue;const row=node('article','','sns-effect-target');row.append(node('strong',target.name+' · Falsa Posição'),node('p','Defina a localização antes do teste de camuflagem.'));if(isProcessor()){for(const [mode,label]of [['approximate','Localização aproximada · rolar1d8'],['sensor','Sensor · localização exata'],['unknown','Sem localização · erra'],...(f.damageUse.profile.attackKind==='area'?[['area','Área suficiente · dispensa erro']]:[])])row.append(button(label,()=>resolvePhantasmLocation(message,target.uuid,mode)));}else row.append(node('small','Aguardando a localização do alvo.'));box.append(row);}}
 for(const [key,result]of Object.entries(f.phantasmVisual??{})){
  const ref=f.damageUse?.targets.find(t=>t.uuid.replaceAll('.','~')===key),row=node('article','','sns-effect-target');row.append(node('strong',(ref?.name??'Alvo')+' · Falsa Posição'),node('p',result.state==='critical'?'Acerto crítico · dispensa erro de camuflagem':result.state==='attackFailure'?'Falha automática no ataque':result.location==='unknown'?'Sem localização · ataque falhou':result.state==='miss'?'Errou pela camuflagem':result.location==='sensor'?'Sensor · dispensa erro de camuflagem':result.location==='area'?'Área suficiente · dispensa erro':'Passou pela camuflagem'));
  if(result.natural!==null)row.append(node('small','1d8: '+result.natural+' · erro com '+result.threshold+' ou menos'));
  const root=await fromUuid(result.rootUuid);
  if(result.state==='miss'&&result.stage>=10&&root?.actor.isOwner){
   if(result.direction)row.append(node('p','Direção escolhida: '+result.direction));else{const label=node('label','Direção do ataque desviado'),input=node('input');input.type='text';input.maxLength=100;input.placeholder='Ex.: à direita, em direção à parede';label.append(input);row.append(label,button('Escolher direção',()=>foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor:root.actor}),whisper:[game.users.activeGM.id],content:'Direção de ataque desviado.',flags:{[ns]:{phantasmDirection:{attackUuid:message.uuid,key,direction:input.value.trim()}}}})));}
  }
  box.append(row);
 }
 if(box.children.length)(element.querySelector('.message-content')??element).append(box);
}
export function refreshPhantasmMessages(item){const uuid=phantasmData(item)?.activationUuid,message=uuid&&game.messages.find(m=>m.uuid===uuid);if(message)ui.chat?.updateMessage(message);}
