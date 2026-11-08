import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep} from "Leaf.lspkg/Utils/common/Utils";
import {app,until,button} from "./KalisensesTestSupport";
import {KalisensesNarration} from "./KalisensesNarration";
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";

@component
export class KalisensesNarrationLockScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("free");const before=a.plays;
    a.narration.play("intro");expect(a.interactionsBlocked).toBe(true);expect(a.ui.interactionLocked).toBe(true);
    const checkButtons=(root:SceneObject)=>{const b=root.getComponent(Button.getTypeName()) as Button;if(b)expect(b.interactable.enabled).toBe(false);for(let i=0;i<root.getChildrenCount();i++)checkButtons(root.getChild(i));};
    checkButtons(a.ui.sceneObject);checkButtons(a.instrument.sceneObject);
    for(const action of ["menu","input","placement","scan","confirm","tutorial","tutorial:next","tutorial:exit","tutorial:skip","tutorial:mute","input:virtual","restart","song0"])a.action(action);
    a.beginSong();a.ui.onAction.invoke("menu");expect(a.mode).toBe("free");expect(a.inputMethod).toBe("physical");expect(a.score).toBeNull();
    for(const source of ["physical","virtual","pinch"] as const) {
      expect(a.noteDown(source,11,"blocked-"+source)).toBe(false);
      a.noteUp(source,"blocked-"+source);
    }
    print("[LOCK_DRIVER] 1 HOLD");await until(()=>KeyboardManager.isKeyPressed(Keys.L)&&KeyboardManager.isKeyPressed(Keys.Space),15000);
    await until(()=>!a.interactionsBlocked,15000);expect(a.ui.interactionLocked).toBe(false);
    await sleep(350);expect(a.plays).toBe(before);expect(a.mode).toBe("free");
    print("[LOCK_DRIVER] 2 RELEASE");await until(()=>!KeyboardManager.isKeyPressed(Keys.L)&&!KeyboardManager.isKeyPressed(Keys.Space),15000);
    print("[LOCK_DRIVER] 3 PRESS");await until(()=>a.plays>before,15000);expect(a.plays-before).toBe(1);expect(a.lastNote).toBe("B4");
    // Explicit stop, external interruption and pause must all unblock controls.
    a.narration.play("intro");expect(a.interactionsBlocked).toBe(true);a.narration.stop();expect(a.interactionsBlocked).toBe(false);
    a.narration.play("intro");await sleep(100);a.narration.audio.stop(false);await until(()=>!a.interactionsBlocked,1200);
    a.narration.play("intro");await sleep(100);a.narration.audio.pause();await until(()=>!a.interactionsBlocked,1200);
    a.action("menu");await button("Free Play");expect(a.mode).toBe("free");

    // Deterministic failure doubles exercise recovery without breaking an asset.
    let playing=false,paused=false,fail=false,neverStarts=false,finished:()=>void=()=>{};
    const fake={audioTrack:null,duration:.05,playbackMode:null,volume:0,
      setOnFinish:(cb:()=>void)=>{finished=cb;},
      play:()=>{if(fail)throw new Error("injected playback failure");playing=!neverStarts;},
      stop:()=>{playing=false;paused=false;},isPlaying:()=>playing,isPaused:()=>paused};
    const voice=new KalisensesNarration(fake as unknown as AudioComponent);
    fail=true;voice.play("intro");expect(voice.blocked).toBe(false);fail=false;
    neverStarts=true;voice.play("intro");await sleep(850);voice.update();expect(voice.blocked).toBe(false);neverStarts=false;
    voice.play("intro");finished();expect(voice.blocked).toBe(true); // stale finish while replacement is playing
    paused=true;voice.update();expect(voice.blocked).toBe(false);
    voice.play("intro");await sleep(2150);voice.update();expect(voice.blocked).toBe(false);expect(playing).toBe(false);
    voice.setMuted(true);voice.play("intro");expect(voice.blocked).toBe(false);
    voice.setMuted(false);voice.play("not-a-clip");expect(voice.blocked).toBe(false);
    // Fast setup without narration, then a real short keyboard tap whose
    // release is reconciled during explicitly injected narration.
    a.narration.setMuted(true);a.action("tutorial");a.action("tutorial:next");a.action("tutorial:next");a.action("confirm");a.action("tutorial:next");
    a.narration.setMuted(false);const tutorialBefore=a.plays;
    print("[LOCK_DRIVER] 4 TUTORIAL");await until(()=>a.tutorial.waitingRelease,15000);a.narration.play("sequence");expect(a.interactionsBlocked).toBe(true);
    await until(()=>a.tutorial.step==="sequence",15000);expect(a.plays-tutorialBefore).toBe(1);
    a.narration.stop();a.action("tutorial:exit");expect(a.tutorial.active).toBe(false);
    a.action("menu");
    print("[ACCEPTANCE] PASS narration blocks all input paths/actions, drops held keyboard input, resumes after natural finish/stop/pause, and recovers from injected playback failure/start failure/stall");
  }
}
