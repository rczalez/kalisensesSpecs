# Phase Three — Follow Along polish

Verified in Lens Studio 5.23.2 laptop preview on November 6, 2026. CLAD scripting, material, preview and LEAF workflows were used through the Lens Studio MCP. This is not a SPECS hardware validation.

## Implemented

- Up to four pooled 3D note orbs, each with a bright core and amber halo. They descend 14 cm to their corresponding tine, clear of its label. Two beats of lookahead is clamped to 2–3 seconds. All cues are children of the instrument, so placement, rotation and scale remain aligned.
- Position comes directly from the existing song target timestamps. Arrival at the scheduled instant is exact in the animation calculation; a 220 ms decaying tine pulse appears on the first available rendered frame at/after that instant. Early correct scoring does not remove an upcoming cue prematurely.
- Pause/Resume freezes cues and score time, rejects note input, and moves the schedule forward by the pause duration. Restart, song selection, menu exit and results clear old cues. Count-in still has four clicks.
- Correct/incorrect/missed responses use green/coral/lavender tines plus written feedback. Timing pulses briefly take precedence. The song-selection instruction reads “Play the tine when the glowing orb reaches it.”
- Green-gold fireflies drift in world space outside the playing area for ten seconds and fade smoothly over seconds 8–10. Their size was increased from 0.18 to 0.55 (about three times larger) following preview feedback. Maximum active count is 24; additional spawns are skipped while full. Existing fireflies stay in their surroundings when the kalimba moves.
- The existing 17-key physical mapping, audio assets, song data and inclusive ±400 ms scoring rules remain unchanged. B4 is still L: the earlier comma request remains unsupported in this project's keyboard API, as already documented in the design brief.

## Automated preview checks

| Check | Result | Evidence |
| --- | --- | --- |
| `kalisenses-follow-cues` | Passed, 18:15:34.641 | 85 exact arrivals: 17 tines × five tempos; early-hit cues; bounded orb count; moved/rotated/scaled alignment. Live count-in, matching/incorrect/missed notes at 40/50/60/70/80 BPM. Pause freeze and blocked note, resume schedule shift, restart, song change and menu cleanup. Real firefly cohort still present after 8.1 s, gone after 10.2 s; cap 24. |
| `kalisenses-scoring-logic` | Passed via LEAF MCP | Existing inclusive timing boundaries, nearest/tie selection, repeated/simultaneous pitches and all three song sequences. |
| `kalisenses-17-keyboard` | Passed, 18:16:39.742 | All 17 actual MCP-delivered preview key events; correct note/audio and stable preview camera. |
| `kalisenses-input-methods` | Passed, 18:17:11.724 | 34 simulated SIK virtual/pinch note events, held/cross/release prevention, shared scoring and inactive-source guard. This does not validate physical hand recognition. |
| `kalisenses-guidance` | Passed, 18:17:37.935 | Tempo bounds, four count-in pulses, note/key guidance and restart controls. |
| `kalisenses-menu-layout` | Passed after correction, 18:18:26.608 | Seven views and 17 virtual-pad bounds. First run failed because the added instruction used small note typography; it was enlarged to body text, split across two lines, and the panel raised to preserve clearance. |
| `kalisenses-follow-visual` | Passed, 18:19:50.742 | Real Silent Night performance, held capture views, successful note input and Pause/Resume controls. |
| `kalisenses-flows` | Passed, 18:20:43.726 | Accelerated completion/replay of all three songs, result actions and Free Play. Not full real-time song playthroughs. |

The live arrival observer saw the pulse 21.4 / 39.0 / 8.6 / 32.5 / 31.6 ms after the scheduled instant at 40 / 50 / 60 / 70 / 80 BPM respectively. This includes frame and test-observer delay; it is not a measurement of audio or optical latency. There is no frame-delta accumulation in the cue calculation.

TypeScript compiled successfully. Normal startup was saved with `previewScenario` empty and no Lens runtime errors. No generated Cache sources were edited. During setup, a VirtualScene edit using a script-class shorthand was rejected without changes; the confirmed ScriptComponent path succeeded. A transient compile-data warning during script import cleared on refresh. Screenshot imports also produced image-resize/compressor warnings; these were editor asset-processing messages, not Lens runtime exceptions.

See [timestamped evidence](phase-three-checks.json).

The complete `kalisenses-follow-cues` scenario passed again at **21:55:10.171** after the environmental firefly changes, including the ten-second lifetime/cap checks. The saved opt-in scenario was then cleared to restore normal startup. A separate editor message at 21:56:48 reported a SPECS connection failure requiring matching signed-in accounts; it does not change the laptop test result and no hardware validation is claimed.

## Visual review

- [Song selection and instruction](phase-three-select.png): body-size instruction, comfortable button spacing, panel clear of the kalimba.
- [Descending orbs](phase-three-descending.png) and [later frame](phase-three-descending-later.png): note progression, tine response and clear keyboard/note labels. The later image falls in a longer musical gap, so no approaching orb is in the bounded lookahead window.
- [Paused scene with fireflies](phase-three-paused.png): stationary cue positions, Resume control and small drifting lights around the instrument.
- [Larger fireflies](phase-three-fireflies-larger.png): the revised 0.55 size, confirmed in the runtime query. Note orbs remain larger overall with their amber halos; fireflies stay outside the playing area. Compilation succeeded and `kalisenses-follow-visual` passed again at 18:31:58.388 after this adjustment. The lifetime/cap tests above predate this size-only adjustment; those settings were unchanged.
- [Environmental distribution](phase-three-fireflies-environment.png) and [menu exclusion](phase-three-fireflies-menu-clear.png): fireflies now sample the visible surrounding space at varied depths, rather than two fixed side bands. Their positions remain world anchored. Separate projected keep-clear regions protect the instrument/labels, each visible note orb, active virtual pads and the active menu, with a margin. These regions update every frame; drifting lights are relocated or temporarily hidden if no clear position is found. This avoids blocking empty space with one oversized exclusion rectangle.

`kalisenses-firefly-space` passed at 18:42:27.981: visible fireflies stayed outside the protected regions across menu changes and translation/rotation/scale of the common anchor. The first draft of this test expected exactly 24 spawns and received 23; the assertion was corrected to the intended maximum of 24 because a spawn may safely be skipped if the bounded search finds no open position. Screen projection and both-eye comfort still need device testing. No physical environmental occlusion or room-mesh collision is claimed.
- [Resumed performance](phase-three-resumed.png): ongoing guidance after the shifted song schedule resumes.

The preview uses the existing bright sunlit room and translucent instrument materials. Orbs were visually larger and more prominent than fireflies; menus and labels stayed visible. These observations do not establish adequate contrast on optical see-through glasses. The visual scenario hides only the LEAF debug overlay while capturing, then restores it; it does not alter product rendering.

## SPECS device checks remaining

- Verify orb brightness, halo size, tine pulse/result colors and text over bright/dark real tabletops, including optical contrast and hand occlusion.
- Check real surface placement, rotation/scale alignment, hand-tracking reliability and comfortable playing/menu reach.
- Measure perceived cue-to-note timing, audio latency, display cadence and pause/resume behavior on device; rendering cannot promise a frame at every arbitrary timestamp.
- Profile sustained songs with four orbs and 24 fireflies for frame time, thermal load and responsiveness. Pooling/caps bound the added content; no hardware performance claim is made.
- Test tracking loss, suspend/resume and repeated repositioning. Previously reported native preview-pinch timeouts are not claimed fixed by this phase.
