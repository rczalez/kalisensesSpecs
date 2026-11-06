import {AMBER,INK,SURFACE} from "./KalisensesTheme";
type Finger={base:vec3;lengths:number[];open:number[];pinch:number[];bones:SceneObject[];joints:SceneObject[];width:number;};
/** Connected schematic hand. Its animation is instructional, never tracking input. */
export class KalisensesGestureDemo {
  public root:SceneObject;
  public phase="Aim first · fingers open";
  public tipGap=0;
  private fingers:Finger[]=[];
  private contact:SceneObject;
  private started=-1;
  private model:SceneObject;
  constructor(parent:SceneObject,mesh:RenderMesh,material:Material) {
    this.root=global.scene.createSceneObject("Simulated Pinch Demonstration");this.root.setParent(parent);
    this.model=global.scene.createSceneObject("Demo hand silhouette");this.model.setParent(this.root);
    this.model.getTransform().setLocalPosition(new vec3(.75,-.1,.85));
    const skin=material.clone();skin.mainPass.baseColor=INK;
    const cuff=material.clone();cuff.mainPass.baseColor=SURFACE;
    const accent=material.clone();accent.mainPass.baseColor=AMBER;
    const part=(name:string,pos:vec3,scale:vec3,mat:Material)=>{
      const obj=global.scene.createSceneObject(name);obj.setParent(this.model);
      obj.getTransform().setLocalPosition(pos);obj.getTransform().setLocalScale(scale);
      const rm=obj.createComponent("Component.RenderMeshVisual") as RenderMeshVisual;rm.mesh=mesh;rm.mainMaterial=mat;return obj;
    };
    part("Demo wrist",new vec3(.1,-2.05,0),new vec3(1.45,1.05,.52),skin);
    part("Demo cuff",new vec3(.1,-2.5,-.02),new vec3(1.65,.5,.58),cuff);
    part("Demo palm",new vec3(0,-.75,0),new vec3(2.65,2.7,.62),skin);
    part("Demo thumb web",new vec3(-.82,-.95,.04),new vec3(1.1,1.3,.57),skin);
    // The middle, ring and little fingers curl to the right of the index.
    for(let i=0;i<3;i++) {
      const x=i*.62-.02,y=.55-i*.14,w=.48-i*.035;
      part("Demo curled knuckle "+i,new vec3(x,y,.18),new vec3(w,.85,.52),skin);
      part("Demo curled fingertip "+i,new vec3(x,y-.44,.47),new vec3(w,.72,.46),skin);
    }
    const finger=(name:string,base:vec3,lengths:number[],open:number[],pinch:number[],width:number)=>{
      const bones=lengths.map((_,i)=>part(name+" segment "+i,base,vec3.one(),skin));
      const joints=lengths.map((_,i)=>part(name+" joint "+i,base,new vec3(width,width,.5),skin));
      this.fingers.push({base,lengths,open,pinch,bones,joints,width});
    };
    // Angles are absolute from +Y; segment lengths stay constant as joints bend.
    finger("Demo index",new vec3(-.75,.6,.12),[1.05,.75,.5],[-.05,-.04,-.05],[-.33,-1.2,-3.0],.43);
    finger("Demo thumb",new vec3(-1,-.8,.16),[1.05,.86,.45],[-1,-1.3,-1.4],[-.85,-.51,.09],.46);
    this.contact=part("Demo pinch contact",vec3.zero(),new vec3(.16,.16,.08),accent);
    this.contact.enabled=false;
  }
  public restart() {this.started=-1;}
  public update(time:number,left:boolean,large:boolean) {
    if(!this.root.enabled)return;
    if(this.started<0)this.started=time;
    const p=Math.max(0,time-this.started)%7.2;
    const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
    const closed=p<1.5?0:p<2.8?ease((p-1.5)/1.3):p<4.2?1:p<5.6?1-ease((p-4.2)/1.4):0;
    this.phase=p<1.5?"Aim first · fingers open":p<2.8?"Bring thumb + index together":p<4.2?"Pinch once · gentle contact":p<5.6?"Open fingers to release":"Released · ready to play again";
    const tips:vec3[]=[];
    this.fingers.forEach(f=>{
      let a=f.base;
      f.lengths.forEach((length,i)=>{
        const angle=f.open[i]+(f.pinch[i]-f.open[i])*closed;
        const b=a.add(new vec3(Math.sin(angle)*length,Math.cos(angle)*length,0));
        const bone=f.bones[i].getTransform();bone.setLocalPosition(a.add(b).uniformScale(.5));
        bone.setLocalScale(new vec3(f.width,length+f.width*.8,.48));
        bone.setLocalRotation(quat.fromEulerAngles(0,0,-angle));
        f.joints[i].getTransform().setLocalPosition(b);a=b;
      });
      tips.push(a);
    });
    this.tipGap=tips[0].distance(tips[1]);
    this.contact.enabled=closed>.98;
    this.contact.getTransform().setLocalPosition(tips[0].add(tips[1]).uniformScale(.5).add(new vec3(0,0,.32)));
    const scale=large?1.12:1;
    this.root.getTransform().setLocalScale(new vec3((left?-1:1)*scale,scale,scale));
  }
}
