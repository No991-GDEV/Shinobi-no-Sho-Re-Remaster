import {advancedState,advancedStates,poisonDefinition} from './advanced-core.mjs';
import {environmentData} from './environment-core.mjs';
import {requestEnvironmentCast,requestEnvironmentControl} from './environment-service.mjs';
import {jutsuProjection} from './item-view.mjs';
const ns='sns-v14-dev',node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
function button(text,fn){const b=node('button',text);b.type='button';b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});return b;}
function select(text,rows){const field=node('label',text),input=node('select');for(const [id,label]of rows){const option=node('option',label);option.value=id;input.append(option);}field.append(input);return {field,input};}
function checkbox(text){const field=node('label',text),input=node('input');input.type='checkbox';field.prepend(input);return {field,input};}
const targets=()=>[...new Set(Array.from(game.user.targets??[]).filter(t=>t.actor).map(t=>t.actor.uuid))];
export function appendAdvancedChoose(box,message,actor,p){
 const m=p.environment;if(!m?.advanced)return false;const selection={mode:'normal'},fields=[];let mode,fan,poison,confirm,fall,includeSelf;const counts={};
 if(m.kind==='imergir'){confirm=checkbox('Elemento natural, Criação Livre ou Barreira; há espaço para o corpo');fields.push(confirm.field);}
 if(m.kind==='flutuar'){
  fan=select('Leque empunhado',Array.from(actor.items).filter(i=>i.system.contentId==='sns:equipment:leque-gigante'&&i.system.equipped&&i.system.quantity>0).map(i=>[i.id,i.name]));mode=select('Uso',[['normal','Flutuar'],['fall','Reação à queda · ficar alado'],['land','Reação à queda · descer suavemente']]);confirm=checkbox('Espaço livre, sem obstáculo ou inimigo adjacente');fall=checkbox('Tenho movimento disponível para a reação');fields.push(fan.field,mode.field,confirm.field,fall.field);
 }
 if(m.kind==='venenoso'){
  const rows=Array.from(actor.items).filter(i=>poisonDefinition(i.system.contentId)&&i.system.quantity>0);poison=select('Dose produzida · até categoriaII',rows.map(i=>[i.id,i.name+' · '+(i.flags?.[ns]?.poisonBatch?'fabricante definido':'definir fabricante')+' · '+i.system.quantity+' dose(s)']));fields.push(poison.field);
  if(game.user.isGM){const producers=select('Produtor do lote',Array.from(game.actors).filter(a=>a.items.some(i=>(i.system.ruleId||i.system.contentId)==='sns:apt:quimico')).map(a=>[a.id,a.name]));if(Array.from(producers.input.options).some(o=>o.value===actor.id))producers.input.value=actor.id;fields.push(producers.field,button('Definir fabricante',async()=>{const {preparePoisonBatch}=await import('./advanced-service.mjs');await preparePoisonBatch(actor,actor.items.get(poison.input.value),{producer:game.actors.get(producers.input.value)});ui.notifications.info('Fabricante definido.');}));}
 }
 if(m.kind==='meteoros'){
  mode=select('Meteoros',[['normal','Explosões na área'],['aimed','Mirar criaturas · CD−3, sem Esquiva/Antecipar']]);fields.push(mode.field);
  for(const t of message.getFlag(ns,'environmentUse').targets){const label=node('label',t.name+' · meteoros que atingem'),input=node('input');input.type='number';input.min='1';input.max='6';input.step='1';input.value='1';counts[t.uuid]=input;label.append(input);fields.push(label);}
  fields.push(node('small','Seis áreas de 5 m. Considere a sobreposição ao aplicar o dano.'));
 }
 if(m.kind==='inflamavel'){mode=select('Forma',[['continuous','Área contínua · Chakra'+m.cost],['meta','Preparar combustão · Chakra3 + técnica']]);includeSelf=checkbox('O usuário também está na área');fields.push(mode.field,includeSelf.field);}
 if(m.kind==='desastre')fields.push(node('small','Até'+m.maxTurns+' turnos de Concentração · uma vez por cena · Chakra'+m.cost+'. Selecione os participantes na área.'));
 fields.push(button('Usar · '+(m.kind==='inflamavel'?'conforme modo':'Chakra'+m.cost),()=>requestEnvironmentCast(message,{...selection,...(mode?{mode:mode.input.value}:{}),...(fan?{fanId:fan.input.value}:{}),...(poison?{poisonId:poison.input.value}:{}),...(confirm?m.kind==='imergir'?{validMedium:confirm.input.checked}:{clearSpace:confirm.input.checked}:{}),...(fall?{movementAvailable:fall.input.checked}:{}),...(includeSelf?{includeSelf:includeSelf.input.checked}:{}),...(m.kind==='meteoros'?{counts:Object.fromEntries(Object.entries(counts).map(([id,input])=>[id.replaceAll('.','~'),Number(input.value)]))}:{})})));
 box.append(...fields);return true;
}
export function appendAdvancedActive(box,root,actor){
 const m=environmentData(root);if(!m?.advanced||!root.system.appliedCondition.active)return;
 if(actor.isOwner&&m.kind==='imergir'){
  box.append(node('small',m.stage>=4?'Metade do deslocamento; sentidos livres.':'Sem deslocamento; visão até10m.'));if(game.user.isGM){const confirm=checkbox('Furtividade bem-sucedida · alvo acima · mãos livres');box.append(confirm.field,button('Falsa Decapitação · alvo marcado',()=>{const list=targets();if(list.length!==1)throw Error('Marque um alvo acima do usuário.');return requestEnvironmentControl(root,'decapitation',{targetUuid:list[0],stealthConfirmed:confirm.input.checked});}),button('Ocultar novamente',()=>requestEnvironmentControl(root,'hide')));}
 }
 if(actor.isOwner&&m.kind==='flutuar')box.append(node('p','Alado · Voo '+m.flightPrecision+' · leque indisponível enquanto sustentar.'));
 if(actor.isOwner&&m.kind==='colisao-de-ondas')box.append(button('Novo ataque das ondas · alvos marcados',()=>requestEnvironmentControl(root,'waveAttack',{targets:targets()})));
 if(game.user.isGM&&['desastre','inflamavel'].includes(m.kind))box.append(button('Atualizar participantes',()=>requestEnvironmentControl(root,'advancedMembers',{targets:targets()})));
 if(m.kind==='desastre'&&m.drifting){box.append(node('p','Sem concentração · rodada residual · não pode proteger alvos'));if(game.user.isGM)box.append(button('Encerrar rodada residual · fora de combate',()=>requestEnvironmentControl(root,'endDrift')));}
 if(m.kind==='inflamavel'){
  if(m.mode==='meta'&&actor.isOwner){const rows=Array.from(actor.items).filter(i=>i.type==='jutsu').map(i=>({i,p:jutsuProjection(i)})).filter(({p})=>p?.valid&&['sns:power:katon','sns:power:raiton'].includes(p.power?.id)&&(!p.noRoll));const source=select('Técnica de combustão',rows.map(({i,p})=>[i.id,i.name+' · Chakra'+p.cost]));box.append(source.field,button('Combustão · alvos marcados',()=>requestEnvironmentControl(root,'combustion',{itemId:source.input.value,targets:targets()})));}
  if(m.mode==='continuous'&&game.user.isGM){const element=select('Fonte de ignição',[['katon','Katon'],['raiton','Raiton'],...(m.stage>=8?[['spark','Fonte de ignição válida']]:[])]);box.append(element.field,button('Iniciar combustão',()=>{const list=targets();if(list.length!==1)throw Error('Marque quem provocou a combustão.');return requestEnvironmentControl(root,'ignite',{targetUuid:list[0],element:element.input.value});}));}
 }
}
export async function decorateAdvancedEvent(message,element){
 const e=message.getFlag(ns,'advancedEvent');if(!e||element.querySelector('[data-advanced-event]'))return;const root=await fromUuid(e.rootUuid),actor=await fromUuid(e.targetUuid),m=environmentData(root);if(!root||!actor)return;
 const box=node('section','','sns-target-resolution');box.dataset.advancedEvent='';
 if(!['pending','breathPending'].includes(e.status)){box.append(node('p',e.status==='protected'?'Protegido · sem ataque neste turno':e.status==='cancelled'?'Solicitação encerrada':'Resolvido','sns-save-state'));}
 else{
  const options=e.type==='desastre'?[['protect','Proteger · Concentração Dif'+(9+2*m.usedLevel)],['attack','Resolver ataque do desastre']]:e.type==='colisao-de-ondas'?[['swim','Nadar · movimento · Atletismo Dif'+m.dc],...(m.stage<10?[['standard','Subir · ação padrão · sem teste']]:[]),['breath','Prender respiração · Vigor Dif'+(m.dc-2+(e.turnNumber??0))]]:e.type==='prisao-de-agua'?[['breath','Prender respiração · Vigor Dif'+(m.dc-2+(e.turnNumber??0))]]:[['poison','Resistir ao veneno · Vigor']];
  for(const [mode,label]of options){if(e.status==='breathPending'&&mode!=='breath')continue;if(mode==='protect'&&m.drifting)continue;const b=button(label,()=>requestEnvironmentControl(root,'advancedEvent',{eventUuid:message.uuid,mode}));b.classList.add('sns-save-button');b.disabled=e.type==='desastre'?!root.actor.isOwner:!actor.isOwner;box.append(b);}
 }
 (element.querySelector('.message-content')??element).append(box);
}
