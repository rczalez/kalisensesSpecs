import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem";
import {FlexAlign,FlexDirection,FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import {NOTES,LETTERS} from "./KalisensesMusic";
import {RoundedRectangle} from "SpectaclesUIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangle";
import {AMBER,SECONDARY,SURFACE,DEEP,INK} from "./KalisensesTheme";
import {InputMethod,INPUT_NAMES,NotePointer} from "./KalisensesInput";
import {TargetingMode,Interactor} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
import {TutorialView} from "./KalisensesTutorial";
import {KalisensesGestureDemo} from "./KalisensesGestureDemo";
const THEME_FONT=requireAsset("../Fonts/Outfit.ttf") as Font;

type Role="title"|"body"|"key"|"note";
const SCALE:Record<Role,number>={title:76,body:52,key:43,note:28};
function applyTextRole(t:Text,role:Role,scale:number) {t.font=THEME_FONT;t.size=SCALE[role]*scale;t.weight=role==="title"||role==="key"?700:550;}
@component
export class KalisensesPanelUI extends BaseScriptComponent {
  @input @hint("Scale of all labels") fontScale:number=1;
  @input @hint("Warm neutral text tint") @widget(new ColorWidget()) ink:vec4=INK;
  @input @hint("Backing opacity in preview; validate on see-through Specs") @widget(new SliderWidget(.6,1,.05)) backingOpacity:number=.96;
  onAction=new Event<string>();
  onNoteDown=new Event<NotePointer>();
  onNoteUp=new Event<string>();
  public interactionLocked=false;
  public canInteract:(pointer:Interactor)=>boolean=()=>true;
  private buttons:Button[]=[];private disarmButtons:(()=>void)[]=[];
  private inputMethod:InputMethod="physical";
  private inputLabels:Text[]=[];
  private inputDetails!:Text;private freeHelp!:Text;
  private placementStatus!:Text;
  private playable=false;
  private pads!:SceneObject;
  private methodButtons:Record<string,Text>={};
  private panels:Record<string,SceneObject>={};
  private status!:Text; private feedback!:Text; private results!:Text; private tempo!:Text;
  public cueText="";
  public tutorialView:TutorialView|null=null;
  private tutorialTitle!:Text;private tutorialCaption!:Text;private tutorialCue!:Text;private tutorialStatus!:Text;
  private tutorialNext!:Text;private tutorialMute!:Text;private demoLabel!:Text;private demoAnchor!:SceneObject;
  private demonstration:KalisensesGestureDemo|null=null;
  public initializeView() {
    this.sceneObject.createComponent("Component.Canvas");
    let f=this.panel("menu");
    this.label(f,"KALISENSES","title",3).textFill.color=AMBER;
    this.label(f,"A little practice. A little light.","body",2);
    let r=this.row(f);this.button(r,"Free Play",15,()=>this.onAction.invoke("free"));this.button(r,"Follow Along",15,()=>this.onAction.invoke("select"));
    this.inputLabels.push(this.label(f,"Physical Keyboard","body",2));
    r=this.row(f);this.button(r,"Input Method",18,()=>this.onAction.invoke("input"));this.button(r,"Placement",12,()=>this.onAction.invoke("placement"));
    const learn=this.button(f,"Learn to Play",26,()=>this.onAction.invoke("tutorial"));learn.text=global.deviceInfoSystem.isEditor()?"Learn to Play [Space]":"Learn to Play";
    f=this.panel("tutorial");this.tutorialTitle=this.label(f,"LEARN","title",2.5);
    this.tutorialCaption=this.label(f,"","body",5.5);
    this.tutorialCue=this.label(f,"","title",2.5);this.tutorialCue.textFill.color=AMBER;
    const demoRow=this.object("Tutorial Demonstration",f.sceneObject);this.demoAnchor=demoRow;
    this.item(f,demoRow,32,6.5);
    const demoText=this.flex(demoRow,false,32,6.5);this.demoLabel=this.label(demoText,"","note",6.5);
    this.tutorialStatus=this.label(f,"","note",2.5);
    r=this.row(f);this.tutorialNext=this.button(r,"Next",7,()=>this.onAction.invoke("tutorial:next"));
    this.button(r,"Replay",8,()=>this.onAction.invoke("tutorial:replay"));this.tutorialMute=this.button(r,"Mute",7,()=>this.onAction.invoke("tutorial:mute"));
    this.button(r,"Help",7,()=>this.onAction.invoke("tutorial:help"));
    r=this.row(f);this.button(r,"Input",10,()=>this.onAction.invoke("input"));this.button(r,"Skip",9,()=>this.onAction.invoke("tutorial:skip"));this.button(r,"Exit",9,()=>this.onAction.invoke("tutorial:exit"));
    f=this.panel("placement");this.label(f,"TABLETOP PLACEMENT","title",3);
    this.placementStatus=this.label(f,"Virtual tabletop · laptop preview","body",6);
    r=this.row(f);this.button(r,"Find Surface",15,()=>this.onAction.invoke("scan"));this.button(r,"Confirm Placement",16,()=>this.onAction.invoke("confirm"));
    this.button(f,"Return to Menu",17,()=>this.onAction.invoke("menu"));
    f=this.panel("input");this.label(f,"INPUT METHOD","title",3);
    for(const method of ["physical","virtual","pinch"] as InputMethod[]) this.methodButtons[method]=this.button(f,INPUT_NAMES[method],27,()=>this.onAction.invoke("input:"+method));
    this.inputDetails=this.label(f,"","body",5);
    this.button(f,"Done",12,()=>this.onAction.invoke("menu"));
    f=this.panel("select");this.label(f,"CHOOSE YOUR MELODY","title",3);
    r=this.row(f);this.button(r,"Amazing Grace",15,()=>this.onAction.invoke("song0"));this.button(r,"Silent Night",15,()=>this.onAction.invoke("song1"));
    r=this.row(f);this.button(r,"Scarborough Fair",19,()=>this.onAction.invoke("song2"));
    r=this.row(f);this.button(r,"Slower -10",10,()=>this.onAction.invoke("slower"));this.tempo=this.label(r,"60 BPM","body",3,8);this.button(r,"Faster +10",10,()=>this.onAction.invoke("faster"));
    this.button(f,"Return to Menu",17,()=>this.onAction.invoke("menu"));
    f=this.panel("free");this.label(f,"FREE PLAY","title",3);this.freeHelp=this.label(f,"Press, release, play again.","body",4);this.button(f,"Return to Menu",17,()=>this.onAction.invoke("menu"));
    f=this.panel("performance");this.status=this.label(f,"Ready","title",3);this.feedback=this.label(f,"Follow the highlighted tine","body",2);
    r=this.row(f);this.button(r,"Restart",13,()=>this.onAction.invoke("restart"));this.button(r,"Return to Menu",17,()=>this.onAction.invoke("menu"));
    f=this.panel("results");this.label(f,"YOU MADE MUSIC","title",3);this.results=this.label(f,"","body",4);
    r=this.row(f);this.button(r,"Replay",10,()=>this.onAction.invoke("restart"));this.button(r,"Free Play",12,()=>this.onAction.invoke("free"));
    this.button(f,"Choose Another Song",22,()=>this.onAction.invoke("select"));
    this.show("menu");
  }
  private object(name:string,parent:SceneObject):SceneObject {const s=global.scene.createSceneObject(name);s.setParent(parent);return s;}
  private flex(parent:SceneObject,row:boolean,w:number,h:number):FlexLayout {
    const f=parent.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    f.autoDiscoverItemsOnStart=false;f.direction=row?FlexDirection.Row:FlexDirection.Column;f.width=w;f.height=h;
    f.alignItems=FlexAlign.Center;f.justifyContent=FlexJustify.Center;f.rowGap=.7;f.columnGap=.8;return f;
  }
  private item(parent:FlexLayout,s:SceneObject,w?:number,h?:number) {const i=s.createComponent(FlexItem.getTypeName()) as FlexItem;i.flexShrink=0;if(w!==undefined)i.overrideWidth=w;if(h!==undefined)i.overrideHeight=h;parent.addItems([i]);}
  private panel(name:string):FlexLayout {
    const s=this.object("Panel-"+name,this.sceneObject);this.panels[name]=s;
    if(name==="tutorial")s.getTransform().setLocalPosition(new vec3(0,1,0));
    const height=name==="tutorial"?36:name==="input"?31:name==="select"?28:name==="results"?24:name==="placement"?22:name==="menu"?26:15;
    const backing=this.object("Backing-"+name,s);
    const plate=backing.createComponent(BackPlate.getTypeName()) as BackPlate;plate.size=new vec2(34,height);plate.style="simple";
    plate.onInitialized.add(()=>{const rr=backing.getComponent(RoundedRectangle.getTypeName()) as RoundedRectangle;rr.gradient=false;rr.backgroundColor=DEEP;rr.opacity=this.backingOpacity;});
    const c=this.object("Content-"+name,s);c.getTransform().setLocalPosition(new vec3(0,0,.6));return this.flex(c,false,32,height-2);
  }
  private row(parent:FlexLayout):FlexLayout {const s=this.object("ControlRow",parent.sceneObject);const f=this.flex(s,true,32,4.5);this.item(parent,s,32,4.5);return f;}
  private label(parent:FlexLayout,value:string,role:Role,h:number,w:number=32):Text {
    const s=this.object("Label-"+value.slice(0,22),parent.sceneObject);const t=s.createComponent("Component.Text") as Text;
    t.text=value;t.depthTest=true;t.textFill.color=this.ink;applyTextRole(t,role,this.fontScale);t.outlineSettings.enabled=true;t.outlineSettings.size=.12;t.outlineSettings.fill.color=DEEP;t.horizontalAlignment=HorizontalAlignment.Center;t.verticalAlignment=VerticalAlignment.Center;
    t.horizontalOverflow=HorizontalOverflow.Overflow;t.verticalOverflow=VerticalOverflow.Overflow;t.layoutRect=Rect.create(-w/2,w/2,-h/2,h/2);this.item(parent,s,w,h);return t;
  }
  private button(parent:FlexLayout,value:string,w:number,cb:()=>void):Text {
    const s=this.object(value,parent.sceneObject);const b=s.createComponent(Button.getTypeName()) as Button;b.setTheme("SnapOS2","Secondary");b.size=new vec3(w,4,1);b.initialize();b.visual.baseDefaultColor=SURFACE;b.visual.baseHoveredColor=SECONDARY;b.visual.baseTriggeredColor=AMBER;
    this.buttons.push(b);const armed=new Set<Interactor>();this.disarmButtons.push(()=>armed.clear());
    b.onTriggerDown.add(e=>{if(!this.interactionLocked&&this.canInteract(e.interactor))armed.add(e.interactor);});
    b.onTriggerUp.add(e=>{const started=armed.delete(e.interactor);if(started&&!this.interactionLocked&&this.canInteract(e.interactor))cb();});
    const f=this.flex(s,true,w,4);const t=this.label(f,value,"body",3,w-.5);t.sceneObject.getTransform().setLocalPosition(new vec3(0,0,.15));this.item(parent,s,w,4);
    return t;
  }
  public setInputMethod(method:InputMethod) {
    this.inputMethod=method;this.inputLabels.forEach(t=>t.text="Input: "+INPUT_NAMES[method]);
    Object.keys(this.methodButtons).forEach(k=>{this.methodButtons[k].textFill.color=k===method?AMBER:INK;this.methodButtons[k].text=(k===method?"• ":"")+INPUT_NAMES[k];});
    const help=method==="physical"?"Press labeled letter keys.\nRelease before replaying.":method==="virtual"?"Poke a note pad with your index.\nPreview: click; lift to play again.":"Aim at a tine; amber = hover.\nPinch once; release to replay.";
    this.inputDetails.text=help;this.freeHelp.text=help;
  }
  public setPlayable(active:boolean) {this.playable=active;if(this.pads)this.pads.enabled=active&&this.inputMethod==="virtual";}
  public setInteractionLocked(locked:boolean) {
    if(locked===this.interactionLocked)return;this.interactionLocked=locked;
    this.disarmButtons.forEach(clear=>clear());this.buttons.forEach(b=>b.interactable.enabled=!locked);
    if(this.tutorialView)this.tutorialStatus.text=locked?"Listening… controls return after narration.":this.tutorialView.status;
  }
  public setPlacementStatus(status:string) {this.placementStatus.text=status;}
  public initializeTutorialDemo(mesh:RenderMesh,material:Material) {
    this.demonstration=new KalisensesGestureDemo(this.demoAnchor,mesh,material);
    this.demonstration.root.getTransform().setLocalPosition(new vec3(-9,0,0));this.demonstration.root.enabled=false;
  }
  public setTutorial(v:TutorialView) {
    const old=this.tutorialView;
    if(v.demo&&(!old||!old.demo||old.left!==v.left||old.largeDemo!==v.largeDemo))this.restartTutorialDemo();
    this.tutorialView=v;this.tutorialTitle.text=v.title;this.tutorialCaption.text=v.caption;this.tutorialCue.text=v.cue;this.tutorialStatus.text=this.interactionLocked?"Listening… controls return after narration.":v.status;
    this.tutorialMute.text=v.muted?"Unmute":"Mute";this.tutorialNext.sceneObject.getParent().enabled=v.next;
    this.demoLabel.text=v.demo?(global.deviceInfoSystem.isEditor()?"SIMULATED DEMO\n":"GESTURE DEMO\n")+(v.left?"Left":"Right")+": aim, pinch, open":global.deviceInfoSystem.isEditor()?"Space next  |  0 replay  |  1 mute  |  2 input\n3 skip  |  4 exit  |  5 help\nAmber = next note. Green = played.":"Amber = next note\nGreen = played note";
    this.demoLabel.sceneObject.getTransform().setLocalPosition(new vec3(v.demo?4:0,0,.1));
    if(this.demonstration)this.demonstration.root.enabled=v.demo;
  }
  public restartTutorialDemo() {if(this.demonstration)this.demonstration.restart();}
  public updateTutorialDemo(time:number) {
    if(this.demonstration&&this.tutorialView&&this.tutorialView.demo){
      this.demonstration.update(time,this.tutorialView.left,this.tutorialView.largeDemo);
      this.demoLabel.text=(global.deviceInfoSystem.isEditor()?"SIMULATED ":"DEMO ")+(this.tutorialView.left?"LEFT":"RIGHT")+" HAND\n"+this.demonstration.phase;
    }
  }
  public show(mode:string) {Object.keys(this.panels).forEach(k=>this.panels[k].enabled=k===mode);}
  public setTempo(bpm:number) {this.tempo.text=bpm+" BPM";}
  public setCue(value:string,feedback:string,color:vec4) {this.cueText=value;this.status.text=value;this.feedback.text=feedback;this.feedback.textFill.color=color;}
  public setResults(percent:number,correct:number,incorrect:number,missed:number) {this.results.text=percent+"%  •  Keep your light growing!\nCorrect "+correct+"    Incorrect "+incorrect+"    Missed "+missed;}
  // Labels live beside measured physical tines, rather than in a flat menu layout.
  public labelTines(parent:SceneObject,lengths:number[]) {
    NOTES.forEach((n,i)=>{
      const anchor=this.object("TineLabel-"+n,parent);anchor.getTransform().setLocalPosition(new vec3((i-8)*1.8,3.6,-9+lengths[i]+.4));anchor.getTransform().setLocalRotation(quat.fromEulerAngles(-Math.PI/2,0,0));
      const f=this.flex(anchor,false,1.7,2.5);this.label(f,LETTERS[i],"key",1.3,1.7);this.label(f,n,"note",1.1,1.7);
    });
    this.pads=this.object("Virtual Note Pads",parent);this.pads.getTransform().setLocalPosition(new vec3(0,4,18));this.pads.getTransform().setLocalRotation(quat.fromEulerAngles(-Math.PI/2,0,0));
    const column=this.flex(this.pads,false,42,10);
    for(let row=0;row<2;row++) {
      const line=this.object("NotePadRow-"+row,this.pads);const layout=this.flex(line,true,42,4);layout.columnGap=.5;this.item(column,line,42,4);
      for(let i=row*9;i<Math.min(17,(row+1)*9);i++) {
        const label=this.button(layout,NOTES[i],4,()=>{});label.text=LETTERS[i]+"\n"+NOTES[i];applyTextRole(label,"key",this.fontScale);const pad=label.sceneObject.getParent();pad.name="NotePad-"+NOTES[i];const b=pad.getComponent(Button.getTypeName()) as Button;
        b.interactable.targetingMode=global.deviceInfoSystem.isEditor()?TargetingMode.All:TargetingMode.Poke;
        const contact=(e)=>String(e.interactor.inputType);
        b.onTriggerDown.add(e=>this.onNoteDown.invoke({index:i,contact:contact(e),interactor:e.interactor}));
        b.onTriggerUp.add(e=>this.onNoteUp.invoke(contact(e)));
        b.interactable.onTriggerEndOutside.add(e=>{if(!e.interactor.isTriggering)this.onNoteUp.invoke(contact(e));});
      }
    }
    this.pads.enabled=false;
  }
}
