// Fixed book requirements by canonical identity. Owned descriptions/details cannot lower them.
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const EQUIPMENT_DEFINITIONS=freeze({
  "sns:equipment:kubikiribocho": {name:"Kubikiribōchō",pages:"Hijutsus 87–88",requirements:[{anyAttributes:["for"],min:12}],acuity:false,training:"especial"},
  "sns:equipment:espada-curta": {
    "name": "Espada Curta",
    "pages": "128, 131, 137",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 8
      }
    ],
    "acuity": true,
    "training": "simples"
  },
  "sns:equipment:tanto": {
    "name": "Tantō",
    "pages": "128, 134, 137",
    "requirements": [],
    "acuity": true,
    "training": "simples"
  },
  "sns:equipment:tonfa": {
    "name": "Tonfa",
    "pages": "128, 135, 137",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 8
      }
    ],
    "acuity": true,
    "training": "simples"
  },
  "sns:equipment:clava": {
    "name": "Clava",
    "pages": "128, 131, 137",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": false,
    "training": "simples"
  },
  "sns:equipment:lanca": {
    "name": "Lança",
    "pages": "128, 132, 137",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": false,
    "training": "simples"
  },
  "sns:equipment:maca": {
    "name": "Maça",
    "pages": "128, 133, 137",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": false,
    "training": "simples"
  },
  "sns:equipment:ninja-to": {
    "name": "Ninja-tō",
    "pages": "128, 133, 137",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": true,
    "training": "simples"
  },
  "sns:equipment:bastao": {
    "name": "Bastão",
    "pages": "128, 130, 137",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": true,
    "training": "simples"
  },
  "sns:equipment:pique": {
    "name": "Pique",
    "pages": "128, 133, 137",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": false,
    "training": "simples"
  },
  "sns:equipment:tacape": {
    "name": "Tacape",
    "pages": "128, 134, 137",
    "requirements": [
      {
        "attribute": "for",
        "min": 12
      }
    ],
    "acuity": false,
    "training": "simples"
  },
  "sns:equipment:senbon": {
    "name": "Senbon",
    "pages": "128, 133, 134, 137",
    "requirements": [],
    "acuity": true,
    "training": "simples"
  },
  "sns:equipment:shuriken": {
    "name": "Shuriken",
    "pages": "128, 134, 137",
    "requirements": [],
    "acuity": false,
    "training": "simples"
  },
  "sns:equipment:kunai": {
    "name": "Kunai",
    "pages": "128, 132, 137",
    "requirements": [],
    "acuity": true,
    "training": "simples"
  },
  "sns:equipment:arco-curto": {
    "name": "Arco Curto",
    "pages": "128, 130, 138",
    "requirements": [
      {
        "attribute": "des",
        "min": 8
      }
    ],
    "acuity": false,
    "training": "simples"
  },
  "sns:equipment:besta-leve": {
    "name": "Besta Leve",
    "pages": "128, 130, 138",
    "requirements": [
      {
        "attribute": "des",
        "min": 8
      }
    ],
    "acuity": false,
    "training": "simples"
  },
  "sns:equipment:aian-nakkuru": {
    "name": "Aian Nakkuru",
    "pages": "128, 130, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": true,
    "training": "marcial"
  },
  "sns:equipment:kousen": {
    "name": "Kousen",
    "pages": "128, 132, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 8
      }
    ],
    "acuity": true,
    "training": "marcial"
  },
  "sns:equipment:nunchaku": {
    "name": "Nunchaku",
    "pages": "128, 133, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 8
      }
    ],
    "acuity": true,
    "training": "marcial"
  },
  "sns:equipment:sai": {
    "name": "Sai",
    "pages": "128, 133, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 8
      }
    ],
    "acuity": true,
    "training": "marcial"
  },
  "sns:equipment:wakizashi": {
    "name": "Wakizashi",
    "pages": "128, 135, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 8
      }
    ],
    "acuity": true,
    "training": "marcial"
  },
  "sns:equipment:chicote": {
    "name": "Chicote",
    "pages": "128, 131, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": true,
    "training": "marcial"
  },
  "sns:equipment:chokuto": {
    "name": "Chokutō",
    "pages": "128, 131, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": true,
    "training": "marcial"
  },
  "sns:equipment:cimitarra": {
    "name": "Cimitarra",
    "pages": "128, 131, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:corrente-com-cravos": {
    "name": "Corrente com Cravos",
    "pages": "128, 131, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:espada-longa": {
    "name": "Espada Longa",
    "pages": "128, 131, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:florete": {
    "name": "Florete",
    "pages": "128, 131, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": true,
    "training": "marcial"
  },
  "sns:equipment:katana": {
    "name": "Katana",
    "pages": "128, 132, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": true,
    "training": "marcial"
  },
  "sns:equipment:machado": {
    "name": "Machado",
    "pages": "128, 133, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:martelo-de-guerra": {
    "name": "Martelo de Guerra",
    "pages": "128, 133, 138",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:foice": {
    "name": "Foice",
    "pages": "128, 131, 139",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:leque-gigante": {
    "name": "Leque Gigante",
    "pages": "128, 133, 139",
    "requirements": [
      {
        "attribute": "des",
        "min": 8
      }
    ],
    "acuity": true,
    "training": "marcial"
  },
  "sns:equipment:espada-de-duas-laminas": {
    "name": "Espada de Duas Lâminas",
    "pages": "128, 131, 139",
    "requirements": [
      {
        "attribute": "for",
        "min": 12
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:espada-grande": {
    "name": "Espada Grande",
    "pages": "128, 131, 139",
    "requirements": [
      {
        "attribute": "for",
        "min": 12
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:machado-grande": {
    "name": "Machado Grande",
    "pages": "128, 133, 139",
    "requirements": [
      {
        "attribute": "for",
        "min": 12
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:fuuma-shuriken-gigante": {
    "name": "Fuuma Shuriken: Gigante",
    "pages": "128, 131, 139",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 12
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:fuuma-shuriken-lamina-reta": {
    "name": "Fuuma Shuriken: Lâmina Reta",
    "pages": "128, 131, 132, 139",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 10
      },
      {
        "ownedRule": "sns:apt:ponto-cego",
        "label": "Ponto Cego"
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:fuuma-shuriken-kage-fusha": {
    "name": "Fuuma Shuriken: Kage Fushä",
    "pages": "128, 131, 132, 139",
    "requirements": [
      {
        "anyAttributes": [
          "for",
          "des"
        ],
        "min": 8
      },
      {
        "ownedRule": "sns:apt:ponto-cego",
        "label": "Ponto Cego"
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:arco-composto-longo": {
    "name": "Arco Composto/Longo",
    "pages": "128, 130, 139",
    "requirements": [
      {
        "attribute": "des",
        "min": 10
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:besta-pesada": {
    "name": "Besta Pesada",
    "pages": "128, 130, 139",
    "requirements": [
      {
        "attribute": "des",
        "min": 10
      }
    ],
    "acuity": false,
    "training": "marcial"
  },
  "sns:equipment:roupa-comum": {
    "name": "Roupa Comum",
    "pages": "135, 139",
    "requirements": []
  },
  "sns:equipment:manopla": {
    "name": "Manopla",
    "pages": "135, 136, 139",
    "requirements": []
  },
  "sns:equipment:colete-ninja": {
    "name": "Colete Ninja",
    "pages": "135, 139",
    "requirements": []
  },
  "sns:equipment:colete-ninja-resistente": {
    "name": "Colete Ninja Resistente",
    "pages": "135, 136, 139",
    "requirements": []
  },
  "sns:equipment:armadura-de-batalha": {
    "name": "Armadura de Batalha",
    "pages": "135, 136, 139",
    "requirements": [
      {
        "alternatives": [
          {
            "attribute": "for",
            "min": 10
          },
          {
            "attribute": "vig",
            "min": 15
          }
        ]
      }
    ]
  },
  "sns:equipment:armadura-de-batalha-reforcada": {
    "name": "Armadura de Batalha Reforçada",
    "pages": "135, 136, 139",
    "requirements": [
      {
        "alternatives": [
          {
            "attribute": "for",
            "min": 10
          },
          {
            "attribute": "vig",
            "min": 15
          }
        ]
      }
    ]
  },
  "sns:equipment:espada-chakra-branco": {
    "name": "Espada de Chakra Branco",
    "pages": "156",
    "requirements": [
      {
        "attribute": "des",
        "min": 8
      }
    ],
    "acuity": true
  },
  "sns:jutsu:armadura-a-vapor": {"name":"Armadura a Vapor","pages":"Hijutsus43","requirements":[{"alternatives":[{"attribute":"for","min":10},{"attribute":"vig","min":15}]},{"ownedRule":"sns:apt:usar-armaduras-pesadas","label":"Usar Armaduras Pesadas"}]}
});
