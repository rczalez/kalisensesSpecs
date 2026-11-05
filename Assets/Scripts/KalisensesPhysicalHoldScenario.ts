import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep} from "Leaf.lspkg/Utils/common/Utils";
import {app,until} from "./KalisensesTestSupport";
@component
export class KalisensesPhysicalHoldScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("input");a.action("input:physical");a.action("free");
    let n=a.plays;print("[DELIVERY] HOLD_READY");await until(()=>a.plays>n,120000);expect(a.lastNote).toBe("B4");
    await sleep(900);expect(a.plays-n).toBe(1);print("[DELIVERY] REPRESS_READY");
    await until(()=>a.plays>=n+2,120000);expect(a.plays-n).toBe(2);expect(a.lastNote).toBe("B4");
    n=a.plays;print("[DELIVERY] CHORD_READY");await until(()=>a.plays>=n+2,120000);expect(a.plays-n).toBe(2);expect(a.lastAudio.isPlaying()).toBe(true);
    print("[ACCEPTANCE] PASS injected hold, release/repress and overlapping L/M key downs; physical rollover remains a hardware check");a.action("menu");
  }
}
