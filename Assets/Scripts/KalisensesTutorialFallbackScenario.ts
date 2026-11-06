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
    t.start(0);t.action("next",1);t.action("next",2);expect(t.step).toBe("placement");placed=true;t.action("next",3);t.action("next",4);t.action("next",5);expect(t.step).toBe("first");
    t.performed("pinch",8,"1",true,6);expect(t.step).toBe("first");expect(view.status.includes("right")).toBe(true);
    t.performed("pinch",8,"2",true,7);expect(t.step).toBe("release");const before=spoken;
    t.update(40,true,true,8);expect(t.step).toBe("release");expect(spoken).toBe(before);
    t.release("pinch","2",41);t.release("pinch","2",41.99);t.update(42.05,true,false,8);expect(t.step).toBe("other");expect(view.left).toBe(true);
    t.performed("pinch",8,"2",true,43);expect(t.step).toBe("other");
    t.performed("pinch",8,"1",false,44);t.update(45,true,false,8);expect(t.step).toBe("sequence");
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
    method="pinch";t.start(140);for(let n=141;n<=144;n++)t.action("next",n);
    t.performed("pinch",8,"2",true,145);expect(t.waitingRelease).toBe(true);
    method="physical";t.changedMethod(146);t.update(147,true,false,-1);expect(t.step).toBe("other");expect(t.waitingRelease).toBe(false);t.stop();
    print("[ACCEPTANCE] PASS right-before-left, release gating, active-attempt prompt suppression, one-shot tracking fallback and progress retention (injected sensor states only)");
  }
}
