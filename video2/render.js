// node render.js <startFrame> <endFrame> <out.mp4> — renders frames [start,end) at 30fps into an H.264 segment
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
const FF=process.env.FFMPEG, FPS=30;
const [s,e,out]=[+process.argv[2],+process.argv[3],process.argv[4]];
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
  await p.goto('file://'+__dirname+'/index.html');await p.waitForFunction(()=>window.READY);await p.evaluate(()=>document.fonts.ready);
  const ff=spawn(FF,['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-',
    '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r',String(FPS),out],{stdio:['pipe','inherit','inherit']});
  for(let f=s;f<e;f++){
    await p.evaluate(t=>seek(t),f/FPS);
    const buf=await p.screenshot({type:'jpeg',quality:93});
    if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
    if((f-s)%300===0)console.log(out,f);
  }
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done',out);
})();
