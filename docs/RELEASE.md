Beta **0.4.0-beta.5** para Foundry VTT **14.367**. Sistema e módulo de compêndios são publicados juntos.

### Novidades desta beta

- **Bloquear na ficha de PJ e NPC.** Se há um ataque aguardando defesa, o botão usa suas opções válidas de bloqueio. Sem ataque pendente, publica um teste avulso de defesa, sem aplicar dano ou cobrar custos. Arma, Acuidade, tamanho e restrições do ataque são considerados; um teste avulso não determina sozinho se um ataque foi bloqueado.
- **Ações alinhadas à esquerda**, incluindo ações personalizadas, reações e ações livres. No PJ, essas seções aparecem antes da lista extensa de técnicas. O NPC também passa a mostrar suas reações e ações livres na aba Principal.
- **Chat mais compacto**, com precisão, modificadores e características adicionais recolhidos em detalhes que podem ser abertos. Os resultados e controles de combate continuam visíveis.
- **Catálogo explica aquisições bloqueadas**, com o motivo e um cadeado. Os requisitos continuam sendo verificados.
- Removidos os campos vazios de dano base nas ações. A defesa de referência do NPC fica em Notas; a defesa usada nas rolagens continua na lateral da ficha.

### Acumulado desde a beta.2

- Desfazer o uso de um jutsu pelo mestre, incluindo os custos do usuário e as alterações de dano, efeitos e áreas vinculadas àquele uso. Reações dos alvos permanecem separadas. Alterações posteriores incompatíveis impedem uma reversão insegura.
- Ataque, defesa e dano no mesmo cartão de chat; correções para o jogador mostrar dano e cancelar seu ataque. O mestre que controla o token do alvo também recebe o pedido de defesa.
- Busca em todas as categorias, filtros editáveis, índices em cache e resultados em lotes. Corrigida a visibilidade dos itens da Enciclopédia, Manual e Ryōri para jogadores, incluindo Kuchiyose: Escorpião; o bestiário permanece reservado ao mestre.
- Técnicas avulsas utilizáveis por PJ e NPC, com cartão descritivo quando não há automação. Nesses casos, os custos e efeitos manuais são indicados.
- Testes de atributos e edição da defesa fixa no NPC; atualização da esquiva perceptiva do Sharingan; correções de Acuidade e Reflexos, sem conceder um bônus universal de +2.
- Remoção de aptidões e características pelo assistente, criação de genjutsus de Magen e progressão de Kikai Ninpou na ficha.
- Botões de técnicas com ícone de dado e **Usar**, mais curtos; descrições longas preservadas fora dos campos compactos de custo e ação.

Mantidos **14 compêndios e 1.422 documentos**, os identificadores e os textos dos livros. Legado do Ódio continua opcional, desativado em mundos novos. Este lote prioriza desempenho, interface e correções, sem novos livros. O erro intermitente no primeiro arraste de NPC não foi reproduzido e não é anunciado como corrigido.

### Atualização

Faça backup do mundo. Na administração do Foundry, use **Check Update** para atualizar tanto o sistema quanto **Shinobi no Sho · Compêndios** para **0.4.0-beta.5** antes de reabrir o mundo. Os manifestos permanecem nos mesmos endereços, permitindo atualizar instalações existentes:

- [Sistema](https://raw.githubusercontent.com/No991-GDEV/Shinobi-no-Sho-Re-Remaster/main/system.json)
- [Módulo de compêndios](https://raw.githubusercontent.com/No991-GDEV/Shinobi-no-Sho-Re-Remaster/main/module.json)

Créditos e condições de código, textos e arte em LICENCIAMENTO.md, docs/FONTES.md e nos avisos dos pacotes. Projeto comunitário não oficial.
