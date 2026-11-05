# Kalisenses preview verification

Verified November 4, 2026 in Lens Studio 5.23.2.26081320, project `kalisenses.esproj`, target Spectacles, SPECS 27 Interactive Preview. MCP connected and the loaded project matched this workspace. LEAF package: 2.0.2.

## Changes completed

- Attached and wired the instrument, UIKit panel, main controller, and LeafIndex in the authored scene.
- Fixed mode changes stopping audio components that had no assigned track.
- Repaired the inspection helper's obsolete UIKit/InteractionKit imports in its unpacked Assets copy. Cache was not edited.
- Enlarged menu text, allocated explicit text rectangles, sized panels by view, and placed the panel at (0, -53, -78) cm with -47 degrees X rotation. Text depth testing remains enabled.
- L maps to B4, track B4.wav, spatial tine index 11 (zero-based), in both modes. The design brief now records the approved substitution.
- Added an opt-in LeafIndex previewScenario field so keyboard scenarios can run without the MCP runner blocking input injection. It is saved empty for normal startup.

## Actual LEAF results

| Scenario | Result | Scope |
| --- | --- | --- |
| kalisenses-b4-keyboard | PASSED | Preview-delivered L in Free Play and Follow Along; B4 pitch identity, active audio player, tine 11 green highlight; Follow Along result 100%, correct 1, incorrect 0, missed 0. |
| kalisenses-17-keyboard | PASSED | All 17 preview-delivered mappings, corresponding indices, active audio, and unchanged runtime camera position. |
| kalisenses-presentation | PASSED | 35 by 25 cm body, 17 labels, projected instrument corners, world stability when moving camera. |
| kalisenses-guidance | PASSED | Four count-in pulses, 40–80 BPM limits, 60 BPM performance, cue, tempo lock, Restart, Return to Menu. |
| kalisenses-scoring-logic | PASSED | Inclusive boundaries, nearest same-pitch overlap and tie break, repeated pitches, simultaneous clock, score rounding, known sequences for all songs. Logic only. |
| kalisenses-flows | PASSED | UI actions, replay/reset paths, all three song completions accelerated by moving target times, celebration and firefly cap. |
| kalisenses-menu-layout | PASSED | All five views have positive text rectangles, type sizes of at least 52, depth-tested text, and label centers inside the camera projection. |

The B4 and 17-key scenarios ran through LEAF's DefaultScenarioManager using the opt-in startup field. Musical input came through InjectPreviewGesture key events, rather than direct calls to the musical handler. The authoritative lens log reported PASSED. Other existing scenarios were also rerun serially through run_leaf_scenario after the menu changes.

Visual review: main menu, selection, Free Play, count-in/performance, and results were captured and checked. Headings, instructions, song names, tempo, results counts, and actions are visible; the instrument and L/B4 label remain visible beneath them.

## Save confirmation

Editor Project.save() succeeded. On-disk Scene.scene and kalisenses.esproj were written at 23:52:55 local editor time. Scene.scene contains the instrument/material references, controller component references, panel placement, and empty previewScenario. Lens Studio window title reads `kalisenses - Lens Studio v5.23.2.26081320` without an unsaved-change asterisk. Normal preview startup logs READY and registers seven scenarios without a Lens runtime error.

## Limits and remaining acceptance work

- **Logic proven** within the scope above. Sequential injected taps do not prove physical keyboard rollover, simultaneous held chords, long holds/auto-repeat, capitalization modifiers, or focus-loss behavior. Those portions of done criterion 1 remain manual acceptance work.
- The camera-position assertion checks the runtime camera; a full physical-keyboard navigation-shortcut check remains manual. The current seated Interactive Preview view was visually checked.
- Audio player activity and the correct audio asset were verified; perceived timbre, pitch by listening, and latency have not been measured.
- Three-song completion tests accelerate time. Full real-time playthroughs and a beginner listening/following check remain unperformed.
- No Specs hardware was available: physical anchoring, two-finger touch, reach, long-term comfort, and on-device latency remain **feel unproven**.
- Earlier B4 runs timed out because the blocking MCP scenario call serialized later input calls. Those failed attempts are not counted as passes. The final nonblocking LEAF run passed both modes.
- A recurring LeafPlugin editor warning about skipping its own state save appeared during resets; it did not prevent the final scene save or the passing scenarios.
