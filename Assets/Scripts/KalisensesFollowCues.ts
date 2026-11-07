import {NOTES,Target} from "./KalisensesMusic";

export const MAX_NOTE_ORBS=4;
export const ARRIVAL_PULSE_MS=220;
export interface OrbSample {target:number;index:number;remaining:number;progress:number;}
/** Use scheduled song time, never accumulated frame deltas or score judgement. */
export function sampleNoteOrbs(targets:Target[],now:number,bpm:number):OrbSample[] {
  const lead=Math.max(2000,Math.min(3000,2*60000/bpm));
  const result:OrbSample[]=[];
  for(let target=0;target<targets.length&&result.length<MAX_NOTE_ORBS;target++) {
    const t=targets[target],remaining=t.time-now,index=NOTES.indexOf(t.note);
    if(index>=0&&remaining>=0&&remaining<=lead)result.push({target,index,remaining,progress:1-remaining/lead});
  }
  return result;
}

/** A fixed pool, parented to the kalimba so placement and scale stay in sync. */
export class KalisensesFollowCues {
  public root:SceneObject;
  public samples:OrbSample[]=[];
  public pulsing:number[]=[];
  public pulseLevels:number[]=new Array(17).fill(0);
  public slots:SceneObject[]=[];
  constructor(parent:SceneObject,mesh:RenderMesh,material:Material,private lengths:number[]) {
    this.root=global.scene.createSceneObject("Follow Along Note Cues");this.root.setParent(parent);
    for(let i=0;i<MAX_NOTE_ORBS;i++) {
      const slot=global.scene.createSceneObject("Upcoming Orb "+i);slot.setParent(this.root);this.slots.push(slot);
      this.sphere(slot,"Amber halo",mesh,material,1.05,new vec4(.55,.19,0,1),true);
      this.sphere(slot,"Bright core",mesh,material,.5,new vec4(1,.88,.57,1),false);
      slot.enabled=false;
    }
  }
  private sphere(parent:SceneObject,name:string,mesh:RenderMesh,material:Material,size:number,color:vec4,additive:boolean) {
    const o=global.scene.createSceneObject(name);o.setParent(parent);o.getTransform().setLocalScale(vec3.one().uniformScale(size));
    const r=o.createComponent("Component.RenderMeshVisual") as RenderMeshVisual;r.mesh=mesh;
    const m=material.clone();m.mainPass.baseColor=color;m.mainPass.depthTest=true;
    if(additive){m.mainPass.blendMode=BlendMode.Add;m.mainPass.depthWrite=false;}
    r.mainMaterial=m;
  }
  public landing(index:number):vec3 {return new vec3((index-8)*1.8,3.55,-9+this.lengths[index]-2.3);}
  public clear() {this.samples=[];this.pulsing=[];this.pulseLevels.fill(0);this.slots.forEach(s=>s.enabled=false);}
  public update(targets:Target[],now:number,bpm:number) {
    this.samples=sampleNoteOrbs(targets,now,bpm);this.pulsing=[];this.pulseLevels.fill(0);
    targets.forEach(t=>{const age=now-t.time,index=NOTES.indexOf(t.note);if(index>=0&&age>=0&&age<ARRIVAL_PULSE_MS){this.pulsing.push(index);this.pulseLevels[index]=Math.max(this.pulseLevels[index],1-age/ARRIVAL_PULSE_MS);}});
    this.slots.forEach((slot,i)=>{
      const sample=this.samples[i];slot.enabled=!!sample;if(!sample)return;
      slot.name="Upcoming Orb "+i+" - "+NOTES[sample.index];
      const p=this.landing(sample.index);p.y+=14*(1-sample.progress);slot.getTransform().setLocalPosition(p);
    });
  }
}
