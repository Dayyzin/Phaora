import sys; sys.path.insert(0,'.')
from build import glyph_bitmap
from study import tile
BASE={'P':417,'H':417,'A':417,'Odieresis':901,'R':901,'a':893}
def study_glyph(name, scale, pad_px, unicodes):
    full,(y0,y1,x0,x1),(bx0,bx1,_,_) = tile(name)
    soft,xa = glyph_bitmap(full,y0,y1,x0,x1)
    return dict(name=name,soft=soft,xa=xa,y0=y0,cut0=x0,cut1=x1,adv=(bx0-pad_px,bx1+pad_px),
                base=BASE[name],scale=scale,unicodes=unicodes)
