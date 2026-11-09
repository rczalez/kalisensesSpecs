---
status: laptop-validation-complete-device-testing-pending
last_updated: 2026-11-08
---

# Design brief: Kalisenses

## Planning foundation and implemented phases

This project began with the [Devpost Learn skill pack, challengepost/learn-specs](https://github.com/challengepost/learn-specs). Its `plan-lens` workflow generated the initial `devpost/design-brief.md` inside `kalisensesSpecs/devpost/`. For a creator building a Lens for the first time, that brief made it possible to move from an idea to a structured build: it established the intended beginner, the spatial purpose, the core playing flow, and criteria for checking the result. It provided the solid foundation on which the Lens was built with CLAD in Lens Studio.

This file has evolved with implementation and review. The following history distinguishes the implemented phases from later changes and from acceptance work still requiring SPECS hardware.

| Phase | Implemented work | Current outcome and validation boundary |
| --- | --- | --- |
| **Phase One — Spatial Design and Visual Refinement** | Tabletop instrument and nearby dock; compact world-space menus; Outfit typography and amber/brown palette; brighter labels and outlines; surface-placement path and laptop tabletop fallback; separate Physical Keyboard, Virtual Keyboard and Pinch Gesture settings feeding shared note logic. Bounded resizing and footprint scaling were refined during validation. | Laptop presentation and functional checks are documented in [Phase One verification](../Assets/Verification/PhaseOneVerification.md) and the later review. Actual anchoring, reach, hand tracking and optical readability require device testing. |
| **Phase Two — Guided Tutorial and Fallback Interactions** | Audio/caption guidance, visual pinch teaching, first-note and short-sequence practice, untimed Twinkle, unlimited retries, recovery/help, and input changes without restarting. Later added silent input selection, Input/Next attention pulses, and interaction locking/release recovery during narration. | The current tutorial has **eight lessons**, with [a full narrated LEAF pass](../Assets/Verification/learn8-removal-checks.json). Standalone demonstration, release, other-hand repetition and timed tutorial lessons were removed. Earlier Phase Two records describe historical versions. Real gesture reliability and human learning remain unverified. |
| **Phase Three — Polish Follow Along Mode** | Pooled glowing note orbs descend to the corresponding tines on the song clock; arrival pulses indicate timing; cues stay aligned during movement/scale; correct/incorrect/missed feedback is distinct. Fireflies persist approximately ten seconds, drift and fade, with caps and exclusion regions. | Preview checks cover supported tempos, count-in, pause/resume, restart/song changes and effect behavior while preserving scoring. Hardware responsiveness, comfort and sustained performance still need testing. |
| **Phase Four — Idle Ambience and Musical Atmosphere** | Main-menu idle detection after about ten seconds; gradual ambient fireflies; activity stops spawning; gameplay and narration suppress idle ambience. Emission was increased to 2.25 per second, with a shared population limit of 24. | Final scope is **visual ambience only**: the proposed idle song and music controls were removed at the creator's request. No background music competes with narration or played notes. Device performance remains unverified. |
| **Cross-phase validation and subsequent refinement** | Beginner journey and mistake/interrupt tests; retained song/score during settings changes; injected tracking-loss pause; note mute; End session/Start again; cue/highlight cleanup; repeated-session checks and revision-specific screenshots/logs. | [Validation review](../Assets/Verification/ValidationReview.md) separates laptop passes, historical versions, unresolved issues and device tasks. Automated completion is not proof of usability or comfort. |

Implementation of a phase does not imply SPECS acceptance. The remaining sections describe the current build; historical evidence should be read against its recorded tutorial revision and test method.

## Current scope

This brief describes the current laptop implementation and the intended Specs experience. It incorporates spatial refinement, guided tutorials, Follow Along orbs, fireflies-only idle ambience and the completed laptop validation review. Implemented features, preview checks and hardware-dependent claims are distinguished below. Laptop acceptance is scoped to the automated and visual evidence in the review; Specs acceptance and human usability remain unverified.

## The one spatial moment

A beginner plays a recognizable virtual 17-key C-major kalimba without owning a physical instrument. The instrument belongs on a tabletop, with supporting controls nearby, readable note labels, responsive sound and highlights, gentle fireflies, and optional guided practice.

The intended glasses experience uses the user's surroundings and leaves the playing area clear. The laptop prototype retains a virtual tabletop and physical keyboard input. Real placement, hand tracking, sustained comfort and the benefit of playing on glasses still need device validation.

## Platform and spatial design

- Target: Snap SPECS, using the existing Lens Studio project targeting `Spectacles`. Implementation uses Snap APIs, Spectacles Interaction Kit (SIK) and Spectacles UIKit.
- The instrument is approximately 35 cm wide and 25 cm deep, with recognizable alternating tine lengths.
- Instrument and control dock share a world anchor. The dock sits behind the instrument, beyond the playing area, rather than following the user's face.
- The editor-only virtual tabletop is approximately 70 cm wide by 76 cm deep, providing room for the rear dock and front note pads. It is a preview stand-in, not a detected physical table.
- The laptop camera looks downward at approximately 43 degrees, with the instrument about 65 cm below and 60 cm in front of the starting eye position. All 17 tines and their labels should remain visible.
- An editor-only camera lock is implemented. Lens Studio's separate Interactive Preview navigation still responds to WASD and arrow keys; disabling only WASD has not been implemented. Preview-injected keyboard checks do not resolve the physical-key/background-navigation conflict.
- On Specs, surface placement uses supported environmental sensing, checks for a stable, nearly horizontal surface and additional footprint samples, then requires explicit confirmation. The instrument and dock stay together after placement.
- The placement flow includes Find Surface, Confirm Placement, retry, status messages and Smaller/Larger controls bounded to 80–120%. Size changes apply to the common anchor and the sampled surface footprint. The laptop explains that its virtual tabletop is already ready.
- Real surface sensing, footprint suitability, anchoring drift and placement comfort are implemented device-validation tasks, not established hardware results.
- Fireflies remain beside the instrument, outside the key and label area, with a population cap and fading lifetime. Guidance and effects must not obscure notes.

## Visual style and readability

Use a clean, colorful style with Outfit, the project's geometric sans-serif font, medium/bold lettering, clear labels and comfortable spacing. Keep keyboard letters and note names on or beside the corresponding tines. Use compact menus and hide inactive views.

| Color | Role |
| --- | --- |
| #FF9C00 | Primary actions, active states, next-note cues and important highlights |
| #CC8D29 | Secondary accents and hover feedback |
| #99763D | Supporting details and decorative accents |
| #66563D | Supporting surfaces |
| #332F29 | Deepest backing surfaces and text outlines |
| #FFF4DF | Bright neutral text and idle tines |

Played notes retain the existing green confirmation highlight. Follow Along also uses words or symbols to distinguish correct, incorrect and missed notes; color alone is not sufficient.

Dark backing panels use a high-opacity setting with transparency where practical, plus bright lettering and outlines. On an additive display, dark surfaces do not provide reliable optical occlusion. Preview readability is not proof of adequate contrast on Specs; assess text, outlines, controls and effects in bright and busy real surroundings.

## Input methods and note behavior

Free Play and Follow Along remain the two gameplay modes. A separate Input Method setting offers:

| Method | Playing action |
| --- | --- |
| Physical Keyboard | Laptop default. Press the mapped key, then release before replaying it. |
| Virtual Keyboard | Seventeen labeled in-world pads in front of the instrument. Poke with an index finger on device; click a pad in the editor. Lift before playing again. |
| Pinch Gesture | Aim the SIK hand ray at a tine and use hover feedback to identify the target. Bring thumb and index together once, then open them before another note. |

All methods share the same note-playing path for audio, tine highlights, fireflies and scoring. A held contact cannot repeat notes by crossing targets or changing views. Release and repress/lift/unpinch rearm it. Release away from a target is handled where supported; tracking loss and focus-loss behavior still need manual checks.

Opening Input or Placement during a song pauses it and retains earned score and song position. Returning leaves the song paused until Resume; Free Play returns to Free Play. Actual loss of both tracked hands conservatively pauses a hand-input performance and offers Resume or Input. This policy passed injected-state preview checks; real tracking and recovery-control reach remain device tasks.

Performance controls include Input, Placement and Mute notes; Free Play includes Input and Mute notes. End session stops audio/effects and hides the instrument, with Start again available. Closing the Lens itself uses the Specs system controls or the editor preview.

Menus use labeled SIK/UIKit controls. Physical keyboard input is a separate supported laptop path and must remain usable. Simultaneous-key software handling and overlapping audio voices are implemented; physical keyboard rollover and real two-hand performance remain validation tasks.

Narration provides audio guidance. There is no voice-command or speech-recognition input.

### Established physical keyboard mapping

The current working mapping remains unchanged:

| Keyboard key | Note |
| --- | --- |
| B | C4 |
| V | D4 |
| C | F4 |
| X | A4 |
| F | C5 |
| D | E5 |
| S | G5 |
| A | B5 |
| R | D6 |
| N | E4 |
| M | G4 |
| L | B4 |
| H | D5 |
| J | F5 |
| K | A5 |
| U | C6 |
| I | E6 |

The requested change from L to comma for B4 has **not** been applied. This Lens Studio version's keyboard API and MCP injector do not support comma; the injector rejected it as an unknown key. Do not label comma as working. No external keyboard-remapping tool has been configured.

Tines from left to right: D6, B5, G5, E5, C5, A4, F4, D4, C4, E4, G4, B4, D5, F5, A5, C6, E6. Corresponding labels: R, A, S, D, F, X, C, V, B, N, M, L, H, J, K, U, I.

Use the existing pitched, polyphonic kalimba-like plucks and overlapping decays. Preserve the note audio, original songs, scoring rules and firefly behavior when extending the tutorial.

## Menus and gameplay

- Main menu: Free Play, Follow Along, Input Method, Placement and Learn to Play. On device, placement confirmation is required before playing.
- Free Play: every accepted note makes its sound, highlights its tine and produces gentle fireflies. There is no prescribed song or score.
- Follow Along selection: Amazing Grace, Silent Night and Scarborough Fair, with tempo controls and a return action.
- Tempo: 40–80 BPM, initially 60 BPM. Select it before a performance; keep it fixed while playing.
- Before a scored performance: four-beat count-in with visible guidance and the existing audio click. Count-in input does not score.
- During a song: highlight the next tine and show its note, keyboard label and approaching timing cue. Distinguish correct, incorrect and missed feedback.
- Restart and Return to Menu stop the current performance and reset its state.
- Completion: after the final target window closes, show percentage, correct notes, incorrect presses and missed notes, with encouraging feedback and a firefly celebration.
- Results actions: Replay, Choose Another Song and Free Play. A retry starts with fresh score state.
- Use original beginner arrangements of public-domain melodies; retain the project's audio/source documentation and review rights before distribution.

### Follow Along timing and scoring

These rules apply to the existing scored mode, not the tutorial:

- A matching press within an inclusive ±400 ms target window earns 100 points.
- Each target is judged once and each press satisfies at most one target. Held-key automatic repeats are ignored.
- Match the nearest eligible unjudged target of the same pitch; earlier targets win exact ties.
- An unmatched mapped-note press records one incorrect press and earns no points, but deducts nothing and does not consume a target.
- A target not matched before its window closes records one miss.
- Process simultaneous presses independently using the same clock. Resolve valid boundary presses before expiring targets.
- Percentage is earned points divided by the maximum target points, rounded to a whole percent for display. At completion, correct plus missed equals the target count; extra incorrect presses do not reduce earned points.
- Non-note keys and input outside the active scoring period do not score.

## Idle ambience

Phase Four adds a menu-only idle state after approximately ten seconds without interaction. Accepted menu actions, control hover/press and keyboard input restart the timer. The tutorial, narration, Free Play, Follow Along (including count-in and pause), selection/placement/input views and results are excluded; pauses between notes never start background music.

Idle fireflies appear gradually at 2.25 per second (50% more than the previous 1.5 rate), with up to 24 active ambient lights, within the existing overall limit of 24. They fade in gently, live for approximately ten seconds and fade out near the end. Keep them away from the kalimba, labels, current note orbs, virtual keys and active menu using the existing dynamic exclusions. Stop idle spawning as soon as interaction resumes and let existing lights expire naturally.

Idle ambience is visual only. The idle song, music player, music mute control and music shortcut were removed at the user's request. Existing instrument sounds, count-in clicks and tutorial narration are preserved. Ambience never blocks controls.

No idle music is included or planned for this phase. See [Phase Four preview checks](../Assets/Verification/PhaseFourVerification.md). Optical contrast, physical comfort and sustained performance still require SPECS device checks.

## Guided tutorial and fallback interactions

Learn to Play opens a progressive tutorial with short captions, offline audio narration, visual demonstrations and unlimited retries. It can be completed using laptop keyboard events, including navigation. It does not introduce score penalties.

### Learning progression

1. Introduce the instrument, amber guidance and the absence of tutorial scoring.
2. Explain placement with placement.wav. Next opens placement controls; confirmation is required before continuing.
3. Choose an input method, with choose.wav on entry. Changing the selected method stays silent and preserves progress.

   On Learn 3, the Input button pulses between its supporting surface color and amber every 1.6 seconds, with a readable contrasting label and the hint “Press Input to choose how to play.” The pulse starts after narration unlocks interaction. Opening Input or using the keyboard input-method shortcut acknowledges it; returning from selection does not restart it. It resets on a new visit to Learn 3 and stops during narration or outside this lesson. [Preview checks](../Assets/Verification/learn3-input-pulse-checks.json) cover rendered color variation and restoration of the normal button style.
4. Highlight C4 and wait for the first correct note, retaining its input instructions, action audio and pinch demonstration. Wrong notes may sound, but do not advance the target.
5. Proceed directly from first-note release to C4–D4–E4–C4 practice, waiting for each correct note and release. Either hand can play the practice sequence.
6. Play a simple 42-note C-major arrangement of Twinkle, Twinkle, Little Star in untimed mode.
7. Celebrate the melody. Next finishes the tutorial; Skip opens Free Play.
8. Celebrate completion and open Free Play.

There are eight tutorial steps. The standalone demonstration, release, other-hand repeat-note and timed-practice lessons are removed. Placement remains LEARN 2 / 8, input choice LEARN 3 / 8, and first-note practice LEARN 4 / 8. The first correct note waits for release, then advances directly to sequence practice at LEARN 5 / 8 without separate release narration. Holding one contact still makes only one note. The initial pinch exercise uses the right hand; either hand can play subsequent practice. Input and Next pulses remain unchanged.

The current eight-step flow passed the full narrated Tutorial LEAF scenario on 2026-11-07 at 20:50:51 (275.775 seconds). It verified the full untimed melody, direct celebration-to-completion transition, replay/mute, release guards, retries, input switching, completion, skip and exit. [Completion screenshot](../Assets/Verification/learn8-completion.png) and [checks](../Assets/Verification/learn8-removal-checks.json) record this version. Previous Journey and Recovery results remain historical; hardware interaction reliability and comfort still require SPECS testing.

Timed tutorial practice has been removed. Tutorial melody practice remains untimed and free of score penalties. Timed playing, tempo selection, timing tolerance and scoring remain available in Follow Along.

### Narration and recovery controls

- Between narration clips, Replay restarts the current instruction and the gesture demonstration from its open pose.
- After narration, Next pulses amber every 1.6 seconds on steps that offer Next. Learn 3 first highlights Input; after opening input selection or changing method with the keyboard shortcut, Next becomes the highlighted action. Only one action pulses at a time. Pulses stop during speech or hidden views and restore the original button style. Note-playing steps keep their note guidance instead of showing a Next cue. [Preview evidence](../Assets/Verification/tutorial-next-pulse-checks.json) includes rendered color checks, replay suppression/resumption and the Input-to-Next handoff.
- Mute/Unmute can be selected between clips and affects subsequent narration; captions remain available.
- Help repeats guidance and enlarges the pinch demonstration when controls are available.
- Input opens the existing input choices without resetting the current step or melody position.
- Skip opens Free Play, subject to required device placement. Exit returns to the main menu.
- Quiet-time reminders repeat guidance with a cooldown. Recent key attempts, changing hover targets and held pinch attempts suppress automatic prompts.
- Missing or unstable hand tracking produces a brief explanation and offers another input, once per input selection. The policy is implemented and tested with injected sensor states; real tracking reliability remains unverified.
- If tracking is lost while waiting for release, changing to another input preserves the earned note and allows tutorial progression. The old held source still needs its own release before it can play again.
- Virtual Keyboard still needs tracked hands on Specs. Physical Keyboard is the laptop fallback; usable fallback options on the intended device setup require validation.
- Fourteen local narration clips are referenced by the current tutorial. No runtime network speech service is required. Perceived clarity, pronunciation and audio mixing still need listening review.

### Interaction lock during narration

While a TutorialNarration clip plays, disable all Lens input: physical note/navigation keys, virtual note pads, pinch/poke actions and menu controls, including Replay, Mute, Help, Input, Skip and Exit. Keep the captions and demonstration visible, with a Listening message explaining that controls return afterward.

Discard inputs received during playback. Do not buffer notes or menu actions. A key, touch or pinch held through the end must be released before a fresh activation is accepted. Release bookkeeping continues so held inputs cannot replay automatically. Pause tutorial progression and practice timing during narration.

Restore controls on natural completion or interruption. Failed starts, thrown playback errors, pauses and stalled playback must also release the lock. A failed delayed start is stopped before unlocking to prevent it beginning later with controls active. Muted or missing clips do not leave input locked. These are Lens controls; Lens Studio's separate built-in preview-navigation shortcuts are outside the runtime lock.

Disabling note targets can cancel SIK's release callback. Observe the pointer's released state and reconcile the tutorial's held contact on narration unlock, without replaying blocked actions. Existing note tails duck to 25% under narration. The introduction lasts 17.61 seconds. Placement uses placement.wav, input choice uses choose.wav, and first-note practice uses the selected input's action clip. There is no extra action-clip playback in a separate demonstration lesson. The removed release and timed lessons have no active audio, caption or generation entries; their WAVs remain unused assets. The transition recording now invites users to finish the tutorial. Offline generation validates a temporary clip before replacing working audio.

Each lesson narrates on entry. Opening Input Method, selecting any method, and returning with Done do not replay narration. Captions, input labels and retained progress update silently. Explicit Replay/Help and entry into subsequent tutorial steps still provide narration. [Current verification](../Assets/Verification/learn4-removal-checks.json) records placement, direct first-note entry, silent input selection, attention pulses and normal startup.

### Revised pinch demonstration

The instructional animation now uses a connected palm, wrist, thumb web and curled supporting fingers. Thumb and index bend at joints with constant segment lengths, easing through open, pinch/contact, hold and release. It is larger than the initial schematic, mirrors for the other hand, and updates its phase caption.

In laptop preview it is explicitly labeled as a simulated hand. The animation generates no note or tracking events and is not evidence of pinch-recognition accuracy.

### Laptop tutorial controls

These controls do not replace any musical key:

| Key | Action |
| --- | --- |
| Space | Open tutorial from main menu; Next; confirm placement; return from Input |
| 0 | Replay |
| 1 | Mute/unmute narration |
| 2 | Cycle Physical Keyboard, Virtual Keyboard and Pinch Gesture |
| 3 | Skip |
| 4 | Exit |
| 5 | Help |
| 6 | Find Surface while the placement view is open |

## Verification status and acceptance criteria

[Current spatial validation review](../Assets/Verification/ValidationReview.md) is the authoritative completed laptop checklist, with screenshots, sixteen passing LEAF scenarios, two complete agent journeys, failures and fixes, and explicit device/human testing tasks. [Machine-readable evidence](../Assets/Verification/validation-checks.json) records acceptance logs and scope. Earlier [Phase One verification](../Assets/Verification/PhaseOneVerification.md) and [Phase Two notes](../Assets/Verification/PhaseTwoVerification.md) remain historical evidence rather than final current acceptance reports.

Follow Along uses pooled amber orbs that descend to the tines at scheduled note times. Five tempos (40–80 BPM), count-in, pause/resume, restart and song changes passed preview checks; the existing timing tolerance and scoring remain unchanged. Correct/incorrect/missed feedback includes text or symbols. Two real-time agent-driven songs achieved 33 correct notes and no errors using simulated SIK delivery.

Idle ambience starts after approximately ten seconds on the main menu. It consists only of gently drifting fireflies: no idle song or extra ambience audio. Spawning stops on interaction and remains disabled during tutorial/play modes. Fireflies last approximately ten seconds, fade smoothly and avoid projected instrument/menu/cue/pad bounds. Idle emission is 2.25 per second, with both the ambient and total population capped at 24. A 23-round lifecycle check showed constant scene/audio/watcher counts after UI warm-up; this is not device performance evidence.

| Area | Confirmed findings | Remaining acceptance work |
| --- | --- | --- |
| Keyboard | All 17 mappings, injected hold/repress and overlapping keys passed earlier preview checks. The untimed tutorial passed 55 preview-delivered keyboard prompts. | Physical focus loss, capitalization/modifiers, rollover and native preview-navigation conflicts. |
| Layout and style | Tabletop layout, labels, menus, input pads and guidance were inspected in preview. | Readability and comfort on an additive Specs display. |
| Gameplay | Shared note events, scoring boundaries, Free Play and accelerated completion/replay of the three existing songs passed checks. | Real-time listening/playthroughs and perceived audio latency. |
| Tutorial | Current eight-step narrated LEAF run passed progression, replay/mute, retries/release, input switching, untimed melody, direct completion, skip and exit. Previous keyboard Journey results predate timed-lesson removal. | Beginner human learning and accessibility evaluation. |
| Recovery | Injected-state checks passed prompt suppression, hand order, tracking fallback and progress retention. | Actual tracking loss/recovery, two-hand behavior and fallback availability on Specs. |
| Revised pinch animation | Compilation and visual playback passed; open and contact poses were inspected. | The latest native MCP pinch attempt on Tine-C4 timed out waiting for onTriggerStart after 5 seconds. Live interaction verification remains incomplete. |
| Surface placement | Editor behavior, surface suitability rules and the shared world anchor were checked. | Real surface sensing, permissions, footprint checks and anchor stability on hardware. |

The timeout is a confirmed preview-agent interaction failure. Its cause has not been established; it is not proof that the animation or on-device pinch recognition is defective. Earlier simulated SIK passes do not override this unresolved result.

Useful evidence:

- [Phase One instrument/menu](../Assets/Verification/phase-one-main.png)
- [Phase One input options](../Assets/Verification/phase-one-input.png)
- [Revised open-hand demonstration](../Assets/Verification/phase-two-pinch-open.png)
- [Revised pinch-contact demonstration](../Assets/Verification/phase-two-pinch-contact.png)
- [Narration asset checks](../Assets/Verification/phase-two-narration-checks.json)
- [Earlier AiPreviewAgent recovery report](../Assets/Verification/AiPreviewAgentRecovery.md)

## Build and review discipline

Use CLAD, Lens Studio MCP and LEAF where supported. Build incrementally, inspect the live preview after meaningful changes, and preserve the physical keyboard path. Use SIK/UIKit for world controls while keeping keyboard input available for laptop music and tutorial navigation.

Separate direct preview-delivered input, simulated interactor tests, pure logic checks, visual inspection and real hardware evidence. Do not infer hand comfort, reliable recognition or physical keyboard delivery from logic tests alone.

Assess the instrument from the initial playing view and nearby viewpoints. Arrow keys are available for Interactive Preview navigation, but WASD also remains active; do not claim an arrow-only remap or an interaction lock that has not been verified. Keep controls, cues and effects away from the playing area.

Meta's [Unity First Hand sample](https://github.com/oculus-samples/Unity-FirstHand) informs progressive interaction teaching and alternative-input support. The tutorial adapts those ideas to Specs; it does not import Unity APIs or Meta assets. The existing [Google Glass design principles](https://developers.google.com/glass/design/principles) remain a spatial-design reference.

## Out of scope and open risks

- No claim of validated Specs hand tracking, real tabletop recognition, reach, long-term comfort or audio latency.
- No multiplayer, persistent scores, voice-command input, camera recognition, or recording/identifying/following people.
- The 35 cm instrument favors readable labels; comfortable access to all 17 targets needs hardware testing.
- Keep dark backing transparency and hand-demo legibility under review in real environments.
- Resolve the latest preview pinch timeout before declaring live interaction verification complete.
- Restore/verify normal startup with the optional LEAF previewScenario empty after any testing session. Keep temporary test runs separate from the user's experience.

