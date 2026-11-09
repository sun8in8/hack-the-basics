#!/usr/bin/env python3
"""Render "Pip and the Perfect Nest" — a 9:16 YouTube Shorts / Reels video.

Everything (illustration, captions, music, sound effects) is generated here.
Usage:  python3 make_reel.py [out_dir]
Needs:  Pillow, numpy, ffmpeg on PATH, Caladea font.
"""
import math, random, sys, os, subprocess, wave
from multiprocessing import Pool
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
DUR = 51.5
SS = 2  # supersampling for sprites
FONT_DIR = '/usr/share/fonts/truetype/crosextra/'
FONT_B = FONT_DIR + 'Caladea-Bold.ttf'
FONT_I = FONT_DIR + 'Caladea-BoldItalic.ttf'

# ---------------------------------------------------------------- helpers
def clamp(x, a=0.0, b=1.0): return a if x < a else b if x > b else x
def seg(t, a, b): return clamp((t - a) / (b - a))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def eout(x): x = clamp(x); return 1 - (1 - x) ** 3
def back(x):
    x = clamp(x); c = 1.9
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def lerp(a, b, x): return a + (b - a) * x
def shade(c, k): return tuple(int(clamp(v * k, 0, 255)) for v in c[:3])
def box(cx, cy, rx, ry): return [(cx - rx) * SS, (cy - ry) * SS, (cx + rx) * SS, (cy + ry) * SS]
def P(x, y): return (x * SS, y * SS)
def finish(im, scale=1.0):
    im = im.resize((max(1, int(im.width / SS * scale)), max(1, int(im.height / SS * scale))), Image.LANCZOS)
    return im

def vgrad(top, bot, w, h):
    a = np.linspace(0, 1, h)[:, None, None]
    arr = np.array(top, float)[None, None, :] * (1 - a) + np.array(bot, float)[None, None, :] * a
    arr = np.ascontiguousarray(np.broadcast_to(arr, (h, w, 3)).astype(np.uint8))
    return Image.fromarray(arr, 'RGB').convert('RGBA')

def with_alpha(im, alpha):
    if alpha >= 0.999: return im
    a = im.getchannel('A').point([int(v * alpha) for v in range(256)])
    im = im.copy(); im.putalpha(a); return im

def put(base, spr, cx, cy, rot=0.0, sx=1.0, sy=None, alpha=1.0):
    if sy is None: sy = sx
    if alpha <= 0.004 or sx <= 0.01 or sy <= 0.01: return
    im = spr
    if abs(sx - 1) > 1e-3 or abs(sy - 1) > 1e-3:
        im = im.resize((max(1, int(im.width * sx)), max(1, int(im.height * sy))), Image.BILINEAR)
    if rot: im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    im = with_alpha(im, alpha)
    x0 = int(round(cx - im.width / 2)); y0 = int(round(cy - im.height / 2))
    ax0, ay0 = max(0, x0), max(0, y0)
    ax1, ay1 = min(base.width, x0 + im.width), min(base.height, y0 + im.height)
    if ax1 <= ax0 or ay1 <= ay0: return
    base.alpha_composite(im.crop((ax0 - x0, ay0 - y0, ax1 - x0, ay1 - y0)), dest=(ax0, ay0))

def text_sprite(text, size, fill, font=FONT_B, stroke=0, stroke_fill=None):
    f = ImageFont.truetype(font, size * SS)
    l, t, r, b = f.getbbox(text, stroke_width=stroke * SS)
    im = Image.new('RGBA', (r - l + 8 * SS, b - t + 8 * SS))
    ImageDraw.Draw(im).text((4 * SS - l, 4 * SS - t), text, font=f, fill=fill,
                            stroke_width=stroke * SS, stroke_fill=stroke_fill)
    return finish(im)

def soft_ellipse(rx, ry, color, alpha, blur):
    pad = blur * 3
    im = Image.new('RGBA', (2 * (rx + pad), 2 * (ry + pad)))
    ImageDraw.Draw(im).ellipse([pad, pad, pad + 2 * rx, pad + 2 * ry], fill=color + (alpha,))
    return im.filter(ImageFilter.GaussianBlur(blur))

def radial(w, h, color, power=1.6, amax=255):
    y, x = np.mgrid[0:h, 0:w]
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    a = (np.clip(1 - d, 0, 1) ** power * amax).astype(np.uint8)
    arr = np.zeros((h, w, 4), np.uint8); arr[..., :3] = color; arr[..., 3] = a
    return Image.fromarray(arr, 'RGBA')

# ---------------------------------------------------------------- palette
LEAF_COLS = [(224, 122, 46), (196, 72, 44), (232, 178, 60), (158, 108, 60), (180, 146, 56), (214, 94, 40), (170, 60, 40)]
BROWN_D, BROWN_M, BROWN_L = (70, 46, 30), (104, 70, 46), (128, 90, 60)
CREAM = (236, 208, 168)
INK = (64, 40, 26)

def ground_y(x, base=1375, amp=18, ph=0.28):
    return base + amp * math.sin(x / W * 2 * math.pi + math.pi + ph)

# ---------------------------------------------------------------- sprites
def make_leaf(col, L=110, wid=0.34, bend=0.0):
    pad = L
    cw, ch = int(L * 1.4 + 2 * pad), int(L + 2 * pad)
    im = Image.new('RGBA', (cw * SS, ch * SS)); d = ImageDraw.Draw(im)
    ox, oy = pad + 0.2 * L, ch / 2
    top, bot, mid = [], [], []
    for i in range(41):
        u = i / 40
        hw = wid * L * math.sin(math.pi * u) ** 0.75 * (1 - 0.25 * u)
        my = oy + bend * L * u * u
        mx = ox + u * L * (1 - 0.15 * bend)
        top.append(P(mx, my - hw)); bot.append(P(mx, my + hw)); mid.append(P(mx, my))
    d.polygon(top + bot[::-1], fill=col, outline=shade(col, 0.78), width=2 * SS)
    vein = shade(col, 0.72)
    d.line(mid, fill=vein, width=3 * SS)
    for j in range(1, 6):
        u = j / 6.5; i = int(u * 40)
        mx, my = mid[i]
        for s in (-1, 1):
            hw = wid * L * math.sin(math.pi * u) ** 0.75 * (1 - 0.25 * u) * 0.7
            d.line([(mx, my), (mx + 0.12 * L * SS, my + s * hw * SS)], fill=vein, width=2 * SS)
    d.line([P(ox - 0.2 * L, oy + 0.03 * L), P(ox, oy)], fill=shade(col, 0.6), width=4 * SS)
    return finish(im.crop(im.getbbox()))

def spikes(d, cx, cy, rx, ry, a0, a1, rng, layers, gap=None):
    for li, (col, ext, rr, n, sp) in enumerate(layers):
        for i in range(n):
            deg = a0 + (a1 - a0) * i / (n - 1) + rng.uniform(-2, 2)
            if gap and gap[0] < deg % 360 < gap[1]: continue
            def E(ang, extra=0.0):
                a = math.radians(ang)
                return P(cx + (rx * rr + extra) * math.cos(a), cy - (ry * rr + extra) * math.sin(a))
            d.polygon([E(deg - sp), E(deg + 9, ext + rng.uniform(-8, 8)), E(deg + sp)], fill=col)
        if li == 0:
            d.ellipse(box(cx, cy, rx, ry), fill=BROWN_M)

def make_pip():
    w, h = 820, 560
    im = Image.new('RGBA', (w * SS, h * SS)); d = ImageDraw.Draw(im)
    cx, cy, rx, ry = 340, 320, 250, 175
    for fx in (cx - 110, cx + 140):
        d.ellipse(box(fx, cy + 165, 50, 24), fill=(96, 64, 46))
    rng = random.Random(7)
    spikes(d, cx, cy, rx, ry, 28, 240, rng,
           [(BROWN_D, 92, 0.97, 54, 5.5), ((92, 60, 40), 70, 0.9, 50, 5), (BROWN_L, 46, 0.8, 46, 4.5)])
    d.ellipse(box(cx + 60, cy + 100, 190, 74), fill=(222, 192, 152))
    d.ellipse(box(cx + 190, cy + 30, 135, 122), fill=CREAM)
    d.ellipse(box(cx + 300, cy + 55, 112, 58), fill=CREAM)
    d.ellipse(box(cx + 165, cy - 85, 31, 31), fill=CREAM)
    d.ellipse(box(cx + 165, cy - 85, 17, 17), fill=(228, 150, 140))
    d.ellipse(box(cx + 265, cy + 5, 18, 19), fill=(36, 24, 20))
    d.ellipse(box(cx + 271, cy - 3, 6, 6), fill=(255, 255, 255))
    d.ellipse(box(cx + 408, cy + 48, 22, 20), fill=(40, 26, 22))
    d.ellipse(box(cx + 412, cy + 42, 6, 5), fill=(140, 110, 100))
    d.ellipse(box(cx + 290, cy + 78, 27, 15), fill=(240, 156, 142))
    d.arc(box(cx + 365, cy + 72, 24, 15), 20, 150, fill=(60, 36, 26), width=4 * SS)
    return finish(im, 0.75)

def make_ball(R=200):
    w = 2 * R + 260
    im = Image.new('RGBA', (w * SS, w * SS)); d = ImageDraw.Draw(im)
    c = w / 2
    rng = random.Random(11)
    spikes(d, c, c, R, R * 0.92, 0, 360, rng,
           [(BROWN_D, 95, 0.97, 66, 4.5), ((92, 60, 40), 72, 0.88, 60, 4), (BROWN_L, 48, 0.78, 54, 4)],
           gap=(292, 346))
    a = math.radians(-38)
    fx, fy = c + 0.6 * R * math.cos(a), c - 0.6 * R * 0.92 * math.sin(a)
    d.ellipse(box(fx, fy, 0.4 * R, 0.36 * R), fill=CREAM)
    d.ellipse(box(fx + 0.36 * R, fy + 0.12 * R, 0.17 * R, 0.13 * R), fill=CREAM)
    d.arc(box(fx + 0.02 * R, fy - 0.05 * R, 0.1 * R, 0.07 * R), 10, 170, fill=(40, 26, 22), width=5 * SS)
    d.ellipse(box(fx + 0.5 * R, fy + 0.13 * R, 0.07 * R, 0.065 * R), fill=(40, 26, 22))
    d.ellipse(box(fx + 0.1 * R, fy + 0.15 * R, 0.08 * R, 0.05 * R), fill=(240, 156, 142))
    d.ellipse(box(fx - 0.2 * R, fy - 0.3 * R, 0.09 * R, 0.09 * R), fill=CREAM)
    return finish(im)

def leaf_mound(n, rx, ry, seed, region='mound', inner=None):
    rng = random.Random(seed)
    cw, chh = int(2 * rx + 300), int(2 * ry + 300)
    im = Image.new('RGBA', (cw, chh))
    cx, cy = cw / 2, chh / 2
    items = []
    for i in range(n):
        if region == 'mound':
            x = rng.uniform(-1, 1)
            hgt = math.sqrt(max(0, 1 - x * x))
            y = cy + ry - (rng.random() ** 0.7) * hgt * 2 * ry
            items.append((y, cx + x * rx, y))
        else:
            th = rng.uniform(0, 2 * math.pi); rr = rng.uniform(0.62, 1.0)
            x = cx + rr * rx * math.cos(th); y = cy + rr * ry * math.sin(th) - rng.uniform(0, 26)
            if region == 'back' and math.sin(th) > 0.15: continue
            if region == 'front' and math.sin(th) <= 0.15: continue
            items.append((y, x, y))
    items.sort()
    if inner:
        ImageDraw.Draw(im).ellipse([cx - inner[0], cy - inner[1], cx + inner[0], cy + inner[1]], fill=(92, 58, 36, 255))
    for _, x, y in items:
        col = rng.choice(LEAF_COLS)
        lf = LEAF_POOL[(col, rng.randint(0, 2))]
        put(im, lf, x, y, rot=rng.uniform(0, 360), sx=rng.uniform(0.55, 0.9))
    return im

def make_perfect_nest():
    cw, ch = 380, 240
    im = Image.new('RGBA', (cw, ch)); cx, cy = cw / 2, ch / 2
    ImageDraw.Draw(im).ellipse([cx - 95, cy - 32, cx + 95, cy + 32], fill=(150, 104, 40, 255))
    lf = make_leaf((236, 186, 64), L=70, wid=0.3)
    order = sorted(range(18), key=lambda k: math.sin(2 * math.pi * k / 18))
    for k in order:
        th = 2 * math.pi * k / 18
        put(im, lf, cx + 135 * math.cos(th), cy + 56 * math.sin(th), rot=-math.degrees(th) + 180, sx=1.0, sy=1.0)
    return im

def make_bubble(w=600, h=380):
    S2 = SS
    im = Image.new('RGBA', (w * S2, h * S2)); d = ImageDraw.Draw(im)
    circles = [(0.5, 0.52, 0.36, 0.38), (0.25, 0.55, 0.22, 0.28), (0.75, 0.55, 0.22, 0.28),
               (0.37, 0.33, 0.2, 0.24), (0.63, 0.33, 0.2, 0.24), (0.5, 0.7, 0.3, 0.2)]
    for pad, col in ((7, (150, 120, 100, 255)), (0, (255, 252, 246, 255))):
        for x, y, rxf, ryf in circles:
            rx, ry = rxf * w * 0.95, ryf * h * 0.95
            d.ellipse([(x * w - rx - pad) * S2, (y * h - ry - pad) * S2, (x * w + rx + pad) * S2, (y * h + ry + pad) * S2], fill=col)
    return finish(im)

def make_dot(r):
    im = Image.new('RGBA', ((2 * r + 16) * SS,) * 2); d = ImageDraw.Draw(im)
    d.ellipse([4 * SS, 4 * SS, (2 * r + 12) * SS, (2 * r + 12) * SS], fill=(150, 120, 100, 255))
    d.ellipse([8 * SS, 8 * SS, (2 * r + 8) * SS, (2 * r + 8) * SS], fill=(255, 252, 246, 255))
    return finish(im)

def make_spark(r, col=(255, 222, 120)):
    im = Image.new('RGBA', (r * 4 * SS,) * 2); d = ImageDraw.Draw(im); c = r * 2 * SS
    R, rr = r * 2 * SS * 0.95, r * SS * 0.28
    pts = []
    for k in range(8):
        a = math.pi / 4 * k - math.pi / 2
        rad = R if k % 2 == 0 else rr
        pts.append((c + rad * math.cos(a), c + rad * math.sin(a)))
    d.polygon(pts, fill=col + (255,))
    return finish(im)

def make_flake(r):
    return soft_ellipse(r, r, (255, 255, 255), 235, max(1, r // 3))

def make_caption(text, italic):
    font = ImageFont.truetype(FONT_I if italic else FONT_B, 78)
    words, lines, cur = text.split(), [], ''
    for wd in words:
        trial = (cur + ' ' + wd).strip()
        if font.getlength(trial) > 820 and cur: lines.append(cur); cur = wd
        else: cur = trial
    lines.append(cur)
    lh = 96
    tw = max(font.getlength(l) for l in lines)
    bw, bh = int(tw + 110), int(lh * len(lines) + 64)
    pad = 40
    im = Image.new('RGBA', (bw + 2 * pad, bh + 2 * pad))
    sh = Image.new('RGBA', im.size)
    ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 12, pad + bw, pad + bh + 12], radius=46, fill=(70, 34, 10, 90))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([pad, pad, pad + bw, pad + bh], radius=46, fill=(255, 248, 236, 246), outline=(150, 108, 72, 255), width=4)
    for i, l in enumerate(lines):
        d.text((pad + bw / 2, pad + 32 + i * lh + lh / 2), l, font=font, fill=INK, anchor='mm')
    return im

def make_stamp():
    t = text_sprite('×300', 74, (200, 52, 40), font=FONT_B)
    im = Image.new('RGBA', (t.width + 60, t.height + 40))
    ImageDraw.Draw(im).rounded_rectangle([4, 4, im.width - 5, im.height - 5], radius=22, outline=(200, 52, 40, 255), width=7)
    im.alpha_composite(t, (30, 20))
    return im

def make_dayrows():
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    rows = []
    for k in range(7):
        im = Image.new('RGBA', (900, 110))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([0, 0, 899, 109], radius=55, fill=(255, 248, 236, 210))
        for j, dname in enumerate(days):
            f = ImageFont.truetype(FONT_B if j == k else FONT_I, 44)
            col = (196, 72, 44) if j == k else ((120, 90, 70) if j < k else (190, 170, 150))
            x = 75 + j * 125
            if j == k:
                d.ellipse([x - 54, 8, x + 54, 101], fill=(255, 226, 190))
            d.text((x, 55), dname, font=f, fill=col, anchor='mm')
        rows.append(im)
    return rows

def build_backgrounds():
    bgs = {}
    w2, h2 = W * SS, H * SS
    def hill(d, base, amp, freq, ph, col):
        pts = [(x * SS, (base + amp * math.sin(x / W * freq * 2 * math.pi + ph)) * SS) for x in range(0, W + 11, 10)]
        d.polygon(pts + [(w2, h2), (0, h2)], fill=col)
    def ground(d, col):
        pts = [(x * SS, ground_y(x) * SS) for x in range(0, W + 11, 10)]
        d.polygon(pts + [(w2, h2), (0, h2)], fill=col)
    def tree(d, x, y, h, trunk, canopy, bare=False, snow=None, s=1.0):
        d.polygon([P(x - 14 * s, y), P(x - 8 * s, y - h), P(x + 8 * s, y - h), P(x + 14 * s, y)], fill=trunk)
        if bare:
            rng = random.Random(int(x))
            for k in range(6):
                yy = y - h * (0.45 + 0.1 * k); dx = (1 if k % 2 else -1) * h * rng.uniform(0.25, 0.4)
                d.line([P(x, yy), P(x + dx, yy - h * 0.25)], fill=trunk, width=int(7 * s * SS))
                if snow: d.line([P(x + dx * 0.4, yy - h * 0.1 - 4), P(x + dx, yy - h * 0.25 - 4)], fill=snow, width=int(4 * s * SS))
            d.ellipse(box(x, y - h, 10 * s, 10 * s), fill=trunk)
        else:
            rng = random.Random(int(x) + 3)
            for k in range(7):
                cx = x + rng.uniform(-1, 1) * 85 * s; cy = y - h - rng.uniform(-30, 70) * s
                r = rng.uniform(55, 85) * s
                d.ellipse(box(cx, cy, r, r), fill=shade(canopy, rng.uniform(0.88, 1.08)))
    rng = random.Random(5)
    # autumn
    im = vgrad((253, 230, 198), (246, 186, 136), w2, h2); d = ImageDraw.Draw(im)
    for r, a in ((260, 40), (200, 60), (150, 90)):
        d.ellipse(box(800, 560, r, r), fill=(255, 238, 200, a))
    d.ellipse(box(800, 560, 110, 110), fill=(255, 236, 190))
    im = im.convert('RGBA'); d = ImageDraw.Draw(im)
    hill(d, 1180, 40, 1.3, 0.5, (238, 172, 124))
    for x, y, h, c in ((90, 1250, 250, (222, 120, 66)), (330, 1230, 200, (232, 150, 72)), (760, 1240, 210, (210, 98, 56)), (1010, 1260, 270, (226, 132, 60))):
        tree(d, x, y, h, (150, 96, 64), c, s=0.8)
    hill(d, 1290, 30, 2.1, 1.7, (214, 140, 88))
    ground(d, (178, 114, 64))
    for _ in range(260):
        x = rng.uniform(0, W); y = rng.uniform(ground_y(x) + 10, H)
        d.ellipse(box(x, y, rng.uniform(6, 14), rng.uniform(3, 6)), fill=rng.choice(LEAF_COLS))
    bgs['aut'] = finish(im)
    # frost
    im = vgrad((228, 238, 248), (172, 198, 222), w2, h2); d = ImageDraw.Draw(im)
    for r, a in ((200, 40), (140, 70)):
        d.ellipse(box(800, 560, r, r), fill=(250, 252, 255, a))
    d.ellipse(box(800, 560, 100, 100), fill=(246, 250, 255))
    hill(d, 1180, 40, 1.3, 0.5, (206, 220, 236))
    for x, y, h in ((90, 1250, 250), (330, 1230, 200), (760, 1240, 210), (1010, 1260, 270)):
        tree(d, x, y, h, (120, 104, 110), None, bare=True, snow=(250, 252, 255), s=0.8)
    hill(d, 1290, 30, 2.1, 1.7, (226, 236, 246))
    ground(d, (242, 247, 251))
    for _ in range(200):
        x = rng.uniform(0, W); y = rng.uniform(ground_y(x) + 10, H)
        d.ellipse(box(x, y, rng.uniform(5, 12), rng.uniform(2, 4)), fill=(206, 222, 238))
    bgs['frost'] = finish(im)
    # night
    im = vgrad((22, 28, 60), (74, 60, 112), w2, h2); d = ImageDraw.Draw(im)
    for _ in range(140):
        x, y = rng.uniform(0, W), rng.uniform(0, 1150); r = rng.uniform(1.2, 3.2)
        d.ellipse(box(x, y, r, r), fill=(255, 250, 230, int(rng.uniform(120, 255))))
    for r, a in ((190, 25), (140, 45)):
        d.ellipse(box(810, 520, r, r), fill=(255, 244, 210, a))
    d.ellipse(box(810, 520, 95, 95), fill=(255, 244, 214))
    d.ellipse(box(845, 495, 92, 92), fill=(34, 38, 74))  # crescent
    hill(d, 1180, 40, 1.3, 0.5, (52, 50, 96))
    for x, y, h in ((90, 1250, 250), (330, 1230, 200), (760, 1240, 210), (1010, 1260, 270)):
        tree(d, x, y, h, (40, 38, 72), None, bare=True, snow=(120, 126, 176), s=0.8)
    hill(d, 1290, 30, 2.1, 1.7, (70, 68, 120))
    ground(d, (112, 116, 170))
    bgs['night'] = finish(im)
    # breathe
    im = vgrad((36, 40, 84), (122, 100, 152), w2, h2)
    im = finish(im)
    bok = Image.new('RGBA', (W, H)); bd = ImageDraw.Draw(bok)
    for _ in range(26):
        x, y, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(30, 110)
        bd.ellipse([x - r, y - r, x + r, y + r], fill=(255, 220, 200, int(rng.uniform(14, 34))))
    im.alpha_composite(bok.filter(ImageFilter.GaussianBlur(14)))
    bgs['breath'] = im
    return bgs

def make_ring(r=300):
    im = Image.new('RGBA', ((2 * r + 80) * SS,) * 2); d = ImageDraw.Draw(im); c = (r + 40) * SS
    d.ellipse([c - r * SS, c - r * SS, c + r * SS, c + r * SS], fill=(255, 226, 200, 34), outline=(255, 236, 214, 220), width=8 * SS)
    glow = im.filter(ImageFilter.GaussianBlur(14 * SS))
    glow.alpha_composite(im)
    return finish(glow)

# ---------------------------------------------------------------- globals
G = {}
LEAF_POOL = {}

def build_assets():
    for col in LEAF_COLS:
        for v in range(3):
            LEAF_POOL[(col, v)] = make_leaf(col, L=100, wid=0.3 + 0.06 * v, bend=0.12 * (v - 1))
    G['bg'] = build_backgrounds()
    G['pip'] = make_pip()
    G['ball'] = make_ball()
    G['ball_s'] = G['ball'].resize((int(G['ball'].width * 0.42), int(G['ball'].height * 0.42)), Image.LANCZOS)
    G['orange'] = make_leaf((226, 118, 40), L=150, wid=0.34)
    G['floppy'] = make_leaf((226, 186, 76), L=160, wid=0.3, bend=0.55)
    G['pile'] = leaf_mound(300, 470, 230, 3, 'mound')
    pf = G['pile'].copy()
    tint = Image.new('RGBA', pf.size, (226, 238, 248, 255)); tint.putalpha(pf.getchannel('A'))
    G['pile_frost'] = Image.blend(pf, tint, 0.42)
    G['nest_back'] = leaf_mound(150, 290, 105, 9, 'back', inner=(205, 66))
    G['nest_front'] = leaf_mound(110, 290, 105, 10, 'front')
    mini = G['nest_back'].copy(); mini.alpha_composite(G['nest_front'])
    G['nest_mini'] = mini.resize((int(mini.width * 0.5), int(mini.height * 0.5)), Image.LANCZOS)
    G['perfect'] = make_perfect_nest()
    G['bubble'] = make_bubble()
    G['dots'] = [make_dot(r) for r in (24, 16, 10)]
    G['spark'] = make_spark(22); G['spark_s'] = make_spark(10, (255, 248, 220))
    G['flakes'] = [make_flake(r) for r in (3, 5, 7)]
    G['shadow'] = soft_ellipse(230, 30, (60, 30, 20), 80, 12)
    G['glow'] = radial(900, 560, (255, 180, 100), power=1.5, amax=170)
    G['ring'] = make_ring()
    G['stamp'] = make_stamp()
    G['days'] = make_dayrows()
    G['heart'] = text_sprite('♥', 70, (226, 96, 96), font='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
    G['crinkle'] = text_sprite('crinkle!', 62, (214, 96, 34), font=FONT_I, stroke=5, stroke_fill=(255, 250, 240))
    G['z'] = text_sprite('z', 60, (255, 246, 226), font=FONT_I, stroke=3, stroke_fill=(90, 70, 120))
    G['four'] = [LEAF_POOL[(LEAF_COLS[k], 1)] for k in (0, 2, 1, 4)]
    G['caps'] = [(a, b, make_caption(txt, it)) for a, b, txt, it in CAPTIONS]
    rng = random.Random(21)
    G['fall'] = [dict(x=rng.uniform(40, W - 40), y=rng.uniform(0, H), sp=rng.uniform(90, 170), sw=rng.uniform(30, 70),
                      fq=rng.uniform(0.3, 0.7), rs=rng.uniform(-90, 90), col=rng.choice(LEAF_COLS), v=rng.randint(0, 2),
                      s=rng.uniform(0.5, 0.85)) for _ in range(10)]
    G['snow'] = [dict(x=rng.uniform(0, W), y=rng.uniform(0, H), sp=rng.uniform(60, 150), sw=rng.uniform(10, 40),
                      fq=rng.uniform(0.2, 0.6), k=rng.randint(0, 2)) for _ in range(80)]
    G['fly'] = [dict(sx=rng.uniform(140, 940), sy=rng.uniform(1020, 1420), th=rng.uniform(0, 2 * math.pi),
                     t0=31.2 + i * 0.1, col=rng.choice(LEAF_COLS), v=rng.randint(0, 2), rot=rng.uniform(-500, 500)) for i in range(22)]
    G['twinkle'] = [(rng.uniform(40, W - 40), rng.uniform(60, 1100), rng.uniform(0, 6)) for _ in range(9)]

# ---------------------------------------------------------------- captions
CAPTIONS = [
    (0.35, 1.95, '“Too orange.”', True),
    (2.30, 4.15, '“Too floppy.”', True),
    (4.50, 6.00, 'This is Pip.', False),
    (6.00, 7.55, 'She’s a hedgehog.', False),
    (7.60, 10.40, 'And she wanted the perfect nest for winter.', False),
    (10.60, 13.60, 'By the end of the week, every hedgehog was asleep.', False),
    (13.70, 15.80, 'Pip had four leaves.', False),
    (16.20, 18.60, 'She’d rejected three hundred.', False),
    (18.90, 20.85, 'Then the frost came,', False),
    (20.85, 24.30, 'and Pip had a big thought for a small hedgehog.', False),
    (24.60, 27.60, 'Maybe it doesn’t need to be perfect.', False),
    (27.90, 30.90, 'Maybe it just needs to be there.', False),
    (31.20, 33.55, 'She scooped up any old leaves,', False),
    (33.55, 35.35, 'curled into a ball…', False),
    (35.40, 38.40, 'and it was the cosiest nest she’d ever had.', False),
    (38.80, 42.85, 'Breathe in, stretch tall.', False),
    (43.00, 47.05, 'Breathe out, curl small.', False),
    (47.40, 50.80, 'Your rest doesn’t need to be perfect either.', False),
]

def draw_captions(im, t):
    for a, b, spr in G['caps']:
        if a - 0.01 <= t <= b + 0.01:
            fi = eout(seg(t, a, a + 0.28)); fo = 1 - ease(seg(t, b - 0.2, b))
            al = fi * fo
            put(im, spr, W / 2, 410 + 26 * (1 - fi), sx=0.94 + 0.06 * back(seg(t, a, a + 0.3)), alpha=al)

# ---------------------------------------------------------------- scene pieces
PIP_FEET = (540, 1372)

def draw_pip(im, t, fx=540, fy=1372, sx=1.0, sy=1.0, alpha=1.0, bob=True, shadow=True, hop=0.0):
    spr = G['pip']
    by = 5 * math.sin(t * 2 * math.pi / 1.8) if bob else 0
    if shadow:
        put(im, G['shadow'], fx + 30, fy + 4, sx=sx * (1 - 0.3 * hop / 60), alpha=alpha)
    feet_off = 0.3 * spr.height * 1.0 + 3  # feet sit at ~80% of sprite height
    cy = fy - hop + by - (spr.height * 0.5 - (spr.height - 0.91 * spr.height)) * sy
    put(im, spr, fx, cy, sx=sx, sy=sy, alpha=alpha)

def falling(im, t, amount):
    if amount <= 0.01: return
    for p in G['fall']:
        y = (p['y'] + p['sp'] * t) % (H + 200) - 100
        x = p['x'] + p['sw'] * math.sin(t * p['fq'] * 2 * math.pi + p['y'])
        put(im, LEAF_POOL[(p['col'], p['v'])], x, y, rot=p['rs'] * t + p['x'], sx=p['s'], alpha=amount * 0.95)

def snow(im, t, amount):
    if amount <= 0.01: return
    for p in G['snow']:
        y = (p['y'] + p['sp'] * t) % (H + 40) - 20
        x = p['x'] + p['sw'] * math.sin(t * p['fq'] * 2 * math.pi + p['y'])
        put(im, G['flakes'][p['k']], x, y, alpha=amount)

def zzz(im, x, y, t, phase=0.0, scale=1.0, alpha=1.0):
    for k in range(3):
        u = ((t + phase) * 0.45 + k / 3) % 1
        put(im, G['z'], x + 40 * u * scale + 10 * math.sin(u * 6), y - 150 * u * scale,
            sx=scale * (0.5 + 0.6 * u), alpha=alpha * math.sin(math.pi * u))

def sparkles(im, pts, t, alpha):
    for i, (x, y) in enumerate(pts):
        s = 0.5 + 0.5 * abs(math.sin(t * 3 + i * 1.7))
        put(im, G['spark'], x, y, rot=t * 40 + i * 20, sx=s, alpha=alpha)

def bubble(im, t, cx, cy, alpha, pop, tail_from):
    if alpha <= 0.01: return
    put(im, G['bubble'], cx, cy, sx=pop, alpha=alpha)
    tx, ty = tail_from
    for k, d in enumerate(G['dots']):
        u = (k + 1) / 4
        put(im, d, lerp(cx + 40, tx, u), lerp(cy + 190, ty, u), sx=pop, alpha=alpha)

def bgmix(a, b, x):
    A, B = G['bg'][a], G['bg'][b]
    if x <= 0.001: return A.copy()
    if x >= 0.999: return B.copy()
    return Image.blend(A, B, x)

# ---------------------------------------------------------------- scenes
def scene_intro(t, sfx_text=True):
    im = G['bg']['aut'].copy()
    falling(im, t, 1.0)
    draw_pip(im, t)
    # leaf 1: too orange
    if t < 2.15:
        jig = 8 * math.sin(t * 45) if 0.25 < t < 0.85 else 2 * math.sin(t * 3)
        if t < 1.65:
            put(im, G['orange'], 860, 1060 + 4 * math.sin(t * 3), rot=72 + jig)
        else:
            u = ease(seg(t, 1.65, 2.15))
            put(im, G['orange'], lerp(860, -160, u), lerp(1060, 760, u) - 260 * math.sin(math.pi * u), rot=72 + 700 * u)
    # leaf 2: too floppy
    if 2.0 <= t < 4.2:
        jig = 8 * math.sin(t * 45) if 2.2 < t < 2.8 else 2 * math.sin(t * 3)
        if t < 3.65:
            put(im, G['floppy'], 865, 1070, rot=62 + jig, sx=back(seg(t, 2.0, 2.3)))
        else:
            u = ease(seg(t, 3.65, 4.2))
            put(im, G['floppy'], lerp(865, 1260, u), lerp(1070, 760, u) - 200 * math.sin(math.pi * u), rot=62 - 640 * u)
    if sfx_text:
        for t0, (x, y, r) in ((0.25, (800, 860, 10)), (2.2, (790, 870, -8))):
            if t0 <= t < t0 + 0.9:
                put(im, G['crinkle'], x, y, rot=r + 4 * math.sin(t * 30), sx=back(seg(t, t0, t0 + 0.25)),
                    alpha=1 - ease(seg(t, t0 + 0.6, t0 + 0.9)))
    # dream of the perfect nest
    if t > 7.5:
        a = ease(seg(t, 7.5, 7.9)) * (1 - ease(seg(t, 10.05, 10.45)))
        pop = back(seg(t, 7.5, 7.9))
        bubble(im, t, 470, 790, a, pop, (660, 1010))
        put(im, G['perfect'], 470, 790, sx=pop * 1.05, alpha=a)
        sparkles(im, [(330, 700), (620, 690), (600, 880), (340, 870)], t, a)
    return im

OTHERS = [(85, 1300, 1), (1000, 1310, 3), (170, 1590, 5)]

def scene_week(t):
    fr = ease(seg(t, 18.6, 20.0))
    im = bgmix('aut', 'frost', fr)
    falling(im, t, 1 - fr)
    snow(im, t, fr)
    # pile of rejected leaves
    pg = eout(seg(t, 16.2, 17.1))
    draw_pile(im, pg, fr)
    if t > 16.6:
        sa = 1 - ease(seg(t, 20.4, 21.0))
        put(im, G['stamp'], 870, 950, rot=12, sx=back(seg(t, 16.6, 16.9)) * (1.3 - 0.3 * eout(seg(t, 16.6, 16.85))), alpha=sa * ease(seg(t, 16.6, 16.7)))
    # sleeping neighbours
    for x, y, day in OTHERS:
        a = ease(seg(t, 10.6 + day * 0.42, 11.0 + day * 0.42))
        put(im, G['ball_s'], x, y + 6 * (1 - a), sx=1 + 0.02 * math.sin(t * 1.5 + x), alpha=a)
        zzz(im, x + 40, y - 60, t, phase=x * 0.01, scale=0.55, alpha=a)
    # day counter
    if 10.55 < t < 14.0:
        k = int(clamp((t - 10.6) / 0.42, 0, 6))
        a = ease(seg(t, 10.55, 10.85)) * (1 - ease(seg(t, 13.6, 14.0)))
        put(im, G['days'][k], W / 2, 670, alpha=a)
    # Pip's four leaves
    for i in range(4):
        ti = 13.8 + 0.4 * i
        if t > ti:
            put(im, G['four'][i], 375 + 110 * i, 1462 + 6 * (i % 2), rot=[15, -10, 8, -18][i], sx=back(seg(t, ti, ti + 0.3)) * 1.15)
    jx = 5 * math.sin(t * 55) * seg(t, 18.9, 19.2) * (1 - seg(t, 20.4, 21.0))
    draw_pip(im, t, fx=540 + jx)
    # the big thought
    if t > 21.0:
        a = ease(seg(t, 21.0, 21.35)) * (1 - ease(seg(t, 30.5, 31.0)))
        pop = back(seg(t, 21.0, 21.4))
        bubble(im, t, 470, 790, a, pop, (660, 1010))
        pa = ease(seg(t, 21.3, 21.7)) * (1 - ease(seg(t, 26.3, 27.3)))
        put(im, G['perfect'], 470, 790, sx=pop * (1.05 - 0.4 * ease(seg(t, 26.3, 27.3))), rot=8 * math.sin(t * 2) * seg(t, 24.6, 26.3), alpha=a * pa)
        sparkles(im, [(330, 700), (620, 690), (600, 880), (340, 870)], t, a * pa)
        ma = ease(seg(t, 27.9, 28.3))
        put(im, G['nest_mini'], 470, 800, sx=back(seg(t, 27.9, 28.3)) * pop, alpha=a * ma)
        put(im, G['heart'], 470, 770 + 4 * math.sin(t * 3), sx=back(seg(t, 28.3, 28.6)) * (1 + 0.06 * math.sin(t * 5)), alpha=a * ma)
    return im

def draw_pile(im, g, frost, sx=1.0):
    if g <= 0.01: return
    spr = G['pile'] if frost <= 0.01 else Image.blend(G['pile'], G['pile_frost'], frost)
    base = 1440
    put(im, spr, 540, base - spr.height * 0.5 * g + 60 * g, sx=sx, sy=g)

def scene_nest(t):
    nm = ease(seg(t, 35.0, 36.6))
    im = bgmix('frost', 'night', nm)
    snow(im, t, 1.0 - 0.45 * nm)
    for i, (x, y, ph) in enumerate(G['twinkle']):
        put(im, G['spark_s'], x, y, sx=0.6 + 0.6 * abs(math.sin(t * 1.3 + ph)), alpha=nm * 0.9)
    sg = 1 - ease(seg(t, 31.2, 33.4))
    draw_pile(im, sg, 1.0, sx=0.7 + 0.3 * sg)
    fa = 1 - ease(seg(t, 31.2, 31.6))
    for i in range(4):
        put(im, G['four'][i], 375 + 110 * i, 1462 + 6 * (i % 2), rot=[15, -10, 8, -18][i], sx=1.15, alpha=fa)
    ng = eout(seg(t, 31.4, 33.8))
    put(im, G['glow'], 540, 1300, alpha=ease(seg(t, 35.2, 36.8)) * (0.85 + 0.15 * math.sin(t * 1.4)))
    NX, NY = 540, 1385
    put(im, G['nest_back'], NX, NY, sx=0.3 + 0.7 * ng, alpha=ease(seg(t, 31.4, 31.7)))
    cf = ease(seg(t, 33.6, 34.6))
    hop = abs(math.sin((t - 31.2) * math.pi * 2.2)) * 30 * (seg(t, 31.2, 31.4) * (1 - seg(t, 33.3, 33.6)))
    draw_pip(im, t, alpha=1 - cf, hop=hop)
    breath = 1 + 0.025 * math.sin(t * 2 * math.pi / 3.2)
    put(im, G['ball'], NX, 1265 + 30 * (1 - cf), sx=0.62 * breath, sy=0.62 / breath ** 0.5, alpha=cf)
    put(im, G['nest_front'], NX, NY, sx=0.3 + 0.7 * ng, alpha=ease(seg(t, 31.4, 31.7)))
    for p in G['fly']:
        u = seg(t, p['t0'], p['t0'] + 0.6)
        if 0 < u < 1:
            ex, ey = NX + 250 * math.cos(p['th']), NY + 85 * math.sin(p['th'])
            e = ease(u)
            put(im, LEAF_POOL[(p['col'], p['v'])], lerp(p['sx'], ex, e), lerp(p['sy'], ey, e) - 260 * math.sin(math.pi * u),
                rot=p['rot'] * u, sx=0.8)
    if t > 36.0:
        zzz(im, 650, 1150, t, scale=0.9, alpha=ease(seg(t, 36.0, 36.6)))
    return im

def scene_breathe(t):
    im = G['bg']['breath'].copy()
    inh = ease(seg(t, 38.8, 42.8)); exh = ease(seg(t, 43.0, 47.0))
    k = inh * (1 - exh)
    cxy = (540, 1150)
    put(im, G['ring'], *cxy, sx=(230 + 200 * k) / 300, alpha=0.9)
    pa = ease(seg(t, 38.9, 39.9)) * (1 - ease(seg(t, 43.6, 44.6)))
    draw_pip(im, t, fy=1330, sx=1 - 0.05 * k, sy=1 + 0.2 * k, alpha=pa, bob=False, shadow=False)
    put(im, G['ball'], 540, 1160 + 20 * (1 - k), sx=0.6 * (0.86 + 0.14 * k), alpha=1 - pa)
    if 38.8 < t < 47.1:
        n = int(clamp(t - 38.8, 0, 3.99)) + 1 if t < 42.95 else int(clamp(t - 43.0, 0, 3.99)) + 1
        for i in range(4):
            on = i < n
            put(im, G['spark_s'] if on else G['flakes'][2], 405 + 90 * i, 1560, sx=(2.2 if on else 1.4), alpha=0.95 if on else 0.4)
    return im

def blend(a, b, x): return Image.blend(a, b, ease(x))

def render(t):
    if t < 10.5: im = scene_intro(t)
    elif t < 31.0: im = scene_week(t)
    elif t < 38.3: im = scene_nest(t)
    elif t < 38.9: im = blend(scene_nest(t), scene_breathe(t), seg(t, 38.3, 38.9))
    elif t < 46.9: im = scene_breathe(t)
    elif t < 47.5: im = blend(scene_breathe(t), scene_nest(t), seg(t, 46.9, 47.5))
    elif t < 50.9: im = scene_nest(t)
    else: im = blend(scene_nest(t), scene_intro(0.0, sfx_text=False), seg(t, 50.9, DUR))
    draw_captions(im, t)
    return im

def frame_bytes(i):
    return render(i / FPS).convert('RGB').tobytes()

# ---------------------------------------------------------------- audio
def make_audio(path):
    sr = 44100; n = int(DUR * sr)
    out = np.zeros(n); music = np.zeros(n)
    rng = np.random.default_rng(1)
    def add(buf, sig, start, gain=1.0):
        i = int(start * sr)
        if i >= n: return
        j = min(n, i + len(sig)); buf[i:j] += sig[:j - i] * gain
    def tt(d): return np.arange(int(d * sr)) / sr
    def note(f, d=1.8, dec=2.6):
        x = tt(d)
        return (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x) + 0.08 * np.sin(6 * np.pi * f * x)) * np.exp(-x * dec) * np.minimum(1, x / 0.004)
    def smooth(x, k):
        return np.convolve(x, np.ones(k) / k, mode='same')
    def crinkle(d=0.5, density=0.03):
        m = int(d * sr)
        imp = (rng.random(m) < density) * rng.random(m)
        env = np.convolve(imp, np.exp(-np.arange(200) / 40), mode='same')
        sig = np.diff(rng.standard_normal(m + 1)) * env
        sh = np.sin(np.pi * np.arange(m) / m) ** 0.6
        return sig * sh
    def whoosh(d=0.45):
        m = int(d * sr); x = smooth(rng.standard_normal(m), 25)
        return x * np.sin(np.pi * np.arange(m) / m) ** 2 * 3
    def pop(f):
        x = tt(0.12); fr = f * (1 + 0.6 * x / 0.12)
        return np.sin(2 * np.pi * np.cumsum(fr) / sr) * np.exp(-x * 30)
    def thud():
        x = tt(0.35)
        return np.sin(2 * np.pi * 95 * x) * np.exp(-x * 14) + 0.2 * smooth(rng.standard_normal(len(x)), 8) * np.exp(-x * 30)
    def breath(d, inhale):
        m = int(d * sr); x = smooth(smooth(rng.standard_normal(m), 40), 20) * 6
        u = np.arange(m) / m
        env = np.sin(np.pi * u / 2) ** 2 if inhale else np.cos(np.pi * u / 2) ** 2
        env *= np.minimum(1, (1 - u) / 0.08) if inhale else np.minimum(1, u / 0.05)
        return x * env
    # pad + music box
    C = {'C': [261.63, 329.63, 392.0], 'Am': [220.0, 261.63, 329.63], 'F': [174.61, 220.0, 261.63], 'G': [196.0, 246.94, 293.66]}
    prog = ['C', 'Am', 'F', 'G']; CL = 3.2
    mel_rng = random.Random(4)
    st, k = 0.0, 0
    while st < DUR:
        ch = C[prog[k % 4]]; L = CL + 1.6; x = tt(L)
        env = np.minimum(1, x / 0.9) * np.clip((L - x) / 1.6, 0, 1)
        sig = sum(0.55 * np.sin(np.pi * f * x) + 0.22 * np.sin(2 * np.pi * f * x + 0.3) for f in ch) * env
        add(music, sig, st, 0.05)
        for b in range(4):
            tb = st + b * 0.8
            in_breath = 38.4 < tb < 47.2
            if in_breath and b % 2: continue
            if mel_rng.random() < 0.18 and b: continue
            f = mel_rng.choice(ch) * 2 * (2 if mel_rng.random() < 0.25 else 1)
            add(music, note(f), tb, 0.05 if in_breath else 0.075)
        st += CL; k += 1
    # sound effects
    for t0 in (0.25, 2.2):
        add(out, crinkle(0.55), t0, 0.5)
    for t0 in (1.65, 3.65): add(out, whoosh(), t0, 0.18)
    for i in range(4): add(out, pop(520 * (2 ** (i * 2 / 12))), 13.8 + 0.4 * i, 0.32)
    add(out, crinkle(1.0, 0.05), 16.2, 0.32)
    add(out, thud(), 16.62, 0.5)
    for i, f in enumerate((1046.5, 1318.5, 1568.0, 2093.0, 2637.0)):
        add(out, note(f, 1.5, 3.5), 18.6 + 0.09 * i, 0.07)
    add(out, pop(700), 21.0, 0.2)
    add(out, note(1568.0, 1.2, 3), 27.9, 0.12); add(out, note(2093.0, 1.4, 3), 28.05, 0.12)
    for t0 in (31.25, 31.75, 32.3, 32.85, 33.35):
        add(out, crinkle(0.45, 0.035), t0, 0.33)
    add(out, whoosh(0.8), 33.6, 0.1)
    add(out, breath(4.0, True), 38.8, 0.10)
    add(out, breath(4.0, False), 43.0, 0.10)
    # mix
    mix = music + out
    fade = np.ones(n); x = np.arange(n) / sr
    fade *= np.clip(x / 0.15, 0, 1) * np.clip((DUR - x) / 0.9, 0, 1)
    mix *= fade
    mix = mix / (np.abs(mix).max() + 1e-9) * 0.85
    pcm = (mix * 32767).astype(np.int16)
    with wave.open(path, 'wb') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sr); wf.writeframes(pcm.tobytes())

# ---------------------------------------------------------------- main
if __name__ == '__main__':
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
    preview = os.environ.get('PREVIEW')
    build_assets()
    if preview:
        for ts in preview.split(','):
            render(float(ts)).convert('RGB').save(os.path.join(out_dir, f'preview_{ts}.png'))
        sys.exit(0)
    wav = os.path.join(out_dir, 'audio.wav')
    make_audio(wav)
    mp4 = os.path.join(out_dir, 'pip-and-the-perfect-nest.mp4')
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-i', wav, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                           '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', mp4],
                          stdin=subprocess.PIPE)
    nframes = int(DUR * FPS)
    with Pool(os.cpu_count()) as pool:
        for i, fb in enumerate(pool.imap(frame_bytes, range(nframes), chunksize=6)):
            ff.stdin.write(fb)
            if i % 150 == 0: print(f'frame {i}/{nframes}', flush=True)
    ff.stdin.close(); ff.wait()
    render(1.0).convert('RGB').save(os.path.join(out_dir, 'cover.png'))
    os.remove(wav)
    print('done', mp4)
