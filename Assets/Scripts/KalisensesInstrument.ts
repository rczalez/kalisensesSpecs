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
  public readonly fireflyLifetime=10;
  public readonly maxFireflies=24;
  public readonly maxAmbientFireflies=24;
  public readonly fireflySize=.55;
  private outcomes:{index:number;time:number;kind:"correct"|"incorrect"|"missed"}[]=[];
  public onNoteDown=new Event<NotePointer>();
  public onNoteUp=new Event<string>();
  private pinchTargets:Interactable[]=[];
  private hovered=new Set<number>();
  public hoveredNote=-1;
  private pinchEnabled=false;
  private mats:Material[]=[];private flashes:number[]=new Array(17).fill(-100);
  private flies:{object:SceneObject;mat:Material;born:number;seed:number;origin:vec3;ambient:boolean}[]=[];
  private unit!:RenderMesh;
  private fireflyCamera:Camera|null=null;
  private menuCorners:()=>vec3[][]=()=>[];
  private clearRects:{left:number;right:number;top:number;bottom:number}[]=[];
  public configureFireflySpace(camera:Camera,menuCorners:()=>vec3[][]) {this.fireflyCamera=camera;this.menuCorners=menuCorners;}
  private refreshFireflySpace() {
    this.clearRects=[];if(!this.fireflyCamera)return;
    const matrix=this.sceneObject.getTransform().getWorldTransform(),instrument:vec3[]=[];
    // Separate tight regions keep the open space above/below the instrument available.
    for(const x of [-18.5,18.5])for(const y of [-3,4.5])for(const z of [-13.5,13.5])instrument.push(matrix.multiplyPoint(new vec3(x,y,z)));
    const orbs:vec3[][]=[];
    if(this.followCues)this.followCues.slots.filter(s=>s.enabled).forEach(slot=>{
      const p=slot.getTransform().getLocalPosition(),corners:vec3[]=[];
      for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])corners.push(matrix.multiplyPoint(p.add(new vec3(x,y,z))));
      orbs.push(corners);
    });
    const view=this.fireflyCamera.sceneObject.getTransform().getInvertedWorldTransform();
    for(const corners of [instrument,...orbs,...this.menuCorners()]) {
      const points=corners.filter(p=>view.multiplyPoint(p).z<-this.fireflyCamera.near).map(p=>this.fireflyCamera.worldSpaceToScreenSpace(p));
      if(!points.length)continue;
      this.clearRects.push({left:Math.min(...points.map(p=>p.x))-.015,right:Math.max(...points.map(p=>p.x))+.015,top:Math.min(...points.map(p=>p.y))-.015,bottom:Math.max(...points.map(p=>p.y))+.015});
    }
  }
  public fireflyPositionClear(world:vec3):boolean {
    const local=this.sceneObject.getTransform().getInvertedWorldTransform().multiplyPoint(world);
    if(Math.abs(local.x)<18.5&&local.y>-3&&local.y<4.5&&Math.abs(local.z)<13.5)return false;
    if(!this.fireflyCamera)return false;
    const point=this.fireflyCamera.worldSpaceToScreenSpace(world);
    return Number.isFinite(point.x)&&Number.isFinite(point.y)&&!this.clearRects.some(r=>point.x>=r.left&&point.x<=r.right&&point.y>=r.top&&point.y<=r.bottom);
  }
  private findFireflyPosition():vec3|null {
    if(!this.fireflyCamera)return null;
    for(let attempt=0;attempt<32;attempt++) {
      // Sample the whole visible environment, then leave each light anchored in world space.
      const point=this.fireflyCamera.screenSpaceToWorldSpace(new vec2(.03+Math.random()*.94,.03+Math.random()*.94),80+Math.random()*80);
      if(this.fireflyPositionClear(point))return point;
    }
    return null;
  }
  public initializeInstrument() {
    this.unit=this.boxMesh();
    this.followCues=new KalisensesFollowCues(this.sceneObject,this.sphere,this.glow,this.lengths);
    this.createEvent("OnDestroyEvent").bind(()=>this.flies.forEach(f=>f.object.destroy()));
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
  public spawnAmbient(time:number) {if(this.flies.length<this.maxAmbientFireflies)this.spawn(time,1,true);}
  public showOutcome(index:number,kind:"correct"|"incorrect"|"missed",time:number) {
    this.outcomes=this.outcomes.filter(o=>o.index!==index&&time-o.time<.65);this.outcomes.push({index,time,kind});
  }
  public clearFollowFeedback() {this.followCues.clear();this.outcomes=[];}
  private spawn(time:number,count:number,ambient=false) {
    this.refreshFireflySpace();
    for(let i=0;i<count && this.flies.length<this.maxFireflies;i++) {
      const origin=this.findFireflyPosition();if(!origin)continue;
      const seed=Math.random()*Math.PI*2;const o=global.scene.createSceneObject("Firefly");
      const r=o.createComponent("Component.RenderMeshVisual") as RenderMeshVisual;r.mesh=this.sphere;const mat=this.glow.clone();mat.mainPass.blendMode=BlendMode.Add;mat.mainPass.depthWrite=false;r.mainMaterial=mat;
      this.flies.push({object:o,mat,born:time,seed,origin,ambient});
      o.getTransform().setWorldPosition(origin);o.getTransform().setLocalScale(vec3.one().uniformScale(this.fireflySize));
    }
    this.fireflyCount=this.flies.length;
  }
  public updateVisuals(time:number,cue:number) {
    this.refreshFireflySpace();
    this.highlighted=cue;
    this.tines.forEach((s,i)=>{const age=time-this.flashes[i];const played=age<.45;
      const outcome=this.outcomes.find(o=>o.index===i&&time-o.time<.65);
      const pulse=this.followCues.pulseLevels[i];
      this.mats[i].mainPass.baseColor=pulse>0?new vec4(1,.75+.2*pulse,.2+.48*pulse,1):outcome?(outcome.kind==="correct"?new vec4(.4,1,.66,1):outcome.kind==="incorrect"?new vec4(1,.34,.24,1):new vec4(.76,.57,1,1)):played?new vec4(.4,1,.66,1):i===cue?AMBER:this.hovered.has(i)?SECONDARY:INK;
      const p=s.getTransform().getLocalPosition();p.y=3+(played?Math.sin(age*100)*.1*Math.exp(-age*8):0);s.getTransform().setLocalPosition(p);
    });
    for(let i=this.flies.length-1;i>=0;i--) {
      const f=this.flies[i],age=time-f.born;
      if(age>=this.fireflyLifetime) {f.object.destroy();this.flies.splice(i,1);continue;}
      const drift=new vec3(Math.sin(age*.45+f.seed)*2,age*.6+Math.sin(age*.5+f.seed),Math.cos(age*.35+f.seed)*2);
      let position=f.origin.add(drift);
      if(!this.fireflyPositionClear(position)) {
        const replacement=this.findFireflyPosition();f.object.enabled=!!replacement;
        if(!replacement)continue;position=replacement;f.origin=position.sub(drift);
      } else f.object.enabled=true;
      f.object.getTransform().setWorldPosition(position);
      const end=Math.max(0,Math.min(1,(this.fireflyLifetime-age)/2)),start=Math.min(1,Math.max(0,age/1.5));
      const fade=end*end*(3-2*end)*(f.ambient?start*start*(3-2*start):1);
      f.object.getTransform().setLocalScale(vec3.one().uniformScale(this.fireflySize*(.5+.5*fade)));f.mat.mainPass.baseColor=new vec4(.65*fade,fade,.34*fade,1);
    }
    this.fireflyCount=this.flies.length;
  }
}
