// D147. Structured replacements for placeholders checked against the stored
// book paragraphs in validacao/requisitos-d147/fontes-pendencias.json.
// Narrative events, unmodelled tiers and other actors remain explicit pending.
const a=(key,min,label)=>({kind:'attribute',key,min,label});
const s=(key,min,label)=>({kind:'skillLevel',key,min,label});
const o=(id,label)=>({kind:'owned',id:'sns:apt:'+id,label});
const p=(id,min,label)=>({kind:'powerLevel',id:'sns:power:'+id,min,label});
const any=(...options)=>({kind:'any',options});
const all=(...options)=>({kind:'all',options});
const choice=(id,key,label)=>({kind:'ownedChoice',id:'sns:apt:'+id,choice:key,label});
const pending=label=>({kind:'pending',label});
const effect=(id,min,label,powerId)=>({kind:'effectKnown',id:'sns:effect:'+id,min,label,...(powerId?{powerId:'sns:power:'+powerId}:{})});
const access=key=>({kind:'access',key});
const eitherAttribute=(x,y,n)=>any(a(x,n,({for:'Força',des:'Destreza',agi:'Agilidade',esp:'Espírito',int:'Inteligência'})[x]),a(y,n,({for:'Força',des:'Destreza',agi:'Agilidade',esp:'Espírito',int:'Inteligência'})[y]));
export const COMPLETED_REQUIREMENTS={
 'sns:power:kikai-ninpou':[o('kikaichuu','Kikaichuu')],
 'sns:power:baika-ninpou':[a('vig',6,'Vigor'),o('corpulencia','Corpulência')],
 'sns:power:shikakyu':[o('hakken-no-jutsu','Hakken no Jutsu')],
 'sns:apt:vontade-do-fogo':[access('tensai'),a('vig',6,'Vigor'),choice('resistencia-maior','vig','Resistência Maior: Vigor'),o('clone-verdadeiro-kage','Clone Verdadeiro: Kage Bunshin')],
 'sns:apt:maximizar':[eitherAttribute('esp','int',15),o('potencializar','Potencializar')],
 'sns:apt:mil-clones':[a('esp',10,'Espírito'),o('chakra-expandido','Chakra Expandido'),o('clone-verdadeiro-kage','Clone Verdadeiro: Kage Bunshin'),{kind:'ownedLevel',contentId:'sns:apt:clone',id:'sns:apt:clone-kage-2',min:2,label:'Clone nível 2'}],
 'sns:apt:tendo':[p('rinne-ninpou',8,'Rinne Ninpou')],
 'sns:power:dokujutsu':[s('veneficio',4,'Nível de Venefício'),o('quimico','Químico')],
 'sns:apt:estilo-da-lotus':[p('hachimon-tonkou',1,'Hachimon Tonkou')],
 'sns:apt:talento-natural':[eitherAttribute('int','esp',6)],
 'sns:apt:instinto-de-batalha':[eitherAttribute('des','agi',8)],
 'sns:apt:demonio-do-vento':[access('tensai')],
 'sns:apt:elemento-natural-suiton':[p('suiton',1,'Suiton')],
 'sns:apt:reserva-de-agua':[p('suiton',5,'Suiton'),o('elemento-natural-suiton','Elemento Natural: Suiton')],
 'sns:apt:lamina-da-lua':[access('tensai')],
 'sns:apt:shikigami-no-mai':[any(s('arte',9,'Nível de Arte'),a('esp',9,'Espírito'))],
 'sns:apt:elemento-natural-fuuton':[p('fuuton',1,'Fuuton')],
 'sns:apt:izanami':[],
 'sns:apt:izanagi':[], // actorType:npc already enforces the printed restriction.
 'sns:apt:arsenal-completo':[any(effect('criar-arma',2,'Criar Arma'),p('fuinjutsu',2,'Fuuinjutsu'))],
 'sns:apt:terra-insaciavel':[o('ingestao-de-chakra','Ingestão de Chakra'),p('doton',6,'Doton'),effect('barreira',3,'Barreira de Doton','doton')],
 'sns:apt:ouro-pegajoso':[p('kumo-ninpou',4,'Kumo Ninpou')],
 'sns:apt:kyoumei-supika':[any(all(o('acuidade','Acuidade'),a('des',6,'Destreza')),a('for',6,'Força'))],
 'sns:jutsu:hasukonsutoraku':[o('clone-kage','Clone'),p('jiongu',2,'Jiongu'),pending('Ao menos dois corações ativos')],
 'sns:apt:kakuran-taijutsu':[eitherAttribute('for','des',12)],
 'sns:power:jinton':[any(p('doton',5,'Doton'),p('fuuton',5,'Fuuton'),p('katon',5,'Katon'))],
 'sns:apt:elemento-natural-terra':[p('doton',1,'Doton')],
 'sns:apt:boca-de-moldagem':[p('kibaku-nendo',6,'Kibaku Nendo')],
 'sns:jutsu:kirikiri-mai':[p('kuchiyose',6,'Kuchiyose'),{kind:'summonSpecies',species:'doninha',label:'Contrato de Doninhas'},p('fuuton',6,'Fuuton'),o('potencializar','Potencializar')],
 'sns:jutsu:dokugiri':[p('kuchiyose',6,'Kuchiyose'),{kind:'summonSpecies',species:'salamandra',label:'Contrato de Salamandra'},s('veneficio',10,'Nível de Venefício')],
 'sns:jutsu:engolimento':[effect('imergir',2,'Imergir')],
 'sns:apt:kugutsu':[s('mecanismos',4,'Nível de Mecanismos'),o('engenheiro','Engenheiro')],
 'sns:apt:dupla-linhagem':[any(p('futton',5,'Futton'),p('youton',5,'Youton'))],
 'sns:apt:efeito-estroboscopio':[p('ranton',6,'Ranton')],
 'sns:apt:cristalizacao':[p('shouton',7,'Shouton'),o('congelamento','Congelamento')],
 'sns:apt:mestre-dos-leques':[p('fuuton',3,'Fuuton')],
 'sns:apt:brisa-de-navalha':[p('fuuton',5,'Fuuton')],
 'sns:apt:capacidade-dos-ventos':[eitherAttribute('esp','int',12)],
 'sns:apt:clone-zetsu':[o('clone-kage','Clone')],
 'sns:apt:hb-f05-elemento-natural-suiton':[p('suiton',1,'Suiton')],
 'sns:apt:hb-f05-shikigami-no-mai':[any(s('arte',9,'Nível de Arte'),a('esp',9,'Espírito'))],
 'sns:apt:hb-f05-modo-abissal':[any(p('suiton',4,'Suiton'),p('hb-f05-kaiju-ninpou',4,'Kaiju Ninpou'))],
 'sns:apt:hb-f05-monstro-marinho':[any(p('suiton',6,'Suiton'),p('hb-f05-kaiju-ninpou',6,'Kaiju Ninpou'))],
 'sns:apt:hb-f05-corpo-ajustavel':[a('des',8,'Destreza'),a('vig',8,'Vigor')],
 'sns:apt:hb-f06-toton-jutsu':[choice('perito','furtividade','Perito: Furtividade'),s('furtividade',10,'Nível de Furtividade')],
 'sns:apt:hb-f05-punho-condutor':[o('lutador','Lutador'),choice('especialista','desarmado','Especialista: Ataque Desarmado'),a('des',4,'Destreza'),a('vig',4,'Vigor')],
 'sns:apt:hb-f05-sequencia-marcial':[a('des',14,'Destreza'),pending('Crítico Aprimorado: Ataque Desarmado — opção ainda não modelada')]
};
export function completeRequirements(base){
 const result={...base};
 for(const [id,replacement] of Object.entries(COMPLETED_REQUIREMENTS)){
  const original=base[id];if(!original)throw Error('Definição de requisito ausente: '+id);
  result[id]={...original,requirements:original.requirements.flatMap(r=>r.kind==='pending'?replacement:[r])};
 }
 // The Basic and Enciclopédia records must not silently require one another.
 const suiton=result['sns:apt:elemento-natural-suiton'];
 suiton.requirements=suiton.requirements.map(r=>r.kind==='owned'&&r.id==='sns:apt:hb-f05-predador-aquatico'?{...r,id:'sns:apt:predador-aquatico'}:r);
 const paper=result['sns:apt:shikigami-no-mai'];
 paper.requirements=paper.requirements.map(r=>r.kind==='powerLevel'&&r.id==='sns:power:hb-f05-kami-ninpou'?{...r,id:'sns:power:kami-ninpou'}:r);
 return result;
}
