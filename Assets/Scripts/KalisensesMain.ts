import {KalisensesPanelUI} from "./KalisensesPanelUI";
import {KalisensesInstrument} from "./KalisensesInstrument";
import {NOTES,LETTERS,SONGS,PerformanceScore,keyboardCodes,Song} from "./KalisensesMusic";
const TRACKS:AudioTrackAsset[]=[
  requireAsset("../GeneratedSFX/D6.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/B5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/G5.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/E5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/C5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/A4.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/F4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/D4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/C4.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/E4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/G4.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/B4.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/D5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/F5.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/A5.wav") as AudioTrackAsset,
  requireAsset("../GeneratedSFX/C6.wav") as AudioTrackAsset,requireAsset("../GeneratedSFX/E6.wav") as AudioTrackAsset];
type Mode="menu"|"select"|"free"|"countin"|"playing"|"results";
@component
export class KalisensesMain extends BaseScriptComponent {
  @input @hint("World-space UIKit views") ui!:KalisensesPanelUI;
  @input @hint("Measured animated instrument") instrument!:KalisensesInstrument;
  @input @hint("Preview camera") cameraObject!:SceneObject;
  @input @hint("Low latency instrument volume") @widget(new SliderWidget(0,1,.05)) volume:number=.3;
  public mode:Mode="menu";public bpm=60;public songIndex=0;public score:PerformanceScore|null=null;
  public plays=0;public lastNote="";public lastIndex=-1;public lastAudio:AudioComponent|null=null;
  public countInPulses=0;public startMs=0;public ready=false;
  private codes:Keys[]=[];private held:boolean[]=new Array(17).fill(false);private voices:AudioComponent[]=[];private voice=0;private click!:AudioComponent;
  private queued:{index:number;time:number}[]=[];private lastBeat=-1;private feedback="";private feedbackUntil=0;private feedbackColor=new vec4(.9,1,1,1);
  private seatedPosition=new vec3(0,0,0);private seatedRotation=quat.fromEulerAngles(-Math.atan2(65,60),0,0);
  onAwake() {
    this.createEvent("OnStartEvent").bind(()=>this.initialize());
    this.createEvent("UpdateEvent").bind(()=>{if(this.ready)this.update();});
    this.createEvent("LateUpdateEvent").bind(()=>{if(this.ready && this.mode!=="menu" && this.mode!=="select")this.seatCamera();});
    this.createEvent("OnDisableEvent").bind(()=>this.stop());
  }
  private initialize() {
    this.codes=keyboardCodes();this.ui.initializeView();this.instrument.initializeInstrument();this.ui.labelTines(this.instrument.sceneObject,this.instrument.lengths);
    for(let i=0;i<32;i++) {const a=this.sceneObject.createComponent("Component.AudioComponent") as AudioComponent;a.playbackMode=Audio.PlaybackMode.LowLatency;a.volume=this.volume;this.voices.push(a);}
    this.click=this.sceneObject.createComponent("Component.AudioComponent") as AudioComponent;this.click.audioTrack=requireAsset("../GeneratedSFX/CountClick.wav") as AudioTrackAsset;this.click.volume=.15;this.click.playbackMode=Audio.PlaybackMode.LowLatency;
    this.ui.onAction.add(action=>this.action(action));
    this.createEvent("KeyPressEvent").bind(e=>{const i=this.codes.indexOf(e.key);if(i>=0 && !this.held[i]){this.held[i]=true;this.queued.push({index:i,time:getTime()*1000});}});
    this.createEvent("KeyReleaseEvent").bind(e=>{const i=this.codes.indexOf(e.key);if(i>=0)this.held[i]=false;});
    this.seatCamera();this.ready=true;print("[Kalisenses] READY 17 keys, L=B4, two modes, 32 voices");
  }
  private seatCamera() {const t=this.cameraObject.getTransform();t.setWorldPosition(this.seatedPosition);t.setWorldRotation(this.seatedRotation);}
  private stop() {this.voices.forEach(a=>{if(a.audioTrack)a.stop(false);});if(this.click)this.click.stop(false);this.queued=[];this.held=this.codes.map(k=>KeyboardManager.isKeyPressed(k));this.feedback="";}
  public action(action:string) {
    if(action==="slower"||action==="faster") {if(this.mode==="select")this.bpm=Math.max(40,Math.min(80,this.bpm+(action==="slower"?-10:10)));this.ui.setTempo(this.bpm);return;}
    if(action.startsWith("song")){this.songIndex=Number(action.slice(4));this.beginSong();return;}
    if(action==="restart") {this.beginSong();return;}
    this.stop();this.score=null;
    if(action==="free") {this.mode="free";this.ui.show("free");this.seatCamera();}
    else if(action==="select") {this.mode="select";this.ui.show("select");this.ui.setTempo(this.bpm);this.seatCamera();}
    else {this.mode="menu";this.ui.show("menu");}
    print("[Kalisenses] MODE "+this.mode);
  }
  public beginSong(song:Song=SONGS[this.songIndex]) {
    this.stop();this.mode="countin";this.ui.show("performance");this.startMs=getTime()*1000+4*60000/this.bpm;
    let beat=0;const times=song.notes.map((_,i)=>{const t=this.startMs+beat*60000/this.bpm;beat+=song.beats[i];return t;});
    this.score=new PerformanceScore(song.notes,times);this.lastBeat=-1;this.countInPulses=0;
    print("[Kalisenses] COUNTIN "+song.name+" "+this.bpm+" BPM");
  }
  private update() {
    const now=getTime()*1000;
    // Poll as well as listening for events, preserving short taps and clearing released state.
    this.codes.forEach((k,i)=>{const down=KeyboardManager.isKeyPressed(k);if(down&&!this.held[i])this.queued.push({index:i,time:now});this.held[i]=down;});
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
  private pluck(index:number) {
    const a=this.voices[this.voice++%this.voices.length];a.audioTrack=TRACKS[index];a.volume=this.volume;a.play(1);
    this.lastAudio=a;this.plays++;this.lastNote=NOTES[index];this.lastIndex=index;this.instrument.pluck(index,getTime());
    print("[Kalisenses] KEY "+LETTERS[index]+" -> "+NOTES[index]+" tine="+index+" mode="+this.mode);
  }
}
