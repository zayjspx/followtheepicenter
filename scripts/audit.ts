import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {auditGraph} from '../src/audit/engine';
const [graphFile='dist-data/graph.json',provenanceFile='dist-data/provenance.json',output='dist-data/diagnostics.json']=process.argv.slice(2);
try {
 if([graphFile,provenanceFile].some(p=>path.resolve(p)===path.resolve(output)))throw new Error('Audit output must not overwrite its inputs');
 const graph=JSON.parse(await readFile(graphFile,'utf8')),provenance=JSON.parse(await readFile(provenanceFile,'utf8'));
 const diagnostics=auditGraph(graph,provenance);
 await writeFile(output,JSON.stringify(diagnostics,null,2)+'\n');
 console.log(diagnostics.candidates.length+' candidate(s); reviewed graph inputs unchanged.');
} catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
