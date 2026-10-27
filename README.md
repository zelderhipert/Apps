# Apps

Coleção de aplicativos e utilitários pessoais.

## Aplicativos

- **[Opening Lab](./opening-lab/)** — simulador de mãos iniciais de Magic: The Gathering Commander, com critérios personalizados de keep, mulligan e estatísticas.

- **[Stock Checker](./stock-checker/)** — dashboard de preços, ofertas e pendências do MTGverse; lê arquivos locais (CSV e JSON) gerados pela skill.
- **[mtg-report-kit](./packages/mtg-report-kit/)** — utilitários de relatórios compartilhados entre apps, sem servidor nem dependências.

## Estrutura

```
Apps/
├── index.html            # página inicial da coleção
├── opening-lab/
│   ├── index.html        # simulador Monte Carlo
│   └── README.md
├── stock-checker/
│   ├── index.html        # dashboard local
│   ├── style.css
│   ├── app.js
│   └── README.md
└── packages/
    └── mtg-report-kit/
        ├── report-kit.js # parser, formatação e helpers reutilizáveis
        └── test/
```

Cada novo aplicativo pode ocupar uma pasta independente, como `nome-do-app/index.html`.

## GitHub Pages

Para publicar esta coleção na web, acesse **Settings → Pages** e escolha **Deploy from a branch**, branch `main`, pasta `/(root)`. A URL sugerida é `https://zelderhipert.github.io/Apps/`, com o simulador em `https://zelderhipert.github.io/Apps/opening-lab/`.

**Privacidade:** este repositório é público, mas não contém resultados de execução. Ao usar o Stock Checker, o navegador lê os CSVs/JSONs locais mediante seleção explícita; não há upload ou persistência. O site estático pode ser aberto localmente clonando o repositório inteiro. GitHub Pages é opcional e requer configuração separada.
