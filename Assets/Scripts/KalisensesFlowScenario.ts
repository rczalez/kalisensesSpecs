import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {app,button,until} from "./KalisensesTestSupport";
@component
export class KalisensesFlowScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("menu");await button("Follow Along");expect(a.mode).toBe("select");
    for(const song of ["Amazing Grace","Silent Night","Scarborough Fair"]) {
      await button(song);expect(a.mode).toBe("countin");
      // Accelerated completion: preserve the song targets, move all windows into the past.
      const delta=getTime()*1000-a.score.targets[a.score.targets.length-1].time+500;
      a.score.targets.forEach(t=>t.time+=delta);a.startMs=getTime()*1000-1;
      await until(()=>a.mode==="results",2000);expect(a.score.missed).toBe(a.score.targets.length);expect(a.score.incorrect).toBe(0);expect(a.instrument.fireflyCount>0).toBe(true);
      await button("Replay");expect(a.mode).toBe("countin");expect(a.score.missed).toBe(0);
      await button("Return to Menu");await button("Follow Along");
    }
    a.beginSong({name:"Completion controls fixture",notes:["B4"],beats:[1]});a.startMs=0;a.score.targets[0].time=0;await until(()=>a.mode==="results",2000);
    await button("Choose Another Song");expect(a.mode).toBe("select");a.beginSong({name:"Completion controls fixture",notes:["B4"],beats:[1]});a.startMs=0;a.score.targets[0].time=0;await until(()=>a.mode==="results",2000);
    await button("Free Play");expect(a.mode).toBe("free");expect(a.score).toBeNull();expect(a.instrument.fireflyCount<=24).toBe(true);
    print("[ACCEPTANCE] PASS UI flows and accelerated three-song completion; enjoyment/real-time listening remains manual");
  }
}
