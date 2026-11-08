import {KalisensesMain} from "./KalisensesMain";
import {findSceneObjectByName,sleep} from "Leaf.lspkg/Utils/common/Utils";
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import {TargetingMode} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
/** Narration disables the target on press, so its normal TriggerEnd may be cancelled.
 * Release the simulated finger independently, as a real user would. */
export class NarratedNoteInteractor extends DefaultLeafInteractor {
  async tapNote(target:Interactable,mode:TargetingMode) {
    this.targetingMode=mode;await this.enterHover(target);
    this.startSelecting();await sleep(120);this.stopSelecting();await sleep(120);
  }
}
export function app():KalisensesMain {return findSceneObjectByName("Kalisenses").getComponent(KalisensesMain.getTypeName()) as KalisensesMain;}
export async function waitForNarration() {const a=app(),duration=a.narration.audio.audioTrack?a.narration.audio.duration:0;await until(()=>!a.interactionsBlocked,Math.max(30000,Number.isFinite(duration)?(duration+3)*1000:30000));}
export async function button(name:string) {await waitForNarration();const b=findInteractablesByName(name,undefined,true)[0];if(!b)throw new Error("Enabled button missing: "+name);await new DefaultLeafInteractor().trigger(b);await sleep(180);}
export async function until(predicate:()=>boolean,ms=10000) {const end=getTime()+ms/1000;while(!predicate()) {if(getTime()>end)throw new Error("Condition timed out after "+ms+" ms");await sleep(20);}}
