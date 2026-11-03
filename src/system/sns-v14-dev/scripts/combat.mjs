import {combatEvents} from './effect-duration.mjs';
import {queueCombatEvents,isTimekeeper} from './effect-lifecycle.mjs';
export class SnsCombat extends foundry.documents.Combat {
 _onUpdate(changed,options,userId){
  const prior={...this.current};
  super._onUpdate(changed,options,userId);
  if(!isTimekeeper()||options.turnEvents===false||!['round','turn'].some(k=>Object.hasOwn(changed,k)))return;
  try{const events=combatEvents(prior,this.current,Array.from(this.turns),this.id);if(events.length)queueCombatEvents(this,events);}
  catch(error){ui.notifications.error(error.message);}
 }
}
