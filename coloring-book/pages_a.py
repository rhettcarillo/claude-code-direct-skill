"""Pages 1-6: cover, sun mandala, owl, whale, butterfly, balloons."""

import math
from draw import *

CX = PAGE_W / 2


# ------------------------------------------------------------------ 1 cover

def cover():
    b = []
    b += doodle_border("double", inset=30, w=W_MAIN)

    b.append(text_outline("A COLORING BOOK OF", CX, 132, 19, w=1.4, spacing=6))
    b.append(text_outline("SMALL", CX, 216, 78, w=3.0, spacing=4))
    b.append(text_outline("WONDERS", CX, 292, 78, w=3.0, spacing=4))
    b.append(line(CX - 150, 318, CX + 150, 318, W_MID))
    b += [sparkle(CX - 176, 312, 11), sparkle(CX + 176, 312, 11)]

    # wreath
    wx, wy, wr = CX, 486, 128
    b.append(circle(wx, wy, wr + 6, W_FINE, dash="9 8"))
    for i in range(26):
        a = 360.0 * i / 26 - 90
        ar = math.radians(a)
        x, y = wx + wr * math.cos(ar), wy + wr * math.sin(ar)
        tilt = a + (34 if i % 2 else -34)
        b += leaf(x, y, 34 if i % 2 else 27, 11, tilt, W_MID)
    for i in range(6):
        a = math.radians(360.0 * i / 6 - 90 + 30)
        x, y = wx + wr * math.cos(a), wy + wr * math.sin(a)
        b += ring_of(6, lambda k, ang: petal(x, y, 4, 17, 7, W_MID, ang))
        b.append(circle(x, y, 4.6, W_MID))

    # blooming flower at the center of the wreath
    b += ring_of(8, lambda i, a: petal(wx, wy, 34, 96, 33, W_MAIN, a))
    b += ring_of(8, lambda i, a: petal(wx, wy, 32, 70, 20, W_MID, a + 22.5))
    b.append(circle(wx, wy, 30, W_MAIN))
    b += ring_of(9, lambda i, a: petal(wx, wy, 9, 27, 9, W_MID, a))
    b.append(circle(wx, wy, 9, W_MID))
    for s, sr in ((-1, 96), (1, 96)):
        b += leaf(wx + s * 104, wy + 96, 46, 15, 40 if s > 0 else 140, W_MID)

    b.append(text_outline("THIS BOOK BELONGS TO", CX, 684, 17, w=1.3, spacing=5))
    b.append(line(120, 726, PAGE_W - 120, 726, W_MID))
    b += [heart(102, 720, 11), heart(PAGE_W - 102, 720, 11)]
    return svg_page(b)


# --------------------------------------------------------- 2 mandala (sun)

def mandala_sun():
    b = []
    b += doodle_border("dots", inset=26, w=W_MID)
    cx, cy = CX, 372

    b.append(circle(cx, cy, 250, W_MAIN))
    b += scallop_ring(cx, cy, 250, 36, 13, W_MID)
    b += ring_of(36, lambda i, a: circle(cx + 232 * math.cos(math.radians(a)),
                                         cy + 232 * math.sin(math.radians(a)), 4.2, W_FINE))
    b.append(circle(cx, cy, 216, W_MAIN))

    b += ring_of(12, lambda i, a: petal(cx, cy, 140, 212, 42, W_MAIN, a))
    b += ring_of(12, lambda i, a: petal(cx, cy, 152, 196, 20, W_FINE, a))
    b += ring_of(12, lambda i, a: star(cx + 176 * math.cos(math.radians(a - 90)),
                                       cy + 176 * math.sin(math.radians(a - 90)),
                                       15, 6, 6, W_FINE, phase=-90 + a))
    b.append(circle(cx, cy, 136, W_MAIN))
    b.append(circle(cx, cy, 128, W_FINE))

    b += ring_of(24, lambda i, a: petal(cx, cy, 92, 126, 13, W_MID, a))
    b.append(circle(cx, cy, 90, W_MAIN))
    b += scallop_ring(cx, cy, 90, 16, 11, W_MID, outward=False)

    b += ring_of(8, lambda i, a: petal(cx, cy, 30, 82, 27, W_MAIN, a))
    b += ring_of(8, lambda i, a: petal(cx, cy, 34, 62, 12, W_FINE, a))
    b += ring_of(8, lambda i, a: heart(cx + 68 * math.cos(math.radians(a - 90 + 22.5)),
                                       cy + 68 * math.sin(math.radians(a - 90 + 22.5)),
                                       11, W_MID))
    b.append(circle(cx, cy, 28, W_MAIN))
    b += ring_of(12, lambda i, a: circle(cx + 18 * math.cos(math.radians(a)),
                                         cy + 18 * math.sin(math.radians(a)), 4.2, W_FINE))
    b.append(circle(cx, cy, 8, W_MID))

    b.append(caption("SUN MANDALA", 686))
    return svg_page(b)


# -------------------------------------------------------------------- 3 owl

def owl():
    b = []
    b += doodle_border("double", inset=26, w=W_MID)

    # moon and stars
    b.append(path("M 508,132 A 46,46 0 1 1 468,88 A 36,36 0 1 0 508,132 Z", W_MAIN))
    for (x, y, r) in ((116, 108, 15), (168, 168, 10), (96, 196, 8), (446, 206, 9), (536, 232, 12)):
        b.append(star(x, y, r, r * 0.42, 5, W_MID))
    for (x, y) in ((150, 112), (420, 132), (86, 152), (492, 190)):
        b.append(sparkle(x, y, 8, W_FINE))

    # branch
    b.append(path(smooth_open([(50, 600), (170, 592), (306, 598), (452, 590), (562, 598)]), W_BOLD))
    b.append(path(smooth_open([(50, 648), (170, 640), (306, 646), (452, 638), (562, 646)]), W_BOLD))
    for x in (108, 156, 420, 470, 516):
        b.append(path(f"M {x},612 q 12,8 26,5", W_FINE))
        b.append(path(f"M {x + 4},630 q 10,6 22,3", W_FINE))
    for (x, y, a) in ((120, 596, 205), (186, 646, 335), (438, 594, 335), (500, 646, 205)):
        b += leaf(x, y, 52, 18, a, W_MID)
        b += leaf(x, y, 40, 14, a + (34 if a > 300 else -34), W_MID)

    # body silhouette with ear tufts
    b.append(path(
        "M 306,246 C 296,234 286,222 274,210 L 252,214 "
        "C 246,236 222,250 200,272 C 176,306 162,352 164,404 "
        "C 166,468 188,520 228,552 C 254,574 280,582 306,582 "
        "C 332,582 358,574 384,552 C 424,520 446,468 448,404 "
        "C 450,352 436,306 412,272 C 390,250 366,236 360,214 "
        "L 338,210 C 326,222 316,234 306,246 Z", W_BOLD))

    # facial discs and eyes
    for s in (-1, 1):
        b.append(circle(306 + s * 56, 342, 58, W_MAIN))
        b.append(circle(306 + s * 56, 342, 40, W_MID))
        b += eye(306 + s * 56, 342, 24, (0, 0), W_MID)
    b.append(path("M 293,356 Q 306,346 319,356 L 306,404 Z", W_MAIN))
    b.append(path("M 296,378 Q 306,384 316,378", W_FINE))
    b.append(path("M 216,282 Q 250,258 292,272", W_MID))
    b.append(path("M 396,282 Q 362,258 320,272", W_MID))

    # wings
    for s in (-1, 1):
        wing = [path(
            f"M {306 + s*136:.0f},352 "
            f"C {306 + s*152:.0f},412 {306 + s*146:.0f},490 {306 + s*110:.0f},540 "
            f"C {306 + s*82:.0f},492 {306 + s*80:.0f},406 {306 + s*104:.0f},356 Z", W_MAIN)]
        for k in range(4):
            y0 = 390 + k * 38
            wing.append(path(
                f"M {306 + s*(132 - k*4):.0f},{y0} "
                f"Q {306 + s*(104 - k*3):.0f},{y0 + 12} {306 + s*(88 - k*1):.0f},{y0 + 6}", W_MID))
        b += wing

    # chest feathers
    for row in range(7):
        y = 414 + row * 25
        half = 76 - row * 6
        n = 5 - (row % 2)
        for i in range(n):
            x = 306 - half + (2 * half) * (i + 0.5) / n
            wdt = (2 * half) / n * 0.5
            b.append(path(f"M {x-wdt:.1f},{y:.1f} Q {x:.1f},{y+20:.1f} {x+wdt:.1f},{y:.1f}", W_MID))

    # feet gripping the branch
    for s in (-1, 1):
        fx = 306 + s * 36
        b.append(path(f"M {fx - 13:.0f},576 L {fx - 13:.0f},600", W_MAIN))
        b.append(path(f"M {fx + 13:.0f},576 L {fx + 13:.0f},600", W_MAIN))
        b.append(path(f"M {fx - 16:.0f},598 Q {fx:.0f},590 {fx + 16:.0f},598", W_MAIN))
        for t in (-24, -8, 9, 25):
            b.append(path(f"M {fx + t:.0f},598 C {fx + t*1.5:.0f},616 {fx + t*2.0:.0f},634 "
                          f"{fx + t*2.3:.0f},650", W_MAIN))
            b.append(path(f"M {fx + t*2.3:.0f},650 q {5 if t > 0 else -5},7 -1,9", W_MID))

    b.append(caption("NIGHT OWL", 700))
    return svg_page(b)


# ------------------------------------------------------------------ 4 whale

def whale():
    b = []
    b += doodle_border("double", inset=26, w=W_MID)

    # sky doodles
    b.append(cloud(130, 138, 132, 40, 3))
    b.append(cloud(486, 116, 104, 32, 3))
    b.append(star(536, 148, 13, 5.5, 5, W_MID))
    b.append(sparkle(74, 176, 10, W_FINE))

    # spout
    b.append(path("M 240,300 C 232,262 226,236 232,206", W_MAIN))
    b.append(path("M 258,302 C 262,266 270,240 284,214", W_MAIN))
    b.append(path("M 220,306 C 208,272 198,250 186,228", W_MAIN))
    for (x, y, r) in ((228, 190, 11), (292, 198, 9), (176, 212, 8), (258, 172, 7)):
        b.append(circle(x, y, r, W_MID))

    # whale body
    b.append(path(
        "M 126,392 C 130,336 190,300 268,296 C 350,292 426,320 464,364 "
        "C 476,344 500,326 542,312 C 532,346 524,368 516,392 "
        "C 524,416 532,438 542,472 C 500,458 476,440 464,420 "
        "C 436,452 386,470 320,472 C 232,474 152,442 128,398 Z", W_BOLD))

    # dorsal hump
    b.append(path("M 366,307 C 372,280 392,268 404,280 "
                  "C 408,296 406,312 406,322", W_MAIN))

    # jaw line, throat pleats, belly line
    b.append(path("M 131,404 C 174,434 240,452 314,448", W_MAIN))
    for i in range(9):
        t = i / 8.0
        x = 152 + t * 158
        y0 = 408 + t * 42
        y1 = y0 + 46 - t * 26
        b.append(path(f"M {x:.0f},{y0:.0f} Q {x + 6:.0f},{(y0+y1)/2:.0f} {x + 4:.0f},{y1:.0f}", W_FINE))

    # eye, fin, tail detail
    b += eye(184, 364, 17, (-0.4, 0.1), W_MAIN)
    b.append(path("M 160,334 Q 184,318 210,330", W_MID))
    b.append(path("M 281,471 C 276,512 244,550 194,558 "
                  "C 194,522 209,486 232,462", W_MAIN))
    b.append(path("M 262,486 C 254,514 232,538 206,550", W_FINE))
    for (kx, ky) in ((252, 500), (238, 518), (222, 534)):
        b.append(path(f"M {kx},{ky} q -9,4 -3,10", W_FINE))
    b.append(path("M 470,376 Q 496,352 528,336", W_FINE))
    b.append(path("M 470,410 Q 496,436 528,452", W_FINE))
    # tubercles along the snout and jaw
    for (x, y, r) in ((330, 336, 14), (382, 350, 11), (300, 356, 9)):
        b.append(circle(x, y, r, W_MID))

    # sea
    for i, y in enumerate((548, 586, 624, 662)):
        b.append(wave_row(46, PAGE_W - 46, y, 9 + i, 96 + i * 8, W_MAIN, phase=i * 1.1))
    for (x, y, r) in ((140, 566, 12), (250, 604, 9), (388, 570, 14), (470, 640, 10), (196, 646, 8), (520, 596, 7)):
        b.append(circle(x, y, r, W_MID))
        b.append(arc(x, y, r * 0.55, 190, 250, W_FINE))
    # little fish
    for (x, y, s) in ((96, 604, 1.0), (436, 604, -1.0)):
        b.append(path(f"M {x:.0f},{y:.0f} q {18*s:.0f},{-13:.0f} {36*s:.0f},0 q {-18*s:.0f},13 {-36*s:.0f},0 Z", W_MID))
        b.append(path(f"M {x:.0f},{y:.0f} l {-9*s:.0f},{-8:.0f} l 0,16 Z", W_MID))

    b.append(caption("DEEP BLUE", 716))
    return svg_page(b)


# -------------------------------------------------------------- 5 butterfly

def butterfly():
    b = []
    b += doodle_border("scallop", inset=30, w=W_MID)
    cx = CX

    half = []
    # forewing: leading edge to a pointed apex, then a broad outer margin
    half.append(path(
        "M 300,300 C 262,238 200,186 146,166 "
        "C 116,155 90,158 80,172 "
        "L 66,214 "
        "C 60,280 108,368 186,410 "
        "C 218,426 268,424 296,412 "
        "C 300,378 302,340 300,300 Z", W_BOLD))
    # hindwing
    half.append(path(
        "M 300,420 C 246,424 178,458 146,512 "
        "C 110,572 136,626 196,620 "
        "C 256,614 300,548 310,470 "
        "C 312,444 306,426 300,420 Z", W_BOLD))

    # forewing veins split it into three colourable bands
    half.append(path("M 300,330 C 250,286 160,232 78,196", W_MAIN))
    half.append(path("M 298,382 C 236,376 156,336 78,250", W_MAIN))
    for (x, y, r) in ((150, 205, 14), (204, 232, 13), (256, 272, 11)):
        half.append(sparkle(x, y, r, W_MID))
    for (x, y, r) in ((200, 302, 22), (140, 270, 16), (256, 336, 14), (96, 236, 10)):
        half.append(circle(x, y, r, W_MID))
        half.append(circle(x, y, r * 0.44, W_FINE))
    for (x, y, r) in ((130, 336, 11), (172, 368, 10), (216, 390, 9), (256, 400, 7)):
        half.append(circle(x, y, r, W_MID))
    half.append(path("M 88,214 C 128,268 178,316 236,352", W_FINE))

    # hindwing
    half.append(path("M 304,458 C 254,478 200,516 168,566", W_MAIN))
    for (x, y, r) in ((238, 484, 16), (190, 512, 16)):
        half.append(circle(x, y, r, W_MID))
        half.append(circle(x, y, r * 0.42, W_FINE))
    half.append(sparkle(274, 450, 11, W_MID))
    for (x, y) in ((220, 574), (264, 534), (292, 498), (178, 594)):
        half.append(heart(x, y, 12, W_MID))
    half.append(path("M 158,604 C 208,594 258,558 292,510", W_FINE))

    half.append(path("M 300,282 C 284,242 258,214 226,198", W_MAIN))
    half.append(circle(221, 194, 9, W_MAIN))

    b += half
    b.append(mirror_x(half, cx))

    # body
    b.append(circle(cx, 288, 24, W_BOLD))
    b += eye(cx - 9, 285, 6, w=W_FINE)
    b += eye(cx + 9, 285, 6, w=W_FINE)
    b.append(path("M 298,299 Q 306,305 314,299", W_FINE))
    b.append(path(
        "M 306,310 C 274,332 272,396 284,450 "
        "C 291,506 299,546 306,568 "
        "C 313,546 321,506 328,450 "
        "C 340,396 338,332 306,310 Z", W_BOLD))
    for i in range(7):
        y = 340 + i * 30
        w_ = 29 - i * 2.8
        b.append(path(f"M {cx - w_:.1f},{y:.1f} Q {cx:.1f},{y + 11:.1f} {cx + w_:.1f},{y:.1f}", W_MID))

    b.append(caption("PAPER WINGS", 700))
    return svg_page(b)


# --------------------------------------------------------------- 6 balloons

def _balloon(cx, cy, r, stripes, basket_w, tag=None):
    """Envelope, ropes and basket. cy is the centre of the envelope."""
    out = [path(
        f"M {cx:.1f},{cy - r:.1f} "
        f"C {cx + r*1.42:.1f},{cy - r*0.78:.1f} {cx + r*1.34:.1f},{cy + r*0.44:.1f} "
        f"{cx + r*0.26:.1f},{cy + r*1.04:.1f} "
        f"C {cx + r*0.12:.1f},{cy + r*1.16:.1f} {cx - r*0.12:.1f},{cy + r*1.16:.1f} "
        f"{cx - r*0.26:.1f},{cy + r*1.04:.1f} "
        f"C {cx - r*1.34:.1f},{cy + r*0.44:.1f} {cx - r*1.42:.1f},{cy - r*0.78:.1f} "
        f"{cx:.1f},{cy - r:.1f} Z", W_BOLD)]
    for i in range(1, stripes):
        f = -1 + 2.0 * i / stripes
        out.append(path(
            f"M {cx + f*r*0.02:.1f},{cy - r:.1f} "
            f"C {cx + f*r*1.38:.1f},{cy - r*0.74:.1f} {cx + f*r*1.3:.1f},{cy + r*0.48:.1f} "
            f"{cx + f*r*0.28:.1f},{cy + r*1.04:.1f}", W_MID))
    by = cy + r * 1.1
    out.append(path(f"M {cx - r*0.26:.1f},{cy + r*1.04:.1f} "
                    f"Q {cx:.1f},{by + 6:.1f} {cx + r*0.26:.1f},{cy + r*1.04:.1f}", W_MAIN))
    bw = basket_w
    top = by + 44
    for s in (-1, 1):
        out.append(path(f"M {cx + s*r*0.24:.1f},{by + 4:.1f} L {cx + s*bw*0.56:.1f},{top:.1f}", W_MAIN))
    out.append(path(f"M {cx - bw*0.56:.1f},{top:.1f} L {cx - bw*0.46:.1f},{top + 38:.1f} "
                    f"L {cx + bw*0.46:.1f},{top + 38:.1f} L {cx + bw*0.56:.1f},{top:.1f} Z", W_BOLD))
    out.append(line(cx - bw * 0.53, top + 16, cx + bw * 0.53, top + 16, W_MID))
    for i in range(1, 4):
        x = cx - bw * 0.56 + bw * 1.12 * i / 4
        out.append(line(x, top, x, top + 38, W_FINE))
    if tag:
        out += tag(cx, cy, r)
    return out


def balloons():
    b = []
    b += doodle_border("dots", inset=26, w=W_MID)

    def hearts_tag(cx, cy, r):
        return [heart(cx, cy - r * 0.16, 21, W_MID),
                heart(cx - r * 0.6, cy + r * 0.14, 13, W_MID),
                heart(cx + r * 0.6, cy + r * 0.14, 13, W_MID)]

    def star_tag(cx, cy, r):
        return [star(cx, cy - r * 0.12, 23, 9.5, 5, W_MID),
                circle(cx - r * 0.58, cy + r * 0.22, 9, W_MID),
                circle(cx + r * 0.58, cy + r * 0.22, 9, W_MID)]

    def dot_tag(cx, cy, r):
        return [circle(cx, cy - r * 0.1, 13, W_MID),
                circle(cx - r * 0.52, cy + r * 0.22, 8, W_MID),
                circle(cx + r * 0.52, cy + r * 0.22, 8, W_MID)]

    b += _balloon(176, 244, 96, 6, 62, hearts_tag)
    b += _balloon(444, 170, 66, 5, 44, star_tag)
    b += _balloon(304, 404, 48, 4, 32, dot_tag)

    for (x, y, w_, h_) in ((96, 388, 112, 32), (540, 302, 92, 28), (150, 476, 80, 24)):
        b.append(cloud(x, y, w_, h_, 3))
    for (x, y, s) in ((320, 246, 1.0), (366, 218, 0.8), (108, 148, 0.75), (534, 402, 0.9)):
        b.append(path(f"M {x - 20*s:.0f},{y:.0f} q {10*s:.0f},{-11*s:.0f} {20*s:.0f},0 "
                      f"q {10*s:.0f},{-11*s:.0f} {20*s:.0f},0", W_MAIN))
    b.append(sparkle(556, 208, 11, W_FINE))

    # ground: a far ridge and a near ridge, everything planted on the line
    far_d, far_h = terrain(614, [(22, 380, 0.4), (9, 150, 1.9)], 26, 586)
    near_d, near_h = terrain(700, [(18, 430, 2.6), (7, 170, 0.3)], 26, 586)
    b.append(path(far_d, W_BOLD))

    for x, h_ in ((64, 36), (132, 48), (236, 40), (552, 44)):
        gy = far_h(x)
        b.append(line(x, gy, x, gy - h_, W_MAIN))
        b.append(circle(x, gy - h_ - 22, 26, W_MAIN))
        b.append(circle(x, gy - h_ - 22, 15, W_FINE))
    for x, w_, h_ in ((346, 44, 36), (416, 34, 28), (476, 40, 32)):
        gy = far_h(x + w_ / 2)
        b.append(rect(x, gy - h_, w_, h_, 0, W_MAIN))
        b.append(path(f"M {x - 7:.0f},{gy - h_:.0f} L {x + w_/2:.0f},{gy - h_ - 26:.0f} "
                      f"L {x + w_ + 7:.0f},{gy - h_:.0f} Z", W_MAIN))
        b.append(rect(x + w_ * 0.32, gy - h_ * 0.62, w_ * 0.34, h_ * 0.62, 0, W_MID))

    b.append(path(near_d, W_BOLD))
    for i in range(13):
        x = 58 + i * 40
        gy = near_h(x) + 22
        b.append(path(f"M {x:.0f},{gy:.0f} q 6,-17 12,-2 q 6,-17 12,1", W_MID))
    for x in (86, 148, 462, 526):
        gy = near_h(x) + 28
        b += ring_of(5, lambda i, a, X=x, Y=gy: petal(X, Y, 3, 13, 5.5, W_MID, a))
        b.append(circle(x, gy, 3.2, W_FINE))
        b.append(line(x, gy + 6, x, gy + 24, W_MID))
        b += leaf(x, gy + 17, 15, 5, 200 if x < 306 else -20, W_FINE)

    b.append(caption("UP AND AWAY", 758, 14))
    return svg_page(b)
