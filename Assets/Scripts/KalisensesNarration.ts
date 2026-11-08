const CLIPS:Record<string,AudioTrackAsset>={
  intro:requireAsset("../TutorialNarration/intro.wav") as AudioTrackAsset,
  placement:requireAsset("../TutorialNarration/placement.wav") as AudioTrackAsset,
  choose:requireAsset("../TutorialNarration/choose.wav") as AudioTrackAsset,
  "action-physical":requireAsset("../TutorialNarration/action-physical.wav") as AudioTrackAsset,
  "action-virtual":requireAsset("../TutorialNarration/action-virtual.wav") as AudioTrackAsset,
  "action-pinch":requireAsset("../TutorialNarration/action-pinch.wav") as AudioTrackAsset,
  sequence:requireAsset("../TutorialNarration/sequence.wav") as AudioTrackAsset,
  melody:requireAsset("../TutorialNarration/melody.wav") as AudioTrackAsset,
  offer:requireAsset("../TutorialNarration/offer.wav") as AudioTrackAsset,
  complete:requireAsset("../TutorialNarration/complete.wav") as AudioTrackAsset,
  "help-physical":requireAsset("../TutorialNarration/help-physical.wav") as AudioTrackAsset,
  "help-virtual":requireAsset("../TutorialNarration/help-virtual.wav") as AudioTrackAsset,
  "help-pinch":requireAsset("../TutorialNarration/help-pinch.wav") as AudioTrackAsset,
  tracking:requireAsset("../TutorialNarration/tracking.wav") as AudioTrackAsset
};
export class KalisensesNarration {
  public muted=false;public lastClip="";public plays=0;
  public blocked=false;
  private requestedAt=0;private deadline=0;private observedPlaying=false;
  constructor(public audio:AudioComponent,private onBlockChanged:(blocked:boolean)=>void=()=>{}) {
    audio.playbackMode=Audio.PlaybackMode.LowPower;audio.volume=.55;
    // Finish can also be delivered for an old, interrupted clip. Check current
    // playback instead of letting an old callback unlock a replacement clip.
    audio.setOnFinish(()=>this.update());
  }
  private block(value:boolean) {if(value===this.blocked)return;this.blocked=value;this.onBlockChanged(value);}
  public play(id:string) {
    this.stop();this.lastClip=id;if(this.muted||!CLIPS[id])return;
    try {
      this.audio.audioTrack=CLIPS[id];this.requestedAt=getTime();this.observedPlaying=false;
      const duration=this.audio.duration;
      this.deadline=this.requestedAt+(Number.isFinite(duration)&&duration>0?duration:30)+2;
      this.block(true);this.audio.play(1);this.plays++;
      this.observedPlaying=this.audio.isPlaying();print("[Tutorial audio] "+id);
    }catch(error){print("[Tutorial audio] Playback failed: "+String(error));this.stop();}
  }
  public update() {
    if(!this.blocked)return;
    try {
      const playing=this.audio.isPlaying(),now=getTime();
      if(this.audio.isPaused()){this.stop();return;}
      if(playing)this.observedPlaying=true;
      if(!playing&&this.observedPlaying){this.block(false);return;}
      // Cancel a failed/delayed start before unlocking, so it cannot begin later
      // with controls already active.
      if(!playing&&now-this.requestedAt>.75){print("[Tutorial audio] Playback did not start");this.stop();return;}
      if(now>this.deadline){print("[Tutorial audio] Playback watchdog released controls");this.stop();}
    }catch(error){print("[Tutorial audio] Playback interrupted: "+String(error));this.stop();}
  }
  public stop() {
    try {if(this.audio.audioTrack)this.audio.stop(false);}
    catch(error){print("[Tutorial audio] Stop failed: "+String(error));}
    finally {this.block(false);}
  }
  public setMuted(value:boolean) {this.muted=value;if(value)this.stop();}
}
