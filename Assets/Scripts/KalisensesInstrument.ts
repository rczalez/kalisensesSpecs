import {MIDIS,NOTES} from "./KalisensesMusic";
import {AMBER,SECONDARY,ACCENT,SURFACE,DEEP,INK} from "./KalisensesTheme";
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import {TargetingMode} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import {HandInputData} from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/HandInputData";
import {NotePointer} from "./KalisensesInput";
import {KalisensesFollowCues} from "./KalisensesFollowCues";
/** Parametric geometry in cm: animated tines, a 35×25 body and a 70×50 tabletop. */
@component
export class KalisensesInstrument extends BaseScriptComponent {
  @input @hint("Surface material") surface!:Material;
  @input @hint("Firefly material") glow!:Material;
  @input @hint("Firefly sphere mesh") sphere!:RenderMesh;
  public tines:SceneObject[]=[];
  public lengths=MIDIS.map(m=>18-(m-60)*.36);
  public highlighted=-1;
  public fireflyCount=0;
  public followCues!:KalisensesFollowCues;
  private outcomes:{index:number;time:number;kind:"correct"|"incorrect"|"missed"}[]=[];
  public onNoteDown=new Event<NotePointer>();
  public onNoteUp=new Event<string>();
  private pinchTargets:Interactable[]=[];
  private hovered=new Set<number>();
  public hoveredNote=-1;
  private pinchEnabled=false;
  private mats:Material[]=[];private flashes:number[]=new Array(17).fill(-100);
  private flies:{object:SceneObject;mat:Material;born:number;seed:number}[]=[];
  private unit!:RenderMesh;
  public initializeInstrument() {
    this.unit=this.boxMesh();
    this.followCues=new KalisensesFollowCues(this.sceneObject,this.sphere,this.glow,this.lengths);
    if(global.deviceInfoSystem.isEditor()) {
      this.box("Virtual Tabletop",this.sceneObject,new vec3(0,-3,0),new vec3(70,2,76),SURFACE);
      for(const x of [-29,29]) for(const z of [-29,29]) this.box("Table Leg",this.sceneObject,new vec3(x,-39,z),new vec3(2,70,2),DEEP);
    }
    this.box("Kalimba Body 35x25",this.sceneObject,new vec3(0,0,0),new vec3(35,4,25),DEEP);
    this.box("Resonant Face",this.sceneObject,new vec3(0,2.05,0),new vec3(33,.18,23),SURFACE);
    for(const x of [-17,17])this.box("Edge Inlay",this.sceneObject,new vec3(x,2.1,0),new vec3(.35,.2,23),ACCENT);
    // Decorative sound-hole inset, kept clear of the labels.
    this.box("Sound Hole",this.sceneObject,new vec3(0,2.2,7.8),new vec3(5,.1,3),new vec4(.16,.22,.25,1));
    this.box("Bridge",this.sceneObject,new vec3(0,2.7,-8.5),new vec3(31,.6,1.2),AMBER);
    NOTES.forEach((note,i)=>{
      const l=this.lengths[i];const s=this.box("Tine-"+note,this.sceneObject,new vec3((i-8)*1.8,3,-9+l/2),new vec3(1.35,.28,l),new vec4(.72,.84,.9,1));
      this.tines.push(s);this.mats.push((s.getComponent("Component.RenderMeshVisual") as RenderMeshVisual).mainMaterial);
      const collider=s.createComponent("Physics.ColliderComponent") as ColliderComponent;
      const shape=Shape.createBoxShape();shape.size=new vec3(1,4,1);collider.shape=shape;
      const target=s.createComponent(Interactable.getTypeName()) as Interactable;target.targetingMode=TargetingMode.Indirect;target.enabled=false;this.pinchTargets.push(target);
      target.onHoverEnter.add(()=>{this.hovered.add(i);this.hoveredNote=i;});target.onHoverExit.add(()=>{this.hovered.delete(i);this.hoveredNote=this.hovered.size?Array.from(this.hovered)[0]:-1;});
      target.onInteractorTriggerStart.add(e=>this.onNoteDown.invoke({index:i,contact:String(e.interactor.inputType),interactor:e.interactor}));
      const release=(e)=>{if(!e.interactor.isTriggering)this.onNoteUp.invoke(String(e.interactor.inputType));};
      target.onInteractorTriggerEnd.add(release);target.onInteractorTriggerEndOutside.add(release);
      // Cancellation or crossing tines while held must not re-arm a pinch.
    });
    for(const side of ["left","right"] as const) {
      const hand=HandInputData.getInstance().getHand(side);
      hand.onPinchUp.add(()=>this.onNoteUp.invoke(side==="left"?"1":"2"));
    }
  }
  public setPinchEnabled(enabled:boolean) {if(enabled===this.pinchEnabled)return;this.pinchEnabled=enabled;this.pinchTargets.forEach(t=>t.enabled=enabled);if(!enabled){this.hovered.clear();this.hoveredNote=-1;}}
  private boxMesh():RenderMesh {
    const b=new MeshBuilder([{name:"position",components:3},{name:"normal",components:3,normalized:true}]);b.topology=MeshTopology.Triangles;b.indexType=MeshIndexType.UInt16;
    const v:number[]=[],ix:number[]=[];
    const face=(p:number[][],n:number[])=>{const k=v.length/6;p.forEach(q=>v.push(...q,...n));ix.push(k,k+1,k+2,k,k+2,k+3);};
    const a=-.5,c=.5;
    face([[c,a,a],[c,c,a],[c,c,c],[c,a,c]],[1,0,0]);face([[a,a,c],[a,c,c],[a,c,a],[a,a,a]],[-1,0,0]);
    face([[a,c,a],[a,c,c],[c,c,c],[c,c,a]],[0,1,0]);face([[a,a,c],[a,a,a],[c,a,a],[c,a,c]],[0,-1,0]);
    face([[a,a,c],[c,a,c],[c,c,c],[a,c,c]],[0,0,1]);face([[c,a,a],[a,a,a],[a,c,a],[c,c,a]],[0,0,-1]);
    b.appendVerticesInterleaved(v);b.appendIndices(ix);b.updateMesh();return b.getMesh();
  }
  private box(name:string,parent:SceneObject,p:vec3,size:vec3,color:vec4):SceneObject {
    const s=global.scene.createSceneObject(name);s.setParent(parent);s.getTransform().setLocalPosition(p);s.getTransform().setLocalScale(size);
    const rm=s.createComponent("Component.RenderMeshVisual") as RenderMeshVisual;rm.mesh=this.unit;const mat=this.surface.clone();mat.mainPass.baseColor=color;rm.mainMaterial=mat;return s;
  }
  public pluck(index:number,time:number) {this.flashes[index]=time;this.spawn(time,2);}
  public celebrate(time:number) {this.spawn(time,12);}
  public showOutcome(index:number,kind:"correct"|"incorrect"|"missed",time:number) {
    this.outcomes=this.outcomes.filter(o=>o.index!==index&&time-o.time<.65);this.outcomes.push({index,time,kind});
  }
  public clearFollowFeedback() {this.followCues.clear();this.outcomes=[];}
  private spawn(time:number,count:number) {
    for(let i=0;i<count && this.flies.length<24;i++) {
      const seed=Math.random()*Math.PI*2;const o=global.scene.createSceneObject("Firefly");o.setParent(this.sceneObject);
      const r=o.createComponent("Component.RenderMeshVisual") as RenderMeshVisual;r.mesh=this.sphere;const mat=this.glow.clone();r.mainMaterial=mat;
      this.flies.push({object:o,mat,born:time,seed});
    }
    this.fireflyCount=this.flies.length;
  }
  public updateVisuals(time:number,cue:number) {
    this.highlighted=cue;
    this.tines.forEach((s,i)=>{const age=time-this.flashes[i];const played=age<.45;
      const outcome=this.outcomes.find(o=>o.index===i&&time-o.time<.65);
      const pulse=this.followCues.pulseLevels[i];
      this.mats[i].mainPass.baseColor=pulse>0?new vec4(1,.75+.2*pulse,.2+.48*pulse,1):outcome?(outcome.kind==="correct"?new vec4(.4,1,.66,1):outcome.kind==="incorrect"?new vec4(1,.34,.24,1):new vec4(.76,.57,1,1)):played?new vec4(.4,1,.66,1):i===cue?AMBER:this.hovered.has(i)?SECONDARY:INK;
      const p=s.getTransform().getLocalPosition();p.y=3+(played?Math.sin(age*100)*.1*Math.exp(-age*8):0);s.getTransform().setLocalPosition(p);
    });
    for(let i=this.flies.length-1;i>=0;i--) {
      const f=this.flies[i],age=time-f.born;
      if(age>3) {f.object.destroy();this.flies.splice(i,1);continue;}
      // Always outside the 35cm instrument and the label area.
      f.object.getTransform().setLocalPosition(new vec3((f.seed<Math.PI?-1:1)*(21+Math.sin(age+f.seed)*3),5+age*2+Math.sin(f.seed+age)*2,Math.cos(age+f.seed)*10));
      const fade=Math.max(0,1-age/3);f.object.getTransform().setLocalScale(vec3.one().uniformScale(.18*fade));f.mat.mainPass.baseColor=new vec4(fade,.92*fade,.3*fade,1);
    }
    this.fireflyCount=this.flies.length;
  }
}
