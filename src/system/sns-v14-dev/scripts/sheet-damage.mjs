import {weaponDamageProfile,recordedDamageProfile,damageSnapshot} from './damage-source.mjs';
import {showDamage} from './damage-chat.mjs';
import {escapeHtml as esc} from './kernel.mjs';
import {weaponChecks} from './weapon-checks.mjs';
export async function postSheetDamage(actor,item,key,grade){
 if(!actor.isOwner||![1,4].includes(grade))return;
 if(item?.type==='weapon'){
  const source=actor.system.toObject(),stats=source.stats??Object.fromEntries(Object.entries(actor.system.derived?.combat??{}).map(([k,v])=>[k,v.precision]));
  if(!weaponChecks(item,stats,source,actor.items).some(row=>row.key===key&&row.available))return ui.notifications.warn('Confira a forma de ataque, a quantidade e se a arma está em uso.');
 }
 const profile=item?.type==='weapon'?weaponDamageProfile(actor,item,key):recordedDamageProfile(item);
 if(!profile)return ui.notifications.warn('Defina o dano deste ataque ou técnica.');
 const packet=damageSnapshot(actor,item,profile,Array.from(game.user.targets??[]));packet.requestedGrade=grade;
 const message=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:'<div class="sns-chat-flavor"><strong>'+esc(item.name)+'</strong><p>'+(grade===4?'Crítico · GD 4':'Dano direto · GD 1')+'</p><small>Sem nova rolagem de ataque. Confira o acerto e o grau antes de aplicar.</small></div>',flags:{'sns-v14-dev':{damageUse:packet}}});
 await showDamage(message);return message;
}
