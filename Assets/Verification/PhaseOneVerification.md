# Phase One verification — November 5, 2026

The laptop prototype has the spatial layout, visual refinement and three input options implemented. Core preview checks pass. Real surface sensing, hand tracking, reach and see-through display readability still require Specs hardware. No user permission or manual intervention was needed to complete the laptop work.

## Design and interaction

The instrument and compact rear control dock share a world anchor. The laptop has a virtual tabletop and a fixed downward camera; mapped note keys no longer navigate the preview camera. This camera override and virtual table are editor-only. The playing area and all seventeen key/note labels remain visible across the menus. Front note pads appear only for Virtual Keyboard.

Outfit provides geometric sans-serif text with medium/bold weights, bright neutral lettering and dark outlines. The requested orange/brown palette is centralized in KalisensesTheme. Supporting backplates use a 0.96 opacity setting. Live stereo preview still makes dark surfaces appear transparent: opacity does not establish sufficient contrast on an additive display. Bright text and outlines help in this preview, but busy/bright surroundings require device assessment and possible further contrast adjustment.

| Input | Target, activation and release |
| --- | --- |
| Physical Keyboard (default) | Existing seventeen mapped keys; one note on key-down, rearmed on release. |
| Virtual Keyboard | Seventeen labeled pads in front of the instrument; index-finger poke on device, mouse-compatible interaction in editor. Touch/trigger start plays once; release rearms. |
| Pinch Gesture | Aim the SIK hand ray at a tine; secondary amber hover identifies the target. Pinch start plays that note, with the existing green played highlight and fireflies. Unpinch before playing again. Moving across tines or changing views while held cannot create another note. |

All three methods use the same note-playing path for audio, highlights, fireflies and scoring. Songs, key mapping, generated audio, scoring rules and firefly lifetime/count behavior are preserved. Fireflies stay around the instrument edges; the preview and flow checks found no label obstruction.

On Specs, placement uses WorldQueryModule with filtered surface hits. It requires three stable center hits, an almost horizontal surface, a 40–110 cm eye distance, and a 20–85 cm drop below the eyes. Four additional footprint samples check the rear dock and front pads. Explicit confirmation expires after eight seconds, then the shared root stays world-anchored. These samples do not establish semantic table identity or guarantee obstacle-free space. This device-only branch has not been exercised on Specs.

## Checks and results

Environment: Lens Studio 5.23.2.26081320, SPECS 27 preview, Interactive Sunlit Room.

| LEAF scenario | Result and scope |
| --- | --- |
| kalisenses-17-keyboard | PASS: all seventeen preview-injected keys, correct note/index, audio state and stable camera. |
| kalisenses-physical-hold | PASS: repeated down/900 ms hold plays once; release/repress and overlapping L/M work. |
| kalisenses-b4-keyboard | PASS: actual injected L in Free Play and Follow Along; audio/green tine 11; fixture scores 100%. |
| kalisenses-menu-layout | PASS: seven UI views and all seventeen pad bounds; positive text rectangles and projected label placement. |
| kalisenses-input-methods | PASS: menu selection; 34 SIK note events across virtual/pinch; hover/exit feedback, held/cross-note/view-change guards, shared scoring and inactive-source rejection. Uses DefaultLeafInteractor, not tracked hands. |
| kalisenses-guidance | PASS: practice cues and guidance. |
| kalisenses-flows | PASS: navigation, replay/reset, accelerated completion of all three songs and firefly cap. |
| kalisenses-scoring-logic | PASS: timing boundaries, nearest/tie, repeated notes, rounding and all song sequences. |
| kalisenses-placement | PASS: editor placement UI, pure suitability checks, shared anchor and world stability. No real depth validation. |
| kalisenses-presentation | PASS: instrument projection/readable label sizing/clear dock. Later release-only and pad-spacing changes were covered by input/layout checks. |
| kalisenses-reach | INCONCLUSIVE: strict IK front-pad attempt did not complete within the 90-second observation window; reset afterward. No diagnostic fallback pass accepted. |

Ten passes; one inconclusive optional reach check. The blocking LEAF MCP run call did not deliver reliably in this session, so the same registered LEAF scenarios ran through the opt-in preview startup runner and their completion was monitored in logs. Keyboard tests used the supported preview gesture injector. These results do not prove real hand targeting or physical keyboard rollover.

Final forced TypeScript compilation succeeded. Final clean startup registered eleven scenarios and printed READY, with no Lens runtime or rendering errors. LeafIndex.previewScenario is saved empty, so normal startup does not run tests. Physical Keyboard is the default again. The editor save succeeded.

AiPreviewAgent runtime queries, screenshot capture and native Pinch menu actions respond successfully. A held B4 virtual-pad activation logged one note before release. See [the recovery report](AiPreviewAgentRecovery.md) and [helper compatibility notes](../AiPreviewAgentInteract.lspkg/LOCAL_COMPATIBILITY.md).

## Evidence

Live, unedited MCP screenshots:

- [Main menu and instrument](phase-one-main.png)
- [Input Method options](phase-one-input.png)
- [Virtual note pads](phase-one-virtual.png)
- [Note activation feedback](phase-one-note-feedback.png)
- [Pinch instructions](phase-one-pinch-settings.png)
- [Song selection](phase-one-songs.png)
- [Follow Along count-in](phase-one-follow.png)
- [Placement explanation](phase-one-placement.png)
- [Results layout](phase-one-results.png) — this capture followed unattended song completion; its 0% score is expected.

Selected log excerpts:

```text
15:03:19.297 PASSED: kalisenses-17-keyboard
15:11:01.695 PASSED: kalisenses-physical-hold
15:11:58.748 RESULTS {"percent":100,"correct":1,"incorrect":0,"missed":0}
15:18:44.375 PASS all seven UI views and 17 note-pad bounds
15:19:31.157 PASS input menu, 34 SIK note events, hold/cross/release guards, shared scoring and inactive-source guard
15:22:03.224 PASS preview placement UI, surface-policy guards, shared anchor and world stability; real depth/patch detection UNTESTED
15:25:35.066 KEY L -> B4 tine=11 mode=free
15:34:06.820 LeafPlugin: Skipping plugin state save: instance was destroyed before its state finished loading.
15:34:09.200 READY 17 keys, L=B4, two modes, 32 voices
```

The state-save warning is an editor plugin warning observed during reset; it did not prevent scenario registration, gameplay or agent responses. Its underlying cause has not been independently diagnosed.

[Structured evidence](phase-one-checks.json) retains timestamped final-run logs. Source log: `C:/Users/rg-za/AppData/Local/Snap/Lens Studio/logs/LensStudioLog-2026-11-05-10-19-39-538-7b861.txt`.

To reproduce, use the LEAF panel or set the LeafIndex previewScenario input to a registered ID, reset and press unmapped Q when waitForDriver is enabled. Keyboard scenarios print driver prompts and require the corresponding injected keys. Clear previewScenario afterward. The reach scenario deliberately fails fast on diagnostic failures and is not part of the passed acceptance set.

## Actions requiring hardware or a person

1. Open on Specs, grant any surface/hand permissions requested by the device, and test Find Surface/Confirm Placement on tables of different heights, edges and clutter. Check sensing failure messages, footprint rejection, anchor drift and repositioning.
2. Test index-finger pad poke and ray-targeted pinch on all notes with both hands, including held motion between notes, release away from targets and tracking loss. Assess reach and sustained posture; the IK attempt did not validate comfort.
3. Assess text, backing opacity, outlines, cues and fireflies in bright and busy real environments. Increase backing/outline treatment or adjust placement if needed; laptop captures cannot establish additive-display contrast.
4. Perform real-time playthroughs of all songs and listen for pitch/timbre, latency and overlapping voices. Accelerated flow checks and audio playback state do not measure listening quality.
5. On a physical laptop keyboard, check focus loss, modifiers and hardware rollover. Injected overlapping keys only validate the software event path.

These are the remaining validation tasks. No Specs hardware was available during this pass, so no hardware success is claimed.
