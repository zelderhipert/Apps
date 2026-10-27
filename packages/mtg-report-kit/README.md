# mtg-report-kit

Biblioteca local, sem dependências ou servidores, consumível diretamente no navegador em outras aplicações do MTGverse.

`report-kit.js` disponibiliza `window.MTGReportKit` (e `module.exports` no Node): `parseCSV`, `numberBR`, `formatMoney`, `formatPct`, `escapeHTML`, `norm`, `uniqueBy`, `readFiles`, `safeURL`.

O kit **não contém dados pessoais nem lógica da LigaMagic**. Cada app implementa seu adaptador para os esquemas de sua skill. Stock Checker é o primeiro consumidor.

Dados locais: `~/MTGverse/outputs/<nome-da-skill>/latest`. Apps pedem permissão via seletor de arquivos/pasta no navegador; não há acesso silencioso ao disco.

Teste: `node --test test/report-kit.test.cjs`.
