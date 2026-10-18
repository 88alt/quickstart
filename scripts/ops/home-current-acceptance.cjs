const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const host=process.env.QS_ACCEPT_HOST;if(host!=='192.168.30.244')throw new Error('B-only acceptance');
const out=process.env.QS_ACCEPT_OUT,base='http://'+host,home=base+'/cgi-bin/luci/admin/quickstart/';
const report={checkedAt:new Date().toISOString(),checks:[],errors:[],consoleErrors:[],httpErrors:[],views:[],restoration:[]};
let browser,page,first,second,layout,launcher,layoutVersion,launcherVersion;
async function read(context,domain){const r=await context.request.get(base+'/cgi-bin/luci/istore/home/v1/'+domain+'/');assert.equal(r.status(),200);const body=await r.json();assert.equal(body.success,0);assert.equal(body.result.state,'saved');return body.result}
async function write(context,domain,value,expectedVersion){const r=await context.request.post(base+'/cgi-bin/luci/istore/home/v1/'+domain+'/',{data:{value,expectedVersion}});assert.equal(r.status(),200,'homepage config save rejected');const b=await r.json();assert.equal(b.success,0);assert.deepEqual(b.result.value,value);return b.result.version}
(async()=>{
 try{
  browser=await chromium.launch();
  async function context(sid){const c=await browser.newContext({viewport:{width:1440,height:1000},locale:'zh-CN'});await c.addCookies([{name:'sysauth_http',value:sid,domain:host,path:'/'}]);return c}
  first=await context(process.env.QS_ACCEPT_SID);second=await context(process.env.QS_ACCEPT_SECOND_SID);
  const originalLayout=await read(first,'layout'),originalLauncher=await read(first,'launcher');layout=originalLayout.value;launcher=originalLauncher.value;layoutVersion=originalLayout.version;launcherVersion=originalLauncher.version;
  const unauthenticated=await browser.newContext();const denied=await unauthenticated.request.get(base+'/cgi-bin/luci/istore/home/v1/layout/');assert.equal(denied.status(),403);await unauthenticated.close();report.checks.push('Unauthenticated config read denied');
  page=await first.newPage();const other=await second.newPage();page.on('pageerror',e=>report.errors.push(e.message));other.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&report.consoleErrors.length<100)report.consoleErrors.push(m.text())});
  page.on('response',r=>{if(r.status()>=400&&report.httpErrors.length<100)report.httpErrors.push({path:new URL(r.url()).pathname,status:r.status()})});
  const capture=async name=>{await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});report.views.push({name,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),cards:await page.locator('[data-layout-card]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.layoutCard,form:n.dataset.presentation,w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})))})};
  async function ready(p){await p.goto(home,{waitUntil:'networkidle'});await p.locator('[data-ordered-home]').waitFor();await p.waitForTimeout(1200);assert.equal(await p.getByRole('button',{name:'自定义首页',exact:true}).isEnabled(),true);assert.equal(await p.locator('.modal,.cbi-map').filter({hasText:'Session expired'}).count(),0)}
  async function finish(p){await p.locator('[data-apply]').click();if(await p.locator('[data-confirm-finish]').count())await p.locator('[data-confirm-finish]').click()}
  await ready(page);await ready(other);await capture('b-home-1440');
  for(const [index,row] of (await page.locator('[data-ordered-row]').all()).entries()){await row.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'b-row-'+(index+1)+'-1440.png')})}
  await page.locator('.lab-header').scrollIntoViewIfNeeded();
  report.themeStyles=await page.evaluate(()=>Array.from(document.styleSheets).map(s=>s.href).filter(Boolean));
  report.density=await page.locator('[data-layout-card=networkInterface] *,.inventory-header,.inventory-footer,.applications-header').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return {tag:n.tagName,cls:n.className,h:n.getBoundingClientRect().height,margin:s.margin,padding:s.padding,minHeight:s.minHeight,lineHeight:s.lineHeight,font:s.font,display:s.display}}));
  const expectedWidgets=layout.rows.flatMap(r=>r.columns.flatMap(c=>c.cards)).filter(Boolean);assert.equal(await page.locator('[data-layout-card]').count(),expectedWidgets.length);
  report.checks.push('Real root session renders persisted homepage');
  if(process.env.QS_ACCEPT_DIAGNOSTICS==='1'){report.metrics=await page.locator('.ordered-home header,.ordered-home h1,.ordered-home .card-header,.ordered-home .network-business-card,.ordered-home .widget-menu-trigger,.ordered-home .widget-primary-action,.ordered-home .lab-edit-button').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n),b=getComputedStyle(n,'::before'),a=getComputedStyle(n,'::after');return {tag:n.tagName,cls:n.className,display:s.display,height:s.height,minHeight:s.minHeight,padding:s.padding,margin:s.margin,lineHeight:s.lineHeight,font:s.font,position:s.position,background:s.backgroundColor,before:{content:b.content,display:b.display,position:b.position,width:b.width,height:b.height,background:b.backgroundColor},after:{content:a.content,display:a.display,position:a.position}}}));report.result='diagnostic';return}
  await page.getByRole('button',{name:'自定义首页',exact:true}).click();await other.getByRole('button',{name:'自定义首页',exact:true}).click();
  // Removing the left half of a stacked row deliberately requires a layout
  // decision. Exercise ordinary save with the standalone final row instead.
  const removable=expectedWidgets.includes('system')?'system':layout.rows.find(r=>r.columns.length===1&&r.columns[0].cards.length===1)?.columns[0].cards[0];assert.ok(removable,'Need a standalone row for save/concurrency acceptance');
  await page.locator('[data-hide-module="'+removable+'"]').click();await finish(page);await page.waitForFunction(()=>!document.querySelector('.ordered-editing'));layoutVersion=(await read(first,'layout')).version;
  await other.locator('[data-hide-module="'+removable+'"]').click();await finish(other);await other.locator('[data-layout-notice]').filter({hasText:'另一窗口'}).waitFor();assert.equal(await other.locator('.ordered-editing').count(),1);
  report.checks.push('Two independent root sessions: stale save conflicts and draft remains');
  await other.close();await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-layout-card="'+removable+'"]').count(),0);report.checks.push('Layout save survives real device reload');
  layoutVersion=await write(first,'layout',layout,layoutVersion);await page.reload({waitUntil:'networkidle'});
  layoutVersion=await write(first,'layout',{...layout,rows:[]},layoutVersion);await page.reload({waitUntil:'networkidle'});await page.locator('.ordered-empty').waitFor();assert.equal(await page.locator('[data-layout-card]').count(),0);report.checks.push('Explicit empty homepage survives reload without restoring defaults');
  layoutVersion=await write(first,'layout',layout,layoutVersion);await page.reload({waitUntil:'networkidle'});
  if(expectedWidgets.includes('applications')){
   await page.locator('[data-layout-card=applications] [data-all-apps]').click();await page.locator('[data-add-link]').click();await page.locator('[data-link-name]').fill('Quickstart 验收临时链接');await page.locator('[data-link-url]').fill('https://quickstart-acceptance.example.invalid/');await page.locator('[data-link-save]').click();await page.locator('[data-link-form]').waitFor({state:'hidden'});launcherVersion=(await read(first,'launcher')).version;assert.equal((await read(first,'launcher')).value.links.length,launcher.links.length+1);await page.keyboard.press('Escape');
   await page.reload({waitUntil:'networkidle'});await page.locator('[data-layout-card=applications] [data-all-apps]').click();await page.locator('[data-category=links]').click();await page.getByRole('button',{name:'打开Quickstart 验收临时链接',exact:true}).waitFor();await page.keyboard.press('Escape');report.checks.push('HTTP router origin: custom link saves and survives reload');
   launcherVersion=await write(first,'launcher',launcher,launcherVersion);
  }
  const devices=page.locator('[data-canvas-device]');if(await devices.count()){const id=await devices.first().getAttribute('data-canvas-device');await devices.first().click();await page.locator('.drawer-backdrop').waitFor();assert.equal(new URL(page.url()).searchParams.get('device'),id);await page.locator('.drawer-close').click();report.checks.push('Homepage deviceId opens real complete management detail');await ready(page)}
  for(const width of [1024,768,390,320]){await page.setViewportSize({width,height:900});await page.waitForTimeout(300);await capture('b-home-'+width);assert.equal(report.views.at(-1).overflow,false)}
  await page.getByRole('button',{name:'切换主题',exact:true}).click();await page.waitForTimeout(300);await capture('b-home-320-dark');
  assert.equal(report.errors.length,0);report.result='passed';
 }catch(error){report.result='failed';report.failure=error.stack;if(page){await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});report.language=await page.evaluate(()=>window.vue_lang).catch(()=>null)}process.exitCode=1}
 finally{
  // Compare versions captured after our writes; never overwrite another root
  // session's concurrent change during cleanup.
  if(first)for(const [domain,value,version] of [['layout',layout,layoutVersion],['launcher',launcher,launcherVersion]])if(value&&version){try{const current=await read(first,domain);if(JSON.stringify(current.value)===JSON.stringify(value))report.restoration.push(domain+': unchanged');else {assert.equal(current.version,version,'Concurrent edit detected; cleanup stopped');await write(first,domain,value,version);report.restoration.push(domain+': restored')}}catch(error){report.restoration.push(domain+': failed: '+error.message);report.result='failed';process.exitCode=1}}
  await browser?.close();fs.writeFileSync(path.join(out,'ui.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }
})().catch(error=>{console.error(error);process.exitCode=1});
