# mtg-report-kit

Biblioteca local, sem dependências ou servidores, consumível diretamente no navegador em outras aplicações do MTGverse.

`report-kit.js` disponibiliza `window.MTGReportKit` (e `module.exports` no Node): `parseCSV`, `numberBR`, `formatMoney`, `formatPct`, `escapeHTML`, `norm`, `uniqueBy`, `readFiles`, `safeURL`.

O kit **não contém dados pessoais nem lógica da LigaMagic**. Cada app implementa seu adaptador para os esquemas de sua skill. Stock Checker é o primeiro consumidor.

Dados locais: `~/MTGverse/outputs/<nome-da-skill>/latest`. Apps pedem permissão via seletor de arquivos/pasta no navegador; não há acesso silencioso ao disco.

Teste: `node --test test/report-kit.test.cjs`.

## Imagens de cartas (Scryfall)

Importe `scryfall-images.js` após `report-kit.js` e utilize `window.MTGCardImages.createResolver()`. O método `resolve({name, set, collector})` retorna um objeto contendo `kind` (`exact`, `edition`, `illustrative`), `faces`, `image`, `artist`, `page` e dados da impressão, ou `null` se não houver imagem.

Não afirme impressão exata apenas com o código de edição: diferentes números de colecionador e variantes de arte podem compartilhar o set. O módulo traduz certas siglas antigas da LigaMagic para códigos Scryfall (por exemplo `MI` → `MRD`). Os demais códigos são enviados sem alteração; se não corresponderem, a visualização recua para uma imagem ilustrativa.

O cache guarda **apenas URLs públicas e dados de impressão** no navegador, sem preços, decks ou estoque. Os requests são espaçados (~1,7 por segundo por aba, respeitando limitações do provedor) e disparados apenas para imagens visíveis. `stock-checker/art-ui.js` demonstra integração visual desacoplada e modal de cartas com duas faces.

Teste automatizado: `node --test test/scryfall-images.test.cjs`.

## URLs de estoque por loja

`store-links.js` expõe `window.MTGStoreLinks.build({store,card,storeId})`, que devolve `{url,label,hostVerified,storeId}` ou `null` quando não há ID confiável. A função não usa rede e constrói links para buscas nominais de uma carta no e-commerce baseado na LigaMagic. Os IDs das quatro lojas conhecidas são checados antes de montar URLs; `URLSearchParams` cuida da codificação.

Somente o domínio próprio da Taberna está confirmado pelo usuário. Para as outras lojas, a rota no domínio LigaMagic é provisória e requer teste. Não afirmar que uma busca identifica a impressão/versão específica de uma oferta.


## Domínios confirmados de lojas e carta individual na LigaMagic

A versão atual de `store-links.js` usa os cinco domínios próprios fornecidos pelo usuário, com seus IDs da Compra por Lista. A função `cardPage("Culling the Weak")` produz `https://www.ligamagic.com.br/?view=cards%2Fcard&card=Culling+the+Weak`, uma página nominal de carta (não a Compra por Lista). O navegador monta links sem consultar API nem alterar carrinho. A rota da loja é busca por nome, não garante edição ou conservação específicas.
