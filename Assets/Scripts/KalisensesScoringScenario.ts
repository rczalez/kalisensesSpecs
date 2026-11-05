import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {PerformanceScore,SONGS,NOTES} from "./KalisensesMusic";
@component
export class KalisensesScoringScenario extends Scenario {
  async run():Promise<void> {
    // Pure scoring tests: NOT evidence of keyboard delivery.
    let s=new PerformanceScore(["B4","B4","C4"],[1000,1750,2500]);
    expect(s.press("B4",1375)).toBe(true);expect(s.targets[0].judged).toBe(true);expect(s.targets[1].judged).toBe(false);
    expect(s.press("B4",2150)).toBe(true);expect(s.press("C4",2100)).toBe(true);expect(s.correct).toBe(3);expect(s.percent).toBe(100);
    expect(s.press("C4",2500)).toBe(false);expect(s.incorrect).toBe(1);expect(s.percent).toBe(100);
    s=new PerformanceScore(["B4","B4"],[1000,1750]);expect(s.press("B4",1380)).toBe(true);expect(s.targets[1].correct).toBe(true);
    s=new PerformanceScore(["B4"],[1000]);expect(s.press("C4",1000)).toBe(false);expect(s.targets[0].judged).toBe(false);s.expire(1400);expect(s.missed).toBe(0);expect(s.press("B4",1400)).toBe(true);
    s=new PerformanceScore(["B4","C4","E4"],[1000,1000,1000]);expect(s.press("B4",600)).toBe(true);expect(s.press("C4",1000)).toBe(true);s.expire(1401);expect(s.missed).toBe(1);expect(s.percent).toBe(67);expect(s.correct+s.missed).toBe(3);
    s=new PerformanceScore(["B4"],[1000]);expect(s.press("B4",599)).toBe(false);expect(s.press("B4",1401)).toBe(false);s.expire(1401);expect(s.missed).toBe(1);expect(s.incorrect).toBe(2);
    SONGS.forEach(song=>{expect(song.notes.every(n=>NOTES.includes(n))).toBe(true);const t=song.notes.map((_,i)=>i*1000);const v=new PerformanceScore(song.notes,t);song.notes.forEach((n,i)=>v.press(n,t[i]));v.expire(t[t.length-1]+401);expect(v.percent).toBe(100);expect(v.correct+v.missed).toBe(song.notes.length);});
    print("[ACCEPTANCE] PASS inclusive boundaries, nearest/tie, repeated pitch, simultaneous clock, rounding and all song sequences (logic only)");
  }
}
