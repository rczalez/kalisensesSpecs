import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep,findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils";
import {app} from "./KalisensesTestSupport";
@component
export class KalisensesFireflySpaceScenario extends Scenario {
  async run():Promise<void> {
    const a=app(),instrument=a.instrument,overlay=findSceneObjectByName("LeafDebugUICamera");
    const anchor=a.placement.anchor.getTransform(),position=anchor.getLocalPosition(),scale=anchor.getLocalScale(),rotation=anchor.getLocalRotation();
    const check=()=>{
      let visible=0;
      for(let i=0;i<global.scene.getRootObjectsCount();i++) {
        const fly=global.scene.getRootObject(i);if(fly.name!=="Firefly"||!fly.enabled)continue;
        visible++;expect(instrument.fireflyPositionClear(fly.getTransform().getWorldPosition())).toBe(true);
      }
      expect(visible>0&&visible<=24).toBe(true);
    };
    try {
      overlay.enabled=false;a.action("free");instrument.celebrate(getTime());instrument.celebrate(getTime());
      await sleep(150);expect(instrument.fireflyCount>0&&instrument.fireflyCount<=24).toBe(true);check();
      print("[FIREFLY VISUAL] ENVIRONMENT");await sleep(3000);check();
      for(const mode of ["select","input","menu"]) {a.action(mode);await sleep(150);check();}
      a.action("select");print("[FIREFLY VISUAL] MENU CLEAR");await sleep(3000);check();
      anchor.setLocalPosition(position.add(new vec3(8,3,-5)));anchor.setLocalScale(scale.uniformScale(1.15));anchor.setLocalRotation(quat.fromEulerAngles(0,.15,0));
      await sleep(150);check();anchor.setLocalPosition(position);anchor.setLocalScale(scale);anchor.setLocalRotation(rotation);
      await sleep(150);check();
      print("[ACCEPTANCE] PASS environmental fireflies (cap24) avoid projected instrument/cue/pad and active menu bounds across view and anchor changes");
    } finally {anchor.setLocalPosition(position);anchor.setLocalScale(scale);anchor.setLocalRotation(rotation);overlay.enabled=true;a.action("menu");}
  }
}
