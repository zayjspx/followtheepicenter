import {spawnSync} from 'node:child_process';
import {readFile,writeFile,rm,readdir} from 'node:fs/promises';
import {hash} from '../src/compiler/parser';
import {canonical} from '../src/compiler/provenance';
await rm('build-receipt.json',{force:true});
const checks:{command:string;exit_code:number|null}[]=[];
for(const script of ['test','build']){
 const run=spawnSync(process.execPath,[process.env.npm_execpath!,'run',script],{stdio:'inherit'});
 checks.push({command:'npm run '+script,exit_code:run.status});
 if(run.status!==0){await writeFile('build-receipt.json',JSON.stringify({status:'failed',checks},null,2)+'\n');process.exit(run.status??1);}
}
const tests=JSON.parse(await readFile('work/test-results.json','utf8'));
const index=JSON.parse(await readFile('fixtures/build-index.json','utf8'));
const fixture_artifacts=[];
for(const fixture of index.results){
 const graph=await readFile(fixture.output+'/graph.json'),diagnostics=await readFile(fixture.output+'/diagnostics.json');
 fixture_artifacts.push({fixture:fixture.fixture,variant:fixture.variant,graph_sha256:hash(graph),diagnostics_sha256:hash(diagnostics),build_id:fixture.build_id,candidates:fixture.candidates});
}
async function codeFiles(dir:string):Promise<string[]>{
 const out:string[]=[];
 for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())out.push(...await codeFiles(p));else out.push(p);}
 return out;
}
const files=[...await codeFiles('src'),...await codeFiles('scripts'),...await codeFiles('tests'),'package.json','package-lock.json','tsconfig.json','vite.config.ts'].sort();
const implementation=[];
for(const path of files)implementation.push({path,sha256:hash(await readFile(path))});
const production=await readFile('dist-data/diagnostics.json');
const itd=JSON.parse(await readFile('fixtures/itd/dist-data/graph.json','utf8'));
await writeFile('build-receipt.json',JSON.stringify({
 status:'release_candidate_automated_checks_passed',recorded_at:new Date().toISOString(),runtime:process.version,platform:process.platform,
 checks,tests:{total:tests.numTotalTests,passed:tests.numPassedTests,failed:tests.numFailedTests},
 implementation_fingerprint:hash(canonical(implementation)),implementation,
 production_diagnostics_sha256:hash(production),production_candidate_count:JSON.parse(production.toString()).candidates.length,
 fixture_artifacts,itd_result:itd.derivations.find((d:{id:string})=>d.id==='der-itd-max'),
 demonstrated:['five approved schema patches','six deterministic detectors on synthetic compiled graphs','seven positive and seven negative fixture vaults','stable output under shuffled file order','candidate-only output and separate authored review','graph immutability under audits','fail-closed typed input checks','production corpus compilation','topology, dependency blast radius and interrogation-order artifacts','TypeScript check and Vite production build','public graph, claim, receipt, source, diagnostic and ratchet routes included in production bundle'],
 not_demonstrated:['scientific validity of real claims','authenticated identity of a human reviewer','GitHub Actions execution or Pages deployment','automated browser interaction testing','semantic diff UI']
},null,2)+'\n');
console.log('Wrote automated build receipt.');
