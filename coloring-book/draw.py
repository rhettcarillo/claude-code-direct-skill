"""Drawing primitives for coloring-book line art.

Everything is unfilled black outline on white, sized for US Letter at 72dpi
(612 x 792 pt). Strokes are round-capped and thick enough to hold a crayon
line without closing up small regions.
"""

import math

# ---------------------------------------------------------------- page setup

PAGE_W, PAGE_H = 612.0, 792.0
MARGIN = 48.0

INK = "#111111"

W_BOLD = 4.2   # outer silhouettes
W_MAIN = 3.2   # main shapes
W_MID = 2.3    # interior structure
W_FINE = 1.5   # texture, hatching, tiny detail


# ------------------------------------------------------------- svg emitters

def stroke_attrs(w, dash=None, cap="round", join="round"):
    a = (f'fill="none" stroke="{INK}" stroke-width="{w:.2f}" '
         f'stroke-linecap="{cap}" stroke-linejoin="{join}"')
    if dash:
        a += f' stroke-dasharray="{dash}"'
    return a


def path(d, w=W_MAIN, dash=None, cap="round", join="round"):
    return f'<path d="{d}" {stroke_attrs(w, dash, cap, join)}/>'


def circle(cx, cy, r, w=W_MAIN, dash=None):
    return f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" {stroke_attrs(w, dash)}/>'


def ellipse(cx, cy, rx, ry, w=W_MAIN, dash=None):
    return (f'<ellipse cx="{cx:.2f}" cy="{cy:.2f}" rx="{rx:.2f}" ry="{ry:.2f}" '
            f'{stroke_attrs(w, dash)}/>')


def line(x1, y1, x2, y2, w=W_MAIN, dash=None):
    return (f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" '
            f'{stroke_attrs(w, dash)}/>')


def polyline(pts, w=W_MAIN, close=False, dash=None):
    d = "M " + " L ".join(f"{x:.2f},{y:.2f}" for x, y in pts)
    if close:
        d += " Z"
    return path(d, w, dash)


def rect(x, y, w_, h_, r=0, w=W_MAIN):
    return (f'<rect x="{x:.2f}" y="{y:.2f}" width="{w_:.2f}" height="{h_:.2f}" '
            f'rx="{r:.2f}" ry="{r:.2f}" {stroke_attrs(w)}/>')


def group(body, transform=None, opacity=None):
    t = f' transform="{transform}"' if transform else ""
    o = f' opacity="{opacity}"' if opacity else ""
    return f'<g{t}{o}>' + "".join(body) + '</g>'


def mirror_x(body, axis):
    """Reflect a group across the vertical line x = axis."""
    return group(body, f"translate({axis*2:.2f},0) scale(-1,1)")


def rotate_about(body, deg, cx, cy):
    return group(body, f"rotate({deg:.3f},{cx:.2f},{cy:.2f})")


def text_outline(s, x, y, size, weight="bold", w=2.2, family="DejaVu Sans",
                 anchor="middle", spacing=0):
    return (f'<text x="{x:.2f}" y="{y:.2f}" font-family="{family}" '
            f'font-size="{size:.2f}" font-weight="{weight}" text-anchor="{anchor}" '
            f'letter-spacing="{spacing}" {stroke_attrs(w, join="round")}>{s}</text>')


# ------------------------------------------------------------ curve helpers

def bez(pts):
    """Cubic path from a flat list of (x,y): start, then triples of c1,c2,end."""
    d = f"M {pts[0][0]:.2f},{pts[0][1]:.2f}"
    i = 1
    while i + 2 < len(pts) + 1 and i + 2 <= len(pts) - 1 + 1:
        if i + 2 >= len(pts) + 1:
            break
        c1, c2, e = pts[i], pts[i + 1], pts[i + 2]
        d += f" C {c1[0]:.2f},{c1[1]:.2f} {c2[0]:.2f},{c2[1]:.2f} {e[0]:.2f},{e[1]:.2f}"
        i += 3
    return d


def smooth_closed(pts, tension=0.34):
    """Catmull-Rom through pts, emitted as a closed cubic bezier path."""
    n = len(pts)
    d = f"M {pts[0][0]:.2f},{pts[0][1]:.2f}"
    for i in range(n):
        p0 = pts[(i - 1) % n]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) * tension, p1[1] + (p2[1] - p0[1]) * tension)
        c2 = (p2[0] - (p3[0] - p1[0]) * tension, p2[1] - (p3[1] - p1[1]) * tension)
        d += f" C {c1[0]:.2f},{c1[1]:.2f} {c2[0]:.2f},{c2[1]:.2f} {p2[0]:.2f},{p2[1]:.2f}"
    return d + " Z"


def smooth_open(pts, tension=0.3):
    """Catmull-Rom through pts as an open cubic bezier path."""
    n = len(pts)
    if n < 3:
        return "M " + " L ".join(f"{x:.2f},{y:.2f}" for x, y in pts)
    d = f"M {pts[0][0]:.2f},{pts[0][1]:.2f}"
    for i in range(n - 1):
        p0 = pts[max(i - 1, 0)]
        p1 = pts[i]
        p2 = pts[i + 1]
        p3 = pts[min(i + 2, n - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) * tension, p1[1] + (p2[1] - p0[1]) * tension)
        c2 = (p2[0] - (p3[0] - p1[0]) * tension, p2[1] - (p3[1] - p1[1]) * tension)
        d += f" C {c1[0]:.2f},{c1[1]:.2f} {c2[0]:.2f},{c2[1]:.2f} {p2[0]:.2f},{p2[1]:.2f}"
    return d


def blob(cx, cy, r, wobble, n=12, seedfn=None, squash=1.0):
    """A closed organic shape: radius r perturbed by wobble(i) in [-1,1]."""
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n - math.pi / 2
        rr = r * (1 + wobble(i))
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a) * squash))
    return smooth_closed(pts)


def arc(cx, cy, r, a0, a1, w=W_MAIN, large=None, sweep=1):
    """Circular arc between two angles in degrees."""
    x0 = cx + r * math.cos(math.radians(a0))
    y0 = cy + r * math.sin(math.radians(a0))
    x1 = cx + r * math.cos(math.radians(a1))
    y1 = cy + r * math.sin(math.radians(a1))
    if large is None:
        large = 1 if abs(a1 - a0) % 360 > 180 else 0
    return path(f"M {x0:.2f},{y0:.2f} A {r:.2f},{r:.2f} 0 {large} {sweep} {x1:.2f},{y1:.2f}", w)


def scallop_ring(cx, cy, r, n, depth, w=W_MID, phase=0.0, outward=True):
    """A ring of n arcs bulging in or out — the classic mandala edge."""
    out = []
    for i in range(n):
        a0 = 2 * math.pi * (i / n) + phase
        a1 = 2 * math.pi * ((i + 1) / n) + phase
        x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
        x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
        am = (a0 + a1) / 2
        rm = r + depth if outward else r - depth
        xm, ym = cx + rm * math.cos(am), cy + rm * math.sin(am)
        # quadratic control that passes through the midpoint
        qx, qy = 2 * xm - (x0 + x1) / 2, 2 * ym - (y0 + y1) / 2
        out.append(path(f"M {x0:.2f},{y0:.2f} Q {qx:.2f},{qy:.2f} {x1:.2f},{y1:.2f}", w))
    return out


def petal(cx, cy, r_in, r_out, width, w=W_MAIN, angle=0.0):
    """A teardrop petal pointing at `angle` degrees from the center."""
    a = math.radians(angle - 90)
    ux, uy = math.cos(a), math.sin(a)
    px, py = -uy, ux
    def pt(along, across):
        return (cx + ux * along + px * across, cy + uy * along + py * across)
    p0 = pt(r_in, 0)
    p1 = pt(r_out, 0)
    c1 = pt(r_in + (r_out - r_in) * 0.15, width)
    c2 = pt(r_out - (r_out - r_in) * 0.22, width * 0.72)
    c3 = pt(r_out - (r_out - r_in) * 0.22, -width * 0.72)
    c4 = pt(r_in + (r_out - r_in) * 0.15, -width)
    return path(
        f"M {p0[0]:.2f},{p0[1]:.2f} C {c1[0]:.2f},{c1[1]:.2f} {c2[0]:.2f},{c2[1]:.2f} "
        f"{p1[0]:.2f},{p1[1]:.2f} C {c3[0]:.2f},{c3[1]:.2f} {c4[0]:.2f},{c4[1]:.2f} "
        f"{p0[0]:.2f},{p0[1]:.2f} Z", w)


def ring_of(n, fn, phase=0.0):
    """Call fn(index, angle_degrees) n times evenly around a circle."""
    return [fn(i, 360.0 * i / n + phase) for i in range(n)]


def star(cx, cy, r_out, r_in, points=5, w=W_MAIN, phase=-90):
    pts = []
    for i in range(points * 2):
        r = r_out if i % 2 == 0 else r_in
        a = math.radians(phase + 180.0 * i / points)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return polyline(pts, w, close=True)


def sparkle(cx, cy, r, w=W_MID):
    """A four-point twinkle."""
    k = r * 0.24
    return path(
        f"M {cx:.2f},{cy-r:.2f} Q {cx+k:.2f},{cy-k:.2f} {cx+r:.2f},{cy:.2f} "
        f"Q {cx+k:.2f},{cy+k:.2f} {cx:.2f},{cy+r:.2f} "
        f"Q {cx-k:.2f},{cy+k:.2f} {cx-r:.2f},{cy:.2f} "
        f"Q {cx-k:.2f},{cy-k:.2f} {cx:.2f},{cy-r:.2f} Z", w)


def heart(cx, cy, r, w=W_MID):
    return path(
        f"M {cx:.2f},{cy+r*0.85:.2f} "
        f"C {cx-r*1.35:.2f},{cy-r*0.15:.2f} {cx-r*0.72:.2f},{cy-r*1.15:.2f} {cx:.2f},{cy-r*0.42:.2f} "
        f"C {cx+r*0.72:.2f},{cy-r*1.15:.2f} {cx+r*1.35:.2f},{cy-r*0.15:.2f} {cx:.2f},{cy+r*0.85:.2f} Z", w)


def leaf(x, y, length, width, angle, w=W_MID, vein=True):
    """A pointed leaf growing from (x,y) toward `angle` degrees."""
    a = math.radians(angle)
    ux, uy = math.cos(a), math.sin(a)
    px, py = -uy, ux
    tipx, tipy = x + ux * length, y + uy * length
    out = [path(
        f"M {x:.2f},{y:.2f} "
        f"C {x+ux*length*0.2+px*width:.2f},{y+uy*length*0.2+py*width:.2f} "
        f"{x+ux*length*0.72+px*width*0.82:.2f},{y+uy*length*0.72+py*width*0.82:.2f} "
        f"{tipx:.2f},{tipy:.2f} "
        f"C {x+ux*length*0.72-px*width*0.82:.2f},{y+uy*length*0.72-py*width*0.82:.2f} "
        f"{x+ux*length*0.2-px*width:.2f},{y+uy*length*0.2-py*width:.2f} "
        f"{x:.2f},{y:.2f} Z", w)]
    if vein:
        out.append(path(f"M {x:.2f},{y:.2f} L {tipx:.2f},{tipy:.2f}", W_FINE))
    return out


def eye(cx, cy, r, look=(0.0, 0.0), w=W_MAIN, lid=False):
    """A friendly eye: outer ring, pupil, highlight."""
    out = [circle(cx, cy, r, w)]
    px, py = cx + look[0] * r * 0.3, cy + look[1] * r * 0.3
    out.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="{r*0.46:.2f}" fill="{INK}"/>')
    out.append(f'<circle cx="{px-r*0.17:.2f}" cy="{py-r*0.19:.2f}" r="{r*0.15:.2f}" fill="#fff"/>')
    if lid:
        out.append(arc(cx, cy, r * 0.99, 190, 350, W_MID))
    return out


# ----------------------------------------------------------------- textures

def hatch_fan(cx, cy, r0, r1, n, spread, angle, w=W_FINE):
    """Short radiating strokes — fur, grass, light rays."""
    out = []
    for i in range(n):
        a = math.radians(angle - spread / 2 + spread * (i / max(n - 1, 1)))
        out.append(line(cx + r0 * math.cos(a), cy + r0 * math.sin(a),
                        cx + r1 * math.cos(a), cy + r1 * math.sin(a), w))
    return out


def dots(pts, r, fill=True):
    if fill:
        return [f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r:.2f}" fill="{INK}"/>' for x, y in pts]
    return [circle(x, y, r, W_FINE) for x, y in pts]


def wave_row(x0, x1, y, amp, wl, w=W_MID, phase=0.0):
    """A horizontal wavy line."""
    pts = []
    x = x0
    steps = max(int((x1 - x0) / 6), 8)
    for i in range(steps + 1):
        xx = x0 + (x1 - x0) * i / steps
        pts.append((xx, y + amp * math.sin(2 * math.pi * (xx - x0) / wl + phase)))
    return path(smooth_open(pts), w)


# ------------------------------------------------------------------ borders

def doodle_border(motif="dots", inset=26, w=W_MID):
    """A decorative frame just inside the page edge."""
    x0, y0 = inset, inset
    x1, y1 = PAGE_W - inset, PAGE_H - inset
    out = [rect(x0, y0, x1 - x0, y1 - y0, r=16, w=w)]
    if motif == "double":
        out.append(rect(x0 + 7, y0 + 7, x1 - x0 - 14, y1 - y0 - 14, r=11, w=W_FINE))
    elif motif == "dots":
        step = 22.0
        pts = []
        n = int((x1 - x0 - 40) / step)
        for i in range(n + 1):
            x = x0 + 20 + i * (x1 - x0 - 40) / n
            pts += [(x, y0 + 10), (x, y1 - 10)]
        m = int((y1 - y0 - 40) / step)
        for i in range(m + 1):
            y = y0 + 20 + i * (y1 - y0 - 40) / m
            pts += [(x0 + 10, y), (x1 - 10, y)]
        out += dots(pts, 2.1)
    elif motif == "scallop":
        bump = 9.0
        nx = max(int((x1 - x0) / 30), 4)
        ny = max(int((y1 - y0) / 30), 4)
        for i in range(nx):
            xa = x0 + (x1 - x0) * i / nx
            xb = x0 + (x1 - x0) * (i + 1) / nx
            for yy, s in ((y0, -1), (y1, 1)):
                out.append(path(f"M {xa:.2f},{yy:.2f} Q {(xa+xb)/2:.2f},{yy+s*bump:.2f} {xb:.2f},{yy:.2f}", W_FINE))
        for i in range(ny):
            ya = y0 + (y1 - y0) * i / ny
            yb = y0 + (y1 - y0) * (i + 1) / ny
            for xx, s in ((x0, -1), (x1, 1)):
                out.append(path(f"M {xx:.2f},{ya:.2f} Q {xx+s*bump:.2f},{(ya+yb)/2:.2f} {xx:.2f},{yb:.2f}", W_FINE))
    return out


def cloud(cx, cy, w, h, bumps=3, wob=None):
    """A puffy cloud with a softly rounded underside."""
    pts = []
    n = bumps * 2
    for i in range(n + 1):
        t = i / n
        x = cx - w / 2 + w * t
        lift = math.sin(math.pi * t) ** 0.6
        y = cy - h * lift * (0.72 + 0.28 * (i % 2))
        pts.append((x, y))
    for i in range(3):
        t = 1 - (i + 1) / 4
        pts.append((cx - w / 2 + w * t, cy + h * 0.16 * math.sin(math.pi * t)))
    return path(smooth_closed(pts, 0.28), W_MAIN)


def terrain(base, waves, x0=0.0, x1=PAGE_W):
    """Return (path_string, height_fn) for a rolling ground line.

    waves is a list of (amplitude, wavelength, phase).
    """
    def h(x):
        y = base
        for amp, wl, ph in waves:
            y -= amp * math.sin(2 * math.pi * x / wl + ph)
        return y
    pts = []
    steps = 60
    for i in range(steps + 1):
        x = x0 + (x1 - x0) * i / steps
        pts.append((x, h(x)))
    return smooth_open(pts, 0.24), h


def page_number(n):
    return (f'<text x="{PAGE_W/2:.2f}" y="{PAGE_H-24:.2f}" font-family="DejaVu Sans" '
            f'font-size="11" text-anchor="middle" fill="#111">{n}</text>')


def caption(s, y=None, size=15):
    y = y if y is not None else PAGE_H - 54
    return (f'<text x="{PAGE_W/2:.2f}" y="{y:.2f}" font-family="DejaVu Sans" '
            f'font-size="{size}" font-weight="bold" letter-spacing="3" '
            f'text-anchor="middle" fill="#111">{s}</text>')


def svg_page(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{PAGE_W}pt" height="{PAGE_H}pt" '
            f'viewBox="0 0 {PAGE_W} {PAGE_H}">'
            f'<rect width="{PAGE_W}" height="{PAGE_H}" fill="#ffffff"/>'
            + "".join(body) + '</svg>')


# --------------------------------------------------- fluffy / popped shapes

def bumpy_circle(cx, cy, R, bumps, samples=260, a0=None, a1=None):
    """Outline of a circle unioned with a list of (x, y, r) bumps.

    Sampled along rays from the centre, so overlapping bumps merge into one
    silhouette with no interior lines - which is what "fluffy" needs when
    nothing is filled.
    """
    partial = a0 is not None and a1 is not None
    if partial:
        b0 = math.radians(a0)
        b1 = math.radians(a1)
        while b1 <= b0:
            b1 += 2 * math.pi
    pts = []
    for i in range(samples + (1 if partial else 0)):
        if partial:
            t = b0 + (b1 - b0) * i / samples
        else:
            t = 2 * math.pi * i / samples
        ux, uy = math.cos(t), math.sin(t)
        r = R
        for (bx, by, br) in bumps:
            ex, ey = bx - cx, by - cy
            b = ux * ex + uy * ey
            c = ex * ex + ey * ey - br * br
            disc = b * b - c
            if disc > 0:
                s = b + math.sqrt(disc)
                if s > r:
                    r = s
        pts.append((cx + r * ux, cy + r * uy))
    d = "M " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    return d if partial else d + " Z"


def popcorn(cx, cy, r, n=5, phase=0.0, w=None):
    """One popped kernel: a small core with n lobes around it."""
    w = W_MAIN if w is None else w
    bumps = []
    for i in range(n):
        a = 2 * math.pi * i / n + phase
        bumps.append((cx + r * 0.48 * math.cos(a), cy + r * 0.48 * math.sin(a), r * 0.53))
    return path(bumpy_circle(cx, cy, r * 0.40, bumps, samples=150), w)
