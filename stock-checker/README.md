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
