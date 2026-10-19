const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
assert.equal(process.env.QS_ACCEPT_HOST,'192.168.30.244');
const base='http://192.168.30.244',home=base+'/cgi-bin/luci/admin/quickstart/',entry=base+'/cgi-bin/luci/admin/store/entrysh',launcher=base+'/cgi-bin/luci/istore/home/v1/launcher/';
const out=process.env.QS_PINNED_EVIDENCE;fs.mkdirSync(out,{recursive:true});const report={checks:[],errors:[],result:'running'};let browser,page;
(async()=>{try{
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:process.env.QS_ACCEPT_TOUCH==='1'?390:1440,height:900},locale:process.env.QS_ACCEPT_LANGUAGE==='en'?'en-US':'zh-CN',hasTouch:process.env.QS_ACCEPT_TOUCH==='1'});
 await context.addCookies([{name:'sysauth_http',value:process.env.QS_ACCEPT_SID,domain:'192.168.30.244',path:'/'}]);page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.route(launcher,async route=>{assert.equal(route.request().method(),'GET');const r=await route.fetch(),b=await r.json();b.result.value.favorites=['istoreenhance',...b.result.value.favorites.filter(id=>id!=='istoreenhance')].slice(0,24);await route.fulfill({response:r,json:b})});
 await page.goto(home,{waitUntil:'networkidle'});const pin=page.locator('[data-favorite-app=istoreenhance][data-availability=available]');await pin.waitFor();
 await page.evaluate(()=>{window.__pinSeen={windows:0,panels:[]};new MutationObserver(()=>{if(document.querySelector('[data-applications-browser]'))window.__pinSeen.windows++;if(new URL(location.href).searchParams.has('panel'))window.__pinSeen.panels.push(location.search)}).observe(document.documentElement,{childList:true,subtree:true,attributes:true})});
 await page.route(entry,async route=>{await new Promise(r=>setTimeout(r,1500));await route.fulfill({json:{code:200,status:[{app:'istoreenhance',running:true,web:':5003',protocol:'http'}],errors:{}}}).catch(()=>{})});
 const pending=page.waitForRequest(r=>r.url()===entry);await pin.click();await pending;await page.waitForTimeout(100);report.pending=await page.evaluate(()=>({windows:window.__pinSeen.windows,panels:window.__pinSeen.panels,url:location.href,dialogs:document.querySelectorAll('[data-applications-browser]').length}));
 assert.equal(report.pending.dialogs,0,'Clicking a homepage pin must never open the launcher');assert.equal(report.pending.windows,0,'Even a transient launcher flash is a failure');assert.deepEqual(report.pending.panels,[],'Homepage activation must not create launcher history');report.checks.push('Homepage pin resolves in place without any launcher insertion or panel URL');
 report.result='passed';
}catch(e){report.result='failed';report.failure=e.stack;if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});process.exitCode=1}
finally{await browser?.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2))}})();
