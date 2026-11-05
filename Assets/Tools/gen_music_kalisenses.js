// Regenerator: original sample-free synthesis via the CLAD build-music/build-sfx engine.
const fs=require('fs'),path=require('path');
const m=require('C:/Users/rg-za/.codex/plugins/cache/ls-extensions/ls-clad/local/skills/build-music/tools');
const PROJECT_ASSETS_SFX='C:/Users/rg-za/OneDrive/Documents/kalisenses/Assets/GeneratedSFX';
fs.mkdirSync(PROJECT_ASSETS_SFX,{recursive:true});
const notes={C4:60,D4:62,E4:64,F4:65,G4:67,A4:69,B4:71,C5:72,D5:74,E5:76,F5:77,G5:79,A5:81,B5:83,C6:84,D6:86,E6:88};
for(const [name,midi] of Object.entries(notes)) {
  const b=m.synth_voices.kalimba(midi,1,105,120);
  let peak=0;for(const v of b)peak=Math.max(peak,Math.abs(v));
  for(let i=0;i<b.length;i++)b[i]*=.85/peak;
  m.WavBuilder.write({left:b,right:b},path.join(PROJECT_ASSETS_SFX,name+'.wav'));
  console.log(name+' MIDI='+midi+' Hz='+(440*Math.pow(2,(midi-69)/12)).toFixed(3)+' peak=-1.41dB');
}
const click=m.sfx_presets.uiClick({character:'soft'});
m.WavBuilder.write(click,path.join(PROJECT_ASSETS_SFX,'CountClick.wav'));
