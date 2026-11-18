// Factory automation presets for SNS clans, hijutsus, restricted powers and aptitudes.
// Follows PF2e's item-driven rule/toggle model while keeping SNS book rules intact.
const eightGates={
 toggle:{
  key:'hachimon-tonkou',label:'Oito Portões Celestiais',action:'Parcial',duration:'Sustentada',
  note:'Efeitos colaterais, dano ao fim da cena e exaustão seguem a descrição dos Portões (Básico, p. 166–168).',
  stages:[
   {id:'gate1',label:'1º/2º Portão · Kaimon/Kyūmon',cost:1,rules:[{target:'attribute:for',value:1},{target:'attribute:agi',value:1}]},
   {id:'gate3',label:'3º/4º Portão · Seimon/Shōmon',cost:2,rules:[{target:'attribute:for',value:2},{target:'attribute:agi',value:2},{target:'movement',value:2}]},
   {id:'gate5',label:'5º/6º Portão · Tomon/Keimon',cost:3,rules:[{target:'attribute:for',value:3},{target:'attribute:agi',value:3},{target:'hardness',value:1},{target:'movement',value:4}]},
   {id:'gate7',label:'7º Portão · Kyōmon',cost:4,rules:[{target:'attribute:for',value:4},{target:'attribute:agi',value:4},{target:'hardness',value:2},{target:'movement',value:6}]},
   {id:'gate8',label:'8º Portão · Shimon',cost:5,rules:[{target:'attribute:for',value:6},{target:'attribute:agi',value:6},{target:'hardness',value:3},{target:'movement',value:8}]}
  ]
 }
};
const curseTransform={
 toggle:{
  key:'senninka-juuinka',label:'Selo / Transformação Eremita',action:'Parcial',duration:'Sustentada',
  note:'Confira consumo contínuo e testes de instabilidade conforme o estágio.',
  stages:[
   {id:'stage1',label:'Estágio 1',cost:1,rules:[{target:'attribute:for',value:1},{target:'attribute:agi',value:1},{target:'movement',value:2}]},
   {id:'stage2',label:'Estágio 2',cost:2,rules:[{target:'attribute:for',value:2},{target:'attribute:agi',value:2},{target:'hardness',value:1},{target:'movement',value:4}]}
  ]
 }
};
const akimichiExpansion={
 toggle:{
  key:'baika-expansion',label:'Baika · Expansão Corporal',action:'Movimento',duration:'Contínua',
  note:'Tamanho alterado e penalidades de Esquiva/Furtividade conforme descrição do Clã Akimichi.',
  stages:[
   {id:'normal',label:'Expansão Parcial',cost:1,rules:[{target:'attribute:for',value:1},{target:'attribute:vig',value:1}]},
   {id:'large',label:'Corpo Grande',cost:3,rules:[{target:'attribute:for',value:2},{target:'attribute:vig',value:2},{target:'hardness',value:1}]},
   {id:'huge',label:'Corpo Enorme',cost:4,rules:[{target:'attribute:for',value:3},{target:'attribute:vig',value:3},{target:'hardness',value:2}]}
  ]
 }
};
const inuzukaMimicry={
 toggle:{
  key:'shikakyu-mimicry',label:'Shikakyu · Mimetismo Bestial',action:'Movimento',duration:'Sustentada',cost:1,
  rules:[{target:'attribute:for',value:1},{target:'attribute:agi',value:1},{target:'movement',value:2},{target:'skill:rastrear',value:2}],
  note:'Garras, olfato aguçado e deslocamento em quatro apoios.'
 }
};
const juukenStance={
 toggle:{
  key:'juuken-stance',label:'Postura Juuken',action:'Livre',duration:'Cena',cost:1,
  rules:[{target:'cc',value:1},{target:'lm',value:1}],
  note:'Permite ataques de Punho Gentil e dano em Chakra conforme o poder Juuken.'
 }
};
const rinneganDom={
 toggle:{
  key:'rinnegan-domain',label:'Domínio do Rinnegan',action:'Livre',duration:'Cena',cost:1,
  rules:[{target:'attribute:per',value:2},{target:'lm',value:2},{target:'initiative',value:1}],
  note:'Visão compartilhada e percepção ampliada pelos Caminhos.'
 }
};
const tenseiganCloak={
 toggle:{
  key:'tenseigan-cloak',label:'Manto de Chakra Tenseigan',action:'Parcial',duration:'Sustentada',cost:2,
  rules:[{target:'attribute:agi',value:2},{target:'attribute:esp',value:2},{target:'cd',value:2},{target:'hardness',value:1}],
  note:'Manto esverdeado com esferas de verdade e voo conforme descrição.'
 }
};
const hoshigakiShark={
 passiveRules:[{target:'hardness',value:1}],
 toggle:{
  key:'predador-aquatico',label:'Predador Aquático',action:'Livre',duration:'Cena',cost:0,
  rules:[{target:'skill:atletismo',value:2},{target:'cc',value:1}],
  note:'Pele de Couro (+1 dureza passiva), guelras e vantagem em ambiente aquático.'
 }
};
const waterReserve={
 chargePool:{
  key:'reserva-de-agua',label:'Reserva de Água (Hoshigaki)',maxFormula:'level',unit:'usos',
  rechargeLabel:'Recarregar',rechargeMode:'full',note:'Permite conjurar técnicas Suiton fora de fontes naturais de água.'
 }
};
const aburameKikaichuu={
 chargePool:{
  key:'kikaichuu-swarm',label:'Enxame Kikaichuu',maxFormula:'skill:lidar_com_animais',unit:'grupos',
  rechargeLabel:'Recuperar enxame',rechargeMode:'full',note:'1 grupo (100 insetos) por nível de Lidar com Animais; gasto temporário em Mushi Bunshin e técnicas contínuas.'
 }
};
const clayBombs={
 chargePool:{
  key:'bombas-de-argila',label:'Bombas de Argila',max:30,unit:'bombas',
  rechargeLabel:'Repor compartimento',rechargeMode:'full',note:'Compartimento com até 30 bombas preparadas diariamente (ou via Boca de Moldagem).'
 }
};
const chakraScalpel={
 toggle:{
  key:'bisturi-de-chakra',label:'Bisturi de Chakra',action:'Movimento',duration:'Sustentada',cost:1,
  rules:[{target:'cc',value:1}],
  note:'Golpes cortantes precisos baseados em Medicina; ignora dureza corporal comum conforme Iryou Ninjutsu.'
 },
 quickAction:{
  key:'iryou-cura',label:'Shousen · Cura Médica',action:'Padrão',cost:1,mode:'check',checkKey:'skill:medicina',
  note:'Estabiliza ferimentos e recupera Vitalidade do aliado tocado com base em Medicina e nível do poder.'
 }
};
const akimichiPills={
 toggle:{
  key:'akimichi-controle-caloria',label:'Três Pílulas Coloridas / Calorias',action:'Parcial',duration:'Sustentada / 3 turnos',
  note:'Verde (+2 FOR), Amarela (+4 FOR) e Vermelha / Modo Chou (+6 FOR); aplique fadiga/exaustão após encerrar.',
  stages:[
   {id:'verde',label:'Verde (Hōrengan)',cost:0,rules:[{target:'attribute:for',value:2}]},
   {id:'amarelo',label:'Amarela (Kareigan)',cost:0,rules:[{target:'attribute:for',value:4}]},
   {id:'vermelho',label:'Vermelha (Tongarashigan · Chou)',cost:0,rules:[{target:'attribute:for',value:6}]}
  ]
 }
};
const silverFang={
 toggle:{
  key:'hatake-presa-de-prata',label:'Chakra Branco · Presa de Prata',action:'Livre',duration:'Sustentada',cost:1,
  rules:[{target:'cc',value:1},{target:'initiative',value:1}],
  note:'Canaliza chakra branco na lâmina; confere precisão e foco em golpes críticos conforme Clã Hatake.'
 }
};
const willOfFire={
 toggle:{
  key:'sarutobi-vontade-do-fogo',label:'Vontade do Fogo',action:'Livre',duration:'Cena',cost:0,
  rules:[{target:'cc',value:1},{target:'cd',value:1},{target:'esq',value:1}],
  note:'Quando ferido abaixo da metade da Vitalidade ou protegendo aliados, eleva a determinação em combate.'
 }
};
const kamiPaperBody={
 toggle:{
  key:'kami-shikigami-no-mai',label:'Shikigami no Mai (Corpo de Papel)',action:'Movimento',duration:'Sustentada',cost:1,
  rules:[{target:'esq',value:1},{target:'hardness',value:1}],
  note:'Desfaz o corpo em folhas de papel infundidas com chakra; libera Algemar, Orbe, Barreira e Prisão em Kami Ninpou.'
 }
};
const kuramaIllusion={
 passiveRules:[{target:'attribute:int',value:1}],
 quickAction:{
  key:'kurama-ilusao-real',label:'Ilusão Real Kurama',action:'Padrão',cost:2,mode:'check',checkKey:'skill:ocultismo',
  note:'Projeta efeitos sensoriais reais dentro do Teatro da Mente; alvo testa Inteligência contra Dificuldade do poder.'
 }
};
const azureFangPreset={
 toggle:{
  key:'mestre-agua-azure-fang',label:'Presa Azul · Fluxo Aquático',action:'Livre',duration:'Sustentada',cost:1,
  rules:[{target:'cd',value:1},{target:'initiative',value:1}],
  note:'Refina técnicas Suiton e amplifica a fluidez ofensiva.'
 }
};
const sealProdigy={
 chargePool:{
  key:'selos-preparados',label:'Tarjas e Selos Preparados',max:15,unit:'selos',
  rechargeLabel:'Preparar lote',rechargeMode:'full',note:'Controle de tarjas explosivas (Bakudan) e selos de armazenamento/armadilha.'
 }
};

export const ITEM_AUTOMATION_PROFILES=Object.freeze({
 'sns:power:hachimon-tonkou':eightGates,
 'sns:hijutsu:hachimon-tonkou':eightGates,
 'sns:hijutsu:juuinka':curseTransform,
 'sns:power:senninka':curseTransform,
 'sns:hijutsu:senninka':curseTransform,
 'sns:clan:akimichi':akimichiExpansion,
 'sns:clan:hb-f05-akimichi':akimichiExpansion,
 'sns:power:baika-ninpou':akimichiExpansion,
 'sns:clan:inuzuka':inuzukaMimicry,
 'sns:power:shikakyu':inuzukaMimicry,
 'sns:clan:hyuuga':juukenStance,
 'sns:power:juuken':juukenStance,
 'sns:hijutsu:rinnegan':rinneganDom,
 'sns:apt:rinnegan':rinneganDom,
 'sns:hijutsu:hb-f05-tenseigan':tenseiganCloak,
 'sns:apt:hb-f05-manto-tenseigan':tenseiganCloak,
 'sns:hijutsu:senjutsu':{
  toggle:{
   key:'senjutsu-mode',label:'Modo Eremita',action:'Completa',duration:'Cena',cost:2,
   rules:[{target:'attribute:for',value:2},{target:'attribute:agi',value:2},{target:'attribute:per',value:2},{target:'cc',value:1},{target:'cd',value:1},{target:'lm',value:1},{target:'hardness',value:1}],
   note:'Energia natural harmonizada; requer concentração inicial e duração limitada conforme Senjutsu.'
  }
 },
 'sns:hijutsu:nintaijutsu':{
  toggle:{
   key:'nintaijutsu-cloak',label:'Manto de Raio (Nintaijutsu)',action:'Parcial',duration:'Sustentada',cost:2,
   rules:[{target:'attribute:agi',value:2},{target:'esq',value:1},{target:'hardness',value:1},{target:'movement',value:3}],
   note:'Reflexos elétricos e armadura de Raiton.'
  }
 },
 'sns:hijutsu:kagura-shingan':{
  toggle:{
   key:'kagura-shingan',label:'Kagura Shingan · Olho da Mente',action:'Movimento',duration:'Concentração',cost:1,
   rules:[{target:'attribute:per',value:2},{target:'lm',value:2},{target:'initiative',value:2}],
   note:'Detecção sensorial em longo alcance sem precisar de linha de visão.'
  }
 },
 'sns:clan:kaguya':{
  toggle:{
   key:'kaguya-bones',label:'Shikotsumyaku · Ossos Enrijecidos',action:'Movimento',duration:'Sustentada',cost:1,
   rules:[{target:'cc',value:1},{target:'hardness',value:2}],
   note:'Armadura e lâminas ósseas corporais.'
  }
 },
 'sns:clan:hozuki':{
  toggle:{
   key:'hozuki-hydration',label:'Hidratação Corporal',action:'Movimento',duration:'Sustentada',cost:1,
   rules:[{target:'skill:escapar',value:2},{target:'hardness',value:1}],
   note:'Corpo liquefeito reduz dano físico; vulnerável a Raiton conforme descrição do Clã Hōzuki.'
  }
 },
 'sns:hijutsu:samurai':{
  toggle:{
   key:'samurai-chakra-blade',label:'Lâmina de Chakra Samurai',action:'Movimento',duration:'Sustentada',cost:1,
   rules:[{target:'cc',value:1},{target:'cd',value:1}],
   note:'Canaliza chakra através da espada para ataques cortantes à distância ou corpo a corpo.'
  }
 },
 'sns:power:satetsu':{
  toggle:{
   key:'satetsu-cloak',label:'Manto de Areia de Ferro',action:'Padrão',duration:'Sustentada',cost:1,
   rules:[{target:'hardness',value:2}],
   note:'Armadura metálica protetora moldada em Areia de Ferro.'
  }
 },
 'sns:power:sakin':{
  toggle:{
   key:'sakin-armor',label:'Armadura de Pó de Ouro',action:'Padrão',duration:'Sustentada',cost:3,
   rules:[{target:'hardness',value:2}],
   note:'Proteção corporal de pó de ouro contra ataques físicos.'
  }
 },
 'sns:apt:combate-defensivo':{
  toggle:{
   key:'combate-defensivo',label:'Combate Defensivo',action:'Livre',duration:'1 turno',cost:0,
   rules:[{target:'esq',value:2},{target:'cc',value:-2}],
   note:'Postura defensiva: +2 em Esquiva e −2 nos ataques até o próximo turno.'
  }
 },
 'sns:apt:ataque-poderoso':{
  toggle:{
   key:'ataque-poderoso',label:'Ataque Poderoso',action:'Livre',duration:'1 turno',cost:0,
   rules:[{target:'cc',value:-2}],
   note:'Sacrifica precisão corporal (−2 CC) para aumentar o dano em +1 Grau nos ataques.'
  }
 },
 'sns:apt:ataque-giratorio':{
  quickAction:{
   key:'ataque-giratorio',label:'Ataque Giratório',action:'Padrão',cost:0,mode:'attack:cc',
   baseFormula:'halfFor',bonus:0,note:'Golpe em área adjacente contra todos os alvos ao alcance.'
  }
 },
 'sns:apt:chute-giratorio':{
  quickAction:{
   key:'chute-giratorio',label:'Chute Giratório',action:'Padrão',cost:0,mode:'attack:cc',
   baseFormula:'halfFor',bonus:2,note:'Chute giratório em área adjacente com +2 no dano base.'
  }
 },
 'sns:apt:fascinar':{
  quickAction:{
   key:'fascinar',label:'Fascinar',action:'Padrão',cost:3,mode:'save',saveKey:'attribute:int',
   dcFormula:'6+int',note:'Alvo a até 5 m faz teste de Inteligência contra a Dificuldade ou fica Fascinado.'
  }
 },
 'sns:apt:miragem':{
  quickAction:{
   key:'miragem',label:'Miragem',action:'Padrão',cost:1,mode:'none',
   note:'Cria uma ilusão visual pequena e imóvel a até 5 m (duração Contínua).'
  }
 },
 'sns:feature:uzumaki-chakra-da-cura':{
  quickAction:{
   key:'uzumaki-chakra-da-cura',label:'Chakra da Cura',action:'Padrão',cost:2,mode:'none',
   note:'Transfere chakra ao aliado tocado para recuperar Vitalidade conforme Vigor.'
  }
 },
 'sns:kibaku-rev:apt:boca-de-moldagem':{
  quickAction:{
   key:'boca-de-moldagem',label:'Moldar Bombas de Argila / Arte Rápida',action:'Completa / Parcial',cost:0,mode:'none',
   note:'Ação Completa: cria 2× Arte Bombas de Argila (+4 por Perito/Perícia Inata). Ação Parcial: lança efeito secundário com metade do chakra, metade dos bônus de dano e Dif −2.'
  }
 },
 'sns:pergaminho:apt:arremessar':{
  quickAction:{
   key:'pergaminho-arremessar',label:'Arremessar Oponente',action:'Padrão',cost:0,mode:'attack:cc',
   baseFormula:'halfFor',bonus:0,note:'Ao usar Derrubar, arremessa o alvo até 1 m por ponto de Força; colisão causa dano fixo igual à Força.'
  }
 },
 'sns:pergaminho:apt:shunjutsu-revisado':{
  toggle:{
   key:'pergaminho-shunjutsu',label:'Shunjutsu Revisado',action:'Livre',duration:'1 turno',
   note:'Concede +1 Kawarimi por cena; níveis 2 e 3 liberam finta com DES/INT e condição Acelerado.',
   stages:[
    {id:'taishunjutsu',label:'Taishunjutsu',cost:1,rules:[{target:'movement',value:5}]},
    {id:'ninshunjutsu',label:'Ninshunjutsu',cost:1,rules:[{target:'movement',value:4},{target:'esq',value:1}]}
   ]
  }
 },
 'sns:pergaminho:apt:controle-de-caloria':{
  toggle:{
   key:'pergaminho-controle-de-caloria',label:'Controle de Caloria (Pílulas)',action:'Parcial',duration:'Sustentada / 3 turnos',
   note:'Custo de Vitalidade (3 / 5 / 7) convertido em Chakra (3 / 5 / 7) e bônus de Força; se por pílula colorida, aplica cansaço/penalidade ao final.',
   stages:[
    {id:'verde',label:'Nível 1 · Pílula Verde',cost:0,rules:[{target:'attribute:for',value:2}]},
    {id:'amarelo',label:'Nível 2 · Pílula Amarela',cost:0,rules:[{target:'attribute:for',value:4}]},
    {id:'vermelho',label:'Nível 3 · Pílula Vermelha (Modo Chou)',cost:0,rules:[{target:'attribute:for',value:6}]}
   ]
  }
 },
 'sns:pergaminho:apt:armadura-de-raios':{
  toggle:{
   key:'pergaminho-armadura-de-raios',label:'Armadura de Raios Revisada',action:'Parcial',duration:'Sustentada / Contínua',
   note:'Concede Acelerado, golpes sob Energizar Raiton e acesso à reação Defesa Ativa.',
   stages:[
    {id:'nv1',label:'Nível 1',cost:4,rules:[{target:'hardness',value:1},{target:'movement',value:5},{target:'initiative',value:2}]},
    {id:'nv2',label:'Nível 2',cost:6,rules:[{target:'hardness',value:2},{target:'movement',value:10},{target:'initiative',value:2}]},
    {id:'nv3',label:'Nível 3',cost:8,rules:[{target:'hardness',value:3},{target:'movement',value:15},{target:'initiative',value:2}]}
   ]
  }
 },
 'sns:pergaminho:hijutsu:shinchi-tenkoho':{
  toggle:{
   key:'shinchi-tenkoho',label:'Sete Respirações do Paraíso',action:'Parcial',duration:'Sustentada / Contínua',
   note:'Apenas uma ativação por vez; Daisan Kassei libera Ataque Pesado e deixa fatigado ao encerrar.',
   stages:[
    {id:'daiichi',label:'Daiichi Kassei (1ª Ativação)',cost:2,rules:[{target:'attribute:for',value:2},{target:'initiative',value:2}]},
    {id:'daini',label:'Daini Kassei (2ª Ativação)',cost:3,rules:[{target:'attribute:for',value:4},{target:'attribute:agi',value:1},{target:'initiative',value:2}]},
    {id:'daisan',label:'Daisan Kassei (3ª Ativação)',cost:4,rules:[{target:'attribute:for',value:6},{target:'attribute:agi',value:2},{target:'initiative',value:2}]}
   ]
  }
 },
 // Grupo 2 — Reservas e contadores por item (Aburame, Hoshigaki, Kibaku, Fuuinjutsu)
 'sns:clan:aburame':aburameKikaichuu,
 'sns:apt:kikaichuu':aburameKikaichuu,
 'sns:power:kikai-ninpou':{
  quickAction:{
   key:'kikai-drenagem',label:'Kikai · Drenar Chakra',action:'Livre',cost:0,mode:'none',
   note:'Ao atingir com técnica de Kikai Ninpou de custo > 0, drena 1 ponto de chakra do alvo por nível usado.'
  }
 },
 'sns:apt:rinkaichuu':{
  chargePool:{
   key:'rinkaichuu-swarm',label:'Enxame Rinkaichuu',maxFormula:'skill:lidar_com_animais',unit:'grupos',
   rechargeLabel:'Multiplicar (½)',rechargeMode:'half',note:'Recupera metade do total perdido após 1 turno; toque transfere 1 grupo (Vigor Dif 7 + Lidar com Animais).'
  }
 },
 'sns:apt:kidaichuu':{
  toggle:{
   key:'kidaichuu-growth',label:'Kidaichuu · Crescimento Gigante',action:'Movimento',duration:'Sustentada',cost:2,
   rules:[{target:'attribute:for',value:2},{target:'hardness',value:1}],
   note:'Insetos gigantes consomem chakra do hospedeiro/vítima para ampliar tamanho e dano físico.'
  },
  chargePool:{
   key:'kidaichuu-swarm',label:'Kidaichuu (Parasita Gigante)',max:6,unit:'insetos',
   rechargeLabel:'Repor insetos',rechargeMode:'full',note:'Controle manual de crescimento conforme quantidade de chakra absorvida.'
  }
 },
 'sns:apt:shokaichuu':{
  quickAction:{
   key:'shokaichuu-track',label:'Shōkaichuu · Rastreamento',action:'Padrão',cost:1,mode:'check',checkKey:'skill:rastrear',
   note:'Envia insetos rastreadores subterrâneos para localizar alvos pela assinatura de chakra/odor.'
  }
 },
 'sns:clan:hoshigaki':hoshigakiShark,
 'sns:clan:hb-f05-hoshigaki':hoshigakiShark,
 'sns:apt:predador-aquatico':hoshigakiShark,
 'sns:apt:hb-f05-predador-aquatico':hoshigakiShark,
 'sns:apt:reserva-de-agua':waterReserve,
 'sns:apt:hb-f05-reserva-de-agua':waterReserve,
 'sns:hijutsu:kibaku-nendo':clayBombs,
 'sns:power:kibaku-nendo':clayBombs,
 'sns:kibaku-rev:hijutsu:kibaku-nendo':clayBombs,
 'sns:kibaku-rev:power:kibaku-nendo':clayBombs,
 'sns:power:fuuinjutsu':sealProdigy,
 'sns:jutsu:bakudan':sealProdigy,
 // Grupo 3 — Poderes comuns e de clã com executor dedicado
 'sns:power:iryou-ninjutsu':chakraScalpel,
 'sns:jutsu:chakra-no-mesu':chakraScalpel,
 'sns:power:kagejutsu':{
  toggle:{
   key:'nara-sombra-estendida',label:'Posse das Sombras (Concentração)',action:'Padrão',duration:'Concentração',cost:1,
   rules:[{target:'cd',value:1},{target:'skill:ocultismo',value:1}],
   note:'Enquanto mantém alvos presos em Kage Shibari/Mane, consome 1 chakra/turno na manutenção.'
  }
 },
 'sns:clan:nara':{
  passiveRules:[{target:'skill:ocultismo',value:1}],
  quickAction:{
   key:'nara-estrategia',label:'Estratégia Nara',action:'Livre',cost:0,mode:'check',checkKey:'attribute:int',
   note:'Avaliação tática do campo para antecipar armadilhas e alcance de sombras.'
  }
 },
 'sns:power:shindenshin':{
  quickAction:{
   key:'yamanaka-transmissao',label:'Transmissão / Elo Mental',action:'Padrão',cost:1,mode:'check',checkKey:'attribute:int',
   note:'Estabelece comunicação telepática entre aliados no alcance do poder.'
  }
 },
 'sns:clan:yamanaka':{
  passiveRules:[{target:'skill:prontidao',value:1}],
  toggle:{
   key:'yamanaka-foco-mental',label:'Concentração Mental Yamanaka',action:'Livre',duration:'Concentração',cost:0,
   rules:[{target:'cd',value:1}],
   note:'Foco para disparos mentais e interferências psíquicas do clã.'
  }
 },
 // Grupo 4 — Demais Clãs e Hijutsus sem preset anterior
 'sns:clan:hatake':silverFang,
 'sns:clan:hb-f05-hatake':silverFang,
 'sns:apt:presa-de-prata':silverFang,
 'sns:apt:hb-f05-presa-de-prata':silverFang,
 'sns:clan:sarutobi':willOfFire,
 'sns:clan:hb-f05-sarutobi':willOfFire,
 'sns:apt:vontade-do-fogo':willOfFire,
 'sns:apt:hb-f05-vontade-do-fogo':willOfFire,
 'sns:clan:senju':{
  passiveRules:[{target:'attribute:vig',value:1}],
  toggle:{
   key:'senju-vitalidade',label:'Vigor Hereditário Senju',action:'Livre',duration:'Cena',cost:1,
   rules:[{target:'hardness',value:1}],
   note:'Resistência corporal lendária e alta reserva de vitalidade/chakra do Clã Senju.'
  }
 },
 'sns:clan:uzumaki':{
  passiveRules:[{target:'attribute:vig',value:1}],
  quickAction:{
   key:'uzumaki-selo-vital',label:'Vitalidade Uzumaki',action:'Livre',cost:0,mode:'check',checkKey:'attribute:vig',
   note:'Teste de resistência física para suportar exaustão, extrações ou venenos.'
  }
 },
 'sns:clan:fuuma':{
  passiveRules:[{target:'cd',value:1}],
  quickAction:{
   key:'fuuma-shuriken-maestria',label:'Arremesso Fūma',action:'Padrão',cost:0,mode:'attack:cd',
   note:'Ataque especializado com Shurikens Gigantes e armas de arremesso do Clã Fūma.'
  }
 },
 'sns:clan:yotsuki':{
  passiveRules:[{target:'attribute:for',value:1}],
  toggle:{
   key:'yotsuki-impulso-trovao',label:'Impulso Corporal Yotsuki',action:'Livre',duration:'Sustentada',cost:1,
   rules:[{target:'cc',value:1},{target:'movement',value:2}],
   note:'Postura agressiva de Nintaijutsu típica da Vila da Nuvem.'
  }
 },
 'sns:clan:yuki':{
  toggle:{
   key:'yuki-espelhos',label:'Espelhos Demoníacos · Reflexo',action:'Movimento',duration:'Sustentada',cost:2,
   rules:[{target:'esq',value:2},{target:'initiative',value:2}],
   note:'Deslocamento instantâneo entre espelhos de gelo do Clã Yuki.'
  }
 },
 'sns:clan:shimura':{
  passiveRules:[{target:'cd',value:1}],
  quickAction:{
   key:'shimura-invocar-baku',label:'Pacto Baku · Sopro de Vácuo',action:'Padrão',cost:2,mode:'check',checkKey:'attribute:esp',
   note:'Ativa ou coordena manobra de sucção e selamento junto ao Baku / Fuuton.'
  }
 },
 'sns:clan:hoshigakure':{
  toggle:{
   key:'hoshigakure-estrela',label:'Treinamento da Estrela',action:'Livre',duration:'Sustentada',cost:0,
   rules:[{target:'cd',value:1},{target:'esq',value:1}],
   note:'Postura de controle de chakra estelar (use junto à reserva de Saúde de Kujaku Myoho).'
  }
 },
 'sns:clan:hb-f05-amahoshi':{
  toggle:{
   key:'amahoshi-brilho-estelar',label:'Aura Estelar Amahoshi',action:'Parcial',duration:'Sustentada',cost:2,
   rules:[{target:'attribute:esp',value:2},{target:'cd',value:1}],
   note:'Canaliza chakra luminoso opressor (consulte interações do Clã Amahoshi).'
  }
 },
 'sns:clan:hb-f05-kaminari':{
  toggle:{
   key:'kaminari-sobrecarga',label:'Descarga Relâmpago Kaminari',action:'Livre',duration:'Sustentada',cost:1,
   rules:[{target:'attribute:agi',value:1},{target:'initiative',value:2},{target:'movement',value:3}],
   note:'Estímulo elétrico neural que acelera reflexos e deslocamento.'
  }
 },
 'sns:clan:hb-f05-kurama':kuramaIllusion,
 'sns:apt:hb-f05-ilusao-real':kuramaIllusion,
 'sns:clan:hb-f05-namizuka':{
  toggle:{
   key:'namizuka-forma-kaiju',label:'Mutação Kaijū Namizuka',action:'Parcial',duration:'Sustentada',cost:2,
   rules:[{target:'attribute:for',value:2},{target:'hardness',value:1}],
   note:'Manifesta escamas/traços abissais para combate corporal aquático.'
  }
 },
 'sns:clan:hb-f05-ryuusei':{
  passiveRules:[{target:'attribute:int',value:1}],
  quickAction:{
   key:'ryuusei-onda-mental',label:'Pulso Telecinético Ryuusei',action:'Padrão',cost:1,mode:'check',checkKey:'attribute:int',
   note:'Projeta onda psíquica/telecinética usando Inteligência.'
  }
 },
 'sns:clan:hb-f05-seryuu-seiryuu':{
  toggle:{
   key:'seiryuu-chama-azul',label:'Chama Azul Hereditária',action:'Livre',duration:'Sustentada',cost:1,
   rules:[{target:'cd',value:1},{target:'attribute:esp',value:1}],
   note:'Intensifica técnicas de Aoi Katon / chamas espirituais do Clã Seiryuu.'
  }
 },
 'sns:clan:hb-f05-shirakumo':{
  toggle:{
   key:'shirakumo-tecelagem',label:'Fios de Seda Shirakumo',action:'Livre',duration:'Sustentada',cost:1,
   rules:[{target:'cd',value:1},{target:'esq',value:1}],
   note:'Manipula fios de seda espirituais para defesa reativa e aprisionamento.'
  }
 },
 'sns:hijutsu:tensai':{
  passiveRules:[{target:'initiative',value:1}],
  quickAction:{
   key:'tensai-genialidade',label:'Análise de Gênio (Tensai)',action:'Livre',cost:0,mode:'check',checkKey:'attribute:int',
   note:'Leitura rápida de padrões adversários com Inteligência.'
  }
 },
 'sns:apt:kakuran-taijutsu':{
  toggle:{
   key:'kakuran-taijutsu',label:'Kakuran Taijutsu (Ritmo Oculto)',action:'Livre',duration:'1 turno',cost:0,
   rules:[{target:'cc',value:2}],
   note:'Ataque rítmico imprevisível que dificulta leitura de movimentos.'
  }
 },
 'sns:feature:kuroi-kaminari':{
  toggle:{
   key:'kuroi-kaminari',label:'Relâmpago Negro',action:'Livre',duration:'Sustentada',cost:2,
   rules:[{target:'cd',value:1},{target:'cc',value:1}],
   note:'Infusão de Raiton Negro nas técnicas elétricas conforme descrição.'
  }
 },
 'sns:feature:nan-no-kaizou':{
  toggle:{
   key:'nan-no-kaizou',label:'Corpo Modificado (Maleável)',action:'Movimento',duration:'Sustentada',cost:1,
   rules:[{target:'skill:escapar',value:4},{target:'esq',value:1}],
   note:'Desloca articulações e estica membros para escapar de agarres e atacar à distância corporal.'
  }
 },
 'sns:hijutsu:jiton':{
  toggle:{
   key:'jiton-campo-magnetico',label:'Campo Magnético (Jiton II)',action:'Movimento',duration:'Sustentada',cost:1,
   rules:[{target:'cd',value:1},{target:'hardness',value:1}],
   note:'Reveste ou magnetiza projéteis/areia metálica ao redor do usuário.'
  }
 },
 'sns:hijutsu:kamijutsu':kamiPaperBody,
 'sns:apt:shikigami-no-mai':kamiPaperBody,
 'sns:apt:hb-f05-shikigami-no-mai':kamiPaperBody,
 'sns:hijutsu:saika-ikki':{
  passiveRules:[{target:'cd',value:1}],
  quickAction:{
   key:'saika-salva',label:'Disparo Rápido (Saika Ikki)',action:'Padrão',cost:0,mode:'attack:cd',
   note:'Ataque tático com armas de fogo/disparo em formação.'
  }
 },
 'sns:hijutsu:buki-senmon':{
  passiveRules:[{target:'cc',value:1},{target:'cd',value:1}],
  quickAction:{
   key:'buki-troca',label:'Maestria / Troca de Arsenal',action:'Livre',cost:0,mode:'attack:cc',
   note:'Saca e ataca com a arma adequada do arsenal sem perda de tempo.'
  }
 },
 'sns:hijutsu:daikiga':{
  quickAction:{
   key:'daikiga-sugar-chakra',label:'Toque Faminto (Daikiga)',action:'Padrão',cost:0,mode:'attack:cc',
   note:'Ataque corporal de drenagem de chakra pelo toque direto (ver limites do Hijutsu).'
  }
 },
 'sns:hijutsu:gorudogumo':{
  toggle:{
   key:'gorudogumo-armadura',label:'Armadura de Ouro Pegajoso',action:'Parcial',duration:'Cena',cost:2,
   rules:[{target:'hardness',value:3}],
   note:'Secreta exoesqueleto dourado resistente (+3 dureza corporal; confira peso/vulnerabilidades).'
  }
 },
 'sns:apt:seis-bracos':{
  toggle:{
   key:'seis-bracos',label:'Seis Braços (Multi-ação)',action:'Livre',duration:'Cena',cost:0,
   rules:[{target:'cc',value:2},{target:'cd',value:2}],
   note:'Aumenta o volume de ataques múltiplos e manipulação simultânea de armas/fios.'
  }
 },
 'sns:hijutsu:hebinomichi':{
  toggle:{
   key:'hebinomichi-pele',label:'Muda da Serpente Branca',action:'Parcial',duration:'Instantânea / Cena',cost:3,
   rules:[{target:'skill:escapar',value:3},{target:'hardness',value:1}],
   note:'Regeneração/troca de pele; recupera ferimentos e remove restrições físicas conforme descrição.'
  }
 },
 'sns:hijutsu:jashin-juusha':{
  toggle:{
   key:'jashin-ritual',label:'Ritual de Jashin (Vínculo de Sangue)',action:'Parcial',duration:'Cena',cost:0,
   rules:[{target:'hardness',value:2}],
   note:'Enquanto permanecer dentro do símbolo com sangue do alvo, reflete dano recebido e mantém imortalidade.'
  }
 },
 'sns:hijutsu:jingokuon':{
  quickAction:{
   key:'jingokuon-pulso',label:'Onda Sonora Infernal',action:'Padrão',cost:2,mode:'attack:cd',
   note:'Dispara vibração sonora direcionada pelo amplificador corporal.'
  }
 },
 'sns:hijutsu:mateki':{
  quickAction:{
   key:'mateki-melodia',label:'Melodia Demoníaca (Mateki)',action:'Padrão',cost:2,mode:'check',checkKey:'attribute:int',
   note:'Executa som hipnótico à distância contra alvos no alcance auditivo.'
  }
 },
 'sns:hijutsu:souma-no-jutsu':{
  toggle:{
   key:'souma-fusao',label:'Souma no Kou (Demônios Gêmeos)',action:'Completa',duration:'Cena',cost:2,
   rules:[{target:'attribute:for',value:2},{target:'attribute:vig',value:2}],
   note:'Funde os irmãos ou estende membros duplos para ataque/parasitismo corporal.'
  }
 },
 'sns:hijutsu:tessenjutsu':{
  quickAction:{
   key:'tessen-rajada',label:'Leque Gigante · Vendaval',action:'Padrão',cost:1,mode:'attack:cd',
   note:'Usa o Leque Gigante para amplificar golpes cortantes ou rajadas de Fuuton.'
  }
 },
 'sns:hijutsu:zetsu-seitai':{
  toggle:{
   key:'zetsu-mimetismo',label:'Zetsu · Mimetismo / Esporos',action:'Parcial',duration:'Sustentada',cost:1,
   rules:[{target:'skill:furtividade',value:4},{target:'skill:disfarces',value:4}],
   note:'Imita assinatura de chakra ou funde-se ao terreno natural sem deixar rastro.'
  }
 },
 'sns:hijutsu:hb-f05-corpo-e-olhos-do-sabio':{
  passiveRules:[{target:'attribute:vig',value:2},{target:'attribute:esp',value:2}],
  toggle:{
   key:'sabio-despertar',label:'Poder do Sábio dos Seis Caminhos',action:'Livre',duration:'Cena',cost:3,
   rules:[{target:'hardness',value:2},{target:'lm',value:2}],
   note:'Integração suprema entre vitalidade física e percepção espiritual.'
  }
 },
 'sns:hijutsu:hb-f05-fuuinshi-no-michi':{
  passiveRules:[{target:'skill:ocultismo',value:2}],
  quickAction:{
   key:'fuuinshi-inscrever',label:'Inscrição Instantânea de Selo',action:'Parcial',cost:1,mode:'check',checkKey:'skill:ocultismo',
   note:'Traça selos e barreiras espirituais em combate com velocidade ampliada.'
  }
 },
 'sns:hijutsu:hb-f05-heranca-do-deus-shinobi':{
  passiveRules:[{target:'attribute:vig',value:2},{target:'hardness',value:1}],
  toggle:{
   key:'heranca-regeneracao',label:'Células do Deus Shinobi (Regeneração)',action:'Livre',duration:'Cena',cost:2,
   rules:[{target:'hardness',value:2}],
   note:'Regeneração celular contínua e amplificação de Mokuton/vitalidade.'
  }
 },
 'sns:hijutsu:hb-f05-karada-no-shinka':{
  toggle:{
   key:'karada-shinka',label:'Karada no Shinka (Corpo Perfeito)',action:'Parcial',duration:'Sustentada',cost:2,
   rules:[{target:'attribute:for',value:2},{target:'attribute:agi',value:2},{target:'cc',value:2}],
   note:'Canaliza chakra diretamente em músculos e ossos para máximo rendimento físico.'
  }
 },
 'sns:hijutsu:hb-f05-ketsumyaku-no-ogi':{
  toggle:{
   key:'ketsumyaku-sangue',label:'Ketsumyaku · Frenesi Carmesim',action:'Livre',duration:'Sustentada',cost:0,
   rules:[{target:'cc',value:2},{target:'movement',value:2}],
   note:'O sangue derramado alimenta a velocidade e a precisão dos ataques.'
  }
 },
 'sns:hijutsu:hb-f05-medium':{
  toggle:{
   key:'medium-canal-espiritual',label:'Canal Espiritual (Médium)',action:'Movimento',duration:'Sustentada',cost:1,
   rules:[{target:'attribute:esp',value:1},{target:'lm',value:2}],
   note:'Sintonia com espíritos e correntes espirituais ao redor.'
  }
 },
 'sns:hijutsu:hb-f05-mestre-da-agua':azureFangPreset,
 'sns:apt:hb-f05-azure-fang':azureFangPreset,
 // Grupo 5 — Akimichi Base, Caminhos do Rinnegan, Hiraishin e Manobras
 'sns:apt:controle-de-caloria':akimichiPills,
 'sns:apt:sanshoku-no-ganyaku':akimichiPills,
 'sns:apt:tendo':{
  quickAction:{
   key:'rinnegan-tendo',label:'Caminho Deva (Shinra Tensei / Banshō)',action:'Padrão',cost:3,mode:'check',checkKey:'attribute:esp',
   note:'Repulsão ou atração gravitacional em área ou alvo único; recarga de 1 turno conforme descrição.'
  }
 },
 'sns:apt:shurado':{
  toggle:{
   key:'rinnegan-shurado',label:'Caminho Asura (Armamento Mecânico)',action:'Parcial',duration:'Cena',cost:2,
   rules:[{target:'hardness',value:2},{target:'cc',value:1},{target:'cd',value:1}],
   note:'Manifesta braços extras, lâminas e canhões biomecânicos no corpo.'
  }
 },
 'sns:apt:ningendo':{
  quickAction:{
   key:'rinnegan-ningendo',label:'Caminho Humano (Leitura / Extração)',action:'Padrão',cost:2,mode:'attack:cc',
   note:'Toca a cabeça do alvo imobilizado para extrair memórias ou a alma.'
  }
 },
 'sns:apt:chikushodo':{
  quickAction:{
   key:'rinnegan-chikushodo',label:'Caminho Animal (Invocação Sem Selos)',action:'Padrão',cost:2,mode:'none',
   note:'Invoca criaturas com Rinnegan compartilhando visão e sem necessidade de sangue.'
  }
 },
 'sns:apt:gakido':{
  quickAction:{
   key:'rinnegan-gakido',label:'Caminho Preta (Absorver Chakra / Técnica)',action:'Reação / Padrão',cost:0,mode:'check',checkKey:'attribute:esp',
   note:'Gera barreira que drena chakra ou anula ninjutsus pelo contato direto.'
  }
 },
 'sns:apt:jigokudo':{
  quickAction:{
   key:'rinnegan-jigokudo',label:'Caminho Naraka (Rei do Inferno)',action:'Padrão',cost:3,mode:'check',checkKey:'attribute:esp',
   note:'Invoca o Rei do Inferno para interrogatório ou restauração completa de corpos/Caminhos.'
  }
 },
 'sns:apt:gedo':{
  quickAction:{
   key:'rinnegan-gedo',label:'Caminho Exterior (Gedo / Correntes)',action:'Completa',cost:5,mode:'check',checkKey:'attribute:esp',
   note:'Controla receptoras negras, correntes de chakra ou ressuscita alvos conforme regras do Rinnegan.'
  }
 },
 'sns:apt:rinbo-hengoku':({
  quickAction:{
   key:'rinnegan-limbo',label:'Rinbo: Hengoku (Sombra do Limbo)',action:'Padrão',cost:4,mode:'attack:cc',
   note:'Projeta sombra invisível e intangível para atacar ou defender no plano do Limbo.'
  }
 }),
 'sns:feature:rinbo-hengoku':({
  quickAction:{
   key:'rinnegan-limbo',label:'Rinbo: Hengoku (Sombra do Limbo)',action:'Padrão',cost:4,mode:'attack:cc',
   note:'Projeta sombra invisível e intangível para atacar ou defender no plano do Limbo.'
  }
 }),
 'sns:apt:hiraishin':{
  quickAction:{
   key:'hiraishin-teleporte',label:'Hiraishin · Teleporte Instantâneo',action:'Livre / Reação',cost:2,mode:'none',
   note:'Teleporta instantaneamente para uma marcação ou kunai especial (sem teste em condições normais).'
  }
 },
 'sns:apt:hb-f05-ame-no-tejikara':{
  quickAction:{
   key:'ame-no-tejikara',label:'Ame no Tejikara (Troca Espacial)',action:'Parcial / Reação',cost:3,mode:'none',
   note:'Troca instantaneamente sua posição com alvo ou objeto à vista.'
  }
 },
 'sns:apt:mil-clones':{
  quickAction:{
   key:'mil-clones',label:'Tajuu Kage Bunshin (Enxame de Clones)',action:'Padrão',cost:4,mode:'none',
   note:'Divide o chakra para manifestar dezenas de clones sólidos simultâneos.'
  }
 },
 'sns:apt:deus-do-trovao':{
  toggle:{
   key:'deus-do-trovao',label:'Deus do Trovão (Aura Raiton)',action:'Livre',duration:'Sustentada',cost:2,
   rules:[{target:'cd',value:2},{target:'initiative',value:2}],
   note:'Amplifica velocidade de disparo e alcance com técnicas Raiton.'
  }
 },
 'sns:apt:demonio-do-vento':{
  toggle:{
   key:'demonio-do-vento',label:'Demônio do Vento',action:'Livre',duration:'Sustentada',cost:2,
   rules:[{target:'cd',value:2},{target:'movement',value:2}],
   note:'Domínio extremo de Fuuton e lâminas de vácuo.'
  }
 },
 'sns:apt:lamina-da-lua':{
  quickAction:{
   key:'lamina-da-lua',label:'Lâmina da Lua (Golpe Cortante)',action:'Padrão',cost:1,mode:'attack:cc',
   note:'Ataque veloz com arma de corte utilizando técnica de Konoha/Espada.'
  }
 },
 'sns:apt:fissao':{
  quickAction:{
   key:'fissao-dividir',label:'Fissão Corporal (Divisão em Dois)',action:'Completa',cost:3,mode:'none',
   note:'Divide-se em duas cópias reais independentes (cada uma com metade dos parâmetros conforme descrição).'
  }
 },
 'sns:apt:hitokugutsu':{
  passiveRules:[{target:'skill:mecanismos',value:2}],
  note:'Permite converter cadáveres em marionetes humanas preservando uma Kekkei Genkai/técnica.'
 },
 'sns:apt:shirohige':{
  quickAction:{
   key:'shirohige-enxame',label:'Técnica Secreta Branca (Dez Marionetes)',action:'Parcial',cost:3,mode:'attack:cd',
   note:'Controla até dez marionetes em formação coordenada.'
  }
 },
 'sns:apt:akahige':{
  quickAction:{
   key:'akahige-enxame',label:'Técnica Secreta Vermelha (Cem Marionetes)',action:'Completa',cost:6,mode:'attack:cd',
   note:'Mobiliza dezenas ou centenas de marionetes como um exército sincronizado.'
  }
 },
 'sns:apt:marionete-morta':{
  quickAction:{
   key:'marionete-morta',label:'Marionete Humana · Técnica Preservada',action:'Padrão',cost:2,mode:'check',checkKey:'skill:mecanismos',
   note:'Ativa a técnica preservada de uma Hitokugutsu através dos fios de chakra.'
  }
 },
 'sns:apt:chute-inverso':{
  quickAction:{
   key:'chute-inverso',label:'Chute Inverso',action:'Padrão',cost:0,mode:'attack:cc',
   baseFormula:'halfFor',bonus:0,note:'Ataque desarmado que finta como ação livre e contorna Bloqueio se vencer a finta.'
  }
 },
 'sns:apt:contragolpe':{
  quickAction:{
   key:'contragolpe',label:'Contragolpe',action:'Reação',cost:0,mode:'attack:cc',
   baseFormula:'halfFor',bonus:0,note:'Após esquivar ou defender de ataque corpo a corpo adjacente, executa ataque imediato.'
  }
 },
 'sns:apt:golpe-carate':{
  quickAction:{
   key:'golpe-carate',label:'Golpe Caratê',action:'Padrão',cost:0,mode:'attack:cc',
   baseFormula:'halfFor',bonus:2,note:'Golpe concentrado de alto impacto que ignora parte da absorção/dureza.'
  }
 },
 'sns:apt:soco-em-gancho':{
  quickAction:{
   key:'soco-em-gancho',label:'Soco em Gancho',action:'Padrão',cost:0,mode:'attack:cc',
   baseFormula:'halfFor',bonus:1,note:'Golpe ascendente desarmado visando desequilibrar ou atordoar o oponente.'
  }
 },
 'sns:apt:flechada-no-joelho':{
  quickAction:{
   key:'flechada-no-joelho',label:'Flechada no Joelho',action:'Padrão',cost:0,mode:'attack:cd',
   note:'Ataque à distância mirado nas pernas para reduzir o deslocamento ou derrubar o alvo.'
  }
 },
 'sns:apt:desarme-a-distancia':{
  quickAction:{
   key:'desarme-a-distancia',label:'Desarme à Distância',action:'Padrão',cost:0,mode:'attack:cd',
   note:'Manobra de arremesso ou disparo para derrubar a arma da mão do adversário.'
  }
 },
 'sns:apt:instancia-de-falange':{
  toggle:{
   key:'instancia-de-falange',label:'Instância de Falange',action:'Livre',duration:'1 turno',cost:0,
   rules:[{target:'esq',value:1},{target:'hardness',value:1}],
   note:'Postura defensiva com armas ou escudos que reforça a proteção contra investidas.'
  }
 },
 'sns:apt:esquiva-de-risco':{
  toggle:{
   key:'esquiva-de-risco',label:'Esquiva de Risco',action:'Livre',duration:'1 turno',cost:0,
   rules:[{target:'esq',value:3},{target:'cc',value:-2},{target:'cd',value:-2}],
   note:'Assume posição defensiva extrema (+3 Esquiva, −2 nos ataques até o próximo turno).'
  }
 }
});
