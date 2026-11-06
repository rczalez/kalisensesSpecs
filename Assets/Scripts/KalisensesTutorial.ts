import {InputMethod,INPUT_NAMES} from "./KalisensesInput";
import {NOTES,LETTERS} from "./KalisensesMusic";

export type TutorialStep="intro"|"placement"|"choose"|"demo"|"first"|"release"|"other"|"sequence"|"melody"|"offer"|"timed"|"complete";
export const TWINKLE_NOTES="C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4 G4 G4 F4 F4 E4 E4 D4 G4 G4 F4 F4 E4 E4 D4 C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4".split(" ");
export const TWINKLE_BEATS=TWINKLE_NOTES.map((_,i)=>(i+1)%7===0?2:1);
const PRACTICE=["C4","D4","E4","C4"];
const ORDER:TutorialStep[]=["intro","placement","choose","demo","first","release","other","sequence","melody","offer","timed","complete"];
export interface TutorialView {title:string;caption:string;cue:string;status:string;demo:boolean;left:boolean;largeDemo:boolean;next:boolean;muted:boolean;}
export interface TutorialHost {
  method:()=>InputMethod;placed:()=>boolean;editor:boolean;bpm:()=>number;
  draw:(v:TutorialView)=>void;say:(id:string)=>void;silence:()=>void;mute:(value:boolean)=>void;
  exit:(skipped:boolean)=>void;
}
/** Tutorial progression never uses PerformanceScore: wrong notes and late notes have no penalty. */
export class KalisensesTutorial {
  public active=false;public step:TutorialStep="intro";public index=0;public muted=false;
  public waitingRelease=false;public helpCount=0;public completionCount=0;
  public timedDue=0;public lastActivity=0;public trackingNotice=false;
  public timedStart=0;
  private hold:{source:InputMethod;contact:string}|null=null;
  private releasedAt=-1;private entered=0;private lastPrompt=0;private missingSince=-1;
  private trackingWarned=false;private hover=-1;private detailed=false;private message="";
  private lastUpdate=0;private lostTime=0;
  constructor(private h:TutorialHost) {}
  public start(now:number) {this.active=true;this.hold=null;this.waitingRelease=false;this.helpCount=0;this.trackingWarned=false;this.trackingNotice=false;this.lostTime=0;this.missingSince=-1;this.lastUpdate=now;this.setStep("intro",now);}
  public stop(skipped=false) {this.active=false;this.hold=null;this.waitingRelease=false;this.h.silence();this.h.exit(skipped);}
  public activity(now:number) {this.lastActivity=now;}
  public resumeAfterNarration(seconds:number,now:number) {
    if(!this.active)return;
    this.entered+=seconds;if(this.releasedAt>=0)this.releasedAt+=seconds;
    if(this.step==="timed"){this.timedStart+=seconds;this.timedDue+=seconds;}
    this.lastActivity=now;this.lastPrompt=now;this.lastUpdate=now;
  }
  private setStep(step:TutorialStep,now:number) {
    this.step=step;this.index=0;this.entered=now;this.lastActivity=now;this.lastPrompt=now;this.message="";this.detailed=false;
    this.releasedAt=-1;this.hold=null;this.waitingRelease=false;
    if(step==="timed"){this.timedStart=now;this.timedDue=now+4*60/this.h.bpm();}
    if(step==="complete")this.completionCount++;
    this.render();this.speak();print("[Tutorial] STEP "+step);
  }
  public action(action:string,now:number) {
    if(!this.active)return;this.activity(now);
    if(action==="exit"||action==="skip"){this.stop(action==="skip");return;}
    if(action==="mute"){this.muted=!this.muted;this.h.mute(this.muted);this.render();return;}
    if(action==="replay"){this.lastPrompt=now;this.speak();return;}
    if(action==="help"){this.help(now,false);return;}
    if(action!=="next")return;
    if(this.step==="intro")this.setStep("placement",now);
    else if(this.step==="placement") {if(this.h.placed())this.setStep("choose",now);else{this.message="Find a surface, then confirm below.";this.render();}}
    else if(this.step==="choose")this.setStep("demo",now);
    else if(this.step==="demo")this.setStep("first",now);
    else if(this.step==="offer")this.setStep("timed",now);
    else if(this.step==="complete")this.stop();
  }
  public changedMethod(now:number) {
    // A lost tracked hand may never deliver pinch-up. Keep the earned note and
    // finish its tutorial release when selecting a different source. The old
    // source's NoteContacts latch remains armed until its real release arrives.
    if(this.waitingRelease&&this.hold&&this.hold.source!==this.h.method()&&this.releasedAt<0)this.releasedAt=now;
    this.trackingNotice=false;this.missingSince=-1;this.lostTime=0;this.trackingWarned=false;this.message="Progress kept. "+INPUT_NAMES[this.h.method()];this.lastActivity=now;this.render();this.speak();
  }
  public targetIndex():number {
    if(["first","release","other"].indexOf(this.step)>=0)return NOTES.indexOf("C4");
    const list=this.step==="sequence"?PRACTICE:TWINKLE_NOTES;
    return ["sequence","melody","timed"].indexOf(this.step)>=0?NOTES.indexOf(list[this.index]):-1;
  }
  public canPlay():boolean {return this.active&&["first","other","sequence","melody","timed"].indexOf(this.step)>=0;}
  public performed(source:InputMethod,index:number,contact:string,held:boolean,now:number) {
    if(!this.active)return;this.activity(now);
    if(!this.canPlay()||this.waitingRelease)return;
    const wanted=this.step==="first"?"2":this.step==="other"?"1":"";
    if(source==="pinch"&&wanted&&contact!==wanted){this.message="Try your "+(wanted==="2"?"right":"left")+" hand this time.";this.render();return;}
    if(index!==this.targetIndex()){this.message="Keep exploring. Try the amber note.";this.render();return;}
    if(this.step==="timed"&&now<this.timedDue-.4){this.message="Almost. Release, then try on the pulse.";this.render();return;}
    this.waitingRelease=true;this.hold={source,contact};this.releasedAt=held?-1:now;
    if(this.step==="first") {this.step="release";this.entered=now;this.speak();print("[Tutorial] STEP release");}
    this.message="Lovely sound. Release to continue.";this.render();
  }
  public release(source:InputMethod,contact:string,now:number) {
    // Keyboard polling reports an up key each frame. Latch the first edge.
    if(this.hold&&this.releasedAt<0&&source===this.hold.source&&contact===this.hold.contact)this.releasedAt=now;
  }
  public update(now:number,tracked:boolean,attempting:boolean,hover:number) {
    if(!this.active)return;
    const dt=this.lastUpdate?Math.min(.2,Math.max(0,now-this.lastUpdate)):0;this.lastUpdate=now;
    if(attempting||hover!==this.hover){
      this.activity(now);
      if(hover!==this.hover&&hover===this.targetIndex()&&this.h.method()==="pinch"&&this.canPlay()){this.message="Target found. Pinch once, then open.";this.render();}
      this.hover=hover;
    }
    if(this.waitingRelease&&this.releasedAt>=0&&now-this.entered>.65&&now-this.releasedAt>.12) {
      this.waitingRelease=false;this.hold=null;
      if(this.step==="release")this.setStep("other",now);
      else if(this.step==="other")this.setStep("sequence",now);
      else {
        const count=this.step==="sequence"?PRACTICE.length:TWINKLE_NOTES.length;
        if(++this.index===count)this.setStep(this.step==="sequence"?"melody":this.step==="melody"?"offer":"complete",now);
        else {if(this.step==="timed")this.timedDue=Math.max(this.timedDue+TWINKLE_BEATS[this.index-1]*60/this.h.bpm(),now+.3);this.message="Nice! Here comes the next note.";this.render();}
      }
    }
    const handMode=this.h.method()!=="physical";
    this.lostTime=handMode&&!tracked?Math.min(6,this.lostTime+dt):Math.max(0,this.lostTime-dt*.5);
    if(handMode&&!tracked&&!this.h.editor){if(this.missingSince<0)this.missingSince=now;
      if((now-this.missingSince>5||this.lostTime>3)&&!this.trackingWarned&&!attempting&&now-this.lastActivity>3){this.trackingNotice=true;this.trackingWarned=true;this.help(now,true);}
    }else{this.missingSince=-1;if(this.trackingNotice){this.trackingNotice=false;this.message="Hands back in view. Take your time.";this.render();}}
    // Quiet-time reminder only; held pinches and recent attempts suppress prompts.
    if(this.canPlay()&&now-this.lastActivity>18&&now-this.lastPrompt>25&&!attempting&&!this.waitingRelease)this.help(now,false);
    if(this.step==="timed")this.render(now);
  }
  private help(now:number,tracking:boolean) {
    this.helpCount++;this.detailed=true;this.lastPrompt=now;
    this.message=tracking?"Hands not steady? Try another input.":"Take your time. Replay or change input.";
    this.render();this.h.say(tracking?"tracking":"help-"+this.h.method());
  }
  private speak() {
    const id=["demo","first","other"].indexOf(this.step)>=0?"action-"+this.h.method():this.step;
    this.h.say(id);
  }
  public render(now=0) {
    const method=this.h.method(),key=LETTERS[this.targetIndex()],note=NOTES[this.targetIndex()];
    const hand=this.step==="other"?"left":"right";
    const verb=method==="physical"?"Press [ "+key+" ], then release.":method==="virtual"?"Poke the amber pad, then lift.":"Aim at amber with your "+hand+" hand.\nPinch thumb + index, then release.";
    const captions:Record<TutorialStep,string>={
      intro:"Make music, one note at a time.\nFollow amber. There is no score here.",
      placement:this.h.editor?"Laptop: the virtual table is ready.\nReal surface sensing needs Specs.":"Look at a clear, level table.\nFind Surface, then Confirm Placement.",
      choose:"Choose the input that feels easiest.\nYou can switch without starting over.",
      demo:method==="pinch"?"Aim first: amber shows your target.\nTouch thumb to index. Open to release.":method==="virtual"?"Poke a labeled pad with your index.\nLift your finger before playing again.":"Press the letter printed on a tine.\nRelease the key before playing again.",
      first:verb,release:method==="pinch"?"Open thumb and index to release.\nHolding a pinch plays only one note.":method==="virtual"?"Lift your index finger off the pad.\nOne touch makes one note.":"Lift your finger off the key.\nHolding a key plays only one note.",
      other:method==="pinch"?"Nice! Now try with your left hand.\nAim, pinch once, then open.":"Nice! Play C4 once more.\nTry your other hand if comfortable.",
      sequence:"A little sequence. Follow amber.\nNo hurry; every retry is welcome.",
      melody:"Twinkle, Twinkle, Little Star.\nPlay the next amber note. No timer.",
      offer:"You played the melody!\nNext: optional pulse practice.\nOr Skip to start Free Play.",
      timed:"Follow the pulse at "+this.h.bpm()+" BPM.\nEarly? Try again. Late? We wait.\nNo missed notes or score penalties.",
      complete:"You made music! Keep exploring.\nNext opens Free Play. Replay anytime."
    };
    let cue=note?note+"  [ "+key+" ]":"";
    if(["sequence","melody","timed"].indexOf(this.step)>=0)cue+="  "+(this.index+1)+" / "+(this.step==="sequence"?PRACTICE.length:TWINKLE_NOTES.length);
    if(this.step==="timed")cue+="  "+(now<this.timedDue?Math.max(1,Math.ceil((this.timedDue-now)*this.h.bpm()/60)):"Play now");
    const simulated=this.h.editor&&method!=="physical"?"Preview hands are simulated. [2] changes input.":INPUT_NAMES[method];
    this.h.draw({title:"LEARN  "+(ORDER.indexOf(this.step)+1)+" / "+ORDER.length,caption:captions[this.step],cue,status:this.message||simulated,
      demo:method==="pinch"&&(this.detailed||["demo","first","release","other"].indexOf(this.step)>=0),left:this.step==="other",largeDemo:this.detailed,
      next:["intro","placement","choose","demo","offer","complete"].indexOf(this.step)>=0,muted:this.muted});
  }
}
