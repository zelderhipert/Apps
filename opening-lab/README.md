# Opening Lab v0.3

Simulador de mãos iniciais de Magic: The Gathering Commander, executado diretamente no navegador, sem backend.

## Acessar

Com GitHub Pages ativo para a raiz do repositório:
https://zelderhipert.github.io/Apps/opening-lab/

Também é possível abrir o arquivo index.html localmente.

## Recursos

- Importação de decklist em texto no formato Archidekt;
- 100 a 200.000 simulações Monte Carlo;
- Critérios personalizáveis por terrenos e categorias;
- Filtros opcionais de valor de mana, com custos informados manualmente;
- Simulação de uma tentativa de mulligan gratuito;
- Exportação CSV com resultados e motivos de rejeição.

## Limitações

- Exportações simples do Archidekt não trazem valor de mana de cada carta, portanto filtros por MV exigem dados adicionais.
- Ainda não simula a progressão dos turnos, pagamentos de mana colorida nem interações reais de cartas.
- Dados do deck são processados localmente pelo navegador. Não há backend nem sincronização entre computadores.
- A versão atual não persiste configurações automaticamente entre sessões.

## Atualização

Substitua este index.html pela próxima versão. A página principal do repositório serve como catálogo de aplicativos.