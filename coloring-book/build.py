#!/usr/bin/env python3
"""Render the coloring book: one SVG and PNG per page, plus a print-ready PDF.

Usage:  python3 build.py [outdir]

Pages are US Letter (8.5 x 11 in) at 72 units per inch, pure black line art on
white, so they print cleanly on any home printer.
"""

import io
import os
import sys

import cairosvg
from pypdf import PdfWriter

import pages_a
import pages_b
import pages_c

PAGES = [
    ("01_cover", "Cover", pages_a.cover),
    ("02_sun_mandala", "Sun mandala", pages_a.mandala_sun),
    ("03_owl", "Night owl", pages_a.owl),
    ("04_whale", "Deep blue", pages_a.whale),
    ("05_butterfly", "Paper wings", pages_a.butterfly),
    ("06_balloons", "Up and away", pages_a.balloons),
    ("07_cat", "Yarn day", pages_b.cat),
    ("08_bouquet", "Fresh picked", pages_b.bouquet),
    ("09_under_the_sea", "Deep down", pages_b.under_the_sea),
    ("10_rocket", "To the moon", pages_b.rocket),
    ("11_bloom_mandala", "Bloom mandala", pages_b.mandala_bloom),
    ("12_mushroom_cottage", "Toadstool cottage", pages_c.mushroom_house),
    ("13_hedgehog", "Prickles", pages_c.hedgehog),
    ("14_tortoise", "Slow and steady", pages_c.tortoise),
    ("15_big_tree", "The old tree", pages_c.big_tree),
    ("16_draw_your_own", "Draw your own", pages_c.draw_your_own),
]


def main():
    outdir = sys.argv[1] if len(sys.argv) > 1 else "out"
    os.makedirs(outdir, exist_ok=True)

    writer = PdfWriter()
    for name, title, fn in PAGES:
        svg = fn()
        with open(os.path.join(outdir, name + ".svg"), "w") as fh:
            fh.write(svg)
        cairosvg.svg2png(bytestring=svg.encode(), output_width=1224, output_height=1584,
                         write_to=os.path.join(outdir, name + ".png"))
        pdf_bytes = cairosvg.svg2pdf(bytestring=svg.encode())
        writer.append(io.BytesIO(pdf_bytes))
        print(f"  {name:22s} {title}")

    writer.add_metadata({"/Title": "Small Wonders - A Coloring Book",
                         "/Subject": "16 printable line-art pages, US Letter"})
    pdf_path = os.path.join(outdir, "small-wonders-coloring-book.pdf")
    with open(pdf_path, "wb") as fh:
        writer.write(fh)
    print(f"\n{len(PAGES)} pages -> {pdf_path}")


if __name__ == "__main__":
    main()
