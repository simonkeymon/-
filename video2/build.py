import glob, json
T=json.load(open('timing.json',encoding='utf8'))
TICKS=['1950','1956','1960s','1974','1977','1997','2011','2012','2016','2017','2022','2023','2025','2026','?']
open('config.js','w',encoding='utf8').write('window.CONFIG='+json.dumps({'total':T['total'],'starts':T['starts'],'subs':T['subs'],'ticks':TICKS},ensure_ascii=False)+';\n')
parts=''.join(open(f,encoding='utf8').read() for f in sorted(glob.glob('parts/s*.html')))
open('index.html','w',encoding='utf8').write(open('head.part',encoding='utf8').read()+parts+open('tail.part',encoding='utf8').read())
