#!/usr/bin/env python3
"""
Adaptive tone grade for job photos.

Cape Cod job sites are photographed in whatever light the day gives you,
which is usually flat overcast or outright rain. Those frames are not
underexposed — measured across this page they already run black to white —
they are dark in the MIDTONES and cold in colour. That is what reads as
lifeless, so that is what this corrects, rather than stretching a range
that is already full and clipping the sky doing it.

Four passes, every one of them adaptive and damped: a photo that is already
warm, bright and saturated barely moves, and a flat wet-day frame gets the
most. That is the point — a fixed grade applied to a whole folder wrecks the
good photos to rescue the bad ones.

  1. Warmth      cold cast pulled toward neutral, capped at ±6% per channel
  2. Midtones    gamma toward a target mean, brighten only, never darken
  3. Contrast    soft S-curve around the pivot, shoulder rolls off so a
                 near-white sky cannot clip
  4. Vibrance    solved, not guessed: brightening desaturates, so the gain is
                 bisected until mean saturation actually lands above where the
                 frame STARTED. Weighted by (1 - sat) per pixel, so muted stone
                 gains and foliage that is already green stays green

Never used to misrepresent work: this is exposure and colour only. Nothing is
added, removed, moved or composited. The stone is the stone.

Usage:  python3 tools/grade_photos.py <dir-or-files...> [--dry-run]
Revert: git checkout -- <path>     (the originals are the committed files)
"""
import sys, os, glob
import numpy as np
from PIL import Image, ImageOps

TARGET_MEAN   = 0.52   # where midtones should sit, 0-1
MEAN_DAMP     = 0.60   # only travel this far toward the target
GAMMA_FLOOR   = 0.72   # hardest brightening allowed
WARM_CAP      = 0.06   # max per-channel white-balance move
WARM_DAMP     = 0.55
SAT_LIFT      = 1.15   # aim this much above the frame's OWN starting colour
SAT_FLOOR     = 0.20   # ...but a very flat frame still gets pulled up to here
SAT_CEIL      = 0.40   # ...and an already-vivid one is never pushed past here
SAT_MAX_GAIN  = 1.20   # ceiling on the solver's gain
CONTRAST_MAX  = 0.16   # max S-curve strength
PIVOT         = 0.48


def srgb_stats(a):
    lum = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    mx, mn = a.max(2), a.min(2)
    sat = np.where(mx > 1e-6, (mx - mn) / np.maximum(mx, 1e-6), 0.0)
    return lum, sat


def grade(a):
    """a: float32 HxWx3 in 0..1. Returns graded copy."""
    out = a.copy()
    s_orig = float(srgb_stats(a)[1].mean())   # colour we must end ABOVE

    # 1. WARMTH — gray-world, but damped and capped. An overcast frame reads
    # blue; a full gray-world correction on a photo that is legitimately
    # green (a planted bed) would drag the planting gray, hence the cap.
    means = out.reshape(-1, 3).mean(0)
    target = means.mean()
    scale = np.clip(target / np.maximum(means, 1e-6), 1 - WARM_CAP, 1 + WARM_CAP)
    scale = 1.0 + (scale - 1.0) * WARM_DAMP
    out *= scale

    # 2. MIDTONES — gamma toward the target mean. Clamped at 1.0 so this can
    # only ever brighten: a frame shot in real sun should not be pulled down
    # to match a wet one.
    lum, _ = srgb_stats(out)
    m = float(np.clip(lum.mean(), 1e-3, 0.999))
    goal = m + (TARGET_MEAN - m) * MEAN_DAMP
    g = float(np.clip(np.log(max(goal, 1e-3)) / np.log(m), GAMMA_FLOOR, 1.0))
    out = np.clip(out, 0, 1) ** g

    # 3. CONTRAST — S-curve strength scales with how flat the frame is now.
    # sin() gives a natural soft shoulder at both ends, so the sky rolls off
    # instead of clipping to a white blob.
    lum, _ = srgb_stats(out)
    flat = float(np.clip((0.24 - lum.std()) / 0.24, 0.0, 1.0))
    k = CONTRAST_MAX * flat
    if k > 1e-4:
        x = np.clip(out, 0, 1)
        out = x - k * np.sin(2 * np.pi * (x - PIVOT)) / (2 * np.pi)

    # 4. VIBRANCE — lift weighted by (1 - sat), so muted stone and gray sky
    # gain while already-saturated foliage is left alone.
    #
    # Solved, not guessed. Brightening in step 2 DESATURATES (it compresses
    # the channels toward the top of the range), so a fixed gain here quietly
    # landed every frame flatter in colour than it started — the exact
    # opposite of the job. The goal is set against the frame's ORIGINAL
    # saturation and the gain is bisected until it actually lands there.
    out = np.clip(out, 0, 1)
    goal = float(np.clip(s_orig * SAT_LIFT, SAT_FLOOR, max(SAT_CEIL, s_orig)))

    def apply(g):
        l, sa = srgb_stats(out)
        return np.clip(out + (out - l[..., None]) * g * (1.0 - sa)[..., None], 0, 1)

    lo, hi = 0.0, SAT_MAX_GAIN
    if float(srgb_stats(apply(hi))[1].mean()) <= goal:
        out = apply(hi)
    else:
        for _ in range(18):                  # ~1e-5 on the gain, plenty
            mid = (lo + hi) / 2
            if float(srgb_stats(apply(mid))[1].mean()) < goal: lo = mid
            else: hi = mid
        out = apply((lo + hi) / 2)

    return np.clip(out, 0, 1)


def main(argv):
    dry = "--dry-run" in argv
    args = [a for a in argv if not a.startswith("--")]
    files = []
    for a in args:
        files.extend(sorted(glob.glob(os.path.join(a, "*.jpg"))) if os.path.isdir(a) else [a])
    if not files:
        print("no files"); return 1

    print(f"{'file':<14}{'mean':>14}{'sat':>14}")
    for f in files:
        im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        a = np.asarray(im, dtype=np.float32) / 255.0
        l0, s0 = srgb_stats(a)
        out = grade(a)
        l1, s1 = srgb_stats(out)
        print(f"{os.path.basename(f):<14}"
              f"{l0.mean()*255:6.1f} -> {l1.mean()*255:5.1f}"
              f"{s0.mean():8.3f} -> {s1.mean():5.3f}")
        if not dry:
            Image.fromarray((out * 255 + 0.5).astype(np.uint8)).save(
                f, "JPEG", quality=86, optimize=True, progressive=True)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
