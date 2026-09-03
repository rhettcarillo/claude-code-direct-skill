"""Pages 18-21: more packed, hand-inked kawaii scenes."""

import math
from draw import PAGE_W, PAGE_H, INK, bumpy_circle, svg_page
from ink import (WW, WD, WF, WHITE, PX0, PY0, PX1, PY1, _p, wpoly, wcirc,
                 wrect, wline, wtext, grp, kern, wheart, wstar, tubby,
                 fluffy, flower, jar)


def _panel():
    return [f'<rect x="0" y="0" width="{PAGE_W}" height="{PAGE_H}" fill="{WHITE}"/>']


def _frame(b):
    b.append(f'<rect x="0" y="0" width="{PAGE_W}" height="{PY0}" fill="{WHITE}"/>')
    b.append(f'<rect x="0" y="{PY1}" width="{PAGE_W}" height="{PAGE_H-PY1}" fill="{WHITE}"/>')
    b.append(f'<rect x="0" y="0" width="{PX0}" height="{PAGE_H}" fill="{WHITE}"/>')
    b.append(f'<rect x="{PX1}" y="0" width="{PAGE_W-PX1}" height="{PAGE_H}" fill="{WHITE}"/>')
    b.append(wrect(PX0, PY0, PX1 - PX0, PY1 - PY0, 20, 2.6, 120, 5.6))


def _dogface(b, cx, cy, s=1.0, seed=0.0):
    """Dot eyes, a small nose and a w-mouth, scaled about (cx, cy)."""
    for dx in (-19 * s, 19 * s):
        b.append(f'<ellipse cx="{cx+dx:.1f}" cy="{cy:.1f}" rx="{5.6*s:.1f}" '
                 f'ry="{7.2*s:.1f}" fill="{INK}"/>')
    b.append(_p(f"M {cx-7*s:.1f},{cy+19*s:.1f} Q {cx:.1f},{cy+15*s:.1f} {cx+7*s:.1f},{cy+19*s:.1f} "
                f"Q {cx+5*s:.1f},{cy+27*s:.1f} {cx:.1f},{cy+31*s:.1f} "
                f"Q {cx-5*s:.1f},{cy+27*s:.1f} {cx-7*s:.1f},{cy+19*s:.1f} Z", WD, INK))
    b.append(_p(f"M {cx:.1f},{cy+33*s:.1f} C {cx-4*s:.1f},{cy+41*s:.1f} "
                f"{cx-11*s:.1f},{cy+41*s:.1f} {cx-14*s:.1f},{cy+35*s:.1f}", WD))
    b.append(_p(f"M {cx:.1f},{cy+33*s:.1f} C {cx+4*s:.1f},{cy+41*s:.1f} "
                f"{cx+11*s:.1f},{cy+41*s:.1f} {cx+14*s:.1f},{cy+35*s:.1f}", WD))


# ------------------------------------------------------------ 18 blanket fort

def blanket_fort():
    b = _panel()

    for i, x in enumerate((172, 322, 452)):
        b.append(wline(x, PY0 + 8, x, 470, 2.4, 10 + i, WD))
    b.append(wline(PX0 + 6, 470, PX1 - 6, 464, 2.6, 20, WW))

    # shelf with books, cactus on top
    b.append(wpoly([(PX0 + 4, 432), (198, 426), (198, 452), (PX0 + 4, 458)],
                   True, 2.4, 25, WW, WHITE))
    for i, y in enumerate((470, 492, 514)):
        b.append(wrect(58 + i * 5, y, 118 - i * 8, 20, 4, 2.0, 26 + i, WD, WHITE))

    b.append(wpoly([(82, 372), (88, 428), (136, 428), (142, 372)], True, 2.4, 30, WW, WHITE))
    b.append(wline(80, 382, 144, 380, 2.0, 31, WD))
    for i in range(5):
        b.append(wline(86 + i * 13, 400, 92 + i * 13, 412, 1.6, 32 + i, WF))
    b.append(wpoly([(98, 374), (96, 306), (112, 292), (128, 306), (126, 374)],
                   True, 2.4, 38, WW, WHITE))
    b.append(wpoly([(98, 342), (76, 336), (68, 314), (78, 302), (92, 312), (98, 330)],
                   True, 2.2, 39, WW, WHITE))
    b.append(wpoly([(126, 356), (148, 350), (158, 330), (148, 318), (134, 328), (126, 344)],
                   True, 2.2, 40, WW, WHITE))
    for (x, y) in ((112, 314), (112, 340), (112, 364), (82, 318), (146, 334)):
        b.append(wline(x - 6, y, x + 6, y, 1.2, x, WF))
        b.append(wline(x, y - 6, x, y + 6, 1.2, y, WF))

    # tulips on a wall shelf above the tent
    b.append(wpoly([(188, 272), (310, 268), (310, 288), (188, 292)], True, 2.2, 44, WW, WHITE))
    b.append(wpoly([(216, 206), (222, 272), (278, 272), (284, 206)], True, 2.4, 45, WW, WHITE))
    for y in (222, 240, 258):
        b.append(wline(218, y, 282, y, 1.8, y, WD))
    for (x, ty) in ((230, 158), (250, 138), (272, 162)):
        b.append(wline(x, 206, x, ty + 20, 2.0, x, WD))
        b.append(wpoly([(x - 15, ty + 20), (x - 17, ty - 2), (x - 7, ty + 5), (x, ty - 11),
                        (x + 7, ty + 5), (x + 17, ty - 2), (x + 15, ty + 20)],
                       True, 2.0, x + 1, WW, WHITE))
    for (x, y, a) in ((214, 204, 1), (286, 200, -1)):
        b.append(wpoly([(x + a * 12, y), (x - a * 5, y - 40), (x + a * 7, y - 58),
                        (x + a * 19, y - 34), (x + a * 17, y - 8)],
                       True, 2.2, x, WW, WHITE))

    # hanging lamp
    b.append(wline(410, PY0 + 6, 410, 150, 2.0, 50, WD))
    b.append(_p("M 348,208 C 352,158 468,158 472,208 Z", WW, WHITE))
    b.append(wline(346, 208, 474, 206, 2.2, 51, WW))
    b.append(wrect(396, 142, 28, 12, 4, 1.8, 52, WD, WHITE))

    # flower-shaped picture frame
    b += flower(516, 176, 62, WW, WHITE, 8, -90)
    b.append(wcirc(516, 176, 34, 2.0, 55, WD, WHITE))
    b.append(fluffy(516, 174, 15, 19, 9, 7, WD, WHITE))
    for dx in (-7, 7):
        b.append(f'<circle cx="{516+dx}" cy="170" r="3.2" fill="{INK}"/>')
    b.append(f'<circle cx="516" cy="182" r="3.4" fill="{INK}"/>')

    # bed at the right
    b.append(wrect(462, 296, 112, 44, 8, 2.4, 60, WW, WHITE))
    b.append(wrect(468, 336, 106, 130, 8, 2.4, 61, WW, WHITE))
    for i in range(4):
        b.append(wline(470 + i * 27, 340, 470 + i * 27, 462, 1.6, 62 + i, WF))
    for i in range(3):
        b.append(wline(470, 366 + i * 32, 572, 364 + i * 32, 1.6, 70 + i, WF))
    b.append(wheart(500, 386, 15, WD, WHITE))
    b.append(wrect(474, 302, 74, 34, 10, 2.2, 76, WW, WHITE))
    b.append(wheart(120, 232, 13, WD, WHITE))
    b.append(wstar(392, 264, 13, 5.5, 5, 1.6, 77, WD, WHITE))

    # rug
    pts = []
    for i in range(26):
        a = 2 * math.pi * i / 26
        rr = 1.0 + (0.055 if i % 2 == 0 else 0.0)
        pts.append((306 + 238 * rr * math.cos(a), 648 + 58 * rr * math.sin(a)))
    b.append(wpoly(pts, True, 2.0, 80, WW, WHITE))
    b.append(wpoly([(x * 0.88 + 306 * 0.12, y * 0.86 + 648 * 0.14) for (x, y) in pts],
                   True, 1.8, 81, WD))

    # the blanket
    b.append(wpoly([(132, 592), (160, 490), (226, 380), (314, 300), (400, 380),
                    (466, 488), (496, 584), (440, 596), (368, 580), (296, 598),
                    (224, 582), (170, 600)], True, 2.6, 90, WW, WHITE))
    for (x, y, r) in ((172, 540, 16), (206, 462, 15), (192, 574, 14), (262, 398, 14),
                      (250, 500, 15), (314, 344, 15), (366, 400, 14), (400, 466, 15),
                      (438, 540, 16), (466, 576, 14), (244, 566, 13), (372, 552, 14),
                      (152, 578, 13), (410, 570, 13)):
        b += flower(x, y, r, WD, WHITE)

    # opening, then what is inside it
    b.append(_p("M 196,586 C 208,486 262,406 314,392 C 366,406 420,486 432,582 "
                "C 374,570 254,570 196,586 Z", WW, WHITE))
    b.append(wline(314, 402, 314, 578, 2.0, 95, WD))
    b.append(_p("M 208,452 C 260,486 356,484 406,446", WD))
    for i in range(6):
        t = (i + 0.5) / 6
        x = 208 + (406 - 208) * t
        y = 452 + 34 * math.sin(math.pi * t)
        b.append(wcirc(x, y + 12, 8, 1.4, 100 + i, WD, WHITE))
        b.append(wline(x, y, x, y + 5, 1.2, 110 + i, WF))

    b.append(wpoly([(336, 566), (342, 508), (396, 496), (426, 528), (420, 568)],
                   True, 2.2, 115, WW, WHITE))

    # poodle reading
    b.append(fluffy(238, 546, 34, 40, 17, 8, WW, WHITE))
    b.append(fluffy(200, 512, 14, 17, 11, 6, WW, WHITE))
    b.append(fluffy(278, 512, 14, 17, 11, 6, WW, WHITE))
    b.append(fluffy(239, 490, 26, 31, 14, 7, WW, WHITE))
    _dogface(b, 239, 488, 0.72)
    b.append(wpoly([(202, 566), (239, 552), (276, 566), (276, 538),
                    (239, 524), (202, 538)], True, 2.2, 120, WW, WHITE))
    b.append(wline(239, 524, 239, 552, 1.8, 121, WD))

    # chick on a cushion
    b.append(wpoly([(352, 592), (356, 570), (400, 562), (436, 572), (438, 592)],
                   True, 2.2, 125, WW, WHITE))
    b.append(wcirc(398, 558, 26, 2.2, 126, WW, WHITE))
    b.append(wcirc(366, 546, 19, 2.2, 127, WW, WHITE))
    b.append(wpoly([(350, 546), (338, 542), (350, 536)], True, 1.6, 128, WD, WHITE))
    b.append(f'<circle cx="360" cy="542" r="3" fill="{INK}"/>')
    b.append(_p("M 396,552 C 404,562 414,564 422,560", WD))

    _frame(b)
    return svg_page(b)


def _bunny(b, cx, cy, s=1.0, seed=0.0, ear_tilt=8.0):
    """Head with two upright ears, dot eyes and a small nose."""
    for sgn in (-1, 1):
        b.append(wpoly([(cx + sgn * (20 * s), cy - 34 * s),
                        (cx + sgn * (34 * s + ear_tilt), cy - 128 * s),
                        (cx + sgn * (14 * s + ear_tilt), cy - 146 * s),
                        (cx + sgn * (4 * s), cy - 60 * s)],
                       True, 2.2, seed + sgn, WW, WHITE))
        b.append(wpoly([(cx + sgn * (22 * s), cy - 52 * s),
                        (cx + sgn * (29 * s + ear_tilt * 0.7), cy - 120 * s),
                        (cx + sgn * (17 * s + ear_tilt * 0.7), cy - 130 * s),
                        (cx + sgn * (11 * s), cy - 66 * s)],
                       True, 1.8, seed + 2 + sgn, WD, WHITE))
    b.append(wcirc(cx, cy, 60 * s, 2.6, seed + 5, WW, WHITE, 20))
    for dx in (-25 * s, 25 * s):
        b.append(f'<ellipse cx="{cx+dx:.1f}" cy="{cy-4*s:.1f}" rx="{6*s:.1f}" '
                 f'ry="{7.5*s:.1f}" fill="{INK}"/>')
    b.append(_p(f"M {cx-8*s:.1f},{cy+14*s:.1f} L {cx+8*s:.1f},{cy+14*s:.1f} "
                f"L {cx:.1f},{cy+24*s:.1f} Z", WD, INK))
    b.append(_p(f"M {cx:.1f},{cy+24*s:.1f} C {cx-4*s:.1f},{cy+33*s:.1f} "
                f"{cx-12*s:.1f},{cy+33*s:.1f} {cx-15*s:.1f},{cy+27*s:.1f}", WD))
    b.append(_p(f"M {cx:.1f},{cy+24*s:.1f} C {cx+4*s:.1f},{cy+33*s:.1f} "
                f"{cx+12*s:.1f},{cy+33*s:.1f} {cx+15*s:.1f},{cy+27*s:.1f}", WD))


def _strawberry(b, cx, cy, r, seed=0.0, w=WW):
    b.append(wpoly([(cx, cy + r * 1.25), (cx - r, cy + r * 0.1), (cx - r * 0.8, cy - r * 0.6),
                    (cx, cy - r * 0.8), (cx + r * 0.8, cy - r * 0.6), (cx + r, cy + r * 0.1)],
                   True, 1.8, seed, w, WHITE))
    b.append(wpoly([(cx - r * 0.9, cy - r * 0.6), (cx - r * 0.3, cy - r * 0.45),
                    (cx, cy - r * 0.75), (cx + r * 0.3, cy - r * 0.45),
                    (cx + r * 0.9, cy - r * 0.6), (cx, cy - r * 0.25)],
                   True, 1.6, seed + 1, WD, WHITE))
    b.append(wline(cx, cy - r * 0.75, cx, cy - r * 1.15, 1.2, seed + 2, WD))
    for (dx, dy) in ((-0.4, 0.2), (0.35, 0.3), (0.0, 0.55), (-0.2, 0.8), (0.3, 0.75)):
        b.append(f'<circle cx="{cx+dx*r:.1f}" cy="{cy+dy*r:.1f}" r="{r*0.09:.1f}" fill="{INK}"/>')


# ---------------------------------------------------------------- 19 bakery

def bakery():
    b = _panel()

    for i, x in enumerate((150, 330, 486)):
        b.append(wline(x, PY0 + 8, x, 596, 2.4, 10 + i, WD))

    # shelf with jars, top left
    b.append(wpoly([(PX0 + 4, 252), (322, 244), (322, 268), (PX0 + 4, 276)],
                   True, 2.4, 20, WW, WHITE))
    jar(b, 118, 244, 152, 44, 21)
    b.append(fluffy(118, 200, 16, 20, 11, 7, WD, WHITE))
    for dx in (-7, 7):
        b.append(f'<circle cx="{118+dx}" cy="196" r="3" fill="{INK}"/>')
    b.append(_p("M 111,210 C 115,216 123,216 127,210", WF))
    jar(b, 246, 246, 140, 50, 24)
    for (x, y, r) in ((228, 208, 15), (262, 202, 16), (244, 178, 14),
                      (272, 232, 14), (222, 236, 13), (252, 232, 12)):
        b.append(wcirc(x, y, r, 1.6, x + y, WD, WHITE, 12))

    # bunting, top right
    b.append(_p("M 336,88 C 420,128 500,128 570,96", WW))
    for i in range(5):
        t = (i + 0.5) / 5
        x = 336 + (570 - 336) * t
        y = 88 + 40 * math.sin(math.pi * t) - 2
        b.append(wpoly([(x - 24, y), (x + 24, y), (x, y + 54)], True, 2.0, 30 + i, WW, WHITE))

    # counter
    b.append(wline(PX0 + 6, 616, PX1 - 6, 608, 2.6, 40, WW))

    # back-of-counter props
    b.append(wpoly([(508, 590), (504, 462), (514, 438), (546, 438), (558, 462), (554, 590)],
                   True, 2.4, 45, WW, WHITE))
    b.append(wrect(514, 414, 34, 26, 6, 2.0, 46, WW, WHITE))
    b.append(wrect(502, 486, 58, 54, 5, 2.0, 47, WD, WHITE))
    b.append(wtext("FLOUR", 531, 520, 15, 1.6, 1))

    # the two bakers
    _bunny(b, 176, 366, 1.0, 50, 10)
    b.append(wpoly([(110, 428), (124, 612), (250, 612), (244, 434), (200, 414), (146, 414)],
                   True, 2.6, 55, WW, WHITE))
    b.append(wpoly([(232, 440), (288, 476), (306, 508), (284, 522), (262, 494), (216, 468)],
                   True, 2.4, 56, WW, WHITE))
    b.append(wline(236, 456, 268, 482, 1.8, 57, WD))

    _bunny(b, 432, 360, 1.0, 60, -10)
    b.append(wpoly([(366, 422), (358, 612), (496, 612), (492, 428), (452, 408), (406, 410)],
                   True, 2.6, 65, WW, WHITE))
    b.append(wpoly([(372, 436), (334, 466), (316, 496), (338, 510), (356, 484), (394, 462)],
                   True, 2.4, 66, WW, WHITE))
    b.append(wline(372, 452, 346, 472, 1.8, 67, WD))

    # piping bag in the left baker's paw
    b.append(wpoly([(280, 494), (318, 516), (336, 556), (318, 566), (300, 534), (266, 514)],
                   True, 2.4, 70, WW, WHITE))
    b.append(wline(284, 506, 306, 528, 1.8, 71, WD))
    b.append(wpoly([(318, 562), (338, 578), (324, 588)], True, 1.8, 72, WD, WHITE))
    # a strawberry in the right baker's paw
    _strawberry(b, 330, 486, 22, 73)

    # the cake
    b.append(wpoly([(198, 664), (218, 682), (394, 682), (414, 664), (394, 650), (218, 650)],
                   True, 2.2, 80, WW, WHITE))
    b.append(wpoly([(226, 540), (226, 656), (386, 656), (386, 540)], True, 2.6, 81, WW, WHITE))
    for y in (580, 618):
        b.append(wline(228, y, 384, y, 2.0, y, WD))
    d = "M 226,544"
    for i in range(7):
        xa = 226 + 160 * i / 7
        xb = 226 + 160 * (i + 1) / 7
        d += f" Q {(xa+xb)/2:.1f},{570 if i % 2 == 0 else 564} {xb:.1f},544"
    b.append(_p(d, WD))
    _strawberry(b, 266, 512, 25, 85)
    b.append(wheart(306, 600, 16, WD, WHITE))

    # bowls and odds and ends on the counter
    b.append(wpoly([(466, 640), (474, 706), (562, 706), (570, 640)], True, 2.4, 90, WW, WHITE))
    b.append(wline(462, 644, 574, 640, 2.2, 91, WW))
    b.append(wline(516, 638, 552, 572, 2.4, 92, WW))
    b.append(wpoly([(542, 576), (562, 564), (570, 580), (550, 592)], True, 1.8, 93, WD, WHITE))
    jar(b, 96, 686, 620, 42, 95)
    for (x, y, r) in ((82, 656, 14), (110, 650, 15), (96, 682, 13)):
        b.append(wcirc(x, y, r, 1.6, x + y, WD, WHITE, 12))
    b.append(wpoly([(168, 656), (176, 710), (256, 710), (264, 656)], True, 2.2, 98, WW, WHITE))
    b.append(wline(164, 660, 268, 656, 2.0, 99, WW))
    for (x, y, r) in ((188, 646, 12), (212, 640, 13), (236, 646, 12)):
        b.append(wcirc(x, y, r, 1.4, x, WD, WHITE, 10))

    # carrot and cookies
    b.append(wpoly([(120, 716), (196, 726), (188, 744), (114, 732)], True, 2.0, 100, WW, WHITE))
    for i in range(3):
        b.append(wline(140 + i * 18, 720, 136 + i * 18, 738, 1.4, 100 + i, WF))
    b.append(wpoly([(120, 724), (96, 706), (108, 724), (82, 720), (100, 738), (116, 738)],
                   True, 1.8, 104, WD, WHITE))
    for (x, y) in ((316, 722), (356, 714)):
        b.append(wcirc(x, y, 19, 1.8, x, WW, WHITE, 14))
        for (ddx, ddy) in ((-6, -4), (5, 2), (-2, 7)):
            b.append(f'<circle cx="{x+ddx}" cy="{y+ddy}" r="2.8" fill="{INK}"/>')

    _frame(b)
    return svg_page(b)


def _catface(b, cx, cy, s=1.0, seed=0.0):
    for sgn in (-1, 1):
        b.append(wpoly([(cx + sgn * 22 * s, cy - 44 * s), (cx + sgn * 52 * s, cy - 84 * s),
                        (cx + sgn * 58 * s, cy - 34 * s)], True, 2.0, seed + sgn, WW, WHITE))
        b.append(wpoly([(cx + sgn * 30 * s, cy - 48 * s), (cx + sgn * 46 * s, cy - 72 * s),
                        (cx + sgn * 49 * s, cy - 44 * s)], True, 1.6, seed + 3 + sgn, WD, WHITE))
    b.append(wcirc(cx, cy, 56 * s, 2.6, seed + 6, WW, WHITE, 20))
    for dx in (-23 * s, 23 * s):
        b.append(f'<ellipse cx="{cx+dx:.1f}" cy="{cy-4*s:.1f}" rx="{6*s:.1f}" '
                 f'ry="{7.5*s:.1f}" fill="{INK}"/>')
    b.append(_p(f"M {cx-8*s:.1f},{cy+14*s:.1f} L {cx+8*s:.1f},{cy+14*s:.1f} "
                f"L {cx:.1f},{cy+23*s:.1f} Z", WD, INK))
    b.append(_p(f"M {cx:.1f},{cy+23*s:.1f} C {cx-4*s:.1f},{cy+32*s:.1f} "
                f"{cx-12*s:.1f},{cy+32*s:.1f} {cx-15*s:.1f},{cy+26*s:.1f}", WD))
    b.append(_p(f"M {cx:.1f},{cy+23*s:.1f} C {cx+4*s:.1f},{cy+32*s:.1f} "
                f"{cx+12*s:.1f},{cy+32*s:.1f} {cx+15*s:.1f},{cy+26*s:.1f}", WD))
    for sgn in (-1, 1):
        for k in range(2):
            b.append(wline(cx + sgn * 44 * s, cy + (2 + k * 14) * s,
                           cx + sgn * 78 * s, cy + (-4 + k * 20) * s, 1.4, seed + k, WF))


def _awning(b, x0, x1, ytop, ybot, n, seed):
    d = f"M {x0},{ytop} L {x1},{ytop} L {x1},{ybot - 16}"
    for i in range(n):
        xa = x1 - (x1 - x0) * i / n
        xb = x1 - (x1 - x0) * (i + 1) / n
        d += f" Q {(xa+xb)/2:.1f},{ybot} {xb:.1f},{ybot - 16}"
    d += f" L {x0},{ytop} Z"
    b.append(_p(d, WW, WHITE))
    for i in range(1, n):
        x = x0 + (x1 - x0) * i / n
        b.append(wline(x, ytop + 4, x, ybot - 16, 1.8, seed + i, WD))


def _scoop_cone(b, cx, base_y, top_y, half, seed, scoops=3):
    b.append(wpoly([(cx - half, top_y), (cx - half * 0.28, base_y - 22),
                    (cx, base_y), (cx + half * 0.28, base_y - 22), (cx + half, top_y)],
                   True, 2.4, seed, WW, WHITE))
    for i in range(4):
        f = (i + 1) / 5
        b.append(wline(cx - half + 2 * half * f, top_y + 6,
                       cx - half * 0.3 + 0.6 * half * f, base_y - 26, 1.6, seed + i, WF))
    for i in range(4):
        b.append(wline(cx - half * 0.9 + i * half * 0.45, top_y + 8,
                       cx - half * 0.55 + i * half * 0.3, base_y - 34, 1.6, seed + 9 + i, WF))
    y = top_y - 8
    for i in range(scoops):
        r = half * (0.88 - i * 0.07)
        y -= r * 0.74
        b.append(fluffy(cx + (10 if i == 1 else (-8 if i == 2 else 0)), y, r * 0.60,
                        r * 0.72, r * 0.35, 8, WW, WHITE, seed + i))
    return y


# ------------------------------------------------------- 20 ice cream parlor

def ice_cream():
    b = _panel()

    for i, x in enumerate((160, 330, 470)):
        b.append(wline(x, 122, x, 512, 2.4, 10 + i, WD))
    _awning(b, PX0 + 4, PX1 - 4, PY0 + 4, 120, 9, 14)

    b.append(wrect(178, 136, 254, 74, 12, 2.6, 20, WW, WHITE))
    b.append(wtext("ICE CREAM", 305, 186, 30, 2.2, 2))
    b.append(wheart(150, 172, 17, WW, WHITE))
    b.append(wstar(462, 168, 20, 9, 5, 1.8, 21, WW, WHITE))

    # menu board
    b.append(wrect(52, 228, 118, 150, 8, 2.4, 25, WW, WHITE))
    b.append(wtext("TODAY", 111, 258, 16, 1.6, 1))
    for i in range(4):
        b.append(wline(64, 282 + i * 22, 142, 280 + i * 22, 1.6, 26 + i, WD))
        b.append(wheart(154, 278 + i * 22, 7, WF, WHITE))

    # the scooper
    b.append(wpoly([(330, 366), (312, 512), (462, 512), (446, 362), (400, 344), (360, 346)],
                   True, 2.6, 30, WW, WHITE))
    _catface(b, 388, 300, 1.0, 31)
    b.append(wpoly([(442, 392), (472, 366), (492, 340), (472, 326), (450, 352), (424, 372)],
                   True, 2.4, 35, WW, WHITE))
    b.append(wline(480, 336, 500, 312, 2.4, 36, WW))
    b.append(fluffy(506, 302, 14, 17, 9, 7, WW, WHITE))
    b.append(wheart(524, 244, 15, WD, WHITE))

    # cone stack on the right
    b.append(wpoly([(500, 426), (516, 508), (562, 508), (578, 426)], True, 2.4, 40, WW, WHITE))
    for i, (dx, ty) in enumerate(((-16, 386), (12, 372), (-2, 350))):
        b.append(wpoly([(510 + dx, 420), (539 + dx, ty), (568 + dx, 420)],
                       True, 2.0, 41 + i, WW, WHITE))

    # counter and the display case on it
    b.append(wline(PX0 + 6, 512, PX1 - 6, 506, 2.6, 45, WW))
    b.append(wrect(52, 386, 212, 128, 8, 2.6, 46, WW, WHITE))
    b.append(wline(54, 420, 262, 416, 2.0, 47, WD))
    for i in range(4):
        x = 76 + i * 50
        b.append(wpoly([(x - 19, 436), (x - 15, 502), (x + 15, 502), (x + 19, 436)],
                       True, 2.0, 48 + i, WD, WHITE))
        b.append(fluffy(x, 436, 11, 14, 7, 7, WD, WHITE, i))
    b.append(wline(PX0 + 6, 540, PX1 - 6, 534, 2.4, 52, WD))
    for i in range(9):
        b.append(wline(70 + i * 58, 514, 66 + i * 58, 534, 1.6, 53 + i, WF))

    # the big cone in front
    _scoop_cone(b, 334, 730, 612, 58, 60, 3)

    # customer at the front right
    b.append(_p(f"M 434,{PY1} C 442,672 470,646 512,646 C 554,646 582,672 590,{PY1} Z",
                WW, WHITE))
    b.append(_p(bumpy_circle(512, 604, 58, [(476, 558, 22), (548, 558, 22)]), WW, WHITE))
    b.append(wcirc(476, 558, 11, 1.6, 70, WD))
    b.append(wcirc(548, 558, 11, 1.6, 71, WD))

    _frame(b)
    return svg_page(b)


# ---------------------------------------------------------- 21 boba tea bar

def boba_bar():
    b = _panel()

    for i, x in enumerate((186, 330, 456)):
        b.append(wline(x, 124, x, 506, 2.4, 10 + i, WD))
    _awning(b, PX0 + 4, PX1 - 4, PY0 + 4, 122, 8, 14)

    b.append(wrect(198, 138, 216, 76, 12, 2.6, 20, WW, WHITE))
    b.append(wtext("BOBA", 292, 192, 34, 2.4, 3))
    b.append(wpoly([(352, 166), (356, 200), (382, 200), (386, 166)], True, 1.8, 21, WD, WHITE))
    b.append(wline(348, 168, 390, 166, 1.6, 22, WD))
    b.append(wline(376, 166, 384, 146, 1.6, 23, WD))
    b.append(wheart(160, 172, 16, WW, WHITE))
    b.append(wstar(456, 178, 19, 8, 5, 1.8, 24, WW, WHITE))

    # shelf of toppings
    b.append(wpoly([(PX0 + 4, 262), (214, 254), (214, 278), (PX0 + 4, 286)],
                   True, 2.4, 30, WW, WHITE))
    for i, (x, hw) in enumerate(((90, 32), (166, 28))):
        jar(b, x, 256, 176, hw, 31 + i * 4)
        for k in range(5):
            a = 2 * math.pi * k / 5
            b.append(wcirc(x + hw * 0.42 * math.cos(a), 218 + 26 * math.sin(a),
                           9, 1.3, x + k, WD, WHITE, 10))

    # menu
    b.append(wrect(452, 244, 116, 148, 8, 2.4, 40, WW, WHITE))
    b.append(wtext("MENU", 510, 274, 17, 1.6, 1))
    for i in range(4):
        b.append(wline(464, 298 + i * 22, 528, 296 + i * 22, 1.6, 41 + i, WD))
        b.append(wheart(548, 294 + i * 22, 7, WF, WHITE))

    # the barista
    b.append(wpoly([(276, 386), (258, 506), (412, 506), (398, 382), (350, 364), (312, 366)],
                   True, 2.6, 50, WW, WHITE))
    _catface(b, 336, 320, 1.0, 51)
    b.append(wpoly([(392, 408), (426, 386), (448, 352), (426, 338), (404, 372), (376, 392)],
                   True, 2.4, 55, WW, WHITE))
    b.append(wpoly([(414, 340), (408, 292), (418, 274), (446, 274), (456, 292), (450, 340)],
                   True, 2.4, 56, WW, WHITE))
    b.append(wrect(410, 258, 46, 20, 6, 2.0, 57, WW, WHITE))
    for (x, y, r) in ((476, 268, 9), (492, 300, 7), (470, 320, 6)):
        b.append(wstar(x, y, r, r * 0.42, 4, 1.2, x, WD, WHITE))

    # counter
    b.append(wline(PX0 + 6, 506, PX1 - 6, 500, 2.6, 60, WW))
    b.append(wline(PX0 + 6, 538, PX1 - 6, 532, 2.4, 61, WD))
    for i in range(10):
        b.append(wline(66 + i * 52, 508, 62 + i * 52, 532, 1.6, 62 + i, WF))

    # the big boba cup
    b.append(wpoly([(212, 552), (238, 726), (352, 726), (378, 552)], True, 2.6, 70, WW, WHITE))
    b.append(wrect(202, 526, 188, 30, 10, 2.4, 71, WW, WHITE))
    b.append(_p("M 226,526 C 236,486 356,486 366,526 Z", WW, WHITE))
    b.append(wline(232, 610, 358, 610, 2.0, 72, WD))
    b.append(wtext("BOBA", 295, 660, 22, 2.0, 2))
    b.append(wpoly([(268, 498), (288, 494), (248, 374), (230, 380)], True, 1.8, 73, WW, WHITE))
    b.append(wpoly([(230, 380), (248, 374), (216, 342), (200, 352)], True, 1.6, 74, WW, WHITE))
    for (x, y) in ((252, 702), (282, 710), (314, 704), (344, 710),
                   (266, 682), (300, 686), (332, 682)):
        b.append(wcirc(x, y, 12, 1.4, x + y, WD, WHITE, 12))

    # customer at the front left
    b.append(_p(f"M 44,{PY1} C 50,676 78,650 118,650 C 158,650 186,676 192,{PY1} Z",
                WW, WHITE))
    b.append(fluffy(118, 606, 40, 48, 21, 8, WW, WHITE))
    b.append(wline(96, 664, 154, 662, 2.0, 80, WD))

    _frame(b)
    return svg_page(b)
