import {SnsHandlebarsApplicationMixin} from './view-state.mjs';
import {OPTIONAL_SOURCES,sourceEnabled,optionalPackOwnership} from '../data/optional-sources.mjs';
import {isProcessor} from './processor-authority.mjs';
const ns='sns-v14-dev';
export class SnsSystemSettings extends SnsHandlebarsApplicationMixin(foundry.applications.api.ApplicationV2){
 static DEFAULT_OPTIONS={tag:'form',classes:['sns-editor-dialog','sns-system-settings'],position:{width:650,height:'auto'},window:{title:'Configurações do sistema',resizable:true},form:{handler:SnsSystemSettings.save,closeOnSubmit:false}};
 static PARTS={settings:{template:'systems/sns-v14-dev/templates/system-settings.hbs',scrollable:['']}};
 async _prepareContext(){return {customEyes:game.settings.get(ns,'legadoCustomEyes'),isGM:game.user.isGM,sources:OPTIONAL_SOURCES.map(s=>({...s,enabled:sourceEnabled(s.id)})),gobi:game.settings.get(ns,'gobiVaporRevision'),animation:game.settings.get(ns,'vitalityAnimation'),dialogs:game.user.getFlag(ns,'showCheckDialogs')!==false};}
 static async save(event,form){
  const value=name=>form.elements.namedItem(name)?.checked===true;
  let reload=false;
  if(game.user.isGM){for(const source of OPTIONAL_SOURCES){const next=value(source.key);if(next!==sourceEnabled(source.id)){await game.settings.set(ns,source.key,next);reload=true;}}
   if(value('legadoCustomEyes')!==game.settings.get(ns,'legadoCustomEyes')){await game.settings.set(ns,'legadoCustomEyes',value('legadoCustomEyes'));reload=true;}
   if(value('gobiVaporRevision')!==game.settings.get(ns,'gobiVaporRevision')){await game.settings.set(ns,'gobiVaporRevision',value('gobiVaporRevision'));reload=true;}}
  await game.settings.set(ns,'vitalityAnimation',value('vitalityAnimation'));
  if(value('showCheckDialogs')!==(game.user.getFlag(ns,'showCheckDialogs')!==false))await game.user.setFlag(ns,'showCheckDialogs',value('showCheckDialogs'));
  if(game.user.isGM)await reconcileOptionalPacks();
  await this.close();if(reload)await foundry.applications.settings.SettingsConfig.reloadConfirm({world:true});else ui.notifications.info('Configurações salvas.');
 }
}
export async function reconcileOptionalPacks(){
 if(!isProcessor())return;
 const saved=game.settings.get('core','compendiumConfiguration')??{};
 for(const source of OPTIONAL_SOURCES){const pack=game.packs.get(source.pack);if(!pack)continue;const desired=optionalPackOwnership(sourceEnabled(source.id)),current=saved[source.pack]?.ownership??pack.metadata.ownership;if(JSON.stringify(current)!==JSON.stringify(desired))await pack.configure({ownership:desired,locked:true});}
}
export function hideDisabledSourcePacks(app){
 const root=app.element;if(!root)return;
 for(const node of root.querySelectorAll('[data-pack],[data-pack-id],[data-entry-id]')){const id=node.dataset.pack??node.dataset.packId??node.dataset.entryId,source=OPTIONAL_SOURCES.find(s=>s.pack===id);if(source)node.hidden=!sourceEnabled(source.id);}
}
export function installSystemSettingsHooks(){
 Hooks.once('init',()=>{
  game.settings.registerMenu(ns,'settingsPanel',{name:'Configurações do sistema',label:'Abrir configurações',hint:'Fontes opcionais, regras da mesa e preferências de interface.',icon:'fa-solid fa-sliders',type:SnsSystemSettings,restricted:false});
  for(const s of OPTIONAL_SOURCES)game.settings.register(ns,s.key,{name:s.label,hint:s.hint,scope:'world',config:true,type:Boolean,default:s.default,requiresReload:true});
  game.settings.register(ns,'legadoCustomEyes',{name:'Legado: par de olhos customizado',hint:'Permite escolher as técnicas de cada olho individualmente. Regra opcional do Legado, desativada por padrão.',scope:'world',config:true,type:Boolean,default:false,requiresReload:true});
  game.settings.register(ns,'gobiVaporRevision',{name:'Gobi: Aceleração-Vapor revisada',hint:'AGI +1/+2/+3 nos níveis 6/7/8. Desativada: regra original do Livro de Hijutsus.',scope:'world',config:true,type:Boolean,default:false,requiresReload:true});
  game.settings.register(ns,'vitalityAnimation',{name:'Números de dano e cura nos tokens',hint:'Mostra a variação de Vitalidade sobre os tokens visíveis. Preferência deste navegador.',scope:'client',config:true,type:Boolean,default:true});
 });
 Hooks.on('snsProcessorReady',()=>reconcileOptionalPacks().catch(console.error));
 Hooks.on('renderCompendiumDirectory',hideDisabledSourcePacks);
}
