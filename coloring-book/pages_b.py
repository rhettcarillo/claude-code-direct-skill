"""Pages 7-11: cat, bouquet, under the sea, rocket, bloom mandala."""

import math
from draw import *

CX = PAGE_W / 2


# ------------------------------------------------------------- 7 cat & yarn

def cat():
    b = []
    b += doodle_border("double", inset=26, w=W_MID)

    # tail, drawn first so the body sits over its root
    b.append(path(
        "M 428,566 C 496,560 540,510 532,450 "
        "C 524,400 486,374 454,388 C 436,396 430,412 436,424 "
        "C 444,414 458,410 470,416 C 492,426 500,450 496,474 "
        "C 490,510 460,532 420,538 Z", W_BOLD))
    for k in range(4):
        b.append(path(f"M {446 + k*20},{540 - k*36} q 18,-12 30,-30", W_FINE))

    # body
    b.append(path("M 212,326 C 186,378 168,462 172,536 "
                  "C 174,566 192,582 222,582 L 390,582 "
                  "C 420,582 438,566 440,536 C 444,462 426,378 400,326", W_BOLD))
    b.append(line(184, 582, PAGE_W - 60, 582, W_MAIN))
    b.append(line(60, 582, 184, 582, W_MAIN))

    # front paws
    for x in (250, 362):
        b.append(path(f"M {x-38},582 C {x-38},560 {x-22},548 {x},548 "
                      f"C {x+22},548 {x+38},560 {x+38},582 Z", W_MAIN))
        for t in (-13, 0, 13):
            b.append(path(f"M {x+t},582 L {x+t},564", W_FINE))

    # haunches and chest bib
    b.append(path("M 202,464 C 246,450 274,494 262,556", W_MAIN))
    b.append(path("M 410,464 C 366,450 338,494 350,556", W_MAIN))
    b.append(path("M 270,394 C 256,438 256,492 268,536", W_MAIN))
    b.append(path("M 342,394 C 356,438 356,492 344,536", W_MAIN))
    for k, y in enumerate((418, 452)):
        w_ = 30 - k * 5
        b.append(path(f"M {306-w_},{y} Q 306,{y+18} {306+w_},{y}", W_MID))

    # head
    b.append(path(
        "M 216,234 L 194,160 L 260,198 "
        "C 290,190 322,190 352,198 L 418,160 L 396,234 "
        "C 414,262 420,298 412,328 C 400,370 358,394 306,394 "
        "C 254,394 212,370 200,328 C 192,298 198,262 216,234 Z", W_BOLD))
    b.append(path("M 212,226 L 200,178 L 244,204 Z", W_MAIN))
    b.append(path("M 400,226 L 412,178 L 368,204 Z", W_MAIN))

    # face
    for s in (-1, 1):
        ex = 306 + s * 36
        b.append(path(f"M {ex-24},292 C {ex-14},272 {ex+14},272 {ex+24},292 "
                      f"C {ex+14},314 {ex-14},314 {ex-24},292 Z", W_MAIN))
        b.append(f'<circle cx="{ex}" cy="292" r="10" fill="{INK}"/>')
        b.append(f'<circle cx="{ex-4}" cy="288" r="3.4" fill="#fff"/>')
    b.append(path("M 292,326 L 320,326 L 306,342 Z", W_MAIN))
    b.append(path("M 306,342 L 306,352", W_MID))
    b.append(path("M 306,352 C 300,366 284,366 278,354", W_MID))
    b.append(path("M 306,352 C 312,366 328,366 334,354", W_MID))
    for s in (-1, 1):
        for k, dy in enumerate((-14, 0, 14)):
            b.append(path(f"M {306 + s*40},{330 + dy} C {306 + s*90},{326 + dy*1.5} "
                          f"{306 + s*130},{330 + dy*1.9} {306 + s*162},{336 + dy*2.2}", W_FINE))

    # ball of yarn
    yx, yy, yr = 132, 646, 48
    b.append(circle(yx, yy, yr, W_BOLD))
    for (rx, ry, rot) in ((46, 20, -28), (44, 22, 26), (40, 15, 70), (30, 44, 8)):
        b.append(group([f'<ellipse cx="0" cy="0" rx="{rx}" ry="{ry}" {stroke_attrs(W_MID)}/>'],
                       f"translate({yx},{yy}) rotate({rot})"))
    b.append(path("M 178,628 C 226,608 262,610 292,626 C 322,642 348,634 358,612", W_MAIN))
    b.append(path("M 358,612 C 366,596 356,586 346,592", W_MAIN))

    b.append(caption("YARN DAY", 726))
    return svg_page(b)


# --------------------------------------------------------------- 8 bouquet

def bouquet():
    b = []
    b += doodle_border("scallop", inset=30, w=W_MID)

    blooms = [(200, 302, 48), (306, 236, 56), (414, 306, 46)]
    tulips = [(246, 396, -8), (372, 398, 8)]
    buds = [(160, 396), (452, 392)]
    hub = (306, 546)

    # stems
    for (x, y, r) in blooms:
        b.append(path(f"M {hub[0] + (x-306)*0.16:.0f},{hub[1]:.0f} "
                      f"C {x*0.45 + 306*0.55:.0f},{(y+hub[1])/2:.0f} "
                      f"{x:.0f},{(y+hub[1])/2:.0f} {x:.0f},{y + r*0.9:.0f}", W_MAIN))
    for (x, y, _t) in tulips:
        b.append(path(f"M {hub[0] + (x-306)*0.2:.0f},{hub[1]:.0f} "
                      f"C {(x+306)/2:.0f},{(y+hub[1])/2:.0f} {x:.0f},{(y+hub[1])/2:.0f} "
                      f"{x:.0f},{y + 44:.0f}", W_MAIN))
    for (x, y) in buds:
        b.append(path(f"M {hub[0] + (x-306)*0.24:.0f},{hub[1]:.0f} "
                      f"C {(x+306)/2:.0f},{(y+hub[1])/2:.0f} {x:.0f},{(y+hub[1])/2:.0f} "
                      f"{x:.0f},{y + 26:.0f}", W_MAIN))

    # leaves along the stems
    for (x, y, a) in ((266, 476, 208), (346, 470, -28), (232, 508, 200),
                      (386, 512, -20), (300, 452, 250), (318, 500, -60)):
        b += leaf(x, y, 58, 20, a, W_MID)

    # daisies
    for i, (x, y, r) in enumerate(blooms):
        n = (10, 12, 10)[i]
        b += ring_of(n, lambda k, a, X=x, Y=y, R=r: petal(X, Y, R * 0.34, R, R * 0.32, W_MAIN, a))
        b += ring_of(n, lambda k, a, X=x, Y=y, R=r: petal(X, Y, R * 0.36, R * 0.72, R * 0.16, W_FINE, a))
        b.append(circle(x, y, r * 0.32, W_MAIN))
        b += ring_of(8, lambda k, a, X=x, Y=y, R=r: circle(
            X + R * 0.18 * math.cos(math.radians(a)), Y + R * 0.18 * math.sin(math.radians(a)), R * 0.06, W_FINE))

    # tulips
    for (x, y, tilt) in tulips:
        g = [path("M -40,8 C -46,-24 -34,-46 -22,-54 L -13,-26 L 0,-58 "
                  "L 13,-26 L 22,-54 C 34,-46 46,-24 40,8 "
                  "C 28,30 -28,30 -40,8 Z", W_MAIN),
             path("M -13,-26 C -19,4 -19,18 -14,26", W_MID),
             path("M 13,-26 C 19,4 19,18 14,26", W_MID),
             path("M 0,-58 L 0,28", W_FINE)]
        b.append(group(g, f"translate({x},{y}) rotate({tilt})"))

    # buds
    for (x, y) in buds:
        b.append(path(f"M {x},{y-34} C {x+22},{y-24} {x+22},{y+8} {x},{y+22} "
                      f"C {x-22},{y+8} {x-22},{y-24} {x},{y-34} Z", W_MAIN))
        b.append(path(f"M {x},{y-30} L {x},{y+18}", W_FINE))
        b += leaf(x, y + 22, 30, 11, 250, W_FINE)

    # vase
    b.append(path("M 208,536 L 404,536 L 394,564 C 400,630 384,696 360,724 "
                  "L 252,724 C 228,696 212,630 218,564 Z", W_BOLD))
    b.append(line(218, 564, 394, 564, W_MAIN))
    for k in range(7):
        x = 232 + k * 24
        b.append(path(f"M {x},596 L {x+13},618 L {x},640", W_MID))
    b.append(path("M 224,662 C 268,676 344,676 388,662", W_MID))
    for k in range(6):
        x = 240 + k * 26
        b.append(circle(x, 694, 9, W_MID))

    b.append(caption("FRESH PICKED", 758, 14))
    return svg_page(b)


# ---------------------------------------------------------- 9 under the sea

def under_the_sea():
    b = []
    b += doodle_border("double", inset=26, w=W_MID)

    # seaweed behind everything
    for (x, top, amp) in ((72, 380, 22), (108, 452, 16), (540, 366, 24), (504, 460, 15)):
        pts = [(x + amp * math.sin(i * 0.9), 716 - i * (716 - top) / 7) for i in range(8)]
        b.append(path(smooth_open(pts), W_MAIN))
        for i in range(1, 7):
            px, py = pts[i]
            b += leaf(px, py, 30, 11, 200 if i % 2 else -20, W_MID)

    # fish
    fx, fy, frx, fry = 309.0, 340.0, 177.0, 104.0
    back = ((132, 340), (164, 258), (250, 222), (340, 236))
    belly = ((340, 444), (250, 458), (164, 422), (132, 340))

    def bp(seg, t):
        (x0, y0), (x1, y1), (x2, y2), (x3, y3) = seg
        u = 1 - t
        a, bb, c, d = u**3, 3*u*u*t, 3*u*t*t, t**3
        return (a*x0 + bb*x1 + c*x2 + d*x3, a*y0 + bb*y1 + c*y2 + d*y3)

    b.append(path("M 132,340 C 164,258 250,222 340,236 "
                  "C 424,250 470,296 486,340 "
                  "C 470,384 424,430 340,444 C 250,458 164,422 132,340 Z", W_BOLD))

    # caudal fin, opening exactly where the body outline reaches the peduncle
    tu = bp(back, 0.05)
    tl = bp(belly, 0.95)
    b.append(path(f"M {tu[0]:.0f},{tu[1]:.0f} C 118,262 78,210 44,202 "
                  f"C 46,248 58,300 86,340 "
                  f"C 58,380 46,432 44,478 "
                  f"C 78,470 118,418 {tl[0]:.0f},{tl[1]:.0f}", W_BOLD))
    b.append(path("M 130,330 C 110,296 84,262 58,230", W_MID))
    b.append(path("M 128,336 C 112,318 96,308 80,300", W_FINE))
    b.append(path("M 130,350 C 110,384 84,418 58,450", W_MID))
    b.append(path("M 128,344 C 112,362 96,372 80,380", W_FINE))

    # dorsal fin
    d0, d1 = bp(back, 0.22), bp(back, 0.68)
    b.append(path(f"M {d0[0]:.0f},{d0[1]:.0f} C 146,246 166,186 206,158 "
                  f"C 240,178 256,206 {d1[0]:.0f},{d1[1]:.0f}", W_MAIN))
    b.append(path("M 186,196 C 184,228 186,254 190,274", W_FINE))
    b.append(path("M 210,172 C 212,204 216,228 222,248", W_FINE))
    b.append(path("M 232,182 C 238,200 244,214 250,226", W_FINE))

    # ventral fin
    v0, v1 = bp(belly, 0.22), bp(belly, 0.62)
    b.append(path(f"M {v0[0]:.0f},{v0[1]:.0f} C 290,486 258,518 222,530 "
                  f"C 194,504 182,458 {v1[0]:.0f},{v1[1]:.0f}", W_MAIN))
    b.append(path("M 258,450 C 262,482 254,508 240,524", W_FINE))
    b.append(path("M 224,436 C 222,466 218,492 216,514", W_FINE))

    # pectoral fin, gill, eye, mouth
    b.append(path("M 366,356 C 398,382 406,420 392,446 "
                  "C 362,428 348,392 352,360 Z", W_MAIN))
    b.append(path("M 364,378 C 380,400 388,422 388,440", W_FINE))
    b.append(path("M 356,378 C 368,404 376,428 378,444", W_FINE))
    b.append(path("M 398,258 C 384,300 384,382 398,424", W_MAIN))
    b += eye(436, 306, 21, (0.4, 0), W_MAIN)
    b.append(path("M 414,278 Q 438,266 460,278", W_MID))
    b.append(path("M 466,344 C 478,350 483,360 483,370", W_MAIN))

    # scales
    for row in range(8):
        y = 262 + row * 23
        for i in range(10):
            x = 150 + (row % 2) * 16 + i * 32
            if x > 330:
                continue
            if ((x - fx) / (frx - 24)) ** 2 + ((y - fy) / (fry - 16)) ** 2 > 1.0:
                continue
            if ((x + 32 - fx) / (frx - 24)) ** 2 + ((y - fy) / (fry - 16)) ** 2 > 1.0:
                continue
            b.append(path(f"M {x},{y} q 16,17 32,0", W_MID))

    # coral and starfish on the floor
    b.append(wave_row(40, PAGE_W - 40, 706, 8, 150, W_BOLD))
    b.append(path("M 468,704 C 470,660 456,632 438,616 M 468,704 C 470,664 490,640 512,628 "
                  "M 468,676 C 466,652 452,640 436,634", W_MAIN))
    for (x, y) in ((438, 610), (514, 622), (432, 628)):
        b.append(circle(x, y, 9, W_MID))
    b.append(path("M 150,706 C 152,662 138,636 120,620 M 150,706 C 152,668 172,646 194,636 "
                  "M 150,682 C 148,660 136,648 122,644", W_MAIN))
    b.append(star(306, 656, 46, 19, 5, W_BOLD))
    b += dots([(306, 646), (292, 662), (320, 662), (300, 676), (314, 676)], 3.6)

    for (x, y, r) in ((196, 200, 15), (238, 156, 10), (500, 210, 13), (462, 162, 9),
                      (556, 300, 11), (60, 190, 12), (150, 520, 10), (470, 520, 13),
                      (392, 556, 9), (220, 566, 11)):
        b.append(circle(x, y, r, W_MID))
        b.append(arc(x, y, r * 0.55, 190, 250, W_FINE))
    for (x, y, s) in ((166, 604, 1.0), (452, 588, -1.0)):
        b.append(path(f"M {x},{y} q {22*s},-16 {44*s},0 q {-22*s},16 {-44*s},0 Z", W_MAIN))
        b.append(path(f"M {x},{y} l {-11*s},-10 l 0,20 Z", W_MAIN))
        b.append(circle(x + 30 * s, y - 3, 3.6, W_FINE))

    b.append(caption("DEEP DOWN", 752, 14))
    return svg_page(b)


# ---------------------------------------------------------------- 10 rocket

def rocket():
    b = []
    b += doodle_border("dots", inset=26, w=W_MID)

    # ringed planet
    b.append(path("M 96,480 C 150,452 190,438 232,430", W_MID, dash="11 9"))
    b.append(circle(482, 172, 56, W_BOLD))
    b.append(group([f'<ellipse cx="0" cy="0" rx="94" ry="26" {stroke_attrs(W_MAIN)}/>'],
                   "translate(482,172) rotate(-18)"))
    for (x, y, r) in ((462, 152, 13), (500, 190, 10), (470, 200, 8)):
        b.append(circle(x, y, r, W_MID))

    # cratered moon
    b.append(circle(118, 626, 66, W_BOLD))
    for (x, y, r) in ((100, 600, 15), (140, 634, 11), (96, 654, 9), (140, 596, 7)):
        b.append(circle(x, y, r, W_MID))

    for (x, y, r) in ((92, 172, 16), (196, 118, 11), (72, 300, 12), (534, 372, 14),
                      (452, 470, 10), (176, 250, 8), (556, 258, 9), (528, 596, 13)):
        b.append(star(x, y, r, r * 0.42, 5, W_MID))
    for (x, y, r) in ((140, 204, 9), (250, 160, 7), (508, 300, 10), (86, 400, 8), (476, 560, 8)):
        b.append(sparkle(x, y, r, W_FINE))

    # rocket
    b.append(path("M 306,132 C 344,178 368,246 372,322 L 372,468 L 240,468 L 240,322 "
                  "C 244,246 268,178 306,132 Z", W_BOLD))
    b.append(path("M 250,262 C 272,246 340,246 362,262", W_MAIN))
    b.append(circle(306, 336, 48, W_BOLD))
    b.append(circle(306, 336, 36, W_MAIN))
    b += ring_of(8, lambda i, a: circle(306 + 42 * math.cos(math.radians(a)),
                                        336 + 42 * math.sin(math.radians(a)), 3.6, W_FINE))
    b.append(path("M 286,320 C 292,308 308,304 320,310", W_FINE))
    b.append(line(240, 412, 372, 412, W_MAIN))
    for k in range(4):
        x = 258 + k * 32
        b.append(circle(x, 440, 10, W_MID))

    # fins
    b.append(path("M 240,368 C 206,398 186,444 186,496 L 240,468 Z", W_BOLD))
    b.append(path("M 372,368 C 406,398 426,444 426,496 L 372,468 Z", W_BOLD))
    b.append(path("M 232,406 C 212,428 202,458 200,484", W_FINE))
    b.append(path("M 380,406 C 400,428 410,458 412,484", W_FINE))

    # nozzle and flame
    b.append(path("M 252,468 L 360,468 L 378,512 L 234,512 Z", W_BOLD))
    b.append(line(252, 490, 360, 490, W_MID))
    b.append(path("M 244,514 C 220,572 234,634 306,690 "
                  "C 378,634 392,572 368,514 Z", W_BOLD))
    b.append(path("M 272,516 C 256,566 268,614 306,652 "
                  "C 344,614 356,566 340,516 Z", W_MAIN))
    b.append(path("M 292,518 C 286,558 294,590 306,614 "
                  "C 318,590 326,558 320,518 Z", W_MID))

    b.append(caption("TO THE MOON", 748, 14))
    return svg_page(b)


# -------------------------------------------------------- 11 bloom mandala

def mandala_bloom():
    b = []
    b += doodle_border("scallop", inset=30, w=W_MID)
    cx, cy = CX, 374

    b.append(circle(cx, cy, 252, W_MAIN))
    b += ring_of(24, lambda i, a: leaf(cx + 214 * math.cos(math.radians(a - 90)),
                                       cy + 214 * math.sin(math.radians(a - 90)),
                                       36, 13, a - 90, W_MID)[0])
    b.append(circle(cx, cy, 212, W_MAIN))
    b.append(circle(cx, cy, 204, W_FINE))

    b += ring_of(12, lambda i, a: heart(cx + 178 * math.cos(math.radians(a - 90)),
                                        cy + 178 * math.sin(math.radians(a - 90)), 19, W_MAIN))
    b += ring_of(12, lambda i, a: petal(cx, cy, 148, 194, 15, W_MID, a + 15))
    b.append(circle(cx, cy, 146, W_MAIN))

    b += scallop_ring(cx, cy, 146, 24, 14, W_MID, outward=False)
    b.append(circle(cx, cy, 118, W_MAIN))

    b += ring_of(12, lambda i, a: petal(cx, cy, 48, 114, 30, W_MAIN, a))
    b += ring_of(12, lambda i, a: petal(cx, cy, 56, 92, 13, W_FINE, a))
    b += ring_of(12, lambda i, a: circle(cx + 100 * math.cos(math.radians(a - 90 + 15)),
                                         cy + 100 * math.sin(math.radians(a - 90 + 15)), 8, W_MID))

    b.append(circle(cx, cy, 46, W_MAIN))
    b += ring_of(6, lambda i, a: petal(cx, cy, 10, 42, 15, W_MID, a))
    b += ring_of(6, lambda i, a: petal(cx, cy, 16, 30, 8, W_FINE, a + 30))
    b.append(circle(cx, cy, 10, W_MID))

    b.append(caption("BLOOM MANDALA", 690, 14))
    return svg_page(b)
