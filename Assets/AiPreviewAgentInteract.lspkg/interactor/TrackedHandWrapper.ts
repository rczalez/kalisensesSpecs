import {UpdateDispatcher} from "Leaf.lspkg/Utils/common/UpdateDispatcher"
import {HandMeshType} from "SpectaclesInteractionKit.lspkg/Components/Interaction/HandVisual/HandVisual"
import {PinchEventType} from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/GestureProvider/PinchEventType"
import {HandType} from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/HandType"
import {Keypoint} from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/Keypoint"
import TrackedHand from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/TrackedHand"
import {Hand} from "./Hand"
import {INITIAL_HAND_WORLD_TRANSFORMS} from "Leaf.lspkg/Interactors/interactor/handInput/handMesh/HandInitialization"
import {setSceneObjectHierarchyTransform} from "Leaf.lspkg/Utils/common/Serialize"
import SIKEvent from "SpectaclesInteractionKit.lspkg/Utils/Event"

const DEBUG_SHOW_HAND_MODEL = false

/** Start SIK 3's lazy hand-rig load (idempotent); its bones are the puppet's only tracking-free keypoint source. */
export function requestHandRig(trackedHand: TrackedHand): void {
  const visuals = trackedHand.getHandVisuals()
  if (visuals && visuals.meshType !== HandMeshType.Full) {
    visuals.meshType = HandMeshType.Full
  }
}

type PinchDetectorInternals = {
  pinchStrength: number
  pinchDetectorStateMachine: {
    notifyPinchEvent(eventType: PinchEventType): void
    isPinching(): boolean
  }
}

type TrackedHandPrivate = {
  pinchDetector: PinchDetectorInternals
}

/**
 * Programmatic control of an IK TrackedHand for AI preview interaction, driven without hand-tracking data.
 * Pinch events and strength flow through IK's PinchDetector; geometry comes from the lazily-loaded hand rig.
 */
export class TrackedHandWrapper {
  readonly hand: Hand

  private originalIsTracked: () => boolean
  private originalSetEnabled: (enabled: boolean) => void
  private originalIsPinching: () => boolean
  private originalGetPinchStrength: () => number | null
  private injectedPinch = false
  private originalIsVisible: boolean = true
  private trackingOwner: SceneObject | null = null
  private trackingComponent: ObjectTracking3D | null = null
  private originalTrackingEnabled = false
  private originalFullMeshEnabled = true
  private originalIndexMeshEnabled = true
  private handVisualsRef: ReturnType<TrackedHand["getHandVisuals"]> = null
  private updateUnsubscribe: () => void = () => {}
  private hpriv: TrackedHandPrivate

  constructor(trackedHand: TrackedHand, handType: HandType) {
    this.originalIsTracked = trackedHand.isTracked.bind(trackedHand)
    this.originalSetEnabled = trackedHand.setEnabled.bind(trackedHand)
    this.originalIsPinching = trackedHand.isPinching.bind(trackedHand)
    this.originalGetPinchStrength = trackedHand.getPinchStrength.bind(trackedHand)

    const keypoints = (trackedHand as unknown as {keypoints: Map<string, Keypoint>}).keypoints

    // Rig accessors return undefined until the async load lands; throw the retryable
    // error InteractionHandler.getInteractor already retries against.
    requestHandRig(trackedHand)
    const handVisuals = trackedHand.getHandVisuals()
    const handVisualsRoot = handVisuals?.root
    if (!handVisuals || !handVisualsRoot) {
      throw new Error(
        `IK ${handType} hand rig not loaded yet (HandVisuals.root is undefined) — retry on next frame.`
      )
    }
    this.handVisualsRef = handVisuals

    // SIK 0.18 needs the same tracking-free rig initialization as LEAF.
    // Otherwise tracking keeps ownership of the joints and the puppet can
    // report success moving its root while its targeting keypoints stay stale.
    const owner = handVisualsRoot.getParent()
    const tracker = owner?.getComponent("Component.ObjectTracking3D") as ObjectTracking3D | null
    if (tracker) {
      this.trackingOwner = owner
      this.trackingComponent = tracker
      this.originalTrackingEnabled = tracker.enabled
      tracker.enabled = false
      trackedHand.objectTracking3D.onTrackingLost()
      setSceneObjectHierarchyTransform(owner, INITIAL_HAND_WORLD_TRANSFORMS[handType])
      handVisualsRoot.setParent(owner.getParent())
    }

    this.hand = new Hand(keypoints, handType, handVisualsRoot)

    this.originalIsVisible = handVisuals.isVisible
    this.originalFullMeshEnabled = handVisuals.handMeshFull?.enabled ?? true
    this.originalIndexMeshEnabled = handVisuals.handMeshIndexThumb?.enabled ?? true
    // isVisible=false disables the wrist hierarchy in SIK 0.18, including
    // the fingertip proximity sensor. Hide renderers, not the sensing rig.
    handVisuals.isVisible = true

    // Report tracked+enabled so PhysicalInteractionProvider keeps the hand available and PinchDetector reports fed strength.
    trackedHand.isTracked = () => true
    // Native ML has no camera hand in a laptop preview. Keep polling and
    // injected down/up events on the same explicit preview contact state.
    trackedHand.isPinching = () => this.injectedPinch
    trackedHand.getPinchStrength = () => this.injectedPinch ? 1 : 0
    trackedHand.setEnabled = () => {}
    ;(trackedHand as unknown as {_enabled: boolean})._enabled = true
    ;(trackedHand.onHandFound as unknown as SIKEvent).invoke()

    this.hpriv = trackedHand as unknown as TrackedHandPrivate

    // Per frame: feed pinch strength into PinchDetector and re-hide the rig mesh (HandVisual re-shows it on enable).
    const visuals = this.handVisualsRef
    const handRef = this.hand
    const pdRef = this.hpriv.pinchDetector
    this.updateUnsubscribe = UpdateDispatcher.getInstance().onUpdate.add(() => {
      pdRef.pinchStrength = handRef.getPinchStrength()
      if (!DEBUG_SHOW_HAND_MODEL) {
        visuals.isVisible = true
        if(visuals.handMeshFull)visuals.handMeshFull.enabled=false
        if(visuals.handMeshIndexThumb)visuals.handMeshIndexThumb.enabled=false
      }
    })
  }

  firePinchDown(): void {
    this.injectedPinch = true
    this.hpriv.pinchDetector.pinchDetectorStateMachine.notifyPinchEvent(PinchEventType.Down)
  }

  firePinchUp(): void {
    this.injectedPinch = false
    this.hpriv.pinchDetector.pinchDetectorStateMachine.notifyPinchEvent(PinchEventType.Up)
  }

  firePinchCancel(): void {
    this.injectedPinch = false
    this.hpriv.pinchDetector.pinchDetectorStateMachine.notifyPinchEvent(PinchEventType.Cancel)
  }

  destroy(trackedHand: TrackedHand): void {
    this.firePinchCancel()
    this.hpriv.pinchDetector.pinchStrength = 0

    this.updateUnsubscribe()
    if (this.handVisualsRef) {
      this.handVisualsRef.isVisible = this.originalIsVisible
      if(this.handVisualsRef.handMeshFull)this.handVisualsRef.handMeshFull.enabled=this.originalFullMeshEnabled
      if(this.handVisualsRef.handMeshIndexThumb)this.handVisualsRef.handMeshIndexThumb.enabled=this.originalIndexMeshEnabled
    }
    trackedHand.isTracked = this.originalIsTracked
    trackedHand.setEnabled = this.originalSetEnabled
    trackedHand.isPinching = this.originalIsPinching
    trackedHand.getPinchStrength = this.originalGetPinchStrength
    if (this.trackingOwner && this.trackingComponent && this.handVisualsRef?.root) {
      this.handVisualsRef.root.setParent(this.trackingOwner)
      this.trackingComponent.enabled = this.originalTrackingEnabled
    }
    this.hand.hide(0)
  }
}
