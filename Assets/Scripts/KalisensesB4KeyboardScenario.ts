import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {app,button,until} from "./KalisensesTestSupport";
@component
export class KalisensesB4KeyboardScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("menu");await button("Free Play");const before=a.plays;
    print("[ACCEPTANCE] FREE_READY inject L");await until(()=>a.plays>before,20000);
    expect(a.plays-before).toBe(1);expect(a.lastNote).toBe("B4");expect(a.lastIndex).toBe(11);expect(a.lastAudio.isPlaying()).toBe(true);
    const rm=a.instrument.tines[11].getComponent("Component.RenderMeshVisual") as RenderMeshVisual;
    expect(rm.mainMaterial.mainPass.baseColor.y).toBe(1);
    a.action("select");a.bpm=60;a.beginSong({name:"B4 keyboard delivery fixture",notes:["B4"],beats:[1]});
    // Leave a one-beat lead after count-in for external keyboard delivery.
    // The target still uses the production inclusive +/-400 ms scoring window.
    a.score.targets[0].time+=1000;
    await until(()=>a.mode==="playing" && getTime()*1000>=a.score.targets[0].time-350,7000);const second=a.plays;
    print("[ACCEPTANCE] FOLLOW_READY inject L");await until(()=>a.plays>second,10000);
    expect(a.lastNote).toBe("B4");expect(a.lastIndex).toBe(11);expect(a.lastAudio.isPlaying()).toBe(true);expect(a.score.correct).toBe(1);
    expect(rm.mainMaterial.mainPass.baseColor.y).toBe(1);await until(()=>a.mode==="results",2000);expect(a.score.percent).toBe(100);
    print("[ACCEPTANCE] PASS L -> B4, audio active and tine 11 highlighted in both modes");
  }
}
