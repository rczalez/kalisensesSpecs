import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {findSceneObjectByName,sleep} from "Leaf.lspkg/Utils/common/Utils";
import {app,until} from "./KalisensesTestSupport";
import {NOTES} from "./KalisensesMusic";

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
          if(!(p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1))throw new Error(name+" label outside view: "+t.text+" screen="+p.x+","+p.y);
        }
        for(let i=0;i<o.getChildrenCount();i++)walk(o.getChild(i));
      };
      walk(panel);expect(labels>0).toBe(true);
      print("[VISUAL] READY "+name);await sleep(100);
    };
    for(const mode of ["menu","input","placement","select","free"]){a.action(mode);await inspect(mode);}
    a.bpm=60;a.beginSong({name:"Menu layout fixture",notes:["B4"],beats:[1]});
    await inspect("performance");await until(()=>a.mode==="results",6000);await inspect("results");
    a.action("input");a.action("input:virtual");a.action("free");await sleep(100);
    const camera=a.cameraObject.getComponent("Component.Camera") as Camera;
    NOTES.forEach(note=>{const pad=findSceneObjectByName("NotePad-"+note);for(const x of [-2,2])for(const y of [-2,2]){const p=camera.worldSpaceToScreenSpace(pad.getTransform().getWorldTransform().multiplyPoint(new vec3(x,y,.6)));if(!(p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1))throw new Error("Note pad outside view: "+note+" screen="+p.x+","+p.y);}});
    a.action("input");a.action("input:physical");a.action("menu");print("[ACCEPTANCE] PASS all seven UI views and 17 note-pad bounds: positive text rectangles, readable type sizes, projected label centers");
  }
}
