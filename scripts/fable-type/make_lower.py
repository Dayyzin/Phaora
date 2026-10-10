import numpy as np, sys, cv2
sys.path.insert(0,'.')
from build import *
white, teal = masks('lower.png')
ROWS={1:(30,268),2:(332,570),3:(667,826),4:(936,1178),5:(1238,1479),6:(1540,1744),7:(1841,2083)}
BASE={1:206,2:510,3:811,4:1112,5:1415,6:1716,7:2019}
SRC=[('a',1,519,612,0),('b',7,8,106,0),('c',2,485,592,0),('d',6,541,634,0),('e',2,775,880,0),
('f',7,380,485,0),('g',7,1150,1258,1),('h',1,108,228,0),('i',5,312,388,0),('j',5,28,113,1),
('k',4,357,455,0),('l',7,745,797,0),('n',7,1037,1150,0),('o',1,312,425,0),('p',1,8,106,1),
('q',4,40,125,1),('r',1,425,510,0),('s',7,1775,1860,0),('t',3,228,273,0),('u',4,125,222,0),
('v',5,203,310,0),('w',6,4,198,0),('y',4,509,672,1),('z',6,237,358,0)]
SCALE=440/97
glyphs=[]
for name,row,x0,x1,desc in SRC:
    y0,y1=ROWS[row]; base=BASE[row]
    src=white.copy()
    if not desc: src[base+4:, :]=0
    soft,xa=glyph_bitmap(src,y0,y1,x0,x1)
    glyphs.append(dict(name=name,soft=soft,xa=xa,y0=y0,cut0=x0,cut1=x1,base=base,scale=SCALE,
                       unicodes=[ord(name),ord(name.upper())]))
# synthesize m from n: overlay a copy of n, from its left stem on, onto its right stem
n=[g for g in glyphs if g['name']=='n'][0]
s=n['soft']; base_local=n['base']-n['y0']
band=(s[base_local-80:base_local-10]>0.5).sum(axis=0)
stems=np.where(band>=60)[0]
groups=np.split(stems,np.where(np.diff(stems)>1)[0]+1)
l0=groups[0][0]; r0=groups[-1][0]
print('n stems',[ (g[0]+n['xa'],g[-1]+n['xa']) for g in groups])
off=r0-l0
W=s.shape[1]+off
m=np.zeros((s.shape[0],W),np.float32); m[:,:s.shape[1]]=s
part=s[:,l0:]
m[:,r0:r0+part.shape[1]]=np.maximum(m[:,r0:r0+part.shape[1]],part)
glyphs.append(dict(name='m',soft=m,xa=n['xa'],y0=n['y0'],cut0=n['cut0'],cut1=n['cut1']+off,base=n['base'],scale=SCALE,unicodes=[ord('m'),ord('M')]))
build(dict(glyphs=glyphs,space=230,lsb_pad=6,ascent=900,descent=300,xh=440,cap=760),'PhaoraFable-Lower','Phaora Fable Text')
