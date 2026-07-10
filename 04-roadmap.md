# 04 — Roadmap

> Documento vivo. Checklist dos marcos de entrega — atualizar conforme avança (mesmo padrão
> do `docs/05-roadmap-mvp.md` do AIxi: marcar `[x]` ao concluir, anotar decisões relevantes).

## Filosofia

Cada marco entrega algo **executável e observável no navegador**, não uma camada isolada.
Render de alta densidade (atlas + pooling) entra desde o marco 2 — é o risco técnico nº1 do
projeto (ver `01-arquitetura-tecnica.md`) e não pode ser deixado pra depois.

Prioridade de produção: antes de prometer 10 minutos de run, fazer **1 minuto perfeito**.
Esse minuto precisa conter movimento, arma automática, inimigos, XP, level up e 3 upgrades
com impacto claro. Depois disso, expandir para 3 minutos com chefe; só então fechar a run
completa.

## Marco 1 — Scaffold

- [x] Repositório novo (`git init`), separado do AIxi.
- [x] `package.json` + Vite + TypeScript + PIXI.js v8.
- [x] Estrutura de pastas conforme `01-arquitetura-tecnica.md`.
- [x] "Hello PIXI": canvas rodando no navegador, 1 sprite estático com nearest-neighbor e
      escala inteira (2×/3×) — prova de que o pixel fica nítido.
- [x] `tools/pack-atlas.mjs` inicial (pode empacotar um placeholder).

## Marco 2 — Motor

- [x] Loop de timestep fixo + acumulador (`game/loop.ts`).
- [x] Object pooling genérico (`render/pool.ts`).
- [x] Grid espacial de colisão (`game/spatial-grid.ts`).
- [x] Câmera seguindo o herói (`game/systems/camera.ts`).
- [x] Herói controlável (WASD/setas), começando pelo sprite 3 / `evolution_3` de fogo.
- [x] 1 arma funcional usando placeholder do AIxiliar (ex.: biscoito ou copo) — sem inimigos
      ainda, só validar disparo/alcance.

## Marco 3 — Enxame

- [x] Diretor de spawn básico (`game/systems/spawn-director.ts` + `content/waves.ts`).
- [x] Inimigos tier 1 (`egg`) de fogo/planta reaproveitando sprites existentes.
- [x] Sorteio de elemento por spawn dentro do pool ativo (fogo/planta).
- [x] Colisão projétil×inimigo e herói×inimigo via grid espacial.
- [x] Separação simples inimigo×inimigo para evitar fileiras/sobreposição excessiva.
- [x] Morte de inimigo → drop de gema de XP.
- [x] Validar performance com dezenas/centenas de inimigos simultâneos (60fps é a barra).

## Marco 4 — Progressão de run

- [x] Barra de XP + level up.
- [x] Magnetismo básico de XP, com coleta prazerosa e legível.
- [x] Draft de upgrade (3 cartas, overlay HTML/CSS, pausa o loop).
- [x] Primeiras cartas focadas em mudanças visíveis: projétil extra, perfuração, cadência,
      aura e pulso de zona.
- [x] +2 habilidades placeholder, por enquanto geradas por código e depois substituíveis por
      assets de `C:\Users\jefee\Desktop\PROJETOS\AIxiliar\art` (ex.: seringa, ícone de morte,
      cocozinho), completando as 3 primeiras opções de build.
- [x] Type chart (`content/elements.ts`) aplicado no cálculo de dano.
- [x] Feedback de dano elemental: cor/ênfase para vantagem, desvantagem e neutro.
- [x] Tela inicial simples de seleção de herói (fogo/planta), mostrando vantagem/desvantagem
      elemental e estilo de combate.

## Marco 5 — Conteúdo completo do MVP

- [x] Inimigos tier 2 (`evolution_1`) e tier 3 (`evolution_2`) de fogo/planta.
- [ ] 1 chefe com comportamento próprio (perseguição, invocação, zona perigosa ou troca de elemento).
- [ ] Escala de dificuldade por tempo (taxa de spawn, mix de tiers, HP e pesos de elemento).
- [ ] Curva de tensão com pressão, respiro curto, chefe/pico e recompensa.
- [ ] Pickups extras (ouro, cura, ímã, bomba).
- [ ] HUD completo (HP, XP/nível, timer, kills, slots de arma equipada).
- [ ] Som (reaproveitar/adaptar o padrão sintetizado do `useSound` do AIxi ou equivalente web).
- [ ] **Primeiro playtest real** — recalibrar `03-conteudo-e-balanceamento.md` com o que for sentido.

## Marco 6 — Meta e fim de run

- [ ] Tela de fim de run (vitória por timer / derrota).
- [ ] `MetaStore` sobre `localStorage`.
- [ ] Ouro persistente entre runs.
- [ ] 2 melhorias permanentes compráveis.
- [ ] Deixar registrado no save o caminho para desbloqueio futuro do herói água, mas só ativar
      quando houver sprites próprios.

## Marco 7 — Pós-MVP (não iniciar antes do 6 estar jogável)

- [ ] Invólucro desktop (Electron ou Tauri — decidir aqui, não antes).
- [ ] Publicação no itch.io (reaproveitar o fluxo de `butler` já rodado no AIxi).
- [ ] Evolução de arma (nível-máx + passivo → forma evoluída).
- [ ] Melhorias permanentes como itens colecionáveis dropados por chefes, quando houver sprites
      suficientes para esses itens.
- [ ] Herói e inimigos de água, fechando o triângulo fogo > planta > água > fogo.
- [ ] Arquétipos dedicados de inimigo (voador, bruto, atirador) quando a arte não precisar mais
      reaproveitar `egg`/`evolution_1`/`evolution_2`.
- [ ] Biomas/mapas adicionais.
- [ ] Balanceamento fino contínuo.

## Definição de "pronto" do MVP (marcos 1–6)

Abrir o jogo no navegador → escolher herói fogo/planta → mover o herói → armas disparam
sozinhas usando placeholders visuais → inimigos `egg`/`evolution_1`/`evolution_2` de fogo e
planta escalam com o tempo → subir de nível abre o draft → vantagem de tipo muda o dano
visivelmente, mas sem decidir sozinha a run → chefe aparece → morrer ou zerar o timer encerra
a run e salva ouro → recarregar a página mantém as melhorias permanentes → **60fps sustentado
com centenas de entidades em tela**.

## Validações de gameplay

- [ ] **Teste de 1 minuto**: o micro-loop já diverte sem meta-progressão.
- [ ] **Teste de 3 minutos**: primeiro chefe cria pico memorável e recompensa clara.
- [ ] **Teste de leitura**: jogador entende quando está em vantagem/desvantagem elemental sem
      abrir menu.
- [ ] **Teste de draft**: pelo menos 2 das 3 cartas oferecidas parecem escolhas desejáveis.
- [ ] **Teste de recuperação**: cura, ímã ou bomba conseguem salvar uma situação ruim sem
      trivializar a run.
- [ ] **Teste de identidade dos heróis**: Fogo e Planta mudam a forma de jogar, não só o visual.

## Registro de decisões (preencher conforme o projeto avança)

- **Estrutura da run**: cogitamos a estrutura de fases/ondas do Archero (limpa leva → respiro
  → draft → próxima leva) como alternativa à corrida contínua do Vampire Survivors. Decisão:
  **manter a estrutura contínua** já documentada no GDD — sem pausas naturais entre levas,
  dificuldade sobe suave com o tempo.
- **Gatilho do draft de upgrade**: cogitamos trocar por contagem de mortes ou um híbrido
  (mortes OU XP, o que vier primeiro), inspirado no ritmo do Archero. Decisão: **manter XP
  coletado** como gatilho único (o que já estava no GDD/balanceamento) — nível por XP, draft
  a cada level up.
- **Plataforma**: confirmado que navegador é o alvo primário e permanente, não uma etapa
  intermediária rumo ao desktop (GDD atualizado com seção "Plataformas").
- **Uso de arte existente**: confirmado que o MVP reaproveita `evolution_3` como herói,
  `egg`/`evolution_1`/`evolution_2` como inimigos e itens do AIxiliar como habilidades
  placeholder. Arquétipos dedicados de inimigo ficam pós-MVP.
- **Vantagem elemental inicial**: enquanto só existem fogo e planta, usar bônus/penalidade
  moderados e compensar Planta por stats/arma inicial. Água fecha o triângulo depois.
- **Marco 2 / motor**: primeiro motor jogável implementado com herói de fogo placeholder,
  câmera seguindo o herói, arma automática disparando na direção do movimento, pool de
  projéteis e grid espacial inicial para indexação.
- **Marco 3 / enxame**: primeiro enxame jogável implementado com inimigos `egg` placeholder
  de fogo/planta, spawn em anel ao redor do herói, perseguição simples, colisão por grid
  espacial, contato herói-inimigo com empurrão, morte por projétil, kill counter e gemas de
  XP com magnetismo leve. Validação de performance ainda é inicial e deve ser sentida em
  playtest no navegador.
- **Separação de inimigos**: após playtest visual, adicionada separação inimigo×inimigo usando
  o grid espacial para evitar que todos formem uma única fila compacta atrás do herói.
- **Marco 4 / progressão de run**: adicionada seleção inicial Fogo/Planta, XP com barra e
  level up, draft de 3 cartas com pausa da run, upgrades de projétil extra/perfuração/cadência,
  aura e pulso de zona como habilidades placeholder geradas por código, e vantagem elemental
  aplicada ao dano.
- **Feedback opcional de dano**: adicionado botão "Mostrar dano no inimigo" no HUD para ligar
  e desligar números flutuantes de dano em inimigos, útil para depurar balanceamento sem poluir
  a tela o tempo todo.
- **Painel de valores**: adicionado painel de acompanhamento base → atual para HP, velocidade,
  dano/cadência/projéteis/perfuração e habilidades de aura/zona, facilitando verificar como
  os upgrades alteram os números durante a run.
