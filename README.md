# SUPER MIKE-OH

A complete browser platform game inspired by the supplied Mike and Prince Xiaboo character brief. The original **Green Paw Meadows** chapter now continues into **Level 2 — The Cat Kingdom**, with a longer route, a bonus vault, a castle-gate ending, and locally saved level unlocks.

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

Touch controls appear on touchscreen devices. Landscape play fills the screen with a handheld layout: **← / →** for movement, **A = Jump**, **hold B = Run**, and **C = Attack**. **↓ = Enter secret pipe / duck**, positioned above Left/Right with its own separate touch area. Each finger is tracked independently, so movement, running, jumping, and attacking can be combined. Releasing a button stops its input; focus loss, pause, orientation changes, death, and travel clear controls. **START** pauses/resumes and **SELECT** displays level information. Press ↓ while standing on a marked pipe to enter immediately, or stand still for 0.8 seconds; keyboard Down/S and gamepad Down still work. Small phones in portrait use a separate controller area. Sound starts muted; enable it using the music button or Settings.

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
- Device-local checkpoint, score, collection, settings, and completion persistence.
- Responsive layout, keyboard and touch input, standard Gamepad API support, fullscreen, and automatic pause on focus loss.

Completing Level 1 unlocks Level 2 and starts its story. Level 2 ends with Prince Xiaboo heard inside the castle and **TO BE CONTINUED...**; Level 3 is Coming Soon. Existing version-one saves still load and previous completions unlock Level 2. Browser tabs cannot generally close themselves, so the web edition uses Main Menu instead of a desktop Quit action.

## Project map

- `src/engine.js`: physics, collisions, game rules, checkpoint/save data.
- `src/level.js`: preserved hand-authored meadow and cavern layout.
- `src/levels.js`, `src/level2.js`: world registry and separate Cat Kingdom/bonus vault configuration.
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
