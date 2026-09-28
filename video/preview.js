const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file://'+__dirname+'/index.html');await p.waitForFunction(()=>window.READY);await p.evaluate(()=>document.fonts.ready);
const fs=require('fs');fs.mkdirSync(__dirname+'/preview',{recursive:true});
for(const t of process.argv.slice(2).map(Number)){await p.evaluate(t=>seek(t),t);await p.waitForTimeout(50);
 await p.screenshot({path:`${__dirname}/preview/t${String(t).padStart(6,'0')}.png`});console.log('t',t)}
await b.close()})();
