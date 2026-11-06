import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator";
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata";
import {DefaultScenarioManager} from "Leaf.lspkg/Scenarios/scenario/manager/DefaultLeafScenarioManager";
import {KalisensesB4KeyboardScenario} from "./KalisensesB4KeyboardScenario";
import {KalisensesKeyboardScenario} from "./KalisensesKeyboardScenario";
import {KalisensesPresentationScenario} from "./KalisensesPresentationScenario";
import {KalisensesGuidanceScenario} from "./KalisensesGuidanceScenario";
import {KalisensesScoringScenario} from "./KalisensesScoringScenario";
import {KalisensesFlowScenario} from "./KalisensesFlowScenario";
import {KalisensesMenuLayoutScenario} from "./KalisensesMenuLayoutScenario";
import {KalisensesInputScenario} from "./KalisensesInputScenario";
import {KalisensesPlacementScenario} from "./KalisensesPlacementScenario";
import {KalisensesPhysicalHoldScenario} from "./KalisensesPhysicalHoldScenario";
import {KalisensesReachScenario} from "./KalisensesReachScenario";
import {KalisensesTutorialScenario} from "./KalisensesTutorialScenario";
import {KalisensesTutorialFallbackScenario} from "./KalisensesTutorialFallbackScenario";
import {KalisensesTutorialKeyboardScenario} from "./KalisensesTutorialKeyboardScenario";
import {KalisensesNarrationLockScenario} from "./KalisensesNarrationLockScenario";
@component
export class LeafIndex extends BaseScriptComponent {
  @input @hint("Optional preview test to launch after reset. Leave empty for normal play.") previewScenario:string="";
  @input @hint("Wait for unmapped Q after reset before starting the opt-in test, so the external driver can attach first.") waitForDriver:boolean=true;
  onAwake() {
    this.createEvent("OnStartEvent").bind(()=>{
      if(!this.previewScenario)return;
      if(this.waitForDriver) {
        let started=false;
        this.createEvent("KeyPressEvent").bind(e=>{if(e.key!==Keys.Q||started)return;started=true;DefaultScenarioManager.getInstance().startScenario(this.previewScenario).catch(error=>print("[LEAF startup] "+String(error)));});
        print("[LEAF startup] ARMED "+this.previewScenario+"; press Q");return;
      }
      const start=this.createEvent("DelayedCallbackEvent");
      start.bind(()=>{DefaultScenarioManager.getInstance().startScenario(this.previewScenario).catch(e=>print("[LEAF startup] "+String(e)));});start.reset(.5);
    });
  }
  @scenariosIndex
  static scenariosIndex:ScenarioMetadata[]=[
    {id:"kalisenses-narration-lock",typename:KalisensesNarrationLockScenario.getTypeName()},
    {id:"kalisenses-tutorial",typename:KalisensesTutorialScenario.getTypeName()},
    {id:"kalisenses-tutorial-fallback",typename:KalisensesTutorialFallbackScenario.getTypeName()},
    {id:"kalisenses-tutorial-keyboard",typename:KalisensesTutorialKeyboardScenario.getTypeName()},
    {id:"kalisenses-physical-hold",typename:KalisensesPhysicalHoldScenario.getTypeName()},
    {id:"kalisenses-reach",typename:KalisensesReachScenario.getTypeName()},
    {id:"kalisenses-input-methods",typename:KalisensesInputScenario.getTypeName()},
    {id:"kalisenses-placement",typename:KalisensesPlacementScenario.getTypeName()},
    {id:"kalisenses-menu-layout",typename:KalisensesMenuLayoutScenario.getTypeName()},
    {id:"kalisenses-b4-keyboard",typename:KalisensesB4KeyboardScenario.getTypeName()},
    {id:"kalisenses-17-keyboard",typename:KalisensesKeyboardScenario.getTypeName()},
    {id:"kalisenses-presentation",typename:KalisensesPresentationScenario.getTypeName()},
    {id:"kalisenses-guidance",typename:KalisensesGuidanceScenario.getTypeName()},
    {id:"kalisenses-scoring-logic",typename:KalisensesScoringScenario.getTypeName()},
    {id:"kalisenses-flows",typename:KalisensesFlowScenario.getTypeName()}
  ];
}
