# SUPER MIKE-OH

A complete browser platform game inspired by the supplied Mike and Prince Xiaboo character brief. This first edition contains one long, authored chapter: **Green Paw Meadows**, a secret underground cavern, and a royal rescue ending.

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
| Super power punch | X | X |
| Pause | Escape | Start |

Touch controls appear automatically on touch devices. In portrait play, they sit in a separate area below the game; in landscape they sit at the lower corners. Tap **RUN** to toggle sprint, hold a direction with one thumb, and tap or hold **Jump** with the other. **X** punches in Super Mike form; **Down** enters marked pipes. Use the pause button to take a break. Landscape gives a wider view, and fullscreen is optional where the browser supports it. Sound starts muted; use the music button or Settings to enable the original synthesized soundtrack and effects.

After deployment, open the Vercel HTTPS link on your phone; no installation is needed. The computer's `localhost:3000` link is for that computer only. Saves stay in each device's browser. Touch input has automated coverage, but real iPhone/Android device testing is still recommended before sharing widely.

## Included

- Detailed character sprites adapted from the supplied sheets: compact black-T-shirt Normal Mike, muscular black-tank-top Super Mike, and cream-white Prince Xiaboo with mismatched eyes, crown, red cape, and medallion. Six illustrated poses per character are used across gameplay, menus, and story scenes.
- Smooth acceleration, variable jump height, coyote time, jump buffering, sprinting, stomps, and power punches.
- A 19,800-unit meadow course (roughly 2–4 minutes on a clean run, longer while exploring), moving ledges, spikes, pits, a midpoint checkpoint, and a secret pipe cavern.
- Patrol, jumping, armored, pipe, fast, sleepy, and chonky cat enemies.
- M Capsules, coins, three royal paws, extra lives, temporary speed, invincibility, double coins, and jump boosts.
- Loading, main menu, short story, instructions, settings, level select, pause, game over, and a completion screen with score and bonuses.
- Device-local checkpoint, score, collection, settings, and completion persistence.
- Responsive layout, keyboard and touch input, standard Gamepad API support, fullscreen, and automatic pause on focus loss.

This is the brief's first playable deliverable, with a self-contained rescue ending. Additional worlds, bosses, and cloud saves are not included. Browser tabs cannot generally close themselves, so the web edition uses Main Menu instead of a desktop Quit action.

## Project map

- `src/engine.js`: physics, collisions, game rules, checkpoint/save data.
- `src/level.js`: hand-authored meadow and cavern layout.
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
