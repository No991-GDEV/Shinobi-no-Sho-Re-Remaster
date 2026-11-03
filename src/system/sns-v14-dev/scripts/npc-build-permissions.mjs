const ns='sns-v14-dev';
const fields=['npcGenerator','prerequisiteEvents','npcGeneratorCompanion','puppetMaster','puppetUses','puppetReloads'];
export function mayCreateNpcBuild(data,isGM){return !!isGM||fields.every(k=>!Object.hasOwn(data.flags?.[ns]??{},k));}
export function mayEditNpcBuild(before,after,isGM){return !!isGM||fields.every(k=>JSON.stringify(before.flags?.[ns]?.[k]??null)===JSON.stringify(after.flags?.[ns]?.[k]??null));}
