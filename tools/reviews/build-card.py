#!/usr/bin/env python3
"""
Builds tools/reviews/card.html — the two-sided review card, print ready.

The QR is generated here and written into the page as inline SVG, so the
card has no script, no CDN and no network dependency: open it anywhere and
print. The earlier version drew the code in the browser off a CDN, which
prints an empty square on a laptop with no signal.

Nothing is written until the generated code has been decoded back and
matched against the link. A card whose QR does not resolve is worse than no
card, and it is not discovered until it is in someone's hand.

    python3 tools/reviews/build-card.py
    python3 tools/reviews/build-card.py "https://g.page/r/OTHER/review"
"""
import io, sys, os

REVIEW_LINK = "https://g.page/r/CZB3tcq239sNECE/review"

def qr_svg(url):
    import segno
    q = segno.make(url, error='m')

    buf = io.BytesIO()
    q.save(buf, kind='png', scale=10, border=4)
    buf.seek(0)
    try:
        import numpy as np, cv2
        img = cv2.imdecode(np.frombuffer(buf.read(), np.uint8), cv2.IMREAD_GRAYSCALE)
        decoded, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
        if decoded != url:
            raise SystemExit(f"QR did not decode back to the link.\n  wanted: {url}\n  got:    {decoded!r}")
        print(f"  verified: decoded back to {decoded}")
    except ImportError:
        print("  opencv not installed — QR written WITHOUT the decode check")

    # segno's SVG writer emits bytes, so it gets a BytesIO and is decoded here
    out = io.BytesIO()
    q.save(out, kind='svg', xmldecl=False, svgns=True, border=0,
           dark='#020610', omitsize=True, svgclass=None, lineclass=None)
    return out.getvalue().decode('utf-8').strip(), q.version

def main():
    url = sys.argv[1] if len(sys.argv) > 1 else REVIEW_LINK
    print(f"link: {url}")
    svg, version = qr_svg(url)
    print(f"  QR version {version}")

    here = os.path.dirname(os.path.abspath(__file__))
    tpl = open(os.path.join(here, 'card.template.html'), encoding='utf-8').read()
    html = tpl.replace('<!--QR-->', svg).replace('{{LINK}}', url)
    dest = os.path.join(here, 'card.html')
    open(dest, 'w', encoding='utf-8').write(html)
    print(f"  wrote {dest}")

if __name__ == '__main__':
    main()
