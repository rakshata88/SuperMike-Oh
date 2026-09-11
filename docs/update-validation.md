# Handheld controls and Cat Kingdom update

The existing game is extended in place. `src/level.js`, character rendering data, sprite atlas, loading screen, loading artwork, fonts, original tests, and original sound-effect definitions are preserved. The Level 1 ending now leads to the next chapter.

## Delivered

- Left/Right movement, Down for entering secret pipes or ducking, and three actions: A jumps, B runs while held, C attacks. Each pointer owns its own action; release, cancellation, leaving the button, focus loss, visibility changes, rotation, pause, travel, death, and game over clear the relevant inputs.
- Landscape handheld layout, separated 65–80 px targets, safe-area offsets, pressed feedback, optional short haptics, smaller START/SELECT controls. Portrait uses a separate controller area with targets no smaller than 55 px. Gameplay controls hide while pause dialogs are open; START remains available.
- Keyboard/gamepad support retained, with F for attack and Enter for pause/resume added. All input sources feed the existing engine.
- Cat Kingdom and underground bonus vault are defined separately from the original meadow/cavern. The 25,200-unit route adds bricks, mystery blocks, warning acorns, patrol soldiers, platform Fast Cats, Guard Cats, a midpoint checkpoint, and a castle-gate cinematic.
- Form-specific attacks and a 12-second Super Cat Bell. Existing Normal Mike and black-sando Super Mike artwork remain unchanged.
- Sequential progression, chapter selection and completion saved under the existing browser storage key. Previous completion saves unlock Level 2. Level 3 remains unavailable and labeled Coming Soon.

## Verification

`node --test tests/*.test.mjs`: **58 passing tests**. Coverage includes the 16 requested input combinations, independent release/cancellation and pressed visuals, immediate touch movement/sprint release, original Level 1 mechanics, power transformation/damage, Level 2 content and rewards, secret pipe entry/exit with the Down touch button in both chapters, independent Down release/cancellation/reset, automatic pipe entry without Down, checkpoint saves/respawn, bell expiration, guard combat, platform patrols, falling-obstacle warnings, end-to-end menu/story/progression transitions, same-chapter retry, and numerical canvas rendering checks at desktop, phone and tablet aspect ratios.

`node scripts/build.mjs`: production build succeeds.

The browser integration tests use a simulated DOM and canvas context. No connected browser was available in this session, so visual layout, real browser pointer capture, and physical iPhone/Android multi-touch have **not** been verified on a device. Follow-up device checks should include landscape/portrait rotation during held input, safe areas, all four simultaneous actions, pause/resume, and dragging each finger off a control.

## Running and fullscreen follow-up

Added a distance-driven leg rig for Normal/Super Mike using crops from the existing sprite atlas, plus mobile fullscreen/landscape requests, a full-window fallback, and a portrait rotate prompt. Focus and display transitions retain input resets. The character renderer now changes while the atlas, character identities, and loading assets remain intact.

Orientation locking follows the [W3C Screen Orientation specification](https://www.w3.org/TR/screen-orientation/): request fullscreen first, handle rejected/unsupported locks, and release the lock on exit. Automated checks cover planted-foot motion, speed and pause behavior, surface-relative travel, API ordering, unavailable/denied fullscreen or orientation, desktop behavior, and exit cleanup. Physical device visual testing remains outstanding.

Final follow-up verification: 69 tests pass and the production build succeeds. An offline eight-phase render of both forms was inspected to correct texture seams; live browser and physical-device checks remain outstanding.
