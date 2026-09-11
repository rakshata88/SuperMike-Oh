# Level 5 — The Great Escape

The chase extends the existing game with a fifth playable chapter. Level 4 completion unlocks it automatically; Level 6 is a disabled Coming Soon card for The Sky Kingdom. The original four map modules, character atlas, five mobile buttons, touch handler, and save key are preserved.

## Journey and controls

The 34,600-unit route connects Forest Escape, River Crossing, Moving Train, Mountain Route, and Airship Launch Platform. All mandatory traversal uses Left/Right and A/Jump; B/Run and C/Attack remain the other gameplay controls. Boats and logs carry Mike using the existing moving-platform collision system. Deep water and train falls use normal life loss and checkpoint recovery. Checkpoints are at 10,600 and 28,100.

The train uses eleven solid roofs, gaps, cargo, decorative ladders, background parallax, passing trees, wind streaks, animated wheels, smoke, and a faster original melody. Player gravity, jump height, and base movement are shared with earlier chapters. The low tunnel has a lower car and two stepping platforms, with standing clearance for both Normal and Super Mike. A Thunder block was moved away from a car gap after traversal tests exposed an interrupted jump.

The Fox Treasure Den and Royal Cargo Car are separate bonus rooms with unique collectible IDs, coins, extra lives, powers, and special tokens. The den also has a royal paw and harmless sleeping Scout Fox. Break the sparkling cargo crate with C or Dash, then stand at the revealed doorway; green pipes use the existing 0.8-second stationary entry. Returning from cargo places Mike over the next solid train roof.

## Enemies and power

- Scout Fox: fast patrol, short retreat, visible turning warning, brief charge, then rest; can hop suitable nearby platforms.
- Boomerang Monkey: elevated, warned throw; fixed horizontal outgoing/return path, no homing.
- Rolling Hedgehog: warned curl and bounded roll; plain punches/stomps are blocked while rolling, special attacks work.
- Pirate Duck: floating-platform patrol, occasional hop, slow warned water balloons.
- Fish Jumper: repeatable vertical jump from water without chasing Mike.
- Train Guard Dog: short warned charges; each guard may whistle once, spawning at most one backup away from Mike. Whistle use survives saves.
- Bandit Raccoon: steals up to three coins once, then flees. Defeat it within eight gameplay seconds to recover the dropped coins. The theft, remaining chase time, dropped bundle, and refund status persist; refunds do not re-award score or 100-coin extra lives.
- Mountain Goat Guard: warned horizontal charge, ledge stopping and a short knockback.
- Eagle Scout: three warned, slow pinecone drops, then departure.
- Familiar Cat Soldiers, Patrol Pups, and Shield Dogs return in spaced encounters.

Dash Mike lasts 20 gameplay seconds. B raises Super Mike's running speed by 32%, while ordinary walking, acceleration, and immediate touch release remain manageable. At full speed, C gives a short forward attack, an 0.18-second hit window and an 0.85-second cooldown. Dash breaks weak crates and small dog shields. Wind streaks and glowing shoes overlay the original black-sando sprite. Expiry restores the previous Fire form, paused Thunder duration, or Super form. Fire, Thunder, and Dash damage all downgrade Special → Super → Normal → life loss. Thunder can carry from Level 4 and expires normally in Level 5.

## Commander Howl and ending

Howl has eight health, an introduction, roughly one-second telegraphs, three-second attack windows, and one-second damage invulnerability. His phases run sequentially: air dash, non-damaging wind push, three bouncing balls, then a flying platform with two slow drops. At three health or lower, speed increases by 13% and the cycle uses dash, wind and balls. Defeat leaves him dizzy, with spinning goggles.

The river scene shows Xiaboo aboard the train; the train exit shows detached rear cars and Mike jumping toward the mountain. After Howl, Mike runs, jumps and briefly catches the airship. Whiskeron's magic releases his grip; he lands on the lower platform. Xiaboo drops the Sky Kingdom map. The clue is saved before the single completion award, followed by “THE CHASE GOES TO THE SKY!” and “LEVEL 6 — COMING SOON.” Saving after boss defeat resumes the ending instead of restarting combat.

## Validation

- 129 automated tests pass, including 24 new Level 5 tests and the full earlier-level, sprite, touch, fullscreen, gait and browser-entry regressions.
- Movement tests run actual game physics across every river gap, ordinary train gaps, the low tunnel in Normal/Super forms, and the launch tower. These use available controls, without crouching or mandatory special forms.
- Coverage includes all new enemy patterns, projectile bounds, Dash timing/damage/stopping, room entry/return, saved loot/whistles, checkpoints, boss phases, nonlethal defeat, ending recovery, and a single completion award.
- The web-entry regression follows Level 1 through Level 5, checks saved unlocks, Continue/retry, story transitions, completion cards, and interrupted multi-touch.
- Canvas checks cover all regions, rooms, enemy warnings, powers and scene stages at desktop, landscape-phone and portrait-phone dimensions. Local headless Chrome screenshots supplement these checks; artifacts live under ignored `.qa/`.
- Physical iPhone/Android playtesting has not been performed. Automated input and canvas coverage does not measure real-device comfort or performance.
- `npm.cmd run build` generates the complete static game in `dist/`; no dependencies or remote gameplay assets were added.

## Modules

`src/level5.js` owns the route and rooms. `src/behaviors.js` provides shared state, ground motion, charge, projectile, and boss phase helpers. `src/chase.js` owns encounter rules, saved chase state and scene timing; `src/chase-art.js` supplies the vector environments, enemies and overlays. The existing registry, forms, engine, projectile system, audio and menus have integration hooks. `upcomingLevel` in the registry describes Level 6 without making it playable.
