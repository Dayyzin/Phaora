# Fable type

The two PHAÖRA faces, traced from Fable's specimen images (`caps.png`, `lower.png`).

    pip install fonttools brotli opencv-python-headless potracer numpy
    python3 make_lower.py && python3 make_caps.py
    cp PhaoraFable-*.woff2 ../../assets/fonts/

- `PhaoraFable-Wordmark` — P H A Ö R a from the letter studies (`study.png`).
- `PhaoraFable-Lower` — a–z (a from the letter studies, m built from n; no x yet), uppercase maps to the same glyphs.
- Not in the specimens: x, figures, punctuation, the other capitals. Pages fall back to Cormorant for those.
