// Book lists and parameters checked in D168. Canonical descriptions are copied at build time.
export const NPC_REPERTOIRES={
  "sns:power:kikai-ninpou": {
    "id": "sns:power:kikai-ninpou",
    "mode": "effects",
    "base": null,
    "allowed": [
      "canhao",
      "orbe",
      "raio",
      "barreira",
      "flechas",
      "ricochete",
      "coluna",
      "nuvem",
      "sopro-destrutivo",
      "missil"
    ],
    "extra": [
      "interferencia"
    ],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "skill:lidar_com_animais",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F01",
      "pages": [
        147,
        148
      ],
      "bodySha256": "31efe42c7a3dc89133b7d3e61bcf4228dc48c0a86e12ade3321984e60569375d"
    },
    "effects": [
      {
        "id": "sns:effect:canhao",
        "name": "Canhão",
        "min": 1,
        "evolutions": []
      },
      {
        "id": "sns:effect:orbe",
        "name": "Orbe",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:raio",
        "name": "Raio",
        "min": 2,
        "evolutions": [
          5,
          8
        ]
      },
      {
        "id": "sns:effect:barreira",
        "name": "Barreira",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:flechas",
        "name": "Flechas",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:ricochete",
        "name": "Ricochete",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:coluna",
        "name": "Coluna",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:nuvem",
        "name": "Nuvem",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:sopro-destrutivo",
        "name": "Sopro Destrutivo",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:missil",
        "name": "Míssil",
        "min": 5,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:interferencia",
        "name": "Interferência",
        "min": 3,
        "evolutions": []
      }
    ]
  },
  "sns:power:sumi-ninpou": {
    "id": "sns:power:sumi-ninpou",
    "mode": "effects",
    "base": null,
    "allowed": [
      "canhao",
      "orbe",
      "raio",
      "restringente",
      "montaria",
      "barreira",
      "flechas",
      "lanca",
      "ricochete",
      "coluna",
      "energizar",
      "nuvem",
      "sopro-destrutivo",
      "correnteza",
      "missil",
      "onda-explosiva",
      "algemar",
      "imergir",
      "nevoa",
      "prisao-de-agua"
    ],
    "extra": [
      "desenhos-rastreadores",
      "bolha-de-tinta"
    ],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "skill:arte",
      "rangeBase": 15,
      "rangeFactor": 3,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 1
    },
    "source": {
      "id": "F04",
      "pages": [
        26,
        27,
        28
      ],
      "bodySha256": "5857fe75a1484f817d71944326dea84b8439d5d92918e268c80ebe2f7a033893"
    },
    "effects": [
      {
        "id": "sns:effect:canhao",
        "name": "Canhão",
        "min": 1,
        "evolutions": []
      },
      {
        "id": "sns:effect:orbe",
        "name": "Orbe",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:raio",
        "name": "Raio",
        "min": 2,
        "evolutions": [
          5,
          8
        ]
      },
      {
        "id": "sns:effect:restringente",
        "name": "Restringente",
        "min": 2,
        "evolutions": [
          6
        ]
      },
      {
        "id": "sns:effect:montaria",
        "name": "Montaria",
        "min": 2,
        "evolutions": [
          5
        ]
      },
      {
        "id": "sns:effect:barreira",
        "name": "Barreira",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:flechas",
        "name": "Flechas",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:lanca",
        "name": "Lança",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:ricochete",
        "name": "Ricochete",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:coluna",
        "name": "Coluna",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:energizar",
        "name": "Energizar",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:nuvem",
        "name": "Nuvem",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:sopro-destrutivo",
        "name": "Sopro Destrutivo",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:correnteza",
        "name": "Correnteza",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:missil",
        "name": "Míssil",
        "min": 5,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:onda-explosiva",
        "name": "Onda Explosiva",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:algemar",
        "name": "Algemar",
        "min": 6,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:imergir",
        "name": "Imergir",
        "min": 2,
        "evolutions": [
          4
        ]
      },
      {
        "id": "sns:effect:nevoa",
        "name": "Névoa",
        "min": 2,
        "evolutions": [
          5
        ]
      },
      {
        "id": "sns:effect:prisao-de-agua",
        "name": "Prisão de Água",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:desenhos-rastreadores",
        "name": "Desenhos Rastreadores",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:bolha-de-tinta",
        "name": "Bolha De Tinta",
        "min": 2,
        "evolutions": [
          5
        ]
      }
    ]
  },
  "sns:power:mokuton": {
    "id": "sns:power:mokuton",
    "mode": "effects",
    "base": "ninpou",
    "allowed": null,
    "extra": [
      "imergir",
      "transmissor",
      "selar-chakra",
      "golem"
    ],
    "mandatory": [],
    "grants": [
      "doton",
      "suiton"
    ],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 1
    },
    "source": {
      "id": "F01",
      "pages": [
        175,
        176,
        177,
        178
      ],
      "bodySha256": "9c360141e1a8bd8dbcc3f9351adef7836b169cb5f80fd6db860554c4dd53b4f9"
    },
    "effects": [
      {
        "id": "sns:effect:imergir",
        "name": "Imergir",
        "min": 2,
        "evolutions": [
          4
        ]
      },
      {
        "id": "sns:effect:transmissor",
        "name": "Transmissor",
        "min": 2,
        "evolutions": []
      },
      {
        "id": "sns:effect:selar-chakra",
        "name": "Selar Chakra",
        "min": 6,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:golem",
        "name": "Golem",
        "min": 7,
        "evolutions": [
          10
        ]
      }
    ]
  },
  "sns:power:hibon-ninpou": {
    "id": "sns:power:hibon-ninpou",
    "mode": "effects",
    "base": "ninpou",
    "allowed": null,
    "extra": [],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F01",
      "pages": [
        212
      ],
      "bodySha256": "cfed184756778f7172f22d241ab0fe09c33d8b56f685f29fa90290eb323cb5cd"
    },
    "effects": []
  },
  "sns:power:dokujutsu": {
    "id": "sns:power:dokujutsu",
    "mode": "effects",
    "base": null,
    "allowed": [
      "canhao",
      "orbe",
      "raio",
      "dano-continuo",
      "purificar",
      "flechas",
      "lanca",
      "ricochete",
      "coluna",
      "energizar",
      "nuvem",
      "sopro-destrutivo",
      "missil",
      "correnteza",
      "onda-explosiva",
      "cegante"
    ],
    "extra": [],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "skill:veneficio",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F03",
      "pages": [
        9,
        10,
        11
      ],
      "bodySha256": "8a8da7df79ac8823487fba4f104cf3a52169b40a82009581dc5e998b641539c2"
    },
    "effects": [
      {
        "id": "sns:effect:canhao",
        "name": "Canhão",
        "min": 1,
        "evolutions": []
      },
      {
        "id": "sns:effect:orbe",
        "name": "Orbe",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:raio",
        "name": "Raio",
        "min": 2,
        "evolutions": [
          5,
          8
        ]
      },
      {
        "id": "sns:effect:dano-continuo",
        "name": "Dano Contínuo",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:purificar",
        "name": "Purificar",
        "min": 2,
        "evolutions": [
          4,
          7
        ]
      },
      {
        "id": "sns:effect:flechas",
        "name": "Flechas",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:lanca",
        "name": "Lança",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:ricochete",
        "name": "Ricochete",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:coluna",
        "name": "Coluna",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:energizar",
        "name": "Energizar",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:nuvem",
        "name": "Nuvem",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:sopro-destrutivo",
        "name": "Sopro Destrutivo",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:missil",
        "name": "Míssil",
        "min": 5,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:correnteza",
        "name": "Correnteza",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:onda-explosiva",
        "name": "Onda Explosiva",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:cegante",
        "name": "Cegante",
        "min": 5,
        "evolutions": [
          8
        ]
      }
    ]
  },
  "sns:power:futton": {
    "id": "sns:power:futton",
    "mode": "effects",
    "base": null,
    "allowed": [
      "canhao",
      "orbe",
      "nevoa",
      "raio",
      "dano-continuo",
      "projetar",
      "flechas",
      "ricochete",
      "coluna",
      "nuvem",
      "sopro-destrutivo",
      "missil",
      "correnteza",
      "inflamavel",
      "onda-explosiva",
      "cegante"
    ],
    "extra": [
      "sopro-concentrado",
      "neblina-acida"
    ],
    "mandatory": [],
    "grants": [
      "katon",
      "suiton"
    ],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 2,
      "damageBonus": 2,
      "difficultyBonus": 1
    },
    "source": {
      "id": "F04",
      "pages": [
        112,
        113,
        114
      ],
      "bodySha256": "f06f1085c89feb39cfe6776a25f21cda5cab5f4c14d2aaab780a950c8556989d"
    },
    "effects": [
      {
        "id": "sns:effect:canhao",
        "name": "Canhão",
        "min": 1,
        "evolutions": []
      },
      {
        "id": "sns:effect:orbe",
        "name": "Orbe",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:nevoa",
        "name": "Névoa",
        "min": 2,
        "evolutions": [
          5
        ]
      },
      {
        "id": "sns:effect:raio",
        "name": "Raio",
        "min": 2,
        "evolutions": [
          5,
          8
        ]
      },
      {
        "id": "sns:effect:dano-continuo",
        "name": "Dano Contínuo",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:projetar",
        "name": "Projetar",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:flechas",
        "name": "Flechas",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:ricochete",
        "name": "Ricochete",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:coluna",
        "name": "Coluna",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:nuvem",
        "name": "Nuvem",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:sopro-destrutivo",
        "name": "Sopro Destrutivo",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:missil",
        "name": "Míssil",
        "min": 5,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:correnteza",
        "name": "Correnteza",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:inflamavel",
        "name": "Inflamável",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:onda-explosiva",
        "name": "Onda Explosiva",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:cegante",
        "name": "Cegante",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:sopro-concentrado",
        "name": "Sopro Concentrado",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:neblina-acida",
        "name": "Neblina Ácida",
        "min": 6,
        "evolutions": [
          8,
          10
        ]
      }
    ]
  },
  "sns:power:hyouton": {
    "id": "sns:power:hyouton",
    "mode": "effects",
    "base": "ninpou",
    "allowed": null,
    "extra": [
      "imergir",
      "espelhos-demoniacos"
    ],
    "mandatory": [],
    "grants": [
      "fuuton",
      "suiton"
    ],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 1
    },
    "source": {
      "id": "F02",
      "pages": [
        19,
        20,
        21
      ],
      "bodySha256": "e2801bc37554d3ea6d83f28537091fbb1f59cfbc668c0b39ebc3931ea86fb2cd"
    },
    "effects": [
      {
        "id": "sns:effect:imergir",
        "name": "Imergir",
        "min": 2,
        "evolutions": [
          4
        ]
      },
      {
        "id": "sns:effect:espelhos-demoniacos",
        "name": "Espelhos Demoníacos",
        "min": 6,
        "evolutions": [
          8
        ]
      }
    ]
  },
  "sns:power:sakin": {
    "id": "sns:power:sakin",
    "mode": "effects",
    "base": "ninpou",
    "allowed": null,
    "extra": [
      "imergir",
      "colisao-de-ondas",
      "areia-especial",
      "areia-suspensa",
      "terceiro-olho",
      "prisao-de-areia",
      "areia-selada",
      "armadura-de-po-de-ouro",
      "ouro-reluzente"
    ],
    "mandatory": [
      "areia-especial"
    ],
    "grants": [
      "fuuton",
      "doton"
    ],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F04",
      "pages": [
        66,
        67,
        68
      ],
      "bodySha256": "064a3a646881075f43498122ba69a24661ca108aef491bacdef03d9db03be21a"
    },
    "effects": [
      {
        "id": "sns:effect:imergir",
        "name": "Imergir",
        "min": 2,
        "evolutions": [
          4
        ]
      },
      {
        "id": "sns:effect:colisao-de-ondas",
        "name": "Colisão de Ondas",
        "min": 6,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:areia-especial",
        "name": "Areia Especial",
        "min": 2,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:areia-suspensa",
        "name": "Areia Suspensa",
        "min": 5,
        "evolutions": []
      },
      {
        "id": "sns:effect:terceiro-olho",
        "name": "Terceiro Olho",
        "min": 3,
        "evolutions": []
      },
      {
        "id": "sns:effect:prisao-de-areia",
        "name": "Prisão De Areia",
        "min": 5,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:areia-selada",
        "name": "Areia Selada",
        "min": 3,
        "evolutions": []
      },
      {
        "id": "sns:effect:armadura-de-po-de-ouro",
        "name": "Armadura De Pó De Ouro",
        "min": 3,
        "evolutions": [
          6
        ]
      },
      {
        "id": "sns:effect:ouro-reluzente",
        "name": "Ouro Reluzente",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      }
    ]
  },
  "sns:power:satetsu": {
    "id": "sns:power:satetsu",
    "mode": "effects",
    "base": "ninpou",
    "allowed": null,
    "extra": [
      "imergir",
      "colisao-de-ondas",
      "areia-especial",
      "areia-suspensa",
      "prisao-de-areia",
      "areia-selada",
      "manto-de-areia-de-ferro",
      "membros-de-ferro",
      "areia-de-ferro-venenosa"
    ],
    "mandatory": [
      "areia-especial"
    ],
    "grants": [
      "fuuton",
      "doton"
    ],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 1,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F04",
      "pages": [
        68,
        69,
        70
      ],
      "bodySha256": "016a7ccc7569b98c5b7a24d8da87fbe2217f020e1cf0bda562e88a8867c007f4"
    },
    "effects": [
      {
        "id": "sns:effect:imergir",
        "name": "Imergir",
        "min": 2,
        "evolutions": [
          4
        ]
      },
      {
        "id": "sns:effect:colisao-de-ondas",
        "name": "Colisão de Ondas",
        "min": 6,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:areia-especial",
        "name": "Areia Especial",
        "min": 2,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:areia-suspensa",
        "name": "Areia Suspensa",
        "min": 5,
        "evolutions": []
      },
      {
        "id": "sns:effect:prisao-de-areia",
        "name": "Prisão De Areia",
        "min": 5,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:areia-selada",
        "name": "Areia Selada",
        "min": 3,
        "evolutions": []
      },
      {
        "id": "sns:effect:manto-de-areia-de-ferro",
        "name": "Manto De Areia De Ferro",
        "min": 3,
        "evolutions": []
      },
      {
        "id": "sns:effect:membros-de-ferro",
        "name": "Membros De Ferro",
        "min": 4,
        "evolutions": [
          6,
          8,
          10
        ]
      },
      {
        "id": "sns:effect:areia-de-ferro-venenosa",
        "name": "Areia De Ferro Venenosa",
        "min": 6,
        "evolutions": []
      }
    ]
  },
  "sns:power:shakuton": {
    "id": "sns:power:shakuton",
    "mode": "effects",
    "base": null,
    "allowed": [
      "canhao",
      "orbe",
      "raio",
      "flechas",
      "coluna",
      "energizar",
      "nuvem",
      "sopro-destrutivo",
      "missil",
      "onda-explosiva",
      "meteoros"
    ],
    "extra": [
      "kajousatsu"
    ],
    "mandatory": [],
    "grants": [
      "katon",
      "fuuton"
    ],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 2,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F04",
      "pages": [
        122,
        123,
        124
      ],
      "bodySha256": "41f2c00411f5009a185c52068b8d09d2e0070bf97db2c58e4ccf6023af095571"
    },
    "effects": [
      {
        "id": "sns:effect:canhao",
        "name": "Canhão",
        "min": 1,
        "evolutions": []
      },
      {
        "id": "sns:effect:orbe",
        "name": "Orbe",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:raio",
        "name": "Raio",
        "min": 2,
        "evolutions": [
          5,
          8
        ]
      },
      {
        "id": "sns:effect:flechas",
        "name": "Flechas",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:coluna",
        "name": "Coluna",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:energizar",
        "name": "Energizar",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:nuvem",
        "name": "Nuvem",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:sopro-destrutivo",
        "name": "Sopro Destrutivo",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:missil",
        "name": "Míssil",
        "min": 5,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:onda-explosiva",
        "name": "Onda Explosiva",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:meteoros",
        "name": "Meteoros",
        "min": 9,
        "evolutions": []
      },
      {
        "id": "sns:effect:kajousatsu",
        "name": "Kajousatsu",
        "min": 3,
        "evolutions": []
      }
    ]
  },
  "sns:power:shouton": {
    "id": "sns:power:shouton",
    "mode": "effects",
    "base": "ninpou",
    "allowed": null,
    "extra": [
      "imergir",
      "pele-de-pedra",
      "esfera-de-cristal",
      "prisao-cristalina",
      "prisma",
      "aprimorar-tecnica",
      "labirinto"
    ],
    "mandatory": [],
    "grants": [
      "doton"
    ],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 1
    },
    "source": {
      "id": "F04",
      "pages": [
        125,
        126,
        127
      ],
      "bodySha256": "9a562c2ae70ebcab687dbbcb84099433e7f397451fc7248347c0a859122e8b76"
    },
    "effects": [
      {
        "id": "sns:effect:imergir",
        "name": "Imergir",
        "min": 2,
        "evolutions": [
          4
        ]
      },
      {
        "id": "sns:effect:pele-de-pedra",
        "name": "Pele de Pedra",
        "min": 6,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:esfera-de-cristal",
        "name": "Esfera De Cristal",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:prisao-cristalina",
        "name": "Prisão Cristalina",
        "min": 6,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:prisma",
        "name": "Prisma",
        "min": 7,
        "evolutions": []
      },
      {
        "id": "sns:effect:aprimorar-tecnica",
        "name": "Aprimorar Técnica",
        "min": 8,
        "evolutions": []
      },
      {
        "id": "sns:effect:labirinto",
        "name": "Labirinto",
        "min": 10,
        "evolutions": []
      }
    ]
  },
  "sns:power:ototon": {
    "id": "sns:power:ototon",
    "mode": "effects",
    "base": null,
    "allowed": [
      "canhao",
      "orbe",
      "raio",
      "barreira",
      "ricochete",
      "coluna",
      "flechas",
      "sopro-destrutivo",
      "correnteza",
      "missil",
      "onda-explosiva"
    ],
    "extra": [
      "sons-de-guizo",
      "explosao-sonora",
      "badalar-do-sino"
    ],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "esp",
      "rangeBase": 5,
      "rangeFactor": 1,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 1
    },
    "source": {
      "id": "F04",
      "pages": [
        51,
        52,
        53
      ],
      "bodySha256": "a92b8e2fa7fdd8db134c48d2902473b7a96a5add54f21bddea24bb797d19870a"
    },
    "effects": [
      {
        "id": "sns:effect:canhao",
        "name": "Canhão",
        "min": 1,
        "evolutions": []
      },
      {
        "id": "sns:effect:orbe",
        "name": "Orbe",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:raio",
        "name": "Raio",
        "min": 2,
        "evolutions": [
          5,
          8
        ]
      },
      {
        "id": "sns:effect:barreira",
        "name": "Barreira",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:ricochete",
        "name": "Ricochete",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:coluna",
        "name": "Coluna",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:flechas",
        "name": "Flechas",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:sopro-destrutivo",
        "name": "Sopro Destrutivo",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:correnteza",
        "name": "Correnteza",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:missil",
        "name": "Míssil",
        "min": 5,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:onda-explosiva",
        "name": "Onda Explosiva",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:sons-de-guizo",
        "name": "Sons De Guizo",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:explosao-sonora",
        "name": "Explosão Sonora",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:badalar-do-sino",
        "name": "Badalar Do Sino",
        "min": 6,
        "evolutions": [
          8,
          10
        ]
      }
    ]
  },
  "sns:power:kujaku-myoho": {
    "id": "sns:power:kujaku-myoho",
    "mode": "effects",
    "base": null,
    "allowed": [
      "canhao",
      "criar-arma",
      "orbe",
      "raio",
      "barreira",
      "flechas",
      "lanca",
      "ricochete",
      "coluna",
      "energizar",
      "sopro-destrutivo",
      "correnteza",
      "missil",
      "onda-explosiva",
      "algemar",
      "meteoros"
    ],
    "extra": [
      "voo"
    ],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 2,
      "damageBonus": 1,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F04",
      "pages": [
        16,
        17
      ],
      "bodySha256": "f3a82c19ec3fdc55207ae972794a67b417f3bdd311e9313677bef9683244a555"
    },
    "reserve": "health",
    "effects": [
      {
        "id": "sns:effect:canhao",
        "name": "Canhão",
        "min": 1,
        "evolutions": []
      },
      {
        "id": "sns:effect:criar-arma",
        "name": "Criar Arma",
        "min": 2,
        "evolutions": [
          6
        ]
      },
      {
        "id": "sns:effect:orbe",
        "name": "Orbe",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:raio",
        "name": "Raio",
        "min": 2,
        "evolutions": [
          5,
          8
        ]
      },
      {
        "id": "sns:effect:barreira",
        "name": "Barreira",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:flechas",
        "name": "Flechas",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:lanca",
        "name": "Lança",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:ricochete",
        "name": "Ricochete",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:coluna",
        "name": "Coluna",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:energizar",
        "name": "Energizar",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:sopro-destrutivo",
        "name": "Sopro Destrutivo",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:correnteza",
        "name": "Correnteza",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:missil",
        "name": "Míssil",
        "min": 5,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:onda-explosiva",
        "name": "Onda Explosiva",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:algemar",
        "name": "Algemar",
        "min": 6,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:meteoros",
        "name": "Meteoros",
        "min": 9,
        "evolutions": []
      },
      {
        "id": "sns:effect:voo",
        "name": "Voo",
        "min": 4,
        "evolutions": [
          7
        ]
      }
    ]
  },
  "sns:power:hb-f05-tenmon-ninpou": {
    "id": "sns:power:hb-f05-tenmon-ninpou",
    "mode": "effects",
    "base": null,
    "allowed": [
      "canhao",
      "orbe",
      "raio",
      "barreira",
      "lanca",
      "ricochete",
      "coluna",
      "energizar",
      "missil",
      "onda-explosiva",
      "algemar"
    ],
    "extra": [
      "hb-f05-lamina-estelar",
      "hb-f05-constelacao-viva",
      "hb-f05-chuva-de-meteoros"
    ],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "esp",
      "rangeBase": 5,
      "rangeFactor": 1,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F05",
      "pages": [
        23,
        24
      ],
      "bodySha256": "cf4bfaeeb62a16542f8d6458d1f9dff9e09ea4f13b2c555e3174ec362d102e64"
    },
    "effects": [
      {
        "id": "sns:effect:canhao",
        "name": "Canhão",
        "min": 1,
        "evolutions": []
      },
      {
        "id": "sns:effect:orbe",
        "name": "Orbe",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:raio",
        "name": "Raio",
        "min": 2,
        "evolutions": [
          5,
          8
        ]
      },
      {
        "id": "sns:effect:barreira",
        "name": "Barreira",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:lanca",
        "name": "Lança",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:ricochete",
        "name": "Ricochete",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:coluna",
        "name": "Coluna",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:energizar",
        "name": "Energizar",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:missil",
        "name": "Míssil",
        "min": 5,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:onda-explosiva",
        "name": "Onda Explosiva",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:algemar",
        "name": "Algemar",
        "min": 6,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:hb-f05-lamina-estelar",
        "name": "Lâmina Estelar",
        "min": 3,
        "evolutions": [
          6
        ]
      },
      {
        "id": "sns:effect:hb-f05-constelacao-viva",
        "name": "Constelação Viva",
        "min": 4,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:hb-f05-chuva-de-meteoros",
        "name": "Chuva De Meteoros",
        "min": 6,
        "evolutions": [
          8
        ]
      }
    ]
  },
  "sns:power:hb-f05-ito-ninpou": {
    "id": "sns:power:hb-f05-ito-ninpou",
    "mode": "effects",
    "base": null,
    "allowed": [
      "canhao",
      "orbe",
      "raio",
      "restringente",
      "repelir",
      "barreira",
      "flechas",
      "lanca",
      "energizar",
      "sopro-destrutivo",
      "cegante",
      "correnteza",
      "missil",
      "onda-explosiva",
      "algemar",
      "imergir",
      "prisao-de-agua",
      "petrificacao"
    ],
    "extra": [],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 2,
      "damageBonus": 0,
      "difficultyBonus": 1
    },
    "source": {
      "id": "F05",
      "pages": [
        45
      ],
      "bodySha256": "78969a8abdbe7a2f49f164f913af56d392f946bcef1082ecc4ad33a2a3059159"
    },
    "effects": [
      {
        "id": "sns:effect:canhao",
        "name": "Canhão",
        "min": 1,
        "evolutions": []
      },
      {
        "id": "sns:effect:orbe",
        "name": "Orbe",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:raio",
        "name": "Raio",
        "min": 2,
        "evolutions": [
          5,
          8
        ]
      },
      {
        "id": "sns:effect:restringente",
        "name": "Restringente",
        "min": 2,
        "evolutions": [
          6
        ]
      },
      {
        "id": "sns:effect:repelir",
        "name": "Repelir",
        "min": 2,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:barreira",
        "name": "Barreira",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:flechas",
        "name": "Flechas",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:lanca",
        "name": "Lança",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:energizar",
        "name": "Energizar",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:sopro-destrutivo",
        "name": "Sopro Destrutivo",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:cegante",
        "name": "Cegante",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:correnteza",
        "name": "Correnteza",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:missil",
        "name": "Míssil",
        "min": 5,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:onda-explosiva",
        "name": "Onda Explosiva",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:algemar",
        "name": "Algemar",
        "min": 6,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:imergir",
        "name": "Imergir",
        "min": 2,
        "evolutions": [
          4
        ]
      },
      {
        "id": "sns:effect:prisao-de-agua",
        "name": "Prisão de Água",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:petrificacao",
        "name": "Petrificação",
        "min": 6,
        "evolutions": [
          9
        ]
      }
    ]
  },
  "sns:power:hb-f05-kaiju-ninpou": {
    "id": "sns:power:hb-f05-kaiju-ninpou",
    "mode": "effects",
    "base": "suiton",
    "allowed": null,
    "extra": [
      "hb-f05-nevoa-abissal",
      "hb-f05-corrente-devoradora"
    ],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 2,
      "damageBonus": 1,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F05",
      "pages": [
        36
      ],
      "bodySha256": "fc6449e4ab90d93813de08df659985cf16e6e70d1fd330458254ae66abdd28f9"
    },
    "effects": [
      {
        "id": "sns:effect:hb-f05-nevoa-abissal",
        "name": "Névoa Abissal",
        "min": 4,
        "evolutions": [
          7
        ]
      },
      {
        "id": "sns:effect:hb-f05-corrente-devoradora",
        "name": "Corrente Devoradora",
        "min": 5,
        "evolutions": [
          8
        ]
      }
    ]
  },
  "sns:power:hb-f05-arte-do-sangue-vivo": {
    "id": "sns:power:hb-f05-arte-do-sangue-vivo",
    "mode": "effects",
    "base": "ninpou",
    "allowed": null,
    "extra": [
      "imergir",
      "prisao-de-agua",
      "colisao-de-ondas",
      "hb-f05-arma-de-sangue",
      "hb-f05-chuva-carmesim"
    ],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "esp",
      "rangeBase": 5,
      "rangeFactor": 1,
      "sizeFactor": 1,
      "damageBonus": 1,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F05",
      "pages": [
        68
      ],
      "bodySha256": "c866a685622bd1a32cad7c2255bdfdd6306737e76559b8e25d89f5ea5f4f0dc9"
    },
    "effects": [
      {
        "id": "sns:effect:imergir",
        "name": "Imergir",
        "min": 2,
        "evolutions": [
          4
        ]
      },
      {
        "id": "sns:effect:prisao-de-agua",
        "name": "Prisão de Água",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:colisao-de-ondas",
        "name": "Colisão de Ondas",
        "min": 6,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:hb-f05-arma-de-sangue",
        "name": "Arma De Sangue",
        "min": 5,
        "evolutions": []
      },
      {
        "id": "sns:effect:hb-f05-chuva-carmesim",
        "name": "Chuva Carmesim",
        "min": 8,
        "evolutions": []
      }
    ]
  },
  "sns:power:hb-f05-kami-ninpou": {
    "id": "sns:power:hb-f05-kami-ninpou",
    "mode": "effects",
    "base": null,
    "allowed": [
      "canhao",
      "criar-arma",
      "raio",
      "flechas",
      "sopro-destrutivo",
      "coluna",
      "lanca",
      "missil",
      "ricochete",
      "correnteza"
    ],
    "extra": [
      "hb-f05-emissario-divino"
    ],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 1,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F05",
      "pages": [
        21
      ],
      "bodySha256": "d61d630d90a12b73707629292fca7d3bb4a5dc371ca45de5d1d713d4fbcc43a9"
    },
    "inherit": "sns:power:kami-ninpou",
    "effects": [
      {
        "id": "sns:effect:canhao",
        "name": "Canhão",
        "min": 1,
        "evolutions": []
      },
      {
        "id": "sns:effect:criar-arma",
        "name": "Criar Arma",
        "min": 2,
        "evolutions": [
          6
        ]
      },
      {
        "id": "sns:effect:raio",
        "name": "Raio",
        "min": 2,
        "evolutions": [
          5,
          8
        ]
      },
      {
        "id": "sns:effect:flechas",
        "name": "Flechas",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:sopro-destrutivo",
        "name": "Sopro Destrutivo",
        "min": 4,
        "evolutions": []
      },
      {
        "id": "sns:effect:coluna",
        "name": "Coluna",
        "min": 4,
        "evolutions": [
          7,
          10
        ]
      },
      {
        "id": "sns:effect:lanca",
        "name": "Lança",
        "min": 3,
        "evolutions": [
          6,
          9
        ]
      },
      {
        "id": "sns:effect:missil",
        "name": "Míssil",
        "min": 5,
        "evolutions": [
          8,
          10
        ]
      },
      {
        "id": "sns:effect:ricochete",
        "name": "Ricochete",
        "min": 3,
        "evolutions": [
          9
        ]
      },
      {
        "id": "sns:effect:correnteza",
        "name": "Correnteza",
        "min": 5,
        "evolutions": [
          8
        ]
      },
      {
        "id": "sns:effect:hb-f05-emissario-divino",
        "name": "Emissário Divino",
        "min": 10,
        "evolutions": []
      }
    ]
  },
  "sns:power:hb-f05-teatro-da-mente": {
    "id": "sns:power:hb-f05-teatro-da-mente",
    "mode": "encenacoes",
    "base": null,
    "allowed": null,
    "extra": [],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "int",
      "rangeBase": 5,
      "rangeFactor": 1,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F05",
      "pages": [
        29,
        30,
        31,
        32,
        33
      ],
      "bodySha256": "423119f20f7787b036901417d7ca602dfaf10e30c9cf29afca264ed6e8ccf063"
    },
    "sourceSections": "sns:power:hb-f05-teatro-da-mente",
    "difficultyBase": 8,
    "costIsStage": true,
    "effects": []
  },
  "sns:power:jiongu": {
    "id": "sns:power:jiongu",
    "mode": "hearts",
    "base": null,
    "allowed": null,
    "extra": [],
    "mandatory": [],
    "grants": [],
    "profile": {
      "attribute": "esp",
      "rangeBase": 10,
      "rangeFactor": 2,
      "sizeFactor": 1,
      "damageBonus": 0,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F04",
      "pages": [
        54,
        55,
        56,
        57,
        58
      ],
      "bodySha256": "56515db2d32ecfe70aa628e717af77c2ab2a40aadee77d2f3167d9c8fb699646"
    },
    "defaultHeart": "katon",
    "effects": []
  },
  "sns:power:jinton": {
    "id": "sns:power:jinton",
    "mode": "fixed",
    "base": null,
    "allowed": null,
    "extra": [],
    "mandatory": [],
    "grants": [
      "doton",
      "fuuton",
      "katon"
    ],
    "profile": {
      "attribute": "esp",
      "rangeBase": 5,
      "rangeFactor": 1,
      "sizeFactor": 0.5,
      "damageBonus": 0,
      "difficultyBonus": 0
    },
    "source": {
      "id": "F04",
      "pages": [
        76,
        77
      ],
      "bodySha256": "086f7b7920a543609f71f658c9bf112d1d97fef0b0c23aeb496d7dc157bdeffd"
    },
    "addGrantLevel": true,
    "fixed": [
      {
        "sourceId": "sns:power:jinton",
        "title": "GENKAI HAKURI NO JUTSU",
        "minimum": 1,
        "action": "Padrão · preparar; padrão no turno seguinte · atacar",
        "cost": "level",
        "mode": "attack:cd",
        "base": "level+esp",
        "range": "5+esp",
        "diameter": "esp/2",
        "duration": "Sustentada (1 ataque)"
      }
    ],
    "effects": []
  },
  "sns:power:pergaminho-da-super-besta": {
    "id": "sns:power:pergaminho-da-super-besta",
    "mode": "drawings",
    "base": null,
    "allowed": null,
    "extra": [],
    "mandatory": [],
    "grants": [],
    "profile": null,
    "source": {
      "id": "F04",
      "pages": [
        28,
        29,
        30
      ],
      "bodySha256": "7953e65e8ed64a2149b81105892f3d164699acfef7353247a76bb21f2ac21df3"
    },
    "fixed": [
      {
        "sourceId": "sns:power:pergaminho-da-super-besta",
        "title": "Pergaminho da Super Besta",
        "minimum": 1,
        "cost": "2*level",
        "mode": "none",
        "action": "Padrão",
        "range": "Pessoal",
        "duration": "Contínua"
      }
    ],
    "effects": []
  },
  "sns:power:hb-f05-jinchuuriki-falso": {
    "id": "sns:power:hb-f05-jinchuuriki-falso",
    "mode": "falseBijuu",
    "base": null,
    "allowed": null,
    "extra": [],
    "mandatory": [],
    "grants": [],
    "profile": null,
    "source": {
      "id": "F05",
      "pages": [
        59,
        60,
        61
      ],
      "bodySha256": "0f420b83dcfbea03cdb4aeb4287f174902ff4f193bf5fa26e9929b7d7604d414"
    },
    "sourceSections": "sns:hijutsu:hb-f05-jinchuuriki-falso",
    "effects": []
  }
};
