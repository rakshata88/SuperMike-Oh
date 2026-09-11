# Level 4 — The Shadow Castle

The fourth chapter extends the existing world registry, physics/collisions, player forms, local saves, and UI. Levels 1–3 retain their map files, artwork, and controls. The Level 3 ending now unlocks the castle. No new dependencies or remote assets.

## Implemented content

- A 30,600-unit castle with bright windows, banners, stone corridors, drawbridge-style cracked floors, chandeliers, a library, wall pipes, treasure rooms, and a clock tower.
- Six new enemies: Shadow Bat, Knight Cat, Royal Guard Dog, Clockwork Mouse, Ghost Cat, and Cannon Pup. Selected original Cat Soldiers and Patrol Pups return in spaced encounters.
- Library shelves move as solid platforms/walls. Attack the suspicious shelf or reveal its hidden block to open the archives. Stationary doorway entry uses the existing travel system; the wall pipe near the royal tunnels provides another optional entrance.
- Royal maps reveal that Prince Xiaboo is in the highest tower. The archives contain more than 40 coins, a life, Fire Mike, a hidden Thunder block, a royal paw, an archive seal worth 2,000 points, and a harmless sleeping Ghost Cat. Discovery and collectibles survive reloads.
- Two checkpoints at 14,500 and 27,800 units. The latter displays **FINAL CHECKPOINT!**. Recovery keeps score, coins, collections, and progress and restores Normal Mike, consistent with the existing checkpoint rule.
- Wide gear decks orbit slowly through small 16–18-unit circles. Normal Mike can climb using horizontal movement and Jump, without ladders, Up/Down, or mandatory Run. The Thunder lift is an optional bonus path.
- Thunder Mike lasts 18 seconds, preserving Mike’s black-sando sprite with a scarf, glow, and electric effects. C emits a 112-unit burst, active for 0.2 seconds with a 0.65-second cooldown. Multiple nearby enemies can be struck once per burst. Expiry restores the previous Fire form or Super Mike; damage removes Thunder and returns to Super Mike. Blue mechanisms power a bonus lift for nine seconds.

## Whiskeron encounter and story

- Prince Xiaboo is visible behind a magical barrier. Four introductory lines run with combat frozen; A or C advances the dialogue. Pause/focus-loss behavior continues to use the existing game mode.
- Seven health, with separate orb, bat summon, teleport, and ground-wave phases. Telegraphs last roughly a second. Vulnerability lasts 2.9–3 seconds, with one second of invulnerability after each successful hit. C, fireballs, electricity, and appropriate stomps can damage him.
- Summons are capped at three living bats. Teleport destinations are chosen away from Mike; if Mike enters the marked destination, it is relocated and telegraphed again. At three health or lower, speeds rise by 15% and the pattern omits further summons.
- Defeat is nonlethal: the staff fades, the barrier disappears, and Mike approaches Xiaboo. A hidden lift carries the Prince upward, Whiskeron escapes, and Mike retreats as the room shakes. Both characters appear in the escape transport; the Prince no longer remains duplicated on the tower lift.
- The 14-second escape scene precedes completion. A save made after defeating Whiskeron replays this escape instead of requiring another boss fight. Completion awards the bonus once and shows **LEVEL 5 — COMING SOON**.

## Validation

- `npm.cmd test`: 105 passing tests. The 20 new tests cover forms, damage, multi-target range/cooldown, mechanisms, enemy behavior, projectiles, archives, two checkpoints, gear support, real-physics ascent, dialogue, boss phases, summon caps, teleport safety, escape saves, and rendering at desktop/phone dimensions.
- Existing progression runtime coverage now includes Level 3 → Level 4, Continue/retry in Level 4, completion persistence, and the locked Level 5 card.
- Headless Chrome screenshots inspected for the castle halls, library, archives, clock tower, boss/barrier, and escape sequence. Fixtures and images remain local under ignored `.qa/`.
- Production output is generated with `npm.cmd run build` into `dist/`.
- Mobile gameplay buttons remain exactly Left, Right, A/Jump, B/Run, and C/Attack. Multitouch regressions pass. Physical iPhone/Android playtesting has not been performed.

## Files

- `src/level4.js`: chapter and archive layouts.
- `src/shadow.js`: castle enemy states, mechanisms, boss combat, and cinematic timing.
- `src/shadow-art.js`: castle environments, enemies, Thunder effects, and story rendering.
- Existing registry, forms, engine, renderer, audio, and menu modules: narrow integration hooks shared by the chapter.
