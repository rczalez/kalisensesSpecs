import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {app,until} from "./KalisensesTestSupport";
import {LETTERS} from "./KalisensesMusic";
@component
export class KalisensesTutorialKeyboardScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("menu");let token=0;
    const key=async(k:string,predicate:()=>boolean)=>{await until(()=>!a.interactionsBlocked,30000);print("[TUTORIAL_DRIVER] "+(++token)+" "+k);await until(predicate,120000);};
    await key("Space",()=>a.mode==="tutorial");const t=a.tutorial;
    await key("Space",()=>t.step==="placement");await key("Space",()=>a.mode==="placement");
    await key("Space",()=>t.step==="choose");await key("Space",()=>t.step==="demo");await key("Space",()=>t.step==="first");
    for(const target of ["other","sequence","melody","offer"]) {
      while(t.step!==target){const step=t.step,index=t.index,n=a.plays;await key(LETTERS[t.targetIndex()],()=>!t.waitingRelease&&(t.step!==step||t.index!==index));expect(a.plays-n).toBe(1);expect(a.lastAudio.isPlaying()).toBe(true);expect(a.score).toBeNull();}
    }
    await key("3",()=>a.mode==="free");expect(t.active).toBe(false);
    print("[ACCEPTANCE] PASS entire untimed tutorial via preview-delivered keyboard events, including navigation, repeated melody notes and skip-to-free-play");
  }
}
