"""Toolkit for the packed, hand-inked scene pages.

Unlike the rest of the book these pages give every shape a white fill, so
foreground objects genuinely occlude what is behind them and the scene can be
built strictly back to front. Outlines carry a slight hand tremble.
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


def fluffy(cx, cy, base_r, bump_d, bump_r, n, w=WW, fill=WHITE, phase=0.0):
    """A poodle-fluff blob: a base circle ringed with just-touching bumps."""
    bumps = [(cx + bump_d * math.cos(2 * math.pi * i / n + phase),
              cy + bump_d * math.sin(2 * math.pi * i / n + phase), bump_r)
             for i in range(n)]
    return _p(bumpy_circle(cx, cy, base_r, bumps), w, fill)


def flower(cx, cy, r, w=WD, fill=WHITE, n=5, phase=-90.0):
    """A simple round-petal flower."""
    out = []
    for i in range(n):
        a = math.radians(phase + 360.0 * i / n)
        out.append(wcirc(cx + r * 0.66 * math.cos(a), cy + r * 0.66 * math.sin(a),
                         r * 0.38, 1.1, cx + cy + i, w, fill, 10))
    out.append(wcirc(cx, cy, r * 0.28, 0.9, cx - cy, w, fill, 8))
    return out


def jar(b, cx, base_y, top_y, half, seed, lid=True):
    """A round-shouldered storage jar."""
    b.append(wpoly([(cx - half, top_y + 10), (cx - half - 3, base_y - 10),
                    (cx - half + 6, base_y), (cx + half - 6, base_y),
                    (cx + half + 3, base_y - 10), (cx + half, top_y + 10),
                    (cx + half - 4, top_y)], True, 2.2, seed, WW, WHITE))
    if lid:
        b.append(wrect(cx - half - 4, top_y - 16, 2 * half + 8, 18, 5, 2.0, seed + 1, WW, WHITE))
