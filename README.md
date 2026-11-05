# Shinobi no Sho Re-Remaster

Sistema comunitário não oficial de **Naruto: Shinobi no Sho** para **Foundry VTT 14**. Versão **0.4.0-beta.5**.

## Instalação no Foundry

Na tela inicial, abra **Game Systems → Install System**, cole o endereço abaixo no campo **Manifest URL** e clique em **Install**:

```text
https://raw.githubusercontent.com/No991-GDEV/Shinobi-no-Sho-Re-Remaster/main/system.json
```

Aceite a instalação da dependência **Shinobi no Sho · Compêndios** quando o Foundry oferecer. O sistema e os 14 compêndios são baixados pelo Foundry; você não precisa copiar pastas nem usar o executável de desenvolvimento.

Crie um mundo escolhendo **Naruto: Shinobi no Sho · Re-Remaster**. Se o módulo de conteúdo não estiver ativo, abra **Manage Modules**, marque **Shinobi no Sho · Compêndios**, salve e recarregue. A relação obrigatória do sistema identifica esse módulo.

O manifesto aponta para o pacote publicado da beta. O código na branch principal pode conter alterações posteriores à versão instalável.

## Primeiro uso

O mestre cria um ator do tipo **Shinobi** e concede ao jogador a permissão **Dono** em **Configure Ownership**. O jogador abre **Criação do personagem** para escolher NC, atributos, perícias, origem, poderes e aptidões.

As lupas da ficha abrem o catálogo já filtrado. Os filtros podem ser alterados; marque **Buscar em todas as categorias** para pesquisar o catálogo inteiro permitido ao seu usuário. Em **Jutsus → Gerenciar jutsus**, adicione as técnicas sugeridas para um poder adquirido. Ao usar uma técnica automatizada, escolha o nível quando solicitado; o custo é cobrado uma vez. Técnicas sem controlador publicam a descrição e indicam o controle manual dos custos e efeitos. Cartões de chat oferecem ataque, defesa/resistência, dano e área quando a técnica tem esses parâmetros.

O mestre encontra **Gerar NPC / capanga** no diretório de atores e o bestiário nos compêndios. Efeitos temporários ficam em **Efeitos**; o descanso fica junto à Vitalidade. O dono pode aplicar dano na própria ficha pelo cartão; o mestre pode desfazer.

## Efeitos e fontes opcionais

Na aba **Efeitos**, clique no nome de um estado para abrir seu item: descrição, notas, origem, duração e alterações adicionais. O mestre configura os modificadores; o dono consulta o efeito e pode encerrá-lo pelos controles permitidos. Ativações e transformações antigas recebem um item vinculado automaticamente, sem novo pagamento. Benefícios e custos próprios continuam ligados à técnica de origem.

Em **Game Settings → Naruto → Abrir configurações**, o mestre pode ativar **Legado do Ódio**. A opção vem desativada em mundos novos. Desativar a fonte oculta suas entradas do catálogo e bloqueia novas aquisições; cópias já existentes nas fichas são conservadas. A configuração do Gobi permanece independente.

## Estado da beta

- Criação/evolução guiadas; requisitos, orçamento e concessões; fichas de PJ, NPC e apoio.
- Equipamentos, poderes, técnicas, receitas, efeitos e bestiário dos livros/fontes identificados.
- Ataques, defesas, custos, aplicação/desfazer dano, condições e áreas conforme o controlador disponível.
- Equipe, invocações e gerador de NPC/capanga.

Nem toda regra narrativa tem um controlador integral. Exceções das referências do anime não concedem permissões a PJs. Alterações específicas de campanha ficam na própria ficha/item. A versão foi validada em Foundry **14.367**; não há suporte declarado para outras gerações. Registre problemas em **Issues**, com a versão, os passos e o resultado esperado.

## Atualização

Faça backup do mundo antes de atualizar. Use **Check Update** no sistema e no módulo de conteúdo. Mantenha os dois na mesma versão da beta. Os identificadores históricos `sns-v14-dev` e `sns-conteudo-dev` foram conservados para manter UUIDs e compatibilidade com os mundos de desenvolvimento.

## Créditos e conteúdo

Shinobi no Sho: Projeto D8 e autores identificados em cada fonte. Regras oficiais, homebrews, arte e código adaptado têm procedências diferentes. Consulte [LICENCIAMENTO.md](LICENCIAMENTO.md), [docs/FONTES.md](docs/FONTES.md) e os avisos incluídos nos pacotes. Não há uma declaração geral de que todo material de terceiros seja “free use”. Este projeto não é uma publicação oficial de Naruto, do Projeto D8, do PF2e/SF2e ou da Foundry Gaming.

## Compilar

Requer Node.js 22+ e Python 3. Instale as dependências com `npm ci`, depois execute `npm test`, `npm run build` e `npm run check`. Os arquivos instaláveis são gerados em `dist/github/`; somente esses arquivos e os manifestos devem ser anexados à release `v0.4.0-beta.5`.

O build compila novos bancos de compêndio a partir dos JSONs de autoria. Não lê bancos de mundos ou packs abertos. Não distribua uma instalação do Foundry, dados de campanha, licenças de ativação, senhas, chaves de API ou backups.
