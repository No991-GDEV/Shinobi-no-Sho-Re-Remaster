import {isPartyActor,isPartyCreature,memberUuids,resolveActiveParty,partitionParties,filterPartyTree} from './party-core.mjs';
import {activateParty,createParty,choosePartyMember,newPartyCharacter,changePartyMembers} from './party-service.mjs';

const ns='sns-v14-dev';
const BaseActorDirectory=globalThis.foundry?.applications?.sidebar?.tabs?.ActorDirectory??class{};

export function createSnsActorDirectory(Base=BaseActorDirectory){
 class SnsActorDirectoryImpl extends Base{
  static DEFAULT_OPTIONS={
   actions:{
    togglePartyFolder:SnsActorDirectoryImpl.#togglePartyFolder,
    openPartySheet:SnsActorDirectoryImpl.#openPartySheet,
    activateParty:SnsActorDirectoryImpl.#activateParty,
    createParty:SnsActorDirectoryImpl.#createParty,
    addPartyMember:SnsActorDirectoryImpl.#addPartyMember,
    createPartyMember:SnsActorDirectoryImpl.#createPartyMember
   },
   renderUpdateKeys:[...(Base.DEFAULT_OPTIONS?.renderUpdateKeys??[]),'system.members','system.nc','flags.sns-v14-dev.partyManaged']
  };

  static PARTS=(()=>{
   const base={...(Base.PARTS??{})};
   base.parties={template:'systems/sns-v14-dev/templates/partials/party-directory.hbs'};
   return base;
  })();

  static _entryPartial=Base._entryPartial??'templates/sidebar/partials/document-partial.hbs';

  #extraFolders=null;
  #draggingParty=false;

  #folderState(){
   if(this.#extraFolders===null){
    const saved=globalThis.game?.user?.getFlag?.(ns,'partyOpen');
    this.#extraFolders=saved&&typeof saved==='object'?{...saved}:{};
   }
   return this.#extraFolders;
  }

  #visibleParties(){
   const actors=Array.from(this.collection??globalThis.game?.actors??[]);
   const user=globalThis.game?.user;
   return actors.filter(a=>isPartyActor(a)&&(!user||a.testUserPermission(user,'OBSERVER')));
  }

  #visibleMembers(party){
   const collection=this.collection??globalThis.game?.actors;
   const user=globalThis.game?.user;
   return memberUuids(party)
    .map(uuid=>collection?.get?.(uuid.slice(6)))
    .filter(a=>a&&(!user||a.testUserPermission(user,'OBSERVER')));
  }

  #hiddenIds(parties){
   const ids=new Set();
   for(const party of parties){
    ids.add(party.id);
    for(const m of this.#visibleMembers(party))ids.add(m.id);
   }
   return ids;
  }

  #partyContext(party,activeId,state){
   if(!party)return null;
   const active=party.id===activeId;
   const expanded=Object.hasOwn(state,party.id)?state[party.id]!==false:active;
   return {
    id:party.id,
    name:party.name,
    img:party.img||'systems/sns-v14-dev/assets/pf-actor-party.svg',
    active,
    expanded,
    members:this.#visibleMembers(party)
   };
  }

  async _preparePartContext(partId,context,options){
   const result=await super._preparePartContext(partId,context,options);
   if(partId!=='parties')return result;
   const state=this.#folderState();
   const parties=this.#visibleParties();
   const settingId=globalThis.game?.settings?.get?.(ns,'primaryParty')??'';
   const active=resolveActiveParty(parties,settingId);
   const {activeParty,otherParties}=partitionParties(parties,active);
   const activeCtx=this.#partyContext(activeParty,activeParty?.id,state);
   const othersCtx=otherParties.map(p=>this.#partyContext(p,activeParty?.id,state));
   const isGM=!!globalThis.game?.user?.isGM;
   return Object.assign(result,{
    activeParty:activeCtx,
    otherParties:othersCtx,
    multipleOthers:othersCtx.length>1,
    otherPartiesExpanded:state.otherParties===true,
    showCreateButton:isGM&&othersCtx.length<=1,
    hasParties:parties.length>0,
    isGM,
    documentCls:(this.documentName??'Actor').toLowerCase(),
    entryPartial:this.constructor._entryPartial
   });
  }

  async _prepareDirectoryContext(context,options){
   await super._prepareDirectoryContext(context,options);
   const parties=this.#visibleParties();
   if(parties.length&&context.tree)context.tree=filterPartyTree(context.tree,this.#hiddenIds(parties));
  }

  render(options={}){
   if(Array.isArray(options.parts)&&options.parts.includes('parties')&&!options.parts.includes('directory')){
    options.parts=[...options.parts,'directory'];
   }
   return super.render(options);
  }

  async _onRender(context,options){
   if(options?.parts?.includes('directory')&&this.parts?.parties&&this.parts?.directory){
    this.parts.parties.remove();
    this.parts.directory.prepend(this.parts.parties);
   }
   await super._onRender(context,options);
  }

  collapseAll(){
   super.collapseAll();
   const state=this.#folderState();
   for(const el of this.element?.querySelectorAll?.('.sns-parties .directory-item.folder')??[]){
    el.classList.remove('expanded');
    const id=el.dataset.entryId;
    if(id)state[id]=false;
   }
  }

  _onSearchFilter(event,query,rgx,html){
   super._onSearchFilter(event,query,rgx,html);
   const state=this.#folderState();
   const root=html??this.element;
   const folders=root?.querySelectorAll?.('.sns-parties .folder')??[];
   for(const folder of folders){
    const id=folder.dataset.entryId??'';
    if(query){
     const hasVisibleMember=Array.from(folder.querySelectorAll('.directory-item.entry')).some(el=>el.style.display!=='none');
     const name=folder.querySelector(':scope > .folder-header .folder-name')?.textContent??'';
     const match=hasVisibleMember||(rgx?rgx.test(name):false);
     folder.style.display=match?'flex':'none';
     folder.classList.toggle('expanded',match);
    }else{
     folder.style.display='';
     const expanded=id==='otherParties'?state.otherParties===true:(Object.hasOwn(state,id)?state[id]!==false:!!folder.querySelector(':scope > .folder-header.active'));
     folder.classList.toggle('expanded',expanded);
    }
   }
  }

  _createContextMenus(){
   this._createContextMenu(this._getFolderContextOptions,'.folder:not([data-party]):not(.other-parties) > .folder-header',{fixed:true,hookName:'getFolderContextOptions',parentClassHooks:false});
   this._createContextMenu(this._getEntryContextOptions,'.directory-item[data-entry-id]:not(.other-parties)',{fixed:true,hookName:`get${this.documentName??'Actor'}ContextOptions`,parentClassHooks:false});
  }

  _getEntryContextOptions(){
   const options=super._getEntryContextOptions();
   const collection=this.collection??globalThis.game?.actors;
   const settingId=()=>globalThis.game?.settings?.get?.(ns,'primaryParty')??'';
   options.push(
    {
     label:'Definir como equipe ativa',
     icon:'fa-solid fa-star',
     visible:li=>{
      if(!globalThis.game?.user?.isGM||!li.matches('[data-party]'))return false;
      const party=collection?.get?.(li.dataset.entryId);
      const active=resolveActiveParty(collection,settingId());
      return isPartyActor(party)&&active?.id!==party.id;
     },
     onClick:(event,li)=>activateParty(collection?.get?.(li.dataset.entryId))
    },
    {
     label:'Remover da equipe',
     icon:'fa-solid fa-eject',
     visible:li=>!!globalThis.game?.user?.isGM&&!!li.closest('[data-party]')&&!li.matches('[data-party]'),
     onClick:(event,li)=>{
      const actor=collection?.get?.(li.dataset.entryId);
      const party=collection?.get?.(li.closest('[data-party]')?.dataset.entryId);
      if(actor&&isPartyActor(party))return changePartyMembers(party,{remove:[actor.uuid]});
     }
    }
   );
   return options;
  }

  _onDragStart(event){
   if(event.currentTarget?.dataset?.entryId==='otherParties'){event.preventDefault?.();return;}
   super._onDragStart(event);
   const entryId=event.currentTarget?.dataset?.entryId;
   const doc=entryId?this.collection?.get?.(entryId):null;
   this.#draggingParty=isPartyActor(doc);
   const partyId=event.currentTarget?.closest?.('[data-party]')?.dataset?.entryId;
   if(partyId&&!this.#draggingParty&&event.dataTransfer){
    try{
     const raw=event.dataTransfer.getData('text/plain');
     const payload=raw?JSON.parse(raw):{};
     payload.fromParty=partyId;
     event.dataTransfer.setData('text/plain',JSON.stringify(payload));
    }catch{}
   }
  }

  _onDragHighlight(event){
   if(event.type==='dragenter'&&this.#draggingParty){event.stopPropagation?.();return;}
   super._onDragHighlight(event);
  }

  async _handleDroppedEntry(target,data){
   if(!data?.uuid)return super._handleDroppedEntry(target,data);
   const collection=this.collection??globalThis.game?.actors;
   const targetPartyEl=target?.closest?.('[data-party]');
   targetPartyEl?.classList?.remove?.('droptarget');
   const targetParty=targetPartyEl?collection?.get?.(targetPartyEl.dataset.entryId):null;
   const sourceParty=data.fromParty?collection?.get?.(data.fromParty):null;
   const entry=await this._getDroppedEntryFromData(data);
   if(!entry)return;
   if(isPartyActor(entry))return;
   if(globalThis.game?.user?.isGM){
    if(isPartyActor(targetParty)&&isPartyCreature(entry)){
     const exists=typeof this._entryAlreadyExists==='function'?this._entryAlreadyExists(entry):!entry.pack&&!!collection?.get?.(entry.id);
     if(!exists){
      const created=typeof this._createDroppedEntry==='function'
       ?await this._createDroppedEntry(entry,{folder:null})
       :await globalThis.foundry.documents.Actor.create({...entry.toObject(),folder:null},{render:false});
      if(created)await changePartyMembers(targetParty,{add:[created.uuid]});
      return;
     }
     if(isPartyActor(sourceParty)&&sourceParty.id!==targetParty.id){
      await changePartyMembers(sourceParty,{remove:[entry.uuid]});
      await changePartyMembers(targetParty,{add:[entry.uuid]});
      return;
     }
     if(!sourceParty){
      await changePartyMembers(targetParty,{add:[entry.uuid]});
      return;
     }
     return;
    }
    if(isPartyActor(sourceParty)&&!isPartyActor(targetParty)){
     await changePartyMembers(sourceParty,{remove:[entry.uuid]});
    }
   }
   return super._handleDroppedEntry(target,data);
  }

  static async #togglePartyFolder(event,target){
   const btn=event?.target?.closest?.('button[data-action]');
   if(btn&&btn!==target)return;
   const li=target?.closest?.('li.directory-item.folder');
   const id=li?.dataset?.entryId;
   if(!li||!id)return;
   const expanded=!li.classList.contains('expanded');
   li.classList.toggle('expanded',expanded);
   const state=this.#folderState();
   state[id]=expanded;
   this.isPopout&&this.setPosition?.();
   await globalThis.game?.user?.setFlag?.(ns,'partyOpen',{...state});
  }

  static async #openPartySheet(event,target){
   event?.stopPropagation?.();
   const id=target?.closest?.('[data-entry-id]')?.dataset?.entryId;
   const party=(this.collection??globalThis.game?.actors)?.get?.(id);
   await party?.sheet?.render?.({force:true});
  }

  static async #activateParty(event,target){
   event?.stopPropagation?.();
   const id=target?.closest?.('[data-entry-id]')?.dataset?.entryId;
   await activateParty((this.collection??globalThis.game?.actors)?.get?.(id));
  }

  static async #createParty(event){
   event?.stopPropagation?.();
   const party=await createParty();
   if(party){
    const state=this.#folderState();
    state[party.id]=true;
    await globalThis.game?.user?.setFlag?.(ns,'partyOpen',{...state});
   }
  }

  static async #addPartyMember(event,target){
   event?.stopPropagation?.();
   const id=target?.closest?.('[data-entry-id]')?.dataset?.entryId;
   const party=(this.collection??globalThis.game?.actors)?.get?.(id);
   if(party)await choosePartyMember(party);
  }

  static async #createPartyMember(event,target){
   event?.stopPropagation?.();
   const id=target?.closest?.('[data-entry-id]')?.dataset?.entryId;
   const party=(this.collection??globalThis.game?.actors)?.get?.(id);
   if(party){
    const state=this.#folderState();
    state[party.id]=true;
    await newPartyCharacter(party);
   }
  }
 }
 return SnsActorDirectoryImpl;
}

export const SnsActorDirectory=createSnsActorDirectory();
