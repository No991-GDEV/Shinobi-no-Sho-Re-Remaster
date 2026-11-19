Beta **0.5.0-beta.2** para Foundry VTT **14.367** — Poder Genjutsu (`Miragem` e `Fascinar`), vínculo de Kuchiyose extra com seletor Padrão vs Restrito e compatibilidade do seletor de retrato com Sqyre.

- **Poder guiado `Genjutsu` (`Miragem` e `Fascinar`):** novo poder com os efeitos `Miragem` (variantes imóveis/móveis por categoria de tamanho liberadas pela Inteligência) e `Fascinar` (teste de resistência de Inteligência automatizado com Dif `6 + INT`, somando `+1` com *Ilusão Profunda* e aplicando a condição `Fascinado`), além de campo no construtor de jutsus para descrever o efeito visual/narrativo de cada ilusão no card do chat.
- **Vínculo de Kuchiyose extra e seletor `Padrão` vs `Restrito` na ficha da invocação:** suporte a contratos e poderes concedidos pelo mestre (0 PP) ao vincular invocações, aceitação de `powerOrigin: 'restricted'` e novo seletor **Fonte do Kuchiyose** (**Kuchiyose Padrão / Comum · −3** vs **Kuchiyose Restrito / Invocação · sem −3**) diretamente na barra de vínculo e na Construção da invocação.
- **Compatibilidade de imagens e retratos com Sqyre:** uso de `FilePicker.implementation` (`CONFIG.ux.FilePicker`) com `redirectToRoot` e `browse()` nos retratos de personagens, atores de apoio e itens.

- **Automações híbridas estilo PF2e nos itens:** suporte a regras passivas (`passiveRules`), modos/toggles com estágios (ex.: Hachimon Tonkou), ações rápidas e reservas de cargas (`Kikaichuu`, `Rinkaichuu`, `Kidaichuu`, `Reserva de Água`, `Bombas de Argila`), além do desbloqueio de Kekkei Genkai e Hijutsus baseados em efeito para PJs e sincronização direta de receitas na aba Jutsus.
- **Fontes homebrew opcionais (D115):** adicionadas as expansões opcionais *Kibaku Nendo Revisado* e *Pergaminho Canônico* (desativadas por padrão nas configurações do sistema).
- **Envio universal de itens ao chat:** clique na miniatura de qualquer item na ficha (armas, equipamentos, clãs, aptidões, poderes, ações, fórmulas, aptidões ativas e técnicas) para publicar um card formatado no chat sem gastar recursos.
- **Nova sub-aba `Aptidões ativas` e toggles rápidos:** removido o atalho redundante `Efeitos ativos` de **Jutsus** em favor da sub-aba agrupada **Aptidões ativas** (`Doujutsu & Modos`, `Ativações & Ações`, `Reservas & Cargas`), mantendo uma barra compacta **Ativações rápidas** na aba **Ações**.
- **Revisão UI/UX PF2e + Naruto (Carmesim, Pergaminho e Dourado):** remoção dos tons azuis de diálogos, barras e botões; molduras escuras nos ícones (corrigindo `Colete Ninja` e SVGs brancos); correção do balão de chat no hover; agrupamento de modos de ataque em armas e respiro na nuvem da sidebar.
- **Redesign completo das fichas de itens:** cabeçalho PF2e em moldura escura, tag de tipo sem duplicação, **Sidebar esquerda contextual** para todos os tipos e nova aba dedicada **Regras**, deixando a aba **Descrição** limpa.

Mantém os 14 compêndios e as 1.422 entradas canônicas. Nenhuma alteração nas fichas já salvas ou nos textos dos livros.

**Atualização:** sistema e módulo de compêndios passam juntos para **0.5.0-beta.2**. Os identificadores e os endereços de atualização permanecem os mesmos desde a beta.2; não é necessário trocar o manifesto a cada versão.

- Sistema: https://raw.githubusercontent.com/No991-GDEV/Shinobi-no-Sho-Re-Remaster/main/system.json
- Compêndios: https://raw.githubusercontent.com/No991-GDEV/Shinobi-no-Sho-Re-Remaster/main/module.json

Faça backup do mundo e atualize ambos os pacotes antes de reabri-lo. A publicação mantém o canal existente de atualização; a sincronização de catálogos próprios de hospedagens depende do serviço.

Projeto comunitário não oficial. Créditos e condições de código, textos e arte preservados em LICENCIAMENTO.md, docs/FONTES.md e nos avisos dos pacotes.
