import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep,findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils";
import {app,button,until,waitForNarration,NarratedNoteInteractor} from "./KalisensesTestSupport";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {TargetingMode} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
import {SURFACE} from "./KalisensesTheme";
import {RoundedRectangleVisual} from "SpectaclesUIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangleVisual";
@component
export class KalisensesRecoveryScenario extends Scenario {
  async run():Promise<void> {
    const a=app(),overlay=findSceneObjectByName("LeafDebugUICamera");overlay.enabled=false;
    try {
      // Placement remains; input choice advances directly to first-note practice.
      a.narration.setMuted(true);a.action("tutorial");a.narration.setMuted(false);
      const speechBefore=a.narration.plays;a.action("tutorial:next");expect(a.tutorial.step).toBe("placement");
      expect(a.ui.tutorialView.title).toBe("LEARN  2 / 8");expect(a.ui.tutorialView.caption.includes("clear, level table")).toBe(true);
      expect(a.narration.lastClip).toBe("placement");expect(a.narration.plays-speechBefore).toBe(1);expect(a.interactionsBlocked).toBe(true);
      const nextVisual=(findSceneObjectByName("Next").getComponent(Button.getTypeName()) as Button).visual as RoundedRectangleVisual;
      const nextNormalType=nextVisual.baseType,nextNormalColorChange=nextVisual.shouldColorChange;
      expect(nextVisual.baseDefaultColor.x).toBeCloseTo(SURFACE.x,4);
      const checkNextPulse=async()=>{const samples:number[]=[];for(let i=0;i<10;i++){samples.push(nextVisual.baseColor.x);await sleep(160);}expect(Math.max(...samples)-Math.min(...samples)>.3).toBe(true);};
      await waitForNarration();await checkNextPulse();
      a.action("tutorial:replay");expect(a.interactionsBlocked).toBe(true);expect(nextVisual.baseType).toBe(nextNormalType);expect(nextVisual.shouldColorChange).toBe(nextNormalColorChange);
      await waitForNarration();await checkNextPulse();print("[NEXT PROMPT VISUAL] PLACEMENT");await sleep(3500);
      print("[TUTORIAL FLOW VISUAL] PLACEMENT");
      await button("Next");expect(a.mode).toBe("placement");await button("Confirm Placement");expect(a.tutorial.step).toBe("choose");expect(a.narration.lastClip).toBe("choose");
      const inputButton=findSceneObjectByName("Input").getComponent(Button.getTypeName()) as Button;
      const inputVisual=inputButton.visual as RoundedRectangleVisual,normalType=inputVisual.baseType,normalColorChange=inputVisual.shouldColorChange;
      expect(a.interactionsBlocked).toBe(true);expect(inputButton.visual.baseDefaultColor.x).toBeCloseTo(SURFACE.x,4);
      await waitForNarration();const choosePlays=a.narration.plays;
      expect(a.ui.tutorialView.promptInput).toBe(true);expect(a.ui.tutorialView.status.includes("Press Input")).toBe(true);
      expect(nextVisual.baseType).toBe(nextNormalType);expect(nextVisual.shouldColorChange).toBe(nextNormalColorChange);
      expect(inputVisual.baseType).toBe("Color");expect(inputVisual.shouldColorChange).toBe(false);
      const pulse:number[]=[];for(let i=0;i<10;i++){pulse.push(inputVisual.baseColor.x);await sleep(160);}
      expect(Math.max(...pulse)-Math.min(...pulse)>.3).toBe(true);
      print("[INPUT PROMPT VISUAL] PULSE");await sleep(3500);
      await button("Input");expect(a.narration.plays).toBe(choosePlays);expect(a.ui.tutorialView.promptInput).toBe(false);expect(inputButton.visual.baseDefaultColor.x).toBeCloseTo(SURFACE.x,4);
      for(const method of ["Physical Keyboard","Virtual Keyboard","Pinch Gesture","Physical Keyboard"]) {
        await button(method);expect(a.tutorial.step).toBe("choose");expect(a.narration.plays).toBe(choosePlays);
        expect(a.interactionsBlocked).toBe(false);expect(a.narration.audio.isPlaying()).toBe(false);
      }
      await button("Done");await sleep(300);expect(a.tutorial.step).toBe("choose");expect(a.narration.plays).toBe(choosePlays);
      expect(inputVisual.baseType).toBe(normalType);expect(inputVisual.shouldColorChange).toBe(normalColorChange);
      expect(a.ui.tutorialView.promptInput).toBe(false);expect(inputButton.visual.baseDefaultColor.x).toBeCloseTo(SURFACE.x,4);
      await checkNextPulse();print("[NEXT PROMPT VISUAL] AFTER_INPUT");await sleep(3500);
      print("[ACCEPTANCE] PASS Next pulses after speech and replay; Input has priority on Learn 3, then Next guides continuation after selection");
      print("[ACCEPTANCE] PASS Learn 3 Input prompt pulses after speech, remains readable, stops on opening Input, and stays stopped after selection");
      await button("Next");expect(a.tutorial.step).toBe("first");expect(a.ui.tutorialView.title).toBe("LEARN  4 / 8");expect(a.narration.lastClip).toBe("action-physical");expect(a.narration.plays-choosePlays).toBe(1);
      print("[TUTORIAL FLOW VISUAL] FIRST");
      await waitForNarration();expect(a.tutorial.step).toBe("first");
      expect(a.ui.tutorialView.next).toBe(false);expect(nextVisual.baseType).toBe(nextNormalType);expect(nextVisual.shouldColorChange).toBe(nextNormalColorChange);
      a.action("tutorial:exit");print("[ACCEPTANCE] PASS eight-step flow: placement retained, direct first-note practice with one action clip, Input and Next cues preserved");
      a.action("input:physical");a.action("free");const before=a.plays;
      expect(a.noteDown("physical",8,"chord-c")).toBe(true);expect(a.noteDown("physical",9,"chord-e")).toBe(true);
      expect(a.noteDown("physical",8,"chord-c")).toBe(false);a.noteUp("physical","chord-c");a.noteUp("physical","chord-e");await sleep(100);expect(a.plays-before).toBe(2);
      await button("Mute notes");expect(a.notesMuted).toBe(true);a.noteDown("physical",8,"muted");a.noteUp("physical","muted");await sleep(80);expect(a.lastAudio.volume).toBe(0);await button("Mute notes");expect(a.notesMuted).toBe(false);
      a.bpm=80;a.beginSong({name:"Recovery fixture",notes:["C4","E4","G4"],beats:[1,1,1]});
      const now=getTime()*1000;a.startMs=now-1;a.score.targets.forEach((t,i)=>t.time=now+200+i*1200);
      await until(()=>a.mode==="playing",1000);a.noteDown("physical",8,"earned");a.noteUp("physical","earned");await until(()=>a.score.correct===1,1000);
      const score=a.score;await button("Input");expect(a.mode).toBe("input");expect(a.score===score).toBe(true);await sleep(500);expect(score.missed).toBe(0);
      await button("Pinch Gesture");await button("Done");expect(a.mode).toBe("paused");expect(a.score.correct).toBe(1);a.action("pause");expect(a.mode).toBe("playing");
      a.observeTracking(false);expect(a.mode).toBe("paused");expect(a.recoveryMessage.includes("Hands unavailable")).toBe(true);await sleep(650);expect(score.missed).toBe(0);
      print("[VALIDATION VISUAL] RECOVERY");await sleep(2500);
      await button("Input");await button("Physical Keyboard");await button("Done");expect(a.mode).toBe("paused");expect(a.score===score).toBe(true);expect(score.correct).toBe(1);
      const scale=a.placement.anchor.getTransform().getLocalScale().x;
      await button("Placement");expect(a.mode).toBe("placement");await button("Larger");expect(a.placement.anchor.getTransform().getLocalScale().x).toBeCloseTo(Math.min(1.2,scale+.1),3);
      print("[VALIDATION VISUAL] PLACEMENT");await sleep(2500);await button("Smaller");await button("Return to Menu");expect(a.mode).toBe("paused");expect(a.score===score).toBe(true);expect(score.missed).toBe(0);
      await button("Pause");expect(a.mode).toBe("playing");await button("Restart");expect(a.mode).toBe("countin");expect(a.score.correct).toBe(0);expect(a.instrument.followCues.samples.length).toBe(0);
      a.action("menu");await button("End session");expect(a.mode).toBe("ended");expect(a.instrument.sceneObject.enabled).toBe(false);expect(a.instrument.fireflyCount).toBe(0);
      expect((a.sceneObject.getComponents("Component.AudioComponent") as AudioComponent[]).every(v=>!v.audioTrack||!v.isPlaying())).toBe(true);
      print("[VALIDATION VISUAL] ENDED");await sleep(2000);await button("Start again");expect(a.mode).toBe("menu");expect(a.instrument.sceneObject.enabled).toBe(true);
      // Inject speech while a virtual contact is held to test release recovery independently of lessons.
      a.narration.setMuted(true);a.action("tutorial");a.action("tutorial:next");a.action("tutorial:next");a.action("confirm");a.action("tutorial:next");a.action("input:virtual");
      expect(a.tutorial.step).toBe("first");a.narration.setMuted(false);const notes=a.plays;
      await sleep(150); // Allow the selected input's controls to become playable.
      const tap=new NarratedNoteInteractor().tapNote(findInteractablesByName("NotePad-C4",undefined,true)[0],TargetingMode.Poke);
      await until(()=>a.tutorial.waitingRelease,1000);expect(a.tutorial.step).toBe("first");a.narration.play("sequence");await tap;expect(a.interactionsBlocked).toBe(true);expect(a.lastAudio.volume).toBeCloseTo(a.volume*.25,3);
      expect(a.noteDown("virtual",9,"blocked-poke")).toBe(false);a.noteUp("virtual","blocked-poke");
      print("[VALIDATION VISUAL] RELEASE");await until(()=>a.tutorial.step==="sequence",15000);expect(a.plays-notes).toBe(1);
      expect(a.ui.tutorialView.title).toBe("LEARN  5 / 8");expect(a.tutorial.index).toBe(0);expect(a.narration.lastClip).toBe("sequence");expect(a.ui.tutorialView.next).toBe(false);
      print("[TUTORIAL FLOW VISUAL] SEQUENCE");await sleep(2500);
      a.narration.stop();a.action("tutorial:exit");a.action("input:physical");a.action("menu");
      print("[ACCEPTANCE] PASS recovery: chord/hold, note mute, retained settings/score, injected tracking pause, bounded scale, session end and virtual release during speech");
    } finally {a.narration.stop();if(a.tutorial.active)a.tutorial.stop(false);a.notesMuted=false;a.ui.setNotesMuted(false);a.action("menu");overlay.enabled=true;}
  }
}
