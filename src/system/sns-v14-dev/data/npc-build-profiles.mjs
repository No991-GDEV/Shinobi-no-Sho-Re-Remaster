// Generator preferences. Village elements are editable themes approved in D167,
// not exclusive affinities or mechanical grants. Origin filters are geographic.
export const NPC_VILLAGES=[
 {id:'',name:'Sem vila',element:'ninpou'},
 {id:'konoha',name:'Konohagakure · Folha',trait:'vila:konohagakure',element:'katon'},
 {id:'kiri',name:'Kirigakure · Névoa',trait:'vila:kirigakure',element:'suiton'},
 {id:'iwa',name:'Iwagakure · Pedra',trait:'vila:iwagakure',element:'doton'},
 {id:'kumo',name:'Kumogakure · Nuvem',trait:'vila:kumogakure',element:'raiton'},
 {id:'suna',name:'Sunagakure · Areia',trait:'vila:sunagakure',element:'fuuton'},
 {id:'oto',name:'Otogakure · Som',trait:'vila:otogakure',element:'ninpou'},
 {id:'ame',name:'Amegakure · Chuva',trait:'vila:amegakure',element:'ninpou'},
 {id:'hoshi',name:'Hoshigakure · Estrela',trait:'vila:hoshigakure',element:'ninpou'},
 {id:'ferro',name:'País do Ferro',element:'ninpou'},
];
export const NPC_ORIGIN_VILLAGES={
 aburame:['konoha'],akimichi:['konoha'],hatake:['konoha'],hyuuga:['konoha'],inuzuka:['konoha'],nara:['konoha'],sarutobi:['konoha'],senju:['konoha'],uchiha:['konoha'],uzumaki:['konoha'],yamanaka:['konoha'],shimura:['konoha'],
 fuuma:['konoha','ame'],hoshigaki:['kiri'],hozuki:['kiri'],kaguya:['kiri'],yuki:['kiri'],yotsuki:['kumo'],hoshigakure:['hoshi'],
 bakuton:['iwa'],'kibaku-nendo':['iwa'],'kekkei-touta-jinton':['iwa'],shakuton:['suna'],tessenjutsu:['suna'],samurai:['ferro'],jingokuon:['oto'],
};
export const NPC_ELEMENTS=[['auto','Da vila / automático'],['none','Sem elemento'],['ninpou','Ninpou · não elemental'],['katon','Katon · Fogo'],['suiton','Suiton · Água'],['doton','Doton · Terra'],['raiton','Raiton · Raio'],['fuuton','Fuuton · Vento']].map(([id,name])=>({id,name}));
export const NPC_FOCUSES=[['balanced','Versátil'],['clan','Só técnicas da origem'],['summon','Invocações'],['puppet','Marionetes']].map(([id,name])=>({id,name}));
export const NPC_STYLES=[['taijutsu','Taijutsu'],['ninjutsu','Ninjutsu'],['genjutsu','Genjutsu']].map(([id,name])=>({id,name}));
export const NPC_ROLES=[{id:'npc',name:'NPC padrão'},{id:'minion',name:'Capanga'}];
// Explicit book lists; a Ninpou derivative does not inherit every effect.
export const NPC_DERIVED_EFFECTS={
 'sns:power:kikai-ninpou':['canhao','orbe','raio','barreira','flechas','ricochete','coluna','nuvem','sopro-destrutivo','missil'],
 'sns:power:sumi-ninpou':['canhao','orbe','raio','restringente','montaria','barreira','flechas','lanca','ricochete','coluna','energizar','nuvem','sopro-destrutivo','correnteza','missil','onda-explosiva','algemar','imergir','nevoa','prisao-de-agua'],
 'sns:power:mokuton':'ninpou',
 'sns:power:hibon-ninpou':'ninpou',
};
export const NPC_COMMON_PRIORITIES={
 taijutsu:['reflexos','lutador','saque-rapido','ataque-giratorio','chute-giratorio','mobilidade','velocista','intuicao','duro-de-matar','ataque-poderoso','combate-defensivo'],
 ninjutsu:['reflexos','saque-rapido','diligente','intuicao','mobilidade','velocista','combate-defensivo','duro-de-matar'],
 genjutsu:['fascinar','miragem','reflexos','ilusao-profunda','intuicao','diligente','saque-rapido','mobilidade','duro-de-matar'],
};
export function npcRandom(seed){let state=seed>>>0||1;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};}
export function npcShuffle(rows,random){const out=[...rows];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
