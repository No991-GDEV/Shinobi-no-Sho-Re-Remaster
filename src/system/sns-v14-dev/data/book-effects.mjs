// Source-defined availability and sequential evolutions; no generic executor.
export const BOOK_EFFECTS=[
  {
    "id": "sns:effect:canhao",
    "name": "Canhão",
    "min": 1,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "katon",
      "raiton",
      "suiton"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 95"
    },
    "text": "<h3>CANHÃO</h3><p>❖ Disponível para: Ninpou e todos os elementos básicos</p><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Alvo: uma criatura</p><p>❖ Dano: 2 por nível do poder</p><p>❖ Duração: Instantânea</p><p>Este Efeito permite ao personagem disparar um ataque em jato contra um alvo usando seu elemento, podendo ser um jato d’água, se for o elemento Suiton, ou um projétil de fogo, se for o elemento Katon, por exemplo. O alvo atingido por este ataque sofre 2 pontos de dano para cada nível usado do poder.</p><p>A partir do nível 2 do poder, o usuário ganha a opção de utilizar este Efeito sem custo de chakra, porém o dano da técnica é dividido pela metade (bônus de dano também são divididos). Usar o canhão desta forma não permite a acumulação com qualquer tipo de benefício (como aptidões e uso conjunto com outros efeitos ou poderes, a menos que seja expressamente permitido).</p>",
    "fields": {
      "available": "Ninpou e todos os elementos básicos",
      "action": "Padrão",
      "range": "comum do poder",
      "target": "uma criatura",
      "damage": "2 por nível do poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F01-efeito_poder-canhao",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:criar-arma",
    "name": "Criar Arma",
    "min": 2,
    "powers": [
      "ninpou",
      "doton",
      "suiton"
    ],
    "evolutions": [
      6
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 95, 96"
    },
    "text": "<h3>CRIAR ARMA</h3><p>❖ Disponível para: Ninpou, Doton e Suiton</p><p>❖ Ação: Parcial</p><p>❖ Alcance: Pessoal</p><p>❖ Dano: ver texto</p><p>❖ Duração: Sustentada ou Permanente (ver texto)</p><p>❖ Custo de Chakra: 1 (criação)</p><p>❖ Selos de Mão: Não Você cria uma arma simples ou marcial do tipo leve, longa, mediana ou de arremesso, exceto Kage Fushä, Lâmina Reta e Leque Gigante. As armas criadas têm o mesmo dano de sua versão comum (ver Tabela de Armas, pág. 137) e podem ser feitas para personagens de tamanho médio ou menor.</p><p>Com um único uso deste efeito você pode criar armas ou munições suficientes para preencher um compartimento de itens. Você ainda precisa cumprir os pré-requisitos de atributo e saber usar a arma criada para poder utiliza-la sem penalidades (ver em Armas, pág. 127).</p><p>Armas sólidas e rígidas possuem duração permanente. Armas não- sólidas possuem duração sustentada e se desfazem caso deixem a mão do usuário. As armas criadas recebem as vantagens e fraquezas do elemento usado, inclusive a dureza adicional (mas não o bônus de dano do elemento). Assim, um chicote Suiton dificilmente conseguirá quebrar uma barreira Doton, mas poderá ser usado para rebater projéteis Katon.</p><p>As armas criadas por este efeito permitem usar a reação de Bloqueio contra técnicas/efeitos do tipo projétil (como Canhão e Flechas), porém podem ser bloqueadas normalmente, assim como armas comuns.</p><p>Evoluções:</p><p>▪ Criar Arma Nv 6: Você é capaz de criar armas pesadas. Também pode criar armas para personagens de tamanho acima de médio.</p>",
    "fields": {
      "available": "Ninpou, Doton e Suiton",
      "action": "Parcial",
      "range": "Pessoal",
      "damage": "ver texto",
      "duration": "Sustentada ou Permanente (ver texto)",
      "chakraCost": "1 (criação)",
      "seals": "Não"
    },
    "recordId": "T05-F01-efeito_poder-criar-arma",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:orbe",
    "name": "Orbe",
    "min": 2,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "katon",
      "raiton",
      "suiton"
    ],
    "evolutions": [
      7
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 50"
    },
    "text": "<h3>ORBE</h3><p>❖ Disponível para: Ninpou e todos os elementos básicos</p><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Alvo: Uma criatura</p><p>❖ Dano: comum do poder</p><p>❖ Duração: Instantânea</p><p>Você cria um projétil esférico de 0,5m de diâmetro e dispara contra o alvo. A técnica causa dano comum do poder.</p><p>Evoluções:</p><p>▪ Orbe Nv 7: Usar Orbe em nível 7 ou mais custa somente metade do chakra e não pode ser bloqueado. Entretanto, o efeito não recebe benefícios de outros efeitos, aptidões de técnica ou poderes.</p>",
    "fields": {
      "available": "Ninpou e todos os elementos básicos",
      "action": "Padrão",
      "range": "comum do poder",
      "target": "Uma criatura",
      "damage": "comum do poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F03-efeito_poder-orbe",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:raio",
    "name": "Raio",
    "min": 2,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "katon",
      "raiton",
      "suiton"
    ],
    "evolutions": [
      5,
      8
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 96"
    },
    "text": "<h3>RAIO</h3><p>❖ Disponível para: Ninpou e todos os elementos básicos</p><p>❖ Ação: Padrão</p><p>❖ Alcance: Comum do poder</p><p>❖ Alvo: Uma ou mais criaturas (ver texto)</p><p>❖ Dano: 2 por nível do poder</p><p>❖ Duração: Instantânea</p><p>Você acerta seu inimigo com um raio, que não pode ser defendido com a reação de Bloqueio (a menos que seja um Bloqueio feito com uma arma especial que possa bloquear técnicas). O Raio causa dano base igual a 2 por nível usado do poder.</p><p>Evoluções:</p><p>▪ Raio Nv 5: Você pode atirar um Raio para cada 2 níveis no poder, sendo um Raio para cada alvo. Os alvos devem estar a no máximo 4m de distância entre si.</p><p>▪ Raio Nv 8: Com uma ação completa, você pode disparar um Raio mais poderoso contra um único alvo. Este Raio causa +2 de dano base adicional.</p>",
    "fields": {
      "available": "Ninpou e todos os elementos básicos",
      "action": "Padrão",
      "range": "Comum do poder",
      "target": "Uma ou mais criaturas (ver texto)",
      "damage": "2 por nível do poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F01-efeito_poder-raio",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:restringente",
    "name": "Restringente",
    "min": 2,
    "powers": [
      "ninpou",
      "doton",
      "suiton"
    ],
    "evolutions": [
      6
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 97"
    },
    "text": "<h3>RESTRINGENTE</h3><p>❖ Disponível para: Ninpou, Doton e Suiton</p><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Área de Efeito: Círculo</p><p>❖ Dano: Nenhum</p><p>❖ Duração: Contínua</p><p>Este efeito permite a criação de uma espécie de camada grudenta e grossa no chão que restringe o movimento de inimigos. Criaturas dentro da área de efeito ficam lentas, a menos que possuam a perícia Voo.</p><p>Se o efeito for usando numa área onde já exista alguma criatura, ela terá direito a uma ação defensiva. Caso a criatura seja bem-sucedida na defesa, ainda precisará sair da área do Efeito no seu próximo turno, ou sofrerá as penalidades dele.</p><p>Durante seu turno, com uma ação livre, a vítima pode realizar um teste de Escapar ou Força para se livrar da condição lento até o final do turno. A vítima ainda precisa se deslocar de alguma forma para deixar a área de efeito do Restringente, ou sofrerá a condição lento novamente.</p><p>Qualquer ataque em área usado sobre a região do Restringente retira imediatamente o efeito, permitindo também que as vítimas possam se movimentar livremente durante a defesa contra este ataque.</p><p>Evoluções:</p><p>▪ Restringente Nv 6: Ao invés de lentas, as vítimas ficarão impedidas, incapazes de realizar qualquer ação que necessite da mobilidade dos pés.</p>",
    "fields": {
      "available": "Ninpou, Doton e Suiton",
      "action": "Padrão",
      "range": "comum do poder",
      "area": "Círculo",
      "damage": "Nenhum",
      "duration": "Contínua"
    },
    "recordId": "T05-F01-efeito_poder-restringente",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:barreira",
    "name": "Barreira",
    "min": 3,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "suiton"
    ],
    "evolutions": [
      6,
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 97, 98"
    },
    "text": "<h3>BARREIRA</h3><p>❖ Disponível para: Ninpou, Doton, Fuuton e Suiton</p><p>❖ Ação: Movimento</p><p>❖ Alcance: comum do poder</p><p>❖ Duração: ver texto</p><p>Você conjura uma barreira feita com seu elemento para lhe proteger de um ataque. Ela tem dureza padrão e formato de um muro ou semicilindro de metade do tamanho comum do poder. Deve haver espaço entre você e o inimigo para que a barreira seja criada (logo, não é possível usar a barreira para se defender de ataques feitos por inimigos adjacentes).</p><p>Usar a barreira como defesa requer teste de LM com +2 de precisão, com custo de chakra pago antes do teste.</p><p>Quando destruída, aqueles protegidos pela barreira sofrerão a diferença de dano após a redução pela sua dureza.</p><p>Enquanto não for destruída, a barreira permanece no campo de batalha. As barreiras sólidas (feitas de pedra ou madeira) têm duração permanente, enquanto que barreiras de outros tipos (como água ou vento) têm duração sustentada. O elemento gelo possui duração permanente especial, derretendo em 1h por nível usado.</p><p>Evoluções:</p><p>▪ Barreira Nv 6: A barreira se torna uma redoma em semiesfera capaz de rodear o usuário completamente, protegendo-o sem aberturas. Também pode ser usada para enjaular inimigos (ação padrão, teste de CD -2).</p><p>▪ Barreira Nv 9: Dureza +2.</p>",
    "fields": {
      "available": "Ninpou, Doton, Fuuton e Suiton",
      "action": "Movimento",
      "range": "comum do poder",
      "duration": "ver texto"
    },
    "recordId": "T05-F01-efeito_poder-barreira",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:flechas",
    "name": "Flechas",
    "min": 3,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "katon",
      "raiton",
      "suiton"
    ],
    "evolutions": [
      6,
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 98"
    },
    "text": "<h3>FLECHAS</h3><p>❖ Disponível para: Ninpou e todos os elementos básicos</p><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Alvo: uma ou mais criaturas</p><p>❖ Dano: 2 por projétil</p><p>❖ Duração: Instantânea</p><p>Você lança vários projéteis feitos com seu poder. Os projéteis podem assumir qualquer formato, como flechas, agulhas, shurikens, kunais ou pequenas bolas de fogo. Cada projétil causa 2 de dano base e é possível criar 1 projétil por nível usado do poder.</p><p>Você pode concentrar todos os projéteis num mesmo alvo ou em múltiplos alvos dentro do alcance. Cada alvo faz uma única defesa, qualquer que seja a quantidade de projéteis. Se houver qualquer bônus de dano (inclusive bônus de elemento), ele somente é aplicado uma única vez para cada alvo.</p><p>Fintar: Por 2 pontos de chakra, você pode utilizar este efeito como uma Finta para encobrir seu próximo ataque à distância (de qualquer tipo, lançando projétil ou usando técnicas). Realize o teste de Finta utilizando a perícia Prestidigitação no lugar da Agilidade. O efeito não causa dano quando usado dessa forma.</p><p>Evoluções:</p><p>▪ Flechas Nv 6: Você aprendeu a não desperdiçar seus disparos. Quando mirar em um só alvo e ele for bem-sucedido na Esquiva ou a manobra Antecipar, você pode refazer o teste, mas causará metade do dano base. O alvo não refaz a defesa.</p><p>▪ Flechas Nv 9: Você causa dano integral quando refizer o teste de ataque.</p><p>Regra para Dureza: a dureza indica quanto de dano um objeto pode receber sem quebrar, e é verificada antes de aplicar o grau de dano. Se um objeto com dureza 5 é atacado por uma técnica de dano 5, ele quebra, mas não quebra se a técnica causa 4 de dano ou menos.</p><p>Se a Barreira possui dureza 7, e o personagem quer usá-la para defender uma técnica de 9 de dano, ela se quebra, e 2 de dano ultrapassam a sua proteção, que são sofridos pelo personagem com o grau definido no teste de ataque do inimigo.</p><p>Cada vez que um objeto é danificado, mas não o suficiente para ser quebrado, sua dureza é reduzida em 2 pontos.</p>",
    "fields": {
      "available": "Ninpou e todos os elementos básicos",
      "action": "Padrão",
      "range": "comum do poder",
      "target": "uma ou mais criaturas",
      "damage": "2 por projétil",
      "duration": "Instantânea"
    },
    "recordId": "T05-F01-efeito_poder-flechas",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:lanca",
    "name": "Lança",
    "min": 3,
    "powers": [
      "ninpou",
      "doton",
      "suiton"
    ],
    "evolutions": [
      6,
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 52"
    },
    "text": "<h3>LANÇA*</h3><p>❖ Disponível para: Ninpou, Doton e Suiton</p><p>❖ Ação: Padrão</p><p>❖ Alcance: Comum do Poder</p><p>❖ Alvo: Uma ou mais criaturas</p><p>❖ Dano: Comum do Poder</p><p>❖ Duração: Instantânea</p><p>Você cria um espinho pontiagudo que surge a até 2m de distância e se estica contra seu inimigo. Esse ataque é especialmente bom em atravessar proteções, ignorando 3 pontos de dureza de barreiras e objetos e 1 de Dureza de Corpo. Você pode criar uma única lança para atingir um só alvo ou diversas lanças para múltiplos alvos dentro do alcance, dividindo o dano base do poder entre a quantidade de inimigos atacados.</p><p>Evoluções:</p><p>▪ Lança Nv 6: Sua lança surge diretamente abaixo do inimigo, como um espinho, ignora coberturas preexistentes, anula as bonificações de defesa dos alvos caídos e até 2 de Dureza de Corpo. O alvo ainda deve estar dentro do alcance do poder.</p><p>▪ Lança Nv 9: O alvo deve fazer um teste de Prontidão antes de sua defesa. Se falhar ficará desprevenido. Além disso, esse efeito passa a ignorar toda Dureza e Dureza de Corpo.</p>",
    "fields": {
      "available": "Ninpou, Doton e Suiton",
      "action": "Padrão",
      "range": "Comum do Poder",
      "target": "Uma ou mais criaturas",
      "damage": "Comum do Poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F03-efeito_poder-lanca",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:ricochete",
    "name": "Ricochete",
    "min": 3,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "katon",
      "raiton",
      "suiton"
    ],
    "evolutions": [
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 99"
    },
    "text": "<h3>RICOCHETE</h3><p>❖ Disponível para: Ninpou e todos os elementos básicos</p><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Alvo: uma ou mais criaturas (ver texto)</p><p>❖ Dano: comum do poder + bônus (ver texto)</p><p>❖ Duração: Instantânea Você dispara um raio que salta de alvo em alvo, atingindo diversos inimigos. Escolha um alvo dentro do alcance desse efeito. Seu ataque atingirá até um inimigo diferente a mais para cada 2 níveis no poder, à sua escolha, dentro de um máximo de 10m de distância do alvo original.</p><p>O efeito prossegue atingindo cada alvo, na ordem escolhida. Quando algum deles for bem-sucedido na defesa, o Ricochete é interrompido e o efeito acaba.</p><p>Evoluções:</p><p>▪ Ricochete Nv 9: Cada vez que o efeito atinge um novo alvo, seu dano base aumenta em +1, até o limite de +5.</p>",
    "fields": {
      "available": "Ninpou e todos os elementos básicos",
      "action": "Padrão",
      "range": "comum do poder",
      "target": "uma ou mais criaturas (ver texto)",
      "damage": "comum do poder + bônus (ver texto)",
      "duration": "Instantânea"
    },
    "recordId": "T05-F01-efeito_poder-ricochete",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:coluna",
    "name": "Coluna",
    "min": 4,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "katon",
      "raiton",
      "suiton"
    ],
    "evolutions": [
      7,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 99, 100"
    },
    "text": "<h3>COLUNA</h3><p>❖ Disponível para: Ninpou e todos os elementos básicos</p><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Área de Efeito: cilindro</p><p>❖ Dano: 2 por nível do poder</p><p>❖ Duração: Instantânea</p><p>Escolha uma área. Você cria uma explosão no formato de um cilindro vertical, com diâmetro e altura comum do poder. O alvo que estiver na área atingida sofrerá dano base igual a 2 por nível usado do poder.</p><p>Evoluções:</p><p>▪ Coluna Nv 7: Você pode dividir toda a área original da coluna em colunas menores de 1m de diâmetro, escolhendo quais áreas serão atingidas ou não pela técnica. As mini-colunas ainda devem estar dentro da área de tamanho comum do poder.</p><p>▪ Coluna Nv 10: Suas mini-colunas cercam os alvos em várias direções. Os alvos devem fazer um teste de Prontidão, e se falharem, ficarão com defesa debilitada (-2).</p>",
    "fields": {
      "available": "Ninpou e todos os elementos básicos",
      "action": "Padrão",
      "range": "comum do poder",
      "area": "cilindro",
      "damage": "2 por nível do poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F01-efeito_poder-coluna",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:energizar",
    "name": "Energizar",
    "min": 4,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "katon",
      "raiton",
      "suiton"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 52, 53"
    },
    "text": "<h3>ENERGIZAR*</h3><p>❖ Disponível para: Ninpou e todos os elementos básicos</p><p>❖ Ação: Parcial</p><p>❖ Alcance: Pessoal</p><p>❖ Alvo: Membros, Arma ou Compartimento com projéteis</p><p>❖ Dano: Ver Texto</p><p>❖ Duração: Sustentada</p><p>❖ Custo de Chakra: 3</p><p>❖ Selos de Mão: Não</p><p>Você energiza o próprio punho, uma arma que esteja segurando ou um compartimento inteiro de armas ou projéteis. Quando ataca com uma arma energizada você, pode substituir o atributo Força/Destreza pelo Espírito no cálculo do dano (não é obrigatório).</p><p>As armas energizadas recebem as vantagens e fraquezas do elemento usado (se energizar uma katana com Raiton, ela passa a ter vantagem contra defesas do tipo Doton, por exemplo), mas não os bônus de dano ou dureza.</p><p>Se possuir Ambidestria, você pode energizar ambas as armas que estiver segurando com uma única ação, porém pagando o custo de chakra para cada arma. O Energizar funciona somente enquanto você estiver empunhando a arma (ou seja, o efeito termina ao guardar a arma). Para projéteis, o efeito termina no final do seu turno após serem arremessados.</p><p>Armas energizadas podem ser bloqueadas normalmente, tais como armas comuns, porém permitem usar a reação defensiva de Bloqueio contra técnicas/efeitos do tipo projétil (como Canhão e Flechas). Punhos e armas energizadas podem ser usadas em aptidões de manobra. Você pode executar este efeito imediatamente depois do Criar Arma, como uma ação livre, se for do mesmo elemento.</p><p>Você não pode usar este efeito junto com outra técnica de suporte que altere seu ataque corpo-a-corpo (exemplo: não se pode usar Energizar junto com Juuken ou o Bisturi de Chakra). Armas Especiais, como o Bastão Adamantino (Ver este Livro, Pág. 10 e 11), não podem ser energizadas a menos que o texto da arma permita.</p><p>Punho de Ferro Energizado: Caso possua Punho de Ferro assim como os punhos/pés energizados por esse efeito, você poderá usar Espírito no lugar de Força para definir o dano de arma da aptidão Punho de Ferro. Não é considerado nenhum bônus de Espírito nesse cálculo.</p>",
    "fields": {
      "available": "Ninpou e todos os elementos básicos",
      "action": "Parcial",
      "range": "Pessoal",
      "target": "Membros, Arma ou Compartimento com projéteis",
      "damage": "Ver Texto",
      "duration": "Sustentada",
      "chakraCost": "3",
      "seals": "Não"
    },
    "recordId": "T05-F03-efeito_poder-energizar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:nuvem",
    "name": "Nuvem",
    "min": 4,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "suiton"
    ],
    "evolutions": [
      7,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 100, 101"
    },
    "text": "<h3>NUVEM</h3><p>❖ Disponível para: Ninpou, Doton, Fuuton e Suiton</p><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Alvo: o ambiente</p><p>❖ Área de Efeito: círculo com dobro do tamanho</p><p>❖ Dano: ver texto</p><p>❖ Duração: Concentração</p><p>Você cria uma nuvem quente, corrosiva ou com outra propriedade de sua escolha. Ela é disparada em formato de cone e então se assenta no ambiente, preenchendo uma área com formato circular de diâmetro igual ao dobro do tamanho comum do poder. A nuvem permanece enquanto você mantiver sua concentração nesse efeito.</p><p>No início de cada um de seus turnos, todas as criaturas vivas que estiverem dentro da nuvem deverão fazer um teste de Vigor (Dif padrão -2). Falhando, sofrerão 1 de dano fixo por nível usado do poder e ficarão lentas, conforme combatem as tosses ou outros efeitos adversos causados pela substância que compõe a nuvem. O usuário não é afetado pela nuvem. Se a criatura não tiver qualquer contato com a nuvem entre um turno e outro, não sofrerá seus efeitos naquele turno.</p><p>A nuvem possui uma dureza imaginária, de valor padrão do poder. Sempre que um ataque em área com explosões (ex: Katon) ou ventos (ex: Fuuton) for usado sobre a nuvem ou dentro dela, a sua dureza é reduzida. Se a dureza chegar a zero, a nuvem se dissipa. A dureza imaginária segue todas as regras comuns para dureza de objeto (ver no efeito Barreira ou na pág. 274), porém não lhe protege contra danos (o dano base dos ataques não são reduzidos pela dureza imaginária!).</p><p>Evoluções:</p><p>▪ Nuvem Nv 7: Você é capaz de manter sua nuvem com duração sustentada.</p><p>▪ Nuvem Nv 10: A nuvem ganha +3 de dureza e o dano fixo é dobrado.</p>",
    "fields": {
      "available": "Ninpou, Doton, Fuuton e Suiton",
      "action": "Padrão",
      "range": "comum do poder",
      "target": "o ambiente",
      "area": "círculo com dobro do tamanho",
      "damage": "ver texto",
      "duration": "Concentração"
    },
    "recordId": "T05-F01-efeito_poder-nuvem",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:sopro-destrutivo",
    "name": "Sopro Destrutivo",
    "min": 4,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "katon",
      "raiton",
      "suiton"
    ],
    "evolutions": [
      7,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 101"
    },
    "text": "<h3>SOPRO DESTRUTIVO</h3><p>❖ Disponível para: Ninpou e todos os elementos básicos</p><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Área de Efeito: cone</p><p>❖ Dano: comum do poder</p><p>❖ Duração: Instantânea</p><p>Você projeta um ataque contra seus alvos semelhante a um sopro, que se espalha para frente e para os lados, em formato de um cone, causando dano comum do poder em todos que estiverem na área de efeito.</p><p>Evoluções:</p><p>▪ Sopro Nv 7: Seu sopro se alastra de forma mais intensa, dificultando a defesa. Se o alvo se defendeu usando Esquiva ou a manobra Antecipar, mesmo que seja bem-sucedido, deve realizar um teste de Acrobacia. Falhando, sofrerá o dano do poder com grau 1 como dano remanescente. Inimigos acelerados têm sucesso automático nesse teste.</p><p>▪ Sopro Nv 10: O dano remanescente passa a ter grau 2, mas somente se o seu teste de ataque teve grau de dano 2 ou mais.</p>",
    "fields": {
      "available": "Ninpou e todos os elementos básicos",
      "action": "Padrão",
      "range": "comum do poder",
      "area": "cone",
      "damage": "comum do poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F01-efeito_poder-sopro-destrutivo",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:correnteza",
    "name": "Correnteza",
    "min": 5,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "suiton"
    ],
    "evolutions": [
      8
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 54"
    },
    "text": "<h3>CORRENTEZA*</h3><p>❖ Disponível para: Ninpou, Doton, Fuuton e Suiton</p><p>❖ Ação: Padrão</p><p>❖ Alcance: Comum do poder</p><p>❖ Área de Efeito: Onda de largura e altura igual ao tamanho padrão do poder</p><p>❖ Dano: Comum do poder</p><p>❖ Duração: Instantânea</p><p>Você conjura uma correnteza de água, lama, ventos ou outro fluido, varrendo seus oponentes. A correnteza é disparada em formato de onda e pode se iniciar de qualquer ponto dentro do alcance comum do poder e em qualquer direção, exceto para cima. Um inimigo pego por esse efeito deve testar Vigor (Dif padrão -2) ou será empurrado até o fim da sua distância. Caso ele colida contra algum obstáculo capaz de reter seu movimento, o efeito causa +1 de dano de concussão.</p><p>Evoluções:</p><p>▪ Correnteza Nv 8: Um inimigo que falhe no teste de Vigor e colida contra um obstáculo é também atordoado até o final do próximo turno dele. Além disso, é possível moldar qual a largura da onda projetada por esse efeito sendo o mínimo o Nível do Poder usado.</p>",
    "fields": {
      "available": "Ninpou, Doton, Fuuton e Suiton",
      "action": "Padrão",
      "range": "Comum do poder",
      "area": "Onda de largura e altura igual ao tamanho padrão do poder",
      "damage": "Comum do poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F03-efeito_poder-correnteza",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:missil",
    "name": "Míssil",
    "min": 5,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "katon",
      "raiton",
      "suiton"
    ],
    "evolutions": [
      8,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 101, 102"
    },
    "text": "<h3>MÍSSIL</h3><p>❖ Disponível para: Ninpou e todos os elementos básicos</p><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Área de Efeito: Linha</p><p>❖ Dano: comum do poder + bônus (ver texto)</p><p>❖ Duração: Instantânea</p><p>Você libera um ou mais de mísseis contra seu oponente, como projéteis de lama cuspidos por uma cabeça de dragão ou uma rajada de fogo em sequência, causando dano comum do poder. Após realizar o ataque e acertar seu alvo, role seu teste de ataque mais uma vez (o alvo não precisa refazer sua defesa). Se acertar, o efeito causa +1 de dano base.</p><p>Dragão de Fogo [somente para Míssil Katon]: você pode usar Míssil contra um alvo que foi amarrado por um kousen no mesmo turno. Atacar desta forma custa somente uma ação parcial e o kousen é destruído no processo.</p><p>Evoluções:</p><p>▪ Míssil Nv 8: Após acertar seu alvo, role seu teste de ataque duas vezes, e receba +1 de dano por cada acerto.</p><p>▪ Míssil Nv 10: Após acertar seu alvo, role seu teste de ataque quatro vezes.</p>",
    "fields": {
      "available": "Ninpou e todos os elementos básicos",
      "action": "Padrão",
      "range": "comum do poder",
      "area": "Linha",
      "damage": "comum do poder + bônus (ver texto)",
      "duration": "Instantânea"
    },
    "recordId": "T05-F01-efeito_poder-missil",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:onda-explosiva",
    "name": "Onda Explosiva",
    "min": 5,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "katon",
      "raiton",
      "suiton"
    ],
    "evolutions": [
      8
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 56"
    },
    "text": "<h3>ONDA EXPLOSIVA*</h3><p>❖ Disponível para: Ninpou e todos os elementos básicos</p><p>❖ Ação: Padrão ou Padrão mais Movimento (Ver Texto)</p><p>❖ Área de Efeito: Meia-esfera ou Círculo com dobro do diâmetro</p><p>❖ Dano: Comum do Poder</p><p>❖ Duração: Instantânea</p><p>Você projeta uma onda de choque ao seu redor, no formato de uma meia- esfera ou círculo com centro em si próprio. Apesar do nome, a onda explosiva pode adotar diversas formas, como uma explosão de fogo, um tornado de água, dentre outras possibilidades.</p><p>Aqueles que forem atingidos pela onda sofrem dano comum do poder e devem testar Vigor (Dif padrão -2) ou serão empurrados até o limite da área do efeito.</p><p>É possível despender da ação de movimento como custo adicional ao utilizar essa técnica para não sofrer as penalidades de -3 em CD por usar técnica à distância com inimigo próximo, caso opte por gastar a ação de movimento, a Onda Explosiva não poderá receber nenhum benefício de Aptidões de Técnica.</p><p>Não é possível utilizar Potencializar com este efeito.</p><p>Evoluções:</p><p>▪ Onda Explosiva Nv 8: A vítima que falha no teste de Vigor também ficará Caída.</p>",
    "fields": {
      "available": "Ninpou e todos os elementos básicos",
      "action": "Padrão ou Padrão mais Movimento (Ver Texto)",
      "area": "Meia-esfera ou Círculo com dobro do diâmetro",
      "damage": "Comum do Poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F03-efeito_poder-onda-explosiva",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:algemar",
    "name": "Algemar",
    "min": 6,
    "powers": [
      "ninpou",
      "doton",
      "suiton"
    ],
    "evolutions": [
      8,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 102"
    },
    "text": "<h3>ALGEMAR</h3><p>❖ Disponível para: Ninpou, Doton e Suiton.</p><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Alvo: uma criatura</p><p>❖ Dano: Nenhum</p><p>❖ Duração: Concentração</p><p>Este efeito permite prender uma ou ambas as pernas do inimigo através de amarras, cordas ou estruturas semelhantes construídas através do material de seu poder. Se bem-sucedido, o ataque não causará dano e o alvo ficará impedido.</p><p>Em seu turno, a vítima pode destruir as algemas (que possuem dureza comum do poder) ou se libertar através de um teste de Força ou Escapar. Qualquer que seja a escolha, é necessária uma ação padrão.</p><p>Também poderá se libertar através de outro efeito que não necessite de mobilidade dos pés. Caso a vítima presa seja alvo de um ataque em área, as algemas também sofrem o dano deste ataque, reduzindo sua dureza (ver no efeito Barreira ou na pág. 274).</p><p>Evoluções:</p><p>▪ Algemar Nv 8: O efeito passa a ter duração Sustentada.</p><p>▪ Algemar Nv 10: Pode atingir até 3 alvos que estejam a 5m um do outro. Se usar esta técnica duas vezes nos mesmos alvos eles ficam indefesos, com todo o corpo algemado.</p>",
    "fields": {
      "available": "Ninpou, Doton e Suiton.",
      "action": "Padrão",
      "range": "comum do poder",
      "target": "uma criatura",
      "damage": "Nenhum",
      "duration": "Concentração"
    },
    "recordId": "T05-F01-efeito_poder-algemar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:imergir",
    "name": "Imergir",
    "min": 2,
    "powers": [
      "doton"
    ],
    "evolutions": [
      4
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 103, 104"
    },
    "text": "<h3>IMERGIR</h3><p>❖ Ação: Completa</p><p>❖ Alcance: Pessoal</p><p>❖ Duração: Contínua</p><p>Você torna-se capaz de se fundir com o seu elemento ou submergir totalmente nele. Somente é possível usar imergir para se fundir a elementos soltos na própria natureza (como o próprio chão ou a parede de uma caverna) ou objetos construídos com poderes, desde que sejam feitos com a regra de Criação Livre ou com o efeito Barreira. O local da imersão deve ser grande o suficiente para caber o seu corpo.</p><p>Enquanto permanecer imerso, você receberá os benefícios da aptidão Perito para Furtividade, não poderá se mover e terá sua visão limitada a 10m de distância. Seu bônus de furtividade dura enquanto permanecer oculto a menos que algo denuncie seu esconderijo.</p><p>Atacar ou utilizar técnicas enquanto estiver imerso revela sua posição (a menos que a técnica não tenha você como ponto de origem). Sair da imersão é uma ação de movimento.</p><p>Mesmo com o corpo totalmente imerso, você fica somente a alguns poucos centímetros da superfície. A dureza do elemento não o protege contra ataques inimigos.</p><p>Falsa Decapitação: Quando está imerso no solo, caso tenha sido bem- sucedido no teste de Furtividade, você pode usar a manobra Agarrar como um ataque furtivo em um alvo que esteja imediatamente acima de sua posição. Você puxa o alvo para dentro da terra e salta para fora logo depois, tudo isso como uma ação completa.</p><p>A vítima fica somente com a cabeça para fora do chão, com todo o resto do corpo imerso, recebendo a condição impedido. Para se livrar da técnica, é necessário uma ação de movimento e um teste bem-sucedido de Força ou Escapar, Dif 10.</p><p>Evoluções:</p><p>▪ Imergir Nv 4: Você pode se mover livremente no meio no qual imergiu, com metade de seu deslocamento, enquanto mantém sua furtividade. Além disso, seus sentidos não são atrapalhados pelo efeito.</p>",
    "fields": {
      "action": "Completa",
      "range": "Pessoal",
      "duration": "Contínua"
    },
    "recordId": "T05-F01-efeito_poder-imergir",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:tremor",
    "name": "Tremor",
    "min": 2,
    "powers": [
      "doton"
    ],
    "evolutions": [
      4
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 104"
    },
    "text": "<h3>TREMOR</h3><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Área de Efeito: Círculo de 2m de diâmetro</p><p>❖ Dano: Nenhum</p><p>❖ Duração: Instantânea</p><p>O personagem envia chakra pela terra até uma área dentro do alcance, fazendo o chão daquela área tremer. Criaturas na área têm direito a uma ação defensiva, e se falharem, ficarão caídas. Opcionalmente, elas têm direito gastar uma ação de movimento para realizar um teste imediato de Acrobacia para se manterem de pé.</p><p>Evoluções:</p><p>▪ Tremor Nv 4: o círculo tem diâmetro comum do poder.</p>",
    "fields": {
      "action": "Padrão",
      "range": "comum do poder",
      "area": "Círculo de 2m de diâmetro",
      "damage": "Nenhum",
      "duration": "Instantânea"
    },
    "recordId": "T05-F01-efeito_poder-tremor",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:pele-de-pedra",
    "name": "Pele de Pedra",
    "min": 6,
    "powers": [
      "doton"
    ],
    "evolutions": [
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 104"
    },
    "text": "<h3>PELE DE PEDRA</h3><p>❖ Ação: Movimento</p><p>❖ Alcance: Pessoal</p><p>❖ Duração: Instantânea ou Sustentada</p><p>❖ Selos de Mão: Não</p><p>Você manipula seu elemento para tornar a pele tão dura quanto o mais resistente minério, recebendo dureza de corpo igual à dureza padrão do poder (+2 de dureza extra do elemento Doton), até o final do turno no qual usou o efeito.</p><p>Após o uso, este efeito pode ser mantido de forma sustentada, porém você recebe somente 1 de dureza de corpo (sem o bônus do elemento). A dureza de corpo não é cumulativa, ficando somente a maior (mesmo que sejam durezas de uma mesma fonte).</p><p>Defesa: É possível utilizar esse efeito como técnica defensiva, através de um teste de LM. Você ainda precisa de uma ação de movimento para usá-lo como técnica defensiva, mesmo que esteja mantendo o efeito de forma sustentada.</p><p>Soco de Pedra: Você pode usar e sustentar o efeito Energizar - Doton junto com o Pele de Pedra, como uma ação livre. Ao fazer isso, seus socos passam a causar dano letal, com 4 de dano de arma.</p><p>Evoluções:</p><p>▪ Pele de Pedra Nv 9: A dureza de corpo sustentada aumenta para 2 pontos. Não é possível usar a defesa Bloqueio contra o Soco de Pedra.</p>",
    "fields": {
      "action": "Movimento",
      "range": "Pessoal",
      "duration": "Instantânea ou Sustentada",
      "seals": "Não"
    },
    "recordId": "T05-F01-efeito_poder-pele-de-pedra",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:venenoso",
    "name": "Venenoso",
    "min": 5,
    "powers": [
      "fuuton"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 106"
    },
    "text": "<h3>VENENOSO</h3><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Área de Efeito: cone de tamanho comum do poder</p><p>❖ Dano: Nenhum</p><p>❖ Duração: Instantânea</p><p>Com este Efeito, o personagem cria uma névoa ou fumaça venenosa usando um de seus venenos produzidos com a perícia Venefício. Somente é possível usar venenos de até nível II com este efeito. Uma técnica Venenosa não causa dano, mas garante a injeção do veneno no corpo do alvo, que deverá fazer os devidos testes de resistência. O veneno usado neste efeito é consumido.</p>",
    "fields": {
      "action": "Padrão",
      "range": "comum do poder",
      "area": "cone de tamanho comum do poder",
      "damage": "Nenhum",
      "duration": "Instantânea"
    },
    "recordId": "T05-F01-efeito_poder-venenoso",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:afiar",
    "name": "Afiar",
    "min": 6,
    "powers": [
      "fuuton"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 106"
    },
    "text": "<h3>AFIAR</h3><p>❖ Pré-requisito: Energizar</p><p>❖ Ação: Parcial</p><p>❖ Alcance: Pessoal</p><p>❖ Alvo: uma arma cortante ou perfurante</p><p>❖ Dano: ver texto</p><p>❖ Duração: Sustentada</p><p>❖ Selos de Mão: Não</p><p>Essa técnica torna uma arma afiada, aumentando sua habilidade para desferir golpes eficazes. Afiar somente pode ser usado em armas reais do tipo perfurante ou cortante, e nunca em armas naturais ou feitas pelo efeito Criar Arma. Este efeito concede os mesmos benefícios de Energizar, com os seguintes adicionais (aplique todos os benefícios possíveis na arma).</p><p>Fio melhorado: sua arma ignora 1 ponto de dureza do alvo. Qualquer arma comum que seja bloqueada por você, ou que bloqueie um ataque seu com este efeito, é imediatamente destruída, a menos que esteja sob o efeito Energizar (com exceção de Energizar Raiton). Neste caso, seu ataque será um Sucesso Automático.</p><p>Crítico Melhorado: a margem de crítico da arma aumentam em 1. Assim, se o crítico da arma é 15-16, passa ser 14-15-16. Esse bônus não se acumula com qualquer outro do mesmo tipo.</p><p>Lâmina Estendida: Você cria uma lâmina de chakra sobre sua arma. A lâmina possui comprimento controlado à sua vontade, podendo ficar até 30 cm maior. Fazer isso não aumenta o alcance de seu ataque corpo- a-corpo, mas dificulta a defesa do inimigo e a noção da distância do seu golpe. Sempre que atacar, faça um teste de resistido de Espírito contra a Prontidão do alvo. Se você for bem-sucedido, o alvo sofrerá -1 de penalidade nas reações de defesa (Esquivar, Antecipar e Bloquear).</p><p>Shuriken Estendida: funciona como Lâmina Estendida, porém usada em shurikens simples. Com um único uso deste efeito você consegue estender a lâmina de até três shurikens. Fazer isto também altera o dano base das três shurikens juntas, deixando-o igual ao dano comum do poder.</p>",
    "fields": {
      "requirement": "Energizar",
      "action": "Parcial",
      "range": "Pessoal",
      "target": "uma arma cortante ou perfurante",
      "damage": "ver texto",
      "duration": "Sustentada",
      "seals": "Não"
    },
    "recordId": "T05-F01-efeito_poder-afiar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:lamina-de-vento",
    "name": "Lâmina de Vento",
    "min": 7,
    "powers": [
      "fuuton"
    ],
    "evolutions": [
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 106, 107"
    },
    "text": "<h3>LÂMINA DE VENTO</h3><p>❖ Pré-requisito: Energizar</p><p>❖ Ação: Completa ❖ Alcance: 5m</p><p>❖ Alvo: Uma criatura ❖ Dano: ver texto</p><p>❖ Duração: Instantânea ❖ Selos de Mão: Não Você emite chakra a partir da ponta dos dedos, criando uma lâmina de vento, quase invisível, que gira em alta rotação, e então a arremessa contra seu alvo. Você faz isso repetidamente, criando e arremessando novas lâminas contra o inimigo. Depois que atingem o alvo, as lâminas se desfazem imediatamente.</p><p>Você pode criar e arremessar 1 lâmina por nível usado do poder e cada lâmina causa 1 de dano base (total de 3 de dano base com o bônus do elemento Fuuton). Este efeito não recebe outros bônus de dano além do fornecido pelo elemento.</p><p>Somente um teste de acerto é feito para arremessar todas as lâminas, enquanto que o alvo realiza uma única defesa.</p><p>Antes da defesa, o alvo deve ser bem-sucedido em um teste de Prontidão para conseguir enxergar o ataque. Se falhar, será considerado fintado. Criaturas com visão de chakra ou com o Kagura Shingan têm sucesso automático neste teste. Criaturas com outros tipos de sensor de chakra ainda precisam realizar o teste, porém recebem -2 na dificuldade.</p><p>Evoluções:</p><p>▪ Lâmina de Vento Nv 10: O alvo que falha no teste de Prontidão fica desprevenido.</p>",
    "fields": {
      "requirement": "Energizar",
      "action": "Completa",
      "range": "5m",
      "target": "Uma criatura",
      "damage": "ver texto",
      "duration": "Instantânea",
      "seals": "Não"
    },
    "recordId": "T05-F01-efeito_poder-lamina-de-vento",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:inflamavel",
    "name": "Inflamável",
    "min": 5,
    "powers": [
      "fuuton",
      "katon",
      "suiton"
    ],
    "evolutions": [
      8
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 54, 55"
    },
    "text": "<h3>INFLAMÁVEL*</h3><p>❖ Disponível para: Fuuton, Katon, Suiton</p><p>❖ Ação: Movimento ou Padrão (Ver Texto)</p><p>❖ Alcance: Comum do Poder</p><p>❖ Área de Efeito: Círculo de diâmetro comum do poder</p><p>❖ Dano: Bônus ou Comum do Poder (Ver Texto)</p><p>❖ Duração: Instantânea ou Contínua (Ver Texto)</p><p>❖ Custo de Chakra: 3 + Chakra do efeito de combustão ou Nível do Poder (Ver Texto)</p><p>Com este efeito, o personagem é capaz de criar um líquido, névoa ou gás altamente inflamável, que se espalha à sua frente por uma área circular de diâmetro comum do poder.</p><p>Modo Meta-aptidão: Esta técnica não causa dano por si só, mas potencializa o dano de qualquer técnica Katon ou Raiton que seja usada depois.</p><p>Com sua ação padrão, você pode usar o efeito Canhão dos poderes Katon ou Raiton para criar uma faísca e gerar uma combustão instantânea ou explosão. A explosão tem a área desse efeito, dano do tipo fogo, mas o valor do dano será do efeito Canhão usado, com +2 de bônus. Não é possível usar meta-aptidões com Inflamável.</p><p>Modo Contínuo: Este modo permite você criar uma área perigosa para se combater ao cobrir a região com seu efeito.</p><p>Caso algum Katon ou Raiton seja utilizado dentro dessa área, uma combustão ocorre à queima-roupa do usuário, causando dano comum do poder (rode para ver o grau do dano) e forçando-o a realizar um teste de Concentração (dif Comum do Poder) para não fracassar automaticamente no uso da técnica. Após a combustão o efeito é encerrado. Identificar as propriedades inflamáveis desse efeito é um teste de Ciências Naturais dif comum do poder que pode ser feito como uma ação livre.</p><p>Evoluções:</p><p>▪ Inflamável Nv 8: Modo Meta-Aptidão: Você pode usar qualquer efeito de Katon ou Raiton para criar a combustão, desde que seja um efeito de duração instantânea e alcance comum do poder. O efeito usado mantém suas propriedades e regras. Modo Contínuo: Além de Katon e Raiton, qualquer faísca é capaz de causar a ignição do Inflamável. O mais comum é golpear ou tentar bloquear com uma arma de metal e disparar uma arma de fogo, mas qualquer ação que o narrador julgue que causará uma faísca causa a explosão, causando dano comum do poder e necessitando realizar o teste de Concentração para não fracassar automaticamente a ação que gerou a faísca. O efeito mantém suas propriedades e regras além dessas citadas.</p>",
    "fields": {
      "available": "Fuuton, Katon, Suiton",
      "action": "Movimento ou Padrão (Ver Texto)",
      "range": "Comum do Poder",
      "area": "Círculo de diâmetro comum do poder",
      "damage": "Bônus ou Comum do Poder (Ver Texto)",
      "duration": "Instantânea ou Contínua (Ver Texto)",
      "chakraCost": "3 + Chakra do efeito de combustão ou Nível do Poder (Ver Texto)"
    },
    "recordId": "T05-F03-efeito_poder-inflamavel",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:meteoros",
    "name": "Meteoros",
    "min": 9,
    "powers": [
      "katon"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 108"
    },
    "text": "<h3>METEOROS</h3><p>❖ Ação: Completa</p><p>❖ Alcance: Comum do poder</p><p>❖ Área de Efeito: Seis esferas de 5m de diâmetro</p><p>❖ Dano: ver texto</p><p>❖ Duração: Instantânea</p><p>Esta técnica produz seis meteoros que voam até um ponto à sua escolha. Quando atingem o ponto escolhido, explodem, e cada meteoro causa 1 de dano fixo por nível usado do poder (não há dano base nem bônus de dano de qualquer tipo). Uma criatura ao alcance da explosão de mais de um meteoro receberá o dano de todos eles.</p><p>Você pode mirar os meteoros em uma ou mais criaturas específicas ao custo de -3 de precisão em seu teste de acerto. Se fizer isso, o alvo não terá direito a se defender com Esquiva ou com a manobra Antecipar.</p>",
    "fields": {
      "action": "Completa",
      "range": "Comum do poder",
      "area": "Seis esferas de 5m de diâmetro",
      "damage": "ver texto",
      "duration": "Instantânea"
    },
    "recordId": "T05-F01-efeito_poder-meteoros",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:lamina-de-raios",
    "name": "Lâmina de Raios",
    "min": 2,
    "powers": [
      "raiton"
    ],
    "evolutions": [
      5,
      7,
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 109, 110"
    },
    "text": "<h3>LÂMINA DE RAIOS</h3><p>❖ Pré-requisito: Espírito 8</p><p>❖ Ação: Movimento</p><p>❖ Alcance: Toque</p><p>❖ Dano: ver texto</p><p>❖ Duração: Sustentada (1 ataque)</p><p>Você concentra uma grande quantidade de chakra em sua mão, altera sua natureza para torná-lo do tipo Raiton e depois altera sua forma para transformá-lo em uma descarga elétrica. A grande concentração de eletricidade produz um chiado agudo que lembra o som de pássaros.</p><p>É necessária uma ação de movimento para preparar a técnica. Atacar com a mesma exige tocar o alvo (ação padrão, teste de CC) e causa dano comum do poder, que ignora 1 ponto de dureza do alvo. Esse efeito destrói qualquer arma comum que seja usada como um bloqueio, resultando numa falha na defesa, mesmo sob o efeito Energizar (com exceção dos elementos Fuuton e Raiton).</p><p>Você pode manter a técnica de forma sustentada, porém somente pode executar um único ataque com ela, seja ele bem-sucedido ou não. Porém, caso você abata um capanga com ela, poderá mantê-la por um ataque adicional (este benefício pode ser repetido caso abata mais de um capanga).</p><p>Caso use este efeito para um ataque surpresa e o alvo esteja desprevenido, você sempre terá, no mínimo, grau 2 de dano. Contudo, o alvo tem direito a um teste de Prontidão para notar a técnica devido ao ruído produzido. Este teste é adicional a qualquer outro que ele tenha direito.</p><p>Evoluções:</p><p>▪ Lâmina de Raios Nv 5: Preparar a técnica passa a ser Ação Parcial. Você pode atacar com essa técnica usando a manobra Investida para receber +2 de bônus de dano, com +1 adicional a cada nível seguinte do poder. Atacar dessa forma, entretanto, deixa sua guarda aberta, permitindo um ataque oportuno do alvo acaso ele consiga Esquivar ou Antecipar o ataque. Você não sofre essa penalidade caso esteja Acelerado ou possua o Nidan Sharingan. A aptidão Mobilidade pode ser usada contra este ataque oportuno.</p><p>▪ Lâmina de Raios Nv 7: além dos benefícios anteriores, o efeito ignora qualquer nível de dureza, com exceção de proteções do tipo Fuuton, e somente metade da dureza de proteções do tipo Raiton.</p><p>▪ Lâmina de Raios Nv 9: além dos benefícios anteriores, você recebe o benefício da aptidão Crítico Aprimorado para este efeito. Esse bônus é cumulativo com a aptidão Domínio do Raio.</p>",
    "fields": {
      "requirement": "Espírito 8",
      "action": "Movimento",
      "range": "Toque",
      "damage": "ver texto",
      "duration": "Sustentada (1 ataque)"
    },
    "recordId": "T05-F01-efeito_poder-lamina-de-raios",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:arma-eletrica",
    "name": "Arma Elétrica",
    "min": 4,
    "powers": [
      "raiton"
    ],
    "evolutions": [
      8
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 110"
    },
    "text": "<h3>ARMA ELÉTRICA</h3><p>❖ Pré-requisito: Lâmina de raios</p><p>❖ Ação: Parcial</p><p>❖ Alcance: Pessoal</p><p>❖ Dano: ver texto</p><p>❖ Duração: Sustentada</p><p>❖ Custo de Chakra: ver texto</p><p>❖ Selos de Mão: Não Arma Elétrica funciona como os efeitos Criar Arma e Energizar, porém com restrições. Energizar: [custo de chakra 3] você pode usar o efeito Energizar, mas somente para armas de corte e perfuração. Criar Projéteis: [custo de chakra 1] você pode criar armas simples de arremesso feitas de eletricidade. Depois de arremessados, os projéteis duram no ambiente até o início do seu próximo turno.</p><p>Criar Lâmina: [custo de chakra 4] você pode criar uma lâmina de espada curta (ou outra espada leve) a partir de sua mão, que causa dano pelo efeito Energizar e ignora 1 ponto de dureza do alvo. Opcionalmente, pode estendê-la por até 5m na direção de um inimigo para ataca-lo. Atacar dessa forma requer uma ação padrão e teste de CC ou CD (à escolha do personagem) e arma volta ao tamanho normal após o ataque. Você não paga custo de chakra para estender a lâmina.</p><p>Evoluções:</p><p>▪ Arma Elétrica Nv 8: Qualquer arma comum que seja bloqueada por você, ou que bloqueie um ataque seu com este efeito, é imediatamente destruída, a menos que esteja sob o efeito Energizar (com exceção de Energizar Doton). Neste caso, seu ataque será um Sucesso Automático.</p>",
    "fields": {
      "requirement": "Lâmina de raios",
      "action": "Parcial",
      "range": "Pessoal",
      "damage": "ver texto",
      "duration": "Sustentada",
      "chakraCost": "ver texto",
      "seals": "Não Arma Elétrica funciona como os efeitos Criar Arma e Energizar, porém com restrições. Energizar: [custo de chakra 3] você pode usar o efeito Energizar, mas somente para armas de corte e perfuração. Criar Projéteis: [custo de chakra 1] você pode criar armas simples de arremesso feitas de eletricidade. Depois de arremessados, os projéteis duram no ambiente até o início do seu próximo turno."
    },
    "recordId": "T05-F01-efeito_poder-arma-eletrica",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:descarga",
    "name": "Descarga",
    "min": 6,
    "powers": [
      "raiton"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 111"
    },
    "text": "<h3>DESCARGA</h3><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder ou toque</p><p>❖ Área de Efeito: meia-esfera ou círculo</p><p>❖ Dano: metade do dano comum do poder</p><p>❖ Duração: Instantânea</p><p>❖ Custo de Chakra: padrão do poder</p><p>Você cria uma corrente elétrica e a dispara ao seu redor, causando metade do dano comum do poder. Se causar qualquer quantidade de dano ao inimigo, ele deverá realizar um teste de Vigor (Dif padrão -3). Falhando, ficará atordoado até o final de seu próximo turno.</p><p>Você também pode concentrar a corrente elétrica em um único ataque para disparar um projétil contra o inimigo, ou descarrega-la durante um ataque corporal com o efeito Energizar - Raiton (ou Arma Elétrica: Energizar), caso o possua. Nesse caso, a dificuldade do teste de Vigor aumenta em +1. Atacar dessa forma também causa metade do dano comum do poder (desconsiderando-se o dano do ataque corporal com Energizar/Arma Elétrica). Se a Descarga for feita através do Energizar, o efeito não requer selos de mão.</p>",
    "fields": {
      "action": "Padrão",
      "range": "comum do poder ou toque",
      "area": "meia-esfera ou círculo",
      "damage": "metade do dano comum do poder",
      "duration": "Instantânea",
      "chakraCost": "padrão do poder"
    },
    "recordId": "T05-F01-efeito_poder-descarga",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:nevoa",
    "name": "Névoa",
    "min": 2,
    "powers": [
      "suiton"
    ],
    "evolutions": [
      5
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 112"
    },
    "text": "<h3>NÉVOA</h3><p>❖ Pré-requisito: Lutar às Cegas (aptidão) ou habilidade de sensor</p><p>❖ Ação: Padrão</p><p>❖ Alcance: 1m</p><p>❖ Alvo: o ambiente</p><p>❖ Área de Efeito: Círculo de 30m de diâmetro + 3m por Espírito, com altura comum do poder</p><p>❖ Duração: Sustentada</p><p>Um nevoeiro se forma a partir do ponto de origem escolhido. Somente é possível enxergar perfeitamente criaturas a até 1m de distância. Qualquer criatura além de 1m possui camuflagem parcial (os ataques sofrem 25% de chance de falha; veja mais em Camuflagem e Cobertura, pág. 272).</p><p>A névoa possui uma dureza imaginária, de valor padrão do poder. Sempre que um ataque em área com explosões (ex: Katon) ou ventos (ex: Fuuton) for usado sobre a névoa ou dentro dela, a sua dureza é reduzida. Se a dureza chegar a zero, a névoa se dissipa. A dureza imaginária segue todas as regras comuns para dureza de objeto (ver no efeito Barreira ou na pág. 274), porém não lhe protege contra danos (o dano base dos ataques não são reduzidos pela dureza imaginária!).</p><p>A Névoa não possui desvantagem elemental contra Doton, porém possui desvantagem contra Fuuton.</p><p>Regra Opcional: Com a permissão do mestre, esse efeito pode ser comprado para Ninpou, mas nunca para outro poder elemental, porém sem a possibilidade de evoluir o Efeito.</p><p>Evoluções:</p><p>▪ Névoa Nv 5: criaturas até 1m possuem camuflagem parcial, e para além dessa distância recebem camuflagem total (50% de chance de falha e o atacante não pode usar a visão para localizá-las).</p>",
    "fields": {
      "requirement": "Lutar às Cegas (aptidão) ou habilidade de sensor",
      "action": "Padrão",
      "range": "1m",
      "target": "o ambiente",
      "area": "Círculo de 30m de diâmetro + 3m por Espírito, com altura comum do poder",
      "duration": "Sustentada"
    },
    "recordId": "T05-F01-efeito_poder-nevoa",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:prisao-de-agua",
    "name": "Prisão de Água",
    "min": 3,
    "powers": [
      "suiton"
    ],
    "evolutions": [
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 112, 113"
    },
    "text": "<h3>PRISÃO DE ÁGUA</h3><p>❖ Ação: Padrão</p><p>❖ Alcance: 1m</p><p>❖ Alvo: uma criatura (ver texto)</p><p>❖ Dano: Nenhum</p><p>❖ Duração: Concentração</p><p>O personagem conjura uma redoma de água corrente ao redor do alvo e o aprisiona. Usar a técnica requer teste de CD a 1m de distância (que recebe a penalidade de -3 de precisão pela proximidade ou teste Concentração por combate próximo, ver pág. 40). É necessário estar sempre em contato com a prisão para mantê-la.</p><p>A espessura da camada de água corrente e a densidade do chakra na redoma impedem a vítima de se mover livremente, deixando-a paralisada. Entretanto, o espaço mais interior da prisão não possui água, permitindo que a vítima respire e fale normalmente.</p><p>A prisão possui metade da dureza comum do poder e o usuário poderá reutilizar a técnica para restaurar a dureza perdida (gastando novamente o chakra e a ação do efeito, mas sem refazer o teste de acerto).</p><p>Este efeito pode ser usado contra mais de um alvo se usado a partir de clones de água (1 alvo para cada clone). Se estiver longe o suficiente do alvo, o usuário não sofre penalidade combate próximo ao usar o efeito a partir do clone. Contudo, mesmo usando o Mizu Bunshin como ponto de partida da técnica, o personagem original ainda precisa manter concentração (ver Mizu Bunshin, pág. 80).</p><p>Mesmo paralisada, a vítima tem direito a usar uma ação padrão para realizar um teste de Força (Dif padrão do poder) ou Vigor (Dif padrão - 2). Se for bem-sucedida, ganhará mobilidade pelo restante da cena para tentar atacar a prisão por dentro e destruí-la.</p><p>Caso alguém tente aplicar um golpe de misericórdia na vítima, a prisão de água absorve o ataque e se desfaz, anulando a manobra. A vítima ainda sofre qualquer dano remanescente que superar a dureza da prisão. Neste caso, o ataque é considerado um Sucesso Automático e você deve rolar 2 dados para determinar o grau de dano. Defesas especiais que possam ser usadas (como a intangibilidade do Kamui) ainda devem ser consideradas.</p><p>Este efeito não pode ser usado com meta-aptidões.</p><p>Evoluções:</p><p>▪ Prisão de Água Nv 9: A prisão se torna sufocante: preenchida por água e capaz de impedir a respiração, fazendo o alvo capturado sofrer sufocamento (testes com Dif padrão -2). Se o efeito for usado através de um Mizu Bunshin, passa a ter duração sustentada.</p>",
    "fields": {
      "action": "Padrão",
      "range": "1m",
      "target": "uma criatura (ver texto)",
      "damage": "Nenhum",
      "duration": "Concentração"
    },
    "recordId": "T05-F01-efeito_poder-prisao-de-agua",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:colisao-de-ondas",
    "name": "Colisão de Ondas",
    "min": 6,
    "powers": [
      "suiton"
    ],
    "evolutions": [
      8,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 113, 114"
    },
    "text": "<h3>COLISÃO DE ONDAS</h3><p>❖ Ação: Padrão</p><p>❖ Alcance: comum do poder</p><p>❖ Área de Efeito: Onda de tamanho comum do poder</p><p>❖ Dano: ver texto</p><p>❖ Duração: Concentração</p><p>Você conjura uma grande quantidade água e faz avançar violentamente sobre uma área. Aqueles que forem atingidos sofrerão 10 de dano base. Construções (como casas e prédios) recebem dano dobrado.</p><p>A técnica pode ser mantida por concentração, pagando a metade do custo de chakra a cada turno. Se for mantida dessa forma, quem falhar na ação defensiva será capturado pelas ondas e no início do seu turno deve passar em testes de Atletismo para nadar com uma ação de movimento e voltar à superfície, ou sofrerá sufocamento (o dano fixo de sufocamento tem valor igual ao dano base do efeito). Alvos capturados não podem ser alvos de outros ataques físicos enquanto estiverem submersos.</p><p>Se preferir, em vez de uma ação de movimento, a vítima poderá gastar uma ação padrão para nadar com mais intensidade e voltar à superfície sem a necessidade de testes. A vítima também pode decidir não subir à superfície e simplesmente prender a respiração com testes de Vigor (Dif padrão -2; ver sufocamento em Condições Prejudiciais, pág. 278).</p><p>Você pode continuar atacando com a técnica enquanto a mantém concentrada e assim tentar capturar outros alvos com suas ondas. Neste caso, deverá rolar o teste de acerto novamente. Alvos que já estejam submersos não são afetados pelo efeito. Enquanto mantém concentração, você pode mover a área de efeito da técnica livremente dentro do alcance do poder.</p><p>Evoluções:</p><p>▪ Colisão de Ondas Nv 8: Aumenta para Dano Base 14</p><p>▪ Colisão de Ondas Nv 10: Aumenta para Dano Base 18; A vítima não tem mais direito a usar uma ação padrão para nadar sem testes.</p>",
    "fields": {
      "action": "Padrão",
      "range": "comum do poder",
      "area": "Onda de tamanho comum do poder",
      "damage": "ver texto",
      "duration": "Concentração"
    },
    "recordId": "T05-F01-efeito_poder-colisao-de-ondas",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:extase",
    "name": "Êxtase",
    "min": 1,
    "powers": [
      "magen"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 235"
    },
    "text": "<h3>ÊXTASE</h3><h3>- [COMPULSÃO]</h3><p>Por meio desse Efeito, o usuário captura a mente do alvo em uma ilusão de sua escolha, deixando-o fascinado. Este efeito pode ser repetido na mesma cena contra um mesmo alvo, porém o alvo terá sempre 1 turno de imunidade após se libertar desta ilusão ou da aptidão Fascinar.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-extase",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:amedrontar",
    "name": "Amedrontar",
    "min": 2,
    "powers": [
      "magen"
    ],
    "evolutions": [
      5,
      8
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 235"
    },
    "text": "<h3>AMEDRONTAR</h3><h3>- [AFLIÇÃO]</h3><p>O usuário é capaz de causar temor no inimigo, seja lhe mostrando a imagem de seu pior pesadelo, uma cena grotesca ou um monstro gigante e aparentemente invencível. Qualquer que seja a ilusão criada, o alvo ficará assustado.</p><p>Evoluções:</p><p>▪ Amedrontar Nv 5: a vítima fica amedrontada.</p><p>▪ Amedrontar Nv 8: a vítima fica aterrorizada.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-amedrontar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:confundir",
    "name": "Confundir",
    "min": 2,
    "powers": [
      "magen"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 236"
    },
    "text": "<h3>CONFUNDIR</h3><h3>- [COMPULSÃO]</h3><p>Este Efeito gera alucinações no alvo ou ilusões aleatórias que mudam a cada rodada. A vítima fica confusa.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-confundir",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:fadigar",
    "name": "Fadigar",
    "min": 2,
    "powers": [
      "magen"
    ],
    "evolutions": [
      5
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 236"
    },
    "text": "<h3>FADIGAR</h3><h3>- [AFLIÇÃO]</h3><p>Este Efeito permite fazer o alvo acreditar que está ligeiramente cansado, devido a um mal súbito ou falta de ar, por exemplo. A vítima ficará fatigada. Este efeito não acumula para deixar o alvo exausto ou inconsciente.</p><p>Evoluções:</p><p>▪ Fadigar Nv 5: a vítima fica exausta.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-fadigar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:segurar",
    "name": "Segurar",
    "min": 2,
    "powers": [
      "magen"
    ],
    "evolutions": [
      6,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 236"
    },
    "text": "<h3>SEGURAR</h3><h3>- [COMPULSÃO]</h3><p>O usuário faz o alvo acreditar que está sendo agarrado por um grande animal, monstro, ou uma pessoa. A vítima sofre os efeitos da condição Agarrado. Alvos com a aptidão Lutador são imunes a este efeito.</p><p>Evoluções:</p><p>▪ Segurar Nv 6: alvos com a aptidão Lutador não são mais imunes.</p><p>▪ Segurar Nv 10: o animal, monstro ou pessoa da ilusão é muito maior ou mais forte que o alvo; vítima fica indefesa.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-segurar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:adormecer",
    "name": "Adormecer",
    "min": 3,
    "powers": [
      "magen"
    ],
    "evolutions": [
      6,
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 236"
    },
    "text": "<h3>ADORMECER</h3><h3>- [COMPULSÃO]</h3><p>Você faz seu alvo entrar num estado de grande sonolência e dormir após alguns instantes. A vítima ficará fatigada por 5 turnos e cairá inconsciente no final do quinto. A vítima permanecerá assim enquanto o efeito durar ou ser cancelado.</p><p>Evoluções:</p><p>▪ Adormecer Nv 6: O tempo de fadiga até inconsciência diminui para 4 turnos.</p><p>▪ Adormecer Nv 9: O tempo de fadiga até inconsciência diminui para 3 turnos.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-adormecer",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:anular-sentido",
    "name": "Anular Sentido",
    "min": 3,
    "powers": [
      "magen"
    ],
    "evolutions": [
      6,
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 236"
    },
    "text": "<h3>ANULAR SENTIDO</h3><h3>- [COMPULSÃO]</h3><p>Você prejudica ou anula um dos sentidos da vítima à sua escolha.</p><p>Audição: a vítima fica debilitada (-2) em testes de Procurar e Prontidão (auditivos). Olfato: a vítima perde a capacidade de sentir qualquer cheiro Visão: a vítima sofre as penalidades de uma camuflagem parcial.</p><p>Se o sentido prejudicado ou anulado estiver ligado a uma habilidade de sensor, essa habilidade também será afetada.</p><p>Evoluções:</p><p>▪ Anular Sentido Nv 6: na visão, a vítima sofre as penalidades de uma camuflagem total; na audição a vítima fica surda.</p><p>▪ Anular Sentido Nv 9: Na visão, a vítima fica cega. Você pode escolher anular um sentido especial, como um sensor de chakra. É necessário conhecer o sentido especial a ser anulado.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-anular-sentido",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:desequilibrar",
    "name": "Desequilibrar",
    "min": 3,
    "powers": [
      "magen"
    ],
    "evolutions": [
      6
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 236, 237"
    },
    "text": "<h3>DESEQUILIBRAR</h3><h3>- [AFLIÇÃO]</h3><p>Este Efeito permite criar a ilusão no alvo de que algo está atrapalhando seu equilíbrio, como ventos fortes que mudam constantemente de direção, um tremor de terra ou uma doença. A vítima fica caída e não pode se levantar até o final do próximo turno dela.</p><p>Evoluções:</p><p>▪ Desequilibrar Nv 6: a vítima não pode se levantar pelos próximos dois turnos dela.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-desequilibrar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:desorientar",
    "name": "Desorientar",
    "min": 3,
    "powers": [
      "magen"
    ],
    "evolutions": [
      6,
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 237"
    },
    "text": "<h3>DESORIENTAR</h3><h3>- [COMPULSÃO]</h3><p>O usuário faz seu alvo perder o senso de direção. Enquanto o efeito durar, o alvo terá fracasso automático em todos os testes de Rastrear e ficará andando em círculos, sem chegar ao seu destino. Ninjas Sensores também são afetados, porém recebem +2 de precisão no teste para identificar o genjutsu.</p><p>Evoluções:</p><p>▪ Desorientar Nv 6: Você pode usar o efeito contra múltiplos alvos sem penalidade na dificuldade de resistência.</p><p>▪ Desorientar Nv 9: Você pode usar o efeito como uma Aflição.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-desorientar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:falsa-velocidade",
    "name": "Falsa Velocidade",
    "min": 3,
    "powers": [
      "magen"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 237"
    },
    "text": "<h3>FALSA VELOCIDADE</h3><h3>- [FANTASMA]</h3><p>Você coloca uma ilusão sobre si mesmo que o faz parecer mais rápido do que realmente é, confundindo o inimigo antes de atacá-lo.</p><p>Utilize esse efeito como uma manobra fintar (requer ação padrão ou movimento se possuir Ponto Cego) e pague 2 pontos de chakra a cada uso. Quando você atacar um inimigo, ele tem direito a um teste de notar genjutsu. Se falhar, ficará fintado contra seu ataque (seja corpo-a-corpo ou à distância). Este efeito dura até o final de seu turno.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-falsa-velocidade",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:aliviamento",
    "name": "Aliviamento",
    "min": 4,
    "powers": [
      "magen"
    ],
    "evolutions": [
      7,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 237"
    },
    "text": "<h3>ALIVIAMENTO</h3><h3>- [AFLIÇÃO]</h3><p>Este efeito faz a vítima ver aquilo que mais deseja durante o combate, como a chegada de um reforço, ou algum aliado matando você. A ilusão traz ao alvo uma falsa sensação de alívio, deixando-o desprevenido pelo tempo do efeito.</p><p>Quando é atacada, a vítima percebe imediatamente que se tratou de uma ilusão, mas as penalidades permanecem.</p><p>Evoluções:</p><p>▪ Aliviamento Nv 7: o efeito dura 3 turnos.</p><p>▪ Aliviamento Nv 10: o efeito não pode ser resistido.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-aliviamento",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:falsa-posicao",
    "name": "Falsa Posição",
    "min": 4,
    "powers": [
      "magen"
    ],
    "evolutions": [
      7,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 237"
    },
    "text": "<h3>FALSA POSIÇÃO</h3><h3>- [FANTASMA]</h3><p>Você cria uma ilusão sobre si mesmo que força os inimigos ignorarem sua presença e acreditarem que está em outro lugar. Quando você for atacado, o inimigo realiza um teste de notar genjutsu. Se ele falhar, você recebe os benefícios de uma camuflagem parcial pelo restante da cena.</p><p>Sempre que o inimigo conseguir passar pela camuflagem e lhe acertar, terá direito a um novo teste de notar genjutsu. Quando for bem- sucedido neste teste, o efeito não funcionará mais contra esse inimigo pelo restante da cena. Este efeito tem duração sustentada.</p><p>Evoluções:</p><p>▪ Falsa Posição Nv 7: seus benefícios aumentam para uma camuflagem total.</p><p>▪ Falsa Posição Nv 10: você pode forçar o inimigo atacar numa direção de sua escolha caso ele erre.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-falsa-posicao",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:petrificar",
    "name": "Petrificar",
    "min": 4,
    "powers": [
      "magen"
    ],
    "evolutions": [
      7,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 238"
    },
    "text": "<h3>PETRIFICAR</h3><h3>- [COMPULSÃO]</h3><p>Você faz o alvo pensar que seu corpo começa a não se movimentar adequadamente por algum motivo, como estar sendo petrificado aos poucos, ou estar sofrendo de algum distúrbio muscular. A vítima ficará lenta, e a partir do início do segundo turno sob o efeito ficará impedida.</p><p>Evoluções:</p><p>▪ Petrificar Nv 7: a vítima fica imediatamente impedida quando sofre o efeito.</p><p>▪ Petrificar Nv 10: a vítima fica paralisada.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-petrificar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:adoecer",
    "name": "Adoecer",
    "min": 5,
    "powers": [
      "magen"
    ],
    "evolutions": [
      8,
      10
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 238"
    },
    "text": "<h3>ADOECER</h3><h3>- [COMPULSÃO]</h3><p>Este Efeito permite fazer o alvo acreditar que está levemente doente. A doença pode ser escolhida livremente pelo usuário, podendo ser uma simples dor de cabeça, uma gripe ou ânsia de vômito. Qualquer que seja a doença, a vítima ficará tonta pela duração da ilusão.</p><p>Evoluções:</p><p>▪ Adoecer Nv 8: adicionalmente, a vítima fica fatigada.</p><p>▪ Adoecer Nv 10: adicionalmente, a vítima fica exausta.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-adoecer",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:atordoar",
    "name": "Atordoar",
    "min": 5,
    "powers": [
      "magen"
    ],
    "evolutions": [
      8
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 238"
    },
    "text": "<h3>ATORDOAR</h3><h3>- [AFLIÇÃO]</h3><p>O usuário confunde os sentidos do alvo, retirando sua capacidade de agir em combate. A vítima fica atordoada até o final de seu próximo turno. Este efeito pode ser repetido na mesma cena contra um mesmo alvo. Evoluções:</p><p>▪ Atordoar Nv 8: adicionalmente, a vítima fica desprevenida por toda a duração do efeito.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-atordoar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:paralisar",
    "name": "Paralisar",
    "min": 5,
    "powers": [
      "magen"
    ],
    "evolutions": [
      9
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F01",
      "pages": "PDF 238"
    },
    "text": "<h3>PARALISAR</h3><h3>- [COMPULSÃO]</h3><p>Este Efeito faz o alvo acreditar que seus braços e pernas estão presos por algemas, cordas, braços mortos que brotam do chão, ou qualquer outra coisa que o usuário desejar. Enquanto durar o efeito, a vítima fica imóvel e não pode realizar qualquer ação que dependa de movimentos, com exceção de falar.</p><p>A vítima é considerada indefesa. Mas caso alguém tente aplicar um golpe de misericórdia, a ilusão é imediatamente quebrada e ela poderá se defender normalmente.</p><p>Evoluções:</p><p>▪ Paralisar Nv 9: tentar aplicar um golpe de misericórdia não quebra a ilusão.</p>",
    "fields": {},
    "recordId": "T05-F01-efeito_poder-paralisar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:dano-continuo",
    "name": "Dano Contínuo",
    "min": 2,
    "powers": [
      "katon",
      "raiton",
      "kikai-ninpou",
      "mokuton",
      "dokujutsu",
      "hyouton",
      "hebi-ninpou",
      "ototon",
      "futton-mei",
      "youton-mei",
      "shakuton",
      "shouton"
    ],
    "evolutions": [
      7
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 49, 50"
    },
    "text": "<h3>DANO CONTÍNUO</h3><p>❖ Disponível para: Katon e Raiton | Kikai Ninpou; Mokuton; Dokujutsu; Hyouton; Hebi Ninpou; Ototon; Futton (Mei); Youton (Mei); Shakuton; Shouton</p><p>❖ Ação: Padrão</p><p>❖ Alcance: Comum do Poder</p><p>❖ Alvo: Uma criatura</p><p>❖ Dano: Ver Texto</p><p>❖ Duração: Instantânea</p><p>Você atira um projétil num alvo para criar uma condição de ferimentos contínuos no mesmo, seja ateando fogo nele com katon ou criando uma carga elétrica no corpo do alvo com raiton.</p><p>Caso acerte, a vítima passa a sofrer dano fixo igual ao nível do poder imediatamente e a partir do segundo turno após ser afetado.</p><p>Esse efeito dura até que ela consiga retirar a condição que causou o efeito no corpo (como se jogar na água se for usado com katon), despendendo uma ação completa para realizar um teste de Vigor contra dificuldade comum do poder -3 ou que se passem 3 turnos (a vítima levará 3 danos).</p><p>Evoluções:</p><p>▪ Dano Contínuo Nv. 7: A duração máxima do poder passa a ser de 5 turnos, a dificuldade do teste passa a ser dificuldade comum do poder e, sem teste, o fogo só se extingue caso a vítima passe 1 turno completo submerso de corpo inteiro em água ou substância que anule a técnica (contra katon) ou a carga elétrica seja retirada do corpo. Variações com outros poderes devem ser resolvidas em conjunto do narrado.</p>",
    "fields": {
      "available": "Katon e Raiton | Kikai Ninpou; Mokuton; Dokujutsu; Hyouton; Hebi Ninpou; Ototon; Futton (Mei); Youton (Mei); Shakuton; Shouton",
      "action": "Padrão",
      "range": "Comum do Poder",
      "target": "Uma criatura",
      "damage": "Ver Texto",
      "duration": "Instantânea"
    },
    "recordId": "T05-F03-efeito_poder-dano-continuo",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:deslocamento-de-vacuo",
    "name": "Deslocamento de Vácuo",
    "min": 2,
    "powers": [
      "doton",
      "fuuton",
      "suiton",
      "mokuton",
      "hyouton",
      "jiton",
      "shouton"
    ],
    "evolutions": [
      7
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 50"
    },
    "text": "<h3>DESLOCAMENTO DE VÁCUO</h3><p>❖ Disponível para: Doton, Fuuton e Suiton | Mokuton; Hyouton; Jiton; Shouton</p><p>❖ Ação: Parcial</p><p>❖ Alcance: Comum do Poder</p><p>❖ Alvo: Uma criatura</p><p>❖ Duração: 1 rodada</p><p>❖ Custo de chakra: 2 de chakra</p><p>Você manipula o elemento a sua volta para diminuir a resistência atmosférica ou até mesmo que ele lhe ajude a se mover e facilitar o deslocamento seu ou de algum aliado.</p><p>O alvo ganha um bônus no seu deslocamento igual a ½ do seu Espírito até o início do seu próximo turno. Para usar essa técnica é necessário estar envolto pelo seu elemento, por padrão sendo o ar (Fuuton), mas pode ser usado com nado debaixo d’água (Suiton) ou deslizando pelo solo (Doton).</p><p>Evoluções:</p><p>▪ Deslocamento de Vácuo Nv. 7: O número de alvos aumenta para até 5 alvos que desejem receber o benefício. O custo de chakra aumenta para 3, pago uma única vez para todos os alvos.</p>",
    "fields": {
      "available": "Doton, Fuuton e Suiton | Mokuton; Hyouton; Jiton; Shouton",
      "action": "Parcial",
      "range": "Comum do Poder",
      "target": "Uma criatura",
      "duration": "1 rodada ❖ Custo de chakra: 2 de chakra"
    },
    "recordId": "T05-F03-efeito_poder-deslocamento-de-vacuo",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:projetar",
    "name": "Projetar",
    "min": 2,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "suiton",
      "mokuton",
      "hyouton",
      "kamijutsu",
      "kujaku-myoho",
      "kumo-ninpou",
      "hebi-ninpou",
      "ototon",
      "jiton",
      "kibaku-nendo",
      "futton-mei",
      "shouton"
    ],
    "evolutions": [
      7
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 50, 51"
    },
    "text": "<h3>PROJETAR</h3><p>❖ Disponível para: Ninpou, Doton, Fuuton, Suiton | Mokuton; Hyouton; Kamijutsu; Kujaku Myoho; Kumo Ninpou; Hebi Ninpou; Ototon; Jiton; Kibaku Nendo; Futton (Mei); Shouton</p><p>❖ Ação: Padrão</p><p>❖ Alcance: ½ Comum do Poder</p><p>❖ Alvo: Uma criatura</p><p>❖ Dano: Dano Comum do Poder</p><p>❖ Duração: Instantânea Você acerta seu inimigo com um projétil e o oponente deverá fazer um teste de Vigor Dif Comum do Poder -2 ou será deslocado numa linha reta uma quantidade de metros até o grau de dano causado em qualquer direção e sentido. Inimigos deslocados por esse efeito não são derrubados.</p><p>Evoluções:</p><p>▪ Projetar Nv. 7: A técnica não pode mais ser bloqueada, a quantidade de metros do deslocamento passa a ser igual a ½ do Tamanho Comum do Poder e caso falhe criticamente o teste de Vigor, o alvo ficará Caído.</p>",
    "fields": {
      "available": "Ninpou, Doton, Fuuton, Suiton | Mokuton; Hyouton; Kamijutsu; Kujaku Myoho; Kumo Ninpou; Hebi Ninpou; Ototon; Jiton; Kibaku Nendo; Futton (Mei); Shouton",
      "action": "Padrão",
      "range": "½ Comum do Poder",
      "target": "Uma criatura",
      "damage": "Dano Comum do Poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F03-efeito_poder-projetar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:purificar",
    "name": "Purificar",
    "min": 2,
    "powers": [
      "fuuton",
      "suiton",
      "kikai-ninpou",
      "dokujutsu",
      "kumo-ninpou",
      "hebi-ninpou"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 51"
    },
    "text": "<h3>PURIFICAR</h3><p>❖ Disponível para: Fuuton e Suiton | Kikai Ninpou; Dokujutsu; Kumo Ninpou; Hebi Ninpou;</p><p>❖ Ação: Padrão</p><p>❖ Alcance: Comum do Poder</p><p>❖ Área de Efeito: Círculo de diâmetro comum do poder</p><p>❖ Alvo: Ambiente</p><p>❖ Duração: Instantânea</p><p>Você purifica uma área do seu elemento de todo veneno, impureza ou substância perigosa ali presente.</p><p>Para fazer isso é necessário que o nível usado de poder seja forte o bastante. Para casos mundanos, isso fica a critério do mestre. Caso aquilo que deseja ser purificado seja derivado de um poder, é necessário que o nível de poder usado para purificar seja maior que o do efeito no ambiente (Ex: Purificar Nv 7 contra um Dokujutsu Nv 6).</p><p>Para purificar venenos, é necessário que o nível de poder usado x2 (Nv do Poder x2) seja maior que o nível de Venefício do produtor do veneno.</p><p>Em caso de empate entre o nível do poder e o nível do efeito a ser anulado (Ex: Purificar Nv 4 vs Nuvem Nv 4), faça um teste de Espírito contra a dificuldade da substância para anular.</p><p>Caso a substância não tenha uma dificuldade, use a dificuldade comum do poder que a criou ou uma definida pelo mestre.</p>",
    "fields": {
      "available": "Fuuton e Suiton | Kikai Ninpou; Dokujutsu; Kumo Ninpou; Hebi Ninpou;",
      "action": "Padrão",
      "range": "Comum do Poder",
      "area": "Círculo de diâmetro comum do poder",
      "target": "Ambiente",
      "duration": "Instantânea"
    },
    "recordId": "T05-F03-efeito_poder-purificar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:repelir",
    "name": "Repelir",
    "min": 2,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "suiton",
      "mokuton",
      "kikai-ninpou",
      "hyouton",
      "kamijutsu",
      "kujaku-myoho",
      "sumi-ninpou",
      "kumo-ninpou",
      "hebi-ninpou",
      "ototon",
      "jiton",
      "kibaku-nendo",
      "shouton"
    ],
    "evolutions": [
      7
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 51, 52"
    },
    "text": "<h3>REPELIR</h3><p>❖ Disponível para: Ninpou, Doton, Fuuton, Suiton | Mokuton; Kikai Ninpou; Hyouton; Kamijutsu; Kujaku Myoho; Sumi Ninpou; Kumo Ninpou; Hebi Ninpou; Ototon; Jiton; Kibaku Nendo; Shouton</p><p>❖ Ação: Movimento</p><p>❖ Alcance: Comum do Poder</p><p>❖ Duração: Instantânea</p><p>Você repele um ataque inimigo e afasta o perigo. Seja uma bolha de Suiton que absorve um golpe e estoura, uma lufada de vento ou um projétil de pedra.</p><p>Essa técnica apenas pode ser usada reativamente a um ataque de projétil (técnica ou arma), técnica de toque ou golpear, contra você ou alguém no alcance comum do poder.</p><p>Você faz um teste de LM com bônus de +1 de precisão, com custo pago antes do teste, para criar uma proteção instantânea de Dureza Comum do Poder para absorver o ataque e se desfazer instantaneamente.</p><p>Caso Repelir absorva completamente o ataque, ele repelirá todos adjacentes a técnica 1m para trás, caso a dureza seja destruída o ataque atravessa, causa o dano remanescente no alvo e ninguém é repelido.</p><p>Caso possua um inimigo adjacente (por exemplo, se for você o alvo da técnica de toque ou golpear), você precisará fazer um teste de concentração para executar esse efeito.</p><p>Evoluções:</p><p>▪ Repelir Nv. 7: Após usar Repelir uma primeira vez, os usos subsequentes até o início de seu próximo turno podem ser feitos com uma ação livre, gastando metade do custo de chakra. Você também não precisa mais fazer teste de concentração caso exista algum adversário adjacente a ti.</p>",
    "fields": {
      "available": "Ninpou, Doton, Fuuton, Suiton | Mokuton; Kikai Ninpou; Hyouton; Kamijutsu; Kujaku Myoho; Sumi Ninpou; Kumo Ninpou; Hebi Ninpou; Ototon; Jiton; Kibaku Nendo; Shouton",
      "action": "Movimento",
      "range": "Comum do Poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F03-efeito_poder-repelir",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:cegante",
    "name": "Cegante",
    "min": 5,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "suiton",
      "kikai-ninpou",
      "mokuton",
      "hyouton",
      "kamijutsu",
      "sumi-ninpou",
      "kumo-ninpou",
      "hebi-ninpou",
      "futton-mei",
      "ranton",
      "shouton"
    ],
    "evolutions": [
      8
    ],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 53, 54"
    },
    "text": "<h3>CEGANTE</h3><p>❖ Disponível para: Ninpou, Doton, Fuuton, Suiton | Kikai Ninpou; Mokuton; Hyouton; Kami Ninpou; Sumi Ninpou; Kumo Ninpou; Hebi Ninpou; Futton (Mei); Ranton; Shouton</p><p>❖ Ação: Padrão</p><p>❖ Alcance: ½ Comum do Poder</p><p>❖ Alvo: Uma criatura</p><p>❖ Dano: Dano Comum do Poder</p><p>❖ Duração: Instantânea</p><p>Você realiza o disparo de um projétil mirando especificamente o rosto do alvo para, além de causar dano, levá-lo a perder sua visão. Seja isso um golpe de lama, um líquido ardente ou mesmo uma lufada de poeira em seus olhos.</p><p>Caso acerte, a vítima sofre penalidades de uma camuflagem parcial até que limpe seu rosto ou passe 3 turnos, o que ocorrer primeiro.</p><p>Para limpar o rosto é necessário despender uma ação padrão (sem teste) ou uma ação de movimento para realizar um teste de Força ou Destreza Dif comum do poder.</p><p>Evoluções:</p><p>▪ Cegante Nv 8: A vítima passa a sofrer as penalidades de uma camuflagem total e o tempo para que o rosto se limpe sozinho aumenta para 5 turnos.</p>",
    "fields": {
      "available": "Ninpou, Doton, Fuuton, Suiton | Kikai Ninpou; Mokuton; Hyouton; Kami Ninpou; Sumi Ninpou; Kumo Ninpou; Hebi Ninpou; Futton (Mei); Ranton; Shouton",
      "action": "Padrão",
      "range": "½ Comum do Poder",
      "target": "Uma criatura",
      "damage": "Dano Comum do Poder",
      "duration": "Instantânea"
    },
    "recordId": "T05-F03-efeito_poder-cegante",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:flutuar",
    "name": "Flutuar",
    "min": 5,
    "powers": [
      "fuuton-leque-gigante"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 55, 56"
    },
    "text": "<h3>FLUTUAR</h3><p>❖ Disponível para: Fuuton (Leque Gigante)</p><p>❖ Pré-requisito: Maestria (Fuuton ou Poder usado para receber esse efeito); Usar Arma: Leque Gigante</p><p>❖ Ação: Movimento</p><p>❖ Alcance: Pessoal</p><p>❖ Duração: Sustentada</p><p>❖ Custo de chakra: 5 de chakra</p><p>É necessário estar com o Leque Gigante empunhado e não ter nenhum obstáculo ou inimigo adjacente a ti para utilizar esse efeito.</p><p>Batendo o leque gigante e se posicionando sobre ele usando a técnica Kinobori (Jutsu Comum, custo de chakra já incluso nesse efeito) você é capaz de flutuar, ganhando a perícia Voo com precisão igual ao seu nível de Espírito e a condição Alado.</p><p>Caso possua a ação de movimento no momento, é possível usar esse efeito como reação a uma queda, podendo escolher entre ficar alado ou apenas descer suavemente até o solo.</p><p>O Leque Gigante fica inutilizável enquanto você mantiver essa técnica sustentada.</p>",
    "fields": {
      "available": "Fuuton (Leque Gigante)",
      "requirement": "Maestria (Fuuton ou Poder usado para receber esse efeito); Usar Arma: Leque Gigante",
      "action": "Movimento",
      "range": "Pessoal",
      "duration": "Sustentada ❖ Custo de chakra: 5 de chakra"
    },
    "recordId": "T05-F03-efeito_poder-flutuar",
    "traits": [
      "arte:ninjutsu"
    ]
  },
  {
    "id": "sns:effect:desastre",
    "name": "Desastre",
    "min": 9,
    "powers": [
      "ninpou",
      "doton",
      "fuuton",
      "raiton",
      "suiton",
      "hyouton",
      "jiton",
      "youton-mei"
    ],
    "evolutions": [],
    "execution": "sourceOnly",
    "source": {
      "id": "F03",
      "pages": "PDF 56, 57"
    },
    "text": "<h3>DESASTRE</h3><p>❖ Disponível para: Ninpou, Doton, Fuuton, Raiton, Suiton | Hyouton; Jiton; Yotton (Mei)</p><p>❖ Ação: Concentração</p><p>❖ Alcance: Epicentro do desastre até 2x Distância Comum do Poder</p><p>❖ Área de Efeito: área 3x Comum do poder. Não pode ser usada com Nível do poder como parâmetro de tamanho.</p><p>❖ Dano: 3x Nv do Poder</p><p>❖ Duração: Concentração até quantidade de turnos igual Concentração</p><p>❖ Custo de Chakra: 3x Nv do Poder</p><p>Você é capaz de canalizar o seu chakra no ambiente para causar um desastre natural e manipular os seus efeitos no ambiente para lutar por ti durante longos períodos de tempo. Ele pode assumir a forma de uma tempestade de raios, furacões, tempestade de areia, deslizamentos, terremotos, maremotos ou outro desastre natural.</p><p>Todos dentro da área exceto você ficam Lentos e, no início de seus turnos, sofrem um ataque de Combate à Distância do usuário da técnica que representa o desastre agindo.</p><p>Toda estrutura ou construção existente no ambiente sofre o dano da técnica no início do turno de cada pessoa, as pessoas no local podem ser afetadas pela destruição, mas esse nunca será um ataque direto contra algum alvo específico.</p><p>Caso o usuário deseje que alguém não seja atacado, ele pode realizar, como ação livre, imediatamente no início do turno da pessoa que ele deseja proteger, um teste de Concentração contra a 2x Nv do Poder + 9, em caso de sucesso a pessoa não é atacada naquele turno.</p><p>Caso a concentração seja interrompida, seja de forma voluntária ou não, a técnica ainda permanecerá ativa por mais uma rodada completa, porém o usuário não terá mais direito a tentar proteger alguém com o teste de concentração.</p><p>Não é possível usar o efeito Desastre mais de uma vez por cena.</p><p>Não é possível usar nenhuma aptidão de técnica com o efeito Desastre.</p>",
    "fields": {
      "available": "Ninpou, Doton, Fuuton, Raiton, Suiton | Hyouton; Jiton; Yotton (Mei)",
      "action": "Concentração",
      "range": "Epicentro do desastre até 2x Distância Comum do Poder",
      "area": "área 3x Comum do poder. Não pode ser usada com Nível do poder como parâmetro de tamanho.",
      "damage": "3x Nv do Poder",
      "duration": "Concentração até quantidade de turnos igual Concentração",
      "chakraCost": "3x Nv do Poder"
    },
    "recordId": "T05-F03-efeito_poder-desastre",
    "traits": [
      "arte:ninjutsu"
    ]
  }
];
