# SUPER MIKE-OH

A complete browser platform game inspired by the supplied Mike and Prince Xiaboo character brief. Green Paw Meadows continues through **The Cat Kingdom**, **The Dog Guard Territory**, **The Shadow Castle**, and **Level 5 — The Great Escape**, with five playable chapters and locally saved unlocks.

## Run locally

Requires Node.js 20 or newer. There are no npm dependencies to install.

```sh
npm run dev
```

Open http://localhost:3000. For production:

```sh
npm test
npm run build
npm run preview
```

## Publish on Vercel

1. Push this folder's contents to your GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. The included `vercel.json` configures the build. If prompted, use **Other** as the framework, **npm run build** as the build command, and **dist** as the output directory.
4. Deploy. No API keys, environment variables, database, or server functions are needed.

The game runs entirely in the browser. Progress is saved locally on the player's device, not in a cloud account. Google Fonts are optional; system fonts keep the app usable if they cannot load. Gameplay, audio, and the transparent character sprite atlas are bundled with the app; character art loads from your own deployment.

## Controls

| Action | Keyboard | Controller |
| --- | --- | --- |
| Move | A / D or left / right arrows | Stick / D-pad |
| Jump (hold for height) | Space, W, or up arrow | A |
| Sprint | Shift | B / right shoulder |
| Duck / enter marked pipe | S / down arrow | Down |
| Attack (all forms) | F / X | X |
| Pause / resume | Enter / Escape | Start |

Touch controls appear on touchscreen devices. Landscape play fills the screen with a handheld layout: **← / →** for movement, **A = Jump**, **hold B = Run**, and **C = Attack**. Each finger is tracked independently, so movement, running, jumping, and attacking can be combined. Releasing a button stops its input; focus loss, pause, orientation changes, death, and travel clear controls. **START** pauses/resumes and **SELECT** displays level information. Stand still on a marked pipe for 0.8 seconds to enter; keyboard Down/S and gamepad Down still work. There is no mobile Up or Down button. Approach the Level 3 dog house from the left and pause at its door to enter. Small phones in portrait use a separate controller area. Sound starts muted; enable it using the music button or Settings.

After deployment, open the Vercel HTTPS link on your phone; no installation is needed. The computer's `localhost:3000` link is for that computer only. Saves stay in each device's browser. Touch input has automated coverage, but real iPhone/Android device testing is still recommended before sharing widely.

## Included

- Detailed character sprites adapted from the supplied sheets: compact black-T-shirt Normal Mike, muscular black-tank-top Super Mike, and cream-white Prince Xiaboo with mismatched eyes, crown, red cape, and medallion. Six illustrated poses per character are used across gameplay, menus, and story scenes.
- Smooth acceleration, variable jump height, coyote time, jump buffering, sprinting, stomps, and power punches.
- A 19,800-unit meadow course (roughly 2–4 minutes on a clean run, longer while exploring), moving ledges, spikes, pits, a midpoint checkpoint, and a secret pipe cavern.
- Patrol, jumping, armored, pipe, fast, sleepy, and chonky cat enemies.
- M Capsules, coins, three royal paws, extra lives, temporary speed, invincibility, double coins, and jump boosts.
- Loading, main menu, chapter stories, instructions, settings, locked/unlocked/completed level selection, pause, game over, and completion screens with score and bonuses.
- A 25,200-unit Cat Kingdom course with brick and mystery blocks, platform-patrolling Fast Cats, two-hit Guard Cats, warning acorns, a midpoint checkpoint, and a golden underground bonus vault.
- The Super Cat Bell: 12 seconds of slightly faster movement, higher jumps, stronger attacks, and a golden glow, while preserving Normal/Super Mike.
- A 27,600-unit Dog Guard territory: six dog types, returning cats, moats, falling/suspended platforms, a jump-only watch tower, and a coin-filled secret dog house.
- Fire Mike from orange flame mystery blocks: C fires left/right, limited to one shot per 0.4 seconds and three active fireballs. Damage downgrades Fire → Super → Normal → life loss.
- Captain Barko: five health, charge/barrage/slam patterns, clear warnings and dizzy attack windows; harmless defeat opens the inner-castle gate.
- A 30,600-unit Shadow Castle with six new enemies, swinging chandeliers, collapsing floors, moving library shelves, wide clock gears, a royal map, secret archives, and two checkpoints.
- Thunder Mike: an 18-second form with a short electric burst, a 0.65-second cooldown, and optional bonus lift activation. Fire Mike remains available; either powered form downgrades to Super Mike on damage.
- Lord Whiskeron: seven health, a dialogue introduction, warned orb/summon/teleport/wave attacks, and a nonlethal escape sequence that sets up the next chapter.
- A 34,600-unit Great Escape: bright forest, river platforms, eleven train cars, mountain bridges, and an airship launch site. Nine new enemies, two bonus rooms, two checkpoints, and saved raccoon coin recovery.
- Dash Mike: 20 seconds of faster B running, a short full-speed C attack with recovery, weak-crate breaking, and wind effects on the original Mike sprite. Fire and Thunder remain available.
- Commander Howl: eight health, warned dash/wind/ball/aerial phases, a nonlethal defeat, and a final airship chase that reveals the Sky Kingdom.
- Device-local checkpoint, score, collection, settings, and completion persistence.
- Responsive layout, keyboard and touch input, standard Gamepad API support, fullscreen, and automatic pause on focus loss.

Each completed chapter unlocks the next. After Captain Barko is outwitted, Level 3 reveals a glimpse of Prince Xiaboo and unlocks **Level 4 — The Shadow Castle**. Mike enters through a hidden passage, discovers the Prince's location, and faces Lord Whiskeron. The almost-rescue unlocks **Level 5 — The Great Escape**. Mike chases the convoy across the forest, river, train and mountains, then discovers that the airship is heading for the **Sky Kingdom**. **Level 6 — Coming Soon** remains locked. Existing version-one saves still load, including previously completed chapters. Browser tabs cannot generally close themselves, so the web edition uses Main Menu instead of a desktop Quit action.

In the castle, attack the sparkling library shelf with C, then pause at its doorway to enter the Royal Archives. Thunder Mike powers the blue bonus-lift switch with C. A or C advances Whiskeron's introductory dialogue. The library and clock tower use the same five mobile gameplay buttons. See [Level 4 validation](docs/level4-validation.md) for mechanics and verification details. In the chase, use A to cross the river and train gaps, follow the lower car through the tunnel, and break the sparkling cargo crate with C before pausing at its doorway. Hold B to build Dash speed, then press C for a short dash attack. See [Level 5 validation](docs/level5-validation.md) for the new journey and its checks.

## Project map

- `src/engine.js`: physics, collisions, game rules, checkpoint/save data.
- `src/level.js`: preserved hand-authored meadow and cavern layout.
- `src/levels.js`, `src/level2.js`, `src/level3.js`, `src/level4.js`, `src/level5.js`: world registry and separate chapter/bonus-room configurations.
- `src/dogs.js`: Dog Guard behavior, telegraphed boss states, projectiles, and rolling barrels.
- `src/dog-art.js`: code-drawn cartoon dogs, territory scenery, Fire Mike accessories, and ending animation.
- `src/shadow.js`, `src/shadow-art.js`: castle enemies, mechanisms, Whiskeron encounter, Thunder effects, castle rendering, and cinematic scenes.
- `src/chase.js`, `src/chase-art.js`: escape encounters, saved loot, Commander Howl, five environments, and airship story scenes.
- `src/behaviors.js`: reusable ground movement, state timers, charge, projectile and boss phase components.
- `src/forms.js`: per-form attack definitions.
- `src/progress.js`: persistent unlock rules and legacy completion migration.
- `src/touch.js`: independent pointer input and cancellation.
- `src/art.js`: environment rendering and character scene placement.
- `src/characters.js`: sprite loading, frame coordinates, and pose animation.
- `assets/characters/mike-xiaboo-atlas.png`: bundled transparent character artwork.
- `docs/character-art.md`: reference mapping and image generation prompts.
- `src/opening.js`: enlarged original-image loading screen and asset-based progress.
- `assets/loading/`: unchanged copies of the supplied Mike and Prince Xiaboo posters, cropped only for display.
- `assets/fonts/super-mario-256/`: locally bundled Super Mario 256 by fsuarez913, a free fan-made recreation rather than Nintendo's original typeface; source attribution is included.
- `src/main.js`: menus, input, local saves, and main loop.
- `src/audio.js`: original Web Audio melodies and effects.
- `tests/game.test.mjs`: behavioral game mechanics tests.
- `scripts/`: dependency-free static server and production builder.

Character inspiration and game concept come from the supplied references. No reference photos are pasted into gameplay, and no existing franchise assets or music are used.

## Running and mobile fullscreen

Normal Mike and Super Mike now use articulated, alternating leg motion with planted feet, knee lift, and a small shoulder/body bounce. The cycle follows actual ground distance, speeds up with sprinting, and does not advance against walls or while a platform carries Mike. The original sprite atlas remains unchanged.

Use the in-game fullscreen button to enter fullscreen. Touch devices request landscape orientation after entering fullscreen, and release the lock on exit. Browsers without fullscreen support use a full-window view; portrait phones show a rotate prompt if automatic rotation is unavailable. The game pauses during display changes, so resume once the view is comfortable.
