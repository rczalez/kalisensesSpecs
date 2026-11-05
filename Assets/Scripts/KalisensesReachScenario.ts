import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario";
import {expect} from "Leaf.lspkg/Utils/common/Expect";
import {sleep} from "Leaf.lspkg/Utils/common/Utils";
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {app,until} from "./KalisensesTestSupport";
import {DiagnosticRecorder} from "Leaf.lspkg/Diagnostic/DiagnosticRecorder";
@component
export class KalisensesReachScenario extends Scenario {
  async run():Promise<void> {
    const a=app();a.action("input");a.action("input:virtual");a.action("free");await sleep(100);
    DiagnosticRecorder.getInstance().setPolicy("fail-fast");
    const ik=createIKInteractor({avatar:{debugOverlay:false}}),before=a.plays;
    await ik.trigger(findInteractablesByName("NotePad-C4",undefined,true)[0]);
    await until(()=>a.plays>before,2000);expect(a.lastNote).toBe("C4");expect(a.plays-before).toBe(1);
    a.action("input");a.action("input:physical");a.action("menu");print("[ACCEPTANCE] PASS simulated IK reach to front note pad; real reach/comfort remains unvalidated");
  }
}
