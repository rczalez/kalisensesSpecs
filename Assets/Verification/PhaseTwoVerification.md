# Phase Two — guided tutorial and fallback interactions

Implemented for the existing Specs Lens and verified in the laptop preview. Actual hand recognition, sensor reliability, reach and additive-display contrast remain device-validation tasks.

## Experience

Choose **Learn to Play** in the main menu, or press **Space** in the laptop preview. The tutorial introduces placement and input choice, demonstrates targeting/pinch/release, waits for a first C4, teaches release, invites the other hand, then progresses through C4–D4–E4–C4 and a 42-note C-major arrangement of **Twinkle, Twinkle, Little Star**. Every melody note is available on the existing 17-key instrument.

Untimed practice waits indefinitely for the correct note. Wrong notes still make their normal sound and visual response, but do not move the tutorial forward. Correct notes advance only after release. Pinch practice asks for the right hand first and then the left; keyboard/pad practice invites the other hand without making hand identity a requirement.

After the untimed melody, the user can choose optional pulse practice or skip to Free Play. Pulse practice uses the existing selected beginner tempo (60 BPM by default, existing range 40–80), four lead-in beats, the existing count-click audio and a 400 ms early tolerance. Early notes can be retried; late notes remain available indefinitely. This deliberately forgiving practice never creates a PerformanceScore or missed/incorrect penalties. It does not change the scored Follow Along mode or the original songs.

The rear tabletop dock provides short captions, a next-note cue, Replay, Mute/Unmute, Help, Input, Skip and Exit. A small animated schematic demonstrates open fingers, thumb/index contact and release, mirrored for the other hand. The preview explicitly labels it **SIMULATED DEMO**. This is instructional animation, not a tracked hand or a recognition result.

Sixteen offline narration WAVs accompany the instructions. Only one narration voice plays at once. As updated November 6, all Lens input and menu controls are disabled while a clip plays; Replay and Mute are available between clips. Captions and the demonstration remain visible. Inputs received while locked are discarded, with held contacts requiring release before reuse. Completion, interruption and playback failure release the lock. See [the narration-lock check](NarrationLockVerification.md). The local prototype voice is Microsoft Zira Desktop; the text and regeneration script are included under Assets. No runtime speech/network service is required.

## Recovery and input continuity

All tutorial inputs pass through the existing shared note queue, audio, highlights and fireflies. The established keyboard mapping is unchanged, including L for B4; this phase does not add unsupported punctuation-key handling or remap Lens Studio's built-in WASD preview navigation.

Input can change through the existing Input Method menu without resetting the tutorial stage or melody index. Text, key cues and gesture demonstrations update for the selected method. A quiet-time reminder repeats instruction and enlarges the pinch demonstration after inactivity, with a cooldown. Key attempts, changing hover targets and held pinch attempts suppress automatic reminders. Help can always be requested explicitly.

On device, the tutorial checks SIK hand availability and accumulated tracking loss. Sustained missing/unstable tracking produces a brief message and narration offering another input, once per input selection. Recovery clears the tracking notice. This policy was tested with injected sensor states; actual detection quality has not been tested. Virtual Keyboard still requires a tracked index finger on Specs, and Physical Keyboard is intended for laptop testing; fallback availability must be evaluated on the intended device setup.

Laptop controls (none replaces a note key):

| Key | Tutorial action |
| --- | --- |
| Space | Open from main menu; Next; confirm placement; return from Input |
| 0 | Replay narration |
| 1 | Mute/unmute narration |
| 2 | Cycle Physical Keyboard → Virtual Keyboard → Pinch Gesture |
| 3 | Skip to Free Play (placement is still required on device) |
| 4 | Exit to main menu |
| 5 | Help/repeat with clearer demonstration |
| 6 | Find Surface while the placement view is open |

On laptop the virtual tabletop is ready. The tutorial still walks through the placement view. On Specs, the existing surface-finding/confirmation flow remains required before playing.

## Reference and adaptation

[Meta's Unity First Hand sample](https://github.com/oculus-samples/Unity-FirstHand) and [Meta's interaction guidance](https://developers.meta.com/vr/blog/interaction-sdk-building-intuitive-vr-experiences-tools-resources/) informed the progression from a small interaction task to a longer activity, visible target feedback, and explicit release practice. These are design adaptations implemented with Specs SIK/UIKit, not a Unity port. No Meta code or assets were imported, and Unity APIs are not used.

## Verification scope

New LEAF scenarios cover the complete UI/note flow, deterministic fallback policy, and an externally driven keyboard-only tutorial. They run through the existing opt-in LeafIndex startup runner using Lens Studio MCP, with Lens-side PASSED logs as evidence. Normal startup has previewScenario cleared afterward. The LEAF panel's scenario list was stale during this session (eleven listed versus fourteen registered at startup); it was not treated as proof that the new scenarios were absent.

The full UI scenario exercises narration playback/replay/mute, placement confirmation, retries, a held contact, both complete melody modes (timed scheduling accelerated in the test), SIK virtual/pinch adapters, progress-preserving input changes, completion, restart, skip and exit. The keyboard scenario uses actual preview-delivered key events for navigation and all untimed notes, rather than calling the tutorial's progression methods. The fallback scenario injects hand-availability states and simulated hand identity; it does not measure hand tracking.

Two release bugs were found and fixed during verification: deactivating a pad before lift prevented its release event, and repeated keyboard-up polling kept restarting the release dwell. The final implementation keeps the target active through release and latches the first release edge. A test-double identity issue also required restoring DefaultLeafInteractor to controller identity before UIKit navigation; it is not counted as a real hand-tracking finding. Interrupted runs are excluded from the final pass count.

See [timestamped check evidence](phase-two-checks.json) and [WAV validation](phase-two-narration-checks.json). WAV checks found sixteen non-silent 22,050 Hz PCM clips, 6.53–14.87 seconds long. Playback-state assertions verify that Lens audio starts/stops; they do not establish perceived clarity or a listening-quality result.

## Remaining device and human validation

- Test real right/left pinch targeting, release away from a tine, tracking loss during a held gesture, and switching inputs while held. The schematic and simulated SIK events do not establish recognition accuracy.
- Test surface sensing, permissions, physical placement, reach and sustained comfort on Specs. The earlier reach simulation remained inconclusive; it is not a hardware pass.
- Assess captions, controls, outlines and the enlarged demonstration against bright/busy real surroundings. Dark backings remain translucent on additive displays.
- Listen through every narration clip and a real-time melody session. Check pronunciation, mixing with notes/metronome, perceived latency and user comprehension. Adjust voice/volume after review if needed.
- Validate the availability of fallback inputs on the actual device setup. A virtual poke keyboard cannot solve a complete loss of hand tracking by itself.
- Lens Studio still owns its built-in Interactive Preview WASD navigation. Keyboard-only tutorial verification uses the supported injected-key path; physical keyboard focus/rollover and background-navigation conflicts remain manual laptop checks.

No hardware success is claimed. No additional package installation or account/network permission was needed. Generating the offline voice assets required sandbox approval to access the installed Windows speech engine; generation succeeded.
