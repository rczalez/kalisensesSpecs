import {KalisensesMain} from "./KalisensesMain";
import {findSceneObjectByName,sleep} from "Leaf.lspkg/Utils/common/Utils";
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor";
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils";
export function app():KalisensesMain {return findSceneObjectByName("Kalisenses").getComponent(KalisensesMain.getTypeName()) as KalisensesMain;}
export async function button(name:string) {const b=findInteractablesByName(name,undefined,true)[0];if(!b)throw new Error("Enabled button missing: "+name);await new DefaultLeafInteractor().trigger(b);await sleep(180);}
export async function until(predicate:()=>boolean,ms=10000) {const end=getTime()+ms/1000;while(!predicate()) {if(getTime()>end)throw new Error("Condition timed out after "+ms+" ms");await sleep(20);}}
