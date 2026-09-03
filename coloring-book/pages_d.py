"""Page 17: a kawaii popcorn counter."""

import math
from draw import PAGE_W, PAGE_H, INK, bumpy_circle, svg_page
from ink import (WW, WD, WF, WHITE, PX0, PY0, PX1, PY1, _p, wpoly, wcirc,
                 wrect, wline, wtext, grp, kern, wheart, wstar, tubby)

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
