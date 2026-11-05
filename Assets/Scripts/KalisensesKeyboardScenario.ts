import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {NOTES,LETTERS} from "./KalisensesMusic";
import {app,button,until} from "./KalisensesTestSupport";
@component
export class KalisensesKeyboardScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("menu");await button("Free Play");
    const pose=a.cameraObject.getTransform().getWorldPosition();
    for(let i=0;i<NOTES.length;i++) {
      const n=a.plays;print("[ACCEPTANCE] KEY_READY "+LETTERS[i]);await until(()=>a.plays>n,10000);
      expect(a.plays-n).toBe(1);expect(a.lastNote).toBe(NOTES[i]);expect(a.lastIndex).toBe(i);expect(a.lastAudio.isPlaying()).toBe(true);
      expect(a.cameraObject.getTransform().getWorldPosition().distance(pose)).toBeCloseTo(0,3);
    }
    print("[ACCEPTANCE] PASS 17 preview-delivered keys; held/chord hardware checks separate");
  }
}
