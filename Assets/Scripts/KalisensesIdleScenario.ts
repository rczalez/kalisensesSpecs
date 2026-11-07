import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep,findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils";
import {app,until} from "./KalisensesTestSupport";
import {KalisensesIdleAmbience} from "./KalisensesIdleAmbience";
@component
export class KalisensesIdleScenario extends Scenario {
  async run():Promise<void> {
    let spawns=0;const idle=new KalisensesIdleAmbience(()=>spawns++,0);
    for(let t=0;t<10;t+=.05){idle.update(t,true);expect(idle.active).toBe(false);}
    idle.update(10,true);expect(idle.active).toBe(true);
    for(let t=10.05;t<14;t+=.05)idle.update(t,true);expect(spawns).toBe(9);
    idle.activity(14);const before=spawns;
    for(let t=14;t<23.9;t+=.1)idle.update(t,true);expect(idle.active).toBe(false);expect(spawns).toBe(before);
    for(let t=30;t<90;t+=.1)idle.update(t,false);expect(idle.active).toBe(false);expect(spawns).toBe(before);
    print("[ACCEPTANCE] PASS visual idle threshold, nine emissions in four seconds, activity reset and excluded-mode policy");
    const a=app(),overlay=findSceneObjectByName("LeafDebugUICamera");overlay.enabled=false;
    try {
      a.action("menu");expect(a.sceneObject.getComponents("Component.AudioComponent").length).toBe(34);
      const start=getTime();await sleep(9400);expect(a.idle.active).toBe(false);
      await until(()=>a.idle.active,2500);expect(getTime()-start>=10).toBe(true);
      await sleep(4000);expect(a.instrument.fireflyCount>0&&a.instrument.fireflyCount<=24).toBe(true);
      print("[IDLE VISUAL] FIREFLIES ONLY");await sleep(2500);
      for(let i=0;i<36;i++)a.instrument.spawnAmbient(getTime());expect(a.instrument.fireflyCount<=24).toBe(true);
      const count=a.plays;print("[IDLE DRIVER] DISMISS B");await until(()=>!a.idle.active,12000);
      const requests=a.idle.spawnRequests;await sleep(300);expect(a.idle.spawnRequests).toBe(requests);expect(a.plays).toBe(count);expect(a.mode).toBe("menu");
      a.action("free");a.idle.lastActivity=getTime()-30;await sleep(150);expect(a.idle.active).toBe(false);
      a.noteDown("physical",8,"idle-free");a.noteUp("physical","idle-free");await sleep(150);expect(a.plays).toBe(count+1);
      a.beginSong({name:"Idle exclusion fixture",notes:["C4","G4"],beats:[20,1]});a.idle.lastActivity=getTime()-30;await sleep(150);expect(a.idle.active).toBe(false);
      a.action("pause");a.idle.lastActivity=getTime()-30;await sleep(150);expect(a.mode).toBe("paused");expect(a.idle.active).toBe(false);
      a.action("pause");a.startMs=getTime()*1000-1;await until(()=>a.mode==="playing",1000);a.idle.lastActivity=getTime()-30;await sleep(150);expect(a.idle.active).toBe(false);
      a.action("menu");print("[IDLE DRIVER] TUTORIAL SPACE");await until(()=>a.mode==="tutorial",12000);
      expect(a.narration.blocked).toBe(true);expect(a.idle.active).toBe(false);
      a.narration.stop();a.tutorial.stop(false);a.action("menu");
      print("[ACCEPTANCE] PASS fireflies-only idle, no extra audio component, cap24, keyboard dismissal, Free Play and Follow Along/tutorial exclusion");
    } finally {a.narration.stop();if(a.tutorial.active)a.tutorial.stop(false);a.idle.stop(getTime());overlay.enabled=true;a.action("menu");}
  }
}