// Player-facing spatial order. L replaces comma by explicit user approval.
export const NOTES = ["D6","B5","G5","E5","C5","A4","F4","D4","C4","E4","G4","B4","D5","F5","A5","C6","E6"];
export const LETTERS = ["R","A","S","D","F","X","C","V","B","N","M","L","H","J","K","U","I"];
export const MIDIS = [86,83,79,76,72,69,65,62,60,64,67,71,74,77,81,84,88];
export function keyboardCodes(): Keys[] { return [Keys.R,Keys.A,Keys.S,Keys.D,Keys.F,Keys.X,Keys.C,Keys.V,Keys.B,Keys.N,Keys.M,Keys.L,Keys.H,Keys.J,Keys.K,Keys.U,Keys.I]; }
export interface Song { name:string; notes:string[]; beats:number[]; }
function song(name:string, phrase:string):Song {
  const tokens=phrase.split(" ");
  return {name,notes:tokens.map(t=>t.split(":")[0]),beats:tokens.map(t=>Number(t.split(":")[1]||1))};
}
// Original monophonic beginner reductions of traditional tunes, no recordings or modern arrangements.
export const SONGS:Song[] = [
  song("Amazing Grace", "G4 C5:2 E5 C5:2 E5 D5 C5:2 A4 G4:2 G4 C5:2 E5 C5:2 E5 D5:3 G5:2 E5 G5 E5 C5:2 G4 A4 C5:2 C5 A4 G4:2 G4 C5:2 E5 C5:2 E5 D5 C5:3"),
  song("Silent Night", "G4 A4 G4 E4:3 G4 A4 G4 E4:3 D5:2 D5 B4:3 C5:2 C5 G4:3 A4:2 A4 C5 B4 A4 G4 A4 G4 E4:3 A4:2 A4 C5 B4 A4 G4 A4 G4 E4:3 D5:2 D5 F5 D5 B4 C5:3 E5:3 C5 G4 E4 G4 F4 D4 C4:3"),
  song("Scarborough Fair", "D4:2 D4 A4:2 A4 E4 F4 E4 D4:3 A4:2 C5 D5 C5 A4 B4 G4 A4:3 D5:2 D5 D5 C5 A4 A4 G4 F4 E4:3 D4:2 A4 G4 F4 E4 D4:3")
];
export interface Target {note:string; time:number; judged:boolean; correct:boolean;}
export class PerformanceScore {
  targets:Target[]=[]; correct=0; incorrect=0; missed=0;
  constructor(notes:string[], times:number[]) { this.targets=notes.map((note,i)=>({note,time:times[i],judged:false,correct:false})); }
  press(note:string,time:number):boolean {
    let winner=-1, distance=Infinity;
    this.targets.forEach((t,i)=>{
      const d=Math.abs(t.time-time);
      if(!t.judged && t.note===note && d<=400 && (d<distance || (d===distance && (winner<0 || t.time<this.targets[winner].time)))) {winner=i;distance=d;}
    });
    if(winner<0) {this.incorrect++;return false;}
    this.targets[winner].judged=true;this.targets[winner].correct=true;this.correct++;return true;
  }
  expire(time:number):number {
    let n=0; this.targets.forEach(t=>{if(!t.judged && time>t.time+400) {t.judged=true;this.missed++;n++;}});return n;
  }
  get percent():number {return this.targets.length ? Math.round(100*this.correct/this.targets.length):0;}
  get complete():boolean {return this.targets.every(t=>t.judged);}
}
