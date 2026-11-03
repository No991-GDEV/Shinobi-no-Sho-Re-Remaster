// SNS sheet families. PF2e supplies the presentation pattern, never the rules engine.
const field=(key,label,kind='text')=>({key,label,kind});
const fields=(...rows)=>rows.map(r=>field(...r));
const activation=fields(['action','Ação'],['range','Alcance'],['target','Alvo / área'],['duration','Duração'],['chakraCost','Custo de chakra'],['requirements','Requisitos']);
const physical=fields(['usage','Uso / mãos'],['size','Tamanho'],['price','Preço em Ryo','number'],['ownership','Propriedade / empréstimo']);
const profile=(label,category,icon,details=[],isPhysical=false)=>({label,category,icon,details,physical:isPhysical});
export const ITEM_PROFILES={
 reference:profile('Referência','equipment','fa-book-open',fields(['requirements','Requisitos'])),
 weapon:profile('Arma','weapons','fa-khanda',[...physical,...fields(['weaponClass','Classe: leve, mediana ou longa'],['attackMode','Formas de ataque'],['ccAttribute','Atributo de CC (somente arma permitida)'],['damage','Dano da arma'],['range','Alcance'],['precision','Precisão do NPC','number'],['reload','Recarga'])],true),
 armor:profile('Armadura','armor','fa-vest',[...physical,...fields(['absorption','Absorção'],['penalty','Penalidades'],['capacityModifier','Ajuste do limite de carga','number'])],true),
 shield:profile('Proteção','armor','fa-shield-halved',[...physical,...fields(['absorption','Absorção'],['resistance','Resistência'],['restrictions','Restrições'])],true),
 equipment:profile('Equipamento','equipment','fa-toolbox',physical,true),
 service:profile('Serviço','equipment','fa-coins',fields(['price','Preço em Ryo','number'])),
 consumable:profile('Consumível','consumables','fa-flask',[...physical,...fields(['action','Ação'],['duration','Duração'],['uses','Usos atuais','number'],['usesMax','Usos máximos','number'],['effect','Efeito / cura / veneno'],['requirements','Requisitos'])],true),
 ammunition:profile('Munição','ammunition','fa-bullseye',[...physical,...fields(['compatible','Armas compatíveis'],['perCompartment','Unidades por compartimento','number'])],true),
 container:profile('Recipiente','containers','fa-suitcase',[...physical,...fields(['capacity','Capacidade de armazenamento','number'],['contents','Conteúdo / referências'])],true),
 treasure:profile('Objeto especial','treasures','fa-gem',physical,true),
 kit:profile('Kit','equipment','fa-box-open',[...physical,...fields(['contents','Lista de componentes'],['uses','Usos atuais','number'],['usesMax','Usos máximos','number'])],true),
 document:profile('Livro / pergaminho','equipment','fa-book',[...physical,...fields(['author','Autor'],['contents','Conteúdo / conhecimentos'])],true),
 action:profile('Ação','standard','fa-diamond',activation),
 attack:profile('Ataque','standard','fa-crosshairs',[...activation,...fields(['precision','Precisão','number'],['damage','Dano base'],['defenses','Defesas permitidas'])]),
 aptitude:profile('Aptidão','aptitudes','fa-award',fields(['requirements','Requisitos'],['powerCost','Custo em PP','number'],['repeat','Recompra / progressão'],['grantRule','Regra de concessão verificada'],['resourceRule','Recurso concedido'],['action','Ativação'],['restrictions','Restrições'])),
 power:profile('Poder','powers','fa-fire',activation.concat(fields(['powerCost','Custo em PP','number'],['resourceRule','Recurso concedido'],['progression','Progressão / efeitos conhecidos'],['powerOrigin','Origem do poder'],['organization','Forma de organização'],['keyAttribute','Atributo-chave'],['nature','Natureza / especialidade']))),
 jutsu:profile('Técnica / jutsu','techniques','fa-wand-magic-sparkles',activation.concat(fields(['damage','Dano base'],['defenses','Defesas permitidas'],['effect','Efeito'],['powerId','Poder vinculado · ID na ficha']))),
 effect:profile('Efeito','effects','fa-burst',fields(['duration','Duração'],['sourceActor','Origem'],['effect','Efeito'],['ending','Condição de término'])),
 effectDefinition:profile('Componente de jutsu','effectDefinitions','fa-fire',fields(['action','Ação'],['range','Alcance'],['target','Alvos / área'],['duration','Duração'],['chakraCost','Custo de chakra'],['damage','Dano base'])),
 condition:profile('Condição','effects','fa-heart-crack',fields(['degree','Grau / intensidade','number'],['effect','Penalidades / efeitos'],['duration','Duração'],['ending','Como remover'])),
 affliction:profile('Veneno / aflição','effects','fa-skull',fields(['poisonCategory','Categoria'],['onset','Início'],['resistance','Teste de resistência'],['stages','Estágios'],['treatment','Tratamento / antídoto'])),
 clan:profile('Clã / linhagem','features','fa-fingerprint',fields(['requirements','Requisitos'],['access','Acesso autorizado'],['progression','Aptidões e poderes associados'])),
 hijutsu:profile('Hijutsu','features','fa-scroll',fields(['requirements','Requisitos'],['access','Acesso autorizado'],['progression','Progressão'])),
 background:profile('Origem / antecedente','features','fa-mountain-sun',fields(['village','Vila / região'],['connections','Vínculos'],['training','Formação'])),
 feature:profile('Característica','features','fa-star',fields(['resourceRule','Recurso concedido'],['featureRule','Regra da característica'],['eyeStage','Estágio do olho transplantado'],['stagePowerCost','PP do estágio ocular completo','number'],['donor','Doador / origem do olho'],['requirements','Requisitos'],['effect','Benefícios / restrições'])),
 formula:profile('Fórmula','formula','fa-hammer',fields(['requirements','Perícia / requisitos'],['ingredients','Ingredientes'],['time','Tempo'],['difficulty','Dificuldade'],['output','Produto / quantidade'],['price','Custo em Ryo · mestre','number']))
};
export const ACTOR_PROFILES={
 npc:{label:'NPC',icon:'fa-user-ninja',combat:true,sections:[['Identidade',fields(['role','Papel / comportamento'],['rank','Rank'],['village','Vila / facção'],['defense','Defesa publicada'])],['Perícias e sentidos',fields(['skills','Perícias relevantes'],['senses','Sentidos'],['languages','Idiomas'],['resistances','Resistências'],['immunities','Imunidades'],['weaknesses','Fraquezas'])]]},
 companion:{label:'Companheiro / invocação',icon:'fa-paw',combat:true,sections:[['Vínculo',fields(['kind','Invocação, clone, parceiro ou parasita'],['master','Ator vinculado (UUID)'],['control','Controle / ações'],['duration','Duração'],['shared','Recursos partilhados / restrições'])]]},
 hazard:{label:'Perigo / armadilha',icon:'fa-triangle-exclamation',combat:false,sections:[['Detecção e desarme',fields(['detection','Perceber / dificuldade'],['disable','Desarmar / requisitos'],['trigger','Gatilho'])],['Funcionamento',fields(['routine','Rotina'],['damage','Dano / consequências'],['reset','Rearme'],['resistance','Resistência / integridade'])]]},
 loot:{label:'Depósito / comerciante',icon:'fa-box-open',combat:false,sections:[['Depósito',fields(['mode','Depósito, tesouro ou comerciante'],['owner','Proprietário / responsável'],['location','Localização'],['trade','Condições de compra e venda'],['funds','Saldo em Ryo · mestre','number'])]]},
 party:{label:'Equipe',icon:'fa-people-group',combat:false,sections:[['Missão',fields(['mission','Missão atual'],['rank','Rank'],['objective','Objetivo'],['reward','Recompensa total em Ryo · mestre','number'],['division','Divisão entre participantes'])],['Exploração',fields(['formation','Formação'],['activities','Atividades dos membros'],['supplies','Suprimentos / recursos partilhados'])]]},
 vehicle:{label:'Veículo',icon:'fa-ship',combat:false,sections:[['Estrutura',fields(['size','Dimensões'],['crew','Tripulação'],['passengers','Passageiros'],['speed','Deslocamento'],['integrity','Integridade'],['resistance','Resistência'])],['Operação',fields(['pilot','Pilotagem / perícia'],['capacity','Capacidade de carga'],['restrictions','Restrições'])]]},
 squad:{label:'Unidade / tropa',icon:'fa-flag',combat:false,sections:[['Organização',fields(['commander','Comandante'],['faction','Facção'],['strength','Efetivo'],['formation','Formação'])],['Situação',fields(['objective','Objetivo'],['supplies','Suprimentos'],['morale','Moral / condição'],['losses','Baixas'])]]}
};
export function normalizeTags(value){return [...new Set((Array.isArray(value)?value:String(value??'').split(',')).map(x=>String(x).trim()).filter(Boolean))];}
export function itemProfile(item){if(item.type==='reference'&&item.system?.category){const type=Object.keys(ITEM_PROFILES).find(k=>k!=='reference'&&ITEM_PROFILES[k].category===item.system.category);if(type)return ITEM_PROFILES[type];}return ITEM_PROFILES[item.type]??ITEM_PROFILES.reference;}
export function itemCategory(item){return item.type==='jutsu'&&item.flags?.['sns-v14-dev']?.puppetUse?'techniques':item.system?.category||itemProfile(item).category;}
export function typeForCategory(category){return Object.keys(ITEM_PROFILES).find(k=>k!=='reference'&&ITEM_PROFILES[k].category===category)??'action';}
export const CATEGORIES={weapons:'Armas',armor:'Armaduras / proteções',equipment:'Equipamentos',consumables:'Consumíveis',ammunition:'Munição',treasures:'Objetos especiais',containers:'Recipientes',standard:'Ações',reaction:'Reações',free:'Ações livres',exploration:'Exploração',downtime:'Interlúdio',powers:'Poderes',techniques:'Técnicas',effectDefinitions:'Componentes de jutsu',effects:'Efeitos / condições',aptitudes:'Aptidões',features:'Clãs e características',formula:'Fórmulas'};
