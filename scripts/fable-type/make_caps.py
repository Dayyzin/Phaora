import sys; sys.path.insert(0,'.')
from build import *
from study_glyphs import study_glyph
S=700/281
uni={'P':[0x50,0x70],'H':[0x48,0x68],'A':[0x41],'Odieresis':[0xD6,0xF6,0x4F,0x6F],'R':[0x52,0x72],'a':[0x61]}
gl=[study_glyph(n,S,12,uni[n]) for n in ['P','H','A','Odieresis','R','a']]
build(dict(glyphs=gl,space=260,lsb_pad=0,ascent=900,descent=120,xh=557,cap=700),'PhaoraFable-Wordmark','Phaora Fable Wordmark')
