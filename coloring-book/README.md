# Small Wonders — a printable coloring book

Seventeen US Letter pages of black-line art, generated from Python. Nothing is traced or
copied: every page is drawn with the primitives in `draw.py`, so the whole book is a few
hundred lines of code rather than a folder of images.

![All seventeen pages](preview.png)

## Get the book

**[out/small-wonders-coloring-book.pdf](out/small-wonders-coloring-book.pdf)** — 17 pages,
8.5 × 11 in, vector (no rasterized images). Print at 100% / "actual size" so the margins
stay put.

**[out/popcorn-shop-coloring-page.pdf](out/popcorn-shop-coloring-page.pdf)** — the popcorn
shop on its own, one page.

Individual pages live in `out/` as SVG, and `build.py` writes a PNG of each one too.

## What's in it

| | | |
|---|---|---|
| 1. Cover — *Small Wonders* | 2. Sun mandala | 3. Night owl |
| 4. Deep blue (humpback) | 5. Paper wings (butterfly) | 6. Up and away (balloons) |
| 7. Yarn day (cat) | 8. Fresh picked (bouquet) | 9. Deep down (fish) |
| 10. To the moon (rocket) | 11. Bloom mandala | 12. Toadstool cottage |
| 13. Prickles (hedgehog) | 14. Slow and steady (tortoise) | 15. The old tree |
| 16. Draw your own | 17. Popcorn shop | |

Line weights run from 4.2 pt on outer silhouettes down to 1.5 pt on texture, all round-capped,
so the enclosed areas stay big enough for a crayon and nothing fills in at print size.

## Rebuild it

```bash
pip install cairosvg pypdf pillow
python3 build.py out
```

That regenerates every SVG and PNG, the combined PDF, and the standalone page PDFs.

## Files

- `draw.py` — the drawing library: paths, petals, leaves, eyes, mandala rings, scalloped
  borders, cloud and terrain helpers, and the page wrapper.
- `pages_a.py`, `pages_b.py`, `pages_c.py`, `pages_d.py` — one function per page.
- `build.py` — renders everything and stitches the PDF.

## Changing a page

Each page function returns an SVG string and takes no arguments, so you can iterate on one
in isolation:

```python
import cairosvg, pages_a
svg = pages_a.owl()
cairosvg.svg2png(bytestring=svg.encode(), write_to="owl.png",
                 output_width=612, output_height=792)
```

Coordinates are in points on a 612 × 792 page, origin top-left. `MARGIN` is 48 pt and the
decorative borders sit at an inset of 26–30 pt.

## Adding a page

Write a function that returns `svg_page([...])` and add it to the `PAGES` list in
`build.py`. Add its key to `STANDALONE` there if it should also get a one-page PDF.
Three conventions worth keeping:

- **Attach appendages to the outline, not near it.** Fins, ears, and branches look detached
  if their endpoints float a few points off the silhouette. Evaluate the body's Bézier at a
  parameter `t` and start the appendage exactly there — `under_the_sea()` has a `bp()` helper
  that does this.
- **Nothing is filled**, so any line you draw inside a shape stays visible. Keep interior
  detail deliberate. `bumpy_circle()` takes an angle range for exactly this reason: the
  popcorn-shop character's head is drawn as a partial arc so the cap closes the top instead
  of the head outline showing through it.
- **Foreground objects need the background drawn in segments.** The popcorn bucket on
  page 17 stands in front of the counter, so the counter's lines are drawn outside an
  x window rather than straight across.

## License

MIT, same as the rest of the repository.
