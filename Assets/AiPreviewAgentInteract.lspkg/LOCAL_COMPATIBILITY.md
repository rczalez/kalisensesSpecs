# Local compatibility repairs

This unpacked helper is adapted for this project's Lens Studio 5.23.2,
SpectaclesInteractionKit (runtime version 0.18.0), SpectaclesUIKit and LEAF 2.0.2.
The companion AiPreviewAgentInspect is also an unpacked project asset.

- Imports use SpectaclesInteractionKit and SpectaclesUIKit. The old IK entry
  point is mapped to the installed SIK entry point; the project packages are
  not renamed or upgraded.
- Obstruction checks skip registered InteractionPlane sensor colliders,
  then continue checking actual obstructions along the ray.
- The preview puppet initializes and detaches the hand rig using the same
  initial transforms as the installed LEAF implementation.
- Invisible puppet hands keep their wrist and proximity sensor hierarchy
  active. Only mesh renderers are hidden. In this SIK version, setting the
  whole hand visual invisible disables the wrist and its sensors.
- Injected pinch state is shared by polling and down/up/cancel events.
- Targeted pinch aligns the finger to the target surface and corrects
  fingertip placement after the joint pose settles.
- After trigger-end, the puppet parks immediately before uncurling. This
  prevents its release animation from poking a newly opened view.

The entry point remains editor-only. These repairs validate preview tooling,
not real hand tracking on Specs. An upstream replacement may overwrite these
adaptations; rerun the recovery checks before replacing this unpacked helper.
The shipped dependency manifest still describes the upstream package; this
local adaptation has not been repackaged or published to the Asset Library.

See ../Verification/AiPreviewAgentRecovery.md for checks and evidence.
