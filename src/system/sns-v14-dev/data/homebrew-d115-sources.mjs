// Optional homebrew sources cataloged in D115 (disabled by default in world settings):
// - Kibaku Nendo Revisado 1.0 (Argila Explosiva)
// - Pergaminho Canônico de Revisões de um Eremita Esquizofrênico
const ns='sns-v14-dev';

function makeEntry({id,pack,sourceTitle,pages,name,type,category,level=0,img='icons/svg/book.svg',description,traits=[],details={},extraFlags={}}){
 return {
  id,
  publicationPack:pack,
  documentName:'Item',
  revision:'D115-v1',
  ruleIds:[id],
  variants:[],
  verifiedSource:{fullSection:true,bodySha256:'d115-'+id.replace(/[^a-z0-9]/gi,'-')},
  document:{
   name,
   type,
   img,
   flags:{[ns]:{optionalSource:pack,...extraFlags}},
   system:{
    contentId:id,
    ruleId:id,
    description,
    category,
    level,
    tags:['OPCIONAL','D115'],
    traits,
    details,
    source:{id:sourceTitle,edition:'D115',pages}
   }
  }
 };
}

export const D115_REPERTOIRES=Object.freeze({
 'sns:kibaku-rev:power:kibaku-nendo':{
  id:'sns:kibaku-rev:power:kibaku-nendo',
  mode:'effects',
  base:null,
  profile:{attribute:'skill:arte',rangeBase:15,rangeFactor:3,sizeFactor:2,damageBonus:2,difficultyBonus:0,halfCost:true},
  source:{id:'Kibaku Nendo Revisado 1.0 (D115)',pages:[3,6]},
  effects:[
   {id:'sns:effect:canhao',name:'Canhão',min:1,evolutions:[]},
   {id:'sns:effect:orbe',name:'Orbe',min:2,evolutions:[7]},
   {id:'sns:effect:imergir',name:'Imergir',min:2,evolutions:[5]},
   {id:'sns:effect:kibaku-montaria',name:'Montaria de Argila',min:2,evolutions:[5]},
   {id:'sns:effect:flechas',name:'Flechas',min:3,evolutions:[6,9]},
   {id:'sns:effect:kibaku-passaros-explosivos',name:'Pássaros Explosivos',min:3,evolutions:[6]},
   {id:'sns:effect:coluna',name:'Coluna',min:4,evolutions:[7,10]},
   {id:'sns:effect:nuvem',name:'Nuvem',min:4,evolutions:[7,10]},
   {id:'sns:effect:kibaku-c3',name:'C3 – Humano Gigante Explosivo',min:4,evolutions:[7,9]},
   {id:'sns:effect:missil',name:'Míssil',min:5,evolutions:[8,10]},
   {id:'sns:effect:onda-explosiva',name:'Onda Explosiva',min:5,evolutions:[8]},
   {id:'sns:effect:inflamavel',name:'Inflamável',min:5,evolutions:[]},
   {id:'sns:effect:algemar',name:'Algemar',min:6,evolutions:[8,10]},
   {id:'sns:effect:kibaku-c4',name:'C4 – Explosão Celular',min:8,evolutions:[]},
   {id:'sns:effect:meteoros',name:'Meteoros',min:9,evolutions:[]},
   {id:'sns:effect:kibaku-c0',name:'C0 – Arte Final',min:10,evolutions:[]}
  ]
 }
});

export const KIBAKU_REVISADO_LIBRARY=Object.freeze({
 schemaVersion:1,
 revision:'D115-kibaku-rev-1',
 source:'Kibaku Nendo Revisado 1.0 (D115)',
 entries:[
  makeEntry({
   id:'sns:kibaku-rev:hijutsu:kibaku-nendo',
   pack:'kibaku-revisado',
   sourceTitle:'Kibaku Nendo Revisado 1.0 (D115)',
   pages:'PDF 2',
   name:'Kibaku Nendo (Revisado)',
   type:'hijutsu',
   category:'features',
   img:'icons/svg/explosion.svg',
   traits:['arte:ninjutsu'],
   description:'<h3>KIBAKU NENDO (ARGILA EXPLOSIVA — REVISADO)</h3><p>Poder e Aptidões Restritas</p><p>Você possui uma variação da Kekkei Genkai da explosão, a argila explosiva, um ninjutsu proibido com alto grau de destruição e força, especialista no uso de bombas de argila em forma de criaturas com quase vida própria.</p><p><strong>Aptidões Restritas:</strong> Boca de Moldagem.</p><p><strong>Poder Restrito:</strong> Kibaku Nendo (Revisado).</p>'
  }),
  makeEntry({
   id:'sns:kibaku-rev:apt:boca-de-moldagem',
   pack:'kibaku-revisado',
   sourceTitle:'Kibaku Nendo Revisado 1.0 (D115)',
   pages:'PDF 2',
   name:'Boca de Moldagem',
   type:'aptitude',
   category:'features',
   level:6,
   img:'icons/svg/mouth.svg',
   traits:['arte:ninjutsu'],
   description:'<h3>BOCA DE MOLDAGEM</h3><p><strong>Pré-requisito:</strong> Arte 12; Kibaku Nendo 6.</p><p><strong>Benefícios:</strong> Desde que possua matéria-prima, usando uma Ação Completa é possível criar Bombas de Argila igual a 2× o nível de Arte (+4 bombas adicionais por Perito: Arte ou Perícia Inata: Arte, cumuláveis). Um compartimento de matéria-prima rende 10 usos.</p><p><strong>Arte Rápida:</strong> Com uma ação parcial, pode lançar jutsus com a argila apenas para causar efeitos secundários combinados (regras de Combo Elemental), com metade do custo de chakra, metade dos bônus de dano e Dif −2.</p>'
  }),
  makeEntry({
   id:'sns:kibaku-rev:power:kibaku-nendo',
   pack:'kibaku-revisado',
   sourceTitle:'Kibaku Nendo Revisado 1.0 (D115)',
   pages:'PDF 3–6',
   name:'Kibaku Nendo (Revisado)',
   type:'power',
   category:'powers',
   level:1,
   img:'icons/svg/explosion.svg',
   traits:['arte:ninjutsu','custo:chakra'],
   details:{organization:'effects',powerOrigin:'hijutsu',keyAttribute:'skill:arte'},
   description:'<h3>KIBAKU NENDO (REVISADO)</h3><p><strong>Pré-requisito:</strong> Arte 4</p><p><strong>Perícia Chave:</strong> Arte (substitui Espírito para alcance, dano e dificuldade).</p><p><strong>Alcance:</strong> Longo (15m + 3m por nível de Arte). <strong>Tamanho:</strong> 2m por nível de Arte. <strong>Dano Adicional:</strong> +2. <strong>Fraqueza Elemental:</strong> Raiton.</p><p><strong>Bombas de Argila:</strong> Necessita gastar quantidade de Bombas de Argila igual ao nível do poder usado (ou conforme a técnica). Um compartimento comporta até 30 Bombas preparadas diariamente.</p><p><strong>Custo de Chakra:</strong> Metade do nível do poder usado, arredondado para cima. Concede gratuitamente 1 nível em Doton (Canhão com nível de Kibaku Nendo).</p>'
  }),
  makeEntry({
   id:'sns:kibaku-rev:jutsu:montaria',
   pack:'kibaku-revisado',
   sourceTitle:'Kibaku Nendo Revisado 1.0 (D115)',
   pages:'PDF 3–4',
   name:'Kibaku Nendo: Montaria',
   type:'jutsu',
   category:'techniques',
   level:2,
   img:'icons/svg/wing.svg',
   traits:['arte:ninjutsu','custo:chakra'],
   details:{action:'Padrão',range:'Toque',duration:'Contínua',chakraCost:'5',damage:'Nenhum',target:'Pessoal / Aliados'},
   extraFlags:{directJutsuConfig:{mode:'none',cost:5,action:'Padrão',range:'Toque',duration:'Contínua',noDamage:true}},
   description:'<h3>MONTARIA (NÍVEL 2)</h3><p><strong>Pré-requisito:</strong> Lidar com Animais 4, Ciências Naturais 6 ou Mecanismo 6. <strong>Custo de Argila:</strong> 1 ou mais.</p><p>Cria animais de argila como Montaria Especial Grande (2 passageiros, dureza 0, absorção 8× Arte, deslocamento 10 + ⌈Arte/2⌉ + tamanho). Pode detonar a montaria usando efeitos de Kibaku Nendo de nível igual ou menor. Montaria de Viagem reduz custo pela metade e dura permanente fora de combate.</p><p><strong>Evolução Nv 5:</strong> Tamanho Enorme (até 5 pessoas) e adquire perícia Voo igual ao nível de Arte.</p>'
  }),
  makeEntry({
   id:'sns:kibaku-rev:jutsu:passaros-explosivos',
   pack:'kibaku-revisado',
   sourceTitle:'Kibaku Nendo Revisado 1.0 (D115)',
   pages:'PDF 4–5',
   name:'Kibaku Nendo: Pássaros Explosivos',
   type:'jutsu',
   category:'techniques',
   level:3,
   img:'icons/svg/feather.svg',
   traits:['arte:ninjutsu','custo:chakra'],
   details:{action:'Padrão',range:'Comum do poder',duration:'Instantânea',chakraCost:'2',damage:'2 por pássaro',target:'1 ou mais criaturas'},
   extraFlags:{directJutsuConfig:{mode:'attack:cd',cost:2,base:6,action:'Padrão',range:'Comum do poder',duration:'Instantânea'}},
   description:'<h3>PÁSSAROS EXPLOSIVOS (NÍVEL 3)</h3><p><strong>Custo de Argila:</strong> 1 por pássaro.</p><p>Cria 1 pássaro de argila por nível do poder (2 de dano base cada), podendo concentrar ou dividir entre alvos. Se o alvo usar Esquiva ou Ler Movimentos, pode redirecionar com ação de movimento (precisão −2). Também podem atuar como meta-aptidões (+1 dano base e +2m de área).</p><p><strong>Evolução Nv 6:</strong> Mantém pássaros acumulados na cena (capangas com 1 PV, precisão −3; explodem como Kawarimi Explosivo ao morrer). Cada 2 pássaros extras concedem +1 dano base e +2m de área (máx +5 dano / +10m).</p>'
  }),
  makeEntry({
   id:'sns:kibaku-rev:jutsu:c3-humano-gigante-explosivo',
   pack:'kibaku-revisado',
   sourceTitle:'Kibaku Nendo Revisado 1.0 (D115)',
   pages:'PDF 5',
   name:'C3 – Humano Gigante Explosivo',
   type:'jutsu',
   category:'techniques',
   level:4,
   img:'icons/svg/explosion.svg',
   traits:['arte:ninjutsu','custo:chakra'],
   details:{action:'Completa',range:'Comum do poder',duration:'Instantânea',chakraCost:'2',damage:'Comum do poder',target:'Área circular (dobro do tamanho)'},
   extraFlags:{directJutsuConfig:{mode:'save',cost:2,base:8,dc:15,saveKeys:['skill:prontidao','skill:acrobacia'],shape:'circle',size:12,action:'Completa',range:'Comum do poder',duration:'Instantânea'}},
   description:'<h3>C3 – HUMANO GIGANTE EXPLOSIVO (NÍVEL 4)</h3><p><strong>Custo de Chakra:</strong> Comum do poder. <strong>Custo de Argila:</strong> Nível usado.</p><p>Cria um humanoide Grande explosivo atingindo círculo com dobro do diâmetro comum do poder. Alvos só podem se defender se passarem em Prontidão ou Acrobacia (Dif comum do poder).</p><p><strong>Evoluções:</strong> Nv 7 permite detonar no 2º turno com ação padrão (Dif +1, mínimo grau 2); Nv 9 dobra dano em estruturas e inclui uma meta-aptidão.</p>'
  }),
  makeEntry({
   id:'sns:kibaku-rev:jutsu:c4-explosao-celular',
   pack:'kibaku-revisado',
   sourceTitle:'Kibaku Nendo Revisado 1.0 (D115)',
   pages:'PDF 5–6',
   name:'C4 – Explosão Celular',
   type:'jutsu',
   category:'techniques',
   level:8,
   img:'icons/svg/biohazard.svg',
   traits:['arte:ninjutsu','custo:chakra'],
   details:{action:'Completa',range:'Comum do poder',duration:'Contínua',chakraCost:'4',damage:'Fixo = Nível por turno',target:'Área circular'},
   extraFlags:{directJutsuConfig:{mode:'save',cost:4,base:0,noDamage:true,dc:19,saveKeys:['attribute:vig'],shape:'circle',size:12,action:'Completa',range:'Comum do poder',duration:'Contínua'}},
   description:'<h3>C4 – EXPLOSÃO CELULAR (NÍVEL 8)</h3><p><strong>Custo de Argila:</strong> Nível usado.</p><p>Contamina o ar com bombas microscópicas; todos na área fazem teste de Vigor (Dif comum do poder). Quem falhar sofre dano fixo por turno igual ao nível do poder, −2 em testes de Vigor, +1/nível na Dif contra sangramento e 1 nível de sangramento a cada 20 de dano fixo recebido. A Dif cai −1 por turno (mínimo −2) até passar.</p>'
  }),
  makeEntry({
   id:'sns:kibaku-rev:jutsu:c0-arte-final',
   pack:'kibaku-revisado',
   sourceTitle:'Kibaku Nendo Revisado 1.0 (D115)',
   pages:'PDF 6',
   name:'C0 – Arte Final',
   type:'jutsu',
   category:'techniques',
   level:10,
   img:'icons/svg/sun.svg',
   traits:['arte:ninjutsu','custo:chakra'],
   details:{action:'Completa + Padrão',range:'Pessoal (15 km)',duration:'Instantânea',chakraCost:'10',damage:'3 × Nível (Grau 4 automático)',target:'Área circular de 15 km'},
   extraFlags:{directJutsuConfig:{mode:'attack:cd',cost:10,base:30,shape:'circle',size:30,action:'Completa + Padrão',range:'Pessoal (15 km)',duration:'Instantânea'}},
   description:'<h3>C0 – ARTE FINAL (NÍVEL 10)</h3><p><strong>Custo de Chakra:</strong> Dobro do comum. <strong>Custo de Argila:</strong> 2× Nível usado.</p><p>Autodestruição com círculo de 15 km de área, dano base 3× nível do poder (triplo em estruturas), acerto e grau 4 automáticos, imune à anulação por Raiton e defensável apenas por técnicas excepcionais descritas (Hiraishin, Falsa Morte, Rashoumon, Gunbai/Samehada).</p>'
  })
 ]
});

export const PERGAMINHO_CANONICO_LIBRARY=Object.freeze({
 schemaVersion:1,
 revision:'D115-pergaminho-1',
 source:'Pergaminho Canônico de Revisões (D115)',
 entries:[
  makeEntry({
   id:'sns:pergaminho:apt:de-pe',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 8',
   name:'De Pé (Pergaminho)',
   type:'aptitude',
   category:'features',
   level:1,
   description:'<h3>DE PÉ* (REVISADA)</h3><p>Levantar-se custa uma ação parcial (em vez de movimento) e Levantar-se Rapidamente custa ação livre.</p><p><strong>Nível 2 (Acrobacia 2):</strong> Levantar-se custa ação livre; Levantar-se Rapidamente pode ser usado como reação; dobra a redução de altura em Acrobacia/Atletismo contra quedas.</p>'
  }),
  makeEntry({
   id:'sns:pergaminho:apt:trespassar',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 8',
   name:'Trespassar (Pergaminho)',
   type:'aptitude',
   category:'features',
   level:1,
   description:'<h3>TRESPASSAR* (UNIFICADA)</h3><p><strong>Pré-requisito:</strong> Combate Corporal 9.</p><p>Em combate corporal, ao abater uma criatura (0 PV ou menos), realiza um ataque corporal extra contra outro alvo ao alcance, sem limite de repetições no turno.</p>'
  }),
  makeEntry({
   id:'sns:pergaminho:apt:arremessar',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 8',
   name:'Arremessar (Pergaminho)',
   type:'aptitude',
   category:'features',
   level:1,
   description:'<h3>ARREMESSAR*</h3><p><strong>Pré-requisitos:</strong> Força 5; Lutador ou Guerreiro.</p><p>Ao usar Derrubar, arremessa o oponente até 1m por ponto de Força. Colisão causa dano fixo igual à Força (base/tamanho permanente); atingir outro alvo permite defesa contra o ataque original (metade do dano de colisão em ambos se falhar).</p>'
  }),
  makeEntry({
   id:'sns:pergaminho:apt:rasteira',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 9',
   name:'Rasteira (Pergaminho)',
   type:'aptitude',
   category:'features',
   level:1,
   description:'<h3>RASTEIRA*</h3><p><strong>Pré-requisitos:</strong> Lutador ou Guerreiro.</p><p>Concede +1 de precisão na manobra Derrubar, acumulando com Derrubar Agressivo e/ou Arremessar.</p>'
  }),
  makeEntry({
   id:'sns:pergaminho:apt:dominio-da-terra',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 9',
   name:'Domínio da Terra (Pergaminho)',
   type:'aptitude',
   category:'features',
   level:5,
   description:'<h3>DOMÍNIO DA TERRA*</h3><p><strong>Pré-requisito:</strong> Doton 5.</p><p>Ao criar estruturas Doton com dureza, permite gastar +1 de chakra por +1 de dureza extra (até o nível usado do poder; não se aplica a dureza corporal).</p>'
  }),
  makeEntry({
   id:'sns:pergaminho:apt:shunjutsu-revisado',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 10–11',
   name:'Shunjutsu: Taishunjutsu / Ninshunjutsu (Pergaminho)',
   type:'aptitude',
   category:'features',
   level:5,
   description:'<h3>SHUNJUTSU* (TAISHUNJUTSU / NINSHUNJUTSU)</h3><p><strong>Pré-requisitos:</strong> Força, Destreza ou Inteligência 10; Diligente; Velocista. Ação livre, 1 chakra.</p><p><strong>Nível 1:</strong> Escolha entre <em>Taishunjutsu</em> (+5m de deslocamento, Perito/Perícia Inata em Atletismo) ou <em>Ninshunjutsu</em> (Espírito no deslocamento e em corrida/investida), além de +1 Kawarimi por cena.</p><p><strong>Nível 2 (Atributo 12) e Nível 3 (Atributo 16):</strong> Evoluem Finta/Furtividade, simulação de dados em Atletismo e concedem <em>Acelerado</em> sob Shunjutsu.</p>'
  }),
  makeEntry({
   id:'sns:pergaminho:apt:controle-de-caloria',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 20–21',
   name:'Controle de Caloria Revisado (Pergaminho)',
   type:'aptitude',
   category:'features',
   level:4,
   description:'<h3>CONTROLE DE CALORIA* (REVISADO)</h3><p><strong>Pré-requisitos:</strong> Corpulência, Resiliência; Vigor 10 / 12 / 14 por nível (ou pílulas coloridas com duração de 3 turnos e penalidades ao fim).</p><p><strong>Nível 1 – Verde:</strong> −3 Vitalidade → +3 chakra e Força +2 (Fatigado 1 turno via pílula).</p><p><strong>Nível 2 – Amarelo:</strong> −5 Vitalidade → +5 chakra e Força +4 (Exausto 1 turno via pílula).</p><p><strong>Nível 3 – Vermelho (Modo Chou):</strong> −7 Vitalidade → +7 chakra, Força +6 e substitui AGI pelo dobro de Baika Ninpou em deslocamento/finta.</p>'
  }),
  makeEntry({
   id:'sns:pergaminho:apt:armadura-de-raios',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 63–64',
   name:'Armadura de Raios Revisada (Pergaminho)',
   type:'aptitude',
   category:'features',
   level:4,
   description:'<h3>ARMADURA DE RAIOS* (REVISADA)</h3><p><strong>Nível 1 (Nintaijutsu 5, ESP 6):</strong> 4 chakra, ação parcial, +1 dureza (Raiton), +5m de deslocamento, Acelerado, golpes sob Energizar Raiton e manobra Defesa Ativa.</p><p><strong>Nível 2 (Nintaijutsu 6, ESP 9):</strong> 6 chakra, +2 dureza, +10m, +1 dano Nintaijutsu, duração contínua e Defesa Ativa parcial.</p><p><strong>Nível 3 (Nintaijutsu 8, ESP 14):</strong> 8 chakra, +3 dureza, +15m, +2 dano Nintaijutsu e Defesa Ativa livre.</p>'
  }),
  makeEntry({
   id:'sns:pergaminho:hijutsu:fuuinjutsu-hijutsu',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 70–72',
   name:'Fuuinjutsu Hijutsu (Pergaminho)',
   type:'hijutsu',
   category:'features',
   description:'<h3>FUUINJUTSU HIJUTSU</h3><p><strong>Aptidões Restritas:</strong> Prodígio em Selamentos (INT 4; substitui pré-requisito para Fuuinjutsu, −2 atributos/perícias e −1 nível de poder em requisitos de técnicas, Bakudan com dano ⌈INT/2⌉ + Fuuinjutsu + 2), Grimório de Selos, Kongou Fuusa, Hiraishin.</p><p>Inclui ainda Selo de Contenção de Sangramento (Nv 3) e Kekkai no In Menor (Nv 4).</p>'
  }),
  makeEntry({
   id:'sns:pergaminho:hijutsu:iryou-hijutsu',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 73–74',
   name:'Iryou Hijutsu (Pergaminho)',
   type:'hijutsu',
   category:'features',
   description:'<h3>IRYOU HIJUTSU</h3><p><strong>Aptidões Restritas:</strong> Ninja Médico Prodígio (MED 4; −1 nível de poder e −2 atributos/perícias em técnicas Iryou), Iryou Ninjutsu Melhorado (Bisturis Rápidos e Recuperação Secreta Otimizada), Técnica da Cura Potente (2d8 para ampliar cura).</p><p><strong>Técnicas Restritas:</strong> Favorecimento das Lesmas e Técnica Proibida de Invocação de Cadáveres.</p>'
  }),
  makeEntry({
   id:'sns:pergaminho:hijutsu:shinchi-tenkoho',
   pack:'pergaminho-canonico',
   sourceTitle:'Pergaminho Canônico de Revisões (D115)',
   pages:'PDF 75',
   name:'Shinchi Tenkohō · Sete Respirações do Paraíso (Pergaminho)',
   type:'hijutsu',
   category:'features',
   description:'<h3>SHINCHI TENKOHŌ (SETE RESPIRAÇÕES DO PARAÍSO)</h3><p><strong>Aptidões Restritas:</strong> Respirações do Paraíso (VIG 6 / 10 / 14) e Estilo da Respiração (manobras com Dif 4 + CC).</p><p><strong>Daiichi Kassei (2 chakra/turno):</strong> Força +2 e Acelerado.</p><p><strong>Daini Kassei (3 chakra/turno):</strong> Força +4, Agilidade +1 e Acelerado.</p><p><strong>Daisan Kassei (4 chakra/turno):</strong> Força +6, Agilidade +2, Acelerado e acesso a Ataque Pesado (deixa fatigado ao encerrar).</p>'
  })
 ]
});

export const D115_OPTIONAL_LIBRARIES=Object.freeze({
 'kibaku-revisado':KIBAKU_REVISADO_LIBRARY,
 'pergaminho-canonico':PERGAMINHO_CANONICO_LIBRARY
});
