# Stock Checker — dashboard local

Painel interativo para os outputs da skill privada `mtg-stock-checker`.

## Abrir

Acesse `stock-checker/index.html` a partir da pasta `Apps` ou, se GitHub Pages estiver ativo, `https://zelderhipert.github.io/Apps/stock-checker/`.

Clique **Abrir pasta de resultados** e escolha `%USERPROFILE%\\MTGverse\\outputs\\stock-checker\\latest` no Windows (ou `~/MTGverse/outputs/stock-checker/latest` no macOS/Linux). Também é possível usar **Selecionar arquivos** e escolher `oportunidades_es.csv`, `resumo_lojas.csv`, `pendencias.csv` e `diagnostics.json`. Somente `oportunidades_es.csv` é obrigatório.

A seleção manual é necessária: uma página web não pode abrir arquivos arbitrários do disco sem permissão. Não há login, backend, upload, servidor, CDN, telemetria ou leitura automática de GitHub privado. Os dados ficam em memória na aba e não são salvos em localStorage.

## Recursos

- KPIs, filtros por loja/Want/Maybeboard, pesquisa de carta/deck, ordenação e comparação expandível;
- diferença monetária e percentual em colunas separadas (e recálculo compatível com CSVs V3 anteriores);
- agrupamento por carta, mantendo múltiplas impressões/ofertas e vínculos com decks;
- resumo por loja, pendências, diagnósticos, links HTTPS seguros para LigaMagic;
- exportar as linhas filtradas novamente em CSV UTF-8 com ponto e vírgula.

O menor preço da Liga é **referência nominal**, potencialmente outra impressão ou estado. Não inferir estoque zero de cartas sem ofertas. Totais por loja são **indicativos sem frete**, uma unidade por carta.

## Desenvolvimento

O parser CSV e utilitários compartilhados ficam em `../packages/mtg-report-kit/report-kit.js`, sem dependências externas. A lógica específica está em `app.js`. Para testar parser: `node --test ../packages/mtg-report-kit/test/report-kit.test.cjs`.

A aplicação é read-only e não grava nada na LigaMagic.

## Artes das cartas — Scryfall

O dashboard inclui miniaturas na linha da carta, em cada oferta de loja e nas pendências. Clique em qualquer miniatura para ampliar a carta inteira, inclusive frente/verso quando a API trouxer as duas faces. Os direitos/assinaturas dos artistas e copyright na própria imagem são preservados.

- Oferta com **edição + número de colecionador** identificados no Scryfall: indicador **Impressão identificada**.
- Oferta com apenas **sigla da edição** (caso mais comum na V3): imagem de **uma impressão daquela edição**, sem garantia de corresponder à variante de arte, idioma ou acabamento efetivamente ofertados.
- Código de edição desconhecido, carta indisponível na edição ou pendência sem oferta: **Imagem ilustrativa**, usando qualquer impressão retornada pelo Scryfall.
- Imagens ausentes ou API indisponível: o quadro da imagem permanece com indicador neutro; **as ofertas e preços continuam funcionando**.

A camada `packages/mtg-report-kit/scryfall-images.js` faz lookup gradual (máximo aproximado de 1,7 solicitações por segundo, cache em memória e `localStorage` só de metadados das imagens por até 7 dias). O usuário não precisa executar a skill outra vez para ver as imagens no CSV existente.

**Privacidade:** não existe upload dos relatórios para Scryfall ou GitHub. Quando as imagens aparecem na tela, o navegador envia ao Scryfall apenas o nome da carta e, quando houver, sigla da edição/número de colecionador. As imagens dependem de conexão com a internet; os dados do stock-check permanecem utilizáveis offline.

**Créditos e direitos:** imagens obtidas via Scryfall. A arte das cartas pertence à Wizards of the Coast e/ou respectivos titulares. Projeto não oficial e não endossado. Utilizamos a carta completa em vez de `art_crop`, preservando os créditos na moldura.

## Consultar o estoque da loja

Cada link por oferta passa a buscar **o nome da carta no catálogo da loja**, não um SKU/impressão individual. Seguimos a taxonomia `?view=ecom/itens&page=1&id=<ID>&busca=<carta>&txt_estoque=1...` fornecida no exemplo da Taberna Geek.

O módulo `../packages/mtg-report-kit/store-links.js` codifica o nome e usa os IDs de loja conhecidos. A Taberna usa o domínio `www.tabernageek.com.br` informado pelo usuário. Vila Geek, Black Game House e Fênix usam provisoriamente a rota do domínio `www.ligamagic.com.br` com o respectivo ID, pois os domínios customizados e o comportamento dessas buscas ainda não foram confirmados em navegação real. Magos recebe uma busca por loja somente se o CSV trouxer `loja_id` observado na captura; caso contrário permanece o link da consulta geral.

O campo anterior `link_oferta` é mantido como fallback (consulta geral) e a skill acrescenta `loja_id` aos novos CSVs. Os relatórios históricos continuam compatíveis.
