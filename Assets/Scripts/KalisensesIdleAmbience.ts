/** Visual-only main-menu ambience. Instrument and tutorial audio stay independent. */
export class KalisensesIdleAmbience {
  public active=false;public spawnRequests=0;public lastActivity:number;
  public readonly delay=10;
  public readonly fireflyInterval=4/9; // 2.25 lights/second; 50% more than 1.5.
  private nextFirefly=0;
  constructor(private spawn:(time:number)=>void,now:number) {this.lastActivity=now;}
  public activity(now:number) {this.lastActivity=now;this.active=false;this.nextFirefly=0;}
  public stop(now:number) {this.activity(now);}
  public update(now:number,eligible:boolean) {
    if(!eligible)this.activity(now);
    const active=eligible&&now-this.lastActivity>=this.delay;
    if(active&&!this.active){this.nextFirefly=now+.35;console.log("[Idle fireflies] Enter");}
    this.active=active;
    if(active&&now>=this.nextFirefly){this.nextFirefly=now+this.fireflyInterval;this.spawn(now);this.spawnRequests++;}
  }
}