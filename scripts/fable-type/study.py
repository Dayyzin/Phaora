import numpy as np, cv2
im=cv2.imread('study.png').astype(np.float32)
TILES={'P':(40,494,42,502),'H':(40,494,537,998),'A':(40,494,1032,1492),
       'Odieresis':(526,978,42,502),'R':(526,978,537,998),'a':(526,978,1032,1492)}
def tile(name):
    y0,y1,x0,x1=TILES[name]
    y0+=50; x0+=10; x1-=10; y1-=10
    t=im[y0:y1,x0:x1]
    bg=np.median(t.reshape(-1,3),axis=0)
    d=np.abs(t-bg).max(axis=2)
    ink=np.percentile(d,99.5)
    soft=np.clip(d/(0.7*ink),0,1)
    full=np.zeros(im.shape[:2],np.float32); full[y0:y1,x0:x1]=soft
    hard=soft>0.5; ys,xs=np.where(hard)
    return full,(y0,y1,x0,x1),(xs.min()+x0,xs.max()+x0,ys.min()+y0,ys.max()+y0)
if __name__=='__main__':
    for n in TILES: print(n,tile(n)[2])
