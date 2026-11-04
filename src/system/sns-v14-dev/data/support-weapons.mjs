// Canonical book copies derived from basico-canonico-v1.json. No live pack databases.
export const SUPPORT_WEAPONS={
 "sns:equipment:kunai": {
  "name": "Kunai",
  "creatable": true,
  "heavy": false,
  "projectile": true,
  "perCompartment": 10,
  "compartments": 1,
  "document": {
   "name": "Kunai",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:kunai",
    "category": "weapons",
    "description": "<p>Kunai: Armas clássicas dos ninjas, pequenas e versáteis. Podem ser utilizadas tanto no combate corporal quanto a distância, embora seu alcance seja menor do que o das shurikens.</p><p>Usar em combate à distância é teste de CD e causa dano dependente do atributo Destreza. Você pode usar a kunai no combate corpo-a-corpo, como uma arma leve. Usar em combate corporal é teste de CC e causa dano dependente do atributo Força (ver Dano de Combate, pág. 257).</p><table><thead><tr><th>Arma</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Kunai (CC ou CD) (3)</td><td>2 Ryos cada</td><td>+1</td><td>15m</td><td>15-16</td><td>10 itens/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:leve",
     "arma-uso:corpo-a-corpo",
     "arma-uso:arremesso",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "weaponClass": "Leve",
     "usage": "Uma mão",
     "damage": "1",
     "range": "15m",
     "attackMode": "Corpo a corpo e à distância",
     "price": 2
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "132, 137"
    }
   }
  }
 },
 "sns:equipment:shuriken": {
  "name": "Shuriken",
  "creatable": true,
  "heavy": false,
  "projectile": true,
  "perCompartment": 18,
  "compartments": 1,
  "document": {
   "name": "Shuriken",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:shuriken",
    "category": "weapons",
    "description": "<p>Shuriken: pequenos projéteis metálicos em forma de estrelas ou dardos. Você pode gastar uma ação padrão para arremessar três shurikens.</p><table><thead><tr><th>Arma</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Shuriken (3)</td><td>3 Ryos cada</td><td>+1</td><td>20m</td><td>15-16</td><td>18 itens/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-uso:arremesso",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "damage": "1",
     "range": "20m",
     "attackMode": "À distância",
     "price": 3
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "134, 137"
    }
   }
  }
 },
 "sns:equipment:espada-curta": {
  "name": "Espada Curta",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Espada Curta",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:espada-curta",
    "category": "weapons",
    "description": "<p>Espada Curta: é o tipo mais comum de espada, muito usada por soldados, legionários e guardas de milícia — ou como arma secundária. Mede entre 40 e 50cm de comprimento.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Espada Curta</td><td>8 Ryos</td><td>+2</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:leve",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 8,
     "damage": "2",
     "weaponClass": "Leve",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 137"
    }
   }
  }
 },
 "sns:equipment:tanto": {
  "name": "Tantō",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Tantō",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:tanto",
    "category": "weapons",
    "description": "<p>Tantō: simplesmente uma pequena espada, usada por diversos ninjas de nível chuunin ou maior, mesmo os ninjas médicos. Normalmente amarrada nas costas, é fabricada em diversas versões. A versão da Anbu Raiz, por exemplo, é reta, com dois gumes e sem ponta, destinada para cortes e defesas.</p><p>Você pode usar a Tantō mesmo sem cumprir o pré-requisito mínimo de Força ou Destreza para armas leves, mas o dano base é reduzido em -1.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Tantō</td><td>10 Ryos</td><td>+2</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:leve",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 10,
     "damage": "2",
     "weaponClass": "Leve",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "134, 137"
    }
   }
  }
 },
 "sns:equipment:clava": {
  "name": "Clava",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Clava",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:clava",
    "category": "weapons",
    "description": "<p>Clava: um pedaço de madeira empunhado como arma, geralmente usado como arma improvisada, como um galho de árvore ou pedaço de mobília. Sendo fácil de conseguir, seu preço é zero.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Clava</td><td>---</td><td>+3</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Esmagamento</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:mediana",
     "dano-tipo:esmagamento"
    ],
    "details": {
     "price": 0,
     "damage": "3",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 137"
    }
   }
  }
 },
 "sns:equipment:lanca": {
  "name": "Lança",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Lança",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:lanca",
    "category": "weapons",
    "description": "<p>Lança: “lança” é o nome de qualquer arma feita com uma haste de madeira e uma ponta afiada, natural ou metálica, com grande facilidade de fabricação. Uma lança pode ser arremessada usando a habilidade CC no teste de acerto e o atributo Força no cálculo de dano.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Lança</td><td>2 Ryos</td><td>+3</td><td>10m</td><td>15-16</td><td>1 item/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:mediana",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 2,
     "damage": "3",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "10m"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "132, 137"
    }
   }
  }
 },
 "sns:equipment:maca": {
  "name": "Maça",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Maça",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:maca",
    "category": "weapons",
    "description": "<p>Maça: bastão metálico com um peso cheio de protuberâncias na extremidade, a maça é muito usada por religiosos que fazem votos de não derramar sangue. De fato, um golpe de maça nem sempre derrama sangue, mas esmaga ossos...</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Maça</td><td>12 Ryos</td><td>+3</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Esmagamento</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:mediana",
     "dano-tipo:esmagamento"
    ],
    "details": {
     "price": 12,
     "damage": "3",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "133, 137"
    }
   }
  }
 },
 "sns:equipment:ninja-to": {
  "name": "Ninja-tō",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Ninja-tō",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:ninja-to",
    "category": "weapons",
    "description": "<p>Ninja-To: este é o sabre ninja. A diferença entre a espada ninja e a katana samurai se dá na sua forma: a ninja-to tem forma reta e ponta também reta, pois é carregada nas costas e sacada em um corte vertical para baixo; enquanto que a katana possui uma leve curvatura e ponta semicurava, e o samurai leva sua espada na altura da cintura, realizando um corte transversal de baixo para cima ou horizontal.</p><p>A aptidão Acuidade se aplica a Ninja-To.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Ninja-tō</td><td>20 Ryos</td><td>+3</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:mediana",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 20,
     "damage": "3",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "133, 137"
    }
   }
  }
 },
 "sns:equipment:bastao": {
  "name": "Bastão",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Bastão",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:bastao",
    "category": "weapons",
    "description": "<p>Bastão: um cajado apreciado por viajantes e camponeses. O bastão é uma arma dupla: você pode usá-lo com as aptidões Ambidestria e Bloqueio Ambidestro. Se não possuir Ambidestria, ainda pode usar o bastão, mas com dano de arma +2 (e não +2/+2).</p><p>A leveza e versatilidade do bastão também o permite ser usado com a aptidão Acuidade.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Bastão(D)</td><td>---</td><td>+2/+2</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Esmagamento</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:longa",
     "dano-tipo:esmagamento"
    ],
    "details": {
     "price": null,
     "damage": "2",
     "weaponClass": "Longa",
     "attackMode": "Corpo a corpo",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "130, 137"
    }
   }
  }
 },
 "sns:equipment:pique": {
  "name": "Pique",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Pique",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:pique",
    "category": "weapons",
    "description": "<p>Pique: essencialmente uma lança muito longa, é a arma perfeita para guardas medrosos, que não querem ficar perto de seus inimigos.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Pique</td><td>2 Ryos</td><td>+3</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:longa",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 2,
     "damage": "3",
     "weaponClass": "Longa",
     "attackMode": "Corpo a corpo",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "133, 137"
    }
   }
  }
 },
 "sns:equipment:tacape": {
  "name": "Tacape",
  "creatable": true,
  "heavy": true,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Tacape",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:tacape",
    "category": "weapons",
    "description": "<p>Tacape: versão mais perigosa da clava, maior e/ou com pregos. Não é uma arma muito elegante, mas faz o serviço.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Tacape</td><td>---</td><td>+4</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Esmagamento</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:pesada",
     "dano-tipo:esmagamento"
    ],
    "details": {
     "price": null,
     "damage": "4",
     "weaponClass": "Pesada",
     "attackMode": "Corpo a corpo",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "134, 137"
    }
   }
  }
 },
 "sns:equipment:senbon": {
  "name": "Senbon",
  "creatable": true,
  "heavy": false,
  "projectile": true,
  "perCompartment": 15,
  "compartments": 1,
  "document": {
   "name": "Senbon",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:senbon",
    "category": "weapons",
    "description": "<p>Senbon: São agulhas compridas e metálicas, usadas como projéteis. Você pode gastar uma ação padrão para arremessar três senbons. Além disso, o formato comprido das senbons ainda permite que estas possam ser usadas no combate corpo a corpo.</p><p>Usar em combate à distância é teste de CD e causa dano dependente do atributo Destreza.</p><p>Você pode usar a senbon no combate corpo-a-corpo, como uma arma leve. Usar em combate corporal é teste de CC e causa dano dependente do atributo Força (ver Dano de Combate, pág. 257).</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Senbon (CC ou CD) (3)</td><td>3 Ryos cada</td><td>+1</td><td>20m</td><td>15-16</td><td>15 itens/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-uso:arremesso",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 3,
     "damage": "1",
     "weaponClass": "",
     "attackMode": "Corpo a corpo e à distância",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "20m"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "133, 134, 137"
    }
   }
  }
 },
 "sns:equipment:arco-curto": {
  "name": "Arco Curto",
  "creatable": false,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Arco Curto",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:arco-curto",
    "category": "weapons",
    "description": "<p>Arco Curto: este arco bastante comum é próprio para caçadas, pois o tamanho pequeno é apropriado para manuseio em florestas e outros ambientes fechados. Exige as duas mãos.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Arco Curto</td><td>30 Ryos</td><td>+1</td><td>25m</td><td>15-16</td><td>1 item/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-uso:disparo",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 30,
     "damage": "1",
     "weaponClass": "",
     "attackMode": "À distância",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "25m"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "130, 138"
    }
   }
  }
 },
 "sns:equipment:besta-leve": {
  "name": "Besta Leve",
  "creatable": false,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Besta Leve",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:besta-leve",
    "category": "weapons",
    "description": "<p>Besta Leve: um arco montado sobre uma coronha de madeira com um gatilho, a besta leve é uma arma que dispara virotes com grande potência. Recarregar uma besta leve é uma ação de movimento. Exige as duas mãos.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Besta Leve</td><td>35 Ryos</td><td>+2</td><td>25m</td><td>15-16</td><td>1 item/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-uso:disparo",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 35,
     "damage": "2",
     "weaponClass": "",
     "attackMode": "À distância",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "25m",
     "reload": "Movimento"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "130, 138"
    }
   }
  }
 },
 "sns:equipment:kousen": {
  "name": "Kousen",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Kousen",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:kousen",
    "category": "weapons",
    "description": "<p>Kousen: São linhas de aço comumente usadas para prender inimigos ou realizar combinação de ataques com tarjas explosivas, kunais e shurikens. Kousen é uma arma complementar que deve ser usada amarrada em projéteis (shurikens ou kunais). Atacar dessa forma é um teste de CD e não se pode usar essas manobras com Ataque Múltiplo.</p><p>Projétil com Linha: shurikens e kunais possuem orifícios nos quais o kousen pode ser amarrado. Você pode deixar esses projéteis já preparados dessa forma dentre os seus equipamentos. Neste caso, o número máximo de itens de projétil por compartimento é reduzido pela metade. Cada projétil com kousen tem alcance máximo de 15m.</p><p>Puxar projétil: quando você arremessa uma kunai ou shuriken que tem um kousen amarrado, caso erre o ataque, você pode usá-lo para puxar o projétil de volta para si, para apanhar a arma, ou puxar na direção do inimigo, para ataca-lo novamente na mesma ação. O segundo ataque recebe -2 de penalidade de precisão.</p><p>Amarrar: esta manobra somente pode ser feita contra um alvo desprevenido ou indefeso; também pode ser usada contra alvos fintados se você possuir Des 12. Você arremessa 6 projéteis amarrados com kousen (3 em cada mão) e os puxa para que se enrolem no corpo do alvo, que ficará impedido (a condição desprevenido/indefeso é mantida). Manter o alvo preso requer concentração e somente é possível usar esta manobra contra um único alvo.</p><p>Escapar das amarras é uma ação padrão e não requer testes. Opcionalmente, a vítima pode tentar se livrar com uma ação de movimento e um teste bem-sucedido de Força ou Escapar, Dif 17.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Kousen (15m)</td><td>2 Ryos</td><td>---</td><td>---</td><td>---</td><td>1 item/1 comp.</td><td>---</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:leve"
    ],
    "details": {
     "price": 2,
     "damage": "",
     "weaponClass": "Leve",
     "attackMode": "À distância",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "132, 138"
    }
   }
  }
 },
 "sns:equipment:nunchaku": {
  "name": "Nunchaku",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Nunchaku",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:nunchaku",
    "category": "weapons",
    "description": "<p>Nunchaku: formado por dois bastões curtos de madeira ligados por uma corrente ou tira de couro, o nunchaku era usado por camponeses para separar o joio do trigo, sendo mais tarde adotado como arma. Você pode usar o nunchaku para executar a manobra agarrar sem as penalidades comuns.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Nunchaku</td><td>2 Ryos</td><td>+2</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Esmagamento</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:leve",
     "dano-tipo:esmagamento"
    ],
    "details": {
     "price": 2,
     "damage": "2",
     "weaponClass": "Leve",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "133, 138"
    }
   }
  }
 },
 "sns:equipment:wakizashi": {
  "name": "Wakizashi",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Wakizashi",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:wakizashi",
    "category": "weapons",
    "description": "<p>Wakizashi: versão mais curta da katana. A katana e wakizashi, juntas, formam um conjunto chamado daisho — são as armas tradicionais do samurai. Alguns samurais carregam a wakizashi apenas como uma peça simbólica, enquanto outros a usam como arma secundária.</p><p>Daisho: Quando se compra Usar Arma: Katana, você também recebe proficiência para usar a Wakizashi. Todos os benefícios que você possuir para a Katana (por exemplo, a aptidão Especialista) também são aplicados para a Wakizashi.</p><p>Se possuir Força ou Destreza 12, você pode empunhar uma Katana e uma Wakizashi ao mesmo tempo usando aptidão Ambidestria.</p><p>A aptidão Acuidade se aplica a Wakizashi.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Wakizashi</td><td>15 Ryos</td><td>+2</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:leve",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 15,
     "damage": "2",
     "weaponClass": "Leve",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "135, 138"
    }
   }
  }
 },
 "sns:equipment:chicote": {
  "name": "Chicote",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Chicote",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:chicote",
    "category": "weapons",
    "description": "<p>Chicote: Uma arma mediana. Você pode atacar um inimigo a até 4m com um chicote. Esta arma pode se enroscar nas mãos, pernas ou armas do adversário, permitindo realizar as manobras desarmar e derrubar sem as penalidades comuns. A aptidão Acuidade se aplica ao chicote.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Chicote</td><td>1 Ryo</td><td>+0</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:mediana",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 1,
     "damage": "0",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "4m"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 138"
    }
   }
  }
 },
 "sns:equipment:chokuto": {
  "name": "Chokutō",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Chokutō",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:chokuto",
    "category": "weapons",
    "description": "<p>Chokutō: Uma espada longa, com lâmina reta de um gume. É uma arma derivada das espadas da antiga China, normalmente levada amarrada na cintura. A aptidão Acuidade se aplica a esta arma.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Chokutō</td><td>20 Ryos</td><td>+4</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:mediana",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 20,
     "damage": "4",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 138"
    }
   }
  }
 },
 "sns:equipment:cimitarra": {
  "name": "Cimitarra",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Cimitarra",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:cimitarra",
    "category": "weapons",
    "description": "<p>Cimitarra: uma espada com a lâmina curva, leve e muito afiada.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Cimitarra</td><td>20 Ryos</td><td>+2</td><td>---</td><td>14-15-16</td><td>1 item/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:mediana",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 20,
     "damage": "2",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 138"
    }
   }
  }
 },
 "sns:equipment:corrente-com-cravos": {
  "name": "Corrente com Cravos",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Corrente com Cravos",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:corrente-com-cravos",
    "category": "weapons",
    "description": "<p>Corrente com Cravos: Uma arma mediana. você pode atacar um inimigo a até 4m com uma corrente com cravos. Esta arma pode se enroscar nas mãos, pernas ou armas do adversário, permitindo realizar as manobras desarmar e derrubar sem as penalidades comuns.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Corrente com Cravos</td><td>25 Ryos</td><td>+1</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:mediana",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 25,
     "damage": "1",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "4m"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 138"
    }
   }
  }
 },
 "sns:equipment:espada-longa": {
  "name": "Espada Longa",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Espada Longa",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:espada-longa",
    "category": "weapons",
    "description": "<p>Espada Longa: Espada de dois gumes com lâmina reta medindo entre 80cm e 1m.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Espada Longa</td><td>15 Ryos</td><td>+4</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:mediana",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 15,
     "damage": "4",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 138"
    }
   }
  }
 },
 "sns:equipment:florete": {
  "name": "Florete",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Florete",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:florete",
    "category": "weapons",
    "description": "<p>Florete: a lâmina leve e fina desta espada torna a arma muito precisa. A aptidão Acuidade se aplica ao florete. Contudo, usá-la sem Acuidade causa penalidade de -1 de dano base.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Florete</td><td>20 Ryos</td><td>+2</td><td>---</td><td>14-15-16</td><td>1 item/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:mediana",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 20,
     "damage": "2",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 138"
    }
   }
  }
 },
 "sns:equipment:katana": {
  "name": "Katana",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Katana",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:katana",
    "category": "weapons",
    "description": "<p>Katana: a espada tradicional do samurai, e usada por alguns ninjas, tem lâmina levemente curva e apenas um gume. Apesar de grande, com treinamento especial (Ambidestria), pode ser usada com uma só mão, sem alteração no dano.</p><p>Daisho: Quando se compra Usar Arma: Katana, você também recebe proficiência para usar a Wakizashi. Todos os benefícios que você possuir para a Katana (por exemplo, a aptidão Especialista) também são aplicados para a Wakizashi. Se possuir Força ou Destreza 12, você pode empunhar uma Katana e uma Wakizashi ao mesmo tempo usando a aptidão Ambidestria.</p><p>A aptidão Acuidade se aplica a Katana.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Katana</td><td>20 Ryos</td><td>+3</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:mediana",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 20,
     "damage": "3",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "132, 138"
    }
   }
  }
 },
 "sns:equipment:machado": {
  "name": "Machado",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Machado",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:machado",
    "category": "weapons",
    "description": "<p>Machado: diferente de uma machadinha, este não é um instrumento para corte de árvores, mas sim uma arma capaz de causar ferimentos terríveis.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Machado</td><td>10 Ryos</td><td>+3</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:mediana",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 10,
     "damage": "3",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "133, 138"
    }
   }
  }
 },
 "sns:equipment:martelo-de-guerra": {
  "name": "Martelo de Guerra",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Martelo de Guerra",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:martelo-de-guerra",
    "category": "weapons",
    "description": "<p>Martelo de Guerra: outra ferramenta modificada para combate, o martelo de combate é muito eficiente contra alguns tipos inimigos mais resistentes a danos por corte ou perfuração.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Martelo de Guerra</td><td>12 Ryos</td><td>+3</td><td>---</td><td>15-16</td><td>1 item/1 comp.</td><td>Esmagamento</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:mediana",
     "dano-tipo:esmagamento"
    ],
    "details": {
     "price": 12,
     "damage": "3",
     "weaponClass": "Mediana",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "133, 138"
    }
   }
  }
 },
 "sns:equipment:foice": {
  "name": "Foice",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 2,
  "document": {
   "name": "Foice",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:foice",
    "category": "weapons",
    "description": "<p>Foice: diferente da ferramenta usada por fazendeiros, uma foice de combate é mais forte e balanceada. Tentar bloquear uma foice desarmado causa -1 de precisão no teste de CC.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Foice</td><td>18 Ryos</td><td>+4</td><td>---</td><td>15-16</td><td>1 item/2 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:longa",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 18,
     "damage": "4",
     "weaponClass": "Longa",
     "attackMode": "Corpo a corpo",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 139"
    }
   }
  }
 },
 "sns:equipment:leque-gigante": {
  "name": "Leque Gigante",
  "creatable": false,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 2,
  "document": {
   "name": "Leque Gigante",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:leque-gigante",
    "category": "weapons",
    "description": "<p>Leque Gigante: Uma arma longa rara, natural da Vila Oculta da Areia. Os dois suportes do leque são feitos de aço, enquanto que o tecido interno é bem mais resistente que leques comuns. Quando fechado, pode ser usado como arma de esmagamento. E quando aberto, o usuário brande no ar e utiliza chakra para criar fortes ventanias.</p><p>O leque gigante pode ser usado para executar técnicas do elemento Fuuton sem uso de selos de mão. Para isso, não deve haver ninguém próximo a pelo menos 2m de distância, para que tenha liberdade para movimentar o leque.</p><p>Esta arma também permite usar a aptidão Potencializar para seu poder Fuuton gratuitamente, sem a necessidade de comprar a aptidão.</p><p>Embora seja uma arma longa, o Leque Gigante requer somente Destreza 8 para ser empunhado. A aptidão Acuidade se aplica a esta arma.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Leque Gigante</td><td>100 Ryos</td><td>+2</td><td>---</td><td>15-16</td><td>1 item/2 comp.</td><td>Esmagamento</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:longa",
     "dano-tipo:esmagamento"
    ],
    "details": {
     "price": 100,
     "damage": "2",
     "weaponClass": "Longa",
     "attackMode": "Corpo a corpo",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "133, 139"
    }
   }
  }
 },
 "sns:equipment:espada-de-duas-laminas": {
  "name": "Espada de Duas Lâminas",
  "creatable": true,
  "heavy": true,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 2,
  "document": {
   "name": "Espada de Duas Lâminas",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:espada-de-duas-laminas",
    "category": "weapons",
    "description": "<p>Espada de Duas Lâminas: Uma arma dupla pesada. Duas espadas longas, presas em lados opostos de um mesmo cabo.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Espada de Duas Lâminas(D)</td><td>100 Ryos</td><td>+2/+2</td><td>---</td><td>15-16</td><td>1 item/2 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:pesada",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 100,
     "damage": "2",
     "weaponClass": "Pesada",
     "attackMode": "Corpo a corpo",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 139"
    }
   }
  }
 },
 "sns:equipment:espada-grande": {
  "name": "Espada Grande",
  "creatable": true,
  "heavy": true,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 2,
  "document": {
   "name": "Espada Grande",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:espada-grande",
    "category": "weapons",
    "description": "<p>Espada Grande: enorme e muito pesada, esta espada tem 1,5m de comprimento. É uma das armas mais poderosas que uma criatura Média consegue empunhar.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Espada Grande</td><td>20 Ryos</td><td>+5</td><td>---</td><td>15-16</td><td>1 item/2 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:pesada",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 20,
     "damage": "5",
     "weaponClass": "Pesada",
     "attackMode": "Corpo a corpo",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 139"
    }
   }
  }
 },
 "sns:equipment:machado-grande": {
  "name": "Machado Grande",
  "creatable": true,
  "heavy": true,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 2,
  "document": {
   "name": "Machado Grande",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:machado-grande",
    "category": "weapons",
    "description": "<p>Machado Grande: este imenso machado com lâmina dupla é uma das armas mais perigosas que existem. Você pode atacar com esta arma usando uma ação completa para ganhar +1 de dano de arma. Você não pode utilizar aptidões de manobra se atacar desta forma (mesmo as que forem permitidas para armas pesadas).</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Machado Grande</td><td>50 Ryos</td><td>+5 (+1)</td><td>---</td><td>15-16</td><td>1 item/2 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:pesada",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 50,
     "damage": "5",
     "weaponClass": "Pesada",
     "attackMode": "Corpo a corpo",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "133, 139"
    }
   }
  }
 },
 "sns:equipment:fuuma-shuriken-gigante": {
  "name": "Fuuma Shuriken: Gigante",
  "creatable": true,
  "heavy": false,
  "projectile": true,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Fuuma Shuriken: Gigante",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:fuuma-shuriken-gigante",
    "category": "weapons",
    "description": "<p>Fuuma Shuriken: trata-se de uma shuriken gigante, uma arma de arremesso pesada de difícil manuseio, mas de equivalente poder letal. Somente é possível arremessar uma única Fuuma Shuriken por ação. Esta arma possui três tipos diferentes:</p><p>Gigante: [requer For ou Des 12] A versão mais simples que consiste literalmente em uma shuriken gigante. É a que causa maior dano, porém também ocupa mais espaço. Quando uma criatura é atingida por essa arma, ela deve testar Vigor (dif 7 + Destreza do atacante) ou ficará caída conforme o impacto do projétil massivo a empurra para trás. Esta versão pode ser usada com a manobra Puxar Projétil da arma Kousen.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Fuuma Shuriken: Gigante</td><td>10 Ryos</td><td>+5</td><td>20m</td><td>15-16</td><td>1 item/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-uso:arremesso",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 10,
     "damage": "5",
     "weaponClass": "",
     "attackMode": "À distância",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "20m"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 139"
    }
   }
  }
 },
 "sns:equipment:fuuma-shuriken-lamina-reta": {
  "name": "Fuuma Shuriken: Lâmina Reta",
  "creatable": false,
  "heavy": false,
  "projectile": true,
  "perCompartment": 2,
  "compartments": 1,
  "document": {
   "name": "Fuuma Shuriken: Lâmina Reta",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:fuuma-shuriken-lamina-reta",
    "category": "weapons",
    "description": "<p>Fuuma Shuriken: trata-se de uma shuriken gigante, uma arma de arremesso pesada de difícil manuseio, mas de equivalente poder letal. Somente é possível arremessar uma única Fuuma Shuriken por ação. Esta arma possui três tipos diferentes:</p><p>Lâmina Reta: [requer For ou Des 10; Ponto Cego] Essa versão portátil é inteiramente desmontável. Você pode amarrar um fio Kousen nesta arma e puxá-lo após o arremesso, fazendo as lâminas se separem e dificultar a defesa do alvo. Neste caso, você realiza uma Finta durante o arremesso, usando Destreza no lugar da Agilidade.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Fuuma Shuriken: Lâmina Reta</td><td>15 Ryos</td><td>+3</td><td>20m</td><td>15-16</td><td>2 itens/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-uso:arremesso",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 15,
     "damage": "3",
     "weaponClass": "",
     "attackMode": "À distância",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "20m"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 132, 139"
    }
   }
  }
 },
 "sns:equipment:fuuma-shuriken-kage-fusha": {
  "name": "Fuuma Shuriken: Kage Fushä",
  "creatable": false,
  "heavy": false,
  "projectile": true,
  "perCompartment": 2,
  "compartments": 1,
  "document": {
   "name": "Fuuma Shuriken: Kage Fushä",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:fuuma-shuriken-kage-fusha",
    "category": "weapons",
    "description": "<p>Fuuma Shuriken: trata-se de uma shuriken gigante, uma arma de arremesso pesada de difícil manuseio, mas de equivalente poder letal. Somente é possível arremessar uma única Fuuma Shuriken por ação. Esta arma possui três tipos diferentes:</p><p>Lâmina Reta: [requer For ou Des 10; Ponto Cego] Essa versão portátil é inteiramente desmontável. Você pode amarrar um fio Kousen nesta arma e puxá-lo após o arremesso, fazendo as lâminas se separem e dificultar a defesa do alvo. Neste caso, você realiza uma Finta durante o arremesso, usando Destreza no lugar da Agilidade.</p><p>Kage Fushä: [requer For ou Des 8; Ponto Cego] Sendo a mais utilizada mundo afora, o Moinho de Vento das Sombras é uma shuriken dobrável de lâmina curva, similar a uma hélice. Ela funciona da mesma maneira que a versão de lâmina reta, porém possui menos dano com uma margem de crítico maior. Em contrapartida, esta arma não recebe os benefícios da aptidão Crítico Aprimorado nem qualquer outro do mesmo tipo.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Fuuma Shuriken: Kage Fushä</td><td>20 Ryos</td><td>+2</td><td>20m</td><td>14-15-16</td><td>2 itens/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-uso:arremesso",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 20,
     "damage": "2",
     "weaponClass": "",
     "attackMode": "À distância",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "20m"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "131, 132, 139"
    }
   }
  }
 },
 "sns:equipment:arco-composto-longo": {
  "name": "Arco Composto/Longo",
  "creatable": false,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Arco Composto/Longo",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:arco-composto-longo",
    "category": "weapons",
    "description": "<p>Arco Composto: este arco é feito com materiais melhorados e dispara com mais força que um arco comum, tendo mais alcance e causando maior dano. Usar um arco composto exige as duas mãos.</p><p>Arco Longo: este arco reforçado tem a altura de uma pessoa. Diferente do arco curto, é próprio para campos de batalha e outras áreas abertas — seu longo alcance permite atingir o inimigo a grandes distâncias. Exige as duas mãos.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Arco Composto/Longo</td><td>100 Ryos</td><td>+3</td><td>10m +2m x Des</td><td>15-16</td><td>1 item/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-uso:disparo",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 100,
     "damage": "3",
     "weaponClass": "",
     "attackMode": "À distância",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "10m +2m x Des"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "130, 139"
    }
   }
  }
 },
 "sns:equipment:besta-pesada": {
  "name": "Besta Pesada",
  "creatable": false,
  "heavy": false,
  "projectile": false,
  "perCompartment": 1,
  "compartments": 1,
  "document": {
   "name": "Besta Pesada",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:besta-pesada",
    "category": "weapons",
    "description": "<p>Besta Pesada: versão maior e mais potente da besta leve. Recarregar uma besta pesada é uma ação padrão. Usar esta besta também exige as duas mãos.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Besta Pesada</td><td>50 Ryos</td><td>+4</td><td>35m</td><td>15-16</td><td>1 item/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-uso:disparo",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 50,
     "damage": "4",
     "weaponClass": "",
     "attackMode": "À distância",
     "usage": "Duas mãos",
     "size": "Médio",
     "range": "35m",
     "reload": "Padrão"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "130, 139"
    }
   }
  }
 },
 "sns:equipment:flechas-para-arcos": {
  "name": "Flechas para arcos",
  "creatable": true,
  "heavy": false,
  "projectile": true,
  "perCompartment": 20,
  "compartments": 1,
  "document": {
   "name": "Flechas para arcos",
   "type": "ammunition",
   "img": "icons/svg/target.svg",
   "system": {
    "contentId": "sns:equipment:flechas-para-arcos",
    "category": "ammunition",
    "description": "<table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Flechas para arcos (1)</td><td>1 Ryo cada</td><td>---</td><td>---</td><td>---</td><td>20 itens/1 comp.</td><td>---</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:municao"
    ],
    "details": {
     "price": 1,
     "compatible": "Arcos",
     "perCompartment": 20
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "139"
    }
   }
  }
 },
 "sns:equipment:virotes-para-bestas": {
  "name": "Virotes para bestas",
  "creatable": true,
  "heavy": false,
  "projectile": true,
  "perCompartment": 20,
  "compartments": 1,
  "document": {
   "name": "Virotes para bestas",
   "type": "ammunition",
   "img": "icons/svg/target.svg",
   "system": {
    "contentId": "sns:equipment:virotes-para-bestas",
    "category": "ammunition",
    "description": "<table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Virotes para bestas (1)</td><td>1 Ryo cada</td><td>---</td><td>---</td><td>---</td><td>20 itens/1 comp.</td><td>---</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:municao"
    ],
    "details": {
     "price": 1,
     "compatible": "Bestas",
     "perCompartment": 20
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "139"
    }
   }
  }
 },
 "sns:equipment:tonfa": {
  "name": "Tonfa",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 2,
  "compartments": 1,
  "document": {
   "name": "Tonfa",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:tonfa",
    "category": "weapons",
    "description": "<p>Tonfa: trata-se de uma ferramenta que também era utilizada por agricultores na colheita de arroz, e que foi posteriormente adaptada como arma. A tonfa nada mais é que um pequeno bastão de madeira, com um cabo perpendicular fixado a um palmo das extremidades, permitindo movimentos circulares no ataque e boa defesa usando a parte lateral.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Tonfa (par)</td><td>8 Ryos</td><td>+1/+1</td><td>---</td><td>15-16</td><td>1 par/1 comp.</td><td>Esmagamento</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:simples",
     "arma-porte:leve",
     "dano-tipo:esmagamento"
    ],
    "details": {
     "price": 8,
     "damage": "1",
     "weaponClass": "Leve",
     "attackMode": "Corpo a corpo",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "---"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "135, 137"
    }
   }
  }
 },
 "sns:equipment:aian-nakkuru": {
  "name": "Aian Nakkuru",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 2,
  "compartments": 1,
  "document": {
   "name": "Aian Nakkuru",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:aian-nakkuru",
    "category": "weapons",
    "description": "<p>Aian Nakkuru: Um par de armas leves que consistem em soqueiras com lâminas ao final. São feitas com um metal especial que facilita a infusão de chakra, qualquer que seja o tipo (comum, elemento, hijutsu...). É necessário Força ou Destreza 10 para usá-las.</p><p>Atacar com a parte da soqueira causa dano do tipo esmagamento. Atacar com as lâminas exige Ambidestria e causa dano do tipo corte. O valor do dano de arma é o mesmo; somente o tipo do dano é alterado.</p><p>As aian nakkuru também podem ser usadas como armas de arremesso, tendo +1 de dano de arma cada uma. Somente é possível arremessar uma única unidade da aian nakkuru com cada mão.</p><p>No combate corpo-a-corpo, você pode usar o efeito Energizar ou Afiar (Fuuton) para formar uma densa lâmina de chakra ao seu redor do fio da Aian Nakkuru. Usar com Energizar concede +1 de bônus de dano base, e usar com Afiar aumenta o bônus para +2 de dano base.</p><p>Estas armas foram feitas para serem usadas em par. Você não recebe estes bônus de dano caso use somente 1 unidade, nem recebe os benefícios em dobro caso use o par completo.</p><p>Essas armas ficam presas à mão, por terem formato de soqueiras, e gera -2 de penalidade nos testes de Desarmar contra o usuário.</p><p>A aptidão Acuidade se aplica a Aian Nakkuru.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Aian Nakkuru (par)</td><td>100 Ryos</td><td>+1/+1</td><td>15m</td><td>15-16</td><td>1 par/1 comp.</td><td>Corte</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:leve",
     "dano-tipo:corte"
    ],
    "details": {
     "price": 100,
     "damage": "1",
     "weaponClass": "Leve",
     "attackMode": "Corpo a corpo e à distância",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "15m"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "130, 138"
    }
   }
  }
 },
 "sns:equipment:sai": {
  "name": "Sai",
  "creatable": true,
  "heavy": false,
  "projectile": false,
  "perCompartment": 2,
  "compartments": 1,
  "document": {
   "name": "Sai",
   "type": "weapon",
   "img": "icons/svg/sword.svg",
   "system": {
    "contentId": "sns:equipment:sai",
    "category": "weapons",
    "description": "<p>Sai: parecida com um grande garfo de metal, a adaga sai é própria para prender as armas do oponente. Você pode usar esta arma para executar a manobra desarmar sem as penalidades comuns.</p><p>Essas adagas também podem ser usadas como armas de arremesso, tendo +1 de dano de arma cada uma. Somente é possível arremessar uma única adaga com cada mão.</p><table><thead><tr><th>Nome</th><th>Preço</th><th>Dano</th><th>Alcance</th><th>Crítico</th><th>Compartimentos</th><th>Tipo</th></tr></thead><tbody><tr><td>Sai (par)</td><td>5 Ryos</td><td>+1/+1</td><td>20m</td><td>15-16</td><td>1 par/1 comp.</td><td>Perfuração</td></tr></tbody></table>",
    "level": 0,
    "quantity": 1,
    "compartments": null,
    "equipped": false,
    "tags": [],
    "traits": [
     "equipamento:arma",
     "arma-grupo:marcial",
     "arma-porte:leve",
     "dano-tipo:perfuracao"
    ],
    "details": {
     "price": 5,
     "damage": "1",
     "weaponClass": "Leve",
     "attackMode": "Corpo a corpo e à distância",
     "usage": "Uma mão",
     "size": "Médio",
     "range": "20m"
    },
    "source": {
     "id": "Naruto: Shinobi no Sho — Livro Básico",
     "edition": "4.1b",
     "pages": "133, 138"
    }
   }
  }
 }
};
