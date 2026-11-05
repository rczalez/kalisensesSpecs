import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {findSceneObjectByName,sleep} from "Leaf.lspkg/Utils/common/Utils";
import {app,button} from "./KalisensesTestSupport";
import {suitableSurface} from "./KalisensesPlacement";

@component
export class KalisensesPlacementScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("menu");await button("Placement");expect(a.mode).toBe("placement");
    await button("Find Surface");expect(a.placement.scanning).toBe(false);expect(a.placement.placed).toBe(true);
    await button("Confirm Placement");expect(a.mode).toBe("menu");
    const eye=vec3.zero();expect(suitableSurface(new vec3(0,-60,-60),vec3.up(),eye)).toBe(true);
    expect(suitableSurface(new vec3(0,-60,-60),vec3.forward(),eye)).toBe(false);
    expect(suitableSurface(new vec3(0,-10,0),vec3.up(),eye)).toBe(false);
    expect(suitableSurface(new vec3(0,-200,-200),vec3.up(),eye)).toBe(false);
    const root=findSceneObjectByName("Kalisenses Tabletop"),instrument=a.instrument.sceneObject,ui=a.ui.sceneObject;
    expect(instrument.getParent().isSame(root)).toBe(true);expect(ui.getParent().isSame(root)).toBe(true);
    const before=instrument.getTransform().getWorldPosition(),dock=ui.getTransform().getWorldPosition();
    const saved=root.getTransform().getWorldPosition(),delta=new vec3(10,2,-5);root.getTransform().setWorldPosition(saved.add(delta));
    expect(instrument.getTransform().getWorldPosition().distance(before.add(delta))).toBeCloseTo(0,3);
    expect(ui.getTransform().getWorldPosition().distance(dock.add(delta))).toBeCloseTo(0,3);root.getTransform().setWorldPosition(saved);
    const camera=a.cameraObject.getTransform(),pose=camera.getWorldPosition();
    a.lockPreviewCamera=false;camera.setWorldPosition(pose.add(new vec3(8,0,0)));await sleep(80);
    expect(instrument.getTransform().getWorldPosition().distance(before)).toBeCloseTo(0,3);
    camera.setWorldPosition(pose);a.lockPreviewCamera=true;
    print("[ACCEPTANCE] PASS preview placement UI, surface-policy guards, shared anchor and world stability; real depth/patch detection UNTESTED");
  }
}
