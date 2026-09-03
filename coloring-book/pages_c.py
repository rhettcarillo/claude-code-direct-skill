"""Pages 12-16: mushroom cottage, hedgehog, tortoise, big tree, blank frame."""

import math
from draw import *

CX = PAGE_W / 2


def _dome(cx, cy, rx, ry, a0, a1, n, wobble=None):
    """Points along an ellipse arc, angles in degrees measured up from +x."""
    pts = []
    for i in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * i / n)
        k = 1.0 if wobble is None else wobble(i)
        pts.append((cx + rx * k * math.cos(a), cy - ry * k * math.sin(a)))
    return pts


# ----------------------------------------------------- 12 mushroom cottage

def mushroom_house():
    b = []
    b += doodle_border("double", inset=26, w=W_MID)

    # cap
    b.append(path("M 112,392 C 122,270 198,200 306,200 "
                  "C 414,200 490,270 500,392 "
                  "C 452,416 386,426 306,426 C 226,426 160,416 112,392 Z", W_BOLD))
    for (x, y, r) in ((196, 302, 31), (306, 266, 37), (414, 304, 29),
                      (250, 366, 21), (364, 368, 23), (150, 372, 16), (462, 370, 17),
                      (306, 356, 15)):
        b.append(circle(x, y, r, W_MAIN))
        b.append(circle(x, y, r * 0.42, W_FINE))
    # gills under the brim
    brim = ((500, 392), (452, 416), (386, 426), (306, 426))
    for i in range(21):
        t = i / 20
        u = 1 - t
        x = u**3*112 + 3*u*u*t*160 + 3*u*t*t*226 + t**3*306
        y = u**3*392 + 3*u*u*t*416 + 3*u*t*t*426 + t**3*426
        for sx in (x, 612 - x):
            b.append(line(sx, y - 2, sx, y + 13, W_FINE))

    # stem
    b.append(path("M 232,414 C 220,486 216,558 226,618", W_BOLD))
    b.append(path("M 380,414 C 392,486 396,558 386,618", W_BOLD))
    b.append(line(226, 618, 386, 618, W_BOLD))

    # door
    b.append(path("M 274,618 L 274,558 C 274,540 288,526 306,526 "
                  "C 324,526 338,540 338,558 L 338,618 Z", W_BOLD))
    b.append(line(295, 530, 295, 618, W_FINE))
    b.append(line(317, 530, 317, 618, W_FINE))
    b.append(circle(328, 580, 5.5, W_MID))
    b.append(path("M 266,618 L 346,618", W_MAIN))

    # windows
    for x in (250, 362):
        b.append(circle(x, 492, 23, W_BOLD))
        b.append(circle(x, 492, 16, W_MID))
        b.append(line(x - 16, 492, x + 16, 492, W_FINE))
        b.append(line(x, 476, x, 508, W_FINE))

    # ground, path, little mushrooms, snail
    b.append(path(smooth_open([(44, 632), (170, 626), (306, 630), (450, 624), (568, 630)]), W_BOLD))
    b.append(path("M 282,630 C 268,668 246,698 214,720", W_MAIN))
    b.append(path("M 330,630 C 344,668 368,698 400,720", W_MAIN))
    for y in (656, 682, 708):
        k = (y - 630) / 90
        b.append(path(f"M {292 - k*54:.0f},{y} Q 306,{y + 8} {320 + k*54:.0f},{y}", W_FINE))
    for (x, y, s) in ((100, 620, 1.0), (128, 626, 0.7), (492, 618, 0.9), (520, 626, 0.6)):
        b.append(path(f"M {x - 30*s:.0f},{y - 26*s:.0f} "
                      f"a {30*s:.0f},{26*s:.0f} 0 0 1 {60*s:.0f},0 Z", W_MAIN))
        b.append(path(f"M {x - 11*s:.0f},{y - 26*s:.0f} L {x - 9*s:.0f},{y:.0f} "
                      f"L {x + 9*s:.0f},{y:.0f} L {x + 11*s:.0f},{y - 26*s:.0f}", W_MAIN))
        b.append(circle(x - 10 * s, y - 36 * s, 5 * s, W_FINE))
        b.append(circle(x + 12 * s, y - 32 * s, 4 * s, W_FINE))
    # snail
    sx, sy = 150, 700
    b.append(path(f"M {sx-34},{sy+10} C {sx-38},{sy-2} {sx-30},{sy-8} {sx-20},{sy-6} "
                  f"C {sx-8},{sy-4} {sx-6},{sy+6} {sx-14},{sy+10} Z", W_MAIN))
    b.append(circle(sx + 14, sy - 6, 30, W_BOLD))
    b.append(path(f"M {sx+14},{sy+22} C {sx-6},{sy+18} {sx-8},{sy-2} {sx+8},{sy-8} "
                  f"C {sx+24},{sy-14} {sx+34},{sy+2} {sx+26},{sy+12} "
                  f"C {sx+20},{sy+18} {sx+10},{sy+14} {sx+12},{sy+4}", W_MID))
    b.append(path(f"M {sx-30},{sy-6} L {sx-38},{sy-24}", W_MID))
    b.append(path(f"M {sx-20},{sy-8} L {sx-24},{sy-28}", W_MID))
    b.append(circle(sx - 38, sy - 28, 4, W_MID))
    b.append(circle(sx - 24, sy - 32, 4, W_MID))
    for x in (60, 96, 452, 500, 546):
        b.append(path(f"M {x},{700} q 7,-20 14,-2 q 7,-20 14,1", W_MID))
    for x in (470, 522):
        b += ring_of(5, lambda i, a, X=x: petal(X, 668, 3, 13, 5.5, W_MID, a))
        b.append(line(x, 674, x, 696, W_MID))

    b.append(caption("TOADSTOOL COTTAGE", 750, 13))
    return svg_page(b)


# ------------------------------------------------------------- 13 hedgehog

def hedgehog():
    b = []
    b += doodle_border("scallop", inset=30, w=W_MID)

    cx, cy, rx, ry = 380, 452, 150, 150

    # spiny back: a zig-zag around the upper ellipse
    pts = _dome(cx, cy, rx, ry, 160, -8, 21,
                wobble=lambda i: 1.0 if i % 2 == 0 else 0.79)
    b.append(polyline(pts, W_BOLD))
    b.append(path(f"M {pts[-1][0]:.0f},{pts[-1][1]:.0f} "
                  f"C 534,540 486,588 400,592 "
                  f"C 340,596 288,582 252,560", W_BOLD))

    # interior spine rows
    for k, scale in enumerate((0.82, 0.62, 0.42)):
        row = _dome(cx, cy, rx * scale, ry * scale, 156 - k * 4, -2 + k * 4, 16 - k * 3)
        for i in range(len(row) - 1):
            x0, y0 = row[i]
            x1, y1 = row[i + 1]
            mx, my = (x0 + x1) / 2, (y0 + y1) / 2
            d = 21 - k * 3
            h = max(math.hypot(mx - cx, my - cy), 1)
            b.append(polyline([(x0, y0), (mx + (mx - cx) / h * d, my + (my - cy) / h * d), (x1, y1)], W_MID))

    # face
    b.append(path("M 104,470 C 108,436 140,410 188,400 "
                  "C 218,394 242,400 254,412 "
                  "C 244,472 240,520 250,558 "
                  "C 222,568 178,562 146,544 "
                  "C 116,528 100,498 104,470 Z", W_BOLD))
    b.append(f'<circle cx="108" cy="468" r="11" fill="{INK}"/>')
    b.append(path("M 118,486 C 132,494 148,494 158,486", W_MID))
    b += eye(176, 452, 15, (-0.5, 0), W_MAIN)
    b.append(path("M 158,424 Q 178,412 198,422", W_MID))
    b.append(path("M 212,400 C 228,392 244,400 246,414 "
                  "C 240,424 224,426 214,418 Z", W_MAIN))
    for k in range(4):
        b.append(path(f"M {150 + k*24},{548 + k*3} q 6,14 16,16", W_FINE))

    # feet
    for x in (300, 448):
        b.append(path(f"M {x-32},572 C {x-38},596 {x-20},610 {x},610 "
                      f"C {x+20},610 {x+38},596 {x+32},572", W_MAIN))
        for t in (-13, 0, 13):
            b.append(path(f"M {x+t},609 L {x+t*1.1},592", W_FINE))

    # apples and a leaf riding on the spines
    for (x, y, r) in ((332, 274, 30), (452, 294, 25)):
        b.append(path(f"M {x},{y-r*0.6} C {x-r*1.15},{y-r*1.2} {x-r*1.2},{y+r*0.9} {x},{y+r} "
                      f"C {x+r*1.2},{y+r*0.9} {x+r*1.15},{y-r*1.2} {x},{y-r*0.6} Z", W_BOLD))
        b.append(path(f"M {x},{y-r*0.6} C {x+2},{y-r*1.1} {x+2},{y-r*1.4} {x-2},{y-r*1.6}", W_MAIN))
        b += leaf(x - 1, y - r * 1.5, 26, 10, -18, W_MID)
    b += leaf(508, 356, 46, 17, 214, W_MAIN)

    # ground
    b.append(path(smooth_open([(44, 616), (180, 610), (330, 616), (470, 608), (568, 616)]), W_BOLD))
    for x in range(58, 560, 42):
        b.append(path(f"M {x},654 q 7,-20 14,-2 q 7,-20 14,1", W_MID))
    for x in (98, 528):
        b += ring_of(5, lambda i, a, X=x: petal(X, 666, 3, 13, 5.5, W_MID, a))
        b.append(line(x, 672, x, 694, W_MID))

    b.append(caption("PRICKLES", 738))
    return svg_page(b)


# ------------------------------------------------------------- 14 tortoise

def _hexplate(px, py, pr, squash=0.86, w=W_MAIN, inner=True):
    out = [polyline([(px + pr * math.cos(math.radians(90 + 60 * k)),
                      py + pr * squash * math.sin(math.radians(90 + 60 * k))) for k in range(6)],
                    w, close=True)]
    if inner:
        out.append(polyline([(px + pr * 0.55 * math.cos(math.radians(90 + 60 * k)),
                              py + pr * squash * 0.55 * math.sin(math.radians(90 + 60 * k)))
                             for k in range(6)], W_FINE, close=True))
    return out


def tortoise():
    b = []
    b += doodle_border("dots", inset=26, w=W_MID)

    cx, cy, rx, ry = 322, 448, 184, 140
    irx, iry = 142, 100

    # shell
    b.append(polyline(_dome(cx, cy, rx, ry, 180, 0, 56), W_BOLD))
    b.append(path(smooth_open([(cx - rx, cy), (cx - 80, cy + 22), (cx + 40, cy + 22),
                               (cx + rx, cy)]), W_BOLD))
    b.append(polyline(_dome(cx, cy, irx, iry, 180, 0, 48), W_MAIN))
    b.append(path(smooth_open([(cx - irx, cy), (cx - 70, cy + 15), (cx + 36, cy + 15),
                               (cx + irx, cy)]), W_MAIN))
    for i in range(1, 13):
        a = math.radians(180 - 180 * i / 13)
        b.append(line(cx + irx * math.cos(a), cy - iry * math.sin(a),
                      cx + rx * math.cos(a), cy - ry * math.sin(a), W_MAIN))

    # central field: an arch of plates over a lower row
    for i in range(5):
        a = math.radians(158 - 116 * i / 4)
        b += _hexplate(cx + 100 * math.cos(a), cy - 68 * math.sin(a), 27)
    for i in range(3):
        b += _hexplate(cx - 70 + i * 70, cy - 14, 18, 0.8, W_MAIN, inner=False)

    # head and neck
    b.append(path("M 148,462 C 122,442 84,434 60,448 "
                  "C 36,462 36,496 60,510 C 86,526 128,520 150,500", W_BOLD))
    b += eye(86, 464, 14, (-0.45, 0), W_MAIN)
    b.append(path("M 50,490 C 62,500 78,502 90,496", W_MID))
    b.append(path("M 60,442 Q 76,432 94,438", W_FINE))
    b.append(path("M 148,462 C 154,478 154,490 150,500", W_FINE))

    # legs
    for x in (214, 430):
        b.append(path(f"M {x-34},468 C {x-46},506 {x-44},542 {x-30},558 "
                      f"L {x+30},558 C {x+44},542 {x+46},506 {x+34},468", W_BOLD))
        for t in (-17, 0, 17):
            b.append(path(f"M {x+t},558 L {x+t*1.18},538", W_MID))
    b.append(path("M 250,492 C 302,512 348,512 396,492", W_MAIN))

    # tail
    b.append(path("M 504,452 C 526,462 540,478 544,496 "
                  "C 526,492 510,480 500,466", W_MAIN))

    # ground
    b.append(path(smooth_open([(40, 562), (180, 556), (330, 562), (470, 554), (572, 562)]), W_BOLD))
    for x in range(52, 560, 40):
        b.append(path(f"M {x},610 q 7,-20 14,-2 q 7,-20 14,1", W_MID))
    for x in (96, 300, 508):
        b += ring_of(6, lambda i, a, X=x: petal(X, 630, 3, 14, 6, W_MID, a))
        b.append(circle(x, 630, 3.4, W_FINE))
        b.append(line(x, 636, x, 664, W_MID))
        b += leaf(x, 652, 16, 6, 200 if x < 300 else -20, W_FINE)

    b.append(caption("SLOW AND STEADY", 722, 14))
    return svg_page(b)


# ------------------------------------------------------------- 15 big tree

def _puff(cx, cy, rx, ry, n, depth, w=W_BOLD, a0=0.0, a1=360.0):
    """Scalloped outline: n outward arcs around an ellipse."""
    out = []
    span = math.radians(a1 - a0)
    for i in range(n):
        b0 = math.radians(a0) + span * i / n - math.pi / 2
        b1 = math.radians(a0) + span * (i + 1) / n - math.pi / 2
        x0, y0 = cx + rx * math.cos(b0), cy + ry * math.sin(b0)
        x1, y1 = cx + rx * math.cos(b1), cy + ry * math.sin(b1)
        bm = (b0 + b1) / 2
        xm, ym = cx + (rx + depth) * math.cos(bm), cy + (ry + depth) * math.sin(bm)
        qx, qy = 2 * xm - (x0 + x1) / 2, 2 * ym - (y0 + y1) / 2
        out.append(path(f"M {x0:.1f},{y0:.1f} Q {qx:.1f},{qy:.1f} {x1:.1f},{y1:.1f}", w))
    return out


def _bird(x, y, s=1.0, w=W_BOLD):
    """Small side-on bird facing right when s > 0."""
    def P(px, py):
        return f"{x + px * s:.0f},{y + py:.0f}"
    out = [path(f"M {P(-34,6)} C {P(-40,-6)} {P(-30,-22)} {P(-8,-26)} "
                f"C {P(8,-29)} {P(22,-22)} {P(26,-10)} L {P(43,-6)} L {P(26,-1)} "
                f"C {P(24,12)} {P(8,20)} {P(-10,18)} "
                f"C {P(-22,16)} {P(-31,13)} {P(-34,6)} Z", w),
           path(f"M {P(-32,2)} L {P(-58,10)} L {P(-52,-8)} L {P(-38,-6)}", W_MAIN),
           path(f"M {P(-16,-6)} C {P(-4,-14)} {P(10,-10)} {P(14,2)} "
                f"C {P(2,8)} {P(-10,4)} {P(-16,-6)} Z", W_MAIN),
           f'<circle cx="{x + 15 * s:.0f}" cy="{y - 13:.0f}" r="3.4" fill="{INK}"/>']
    return out


def big_tree():
    b = []
    b += doodle_border("double", inset=26, w=W_MID)

    # trunk and branches, drawn first
    b.append(path("M 262,706 C 252,616 254,516 272,424", W_BOLD))
    b.append(path("M 352,706 C 362,616 360,516 342,424", W_BOLD))
    b.append(path("M 268,470 C 234,456 206,440 188,418", W_BOLD))
    b.append(path("M 346,486 C 392,478 434,464 464,442", W_BOLD))
    b.append(path("M 272,540 C 250,536 232,526 218,510", W_MAIN))
    b.append(path("M 344,556 C 366,552 384,542 398,528", W_MAIN))
    for (x, y, r) in ((300, 590, 15), (286, 648, 11)):
        b.append(f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*0.66:.0f}" {stroke_attrs(W_MID)}/>')
    b.append(path("M 262,706 C 234,702 210,708 190,720", W_BOLD))
    b.append(path("M 352,706 C 380,702 406,708 428,720", W_BOLD))

    # swing on the right branch
    b.append(line(412, 470, 424, 594, W_MAIN))
    b.append(line(458, 456, 472, 594, W_MAIN))
    b.append(rect(414, 594, 66, 14, 3, W_BOLD))

    # crown
    b += _puff(306, 274, 226, 168, 16, 26, W_BOLD)
    for (x, y, r) in ((186, 196, 15), (306, 162, 17), (430, 200, 14),
                      (146, 300, 13), (466, 304, 15), (240, 342, 12), (374, 338, 13),
                      (306, 244, 14), (256, 240, 12), (368, 236, 13), (306, 336, 12),
                      (196, 268, 11), (416, 272, 12)):
        b.append(circle(x, y, r, W_MAIN))
        b.append(path(f"M {x},{y - r} C {x + 2},{y - r - 12} {x + 2},{y - r - 16} {x - 2},{y - r - 20}", W_FINE))
    for (x, y, a) in ((236, 176, -40), (382, 168, -140), (162, 240, 20), (452, 244, 160),
                      (268, 290, 40), (344, 286, 140), (206, 340, -25), (408, 344, -155),
                      (140, 344, 30), (472, 348, 150)):
        b += leaf(x, y, 34, 12, a, W_MID)

    # birds
    b += _bird(206, 410, 1.0)
    for lx in (200, 214):
        b.append(path(f"M {lx},428 L {lx},440 M {lx-5},440 L {lx+5},440", W_MID))
    b += _bird(438, 424, -1.0)
    for lx in (432, 446):
        b.append(path(f"M {lx},442 L {lx},452 M {lx-5},452 L {lx+5},452", W_MID))
    b.append(path("M 92,166 q 13,-15 26,0 q 13,-15 26,0", W_MAIN))
    b.append(path("M 486,132 q 11,-13 22,0 q 11,-13 22,0", W_MAIN))
    b.append(sparkle(548, 214, 11, W_FINE))
    b.append(sparkle(62, 250, 10, W_FINE))

    # ground
    b.append(path(smooth_open([(40, 716), (170, 710), (306, 716), (450, 708), (572, 716)]), W_BOLD))
    for x in range(56, 560, 44):
        b.append(path(f"M {x},{690} q 7,-19 14,-2 q 7,-19 14,1", W_MID))
    for x in (118, 496):
        b += ring_of(5, lambda i, a, X=x: petal(X, 664, 3, 13, 5.5, W_MID, a))
        b.append(circle(x, 664, 3.2, W_FINE))
        b.append(line(x, 670, x, 700, W_MID))

    b.append(caption("THE OLD TREE", 754, 14))
    return svg_page(b)


# ------------------------------------------------------- 16 draw your own

def draw_your_own():
    b = []
    b += doodle_border("double", inset=26, w=W_MID)

    x0, y0, x1, y1 = 96, 190, 516, 596
    b.append(rect(x0, y0, x1 - x0, y1 - y0, 18, W_BOLD))
    b.append(rect(x0 + 10, y0 + 10, x1 - x0 - 20, y1 - y0 - 20, 12, W_FINE))

    b.append(text_outline("DRAW YOUR OWN", CX, 142, 40, w=2.2, spacing=3))
    b.append(caption("SOMETHING SMALL AND WONDERFUL", 660, 13))

    # a garland of doodles around the frame
    for (x, y) in ((60, 226), (60, 340), (60, 452), (552, 226), (552, 340), (552, 452)):
        b += ring_of(6, lambda i, a, X=x, Y=y: petal(X, Y, 4, 20, 8, W_MID, a))
        b.append(circle(x, y, 5, W_FINE))
    for (x, y, r) in ((60, 284, 11), (60, 396, 11), (552, 284, 11), (552, 396, 11)):
        b.append(star(x, y, r, r * 0.42, 5, W_MID))
    for (x, y, a) in ((150, 168, -30), (462, 168, -150), (150, 616, 30), (462, 616, 150)):
        b += leaf(x, y, 34, 12, a, W_MID)
    for (x, y) in ((228, 166), (384, 166)):
        b.append(sparkle(x, y, 12, W_MID))
    for (x, y) in ((228, 616), (306, 618), (384, 616)):
        b.append(heart(x, y, 12, W_MID))
    for (x, y) in ((60, 172), (552, 172), (60, 506), (552, 506)):
        b.append(sparkle(x, y, 11, W_FINE))
    for x in (200, 306, 412):
        b += ring_of(5, lambda i, a, X=x: petal(X, 700, 3.5, 15, 6, W_MID, a))
        b.append(circle(x, 700, 4, W_FINE))
        b.append(line(x, 708, x, 736, W_MID))
        b += leaf(x, 722, 18, 7, 200 if x < 306 else -20, W_FINE)

    return svg_page(b)
