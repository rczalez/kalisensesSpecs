import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {app,button,until} from "./KalisensesTestSupport";
@component
export class KalisensesGuidanceScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("select");a.bpm=60;a.ui.setTempo(60);
    await button("Faster +10");expect(a.bpm).toBe(70);await button("Faster +10");await button("Faster +10");expect(a.bpm).toBe(80);
    for(let i=0;i<5;i++)await button("Slower -10");expect(a.bpm).toBe(40);
    a.bpm=60;await button("Amazing Grace");expect(a.mode).toBe("countin");
    await until(()=>a.mode==="playing",6000);expect(a.countInPulses).toBe(4);expect(a.ui.cueText.includes("[ M ]")).toBe(true);
    const locked=a.bpm;a.action("faster");expect(a.bpm).toBe(locked);await button("Restart");expect(a.mode).toBe("countin");expect(a.score.correct).toBe(0);
    await button("Return to Menu");expect(a.mode).toBe("menu");expect(a.score).toBeNull();
  }
}
