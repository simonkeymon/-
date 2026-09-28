import glob
parts=''.join(open(f,encoding='utf8').read() for f in sorted(glob.glob('parts/s*.html')))
open('index.html','w',encoding='utf8').write(open('head.part',encoding='utf8').read()+parts+open('tail.part',encoding='utf8').read())
