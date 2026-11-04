// Individually headed purchases from T03; no grant by prose or traits.
export const RELATED_ACQUISITION_RULES={
  "sns:apt:kikaichuu": {
    "name": "Kikaichuu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 143, 144",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "aburame"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "lidar_com_animais",
        "min": 1,
        "label": "Nível de Lidar com Animais"
      }
    ]
  },
  "sns:apt:shokaichuu": {
    "name": "Shōkaichuu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 144, 145",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "aburame"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "lidar_com_animais",
        "min": 6,
        "label": "Nível de Lidar com Animais"
      },
      {
        "kind": "owned",
        "id": "sns:apt:kikaichuu",
        "label": "Kikaichuu"
      }
    ]
  },
  "sns:apt:kidaichuu": {
    "name": "Kidaichuu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 145, 146",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "aburame"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "lidar_com_animais",
        "min": 12,
        "label": "Nível de Lidar com Animais"
      },
      {
        "kind": "owned",
        "id": "sns:apt:kikaichuu",
        "label": "Kikaichuu"
      }
    ]
  },
  "sns:apt:rinkaichuu": {
    "name": "Rinkaichuu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 146",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "aburame"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "lidar_com_animais",
        "min": 12,
        "label": "Nível de Lidar com Animais"
      },
      {
        "kind": "owned",
        "id": "sns:apt:kikaichuu",
        "label": "Kikaichuu"
      }
    ]
  },
  "sns:power:kikai-ninpou": {
    "name": "Kikai Ninpou",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 147, 148",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "aburame"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Kikaichuu (aptidão)"
      }
    ]
  },
  "sns:apt:corpulencia": {
    "name": "Corpulência",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 150, 151",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "akimichi"
          }
        ]
      }
    ]
  },
  "sns:apt:resiliencia": {
    "name": "Resiliência",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 151",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "akimichi"
          }
        ]
      }
    ]
  },
  "sns:power:baika-ninpou": {
    "name": "Baika Ninpou",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 151, 152, 153",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "akimichi"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Vigor 6; Corpulência (Aptidão)"
      }
    ]
  },
  "sns:apt:controle-de-caloria": {
    "name": "Controle de Caloria",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 153, 154, 155",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "akimichi"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "vig",
        "min": 14,
        "label": "Vigor"
      },
      {
        "kind": "owned",
        "id": "sns:apt:corpulencia",
        "label": "Corpulência"
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-resiliencia",
        "label": "Resiliência"
      }
    ]
  },
  "sns:apt:sanshoku-no-ganyaku": {
    "name": "Sanshoku no Gan’yaku",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 155",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "akimichi"
          }
        ]
      }
    ]
  },
  "sns:apt:byakugan": {
    "name": "Byakugan",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 157, 158",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hyuuga"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "per",
        "min": 1,
        "label": "Percepção"
      }
    ]
  },
  "sns:apt:tenketsu-byakugan": {
    "name": "Tenketsu Byakugan",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 158, 159",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hyuuga"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:byakugan",
        "label": "Byakugan"
      },
      {
        "kind": "skillLevel",
        "key": "procurar",
        "min": 7,
        "label": "Nível de Procurar"
      },
      {
        "kind": "skillLevel",
        "key": "prontidao",
        "min": 7,
        "label": "Nível de Prontidão"
      },
      {
        "kind": "skillLevel",
        "key": "rastrear",
        "min": 7,
        "label": "Nível de Rastrear"
      }
    ]
  },
  "sns:power:juuken": {
    "name": "Juuken",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 159, 160, 161, 162",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hyuuga"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 1,
        "label": "Espírito"
      },
      {
        "kind": "owned",
        "id": "sns:apt:byakugan",
        "label": "Byakugan"
      },
      {
        "kind": "owned",
        "id": "sns:apt:acuidade",
        "label": "Acuidade"
      }
    ]
  },
  "sns:apt:companheiro-animal": {
    "name": "Companheiro Animal",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 163, 164",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "inuzuka"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "lidar_com_animais",
        "min": 1,
        "label": "Nível de Lidar com Animais"
      }
    ]
  },
  "sns:apt:hakken-no-jutsu": {
    "name": "Hakken no Jutsu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 164, 165",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "inuzuka"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "rastrear",
        "min": 1,
        "label": "Nível de Rastrear"
      }
    ]
  },
  "sns:power:shikakyu": {
    "name": "Shikakyu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 165, 166, 167",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "inuzuka"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Hakken no Jutsu (aptidão)"
      }
    ]
  },
  "sns:power:kagejutsu": {
    "name": "Kagejutsu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 168, 169, 170, 171, 172, 173",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "nara"
          }
        ]
      }
    ]
  },
  "sns:apt:vontade-do-fogo": {
    "name": "Vontade do Fogo",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 174",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "sarutobi"
          },
          {
            "kind": "access",
            "key": "tensai"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Tensai (Hijutsu), Vigor 6, Resistência Maior (Vigor) e Clone Verdadeiro (Kage Bunshin)."
      }
    ]
  },
  "sns:power:mokuton": {
    "name": "Mokuton",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 175, 176, 177, 178",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "senju"
          },
          {
            "kind": "access",
            "key": "zetsu-seitai"
          }
        ]
      }
    ]
  },
  "sns:apt:maximizar": {
    "name": "Maximizar",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 175",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "senju"
          },
          {
            "kind": "access",
            "key": "kekkei-touta-jinton"
          },
          {
            "kind": "access",
            "key": "tensai"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Espírito ou Inteligência 15; Potencializar (aptidão)"
      }
    ]
  },
  "sns:apt:mangekyou-sharingan": {
    "name": "Mangekyou Sharingan",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 183, 184",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "uchiha"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "per",
        "min": 16,
        "label": "Percepção"
      },
      {
        "kind": "owned",
        "id": "sns:apt:sandan-sharingan",
        "label": "Sandan Sharingan"
      },
      {
        "kind": "pending",
        "label": "um evento traumático"
      }
    ]
  },
  "sns:apt:regeneracao": {
    "name": "Regeneração",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 193",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kaguya"
          },
          {
            "kind": "access",
            "key": "senju"
          },
          {
            "kind": "access",
            "key": "uzumaki"
          },
          {
            "kind": "access",
            "key": "jashin-juusha"
          }
        ]
      }
    ]
  },
  "sns:apt:chakra-expandido": {
    "name": "Chakra Expandido",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 193",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hoshigaki"
          },
          {
            "kind": "access",
            "key": "hoshigakure"
          },
          {
            "kind": "access",
            "key": "uzumaki"
          }
        ]
      }
    ]
  },
  "sns:apt:mil-clones": {
    "name": "Mil Clones",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 193, 194, 195",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "uzumaki"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Espírito 10; Chakra Expandido; Clone nível 2; Clone Verdadeiro (Kage Bunshin)."
      }
    ]
  },
  "sns:apt:kongou-fuusa": {
    "name": "Kongou Fuusa",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 195, 196",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "uzumaki"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 14,
        "label": "Espírito"
      }
    ]
  },
  "sns:power:shindenshin": {
    "name": "Shindenshin",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 196, 197, 198, 199, 200, 201",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "yamanaka"
          }
        ]
      }
    ]
  },
  "sns:power:dokujutsu": {
    "name": "Dokujutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 9, 10, 11",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "dokujutsu"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Venefício 4; Químico (aptidão)"
      }
    ]
  },
  "sns:power:hachimon-tonkou": {
    "name": "Hachimon Tonkou",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 202, 203, 204, 205, 206, 207",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hachimon-tonkou"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "vig",
        "min": 6,
        "label": "Vigor"
      }
    ]
  },
  "sns:apt:estilo-da-lotus": {
    "name": "Estilo da Lótus",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 207",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hachimon-tonkou"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Hachimon 1"
      }
    ]
  },
  "sns:power:hibon-ninpou": {
    "name": "Hibon Ninpou",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 212",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hibon-ninpou"
          },
          {
            "kind": "access",
            "key": "tensai"
          }
        ]
      }
    ]
  },
  "sns:apt:ilusao-fluida": {
    "name": "Ilusão Fluida",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 238",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "magen"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 12,
        "label": "Inteligência"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:magen",
        "min": 6,
        "label": "Magen"
      }
    ]
  },
  "sns:apt:talento-natural": {
    "name": "Talento Natural",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 243",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "tensai"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Inteligência ou Espírito 6"
      }
    ]
  },
  "sns:apt:tecnica-avancada": {
    "name": "Técnica Avançada",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 243",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "tensai"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Atender aos requisitos das  recebidas"
      }
    ]
  },
  "sns:apt:capacidade": {
    "name": "Capacidade",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 244",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "tensai"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 8,
        "label": "Espírito"
      }
    ]
  },
  "sns:apt:controle-perfeito": {
    "name": "Controle Perfeito",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 244",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "tensai"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 8,
        "label": "Inteligência"
      }
    ]
  },
  "sns:apt:instinto-de-batalha": {
    "name": "Instinto de Batalha",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 244",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "buki-senmon"
          },
          {
            "kind": "access",
            "key": "tensai"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Destreza ou Agilidade 8"
      }
    ]
  },
  "sns:apt:deus-do-trovao": {
    "name": "Deus do Trovão",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 244, 245, 246, 247",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "tensai"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 8,
        "label": "Fuuinjutsu"
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 14,
        "label": "Inteligência"
      }
    ]
  },
  "sns:apt:demonio-do-vento": {
    "name": "Demônio do Vento",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 7",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "fuuma"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Tensai (Hijutsu)."
      }
    ]
  },
  "sns:apt:predador-aquatico": {
    "name": "Predador Aquático",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 8",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hoshigaki"
          }
        ]
      }
    ]
  },
  "sns:apt:elemento-natural-suiton": {
    "name": "Elemento Natural: Suiton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 8, 9",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hoshigaki"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-predador-aquatico",
        "label": "Predador Aquático"
      },
      {
        "kind": "pending",
        "label": "Suiton 1"
      }
    ]
  },
  "sns:apt:reserva-de-agua": {
    "name": "Reserva de Água",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 9",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hoshigaki"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 9,
        "label": "Espírito"
      },
      {
        "kind": "owned",
        "id": "sns:apt:dominio-da-agua",
        "label": "Domínio da Água"
      },
      {
        "kind": "pending",
        "label": "Suiton 5; Elemento Natural"
      }
    ]
  },
  "sns:apt:lamina-da-lua": {
    "name": "Lâmina da Lua",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 18",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "yotsuki"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Tensai (Hijutsu)."
      }
    ]
  },
  "sns:power:hyouton": {
    "name": "Hyouton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 19, 20, 21",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "yuki"
          }
        ]
      }
    ]
  },
  "sns:apt:selos-especiais": {
    "name": "Selos Especiais",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 18",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "yuki"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 8,
        "label": "Destreza"
      }
    ]
  },
  "sns:apt:congelamento": {
    "name": "Congelamento",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 19",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "yuki"
          },
          {
            "kind": "access",
            "key": "shouton"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hyouton",
        "min": 6,
        "label": "Hyouton"
      }
    ]
  },
  "sns:jutsu:aoi-katon": {
    "name": "Aoi Katon",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 35, 36",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "aoi-katon-independente"
          },
          {
            "kind": "access",
            "key": "nibi-aoi-katon"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:jinchuuriki",
        "min": 1,
        "label": "Jinchuuriki"
      }
    ]
  },
  "sns:jutsu:nekozume": {
    "name": "Nekozume",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 35",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "aoi-katon-independente"
          },
          {
            "kind": "access",
            "key": "nibi-aoi-katon"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:jinchuuriki",
        "min": 4,
        "label": "Jinchuuriki"
      }
    ]
  },
  "sns:jutsu:sanbi-suiton": {
    "name": "Sanbi Suiton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 37",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "sanbi-sanbi-suiton"
          },
          {
            "kind": "access",
            "key": "sanbi-suiton-independente"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:jinchuuriki",
        "min": 1,
        "label": "Jinchuuriki"
      }
    ]
  },
  "sns:jutsu:sangosho": {
    "name": "Sangoshō",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 37",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "sanbi-sanbi-suiton"
          },
          {
            "kind": "access",
            "key": "sanbi-suiton-independente"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Modo Bijuu; Junchuuriki nível 4"
      }
    ]
  },
  "sns:jutsu:gobi-futton": {
    "name": "Gobi Futton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 41, 42, 43",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "gobi-futton-independente"
          },
          {
            "kind": "access",
            "key": "gobi-gobi-futton"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:jinchuuriki",
        "min": 2,
        "label": "Jinchuuriki"
      }
    ]
  },
  "sns:jutsu:armadura-a-vapor": {
    "name": "Armadura a Vapor",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 43",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "gobi-futton-independente"
          },
          {
            "kind": "access",
            "key": "gobi-gobi-futton"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:usar-armaduras-pesadas",
        "label": "Usar Armaduras Pesadas"
      },
      {
        "kind": "pending",
        "label": "Força 10 ou Vigor 15"
      }
    ]
  },
  "sns:jutsu:casulo": {
    "name": "Casulo",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 48",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "nanabi"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:jinchuuriki",
        "min": 9,
        "label": "Jinchuuriki"
      }
    ]
  },
  "sns:power:sakin": {
    "name": "Sakin",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 66, 67, 68",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jiton"
          }
        ]
      }
    ]
  },
  "sns:apt:peso-do-ouro": {
    "name": "Peso do Ouro",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 64, 65",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jiton"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:sakin",
        "min": 5,
        "label": "Sakin"
      }
    ]
  },
  "sns:power:satetsu": {
    "name": "Satetsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 68, 69, 70",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jiton"
          }
        ]
      }
    ]
  },
  "sns:apt:marca-de-ferro": {
    "name": "Marca de Ferro",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 65",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jiton"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:satetsu",
        "min": 5,
        "label": "Satetsu"
      }
    ]
  },
  "sns:apt:shikigami-no-mai": {
    "name": "Shikigami no Mai",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 60, 61",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kamijutsu"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hb-f05-kami-ninpou",
        "min": 4,
        "label": "Kami Ninpou"
      },
      {
        "kind": "pending",
        "label": "Arte ou Espírito 9"
      }
    ]
  },
  "sns:apt:rinnegan": {
    "name": "Rinnegan",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 65, 66, 67",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "rinnegan"
          }
        ]
      }
    ]
  },
  "sns:apt:shurado": {
    "name": "Shurado",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 67",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "rinnegan"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:rinnegan",
        "label": "Rinnegan"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 12,
        "label": "Nível de Ocultismo"
      },
      {
        "kind": "skillLevel",
        "key": "mecanismos",
        "min": 12,
        "label": "Nível de Mecanismos"
      }
    ]
  },
  "sns:apt:jigokudo": {
    "name": "Jigokudo",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 67, 68",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "rinnegan"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:rinnegan",
        "label": "Rinnegan"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 12,
        "label": "Nível de Ocultismo"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 12,
        "label": "Espírito"
      }
    ]
  },
  "sns:apt:ningendo": {
    "name": "Ningendo",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 68",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "rinnegan"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:rinnegan",
        "label": "Rinnegan"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 14,
        "label": "Nível de Ocultismo"
      },
      {
        "kind": "skillLevel",
        "key": "concentracao",
        "min": 12,
        "label": "Nível de Concentração"
      }
    ]
  },
  "sns:apt:gakido": {
    "name": "Gakido",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 68, 69",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "rinnegan"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:rinnegan",
        "label": "Rinnegan"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 14,
        "label": "Nível de Ocultismo"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 14,
        "label": "Espírito"
      }
    ]
  },
  "sns:apt:chikushodo": {
    "name": "Chikushodo",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 69, 70, 71",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "rinnegan"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:rinnegan",
        "label": "Rinnegan"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 16,
        "label": "Nível de Ocultismo"
      },
      {
        "kind": "pending",
        "label": "Rinne Ninpou 7"
      }
    ]
  },
  "sns:apt:tendo": {
    "name": "Tendo",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 71, 72, 73",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "rinnegan"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:rinnegan",
        "label": "Rinnegan"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 16,
        "label": "Nível de Ocultismo"
      },
      {
        "kind": "pending",
        "label": "Rinne Ninpou 8"
      }
    ]
  },
  "sns:apt:gedo": {
    "name": "Gedo",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 73, 74, 75",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "rinnegan"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:rinnegan",
        "label": "Rinnegan"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 18,
        "label": "Nível de Ocultismo"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 18,
        "label": "Espírito"
      }
    ]
  },
  "sns:power:senninka": {
    "name": "Senninka",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 79",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "senninka"
          }
        ]
      }
    ]
  },
  "sns:apt:disparos-sujos": {
    "name": "Disparos Sujos",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 15",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "saika-ikki"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 3,
        "label": "Inteligência"
      },
      {
        "kind": "pending",
        "label": "Especialista: Armas de Fogo; Combate à Distância 11"
      }
    ]
  },
  "sns:apt:recarga-precisa": {
    "name": "Recarga Precisa",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 15",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "saika-ikki"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 9,
        "label": "Destreza"
      },
      {
        "kind": "owned",
        "id": "sns:apt:usar-polvora",
        "label": "Usar Pólvora"
      },
      {
        "kind": "owned",
        "id": "sns:apt:saque-rapido",
        "label": "Saque Rápido"
      }
    ]
  },
  "sns:apt:gun-fu": {
    "name": "Gun Fu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 15, 16",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "saika-ikki"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 11,
        "label": "Destreza"
      },
      {
        "kind": "owned",
        "id": "sns:apt:guerreiro",
        "label": "Guerreiro"
      },
      {
        "kind": "pending",
        "label": "Especialista: Armas de Fogo"
      }
    ]
  },
  "sns:apt:mira-vital": {
    "name": "Mira Vital",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 16",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "saika-ikki"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 12,
        "label": "Destreza"
      },
      {
        "kind": "owned",
        "id": "sns:apt:mira-apurada",
        "label": "Mira Apurada"
      }
    ]
  },
  "sns:apt:armamento-pesado": {
    "name": "Armamento Pesado",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 16",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "saika-ikki"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Mecanismo 12; Especialista: Armas de Fogo"
      }
    ]
  },
  "sns:apt:atirador-agil": {
    "name": "Atirador Ágil",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 16",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "saika-ikki"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "agi",
        "min": 12,
        "label": "Agilidade"
      },
      {
        "kind": "owned",
        "id": "sns:apt:retirada-rapida",
        "label": "Retirada Rápida"
      }
    ]
  },
  "sns:apt:elemento-natural-fuuton": {
    "name": "Elemento Natural: Fuuton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 9",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "shimura"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 1,
        "label": "Espírito"
      },
      {
        "kind": "pending",
        "label": "Fuuton 1"
      }
    ]
  },
  "sns:apt:izanami": {
    "name": "Izanami",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 14",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "uchiha-izanami-e-izanagi"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:sandan-sharingan",
        "label": "Sandan Sharingan"
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 14,
        "label": "Inteligência"
      },
      {
        "kind": "pending",
        "label": "somente para PdM"
      },
      {
        "kind": "actorType",
        "types": [
          "npc"
        ],
        "label": "Exclusivo de NPC conforme a fonte"
      }
    ]
  },
  "sns:apt:izanagi": {
    "name": "Izanagi",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 12, 13, 14",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "uchiha-izanami-e-izanagi"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:sandan-sharingan",
        "label": "Sandan Sharingan"
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 14,
        "label": "Inteligência"
      },
      {
        "kind": "pending",
        "label": "somente para PdM"
      },
      {
        "kind": "actorType",
        "types": [
          "npc"
        ],
        "label": "Exclusivo de NPC conforme a fonte"
      }
    ]
  },
  "sns:apt:regeneracao-de-vigor": {
    "name": "Regeneração de Vigor",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 14, 15",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "uzumaki-chakra-da-cura"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "vig",
        "min": 1,
        "label": "Vigor"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 3,
        "label": "Espírito"
      }
    ]
  },
  "sns:power:kujaku-myoho": {
    "name": "Kujaku Myoho",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 16, 17",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hoshigakure"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:chakra-expandido",
        "label": "Chakra Expandido"
      },
      {
        "kind": "attribute",
        "key": "vig",
        "min": 1,
        "label": "Vigor"
      }
    ]
  },
  "sns:power:bakuton": {
    "name": "Bakuton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 20, 21, 22, 23",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "bakuton"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 3,
        "label": "Espírito"
      }
    ]
  },
  "sns:apt:demolicao": {
    "name": "Demolição",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 20",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "bakuton"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:bakuton",
        "min": 5,
        "label": "Bakuton"
      }
    ]
  },
  "sns:apt:usar-arma-arsenal": {
    "name": "Usar Arma: Arsenal",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 23",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "buki-senmon"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 8,
        "label": "Destreza"
      }
    ]
  },
  "sns:apt:acuidade-perfeita": {
    "name": "Acuidade Perfeita",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 24",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "buki-senmon"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 8,
        "label": "Destreza"
      },
      {
        "kind": "owned",
        "id": "sns:apt:acuidade",
        "label": "Acuidade"
      },
      {
        "kind": "owned",
        "id": "sns:apt:usar-arma-arsenal",
        "label": "Usar Arma: Arsenal"
      }
    ]
  },
  "sns:apt:arsenal-completo": {
    "name": "Arsenal Completo",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 24",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "buki-senmon"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:usar-arma-arsenal",
        "label": "Usar Arma: Arsenal"
      },
      {
        "kind": "pending",
        "label": "Criar Arma ou Fuuinjutsu 2"
      }
    ]
  },
  "sns:apt:mestre-de-manobras": {
    "name": "Mestre de Manobras",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 24, 25",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "buki-senmon"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:guerreiro",
        "label": "Guerreiro"
      },
      {
        "kind": "owned",
        "id": "sns:apt:acuidade-perfeita",
        "label": "Acuidade Perfeita"
      }
    ]
  },
  "sns:apt:arte-de-combate": {
    "name": "Arte de Combate",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 25",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "chouju-giga"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "arte",
        "min": 2,
        "label": "Nível de Arte"
      }
    ]
  },
  "sns:power:sumi-ninpou": {
    "name": "Sumi Ninpou",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 26, 27, 28",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "chouju-giga"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:arte-de-combate",
        "label": "Arte de Combate"
      }
    ]
  },
  "sns:apt:resistencia-insaciavel": {
    "name": "Resistência Insaciável",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 31",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "daikiga"
          }
        ]
      }
    ]
  },
  "sns:apt:ingestao-de-chakra": {
    "name": "Ingestão de Chakra",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 31, 32",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "daikiga"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 1,
        "label": "Espírito"
      }
    ]
  },
  "sns:apt:rakanken": {
    "name": "Rakanken",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 32",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "daikiga"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "for",
        "min": 4,
        "label": "Força"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ingestao-de-chakra",
        "label": "Ingestão de Chakra"
      },
      {
        "kind": "owned",
        "id": "sns:apt:lutador",
        "label": "Lutador"
      }
    ]
  },
  "sns:apt:terra-insaciavel": {
    "name": "Terra Insaciável",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 32, 33",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "daikiga"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Ingestão de Chakra; Doton Nv 6; Barreira Nv 3 (Doton)."
      }
    ]
  },
  "sns:apt:seis-bracos": {
    "name": "Seis Braços",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 34, 35",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "gorudogumo"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 4,
        "label": "Destreza"
      }
    ]
  },
  "sns:apt:ouro-pegajoso": {
    "name": "Ouro Pegajoso",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 35",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "gorudogumo"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 8,
        "label": "Espírito"
      },
      {
        "kind": "pending",
        "label": "Kumo Ninpou 4"
      }
    ]
  },
  "sns:apt:olho-de-aranha": {
    "name": "Olho de Aranha",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 35",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "gorudogumo"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "per",
        "min": 12,
        "label": "Percepção"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 8,
        "label": "Espírito"
      }
    ]
  },
  "sns:power:hebi-ninpou": {
    "name": "Hebi Ninpou",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 39, 40, 41",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hebinomichi"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Possessão da Serpente Branca"
      }
    ]
  },
  "sns:apt:yamata-no-jutsu": {
    "name": "Yamata no Jutsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 42, 43",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hebinomichi"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 11,
        "label": "Nível de Ocultismo"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hebi-ninpou",
        "min": 5,
        "label": "Hebi Ninpou"
      },
      {
        "kind": "pending",
        "label": "Possessão da Serpente Branca"
      }
    ]
  },
  "sns:apt:usar-armas-de-jashin": {
    "name": "Usar Armas de Jashin",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 44",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jashin-juusha"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 4,
        "label": "Nível de Ocultismo"
      },
      {
        "kind": "attribute",
        "key": "for",
        "min": 4,
        "label": "Força"
      }
    ]
  },
  "sns:apt:ritual-de-conexao": {
    "name": "Ritual de Conexão",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 45",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jashin-juusha"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 8,
        "label": "Nível de Ocultismo"
      }
    ]
  },
  "sns:apt:imortalidade": {
    "name": "Imortalidade",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 45, 46",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jashin-juusha"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:regeneracao",
        "label": "Regeneração"
      },
      {
        "kind": "owned",
        "id": "sns:apt:duro-de-matar",
        "label": "Duro de Matar"
      },
      {
        "kind": "attribute",
        "key": "vig",
        "min": 10,
        "label": "Vigor"
      }
    ]
  },
  "sns:apt:combatente-sadico": {
    "name": "Combatente Sádico",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 46",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jashin-juusha"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:usar-armas-de-jashin",
        "label": "Usar Armas de Jashin"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 12,
        "label": "Nível de Ocultismo"
      }
    ]
  },
  "sns:apt:jashinista-experiente": {
    "name": "Jashinista Experiente",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 46",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jashin-juusha"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 16,
        "label": "Nível de Ocultismo"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ritual-de-conexao",
        "label": "Ritual de Conexão"
      },
      {
        "kind": "owned",
        "id": "sns:apt:imortalidade",
        "label": "Imortalidade"
      }
    ]
  },
  "sns:power:ototon": {
    "name": "Ototon",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 51, 52, 53",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jingokuon"
          }
        ]
      }
    ]
  },
  "sns:apt:sensibilidade-auditiva": {
    "name": "Sensibilidade Auditiva",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 49, 50",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jingokuon"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "per",
        "min": 4,
        "label": "Percepção"
      }
    ]
  },
  "sns:apt:tubos-de-ar": {
    "name": "Tubos de Ar",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 50",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jingokuon"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 6,
        "label": "Destreza"
      }
    ]
  },
  "sns:apt:kyoumei-supika": {
    "name": "Kyoumei Supika",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 50, 51",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jingokuon"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Acuidade e Destreza 6; ou Força 6"
      }
    ]
  },
  "sns:apt:reverberacao": {
    "name": "Reverberação",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 51",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jingokuon"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:ototon",
        "min": 5,
        "label": "Ototon"
      }
    ]
  },
  "sns:apt:corpo-de-fios": {
    "name": "Corpo de Fios",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 58, 59",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jiongu"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 2,
        "label": "Nível de Ocultismo"
      }
    ]
  },
  "sns:power:jiongu": {
    "name": "Jiongu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 54, 55, 56, 57, 58",
    "requirements": [
      {
        "kind": "access",
        "key": "jiongu"
      },
      {
        "kind": "owned",
        "id": "sns:apt:corpo-de-fios",
        "label": "Corpo De Fios"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 3,
        "label": "Nível de Ocultismo"
      }
    ]
  },
  "sns:apt:chakra-expandido-jiongu": {
    "name": "Chakra Expandido Jiongu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 59",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jiongu"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:jiongu",
        "min": 1,
        "label": "Jiongu"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 2,
        "label": "Nível de Ocultismo"
      }
    ]
  },
  "sns:jutsu:hasukonsutoraku": {
    "name": "Hasukonsutoraku",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 62, 63",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "jiongu"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Clone (aptidão); Jiongu 2; Ao menos 2 Corações ativos"
      }
    ]
  },
  "sns:apt:kakuran-taijutsu": {
    "name": "Kakuran Taijutsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 71",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kakuran-tensai"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "acrobacia",
        "min": 12,
        "label": "Nível de Acrobacia"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ponto-cego",
        "label": "Ponto Cego"
      },
      {
        "kind": "pending",
        "label": "Força ou Destreza 12"
      }
    ]
  },
  "sns:jutsu:akurobatto": {
    "name": "Akurobatto",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 72",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kakuran-tensai"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:saque-rapido",
        "label": "Saque Rápido"
      },
      {
        "kind": "pending",
        "label": "Kakuran Taijutsu 2"
      }
    ]
  },
  "sns:power:jinton": {
    "name": "Jinton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 76, 77",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kekkei-touta-jinton"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 12,
        "label": "Espírito"
      },
      {
        "kind": "pending",
        "label": "Doton; Fuuton ou Katon 5"
      }
    ]
  },
  "sns:apt:elemento-natural-terra": {
    "name": "Elemento Natural: Terra",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 72",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kekkei-touta-jinton"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Doton 1"
      }
    ]
  },
  "sns:apt:fissao": {
    "name": "Fissão",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 73",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kekkei-touta-jinton"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 16,
        "label": "Espírito"
      },
      {
        "kind": "attribute",
        "key": "vig",
        "min": 8,
        "label": "Vigor"
      }
    ]
  },
  "sns:apt:apagar-presenca": {
    "name": "Apagar Presença",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 72, 73",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kekkei-touta-jinton"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:sensor",
        "label": "Sensor"
      },
      {
        "kind": "skillLevel",
        "key": "rastrear",
        "min": 10,
        "label": "Nível de Rastrear"
      }
    ]
  },
  "sns:apt:boca-de-moldagem": {
    "name": "Boca de Moldagem",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 80",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kibaku-nendo"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "arte",
        "min": 12,
        "label": "Nível de Arte"
      },
      {
        "kind": "pending",
        "label": "Kibaku Nendo 6"
      }
    ]
  },
  "sns:jutsu:kirikiri-mai": {
    "name": "Kirikiri Mai",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 82, 83",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kuchiyose-doninha"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Kuchiyose 6 (Doninhas); Fuuton 6; Potencializar"
      }
    ]
  },
  "sns:jutsu:dokugiri": {
    "name": "Dokugiri",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 84, 85",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kuchiyose-salamandra"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Kuchiyose 6 (Salamandra); Venefício 10"
      }
    ]
  },
  "sns:jutsu:engolimento": {
    "name": "Engolimento",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 85, 86",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kuchiyose-salamandra"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Imergir"
      }
    ]
  },
  "sns:apt:kugutsu": {
    "name": "Kugutsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 87",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kugutsu"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Mecanismos 4; Engenheiro (aptidão)"
      }
    ]
  },
  "sns:apt:estrangular": {
    "name": "Estrangular",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 97",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kugutsu"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "mecanismos",
        "min": 12,
        "label": "Nível de Mecanismos"
      },
      {
        "kind": "pending",
        "label": "Exclusivo para marionete"
      }
    ]
  },
  "sns:apt:kurohigi": {
    "name": "Kurohigi",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 97, 98",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kugutsu"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:kugutsu",
        "label": "Kugutsu"
      },
      {
        "kind": "skillLevel",
        "key": "prestidigitacao",
        "min": 6,
        "label": "Nível de Prestidigitação"
      },
      {
        "kind": "skillLevel",
        "key": "mecanismos",
        "min": 6,
        "label": "Nível de Mecanismos"
      }
    ]
  },
  "sns:apt:hitokugutsu": {
    "name": "Hitokugutsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 99",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "kugutsu"
          }
        ]
      }
    ]
  },
  "sns:apt:flautista": {
    "name": "Flautista",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 106",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "mateki"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 4,
        "label": "Inteligência"
      },
      {
        "kind": "owned",
        "id": "sns:apt:fascinar",
        "label": "Fascinar"
      }
    ]
  },
  "sns:apt:ilusoes-avancadas": {
    "name": "Ilusões Avançadas",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 106, 107",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "mateki"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "arte",
        "min": 9,
        "label": "Nível de Arte"
      },
      {
        "kind": "owned",
        "id": "sns:apt:flautista",
        "label": "Flautista"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ilusao-profunda",
        "label": "Ilusão Profunda"
      }
    ]
  },
  "sns:power:futton": {
    "name": "Futton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 112, 113, 114",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "mei-kekkei-genkai"
          }
        ]
      }
    ]
  },
  "sns:apt:futton-sufocante": {
    "name": "Futton Sufocante",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 110",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "mei-kekkei-genkai"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:futton",
        "min": 5,
        "label": "Futton"
      }
    ]
  },
  "sns:apt:dupla-linhagem": {
    "name": "Dupla Linhagem",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 110",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "mei-kekkei-genkai"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 10,
        "label": "Espírito"
      },
      {
        "kind": "pending",
        "label": "Futton ou Youton 5"
      }
    ]
  },
  "sns:apt:efeito-estroboscopio": {
    "name": "Efeito Estroboscópio",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 119",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "ranton"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Ranton 6"
      }
    ]
  },
  "sns:apt:rinbo-hengoku": {
    "name": "Rinbo: Hengoku",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 120, 121",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "rinbo-hengoku"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Rinnegan (Esta Aptidão faz parte do Hijutsu Rinnegan); Gedou (Caminho Externo); Clone Verdadeiro; Espírito 20; Ocultismo 20."
      }
    ]
  },
  "sns:power:shakuton": {
    "name": "Shakuton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 122, 123, 124",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "shakuton"
          }
        ]
      }
    ]
  },
  "sns:apt:mumificar": {
    "name": "Mumificar",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 121, 122",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "shakuton"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:shakuton",
        "min": 5,
        "label": "Shakuton"
      }
    ]
  },
  "sns:power:shouton": {
    "name": "Shouton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 125, 126, 127",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "shouton"
          }
        ]
      }
    ]
  },
  "sns:apt:cristal-guiado": {
    "name": "Cristal Guiado",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 125",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "shouton"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:shouton",
        "min": 5,
        "label": "Shouton"
      }
    ]
  },
  "sns:apt:barreira-regenerativa": {
    "name": "Barreira Regenerativa",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 124",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "shouton"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:shouton",
        "min": 5,
        "label": "Shouton"
      }
    ]
  },
  "sns:apt:cristalizacao": {
    "name": "Cristalização",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 124, 125",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "shouton"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Shouton 7; Congelamento (aptidão)."
      }
    ]
  },
  "sns:apt:mestre-dos-leques": {
    "name": "Mestre dos Leques",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 132",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "tessenjutsu"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 6,
        "label": "Destreza"
      },
      {
        "kind": "pending",
        "label": "Fuuton 3"
      }
    ]
  },
  "sns:apt:brisa-de-navalha": {
    "name": "Brisa de Navalha",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 132, 133",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "tessenjutsu"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 10,
        "label": "Espírito"
      },
      {
        "kind": "pending",
        "label": "Fuuton 5"
      }
    ]
  },
  "sns:apt:capacidade-dos-ventos": {
    "name": "Capacidade dos Ventos",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 133",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "tessenjutsu"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Espírito ou Inteligência 12"
      }
    ]
  },
  "sns:apt:clone-zetsu": {
    "name": "Clone Zetsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 135",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "zetsu-seitai"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Clone (aptidão)."
      }
    ]
  },
  "sns:apt:elementos-irrestritos": {
    "name": "Elementos Irrestritos",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 135",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "zetsu-seitai"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 10,
        "label": "Espírito"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:mokuton",
        "min": 5,
        "label": "Mokuton"
      }
    ]
  },
  "sns:power:pergaminho-da-super-besta": {
    "name": "Pergaminho da Super Besta",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 28, 29, 30",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "desenhos-pergaminho-da-super-besta"
          },
          {
            "kind": "access",
            "key": "chouju-giga"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:sumi-ninpou",
        "min": 4,
        "label": "Sumi Ninpou"
      }
    ]
  },
  "sns:apt:hb-f05-resiliencia": {
    "name": "Resiliência",
    "source": "Enciclopédia das Artes Shinobi · PDF 16, 17",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-akimichi"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-controle-de-calorias": {
    "name": "Controle de Calorias",
    "source": "Enciclopédia das Artes Shinobi · PDF 17, 18",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-akimichi"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-presa-de-prata": {
    "name": "Presa de Prata",
    "source": "Enciclopédia das Artes Shinobi · PDF 18",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-hatake"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-predador-aquatico": {
    "name": "Predador Aquático",
    "source": "Enciclopédia das Artes Shinobi · PDF 18",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-hoshigaki"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-elemento-natural-suiton": {
    "name": "Elemento Natural: Suiton",
    "source": "Enciclopédia das Artes Shinobi · PDF 18, 19",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-hoshigaki"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-predador-aquatico",
        "label": "Predador Aquático"
      },
      {
        "kind": "pending",
        "label": "Suiton 1"
      }
    ]
  },
  "sns:apt:hb-f05-reserva-de-agua": {
    "name": "Reserva de Água",
    "source": "Enciclopédia das Artes Shinobi · PDF 19",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-hoshigaki"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-vontade-do-fogo": {
    "name": "Vontade do Fogo",
    "source": "Enciclopédia das Artes Shinobi · PDF 19",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-sarutobi"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-shikigami-no-mai": {
    "name": "Shikigami no Mai",
    "source": "Enciclopédia das Artes Shinobi · PDF 20, 21",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-kamijutsu"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hb-f05-kami-ninpou",
        "min": 4,
        "label": "Kami Ninpou"
      },
      {
        "kind": "pending",
        "label": "Arte ou Espírito 9"
      }
    ]
  },
  "sns:power:hb-f05-kami-ninpou": {
    "name": "Kami Ninpou",
    "source": "Enciclopédia das Artes Shinobi · PDF 21",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-kamijutsu"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-ilusoes-avancadas": {
    "name": "Ilusões Avançadas",
    "source": "Enciclopédia das Artes Shinobi · PDF 22",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-mateki"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-marca-estelar": {
    "name": "Marca Estelar",
    "source": "Enciclopédia das Artes Shinobi · PDF 23",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-amahoshi"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 8,
        "label": "Espírito"
      }
    ]
  },
  "sns:power:hb-f05-tenmon-ninpou": {
    "name": "Tenmon Ninpou",
    "source": "Enciclopédia das Artes Shinobi · PDF 23, 24",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-amahoshi"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-corpo-condutor": {
    "name": "Corpo Condutor",
    "source": "Enciclopédia das Artes Shinobi · PDF 25, 26",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-kaminari"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-elemento-natural-raiton": {
    "name": "Elemento Natural: Raiton",
    "source": "Enciclopédia das Artes Shinobi · PDF 26",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-kaminari"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-corpo-condutor",
        "label": "Corpo Condutor"
      }
    ]
  },
  "sns:apt:hb-f05-sobrecarga": {
    "name": "Sobrecarga",
    "source": "Enciclopédia das Artes Shinobi · PDF 26",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-kaminari"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 12,
        "label": "Espírito"
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-elemento-natural-raiton",
        "label": "Elemento Natural: Raiton"
      },
      {
        "kind": "owned",
        "id": "sns:apt:potencializar",
        "label": "Potencializar"
      }
    ]
  },
  "sns:apt:hb-f05-personalidade-dividida": {
    "name": "Personalidade Dividida",
    "source": "Enciclopédia das Artes Shinobi · PDF 27, 28",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-kurama"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-ilusao-real": {
    "name": "Ilusão Real",
    "source": "Enciclopédia das Artes Shinobi · PDF 29",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-kurama"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hb-f05-teatro-da-mente",
        "min": 3,
        "label": "Teatro da Mente"
      }
    ]
  },
  "sns:power:hb-f05-teatro-da-mente": {
    "name": "Teatro da Mente",
    "source": "Enciclopédia das Artes Shinobi · PDF 29, 30, 31, 32, 33",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-kurama"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 4,
        "label": "Inteligência"
      },
      {
        "kind": "owned",
        "id": "sns:apt:fascinar",
        "label": "Fascinar"
      },
      {
        "kind": "owned",
        "id": "sns:apt:miragem",
        "label": "Miragem"
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-personalidade-dividida",
        "label": "Personalidade Dividida"
      }
    ]
  },
  "sns:apt:hb-f05-sangue-do-abismo": {
    "name": "Sangue do Abismo",
    "source": "Enciclopédia das Artes Shinobi · PDF 34, 35",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-namizuka"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-modo-abissal": {
    "name": "Modo Abissal",
    "source": "Enciclopédia das Artes Shinobi · PDF 35",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-namizuka"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-sangue-do-abismo",
        "label": "Sangue do Abismo"
      },
      {
        "kind": "attribute",
        "key": "vig",
        "min": 8,
        "label": "Vigor"
      },
      {
        "kind": "pending",
        "label": "Suiton 4 ou Kaiju Ninpou 4"
      }
    ]
  },
  "sns:apt:hb-f05-monstro-marinho": {
    "name": "Monstro Marinho",
    "source": "Enciclopédia das Artes Shinobi · PDF 35, 36",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-namizuka"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-modo-abissal",
        "label": "Modo Abissal"
      },
      {
        "kind": "attribute",
        "key": "vig",
        "min": 12,
        "label": "Vigor"
      },
      {
        "kind": "pending",
        "label": "Suiton 6 ou Kaiju Ninpou 6"
      }
    ]
  },
  "sns:power:hb-f05-kaiju-ninpou": {
    "name": "Kaiju Ninpou",
    "source": "Enciclopédia das Artes Shinobi · PDF 36",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-namizuka"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-sangue-do-abismo",
        "label": "Sangue do Abismo"
      }
    ]
  },
  "sns:apt:hb-f05-dominio-elemental": {
    "name": "Domínio Elemental",
    "source": "Enciclopédia das Artes Shinobi · PDF 38",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-ryuusei"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 8,
        "label": "Espírito"
      },
      {
        "kind": "pending",
        "label": "Elemento Nível 4"
      }
    ]
  },
  "sns:apt:hb-f05-caminho-dos-cinco-fluxos": {
    "name": "Caminho dos Cinco Fluxos",
    "source": "Enciclopédia das Artes Shinobi · PDF 38, 39",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-ryuusei"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:tecnica-acelerada",
        "label": "Técnica Acelerada"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 10,
        "label": "Espírito"
      },
      {
        "kind": "pending",
        "label": "dois Elementos Nível 5; Aptidão de Domínio Elemental do Elemento principal do Caminho"
      }
    ]
  },
  "sns:apt:hb-f05-controle-do-fogo": {
    "name": "Controle do Fogo",
    "source": "Enciclopédia das Artes Shinobi · PDF 40",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-seryuu-seiryuu"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:chakra-expandido",
        "label": "Chakra Expandido"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 4,
        "label": "Espírito"
      }
    ]
  },
  "sns:apt:hb-f05-postura-de-gato": {
    "name": "Postura de Gato",
    "source": "Enciclopédia das Artes Shinobi · PDF 40, 41",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-seryuu-seiryuu"
          }
        ]
      },
      {
        "kind": "skillLevel",
        "key": "rastrear",
        "min": 4,
        "label": "Nível de Rastrear"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 1,
        "label": "Espírito"
      }
    ]
  },
  "sns:apt:hb-f05-garras-de-gato": {
    "name": "Garras de Gato",
    "source": "Enciclopédia das Artes Shinobi · PDF 41, 42",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-seryuu-seiryuu"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 4,
        "label": "Destreza"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 1,
        "label": "Espírito"
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-postura-de-gato",
        "label": "Postura de Gato"
      }
    ]
  },
  "sns:power:hb-f05-aoi-katon": {
    "name": "Aoi Katon",
    "source": "Enciclopédia das Artes Shinobi · PDF 42",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-seryuu-seiryuu"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-controle-do-fogo",
        "label": "Controle do Fogo"
      }
    ]
  },
  "sns:apt:hb-f05-tecelao-de-batalha": {
    "name": "Tecelão de Batalha",
    "source": "Enciclopédia das Artes Shinobi · PDF 43, 44",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-shirakumo"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hb-f05-ito-ninpou",
        "min": 1,
        "label": "Ito Ninpou"
      }
    ]
  },
  "sns:apt:hb-f05-lamina-de-seda": {
    "name": "Lâmina de Seda",
    "source": "Enciclopédia das Artes Shinobi · PDF 44",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-shirakumo"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hb-f05-ito-ninpou",
        "min": 5,
        "label": "Ito Ninpou"
      }
    ]
  },
  "sns:apt:hb-f05-mestre-tecelao": {
    "name": "Mestre Tecelão",
    "source": "Enciclopédia das Artes Shinobi · PDF 44, 45",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-shirakumo"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hb-f05-ito-ninpou",
        "min": 8,
        "label": "Ito Ninpou"
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-tecelao-de-batalha",
        "label": "Tecelão de Batalha"
      }
    ]
  },
  "sns:power:hb-f05-ito-ninpou": {
    "name": "Ito Ninpou",
    "source": "Enciclopédia das Artes Shinobi · PDF 45",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-shirakumo"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-corpo-do-sabio": {
    "name": "Corpo do Sábio",
    "source": "Enciclopédia das Artes Shinobi · PDF 46, 47, 48",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-corpo-e-olhos-do-sabio"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Regeneração, Senjutsu 3 (GaS) ou Senjutsu 10, Espírito e Vigor 20, receber o Chakra do Rikudou Sennin."
      }
    ]
  },
  "sns:apt:hb-f05-olhos-do-sabio": {
    "name": "Olhos do Sábio",
    "source": "Enciclopédia das Artes Shinobi · PDF 50, 51",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-corpo-e-olhos-do-sabio"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Eien no Mangekyou Sharingan; Espírito e Percepção 20; receber o Chakra do Rikudou Sennin"
      }
    ]
  },
  "sns:apt:hb-f05-ame-no-tejikara": {
    "name": "Ame no Tejikara",
    "source": "Enciclopédia das Artes Shinobi · PDF 51, 52, 53",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-corpo-e-olhos-do-sabio"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Rinnegan (Esta Aptidão faz parte do Hijutsu Rinnegan), Gedou (Caminho Externo), Shunjutsu 3; Espírito 20; Ocultismo 20."
      }
    ]
  },
  "sns:apt:hb-f05-caligrafia-perfeita": {
    "name": "Caligrafia Perfeita",
    "source": "Enciclopédia das Artes Shinobi · PDF 54",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-fuuinshi-no-michi"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 8,
        "label": "Inteligência"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 2,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:apt:hb-f05-simbolos-vivos": {
    "name": "Símbolos Vivos",
    "source": "Enciclopédia das Artes Shinobi · PDF 54",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-fuuinshi-no-michi"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 10,
        "label": "Inteligência"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 4,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:apt:hb-f05-kaijo-no-geijutsu": {
    "name": "Kaijo no Geijutsu",
    "source": "Enciclopédia das Artes Shinobi · PDF 54",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-fuuinshi-no-michi"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 10,
        "label": "Inteligência"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 5,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:apt:hb-f05-selamento-reforcado": {
    "name": "Selamento Reforçado",
    "source": "Enciclopédia das Artes Shinobi · PDF 54, 55",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-fuuinshi-no-michi"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 16,
        "label": "Inteligência"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 8,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:apt:hb-f05-transplante-de-celulas": {
    "name": "Transplante de Células",
    "source": "Enciclopédia das Artes Shinobi · PDF 57, 58",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-heranca-do-deus-shinobi"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "vig",
        "min": 4,
        "label": "Vigor"
      }
    ]
  },
  "sns:apt:hb-f05-raizes-da-vida": {
    "name": "Raízes da Vida",
    "source": "Enciclopédia das Artes Shinobi · PDF 58",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-heranca-do-deus-shinobi"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-transplante-de-celulas",
        "label": "Transplante de Células"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:mokuton",
        "min": 4,
        "label": "Mokuton"
      }
    ]
  },
  "sns:power:hb-f05-jinchuuriki-falso": {
    "name": "Jinchuuriki Falso",
    "source": "Enciclopédia das Artes Shinobi · PDF 59, 60, 61",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-jinchuuriki-falso"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-punho-condutor": {
    "name": "Punho Condutor",
    "source": "Enciclopédia das Artes Shinobi · PDF 65",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-karada-no-shinka"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Lutador, Especialista (Ataque Desarmado), Destreza e Vigor 4"
      }
    ]
  },
  "sns:apt:hb-f05-corpo-ajustavel": {
    "name": "Corpo Ajustável",
    "source": "Enciclopédia das Artes Shinobi · PDF 65, 66",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-karada-no-shinka"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-punho-condutor",
        "label": "Punho Condutor"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ataque-multiplo",
        "label": "Ataque Múltiplo"
      },
      {
        "kind": "pending",
        "label": "Destreza e Vigor 8"
      }
    ]
  },
  "sns:apt:hb-f05-sequencia-marcial": {
    "name": "Sequência Marcial",
    "source": "Enciclopédia das Artes Shinobi · PDF 66",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-karada-no-shinka"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Crítico Aprimorado (Ataque Desarmado), Destreza 14"
      }
    ]
  },
  "sns:apt:hb-f05-sangue-perfurante": {
    "name": "Sangue Perfurante",
    "source": "Enciclopédia das Artes Shinobi · PDF 66",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-ketsumyaku-no-ogi"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hb-f05-arte-do-sangue-vivo",
        "min": 3,
        "label": "Arte do Sangue Vivo"
      }
    ]
  },
  "sns:apt:hb-f05-sangue-revitalizador": {
    "name": "Sangue Revitalizador",
    "source": "Enciclopédia das Artes Shinobi · PDF 68",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-ketsumyaku-no-ogi"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hb-f05-arte-do-sangue-vivo",
        "min": 5,
        "label": "Arte do Sangue Vivo"
      },
      {
        "kind": "owned",
        "id": "sns:apt:regeneracao",
        "label": "Regeneração"
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-sangue-perfurante",
        "label": "Sangue Perfurante"
      },
      {
        "kind": "pending",
        "label": "Domínio Hemático 1"
      }
    ]
  },
  "sns:power:hb-f05-arte-do-sangue-vivo": {
    "name": "Arte do Sangue Vivo",
    "source": "Enciclopédia das Artes Shinobi · PDF 68",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-ketsumyaku-no-ogi"
          }
        ]
      }
    ]
  },
  "sns:apt:hb-f05-percepcao-espiritual": {
    "name": "Percepção Espiritual",
    "source": "Enciclopédia das Artes Shinobi · PDF 74",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-medium"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 4,
        "label": "Inteligência"
      }
    ]
  },
  "sns:apt:hb-f05-canal-espiritual": {
    "name": "Canal Espiritual",
    "source": "Enciclopédia das Artes Shinobi · PDF 74, 75",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-medium"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 8,
        "label": "Inteligência"
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-percepcao-espiritual",
        "label": "Percepção Espiritual"
      }
    ]
  },
  "sns:power:hb-f05-telecinese": {
    "name": "Telecinese",
    "source": "Enciclopédia das Artes Shinobi · PDF 75, 76, 77",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-medium"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-canal-espiritual",
        "label": "Canal Espiritual"
      }
    ]
  },
  "sns:apt:hb-f05-azure-fang": {
    "name": "Azure Fang",
    "source": "Enciclopédia das Artes Shinobi · PDF 77, 78",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-mestre-da-agua"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 1,
        "label": "Espírito"
      }
    ]
  },
  "sns:apt:hb-f05-tenseigan": {
    "name": "Tenseigan",
    "source": "Enciclopédia das Artes Shinobi · PDF 78, 79",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-tenseigan"
          }
        ]
      },
      {
        "kind": "pending",
        "label": "Tenketsu Byakugan, Vigor e Espírito 20, Procurar 20, Prontidão 20, Rastrear 20, Resistência Maior (Espírito), Receber o Chakra de um Otsutsuki, Somente para PdM."
      },
      {
        "kind": "actorType",
        "types": [
          "npc"
        ],
        "label": "Exclusivo de NPC conforme a fonte"
      }
    ]
  },
  "sns:apt:hb-f05-manto-tenseigan": {
    "name": "Manto Tenseigan",
    "source": "Enciclopédia das Artes Shinobi · PDF 79, 80",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "access",
            "key": "hb-f05-tenseigan"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:hb-f05-tenseigan",
        "label": "Tenseigan"
      }
    ]
  }
};
export const RELATED_HOMEBREW_IDS=[
  "sns:apt:hb-f05-ame-no-tejikara",
  "sns:apt:hb-f05-azure-fang",
  "sns:apt:hb-f05-caligrafia-perfeita",
  "sns:apt:hb-f05-caminho-dos-cinco-fluxos",
  "sns:apt:hb-f05-canal-espiritual",
  "sns:apt:hb-f05-controle-de-calorias",
  "sns:apt:hb-f05-controle-do-fogo",
  "sns:apt:hb-f05-corpo-ajustavel",
  "sns:apt:hb-f05-corpo-condutor",
  "sns:apt:hb-f05-corpo-do-sabio",
  "sns:apt:hb-f05-dominio-elemental",
  "sns:apt:hb-f05-elemento-natural-raiton",
  "sns:apt:hb-f05-elemento-natural-suiton",
  "sns:apt:hb-f05-garras-de-gato",
  "sns:apt:hb-f05-ilusao-real",
  "sns:apt:hb-f05-ilusoes-avancadas",
  "sns:apt:hb-f05-kaijo-no-geijutsu",
  "sns:apt:hb-f05-lamina-de-seda",
  "sns:apt:hb-f05-manto-tenseigan",
  "sns:apt:hb-f05-marca-estelar",
  "sns:apt:hb-f05-mestre-tecelao",
  "sns:apt:hb-f05-modo-abissal",
  "sns:apt:hb-f05-monstro-marinho",
  "sns:apt:hb-f05-olhos-do-sabio",
  "sns:apt:hb-f05-percepcao-espiritual",
  "sns:apt:hb-f05-personalidade-dividida",
  "sns:apt:hb-f05-postura-de-gato",
  "sns:apt:hb-f05-predador-aquatico",
  "sns:apt:hb-f05-presa-de-prata",
  "sns:apt:hb-f05-punho-condutor",
  "sns:apt:hb-f05-raizes-da-vida",
  "sns:apt:hb-f05-reserva-de-agua",
  "sns:apt:hb-f05-resiliencia",
  "sns:apt:hb-f05-sangue-do-abismo",
  "sns:apt:hb-f05-sangue-perfurante",
  "sns:apt:hb-f05-sangue-revitalizador",
  "sns:apt:hb-f05-selamento-reforcado",
  "sns:apt:hb-f05-sequencia-marcial",
  "sns:apt:hb-f05-shikigami-no-mai",
  "sns:apt:hb-f05-simbolos-vivos",
  "sns:apt:hb-f05-sobrecarga",
  "sns:apt:hb-f05-tecelao-de-batalha",
  "sns:apt:hb-f05-tenseigan",
  "sns:apt:hb-f05-transplante-de-celulas",
  "sns:apt:hb-f05-vontade-do-fogo",
  "sns:effect:hb-f05-emissario-divino",
  "sns:power:hb-f05-aoi-katon",
  "sns:power:hb-f05-arte-do-sangue-vivo",
  "sns:power:hb-f05-ito-ninpou",
  "sns:power:hb-f05-jinchuuriki-falso",
  "sns:power:hb-f05-kaiju-ninpou",
  "sns:power:hb-f05-kami-ninpou",
  "sns:power:hb-f05-teatro-da-mente",
  "sns:power:hb-f05-telecinese",
  "sns:power:hb-f05-tenmon-ninpou"
];
export const BOOK_TECHNIQUE_CHOICES=[
  {
    "id": "sns:power:jinchuuriki",
    "label": "Jinchuuriki (Poder do Sacrifício Humano)"
  },
  {
    "id": "sns:power:kuchiyose",
    "label": "Kuchiyose (Invocação)"
  },
  {
    "id": "sns:power:versatilidade",
    "label": "Versatilidade"
  },
  {
    "id": "sns:power:ninpou",
    "label": "Ninpou (Arte Ninja)"
  },
  {
    "id": "sns:power:doton",
    "label": "Doton (Elemento Terra)"
  },
  {
    "id": "sns:power:fuuton",
    "label": "Fuuton (Elemento Vento)"
  },
  {
    "id": "sns:power:katon",
    "label": "Katon (Elemento Fogo)"
  },
  {
    "id": "sns:power:raiton",
    "label": "Raiton (Elemento Trovão)"
  },
  {
    "id": "sns:power:suiton",
    "label": "Suiton (Elemento Água)"
  },
  {
    "id": "sns:power:fuuinjutsu",
    "label": "Fuuinjutsu"
  },
  {
    "id": "sns:power:iryou-ninjutsu",
    "label": "Iryou Ninjutsu"
  },
  {
    "id": "sns:power:rasengan",
    "label": "Rasengan"
  },
  {
    "id": "sns:jutsu:clone-generico",
    "label": "Clone Genérico"
  },
  {
    "id": "sns:jutsu:iwa-bunshin",
    "label": "Iwa Bunshin"
  },
  {
    "id": "sns:jutsu:kage-bunshin",
    "label": "Kage Bunshin"
  },
  {
    "id": "sns:jutsu:mizu-bunshin",
    "label": "Mizu Bunshin"
  },
  {
    "id": "sns:jutsu:oukashou",
    "label": "Oukashou"
  },
  {
    "id": "sns:jutsu:tsuutenkyaku",
    "label": "Tsuutenkyaku"
  },
  {
    "id": "sns:jutsu:selo-de-armazenamento",
    "label": "Selo de Armazenamento"
  },
  {
    "id": "sns:jutsu:selo-de-armazenamento-maior",
    "label": "Selo de Armazenamento Maior"
  },
  {
    "id": "sns:jutsu:misshi",
    "label": "Misshi"
  },
  {
    "id": "sns:jutsu:bakudan",
    "label": "Bakudan"
  },
  {
    "id": "sns:jutsu:gensou-no-in",
    "label": "Gensou no In"
  },
  {
    "id": "sns:jutsu:wana",
    "label": "Wana"
  },
  {
    "id": "sns:jutsu:chakra-no-souin",
    "label": "Chakra no Souin"
  },
  {
    "id": "sns:jutsu:kekkai-no-in",
    "label": "Kekkai no In"
  },
  {
    "id": "sns:jutsu:shishou-fuuin",
    "label": "Shishou Fuuin"
  },
  {
    "id": "sns:jutsu:keiyaku-fuuin",
    "label": "Keiyaku Fuuin"
  },
  {
    "id": "sns:jutsu:shiki-fuujin",
    "label": "Shiki Fuujin"
  },
  {
    "id": "sns:jutsu:chakra-no-mesu",
    "label": "Chakra no Mesu"
  },
  {
    "id": "sns:jutsu:inyu-shometsu",
    "label": "Inyu Shometsu"
  },
  {
    "id": "sns:jutsu:shousen-no-jutsu",
    "label": "Shousen no Jutsu"
  },
  {
    "id": "sns:jutsu:rasengan-basico",
    "label": "Rasengan Básico"
  },
  {
    "id": "sns:jutsu:rasengan-completo",
    "label": "Rasengan Completo"
  },
  {
    "id": "sns:jutsu:oodama-rasengan",
    "label": "Oodama Rasengan"
  },
  {
    "id": "sns:jutsu:rasengan-elemental",
    "label": "Rasengan Elemental"
  },
  {
    "id": "sns:jutsu:bunshin-no-jutsu",
    "label": "Bunshin no Jutsu"
  },
  {
    "id": "sns:jutsu:henge-no-jutsu",
    "label": "Henge no Jutsu"
  },
  {
    "id": "sns:jutsu:kai",
    "label": "Kai"
  },
  {
    "id": "sns:jutsu:kawarimi-no-jutsu",
    "label": "Kawarimi no Jutsu"
  },
  {
    "id": "sns:jutsu:kinobori",
    "label": "Kinobori"
  },
  {
    "id": "sns:jutsu:shunshin-no-jutsu",
    "label": "Shunshin no Jutsu"
  },
  {
    "id": "sns:jutsu:tadayou",
    "label": "Tadayou"
  },
  {
    "id": "sns:power:magen",
    "label": "Magen"
  },
  {
    "id": "sns:jutsu:hb-f05-double-lariat",
    "label": "Double Lariat"
  },
  {
    "id": "sns:jutsu:hb-f05-mikazuki-no-mai",
    "label": "Mikazuki no Mai"
  },
  {
    "id": "sns:jutsu:hb-f05-senpou-kawazu-kumite",
    "label": "Senpou Kawazu Kumite"
  },
  {
    "id": "sns:jutsu:hb-f05-sennen-goroshi",
    "label": "Sennen Goroshi"
  },
  {
    "id": "sns:jutsu:hb-f05-uzumaki-rendan",
    "label": "Uzumaki Rendan"
  },
  {
    "id": "sns:jutsu:hb-f05-amegakure",
    "label": "Amegakure"
  },
  {
    "id": "sns:jutsu:hb-f05-bijuu-rasengan",
    "label": "Bijuu Rasengan"
  },
  {
    "id": "sns:jutsu:hb-f05-chikatsu-saisei-no-jutsu",
    "label": "Chikatsu Saisei no Jutsu"
  },
  {
    "id": "sns:jutsu:hb-f05-enton-rasenshuriken",
    "label": "Enton Rasenshuriken"
  },
  {
    "id": "sns:jutsu:hb-f05-ino-shika-chou-yooyoo",
    "label": "Ino Shika Chou Yooyoo"
  },
  {
    "id": "sns:jutsu:hb-f05-kami-no-ki",
    "label": "Kami no Ki"
  },
  {
    "id": "sns:jutsu:hb-f05-suiryuudan-no-jutsu",
    "label": "Suiryuudan no Jutsu"
  },
  {
    "id": "sns:jutsu:hb-f06-sanzengarasu-no-jutsu",
    "label": "Sanzengarasu no Jutsu"
  },
  {
    "id": "sns:jutsu:hb-f06-reika-no-jutsu",
    "label": "Reika no Jutsu"
  },
  {
    "id": "sns:jutsu:hb-f06-mikazuki-no-mai",
    "label": "Mikazuki no Mai"
  },
  {
    "id": "sns:jutsu:hb-f06-gomon-heya",
    "label": "Gomon Heya"
  },
  {
    "id": "sns:jutsu:hb-f06-sojasosai-no-jutsu",
    "label": "Sojasosai no Jutsu"
  },
  {
    "id": "sns:jutsu:hb-f06-hiraishin-cooperacao",
    "label": "Hiraishin Cooperação"
  },
  {
    "id": "sns:power:kikai-ninpou",
    "label": "Kikai Ninpou"
  },
  {
    "id": "sns:power:baika-ninpou",
    "label": "Baika Ninpou"
  },
  {
    "id": "sns:power:juuken",
    "label": "Juuken"
  },
  {
    "id": "sns:power:shikakyu",
    "label": "Shikakyu"
  },
  {
    "id": "sns:power:kagejutsu",
    "label": "Kagejutsu"
  },
  {
    "id": "sns:power:shindenshin",
    "label": "Shindenshin"
  },
  {
    "id": "sns:power:dokujutsu",
    "label": "Dokujutsu"
  },
  {
    "id": "sns:power:hachimon-tonkou",
    "label": "Hachimon Tonkou"
  },
  {
    "id": "sns:power:hibon-ninpou",
    "label": "Hibon Ninpou"
  },
  {
    "id": "sns:power:hyouton",
    "label": "Hyouton"
  },
  {
    "id": "sns:jutsu:aoi-katon",
    "label": "Aoi Katon"
  },
  {
    "id": "sns:jutsu:nekozume",
    "label": "Nekozume"
  },
  {
    "id": "sns:jutsu:sanbi-suiton",
    "label": "Sanbi Suiton"
  },
  {
    "id": "sns:jutsu:sangosho",
    "label": "Sangoshō"
  },
  {
    "id": "sns:jutsu:gobi-futton",
    "label": "Gobi Futton"
  },
  {
    "id": "sns:jutsu:armadura-a-vapor",
    "label": "Armadura a Vapor"
  },
  {
    "id": "sns:jutsu:casulo",
    "label": "Casulo"
  },
  {
    "id": "sns:power:sakin",
    "label": "Sakin"
  },
  {
    "id": "sns:power:satetsu",
    "label": "Satetsu"
  },
  {
    "id": "sns:power:senninka",
    "label": "Senninka"
  },
  {
    "id": "sns:power:kujaku-myoho",
    "label": "Kujaku Myoho"
  },
  {
    "id": "sns:power:bakuton",
    "label": "Bakuton"
  },
  {
    "id": "sns:power:sumi-ninpou",
    "label": "Sumi Ninpou"
  },
  {
    "id": "sns:power:hebi-ninpou",
    "label": "Hebi Ninpou"
  },
  {
    "id": "sns:power:ototon",
    "label": "Ototon"
  },
  {
    "id": "sns:power:jiongu",
    "label": "Jiongu"
  },
  {
    "id": "sns:jutsu:hasukonsutoraku",
    "label": "Hasukonsutoraku"
  },
  {
    "id": "sns:jutsu:akurobatto",
    "label": "Akurobatto"
  },
  {
    "id": "sns:power:jinton",
    "label": "Jinton"
  },
  {
    "id": "sns:jutsu:kirikiri-mai",
    "label": "Kirikiri Mai"
  },
  {
    "id": "sns:jutsu:dokugiri",
    "label": "Dokugiri"
  },
  {
    "id": "sns:jutsu:engolimento",
    "label": "Engolimento"
  },
  {
    "id": "sns:power:futton",
    "label": "Futton"
  },
  {
    "id": "sns:power:shakuton",
    "label": "Shakuton"
  },
  {
    "id": "sns:power:shouton",
    "label": "Shouton"
  },
  {
    "id": "sns:power:pergaminho-da-super-besta",
    "label": "Pergaminho da Super Besta"
  },
  {
    "id": "sns:power:hb-f05-kami-ninpou",
    "label": "Kami Ninpou"
  },
  {
    "id": "sns:power:hb-f05-tenmon-ninpou",
    "label": "Tenmon Ninpou"
  },
  {
    "id": "sns:power:hb-f05-teatro-da-mente",
    "label": "Teatro da Mente"
  },
  {
    "id": "sns:power:hb-f05-kaiju-ninpou",
    "label": "Kaiju Ninpou"
  },
  {
    "id": "sns:power:hb-f05-aoi-katon",
    "label": "Aoi Katon"
  },
  {
    "id": "sns:power:hb-f05-ito-ninpou",
    "label": "Ito Ninpou"
  },
  {
    "id": "sns:power:hb-f05-jinchuuriki-falso",
    "label": "Jinchuuriki Falso"
  },
  {
    "id": "sns:power:hb-f05-arte-do-sangue-vivo",
    "label": "Arte do Sangue Vivo"
  },
  {
    "id": "sns:power:hb-f05-telecinese",
    "label": "Telecinese"
  },
  {
    "id": "sns:power:mokuton",
    "label": "Mokuton"
  }
];
