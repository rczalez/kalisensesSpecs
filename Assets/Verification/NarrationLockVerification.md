# Narration interaction lock — November 6, 2026

Every clip played by the TutorialNarration controller now locks Lens input until playback ends. The lock covers physical note/tutorial keys, virtual note pads, pinch/poke note input, input selection, placement actions and every menu control, including Replay, Mute, Skip and Exit. Captions and the animated demonstration remain visible, with a Listening message.

Notes and menu actions are discarded during playback. Pending notes are cleared when a clip starts, and callbacks guard against additional notes in the same frame. Held keyboard and pointer contacts require release before reuse; menu activation requires a fresh press as well as release. No blocked note or menu action is saved for later. Tutorial progression, quiet-time reminders and practice timing pause during narration.

The controller monitors the audio finish callback and playback state. Explicit stop, external stop, pause or an exception restore controls. A failed start is canceled after a short startup allowance; a stalled clip is stopped after its expected duration plus a safety margin. Stale finish callbacks cannot unlock a replacement clip while it is playing. Missing or muted clips do not leave the Lens locked. Disable/destroy cleanup stops narration.

## Checks

- TypeScript compiled successfully and the preview started without Lens runtime errors.
- LEAF `kalisenses-narration-lock` passed at **17:03:41.052** on November 6. It checked blocked note/action paths and disabled menu/pad interactables, natural completion, held L/Space delivery across playback, fresh release/repress, menu restoration, explicit/external stop and pause, and a short tutorial note tap whose release occurred during narration.
- Failure doubles covered a thrown playback error, a clip that never starts, a stale finish callback, a stalled clip, and muted/missing clips. These are deterministic failure-policy checks, not a claim that a real audio asset was corrupted.
- The tutorial quick-tap check reached the next hand-practice step after narration, with exactly one note played.

The final extended test was confirmed against the current source after reloading the saved project: earlier runs used a stale Lens Studio compiler source copy and did not include that additional check. Generated Cache files were not edited.

See [timestamped evidence](narration-lock-checks.json). The existing shared-input regression is recorded there separately. Earlier tutorial tests were updated to wait for narration before requesting input; the full longer tutorial suite has not been rerun under this new input policy.

## Scope

The lock controls this Lens's runtime interactions. It cannot disable Lens Studio's own built-in preview-navigation shortcuts or device/system controls. Actual hand tracking and hardware comfort remain unvalidated. The earlier native simulated pinch timeout remains a separate unresolved finding; this change does not claim to repair it.
