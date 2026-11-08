import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep,findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {InteractorInputType,TargetingMode} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
import {app,button,until,waitForNarration,NarratedNoteInteractor} from "./KalisensesTestSupport";
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
    await button("Next");expect(t.step).toBe("placement");expect(a.narration.lastClip).toBe("placement");expect(a.ui.tutorialView.title).toBe("LEARN  2 / 8");
    await button("Next");expect(a.mode).toBe("placement");await button("Confirm Placement");expect(t.step).toBe("choose");
    await waitForNarration();const choosePlays=a.narration.plays;
    await button("Input");await button("Physical Keyboard");await button("Done");expect(t.step).toBe("choose");expect(a.narration.plays).toBe(choosePlays);expect(a.interactionsBlocked).toBe(false);
    const firstNarrations=a.narration.plays;await button("Next");
    expect(t.step).toBe("first");expect(a.instrument.highlighted).toBe(8);expect(a.ui.tutorialView.title).toBe("LEARN  4 / 8");expect(a.narration.plays-firstNarrations).toBe(1);
    const play=async(index:number)=>{
      await waitForNarration();
      const oldStep=t.step,oldIndex=t.index,before=a.plays;
      expect(a.noteDown("physical",index,"tutorial-fixture")).toBe(true);await sleep(60);
      expect(a.lastAudio.isPlaying()).toBe(true);expect(a.plays-before).toBe(1);
      a.noteUp("physical","tutorial-fixture");
      await until(()=>!t.waitingRelease&&(t.step!==oldStep||t.index!==oldIndex),2000);
    };
    // Repeated wrong notes remain harmless and do not skip a target.
    await waitForNarration();
    for(let i=0;i<3;i++){a.noteDown("physical",7,"wrong");a.noteUp("physical","wrong");await sleep(50);expect(t.step).toBe("first");expect(a.score).toBeNull();}
    const heldBefore=a.plays;a.noteDown("physical",8,"held-tutorial");await sleep(150);
    expect(t.step).toBe("first");expect(t.waitingRelease).toBe(true);expect(a.noteDown("physical",8,"held-tutorial")).toBe(false);
    await sleep(800);expect(a.plays-heldBefore).toBe(1);expect(t.step).toBe("first");await waitForNarration();a.noteUp("physical","held-tutorial");
    await until(()=>t.step==="sequence",1500);expect(a.ui.tutorialView.title).toBe("LEARN  5 / 8");
    for(const note of ["C4","D4","E4","C4"])await play(NOTES.indexOf(note));expect(t.step).toBe("melody");
    for(const note of TWINKLE_NOTES)await play(NOTES.indexOf(note));expect(t.step).toBe("offer");expect(a.score).toBeNull();
    await button("Next");expect(a.ui.tutorialView.title).toBe("LEARN  8 / 8");
    expect(t.step).toBe("complete");await button("Next");expect(a.mode).toBe("free");expect(t.active).toBe(false);expect(a.narration.audio.isPlaying()).toBe(false);
    a.action("menu");await button("Learn to Play");await button("Exit");expect(a.mode).toBe("menu");expect(t.active).toBe(false);
    await button("Learn to Play");await button("Skip");expect(a.mode).toBe("free");expect(t.active).toBe(false);

    // Real SIK adapters in preview, simulated interactor identity (not tracked hands).
    a.action("tutorial");await waitForNarration();a.action("tutorial:next");await waitForNarration();a.action("tutorial:next");a.action("confirm");await waitForNarration();a.action("tutorial:next");
    await button("Input");await button("Virtual Keyboard");await button("Done");expect(t.step).toBe("first");
    const driver=new NarratedNoteInteractor();await waitForNarration();await sleep(100);
    await driver.tapNote(findInteractablesByName("NotePad-C4",undefined,true)[0],TargetingMode.Poke);await until(()=>t.step==="sequence",30000);
    await button("Input");await button("Pinch Gesture");await button("Done");expect(t.step).toBe("sequence");expect(t.index).toBe(0);expect(a.ui.tutorialView.left).toBe(false);
    await waitForNarration();driver.inputType=InteractorInputType.LeftHand;await sleep(100);await driver.tapNote(findInteractablesByName("Tine-C4",undefined,true)[0],TargetingMode.Indirect);await until(()=>t.index===1,2000);
    // DefaultLeafInteractor is a controller double, not a HandInteractor. Restore
    // its identity before UIKit removes interaction planes during navigation.
    driver.inputType=InteractorInputType.CustomController;
    await button("Input");await button("Physical Keyboard");await button("Done");expect(t.step).toBe("sequence");expect(t.index).toBe(1);
    await button("Help");expect(t.helpCount>0).toBe(true);await button("Exit");expect(a.mode).toBe("menu");
    const panel=findSceneObjectByName("Panel-tutorial");expect(panel.enabled).toBe(false);
    print("[ACCEPTANCE] PASS tutorial audio/replay/mute, placement, retries/release, 42-note untimed melody and direct completion, SIK input switching, completion/skip/exit");
  }
}
