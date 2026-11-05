import {Interactor} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor";
export type InputMethod="physical"|"virtual"|"pinch";
export interface NotePointer {index:number;contact:string;interactor?:Interactor;}
export const INPUT_NAMES:Record<InputMethod,string>={physical:"Physical Keyboard",virtual:"Virtual Keyboard",pinch:"Pinch Gesture"};
/** One edge per source/contact, including when a held pointer crosses notes. */
export class NoteContacts {
  private held=new Set<string>();
  down(source:InputMethod,contact:string):boolean {const k=source+":"+contact;if(this.held.has(k))return false;this.held.add(k);return true;}
  up(source:InputMethod,contact:string) {this.held.delete(source+":"+contact);}
}
