import {isManagedParty,isPartyCreature,memberUuids,validatePartyMembers,shouldRefreshPartyDirectory} from './party-core.mjs';
import {isTimekeeper,withEffectLock} from './effect-lifecycle.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev';let starting;
export const NO_PRIMARY_PARTY='none';
export async function ensurePrimaryParty(){
 if(!isTimekeeper())return null;if(starting)return starting;
 starting=(async()=>{
  const selected=game.settings.get(ns,'primaryParty'),known=game.actors.get(selected);
  if(selected===NO_PRIMARY_PARTY)return null;
  if(known?.type==='party')return known;
  // A saved ID without an actor means the GM removed the primary party.
  if(selected){await game.settings.set(ns,'primaryParty',NO_PRIMARY_PARTY);return null;}
  let party=game.actors.find(a=>isManagedParty(a)&&a.flags[ns].partyManaged.primary);
  if(!party)party=await foundry.documents.Actor.create({name:'Equipe',type:'party',ownership:{default:2},flags:{[ns]:{partyManaged:{version:1,primary:true}}}});
  if(party)await game.settings.set(ns,'primaryParty',party.id);return party;
 })();try{return await starting;}finally{starting=null;}
}
export async function rememberDeletedParty(party){if(isTimekeeper()&&party.type==='party'&&game.settings.get(ns,'primaryParty')===party.id)await game.settings.set(ns,'primaryParty',NO_PRIMARY_PARTY);}
export async function deleteParty(party){
 if(!game.user.isGM||!party?.isOwner||!isManagedParty(party))throw Error('Somente o mestre pode excluir esta equipe.');
 const confirmed=await foundry.applications.api.DialogV2.confirm({classes:['sns-editor-dialog'],window:{title:'Excluir equipe'},content:'<p>Excluir a ficha da equipe <strong>'+esc(party.name)+'</strong>?</p><p>O depósito, as notas e os vínculos desta equipe serão removidos. As fichas dos integrantes e suas pastas serão mantidas.</p>',yes:{label:'Excluir equipe'},no:{label:'Cancelar',default:true}});
 if(!confirmed)return null;
 return withEffectLock(party,async()=>{if(!game.user.isGM||!party.isOwner||!game.actors.has(party.id))return null;const result=await party.delete();if(result)await rememberDeletedParty(party);return result;});
}
export async function createParty(){
 if(!game.user.isGM)return null;
 const name=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Criar equipe'},content:'<label>Nome da equipe<input name="name" value="Equipe" required></label>',ok:{label:'Criar equipe',callback:(e,b)=>b.form.elements.name.value.trim()}});
 if(!name)return null;const party=await foundry.documents.Actor.create({name,type:'party',ownership:{default:2},flags:{[ns]:{partyManaged:{version:1,primary:false}}}});if(party)await party.sheet.render({force:true});return party;
}
export async function changePartyMembers(party,{add=[],remove=[]}={}){
 if(!game.user.isGM||!party?.isOwner||party.type!=='party')throw Error('O mestre organiza os integrantes da equipe.');
 return withEffectLock(party,async()=>{
  const next=memberUuids(party).filter(uuid=>!remove.includes(uuid));for(const uuid of add)if(!next.includes(uuid))next.push(uuid);
  validatePartyMembers(party,next,game.actors);await party.update({'system.members':next,'system.activities':party.system.activities.filter(a=>next.includes(a.member))});return party;
 });
}
export async function choosePartyMember(party){
 if(!game.user.isGM)return;
 const candidates=game.actors.filter(a=>isPartyCreature(a)&&!memberUuids(party).includes(a.uuid));
 if(!candidates.length)return ui.notifications.info('Nenhuma outra ficha disponível para adicionar.');
 const selected=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Adicionar integrante'},content:'<label>Ficha<select name="member">'+candidates.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(a=>'<option value="'+a.uuid+'">'+esc(a.name)+'</option>').join('')+'</select></label>',ok:{label:'Adicionar',callback:(e,b)=>b.form.elements.member.value}});
 if(selected)await changePartyMembers(party,{add:[selected]});
}
async function newPartyCharacter(party){
 if(!game.user.isGM)return;
 const name=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Novo personagem da equipe'},content:'<label>Nome<input name="name" autofocus></label>',ok:{label:'Criar personagem',callback:(e,b)=>b.form.elements.name.value.trim()}});
 if(!name)return;const actor=await foundry.documents.Actor.create({name,type:'shinobi'});if(actor){await changePartyMembers(party,{add:[actor.uuid]});await actor.sheet.render({force:true});}
}
export async function decoratePartyDirectory(app,element){
 const root=element instanceof HTMLElement?element:element?.[0];if(!root)return;
 root.querySelector('.sns-parties')?.remove();root.querySelectorAll('[data-sns-party-hidden]').forEach(e=>e.removeAttribute('data-sns-party-hidden'));
 const parties=game.actors.filter(a=>isManagedParty(a)&&a.testUserPermission(game.user,'OBSERVER'));if(!parties.length&&!game.user.isGM)return;
 const section=document.createElement('section');section.className='sns-parties';section.setAttribute('aria-label','Equipes');
 if(game.user.isGM){const button=document.createElement('button');button.type='button';button.className='party-create';button.innerHTML='<i class="fa-solid fa-plus"></i> Criar equipe';button.addEventListener('click',()=>createParty());section.append(button);}
 const expanded=game.user.getFlag(ns,'partyOpen')??{},hidden=new Set();
 for(const party of parties){
  const uuids=memberUuids(party),members=uuids.map(uuid=>game.actors.get(uuid.slice(6))).filter(a=>a?.testUserPermission(game.user,'OBSERVER'));hidden.add(party.id);for(const a of members)hidden.add(a.id);
  const folder=document.createElement('section');folder.className='sns-party-folder';folder.dataset.partyId=party.id;
  folder.innerHTML='<header><button type="button" class="party-toggle" aria-label="Expandir ou recolher '+esc(party.name)+'"><i class="fa-solid fa-folder-open"></i></button><button type="button" class="party-open" title="Abrir ficha da equipe" aria-label="Abrir ficha de '+esc(party.name)+'"><i class="fa-solid fa-file-lines"></i></button><strong>'+esc(party.name)+'</strong>'+(game.user.isGM?'<button type="button" class="party-add" aria-label="Adicionar integrante a '+esc(party.name)+'"><i class="fa-solid fa-user-plus"></i></button><button type="button" class="party-new" aria-label="Criar personagem em '+esc(party.name)+'"><i class="fa-solid fa-plus"></i></button>':'')+'</header><ol '+(expanded[party.id]===false?'hidden':'')+'>'+members.map(a=>'<li draggable="true" data-member-uuid="'+a.uuid+'"><img src="'+esc(a.img)+'" alt=""><button type="button" class="party-member-open">'+esc(a.name)+'</button>'+(game.user.isGM?'<button type="button" class="party-remove" aria-label="Retirar '+esc(a.name)+' da equipe"><i class="fa-solid fa-xmark"></i></button>':'')+'</li>').join('')+(!members.length?'<li class="party-empty">Nenhum integrante visível. '+(game.user.isGM?'Arraste fichas para esta equipe.':'')+'</li>':'')+'</ol>';
  const list=folder.querySelector('ol');folder.querySelector('.party-toggle').addEventListener('click',async()=>{list.hidden=!list.hidden;await game.user.setFlag(ns,'partyOpen',{...game.user.getFlag(ns,'partyOpen'),[party.id]:!list.hidden});});
  if(game.user.isGM){const button=document.createElement('button');button.type='button';button.className='party-delete';button.title='Excluir equipe';button.setAttribute('aria-label','Excluir equipe '+party.name);button.innerHTML='<i class="fa-solid fa-trash"></i>';button.addEventListener('click',()=>deleteParty(party));folder.querySelector('header').append(button);}
  folder.querySelector('.party-open').addEventListener('click',()=>party.sheet.render({force:true}));
  folder.querySelector('.party-add')?.addEventListener('click',()=>choosePartyMember(party));folder.querySelector('.party-new')?.addEventListener('click',()=>newPartyCharacter(party));
  for(const row of folder.querySelectorAll('[data-member-uuid]')){
   row.querySelector('.party-member-open').addEventListener('click',()=>game.actors.get(row.dataset.memberUuid.slice(6))?.sheet.render({force:true}));
   row.querySelector('.party-remove')?.addEventListener('click',()=>changePartyMembers(party,{remove:[row.dataset.memberUuid]}));
   row.addEventListener('dragstart',e=>{e.stopPropagation();const actor=game.actors.get(row.dataset.memberUuid.slice(6));e.dataTransfer.setData('text/plain',JSON.stringify(actor.toDragData()));});
  }
  folder.addEventListener('dragover',e=>{if(game.user.isGM){e.preventDefault();e.stopPropagation();}});
  folder.addEventListener('drop',async e=>{if(!game.user.isGM)return;e.preventDefault();e.stopPropagation();try{const data=JSON.parse(e.dataTransfer.getData('text/plain')),actor=await fromUuid(data.uuid);if(data.type!=='Actor'||!actor||actor.pack)throw Error('Arraste uma ficha já criada neste mundo.');await changePartyMembers(party,{add:[actor.uuid]});}catch(error){ui.notifications.warn(error.message);}});
  section.append(folder);
 }
 const directory=root.querySelector('.directory-list');if(!directory)return;directory.prepend(section);
 for(const row of root.querySelectorAll('.directory-item[data-entry-id]'))if(hidden.has(row.dataset.entryId))row.setAttribute('data-sns-party-hidden','');
 const search=root.querySelector('[name="search"]');search?.addEventListener('input',()=>{const q=search.value.toLocaleLowerCase('pt-BR').trim();for(const row of section.querySelectorAll('[data-member-uuid]'))row.hidden=q&&!row.textContent.toLocaleLowerCase('pt-BR').includes(q);for(const f of section.querySelectorAll('.sns-party-folder'))if(q)f.querySelector('ol').hidden=false;});
}
export function installPartyHooks(){
 Hooks.once('init',()=>game.settings.register(ns,'primaryParty',{scope:'world',config:false,type:String,default:''}));
 Hooks.on('snsProcessorReady',()=>ensurePrimaryParty().catch(error=>console.error('SNS · equipe',error)));
 Hooks.on('renderActorDirectory',decoratePartyDirectory);
 const refresh=async()=>{const app=ui.actors;if(!app?.rendered)return;const top=app.element?.querySelector('.directory-list')?.scrollTop;await app.render({force:true});if(Number.isFinite(top)){const list=app.element?.querySelector('.directory-list');if(list)list.scrollTop=top;}};
 const update=a=>{void refresh().catch(console.error);};
 Hooks.on('updateActor',(a,changes)=>{if(shouldRefreshPartyDirectory(a,changes))update(a);});Hooks.on('createActor',update);Hooks.on('deleteActor',a=>{void rememberDeletedParty(a).catch(console.error);update(a);});
}
