#!/usr/bin/env python3
"""Phaora video montage generator."""

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from moviepy import VideoFileClip, ImageClip, CompositeVideoClip, concatenate_videoclips, ColorClip, VideoClip
import os

# ── Brand constants ───────────────────────────────────────────────
INK       = (2, 6, 16)          # #020610
GOLD      = (200, 164, 94)       # #C8A45E
GOLD_LT   = (217, 188, 124)      # #D9BC7C
PEARL     = (234, 239, 245)      # #EAEFF5

VIDEO_IN  = "/root/.claude/uploads/d27d9729-463f-5d17-b1eb-69eccf3f5fdc/264b3e58-7015734372fb4f8eaf12df51c9bb9cb4.mov"
MARK_PNG  = "/root/.claude/uploads/d27d9729-463f-5d17-b1eb-69eccf3f5fdc/fc7f14c8-markgold.png"
FONT_LIGHT   = "/tmp/Cormorant-Regular.ttf"
FONT_MEDIUM  = "/tmp/Cormorant-Medium.ttf"
FONT_ITALIC  = "/tmp/CormorantGaramond-LightItalic.ttf"
FONT_PLAYFAIR = "/tmp/PlayfairDisplay-Regular.ttf"
OUT_PATH   = "/home/user/Phaora/phaora-montage.mp4"

W, H = 576, 1024
FPS  = 30


def draw_wordmark(draw, img, text, x, y, size, color, alpha=1.0):
    """Render text with Cormorant glyphs except Ö which uses Playfair Display."""
    font_cor = ImageFont.truetype(FONT_MEDIUM, size)
    font_pla = ImageFont.truetype(FONT_PLAYFAIR, size)
    r, g, b = color
    a = int(alpha * 255)

    cursor = x
    for ch in text:
        font = font_pla if ch == 'Ö' else font_cor
        bb = font.getbbox(ch)
        draw.text((cursor, y), ch, font=font, fill=(r, g, b, a))
        cursor += bb[2] - bb[0]
    return cursor  # final x


def measure_wordmark(text, size):
    """Measure total pixel width of the mixed wordmark."""
    font_cor = ImageFont.truetype(FONT_MEDIUM, size)
    font_pla = ImageFont.truetype(FONT_PLAYFAIR, size)
    w = 0
    for ch in text:
        font = font_pla if ch == 'Ö' else font_cor
        bb = font.getbbox(ch)
        w += bb[2] - bb[0]
    return w


def make_intro(duration=3.0):
    """Dark intro card: gold mark + PHAÖRA wordmark."""
    frames = []
    n = int(duration * FPS)

    # Load and size the mark
    mark_src = Image.open(MARK_PNG).convert("RGBA")
    mark_w = 180
    ratio = mark_w / mark_src.width
    mark_h = int(mark_src.height * ratio)
    mark = mark_src.resize((mark_w, mark_h), Image.LANCZOS)

    font_sub = ImageFont.truetype(FONT_ITALIC, 22)

    def build_frame(alpha):
        bg = Image.new("RGBA", (W, H), (*INK, 255))
        draw = ImageDraw.Draw(bg)

        # Mark centred at 38% height
        mx = (W - mark_w) // 2
        my = int(H * 0.28)
        mark_a = mark.copy()
        mark_a.putalpha(Image.fromarray(
            (np.array(mark_a.split()[3]) * alpha).astype(np.uint8)
        ))
        bg.paste(mark_a, (mx, my), mark_a)

        # Divider rule
        rule_y = my + mark_h + 36
        rule_len = 44
        for x in range(rule_len):
            t = x / rule_len
            a_px = int(alpha * 255 * (1 - abs(t - 0.5) * 2))
            r, g, b = GOLD
            draw.point((W // 2 - rule_len // 2 + x, rule_y), fill=(r, g, b, a_px))

        # Wordmark (Cormorant + Playfair Ö)
        wm_text = "PHAÖRA"
        wm_size = 58
        tw = measure_wordmark(wm_text, wm_size)
        tx = (W - tw) // 2
        ty = rule_y + 20
        draw_wordmark(draw, bg, wm_text, tx, ty, wm_size, PEARL, alpha)

        # Tagline
        tag = "Landscape · Architecture · Design"
        tb = font_sub.getbbox(tag)
        ttw = tb[2] - tb[0]
        ttx = (W - ttw) // 2
        tty = ty + 78
        a_tag = int(alpha * 180)
        r2, g2, b2 = GOLD
        draw.text((ttx, tty), tag, font=font_sub, fill=(r2, g2, b2, a_tag))

        return np.array(bg.convert("RGB"))

    for i in range(n):
        t = i / n
        # ease-in-out fade
        if t < 0.35:
            alpha = (t / 0.35) ** 2
        elif t > 0.75:
            alpha = ((1 - t) / 0.25) ** 0.8
        else:
            alpha = 1.0
        frames.append(build_frame(alpha))

    frames_arr = np.stack(frames)
    def make_frame(t):
        idx = min(int(t * FPS), len(frames) - 1)
        return frames[idx]

    return VideoClip(make_frame, duration=duration).with_fps(FPS)


def make_outro(duration=3.5):
    """Elegant outro: mark fades in on dark, then holds."""
    frames = []
    n = int(duration * FPS)

    mark_src = Image.open(MARK_PNG).convert("RGBA")
    mark_w = 140
    ratio = mark_w / mark_src.width
    mark_h = int(mark_src.height * ratio)
    mark = mark_src.resize((mark_w, mark_h), Image.LANCZOS)

    font_url = ImageFont.truetype(FONT_ITALIC, 16)

    def build_frame(alpha):
        bg = Image.new("RGBA", (W, H), (*INK, 255))
        draw = ImageDraw.Draw(bg)

        # Mark
        mx = (W - mark_w) // 2
        my = int(H * 0.30)
        mark_a = mark.copy()
        mark_a.putalpha(Image.fromarray(
            (np.array(mark_a.split()[3]) * alpha).astype(np.uint8)
        ))
        bg.paste(mark_a, (mx, my), mark_a)

        # Wordmark (Cormorant + Playfair Ö)
        wm_text = "PHAÖRA"
        wm_size = 50
        tw = measure_wordmark(wm_text, wm_size)
        tx = (W - tw) // 2
        ty = my + mark_h + 30
        draw_wordmark(draw, bg, wm_text, tx, ty, wm_size, PEARL, alpha)

        # Website
        url = "phaora.com"
        ub = font_url.getbbox(url)
        uw = ub[2] - ub[0]
        ux = (W - uw) // 2
        uy = ty + 64
        r2, g2, b2 = GOLD
        draw.text((ux, uy), url, font=font_url, fill=(r2, g2, b2, int(alpha * 160)))

        return np.array(bg.convert("RGB"))

    for i in range(n):
        t = i / n
        if t < 0.4:
            alpha = (t / 0.4) ** 1.5
        elif t > 0.85:
            alpha = max(0, (1 - (t - 0.85) / 0.15))
        else:
            alpha = 1.0
        frames.append(build_frame(alpha))

    def make_frame(t):
        idx = min(int(t * FPS), len(frames) - 1)
        return frames[idx]

    return VideoClip(make_frame, duration=duration).with_fps(FPS)


def add_watermark_overlay(clip, opacity=0.55):
    """Small Phaora mark watermark, bottom-right."""
    mark_src = Image.open(MARK_PNG).convert("RGBA")
    wm_w = 52
    ratio = wm_w / mark_src.width
    wm_h = int(mark_src.height * ratio)
    mark = mark_src.resize((wm_w, wm_h), Image.LANCZOS)

    # Composite onto transparent layer
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    alpha_arr = np.array(mark.split()[3])
    alpha_arr = (alpha_arr * opacity).astype(np.uint8)
    mark.putalpha(Image.fromarray(alpha_arr))

    px = W - wm_w - 20
    py = H - wm_h - 28
    overlay.paste(mark, (px, py), mark)
    wm_arr = np.array(overlay.convert("RGB"))
    wm_alpha = np.array(overlay.split()[3]) / 255.0

    def blend_frame(frame):
        f = frame.astype(np.float32)
        a = wm_alpha[:, :, None]
        return np.clip(f * (1 - a) + wm_arr.astype(np.float32) * a, 0, 255).astype(np.uint8)

    return clip.image_transform(blend_frame)


def add_vignette(clip):
    """Soft dark vignette around the frame edges."""
    vig = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(vig)

    # Radial gradient vignette via concentric ellipses
    cx, cy = W // 2, H // 2
    steps = 60
    for i in range(steps, 0, -1):
        t = i / steps
        a = int(t ** 2.2 * 140)
        rw = int(W * (1 - t * 0.55))
        rh = int(H * (1 - t * 0.45))
        x0, y0 = cx - rw, cy - rh
        x1, y1 = cx + rw, cy + rh
        draw.ellipse([x0, y0, x1, y1], fill=(0, 0, 0, a))

    vig_arr = np.array(vig.convert("RGB")).astype(np.float32)
    vig_alpha = np.array(vig.split()[3]).astype(np.float32) / 255.0

    def apply_vig(frame):
        f = frame.astype(np.float32)
        a = vig_alpha[:, :, None]
        return np.clip(f * (1 - a), 0, 255).astype(np.uint8)

    return clip.image_transform(apply_vig)


def color_grade(clip):
    """Subtle warm-dark Phaora color grade: slight desaturate + warm shadow lift."""
    def grade(frame):
        f = frame.astype(np.float32) / 255.0

        # Slight crush blacks toward #020610 tone
        f = f * 0.92 + np.array([2/255, 6/255, 16/255]) * 0.08

        # Subtle warm tint in highlights (gold shimmer)
        lum = 0.2126 * f[:,:,0] + 0.7152 * f[:,:,1] + 0.0722 * f[:,:,2]
        warmth = lum[:, :, None] * np.array([0.008, 0.004, -0.006])
        f = np.clip(f + warmth, 0, 1)

        return (f * 255).astype(np.uint8)

    return clip.image_transform(grade)


def main():
    print("Loading source video...")
    src = VideoFileClip(VIDEO_IN)
    src_fps = src.fps or FPS

    print(f"  {src.w}x{src.h} @ {src_fps:.1f}fps  {src.duration:.1f}s")

    print("Grading & overlaying main video...")
    main_clip = color_grade(src)
    main_clip = add_vignette(main_clip)
    main_clip = add_watermark_overlay(main_clip)

    print("Building intro...")
    intro = make_intro(duration=3.0)

    print("Building outro...")
    outro = make_outro(duration=3.5)

    print("Concatenating...")
    final = concatenate_videoclips([intro, main_clip, outro], method="compose")

    print(f"Rendering → {OUT_PATH}")
    final.write_videofile(
        OUT_PATH,
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        bitrate="4000k",
        audio_bitrate="192k",
        preset="slow",
        threads=4,
        logger="bar",
    )
    print("Done.")


if __name__ == "__main__":
    main()
