export const ITEM_SCHEMA_VERSION=2;
// Additive migration: free tags, legacy details and numerical investments stay byte-for-byte values.
export function migrateItemSystem(input,{partial=false}={}){const source=structuredClone(input);if(!partial&&(source.schemaVersion??0)<2){source.traits??=[];source.power??={definitionId:'',choices:[]};source.jutsu??={effectId:'',selectionId:'',usedLevel:1,variant:'normal',overrides:[]};source.schemaVersion=2;}return source;}
