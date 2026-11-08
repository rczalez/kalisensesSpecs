import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {KalisensesTutorial,TutorialView} from "./KalisensesTutorial";
import {InputMethod} from "./KalisensesInput";
@component
export class KalisensesTutorialFallbackScenario extends Scenario {
  async run():Promise<void> {
    let method:InputMethod="pinch",placed=false,view:TutorialView=null,spoken=0;
    const t=new KalisensesTutorial({method:()=>method,placed:()=>placed,editor:false,bpm:()=>60,
      draw:v=>view=v,say:()=>spoken++,silence:()=>{},mute:()=>{},exit:()=>{}});
    t.start(0);t.action("next",1);expect(t.step).toBe("placement");expect(view.title).toBe("LEARN  2 / 8");t.action("next",2);expect(t.step).toBe("placement");placed=true;t.action("next",3);
    const instructions=spoken;t.action("next",4);expect(t.step).toBe("first");expect(spoken-instructions).toBe(1);expect(view.title).toBe("LEARN  4 / 8");expect(view.demo).toBe(true);expect(view.next).toBe(false);
    t.performed("pinch",8,"1",true,6);expect(t.step).toBe("first");expect(view.status.includes("right")).toBe(true);
    const before=spoken;t.performed("pinch",8,"2",true,7);expect(t.step).toBe("first");expect(t.waitingRelease).toBe(true);expect(spoken).toBe(before);
    t.update(40,true,true,8);expect(t.step).toBe("first");expect(spoken).toBe(before);
    t.release("pinch","2",41);t.release("pinch","2",41.99);t.update(42.05,true,false,8);expect(t.step).toBe("sequence");expect(view.title).toBe("LEARN  5 / 8");expect(view.left).toBe(false);
    t.performed("pinch",8,"1",false,44);t.update(45,true,false,8);expect(t.step).toBe("sequence");expect(t.index).toBe(1);
    for(let n=46;n<80;n++){t.activity(n);t.update(n,true,false,8);}expect(t.helpCount).toBe(0);
    t.update(110,true,false,8);expect(t.helpCount).toBe(1);expect(view.largeDemo).toBe(true);
    t.update(111,true,false,8);expect(t.helpCount).toBe(1);
    // Deterministic sensor-state injection only; no claim of actual hand reliability.
    t.activity(112);for(let n=113;n<=120;n++)t.update(n,false,false,8);
    expect(t.trackingNotice).toBe(true);const warned=t.helpCount;
    for(let n=121;n<130;n++)t.update(n,false,false,8);expect(t.helpCount).toBe(warned);
    const index=t.index,step=t.step;method="physical";t.changedMethod(130);expect(t.step).toBe(step);expect(t.index).toBe(index);expect(t.trackingNotice).toBe(false);
    expect(view.status.includes("Physical Keyboard")).toBe(true);
    t.stop();expect(t.active).toBe(false);
    method="pinch";t.start(140);for(let n=141;n<=143;n++)t.action("next",n);
    t.performed("pinch",8,"2",true,145);expect(t.waitingRelease).toBe(true);
    method="physical";t.changedMethod(146);t.update(147,true,false,-1);expect(t.step).toBe("sequence");expect(t.waitingRelease).toBe(false);t.stop();
    print("[ACCEPTANCE] PASS first-hand guard, direct release-to-sequence, left-hand practice, prompt suppression, tracking fallback and progress retention (injected states only)");
  }
}
