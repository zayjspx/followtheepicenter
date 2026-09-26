// External test driver only. Set PLAYWRIGHT_MODULE and CHROME_PATH to your installed tools.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://127.0.0.1:5173/';
const label=process.argv[3]||'dev';
const out=path.resolve('release-evidence',label);fs.mkdirSync(out,{recursive:true});
const graph=JSON.parse(fs.readFileSync('dist-data/graph.json','utf8'));
const nodes=new Map(graph.nodes.map(n=>[n.id,n]));
const report={base,label,started_at:new Date().toISOString(),checks:[],errors:[],http_errors:[],screenshots:[]};
function check(name,details){report.checks.push({name,details});console.log('PASS',name)}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
 report.browser=browser.version();const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();page.setDefaultTimeout(15000);
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text()+' '+m.location().url)});
 page.on('response',r=>{if(r.status()>=400)report.http_errors.push({url:r.url(),status:r.status()})});
 page.on('dialog',d=>d.accept('RC1 browser smoke'));
 const route=async(hash)=>{await page.goto(base+'#'+hash);await page.locator('main').waitFor();};
 const snap=async(name)=>{await page.screenshot({path:path.join(out,name+'.png'),fullPage:true,timeout:60000});report.screenshots.push(name+'.png')};
 const question=()=>page.locator('.guided-question-card h2');
 const exact=async(id)=>assert.equal(await question().innerText(),nodes.get(id).question);
 try{
 await route('/about');assert.match(await page.locator('h1').innerText(),/Walk the argument/i);await snap('home');check('home renders');
 const ratchets=['rat-itd-nearfield','rat-4940-provenance','rat-pcb-dimensions','rat-pcb-color','rat-radial-pressure','rat-13of13-meaning'];
 for(const id of ratchets){
  const r=nodes.get(id),entry=nodes.get(r.entry_lock);await route('/guided/'+id);await exact(entry.id);assert.equal(entry.branches.tangent,entry.id);assert.equal(await page.locator('.guided-evidence article').count(),entry.receipts.length);
  await page.getByRole('button',{name:'Reset',exact:true}).click();await exact(entry.id);
  assert.ok(await page.getByRole('heading',{name:'What still survives',exact:true}).isVisible());
  for(const response of ['yes','no','tangent']){
   await page.locator('.guided-response').nth(['yes','no','qualify','unknown','withdraw','non_answer','tangent'].indexOf(response)).click();
   await page.locator('.guided-impact').waitFor();assert.match(await page.locator('.guided-impact').innerText(),/Downstream review/);
   await page.getByRole('button',{name:'Continue →',exact:true}).click();await exact(entry.branches[response]);
   assert.equal(await page.locator('.guided-history .count').innerText(),'1');
   if(response==='yes'){
    await page.reload();await question().waitFor();await exact(entry.branches[response]);assert.equal(await page.locator('.guided-history .count').innerText(),'1');
    await page.getByRole('button',{name:'Copy this step',exact:true}).click();const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.ok(copied.includes('lock='+entry.branches[response]));
    await route('/guided');await page.locator('a.guided-card[href*="'+id+'"]').click();await exact(entry.branches[response]);assert.equal(await page.locator('.guided-history .count').innerText(),'1');
   }
   await page.getByRole('button',{name:'← Back one branch',exact:true}).click();await exact(entry.id);assert.equal(await page.locator('.guided-history .count').innerText(),'0');
  }
  await page.locator('.guided-response').first().click();await page.getByRole('button',{name:'Continue →',exact:true}).click();await page.getByRole('button',{name:'Reset',exact:true}).click();await exact(entry.id);assert.equal(await page.locator('.guided-history .count').innerText(),'0');await page.getByRole('button',{name:'Technical',exact:true}).click();await page.getByRole('heading',{name:'Burden stack',exact:true}).waitFor();await page.getByRole('button',{name:'Simple',exact:true}).click();
  if(id==='rat-pcb-color')await snap('guided');check('guided branches, back, reset, refresh, resume, permalink, technical: '+id);
 }
 // Same-document route changes must not reuse another ratchet's question.
 await route('/guided/rat-itd-nearfield');await route('/guided/rat-pcb-color');await exact(nodes.get('rat-pcb-color').entry_lock);check('direct guided route isolation');
 await route('/claims');assert.ok(await page.locator('a[href*="/claim/"]').count()>=41);await page.locator('a[href="#/claim/clm-itd-nearfield-only"]').first().click();await page.getByRole('heading',{name:'WHY?',exact:true}).waitFor();await page.getByRole('heading',{name:'WHAT DEPENDS ON THIS?',exact:true}).waitFor();check('claim detail, WHY and downstream blast radius');
 await route('/neighborhood?focus=clm-itd-nearfield-only');await page.locator('svg').waitFor();assert.ok(await page.locator('svg [role="button"]').count()>0);await page.getByRole('link',{name:'2 hops',exact:true}).click();assert.ok(page.url().includes('depth=2'));await page.locator('svg [role="button"]').first().click();await page.getByLabel('Search graph nodes').fill('clm-petn-shaped-charge-hidden');await page.locator('.search-popover button').first().click();assert.ok(page.url().includes('clm-petn-shaped-charge-hidden'));const boxes=await page.locator('svg .graph-node rect').evaluateAll(els=>els.map(e=>{const b=e.getBBox();return {x:b.x,y:b.y,width:b.width,height:b.height}}));for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y,'graph hit targets overlap')}await snap('graph');check('focused graph, two-hop expansion, node selection and graph search');
 await route('/claim/clm-petn-shaped-charge-hidden');const downstream=page.locator('section.panel').filter({has:page.getByRole('heading',{name:'WHAT DEPENDS ON THIS?',exact:true})});const count=await downstream.locator('a.node-link').count();assert.equal(count,4);await downstream.locator('a.node-link').first().click();await page.locator('.detail-hero').waitFor();await route('/claim/clm-petn-shaped-charge-hidden');await page.locator('section.panel').filter({has:page.getByRole('heading',{name:'WHY?',exact:true})}).locator('a.node-link').first().click();await page.locator('.detail-hero').waitFor();check('substantial downstream and WHY link traversal',{downstream_links:count});await route('/receipt/rec-itd-nearfield');await page.getByRole('link',{name:'Open preserved artifact',exact:true}).waitFor();check('receipt quote and preserved source link');
 for(const source of graph.nodes.filter(n=>n.type==='source')){
  await route('/source/'+source.id);const a=page.getByRole('link',{name:'Preserved artifact',exact:true});const url=await a.getAttribute('href');assert.ok(url.startsWith(base));const res=await context.request.get(url);assert.equal(res.status(),200);assert.ok((await res.body()).length>0);check('local evidence asset: '+source.id,{url,status:res.status()});
 }
 await route('/sources');assert.ok(await page.locator('a[href*="/source/"]').count()>=4);check('evidence index');
 await route('/diagnostics');assert.match(await page.locator('main').innerText(),/machine.proposed|Machine candidates/i);check('diagnostics render candidate/review distinction');
 await route('/ratchets');await page.locator('a[href="#/ratchet/rat-pcb-color"]').first().click();assert.match(await page.locator('main').innerText(),/Lock|branch/i);check('ratchet index and detail');
 await route('/search');await page.getByPlaceholder('Claim, phrase, ID, tag…').fill('4940');assert.ok(await page.locator('.search-result').count()>0);await page.locator('.search-result').first().click();await page.locator('main h1').waitFor();check('search and result navigation');
 await route('/operator');await page.getByRole('button',{name:'New session',exact:true}).click();
 await page.locator('.launch-card').filter({hasText:'rat-rode-petn-consistency'}).click();
 await page.getByLabel('Exact answer / transcript excerpt').fill('RC1 test: accepted for branch testing only.');await page.locator('.response-buttons').getByRole('button',{name:'yes',exact:true}).click();
 assert.ok(await page.locator('.commitment-list article').count()>0);assert.ok(await page.locator('.callback-list article').count()>0);check('operator classification, commitment ledger and conflict callback');
 const active=await page.locator('.active-lock-question').innerText();await page.getByLabel('Tangent / new evidence').fill('RC1 parked tangent');await page.getByRole('button',{name:'Park tangent',exact:true}).click();assert.equal(await page.locator('.active-lock-question').innerText(),active);assert.ok(await page.locator('.tangent-list article').count()>0);check('parking tangent preserves active lock');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();const download=await downloadPromise;const file=path.join(out,'session-export.json');await download.saveAs(file);const exported=JSON.parse(fs.readFileSync(file,'utf8'));assert.ok(exported.events.length>0);
 await page.locator('input[type=file]').setInputFiles(file);assert.equal(await page.locator('.error-box').count(),0);check('operator export and import',{events:exported.events.length});await snap('operator');
 await route('/replay');assert.ok(await page.locator('.commitment-list article').count()>0);await page.getByRole('button',{name:'|◀',exact:true}).click();assert.equal(await page.locator('.commitment-list article').count(),0);await page.getByRole('button',{name:'▶|',exact:true}).click();assert.ok(await page.locator('.commitment-list article').count()>0);await page.locator('input[type=range]').fill('1');assert.equal(await page.locator('.commitment-list article').count(),0);await page.locator('input[type=file]').setInputFiles(file);assert.ok(await page.locator('.callback-list article').count()>0);check('replay timeline, scrubber, event reconstruction and import');await snap('replay');
 await page.setViewportSize({width:390,height:844});await route('/about');await snap('mobile-home');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await route('/guided/rat-pcb-color');await snap('mobile-guided');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));check('mobile home and guided layout fit viewport');
 await page.reload();await question().waitFor();check('hash permalink reload at served base');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.http_errors,[]);check('no app console errors, page errors or failed HTTP responses');report.status='passed';
 }catch(e){report.status='failed';report.failure=e.stack;console.error(e);await snap('failure');process.exitCode=1}finally{report.finished_at=new Date().toISOString();fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});


