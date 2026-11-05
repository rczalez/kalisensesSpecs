import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {findSceneObjectByName,sleep} from "Leaf.lspkg/Utils/common/Utils";
import {app,until} from "./KalisensesTestSupport";

/** Layout assertions plus held views for screenshot review in the seated preview. */
@component
export class KalisensesMenuLayoutScenario extends Scenario {
  async run():Promise<void> {
    const a=app();
    const inspect=async(name:string)=>{
      await sleep(250);
      const panel=findSceneObjectByName("Panel-"+name);
      expect(panel.enabled).toBe(true);
      const camera=a.cameraObject.getComponent("Component.Camera") as Camera;
      let labels=0;
      const walk=(o:SceneObject)=>{
        const t=o.getComponent("Component.Text") as Text;
        if(t){
          labels++;expect(t.size>=52).toBe(true);expect(t.depthTest).toBe(true);
          expect(t.layoutRect.right-t.layoutRect.left>0).toBe(true);
          expect(t.layoutRect.top-t.layoutRect.bottom>0).toBe(true);
          const p=camera.worldSpaceToScreenSpace(o.getTransform().getWorldPosition());
          expect(p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1).toBe(true);
        }
        for(let i=0;i<o.getChildrenCount();i++)walk(o.getChild(i));
      };
      walk(panel);expect(labels>0).toBe(true);
      print("[VISUAL] READY "+name);await sleep(3500);
    };
    for(const mode of ["menu","select","free"]){a.action(mode);await inspect(mode);}
    a.bpm=60;a.beginSong({name:"Menu layout fixture",notes:["B4"],beats:[1]});
    await inspect("performance");await until(()=>a.mode==="results",6000);await inspect("results");
    a.action("menu");print("[ACCEPTANCE] PASS all five UI views: positive text rectangles, readable type sizes, projected label centers");
  }
}
