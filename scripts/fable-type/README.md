# Fable type

The two PHAÖRA faces, traced from Fable's specimen images (`caps.png`, `lower.png`).

    pip install fonttools brotli opencv-python-headless potracer numpy
    python3 make_lower.py && python3 make_caps.py
    cp PhaoraFable-*.woff2 ../../assets/fonts/

- `PhaoraFable-Wordmark` — P H A Ö R from the large wordmark line.
- `PhaoraFable-Lower` — a–z (m built from n; no x yet), uppercase maps to the same glyphs.
- Not in the specimens: x, figures, punctuation, the other capitals. Pages fall back to Cormorant for those.
