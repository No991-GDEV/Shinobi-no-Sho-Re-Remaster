import {rollSupportAttack} from './blade-workflow.mjs';
import {postSheetDamage} from './sheet-damage.mjs';
import {weaponChecks} from './weapon-checks.mjs';
import {supportData,supportSummary,creationOptions,energyOptions,supportElementLabel,bladeEnergyOptions,electricCreationOptions} from './support-core.mjs';
import {jutsuProjection} from './item-view.mjs';
import {requestSupportChoice,requestSupportControl,creationChain} from './support-service.mjs';
import {actorCombat} from './effect-duration.mjs';
const ns='sns-v14-dev',el=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
const button=(label,callback)=>{const b=el('button',label);b.type='button';b.addEventListener('click',async()=>{b.disabled=true;try{await callback();}catch(e){ui.notifications.warn(e.message);}finally{b.disabled=false;}});return b;};
const select=(label,rows)=>{const field=el('label',label),input=el('select');for(const row of rows){const o=el('option',row.label);o.value=row.id;input.append(o);}field.append(input);return {field,input};};
export async function decorateSupportMessage(message,element){
 const f=message.flags?.[ns]??{};if(f.supportChoice||f.supportControl){element.classList.add('sns-internal-message');return;}
 const r=f.supportUse;if(!r||element.querySelector('[data-sns-support]'))return;
 const actor=await fromUuid(r.actorUuid),item=await fromUuid(r.itemUuid),p=item&&jutsuProjection(item),box=el('section','','sns-target-resolution sns-support-controls');box.dataset.snsSupport='';
 if(r.status==='active'){
  const root=await fromUuid(r.rootUuid),m=supportData(root),permanent=m?.kind==='criar-arma'&&m.solid;
  box.append(el('strong',permanent?'Arma criada · permanente':root?.system.appliedCondition.active?'Técnica ativa':'Técnica encerrada','sns-save-state'),el('small','Chakra '+r.cost+' · '+supportElementLabel(m?.element)));
  if(permanent){const w=actor.items.get(m.createdId);box.append(el('p',(w?.name??'Arma')+' × '+m.quantity+' · '+m.size+' · Dureza '+m.hardness));if(w&&actor.isOwner)box.append(button('Abrir arma',()=>w.sheet.render({force:true})));}
  else if(root?.system.appliedCondition.active){
   if(actor.isOwner&&['afiar','lamina-de-raios','arma-eletrica'].includes(m.kind)){
    const weapons=m.kind==='lamina-de-raios'?[actor.items.find(i=>i.flags?.[ns]?.bladeHand===root.id)]:m.createdId?[actor.items.get(m.createdId)]:(m.targets??[]).flatMap(t=>t.itemIds.map(id=>actor.items.get(id))),source=actor.system.toObject(),stats=source.stats??Object.fromEntries(Object.entries(actor.system.derived?.combat??{}).map(([k,v])=>[k,v.precision]));
    for(const w of weapons.filter(Boolean))for(const c of weaponChecks(w,stats,source,actor.items).filter(c=>c.available)){const buttons=el('div','','sns-save-controls');buttons.append(button('Atacar · '+c.key.toUpperCase()+' '+c.display,()=>rollSupportAttack(root,w,c.key)),button('Dano',()=>postSheetDamage(actor,w,c.key,1)),button('Crítico',()=>postSheetDamage(actor,w,c.key,4)));box.append(buttons);}
   }
   if(m.kind==='lamina-de-raios'&&m.spent&&game.user.isGM)box.append(button('Capanga abatido · manter para outro ataque',()=>requestSupportControl(root,'capanga')));box.append(el('p',supportSummary(root,actor)));if(actor.isOwner){box.append(button(m.pending?'Sustentar · ação parcial':'Encerrar',()=>requestSupportControl(root,m.pending?'sustain':'end')));if(game.user.isGM&&!actorCombat(actor)?.started)box.append(button('Fim do turno · fora de combate',()=>requestSupportControl(root,'turnEnd')));}}
 }else if(p?.valid&&p.support&&actor.isOwner){
  if(r.reason)box.append(el('p',r.reason,'sns-effect-warning'));
  if(p.support.kind==='criar-arma'){
   const weapon=select('Arma ou munição',creationOptions(p.support).map(d=>({id:d.id,label:d.name+' × '+d.perCompartment}))),material=select('Material',p.support.element==='ninpou'?[{id:'solid',label:'Sólido e rígido · permanente'},{id:'fluid',label:'Não sólido · sustentado'}]:[{id:p.support.element==='doton'?'solid':'fluid',label:p.support.element==='doton'?'Sólido · permanente':'Não sólido · sustentado'}]),size=select('Tamanho',(['Minúsculo','Diminuto','Miúdo','Pequeno','Médio',...(p.support.stage>=6?['Grande','Enorme','Imenso','Colossal','Incrível']:[])]).map(id=>({id,label:id})));size.input.value='Médio';
   box.append(weapon.field,material.field,size.field,el('small','Dano da arma comum, sem bônus de dano elemental. Criar não concede treino nem dispensa atributos.'),button('Criar arma · Chakra1',()=>requestSupportChoice(message,{weaponId:weapon.input.value,solid:material.input.value==='solid',size:size.input.value})));
  }else if(p.support.kind==='energizar'){
   const options=energyOptions(actor),target=select('Arma, punhos ou lote',options),attribute=select('Atributo do dano',[{id:'esp',label:'Espírito'},{id:'original',label:'Manter Força / Destreza'}]);
   const chain=creationChain(actor,item),free=el('label','Usar imediatamente após Criar Arma · ação livre'),freeCheck=el('input');freeCheck.type='checkbox';free.prepend(freeCheck);if(chain)box.append(free);
   const fistRating=select('Punho de Ferro · atributo original do dano de arma',[{id:'esp',label:'Espírito original'},{id:'for',label:'Força original'}]);const updateFistField=()=>fistRating.field.hidden=target.input.value!=='fists';updateFistField();target.input.addEventListener('change',updateFistField);if(actor.items.some(i=>i.system.ruleId==='sns:apt:punho-de-ferro'||i.system.contentId==='sns:apt:punho-de-ferro'))box.append(fistRating.field);
   const second=select('Segunda arma · Ambidestria',[{id:'',label:'Somente uma arma'},...options.filter(o=>!o.fists&&!o.projectile&&!o.launcherId)]);
   box.append(target.field,attribute.field);if(actor.items.some(i=>i.system.ruleId==='sns:apt:ambidestria'||i.system.contentId==='sns:apt:ambidestria'))box.append(second.field);
   box.append(el('small','Punhos com Pele de Pedra: ação livre. Sem bônus elemental.3 chakra por arma; Ambidestria paga por cada uma. Cada botão de ataque lança um projétil do lote.'),button('Energizar',()=>requestSupportChoice(message,{targets:[target.input.value,...(second.input.value?[second.input.value]:[])],attribute:attribute.input.value,fistRatingAttribute:fistRating.input.value,...(chain&&freeCheck.checked?{freeAfter:chain.rootUuid}:{})})));
  }else if(['afiar','lamina-de-raios','arma-eletrica'].includes(p.support.kind)){
   const kind=p.support.kind;
   if(kind==='lamina-de-raios'){const label=el('label','Investida · +'+(p.usedLevel-3)+' DB · confira a distância e a ação padrão'),charge=el('input');charge.type='checkbox';label.prepend(charge);if(p.support.stage>=5)box.append(label);box.append(el('p','DB '+p.support.damage+' · '+p.data.action+' para preparar; um ataque CC como ação padrão.'),el('small','Surpresa: o alvo tem direito a Prontidão para ouvir o chiado. Aplique grau mínimo 2 e o ataque oportuno da Investida quando cabíveis.'),button('Preparar · Chakra '+p.cost,()=>requestSupportChoice(message,{charge:charge.checked})));}
   else{
    const mode=select('Modo',kind==='afiar'?[{id:'energize',label:'Afiar arma real'}]:[{id:'energize',label:'Energizar arma · Chakra3'},{id:'projectiles',label:'Criar projéteis · Chakra1'},{id:'blade',label:'Criar lâmina · Chakra4'}]),target=select('Arma ou lote',bladeEnergyOptions(actor,kind)),attribute=select('Atributo do dano',[{id:'esp',label:'Espírito'},{id:'original',label:'Manter Força / Destreza'}]),weapon=select('Criação elétrica',[]),stars=select('Shurikens por ataque',[{id:'1',label:'Uma shuriken'},{id:'3',label:'Três juntas · dano comum do poder'}]);
    const update=()=>{const creating=mode.input.value!=='energize';target.field.hidden=creating;attribute.field.hidden=creating;weapon.field.hidden=!creating;stars.field.hidden=kind!=='afiar'||!target.input.value||actor.items.get(target.input.value)?.system.contentId!=='sns:equipment:shuriken';weapon.input.replaceChildren();for(const d of electricCreationOptions(mode.input.value)){const o=el('option',d.name+' × '+d.perCompartment);o.value=d.id;weapon.input.append(o);}};mode.input.addEventListener('change',update);target.input.addEventListener('change',update);update();
    box.append(mode.field,target.field,attribute.field,weapon.field);if(kind==='afiar')box.append(stars.field);box.append(button(kind==='afiar'?'Afiar · Chakra '+p.cost:'Usar Arma Elétrica',()=>requestSupportChoice(message,{mode:mode.input.value,targets:[target.input.value],attribute:attribute.input.value,weaponId:weapon.input.value,shurikenCount:Number(stars.input.value)})));
   }
  }else{
   const keep=el('label','Sustentar após o uso · ação parcial'),check=el('input');check.type='checkbox';check.checked=true;keep.prepend(check);
   box.append(el('p','Dureza '+p.support.hardness+' até o fim do turno de uso; sustentada '+p.support.sustainedHardness+'.'),keep,button('Pele de Pedra · Chakra'+p.cost,()=>requestSupportChoice(message,{keep:check.checked})));
  }
 }
 if(box.children.length)(element.querySelector('.message-content')??element).append(box);
}
export function refreshSupportMessages(item){const uuid=supportData(item)?.activationUuid??item?.flags?.[ns]?.creation?.activationUuid,message=uuid&&game.messages.find(m=>m.uuid===uuid);if(message)ui.chat?.updateMessage(message);}
