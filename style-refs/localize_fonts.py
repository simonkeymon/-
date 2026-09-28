import re,subprocess,hashlib,os,sys
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
os.makedirs('fonts',exist_ok=True)
for f in sys.argv[1:]:
    html=open(f,encoding='utf8').read()
    m=re.search(r'<link href="(https://fonts.googleapis.com/[^"]+)" rel="stylesheet">',html)
    if not m: continue
    url=m.group(1).replace('&amp;','&')
    css=subprocess.check_output(['curl','-sS','-A',UA,url]).decode()
    def dl(mm):
        u=mm.group(1); name='fonts/'+hashlib.md5(u.encode()).hexdigest()[:12]+'.woff2'
        if not os.path.exists(name): subprocess.check_call(['curl','-sS','-o',name,u])
        return f'url({name})'
    css=re.sub(r'url\((https://[^)]+)\)',dl,css)
    cssname='fonts/'+os.path.splitext(f)[0]+'.css'
    open(cssname,'w').write(css)
    html=html.replace(m.group(0),f'<link href="{cssname}" rel="stylesheet">')
    open(f,'w',encoding='utf8').write(html)
    print(f,'->',cssname,len(os.listdir('fonts')))
