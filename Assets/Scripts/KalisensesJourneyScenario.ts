import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep,findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils";
import {app,button,until} from "./KalisensesTestSupport";
import {LETTERS} from "./KalisensesMusic";
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {TargetingMode} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
@component
export class KalisensesJourneyScenario extends Scenario {
  async run():Promise<void> {
    const a=app(),overlay=findSceneObjectByName("LeafDebugUICamera");overlay.enabled=false;let token=0;
    const key=async(k:string,done:()=>boolean)=>{await until(()=>!a.interactionsBlocked,30000);print("[JOURNEY DRIVER] "+(++token)+" "+k);await until(done,120000);};
    try {
      a.action("input:physical");a.action("menu");a.notesMuted=false;a.ui.setNotesMuted(false);a.bpm=60;
      print("[JOURNEY VISUAL] WELCOME");await sleep(1500);
      await key("Space",()=>a.mode==="tutorial");expect(a.narration.audio.isPlaying()).toBe(true);
      await key("1",()=>a.tutorial.muted); // Listen to intro, then use captions for the complete keyboard walk.
      const t=a.tutorial;
      await key("Space",()=>t.step==="placement");expect(a.ui.tutorialView.title).toBe("LEARN  2 / 8");await key("Space",()=>a.mode==="placement");await key("Space",()=>t.step==="choose");
      await key("2",()=>a.inputMethod==="virtual");await key("2",()=>a.inputMethod==="pinch");await key("2",()=>a.inputMethod==="physical");expect(t.step).toBe("choose");
      await key("Space",()=>t.step==="first");expect(a.ui.tutorialView.title).toBe("LEARN  4 / 8");
      print("[JOURNEY VISUAL] FIRST");await sleep(1500);
      while(t.step!=="offer") {
        const step=t.step,index=t.index,n=a.plays,target=t.targetIndex();
        await key(LETTERS[target],()=>a.plays>n);expect(a.plays-n).toBe(1);expect(a.lastIndex).toBe(target);expect(a.lastAudio.isPlaying()).toBe(true);
        await until(()=>!t.waitingRelease&&(t.step!==step||t.index!==index),2000);expect(a.score).toBeNull();
      }
      print("[JOURNEY VISUAL] MELODY DONE");await sleep(1500);await key("3",()=>a.mode==="free");
      await button("Return to Menu");await button("Follow Along");await button("Faster +10");await button("Faster +10");expect(a.bpm).toBe(80);
      await button("Amazing Grace");await button("Input");await button("Virtual Keyboard");await button("Done");await button("Pause");print("[JOURNEY VISUAL] FOLLOW");const performance=a.score,driver=new DefaultLeafInteractor();
      for(let i=0;i<performance.targets.length;i++) {
        // Lens-local SIK delivery avoids attributing MCP keyboard transport delay to musical timing.
        const target=performance.targets[i];await until(()=>getTime()*1000>=target.time+(i===0?30:-100),5000);
        await driver.trigger(findInteractablesByName("NotePad-"+target.note,undefined,true)[0],{targetingMode:TargetingMode.Poke});
        await until(()=>target.judged,1000);if(!target.correct)throw new Error("Journey target "+i+" missed");
      }
      await until(()=>a.mode==="results",3000);expect(a.score.percent).toBe(100);expect(a.score.incorrect).toBe(0);expect(a.score.missed).toBe(0);
      print("[JOURNEY VISUAL] RESULTS");await sleep(2000);await button("Replay");expect(a.mode).toBe("countin");expect(a.score.correct).toBe(0);
      await button("Return to Menu");await button("Input Method");await button("Physical Keyboard");await button("Done");await button("Free Play");const notes=a.plays;await key("CHORD",()=>a.plays>=notes+2);expect(a.plays-notes).toBe(2);
      print("[JOURNEY VISUAL] FREE");await sleep(1500);await button("Return to Menu");await button("End session");expect(a.mode).toBe("ended");expect(a.instrument.fireflyCount).toBe(0);
      print("[JOURNEY VISUAL] ENDED");await sleep(1500);
      print("[ACCEPTANCE] PASS complete agent-driven beginner journey: placement/input choice, full untimed tutorial, real-time Amazing Grace 100%, replay, Free Play chord and session end");
    } finally {a.narration.stop();if(a.tutorial.active)a.tutorial.stop(false);a.tutorial.muted=false;a.narration.setMuted(false);a.action("input:physical");a.action("menu");overlay.enabled=true;}
  }
}
