import {NPC_SKILL_CORRECTIONS} from '../data/source-review-d165.mjs';
import {SKILLS} from './rules.mjs';
// A precision (including Perito/temporary bonuses) is never a skill level.
export function recordedSkillLevel(actor,key){
 const bought=actor?.system?.skills?.[key]?.bought,definition=SKILLS.find(s=>s.key===key),attribute=actor?.system?.attributes?.[definition?.attribute];
 if(Number.isInteger(bought)&&Number.isInteger(attribute))return Math.ceil(attribute/2)+bought;
 let levels=actor?.system?.skillLevels;
 const profile=actor?.flags?.['sns-v14-dev']?.animeProfile;
 if(actor?.type==='npc'&&profile){
  const correction=NPC_SKILL_CORRECTIONS.find(c=>c.sourcePath===profile.sourcePath&&c.sha256===profile.sha256&&JSON.stringify(c.before)===JSON.stringify(levels));
  if(correction)levels=correction.after;
 }
 return Number.isInteger(levels?.[key])?levels[key]:null;
}
