import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep} from "Leaf.lspkg/Utils/common/Utils";
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {app,until} from "./KalisensesTestSupport";
@component
export class KalisensesSoakScenario extends Scenario {
  async run():Promise<void> {
    const a=app(),driver=new DefaultLeafInteractor();a.action("input:virtual");a.action("free");
    const play=async()=>{const before=a.plays;await driver.trigger(findInteractablesByName("NotePad-C4",undefined,true)[0]);await until(()=>a.plays>before,1000);expect(a.plays-before).toBe(1);};
    await sleep(200);await play();
    // Warm every song-picker/results view and its UIKit interaction planes.
    // One-time lazy UI creation must not be mistaken for growth between rounds.
    for(let i=0;i<3;i++) {
      a.action("select");await sleep(150);a.action("song"+i);
      const score=a.score,delta=getTime()*1000-score.targets[score.targets.length-1].time+500;
      score.targets.forEach(t=>t.time+=delta);a.startMs=getTime()*1000-1;
      await until(()=>a.mode==="results",2000);a.action("restart");a.action("menu");a.action("free");await sleep(150);
    }
    await sleep(10500);
    const objects=()=>{let count=0;const visit=(o:SceneObject)=>{if(o.name==="Firefly")return;count++;for(let i=0;i<o.getChildrenCount();i++)visit(o.getChild(i));};for(let i=0;i<global.scene.getRootObjectsCount();i++)visit(global.scene.getRootObject(i));return count;};
    const baseline=objects(),audio=a.sceneObject.getComponents("Component.AudioComponent").length,watchers=a.inputWatcherCount;
    const start=getTime();let rounds=0,maxObjects=baseline,maxFlies=0;const samples:{elapsed:number;objects:number;flies:number;watchers:number;noteMs:number}[]=[];
    while(getTime()-start<120) {
      a.action("free");await sleep(100);const when=getTime();await play();const noteMs=(getTime()-when)*1000;
      a.action("select");a.action("song"+(rounds%3));const current=a.score;
      const delta=getTime()*1000-current.targets[current.targets.length-1].time+500;current.targets.forEach(t=>t.time+=delta);a.startMs=getTime()*1000-1;
      await until(()=>a.mode==="results",2000);expect(current.correct+current.missed).toBe(current.targets.length);
      a.action("restart");expect(a.mode).toBe("countin");a.action("menu");a.action("free");await sleep(100);
      const count=objects();maxObjects=Math.max(maxObjects,count);maxFlies=Math.max(maxFlies,a.instrument.fireflyCount);
      expect(count).toBe(baseline);expect(a.inputWatcherCount).toBe(watchers);expect(a.sceneObject.getComponents("Component.AudioComponent").length).toBe(audio);expect(a.instrument.fireflyCount<=24).toBe(true);expect(a.instrument.followCues.samples.length).toBe(0);
      samples.push({elapsed:getTime()-start,objects:count,flies:a.instrument.fireflyCount,watchers:a.inputWatcherCount,noteMs});rounds++;
      if(rounds%5===0)print("[SOAK] "+JSON.stringify(samples[samples.length-1]));await sleep(4000);
    }
    await sleep(10500);expect(a.instrument.fireflyCount).toBe(0);expect(objects()).toBe(baseline);
    print("[SOAK RESULT] "+JSON.stringify({seconds:getTime()-start,rounds,baseline,maxObjects,maxFlies,audio,watchers,first:samples[0],last:samples[samples.length-1]}));
    a.action("input:physical");a.action("menu");print("[ACCEPTANCE] PASS repeated-song soak: bounded scene objects/audio/watchers, one note per trigger and complete firefly cleanup; no hardware performance claim");
  }
}
