import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem";
import {FlexAlign,FlexDirection,FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import {NOTES,LETTERS} from "./KalisensesMusic";
import {RoundedRectangle} from "SpectaclesUIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangle";
import {RoundedRectangleVisual,BaseType} from "SpectaclesUIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangleVisual";
import {AMBER,SECONDARY,SURFACE,DEEP,INK} from "./KalisensesTheme";
import {InputMethod,INPUT_NAMES,NotePointer} from "./KalisensesInput";
import {TargetingMode,Interactor} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
import {TutorialView} from "./KalisensesTutorial";
import {KalisensesGestureDemo} from "./KalisensesGestureDemo";
const THEME_FONT=requireAsset("../Fonts/Outfit.ttf") as Font;

type Role="title"|"body"|"key"|"note";
const SCALE:Record<Role,number>={title:76,body:52,key:43,note:28};
function applyTextRole(t:Text,role:Role,scale:number) {t.font=THEME_FONT;t.size=SCALE[role]*scale;t.weight=role==="title"||role==="key"?700:550;}
/** Reusable attention cue; restores UIKit styling as soon as the cue ends. */
class ButtonPromptPulse {
  private start=-1;private style:{colorChange:boolean;baseType:BaseType}|null=null;
  private visual:RoundedRectangleVisual;
  constructor(private label:Text) {this.visual=(label.sceneObject.getParent().getComponent(Button.getTypeName()) as Button).visual as RoundedRectangleVisual;}
  update(active:boolean,time:number) {
    const visual=this.visual;
    if(!active){if(this.start>=0){visual.baseDefaultColor=SURFACE;this.label.textFill.color=INK;if(this.style){visual.baseType=this.style.baseType;visual.shouldColorChange=this.style.colorChange;this.style=null;}}this.start=-1;return;}
    if(this.start<0){this.start=time;this.style={colorChange:visual.shouldColorChange,baseType:visual.baseType};visual.shouldColorChange=false;visual.baseType="Color";}
    const level=.5-.5*Math.cos((time-this.start)*Math.PI*2/1.6);
    visual.baseDefaultColor=new vec4(SURFACE.x+(AMBER.x-SURFACE.x)*level,SURFACE.y+(AMBER.y-SURFACE.y)*level,SURFACE.z+(AMBER.z-SURFACE.z)*level,1);
    this.label.textFill.color=level>.42?DEEP:INK;
  }
}
@component
export class KalisensesPanelUI extends BaseScriptComponent {
  @input @hint("Scale of all labels") fontScale:number=1;
  @input @hint("Warm neutral text tint") @widget(new ColorWidget()) ink:vec4=INK;
  @input @hint("Backing opacity in preview; validate on see-through Specs") @widget(new SliderWidget(.6,1,.05)) backingOpacity:number=.96;
  onAction=new Event<string>();
  onUserActivity=new Event<void>();
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
  private panelHeights:Record<string,number>={};
  private status!:Text; private feedback!:Text; private results!:Text; private tempo!:Text;
  private pauseLabel!:Text;
  private noteMuteLabels:Text[]=[];private placementBack!:Text;private freeTarget=-2;private methodHelp="";
  public cueText="";
  public tutorialView:TutorialView|null=null;
  private tutorialTitle!:Text;private tutorialCaption!:Text;private tutorialCue!:Text;private tutorialStatus!:Text;
  private tutorialNext!:Text;private tutorialMute!:Text;private demoLabel!:Text;private demoAnchor!:SceneObject;
  private demonstration:KalisensesGestureDemo|null=null;
  private inputPromptPulse:ButtonPromptPulse|null=null;private nextPromptPulse:ButtonPromptPulse|null=null;
  public initializeView() {
    this.sceneObject.createComponent("Component.Canvas");
    let f=this.panel("menu");
    this.label(f,"KALISENSES","title",3).textFill.color=AMBER;
    this.label(f,"New here? Start with Learn to Play.","body",2);
    let r=this.row(f);this.button(r,"Free Play",15,()=>this.onAction.invoke("free"));this.button(r,"Follow Along",15,()=>this.onAction.invoke("select"));
    this.inputLabels.push(this.label(f,"Physical Keyboard","body",2));
    r=this.row(f);this.button(r,"Input Method",18,()=>this.onAction.invoke("input"));this.button(r,"Placement",12,()=>this.onAction.invoke("placement"));
    r=this.row(f);const learn=this.button(r,"Learn to Play",17,()=>this.onAction.invoke("tutorial"));learn.text=global.deviceInfoSystem.isEditor()?"Learn [Space]":"Learn to Play";this.button(r,"End session",14,()=>this.onAction.invoke("end"));
    f=this.panel("tutorial");this.tutorialTitle=this.label(f,"LEARN","title",2.5);
    this.tutorialCaption=this.label(f,"","body",5.5);
    this.tutorialCue=this.label(f,"","title",2.5);this.tutorialCue.textFill.color=AMBER;
    const demoRow=this.object("Tutorial Demonstration",f.sceneObject);this.demoAnchor=demoRow;
    this.item(f,demoRow,32,6.5);
    const demoText=this.flex(demoRow,false,32,6.5);this.demoLabel=this.label(demoText,"","body",6.5);
    this.tutorialStatus=this.label(f,"","body",4);
    r=this.row(f);this.tutorialNext=this.button(r,"Next",7,()=>this.onAction.invoke("tutorial:next"));
    this.nextPromptPulse=new ButtonPromptPulse(this.tutorialNext);
    this.button(r,"Replay",8,()=>this.onAction.invoke("tutorial:replay"));this.tutorialMute=this.button(r,"Mute",7,()=>this.onAction.invoke("tutorial:mute"));
    this.button(r,"Help",7,()=>this.onAction.invoke("tutorial:help"));
    r=this.row(f);this.inputPromptPulse=new ButtonPromptPulse(this.button(r,"Input",10,()=>this.onAction.invoke("input")));this.button(r,"Skip",9,()=>this.onAction.invoke("tutorial:skip"));this.button(r,"Exit",9,()=>this.onAction.invoke("tutorial:exit"));
    f=this.panel("placement");this.label(f,"TABLETOP PLACEMENT","title",3);
    this.placementStatus=this.label(f,"Virtual tabletop · laptop preview","body",6);
    r=this.row(f);this.button(r,"Find Surface",15,()=>this.onAction.invoke("scan"));this.button(r,"Confirm Placement",16,()=>this.onAction.invoke("confirm"));
    r=this.row(f);this.button(r,"Smaller",12,()=>this.onAction.invoke("size:smaller"));this.button(r,"Larger",12,()=>this.onAction.invoke("size:larger"));
    this.placementBack=this.button(f,"Return to Menu",17,()=>this.onAction.invoke("menu"));
    f=this.panel("input");this.label(f,"INPUT METHOD","title",3);
    for(const method of ["physical","virtual","pinch"] as InputMethod[]) this.methodButtons[method]=this.button(f,INPUT_NAMES[method],27,()=>this.onAction.invoke("input:"+method));
    this.inputDetails=this.label(f,"","body",5);
    this.button(f,"Done",12,()=>this.onAction.invoke("menu"));
    f=this.panel("select");this.label(f,"CHOOSE YOUR MELODY","title",3);
    r=this.row(f);this.button(r,"Amazing Grace",15,()=>this.onAction.invoke("song0"));this.button(r,"Silent Night",15,()=>this.onAction.invoke("song1"));
    r=this.row(f);this.button(r,"Scarborough Fair",19,()=>this.onAction.invoke("song2"));
    r=this.row(f);this.button(r,"Slower -10",10,()=>this.onAction.invoke("slower"));this.tempo=this.label(r,"60 BPM","body",3,8);this.button(r,"Faster +10",10,()=>this.onAction.invoke("faster"));
    this.label(f,"Play the tine when the\nglowing orb reaches it.","body",4.5);
    this.button(f,"Return to Menu",17,()=>this.onAction.invoke("menu"));
    f=this.panel("free");this.label(f,"FREE PLAY","title",3);this.freeHelp=this.label(f,"Press, release, play again.","body",4);r=this.row(f);this.button(r,"Input",9,()=>this.onAction.invoke("input"));this.noteMuteLabels.push(this.button(r,"Mute notes",10,()=>this.onAction.invoke("notes:mute")));this.button(r,"Return to Menu",11,()=>this.onAction.invoke("menu"));
    f=this.panel("performance");this.status=this.label(f,"Ready","title",3);this.feedback=this.label(f,"Play when the orb reaches the tine","body",4.5);
    r=this.row(f);this.pauseLabel=this.button(r,"Pause",8,()=>this.onAction.invoke("pause"));this.button(r,"Restart",9,()=>this.onAction.invoke("restart"));this.button(r,"Return to Menu",13,()=>this.onAction.invoke("menu"));
    r=this.row(f);this.button(r,"Input",9,()=>this.onAction.invoke("input"));this.button(r,"Placement",11,()=>this.onAction.invoke("placement"));this.noteMuteLabels.push(this.button(r,"Mute notes",10,()=>this.onAction.invoke("notes:mute")));
    f=this.panel("results");this.label(f,"YOU MADE MUSIC","title",3);this.results=this.label(f,"","body",4);
    r=this.row(f);this.button(r,"Replay",10,()=>this.onAction.invoke("restart"));this.button(r,"Free Play",12,()=>this.onAction.invoke("free"));
    this.button(f,"Choose Another Song",22,()=>this.onAction.invoke("select"));
    f=this.panel("ended");this.label(f,"SESSION ENDED","title",3);this.label(f,global.deviceInfoSystem.isEditor()?"Close the preview, or start again.":"Use Specs controls to close the Lens.","body",4);this.button(f,"Start again",18,()=>this.onAction.invoke("menu"));
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
    if(name==="tutorial")s.getTransform().setLocalPosition(new vec3(0,2,0));
    if(name==="select")s.getTransform().setLocalPosition(new vec3(0,1.5,0));
    if(name==="performance")s.getTransform().setLocalPosition(new vec3(0,3.5,0));
    if(name==="placement")s.getTransform().setLocalPosition(new vec3(0,2.5,0));
    const height=name==="tutorial"?38:name==="input"?31:name==="select"?34:name==="results"?24:name==="placement"?27:name==="performance"?22:name==="menu"?26:15;
    this.panelHeights[name]=height;
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
    b.interactable.onHoverEnter.add(()=>{if(!this.interactionLocked)this.onUserActivity.invoke();});
    b.onTriggerDown.add(e=>{if(!this.interactionLocked&&this.canInteract(e.interactor)){this.onUserActivity.invoke();armed.add(e.interactor);}});
    b.onTriggerUp.add(e=>{const started=armed.delete(e.interactor);if(started&&!this.interactionLocked&&this.canInteract(e.interactor))cb();});
    const f=this.flex(s,true,w,4);const t=this.label(f,value,"body",3,w-.5);t.sceneObject.getTransform().setLocalPosition(new vec3(0,0,.15));this.item(parent,s,w,4);
    return t;
  }
  public setInputMethod(method:InputMethod) {
    this.inputMethod=method;this.inputLabels.forEach(t=>t.text="Input: "+INPUT_NAMES[method]);
    Object.keys(this.methodButtons).forEach(k=>{this.methodButtons[k].textFill.color=k===method?AMBER:INK;this.methodButtons[k].text=(k===method?"• ":"")+INPUT_NAMES[k];});
    const help=method==="physical"?"Press labeled letter keys.\nRelease before replaying.":method==="virtual"?"Poke a note pad with your index.\nPreview: click; lift to play again.":"Aim at a tine; amber = hover.\nPinch once; release to replay.";
    this.methodHelp=help;this.freeTarget=-2;this.inputDetails.text=help;this.freeHelp.text=help;
  }
  public setPlayable(active:boolean) {this.playable=active;if(this.pads)this.pads.enabled=active&&this.inputMethod==="virtual";}
  public setInteractionLocked(locked:boolean) {
    if(locked===this.interactionLocked)return;this.interactionLocked=locked;
    this.disarmButtons.forEach(clear=>clear());this.buttons.forEach(b=>b.interactable.enabled=!locked);
    if(this.tutorialView)this.tutorialStatus.text=locked?"Listening…\nControls return after narration.":this.tutorialView.status;
    this.updateTutorialPrompts(getTime());
  }
  public setPlacementStatus(status:string) {this.placementStatus.text=status;}
  public initializeTutorialDemo(mesh:RenderMesh,material:Material) {
    this.demonstration=new KalisensesGestureDemo(this.demoAnchor,mesh,material);
    this.demonstration.root.getTransform().setLocalPosition(new vec3(-9,0,0));this.demonstration.root.enabled=false;
  }
  public setTutorial(v:TutorialView) {
    const old=this.tutorialView;
    if(v.demo&&(!old||!old.demo||old.left!==v.left||old.largeDemo!==v.largeDemo))this.restartTutorialDemo();
    this.tutorialView=v;this.tutorialTitle.text=v.title;this.tutorialCaption.text=v.caption;this.tutorialCue.text=v.cue;this.tutorialStatus.text=this.interactionLocked?"Listening…\nControls return after narration.":v.status;
    this.tutorialMute.text=v.muted?"Unmute":"Mute";this.tutorialNext.sceneObject.getParent().enabled=v.next;
    this.demoLabel.text=v.demo?(global.deviceInfoSystem.isEditor()?"SIMULATED DEMO\n":"GESTURE DEMO\n")+(v.left?"Left":"Right")+": aim, pinch, open":global.deviceInfoSystem.isEditor()?"Space Next | 0 Replay | 1 Mute\n2 Input | 3 Skip | 4 Exit | 5 Help\nNext note above. Release to repeat.":"Next note above.\nRelease to play again.";
    this.demoLabel.sceneObject.getTransform().setLocalPosition(new vec3(v.demo?4:0,0,.1));
    if(this.demonstration)this.demonstration.root.enabled=v.demo;
    this.updateTutorialPrompts(getTime());
  }
  public restartTutorialDemo() {if(this.demonstration)this.demonstration.restart();}
  public updateTutorialDemo(time:number) {
    this.updateTutorialPrompts(time);
    if(this.demonstration&&this.tutorialView&&this.tutorialView.demo){
      this.demonstration.update(time,this.tutorialView.left,this.tutorialView.largeDemo);
      this.demoLabel.text=(global.deviceInfoSystem.isEditor()?"SIMULATED ":"DEMO ")+(this.tutorialView.left?"LEFT":"RIGHT")+" HAND\n"+this.demonstration.phase;
    }
  }
  private updateTutorialPrompts(time:number) {
    const ready=!!this.tutorialView&&!this.interactionLocked&&this.panels.tutorial.enabled;
    const input=ready&&!!this.tutorialView?.promptInput;
    this.inputPromptPulse?.update(input,time);
    this.nextPromptPulse?.update(ready&&!!this.tutorialView?.next&&!input,time);
  }
  public show(mode:string) {Object.keys(this.panels).forEach(k=>this.panels[k].enabled=k===mode);this.updateTutorialPrompts(getTime());}
  public setTempo(bpm:number) {this.tempo.text=bpm+" BPM";}
  public setPaused(paused:boolean) {if(this.pauseLabel)this.pauseLabel.text=paused?"Resume":"Pause";}
  public setReturnToSession(active:boolean) {this.placementBack.text=active?"Back to session":"Return to Menu";}
  public setNotesMuted(muted:boolean) {this.noteMuteLabels.forEach(t=>t.text=muted?"Unmute notes":"Mute notes");}
  public setFreeTarget(index:number) {if(index===this.freeTarget)return;this.freeTarget=index;this.freeHelp.text=index>=0?"Target: "+NOTES[index]+" [ "+LETTERS[index]+" ]\nPinch once, then release.":this.methodHelp;}
  public setFreePlayed(index:number,muted:boolean) {this.freeHelp.text="Played "+NOTES[index]+" [ "+LETTERS[index]+" ]"+(muted?" • muted":"")+"\nRelease before playing again.";}
  public fireflyMenuCorners():vec3[][] {
    const regions=Object.keys(this.panels).filter(k=>this.panels[k].enabled).map(k=>{
      const matrix=this.panels[k].getTransform().getWorldTransform(),points:vec3[]=[];
      for(const x of [-18,18])for(const y of [-this.panelHeights[k]/2-1,this.panelHeights[k]/2+1])for(const z of [-1,2])points.push(matrix.multiplyPoint(new vec3(x,y,z)));
      return points;
    });
    if(this.pads&&this.pads.enabled) {
      const matrix=this.pads.getTransform().getWorldTransform(),points:vec3[]=[];
      for(const x of [-23,23])for(const y of [-6,6])for(const z of [-1,2])points.push(matrix.multiplyPoint(new vec3(x,y,z)));
      regions.push(points);
    }
    return regions;
  }
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
