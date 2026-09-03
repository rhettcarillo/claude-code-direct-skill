"""Page 17: a kawaii popcorn counter, inked scene style.

Unlike the rest of the book this page is a packed, full-frame scene: shapes
carry a white fill so foreground objects genuinely occlude what is behind
them, and outlines are drawn with a slight hand tremble.
"""

import math
from draw import (PAGE_W, PAGE_H, INK, smooth_open, smooth_closed,
                  bumpy_circle, svg_page)

WW = 4.6      # main outline
WD = 3.2      # interior detail
WF = 2.4      # smallest detail
WHITE = "#ffffff"

PX0, PY0, PX1, PY1 = 44.0, 60.0, 568.0, 732.0


# ------------------------------------------------------------- ink helpers

def _rnd(seed):
    x = math.sin(seed * 12.9898 + 78.233) * 43758.5453
    return x - math.floor(x)


def _p(d, w=WW, fill="none"):
    return (f'<path d="{d}" fill="{fill}" stroke="{INK}" stroke-width="{w}" '
            f'stroke-linecap="round" stroke-linejoin="round"/>')


def _jit(pts, amp, seed, closed):
    out = []
    n = len(pts)
    for i in range(n if closed else n - 1):
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % n]
        dx, dy = x1 - x0, y1 - y0
        L = math.hypot(dx, dy) or 1.0
        px, py = -dy / L, dx / L
        for j in range(max(int(L / 26), 1)):
            t = j / max(int(L / 26), 1)
            o = (_rnd(seed + i * 7.3 + j * 3.1) - 0.5) * amp
            out.append((x0 + dx * t + px * o, y0 + dy * t + py * o))
    if not closed:
        out.append(pts[-1])
    return out


def wpoly(pts, closed=False, amp=2.6, seed=0.0, w=WW, fill="none"):
    j = _jit(list(pts), amp, seed, closed)
    return _p(smooth_closed(j, 0.16) if closed else smooth_open(j, 0.16), w, fill)


def wcirc(cx, cy, r, amp=2.6, seed=0.0, w=WW, fill="none", n=18):
    pts = [(cx + (r + (_rnd(seed + i) - 0.5) * amp) * math.cos(2 * math.pi * i / n),
            cy + (r + (_rnd(seed + i + 40) - 0.5) * amp) * math.sin(2 * math.pi * i / n))
           for i in range(n)]
    return _p(smooth_closed(pts, 0.36), w, fill)


def wrect(x, y, w_, h_, r=8, amp=2.4, seed=0.0, w=WW, fill="none"):
    pts = []
    for (ccx, ccy, a0) in ((x + w_ - r, y + r, -90), (x + w_ - r, y + h_ - r, 0),
                           (x + r, y + h_ - r, 90), (x + r, y + r, 180)):
        for k in range(4):
            a = math.radians(a0 + 90 * k / 3)
            pts.append((ccx + r * math.cos(a), ccy + r * math.sin(a)))
    return wpoly(pts, True, amp, seed, w, fill)


def wline(x0, y0, x1, y1, amp=2.2, seed=0.0, w=WW):
    return wpoly([(x0, y0), (x1, y1)], False, amp, seed, w)


def wtext(s, x, y, size, w=2.2, spacing=2, rot=0.0, anchor="middle"):
    t = f' transform="rotate({rot},{x:.1f},{y:.1f})"' if rot else ""
    return (f'<text x="{x:.1f}" y="{y:.1f}"{t} font-family="DejaVu Sans" '
            f'font-size="{size}" font-weight="bold" text-anchor="{anchor}" '
            f'letter-spacing="{spacing}" fill="none" stroke="{INK}" '
            f'stroke-width="{w}" stroke-linejoin="round">{s}</text>')


def grp(body, transform):
    return f'<g transform="{transform}">' + "".join(body) + "</g>"


def kern(cx, cy, r, seed=0.0, w=WW, fill=WHITE):
    """One popped kernel, opaque so it covers what it sits on."""
    n = 5
    bumps = [(cx + r * 0.48 * math.cos(2 * math.pi * i / n + seed),
              cy + r * 0.48 * math.sin(2 * math.pi * i / n + seed), r * 0.53)
             for i in range(n)]
    return _p(bumpy_circle(cx, cy, r * 0.40, bumps, 150), w, fill)


def wheart(cx, cy, r, w=WW, fill="none"):
    return _p(f"M {cx:.1f},{cy+r*0.85:.1f} "
              f"C {cx-r*1.35:.1f},{cy-r*0.15:.1f} {cx-r*0.72:.1f},{cy-r*1.15:.1f} "
              f"{cx:.1f},{cy-r*0.42:.1f} "
              f"C {cx+r*0.72:.1f},{cy-r*1.15:.1f} {cx+r*1.35:.1f},{cy-r*0.15:.1f} "
              f"{cx:.1f},{cy+r*0.85:.1f} Z", w, fill)


def wstar(cx, cy, ro, ri, pts, amp=2.2, seed=0.0, w=WW, fill="none", phase=-90.0):
    p = []
    for i in range(pts * 2):
        r = ro if i % 2 == 0 else ri
        a = math.radians(phase + 180.0 * i / pts)
        p.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return wpoly(p, True, amp, seed, w, fill)


def tubby(b, cx, base_y, top_y, ht, hb, stripes, seed, lip=13.0):
    """A striped popcorn tub whose lip is scalloped like a cupcake liner."""
    pts = []
    n = max(int(2 * ht / 24), 3)
    for i in range(n):
        xa = cx - ht + 2 * ht * i / n
        xb = cx - ht + 2 * ht * (i + 1) / n
        xm = (xa + xb) / 2
        for k in range(4):
            t = k / 4.0
            pts.append(((1 - t) ** 2 * xa + 2 * (1 - t) * t * xm + t * t * xb,
                        (1 - t) ** 2 * top_y + 2 * (1 - t) * t * (top_y - lip) + t * t * top_y))
    pts += [(cx + ht, top_y), (cx + hb, base_y), (cx, base_y + hb * 0.13),
            (cx - hb, base_y)]
    b.append(wpoly(pts, True, 2.2, seed, WW, WHITE))
    for i in range(1, stripes):
        f = i / stripes
        b.append(wline(cx - ht + 2 * ht * f, top_y + 4,
                       cx - hb + 2 * hb * f, base_y - 5, 2.0, seed + i, WD))

# --------------------------------------------------------------- the scene

def popcorn_shop():
    b = [f'<rect x="0" y="0" width="{PAGE_W}" height="{PAGE_H}" fill="{WHITE}"/>']

    # ---- back wall and counter line
    for i, x in enumerate((122, 208, 268)):
        b.append(wline(x, PY0 + 8, x, 466, 2.4, 10 + i, WD))
    b.append(wline(PX0 + 6, 468, PX1 - 6, 460, 2.6, 20, WW))

    # ---- popcorn machine
    b.append(wrect(282, 78, 218, 66, 8, 2.6, 30, WW, WHITE))
    b.append(wline(372, 82, 372, 140, 2.0, 31, WD))
    b.append(wheart(326, 112, 19, WW))
    b.append(wtext("POPCORN", 436, 121, 19, 2.0, 1))

    b.append(wrect(294, 144, 194, 186, 6, 2.6, 32, WW, WHITE))
    for i, x in enumerate((342, 391, 440)):
        b.append(wline(x, 152, x, 288, 2.0, 33 + i, WD))
    b.append(wrect(354, 168, 74, 58, 12, 2.4, 36, WW, WHITE))
    b.append(wrect(348, 154, 86, 16, 6, 2.2, 37, WD, WHITE))
    b.append(wline(364, 154, 364, 146, 1.6, 38, WD))
    b.append(wline(418, 154, 418, 146, 1.6, 39, WD))
    b.append(wline(362, 198, 420, 198, 1.6, 40, WF))
    for i, (x, y, r) in enumerate(((312, 306, 17), (346, 296, 18), (380, 302, 17),
                                   (414, 296, 18), (448, 302, 17), (476, 308, 15))):
        b.append(kern(x, y, r, i * 0.7))
    for i, (x, y, r) in enumerate(((326, 246, 14), (462, 236, 13),
                                   (306, 200, 12))):
        b.append(kern(x, y, r, i * 1.1, WD))
    b.append(wline(322, 330, 306, 452, 2.6, 41, WW))
    b.append(wline(460, 330, 476, 452, 2.6, 42, WW))
    b.append(wline(312, 408, 470, 404, 2.4, 43, WD))

    # ---- BUY GET 1 sign and the cup shelf
    b.append(wrect(490, 286, 78, 94, 8, 2.6, 50, WW, WHITE))
    b.append(wtext("BUY", 520, 322, 17, 1.8, 1))
    b.append(wtext("GET", 516, 350, 17, 1.8, 1))
    b.append(wtext("1", 552, 356, 40, 2.6, 0, rot=8))
    b.append(wline(486, 464, 566, 458, 2.4, 55, WW))
    tubby(b, 512, 462, 424, 24, 18, 3, 56)
    b.append(kern(500, 414, 14, 0.4))
    b.append(kern(522, 408, 15, 1.1))
    tubby(b, 550, 464, 434, 20, 15, 3, 57)
    b.append(kern(542, 424, 12, 0.8))
    b.append(kern(560, 420, 13, 0.2))

    # ---- NEW sign on a striped post
    b.append(wrect(382, 348, 36, 118, 4, 2.2, 60, WW, WHITE))
    for x in (391, 400, 409):
        b.append(wline(x, 352, x, 462, 1.8, x, WD))
    b.append(wstar(400, 316, 52, 38, 11, 2.4, 61, WW, WHITE))
    b.append(wtext("NEW", 400, 326, 22, 2.2, 2, rot=-7))

    # ---- tipped tub in the top-left corner
    g = [wpoly([(-52, -38), (-34, 46), (34, 46), (52, -38)], True, 2.6, 70, WW, WHITE),
         wrect(-59, -52, 118, 22, 8, 2.4, 71, WW, WHITE)]
    for (dx, dy) in ((-26, -8), (6, 4), (30, -14), (-10, 26), (22, 30)):
        g.append(wcirc(dx, dy, 9, 1.8, 72 + dx, WD))
    b.append(grp(g, "translate(112,150) rotate(-18)"))
    for (x, y, r, s) in ((160, 92, 19, 0.3), (196, 116, 16, 1.0),
                         (132, 66, 15, 1.6), (206, 74, 13, 0.6)):
        b.append(kern(x, y, r, s))

    b.append(wtext("$5", 86, 268, 40, 2.8, 2, rot=-5))
    for (x, y, r, s) in ((262, 224, 15, 0.9), (250, 402, 14, 1.4), (534, 214, 14, 0.2)):
        b.append(kern(x, y, r, s))

    # ---- the poodle behind the counter
    body_bumps = [(200 + 70 * math.cos(math.radians(a)),
                   580 + 70 * math.sin(math.radians(a)), 26)
                  for a in range(0, 360, 45)]
    b.append(_p(bumpy_circle(200, 580, 52, body_bumps), WW, WHITE))

    head_bumps = [(196 + 54 * math.cos(math.radians(360.0 * i / 7)),
                   406 + 54 * math.sin(math.radians(360.0 * i / 7)), 23)
                  for i in range(7)]
    b.append(_p(bumpy_circle(196, 406, 40, head_bumps), WW, WHITE))

    # cap
    b.append(wpoly([(250, 356), (288, 336), (324, 336), (340, 352), (326, 370),
                    (288, 380), (250, 382)], True, 2.6, 81, WW, WHITE))
    b.append(wpoly([(130, 378), (134, 342), (156, 312), (196, 300), (236, 312),
                    (258, 342), (262, 378)], True, 2.6, 80, WW, WHITE))
    b.append(wline(132, 374, 260, 370, 2.2, 82, WD))
    b.append(wstar(206, 336, 25, 11, 5, 2.0, 83, WW, WHITE))

    # headphones over the cap
    b.append(wpoly([(104, 376), (114, 300), (180, 262), (248, 292), (262, 326),
                    (244, 320), (182, 286), (132, 316), (124, 378)],
                   True, 2.4, 84, WW, WHITE))
    b.append(wcirc(116, 402, 40, 2.6, 85, WW, WHITE))
    b.append(wcirc(116, 402, 27, 2.2, 86, WD))
    b.append(kern(116, 402, 22, 0.5, WD))

    # face
    for ex in (170, 216):
        b.append(f'<ellipse cx="{ex}" cy="414" rx="6.4" ry="8.2" fill="{INK}"/>')
    b.append(_p("M 186,430 Q 194,426 202,430 Q 200,439 194,443 Q 188,439 186,430 Z",
                WD, INK))
    b.append(wline(194, 443, 194, 450, 1.4, 87, WD))
    b.append(_p("M 194,450 C 190,458 182,458 179,452", WD))
    b.append(_p("M 194,450 C 198,458 206,458 209,452", WD))

    # ---- the drink, held in front
    b.append(wpoly([(206, 556), (222, 672), (274, 672), (290, 556)], True, 2.6, 90, WW, WHITE))
    b.append(wrect(198, 540, 100, 22, 9, 2.2, 91, WW, WHITE))
    b.append(_p("M 210,540 C 216,510 280,510 286,540 Z", WW, WHITE))
    b.append(wline(214, 618, 282, 618, 2.0, 92, WD))
    b.append(wpoly([(248, 528), (228, 480), (198, 452)], False, 2.0, 93, 5.6))

    # ---- big popcorn tub in the foreground
    for i, (x, y, r) in enumerate(((288, 486, 22), (322, 462, 25), (362, 452, 27),
                                      (404, 458, 25), (440, 478, 22), (338, 424, 20),
                                      (382, 418, 21), (420, 428, 19))):
        b.append(kern(x, y, r, i * 0.6))
    tubby(b, 370, 704, 502, 88, 56, 7, 95)

    # ---- customer, seen from behind
    b.append(wpoly([(424, PY1), (440, 674), (500, 650), (562, 674), (572, PY1)],
                   False, 2.6, 96, WW))
    b.append(_p(f"M 424,{PY1} C 432,672 460,648 500,648 C 540,648 568,672 572,{PY1} Z",
                WW, WHITE))
    b.append(_p(bumpy_circle(500, 606, 62,
                             [(462, 556, 24), (540, 556, 24)]), WW, WHITE))
    b.append(wcirc(462, 556, 12, 1.8, 98, WD))
    b.append(wcirc(540, 556, 12, 1.8, 99, WD))
    b.append(wpoly([(440, 600), (424, 588), (442, 582)], True, 2.0, 103, WD, WHITE))
    b.append(wline(462, 664, 540, 662, 2.0, 104, WD))

    b.append(kern(80, 716, 15, 0.7))
    b.append(kern(392, 726, 13, 1.3))

    # ---- SCAN card
    g = [wrect(0, 0, 92, 132, 8, 2.4, 100, WW, WHITE),
         wtext("SCAN", 46, 30, 20, 2.0, 2),
         wrect(16, 44, 60, 70, 6, 2.2, 101, WD, WHITE),
         wcirc(46, 79, 22, 2.0, 102, WD, WHITE),
         f'<circle cx="39" cy="74" r="3.2" fill="{INK}"/>',
         f'<circle cx="53" cy="74" r="3.2" fill="{INK}"/>',
         _p("M 37,85 C 41,91 51,91 55,85", WF)]
    b.append(grp(g, "translate(50,566) rotate(-6)"))

    # ---- PICK UP HERE
    g = [wrect(0, 0, 206, 80, 8, 2.4, 110, WW, WHITE),
         wtext("PICK UP", 103, 36, 25, 2.2, 2),
         wtext("HERE", 88, 68, 25, 2.2, 2),
         wheart(160, 60, 13, WD)]
    b.append(grp(g, "translate(148,638) rotate(-3)"))

    # ---- mask anything outside the panel, then ink the frame
    b.append(f'<rect x="0" y="0" width="{PAGE_W}" height="{PY0}" fill="{WHITE}"/>')
    b.append(f'<rect x="0" y="{PY1}" width="{PAGE_W}" height="{PAGE_H-PY1}" fill="{WHITE}"/>')
    b.append(f'<rect x="0" y="0" width="{PX0}" height="{PAGE_H}" fill="{WHITE}"/>')
    b.append(f'<rect x="{PX1}" y="0" width="{PAGE_W-PX1}" height="{PAGE_H}" fill="{WHITE}"/>')
    b.append(wrect(PX0, PY0, PX1 - PX0, PY1 - PY0, 20, 2.6, 120, 5.6))

    return svg_page(b)
