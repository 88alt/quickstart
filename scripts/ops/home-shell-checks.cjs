const assert=require('node:assert/strict');
async function checkHomeShell(page,report,{editable=true,touch=false}={}){
 assert.equal(await page.locator('.lab-header,.lab-intro,.lab-footer,[data-open-applications]').count(),0,'Removed product header/footer or replacement launcher remains');
 assert.equal(await page.locator('[data-ordered-home] > footer').count(),0);
 const website=page.locator('[data-home-top] a');assert.equal(await website.getAttribute('href'),'https://www.istoreos.com/');assert.match(await website.getAttribute('rel'),/noopener/);
 const quick=page.locator('[data-home-quick]');assert.ok(await quick.count()>=4);for(const icon of ['navigation','topology','speed','appStore'])assert.equal(await page.locator('[data-home-quick='+icon+']').count(),1);
 const metrics=await page.locator('[data-ordered-home]').evaluate(root=>{const top=root.querySelector('[data-home-top]').getBoundingClientRect(),first=root.querySelector('[data-layout-card]')?.getBoundingClientRect(),last=[...root.querySelectorAll('[data-ordered-row]')].at(-1)?.getBoundingClientRect(),style=getComputedStyle(root);return {topBottom:top.bottom,firstTop:first?.top,bottomGap:last?root.getBoundingClientRect().bottom-last.bottom:null,paddingBottom:style.paddingBottom,minHeight:style.minHeight}});
 assert.equal(metrics.paddingBottom,'24px');assert.equal(metrics.minHeight,'0px');if(metrics.firstTop!==undefined)assert.ok(metrics.firstTop>=metrics.topBottom);if(metrics.bottomGap!==null)assert.ok(metrics.bottomGap<=60,'Reserved footer whitespace remains');report.shellMetrics=metrics;
 const settings=page.locator('[data-home-settings]');assert.equal(await settings.isEnabled(),editable);
 if(touch){const box=await settings.boundingBox();assert.ok(box.width>=44&&box.height>=44,'Settings touch target smaller than 44px')}
 if(editable){await settings.focus();await page.keyboard.press('Enter');await page.locator('.ordered-editing').waitFor();assert.equal(await page.locator('[data-home-quick=navigation]').getAttribute('aria-disabled'),'true');await page.locator('[data-overview]').click();await page.locator('[data-layout-overview]').waitFor();await page.locator('[data-cancel]').click();assert.equal(await settings.evaluate(n=>n===document.activeElement),true,'Editor did not return focus to the old settings icon')}
 report.checks.push('Old website/settings/quick cards restored; product header/footer absent; keyboard editor and content spacing preserved');
}
async function setSystemTheme(page,theme){
 await page.evaluate(theme=>document.body.setAttribute('theme',theme),theme);await page.waitForTimeout(300);
 const colors=await page.locator('[data-home-top]').evaluate(top=>{const expected=(token)=>{const n=document.createElement('span');n.style.color='var('+token+')';top.append(n);const color=getComputedStyle(n).color;n.remove();return color};return {title:getComputedStyle(top.querySelector('.title')).color,subtitle:getComputedStyle(top.querySelector('.subtitle')).color,icon:getComputedStyle(top.querySelector('[data-home-settings] path')).fill,text:expected('--c-text'),muted:expected('--c-muted')}});
 assert.equal(colors.title,colors.text,'Restored quick card title ignores system theme');assert.equal(colors.subtitle,colors.muted,'Restored quick card subtitle ignores system theme');assert.equal(colors.icon,colors.text,'Restored settings icon has insufficient theme contrast');
}
module.exports={checkHomeShell,setSystemTheme};
