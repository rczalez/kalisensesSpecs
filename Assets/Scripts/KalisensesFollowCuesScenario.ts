import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep} from "Leaf.lspkg/Utils/common/Utils";
import {app,button,until} from "./KalisensesTestSupport";
import {NOTES,PerformanceScore} from "./KalisensesMusic";
import {sampleNoteOrbs,MAX_NOTE_ORBS} from "./KalisensesFollowCues";
@component
export class KalisensesFollowCuesScenario extends Scenario {
  async run():Promise<void> {
    const a=app(),instrument=a.instrument,cues=instrument.followCues;
    a.action("menu");a.action("input:physical");
    // Every supported tempo and every physical tine: exact scheduled coordinates,
    // including targets already scored early. No accumulated animation error.
    for(const bpm of [40,50,60,70,80])for(let index=0;index<17;index++) {
      const score=new PerformanceScore([NOTES[index]],[10000]);score.press(NOTES[index],9700);
      cues.update(score.targets,10000,bpm);expect(cues.samples.length).toBe(1);
      const p=cues.slots[0].getTransform().getLocalPosition(),landing=cues.landing(index);
      expect(p.distance(landing)).toBeCloseTo(0,4);expect(cues.pulseLevels[index]).toBe(1);
      expect(sampleNoteOrbs(score.targets,10001,bpm).length).toBe(0);
    }
    const dense=new PerformanceScore(Array(12).fill("C4"),Array(12).fill(10000));
    cues.update(dense.targets,9000,80);expect(cues.samples.length).toBe(MAX_NOTE_ORBS);
    const root=instrument.sceneObject.getTransform(),oldPosition=root.getLocalPosition(),oldScale=root.getLocalScale(),oldRotation=root.getLocalRotation();
    try {
      root.setLocalPosition(oldPosition.add(new vec3(7,2,-3)));root.setLocalScale(oldScale.uniformScale(1.3));root.setLocalRotation(quat.fromEulerAngles(0,.4,0));
      const local=cues.slots[0].getTransform().getLocalPosition();
      expect(cues.slots[0].getTransform().getWorldPosition().distance(root.getWorldTransform().multiplyPoint(local))).toBeCloseTo(0,3);
    } finally {root.setLocalPosition(oldPosition);root.setLocalScale(oldScale);root.setLocalRotation(oldRotation);cues.clear();}
    print("[PHASE3] PASS 85 exact arrivals, early-hit cues, pool bound, moved/rotated/scaled alignment");
    for(const bpm of [40,50,60,70,80]) {
      a.bpm=bpm;a.beginSong({name:"Live arrival fixture",notes:["C4","E4","G4"],beats:[1,1,1]});
      await until(()=>cues.samples.length>0,7000);
      const firstTime=a.score.targets[0].time;
      await until(()=>cues.pulsing.includes(8),7000);
      const lateness=getTime()*1000-firstTime;
      expect(lateness>=0&&lateness<200).toBe(true);expect(a.countInPulses).toBe(4);
      expect(a.noteDown("physical",8,"correct")).toBe(true);a.noteUp("physical","correct");
      expect(a.noteDown("physical",0,"wrong")).toBe(true);a.noteUp("physical","wrong");
      await until(()=>a.score.correct===1,1000);expect(a.score.incorrect).toBe(1);
      await until(()=>a.score.missed>=1,3000);
      print("[PHASE3] live "+bpm+" BPM arrival frame +"+lateness.toFixed(1)+"ms; correct/incorrect/missed preserved");
      a.action("menu");expect(cues.samples.length).toBe(0);
    }
    a.bpm=60;a.beginSong();await until(()=>cues.samples.length>0,6000);
    await button("Pause");expect(a.mode).toBe("paused");
    const frozen=cues.slots[0].getTransform().getLocalPosition(),score=a.score,deadline=score.targets[0].time;
    const plays=a.plays;expect(a.noteDown("physical",8,"paused")).toBe(false);a.noteUp("physical","paused");
    await sleep(450);expect(cues.slots[0].getTransform().getLocalPosition().distance(frozen)).toBeCloseTo(0,3);expect(a.plays).toBe(plays);expect(score.missed).toBe(0);
    await button("Pause");expect(a.mode).toBe("countin");expect(a.score.targets[0].time>deadline+400).toBe(true);
    await button("Restart");expect(a.mode).toBe("countin");expect(a.score.correct).toBe(0);expect(cues.samples.length).toBe(0);
    a.action("song1");expect(a.songIndex).toBe(1);expect(cues.samples.length).toBe(0);
    a.action("menu");expect(cues.samples.length).toBe(0);
    print("[PHASE3] PASS pause freeze/input rejection/resume shift/restart/song change/menu cleanup");
    // Wait out earlier feedback, then verify one real ten-second effect cohort.
    a.action("free");await sleep(10200);expect(instrument.fireflyCount).toBe(0);
    const before=a.plays;a.noteDown("physical",8,"fireflies");a.noteUp("physical","fireflies");
    await until(()=>a.plays===before+1,1000);expect(instrument.fireflyCount).toBe(2);
    await sleep(8100);expect(instrument.fireflyCount).toBe(2);
    await sleep(2100);expect(instrument.fireflyCount).toBe(0);
    for(let i=0;i<30;i++)instrument.celebrate(getTime());expect(instrument.fireflyCount).toBe(24);
    print("[ACCEPTANCE] PASS Follow Along orbs, five tempos, scoring feedback, pause/restart/reset, ten-second fireflies and cap24");
    a.action("menu");
  }
}
