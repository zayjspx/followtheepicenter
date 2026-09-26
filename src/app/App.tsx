import type {DataBundle} from './types';
import {useRoute,href} from './router';
import {Home,ClaimsPage,DiagnosticsPage,SearchPage,SourcesPage} from './Pages';
import {NetworkExperience} from './NetworkExperience';
import {GraphView} from './GraphView';
import {NodeView} from './NodeView';
import {RatchetView,RatchetsIndex} from './RatchetView';
import {OperatorPage} from './SessionOperator';
import {ReplayPage} from './SessionReplay';
import {GuidedCase,GuidedIndex} from './GuidedCase';

function Nav(){return <><header className="site-header"><a className="brand" href={href('/')}><span className="brand-mark">DB</span><span><strong>Debunker</strong><small>Interrogation System</small></span></a><nav><a href={href('/network')}>Network</a><a className="guided-nav" href={href('/guided')}>Guided</a><a href={href('/claims')}>Claims</a><a href={href('/sources')}>Evidence</a><a href={href('/graph')}>Graph</a><a href={href('/ratchets')}>Ratchets</a><a href={href('/diagnostics')}>Diagnostics</a><a href={href('/search')}>Search</a></nav></header><div className="scope-strip">Public case graph is read-only · guided exploration changes only your browser state · no truth or credibility scores</div></>}
export function App({bundle}:{bundle:DataBundle}){const r=useRoute();const [a,b]=r.segments;let page;
 if(!a||a==='network')page=<NetworkExperience bundle={bundle} focusParam={r.query.get('focus')??undefined}/>;
 else if(a==='about')page=<Home bundle={bundle}/>;
 else if(a==='guided'&&!b)page=<GuidedIndex bundle={bundle}/>;
 else if(a==='guided'&&b)page=<GuidedCase key={b} id={b} bundle={bundle} initialLock={r.query.get('lock')??undefined}/>;
 else if(a==='graph')page=<NetworkExperience bundle={bundle} focusParam={r.query.get('focus')??undefined}/>;
 else if(a==='neighborhood')page=<GraphView bundle={bundle} focusParam={r.query.get('focus')??undefined} depthParam={r.query.get('depth')??undefined}/>;
 else if(a==='claims')page=<ClaimsPage bundle={bundle}/>;
 else if(a==='ratchets')page=<RatchetsIndex bundle={bundle}/>;
 else if(a==='diagnostics')page=<DiagnosticsPage bundle={bundle}/>;
 else if(a==='sources')page=<SourcesPage bundle={bundle}/>;
 else if(a==='search')page=<SearchPage bundle={bundle} initial={r.query.get('q')??''}/>;
 else if(a==='operator')page=<OperatorPage bundle={bundle}/>;
 else if(a==='replay')page=<ReplayPage bundle={bundle}/>;
 else if(a==='ratchet'&&b)page=<RatchetView id={b} bundle={bundle}/>;
 else if(['claim','receipt','source','node'].includes(a)&&b)page=<NodeView id={b} bundle={bundle}/>;
 else page=<main className="page"><h1>Page not found</h1><p><a href={href('/')}>Return home</a></p></main>;
 return <><Nav/>{page}<footer className="site-footer"><div><p>This site exposes attributed claims, preserved receipts, compiled dependencies, and structural diagnostics. Guided branches are hypothetical argument paths, not votes or verdicts.</p><p className="footer-tools">Local session tools for an actual conversation: <a href={href('/operator')}>Operator</a> · <a href={href('/replay')}>Replay</a>. These are optional and do not alter the published case graph.</p></div></footer></>}
