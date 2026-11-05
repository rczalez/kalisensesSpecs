import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

/** Pure checks are covered in preview; depth sensing remains a device check. */
export function suitableSurface(position:vec3,normal:vec3,eye:vec3):boolean {
  const d=position.distance(eye);
  const drop=eye.y-position.y;
  return Number.isFinite(d)&&d>=40&&d<=110&&drop>=20&&drop<=85&&normal.length>.5&&normal.normalize().dot(vec3.up())>=.985;
}

@component
export class KalisensesPlacement extends BaseScriptComponent {
  @input @hint("Instrument and dock move together under this authored world anchor") anchor!:SceneObject;
  @input @hint("World-tracked wearer camera") cameraObject!:SceneObject;
  public placed=false;
  public scanning=false;
  public onStatus=new Event<string>();
  public onPlaced=new Event<void>();
  private session:HitTestSession|null=null;
  private lastPoll=-1;
  private pending=false;
  private generation=0;
  private stable=0;
  private previous:vec3|null=null;
  private candidate:{position:vec3;rotation:quat;expires:number}|null=null;
  onAwake() {
    this.createEvent("UpdateEvent").bind(()=>this.update());
    this.createEvent("OnDisableEvent").bind(()=>this.cancel());
    this.createEvent("OnDestroyEvent").bind(()=>this.cancel());
  }
  public initialize() {
    this.placed=global.deviceInfoSystem.isEditor();
    if(this.placed)return;
    // Temporary setup content is world-anchored below the initial view, never head-following.
    const eye=this.cameraObject.getTransform();
    const away=eye.forward.uniformScale(-1);away.y=0;
    const forward=away.length>.01?away.normalize():new vec3(0,0,-1);
    this.anchor.getTransform().setWorldPosition(eye.getWorldPosition().add(forward.uniformScale(85)).add(new vec3(0,-50,0)));
    this.anchor.getTransform().setWorldRotation(quat.lookAt(forward.uniformScale(-1),vec3.up()));
    this.scan();
  }
  public scan() {
    this.cancel();
    if(global.deviceInfoSystem.isEditor()) {this.onStatus.invoke("Virtual tabletop · laptop preview\nReal surface sensing needs Specs.");return;}
    try {
      const module=require("LensStudio:WorldQueryModule") as WorldQueryModule;
      const options=HitTestSessionOptions.create();options.filter=true;
      this.session=module.createHitTestSessionWithOptions(options);this.session.start();
      this.scanning=true;this.onStatus.invoke("Look at a clear, level tabletop.\nKeep the playing area within reach.");
    } catch(e) {this.onStatus.invoke("Surface sensing unavailable.\nTry Find Surface again.");print("[Placement] "+String(e));}
  }
  public cancel() {
    this.generation++;this.scanning=false;this.pending=false;this.candidate=null;this.stable=0;this.previous=null;
    if(this.session){this.session.stop();this.session=null;}
  }
  private update() {
    if(this.pending&&getTime()-this.lastPoll>3){this.pending=false;this.generation++;this.stable=0;this.onStatus.invoke("Surface query timed out.\nKeep the table in view; trying again.");}
    if(!this.scanning||!this.session||this.pending||getTime()-this.lastPoll<.2)return;
    if(this.candidate) {
      if(getTime()>this.candidate.expires){this.candidate=null;this.stable=0;this.onStatus.invoke("Placement timed out.\nLook at the tabletop again.");}
      else return;
    }
    this.lastPoll=getTime();this.pending=true;
    const generation=this.generation,eye=this.cameraObject.getTransform(),start=eye.getWorldPosition();
    const end=start.add(eye.forward.uniformScale(-160));
    this.session.hitTest(start,end,hit=>{
      if(generation!==this.generation)return;
      if(!hit||!suitableSurface(hit.position,hit.normal,start)) {this.pending=false;this.stable=0;this.previous=null;this.onStatus.invoke("Look at a clear, level tabletop.\nWalls and steep surfaces are ignored.");return;}
      this.stable=this.previous&&this.previous.distance(hit.position)<2?this.stable+1:1;
      this.previous=hit.position;
      if(this.stable<3){this.pending=false;this.onStatus.invoke("Hold your view steady…\nChecking the table area.");return;}
      const normal=hit.normal.normalize();
      const toUser=start.sub(hit.position);const flat=toUser.sub(normal.uniformScale(toUser.dot(normal)));
      if(flat.length<.01){this.pending=false;this.stable=0;return;}
      const rotation=quat.lookAt(flat.normalize(),normal);
      // Check space for the instrument, rear dock and front note pads, not just a single hit.
      const offsets=[new vec3(-23,0,-44),new vec3(23,0,-44),new vec3(-23,0,30),new vec3(23,0,30)];
      let remaining=offsets.length,valid=true;
      offsets.forEach(offset=>{
        const p=hit.position.add(rotation.multiplyVec3(offset));
        this.session.hitTest(p.add(normal.uniformScale(12)),p.sub(normal.uniformScale(12)),corner=>{
          if(generation!==this.generation)return;
          valid=valid&&!!corner&&corner.normal.normalize().dot(normal)>.985&&Math.abs(corner.position.sub(p).dot(normal))<2;
          if(--remaining!==0)return;
          this.pending=false;
          if(!valid){this.stable=0;this.onStatus.invoke("More clear table space is needed.\nAllow room for the dock and note pads.");return;}
          this.candidate={position:hit.position.add(normal.uniformScale(2.2)),rotation,expires:getTime()+8};
          this.onStatus.invoke("Clear level surface found.\nConfirm Placement within 8 seconds.");
        });
      });
    });
  }
  public confirm():boolean {
    if(global.deviceInfoSystem.isEditor()){this.onStatus.invoke("Virtual tabletop is ready.\nSurface detection is a device check.");return true;}
    const c=this.candidate;
    if(!c||getTime()>c.expires){this.onStatus.invoke("Find a clear tabletop first.\nThen choose Confirm Placement.");return false;}
    this.anchor.getTransform().setWorldPosition(c.position);this.anchor.getTransform().setWorldRotation(c.rotation);
    this.placed=true;this.cancel();this.onPlaced.invoke();return true;
  }
}
