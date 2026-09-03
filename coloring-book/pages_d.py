"""Bonus page: a cozy kawaii popcorn counter."""

import math
from draw import *

CX = PAGE_W / 2
W_XBOLD = 5.2          # thickest outlines: character, bucket, counter


# ------------------------------------------------------------------ pieces

def _valance(b, x0, x1, ytop, ymid, ydip, n=9):
    """Theater curtain across the top of the page."""
    d = f"M {x0},{ytop} L {x1},{ytop} L {x1},{ymid}"
    for i in range(n):
        xa = x1 - (x1 - x0) * i / n
        xb = x1 - (x1 - x0) * (i + 1) / n
        d += f" Q {(xa+xb)/2:.1f},{ydip} {xb:.1f},{ymid}"
    d += f" L {x0},{ytop} Z"
    b.append(path(d, W_XBOLD))
    for i in range(1, n):
        x = x0 + (x1 - x0) * i / n
        b.append(line(x, ytop + 4, x, ymid, W_MID))
    for i in range(n):
        xm = x0 + (x1 - x0) * (i + 0.5) / n
        b.append(circle(xm, ydip + 11, 6.5, W_MID))


def _cup(b, cx, top, bottom, half_top, half_bot, lid_h=20, straw=True):
    """A lidded drink cup standing on its base."""
    b.append(path(f"M {cx-half_top-6},{top} L {cx+half_top+6},{top} "
                  f"L {cx+half_top+2},{top+lid_h} L {cx-half_top-2},{top+lid_h} Z", W_XBOLD))
    b.append(line(cx - half_top - 4, top + lid_h * 0.5, cx + half_top + 4, top + lid_h * 0.5, W_MID))
    b.append(path(f"M {cx-half_top},{top+lid_h} L {cx-half_bot},{bottom} "
                  f"L {cx+half_bot},{bottom} L {cx+half_top},{bottom-(bottom-top-lid_h)}", W_XBOLD))
    mid = top + lid_h + (bottom - top - lid_h) * 0.46
    f = 0.46
    hw = half_top + (half_bot - half_top) * f
    b.append(line(cx - hw, mid, cx + hw, mid, W_MAIN))
    b.append(line(cx - hw + 4, mid + 18, cx + hw - 4, mid + 18, W_FINE))
    if straw:
        b.append(path(f"M {cx+half_top*0.55},{top} L {cx+half_top*0.55+18},{top-44}", W_XBOLD))
        b.append(path(f"M {cx+half_top*0.55+18},{top-44} l 14,-8", W_XBOLD))


def _tub(b, cx, base_y, top_y, half_top, half_bot, stripes=5, rim=True):
    """A striped popcorn tub."""
    if rim:
        b.append(rect(cx - half_top - 8, top_y - 13, 2 * (half_top + 8), 26, 7, W_XBOLD))
        ty = top_y + 13
    else:
        ty = top_y
    b.append(path(f"M {cx-half_top},{ty} L {cx-half_bot},{base_y} "
                  f"L {cx+half_bot},{base_y} L {cx+half_top},{ty}", W_XBOLD))
    for i in range(1, stripes):
        f = i / stripes
        xt = cx - half_top + 2 * half_top * f
        xb = cx - half_bot + 2 * half_bot * f
        b.append(line(xt, ty + 3, xb, base_y - 2, W_MAIN))


def _popcorn_pile(b, kernels):
    for (x, y, r) in kernels:
        b.append(popcorn(x, y, r, 5, (x * 0.11 + y * 0.07) % 1.6, W_XBOLD))


def _starburst(b, cx, cy, r_out, r_in, points, label, size):
    pts = []
    for i in range(points * 2):
        r = r_out if i % 2 == 0 else r_in
        a = math.radians(-90 + 180.0 * i / points)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    b.append(polyline(pts, W_XBOLD, close=True))
    b.append(circle(cx, cy, r_in - 6, W_MAIN))
    b.append(text_outline(label, cx, cy + size * 0.36, size, w=1.6, spacing=2))


def _qr(b, x, y, s):
    """A simple QR-ish square: three finders and a few loose cells."""
    b.append(rect(x, y, s, s, 3, W_XBOLD))
    f = s * 0.28
    for (fx, fy) in ((x + s * 0.07, y + s * 0.07), (x + s * 0.65, y + s * 0.07),
                     (x + s * 0.07, y + s * 0.65)):
        b.append(rect(fx, fy, f, f, 2, W_MAIN))
        b.append(rect(fx + f * 0.28, fy + f * 0.28, f * 0.44, f * 0.44, 1, W_MAIN))
    c = s * 0.13
    for (dx, dy) in ((0.44, 0.44), (0.68, 0.46), (0.46, 0.70), (0.72, 0.72), (0.44, 0.16)):
        b.append(rect(x + s * dx, y + s * dy, c, c, 1, W_MAIN))


# -------------------------------------------------------------- the page

# The foreground bucket stands in front of the counter, so counter lines below
# this y are drawn only outside this x window.
OCC0, OCC1 = 234.0, 394.0


def popcorn_shop():
    b = []
    b += doodle_border("double", inset=26, w=W_MID)

    # ---- theater curtain and the signs across the top
    _valance(b, 44, 568, 44, 68, 92, 9)

    b.append(line(240, 92, 240, 102, W_MAIN))
    b.append(line(372, 92, 372, 102, W_MAIN))
    b.append(rect(190, 100, 232, 86, 14, W_XBOLD))
    b.append(rect(199, 109, 214, 68, 9, W_MAIN))
    for i in range(9):
        b.append(circle(190 + 232 * i / 8, 100, 6, W_MAIN))
        b.append(circle(190 + 232 * i / 8, 186, 6, W_MAIN))
    for i in range(1, 3):
        b.append(circle(190, 100 + 86 * i / 3, 6, W_MAIN))
        b.append(circle(422, 100 + 86 * i / 3, 6, W_MAIN))
    b.append(text_outline("POPCORN", 306, 155, 31, w=2.0, spacing=2))

    _starburst(b, 106, 158, 53, 40, 14, "NEW", 21)

    b.append(line(501, 92, 501, 110, W_MAIN))
    b.append(rect(452, 110, 98, 86, 12, W_XBOLD))
    b.append(circle(501, 124, 5.5, W_MAIN))
    b.append(text_outline("BUY", 501, 158, 21, w=1.6, spacing=1))
    b.append(text_outline("GET 1", 501, 184, 21, w=1.6, spacing=1))

    b.append(heart(306, 228, 19, W_XBOLD))

    for (x, y, r) in ((168, 250, 17), (392, 240, 15), (540, 272, 16), (62, 296, 15)):
        b.append(popcorn(x, y, r, 5, (x * 0.09) % 1.5, W_MAIN))
    for (x, y, r) in ((240, 236, 11), (452, 252, 11), (566, 362, 12), (352, 316, 12)):
        b.append(star(x, y, r, r * 0.42, 5, W_MAIN))
    for (x, y, r) in ((330, 272, 9), (496, 320, 9), (58, 368, 9)):
        b.append(sparkle(x, y, r, W_MID))

    # ---- counter, broken around the foreground bucket
    b.append(line(52, 556, 560, 556, W_XBOLD))
    b.append(path("M 60,556 Q 52,556 52,564 L 52,574 Q 52,582 60,582", W_XBOLD))
    b.append(path("M 552,556 Q 560,556 560,564 L 560,574 Q 560,582 552,582", W_XBOLD))
    b.append(line(52, 582, OCC0, 582, W_XBOLD))
    b.append(line(OCC1, 582, 560, 582, W_XBOLD))
    b.append(path(f"M {OCC0},582 L 68,582 Q 62,582 62,588 L 62,700 "
                  f"Q 62,706 68,706 L {OCC0},706", W_XBOLD))
    b.append(path(f"M {OCC1},582 L 544,582 Q 550,582 550,588 L 550,700 "
                  f"Q 550,706 544,706 L {OCC1},706", W_XBOLD))
    for (a, c) in ((62, OCC0), (OCC1, 550)):
        n = max(int((c - a) / 30), 3)
        for i in range(n):
            xa = a + (c - a) * i / n
            xb = a + (c - a) * (i + 1) / n
            b.append(path(f"M {xa:.1f},582 Q {(xa+xb)/2:.1f},600 {xb:.1f},582", W_MAIN))
        for i in range(n + 1):
            b.append(circle(a + 10 + (c - a - 20) * i / n, 694, 4.4, W_MID))
    b.append(line(40, 712, 236, 712, W_XBOLD))
    b.append(line(382, 712, 572, 712, W_XBOLD))

    # ---- counter-front signs
    b.append(rect(76, 596, 126, 96, 10, W_XBOLD))
    b.append(text_outline("SCAN", 139, 622, 20, w=1.7, spacing=2))
    _qr(b, 114, 630, 50)

    b.append(rect(408, 596, 132, 96, 10, W_XBOLD))
    b.append(path("M 474,634 L 474,610 M 474,606 L 462,622 M 474,606 L 486,622", W_XBOLD))
    b.append(text_outline("PICK UP", 474, 660, 19, w=1.6, spacing=1))
    b.append(text_outline("HERE", 474, 684, 19, w=1.6, spacing=1))

    # ---- popcorn containers on the counter
    _tub(b, 444, 556, 486, 42, 32, 4)
    _popcorn_pile(b, [(414, 462, 17), (444, 452, 19), (474, 464, 17), (444, 480, 15)])
    _tub(b, 538, 556, 502, 24, 19, 3)
    _popcorn_pile(b, [(524, 486, 13), (546, 480, 14)])

    # ---- the drink the character is holding
    _cup(b, 104, 462, 556, 32, 24, 20, straw=False)
    b.append(path("M 82,462 L 62,420", W_XBOLD))
    b.append(path("M 62,420 l -14,-7", W_XBOLD))

    # ---- character
    hx, hy, R = 250.0, 386.0, 76.0
    ears = [(172, 376, 30), (328, 376, 30)]
    b.append(path(bumpy_circle(hx, hy, R, ears, 260, 328, 212 + 360), W_XBOLD))
    for (ex, s) in ((172, 1), (328, -1)):
        b.append(ellipse(ex - s * 5, 376, 10, 14, W_MAIN))

    # body and apron
    b.append(path("M 181,418 C 172,446 162,480 156,516 C 152,538 158,556 172,556", W_XBOLD))
    b.append(path("M 319,418 C 328,446 338,480 344,516 C 348,538 342,556 328,556", W_XBOLD))
    b.append(path("M 214,472 C 214,462 230,456 250,456 C 270,456 286,462 286,472 "
                  "L 294,556 L 206,556 Z", W_XBOLD))
    b.append(path("M 216,468 C 210,462 204,458 196,455", W_MAIN))
    b.append(path("M 284,468 C 290,462 296,458 304,455", W_MAIN))
    b.append(rect(224, 508, 52, 34, 4, W_XBOLD))
    b.append(popcorn(236, 504, 12, 5, 0.2, W_MAIN))
    b.append(popcorn(262, 500, 13, 5, 0.9, W_MAIN))

    # arms
    b.append(path("M 176,435 C 156,422 132,422 122,433 C 114,443 119,458 134,464 "
                  "C 150,468 164,462 170,456 Z", W_XBOLD))
    for tx in (126, 136, 146):
        b.append(path(f"M {tx},454 L {tx-3},464", W_MAIN))
    b.append(path("M 324,435 C 344,422 368,422 378,433 C 386,443 381,458 366,464 "
                  "C 350,468 336,462 330,456 Z", W_XBOLD))
    for tx in (354, 364, 374):
        b.append(path(f"M {tx},454 L {tx+3},464", W_MAIN))

    # cap
    b.append(path("M 186,346 C 189,296 214,268 250,268 C 286,268 311,296 314,346", W_XBOLD))
    b.append(path("M 186,346 Q 250,364 314,346", W_XBOLD))
    b.append(path("M 208,280 C 202,306 200,332 201,350", W_MAIN))
    b.append(path("M 292,280 C 298,306 300,332 299,350", W_MAIN))
    b.append(circle(250, 268, 7, W_XBOLD))
    b.append(path("M 202,352 C 206,374 226,384 250,384 "
                  "C 274,384 294,374 298,352 Z", W_XBOLD))
    b.append(popcorn(250, 306, 15, 5, 0.3, W_MAIN))

    # face
    for (ex, s) in ((228, 1), (272, -1)):
        b.append(f'<ellipse cx="{ex}" cy="404" rx="13" ry="16" fill="{INK}"/>')
        b.append(f'<circle cx="{ex - s * 5:.0f}" cy="398" r="4.6" fill="#fff"/>')
    b.append(path("M 239,428 Q 250,422 261,428 Q 259,441 250,446 Q 241,441 239,428 Z", W_XBOLD))
    b.append(path("M 250,446 C 245,456 234,456 230,449", W_XBOLD))
    b.append(path("M 250,446 C 255,456 266,456 270,449", W_XBOLD))
    for i in range(3):
        b.append(path(f"M {194 + i*8},424 L {189 + i*8},436", W_MAIN))
        b.append(path(f"M {306 - i*8},424 L {311 - i*8},436", W_MAIN))

    # ---- the big bucket, standing in front of the counter
    b.append(rect(216, 596, 180, 26, 8, W_XBOLD))
    b.append(path("M 224,622 L 248,748 L 364,748 L 388,622", W_XBOLD))
    for i in range(1, 5):
        f = i / 5
        b.append(line(224 + 164 * f, 626, 248 + 116 * f, 745, W_MAIN))
    _popcorn_pile(b, [(240, 606, 21), (276, 596, 23), (312, 592, 24), (348, 596, 23),
                      (384, 606, 21), (258, 582, 17), (296, 578, 17), (334, 578, 17),
                      (370, 584, 17)])

    # ---- spilled popcorn on the floor
    _popcorn_pile(b, [(120, 736, 16), (446, 730, 15), (516, 752, 13)])

    return svg_page(b)
