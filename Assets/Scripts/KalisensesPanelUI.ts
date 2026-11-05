import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem";
import {FlexAlign,FlexDirection,FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button";
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import {NOTES,LETTERS} from "./KalisensesMusic";

type Role="title"|"body"|"key"|"note";
const SCALE:Record<Role,number>={title:84,body:52,key:43,note:27};
function applyTextRole(t:Text,role:Role,scale:number) {t.size=SCALE[role]*scale;}
@component
export class KalisensesPanelUI extends BaseScriptComponent {
  @input @hint("Scale of all labels") fontScale:number=1;
  @input @hint("Bright text tint") @widget(new ColorWidget()) ink:vec4=new vec4(.92,1,1,1);
  onAction=new Event<string>();
  private panels:Record<string,SceneObject>={};
  private status!:Text; private feedback!:Text; private results!:Text; private tempo!:Text;
  public cueText="";
  public initializeView() {
    this.sceneObject.createComponent("Component.Canvas");
    let f=this.panel("menu");
    this.label(f,"K A L I S E N S E S","title",3);
    this.label(f,"A little practice. A little light.","body",2);
    this.label(f,"Play the letters beside the tines. L plays B4.","body",2);
    let r=this.row(f);this.button(r,"Free Play",15,()=>this.onAction.invoke("free"));this.button(r,"Follow Along",15,()=>this.onAction.invoke("select"));
    f=this.panel("select");this.label(f,"CHOOSE YOUR MELODY","title",3);
    r=this.row(f);this.button(r,"Amazing Grace",13,()=>this.onAction.invoke("song0"));this.button(r,"Silent Night",12,()=>this.onAction.invoke("song1"));this.button(r,"Scarborough Fair",15,()=>this.onAction.invoke("song2"));
    r=this.row(f);this.button(r,"Slower -10",11,()=>this.onAction.invoke("slower"));this.tempo=this.label(r,"60 BPM","body",3,10);this.button(r,"Faster +10",11,()=>this.onAction.invoke("faster"));
    this.button(f,"Return to Menu",17,()=>this.onAction.invoke("menu"));
    f=this.panel("free");this.label(f,"FREE PLAY","title",3);this.label(f,"Press, release, and play again. Chords welcome.","body",2);this.button(f,"Return to Menu",17,()=>this.onAction.invoke("menu"));
    f=this.panel("performance");this.status=this.label(f,"Ready","title",3);this.feedback=this.label(f,"Follow the highlighted tine","body",2);
    r=this.row(f);this.button(r,"Restart",13,()=>this.onAction.invoke("restart"));this.button(r,"Return to Menu",17,()=>this.onAction.invoke("menu"));
    f=this.panel("results");this.label(f,"YOU MADE MUSIC","title",3);this.results=this.label(f,"","body",4);
    r=this.row(f);this.button(r,"Replay",10,()=>this.onAction.invoke("restart"));this.button(r,"Choose Another Song",18,()=>this.onAction.invoke("select"));this.button(r,"Free Play",10,()=>this.onAction.invoke("free"));
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
    const height=name==="select"?22:name==="results"?19:17;
    const backing=this.object("Backing-"+name,s);
    const plate=backing.createComponent(BackPlate.getTypeName()) as BackPlate;plate.size=new vec2(44,height);
    const c=this.object("Content-"+name,s);c.getTransform().setLocalPosition(new vec3(0,0,.6));return this.flex(c,false,42,height-2);
  }
  private row(parent:FlexLayout):FlexLayout {const s=this.object("ControlRow",parent.sceneObject);const f=this.flex(s,true,41,4.5);this.item(parent,s);return f;}
  private label(parent:FlexLayout,value:string,role:Role,h:number,w:number=40):Text {
    const s=this.object("Label-"+value.slice(0,22),parent.sceneObject);const t=s.createComponent("Component.Text") as Text;
    t.text=value;t.depthTest=true;t.textFill.color=this.ink;applyTextRole(t,role,this.fontScale);t.horizontalAlignment=HorizontalAlignment.Center;t.verticalAlignment=VerticalAlignment.Center;
    t.horizontalOverflow=HorizontalOverflow.Overflow;t.verticalOverflow=VerticalOverflow.Overflow;t.layoutRect=Rect.create(-w/2,w/2,-h/2,h/2);this.item(parent,s,w,h);return t;
  }
  private button(parent:FlexLayout,value:string,w:number,cb:()=>void) {
    const s=this.object(value,parent.sceneObject);const b=s.createComponent(Button.getTypeName()) as Button;b.size=new vec3(w,4,1);b.initialize();b.onTriggerUp.add(cb);
    const f=this.flex(s,true,w,4);const t=this.label(f,value,"body",3,w-.5);t.sceneObject.getTransform().setLocalPosition(new vec3(0,0,.15));this.item(parent,s);
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
  }
}
