import {installMessageIndex} from './message-index.mjs';
installMessageIndex();
import {installOwnedDamageHooks} from './damage-chat.mjs';
installOwnedDamageHooks();
import {installBookGrantHooks} from './book-grant-service.mjs';
installBookGrantHooks();
import {installPowerRecipeHooks} from './power-recipes.mjs';
installPowerRecipeHooks();
import {installProcessorAuthority} from './processor-authority.mjs';
installProcessorAuthority();
import {installNpcGeneratorHooks} from './npc-generator-ui.mjs';
import {decorateTechniqueText} from './technique-card.mjs';
import {decorateAreaMessage} from './area-service.mjs';
import {decorateNpcJutsu} from './npc-jutsu-ui.mjs';
import {acceptNpcSave} from './npc-jutsu-service.mjs';
import {installCraftHooks} from './crafting-service.mjs';
import {installPartyHooks} from './party-service.mjs';
import {installKuchiyoseHooks} from './kuchiyose-service.mjs';
import {decorateCraftMessage,refreshCraftMessages} from './crafting-ui.mjs';
import {installRestHooks} from './rest-service.mjs';
import {decorateTestVerdict} from './test-verdict.mjs';
import {decorateAdvancedEvent} from './advanced-ui.mjs';
import {decorateEnvironmentVision} from './environment-vision.mjs';
import {installEnvironmentHooks} from './environment-service.mjs';
import {decorateEnvironmentMessage,refreshEnvironmentMessage} from './environment-ui.mjs';
import {installSupportHooks} from './support-service.mjs';
import {decorateSupportMessage,refreshSupportMessages} from './support-ui.mjs';
import {installJutsuAutomationHooks} from './jutsu-automation.mjs';
import {installPhantasmHooks} from './phantasm-service.mjs';
import {decoratePhantasmMessage,refreshPhantasmMessages} from './phantasm-ui.mjs';
import {installMagenHooks} from './magen-service.mjs';
import {decorateMagenMessage,refreshMagenMessages} from './magen-ui.mjs';
import {decorateCombatInternals,refreshEffectMessages} from './combat-chat-ui.mjs';
import {installDefenseHooks} from './defense-workflow.mjs';
import {installTransformationHooks} from './transformation-service.mjs';
import {animateVitality} from './vitality-animation.mjs';
import {configureConditionStatuses,installConditionStatusHooks} from './token-conditions.mjs';
import {SnsCombat} from './combat.mjs';
import {SnsCatalog} from './catalog.mjs';
import { ShinobiData, ReferenceItemData, SupportingActorData } from "./models.mjs";
import { ITEM_PROFILES, ACTOR_PROFILES } from './sheet-profiles.mjs';
import { SupportingActorSheet } from './supporting-sheet.mjs';
import { SnsItem } from './item.mjs';
import { ShinobiActor } from "./actor.mjs";
import { ShinobiSheet } from "./sheet.mjs";
import { calculate, testSpec } from "./kernel.mjs";
import { ReferenceItemSheet } from "./item-sheet.mjs";
import { decorateChatCard } from './chat-card.mjs';
import {decorateJutsuUse,guardJutsuMessageUpdate} from './jutsu-application.mjs';
import {decorateDamageMessage,guardDamageMessage,refreshDamageMessages} from './damage-chat.mjs';
import {decorateVisualAttack} from './visual-attack.mjs';
import {installAttackSequenceHooks} from './attack-sequences.mjs';
import {archiveLegacyCompendia} from './legacy-compendia.mjs';
Hooks.once("init", () => {
  // Development servers cache the manifest. Load this stylesheet on clients even before their next server restart.
  if(!Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(link=>new URL(link.href,document.baseURI).pathname.endsWith('/styles/combat-ux.css'))){const style=document.createElement('link');style.rel='stylesheet';style.href='systems/sns-v14-dev/styles/combat-ux.css?v=d125';document.head.append(style);}
  CONFIG.Actor.documentClass = ShinobiActor;
  game.settings.register('sns-v14-dev','gobiVaporRevision',{name:'Gobi: Aceleração-Vapor revisada',hint:'Opção de mesa: AGI +1/+2/+3 nos níveis6/7/8. Desativada: regra original do Livro de Hijutsus.',scope:'world',config:true,type:Boolean,default:false});
  CONFIG.Combat.documentClass = SnsCombat;
  configureConditionStatuses();
  CONFIG.Item.documentClass = SnsItem;
  CONFIG.Actor.dataModels.shinobi = ShinobiData;
  for(const type of Object.keys(ITEM_PROFILES))CONFIG.Item.dataModels[type]=ReferenceItemData;
  for(const type of Object.keys(ACTOR_PROFILES))CONFIG.Actor.dataModels[type]=SupportingActorData;
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor,'sns-v14-dev',SupportingActorSheet,{types:Object.keys(ACTOR_PROFILES),makeDefault:true,label:'SNS · Atores de apoio'});
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "sns-v14-dev", ShinobiSheet, {
    types: ["shinobi"], makeDefault: true, label: "SNS · Ficha"
  });
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item,"sns-v14-dev",ReferenceItemSheet,{
    types:Object.keys(ITEM_PROFILES),makeDefault:true,label:"SNS · Itens e habilidades"
  });
  Handlebars.registerHelper("snsIsTab", (a, b) => a === b);
  game.sns = { calculate, testSpec, ShinobiSheet, openCatalog:()=>new SnsCatalog().render({force:true}) };
});
Hooks.once("ready", () => {
  console.info("SNS MF1 · ready", { version: game.system.version, foundry: game.version });
});
Hooks.on('snsProcessorReady',()=>archiveLegacyCompendia().catch(error=>console.error('SNS · arquivo de compêndios legados',error)));
Hooks.on('renderChatMessageHTML',decorateChatCard);
Hooks.on('renderChatMessageHTML',decorateCombatInternals);
Hooks.on('createItem',refreshEffectMessages);Hooks.on('updateItem',refreshEffectMessages);Hooks.on('deleteItem',refreshEffectMessages);
Hooks.on('renderChatMessageHTML',decorateJutsuUse);
Hooks.on('renderChatMessageHTML',decorateMagenMessage);
Hooks.on('createItem',refreshMagenMessages);Hooks.on('updateItem',refreshMagenMessages);
Hooks.on('renderChatMessageHTML',decorateDamageMessage);
Hooks.on('renderChatMessageHTML',decorateVisualAttack);
installAttackSequenceHooks();
Hooks.on('preUpdateChatMessage',guardDamageMessage);
Hooks.on('updateActor',refreshDamageMessages);
Hooks.on('updateActor',animateVitality);
installConditionStatusHooks();
installDefenseHooks();
installJutsuAutomationHooks();
installMagenHooks();
installPhantasmHooks();
Hooks.on('renderChatMessageHTML',decoratePhantasmMessage);
Hooks.on('updateItem',refreshPhantasmMessages);
installTransformationHooks();
Hooks.on('preUpdateChatMessage',guardJutsuMessageUpdate);

for(const hook of ['renderCompendiumDirectory','renderItemDirectory'])Hooks.on(hook,(app)=>{const root=app.element;if(!root||root.querySelector('.sns-open-catalog'))return;const button=document.createElement('button');button.type='button';button.className='sns-open-catalog';button.innerHTML='<i class="fa-solid fa-magnifying-glass"></i> Navegador SNS';button.addEventListener('click',()=>new SnsCatalog().render({force:true}));(root.querySelector('.directory-footer')??root).append(button);});

installSupportHooks();
Hooks.on('renderChatMessageHTML',decorateSupportMessage);
Hooks.on('updateItem',refreshSupportMessages);

installEnvironmentHooks();
Hooks.on('renderChatMessageHTML',decorateEnvironmentMessage);
Hooks.on('updateItem',refreshEnvironmentMessage);

Hooks.on('renderChatMessageHTML',decorateEnvironmentVision);
Hooks.on('renderChatMessageHTML',decorateAdvancedEvent);
Hooks.on('renderChatMessageHTML',decorateTestVerdict);
installRestHooks();
installCraftHooks();
installPartyHooks();
installNpcGeneratorHooks();
installKuchiyoseHooks();
Hooks.on('renderChatMessageHTML',decorateCraftMessage);
Hooks.on('updateActor',refreshCraftMessages);

Hooks.on('renderChatMessageHTML',decorateNpcJutsu);
Hooks.on('createChatMessage',message=>acceptNpcSave(message).catch(error=>ui.notifications.warn(error.message)));

Hooks.on('renderChatMessageHTML',decorateAreaMessage);

Hooks.on('renderChatMessageHTML',decorateTechniqueText);

Hooks.on('renderActorDirectory',(app,element)=>{const root=element instanceof HTMLElement?element:element?.[0]??app.element;if(!root)return;root.querySelector('.sns-first-sheet')?.remove();const owned=Array.from(game.actors).some(a=>a.type==='shinobi'&&a.isOwner);if(owned&&!game.user.isGM)return;const note=document.createElement('p');note.className='sns-first-sheet';note.textContent=game.user.isGM?'Primeira ficha: crie um Shinobi e dê ao jogador a permissão Dono em Configurar propriedade.':game.user.can?.('ACTOR_CREATE')?'Use Criar ator e escolha Shinobi. Depois abra Criação do personagem na ficha.':'O mestre cria sua ficha e concede a permissão Dono. Ela aparecerá aqui; abra Criação do personagem para começar.';(root.querySelector('.directory-header')??root).append(note);});
