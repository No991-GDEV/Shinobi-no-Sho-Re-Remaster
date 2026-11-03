// Only newly generated NPCs may select the workbook's fixed Perception defense.
export function npcFixedDefenseKey(actor){return actor.type==='npc'&&actor.flags?.['sns-v14-dev']?.npcGenerator?.version===1&&actor.flags['sns-v14-dev'].npcGenerator.defenseKey==='lm'?'lm':'esq';}
