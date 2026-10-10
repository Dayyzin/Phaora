import sys; sys.path.insert(0,'.')
from build import *
white, teal = masks('caps.png')
S=700/349; BASE=429; Y0,Y1=0,445
SRC=[('P',white,0,200,(0,200)),('H',white,200,572,(200,572)),('A',white,572,1190,(572,932)),
     ('Odieresis',teal,900,1215,(932,1196)),('R',white,1190,1500,(1196,1500))]
uni={'P':[0x50,0x70],'H':[0x48,0x68],'A':[0x41,0x61],'Odieresis':[0xD6,0xF6,0x4F,0x6F],'R':[0x52,0x72]}
gl=[]
for name,src,x0,x1,adv in SRC:
    soft,xa=glyph_bitmap(src,Y0,Y1,x0,x1)
    gl.append(dict(name=name,soft=soft,xa=xa,y0=Y0,cut0=x0,cut1=x1,adv=adv,base=BASE,scale=S,unicodes=uni[name]))
build(dict(glyphs=gl,space=260,lsb_pad=0,ascent=900,descent=120,xh=700,cap=700),'PhaoraFable-Wordmark','Phaora Fable Wordmark')
