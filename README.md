# KaliSenses

KaliSenses is a tabletop AR music experience for Snap SPECS. It helps beginners play a virtual 17-key C-major kalimba without owning an instrument or knowing how to read music. A guided tutorial teaches the first notes; Free Play encourages exploration; Follow Along uses descending 3D light cues to teach timing.

**Submission status:** working laptop prototype, with automated and visual Lens Studio preview evidence. Real tabletop anchoring, actual hand tracking, physical comfort, see-through readability, and on-device performance still require SPECS testing. No human usability study has been performed.

![KaliSenses promotional cover](Assets/Devpost/kalisenses-thumbnail.png)

*AI-generated promotional illustration. This cover communicates the concept, it is not a runtime screenshot.*

## Start here, judges

1. Open [kalisenses.esproj](kalisenses.esproj) in Lens Studio. The recorded validation environment is **Lens Studio 5.23.2.26081320**, **SPECS 27 Interactive Preview**, using **Sunlit Room**.
2. Allow packages, Git LFS assets, and TypeScript compilation to finish. Reset the preview if necessary. The project uses its existing scene and packages; it is not a Unity or browser application.
3. Keep the virtual tabletop and the downward-facing preview camera. Select **Physical Keyboard** for the most reproducible laptop demonstration.
4. Select **Learn to Play**, or press **Space** from the main menu. Follow captions and wait for each narration clip to finish before interacting.
5. Complete the first note, four-note sequence, and untimed melody. Then try **Follow Along → Amazing Grace → 60 BPM**, or select **Free Play**.
6. In Follow Along, play a tine **when the glowing orb reaches it**. Use Pause, Restart, Input, Placement, or Mute notes as needed.
7. Return to the main menu and leave it untouched for about ten seconds to see the fireflies-only idle ambience. **End session** stops sounds/effects and hides the instrument; **Start again** returns to the menu.

The Lens does not need a live generative-AI or speech service while playing. Narration and note sounds are bundled WAV files. Development integrations and package installation may require their own authorization.

## Why this belongs in spatial AR

The instrument sits on a surface, with its controls behind it rather than attached to the user's face. Tines, labels, and falling note cues share the instrument's spatial frame, so they remain aligned when it moves or changes size. Depth shows both **where** to play and **when** to play.

On SPECS, the placement implementation uses environmental surface queries, checks a stable nearly horizontal surface and its footprint, and asks for confirmation. On a laptop, a virtual tabletop stands in for a real surface. Placement includes Find Surface, Confirm Placement, retry feedback, and Smaller/Larger controls bounded to **80–120%**. Real sensing and anchoring are implemented paths awaiting device validation.

The visual style uses Outfit geometric sans-serif typography, bright neutral text, outlines, and compact world-space menus. Amber `#FF9C00` highlights actions and cues, supporting colors are `#CC8D29`, `#99763D`, `#66563D`, and `#332F29`, with `#FFF4DF` text. Dark translucent backing does not establish sufficient contrast on a see-through display, that remains a device check.

## Playing and controls

### Input methods

| Method | How to play | Validation scope |
| --- | --- | --- |
| Physical Keyboard | Press a labeled key, then release before repeating it. Laptop default. | Preview key-event check,; real keyboard focus/rollover still need manual checks. |
| Virtual Keyboard | Select a labeled note pad in front of the kalimba. Poke with an index finger on device; click/select in the preview. Lift before repeating. | Shared note path and simulated SIK interactions checked in preview. |
| Pinch Gesture | Aim the hand ray at a tine, confirm the hover target, pinch thumb and index once, then open them. | Visual teaching and simulated interaction checks; real recognition remains unverified. |

All three methods use the same note handler for sound, tine highlights, fireflies, and scoring. Held contacts cannot repeatedly play notes by crossing targets. Simultaneous accepted notes are processed independently; physical keyboard rollover and actual two-hand playing require separate checks.

### Established laptop note mapping

These are the tines **from left to right**, not a conventional piano layout:

| Key | R | A | S | D | F | X | C | V | B | N | M | L | H | J | K | U | I |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Note | D6 | B5 | G5 | E5 | C5 | A4 | F4 | D4 | C4 | E4 | G4 | B4 | D5 | F5 | A5 | C6 | E6 |

**B plays C4; L plays B4.** The requested comma substitution was not implemented because the tested Lens Studio keyboard API/MCP injector did not support it.

Lens Studio's Interactive Preview has its own navigation shortcuts. Its WASD behavior is outside the Lens's runtime input lock; disabling only WASD has not been implemented. 

### Tutorial keyboard shortcuts

| Key | Action |
| --- | --- |
| Space | Start Learn to Play from the menu; Next when offered; confirm placement or return from Input in the relevant view |
| 0 | Replay current instructions |
| 1 | Mute/unmute narration |
| 2 | Cycle Physical Keyboard → Virtual Keyboard → Pinch Gesture without losing progress |
| 3 | Skip tutorial and enter Free Play |
| 4 | Exit tutorial to the menu |
| 5 | Show/replay help |
| 6 | Retry surface scan while in tutorial placement |

Shortcuts and menu controls are unavailable while narration plays. After speech, Input or Next pulses amber to indicate the appropriate action. Learn 3 prioritizes Input; opening it or changing the method acknowledges that prompt, and Next then becomes the suggested action.

## Modes and beginner journey

### Learn to Play: current eight-lesson flow

1. Welcome and explain the highlighted note; tutorial practice has no score penalties.
2. Explain placement, open placement controls, and confirm.
3. Select an input method. This lesson narrates on entry; opening Input, changing methods, and returning stay silent.
4. Play the first highlighted C4, then release. The initial pinch exercise asks for the right hand; the visual hand demonstration is simulated in the preview.
5. Play **C4–D4–E4–C4**, waiting for each correct note and release. Either hand can play subsequent practice.
6. Play the **42-note C-major arrangement of Twinkle, Twinkle, Little Star**, untimed. Wrong notes can sound, but do not advance the target. Unlimited retries are allowed.
7. Celebrate the melody; Next finishes the tutorial, or Skip enters Free Play.
8. Complete the tutorial; Next opens Free Play.

Separate demonstration, release, other-hand repetition, and timed-practice lessons were removed during refinement. Release protection and pinch teaching remain integrated into the retained exercises. **Timed tutorial practice is no longer present; timed playing is available in Follow Along.**

Replay, mute, help, skip, exit, and input switching are available between clips. Quiet-time help avoids repeatedly prompting during active attempts. Changing input preserves tutorial progress, including recovery from a held contact whose tracking was lost.

### Free Play

Play any mapped note or supported chord. Each accepted note plays a pitched kalimba-like pluck, highlights its tine, and produces fireflies. There is no song target or score. Input, Mute notes, and Return to Menu remain accessible.

### Follow Along

Choose **Amazing Grace**, **Silent Night**, or **Scarborough Fair**. Select a tempo from **40–80 BPM**, initially **60 BPM**, then follow a four-beat count-in.

Amber orbs descend toward the corresponding tines, reaching them at the scheduled note time. A brief tine pulse marks arrival. Up to four pooled orbs provide roughly 2–3 seconds of advance visibility. Cues are distinct from the drifting green-gold fireflies produced by playing. Correct, incorrect, and missed feedback also uses text or symbols rather than color alone.

The existing scoring rules are preserved:

- A matching note within an inclusive **±400 ms** window earns 100 points; one press satisfies at most one target.
- The nearest eligible target of the same pitch wins; earlier targets win exact ties.
- An unmatched mapped note counts as incorrect, earns nothing, and does not consume a target or deduct earned points.
- A target becomes missed after its window closes. Held-input repeats are ignored.
- Results show the percentage of targets correctly played, correct notes, incorrect presses, and misses. Replay starts fresh.

Pause/resume shifts the song clock and target times together. Restart, song changes, and mode transitions clear obsolete cues and feedback. Opening Input or Placement during a performance pauses it while preserving song progress and score; return leaves it paused until Resume. Loss of both tracked hands conservatively pauses a hand-input performance. This recovery policy has injected-state preview evidence, not confirmed device sensing results.

### Ambience and audio behavior

Fireflies live for about **ten seconds**, drift gently, and fade near the end. Placement checks keep them away from the instrument, labels, menus, virtual pads, and cue regions. The shared effect cap is **24**. Main-menu idle emission begins after about ten seconds, at **2.25 fireflies per second**; interaction stops new idle spawning while existing particles fade naturally.

There is **no idle background song**. Idle ambience does not activate during tutorial narration, Free Play, Follow Along, or its pauses. Notes, narration, and count-in clicks remain separate audio responsibilities.

While any active tutorial narration WAV plays, **all Lens interaction is temporarily disabled**, including notes, gestures, menu controls, and tutorial shortcuts. Captions and a Listening message remain visible. Inputs are discarded, not queued. A contact held through playback must be released before it can play again. Finish, interruption, playback failure, failed start, and a watchdog release the lock. Existing note tails duck to 25% during speech. Mute narration between clips to keep captions without subsequent speech; Mute notes controls instrument audio separately.

## How it was created

The initial planning brief was created using [challengepost/learn-specs](https://github.com/challengepost/learn-specs), the Devpost Learn skill pack for SPECS. Its `plan-lens` workflow generated `devpost/design-brief.md` inside this project (`kalisensesSpecs/devpost/`). That brief helped establish the Lens foundations and guided the first implementation. The [design brief](devpost/design-brief.md) has since been updated to reflect the implemented experience and validation findings; it is an evolving project document rather than an unchanged copy of the initial output.

For a first-time Lens creator, this planning step made the project possible: the brief provided a solid foundation for deciding who the Lens serves, how it should fit into the user's surroundings, what to build first, and how to evaluate the result. The phases below grew from that foundation and subsequent design requests.

### Implemented phases

| Phase | Purpose and implemented outcome | Evidence and remaining limits |
| --- | --- | --- |
| **Phase One — Spatial Design and Visual Refinement** | Established the tabletop kalimba and nearby control dock, compact menus, Outfit typography, amber/brown palette, readable labels, placement/resizing, and separate physical, virtual, and pinch input options. Kept the established keyboard mapping and shared note behavior. | [Phase One review](Assets/Verification/PhaseOneVerification.md) and later validation records. Real placement, comfort, and see-through contrast require SPECS testing. |
| **Phase Two — Guided Tutorial and Fallback Interactions** | Added narration, captions, pinch demonstrations, first-note practice, a short sequence, untimed Twinkle, help/replay/mute/skip/exit, and progress-preserving input changes. Later refinement produced the current eight-lesson flow, silent input selection, Input/Next pulses, and narration interaction locking. | [Current eight-lesson test](Assets/Verification/learn8-removal-checks.json). Earlier optional timed practice and standalone lessons were removed; historical Phase Two notes describe an older flow. Real hand recognition remains unverified. |
| **Phase Three — Polish Follow Along Mode** | Added pooled descending amber orbs aligned with tines, arrival pulses, tempo/count-in/pause/restart synchronization, distinct performance feedback, and approximately ten-second fireflies. Preserved note matching and scoring. | [Current validation review](Assets/Verification/ValidationReview.md) records cue/timing and effect checks. Device responsiveness and real playing comfort remain unverified. |
| **Phase Four — Idle Ambience and Musical Atmosphere** | Added main-menu fireflies after roughly ten seconds without interaction, immediate response to activity, gentle drift/fades, and bounded populations. Later increased emission to 2.25 per second with a shared cap of 24. | The requested idle song was subsequently removed. The shipped ambience is **fireflies only**, with no background music. Preview checks and limits appear in the [review](Assets/Verification/ValidationReview.md). |
| **Cross-phase validation and refinement** | Exercised the beginner journey, mistakes, narration failures, settings changes, score/progress preservation, effect cleanup, and repeated sessions. Added recovery controls, clearer feedback, separate note mute, and session exit/restart. | LEAF and visual evidence are revision-specific. These checks do not establish beginner usability or hardware acceptance. |

The phase names describe implementation milestones, not a claim that all hardware-dependent acceptance criteria have passed. The [design brief's phase history](devpost/design-brief.md#planning-foundation-and-implemented-phases) records the same progression and current scope.

The work progressed through spatial/visual refinement, beginner teaching and fallback interactions, Follow Along timing cues, idle ambience, and a full laptop validation review. Repeated preview inspection exposed issues such as speech-release deadlocks, settings discarding a performance, and unclear continuation controls. Small fixes were checked again, with screenshots and acceptance logs retained in the repository.

The creator directed the design, requested revisions, and reviewed the experience. Codex assisted with code, documentation, asset generation, and preview-driven testing. Automation results describe the tested software behavior; they are not human learning or comfort studies.

### Tools, MCPs, agents, and frameworks

| Tool or component | Role in this project |
| --- | --- |
| **Lens Studio** | Authoring, TypeScript compilation, scene construction, materials, preview, and SPECS-targeted Lens runtime. |
| **Codex** | Coding assistant for implementation, debugging, documentation, test orchestration, and reviewable Git commits. It is an authoring tool, not an in-Lens assistant. |
| **Devpost Learn / challengepost learn-specs** | Its `plan-lens` planning skill generated the initial brief in `devpost/design-brief.md`, helping define the Lens foundations before implementation. |
| **CLAD / ls-clad agent toolkit** | Lens-specific workflows and skills for spatial scene work, scripting, sound synthesis, preview inspection, and testing. |
| **Lens Studio MCP** | Connected the coding assistant to the editor for supported scene edits, compilation, preview control, runtime queries, screenshots, logs, and input injection. Lens Studio access used MCP tools rather than direct HTTP workarounds. |
| **AiPreviewAgent Inspect / Interact** | In-project runtime inspection and simulated interaction helpers used through the preview workflow. These are development helpers, not characters or an AI music teacher in the experience. |
| **LEAF** | Automated Lens integration scenarios covering navigation, notes, scoring, tutorial progression, recovery, effects, and repeated sessions. Recorded package version: 2.0.2. |
| **Spectacles Interaction Kit (SIK)** | Hand targeting, hover, pinch/poke interaction, and shared interaction events. Preview logs record SIK 0.18.0. |
| **Spectacles UIKit** | World-space buttons, panels, text, layout, and interaction feedback. |
| **HeyGen** | Audio generation in the project's content-production workflow, as credited by the creator. Exported audio is used as local media; there is no runtime HeyGen call. Per-clip HeyGen provenance is not catalogued in this repository. |
| **Windows SAPI / Microsoft Zira** | Repository-provided offline narration generation and regeneration. The latest transition clip, `offer.wav`, was regenerated with Zira after timed tutorial practice was removed. |
| **CLAD build-music / build-sfx** | Sample-free synthesis of the 17 pitched kalimba sounds and a soft count-in click. These are separate from spoken narration. |
| **Built-in image generation** | Generated the Devpost promotional thumbnail. The saved prompt accompanies the image; it does not represent captured Lens output. |
| **Git / Git LFS** | Version history, separate implementation/test/evidence commits, and storage of large media assets. |

No separate HeyGen MCP integration is required to run or build the Lens from its bundled assets. Do not infer that every WAV was generated by HeyGen: the project also retains local synthesis and speech-generation tools, and some narration was regenerated during iteration.

### Skills used in the development workflow

The CLAD skill set supported the following tasks. Skill names describe authoring workflows, not additional runtime dependencies or a claim that every available skill was used.

| Work | Relevant skills |
| --- | --- |
| Initial concept and design brief | `plan-lens` from [challengepost/learn-specs](https://github.com/challengepost/learn-specs); generated the project's initial `devpost/design-brief.md` |
| Project readiness and SPECS setup | `lens-studio-router`, `lens-studio-field-notes`, `specs-project-init` |
| Scripts and editor operations | `lens-api`, `editor-api`, `scene-construction` |
| Spatial UI and appearance | `specs-build-ui`, `camera-and-rendering`, `materials`, `font-selector` |
| Placement and input | `specs-world-query`, `specs-interaction-recipes` |
| Sound and narration playback | `build-music`, `build-sfx`, `specs-audio` |
| Diagnostics and live inspection | `lens-debug`, `specs-debug`, `lens-log-analysis`, `preview-inspection`, `specs-preview-interaction`, `verify-preview` |
| Automated checks | `specs-leaf-install-packages`, `specs-leaf-write-scenarios`, `specs-leaf-run-in-preview` |
| Promotional artwork | `imagegen` |

Meta's Unity **First Hand** sample informed the requested progressive teaching approach: demonstrate targeting, pinch, release, then practice. KaliSenses implements its interactions using Lens Studio/SIK; it does not run Unity or include First Hand as a runtime dependency.

### Main MCP operations used

- `ExecuteEditorCode` and `VirtualScene`: inspect/configure the editor scene and save the project.
- `RecompileTypeScriptTool` followed by `RunAndCollectLogsTool`: distinguish successful compilation from successful runtime startup.
- `PreviewPanelTool` and `QueryRuntimeSceneTool`: configure/capture the preview and inspect live state.
- `InjectPreviewGesture` and preview interaction helpers: deliver keyboard events and supported simulated interactions.
- LEAF preview execution tools and the opt-in scenario launcher: run functional checks without confusing a tool timeout with a test pass.

The development integrations required authorization and occasionally needed reconnection or compatibility fixes. [AiPreviewAgent recovery notes](Assets/Verification/AiPreviewAgentRecovery.md) record confirmed failures, recovery checks, and remaining limitations. A supported command returning success does not, by itself, prove physical hand recognition.

## Architecture and repository guide

| File or directory | Responsibility |
| --- | --- |
| [`kalisenses.esproj`](kalisenses.esproj), [`Assets/Scene.scene`](Assets/Scene.scene) | Lens project and authored scene. |
| [`KalisensesMain.ts`](Assets/Scripts/KalisensesMain.ts) | Modes, shared input/note path, audio voices, song scheduling, recovery, and narration lock. |
| [`KalisensesMusic.ts`](Assets/Scripts/KalisensesMusic.ts) | Established keyboard mapping, note identities, song arrangements, and scoring. |
| [`KalisensesInstrument.ts`](Assets/Scripts/KalisensesInstrument.ts) | Instrument geometry, note interaction, highlights, and fireflies. |
| [`KalisensesFollowCues.ts`](Assets/Scripts/KalisensesFollowCues.ts) | Pooled falling orbs and scheduled arrival pulses. |
| [`KalisensesPanelUI.ts`](Assets/Scripts/KalisensesPanelUI.ts) | World-space views, labels, controls, and Input/Next attention pulses. |
| [`KalisensesPlacement.ts`](Assets/Scripts/KalisensesPlacement.ts) | Surface placement, footprint checks, and preview fallback. |
| [`KalisensesTutorial.ts`](Assets/Scripts/KalisensesTutorial.ts), [`KalisensesGestureDemo.ts`](Assets/Scripts/KalisensesGestureDemo.ts) | Eight-lesson progression, retries/help, and visual pinch demonstration. |
| [`KalisensesNarration.ts`](Assets/Scripts/KalisensesNarration.ts), [`TutorialNarration/`](Assets/TutorialNarration) | Local voice clips, playback monitoring, and lock recovery. Fourteen clips are currently referenced; unused historical WAVs may remain. |
| [`KalisensesIdleAmbience.ts`](Assets/Scripts/KalisensesIdleAmbience.ts) | Menu-only idle timing and firefly spawning. |
| [`LeafIndex.ts`](Assets/Scripts/LeafIndex.ts), `Assets/Scripts/*Scenario.ts` | Registered automated scenarios and opt-in preview launcher. |
| [`Assets/Tools/`](Assets/Tools) | Audio-authoring scripts. |
| [`Assets/Verification/`](Assets/Verification) | Screenshots, reports, and machine-readable test evidence. |
| [`devpost/design-brief.md`](devpost/design-brief.md) | Detailed current design and validation boundaries. |
| [`Assets/Devpost/`](Assets/Devpost) | Generated cover and its prompt. |

The Lens uses local assets and Lens APIs; it has no browser DOM, runtime LLM, voice-command service, or online music-generation dependency. `Cache/` and `Support/` contain generated Lens Studio data and are not the place to author changes.

## Validation and reproducibility

**Latest tutorial evidence:** the current eight-lesson narrated `kalisenses-tutorial` LEAF run passed on **2026-11-07 at 20:50:51**, in **275.775 seconds**. It covered placement, silent input selection, held-note/release protection, all 42 untimed melody notes, direct completion, replay/mute, simulated SIK input switching, skip, and exit. [Logs](Assets/Verification/learn8-removal-checks.json) · [completion capture](Assets/Verification/learn8-completion.png). The capture includes the LEAF debug overlay.

Earlier validation covered all 17 injected keyboard mappings, shared input behavior, scoring boundaries, tempo-dependent cue arrival, pause/restart/song changes, firefly exclusion/lifetime/caps, and idle transitions. Recovery checks exercised retained score/progress, tracking-loss injection, audio failure handling, and blocked-input discard. A longer lifecycle check ran 23 rounds without growing scene/audio/watcher counts after UI warm-up. Two earlier real-time Amazing Grace journeys reached 33 correct notes with no incorrect or missed notes using simulated SIK delivery.

Those earlier results are scoped to their recorded revision. Tutorial titles and counts changed during refinement; older twelve-, eleven-, ten-, and nine-step captures are historical, not the current flow. The complete cross-mode Journey and hardware checks were not rerun for the final timed-lesson removal.

| Evidence label | What it means here |
| --- | --- |
| **Verified in laptop preview** | Specific automated assertions, injected events, live runtime state, and/or visually inspected captures support the documented behavior. |
| **Requires SPECS device testing** | Real surface sensing/anchor stability, hand-tracking reliability, reachable controls, two-hand comfort, see-through contrast, perceived audio latency, and on-device frame time/memory/thermal behavior. |
| **Not yet tested** | Beginner human learning, accessibility/usability study, and any behavior outside the recorded checks. |

Review the [completed validation checklist](Assets/Verification/ValidationReview.md) before treating a feature as accepted. Automated tests do not prove that a person finds the experience comfortable or easy to learn. The design brief also records an unresolved native preview-agent pinch timeout; passing simulated SIK tests does not erase that limitation.

**Known tutorial mouse limitation:** the first pinch exercise currently requires a right-hand contact, while the editor's mouse identifies itself as Mouse. A mouse click can therefore fail to advance this exercise even when it produces a note. An editor-only acceptance adjustment is pending; use Physical Keyboard or Virtual Keyboard for the laptop tutorial. This is distinct from the intentional narration lock and from the earlier preview-agent timeout.

### Running checks

1. Open the Lens Studio project, complete compilation, and select the laptop Interactive Preview.
2. Open the LEAF panel, choose **Preview** as the execution target, and select a registered scenario. Start with `kalisenses-tutorial-fallback`, `kalisenses-recovery`, or `kalisenses-tutorial`.
3. Some scenarios need an external keyboard driver. `kalisenses-journey`, `kalisenses-tutorial-keyboard`, and native-key tests emit driver prompts; simply launching them without a driver does not reproduce a complete pass.
4. Alternatively, set the **Kalisenses LEAF** component's `previewScenario` to the scenario ID. With `waitForDriver` enabled, reset and press **Q** once the driver is attached; with it disabled, the scenario starts after reset.
5. Read the final LEAF **PASSED/FAILED** result and associated runtime logs. A compile result, tool response, or timeout alone is not acceptance evidence.
6. Clear `previewScenario` afterward and save. Normal submission startup keeps automatic tests disabled.

### Asset setup and audio regeneration

Use Git LFS when cloning so WAVs and images resolve to media rather than pointer files. Existing packages and generated audio are sufficient for the normal demo; audio-generation tools are optional authoring helpers.

For the repository's offline Windows narration path:

```powershell
./Assets/Tools/GenerateTutorialNarration.ps1 -Clips offer
```

This uses installed SAPI voices, validates a temporary WAV, and writes the selected clip plus the caption manifest. It may need permission to access the Windows speech engine. Review caption/audio consistency after regeneration. It is a local fallback/regeneration path, not a HeyGen API client.

The sample-free note regenerator is [`gen_music_kalisenses.js`](Assets/Tools/gen_music_kalisenses.js). It currently contains machine-specific CLAD and output paths, including an older project directory. Adapt those paths before running it; it is not a portable one-command setup script. There is no need to regenerate working note assets to judge the Lens.

## Credits and asset notes

- Project creator: **Roberto González**; AI-assisted development and promotional-art assistance are disclosed above.
- Planning foundation: [Devpost Learn's learn-specs skill pack](https://github.com/challengepost/learn-specs), particularly `plan-lens`, used to generate the initial design brief in `devpost/`.
- Spoken-audio production: **HeyGen**, with the repository's **Windows SAPI/Microsoft Zira** regeneration path documented separately. File-level source attribution remains incomplete; the latest `offer.wav` regeneration is explicitly recorded.
- Instrument audio: original sample-free CLAD synthesis. Song data contains beginner reductions of traditional melodies, rather than commercial recordings or modern recorded arrangements.
- Tutorial melody: a C-major beginner arrangement of **Twinkle, Twinkle, Little Star**.
- **Jan Peerce's 1950 recording is not used.** The proposed idle song was removed; current idle ambience is visual only.
- Snap packages and Outfit retain their respective upstream terms. Repository code is provided under [MIT](LICENSE); that file does not replace third-party package, font, or service-output terms.

For the fullest design context, read the [design brief](devpost/design-brief.md), [current review](Assets/Verification/ValidationReview.md), and revision-specific logs alongside this README.

