// Book requirements. Numeric and owned-item checks are code; narrative procedures remain explicit.
export const LEGADO_REQUIREMENTS={
  "sns:legado:rule:expansao-cla-uchiha": {
    "name": "Expansão Clã Uchiha",
    "source": "Legado do Ódio · PDF 3",
    "requirements": []
  },
  "sns:legado:apt:elemento-natural-katon": {
    "name": "Elemento Natural: Katon",
    "source": "Legado do Ódio · PDF 3",
    "requirements": [
      {
        "kind": "eyeAccess",
        "stage": "Sharingan"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 1,
        "label": "Espírito"
      }
    ]
  },
  "sns:legado:apt:sharingan": {
    "name": "Sharingan",
    "source": "Legado do Ódio · PDF 4",
    "requirements": [
      {
        "kind": "eyeAccess",
        "stage": "Sharingan"
      },
      {
        "kind": "attribute",
        "key": "per",
        "min": 3,
        "label": "Percepção"
      }
    ]
  },
  "sns:legado:apt:nidan-sharingan": {
    "name": "Nidan Sharingan",
    "source": "Legado do Ódio · PDF 5",
    "requirements": [
      {
        "kind": "eyeAccess",
        "stage": "Nidan Sharingan"
      },
      {
        "kind": "attribute",
        "key": "per",
        "min": 6,
        "label": "Percepção"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:sharingan",
            "label": "Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:sharingan",
            "label": "Sharingan · Básico"
          }
        ]
      }
    ]
  },
  "sns:legado:apt:sandan-sharingan": {
    "name": "Sandan Sharingan",
    "source": "Legado do Ódio · PDF 5–6",
    "requirements": [
      {
        "kind": "eyeAccess",
        "stage": "Sandan Sharingan"
      },
      {
        "kind": "attribute",
        "key": "per",
        "min": 9,
        "label": "Percepção"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:nidan-sharingan",
            "label": "Nidan Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:nidan-sharingan",
            "label": "Nidan Sharingan · Básico"
          }
        ]
      }
    ]
  },
  "sns:legado:apt:mangekyo-sharingan": {
    "name": "Mangekyo Sharingan",
    "source": "Legado do Ódio · PDF 6–8",
    "requirements": [
      {
        "kind": "eyeAccess",
        "stage": "Mangekyou Sharingan"
      },
      {
        "kind": "attribute",
        "key": "per",
        "min": 16,
        "label": "Percepção"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:sandan-sharingan",
            "label": "Sandan Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:sandan-sharingan",
            "label": "Sandan Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "legadoEvent",
        "event": "trauma",
        "label": "evento traumático que desperta o Mangekyo"
      }
    ]
  },
  "sns:legado:apt:eien-mangekyo-sharingan": {
    "name": "Eien Mangekyo Sharingan",
    "source": "Legado do Ódio · PDF 8–9",
    "requirements": [
      {
        "kind": "eyeAccess",
        "stage": "Mangekyou Sharingan"
      },
      {
        "kind": "attribute",
        "key": "per",
        "min": 18,
        "label": "Percepção"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "legadoEvent",
        "event": "price",
        "label": "Ter sofrido o Preço do Ódio"
      },
      {
        "kind": "legadoEvent",
        "event": "transplant",
        "label": "Transplante do parente concluído após repouso"
      }
    ]
  },
  "sns:legado:jutsu:mimica-sharingan": {
    "name": "Mímica Sharingan",
    "source": "Legado do Ódio · PDF 9–10",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:nidan-sharingan",
            "label": "Nidan Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:nidan-sharingan",
            "label": "Nidan Sharingan · Básico"
          }
        ]
      }
    ]
  },
  "sns:legado:jutsu:hipnose-sharingan": {
    "name": "Hipnose Sharingan",
    "source": "Legado do Ódio · PDF 10–11",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:sandan-sharingan",
            "label": "Sandan Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:sandan-sharingan",
            "label": "Sandan Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:fascinar",
        "label": "Fascinar"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ilusao-profunda",
        "label": "Ilusão Profunda"
      }
    ]
  },
  "sns:legado:jutsu:amaterasu": {
    "name": "Amaterasu",
    "source": "Legado do Ódio · PDF 11–14",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:katon",
        "min": 8,
        "label": "Katon"
      },
      {
        "kind": "legadoSelected",
        "key": "amaterasu",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:kagutsuchi": {
    "name": "Kagutsuchi",
    "source": "Legado do Ódio · PDF 14–16",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:katon",
        "min": 8,
        "label": "Katon"
      },
      {
        "kind": "legadoSelected",
        "key": "kagutsuchi",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:tsukuyomi": {
    "name": "Tsukuyomi",
    "source": "Legado do Ódio · PDF 16–18",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:fascinar",
        "label": "Fascinar"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ilusao-profunda",
        "label": "Ilusão Profunda"
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 16,
        "label": "Inteligência"
      },
      {
        "kind": "legadoSelected",
        "key": "tsukuyomi",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:kamui": {
    "name": "Kamui",
    "source": "Legado do Ódio · PDF 18–19",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "legadoSelected",
        "key": "kamui",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:kamui-curto-alcance": {
    "name": "Kamui Curto Alcance",
    "source": "Legado do Ódio · PDF 19–22",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:legado:jutsu:kamui",
        "label": "Kamui"
      },
      {
        "kind": "legadoSelected",
        "key": "kamui-curto-alcance",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:kamui-longo-alcance": {
    "name": "Kamui Longo Alcance",
    "source": "Legado do Ódio · PDF 22–23",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:legado:jutsu:kamui",
        "label": "Kamui"
      },
      {
        "kind": "legadoSelected",
        "key": "kamui-longo-alcance",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:bishamonten": {
    "name": "Bishamonten",
    "source": "Legado do Ódio · PDF 23–25",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "legadoSelected",
        "key": "bishamonten",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:kisshouten": {
    "name": "Kisshouten",
    "source": "Legado do Ódio · PDF 25–27",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "legadoSelected",
        "key": "kisshouten",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:kotoamatsukami": {
    "name": "Kotoamatsukami",
    "source": "Legado do Ódio · PDF 27–28",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:fascinar",
        "label": "Fascinar"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ilusao-profunda",
        "label": "Ilusão Profunda"
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 16,
        "label": "Inteligência"
      },
      {
        "kind": "legadoSelected",
        "key": "kotoamatsukami",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:mahikami": {
    "name": "Mahikami",
    "source": "Legado do Ódio · PDF 28–29",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
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
        "kind": "legadoSelected",
        "key": "mahikami",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:hachiman": {
    "name": "Hachiman",
    "source": "Legado do Ódio · PDF 29",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "des",
        "min": 16,
        "label": "Destreza"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 16,
        "label": "Espírito"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:lutador",
            "label": "Lutador"
          },
          {
            "kind": "owned",
            "id": "sns:apt:guerreiro",
            "label": "Guerreiro"
          }
        ]
      },
      {
        "kind": "legadoSelected",
        "key": "hachiman",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:hachiman-migi": {
    "name": "Hachiman – Migi",
    "source": "Legado do Ódio · PDF 29",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:legado:jutsu:hachiman",
        "label": "Hachiman"
      },
      {
        "kind": "owned",
        "id": "sns:apt:shunjutsu-3",
        "label": "Shunjutsu · estágio 3"
      },
      {
        "kind": "legadoSelected",
        "key": "hachiman-migi",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:hachiman-hidari": {
    "name": "Hachiman – Hidari",
    "source": "Legado do Ódio · PDF 29–30",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:legado:jutsu:hachiman",
        "label": "Hachiman"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:punho-de-ferro",
            "label": "Punho de Ferro"
          },
          {
            "kind": "owned",
            "id": "sns:apt:usar-arma",
            "label": "Usar Arma"
          }
        ]
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "ownedChoice",
            "id": "sns:apt:dano-extra",
            "choice": "desarmado",
            "label": "Dano Extra: desarmado"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:dano-extra",
            "choice": "naturais",
            "label": "Dano Extra: naturais"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:dano-extra",
            "choice": "leve",
            "label": "Dano Extra: leve"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:dano-extra",
            "choice": "mediana",
            "label": "Dano Extra: mediana"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:dano-extra",
            "choice": "longa",
            "label": "Dano Extra: longa"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:dano-extra",
            "choice": "pesada",
            "label": "Dano Extra: pesada"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:dano-extra",
            "choice": "especial",
            "label": "Dano Extra: especial"
          }
        ]
      },
      {
        "kind": "effectKnown",
        "id": "sns:effect:energizar",
        "min": 3,
        "label": "Energizar aprendido"
      },
      {
        "kind": "legadoSelected",
        "key": "hachiman-hidari",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:hachiman-ketsuyoko": {
    "name": "Hachiman – Ketsuyoko",
    "source": "Legado do Ódio · PDF 30",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:legado:jutsu:hachiman",
        "label": "Hachiman"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 18,
        "label": "Espírito"
      },
      {
        "kind": "owned",
        "id": "sns:apt:trespassar-2",
        "label": "Trespassar2"
      },
      {
        "kind": "legadoSelected",
        "key": "hachiman-ketsuyoko",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:ame-no-tejikara": {
    "name": "Ame-no-Tejikara",
    "source": "Legado do Ódio · PDF 30–31",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
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
        "kind": "attribute",
        "key": "esp",
        "min": 16,
        "label": "Espírito"
      },
      {
        "kind": "legadoSelected",
        "key": "ame-no-tejikara",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:gyaku-sekai-no-jutsu": {
    "name": "Gyaku Sekai no Jutsu",
    "source": "Legado do Ódio · PDF 31–32",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
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
        "kind": "attribute",
        "key": "esp",
        "min": 16,
        "label": "Espírito"
      },
      {
        "kind": "owned",
        "id": "sns:apt:saque-rapido",
        "label": "Saque Rápido"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ponto-cego",
        "label": "Ponto Cego"
      },
      {
        "kind": "legadoSelected",
        "key": "gyaku-sekai-no-jutsu",
        "label": "Técnica do par de olhos escolhido"
      }
    ]
  },
  "sns:legado:jutsu:susanoo": {
    "name": "Susano’o",
    "source": "Legado do Ódio · PDF 32–38",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "legadoPair",
        "label": "Dominar o par escolhido do Mangekyo"
      }
    ]
  },
  "sns:legado:jutsu:takemikazuchi-no-kami": {
    "name": "Takemikazuchi-no-Kami",
    "source": "Legado do Ódio · PDF 38",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:legado:apt:eien-mangekyo-sharingan",
        "label": "Eien Mangekyo Sharingan"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:raiton",
        "min": 9,
        "label": "Raiton"
      },
      {
        "kind": "effectKnown",
        "powerId": "sns:power:raiton",
        "id": "sns:effect:lamina-de-raios",
        "min": 9,
        "label": "Lâmina de Raios9 aprendida"
      },
      {
        "kind": "legadoStage",
        "min": 5,
        "label": "Susano’o5ºestágio liberado"
      }
    ]
  },
  "sns:legado:jutsu:indra-no-vajra": {
    "name": "Indra-no-Vajra",
    "source": "Legado do Ódio · PDF 39–40",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:legado:apt:eien-mangekyo-sharingan",
        "label": "Eien Mangekyo Sharingan"
      },
      {
        "kind": "owned",
        "id": "sns:apt:tecnica-poderosa",
        "label": "Técnica Poderosa"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 20,
        "label": "Espírito"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "powerLevel",
            "id": "sns:power:katon",
            "min": 10,
            "label": "Katon"
          },
          {
            "kind": "powerLevel",
            "id": "sns:power:fuuton",
            "min": 10,
            "label": "Fuuton"
          },
          {
            "kind": "powerLevel",
            "id": "sns:power:raiton",
            "min": 10,
            "label": "Raiton"
          },
          {
            "kind": "powerLevel",
            "id": "sns:power:doton",
            "min": 10,
            "label": "Doton"
          },
          {
            "kind": "powerLevel",
            "id": "sns:power:suiton",
            "min": 10,
            "label": "Suiton"
          }
        ]
      },
      {
        "kind": "legadoStage",
        "min": 5,
        "label": "Susano’o5ºestágio liberado"
      }
    ]
  },
  "sns:legado:jutsu:yata-no-kagami": {
    "name": "Yata no Kagami",
    "source": "Legado do Ódio · PDF 40–41",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
          }
        ]
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 17,
        "label": "Espírito"
      },
      {
        "kind": "legadoStage",
        "min": 3,
        "label": "Susano’o3ºestágio liberado"
      },
      {
        "kind": "legadoSelected",
        "key": "yata-no-kagami",
        "label": "Técnica escolhida para o par de olhos"
      }
    ]
  },
  "sns:legado:jutsu:yomotsu-okami": {
    "name": "Yomotsu Ōkami",
    "source": "Legado do Ódio · PDF 41–42",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:legado:apt:mangekyo-sharingan",
            "label": "Mangekyo Sharingan"
          },
          {
            "kind": "owned",
            "id": "sns:apt:mangekyou-sharingan",
            "label": "Mangekyo Sharingan · Básico"
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
        "kind": "legadoStage",
        "min": 1,
        "label": "Susano’o1ºestágio"
      },
      {
        "kind": "legadoSelected",
        "key": "yomotsu-okami",
        "label": "Técnica escolhida para o par de olhos"
      }
    ]
  },
  "sns:legado:rule:condicoes-prejudiciais": {
    "name": "Condições Prejudiciais",
    "source": "Legado do Ódio · PDF 42–43",
    "requirements": []
  },
  "sns:legado:rule:par-de-olhos-customizavel": {
    "name": "Par de Olhos Customizável",
    "source": "Legado do Ódio · PDF 43",
    "requirements": []
  }
};
