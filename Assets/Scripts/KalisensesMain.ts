import {KalisensesPanelUI} from "./KalisensesPanelUI";
import {KalisensesInstrument} from "./KalisensesInstrument";
import {NOTES,LETTERS,SONGS,PerformanceScore,keyboardCodes,Song} from "./KalisensesMusic";
import {InputMethod,INPUT_NAMES,NoteContacts} from "./KalisensesInput";
import {KalisensesPlacement} from "./KalisensesPlacement";
import {Interactor} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
const TRACKS:AudioTrackAsset[]=[
  requireAsset("../GeneratedSFX/D6.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/B5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/G5.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/E5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/C5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/A4.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/F4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/D4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/C4.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/E4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/G4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/B4.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/D5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/F5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/A5.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/C6.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/E6.wav") as AudioTrackAsset];
type Mode="menu"|"placement"|"input"|"select"|"free"|"countin"|"playing"|"results";
@component
export class KalisensesMain extends BaseScriptComponent {
  @input @hint("World-space UIKit views") ui!:KalisensesPanelUI;
  @input @hint("Measured animated instrument") instrument!:KalisensesInstrument;
  @input @hint("Preview camera") cameraObject!:SceneObject;
  @input @hint("Confirmed world-surface placement; preview uses the authored virtual table") placement!:KalisensesPlacement;
  @input @hint("Low latency instrument volume") @widget(new SliderWidget(0,1,.05)) volume:number=.3;
  @input @hint("Laptop only: keep note keys from navigating the preview camera. Disable to inspect other viewpoints.") lockPreviewCamera:boolean=true;
  public mode:Mode="menu";public bpm=60;public songIndex=0;public score:PerformanceScore|null=null;
  public plays=0;public lastNote="";public lastIndex=-1;public lastAudio:AudioComponent|null=null;
  public countInPulses=0;public startMs=0;public ready=false;
  public inputMethod:InputMethod="physical";
  private contacts=new NoteContacts();
  private previewTracking:DeviceTracking|null=null;
  private watchedPointers=new Set<Interactor>();
  private releaseSubscriptions:(()=>void)[]=[];
  private codes:Keys[]=[];private held:boolean[]=new Array(17).fill(false);private voices:AudioComponent[]=[];private voice=0;private click!:AudioComponent;
  private queued:{index:number;time:number}[]=[];private lastBeat=-1;private feedback="";private feedbackUntil=0;private feedbackColor=new vec4(.9,1,1,1);
  private seatedPosition=new vec3(0,0,0);private seatedRotation=quat.fromEulerAngles(-43*Math.PI/180,0,0);
  onAwake() {
    this.createEvent("OnStartEvent").bind(()=>this.initialize());
    this.createEvent("UpdateEvent").bind(()=>{if(this.ready)this.update();});
    this.createEvent("LateUpdateEvent").bind(()=>{if(this.ready&&this.lockPreviewCamera&&global.deviceInfoSystem.isEditor())this.seatCamera();});
    this.createEvent("OnDisableEvent").bind(()=>this.stop());
    this.createEvent("OnDestroyEvent").bind(()=>this.releaseSubscriptions.forEach(unsubscribe=>unsubscribe()));
  }
  private initialize() {
    if(global.deviceInfoSystem.isEditor()) {
      const camera=this.cameraObject.getComponent("Component.Camera") as Camera;
      // Stereo preview requires All, just like Specs. Only tracking is locked.
      camera.devicePropertyUsage=Camera.DeviceProperty.All;
      this.previewTracking=this.cameraObject.getComponent("Component.DeviceTracking") as DeviceTracking;
      if(this.previewTracking)this.previewTracking.enabled=!this.lockPreviewCamera;
    }
    this.codes=keyboardCodes();this.ui.initializeView();this.instrument.initializeInstrument();this.ui.labelTines(this.instrument.sceneObject,this.instrument.lengths);
    for(let i=0;i<32;i++) {const a=this.sceneObject.createComponent("Component.AudioComponent") as AudioComponent;a.playbackMode=Audio.PlaybackMode.LowLatency;a.volume=this.volume;this.voices.push(a);}
    this.click=this.sceneObject.createComponent("Component.AudioComponent") as AudioComponent;this.click.audioTrack=requireAsset("../GeneratedSFX/CountClick.wav") as AudioTrackAsset;this.click.volume=.15;this.click.playbackMode=Audio.PlaybackMode.LowLatency;
    this.ui.onAction.add(action=>this.action(action));
    this.ui.onNoteDown.add(e=>{this.watchRelease(e.interactor);this.noteDown("virtual",e.index,e.contact);});
    this.ui.onNoteUp.add(contact=>this.noteUp("virtual",contact));
    this.instrument.onNoteDown.add(e=>{this.watchRelease(e.interactor);this.noteDown("pinch",e.index,e.contact);});
    this.instrument.onNoteUp.add(contact=>this.noteUp("pinch",contact));
    this.ui.setInputMethod(this.inputMethod);
    this.placement.onStatus.add(status=>this.ui.setPlacementStatus(status));
    this.createEvent("KeyPressEvent").bind(e=>{const i=this.codes.indexOf(e.key);if(i>=0){this.held[i]=true;this.noteDown("physical",i,String(i));}});
    this.createEvent("KeyReleaseEvent").bind(e=>{const i=this.codes.indexOf(e.key);if(i>=0){this.held[i]=false;this.noteUp("physical",String(i));}});
    this.seatCamera();this.placement.initialize();this.ready=true;
    if(!this.placement.placed){this.mode="placement";this.ui.show("placement");}
    print("[Kalisenses] READY 17 keys, L=B4, two modes, 32 voices");
  }
  private seatCamera() {if(!global.deviceInfoSystem.isEditor())return;const t=this.cameraObject.getTransform();t.setWorldPosition(this.seatedPosition);t.setWorldRotation(this.seatedRotation);}
  private stop() {this.voices.forEach(a=>{if(a.audioTrack)a.stop(false);});if(this.click)this.click.stop(false);this.queued=[];this.held=this.codes.map(k=>KeyboardManager.isKeyPressed(k));this.feedback="";}
  public action(action:string) {
    if(action==="scan"){this.placement.scan();return;}
    if(action==="confirm"){if(this.placement.confirm())this.action("menu");return;}
    if(this.placement.placed&&this.placement.scanning&&action!=="placement")this.placement.cancel();
    if(!this.placement.placed&&action!=="placement"&&action!=="scan"&&action!=="confirm"){this.mode="placement";this.ui.show("placement");return;}
    if(action.startsWith("input:")) {const method=action.slice(6) as InputMethod;if(INPUT_NAMES[method]){this.inputMethod=method;this.queued=[];this.ui.setInputMethod(method);this.instrument.setPinchEnabled(false);}return;}
    if(action==="slower"||action==="faster") {if(this.mode==="select")this.bpm=Math.max(40,Math.min(80,this.bpm+(action==="slower"?-10:10)));this.ui.setTempo(this.bpm);return;}
    if(action.startsWith("song")){this.songIndex=Number(action.slice(4));this.beginSong();return;}
    if(action==="restart") {this.beginSong();return;}
    this.stop();this.score=null;
    if(action==="placement") {this.mode="placement";this.ui.show("placement");this.ui.setPlacementStatus(this.placement.placed?"World anchor stays fixed as you move.\nFind Surface to place it again.":"Look at a clear, level tabletop.");if(global.deviceInfoSystem.isEditor())this.placement.scan();}
    else if(action==="input") {this.mode="input";this.ui.show("input");}
    else if(action==="free") {this.mode="free";this.ui.show("free");}
    else if(action==="select") {this.mode="select";this.ui.show("select");this.ui.setTempo(this.bpm);}
    else {this.mode="menu";this.ui.show("menu");}
    print("[Kalisenses] MODE "+this.mode);
  }
  public beginSong(song:Song=SONGS[this.songIndex]) {
    if(!this.placement.placed)return;
    this.stop();this.mode="countin";this.ui.show("performance");this.startMs=getTime()*1000+4*60000/this.bpm;
    let beat=0;const times=song.notes.map((_,i)=>{const t=this.startMs+beat*60000/this.bpm;beat+=song.beats[i];return t;});
    this.score=new PerformanceScore(song.notes,times);this.lastBeat=-1;this.countInPulses=0;
    print("[Kalisenses] COUNTIN "+song.name+" "+this.bpm+" BPM");
  }
  private update() {
    if(this.previewTracking)this.previewTracking.enabled=!this.lockPreviewCamera;
    const now=getTime()*1000;
    // Poll as well as listening for events, preserving short taps and clearing released state.
    this.codes.forEach((k,i)=>{const down=KeyboardManager.isKeyPressed(k);if(down&&!this.held[i])this.noteDown("physical",i,String(i));if(!down)this.noteUp("physical",String(i));this.held[i]=down;});
    const playable=this.mode==="free"||this.mode==="playing"||this.mode==="countin";
    this.ui.setPlayable(playable);this.instrument.setPinchEnabled(playable&&this.inputMethod==="pinch");
    if(this.mode==="countin") {
      const beat=Math.floor((now-(this.startMs-4*60000/this.bpm))/(60000/this.bpm));
      if(beat<4 && beat!==this.lastBeat) {this.lastBeat=beat;this.countInPulses++;this.click.play(1);}
      this.ui.setCue("Count in  "+Math.min(4,beat+1)+" / 4",this.bpm+" BPM  •  get ready",new vec4(1,.86,.4,1));
      if(now>=this.startMs) this.mode="playing";
    }
    const presses=this.queued;this.queued=[];
    presses.forEach(p=>{
      if(this.mode!=="free" && this.mode!=="playing")return;
      if(this.mode==="playing" && p.time<this.startMs)return;
      this.pluck(p.index);
      if(this.mode==="playing" && this.score) {
        const ok=this.score.press(NOTES[p.index],p.time);this.feedback=ok?"✓ Correct":"× Try the highlighted key";this.feedbackColor=ok?new vec4(.4,1,.65,1):new vec4(1,.72,.3,1);this.feedbackUntil=now+600;
      }
    });
    let cue=-1;
    if(this.mode==="playing" && this.score) {
      const missed=this.score.expire(now);
      if(missed) {this.feedback="— Missed • keep going";this.feedbackColor=new vec4(.75,.6,.95,1);this.feedbackUntil=now+600;}
      const next=this.score.targets.find(t=>!t.judged);
      if(next) {cue=NOTES.indexOf(next.note);const remaining=(next.time-now)/1000;
        const bar="●"+"·".repeat(Math.max(0,Math.min(10,Math.ceil(remaining*10))));
        this.ui.setCue(next.note+"   [ "+LETTERS[cue]+" ]   "+bar,now<this.feedbackUntil?this.feedback:(remaining<=.4?"Play now":"Approaching  "+remaining.toFixed(1)+"s"),now<this.feedbackUntil?this.feedbackColor:new vec4(.9,1,1,1));
      }
      const last=this.score.targets[this.score.targets.length-1];
      if(last && now>last.time+400) {
        this.mode="results";this.stop();this.ui.setResults(this.score.percent,this.score.correct,this.score.incorrect,this.score.missed);this.ui.show("results");this.instrument.celebrate(now/1000);print("[Kalisenses] RESULTS "+JSON.stringify({percent:this.score.percent,correct:this.score.correct,incorrect:this.score.incorrect,missed:this.score.missed}));
      }
    }
    this.instrument.updateVisuals(now/1000,cue);
  }
  public noteDown(source:InputMethod,index:number,contact:string):boolean {
    if(!Number.isInteger(index)||index<0||index>=NOTES.length)return false;
    if(!this.contacts.down(source,contact))return false;
    if(source!==this.inputMethod||(this.mode!=="free"&&this.mode!=="playing"))return false;
    this.queued.push({index,time:getTime()*1000});return true;
  }
  public noteUp(source:InputMethod,contact:string) {this.contacts.up(source,contact);}
  private watchRelease(pointer?:Interactor) {
    // LEAF may create interactors after startup. First contact is safely
    // after SIK initialization; listen globally so release outside a pad
    // still re-arms it, while cancellation alone never re-arms a held note.
    if(!pointer||this.watchedPointers.has(pointer))return;
    this.watchedPointers.add(pointer);
    this.releaseSubscriptions.push(pointer.onTriggerEnd.add(()=>{
      const contact=String(pointer.inputType);this.noteUp("virtual",contact);this.noteUp("pinch",contact);
    }));
  }
  private pluck(index:number) {
    const a=this.voices[this.voice++%this.voices.length];a.audioTrack=TRACKS[index];a.volume=this.volume;a.play(1);
    this.lastAudio=a;this.plays++;this.lastNote=NOTES[index];this.lastIndex=index;this.instrument.pluck(index,getTime());
    print("[Kalisenses] KEY "+LETTERS[index]+" -> "+NOTES[index]+" tine="+index+" mode="+this.mode);
  }
}
