import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep,findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils";
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {InteractorInputType,TargetingMode} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
import {app,button,until} from "./KalisensesTestSupport";
import {NOTES} from "./KalisensesMusic";
import {TWINKLE_NOTES} from "./KalisensesTutorial";

@component
export class KalisensesTutorialScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("menu");await button("Learn to Play");const t=a.tutorial;
    expect(t.step).toBe("intro");expect(a.narration.audio.isPlaying()).toBe(true);
    const narrations=a.narration.plays;await button("Replay");expect(a.narration.plays).toBe(narrations+1);
    await button("Mute");expect(a.narration.muted).toBe(true);expect(a.narration.audio.isPlaying()).toBe(false);
    await button("Replay");expect(a.narration.plays).toBe(narrations+1);await button("Mute");expect(a.narration.muted).toBe(false);
    await button("Next");expect(t.step).toBe("placement");await button("Next");expect(a.mode).toBe("placement");
    await button("Confirm Placement");expect(t.step).toBe("choose");expect(a.mode).toBe("tutorial");
    await button("Input");await button("Physical Keyboard");await button("Done");expect(t.step).toBe("choose");
    await button("Next");expect(t.step).toBe("demo");expect(a.ui.tutorialView.caption.includes("letter")).toBe(true);await button("Next");
    expect(t.step).toBe("first");expect(a.instrument.highlighted).toBe(8);
    const play=async(index:number)=>{
      await until(()=>!a.interactionsBlocked,30000);
      const oldStep=t.step,oldIndex=t.index,before=a.plays;
      expect(a.noteDown("physical",index,"tutorial-fixture")).toBe(true);await sleep(60);
      expect(a.lastAudio.isPlaying()).toBe(true);expect(a.plays-before).toBe(1);
      a.noteUp("physical","tutorial-fixture");
      await until(()=>!t.waitingRelease&&(t.step!==oldStep||t.index!==oldIndex),2000);
    };
    // Repeated wrong notes remain harmless and do not skip a target.
    await until(()=>!a.interactionsBlocked,30000);
    for(let i=0;i<3;i++){a.noteDown("physical",7,"wrong");a.noteUp("physical","wrong");await sleep(50);expect(t.step).toBe("first");expect(a.score).toBeNull();}
    const heldBefore=a.plays;a.noteDown("physical",8,"held-tutorial");await sleep(150);
    expect(t.step).toBe("release");expect(t.waitingRelease).toBe(true);expect(a.noteDown("physical",8,"held-tutorial")).toBe(false);
    await sleep(800);expect(a.plays-heldBefore).toBe(1);expect(t.step).toBe("release");await until(()=>!a.interactionsBlocked,30000);a.noteUp("physical","held-tutorial");
    await until(()=>t.step==="other",1500);await play(8);expect(t.step).toBe("sequence");
    for(const note of ["C4","D4","E4","C4"])await play(NOTES.indexOf(note));expect(t.step).toBe("melody");
    for(const note of TWINKLE_NOTES)await play(NOTES.indexOf(note));expect(t.step).toBe("offer");expect(a.score).toBeNull();
    await button("Next");expect(t.step).toBe("timed");expect(a.bpm).toBe(60);
    a.noteDown("physical",8,"early");a.noteUp("physical","early");await sleep(150);expect(t.index).toBe(0);expect(t.waitingRelease).toBe(false);
    // Accelerate only the scheduling fixture; production waits indefinitely for late players.
    for(const note of TWINKLE_NOTES){t.timedDue=getTime()-1;await play(NOTES.indexOf(note));expect(a.score).toBeNull();}
    expect(t.step).toBe("complete");await button("Next");expect(a.mode).toBe("free");expect(t.active).toBe(false);expect(a.narration.audio.isPlaying()).toBe(false);
    a.action("menu");await button("Learn to Play");await button("Exit");expect(a.mode).toBe("menu");expect(t.active).toBe(false);
    await button("Learn to Play");await button("Skip");expect(a.mode).toBe("free");expect(t.active).toBe(false);

    // Real SIK adapters in preview, simulated interactor identity (not tracked hands).
    a.action("tutorial");await until(()=>!a.interactionsBlocked,30000);a.action("tutorial:next");await until(()=>!a.interactionsBlocked,30000);a.action("tutorial:next");a.action("confirm");await until(()=>!a.interactionsBlocked,30000);a.action("tutorial:next");await until(()=>!a.interactionsBlocked,30000);a.action("tutorial:next");
    await button("Input");await button("Virtual Keyboard");await button("Done");expect(t.step).toBe("first");
    const driver=new DefaultLeafInteractor();await until(()=>!a.interactionsBlocked,30000);await sleep(100);
    await driver.trigger(findInteractablesByName("NotePad-C4",undefined,true)[0],{targetingMode:TargetingMode.Poke});await until(()=>t.step==="other",30000);
    await button("Input");await button("Pinch Gesture");await button("Done");expect(t.step).toBe("other");expect(a.ui.tutorialView.demo).toBe(true);expect(a.ui.tutorialView.left).toBe(true);
    await until(()=>!a.interactionsBlocked,30000);driver.inputType=InteractorInputType.LeftHand;await sleep(100);await driver.trigger(findInteractablesByName("Tine-C4",undefined,true)[0],{targetingMode:TargetingMode.Indirect});await until(()=>t.step==="sequence",2000);
    // DefaultLeafInteractor is a controller double, not a HandInteractor. Restore
    // its identity before UIKit removes interaction planes during navigation.
    driver.inputType=InteractorInputType.CustomController;
    await button("Input");await button("Physical Keyboard");await button("Done");expect(t.step).toBe("sequence");expect(t.index).toBe(0);
    await button("Help");expect(t.helpCount>0).toBe(true);await button("Exit");expect(a.mode).toBe("menu");
    const panel=findSceneObjectByName("Panel-tutorial");expect(panel.enabled).toBe(false);
    print("[ACCEPTANCE] PASS tutorial audio/replay/mute, placement, retries/release, 42-note untimed and accelerated timed melody, SIK input switching, completion/skip/exit");
  }
}
