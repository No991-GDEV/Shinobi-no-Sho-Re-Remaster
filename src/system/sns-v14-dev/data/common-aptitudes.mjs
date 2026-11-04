// Approved F01/F03 aptitude acquisition profiles. D042; bonuses are not requirements.
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const COMMON_APTITUDE_RULES=freeze({
  "sns:apt:acuidade": {
    "name": "Acuidade",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.61",
    "requirements": [
      {
        "kind": "attribute",
        "key": "des",
        "min": 3,
        "label": "Destreza"
      }
    ]
  },
  "sns:apt:ambidestria": {
    "name": "Ambidestria",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.24",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "combatBase",
            "key": "cc",
            "min": 12,
            "label": "CC original"
          },
          {
            "kind": "combatBase",
            "key": "cd",
            "min": 12,
            "label": "CD original"
          }
        ]
      }
    ]
  },
  "sns:apt:ataque-em-movimento": {
    "name": "Ataque em Movimento",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.61, 62",
    "requirements": [
      {
        "kind": "attribute",
        "key": "agi",
        "min": 4,
        "label": "Agilidade"
      }
    ]
  },
  "sns:apt:atirador": {
    "name": "Atirador",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.24, 25",
    "requirements": [
      {
        "kind": "attribute",
        "key": "des",
        "min": 12,
        "label": "Destreza"
      }
    ],
    "choiceType": "shooter"
  },
  "sns:apt:bloqueio-ambidestro": {
    "name": "Bloqueio Ambidestro",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.62",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:ambidestria",
        "label": "Ambidestria"
      }
    ]
  },
  "sns:apt:combate-defensivo": {
    "name": "Combate Defensivo",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.62",
    "requirements": [
      {
        "kind": "combatBase",
        "key": "cc",
        "min": 9,
        "label": "CC original"
      }
    ]
  },
  "sns:apt:critico-aprimorado": {
    "name": "Crítico Aprimorado",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.26",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:especialista",
            "label": "Especialista"
          },
          {
            "kind": "any",
            "options": [
              {
                "kind": "combatBase",
                "key": "cc",
                "min": 13,
                "label": "CC original"
              },
              {
                "kind": "combatBase",
                "key": "cd",
                "min": 13,
                "label": "CD original"
              }
            ]
          }
        ]
      }
    ]
  },
  "sns:apt:dano-extra": {
    "name": "Dano Extra",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.62, 63",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "combatBase",
            "key": "cc",
            "min": 18,
            "label": "CC original"
          },
          {
            "kind": "combatBase",
            "key": "cd",
            "min": 18,
            "label": "CD original"
          }
        ]
      }
    ],
    "choiceType": "damageCategory"
  },
  "sns:apt:de-pe": {
    "name": "De Pé",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.63",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:diligente-2": {
    "name": "Diligente · nível 2",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF p.26",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:diligente",
            "label": "Diligente"
          },
          {
            "kind": "initiativeBase",
            "min": 21,
            "label": "Iniciativa original"
          }
        ]
      }
    ]
  },
  "sns:apt:diligente": {
    "name": "Diligente",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.63",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:especialista": {
    "name": "Especialista",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.63",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ],
    "choiceType": "combatStyle"
  },
  "sns:apt:guerreiro": {
    "name": "Guerreiro",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.28",
    "requirements": [
      {
        "kind": "warriorChoice"
      }
    ],
    "choiceType": "weaponClass"
  },
  "sns:apt:intuicao": {
    "name": "Intuição",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.63",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:lutador": {
    "name": "Lutador",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.63",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:lutar-as-cegas-2": {
    "name": "Lutar às Cegas · nível 2",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.28",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:lutar-as-cegas",
            "label": "Lutar às Cegas"
          },
          {
            "kind": "skillLevel",
            "key": "prontidao",
            "min": 11,
            "label": "Nível de Prontidão"
          }
        ]
      }
    ]
  },
  "sns:apt:lutar-as-cegas": {
    "name": "Lutar às Cegas",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.28",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:maestria": {
    "name": "Maestria",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.64",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ],
    "choiceType": "powerOrTechnique"
  },
  "sns:apt:mestre-dos-selos": {
    "name": "Mestre dos Selos",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.64",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "skillLevel",
            "key": "prestidigitacao",
            "min": 12,
            "label": "Nível de Prestidigitação"
          },
          {
            "kind": "owned",
            "id": "sns:apt:ponto-cego",
            "label": "Ponto Cego"
          }
        ]
      }
    ]
  },
  "sns:apt:mira-apurada": {
    "name": "Mira Apurada",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.64",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "attribute",
            "key": "des",
            "min": 12,
            "label": "Destreza"
          },
          {
            "kind": "owned",
            "id": "sns:apt:tiro-longo",
            "label": "Tiro Longo"
          }
        ]
      }
    ]
  },
  "sns:apt:mobilidade": {
    "name": "Mobilidade",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.28, 29",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "attribute",
            "key": "agi",
            "min": 3,
            "label": "Agilidade"
          },
          {
            "kind": "owned",
            "id": "sns:apt:reflexos",
            "label": "Reflexos"
          }
        ]
      }
    ]
  },
  "sns:apt:oportunista-2": {
    "name": "Oportunista · nível 2",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF p.29",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:oportunista",
            "label": "Oportunista"
          },
          {
            "kind": "attribute",
            "key": "des",
            "min": 13,
            "label": "Destreza"
          },
          {
            "kind": "ownedWeaponUse",
            "id": "sns:apt:especialista",
            "label": "Especialista em arma de disparo ou arremesso"
          }
        ]
      }
    ]
  },
  "sns:apt:oportunista": {
    "name": "Oportunista",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.65",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:ponto-cego": {
    "name": "Ponto Cego",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.65",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "agi",
            "min": 6,
            "label": "Agilidade"
          },
          {
            "kind": "skillLevel",
            "key": "prestidigitacao",
            "min": 6,
            "label": "Nível de Prestidigitação"
          }
        ]
      }
    ]
  },
  "sns:apt:punho-de-ferro": {
    "name": "Punho de Ferro",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.65",
    "requirements": [
      {
        "kind": "attribute",
        "key": "for",
        "min": 2,
        "label": "Força"
      }
    ]
  },
  "sns:apt:reflexos": {
    "name": "Reflexos",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.66",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:retirada-rapida": {
    "name": "Retirada Rápida",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.29, 30",
    "requirements": [
      {
        "kind": "attribute",
        "key": "agi",
        "min": 9,
        "label": "Agilidade"
      }
    ]
  },
  "sns:apt:rolamento": {
    "name": "Rolamento",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.66",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "skillLevel",
            "key": "acrobacia",
            "min": 2,
            "label": "Nível de Acrobacia"
          },
          {
            "kind": "owned",
            "id": "sns:apt:de-pe",
            "label": "De Pé"
          }
        ]
      }
    ]
  },
  "sns:apt:saque-rapido": {
    "name": "Saque Rápido",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.30",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:tiro-longo": {
    "name": "Tiro Longo",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.30",
    "requirements": [
      {
        "kind": "attribute",
        "key": "des",
        "min": 11,
        "label": "Destreza"
      }
    ]
  },
  "sns:apt:tiro-preciso-2": {
    "name": "Tiro Preciso · nível 2",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF p.30",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:tiro-preciso",
            "label": "Tiro Preciso"
          },
          {
            "kind": "attribute",
            "key": "des",
            "min": 13,
            "label": "Destreza"
          }
        ]
      }
    ]
  },
  "sns:apt:tiro-preciso": {
    "name": "Tiro Preciso",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.66",
    "requirements": [
      {
        "kind": "attribute",
        "key": "des",
        "min": 9,
        "label": "Destreza"
      }
    ]
  },
  "sns:apt:trespassar-2": {
    "name": "Trespassar · nível 2",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.67",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:trespassar",
            "label": "Trespassar"
          },
          {
            "kind": "combatBase",
            "key": "cc",
            "min": 9,
            "label": "CC original"
          }
        ]
      }
    ]
  },
  "sns:apt:trespassar": {
    "name": "Trespassar",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.67",
    "requirements": [
      {
        "kind": "combatBase",
        "key": "cc",
        "min": 7,
        "label": "CC original"
      }
    ]
  },
  "sns:apt:usar-arma": {
    "name": "Usar Arma",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.30, 31",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ],
    "choiceType": "weapon"
  },
  "sns:apt:usar-armaduras-pesadas": {
    "name": "Usar Armaduras Pesadas",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.67",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "for",
            "min": 10,
            "label": "Força"
          },
          {
            "kind": "attribute",
            "key": "vig",
            "min": 15,
            "label": "Vigor"
          }
        ]
      }
    ]
  },
  "sns:apt:velocista": {
    "name": "Velocista",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.67",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:apanhar-objetos": {
    "name": "Apanhar Objeto",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.32",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:arremessar": {
    "name": "Arremessar",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.32, 33",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "attribute",
            "key": "for",
            "min": 5,
            "label": "Força"
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
          }
        ]
      }
    ]
  },
  "sns:apt:ataque-atordoante": {
    "name": "Ataque Atordoante",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.68",
    "requirements": [
      {
        "kind": "attribute",
        "key": "for",
        "min": 12,
        "label": "Força"
      }
    ]
  },
  "sns:apt:ataque-giratorio": {
    "name": "Ataque Giratório",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.68",
    "requirements": [
      {
        "kind": "combatBase",
        "key": "cc",
        "min": 8,
        "label": "CC original"
      }
    ]
  },
  "sns:apt:ataque-multiplo": {
    "name": "Ataque Múltiplo",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.68, 69",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "combatBase",
            "key": "cc",
            "min": 11,
            "label": "CC original"
          },
          {
            "kind": "combatBase",
            "key": "cd",
            "min": 11,
            "label": "CD original"
          }
        ]
      }
    ]
  },
  "sns:apt:ataque-poderoso": {
    "name": "Ataque Poderoso",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.69",
    "requirements": [
      {
        "kind": "combatBase",
        "key": "cc",
        "min": 7,
        "label": "CC original"
      }
    ]
  },
  "sns:apt:ataque-progressivo": {
    "name": "Ataque Progressivo",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.69",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "any",
            "options": [
              {
                "kind": "attribute",
                "key": "agi",
                "min": 14,
                "label": "Agilidade"
              },
              {
                "kind": "powerLevel",
                "id": "sns:power:hachimon-tonkou",
                "min": 6,
                "label": "Hachimon Tonkou"
              }
            ]
          },
          {
            "kind": "owned",
            "id": "sns:apt:ataque-multiplo",
            "label": "Ataque Múltiplo"
          }
        ]
      }
    ]
  },
  "sns:apt:bloquear-arma": {
    "name": "Bloquear Arma",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.69",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:chute-duplo": {
    "name": "Chute Duplo",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.70",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:chute-giratorio",
            "label": "Chute Giratório"
          },
          {
            "kind": "owned",
            "id": "sns:apt:ataque-multiplo",
            "label": "Ataque Múltiplo"
          }
        ]
      }
    ]
  },
  "sns:apt:chute-giratorio": {
    "name": "Chute Giratório",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.70",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "combatBase",
            "key": "cc",
            "min": 10,
            "label": "CC original"
          },
          {
            "kind": "owned",
            "id": "sns:apt:ataque-giratorio",
            "label": "Ataque Giratório"
          }
        ]
      }
    ]
  },
  "sns:apt:chute-inverso": {
    "name": "Chute Inverso",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.70",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "combatBase",
            "key": "cc",
            "min": 14,
            "label": "CC original"
          },
          {
            "kind": "owned",
            "id": "sns:apt:ponto-cego",
            "label": "Ponto Cego"
          }
        ]
      }
    ]
  },
  "sns:apt:contragolpe": {
    "name": "Contragolpe",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.70",
    "requirements": [
      {
        "kind": "combatBase",
        "key": "cc",
        "min": 12,
        "label": "CC original"
      }
    ]
  },
  "sns:apt:derrubar-agressivo": {
    "name": "Derrubar Agressivo",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.70",
    "requirements": [
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
      }
    ]
  },
  "sns:apt:desarme-agressivo": {
    "name": "Desarme Agressivo",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.70",
    "requirements": [
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
      }
    ]
  },
  "sns:apt:golpe-atemi": {
    "name": "Golpe Atemi",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.71",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:ataque-poderoso",
            "label": "Ataque Poderoso"
          },
          {
            "kind": "owned",
            "id": "sns:apt:critico-aprimorado",
            "label": "Crítico Aprimorado"
          }
        ]
      }
    ]
  },
  "sns:apt:golpe-carate": {
    "name": "Golpe Caratê",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.71",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "combatBase",
            "key": "cc",
            "min": 15,
            "label": "CC original"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:especialista",
            "choice": "desarmado",
            "label": "Especialista · Desarmado"
          }
        ]
      }
    ]
  },
  "sns:apt:rasteira": {
    "name": "Rasteira",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.71",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:lutador",
            "label": "Lutador"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:guerreiro",
            "choice": "longa",
            "label": "Guerreiro · Longas"
          }
        ]
      }
    ]
  },
  "sns:apt:seguir-sombra": {
    "name": "Seguir Sombra",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.71",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:arremessar",
            "label": "Arremessar"
          },
          {
            "kind": "owned",
            "id": "sns:apt:ataque-em-movimento",
            "label": "Ataque em Movimento"
          }
        ]
      }
    ]
  },
  "sns:apt:soco-agarrado": {
    "name": "Soco Agarrado",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.72",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:lutador",
        "label": "Lutador"
      }
    ]
  },
  "sns:apt:soco-em-gancho": {
    "name": "Soco em Gancho",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.72",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "combatBase",
            "key": "cc",
            "min": 11,
            "label": "CC original"
          },
          {
            "kind": "owned",
            "id": "sns:apt:ataque-multiplo",
            "label": "Ataque Múltiplo"
          }
        ]
      }
    ]
  },
  "sns:apt:voadora": {
    "name": "Voadora",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.72",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:derrubar-agressivo",
            "label": "Derrubar Agressivo"
          },
          {
            "kind": "owned",
            "id": "sns:apt:ataque-poderoso",
            "label": "Ataque Poderoso"
          }
        ]
      }
    ]
  },
  "sns:apt:dominio-da-agua": {
    "name": "Domínio da Água",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.72, 73",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:suiton",
        "min": 5,
        "label": "Suiton"
      }
    ]
  },
  "sns:apt:dominio-do-fogo": {
    "name": "Domínio do Fogo",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.73",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:katon",
        "min": 5,
        "label": "Katon"
      }
    ]
  },
  "sns:apt:dominio-do-raio": {
    "name": "Domínio do Raio",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.73",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:raiton",
        "min": 5,
        "label": "Raiton"
      }
    ]
  },
  "sns:apt:dominio-da-terra": {
    "name": "Domínio da Terra",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.73",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:doton",
        "min": 5,
        "label": "Doton"
      }
    ]
  },
  "sns:apt:dominio-do-vento": {
    "name": "Domínio do Vento",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.73",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuton",
        "min": 5,
        "label": "Fuuton"
      }
    ]
  },
  "sns:apt:dominio-ninpou": {
    "name": "Domínio Ninpou",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.74",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "any",
            "options": [
              {
                "kind": "powerLevel",
                "id": "sns:power:ninpou",
                "min": 5,
                "label": "Ninpou"
              },
              {
                "kind": "powerLevel",
                "id": "sns:power:hibon-ninpou",
                "min": 5,
                "label": "Hibon Ninpou"
              }
            ]
          },
          {
            "kind": "owned",
            "id": "sns:apt:ponto-cego",
            "label": "Ponto Cego"
          }
        ]
      }
    ]
  },
  "sns:apt:ilusao-profunda": {
    "name": "Ilusão Profunda",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.74",
    "requirements": [
      {
        "kind": "attribute",
        "key": "int",
        "min": 5,
        "label": "Inteligência"
      }
    ]
  },
  "sns:apt:potencializar": {
    "name": "Potencializar",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.74",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "esp",
            "min": 8,
            "label": "Espírito"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 8,
            "label": "Inteligência"
          }
        ]
      }
    ]
  },
  "sns:apt:tecnica-acelerada": {
    "name": "Técnica Acelerada",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.39",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "esp",
            "min": 11,
            "label": "Espírito"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 11,
            "label": "Inteligência"
          }
        ]
      }
    ]
  },
  "sns:apt:tecnica-eficiente": {
    "name": "Técnica Eficiente",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.74",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "esp",
            "min": 10,
            "label": "Espírito"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 10,
            "label": "Inteligência"
          }
        ]
      }
    ]
  },
  "sns:apt:tecnica-elevada": {
    "name": "Técnica Elevada",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.75",
    "requirements": [
      {
        "kind": "attribute",
        "key": "int",
        "min": 6,
        "label": "Inteligência"
      }
    ]
  },
  "sns:apt:tecnica-poderosa": {
    "name": "Técnica Poderosa",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.75",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "esp",
            "min": 12,
            "label": "Espírito"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 12,
            "label": "Inteligência"
          }
        ]
      }
    ]
  },
  "sns:apt:duro-de-matar": {
    "name": "Duro de Matar",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.75",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:engenheiro": {
    "name": "Engenheiro",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.75",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:ninja-medico": {
    "name": "Ninja Médico",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.75",
    "requirements": [
      {
        "kind": "skillLevel",
        "key": "medicina",
        "min": 7,
        "label": "Nível de Medicina"
      }
    ]
  },
  "sns:apt:pericia-inata": {
    "name": "Perícia Inata",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.76",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ],
    "choiceType": "skill"
  },
  "sns:apt:perito": {
    "name": "Perito",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.76",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ],
    "choiceType": "skill"
  },
  "sns:apt:quimico": {
    "name": "Químico",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.42",
    "requirements": [
      {
        "kind": "attribute",
        "key": "int",
        "min": 6,
        "label": "Inteligência"
      }
    ]
  },
  "sns:apt:resistencia-maior": {
    "name": "Resistência Maior",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.76",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ],
    "choiceType": "attribute"
  },
  "sns:apt:clone-perfeito": {
    "name": "Clone Perfeito",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.78",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "actorType",
            "types": [
              "npc",
              "companion"
            ],
            "label": "Somente PdM"
          },
          {
            "kind": "attribute",
            "key": "esp",
            "min": 16,
            "label": "Espírito"
          },
          {
            "kind": "ownedLevel",
            "contentId": "sns:apt:clone",
            "min": 2,
            "label": "Clone nível 2"
          },
          {
            "kind": "owned",
            "id": "sns:apt:clone-verdadeiro-kage",
            "label": "Clone Verdadeiro · Kage Bunshin"
          }
        ]
      }
    ]
  },
  "sns:apt:fascinar": {
    "name": "Fascinar",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.80",
    "requirements": [
      {
        "kind": "attribute",
        "key": "int",
        "min": 4,
        "label": "Inteligência"
      }
    ]
  },
  "sns:apt:kyoudo-kyouka-2": {
    "name": "Kyoudo Kyouka · nível 2",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.80, 81",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:kyoudo-kyouka",
            "label": "Kyoudo Kyouka"
          },
          {
            "kind": "attribute",
            "key": "esp",
            "min": 10,
            "label": "Espírito"
          }
        ]
      }
    ]
  },
  "sns:apt:kyoudo-kyouka": {
    "name": "Kyoudo Kyouka",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.80, 81",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "attribute",
            "key": "esp",
            "min": 6,
            "label": "Espírito"
          },
          {
            "kind": "powerLevel",
            "id": "sns:power:iryou-ninjutsu",
            "min": 2,
            "label": "Iryou Ninjutsu"
          }
        ]
      }
    ]
  },
  "sns:apt:miragem": {
    "name": "Miragem",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.82",
    "requirements": [
      {
        "kind": "attribute",
        "key": "int",
        "min": 2,
        "label": "Inteligência"
      }
    ]
  },
  "sns:apt:replica-enganadora-2": {
    "name": "Réplica Enganadora · nível 2",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.82",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:replica-enganadora",
            "label": "Réplica Enganadora"
          },
          {
            "kind": "skillLevel",
            "key": "prestidigitacao",
            "min": 12,
            "label": "Nível de Prestidigitação"
          }
        ]
      }
    ]
  },
  "sns:apt:replica-enganadora": {
    "name": "Réplica Enganadora",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.82",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "any",
            "options": [
              {
                "kind": "powerLevel",
                "id": "sns:power:suiton",
                "min": 4,
                "label": "Suiton"
              },
              {
                "kind": "powerLevel",
                "id": "sns:power:doton",
                "min": 4,
                "label": "Doton"
              },
              {
                "kind": "owned",
                "id": "sns:apt:clone-kage",
                "label": "Clone · Kage Bunshin"
              }
            ]
          },
          {
            "kind": "skillLevel",
            "key": "prestidigitacao",
            "min": 10,
            "label": "Nível de Prestidigitação"
          }
        ]
      }
    ]
  },
  "sns:apt:sensor": {
    "name": "Sensor",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.83",
    "requirements": [
      {
        "kind": "skillLevel",
        "key": "rastrear",
        "min": 10,
        "label": "Nível de Rastrear"
      }
    ],
    "choiceType": "sensor"
  },
  "sns:apt:trabalho-duro": {
    "name": "Trabalho Duro",
    "source": "Naruto: Shinobi no Sho — Livro Básico · 4ª edição4.1b; publicação08/05/2022 · PDF p.83, 84",
    "requirements": [
      {
        "kind": "noClanOrHijutsu",
        "exceptions": [
          "sns:power:hachimon-tonkou"
        ],
        "label": "Sem clã/hijutsu, salvo Hachimon Tonkou nas condições do livro"
      }
    ]
  },
  "sns:apt:arremessador-de-utilitarios": {
    "name": "Arremessador de Utilitários",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.24",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "attribute",
            "key": "des",
            "min": 7,
            "label": "Destreza"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 4,
            "label": "Inteligência"
          }
        ]
      }
    ]
  },
  "sns:apt:arremessador-eficiente": {
    "name": "Arremessador Eficiente",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.24",
    "requirements": [
      {
        "kind": "combatBase",
        "key": "cd",
        "min": 8,
        "label": "CD original"
      }
    ]
  },
  "sns:apt:auxiliador-especialista": {
    "name": "Auxiliador Especialista",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.25",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:avaliador-do-perigo": {
    "name": "Avaliador do Perigo",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.25",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "int",
            "min": 4,
            "label": "Inteligência"
          },
          {
            "kind": "attribute",
            "key": "per",
            "min": 4,
            "label": "Percepção"
          }
        ]
      }
    ]
  },
  "sns:apt:corpo-esguio": {
    "name": "Corpo Esguio",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.26",
    "requirements": [
      {
        "kind": "all",
        "options": []
      }
    ]
  },
  "sns:apt:esquiva-de-risco": {
    "name": "Esquiva de Risco",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.26, 27",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:reflexos",
            "label": "Reflexos"
          },
          {
            "kind": "combatBase",
            "key": "esq",
            "min": 11,
            "label": "Esquiva original"
          }
        ]
      }
    ]
  },
  "sns:apt:fuuma-shuriken-criadas": {
    "name": "Fuuma Shuriken Criadas",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.27",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "ownedWeaponFamily",
            "id": "sns:apt:usar-arma",
            "prefix": "sns:equipment:fuuma-shuriken-",
            "label": "Usar Arma · Fuuma Shuriken"
          },
          {
            "kind": "effectKnown",
            "id": "sns:effect:criar-arma",
            "min": 2,
            "label": "Criar Arma nível 2 aprendido"
          }
        ]
      }
    ]
  },
  "sns:apt:fuuma-shuriken-kousen": {
    "name": "Fuuma Shuriken Kousen",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.27",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "ownedChoice",
            "id": "sns:apt:usar-arma",
            "choice": "sns:equipment:kousen",
            "label": "Usar Arma · Kousen"
          },
          {
            "kind": "ownedWeaponFamily",
            "id": "sns:apt:usar-arma",
            "prefix": "sns:equipment:fuuma-shuriken-",
            "label": "Usar Arma · Fuuma Shuriken"
          }
        ]
      }
    ]
  },
  "sns:apt:usar-polvora": {
    "name": "Usar Pólvora",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.31",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "skillLevel",
            "key": "mecanismos",
            "min": 2,
            "label": "Nível de Mecanismos"
          },
          {
            "kind": "attribute",
            "key": "des",
            "min": 2,
            "label": "Destreza"
          }
        ]
      }
    ]
  },
  "sns:apt:utilitarista-rapido": {
    "name": "Utilitarista Rápido",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.31",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "attribute",
            "key": "des",
            "min": 11,
            "label": "Destreza"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 6,
            "label": "Inteligência"
          },
          {
            "kind": "owned",
            "id": "sns:apt:saque-rapido",
            "label": "Saque Rápido"
          }
        ]
      }
    ]
  },
  "sns:apt:agarrar-agressivo": {
    "name": "Agarrar Agressivo",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.32",
    "requirements": [
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
      }
    ]
  },
  "sns:apt:desarme-a-distancia-2": {
    "name": "Desarme à Distância · nível 2",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.33",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:desarme-a-distancia",
            "label": "Desarme à Distância"
          },
          {
            "kind": "combatBase",
            "key": "cd",
            "min": 17,
            "label": "CD original"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 7,
            "label": "Inteligência"
          }
        ]
      }
    ]
  },
  "sns:apt:desarme-a-distancia": {
    "name": "Desarme à Distância",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.33",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "combatBase",
            "key": "cd",
            "min": 11,
            "label": "CD original"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 3,
            "label": "Inteligência"
          }
        ]
      }
    ]
  },
  "sns:apt:estilo-zui-quan-2": {
    "name": "Estilo Zui Quan · nível 2",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.33, 34",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:estilo-zui-quan",
            "label": "Estilo Zui Quan"
          },
          {
            "kind": "attribute",
            "key": "for",
            "min": 15,
            "label": "Força"
          },
          {
            "kind": "attribute",
            "key": "vig",
            "min": 12,
            "label": "Vigor"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:resistencia-maior",
            "choice": "vig",
            "label": "Resistência Maior · Vigor"
          }
        ]
      }
    ]
  },
  "sns:apt:estilo-zui-quan": {
    "name": "Estilo Zui Quan",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.33, 34",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:ponto-cego",
            "label": "Ponto Cego"
          },
          {
            "kind": "owned",
            "id": "sns:apt:punho-de-ferro",
            "label": "Punho de Ferro"
          },
          {
            "kind": "attribute",
            "key": "vig",
            "min": 8,
            "label": "Vigor"
          }
        ]
      }
    ]
  },
  "sns:apt:flechada-no-joelho-2": {
    "name": "Flechada no Joelho · nível 2",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.34, 35",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:flechada-no-joelho",
            "label": "Flechada no Joelho"
          },
          {
            "kind": "combatBase",
            "key": "cd",
            "min": 17,
            "label": "CD original"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 7,
            "label": "Inteligência"
          }
        ]
      }
    ]
  },
  "sns:apt:flechada-no-joelho": {
    "name": "Flechada no Joelho",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.34, 35",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "combatBase",
            "key": "cd",
            "min": 11,
            "label": "CD original"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 3,
            "label": "Inteligência"
          }
        ]
      }
    ]
  },
  "sns:apt:imobilizacao": {
    "name": "Imobilização",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.35",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:agarrar-agressivo",
            "label": "Agarrar Agressivo"
          },
          {
            "kind": "attribute",
            "key": "for",
            "min": 13,
            "label": "Força"
          }
        ]
      }
    ]
  },
  "sns:apt:instancia-de-falange": {
    "name": "Instância de Falange",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.35, 36",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "ownedWeaponClass",
            "id": "sns:apt:especialista",
            "weaponClass": "longa",
            "label": "Especialista · Arma Longa"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:guerreiro",
            "choice": "longa",
            "label": "Guerreiro · Longas"
          },
          {
            "kind": "combatBase",
            "key": "cc",
            "min": 14,
            "label": "CC original"
          }
        ]
      }
    ]
  },
  "sns:apt:roubar": {
    "name": "Roubar",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.36",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "combatBase",
            "key": "cc",
            "min": 11,
            "label": "CC original"
          },
          {
            "kind": "skillLevel",
            "key": "prestidigitacao",
            "min": 5,
            "label": "Nível de Prestidigitação"
          }
        ]
      }
    ]
  },
  "sns:apt:dominio-simples": {
    "name": "Domínio Simples",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.36",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:ninpou",
        "min": 5,
        "label": "Ninpou"
      }
    ]
  },
  "sns:apt:dominio-mecanico": {
    "name": "Domínio Mecânico",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.36, 37",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "skillLevel",
            "key": "mecanismos",
            "min": 10,
            "label": "Nível de Mecanismos"
          },
          {
            "kind": "owned",
            "id": "sns:apt:engenheiro",
            "label": "Engenheiro"
          }
        ]
      }
    ]
  },
  "sns:apt:henge-perfeito": {
    "name": "Henge Perfeito",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.37",
    "requirements": [
      {
        "kind": "skillLevel",
        "key": "disfarces",
        "min": 4,
        "label": "Nível de Disfarces"
      }
    ]
  },
  "sns:apt:ilusao-musical": {
    "name": "Ilusão Musical",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.37, 38",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:ilusao-profunda",
            "label": "Ilusão Profunda"
          },
          {
            "kind": "skillLevel",
            "key": "arte",
            "min": 11,
            "label": "Nível de Arte"
          }
        ]
      }
    ]
  },
  "sns:apt:kai-perfeito": {
    "name": "Kai Perfeito",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.38",
    "requirements": [
      {
        "kind": "attribute",
        "key": "esp",
        "min": 4,
        "label": "Espírito"
      }
    ]
  },
  "sns:apt:kawarimi-explosivo": {
    "name": "Kawarimi Explosivo",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.38, 39",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:replica-enganadora",
        "label": "Réplica Enganadora"
      }
    ]
  },
  "sns:apt:kawarimi-perfeito": {
    "name": "Kawarimi Perfeito",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.39",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "agi",
            "min": 11,
            "label": "Agilidade"
          },
          {
            "kind": "skillLevel",
            "key": "prestidigitacao",
            "min": 11,
            "label": "Nível de Prestidigitação"
          }
        ]
      }
    ]
  },
  "sns:apt:mestre-da-criacao": {
    "name": "Mestre da Criação",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.39",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "int",
            "min": 7,
            "label": "Inteligência"
          },
          {
            "kind": "attribute",
            "key": "esp",
            "min": 7,
            "label": "Espírito"
          }
        ]
      }
    ]
  },
  "sns:apt:tecnica-de-controle-de-chakra": {
    "name": "Técnica de Controle de Chakra",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.39, 40",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "attribute",
            "key": "int",
            "min": 5,
            "label": "Inteligência"
          },
          {
            "kind": "attribute",
            "key": "esp",
            "min": 5,
            "label": "Espírito"
          }
        ]
      }
    ]
  },
  "sns:apt:tecnica-de-cura-arriscada": {
    "name": "Técnica de Cura Arriscada",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.40",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:iryou-ninjutsu",
        "min": 7,
        "label": "Iryou Ninjutsu"
      }
    ]
  },
  "sns:apt:tecnica-de-impacto": {
    "name": "Técnica de Impacto",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.40",
    "requirements": [
      {
        "kind": "attribute",
        "key": "esp",
        "min": 5,
        "label": "Espírito"
      }
    ]
  },
  "sns:apt:burro-de-carga": {
    "name": "Burro de Carga",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.41",
    "requirements": [
      {
        "kind": "attribute",
        "key": "for",
        "min": 4,
        "label": "Força"
      }
    ]
  },
  "sns:apt:envenenar-arma": {
    "name": "Envenenar Arma",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.41",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "skillLevel",
            "key": "veneficio",
            "min": 9,
            "label": "Nível de Venefício"
          },
          {
            "kind": "owned",
            "id": "sns:apt:saque-rapido",
            "label": "Saque Rápido"
          }
        ]
      }
    ]
  },
  "sns:apt:furtividade-agil": {
    "name": "Furtividade Ágil",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.41",
    "requirements": [
      {
        "kind": "skillLevel",
        "key": "furtividade",
        "min": 9,
        "label": "Nível de Furtividade"
      }
    ]
  },
  "sns:apt:metabolismo-rapido": {
    "name": "Metabolismo Rápido",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.42",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "attribute",
            "key": "vig",
            "min": 1,
            "label": "Vigor"
          },
          {
            "kind": "attribute",
            "key": "esp",
            "min": 1,
            "label": "Espírito"
          }
        ]
      }
    ]
  },
  "sns:apt:encantar-2": {
    "name": "Encantar · nível 2",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.42, 43, 44",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:encantar",
            "label": "Encantar"
          },
          {
            "kind": "attribute",
            "key": "int",
            "min": 12,
            "label": "Inteligência"
          },
          {
            "kind": "owned",
            "id": "sns:apt:ilusao-profunda",
            "label": "Ilusão Profunda"
          }
        ]
      }
    ]
  },
  "sns:apt:encantar": {
    "name": "Encantar",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.42, 43, 44",
    "requirements": [
      {
        "kind": "attribute",
        "key": "int",
        "min": 5,
        "label": "Inteligência"
      }
    ]
  },
  "sns:apt:oiroke-no-jutsu": {
    "name": "Oiroke no Jutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.44",
    "requirements": [
      {
        "kind": "skillLevel",
        "key": "disfarces",
        "min": 4,
        "label": "Nível de Disfarces"
      }
    ]
  },
  "sns:apt:haremu-no-jutsu": {
    "name": "Haremu no Jutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.44, 45",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "skillLevel",
            "key": "disfarces",
            "min": 10,
            "label": "Nível de Disfarces"
          },
          {
            "kind": "ownedLevel",
            "contentId": "sns:apt:clone",
            "min": 2,
            "label": "Clone nível 2"
          },
          {
            "kind": "owned",
            "id": "sns:apt:oiroke-no-jutsu",
            "label": "Oiroke no Jutsu"
          }
        ]
      }
    ]
  },
  "sns:apt:raigou-senjusatsu": {
    "name": "Raigou — Senjusatsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.45, 46",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "attribute",
            "key": "esp",
            "min": 13,
            "label": "Espírito"
          },
          {
            "kind": "skillLevel",
            "key": "concentracao",
            "min": 10,
            "label": "Nível de Concentração"
          },
          {
            "kind": "access",
            "key": "monges-templo-fogo"
          }
        ]
      }
    ]
  },
  "sns:apt:raiton-kage-bunshin-no-jutsu": {
    "name": "Raiton: Kage Bunshin no Jutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.46, 47",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:clone-kage",
            "label": "Clone · Kage Bunshin"
          },
          {
            "kind": "powerLevel",
            "id": "sns:power:raiton",
            "min": 1,
            "label": "Raiton"
          }
        ]
      }
    ]
  },
  "sns:apt:shuriken-kage-bunshin-no-jutsu": {
    "name": "Shuriken Kage Bunshin no Jutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · Versão especial10 anos; compatível SNS4.1b · PDF p.47",
    "requirements": [
      {
        "kind": "all",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:clone-kage",
            "label": "Clone · Kage Bunshin"
          },
          {
            "kind": "skillLevel",
            "key": "prestidigitacao",
            "min": 6,
            "label": "Nível de Prestidigitação"
          }
        ]
      }
    ]
  }
});
export const COMMON_APTITUDE_CHOICES=freeze({
  "weapon": [
    {
      "id": "sns:equipment:espada-chakra-branco",
      "label": "Espada de Chakra Branco",
      "weaponClass": "Leve",
      "ranged": false,
      "group": "especial"
    },
    {
      "id": "sns:equipment:aian-nakkuru",
      "label": "Aian Nakkuru",
      "weaponClass": "Leve",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:kousen",
      "label": "Kousen",
      "weaponClass": "Leve",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:nunchaku",
      "label": "Nunchaku",
      "weaponClass": "Leve",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:sai",
      "label": "Sai",
      "weaponClass": "Leve",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:wakizashi",
      "label": "Wakizashi",
      "weaponClass": "Leve",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:chicote",
      "label": "Chicote",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:chokuto",
      "label": "Chokutō",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:cimitarra",
      "label": "Cimitarra",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:corrente-com-cravos",
      "label": "Corrente com Cravos",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:espada-longa",
      "label": "Espada Longa",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:florete",
      "label": "Florete",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:katana",
      "label": "Katana",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:machado",
      "label": "Machado",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:martelo-de-guerra",
      "label": "Martelo de Guerra",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:foice",
      "label": "Foice",
      "weaponClass": "Longa",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:leque-gigante",
      "label": "Leque Gigante",
      "weaponClass": "Longa",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:espada-de-duas-laminas",
      "label": "Espada de Duas Lâminas",
      "weaponClass": "Pesada",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:espada-grande",
      "label": "Espada Grande",
      "weaponClass": "Pesada",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:machado-grande",
      "label": "Machado Grande",
      "weaponClass": "Pesada",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:fuuma-shuriken-gigante",
      "label": "Fuuma Shuriken: Gigante",
      "weaponClass": "",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:fuuma-shuriken-lamina-reta",
      "label": "Fuuma Shuriken: Lâmina Reta",
      "weaponClass": "",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:fuuma-shuriken-kage-fusha",
      "label": "Fuuma Shuriken: Kage Fushä",
      "weaponClass": "",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:arco-composto-longo",
      "label": "Arco Composto/Longo",
      "weaponClass": "",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:besta-pesada",
      "label": "Besta Pesada",
      "weaponClass": "",
      "ranged": true,
      "group": "marcial"
    }
  ],
  "combatStyle": [
    {
      "id": "desarmado",
      "label": "Desarmado"
    },
    {
      "id": "sns:equipment:kunai",
      "label": "Kunai",
      "weaponClass": "Leve",
      "ranged": true,
      "group": "simples"
    },
    {
      "id": "sns:equipment:shuriken",
      "label": "Shuriken",
      "weaponClass": "",
      "ranged": true,
      "group": "simples"
    },
    {
      "id": "sns:equipment:espada-chakra-branco",
      "label": "Espada de Chakra Branco",
      "weaponClass": "Leve",
      "ranged": false,
      "group": "especial"
    },
    {
      "id": "sns:equipment:espada-curta",
      "label": "Espada Curta",
      "weaponClass": "Leve",
      "ranged": false,
      "group": "simples"
    },
    {
      "id": "sns:equipment:tanto",
      "label": "Tantō",
      "weaponClass": "Leve",
      "ranged": false,
      "group": "simples"
    },
    {
      "id": "sns:equipment:tonfa",
      "label": "Tonfa",
      "weaponClass": "Leve",
      "ranged": false,
      "group": "simples"
    },
    {
      "id": "sns:equipment:clava",
      "label": "Clava",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "simples"
    },
    {
      "id": "sns:equipment:lanca",
      "label": "Lança",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "simples"
    },
    {
      "id": "sns:equipment:maca",
      "label": "Maça",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "simples"
    },
    {
      "id": "sns:equipment:ninja-to",
      "label": "Ninja-tō",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "simples"
    },
    {
      "id": "sns:equipment:bastao",
      "label": "Bastão",
      "weaponClass": "Longa",
      "ranged": false,
      "group": "simples"
    },
    {
      "id": "sns:equipment:pique",
      "label": "Pique",
      "weaponClass": "Longa",
      "ranged": false,
      "group": "simples"
    },
    {
      "id": "sns:equipment:tacape",
      "label": "Tacape",
      "weaponClass": "Pesada",
      "ranged": false,
      "group": "simples"
    },
    {
      "id": "sns:equipment:senbon",
      "label": "Senbon",
      "weaponClass": "",
      "ranged": true,
      "group": "simples"
    },
    {
      "id": "sns:equipment:arco-curto",
      "label": "Arco Curto",
      "weaponClass": "",
      "ranged": true,
      "group": "simples"
    },
    {
      "id": "sns:equipment:besta-leve",
      "label": "Besta Leve",
      "weaponClass": "",
      "ranged": true,
      "group": "simples"
    },
    {
      "id": "sns:equipment:aian-nakkuru",
      "label": "Aian Nakkuru",
      "weaponClass": "Leve",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:kousen",
      "label": "Kousen",
      "weaponClass": "Leve",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:nunchaku",
      "label": "Nunchaku",
      "weaponClass": "Leve",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:sai",
      "label": "Sai",
      "weaponClass": "Leve",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:wakizashi",
      "label": "Wakizashi",
      "weaponClass": "Leve",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:chicote",
      "label": "Chicote",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:chokuto",
      "label": "Chokutō",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:cimitarra",
      "label": "Cimitarra",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:corrente-com-cravos",
      "label": "Corrente com Cravos",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:espada-longa",
      "label": "Espada Longa",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:florete",
      "label": "Florete",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:katana",
      "label": "Katana",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:machado",
      "label": "Machado",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:martelo-de-guerra",
      "label": "Martelo de Guerra",
      "weaponClass": "Mediana",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:foice",
      "label": "Foice",
      "weaponClass": "Longa",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:leque-gigante",
      "label": "Leque Gigante",
      "weaponClass": "Longa",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:espada-de-duas-laminas",
      "label": "Espada de Duas Lâminas",
      "weaponClass": "Pesada",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:espada-grande",
      "label": "Espada Grande",
      "weaponClass": "Pesada",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:machado-grande",
      "label": "Machado Grande",
      "weaponClass": "Pesada",
      "ranged": false,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:fuuma-shuriken-gigante",
      "label": "Fuuma Shuriken: Gigante",
      "weaponClass": "",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:fuuma-shuriken-lamina-reta",
      "label": "Fuuma Shuriken: Lâmina Reta",
      "weaponClass": "",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:fuuma-shuriken-kage-fusha",
      "label": "Fuuma Shuriken: Kage Fushä",
      "weaponClass": "",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:arco-composto-longo",
      "label": "Arco Composto/Longo",
      "weaponClass": "",
      "ranged": true,
      "group": "marcial"
    },
    {
      "id": "sns:equipment:besta-pesada",
      "label": "Besta Pesada",
      "weaponClass": "",
      "ranged": true,
      "group": "marcial"
    }
  ],
  "weaponClass": [
    {
      "id": "leve",
      "label": "Leves"
    },
    {
      "id": "mediana",
      "label": "Medianas"
    },
    {
      "id": "longa",
      "label": "Longas"
    },
    {
      "id": "pesada",
      "label": "Pesadas"
    }
  ],
  "shooter": [
    {
      "id": "arcos",
      "label": "Arcos"
    },
    {
      "id": "arremesso",
      "label": "Arremesso"
    }
  ],
  "sensor": [
    {
      "id": "chakra",
      "label": "Chakra"
    },
    {
      "id": "solo",
      "label": "Detecção pelo Solo"
    },
    {
      "id": "olfato",
      "label": "Olfato"
    }
  ],
  "powerOrTechnique": [
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
    }
  ],
  "damageCategory": [
    {
      "id": "desarmado",
      "label": "Combate desarmado"
    },
    {
      "id": "naturais",
      "label": "Armas naturais"
    },
    {
      "id": "disparo",
      "label": "Armas de disparo"
    },
    {
      "id": "arremesso",
      "label": "Armas de arremesso"
    },
    {
      "id": "leve",
      "label": "Armas leves"
    },
    {
      "id": "mediana",
      "label": "Armas medianas"
    },
    {
      "id": "longa",
      "label": "Armas longas"
    },
    {
      "id": "pesada",
      "label": "Armas pesadas"
    },
    {
      "id": "especial",
      "label": "Armas especiais"
    }
  ]
});
