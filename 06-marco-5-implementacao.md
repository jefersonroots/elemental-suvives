# 06 - Marco 5: Implementacao

Este documento registra o inicio do Marco 5, focado em transformar o prototipo com progressao
inicial em uma run com mais conteudo, tensao e variedade.

## Entregue nesta primeira etapa

- Inimigos tier 2 e tier 3 adicionados ao modelo de inimigo.
- Cada tier tem HP, velocidade, raio, dano de contato e XP proprio.
- Spawn agora mistura tiers conforme o tempo de run avanca.
- Um chefe placeholder inicial aparece por tempo.
- O chefe usa stats, raio, XP e silhueta proprios.
- Morte de inimigos agora dropa gema com XP baseado no tier.
- Habilidades de aura/zona tambem respeitam XP por tier ao matar inimigos.
- HUD passa a indicar Marco 5.
- Assets do AIxiliar comecaram a ser reutilizados no projeto: inimigos usam sprites reais por
  elemento/tier e cartas de upgrade usam icones de poderes copiados para `public/powers`.
- Assets de poderes tambem entraram no gameplay: o projetil usa `egg_pixel`, a aura usa a
  caveira como icone orbital e o pulso de zona usa a animacao de odor/cocozinho.

## Reutilizacao de assets do AIxiliar

Os assets do projeto `AIxiliar` nao devem ser carregados diretamente pelo navegador a partir de
`C:\Users\jefee\Desktop\PROJETOS\AIxiliar\art`. Para o jogo, eles devem ser copiados para
`public/` ou empacotados em atlas dentro deste projeto.

Primeira leva copiada:

- `egg` de fogo/planta -> `public/enemies/{elemento}/tier1/idle`
- `evolution_1` de fogo/planta -> `public/enemies/{elemento}/tier2/idle`
- `evolution_2` de fogo/planta -> `public/enemies/{elemento}/tier3/idle`
- injeção -> `public/powers/injecao`
- odor/cocozinho -> `public/powers/cocozinho`
- caveira -> `public/powers/caveira`
- ovo -> `public/powers/ovo`

Uso atual:

- tier 1 usa `egg`;
- tier 2 usa `evolution_1`;
- tier 3 usa `evolution_2`;
- boss placeholder reutiliza `evolution_2` em escala maior;
- cartas de upgrade usam icones de poder.
- projetil inicial usa `public/powers/ovo/egg_pixel.png`;
- aura usa `public/powers/caveira/caveira_doente.png` como icone orbital;
- zona usa `public/powers/cocozinho/odor_*.png` como animacao visual.

Proximo passo:

- substituir pickups por assets reais;
- depois empacotar tudo em atlas para reduzir muitas requisicoes de PNG soltos.

## Tiers atuais

### Tier 1

Funcao: inimigo basico de pressao constante.

- HP baixo.
- Velocidade media.
- XP: 1.
- Entra desde o inicio da run.

### Tier 2

Funcao: inimigo mais resistente.

- HP medio.
- Velocidade menor.
- XP: 2.
- Comeca a aparecer depois dos primeiros segundos de run.

### Tier 3

Funcao: inimigo mais perigoso e rapido.

- HP maior.
- Velocidade maior.
- Dano de contato maior.
- XP: 3.
- Entra quando a run ja tem upgrades suficientes para responder.

### Boss placeholder

Funcao: primeiro pico de tensao.

- HP alto.
- Movimento de perseguicao simples por enquanto.
- Raio grande.
- XP alto.
- Visual placeholder maior.

Ainda falta dar comportamento proprio ao chefe, como invocacao, zona perigosa, troca de elemento
ou ataque ritmado.

## Arquivos alterados

- `src/game/entities/enemy.ts`
- `src/content/waves.ts`
- `src/game/systems/spawn-director.ts`
- `src/game/systems/enemies.ts`
- `src/game/systems/collision.ts`
- `src/game/systems/abilities.ts`
- `src/main.ts`
- `docs/04-roadmap.md`

## Proximas tarefas do Marco 5

- Refinar comportamento proprio do chefe.
- Criar pickups extras: cura, ima, bomba e ouro.
- Melhorar HUD final com HP, timer, kills e slots de armas.
- Adicionar som inicial.
- Fazer playtest real de 1 a 3 minutos.
- Rebalancear HP, spawn, XP e dano depois do playtest.

## Criterio para considerar Marco 5 completo

O Marco 5 so deve ser considerado completo quando uma run curta tiver:

- variedade clara de inimigos;
- pico memoravel de chefe;
- recompensa ou respiro apos o pico;
- pickups uteis;
- HUD suficiente para jogar sem painel de debug;
- primeiro playtest documentado.
