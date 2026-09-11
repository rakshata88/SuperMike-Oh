# Level 3 — The Dog Guard Territory

Extends the existing `createWorld` registry, collision system, player forms, local save data, and chapter transitions. Level 1 and Level 2 maps and character artwork are preserved. No new dependencies.

## Content and tuning

- 27,600-unit route, 13,700-unit checkpoint, 110–155-unit moats, wide moving and suspended ledges, and falling platforms with a 0.85-second warning and automatic reset.
- Jump-only tower with 45–110-unit rises. Normal Mike can climb without Run. No mobile Up/Down buttons; earlier secret pipes retain their existing stationary entry and keyboard/controller Down compatibility.
- Patrol Pups walk at 78 units/second versus soldiers at 55. Chargers warn for 0.8 seconds, commit to a direction for 1.05 seconds, and rest for 1.7 seconds. Sleepy Dogs react to nearby running, attacks, or hard landings; walking alone does not wake them.
- Bouncer Dogs repeat a fixed hop/rest cycle. Shield Dogs block frontal melee and fireballs, allowing rear hits and stomps. Tennis guards warn for 0.7 seconds and throw at 170 units/second, with a 2.3-second rest.
- Fire Mike uses the existing Super Mike artwork with an orange scarf and flame badge. C fires in the facing direction, with a 0.4-second cooldown and at most three active shots. Projectiles expire at obstacles, enemies, or limited range. Damage goes Fire → Super → Normal → life lost. Checkpoint recovery retains the established Normal Mike reset.
- Fixed barrel chutes warn for 1.2 seconds. Barrels roll down the drawn ramps, then along the ground; stronger attacks and fireballs can break them.
- Secret dog house: enter from the left or reveal the nearby hidden block, then pause at the door. Bonus coins, extra life, Fire Mike, hidden M Capsule block, a royal paw, and sleeping dogs. Exit uses the same pause-at-door interaction.
- Captain Barko has five health and a fixed charge → tennis barrage → jump slam cycle. Each move has a 1.1-second warning; dizzy windows last 2.7 seconds and successful hits grant one second of invulnerability. Charge direction locks when warned. Defeat opens the arena gate, clears hostile projectiles, saves the result, and leaves Barko harmlessly dizzy with his helmet spinning.
- A ten-second ending shows Mike approaching the inner castle, Prince Xiaboo in a tower window, closing gates, and an unnamed shadow. The completion screen leaves Level 4 locked as Coming Soon.

## Verification

- `npm.cmd test`: all 85 tests pass, including existing chapter, character, touch, fullscreen, and save regressions.
- New coverage includes fire-block pickup, damage stages, projectile lifetime and collision, shield direction, predictable dog behavior, barrel timing, secret entry/exit, checkpoint persistence, tower jumps using the real physics, boss phases and hit gating, saved boss defeat, and desktop/mobile canvas rendering.
- Web-entry tests cover Level 2 completion → Level 3 intro → play, level selection, saved unlocks, Level 3 completion → Level 4 Coming Soon, and input resets.
- `npm.cmd run build`: dependency-free production output generated successfully in `dist/`.
- Headless Chrome screenshots inspected for patrols, shields, the watch tower, secret room, boss arena, and final castle scene. Local screenshot fixtures are ignored under `.qa/`.
- Physical iPhone/Android touch play has not been performed. Automated multitouch and jump simulations do not replace device playtesting.
