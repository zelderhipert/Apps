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

## URLs de estoque e carta individual

`store-links.js` disponibiliza:

- `MTGStoreLinks.build({store,card,storeId})` — busca a carta no site próprio da loja, com domínio e ID dos cinco vendedores confirmados; retorna `{url,label,hostVerified,storeId}` ou `null` se não corresponder ao cadastro.
- `MTGStoreLinks.cardPage(name)` — abre `https://www.ligamagic.com.br/?view=cards%2Fcard&card=...`, página de carta, não carrinho ou Compra por Lista.

Magos `621302` / `www.magosdacosta.com.br`; Taberna `41369` / `www.tabernageek.com.br`; Vila Geek `49834` / `www.vilageekgames.com.br`; Black Game House `611044` / `www.blackgamehouse.com.br`; Fênix `45754` / `www.fenixhousetcg.com.br`. Os domínios próprios foram informados pelo usuário. A loja exata é validada para não fabricar links para IDs divergentes.

As URLs são apenas buscas por nome, não itens de compra de impressão/condição específicas. O módulo não envia requisições, apenas gera links. Testes: `node --test test/store-links.test.cjs`.
