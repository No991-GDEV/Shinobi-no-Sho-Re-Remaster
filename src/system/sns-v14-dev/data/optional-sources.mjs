export const OPTIONAL_SOURCES=Object.freeze([
 {id:'legado-do-odio',key:'enableLegadoDoOdio',label:'Legado do Ódio',pack:'sns-conteudo-dev.legado-do-odio',file:'modules/sns-conteudo-dev/content/legado-do-odio-v1.json',default:false,
  hint:'Expansão do clã Uchiha. Disponibiliza aptidões, técnicas e regras no compêndio e no catálogo, com modalidades, custos e efeitos próprios. Escolhas narrativas ficam com a mesa; as cópias já adquiridas continuam na ficha.'}
]);
export function sourceEnabled(id,read){const source=OPTIONAL_SOURCES.find(s=>s.id===id||s.pack===id);if(!source)return true;try{return (read??((key)=>globalThis.game?.settings?.get?.('sns-v14-dev',key)))(source.key)??source.default;}catch{return source.default;}}
export function optionalSourceId(value){const id=typeof value==='string'?value:value?.collection??value?.publicationPack??value?.flags?.['sns-v14-dev']?.optionalSource??value?.system?.contentId??value?.contentId??'';return typeof id==='string'?OPTIONAL_SOURCES.find(s=>id===s.id||id===s.pack||id==='legado-do-odio'||id.startsWith('sns:legado:'))?.id??'':'';}
export function sourceAvailable(value,read){return sourceEnabled(optionalSourceId(value),read);}
export function optionalPackOwnership(enabled){return {PLAYER:enabled?'OBSERVER':'NONE',TRUSTED:enabled?'OBSERVER':'NONE',ASSISTANT:enabled?'OBSERVER':'NONE',GAMEMASTER:'OWNER'};}
export function clientSetting(key,fallback=true){try{return globalThis.game?.settings?.get?.('sns-v14-dev',key)??fallback;}catch{return fallback;}}
