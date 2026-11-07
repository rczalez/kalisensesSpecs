# Phase Four — Fireflies-only idle ambience

Implemented and checked in the Lens Studio 5.23.2 laptop preview on November 6, 2026, using CLAD scripting/preview workflows and the Lens Studio MCP. SPECS hardware remains unvalidated.

## Final behavior

- Main-menu idle begins after approximately ten seconds without interaction. Keyboard press/release, entering hover on a menu control, pressing a control and menu actions restart the timer.
- Idle is visual only. The idle song, generated WAV/render metadata/generator/provenance file, extra audio component, music mute button and main-menu music shortcut were removed at the user's request. Existing kalimba note sounds, count-in clicks, tutorial narration and its controls remain.
- Idle now requests **2.25 fireflies per second**, 50% above the previous 1.5 rate. The ambient limit rises from 18 to **24**, within the existing overall 24-firefly limit.
- Lights fade in over 1.5 seconds, drift gently in world space, live for approximately ten seconds and fade over their final two seconds. The existing exclusions protect the kalimba, labels, visible note cues, active virtual pads and menu.
- Interaction stops new idle spawning immediately. Existing lights finish their lifetime naturally. No idle spawning in the tutorial, narration, Free Play, count-in, Follow Along playing/paused, input/placement/selection views or results. Pauses between notes never trigger ambience.
- Normal startup is saved with the opt-in test runner disabled.

## Checks

| Check | Result |
| --- | --- |
| TypeScript | Compiled successfully after music removal. |
| `kalisenses-idle-ambience` | Passed at **22:57:29.786**. Controlled-clock ten-second boundary, nine emissions in four seconds, inactivity reset and excluded-mode policy. Real idle entry and populated preview, cap 24, exactly 34 existing audio components (32 note voices, click, narration; no idle player), actual B/Space delivery, immediate spawn cancellation, Free Play note and Follow Along/tutorial exclusion. |
| Keyboard regression earlier in this phase | All 17 preview-delivered note keys passed at 22:33:33.648. The established mapping is unchanged by music removal. |
| Shared-input regression earlier in this phase | 34 simulated virtual/pinch notes, release guards and shared scoring passed at 22:36:28.582. Actual hand recognition is not validated. |
| Source/asset inspection | No idle song asset, music playback reference, music mute action or idle audio dependency remains. |

The earlier music-bearing prototype's audio/mute/loop checks do not describe the final implementation and are superseded by the visual-only test above. One earlier shared-input run was interrupted by a preview reset; a later ready-preview run passed. Generated Cache sources were not edited.

## Visual evidence

- [Fireflies-only main menu](phase-four-fireflies-only.png): the music mute control is gone; note labels and the menu remain clear.
- [Denser established ambience](phase-four-fireflies-dense.png): increased idle density around the protected playing and menu areas.

See [timestamped evidence](phase-four-checks.json).

## Device checks remaining

Check optical brightness and binocular exclusion margins over real tabletops, hand occlusion, tracking/repositioning and physical comfort. Profile sustained idle/play transitions, heat/power and the 24-light limit on SPECS. Preview checks do not establish hardware frame time or room-mesh occlusion.