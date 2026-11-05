---
status: approved
---

# Design brief: Kalisenses (default name)

## The one spatial moment
A beginner plays a recognizable virtual 17-key C-major kalimba without owning a physical instrument. In the laptop preview, the kalimba sits on a virtual tabletop, with readable keyboard labels, responsive notes and highlights, gentle fireflies, and an optional guided melody.

## Why it belongs on glasses
- Uses: draws in the world; the instrument occupies a tabletop at a meaningful physical scale.
- Intended glasses experience: play a stable, desk-anchored instrument with left and right index fingers, including simultaneous notes, without owning a kalimba.
- The laptop prototype proves musical interaction, presentation, and learning logic. The benefit of direct two-hand playing over a laptop remains to be validated on glasses; keyboard play is the deliberate demo input.

## Product or overlay
- Type: product; the virtual instrument is the experience.
- What the real version would sense: a tabletop for placement and both index fingertips for playing.
- Stand-in for the preview: an obvious virtual tabletop with the instrument already placed, and the computer keyboard instead of tracked fingers. No real surface recognition is required for this prototype.
- Target platform: Snap SPECS, using the existing Lens Studio project targeting `Spectacles`. Meta interaction guidance and Google Glass principles inform design; implementation uses Snap APIs.

## Where things live
- Main view: simulated seated player looking down toward the tabletop.
- Kalimba: approximately 35 cm wide and 25 cm deep, centered on the virtual tabletop in front of the player. Keep its world position stable when the preview camera moves.
- Camera: angled to show all 17 keys and their keyboard labels. Initial eye position approximately 65 cm above and 60 cm back from the instrument center, aimed at the center (default; adjust after visual inspection for readability).
- Tabletop: approximately 70 cm wide by 50 cm deep, 72 cm above the floor (default).
- Keyboard labels and note names: on or immediately beside their corresponding tines; readable from the initial seated view. Use light text and adequate contrast for an additive display.
- Menu, song cue, tempo controls, and results: just beyond the upper edge of the instrument, inside the same comfortable view (default). Avoid covering keys or their labels.
- Fireflies: gentle motion beside and above the instrument, outside the key and label area. Cap the population and fade old particles (default).

## Hands and input
- Laptop playing: use the exact physical key mapping below in both Free Play and Follow Along. Treat letters the same regardless of capitalization.
- Each released-to-pressed transition triggers one note and highlights its corresponding tine. Support simultaneous keys and overlapping audio voices. A held key must not retrigger until released and pressed again.
- Clear held-key state on mode changes, song restarts, and input focus loss where supported (default); verify focus behavior in preview.
- Menus: use large, labeled SIK/UIKit controls operable with the preview mouse. Musical acceptance checks use keyboard input. On-device index-finger menu interaction is a future validation item.
- Targets are big and highlight when aimed at. Use Meta's index-first and forgiving-target principles where compatible; do not force Meta menu spacing onto all 17 tines without checking reach and readability.
- Voice: none.
- Preview keyboard API: local `Support/StudioLib.d.ts` exposes `KeyboardManager.isKeyPressed`. Verify actual input delivery, polyphony, and release behavior during the build.
- Several music keys overlap preview navigation shortcuts. Establish and document a focused playing configuration that prevents camera movement while performing; do not alter the requested note mapping. Treat unresolved shortcut conflicts as a failed keyboard acceptance check.

| Keyboard key | Note |
|---|---|
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

### Instrument and sound
- Use all 17 diatonic notes from C4 through E6, tuned to C major, with recognizable alternating kalimba tine lengths and a beginner-friendly appearance.
- Intended standard layout, left to right from the player's view: D6, B5, G5, E5, C5, A4, F4, D4, C4, E4, G4, B4, D5, F5, A5, C6, E6. Verify the conventional layout before building.
- Keyboard labels in that same spatial order: R, A, S, D, F, X, C, V, B, N, M, L, H, J, K, U, I. L replaces comma by explicit approval.
- Use responsive kalimba-like plucked audio, accurately pitched to each note, with overlapping decays for chords. Source or synthesize sounds with documented rights (default). Do not substitute a single monophonic player that cuts off other notes.

## When things show
- Start: show a simple menu with exactly two main options, **Free Play** and **Follow Along**, plus a brief instruction explaining the keyboard labels (default).
- Free Play: show the instrument and a small return-to-menu control. Every played note produces audio, a clear tine highlight, and gentle fireflies. No prescribed song or score.
- Follow Along selection: show Amazing Grace, Silent Night, and Scarborough Fair, plus practice tempo controls and a return action (default).
- Use public-domain melodies and create original simple arrangements within C4–E6. Verify the chosen melody sources and record attribution; do not copy a copyrighted modern arrangement or recording. Keep song excerpts short and complete enough to recognize (default; choose lengths during build).
- Practice tempo: 40–80 BPM, starting at 60 BPM. Choose the tempo before starting; lock it during a performance (default) so timing and score remain predictable.
- Before each performance: four-beat count-in at the selected tempo. Show a visible beat pulse and count, with a gentle audio click (default). Do not score count-in input (default).
- During the song: mostly one note per beat. Highlight the next tine and show its note name, associated keyboard key, and an approaching timing cue.
- Feedback: distinguish correct, incorrect, and missed notes using color plus a brief word or symbol (default), so color alone is not required. Keep labels readable. Correct = green/check; incorrect = amber/cross; missed = muted violet/dash (default).
- Restart and Return to Menu remain available during Follow Along. Stop scheduled notes, sounds, and scoring when leaving or restarting (default).
- Completion: wait until the final target window closes, then show percentage score, correct notes, incorrect presses, missed notes, and encouraging feedback. Celebrate with a gentle firefly effect.
- Completion actions: Replay, Choose Another Song, and Free Play. Retries carry no penalties or previous score state.
- Hide inactive menus and finished feedback. No important task is intentionally placed out of view, so no directional arrow is required (default).

### Timing and scoring
- Correct note: matching key pressed within an inclusive ±400 ms of a target time; award 100 points.
- Incorrect press: a mapped note-key press that does not match any eligible unjudged target; award 0 points, record one incorrect press, and deduct nothing. A correct pitch outside its window is also unmatched (default).
- Missed note: no matching press by the time its window closes; award 0 points and record one miss. An incorrect press does not consume the target (default).
- Each target is judged once. Each press can satisfy at most one target. Ignore held-key automatic repeats.
- Overlap rule: select the nearest unjudged target of the same pitch whose window contains the press. Earlier targets win exact ties. This rule was accepted by the learner.
- Process simultaneous presses independently using the same clock. Resolve valid presses at a closing boundary before marking the target missed (default).
- Score = points earned / (100 × number of targets) × 100. Display rounded to the nearest whole percent (default), retaining exact totals internally.
- Show correct notes, incorrect presses, and missed notes separately. At completion, correct + missed must equal the target count. Extra incorrect presses do not lower earned points.
- Non-note keys are ignored for musical scoring (default). Input outside the active scoring period is not counted (default).
- At 60 BPM, targets one beat apart are 1,000 ms apart, leaving 200 ms between ±400 ms windows. At 80 BPM, 750 ms spacing makes adjacent windows overlap by 50 ms; use the rule above.
- These are initial prototype settings: slow, welcoming practice with challenge and a sense of progress.

## Done criteria
Each one can be checked in Lens Studio's preview. Musical checks must use keyboard input.
1. **Keyboard accuracy and responsiveness:** all 17 mappings play the correct notes and highlight the corresponding tines. Simultaneous presses work; held keys do not repeat. Release and repress works, capitalization does not change mapping, and playing does not move the camera.
2. **Clear presentation:** the entire 35 × 25 cm instrument is visible on its virtual tabletop from the seated view. All keyboard labels are readable. Song cues clearly identify which key to press and when. Moving the preview camera leaves the instrument fixed in the world.
3. **Beginner-friendly guidance:** each song begins with a four-beat count-in, defaults to 60 BPM, and can be restarted at a chosen tempo from 40–80 BPM. Simple arrangements and visible cues let a beginner follow the sequence.
4. **Reliable scoring:** correct, incorrect, and missed events follow the inclusive ±400 ms rule. Each target scores once; overlap matching uses nearest same-pitch target and earlier tie-break. Check boundary cases, repeated pitches, simultaneous input, and the final percentage against known input sequences. Results show all three counts separately.
5. **Enjoyable experience:** Free Play gives responsive audio and fireflies without obscuring keys. Each of the three songs completes with encouraging results and a firefly celebration. Replay, Choose Another Song, Free Play, Restart, and Return to Menu work and reset state appropriately.

## Out of scope
- This laptop prototype does not require real tabletop recognition, physical surface anchoring, or tracked two-index-finger input.
- No claims of validated on-device hand tracking, touch comfort, or audio latency.
- No multiplayer, persistent scores, voice input, camera recognition, or recording of surroundings.

## Risks and open questions
- Physical desk anchoring, stability on hardware, two-hand simultaneous playing, fingertip rearming after contact, and index-finger menu accessibility remain future device work: **feel unproven**.
- The 35 cm prototype is wider than many physical kalimbas to prioritize keyboard label readability. Whether 17 direct-touch targets can be comfortable at this size needs hardware testing.
- Preview focus/navigation conflicts and keyboard hardware rollover can limit actual chord input. Verify and document the supported setup; automated musical logic tests alone cannot prove physical keyboard delivery.
- Polyphonic timing logic can be tested, but perceived audio responsiveness and pitch accuracy also need listening checks.
- Melody source rights and the exact original beginner arrangements must be checked during implementation.
- Guidance references: Meta touch best practices, https://developers.meta.com/vr/design/touch_bp/ ; Google Glass principles, https://developers.google.com/glass/design/principles .
- The template's SIK/UIKit instruction below applies to menus and controls. The learner explicitly requires computer keyboard input for playing, so implement that input path alongside the controls. Do not replace musical keyboard acceptance tests with simulated pinches.
- Where LEAF cannot inject actual keyboard input, report that limitation and perform manual keyboard checks; shared-handler tests can verify scoring logic but must be labeled separately from keyboard delivery tests.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources

