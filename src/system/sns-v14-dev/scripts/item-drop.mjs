// Copying a catalogue power creates a record, never another actor's learned choices.
export function powerCopyData(source){const data=structuredClone(source);delete data._id;data.folder=null;if(data.system?.power)data.system.power.choices=[];return data;}
export async function copyDroppedPower(actor,item){if(!actor.isOwner)return null;const [copy]=await actor.createEmbeddedDocuments('Item',[powerCopyData(item.toObject())]);ui.notifications.info('Poder copiado. Registre a aquisição e as escolhas próprias do ator.');return copy;}
