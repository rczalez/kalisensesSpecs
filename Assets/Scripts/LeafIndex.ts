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
@component
export class LeafIndex extends BaseScriptComponent {
  @input @hint("Optional preview test to launch after reset. Leave empty for normal play.") previewScenario:string="";
  onAwake() {
    this.createEvent("OnStartEvent").bind(()=>{
      if(!this.previewScenario)return;
      const start=this.createEvent("DelayedCallbackEvent");
      start.bind(()=>{DefaultScenarioManager.getInstance().startScenario(this.previewScenario);});start.reset(.5);
    });
  }
  @scenariosIndex
  static scenariosIndex:ScenarioMetadata[]=[
    {id:"kalisenses-menu-layout",typename:KalisensesMenuLayoutScenario.getTypeName()},
    {id:"kalisenses-b4-keyboard",typename:KalisensesB4KeyboardScenario.getTypeName()},
    {id:"kalisenses-17-keyboard",typename:KalisensesKeyboardScenario.getTypeName()},
    {id:"kalisenses-presentation",typename:KalisensesPresentationScenario.getTypeName()},
    {id:"kalisenses-guidance",typename:KalisensesGuidanceScenario.getTypeName()},
    {id:"kalisenses-scoring-logic",typename:KalisensesScoringScenario.getTypeName()},
    {id:"kalisenses-flows",typename:KalisensesFlowScenario.getTypeName()}
  ];
}
