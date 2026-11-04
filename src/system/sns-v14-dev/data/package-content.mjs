// Literal T03/T05 publication identities; tags never confer access.
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const PACKAGE_ORIGINS=freeze({
  "aburame": {
    "name": "Clã Aburame",
    "contentId": "sns:clan:aburame",
    "primary": true,
    "related": [
      "Kikaichuu",
      "Shōkaichuu",
      "Kidaichuu",
      "Rinkaichuu",
      "Kikai Ninpou"
    ],
    "source": "F01"
  },
  "akimichi": {
    "name": "Clã Akimichi",
    "contentId": "sns:clan:akimichi",
    "primary": true,
    "related": [
      "Corpulência",
      "Resiliência",
      "Baika Ninpou",
      "Controle de Caloria",
      "Sanshoku no Gan’yaku"
    ],
    "source": "F01"
  },
  "hatake": {
    "name": "Clã Hatake",
    "contentId": "sns:clan:hatake",
    "primary": true,
    "related": [
      "Kuchiyose Restrito: Cães",
      "Tensai",
      "Presa de Prata",
      "Espada de Chakra Branco"
    ],
    "source": "F01"
  },
  "hyuuga": {
    "name": "Clã Hyuuga",
    "contentId": "sns:clan:hyuuga",
    "primary": true,
    "related": [
      "Byakugan",
      "Tenketsu Byakugan",
      "Juuken"
    ],
    "source": "F01"
  },
  "inuzuka": {
    "name": "Clã Inuzuka",
    "contentId": "sns:clan:inuzuka",
    "primary": true,
    "related": [
      "Companheiro Animal",
      "Hakken no Jutsu",
      "Shikakyu"
    ],
    "source": "F01"
  },
  "nara": {
    "name": "Clã Nara",
    "contentId": "sns:clan:nara",
    "primary": true,
    "related": [
      "Kagejutsu"
    ],
    "source": "F01"
  },
  "sarutobi": {
    "name": "Clã Sarutobi",
    "contentId": "sns:clan:sarutobi",
    "primary": true,
    "related": [
      "Kuchiyose Restrito: Macacos",
      "Tensai",
      "Vontade do Fogo"
    ],
    "source": "F01"
  },
  "senju": {
    "name": "Clã Senju",
    "contentId": "sns:clan:senju",
    "primary": true,
    "related": [
      "Mokuton",
      "Maximizar",
      "Regeneração",
      "Senjutsu",
      "Tensai"
    ],
    "source": "F01"
  },
  "uchiha": {
    "name": "Clã Uchiha",
    "contentId": "sns:clan:uchiha",
    "primary": true,
    "related": [
      "Elemento Natural: Katon",
      "Sharingan",
      "Nidan Sharingan",
      "Sandan Sharingan",
      "Mangekyou Sharingan"
    ],
    "source": "F01"
  },
  "uzumaki": {
    "name": "Clã Uzumaki",
    "contentId": "sns:clan:uzumaki",
    "primary": true,
    "related": [
      "Regeneração",
      "Chakra Expandido",
      "Mil Clones",
      "Kongou Fuusa",
      "Kagura Shingan"
    ],
    "source": "F01"
  },
  "yamanaka": {
    "name": "Clã Yamanaka",
    "contentId": "sns:clan:yamanaka",
    "primary": true,
    "related": [
      "Shindenshin"
    ],
    "source": "F01"
  },
  "dokujutsu": {
    "name": "Dokujutsu",
    "contentId": "sns:hijutsu:dokujutsu",
    "primary": true,
    "related": [
      "Dokujutsu",
      "Veneno Melhorado"
    ],
    "source": "F03"
  },
  "hachimon-tonkou": {
    "name": "Hachimon Tonkou",
    "contentId": "sns:hijutsu:hachimon-tonkou",
    "primary": false,
    "related": [
      "Hachimon Tonkou",
      "Estilo da Lótus"
    ],
    "source": "F01"
  },
  "taijutsu-de-konoha": {
    "name": "Taijutsu de Konoha",
    "contentId": "sns:feature:taijutsu-de-konoha",
    "primary": false,
    "related": [
      "Gouken",
      "Konoha Reppū",
      "Konoha Senpū",
      "Konoha Daisenpū",
      "Konoha Shōfū",
      "Kage Buyō",
      "Omote Renge",
      "Shishi Rendan",
      "Ura Renge",
      "Asa Kujaku",
      "Hirudora",
      "Sekizō",
      "Yagai"
    ],
    "source": "F01"
  },
  "hibon-ninpou": {
    "name": "Hibon Ninpou",
    "contentId": "sns:hijutsu:hibon-ninpou",
    "primary": true,
    "related": [
      "Hibon Ninpou"
    ],
    "source": "F01"
  },
  "kyuubi": {
    "name": "Kyuubi",
    "contentId": "sns:feature:kyuubi",
    "primary": false,
    "related": [
      "Cura da Raposa",
      "Modo Kurama"
    ],
    "source": "F02"
  },
  "kagura-shingan": {
    "name": "Kagura Shingan",
    "contentId": "sns:hijutsu:kagura-shingan",
    "primary": true,
    "related": [
      "Kagura Shingan",
      "Ryoushitsu Kagura Shingan"
    ],
    "source": "F01"
  },
  "kuchiyose-aguias": {
    "name": "Kuchiyose: Águias",
    "contentId": "sns:feature:kuchiyose-aguias",
    "primary": false,
    "related": [],
    "source": "F01",
    "species": "aguias"
  },
  "kuchiyose-caes": {
    "name": "Kuchiyose: Cães",
    "contentId": "sns:feature:kuchiyose-caes",
    "primary": false,
    "related": [],
    "source": "F01",
    "species": "caes"
  },
  "kuchiyose-cobras": {
    "name": "Kuchiyose: Cobras",
    "contentId": "sns:feature:kuchiyose-cobras",
    "primary": false,
    "related": [],
    "source": "F01",
    "species": "cobras"
  },
  "kuchiyose-lesmas": {
    "name": "Kuchiyose: Lesmas",
    "contentId": "sns:feature:kuchiyose-lesmas",
    "primary": false,
    "related": [],
    "source": "F01",
    "species": "lesmas"
  },
  "kuchiyose-macacos": {
    "name": "Kuchiyose: Macaco",
    "contentId": "sns:feature:kuchiyose-macacos",
    "primary": false,
    "related": [
      "Kuchiyose: Macaco",
      "Henge: Kongōnyoi"
    ],
    "source": "F03",
    "species": "macacos"
  },
  "kuchiyose-sapos": {
    "name": "Kuchiyose: Sapos",
    "contentId": "sns:feature:kuchiyose-sapos",
    "primary": false,
    "related": [],
    "source": "F01",
    "species": "sapos"
  },
  "magen": {
    "name": "Magen",
    "contentId": "sns:hijutsu:magen",
    "primary": true,
    "related": [
      "Magen",
      "Ilusão Fluida"
    ],
    "source": "F01"
  },
  "senjutsu": {
    "name": "Senjutsu",
    "contentId": "sns:hijutsu:senjutsu",
    "primary": false,
    "related": [
      "Senjutsu1",
      "Senjutsu2",
      "Senjutsu3",
      "Gyaku Kuchiyose",
      "Ryousei no Jutsu"
    ],
    "source": "F03"
  },
  "tensai": {
    "name": "Tensai",
    "contentId": "sns:hijutsu:tensai",
    "primary": true,
    "related": [
      "Versatilidade",
      "Hibon Ninpou",
      "Aprendizagem Rápida",
      "Talento Natural",
      "Técnica Avançada",
      "Capacidade",
      "Controle Perfeito",
      "Instinto de Batalha",
      "Deus do Trovão",
      "Presa de Prata",
      "Vontade do Fogo",
      "Maximizar"
    ],
    "source": "F01"
  },
  "fuuma": {
    "name": "Clã Fuuma",
    "contentId": "sns:clan:fuuma",
    "primary": true,
    "related": [
      "Tensai",
      "Demônio do Vento"
    ],
    "source": "F02"
  },
  "hoshigaki": {
    "name": "Clã Hoshigaki",
    "contentId": "sns:clan:hoshigaki",
    "primary": true,
    "related": [
      "Chakra Expandido",
      "Predador Aquático",
      "Elemento Natural: Suiton",
      "Reserva de Água",
      "Kuchiyose comum: Tubarões"
    ],
    "source": "F02"
  },
  "hozuki": {
    "name": "Clã Hozuki",
    "contentId": "sns:clan:hozuki",
    "primary": true,
    "related": [
      "Suika no Jutsu",
      "Braço de Água"
    ],
    "source": "F02"
  },
  "kaguya": {
    "name": "Clã Kaguya",
    "contentId": "sns:clan:kaguya",
    "primary": true,
    "related": [
      "Artesão de Ossos",
      "Armadura Óssea",
      "Regeneração",
      "Danças de Ossos"
    ],
    "source": "F02"
  },
  "yotsuki": {
    "name": "Clã Yotsuki",
    "contentId": "sns:clan:yotsuki",
    "primary": true,
    "related": [
      "Tensai",
      "Lâmina da Lua"
    ],
    "source": "F02"
  },
  "yuki": {
    "name": "Clã Yuki",
    "contentId": "sns:clan:yuki",
    "primary": true,
    "related": [
      "Hyouton",
      "Selos Especiais",
      "Congelamento"
    ],
    "source": "F02"
  },
  "ichibi-sabaku": {
    "name": "Ichibi / Sabaku",
    "contentId": "sns:feature:ichibi-sabaku",
    "primary": false,
    "related": [
      "Sabaku",
      "Areia Especial",
      "Areia Suspensa"
    ],
    "source": "F02"
  },
  "nibi-aoi-katon": {
    "name": "Nibi / Aoi Katon",
    "contentId": "sns:feature:nibi-aoi-katon",
    "primary": false,
    "related": [
      "Aoi Katon",
      "Nekozume"
    ],
    "source": "F02"
  },
  "sanbi-sanbi-suiton": {
    "name": "Sanbi / Sanbi Suiton",
    "contentId": "sns:feature:sanbi-sanbi-suiton",
    "primary": false,
    "related": [
      "Sanbi Suiton",
      "Sangoshō",
      "Espelho d’Água"
    ],
    "source": "F02"
  },
  "yonbi-yonbi-youton": {
    "name": "Yonbi / Yonbi Youton",
    "contentId": "sns:feature:yonbi-yonbi-youton",
    "primary": false,
    "related": [
      "Yonbi Youton",
      "Manto de Lava",
      "Vulcão"
    ],
    "source": "F02"
  },
  "gobi-gobi-futton": {
    "name": "Gobi / Gobi Futton",
    "contentId": "sns:feature:gobi-gobi-futton",
    "primary": false,
    "related": [
      "Gobi Futton",
      "Armadura a Vapor"
    ],
    "source": "F02"
  },
  "rokubi-rokubi-suiton": {
    "name": "Rokubi / Rokubi Suiton",
    "contentId": "sns:feature:rokubi-rokubi-suiton",
    "primary": false,
    "related": [
      "Rokubi Suiton",
      "Bolhas de Sabão"
    ],
    "source": "F02"
  },
  "nanabi": {
    "name": "Nanabi",
    "contentId": "sns:feature:nanabi",
    "primary": false,
    "related": [
      "Pó de Escamas",
      "Teia de Chakra",
      "Casulo"
    ],
    "source": "F02"
  },
  "hachibi": {
    "name": "Hachibi",
    "contentId": "sns:feature:hachibi",
    "primary": false,
    "related": [
      "Sumi",
      "Kawarimi de Cauda",
      "Selo do Tornado"
    ],
    "source": "F02"
  },
  "jiton": {
    "name": "Jiton II",
    "contentId": "sns:hijutsu:jiton",
    "primary": true,
    "related": [
      "Sakin",
      "Peso do Ouro",
      "Satetsu",
      "Marca de Ferro",
      "Areia Especial"
    ],
    "source": "F04"
  },
  "juuinka": {
    "name": "Juuinka",
    "contentId": "sns:hijutsu:juuinka",
    "primary": false,
    "related": [
      "Juuin",
      "Joutai Ichi",
      "Joutai Ni"
    ],
    "source": "F02"
  },
  "kamijutsu": {
    "name": "Kamijutsu",
    "contentId": "sns:hijutsu:kamijutsu",
    "primary": true,
    "related": [
      "Kami",
      "Shikigami no Mai"
    ],
    "source": "F02"
  },
  "nintaijutsu": {
    "name": "Nintaijutsu",
    "contentId": "sns:hijutsu:nintaijutsu",
    "primary": true,
    "related": [
      "Nintaijutsu",
      "Armadura de Relâmpago"
    ],
    "source": "F02"
  },
  "rinnegan": {
    "name": "Rinnegan",
    "contentId": "sns:hijutsu:rinnegan",
    "primary": true,
    "related": [
      "Rinnegan",
      "Rinne Ninpou",
      "Shurado",
      "Jigokudo",
      "Ningendo",
      "Gakido",
      "Chikushodo",
      "Tendo",
      "Gedo"
    ],
    "source": "F02"
  },
  "samurai": {
    "name": "Samurai",
    "contentId": "sns:hijutsu:samurai",
    "primary": true,
    "related": [
      "Espadachim",
      "Sabre de Chakra",
      "Iaido",
      "Yojin",
      "Issen",
      "Impedir",
      "Iaigiri",
      "Armadura Completa"
    ],
    "source": "F02"
  },
  "senninka": {
    "name": "Senninka",
    "contentId": "sns:hijutsu:senninka",
    "primary": true,
    "related": [
      "Senninka",
      "Transformação Parcial",
      "Transformação Completa",
      "Transferência de Células"
    ],
    "source": "F02"
  },
  "kuchiyose-tubarao": {
    "name": "Kuchiyose: Tubarões",
    "contentId": "sns:feature:kuchiyose-tubarao",
    "primary": false,
    "related": [
      "Kuchiyose comum: Tubarões"
    ],
    "source": "F02",
    "species": "tubaroes"
  },
  "saika-ikki": {
    "name": "Saika Ikki",
    "contentId": "sns:hijutsu:saika-ikki",
    "primary": true,
    "related": [
      "Disparos Sujos",
      "Recarga Precisa",
      "Gun Fu",
      "Mira Vital",
      "Armamento Pesado",
      "Alcance Estendido",
      "Atirador Ágil"
    ],
    "source": "F03"
  },
  "aoi-katon-independente": {
    "name": "Aoi Katon independente",
    "contentId": "sns:feature:aoi-katon-independente",
    "primary": false,
    "related": [
      "Aoi Katon",
      "Nekozume",
      "aptidões limitadas de Tensai"
    ],
    "source": "F03"
  },
  "sanbi-suiton-independente": {
    "name": "Sanbi Suiton independente",
    "contentId": "sns:feature:sanbi-suiton-independente",
    "primary": false,
    "related": [
      "Sanbi Suiton",
      "Sangoshō",
      "Espelho d’Água",
      "aptidão limitada de Tensai"
    ],
    "source": "F03"
  },
  "yonbi-youton-independente": {
    "name": "Yonbi Youton independente",
    "contentId": "sns:feature:yonbi-youton-independente",
    "primary": false,
    "related": [
      "Yonbi Youton",
      "Manto de Lava",
      "Vulcão",
      "aptidão limitada de Tensai"
    ],
    "source": "F03"
  },
  "gobi-futton-independente": {
    "name": "Gobi Futton independente",
    "contentId": "sns:feature:gobi-futton-independente",
    "primary": false,
    "related": [
      "Gobi Futton",
      "Armadura a Vapor",
      "aptidão limitada de Tensai"
    ],
    "source": "F03"
  },
  "rokubi-suiton-independente": {
    "name": "Rokubi Suiton independente",
    "contentId": "sns:feature:rokubi-suiton-independente",
    "primary": false,
    "related": [
      "Rokubi Suiton",
      "Soprador de Bolhas",
      "aptidão limitada de Tensai"
    ],
    "source": "F03"
  },
  "shimura": {
    "name": "Clã Shimura",
    "contentId": "sns:clan:shimura",
    "primary": true,
    "related": [
      "Elemento Natural: Fuuton",
      "Kuchiyose: Baku",
      "Tensai limitado",
      "Shimura Juinjutsu"
    ],
    "source": "F04"
  },
  "uchiha-izanami-e-izanagi": {
    "name": "Uchiha: Izanami e Izanagi",
    "contentId": "sns:feature:uchiha-izanami-e-izanagi",
    "primary": false,
    "related": [
      "Izanami",
      "Izanagi"
    ],
    "source": "F04"
  },
  "uzumaki-chakra-da-cura": {
    "name": "Uzumaki: Chakra da Cura",
    "contentId": "sns:feature:uzumaki-chakra-da-cura",
    "primary": false,
    "related": [
      "Regeneração de Vigor"
    ],
    "source": "F04"
  },
  "hoshigakure": {
    "name": "Clã Hoshigakure",
    "contentId": "sns:clan:hoshigakure",
    "primary": true,
    "related": [
      "Chakra Expandido",
      "Kujaku Myoho",
      "Kujaku: Cura",
      "Kujaku: Saimin",
      "Kujaku: Sacrifício"
    ],
    "source": "F04"
  },
  "bakuton": {
    "name": "Bakuton",
    "contentId": "sns:hijutsu:bakuton",
    "primary": true,
    "related": [
      "Bakuton",
      "Demolição"
    ],
    "source": "F04"
  },
  "buki-senmon": {
    "name": "Buki Senmon",
    "contentId": "sns:hijutsu:buki-senmon",
    "primary": true,
    "related": [
      "Usar Arma: Arsenal",
      "Acuidade Perfeita",
      "Arsenal Completo",
      "Mestre de Manobras",
      "Instinto de Batalha"
    ],
    "source": "F04"
  },
  "chouju-giga": {
    "name": "Chouju-Giga",
    "contentId": "sns:hijutsu:chouju-giga",
    "primary": true,
    "related": [
      "Arte de Combate",
      "Sumi Ninpou",
      "Pergaminho da Super Besta",
      "Sumi Bunshin"
    ],
    "source": "F04"
  },
  "daikiga": {
    "name": "Daikiga",
    "contentId": "sns:hijutsu:daikiga",
    "primary": true,
    "related": [
      "Resistência Insaciável",
      "Ingestão de Chakra",
      "Rakanken",
      "Terra Insaciável"
    ],
    "source": "F04"
  },
  "gorudogumo": {
    "name": "Gorudogumo",
    "contentId": "sns:hijutsu:gorudogumo",
    "primary": true,
    "related": [
      "Seis Braços",
      "Ouro Pegajoso",
      "Olho de Aranha",
      "Kumo Ninpou",
      "Kuchiyose comum: Aranhas"
    ],
    "source": "F04"
  },
  "hebinomichi": {
    "name": "Hebinomichi",
    "contentId": "sns:hijutsu:hebinomichi",
    "primary": true,
    "related": [
      "Possessão da Serpente Branca",
      "Hebi Ninpou",
      "Yamata no Jutsu"
    ],
    "source": "F04"
  },
  "jashin-juusha": {
    "name": "Jashin Juusha",
    "contentId": "sns:hijutsu:jashin-juusha",
    "primary": true,
    "related": [
      "Regeneração",
      "Usar Armas de Jashin",
      "Ritual de Conexão",
      "Imortalidade",
      "Combatente Sádico",
      "Jashinista Experiente"
    ],
    "source": "F04"
  },
  "jingokuon": {
    "name": "Jingokuon",
    "contentId": "sns:hijutsu:jingokuon",
    "primary": true,
    "related": [
      "Ototon",
      "Sensibilidade Auditiva",
      "Tubos de Ar",
      "Kyoumei Supika",
      "Reverberação"
    ],
    "source": "F04"
  },
  "jiongu": {
    "name": "Jiongu",
    "contentId": "sns:hijutsu:jiongu",
    "primary": true,
    "related": [
      "Corpo de Fios",
      "Jiongu",
      "Chakra Expandido Jiongu",
      "Hasukonsutoraku"
    ],
    "source": "F04"
  },
  "kakuran-tensai": {
    "name": "Kakuran Tensai",
    "contentId": "sns:feature:kakuran-tensai",
    "primary": false,
    "related": [
      "Kakuran Taijutsu",
      "Espadas Super-Vibrantes",
      "Akurobatto"
    ],
    "source": "F04"
  },
  "kekkei-touta-jinton": {
    "name": "Kekkei Touta: Jinton",
    "contentId": "sns:hijutsu:kekkei-touta-jinton",
    "primary": true,
    "related": [
      "Jinton",
      "Maximizar",
      "Elemento Natural: Terra",
      "Fissão",
      "Apagar Presença"
    ],
    "source": "F04"
  },
  "kibaku-nendo": {
    "name": "Kibaku Nendo",
    "contentId": "sns:hijutsu:kibaku-nendo",
    "primary": true,
    "related": [
      "Kibaku Nendo",
      "Boca de Moldagem"
    ],
    "source": "F04"
  },
  "kuchiyose-doninha": {
    "name": "Kuchiyose: Doninha",
    "contentId": "sns:feature:kuchiyose-doninha",
    "primary": false,
    "related": [
      "Kuchiyose: Doninha",
      "Kirikiri Mai"
    ],
    "source": "F04",
    "species": "doninha"
  },
  "kuchiyose-marisco": {
    "name": "Kuchiyose: Marisco",
    "contentId": "sns:feature:kuchiyose-marisco",
    "primary": false,
    "related": [
      "Kuchiyose: Marisco",
      "Magen: Kijō no Rōkaku"
    ],
    "source": "F04",
    "species": "marisco"
  },
  "kuchiyose-salamandra": {
    "name": "Kuchiyose: Salamandra",
    "contentId": "sns:feature:kuchiyose-salamandra",
    "primary": false,
    "related": [
      "Kuchiyose: Salamandra",
      "Dokugiri",
      "Engolimento"
    ],
    "source": "F04",
    "species": "salamandra"
  },
  "kuchiyose-tartaruga": {
    "name": "Kuchiyose: Tartaruga",
    "contentId": "sns:feature:kuchiyose-tartaruga",
    "primary": false,
    "related": [
      "Kuchiyose: Tartaruga"
    ],
    "source": "F04",
    "species": "tartaruga"
  },
  "kugutsu": {
    "name": "Kugutsu",
    "contentId": "sns:hijutsu:kugutsu",
    "primary": true,
    "related": [
      "Kugutsu",
      "Estrangular",
      "Kurohigi",
      "Shirohigi",
      "Akahigi",
      "Hitokugutsu"
    ],
    "source": "F04"
  },
  "kuroi-kaminari": {
    "name": "Kuroi Kaminari",
    "contentId": "sns:feature:kuroi-kaminari",
    "primary": false,
    "related": [
      "Relâmpago Negro"
    ],
    "source": "F04"
  },
  "mateki": {
    "name": "Mateki",
    "contentId": "sns:hijutsu:mateki",
    "primary": true,
    "related": [
      "Flautista",
      "Ilusões Avançadas",
      "Kuchiyose comum: Doki"
    ],
    "source": "F04"
  },
  "mei-kekkei-genkai": {
    "name": "Mei Kekkei Genkai",
    "contentId": "sns:hijutsu:mei-kekkei-genkai",
    "primary": true,
    "related": [
      "Futton",
      "Youton",
      "Futton Sufocante",
      "Youton Corrosivo",
      "Dupla Linhagem"
    ],
    "source": "F04"
  },
  "nan-no-kaizou": {
    "name": "Nan no Kaizou",
    "contentId": "sns:feature:nan-no-kaizou",
    "primary": false,
    "related": [
      "Extração Energética",
      "Manipulação Física"
    ],
    "source": "F04"
  },
  "ranton": {
    "name": "Ranton",
    "contentId": "sns:hijutsu:ranton",
    "primary": true,
    "related": [
      "Ranton",
      "Efeito Estroboscópio",
      "acesso Relâmpago Negro"
    ],
    "source": "F04"
  },
  "rinbo-hengoku": {
    "name": "Rinbo: Hengoku",
    "contentId": "sns:feature:rinbo-hengoku",
    "primary": false,
    "related": [
      "Rinbo: Hengoku"
    ],
    "source": "F04"
  },
  "shakuton": {
    "name": "Shakuton",
    "contentId": "sns:hijutsu:shakuton",
    "primary": true,
    "related": [
      "Shakuton",
      "Mumificar"
    ],
    "source": "F04"
  },
  "shouton": {
    "name": "Shouton",
    "contentId": "sns:hijutsu:shouton",
    "primary": true,
    "related": [
      "Shouton",
      "Cristal Guiado",
      "Barreira Regenerativa",
      "Congelamento",
      "Cristalização"
    ],
    "source": "F04"
  },
  "souma-no-jutsu": {
    "name": "Souma no Jutsu",
    "contentId": "sns:hijutsu:souma-no-jutsu",
    "primary": true,
    "related": [
      "Souma no Kou1/2/3",
      "Regeneração Gêmea"
    ],
    "source": "F04"
  },
  "tessenjutsu": {
    "name": "Tessenjutsu",
    "contentId": "sns:hijutsu:tessenjutsu",
    "primary": true,
    "related": [
      "Mestre dos Leques",
      "Brisa de Navalha",
      "Capacidade dos Ventos"
    ],
    "source": "F04"
  },
  "zetsu-seitai": {
    "name": "Zetsu Seitai",
    "contentId": "sns:hijutsu:zetsu-seitai",
    "primary": true,
    "related": [
      "Anatomia Zetsu1/2/3",
      "Clone Zetsu",
      "Elementos Irrestritos",
      "Mokuton"
    ],
    "source": "F04"
  },
  "kuchiyose-baku": {
    "name": "Kuchiyose: Baku",
    "contentId": "sns:feature:kuchiyose-baku",
    "primary": false,
    "related": [
      "Kuchiyose: Baku"
    ],
    "source": "F04",
    "species": "baku"
  },
  "kuchiyose-doki": {
    "name": "Kuchiyose: Doki",
    "contentId": "sns:feature:kuchiyose-doki",
    "primary": false,
    "related": [
      "Kuchiyose comum: Doki"
    ],
    "source": "F04",
    "species": "doki"
  },
  "desenhos-pergaminho-da-super-besta": {
    "name": "Desenhos: Pergaminho da Super Besta",
    "contentId": "sns:feature:desenhos-pergaminho-da-super-besta",
    "primary": false,
    "related": [
      "Pergaminho da Super Besta"
    ],
    "source": "F04"
  },
  "hb-f05-doujutsu-transplantado": {
    "name": "Doujutsu Transplantado",
    "contentId": "sns:feature:hb-f05-doujutsu-transplantado",
    "primary": false,
    "related": [
      "Doujutsu Transplantado",
      "Transplante Perfeito"
    ],
    "source": "F05"
  },
  "hb-f05-hibon-dominio-hibon-ninpou": {
    "name": "Hibon: Domínio Hibon Ninpou",
    "contentId": "sns:feature:hb-f05-hibon-dominio-hibon-ninpou",
    "primary": false,
    "related": [
      "Domínio Hibon Ninpou"
    ],
    "source": "F05"
  },
  "hb-f05-akimichi": {
    "name": "Clã Akimichi",
    "contentId": "sns:clan:hb-f05-akimichi",
    "primary": true,
    "related": [
      "Resiliência",
      "Controle de Calorias"
    ],
    "source": "F05",
    "aliases": [
      "akimichi"
    ]
  },
  "hb-f05-hatake": {
    "name": "Clã Hatake",
    "contentId": "sns:clan:hb-f05-hatake",
    "primary": true,
    "related": [
      "Presa de Prata"
    ],
    "source": "F05",
    "aliases": [
      "hatake"
    ]
  },
  "hb-f05-hoshigaki": {
    "name": "Clã Hoshigaki",
    "contentId": "sns:clan:hb-f05-hoshigaki",
    "primary": true,
    "related": [
      "Predador Aquático",
      "Elemento Natural: Suiton",
      "Reserva de Água"
    ],
    "source": "F05",
    "aliases": [
      "hoshigaki"
    ]
  },
  "hb-f05-sarutobi": {
    "name": "Clã Sarutobi",
    "contentId": "sns:clan:hb-f05-sarutobi",
    "primary": true,
    "related": [
      "Vontade do Fogo"
    ],
    "source": "F05",
    "aliases": [
      "sarutobi"
    ]
  },
  "hb-f05-kamijutsu": {
    "name": "Kamijutsu",
    "contentId": "sns:hijutsu:hb-f05-kamijutsu",
    "primary": true,
    "related": [
      "Shikigami no Mai",
      "Kami Ninpou",
      "Emissário Divino"
    ],
    "source": "F05",
    "aliases": [
      "kamijutsu"
    ]
  },
  "hb-f05-mateki": {
    "name": "Mateki",
    "contentId": "sns:hijutsu:hb-f05-mateki",
    "primary": true,
    "related": [
      "Ilusões Avançadas",
      "Kuchiyose: Doki"
    ],
    "source": "F05",
    "aliases": [
      "mateki"
    ]
  },
  "hb-f05-amahoshi": {
    "name": "Clã Amahoshi",
    "contentId": "sns:clan:hb-f05-amahoshi",
    "primary": true,
    "related": [
      "Marca Estelar",
      "Tenmon Ninpou"
    ],
    "source": "F05"
  },
  "hb-f05-kaminari": {
    "name": "Clã Kaminari",
    "contentId": "sns:clan:hb-f05-kaminari",
    "primary": true,
    "related": [
      "Corpo Condutor",
      "Elemento Natural: Raiton",
      "Sobrecarga",
      "acesso Kuroi Kaminari"
    ],
    "source": "F05"
  },
  "hb-f05-kurama": {
    "name": "Clã Kurama",
    "contentId": "sns:clan:hb-f05-kurama",
    "primary": true,
    "related": [
      "Personalidade Dividida",
      "Ilusão Real",
      "Ilusão Fluida",
      "Teatro da Mente"
    ],
    "source": "F05"
  },
  "hb-f05-namizuka": {
    "name": "Clã Namizuka",
    "contentId": "sns:clan:hb-f05-namizuka",
    "primary": true,
    "related": [
      "Sangue do Abismo",
      "Modo Abissal",
      "Monstro Marinho",
      "Kaiju Ninpou"
    ],
    "source": "F05"
  },
  "hb-f05-ryuusei": {
    "name": "Clã Ryuusei",
    "contentId": "sns:clan:hb-f05-ryuusei",
    "primary": true,
    "related": [
      "Domínio Elemental",
      "Caminho dos Cinco Fluxos"
    ],
    "source": "F05"
  },
  "hb-f05-seryuu-seiryuu": {
    "name": "Clã Seryuu / Seiryuu",
    "contentId": "sns:clan:hb-f05-seryuu-seiryuu",
    "primary": true,
    "related": [
      "Controle do Fogo",
      "Chakra Expandido",
      "Postura de Gato",
      "Garras de Gato",
      "Regeneração",
      "Aoi Katon"
    ],
    "source": "F05"
  },
  "hb-f05-shirakumo": {
    "name": "Clã Shirakumo",
    "contentId": "sns:clan:hb-f05-shirakumo",
    "primary": true,
    "related": [
      "Tecelão de Batalha",
      "Lâmina de Seda",
      "Mestre Tecelão",
      "Ito Ninpou",
      "Kuchiyose comum: Aranhas"
    ],
    "source": "F05"
  },
  "hb-f05-corpo-e-olhos-do-sabio": {
    "name": "Corpo e Olhos do Sábio",
    "contentId": "sns:hijutsu:hb-f05-corpo-e-olhos-do-sabio",
    "primary": true,
    "related": [
      "Corpo do Sábio",
      "Olhos do Sábio",
      "Ame no Tejikara",
      "Sennin Ninpou"
    ],
    "source": "F05"
  },
  "hb-f05-fuuinshi-no-michi": {
    "name": "Fuuinshi no Michi",
    "contentId": "sns:hijutsu:hb-f05-fuuinshi-no-michi",
    "primary": true,
    "related": [
      "Caligrafia Perfeita",
      "Símbolos Vivos",
      "Kaijo no Geijutsu",
      "Selamento Reforçado"
    ],
    "source": "F05"
  },
  "hb-f05-heranca-do-deus-shinobi": {
    "name": "Herança do Deus Shinobi",
    "contentId": "sns:hijutsu:hb-f05-heranca-do-deus-shinobi",
    "primary": true,
    "related": [
      "Transplante de Células",
      "Raízes da Vida",
      "Mokuton"
    ],
    "source": "F05"
  },
  "hb-f05-jinchuuriki-falso": {
    "name": "Jinchuuriki Falso",
    "contentId": "sns:hijutsu:hb-f05-jinchuuriki-falso",
    "primary": true,
    "related": [
      "Jinchuuriki Falso",
      "Presença do Selo",
      "Manto Corrompido",
      "Modo Besta Instável",
      "Controle Total"
    ],
    "source": "F05"
  },
  "hb-f05-karada-no-shinka": {
    "name": "Karada no Shinka",
    "contentId": "sns:hijutsu:hb-f05-karada-no-shinka",
    "primary": true,
    "related": [
      "Punho Condutor",
      "Corpo Ajustável",
      "Sequência Marcial"
    ],
    "source": "F05"
  },
  "hb-f05-ketsumyaku-no-ogi": {
    "name": "Ketsumyaku no Ōgi",
    "contentId": "sns:hijutsu:hb-f05-ketsumyaku-no-ogi",
    "primary": true,
    "related": [
      "Regeneração",
      "Sangue Perfurante",
      "Domínio Hemático1/2",
      "Sangue Revitalizador",
      "Arte do Sangue Vivo"
    ],
    "source": "F05"
  },
  "hb-f05-kuchiyose-cavalo": {
    "name": "Kuchiyose: Cavalo",
    "contentId": "sns:feature:hb-f05-kuchiyose-cavalo",
    "primary": false,
    "related": [
      "Kuchiyose: Cavalo"
    ],
    "source": "F05",
    "species": "cavalo"
  },
  "hb-f05-kuchiyose-dragao": {
    "name": "Kuchiyose: Dragão",
    "contentId": "sns:feature:hb-f05-kuchiyose-dragao",
    "primary": false,
    "related": [
      "Kuchiyose: Dragão"
    ],
    "source": "F05",
    "species": "dragao"
  },
  "hb-f05-kuchiyose-escorpiao": {
    "name": "Kuchiyose: Escorpião",
    "contentId": "sns:feature:hb-f05-kuchiyose-escorpiao",
    "primary": false,
    "related": [
      "Kuchiyose: Escorpião"
    ],
    "source": "F05",
    "species": "escorpiao"
  },
  "hb-f05-kuchiyose-lobos": {
    "name": "Kuchiyose: Lobos",
    "contentId": "sns:feature:hb-f05-kuchiyose-lobos",
    "primary": false,
    "related": [
      "Kuchiyose: Lobos"
    ],
    "source": "F05",
    "species": "lobos"
  },
  "hb-f05-kuchiyose-raposa": {
    "name": "Kuchiyose: Raposa",
    "contentId": "sns:feature:hb-f05-kuchiyose-raposa",
    "primary": false,
    "related": [
      "Kuchiyose: Raposa"
    ],
    "source": "F05",
    "species": "raposa"
  },
  "hb-f05-medium": {
    "name": "Médium",
    "contentId": "sns:hijutsu:hb-f05-medium",
    "primary": true,
    "related": [
      "Percepção Espiritual",
      "Canal Espiritual",
      "Telecinese"
    ],
    "source": "F05"
  },
  "hb-f05-mestre-da-agua": {
    "name": "Mestre da Água",
    "contentId": "sns:hijutsu:hb-f05-mestre-da-agua",
    "primary": true,
    "related": [
      "Tensai limitado",
      "Azure Fang"
    ],
    "source": "F05"
  },
  "hb-f05-tenseigan": {
    "name": "Tenseigan",
    "contentId": "sns:hijutsu:hb-f05-tenseigan",
    "primary": true,
    "related": [
      "Tenseigan",
      "Manto Tenseigan",
      "Tensei Ninpou"
    ],
    "source": "F05"
  },
  "hb-f05-dois-hijutsus-limitados": {
    "name": "Dois Hijutsus Limitados",
    "contentId": "sns:feature:hb-f05-dois-hijutsus-limitados",
    "primary": false,
    "related": [
      "quota de dois hijutsus"
    ],
    "source": "F05"
  },
  "hb-f05-restricao-chakra-expandido": {
    "name": "Restrição Chakra Expandido",
    "contentId": "sns:feature:hb-f05-restricao-chakra-expandido",
    "primary": false,
    "related": [
      "restrição Bunshin Básico"
    ],
    "source": "F05"
  },
  "hb-f05-desvantagem-heroica": {
    "name": "Desvantagem Heroica",
    "contentId": "sns:feature:hb-f05-desvantagem-heroica",
    "primary": false,
    "related": [
      "Desvantagem Heroica"
    ],
    "source": "F05"
  }
});
export const CATALOG_ACQUISITION_RULES=freeze({
  "sns:clan:aburame": {
    "name": "Clã Aburame",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 142, 143, 144, 145, 146, 147, 148, 149, 150",
    "requirements": []
  },
  "sns:clan:akimichi": {
    "name": "Clã Akimichi",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 150, 151, 152, 153, 154, 155",
    "requirements": []
  },
  "sns:clan:hatake": {
    "name": "Clã Hatake",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 155, 156",
    "requirements": []
  },
  "sns:clan:hyuuga": {
    "name": "Clã Hyuuga",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 157, 158, 159, 160, 161, 162",
    "requirements": []
  },
  "sns:clan:inuzuka": {
    "name": "Clã Inuzuka",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 163, 164, 165, 166, 167",
    "requirements": []
  },
  "sns:clan:nara": {
    "name": "Clã Nara",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 168, 169, 170, 171, 172, 173",
    "requirements": []
  },
  "sns:clan:sarutobi": {
    "name": "Clã Sarutobi",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 173, 174",
    "requirements": []
  },
  "sns:clan:senju": {
    "name": "Clã Senju",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 174, 175, 176, 177, 178, 179, 180",
    "requirements": []
  },
  "sns:clan:uchiha": {
    "name": "Clã Uchiha",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193",
    "requirements": []
  },
  "sns:clan:uzumaki": {
    "name": "Clã Uzumaki",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 193, 194, 195, 196",
    "requirements": []
  },
  "sns:clan:yamanaka": {
    "name": "Clã Yamanaka",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 196, 197, 198, 199, 200, 201",
    "requirements": []
  },
  "sns:hijutsu:dokujutsu": {
    "name": "Dokujutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 9, 10, 11",
    "requirements": []
  },
  "sns:hijutsu:hachimon-tonkou": {
    "name": "Hachimon Tonkou",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 202, 203, 204, 205, 206, 207",
    "requirements": []
  },
  "sns:feature:taijutsu-de-konoha": {
    "name": "Taijutsu de Konoha",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 207, 208, 209, 210, 211, 212",
    "requirements": []
  },
  "sns:hijutsu:hibon-ninpou": {
    "name": "Hibon Ninpou",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 212",
    "requirements": []
  },
  "sns:feature:kyuubi": {
    "name": "Kyuubi",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 50, 51, 52",
    "requirements": []
  },
  "sns:hijutsu:kagura-shingan": {
    "name": "Kagura Shingan",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 222, 223, 224",
    "requirements": []
  },
  "sns:feature:kuchiyose-aguias": {
    "name": "Kuchiyose: Águias",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 227",
    "requirements": []
  },
  "sns:feature:kuchiyose-caes": {
    "name": "Kuchiyose: Cães",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 227, 228",
    "requirements": []
  },
  "sns:feature:kuchiyose-cobras": {
    "name": "Kuchiyose: Cobras",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 228",
    "requirements": []
  },
  "sns:feature:kuchiyose-lesmas": {
    "name": "Kuchiyose: Lesmas",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 228, 229",
    "requirements": []
  },
  "sns:feature:kuchiyose-macacos": {
    "name": "Kuchiyose: Macaco",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 11, 12, 13, 14",
    "requirements": []
  },
  "sns:feature:kuchiyose-sapos": {
    "name": "Kuchiyose: Sapos",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 229",
    "requirements": []
  },
  "sns:hijutsu:magen": {
    "name": "Magen",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 233, 234, 235, 236, 237, 238",
    "requirements": []
  },
  "sns:hijutsu:senjutsu": {
    "name": "Senjutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 17, 18, 19, 20, 21, 22",
    "requirements": []
  },
  "sns:hijutsu:tensai": {
    "name": "Tensai",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 241, 242, 243, 244, 245, 246, 247",
    "requirements": []
  },
  "sns:clan:fuuma": {
    "name": "Clã Fuuma",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 7",
    "requirements": []
  },
  "sns:clan:hoshigaki": {
    "name": "Clã Hoshigaki",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 8, 9",
    "requirements": []
  },
  "sns:clan:hozuki": {
    "name": "Clã Hozuki",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 10, 11, 12, 13, 14",
    "requirements": []
  },
  "sns:clan:kaguya": {
    "name": "Clã Kaguya",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 14, 15, 16, 17",
    "requirements": []
  },
  "sns:clan:yotsuki": {
    "name": "Clã Yotsuki",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 18",
    "requirements": []
  },
  "sns:clan:yuki": {
    "name": "Clã Yuki",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 18, 19, 20, 21",
    "requirements": []
  },
  "sns:feature:ichibi-sabaku": {
    "name": "Ichibi / Sabaku",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 29, 30, 31, 32, 33, 34",
    "requirements": []
  },
  "sns:feature:nibi-aoi-katon": {
    "name": "Nibi / Aoi Katon",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 34, 35, 36",
    "requirements": []
  },
  "sns:feature:sanbi-sanbi-suiton": {
    "name": "Sanbi / Sanbi Suiton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 36, 37, 38",
    "requirements": []
  },
  "sns:feature:yonbi-yonbi-youton": {
    "name": "Yonbi / Yonbi Youton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 38, 39, 40",
    "requirements": []
  },
  "sns:feature:gobi-gobi-futton": {
    "name": "Gobi / Gobi Futton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 40, 41, 42, 43",
    "requirements": []
  },
  "sns:feature:rokubi-rokubi-suiton": {
    "name": "Rokubi / Rokubi Suiton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 43, 44, 45, 46",
    "requirements": []
  },
  "sns:feature:nanabi": {
    "name": "Nanabi",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 46, 47, 48",
    "requirements": []
  },
  "sns:feature:hachibi": {
    "name": "Hachibi",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 48, 49, 50",
    "requirements": []
  },
  "sns:hijutsu:jiton": {
    "name": "Jiton II",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 64, 65, 66, 67, 68, 69, 70",
    "requirements": []
  },
  "sns:hijutsu:juuinka": {
    "name": "Juuinka",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 54, 55, 56, 57",
    "requirements": []
  },
  "sns:hijutsu:kamijutsu": {
    "name": "Kamijutsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 57, 58, 59, 60, 61",
    "requirements": []
  },
  "sns:hijutsu:nintaijutsu": {
    "name": "Nintaijutsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 61, 62, 63, 64, 65",
    "requirements": []
  },
  "sns:hijutsu:rinnegan": {
    "name": "Rinnegan",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75",
    "requirements": []
  },
  "sns:hijutsu:samurai": {
    "name": "Samurai",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 75, 76, 77, 78, 79",
    "requirements": []
  },
  "sns:hijutsu:senninka": {
    "name": "Senninka",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 79, 80, 81, 82",
    "requirements": []
  },
  "sns:feature:kuchiyose-tubarao": {
    "name": "Kuchiyose: Tubarões",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus · PDF 9, 10",
    "requirements": []
  },
  "sns:hijutsu:saika-ikki": {
    "name": "Saika Ikki",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 14, 15, 16",
    "requirements": []
  },
  "sns:feature:aoi-katon-independente": {
    "name": "Aoi Katon independente",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 101, 102",
    "requirements": []
  },
  "sns:feature:sanbi-suiton-independente": {
    "name": "Sanbi Suiton independente",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 102, 103",
    "requirements": []
  },
  "sns:feature:yonbi-youton-independente": {
    "name": "Yonbi Youton independente",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 103, 104, 105",
    "requirements": []
  },
  "sns:feature:gobi-futton-independente": {
    "name": "Gobi Futton independente",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 105, 106",
    "requirements": []
  },
  "sns:feature:rokubi-suiton-independente": {
    "name": "Rokubi Suiton independente",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 107, 108",
    "requirements": []
  },
  "sns:clan:shimura": {
    "name": "Clã Shimura",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 8, 9",
    "requirements": []
  },
  "sns:feature:uchiha-izanami-e-izanagi": {
    "name": "Uchiha: Izanami e Izanagi",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 12, 13, 14",
    "requirements": []
  },
  "sns:feature:uzumaki-chakra-da-cura": {
    "name": "Uzumaki: Chakra da Cura",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 14, 15",
    "requirements": []
  },
  "sns:clan:hoshigakure": {
    "name": "Clã Hoshigakure",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 16, 17, 18, 19",
    "requirements": []
  },
  "sns:hijutsu:bakuton": {
    "name": "Bakuton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 19, 20, 21, 22, 23",
    "requirements": []
  },
  "sns:hijutsu:buki-senmon": {
    "name": "Buki Senmon",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 23, 24, 25",
    "requirements": []
  },
  "sns:hijutsu:chouju-giga": {
    "name": "Chouju-Giga",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 25, 26, 27, 28",
    "requirements": []
  },
  "sns:hijutsu:daikiga": {
    "name": "Daikiga",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 30, 31, 32, 33",
    "requirements": []
  },
  "sns:hijutsu:gorudogumo": {
    "name": "Gorudogumo",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 33, 34, 35, 36, 37, 38, 39",
    "requirements": []
  },
  "sns:hijutsu:hebinomichi": {
    "name": "Hebinomichi",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 39, 40, 41, 42, 43",
    "requirements": []
  },
  "sns:hijutsu:jashin-juusha": {
    "name": "Jashin Juusha",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 43, 44, 45, 46, 47, 48, 49",
    "requirements": []
  },
  "sns:hijutsu:jingokuon": {
    "name": "Jingokuon",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 49, 50, 51, 52, 53, 54",
    "requirements": []
  },
  "sns:hijutsu:jiongu": {
    "name": "Jiongu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 54, 55, 56, 57, 58, 59, 60, 61, 62, 63",
    "requirements": []
  },
  "sns:feature:kakuran-tensai": {
    "name": "Kakuran Tensai",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 70, 71, 72",
    "requirements": []
  },
  "sns:hijutsu:kekkei-touta-jinton": {
    "name": "Kekkei Touta: Jinton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 72, 73, 74, 75, 76, 77",
    "requirements": []
  },
  "sns:hijutsu:kibaku-nendo": {
    "name": "Kibaku Nendo",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 77, 78, 79, 80, 81",
    "requirements": []
  },
  "sns:feature:kuchiyose-doninha": {
    "name": "Kuchiyose: Doninha",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 81, 82, 83",
    "requirements": []
  },
  "sns:feature:kuchiyose-marisco": {
    "name": "Kuchiyose: Marisco",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 83, 84",
    "requirements": []
  },
  "sns:feature:kuchiyose-salamandra": {
    "name": "Kuchiyose: Salamandra",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 84, 85, 86",
    "requirements": []
  },
  "sns:feature:kuchiyose-tartaruga": {
    "name": "Kuchiyose: Tartaruga",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 86",
    "requirements": []
  },
  "sns:hijutsu:kugutsu": {
    "name": "Kugutsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104",
    "requirements": []
  },
  "sns:feature:kuroi-kaminari": {
    "name": "Kuroi Kaminari",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 105",
    "requirements": []
  },
  "sns:hijutsu:mateki": {
    "name": "Mateki",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 105, 106, 107",
    "requirements": []
  },
  "sns:hijutsu:mei-kekkei-genkai": {
    "name": "Mei Kekkei Genkai",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 109, 110, 111, 112, 113, 114",
    "requirements": []
  },
  "sns:feature:nan-no-kaizou": {
    "name": "Nan no Kaizou",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 114, 115, 116",
    "requirements": []
  },
  "sns:hijutsu:ranton": {
    "name": "Ranton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 116, 117, 118, 119",
    "requirements": []
  },
  "sns:feature:rinbo-hengoku": {
    "name": "Rinbo: Hengoku",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 120, 121",
    "requirements": []
  },
  "sns:hijutsu:shakuton": {
    "name": "Shakuton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 121, 122, 123, 124",
    "requirements": []
  },
  "sns:hijutsu:shouton": {
    "name": "Shouton",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 124, 125, 126, 127, 128",
    "requirements": []
  },
  "sns:hijutsu:souma-no-jutsu": {
    "name": "Souma no Jutsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 128, 129, 130, 131",
    "requirements": []
  },
  "sns:hijutsu:tessenjutsu": {
    "name": "Tessenjutsu",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 131, 132, 133",
    "requirements": []
  },
  "sns:hijutsu:zetsu-seitai": {
    "name": "Zetsu Seitai",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 133, 134, 135, 136",
    "requirements": []
  },
  "sns:feature:kuchiyose-baku": {
    "name": "Kuchiyose: Baku",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 9, 10",
    "requirements": []
  },
  "sns:feature:kuchiyose-doki": {
    "name": "Kuchiyose: Doki",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 107, 108, 109",
    "requirements": []
  },
  "sns:feature:desenhos-pergaminho-da-super-besta": {
    "name": "Desenhos: Pergaminho da Super Besta",
    "source": "Naruto: Shinobi no Sho — Livro de Hijutsus Vol. 2 · PDF 28, 29, 30",
    "requirements": []
  },
  "sns:feature:hb-f05-doujutsu-transplantado": {
    "name": "Doujutsu Transplantado",
    "source": "Enciclopédia das Artes Shinobi · PDF 14, 15",
    "requirements": []
  },
  "sns:feature:hb-f05-hibon-dominio-hibon-ninpou": {
    "name": "Hibon: Domínio Hibon Ninpou",
    "source": "Enciclopédia das Artes Shinobi · PDF 13",
    "requirements": []
  },
  "sns:clan:hb-f05-akimichi": {
    "name": "Clã Akimichi",
    "source": "Enciclopédia das Artes Shinobi · PDF 16, 17, 18",
    "requirements": []
  },
  "sns:clan:hb-f05-hatake": {
    "name": "Clã Hatake",
    "source": "Enciclopédia das Artes Shinobi · PDF 18",
    "requirements": []
  },
  "sns:clan:hb-f05-hoshigaki": {
    "name": "Clã Hoshigaki",
    "source": "Enciclopédia das Artes Shinobi · PDF 18, 19",
    "requirements": []
  },
  "sns:clan:hb-f05-sarutobi": {
    "name": "Clã Sarutobi",
    "source": "Enciclopédia das Artes Shinobi · PDF 19",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-kamijutsu": {
    "name": "Kamijutsu",
    "source": "Enciclopédia das Artes Shinobi · PDF 19, 20, 21, 22",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-mateki": {
    "name": "Mateki",
    "source": "Enciclopédia das Artes Shinobi · PDF 22",
    "requirements": []
  },
  "sns:clan:hb-f05-amahoshi": {
    "name": "Clã Amahoshi",
    "source": "Enciclopédia das Artes Shinobi · PDF 22, 23, 24, 25",
    "requirements": []
  },
  "sns:clan:hb-f05-kaminari": {
    "name": "Clã Kaminari",
    "source": "Enciclopédia das Artes Shinobi · PDF 25, 26",
    "requirements": []
  },
  "sns:clan:hb-f05-kurama": {
    "name": "Clã Kurama",
    "source": "Enciclopédia das Artes Shinobi · PDF 26, 27, 28, 29, 30, 31, 32, 33",
    "requirements": []
  },
  "sns:clan:hb-f05-namizuka": {
    "name": "Clã Namizuka",
    "source": "Enciclopédia das Artes Shinobi · PDF 34, 35, 36, 37",
    "requirements": []
  },
  "sns:clan:hb-f05-ryuusei": {
    "name": "Clã Ryuusei",
    "source": "Enciclopédia das Artes Shinobi · PDF 37, 38, 39",
    "requirements": []
  },
  "sns:clan:hb-f05-seryuu-seiryuu": {
    "name": "Clã Seryuu / Seiryuu",
    "source": "Enciclopédia das Artes Shinobi · PDF 39, 40, 41, 42, 43",
    "requirements": []
  },
  "sns:clan:hb-f05-shirakumo": {
    "name": "Clã Shirakumo",
    "source": "Enciclopédia das Artes Shinobi · PDF 43, 44, 45",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-corpo-e-olhos-do-sabio": {
    "name": "Corpo e Olhos do Sábio",
    "source": "Enciclopédia das Artes Shinobi · PDF 45, 46, 47, 48, 49, 50, 51, 52, 53",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-fuuinshi-no-michi": {
    "name": "Fuuinshi no Michi",
    "source": "Enciclopédia das Artes Shinobi · PDF 53, 54, 55, 56, 57",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-heranca-do-deus-shinobi": {
    "name": "Herança do Deus Shinobi",
    "source": "Enciclopédia das Artes Shinobi · PDF 57, 58, 59",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-jinchuuriki-falso": {
    "name": "Jinchuuriki Falso",
    "source": "Enciclopédia das Artes Shinobi · PDF 59, 60, 61, 62, 63, 64, 65",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-karada-no-shinka": {
    "name": "Karada no Shinka",
    "source": "Enciclopédia das Artes Shinobi · PDF 65, 66",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-ketsumyaku-no-ogi": {
    "name": "Ketsumyaku no Ōgi",
    "source": "Enciclopédia das Artes Shinobi · PDF 66, 67, 68, 69, 70",
    "requirements": []
  },
  "sns:feature:hb-f05-kuchiyose-cavalo": {
    "name": "Kuchiyose: Cavalo",
    "source": "Enciclopédia das Artes Shinobi · PDF 70",
    "requirements": []
  },
  "sns:feature:hb-f05-kuchiyose-dragao": {
    "name": "Kuchiyose: Dragão",
    "source": "Enciclopédia das Artes Shinobi · PDF 70, 71",
    "requirements": []
  },
  "sns:feature:hb-f05-kuchiyose-escorpiao": {
    "name": "Kuchiyose: Escorpião",
    "source": "Enciclopédia das Artes Shinobi · PDF 72",
    "requirements": []
  },
  "sns:feature:hb-f05-kuchiyose-lobos": {
    "name": "Kuchiyose: Lobos",
    "source": "Enciclopédia das Artes Shinobi · PDF 72, 73",
    "requirements": []
  },
  "sns:feature:hb-f05-kuchiyose-raposa": {
    "name": "Kuchiyose: Raposa",
    "source": "Enciclopédia das Artes Shinobi · PDF 73, 74",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-medium": {
    "name": "Médium",
    "source": "Enciclopédia das Artes Shinobi · PDF 74, 75, 76, 77",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-mestre-da-agua": {
    "name": "Mestre da Água",
    "source": "Enciclopédia das Artes Shinobi · PDF 77, 78",
    "requirements": []
  },
  "sns:hijutsu:hb-f05-tenseigan": {
    "name": "Tenseigan",
    "source": "Enciclopédia das Artes Shinobi · PDF 78, 79, 80",
    "requirements": []
  },
  "sns:feature:hb-f05-dois-hijutsus-limitados": {
    "name": "Dois Hijutsus Limitados",
    "source": "Enciclopédia das Artes Shinobi · PDF 95, 96",
    "requirements": []
  },
  "sns:feature:hb-f05-restricao-chakra-expandido": {
    "name": "Restrição Chakra Expandido",
    "source": "Enciclopédia das Artes Shinobi · PDF 96",
    "requirements": []
  },
  "sns:feature:hb-f05-desvantagem-heroica": {
    "name": "Desvantagem Heroica",
    "source": "Enciclopédia das Artes Shinobi · PDF 94, 95",
    "requirements": []
  },
  "sns:power:ninpou": {
    "name": "Ninpou",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 91, 92, 93, 94, 95",
    "requirements": []
  },
  "sns:power:doton": {
    "name": "Doton",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 103",
    "requirements": []
  },
  "sns:power:fuuton": {
    "name": "Fuuton",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 105",
    "requirements": []
  },
  "sns:power:katon": {
    "name": "Katon",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 107, 108",
    "requirements": []
  },
  "sns:power:raiton": {
    "name": "Raiton",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 109",
    "requirements": []
  },
  "sns:power:suiton": {
    "name": "Suiton",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 111, 112",
    "requirements": []
  },
  "sns:power:fuuinjutsu": {
    "name": "Fuuinjutsu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 114",
    "requirements": [
      {
        "kind": "attribute",
        "key": "int",
        "min": 6,
        "label": "Inteligência"
      }
    ]
  },
  "sns:power:iryou-ninjutsu": {
    "name": "Iryou Ninjutsu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 120",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:ninja-medico",
        "label": "Ninja Medico"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 6,
        "label": "Espírito"
      }
    ]
  },
  "sns:power:rasengan": {
    "name": "Rasengan",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 121",
    "requirements": [
      {
        "kind": "attribute",
        "key": "esp",
        "min": 8,
        "label": "Espírito"
      }
    ]
  },
  "sns:jutsu:clone-generico": {
    "name": "Clone Genérico",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 78",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:clone-kage",
        "label": "Clone Kage"
      }
    ]
  },
  "sns:jutsu:iwa-bunshin": {
    "name": "Iwa Bunshin",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 79",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:clone-kage",
        "label": "Clone Kage"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:doton",
        "min": 1,
        "label": "Doton"
      }
    ]
  },
  "sns:jutsu:kage-bunshin": {
    "name": "Kage Bunshin",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 79, 80",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:clone-kage",
        "label": "Clone Kage"
      }
    ]
  },
  "sns:jutsu:mizu-bunshin": {
    "name": "Mizu Bunshin",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 80",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:clone-kage",
        "label": "Clone Kage"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:suiton",
        "min": 1,
        "label": "Suiton"
      }
    ]
  },
  "sns:jutsu:oukashou": {
    "name": "Oukashou",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 81",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:kyoudo-kyouka-2",
        "label": "Kyoudo Kyouka 2"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 10,
        "label": "Espírito"
      }
    ]
  },
  "sns:jutsu:tsuutenkyaku": {
    "name": "Tsuutenkyaku",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 81, 82",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:kyoudo-kyouka-2",
        "label": "Kyoudo Kyouka 2"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 10,
        "label": "Espírito"
      }
    ]
  },
  "sns:jutsu:selo-de-armazenamento": {
    "name": "Selo de Armazenamento",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 114, 115",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 1,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:jutsu:selo-de-armazenamento-maior": {
    "name": "Selo de Armazenamento Maior",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 115",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 2,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:jutsu:misshi": {
    "name": "Misshi",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 115",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 3,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:jutsu:bakudan": {
    "name": "Bakudan",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 116",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 4,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:jutsu:gensou-no-in": {
    "name": "Gensou no In",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 116",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 5,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:jutsu:wana": {
    "name": "Wana",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 116, 117",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 6,
        "label": "Fuuinjutsu"
      },
      {
        "kind": "skillLevel",
        "key": "mecanismos",
        "min": 10,
        "label": "Nível de Mecanismos"
      }
    ]
  },
  "sns:jutsu:chakra-no-souin": {
    "name": "Chakra no Souin",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 117",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 7,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:jutsu:kekkai-no-in": {
    "name": "Kekkai no In",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 117",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 8,
        "label": "Fuuinjutsu"
      }
    ]
  },
  "sns:jutsu:shishou-fuuin": {
    "name": "Shishou Fuuin",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 118",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 8,
        "label": "Fuuinjutsu"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 16,
        "label": "Nível de Ocultismo"
      }
    ]
  },
  "sns:jutsu:keiyaku-fuuin": {
    "name": "Keiyaku Fuuin",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 118",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 9,
        "label": "Fuuinjutsu"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 16,
        "label": "Nível de Ocultismo"
      }
    ]
  },
  "sns:jutsu:shiki-fuujin": {
    "name": "Shiki Fuujin",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 118, 119, 120",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 10,
        "label": "Fuuinjutsu"
      },
      {
        "kind": "skillLevel",
        "key": "ocultismo",
        "min": 20,
        "label": "Nível de Ocultismo"
      }
    ]
  },
  "sns:jutsu:chakra-no-mesu": {
    "name": "Chakra no Mesu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 120",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:iryou-ninjutsu",
        "min": 6,
        "label": "Iryou Ninjutsu"
      }
    ]
  },
  "sns:jutsu:inyu-shometsu": {
    "name": "Inyu Shometsu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 121",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:iryou-ninjutsu",
        "min": 6,
        "label": "Iryou Ninjutsu"
      },
      {
        "kind": "ownedChoice",
        "id": "sns:apt:perito",
        "choice": "medicina",
        "label": "Perito · Medicina"
      },
      {
        "kind": "ownedChoice",
        "id": "sns:apt:pericia-inata",
        "choice": "medicina",
        "label": "Pericia Inata · Medicina"
      }
    ]
  },
  "sns:jutsu:shousen-no-jutsu": {
    "name": "Shousen no Jutsu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 121",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:iryou-ninjutsu",
        "min": 7,
        "label": "Iryou Ninjutsu"
      }
    ]
  },
  "sns:jutsu:rasengan-basico": {
    "name": "Rasengan Básico",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 121, 122",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:rasengan",
        "min": 1,
        "label": "Rasengan"
      }
    ]
  },
  "sns:jutsu:rasengan-completo": {
    "name": "Rasengan Completo",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 122",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:rasengan",
        "min": 6,
        "label": "Rasengan"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "esp",
            "min": 14,
            "label": "Espírito"
          },
          {
            "kind": "all",
            "options": [
              {
                "kind": "attribute",
                "key": "esp",
                "min": 12,
                "label": "Espírito"
              },
              {
                "kind": "owned",
                "id": "sns:apt:chakra-expandido",
                "label": "Chakra Expandido"
              }
            ]
          }
        ]
      }
    ]
  },
  "sns:jutsu:oodama-rasengan": {
    "name": "Oodama Rasengan",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 122, 123",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:rasengan",
        "min": 7,
        "label": "Rasengan"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "attribute",
            "key": "esp",
            "min": 16,
            "label": "Espírito"
          },
          {
            "kind": "all",
            "options": [
              {
                "kind": "attribute",
                "key": "esp",
                "min": 14,
                "label": "Espírito"
              },
              {
                "kind": "owned",
                "id": "sns:apt:chakra-expandido",
                "label": "Chakra Expandido"
              }
            ]
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:tecnica-poderosa",
        "label": "Tecnica Poderosa"
      }
    ]
  },
  "sns:jutsu:rasengan-elemental": {
    "name": "Rasengan Elemental",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 123",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:rasengan",
        "min": 9,
        "label": "Rasengan"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "powerLevel",
            "id": "sns:power:katon",
            "min": 2,
            "label": "Katon"
          },
          {
            "kind": "powerLevel",
            "id": "sns:power:raiton",
            "min": 2,
            "label": "Raiton"
          },
          {
            "kind": "powerLevel",
            "id": "sns:power:fuuton",
            "min": 2,
            "label": "Fuuton"
          }
        ]
      }
    ]
  },
  "sns:jutsu:bunshin-no-jutsu": {
    "name": "Bunshin no Jutsu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 123, 124",
    "requirements": []
  },
  "sns:jutsu:henge-no-jutsu": {
    "name": "Henge no Jutsu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 124",
    "requirements": []
  },
  "sns:jutsu:kai": {
    "name": "Kai",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 124",
    "requirements": []
  },
  "sns:jutsu:kawarimi-no-jutsu": {
    "name": "Kawarimi no Jutsu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 124, 125",
    "requirements": []
  },
  "sns:jutsu:kinobori": {
    "name": "Kinobori",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 125",
    "requirements": []
  },
  "sns:jutsu:shunshin-no-jutsu": {
    "name": "Shunshin no Jutsu",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 125, 126",
    "requirements": []
  },
  "sns:jutsu:tadayou": {
    "name": "Tadayou",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 126",
    "requirements": []
  },
  "sns:power:magen": {
    "name": "Magen",
    "source": "Naruto: Shinobi no Sho — Livro Básico · PDF 233, 234, 235",
    "requirements": [
      {
        "kind": "access",
        "key": "magen"
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 6,
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
        "id": "sns:apt:ilusao-profunda",
        "label": "Ilusao Profunda"
      }
    ]
  },
  "sns:apt:encantar": {
    "name": "Encantar",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 42, 43, 44",
    "requirements": []
  },
  "sns:apt:oiroke-no-jutsu": {
    "name": "Oiroke no Jutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 44",
    "requirements": []
  },
  "sns:apt:haremu-no-jutsu": {
    "name": "Haremu no Jutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 44, 45",
    "requirements": []
  },
  "sns:apt:raigou-senjusatsu": {
    "name": "Raigou Senjusatsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 45, 46",
    "requirements": []
  },
  "sns:apt:raiton-kage-bunshin-no-jutsu": {
    "name": "Raiton Kage Bunshin no Jutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 46, 47",
    "requirements": []
  },
  "sns:apt:shuriken-kage-bunshin-no-jutsu": {
    "name": "Shuriken Kage Bunshin no Jutsu",
    "source": "Naruto: Shinobi no Sho — Guia Avançado do Shinobi · PDF 47",
    "requirements": []
  },
  "sns:jutsu:hb-f05-double-lariat": {
    "name": "Double Lariat",
    "source": "Enciclopédia das Artes Shinobi · PDF 81, 82",
    "requirements": [
      {
        "kind": "effectKnown",
        "id": "sns:effect:lariat",
        "min": 8,
        "label": "Lariat nível 8"
      }
    ]
  },
  "sns:jutsu:hb-f05-mikazuki-no-mai": {
    "name": "Mikazuki no Mai",
    "source": "Enciclopédia das Artes Shinobi · PDF 82",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:clone-kage",
        "label": "Clone Kage"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ponto-cego",
        "label": "Ponto Cego"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "ownedChoice",
            "id": "sns:apt:usar-arma",
            "choice": "sns:equipment:wakizashi",
            "label": "Usar Arma · Sns:Equipment:Wakizashi"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:usar-arma",
            "choice": "sns:equipment:chokuto",
            "label": "Usar Arma · Sns:Equipment:Chokuto"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:usar-arma",
            "choice": "sns:equipment:cimitarra",
            "label": "Usar Arma · Sns:Equipment:Cimitarra"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:usar-arma",
            "choice": "sns:equipment:espada-longa",
            "label": "Usar Arma · Sns:Equipment:Espada-Longa"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:usar-arma",
            "choice": "sns:equipment:florete",
            "label": "Usar Arma · Sns:Equipment:Florete"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:usar-arma",
            "choice": "sns:equipment:katana",
            "label": "Usar Arma · Sns:Equipment:Katana"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:usar-arma",
            "choice": "sns:equipment:espada-bastarda",
            "label": "Usar Arma · Sns:Equipment:Espada-Bastarda"
          },
          {
            "kind": "ownedChoice",
            "id": "sns:apt:usar-arma",
            "choice": "sns:equipment:montante",
            "label": "Usar Arma · Sns:Equipment:Montante"
          }
        ]
      }
    ]
  },
  "sns:jutsu:hb-f05-senpou-kawazu-kumite": {
    "name": "Senpou Kawazu Kumite",
    "source": "Enciclopédia das Artes Shinobi · PDF 82",
    "requirements": [
      {
        "kind": "pending",
        "label": "Senjutsu nível 3 de Sapos"
      },
      {
        "kind": "owned",
        "id": "sns:apt:punho-de-ferro",
        "label": "Punho De Ferro"
      }
    ]
  },
  "sns:jutsu:hb-f05-sennen-goroshi": {
    "name": "Sennen Goroshi",
    "source": "Enciclopédia das Artes Shinobi · PDF 82, 83",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:ponto-cego",
        "label": "Ponto Cego"
      },
      {
        "kind": "owned",
        "id": "sns:apt:arremessar",
        "label": "Arremessar"
      }
    ]
  },
  "sns:jutsu:hb-f05-uzumaki-rendan": {
    "name": "Uzumaki Rendan",
    "source": "Enciclopédia das Artes Shinobi · PDF 83",
    "requirements": [
      {
        "kind": "ownedLevel",
        "contentId": "sns:apt:clone",
        "min": 2,
        "label": "Clone nível 2"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ataque-multiplo",
        "label": "Ataque Multiplo"
      },
      {
        "kind": "any",
        "options": [
          {
            "kind": "owned",
            "id": "sns:apt:chute-ascendente",
            "label": "Chute Ascendente"
          },
          {
            "kind": "owned",
            "id": "sns:apt:arremessar",
            "label": "Arremessar"
          }
        ]
      },
      {
        "kind": "owned",
        "id": "sns:apt:seguir-sombra",
        "label": "Seguir Sombra"
      }
    ]
  },
  "sns:jutsu:hb-f05-amegakure": {
    "name": "Amegakure",
    "source": "Enciclopédia das Artes Shinobi · PDF 83, 84",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:gedo",
        "label": "Gedo"
      },
      {
        "kind": "owned",
        "id": "sns:apt:tendo",
        "label": "Tendo"
      }
    ]
  },
  "sns:jutsu:hb-f05-bijuu-rasengan": {
    "name": "Bijuu Rasengan",
    "source": "Enciclopédia das Artes Shinobi · PDF 84, 85",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:rasengan",
        "min": 10,
        "label": "Rasengan"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:jinchuuriki",
        "min": 10,
        "label": "Jinchuuriki"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 20,
        "label": "Espírito"
      },
      {
        "kind": "owned",
        "id": "sns:apt:modo-bijuu",
        "label": "Modo Bijuu"
      },
      {
        "kind": "owned",
        "id": "sns:apt:tecnica-poderosa",
        "label": "Tecnica Poderosa"
      }
    ]
  },
  "sns:jutsu:hb-f05-chikatsu-saisei-no-jutsu": {
    "name": "Chikatsu Saisei no Jutsu",
    "source": "Enciclopédia das Artes Shinobi · PDF 85, 86",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:iryou-ninjutsu",
        "min": 6,
        "label": "Iryou Ninjutsu"
      },
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
  },
  "sns:jutsu:hb-f05-enton-rasenshuriken": {
    "name": "Enton Rasenshuriken",
    "source": "Enciclopédia das Artes Shinobi · PDF 86, 87",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:rasengan",
        "min": 10,
        "label": "Rasengan"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuton",
        "min": 2,
        "label": "Fuuton"
      },
      {
        "kind": "pending",
        "label": "Kagutsuchi e participantes da técnica combinada"
      }
    ]
  },
  "sns:jutsu:hb-f05-ino-shika-chou-yooyoo": {
    "name": "Ino Shika Chou Yooyoo",
    "source": "Enciclopédia das Artes Shinobi · PDF 87, 88, 89",
    "requirements": [
      {
        "kind": "any",
        "options": [
          {
            "kind": "powerLevel",
            "id": "sns:power:baika-ninpou",
            "min": 8,
            "label": "Baika Ninpou"
          },
          {
            "kind": "powerLevel",
            "id": "sns:power:kagejutsu",
            "min": 8,
            "label": "Kagejutsu"
          },
          {
            "kind": "powerLevel",
            "id": "sns:power:shindenshin",
            "min": 8,
            "label": "Shindenshin"
          }
        ]
      }
    ]
  },
  "sns:jutsu:hb-f05-kami-no-ki": {
    "name": "Kami no Ki",
    "source": "Enciclopédia das Artes Shinobi · PDF 89, 90",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:kami-ninpou",
        "min": 7,
        "label": "Kami Ninpou"
      },
      {
        "kind": "pending",
        "label": "Shukigami no Mai nível 2"
      }
    ]
  },
  "sns:jutsu:hb-f05-suiryuudan-no-jutsu": {
    "name": "Suiryuudan no Jutsu",
    "source": "Enciclopédia das Artes Shinobi · PDF 90",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:suiton",
        "min": 6,
        "label": "Suiton"
      },
      {
        "kind": "effectKnown",
        "id": "sns:effect:missil",
        "powerId": "sns:power:suiton",
        "min": 5,
        "label": "Míssil nível 5 de Suiton"
      },
      {
        "kind": "owned",
        "id": "sns:apt:tecnica-poderosa",
        "label": "Tecnica Poderosa"
      }
    ]
  },
  "sns:apt:hb-f06-hijutsu-ishibari": {
    "name": "Hijutsu Ishibari",
    "source": "Manual Shinobi: Técnicas dos Jounins de Konoha · PDF 2",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:saque-rapido",
        "label": "Saque Rapido"
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 5,
        "label": "Inteligência"
      }
    ]
  },
  "sns:apt:hb-f06-bukijutsu-em-dupla-laminas-de-kunai": {
    "name": "Bukijutsu em Dupla Lâminas de Kunai",
    "source": "Manual Shinobi: Técnicas dos Jounins de Konoha · PDF 3",
    "requirements": [
      {
        "kind": "pending",
        "label": "Pré-requisitos específicos do artigo homebrew"
      }
    ]
  },
  "sns:apt:hb-f06-toton-jutsu": {
    "name": "Toton Jutsu",
    "source": "Manual Shinobi: Técnicas dos Jounins de Konoha · PDF 4",
    "requirements": [
      {
        "kind": "pending",
        "label": "Pré-requisitos específicos do artigo homebrew"
      }
    ]
  },
  "sns:jutsu:hb-f06-sanzengarasu-no-jutsu": {
    "name": "Sanzengarasu no Jutsu",
    "source": "Manual Shinobi: Técnicas dos Jounins de Konoha · PDF 7",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:kuchiyose",
        "min": 6,
        "label": "Kuchiyose"
      },
      {
        "kind": "pending",
        "label": "Pacto de invocação: Corvos"
      }
    ]
  },
  "sns:apt:hb-f06-iron-maiden": {
    "name": "Iron Maiden",
    "source": "Manual Shinobi: Técnicas dos Jounins de Konoha · PDF 7, 8",
    "requirements": [
      {
        "kind": "powerLevel",
        "id": "sns:power:magen",
        "min": 3,
        "label": "Magen"
      }
    ]
  },
  "sns:jutsu:hb-f06-reika-no-jutsu": {
    "name": "Reika no Jutsu",
    "source": "Manual Shinobi: Técnicas dos Jounins de Konoha · PDF 8, 9",
    "requirements": [
      {
        "kind": "ownedChoice",
        "id": "sns:apt:resistencia-maior",
        "choice": "esp",
        "label": "Resistencia Maior · Esp"
      },
      {
        "kind": "attribute",
        "key": "esp",
        "min": 14,
        "label": "Espírito"
      }
    ]
  },
  "sns:jutsu:hb-f06-mikazuki-no-mai": {
    "name": "Mikazuki no Mai",
    "source": "Manual Shinobi: Técnicas dos Jounins de Konoha · PDF 9",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:ataque-em-movimento",
        "label": "Ataque Em Movimento"
      },
      {
        "kind": "owned",
        "id": "sns:apt:ataque-poderoso",
        "label": "Ataque Poderoso"
      },
      {
        "kind": "owned",
        "id": "sns:apt:clone-kage",
        "label": "Clone Kage"
      }
    ]
  },
  "sns:jutsu:hb-f06-gomon-heya": {
    "name": "Gomon Heya",
    "source": "Manual Shinobi: Técnicas dos Jounins de Konoha · PDF 10",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:ilusao-fluida",
        "label": "Ilusao Fluida"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:magen",
        "min": 6,
        "label": "Magen"
      }
    ]
  },
  "sns:jutsu:hb-f06-sojasosai-no-jutsu": {
    "name": "Sojasosai no Jutsu",
    "source": "Manual Shinobi: Técnicas dos Jounins de Konoha · PDF 10, 11",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:mestre-dos-selos",
        "label": "Mestre Dos Selos"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:hebi-ninpou",
        "min": 7,
        "label": "Hebi Ninpou"
      }
    ]
  },
  "sns:jutsu:hb-f06-hiraishin-cooperacao": {
    "name": "Hiraishin Cooperação",
    "source": "Manual Shinobi: Técnicas dos Jounins de Konoha · PDF 12",
    "requirements": [
      {
        "kind": "owned",
        "id": "sns:apt:mestre-dos-selos",
        "label": "Mestre Dos Selos"
      },
      {
        "kind": "powerLevel",
        "id": "sns:power:fuuinjutsu",
        "min": 6,
        "label": "Fuuinjutsu"
      },
      {
        "kind": "attribute",
        "key": "int",
        "min": 12,
        "label": "Inteligência"
      }
    ]
  }
});
export const HOMEBREW_CONTENT_IDS=freeze([
  "sns:feature:hb-f05-doujutsu-transplantado",
  "sns:feature:hb-f05-hibon-dominio-hibon-ninpou",
  "sns:clan:hb-f05-akimichi",
  "sns:clan:hb-f05-hatake",
  "sns:clan:hb-f05-hoshigaki",
  "sns:clan:hb-f05-sarutobi",
  "sns:hijutsu:hb-f05-kamijutsu",
  "sns:hijutsu:hb-f05-mateki",
  "sns:clan:hb-f05-amahoshi",
  "sns:clan:hb-f05-kaminari",
  "sns:clan:hb-f05-kurama",
  "sns:clan:hb-f05-namizuka",
  "sns:clan:hb-f05-ryuusei",
  "sns:clan:hb-f05-seryuu-seiryuu",
  "sns:clan:hb-f05-shirakumo",
  "sns:hijutsu:hb-f05-corpo-e-olhos-do-sabio",
  "sns:hijutsu:hb-f05-fuuinshi-no-michi",
  "sns:hijutsu:hb-f05-heranca-do-deus-shinobi",
  "sns:hijutsu:hb-f05-jinchuuriki-falso",
  "sns:hijutsu:hb-f05-karada-no-shinka",
  "sns:hijutsu:hb-f05-ketsumyaku-no-ogi",
  "sns:feature:hb-f05-kuchiyose-cavalo",
  "sns:feature:hb-f05-kuchiyose-dragao",
  "sns:feature:hb-f05-kuchiyose-escorpiao",
  "sns:feature:hb-f05-kuchiyose-lobos",
  "sns:feature:hb-f05-kuchiyose-raposa",
  "sns:hijutsu:hb-f05-medium",
  "sns:hijutsu:hb-f05-mestre-da-agua",
  "sns:hijutsu:hb-f05-tenseigan",
  "sns:feature:hb-f05-dois-hijutsus-limitados",
  "sns:feature:hb-f05-restricao-chakra-expandido",
  "sns:feature:hb-f05-desvantagem-heroica",
  "sns:jutsu:hb-f05-double-lariat",
  "sns:jutsu:hb-f05-mikazuki-no-mai",
  "sns:jutsu:hb-f05-senpou-kawazu-kumite",
  "sns:jutsu:hb-f05-sennen-goroshi",
  "sns:jutsu:hb-f05-uzumaki-rendan",
  "sns:jutsu:hb-f05-amegakure",
  "sns:jutsu:hb-f05-bijuu-rasengan",
  "sns:jutsu:hb-f05-chikatsu-saisei-no-jutsu",
  "sns:jutsu:hb-f05-enton-rasenshuriken",
  "sns:jutsu:hb-f05-ino-shika-chou-yooyoo",
  "sns:jutsu:hb-f05-kami-no-ki",
  "sns:jutsu:hb-f05-suiryuudan-no-jutsu",
  "sns:apt:hb-f06-hijutsu-ishibari",
  "sns:apt:hb-f06-bukijutsu-em-dupla-laminas-de-kunai",
  "sns:apt:hb-f06-toton-jutsu",
  "sns:jutsu:hb-f06-sanzengarasu-no-jutsu",
  "sns:apt:hb-f06-iron-maiden",
  "sns:jutsu:hb-f06-reika-no-jutsu",
  "sns:jutsu:hb-f06-mikazuki-no-mai",
  "sns:jutsu:hb-f06-gomon-heya",
  "sns:jutsu:hb-f06-sojasosai-no-jutsu",
  "sns:jutsu:hb-f06-hiraishin-cooperacao"
]);
export const PACKAGE_RELATED_PURCHASES=freeze({
  "sns:clan:aburame": [
    "Kikaichuu",
    "Shōkaichuu",
    "Kidaichuu",
    "Rinkaichuu",
    "Kikai Ninpou"
  ],
  "sns:clan:akimichi": [
    "Corpulência",
    "Resiliência",
    "Baika Ninpou",
    "Controle de Caloria",
    "Sanshoku no Gan’yaku"
  ],
  "sns:clan:hatake": [
    "Kuchiyose Restrito: Cães",
    "Tensai",
    "Presa de Prata",
    "Espada de Chakra Branco"
  ],
  "sns:clan:hyuuga": [
    "Byakugan",
    "Tenketsu Byakugan",
    "Juuken"
  ],
  "sns:clan:inuzuka": [
    "Companheiro Animal",
    "Hakken no Jutsu",
    "Shikakyu"
  ],
  "sns:clan:nara": [
    "Kagejutsu"
  ],
  "sns:clan:sarutobi": [
    "Kuchiyose Restrito: Macacos",
    "Tensai",
    "Vontade do Fogo"
  ],
  "sns:clan:senju": [
    "Mokuton",
    "Maximizar",
    "Regeneração",
    "Senjutsu",
    "Tensai"
  ],
  "sns:clan:uchiha": [
    "Elemento Natural: Katon",
    "Sharingan",
    "Nidan Sharingan",
    "Sandan Sharingan",
    "Mangekyou Sharingan"
  ],
  "sns:clan:uzumaki": [
    "Regeneração",
    "Chakra Expandido",
    "Mil Clones",
    "Kongou Fuusa",
    "Kagura Shingan"
  ],
  "sns:clan:yamanaka": [
    "Shindenshin"
  ],
  "sns:hijutsu:dokujutsu": [
    "Dokujutsu",
    "Veneno Melhorado"
  ],
  "sns:hijutsu:hachimon-tonkou": [
    "Hachimon Tonkou",
    "Estilo da Lótus"
  ],
  "sns:feature:taijutsu-de-konoha": [
    "Gouken",
    "Konoha Reppū",
    "Konoha Senpū",
    "Konoha Daisenpū",
    "Konoha Shōfū",
    "Kage Buyō",
    "Omote Renge",
    "Shishi Rendan",
    "Ura Renge",
    "Asa Kujaku",
    "Hirudora",
    "Sekizō",
    "Yagai"
  ],
  "sns:hijutsu:hibon-ninpou": [
    "Hibon Ninpou"
  ],
  "sns:power:jinchuuriki": [
    "Jinchuuriki",
    "Presença Bijuu",
    "Manto Bijuu",
    "Modo Bijuu",
    "Forma Bijuu",
    "Controle Total"
  ],
  "sns:feature:kyuubi": [
    "Cura da Raposa",
    "Modo Kurama"
  ],
  "sns:hijutsu:kagura-shingan": [
    "Kagura Shingan",
    "Ryoushitsu Kagura Shingan"
  ],
  "sns:power:kuchiyose": [
    "Kuchiyose",
    "Senjutsu",
    "Byakugou no In"
  ],
  "sns:feature:kuchiyose-aguias": [],
  "sns:feature:kuchiyose-caes": [],
  "sns:feature:kuchiyose-cobras": [],
  "sns:feature:kuchiyose-lesmas": [],
  "sns:feature:kuchiyose-macacos": [
    "Kuchiyose: Macaco",
    "Henge: Kongōnyoi"
  ],
  "sns:feature:kuchiyose-sapos": [],
  "sns:hijutsu:magen": [
    "Magen",
    "Ilusão Fluida"
  ],
  "sns:hijutsu:senjutsu": [
    "Senjutsu1",
    "Senjutsu2",
    "Senjutsu3",
    "Gyaku Kuchiyose",
    "Ryousei no Jutsu"
  ],
  "sns:hijutsu:tensai": [
    "Versatilidade",
    "Hibon Ninpou",
    "Aprendizagem Rápida",
    "Talento Natural",
    "Técnica Avançada",
    "Capacidade",
    "Controle Perfeito",
    "Instinto de Batalha",
    "Deus do Trovão",
    "Presa de Prata",
    "Vontade do Fogo",
    "Maximizar"
  ],
  "sns:clan:fuuma": [
    "Tensai",
    "Demônio do Vento"
  ],
  "sns:clan:hoshigaki": [
    "Chakra Expandido",
    "Predador Aquático",
    "Elemento Natural: Suiton",
    "Reserva de Água",
    "Kuchiyose comum: Tubarões"
  ],
  "sns:clan:hozuki": [
    "Suika no Jutsu",
    "Braço de Água"
  ],
  "sns:clan:kaguya": [
    "Artesão de Ossos",
    "Armadura Óssea",
    "Regeneração",
    "Danças de Ossos"
  ],
  "sns:clan:yotsuki": [
    "Tensai",
    "Lâmina da Lua"
  ],
  "sns:clan:yuki": [
    "Hyouton",
    "Selos Especiais",
    "Congelamento"
  ],
  "sns:feature:ichibi-sabaku": [
    "Sabaku",
    "Areia Especial",
    "Areia Suspensa"
  ],
  "sns:feature:nibi-aoi-katon": [
    "Aoi Katon",
    "Nekozume"
  ],
  "sns:feature:sanbi-sanbi-suiton": [
    "Sanbi Suiton",
    "Sangoshō",
    "Espelho d’Água"
  ],
  "sns:feature:yonbi-yonbi-youton": [
    "Yonbi Youton",
    "Manto de Lava",
    "Vulcão"
  ],
  "sns:feature:gobi-gobi-futton": [
    "Gobi Futton",
    "Armadura a Vapor"
  ],
  "sns:feature:rokubi-rokubi-suiton": [
    "Rokubi Suiton",
    "Bolhas de Sabão"
  ],
  "sns:feature:nanabi": [
    "Pó de Escamas",
    "Teia de Chakra",
    "Casulo"
  ],
  "sns:feature:hachibi": [
    "Sumi",
    "Kawarimi de Cauda",
    "Selo do Tornado"
  ],
  "sns:hijutsu:jiton": [
    "Sakin",
    "Peso do Ouro",
    "Satetsu",
    "Marca de Ferro",
    "Areia Especial"
  ],
  "sns:hijutsu:juuinka": [
    "Juuin",
    "Joutai Ichi",
    "Joutai Ni"
  ],
  "sns:hijutsu:kamijutsu": [
    "Kami",
    "Shikigami no Mai"
  ],
  "sns:hijutsu:nintaijutsu": [
    "Nintaijutsu",
    "Armadura de Relâmpago"
  ],
  "sns:hijutsu:rinnegan": [
    "Rinnegan",
    "Rinne Ninpou",
    "Shurado",
    "Jigokudo",
    "Ningendo",
    "Gakido",
    "Chikushodo",
    "Tendo",
    "Gedo"
  ],
  "sns:hijutsu:samurai": [
    "Espadachim",
    "Sabre de Chakra",
    "Iaido",
    "Yojin",
    "Issen",
    "Impedir",
    "Iaigiri",
    "Armadura Completa"
  ],
  "sns:hijutsu:senninka": [
    "Senninka",
    "Transformação Parcial",
    "Transformação Completa",
    "Transferência de Células"
  ],
  "sns:feature:kuchiyose-tubarao": [
    "Kuchiyose comum: Tubarões"
  ],
  "sns:hijutsu:saika-ikki": [
    "Disparos Sujos",
    "Recarga Precisa",
    "Gun Fu",
    "Mira Vital",
    "Armamento Pesado",
    "Alcance Estendido",
    "Atirador Ágil"
  ],
  "sns:feature:aoi-katon-independente": [
    "Aoi Katon",
    "Nekozume",
    "aptidões limitadas de Tensai"
  ],
  "sns:feature:sanbi-suiton-independente": [
    "Sanbi Suiton",
    "Sangoshō",
    "Espelho d’Água",
    "aptidão limitada de Tensai"
  ],
  "sns:feature:yonbi-youton-independente": [
    "Yonbi Youton",
    "Manto de Lava",
    "Vulcão",
    "aptidão limitada de Tensai"
  ],
  "sns:feature:gobi-futton-independente": [
    "Gobi Futton",
    "Armadura a Vapor",
    "aptidão limitada de Tensai"
  ],
  "sns:feature:rokubi-suiton-independente": [
    "Rokubi Suiton",
    "Soprador de Bolhas",
    "aptidão limitada de Tensai"
  ],
  "sns:clan:shimura": [
    "Elemento Natural: Fuuton",
    "Kuchiyose: Baku",
    "Tensai limitado",
    "Shimura Juinjutsu"
  ],
  "sns:feature:uchiha-izanami-e-izanagi": [
    "Izanami",
    "Izanagi"
  ],
  "sns:feature:uzumaki-chakra-da-cura": [
    "Regeneração de Vigor"
  ],
  "sns:clan:hoshigakure": [
    "Chakra Expandido",
    "Kujaku Myoho",
    "Kujaku: Cura",
    "Kujaku: Saimin",
    "Kujaku: Sacrifício"
  ],
  "sns:hijutsu:bakuton": [
    "Bakuton",
    "Demolição"
  ],
  "sns:hijutsu:buki-senmon": [
    "Usar Arma: Arsenal",
    "Acuidade Perfeita",
    "Arsenal Completo",
    "Mestre de Manobras",
    "Instinto de Batalha"
  ],
  "sns:hijutsu:chouju-giga": [
    "Arte de Combate",
    "Sumi Ninpou",
    "Pergaminho da Super Besta",
    "Sumi Bunshin"
  ],
  "sns:hijutsu:daikiga": [
    "Resistência Insaciável",
    "Ingestão de Chakra",
    "Rakanken",
    "Terra Insaciável"
  ],
  "sns:hijutsu:gorudogumo": [
    "Seis Braços",
    "Ouro Pegajoso",
    "Olho de Aranha",
    "Kumo Ninpou",
    "Kuchiyose comum: Aranhas"
  ],
  "sns:hijutsu:hebinomichi": [
    "Possessão da Serpente Branca",
    "Hebi Ninpou",
    "Yamata no Jutsu"
  ],
  "sns:hijutsu:jashin-juusha": [
    "Regeneração",
    "Usar Armas de Jashin",
    "Ritual de Conexão",
    "Imortalidade",
    "Combatente Sádico",
    "Jashinista Experiente"
  ],
  "sns:hijutsu:jingokuon": [
    "Ototon",
    "Sensibilidade Auditiva",
    "Tubos de Ar",
    "Kyoumei Supika",
    "Reverberação"
  ],
  "sns:hijutsu:jiongu": [
    "Corpo de Fios",
    "Jiongu",
    "Chakra Expandido Jiongu",
    "Hasukonsutoraku"
  ],
  "sns:feature:kakuran-tensai": [
    "Kakuran Taijutsu",
    "Espadas Super-Vibrantes",
    "Akurobatto"
  ],
  "sns:hijutsu:kekkei-touta-jinton": [
    "Jinton",
    "Maximizar",
    "Elemento Natural: Terra",
    "Fissão",
    "Apagar Presença"
  ],
  "sns:hijutsu:kibaku-nendo": [
    "Kibaku Nendo",
    "Boca de Moldagem"
  ],
  "sns:feature:kuchiyose-doninha": [
    "Kuchiyose: Doninha",
    "Kirikiri Mai"
  ],
  "sns:feature:kuchiyose-marisco": [
    "Kuchiyose: Marisco",
    "Magen: Kijō no Rōkaku"
  ],
  "sns:feature:kuchiyose-salamandra": [
    "Kuchiyose: Salamandra",
    "Dokugiri",
    "Engolimento"
  ],
  "sns:feature:kuchiyose-tartaruga": [
    "Kuchiyose: Tartaruga"
  ],
  "sns:hijutsu:kugutsu": [
    "Kugutsu",
    "Estrangular",
    "Kurohigi",
    "Shirohigi",
    "Akahigi",
    "Hitokugutsu"
  ],
  "sns:feature:kuroi-kaminari": [
    "Relâmpago Negro"
  ],
  "sns:hijutsu:mateki": [
    "Flautista",
    "Ilusões Avançadas",
    "Kuchiyose comum: Doki"
  ],
  "sns:hijutsu:mei-kekkei-genkai": [
    "Futton",
    "Youton",
    "Futton Sufocante",
    "Youton Corrosivo",
    "Dupla Linhagem"
  ],
  "sns:feature:nan-no-kaizou": [
    "Extração Energética",
    "Manipulação Física"
  ],
  "sns:hijutsu:ranton": [
    "Ranton",
    "Efeito Estroboscópio",
    "acesso Relâmpago Negro"
  ],
  "sns:feature:rinbo-hengoku": [
    "Rinbo: Hengoku"
  ],
  "sns:hijutsu:shakuton": [
    "Shakuton",
    "Mumificar"
  ],
  "sns:hijutsu:shouton": [
    "Shouton",
    "Cristal Guiado",
    "Barreira Regenerativa",
    "Congelamento",
    "Cristalização"
  ],
  "sns:hijutsu:souma-no-jutsu": [
    "Souma no Kou1/2/3",
    "Regeneração Gêmea"
  ],
  "sns:hijutsu:tessenjutsu": [
    "Mestre dos Leques",
    "Brisa de Navalha",
    "Capacidade dos Ventos"
  ],
  "sns:hijutsu:zetsu-seitai": [
    "Anatomia Zetsu1/2/3",
    "Clone Zetsu",
    "Elementos Irrestritos",
    "Mokuton"
  ],
  "sns:feature:kuchiyose-baku": [
    "Kuchiyose: Baku"
  ],
  "sns:feature:kuchiyose-doki": [
    "Kuchiyose comum: Doki"
  ],
  "sns:feature:desenhos-pergaminho-da-super-besta": [
    "Pergaminho da Super Besta"
  ],
  "sns:feature:hb-f05-doujutsu-transplantado": [
    "Doujutsu Transplantado",
    "Transplante Perfeito"
  ],
  "sns:feature:hb-f05-hibon-dominio-hibon-ninpou": [
    "Domínio Hibon Ninpou"
  ],
  "sns:clan:hb-f05-akimichi": [
    "Resiliência",
    "Controle de Calorias"
  ],
  "sns:clan:hb-f05-hatake": [
    "Presa de Prata"
  ],
  "sns:clan:hb-f05-hoshigaki": [
    "Predador Aquático",
    "Elemento Natural: Suiton",
    "Reserva de Água"
  ],
  "sns:clan:hb-f05-sarutobi": [
    "Vontade do Fogo"
  ],
  "sns:hijutsu:hb-f05-kamijutsu": [
    "Shikigami no Mai",
    "Kami Ninpou",
    "Emissário Divino"
  ],
  "sns:hijutsu:hb-f05-mateki": [
    "Ilusões Avançadas",
    "Kuchiyose: Doki"
  ],
  "sns:clan:hb-f05-amahoshi": [
    "Marca Estelar",
    "Tenmon Ninpou"
  ],
  "sns:clan:hb-f05-kaminari": [
    "Corpo Condutor",
    "Elemento Natural: Raiton",
    "Sobrecarga",
    "acesso Kuroi Kaminari"
  ],
  "sns:clan:hb-f05-kurama": [
    "Personalidade Dividida",
    "Ilusão Real",
    "Ilusão Fluida",
    "Teatro da Mente"
  ],
  "sns:clan:hb-f05-namizuka": [
    "Sangue do Abismo",
    "Modo Abissal",
    "Monstro Marinho",
    "Kaiju Ninpou"
  ],
  "sns:clan:hb-f05-ryuusei": [
    "Domínio Elemental",
    "Caminho dos Cinco Fluxos"
  ],
  "sns:clan:hb-f05-seryuu-seiryuu": [
    "Controle do Fogo",
    "Chakra Expandido",
    "Postura de Gato",
    "Garras de Gato",
    "Regeneração",
    "Aoi Katon"
  ],
  "sns:clan:hb-f05-shirakumo": [
    "Tecelão de Batalha",
    "Lâmina de Seda",
    "Mestre Tecelão",
    "Ito Ninpou",
    "Kuchiyose comum: Aranhas"
  ],
  "sns:hijutsu:hb-f05-corpo-e-olhos-do-sabio": [
    "Corpo do Sábio",
    "Olhos do Sábio",
    "Ame no Tejikara",
    "Sennin Ninpou"
  ],
  "sns:hijutsu:hb-f05-fuuinshi-no-michi": [
    "Caligrafia Perfeita",
    "Símbolos Vivos",
    "Kaijo no Geijutsu",
    "Selamento Reforçado"
  ],
  "sns:hijutsu:hb-f05-heranca-do-deus-shinobi": [
    "Transplante de Células",
    "Raízes da Vida",
    "Mokuton"
  ],
  "sns:hijutsu:hb-f05-jinchuuriki-falso": [
    "Jinchuuriki Falso",
    "Presença do Selo",
    "Manto Corrompido",
    "Modo Besta Instável",
    "Controle Total"
  ],
  "sns:hijutsu:hb-f05-karada-no-shinka": [
    "Punho Condutor",
    "Corpo Ajustável",
    "Sequência Marcial"
  ],
  "sns:hijutsu:hb-f05-ketsumyaku-no-ogi": [
    "Regeneração",
    "Sangue Perfurante",
    "Domínio Hemático1/2",
    "Sangue Revitalizador",
    "Arte do Sangue Vivo"
  ],
  "sns:feature:hb-f05-kuchiyose-cavalo": [
    "Kuchiyose: Cavalo"
  ],
  "sns:feature:hb-f05-kuchiyose-dragao": [
    "Kuchiyose: Dragão"
  ],
  "sns:feature:hb-f05-kuchiyose-escorpiao": [
    "Kuchiyose: Escorpião"
  ],
  "sns:feature:hb-f05-kuchiyose-lobos": [
    "Kuchiyose: Lobos"
  ],
  "sns:feature:hb-f05-kuchiyose-raposa": [
    "Kuchiyose: Raposa"
  ],
  "sns:hijutsu:hb-f05-medium": [
    "Percepção Espiritual",
    "Canal Espiritual",
    "Telecinese"
  ],
  "sns:hijutsu:hb-f05-mestre-da-agua": [
    "Tensai limitado",
    "Azure Fang"
  ],
  "sns:hijutsu:hb-f05-tenseigan": [
    "Tenseigan",
    "Manto Tenseigan",
    "Tensei Ninpou"
  ],
  "sns:feature:hb-f05-dois-hijutsus-limitados": [
    "quota de dois hijutsus"
  ],
  "sns:feature:hb-f05-restricao-chakra-expandido": [
    "restrição Bunshin Básico"
  ],
  "sns:feature:hb-f05-desvantagem-heroica": [
    "Desvantagem Heroica"
  ]
});
