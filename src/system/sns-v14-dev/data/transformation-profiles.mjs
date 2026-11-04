// SNS Básico213–220,271–272; Hijutsus40–43. Values are data, not PF2e rules.
export const TRANSFORMATION_PROFILES=Object.freeze({falseBijuu:{
 id:'falseBijuu',name:'Jinchuuriki Falso',sourceId:'sns:power:hb-f05-jinchuuriki-falso',originId:'sns:hijutsu:hb-f05-jinchuuriki-falso',source:'Enciclopédia · Jinchuuriki Falso',maxLevel:10,controlLevel:10,falseBijuu:true,
 modes:[{id:'normal',name:'Normal',minLevel:1,rank:0,action:'Livre'},{id:'presence',name:'Presença do Selo',minLevel:2,rank:1,action:'Livre',strength:1,wear:true,grants:[]},{id:'cloak',name:'Manto Corrompido',minLevel:3,minUsedLevel:2,rank:2,action:'Parcial',tails:true,hardness:1,accelerated:true,blockProjectiles:true,wear:true,grants:[]},{id:'mode',name:'Modo Besta Instável',minLevel:5,rank:3,action:'Parcial',tails:true,hardness:2,agility:2,accelerated:true,blockProjectiles:true,wear:true,restrictTechniques:true,grants:[]}],
 tails:Array.from({length:9},(_,i)=>({count:i+1,level:i+2,strength:Math.floor((i+2)/2)})),sizes:[],buffs:[],techniques:[]
},gobi:{
 id:'gobi',name:'Kokuō · Cinco Caudas',sourceId:'sns:power:jinchuuriki',originId:'sns:feature:gobi-gobi-futton',
 source:'Básico213–220,271–272 · Hijutsus40–43',maxLevel:10,controlLevel:6,
 modes:[
  {id:'normal',name:'Normal',minLevel:1,rank:0,action:'Livre'},
  {id:'presence',name:'Presença Bijuu',minLevel:2,rank:1,action:'Livre',strength:1,hardness:0,lethal:true,grants:['beast']},
  {id:'cloak',name:'Manto Bijuu',minLevel:2,rank:2,action:'Parcial',tails:true,hardness:1,lethal:true,accelerated:true,blockProjectiles:true,wear:true,grants:['beast','wave','arm']},
  {id:'mode',name:'Modo Bijuu',minLevel:5,rank:3,action:'Parcial',tails:true,hardness:2,agility:2,lethal:true,accelerated:true,blockProjectiles:true,wear:true,restrictTechniques:true,grants:['beast','wave','arm','shot','bomb']},
  {id:'form',name:'Forma Bijuu',minLevel:6,rank:4,action:'Parcial',control:true,tails:true,hardness:3,lethal:true,blockProjectiles:true,restrictTechniques:true,size:true,grants:['beast','wave','shot','bomb','horn']}
 ],
 tails:[{count:1,level:2,strength:1},{count:2,level:3,strength:3},{count:3,level:4,strength:3},{count:4,level:5,strength:3},{count:5,level:6,strength:4}],
 sizes:[{level:6,name:'Enorme',body:3,movement:6,stealth:-1,intimidate:1,reach:3,token:4},{level:8,name:'Imenso',body:5,movement:9,stealth:-2,intimidate:2,reach:4,token:8},{level:10,name:'Colossal',body:7,movement:12,stealth:-2,intimidate:2,reach:5,token:16}],
 buffs:[
  {id:'acceleration',name:'Aceleração-Vapor',minLevel:5,action:'Parcial',duration:'Sustentada',cost:3,accelerated:true,armorPenaltyExempt:true,agilityTests:[{level:8,value:3}],incompatibleModes:['cloak','mode','form'],requiresArmor:true},
  {id:'force',name:'Força-Vapor',minLevel:5,action:'Parcial / Livre com Aceleração-Vapor',duration:'Sustentada',steps:[{level:5,value:4,cost:4},{level:7,value:5,cost:5},{level:9,value:6,cost:6},{level:10,value:8,cost:7}],incompatibleModes:['cloak','mode','form'],requiresArmor:true}
 ],
 techniques:[
  {id:'beast',name:'Potência da Besta',minLevel:2,action:'Ataque corporal',test:'cc',cost:0,damage:'beast',duration:'Contínua',range:'Alcance corporal',sourcePages:'Básico217'},
  {id:'wave',name:'Onda de Chakra',minLevel:3,action:'Padrão',test:'cd',cost:'level',damage:'double',duration:'Instantânea',range:'Meia-esfera · 2 m por nível',sourcePages:'Básico217–218'},
  {id:'arm',name:'Braço de Chakra',minLevel:4,action:'Parcial',test:'cc',cost:'level',damage:'unarmed',duration:'Sustentada',range:'10 m + 4 m por nível',sourcePages:'Básico218–219'},
  {id:'shot',name:'Disparo de Chakra',minLevel:5,action:'Padrão / Completa',test:'cd',cost:'level',damage:'double',duration:'Instantânea',range:'15 m + 6 m por nível',sourcePages:'Básico219'},
  {id:'bomb',name:'Bijuudama',minLevel:7,action:'Completa',test:'cd',cost:'bomb',damage:'triple',duration:'Instantânea',range:'15 m + 6 m por nível',sourcePages:'Básico220'},
  {id:'horn',name:'Tsunoori',minLevel:8,action:'Atropelar',test:'cc',cost:4,damage:'horn',duration:'Instantânea',range:'Alcance corporal',sourcePages:'Hijutsus41',contentId:'sns:jutsu:tsunoori'},
  {id:'boil',name:'Ebulição',minLevel:2,action:'Padrão',test:'none',cost:'level',damage:'boil',duration:'Instantânea',range:'Meia-esfera / círculo · 2 m',sourcePages:'Hijutsus42'},
  {id:'partial',name:'Transformação Parcial',minLevel:6,action:'Livre',test:'cc',cost:'half',damage:'unarmed',duration:'Sustentada',range:'5 m',sourcePages:'Básico216–217'}
 ],
 armorId:'sns:jutsu:armadura-a-vapor'
}});
