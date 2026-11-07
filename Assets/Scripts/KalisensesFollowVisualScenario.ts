import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {findSceneObjectByName,sleep} from "Leaf.lspkg/Utils/common/Utils";
import {app,button,until} from "./KalisensesTestSupport";
/** Held views for repeatable, unobstructed preview captures; not a device comfort test. */
@component
export class KalisensesFollowVisualScenario extends Scenario {
  async run():Promise<void> {
    const a=app(),overlay=findSceneObjectByName("LeafDebugUICamera");overlay.enabled=false;
    try {
      a.action("select");print("[PHASE3 VISUAL] SELECT");await sleep(5000);
      a.action("input:physical");a.bpm=80;a.action("song1");await until(()=>a.mode==="playing",5000);
      a.noteDown("physical",10,"visual-correct");a.noteUp("physical","visual-correct");await sleep(800);
      print("[PHASE3 VISUAL] DESCENDING");await sleep(3000);
      await button("Pause");expect(a.mode).toBe("paused");a.instrument.celebrate(getTime());
      print("[PHASE3 VISUAL] PAUSED");await sleep(5000);
      await button("Pause");expect(a.mode).toBe("playing");print("[PHASE3 VISUAL] RESUMED");await sleep(3000);
      a.action("menu");print("[ACCEPTANCE] PASS held visual views, real song, correct note, pause and resume controls");
    } finally {overlay.enabled=true;a.action("menu");}
  }
}
