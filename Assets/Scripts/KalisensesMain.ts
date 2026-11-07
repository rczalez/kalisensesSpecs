import {KalisensesPanelUI} from "./KalisensesPanelUI";
import {KalisensesInstrument} from "./KalisensesInstrument";
import {NOTES,LETTERS,SONGS,PerformanceScore,keyboardCodes,Song} from "./KalisensesMusic";
import {InputMethod,INPUT_NAMES,NoteContacts} from "./KalisensesInput";
import {KalisensesPlacement} from "./KalisensesPlacement";
import {Interactor,InteractorInputType} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
import {InteractionManager} from "SpectaclesInteractionKit.lspkg/Core/InteractionManager/InteractionManager";
import {HandInputData} from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/HandInputData";
import {KalisensesTutorial} from "./KalisensesTutorial";
import {KalisensesNarration} from "./KalisensesNarration";
const TRACKS:AudioTrackAsset[]=[
  requireAsset("../GeneratedSFX/D6.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/B5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/G5.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/E5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/C5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/A4.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/F4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/D4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/C4.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/E4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/G4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/B4.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/D5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/F5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/A5.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/C6.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/E6.wav") as AudioTrackAsset];
type Mode="menu"|"tutorial"|"placement"|"input"|"select"|"free"|"countin"|"playing"|"paused"|"results";
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
  public pausedAt=0;private resumeMode:"countin"|"playing"="playing";
  public inputMethod:InputMethod="physical";
  public tutorial!:KalisensesTutorial;public narration!:KalisensesNarration;
  private tutorialHands:()=>{tracked:boolean;attempting:boolean}=()=>({tracked:false,attempting:false});
  private navigationHeld=new Set<Keys>();private tutorialBeat=-1;
  private narrationLocked=false;private narrationBeganAt=0;
  private suppressedPointers=new Set<Interactor>();
  public get interactionsBlocked():boolean {if(this.narration)this.narration.update();return this.narrationLocked;}
  private contacts=new NoteContacts();
  private previewTracking:DeviceTracking|null=null;
  private watchedPointers=new Set<Interactor>();
  private releaseSubscriptions:(()=>void)[]=[];
  private codes:Keys[]=[];private held:boolean[]=new Array(17).fill(false);private voices:AudioComponent[]=[];private voice=0;private click!:AudioComponent;
  private queued:{index:number;time:number;source:InputMethod;contact:string}[]=[];private lastBeat=-1;private feedback="";private feedbackUntil=0;private feedbackColor=new vec4(.9,1,1,1);
  private seatedPosition=new vec3(0,0,0);private seatedRotation=quat.fromEulerAngles(-43*Math.PI/180,0,0);
  onAwake() {
    this.createEvent("OnStartEvent").bind(()=>this.initialize());
    this.createEvent("UpdateEvent").bind(()=>{if(this.ready)this.update();});
    this.createEvent("LateUpdateEvent").bind(()=>{if(this.ready&&this.lockPreviewCamera&&global.deviceInfoSystem.isEditor())this.seatCamera();});
    this.createEvent("OnDisableEvent").bind(()=>this.stop());
    this.createEvent("OnDestroyEvent").bind(()=>{this.stop();this.releaseSubscriptions.forEach(unsubscribe=>unsubscribe());});
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
    this.ui.canInteract=pointer=>!this.interactionsBlocked&&!this.suppressedPointers.has(pointer);
    this.ui.onNoteDown.add(e=>{this.watchRelease(e.interactor);if(e.interactor&&this.suppressedPointers.has(e.interactor)){this.contacts.down("virtual",e.contact);return;}this.noteDown("virtual",e.index,e.contact);});
    this.ui.onNoteUp.add(contact=>this.noteUp("virtual",contact));
    this.instrument.onNoteDown.add(e=>{this.watchRelease(e.interactor);if(e.interactor&&this.suppressedPointers.has(e.interactor)){this.contacts.down("pinch",e.contact);return;}this.noteDown("pinch",e.index,e.contact);});
    this.instrument.onNoteUp.add(contact=>this.noteUp("pinch",contact));
    this.ui.setInputMethod(this.inputMethod);
    this.ui.initializeTutorialDemo(this.instrument.sphere,this.instrument.surface);
    this.narration=new KalisensesNarration(this.sceneObject.createComponent("Component.AudioComponent") as AudioComponent,locked=>this.setNarrationLocked(locked));
    this.tutorial=new KalisensesTutorial({method:()=>this.inputMethod,placed:()=>this.placement.placed,editor:global.deviceInfoSystem.isEditor(),bpm:()=>this.bpm,
      draw:v=>this.ui.setTutorial(v),say:id=>this.narration.play(id),silence:()=>this.narration.stop(),mute:value=>this.narration.setMuted(value),
      exit:skipped=>{this.action(skipped?"free":"menu");}});
    const hands=HandInputData.getInstance();const right=hands.getHand("right"),left=hands.getHand("left");
    this.tutorialHands=()=>({tracked:this.inputMethod==="pinch"&&this.tutorial.step==="first"?right.isTracked():this.inputMethod==="pinch"&&this.tutorial.step==="other"?left.isTracked():right.isTracked()||left.isTracked(),attempting:right.isPinching()||left.isPinching()});
    this.placement.onStatus.add(status=>this.ui.setPlacementStatus(status));
    this.createEvent("KeyPressEvent").bind(e=>{
      if(this.interactionsBlocked){this.navigationHeld.add(e.key);const i=this.codes.indexOf(e.key);if(i>=0){this.held[i]=true;this.contacts.down("physical",String(i));}return;}
      if(this.tutorialKey(e.key))return;const i=this.codes.indexOf(e.key);if(i>=0){this.held[i]=true;this.noteDown("physical",i,String(i));}
    });
    this.createEvent("KeyReleaseEvent").bind(e=>{this.navigationHeld.delete(e.key);const i=this.codes.indexOf(e.key);if(i>=0){this.held[i]=false;this.noteUp("physical",String(i));}});
    this.seatCamera();this.placement.initialize();this.ready=true;
    if(!this.placement.placed){this.mode="placement";this.ui.show("placement");}
    print("[Kalisenses] READY 17 keys, L=B4, two modes, 32 voices");
  }
  private seatCamera() {if(!global.deviceInfoSystem.isEditor())return;const t=this.cameraObject.getTransform();t.setWorldPosition(this.seatedPosition);t.setWorldRotation(this.seatedRotation);}
  private suppressHeldPointers() {
    InteractionManager.getInstance().getInteractorsByType(InteractorInputType.All).forEach(pointer=>{
      this.watchRelease(pointer);if(pointer.isTriggering)this.suppressedPointers.add(pointer);
    });
  }
  private setNarrationLocked(locked:boolean) {
    if(locked===this.narrationLocked)return;
    this.suppressHeldPointers();this.narrationLocked=locked;this.queued=[];
    if(locked){this.narrationBeganAt=getTime();this.instrument.setPinchEnabled(false);}
    else if(this.tutorial)this.tutorial.resumeAfterNarration(Math.max(0,getTime()-this.narrationBeganAt),getTime());
    this.ui.setInteractionLocked(locked);
  }
  private tutorialKey(key:Keys):boolean {
    if(!global.deviceInfoSystem.isEditor())return false;
    if(!this.tutorial.active){if(this.mode==="menu"&&key===Keys.Space){if(!this.navigationHeld.has(key)){this.navigationHeld.add(key);this.action("tutorial");}return true;}return false;}
    const commands=new Map<Keys,string>([[Keys.Space,"next"],[Keys.Zero,"replay"],[Keys.One,"mute"],[Keys.Three,"skip"],[Keys.Four,"exit"],[Keys.Five,"help"]]);
    if(!commands.has(key)&&key!==Keys.Two&&key!==Keys.Six)return false;
    if(this.navigationHeld.has(key))return true;this.navigationHeld.add(key);
    if(key===Keys.Two){const methods:InputMethod[]=["physical","virtual","pinch"];this.action("input:"+methods[(methods.indexOf(this.inputMethod)+1)%3]);return true;}
    if(key===Keys.Six&&this.mode==="placement"){this.action("scan");return true;}
    if(key===Keys.Space&&this.mode==="placement"){this.action("confirm");return true;}
    if(key===Keys.Space&&this.mode==="input"){this.action("menu");return true;}
    const command=commands.get(key);if(command)this.action("tutorial:"+command);return true;
  }
  private stop() {this.voices.forEach(a=>{if(a.audioTrack)a.stop(false);});if(this.click)this.click.stop(false);if(this.narration)this.narration.stop();if(this.instrument.followCues)this.instrument.clearFollowFeedback();this.ui.setPaused(false);this.queued=[];this.held=this.codes.map(k=>KeyboardManager.isKeyPressed(k));this.feedback="";}
  public action(action:string) {
    if(this.interactionsBlocked)return;
    if(action==="pause") {
      const now=getTime()*1000;
      if(this.mode==="countin"||this.mode==="playing") {this.resumeMode=this.mode;this.pausedAt=now;this.mode="paused";this.queued=[];this.voices.forEach(a=>{if(a.audioTrack)a.stop(false);});this.click.stop(false);this.ui.setPaused(true);}
      else if(this.mode==="paused"&&this.score) {const delta=now-this.pausedAt;this.startMs+=delta;this.score.targets.forEach(t=>t.time+=delta);this.mode=this.resumeMode;this.ui.setPaused(false);}
      return;
    }
    if(action==="tutorial") {this.stop();this.score=null;this.mode="tutorial";this.ui.show("tutorial");this.tutorial.start(getTime());return;}
    if(action.startsWith("tutorial:")) {
      const command=action.slice(9);
      if(command==="replay")this.ui.restartTutorialDemo();
      if(command==="next"&&this.tutorial.active&&this.tutorial.step==="placement") {this.stop();this.mode="placement";this.ui.show("placement");this.placement.scan();return;}
      if(command==="next"&&this.tutorial.active&&this.tutorial.step==="complete"){this.tutorial.stop(true);return;}
      this.tutorial.action(command,getTime());return;
    }
    if(action==="menu"&&this.tutorial.active&&(this.mode==="input"||this.mode==="placement")) {
      if(this.mode==="placement"&&!this.placement.placed)return;
      if(this.mode==="placement")this.tutorial.action("next",getTime());
      this.mode="tutorial";this.ui.show("tutorial");this.tutorial.activity(getTime());this.tutorial.render();return;
    }
    if(action==="scan"){this.placement.scan();return;}
    if(action==="confirm"){if(this.placement.confirm())this.action("menu");return;}
    if(this.placement.placed&&this.placement.scanning&&action!=="placement")this.placement.cancel();
    if(!this.placement.placed&&action!=="placement"&&action!=="scan"&&action!=="confirm"&&!(action==="input"&&this.tutorial.active)&&!(action.startsWith("input:")&&this.tutorial.active)){this.mode="placement";this.ui.show("placement");return;}
    if(action.startsWith("input:")) {const method=action.slice(6) as InputMethod;if(INPUT_NAMES[method]){this.inputMethod=method;this.queued=[];this.ui.setInputMethod(method);this.instrument.setPinchEnabled(false);if(this.tutorial.active)this.tutorial.changedMethod(getTime());}return;}
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
    if(this.interactionsBlocked)return;
    if(!this.placement.placed)return;
    this.stop();this.mode="countin";this.ui.show("performance");this.startMs=getTime()*1000+4*60000/this.bpm;
    let beat=0;const times=song.notes.map((_,i)=>{const t=this.startMs+beat*60000/this.bpm;beat+=song.beats[i];return t;});
    this.score=new PerformanceScore(song.notes,times);this.lastBeat=-1;this.countInPulses=0;
    print("[Kalisenses] COUNTIN "+song.name+" "+this.bpm+" BPM");
  }
  private update() {
    this.narration.update();if(this.narrationLocked)this.suppressHeldPointers();
    if(this.previewTracking)this.previewTracking.enabled=!this.lockPreviewCamera;
    const now=getTime()*1000;
    // Poll as well as listening for events, preserving short taps and clearing released state.
    this.codes.forEach((k,i)=>{const down=KeyboardManager.isKeyPressed(k);if(down&&!this.held[i])this.noteDown("physical",i,String(i));if(!down)this.noteUp("physical",String(i));this.held[i]=down;});
    // Keep the current target alive until lift/unpinch has delivered its release.
    const playable=this.mode==="free"||this.mode==="playing"||this.mode==="countin"||(this.mode==="tutorial"&&(this.tutorial.canPlay()||this.tutorial.waitingRelease));
    this.ui.setPlayable(playable);this.instrument.setPinchEnabled(!this.narrationLocked&&playable&&this.inputMethod==="pinch");
    if(this.mode==="countin") {
      const beat=Math.floor((now-(this.startMs-4*60000/this.bpm))/(60000/this.bpm));
      if(beat<4 && beat!==this.lastBeat) {this.lastBeat=beat;this.countInPulses++;this.click.play(1);}
      this.ui.setCue("Count in  "+Math.min(4,beat+1)+" / 4",this.bpm+" BPM  •  get ready",new vec4(1,.86,.4,1));
      if(now>=this.startMs) this.mode="playing";
    }
    const presses=this.queued;this.queued=[];
    presses.forEach(p=>{
      if(this.interactionsBlocked)return;
      if(this.mode==="tutorial") {this.pluck(p.index);this.tutorial.performed(p.source,p.index,p.contact,this.contacts.isHeld(p.source,p.contact),now/1000);return;}
      if(this.mode!=="free" && this.mode!=="playing")return;
      if(this.mode==="playing" && p.time<this.startMs)return;
      this.pluck(p.index);
      if(this.mode==="playing" && this.score) {
        const ok=this.score.press(NOTES[p.index],p.time);this.instrument.showOutcome(p.index,ok?"correct":"incorrect",now/1000);this.feedback=ok?"✓ Correct":"× Try the glowing tine";this.feedbackColor=ok?new vec4(.4,1,.65,1):new vec4(1,.45,.32,1);this.feedbackUntil=now+600;
      }
    });
    let cue=-1;
    if(this.mode==="playing" && this.score) {
      this.score.targets.forEach(t=>{if(!t.judged&&now>t.time+400)this.instrument.showOutcome(NOTES.indexOf(t.note),"missed",now/1000);});
      const missed=this.score.expire(now);
      if(missed) {this.feedback="— Missed • keep going";this.feedbackColor=new vec4(.75,.6,.95,1);this.feedbackUntil=now+600;}
      const next=this.score.targets.find(t=>!t.judged);
      if(next) {cue=NOTES.indexOf(next.note);const remaining=(next.time-now)/1000;
        this.ui.setCue(next.note+"   [ "+LETTERS[cue]+" ]",now<this.feedbackUntil?this.feedback:(remaining<=0?"Play now":"Play when the orb reaches the tine"),now<this.feedbackUntil?this.feedbackColor:new vec4(.9,1,1,1));
      }
      else if(now<this.feedbackUntil)this.ui.setCue("Keep going",this.feedback,this.feedbackColor);
      const last=this.score.targets[this.score.targets.length-1];
      if(last && now>last.time+400) {
        this.mode="results";this.stop();this.ui.setResults(this.score.percent,this.score.correct,this.score.incorrect,this.score.missed);this.ui.show("results");this.instrument.celebrate(now/1000);print("[Kalisenses] RESULTS "+JSON.stringify({percent:this.score.percent,correct:this.score.correct,incorrect:this.score.incorrect,missed:this.score.missed}));
      }
    }
    if(this.mode==="tutorial") {
      if(!this.narrationLocked){const hands=this.tutorialHands();this.tutorial.update(now/1000,hands.tracked,hands.attempting,this.instrument.hoveredNote);}cue=this.tutorial.targetIndex();
      if(!this.narrationLocked&&this.tutorial.step==="timed") {const beat=Math.floor((now/1000-this.tutorial.timedStart)*this.bpm/60);if(beat!==this.tutorialBeat){this.tutorialBeat=beat;this.click.play(1);}}
      else this.tutorialBeat=-1;
      this.ui.updateTutorialDemo(now/1000);
    }
    if(this.score&&(this.mode==="countin"||this.mode==="playing"||this.mode==="paused")) {
      this.instrument.followCues.update(this.score.targets,this.mode==="paused"?this.pausedAt:now,this.bpm);
      if(this.mode==="paused"){this.instrument.followCues.pulsing=[];this.instrument.followCues.pulseLevels.fill(0);this.ui.setCue("Paused","Resume when you are ready",new vec4(.9,1,1,1));}
    } else this.instrument.followCues.clear();
    this.instrument.updateVisuals(now/1000,cue);
  }
  public noteDown(source:InputMethod,index:number,contact:string):boolean {
    if(!Number.isInteger(index)||index<0||index>=NOTES.length)return false;
    if(!this.contacts.down(source,contact))return false;
    if(this.interactionsBlocked)return false;
    if(this.tutorial&&this.tutorial.active)this.tutorial.activity(getTime());
    if(source!==this.inputMethod||(this.mode!=="free"&&this.mode!=="playing"&&!(this.mode==="tutorial"&&this.tutorial.canPlay())))return false;
    this.queued.push({index,time:getTime()*1000,source,contact});return true;
  }
  public noteUp(source:InputMethod,contact:string) {this.contacts.up(source,contact);if(this.tutorial&&!this.interactionsBlocked)this.tutorial.release(source,contact,getTime());}
  private watchRelease(pointer?:Interactor) {
    // LEAF may create interactors after startup. First contact is safely
    // after SIK initialization; listen globally so release outside a pad
    // still re-arms it, while cancellation alone never re-arms a held note.
    if(!pointer||this.watchedPointers.has(pointer))return;
    this.watchedPointers.add(pointer);
    this.releaseSubscriptions.push(pointer.onTriggerEnd.add(()=>{
      this.suppressedPointers.delete(pointer);
      const contact=String(pointer.inputType);this.noteUp("virtual",contact);this.noteUp("pinch",contact);
    }));
  }
  private pluck(index:number) {
    const a=this.voices[this.voice++%this.voices.length];a.audioTrack=TRACKS[index];a.volume=this.volume;a.play(1);
    this.lastAudio=a;this.plays++;this.lastNote=NOTES[index];this.lastIndex=index;this.instrument.pluck(index,getTime());
    print("[Kalisenses] KEY "+LETTERS[index]+" -> "+NOTES[index]+" tine="+index+" mode="+this.mode);
  }
}
