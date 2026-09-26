import {writeFile} from 'node:fs/promises';
import {compileArtifacts} from './artifacts';
const fixtures=['itd','4940','pcb-color','pcb-size','pseudo-independent','assumption-laundering','missing-calibration','active-claim-conflict'];
const results=[];
for(const fixture of fixtures)for(const variant of fixture==='itd'?['']:['','/negative']){
 const base='fixtures/'+fixture+variant;
 const result=await compileArtifacts(base+'/vault',base+'/dist-data');
 results.push({...result,fixture,variant:variant?'negative':'positive'});
 console.log(fixture+(variant?' negative':'')+': '+result.candidates.length+' candidate(s)');
}
await writeFile('fixtures/build-index.json',JSON.stringify({schema_version:1,synthetic:true,results},null,2)+'\n');
