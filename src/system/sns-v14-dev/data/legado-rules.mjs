export const LEGADO_PREFIX='sns:legado:';
export const LEGADO_PAIRS=Object.freeze([
 {id:'lua-sol',label:'Tsukuyomi / Amaterasu',techniques:['tsukuyomi','amaterasu']},
 {id:'enton',label:'Kagutsuchi / Amaterasu',techniques:['kagutsuchi','amaterasu']},
 {id:'kamui',label:'Kamui · curto / longo alcance',techniques:['kamui-curto-alcance','kamui-longo-alcance'],shared:['kamui']},
 {id:'sorte',label:'Bishamonten / Kisshouten',techniques:['bishamonten','kisshouten']},
 {id:'controle',label:'Kotoamatsukami / Mahikami',techniques:['kotoamatsukami','mahikami']},
 {id:'hachiman',label:'Hachiman · Migi / Hidari',techniques:['hachiman-migi','hachiman-hidari'],shared:['hachiman','hachiman-ketsuyoko']},
 {id:'espaco',label:'Ame-no-Tejikara / Gyaku Sekai',techniques:['ame-no-tejikara','gyaku-sekai-no-jutsu']},
 {id:'yomi',label:'Yata no Kagami / Yomotsu Ōkami',techniques:['yata-no-kagami','yomotsu-okami'],susanooException:true}
]);
export const LEGADO_STAGES=Object.freeze([
 {stage:1,name:'Costelas',esp:0,size:'Médio',hardness:1,absorption:esp=>esp,gain:0,reach:2},
 {stage:2,name:'Esqueleto',esp:0,size:'Grande',hardness:2,absorption:esp=>esp+5,gain:10,reach:3},
 {stage:3,name:'Armadura',esp:17,size:'Grande',hardness:3,absorption:esp=>esp+10,gain:15,reach:3},
 {stage:4,name:'Corpo Completo',esp:18,eternal:true,size:'Enorme',hardness:3,absorption:esp=>2*esp,gain:20,reach:4},
 {stage:5,name:'Forma Perfeita',esp:20,eternal:true,size:'Colossal',hardness:3,absorption:esp=>3*esp,gain:esp=>esp,reach:5}
]);
export const LEGADO_WEAPON_PROPERTIES=Object.freeze({
 cc:['dano','carregada','guerreira','longa','letal','mortal','devastadora','ambidestra'],
 cd:['dano','alcance','letal','mortal','devastadora','flechas','implacavel']
});
export const LEGADO_TECHNIQUES=Object.freeze({
 'mimica-sharingan':['copiar','copia-rapida','anular','memorizar','esquecer','aprender'],
 'hipnose-sharingan':['informacao','atitude','exaurir','paralisar','controlar','bijuu','roubar','falsa-morte','sobrepor','reverter'],
 amaterasu:['padrao','completa','concentrar','encerrar'],
 kagutsuchi:['enton','imediato','estilo-inferno','armas','extinguir','proteger','muralha','investida'],
 tsukuyomi:['mensageiro','torturador','programar'],
 kamui:['ativar','entrar','sair','levar','encerrar'],
 'kamui-curto-alcance':['objetos','expelir','intangivel','tangivel','instantanea','liberdade','escapar','abduzir'],
 'kamui-longo-alcance':['ofensiva','manter','defensiva','defensiva-parcial','teleportar','redirecionar','encerrar'],
 bishamonten:['ativar','ataque','defesa','espiral','encerrar'],
 kisshouten:['carisma','destino','misericordia','vida-facil'],
 kotoamatsukami:['controlar','encerrar'],
 mahikami:['usar','sustentar','encerrar'],
 hachiman:['ativar','manter','encerrar'],
 'hachiman-migi':['velocidade'], 'hachiman-hidari':['forca'], 'hachiman-ketsuyoko':['ativar','encerrar'],
 'ame-no-tejikara':['portal','manter','teletransporte','troca-rapida','oportunista','encerrar'],
 'gyaku-sekai-no-jutsu':['surpreender','de-novo','aliado'],
 susanoo:['ativar','completa','evoluir','regredir','recuperar','recriar','braco','arma-cc','arma-cd','barreira','tormenta','encerrar'],
 'takemikazuchi-no-kami':['usar','honoikazuchi'], 'indra-no-vajra':['usar'],
 'yata-no-kagami':['elemento','bloquear'], 'yomotsu-okami':['absorver','constituicao','escudo','revitalizar','restabelecer']
});
export const LEGADO_MODE_LABELS={copiar:'Copiar técnica','copia-rapida':'Cópia Rápida',anular:'Anular Técnica',memorizar:'Memorizar',esquecer:'Esquecer',aprender:'Aprender por 2 PP',informacao:'Conseguir Informação',atitude:'Alterar Atitude',exaurir:'Exaurir',paralisar:'Paralisar',controlar:'Controlar',bijuu:'Controlar Bijuu',roubar:'Roubar Técnica','falsa-morte':'Falsa Morte',sobrepor:'Sobrepor Genjutsu',reverter:'Reverter Ilusão',padrao:'Ação Padrão',completa:'Ação Completa',concentrar:'Concentrar',encerrar:'Encerrar',enton:'Enton',imediato:'Amaterasu Imediato + Enton','estilo-inferno':'Estilo Inferno',armas:'Armas Infernais',extinguir:'Extinguir Chamas',proteger:'Proteção de Susano’o',muralha:'Muralha Infernal',investida:'Investida Negra',mensageiro:'Mensageiro',torturador:'Torturador',programar:'Programar Amaterasu',ativar:'Ativar',entrar:'Entrar na dimensão',sair:'Sair da dimensão',levar:'Levar alvo voluntário',objetos:'Abdução de Objetos',expelir:'Expelir Objetos',intangivel:'Intangibilidade',tangivel:'Encerrar Intangibilidade',instantanea:'Intangibilidade Instantânea',liberdade:'Liberdade de Movimentos',escapar:'Sair de agarramento',abduzir:'Abdução de Curto Alcance',ofensiva:'Abdução Ofensiva',manter:'Manter',defensiva:'Abdução Defensiva','defensiva-parcial':'Abdução Defensiva · Parcial',teleportar:'Teleportar Ataque',redirecionar:'Redirecionar Ataque',ataque:'Ataque Perfeito',defesa:'Defesa Perfeita',espiral:'Espiral Perfeita',carisma:'Carisma Sobrenatural',destino:'Ventos do Destino',misericordia:'Misericórdia Divina','vida-facil':'Vida Fácil',libertar:'Teste de libertação',usar:'Usar',sustentar:'Sustentar',velocidade:'Rápido Como um Rio',forca:'Força de um Tufão',portal:'Transporte Dimensional',teletransporte:'Teletransporte','troca-rapida':'Troca Rápida',oportunista:'Troca Rápida Oportunista',surpreender:'Surpreender','de-novo':'De Novo',aliado:'De Novo · aliado',evoluir:'Evoluir Susano’o',regredir:'Regredir Susano’o',recuperar:'Recuperar Absorção',recriar:'Recriar após destruição',braco:'Braço do Susano’o','arma-cc':'Armamento · corpo a corpo','arma-cd':'Armamento · à distância',barreira:'Defesa Rápida',tormenta:'Técnicas das Tormentas',honoikazuchi:'Honoikazuchi',elemento:'Escolher elemento',bloquear:'Bloquear · Yata',absorver:'Registrar chakra absorvido',constituicao:'Constituição de Yomi',escudo:'Escudo de Almas',revitalizar:'Revitalização Impura',restabelecer:'Falsas Chamas de Yomi'};
