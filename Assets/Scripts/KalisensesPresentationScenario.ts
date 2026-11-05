import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils";
import {NOTES,LETTERS} from "./KalisensesMusic";
import {app} from "./KalisensesTestSupport";
@component
export class KalisensesPresentationScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("free");expect(a.instrument.tines.length).toBe(17);
    const root=a.instrument.sceneObject;const camera=a.cameraObject.getComponent("Component.Camera") as Camera;
    const body=findSceneObjectByName("Kalimba Body 35x25");expect(body.getTransform().getLocalScale().x).toBe(35);expect(body.getTransform().getLocalScale().z).toBe(25);
    for(const x of [-17.5,17.5])for(const z of [-12.5,12.5]) {
      const p=root.getTransform().getWorldTransform().multiplyPoint(new vec3(x,3,z));const screen=camera.worldSpaceToScreenSpace(p);
      expect(screen.x>=0&&screen.x<=1&&screen.y>=0&&screen.y<=1).toBe(true);
    }
    for(let i=0;i<17;i++) {const label=findSceneObjectByName("TineLabel-"+NOTES[i]);expect(label.getChildrenCount()).toBe(2);expect((label.getChild(0).getComponent("Component.Text") as Text).text).toBe(LETTERS[i]);}
    const before=root.getTransform().getWorldPosition();a.action("menu");const eye=a.cameraObject.getTransform();const old=eye.getWorldPosition();eye.setWorldPosition(old.add(new vec3(10,0,0)));expect(root.getTransform().getWorldPosition().distance(before)).toBe(0);eye.setWorldPosition(old);
    print("[ACCEPTANCE] PASS geometry/projection/world stability; readability requires visual inspection");
  }
}
