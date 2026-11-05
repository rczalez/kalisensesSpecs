import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep,findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils";
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {TargetingMode} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
import {app,button,until} from "./KalisensesTestSupport";
import {NOTES} from "./KalisensesMusic";
import {InputMethod} from "./KalisensesInput";
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import {SECONDARY} from "./KalisensesTheme";

class NoteTestInteractor extends DefaultLeafInteractor {
  async hoverNote(target:Interactable){await this.enterHover(target);}
  async leaveNote(){await this.exitHover();}
}

@component
export class KalisensesInputScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("menu");
    for(const method of ["physical","virtual","pinch"] as InputMethod[]) {
      await button("Input Method");expect(a.mode).toBe("input");
      await button({physical:"Physical Keyboard",virtual:"Virtual Keyboard",pinch:"Pinch Gesture"}[method]);
      expect(a.inputMethod).toBe(method);await button("Done");expect(a.mode).toBe("menu");
    }
    const driver=new NoteTestInteractor();
    for(const method of ["virtual","pinch"] as InputMethod[]) {
      a.action("input");a.action("input:"+method);a.action("free");await sleep(100);
      expect(findSceneObjectByName("Virtual Note Pads").enabled).toBe(method==="virtual");
      if(method==="pinch") {
        await sleep(500);const target=findInteractablesByName("Tine-B4",undefined,true)[0];
        await driver.hoverNote(target);await sleep(80);expect(a.instrument.hoveredNote).toBe(11);
        expect((a.instrument.tines[11].getComponent("Component.RenderMeshVisual") as RenderMeshVisual).mainMaterial.mainPass.baseColor.y).toBeCloseTo(SECONDARY.y,3);
        await driver.leaveNote();await sleep(80);expect(a.instrument.hoveredNote).toBe(-1);
      }
      for(let i=0;i<17;i++) {
        const target=findInteractablesByName((method==="virtual"?"NotePad-":"Tine-")+NOTES[i],undefined,true)[0];
        expect(!!target).toBe(true);const before=a.plays;
        await driver.trigger(target,{targetingMode:method==="virtual"?TargetingMode.Poke:TargetingMode.Indirect});
        await until(()=>a.plays>before,1000);expect(a.plays-before).toBe(1);
        expect(a.lastNote).toBe(NOTES[i]);expect(a.lastIndex).toBe(i);expect(a.lastAudio.isPlaying()).toBe(true);
      }
      // A contact remains latched even when its held pointer crosses notes.
      const before=a.plays;
      expect(a.noteDown(method,11,"held-fixture")).toBe(true);
      expect(a.noteDown(method,11,"held-fixture")).toBe(false);
      expect(a.noteDown(method,12,"held-fixture")).toBe(false);
      await sleep(180);expect(a.plays-before).toBe(1);
      a.action("menu");a.action("free");expect(a.noteDown(method,12,"held-fixture")).toBe(false);
      a.noteUp(method,"held-fixture");expect(a.noteDown(method,11,"held-fixture")).toBe(true);a.noteUp(method,"held-fixture");
      await sleep(100);expect(a.plays-before).toBe(2);
      // The same SIK adapter feeds the production timing/scoring queue.
      a.beginSong({name:"Input event fixture",notes:["B4"],beats:[1]});
      a.startMs=getTime()*1000-1;a.score.targets[0].time=getTime()*1000+250;
      await until(()=>a.mode==="playing",1000);await sleep(50);
      await driver.trigger(findInteractablesByName((method==="virtual"?"NotePad-":"Tine-")+"B4",undefined,true)[0],{targetingMode:method==="virtual"?TargetingMode.Poke:TargetingMode.Indirect});
      await until(()=>a.mode==="results",2000);expect(a.score.correct).toBe(1);expect(a.score.incorrect).toBe(0);expect(a.score.percent).toBe(100);
    }
    a.action("input");a.action("input:physical");a.action("free");
    const before=a.plays;expect(a.noteDown("virtual",11,"wrong-source")).toBe(false);a.noteUp("virtual","wrong-source");await sleep(100);expect(a.plays).toBe(before);
    a.action("menu");print("[ACCEPTANCE] PASS input menu, 34 SIK note events, hold/cross/release guards, shared scoring and inactive-source guard");
  }
}
