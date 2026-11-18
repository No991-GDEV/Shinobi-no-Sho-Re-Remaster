export const OPTIONAL_SOURCES=Object.freeze([
 {id:'legado-do-odio',key:'enableLegadoDoOdio',label:'Legado do Ódio',pack:'sns-conteudo-dev.legado-do-odio',file:'modules/sns-conteudo-dev/content/legado-do-odio-v1.json',prefix:'sns:legado:',default:false,
  hint:'Expansão do clã Uchiha. Disponibiliza aptidões, técnicas e regras no compêndio e no catálogo, com modalidades, custos e efeitos próprios. Escolhas narrativas ficam com a mesa; as cópias já adquiridas continuam na ficha.'},
 {id:'kibaku-revisado',key:'enableKibakuRevisado',label:'Kibaku Nendo Revisado (D115)',pack:'sns-conteudo-dev.kibaku-revisado',prefix:'sns:kibaku-rev:',default:false,explicitKeyOnly:true,inMemory:true,
  hint:'Homebrew D115 (Kibaku Nendo Revisado 1.0). Adiciona Boca de Moldagem, perícia chave Arte, progressão de efeitos, Montaria, Pássaros Explosivos, C3, C4 e C0.'},
 {id:'pergaminho-canonico',key:'enablePergaminhoCanonico',label:'Pergaminho Canônico de Revisões (D115)',pack:'sns-conteudo-dev.pergaminho-canonico',prefix:'sns:pergaminho:',default:false,explicitKeyOnly:true,inMemory:true,
  hint:'Homebrew D115 (Escritos de um Eremita Esquizofrênico). Disponibiliza revisões de aptidões, Shunjutsu, Controle de Caloria, Armadura de Raios e novos Hijutsus (Fuuinjutsu, Iryou, Shinchi Tenkohō).'}
]);
export function sourceEnabled(id,read){const source=OPTIONAL_SOURCES.find(s=>s.id===id||s.pack===id);if(!source)return true;try{if(read)return read(source.key)??source.default;const fn=globalThis.game?.settings?.get;if(typeof fn!=='function')return source.default;if(source.explicitKeyOnly&&fn.length<2)return source.default;return fn.call(globalThis.game.settings,'sns-v14-dev',source.key)??source.default;}catch{return source.default;}}
export function optionalSourceId(value){const id=typeof value==='string'?value:value?.collection??value?.publicationPack??value?.flags?.['sns-v14-dev']?.optionalSource??value?.system?.contentId??value?.contentId??'';return typeof id==='string'?OPTIONAL_SOURCES.find(s=>id===s.id||id===s.pack||(s.prefix&&id.startsWith(s.prefix)))?.id??'':'';}
export function sourceAvailable(value,read){return sourceEnabled(optionalSourceId(value),read);}
export function optionalPackOwnership(enabled){return {PLAYER:enabled?'OBSERVER':'NONE',TRUSTED:enabled?'OBSERVER':'NONE',ASSISTANT:enabled?'OBSERVER':'NONE',GAMEMASTER:'OWNER'};}
export function clientSetting(key,fallback=true){try{return globalThis.game?.settings?.get?.('sns-v14-dev',key)??fallback;}catch{return fallback;}}
