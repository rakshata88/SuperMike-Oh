# Mobile gameplay polish

This is an update to the existing game. Level definitions, bosses, enemies, power-ups, form rules, save format, score, lives and progression remain in place. Mobile controls remain Left / Right / A Jump / B Run / C Attack; desktop bindings remain available.

## Changes

- A press arms one jump request. Holding A cannot replenish it. Release edges survive fast release-and-repress gestures between animation frames, and overlapping keyboard/touch/gamepad inputs share jump ownership.
- Jump buffering is 100ms; coyote time is 110ms. Landing consumes a valid buffered request once. Pause, death, travel and input cancellation clear pending requests.
- Foot collisions sweep across platform tops with a 0.05-world-unit numerical tolerance instead of treating overlaps up to 8 pixels deep as floor contact. Head and side collisions cannot ground Mike. Thin platforms cannot be skipped by a fast fall. Moving, gear and collapsing platforms carry their supported player consistently.
- Animation observes physics through idle/walk/run/jump/fall/land/attack/hurt/dead states. Its clock resets only when state changes. A 70ms landing pose gives way to movement; an intentional buffered jump can interrupt it immediately. Existing enemy stomps and damage recoil remain intentional bounces.
- Walk/run gait follows actual ground distance, with shorter walking strides, blended acceleration, forward lean, body bounce and articulated shoulder/elbow/hand motion opposite the legs. Original character artwork is reused; the atlas is unchanged.
- One coalesced viewport controller handles resize, orientation, VisualViewport resize/scroll, fullscreen callbacks, focus, visibility and pageshow. It updates shell dimensions, safe-area layout, canvas aspect and camera width together. Portrait touch devices display the rotate overlay and suspend simulation; landscape hides it automatically. Backgrounding still pauses for safety.
- Gameplay uses scoped `touch-action: none`, non-passive gesture fallbacks, selection/context-menu protection and independent pointer tracking. Menus retain ordinary button clicks and scrolling. The viewport meta keeps `width=device-width, initial-scale=1, viewport-fit=cover`; zoom prevention is scoped to gameplay rather than imposing a page-wide zoom limit.

## Automated verification

Run `npm test` and `npm run build`.

New coverage includes all forms landing while holding A and movement/run combinations, edge and center landings, platform sides/undersides, thin platforms, coyote timing, buffered taps, expired/cancelled requests, airborne double-jump rejection, continuous short/long pit trajectories, moving/gear/falling support, animation priorities and limb joints, rapid touches, pointer sliding, scoped gestures and viewport resize coalescing.

Viewport fixtures cover 375×667, 390×844, 393×852, 430×932 and 412×915 in both orientations, with and without VisualViewport, plus Safari-style toolbar size changes and return-from-background events. Existing chapter traversal tests now release A between separate jumps instead of requesting repeated jumps while holding A continuously.

## Visual and device verification

The local headless Chrome animation contact sheet was visually inspected for both original Mike forms at multiple walk/run phases. Chrome touch emulation passed six landscape layouts (667×375, 844×390, 852×393, 932×430, 915×412 and 844×320), a portrait round trip, fullscreen fallback entry/exit, proportional canvas sizing and rapid four-finger controller input. No page zoom, scroll, stuck controls or JavaScript exceptions occurred. The portrait opening overlay and landscape gameplay screenshots were inspected; this caught and corrected an inherited 680px opening-screen height limit. Browser QA artifacts are kept in the ignored `.qa/` directory.

Physical iPhone Safari, home-screen mode and Android hardware were not available in this environment. Automated geometry and Chrome touch emulation do not prove native Safari zoom suppression, notch insets, browser-toolbar timing, orientation-lock behavior or sustained device frame rate. Before release, check portrait → landscape → portrait → landscape, background/foreground, fullscreen entry/exit and rapid A/B/C with four fingers on those devices. Confirm that controls clear on interruption, sprites remain proportional and the home indicator/notch never covers controls. The existing project does not install an offline PWA; this update does not add one.

Implementation references: [VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport), [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action), [screen orientation](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Managing_screen_orientation).
