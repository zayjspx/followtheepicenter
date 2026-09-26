import {compileArtifacts} from './artifacts';
const [input='vault',output='dist-data']=process.argv.slice(2);
try {console.log(JSON.stringify(await compileArtifacts(input,output)));}
catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
