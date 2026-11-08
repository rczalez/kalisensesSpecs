# KaliSenses spatial validation review

Completed laptop review: 2026-11-07, America/Guatemala. Audience: a beginner without musical training or a physical kalimba.

**Current eight-step tutorial verified (20:50).** The former Learn 8 timed practice is removed from progression, captions, narration routing and tutorial click scheduling. The melody celebration now leads directly to completion, LEARN 8 / 8; its offer.wav was regenerated offline to remove the pulse-practice invitation. Full narrated Tutorial LEAF passed at 20:50:51 (275.775 seconds): placement, silent input selection, first-note release/hold guards, four-note practice, all 42 untimed melody notes, direct completion, replay/mute, simulated SIK input switching, skip and exit. [Completion screenshot](learn8-completion.png), [checks and logs](learn8-removal-checks.json). Follow Along timing and scoring are unchanged. Earlier flow records below are historical. Hand tracking, comfort and hardware performance still require SPECS testing.

**Current nine-step flow verified (20:35).** The former Learn 5 standalone release lesson is removed from progression, captions and narration routing. First-note practice remains LEARN 4 / 9 and waits for actual release before advancing directly to sequence practice at LEARN 5 / 9. No separate release narration plays. Release-before-repeat protection, the initial right-hand guard, silent input selection and Input/Next pulses remain. Tutorial-state checks passed at 20:33:15; live Recovery passed at 20:35:40 (107.168 seconds). The recovery fixture explicitly injects sequence narration during a virtual contact, testing release reconciliation without depending on the removed lesson. [Sequence screenshot](learn5-sequence-after-first.png), [checks and logs](learn5-removal-checks.json). Compilation and normal startup passed at 20:40:21. Two intervening preview resets reported missing scenario/UI initialization, then a recompile and refresh restored READY with no runtime errors; the cause was not established. Earlier flow records below are historical; the complete Journey was not rerun for this targeted change. Actual hand recognition and comfort require SPECS device testing.

**Current ten-step flow verified (20:20).** The former Learn 6 other-hand repeat-note instruction is removed from progression, captions, hand-specific tracking selection, audio routing and test navigation. Releasing the first correct note now leads directly to the practice sequence, LEARN 6 / 10, with sequence.wav and index zero. The initial right-hand pinch guard remains; either hand can play subsequent practice. Release gating, silent input changes and Input/Next attention cues are preserved. Tutorial-state checks passed at 20:17:06, including a left-hand practice contact fixture. Live Recovery passed at 20:20:04 (108.935 seconds), including actual release-during-narration recovery and direct sequence entry, plus the existing input/score/control checks. [Current sequence screenshot](learn6-sequence-after-release.png), [current logs](learn6-removal-checks.json). Compilation and normal startup passed. Complete Journey results below predate this latest removal; older flow records are historical. Actual hand recognition and comfort remain device-validation tasks.

**Current eleven-step flow verified (19:53).** The standalone selected-input demonstration is removed again. Learn 2 placement and Learn 3 input choice remain; Next advances directly to first-note practice, now LEARN 4 / 11, with one action-clip playback. The Input and Next pulses, narration lock, silent input selection and first-note pinch animation are retained. Tutorial-state checks passed at 19:51:11; the extended live Recovery scenario passed at 19:53:24 (100.988 seconds), including direct progression, actual pulse colors, replay suppression/resumption and original recovery checks. [Current screenshot](learn4-first-with-pulses.png), [current logs](learn4-removal-checks.json). Normal startup is restored. Complete Journey results below predate this latest removal; they were not rerun for this targeted change. Earlier flow screenshots remain historical. Hardware-dependent checks remain unverified.

**Next-button guidance verified (19:13).** Next now shares the 1.6-second amber attention pulse after narration, on steps where Next is available. Input takes priority on Learn 3 until acknowledged, then Next guides continuation; both never pulse together. Replay suppresses the cue during speech and resumes it afterward. Note-playing steps keep Next hidden, with no stale pulse or style changes. The extended Recovery scenario passed at 19:13:23 (107.323 seconds), including actual rendered color sampling, narration/replay gating, Input-to-Next handoff, first-note suppression and existing recovery checks. [During narration, no cue](tutorial-next-pulse-placement-0.png), [Next after Input](tutorial-next-pulse-after-input-0.png), [another Next frame](tutorial-next-pulse-after-input-1.png), [test logs](tutorial-next-pulse-checks.json). Delayed polling captured the placement-named images after progression to Learn 3 speech; their actual contents are described here. Captures were visually inspected and normal startup restored. SPECS visual comfort and optical contrast remain device checks.

**Learn 3 Input guidance verified (19:01).** The Input button now pulses amber on a 1.6-second cycle after narration finishes, with a contrasting label and an explicit “Press Input” hint. It stays visible, stops when Input is opened or the input-method shortcut is used, and remains stopped after returning. Narration/view changes suppress it; re-entering Learn 3 resets it. Original UIKit fill type and interaction color behavior are restored afterward. The first visual pass exposed a fill-style issue; the final solid-fill pulse was inspected at three timestamps. Live Recovery passed at 19:01:14 (85.302 seconds), checking actual rendered color variation, no pulse during the narration lock, silent selection, and normal-style restoration, followed by existing recovery checks. [Dimmer phase](learn3-input-pulse-dim.png), [bright phase](learn3-input-pulse-bright.png), [test logs](learn3-input-pulse-checks.json). Normal startup is restored. SPECS optical contrast and comfort remain device-validation tasks.

**Current twelve-step flow restored and verified (18:46).** Both removed instructions are back: LEARN 2 / 12 is the placement lesson using placement.wav; LEARN 4 / 12 is the selected-input demonstration using the relevant action clip. Input choice and first-note practice return to positions 3 and 5. Narration/caption manifests, Next controls and test navigation are restored. Input-method selection remains silent and progress-preserving. Existing WAVs were reused.

Tutorial Fallback passed at 18:41:38. Recovery passed at 18:43:28 (80.151 seconds), verifying both restored captions/titles/audio and subsequent first-note practice, plus existing recovery checks. The complete keyboard Journey passed at 18:45:47 (115.850 seconds, 60 prompts, untimed melody, 33/33 real-time simulated-SIK Follow Along notes, replay, Free Play and exit). [Restored placement](tutorial-restored-placement.png), [restored demonstration](tutorial-restored-demo.png) and [current logs](restored-twelve-step-checks.json). Compilation and normal startup passed; no automatic test launches. The non-blocking LEAF reset-state warning remains. The shortened-flow results below are historical. SPECS/device comfort and recognition remain unverified.

**Current ten-step flow verified (18:30).** The separate placement-introduction stage has been removed from active progression, captions and test navigation. The remaining setup lesson uses placement.wav with platform-appropriate matching captions and retains silent Input selection. Next opens placement controls; confirmation then starts the first-note exercise. Titles are LEARN 2 / 10 and LEARN 3 / 10. The old input-choice recording is no longer referenced. Shared note mappings/audio and pinch teaching remain unchanged.

Tutorial Fallback passed at 18:26:33; live Recovery passed at 18:27:47 (42.657 seconds), including the setup clip/caption match and confirmation gate; and the complete keyboard Journey passed at 18:30:07 (107.305 seconds, 58 prompts, complete untimed melody, 33/33 real-time simulated-SIK Follow Along notes, replay, Free Play and exit). [Current setup](tutorial-ten-step-setup.png), [current first note](tutorial-ten-step-first.png) and [current logs](ten-step-preview-checks.json). Normal startup is restored with no automatic test. The non-blocking LEAF reset-state warning remains; no runtime/shader errors occurred in the successful runs. All earlier flow screenshots and test counts below are historical. Hardware-dependent checks remain unverified.

**Current eleven-step flow verified (18:06).** The separate instruction-only stage has been removed from active progression, captions, narration routing, Next controls and test navigation. Learn 3 leads directly to the first-note exercise, displayed as **LEARN 4 / 11**. Its shared action recording plays once on entry; its note guidance and pinch animation remain available. Input selection stays silent. Older screenshots and logs below record the prior flow and are historical evidence.

Live checks passed: Tutorial Fallback at 17:56:53; Recovery at 18:02:41 (63.415 seconds), including the direct transition and one instruction playback; and the complete agent-driven Journey at 18:04:54 (106.298 seconds, 59 keyboard prompts, full untimed melody, 33/33 real-time simulated-SIK Follow Along notes, replay, Free Play chord and exit). The earlier stalled Recovery attempt passed after reapplying Interactive Sunlit Room and resetting; its original cause is unconfirmed. A separate keyboard walk and runtime Text query confirmed the new title. [Current screenshot](tutorial-first-4-of-11.png) and [current logs](eleven-step-preview-checks.json). Compilation and normal startup passed; automatic tests are disabled. The non-blocking LEAF plugin-state reset warning remains. These are laptop checks; actual hand tracking and comfort remain unverified.

**Latest follow-up verified (17:35): input selection is silent.** Learn 3 narrates on entry; opening Input Method, choosing Physical Keyboard, Virtual Keyboard or Pinch Gesture, and returning with Done do not replay audio or lock controls. Captions and progress update. Recovery passed at 17:29:33 (57.693 seconds) and the full narrated Tutorial passed at 17:35:07 (316.370 seconds), including replay/mute, retries, melodies, simulated SIK switching, completion, skip and exit. [Follow-up logs](silent-input-preview-checks.json). Normal startup was restored and verified. Earlier shader/authorization failures did not recur; a non-blocking LEAF plugin-state warning remains in reset logs. This is laptop preview evidence, not SPECS testing.

The reopened project contains the original longer intro (17.61 s) and choose (31.35 s) WAVs again. The first follow-up Recovery run therefore exceeded its 15-second narration wait. Test waits now use the loaded clip duration plus a margin; runtime audio and interaction locks were unchanged. This follow-up leaves the existing recordings in place. Historical short-clip timings below describe the earlier asset state; shorter recordings remain a separate usability refinement.

**Laptop acceptance: passed within the scope below. SPECS acceptance: unverified.** Sixteen distinct LEAF scenarios passed. Two complete agent-driven journeys passed, including a repeat after the final input fixes. No person performed a usability study, and no SPECS device was tested.

## Improvements made

- Input and placement settings now preserve the active song and earned score. Opening them pauses the song; returning leaves it paused until Resume. Free Play returns to the same activity.
- Loss of both tracked hands conservatively pauses hand-input performances. Recovery explains how to resume or switch input. The preview uses an injected tracking state; actual sensing is a device task.
- Fixed a tutorial release deadlock: narration disables note targets, which can cancel SIK's release callback. Current pointer state now provides release bookkeeping, and narration unlock reconciles it. Blocked notes/actions are still discarded.
- Added Input, Placement and Mute notes controls near the performance; Input and Mute notes in Free Play; bounded 80–120% resizing in Placement; and End session / Start again. Ending stops audio and effects and hides the instrument. It does not close the Lens application.
- Enlarged tutorial status/help text, kept panels behind the instrument, added a beginner entry prompt, and added written targeting/played-note feedback. Feedback includes words or symbols as well as color.
- Shortened the introduction to 6.68 seconds and input selection to 5.03 seconds (previously 31.35). Captions and narration source were updated. Generation now validates a temporary WAV before replacing an existing clip, so synthesis failure preserves working audio.
- Existing note tails are reduced to 25% volume during speech. Notes have a separate mute control. Mode transitions clear obsolete tine flashes, outcomes, cues and queued actions.

Preserved: all 17 established key mappings (including L→B4), original songs/audio, timing tolerance and matching/scoring rules, shared input logic, 10-second fireflies, 24-effect cap and fireflies-only idle ambience. No idle song was added.

## Completed validation checklist

Each verdict is scoped to its evidence. A preview pass does not imply device comfort or ease of learning.

| Area | Expected behavior | Test method | Observed result and fix | Verdict / evidence label |
| --- | --- | --- | --- | --- |
| Spatial purpose | Tabletop tines and depth cues support playing and timing | Active-song capture; Follow Cues scenario | Amber orbs approach corresponding tines; distinct drifting fireflies stay outside the play region. 85 exact mathematical arrivals and live checks at 40–80 BPM passed. | Pass — **Verified in laptop preview** |
| UI clarity | Compact menus show the current step and action | Menu Layout; full journey; screenshots | Only the current view is enabled; seven views and all pad bounds pass projection checks. Enlarged help/status and explicit beginner entry prompt. Session controls fit above the tines. | Pass — **Verified in laptop preview**; novice comprehension **Not yet tested** |
| Spatial stability | Labels/cues stay aligned during reposition/resize | Placement, Presentation, Follow Cues and Firefly Space | Common-anchor transforms and moved/rotated/scaled cue positions pass. Resize changes anchor scale and surface-check footprint. | Pass — **Verified in laptop preview**; real anchoring **Requires SPECS device testing** |
| Input reliability | One note per deliberate input; supported chords work | 17-key, Physical Hold, Input Methods, Recovery | All 17 native preview keys pass; holds do not repeat; release/repress and overlapping L/M pass. All 34 simulated virtual/pinch note controls feed the shared path correctly. | Pass — **Verified in laptop preview**; real hand reliability/rollover **Not yet tested** |
| Feedback | Targeted, played, correct, incorrect and missed are distinct | Input hover checks; live timing fixtures; captures | Hover and played states verified; correct/incorrect/missed counters and written feedback pass. Added Target/Played text in Free Play. Amber cues differ from green/yellow fireflies by form, location and motion. | Pass — **Verified in laptop preview**; perceptual recognition **Not yet tested** |
| Beginner guidance | Placement → first note → short practice → melody | Tutorial and repeated Journey | Narrated tutorial, retries, release, other-hand step, sequence, full 42-note untimed melody, optional timed fixture, completion, skip and exit pass. | Pass — **Verified in laptop preview**; ease of learning **Not yet tested** |
| Recovery | Input/tracking interruptions preserve progress without unfair penalties | Recovery and Tutorial Fallback | Settings retain score; injected hand loss pauses scoring; input switching preserves tutorial step. Release during narration now advances correctly after unlock. | Pass — **Verified in laptop preview**; actual loss/recovery **Requires SPECS device testing** |
| User control | Pause/mute/replay/reposition/exit are available when appropriate | Actual UIKit controls; Recovery/Journey/Narration Lock | Pause/resume, note mute, narration mute/replay, input selection, resize, restart and session end pass. All Lens controls remain intentionally locked during narration; failure/interruption unlocks them. | Pass — **Verified in laptop preview**; reach/fallback access **Requires SPECS device testing** |
| Accessibility | Captions support speech; essential feedback is not color-only | Caption/source review; Tutorial; captures | Bright neutral text and outlines; written note/key prompts and correct/incorrect/missed labels/symbols. Intro and selection captions match regenerated wording. | Pass for implemented channels — **Verified in laptop preview**; accessibility usability **Not yet tested** |
| Visual comfort | Readable content clears instrument and surroundings | Visual review of final menu/tutorial/song/placement captures | Menus are behind tines; labels and active orbs remain visible; effects avoid projected menu and instrument bounds. Preview text is readable in the supplied scene. | Preview layout pass — **Verified in laptop preview**; optical contrast, physical reach and comfort **Requires SPECS device testing** |
| Audio | Speech, ambience and notes avoid unintended competition | Tutorial, Narration Lock, Recovery, Idle; audio component checks | No idle music; 34 audio components remain constant. Note tails duck under speech; note mute works. Natural finish, stop, pause, failed start, thrown failure and watchdog restore interaction. | State/transition pass — **Verified in laptop preview**; perceived mix/latency **Not yet tested** |
| Effects/performance | Bounded, fading effects do not accumulate or obscure controls | Follow Cues, Firefly Space, Idle, two-minute soak | 10-second cohort expires; cap24 enforced; exclusion bounds survive menu/anchor changes. 23 repeated rounds retain 565 non-firefly objects, 34 audio components and one watcher, then all remaining flies expire. | Pass for bounded lifecycle — **Verified in laptop preview**; FPS, memory/thermal budget **Requires SPECS device testing** |

## Complete beginner journey

The automated agent launched the menu, selected/cycled input methods, confirmed virtual placement, played the first note and sequence, and completed all 42 melody notes with actual preview-delivered keyboard events. The introduction played; narration was then muted and captions guided the rest of this keyboard journey. The separate fully narrated Tutorial scenario exercised the speech-driven flow and optional timed practice.

The agent entered Follow Along, selected Amazing Grace at 80 BPM, completed its 33 notes, reviewed a 100% result, replayed, switched to physical-keyboard Free Play, played a chord, returned to the menu and ended the session. Follow Along used Lens-local simulated SIK poke events; this is not a native hand-tracking or physical-keyboard timing claim.

| Journey run | Result | Duration |
| --- | --- | --- |
| 2026-11-06 23:46:28, before the final release-poll fix | Passed; 60 keyboard prompts; 33 correct / 0 incorrect / 0 missed | 93.827 s |
| 2026-11-07 00:22:24, final implementation | Passed; 60 keyboard prompts; 33 correct / 0 incorrect / 0 missed | 93.307 s |

Unnecessary effort found and fixed: settings previously discarded a performance, tutorial help was small, release could stall after speech, and input-choice narration locked controls for over half a minute. Automated success does not establish that a first-time person understands the experience.

## Test results and limitations

All results below are **Verified in laptop preview**. Full acceptance lines and selected logs are in [validation-checks.json](validation-checks.json).

| LEAF scenario | Passed at (2026-11-07 local time) | Scope |
| --- | --- | --- |
| Recovery | 00:08:54 | Chord/hold, mute, settings/score, injected tracking pause, size, end/restart, SIK release during speech |
| Tutorial | 00:12:57 | Full narration/replay/mute; retries, untimed melody; accelerated optional timed fixture; simulated hand order/switching; completion/skip/exit |
| Narration Lock | 00:13:41 | All input/action guards; held-key discard; natural finish, stop/pause, injected failures and watchdog |
| 17 Keyboard | 00:13:55 | All mappings, one audio/note each, stable preview camera |
| Physical Hold | 00:14:55 | Hold suppression, release/repress, overlapping L/M; initial MCP hold delivery retried |
| Soak | 00:18:12 | 23 rounds, all three songs, repeated restart/menu/Free Play; accelerated song deadlines; natural effect expiry |
| Scoring Logic | 00:18:34 | Inclusive ±400 ms, nearest/tie, repeated pitch, simultaneous targets, rounding and all songs |
| Input Methods | 00:18:55 | Selection plus 34 simulated SIK notes, targeting, hold/cross guards and shared scoring |
| Menu Layout | 00:19:06 | Seven views and 17 pad bounds; text geometry and projected centers |
| Placement | 00:19:12 | Virtual placement controls, surface-policy guards, shared anchor |
| Presentation | 00:19:17 | Geometry, projection and world transforms |
| Tutorial Fallback | 00:19:24 | Injected tracking state, prompt suppression, release/hand order and progress retention |
| Follow Cues | 00:20:23 | All tines and five tempos; live arrival frames +3.7–25.2 ms; correct/wrong/missed; pause/restart/song cleanup; 10-second effects |
| Journey | 00:22:24 | Repeated end-to-end journey described above |
| Idle Ambience | 00:22:59 | ~10 s idle entry, input dismissal, excluded modes, fireflies only, cap24 |
| Firefly Space | 00:23:21 | Effects clear projected menus, instrument, labels, pads and cues after view/anchor changes |

The soak's timed loop ran for approximately 123.6 seconds plus a 10.5-second cleanup wait (134.07 seconds from its measurement start; 148.81 seconds including warm-up). Non-firefly objects stayed at 565; audio at 34; watchers at one; flies reached 24 and then returned to zero. Trigger-operation samples were 217.8 ms initially and 224.7 ms finally, including LEAF's gesture sequence/waits. These are not measurements of perceived musical latency, FPS or heap usage. Song endings were accelerated to exercise transitions repeatedly; the Journey separately exercised a real-time song.

Earlier failures are retained as findings, not counted as passes:

- A 31.35-second choose.wav exceeded the test's 30-second control wait. Fixed by regenerating concise audio, not weakening the interaction lock.
- A simulated SIK trigger stalled when narration disabled its target. An independent release test then exposed missing application release bookkeeping. Both the driver and application were corrected; focused Recovery and full Tutorial subsequently passed.
- The first soak baseline omitted lazy song-picker initialization and increased by one object. Warm-up now visits all songs before measuring; 23 later rounds showed no further growth. This supports a one-time UI initialization explanation, not a general memory-leak guarantee.
- Earlier native-MCP timed song attempts rejected a count-in press and, on a subsequent run, did not log the expected F event before its timing window. Delivery/focus delay is suspected, not proven. Independent F/mapping checks now pass; final timed songs use local SIK delivery. Human physical-keyboard timing remains untested.
- The previous MCP transport outage interrupted validation. Reconnection succeeded; project/sign-in, compilation and runtime checks succeeded. Windows speech synthesis required approved access outside the sandbox. No raw HTTP workaround was used.

## Visual evidence

All images are laptop preview captures, not through-lens SPECS photos. Recovery's hand-loss message is an injected state. LEAF overlays were hidden for the main journey/recovery captures.

- [Baseline before refinement](validation-baseline.png)
- [Revised main menu and instrument](validation-final-journey-welcome.png)
- [First note and larger tutorial guidance](validation-final-journey-first.png)
- [Narration lock and readable listening status](validation-final-release.png)
- [Untimed melody completed](validation-final-journey-melody-done.png)
- [Active orbs, correct-note feedback and performance controls](validation-final-journey-follow.png)
- [Results and replay/Free Play options](validation-final-journey-results.png)
- [Free Play feedback](validation-final-journey-free.png)
- [Injected tracking-loss recovery](validation-final-recovery.png)
- [Placement size and return-to-session controls](validation-final-placement.png)
- [Fireflies-only idle](validation-final-idle.png)
- [Ended session](validation-final-journey-ended.png)

Visual inspection found the captions, note labels and dock legible in Sunlit Room, with controls clear of tines and cues. Transparent dark backing is not evidence of optical occlusion or adequate additive-display contrast.

## Remaining validation

**Requires SPECS device testing:** real tabletop sensing and footprint at every size; anchor drift; ray targeting and actual pinch/poke release after disabled targets; hand loss and resumed scoring; reachable recovery controls; two-hand playing; see-through contrast against bright/busy backgrounds; comfortable viewing/reach across body sizes; perceived note/speech balance and latency; on-device frame time, memory and thermal behavior during longer play.

**Not yet tested:** a beginner human journey or accessibility study; real physical-keyboard focus loss/modifiers/rollover; prolonged musical timing by a person; native AiPreviewAgent pinch recheck after the historical timeout. Simulated SIK passes do not resolve that separate native-agent result. No claim of actual hand-recognition accuracy, user comfort or learning ease is made.

Normal startup is restored with LeafIndex.previewScenario empty and waitForDriver true. No test should launch during normal play. No permission or manual action is needed to use the laptop prototype; the remaining device and human tests require suitable hardware and participants.
