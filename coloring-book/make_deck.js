// Builds the slide deck that presents the coloring book.
// Run:  node make_deck.js
const pptxgen = require("pptxgenjs");
const path = require("path");

const CORAL = "F96167";
const GOLD  = "F9E795";
const NAVY  = "2F3C7E";
const INK   = "1F2233";
const MUTED = "6E7280";
const WHITE = "FFFFFF";
const CARD  = "F7F7FA";

const HEAD = "Cambria";
const BODY = "Calibri";

const OUT = "out";
const img = (n) => path.join(OUT, n + ".png");
const card = () => ({ shadow: { type: "outer", angle: 90, blur: 14, offset: 3,
                                color: "9AA0B0", opacity: 0.34 } });

const SCENES = [
  { file: "17_popcorn_shop", name: "Popcorn shop",
    text: "A fluffy poodle in a star cap works the popcorn counter while a customer waits at the front.",
    bits: ["A tub spilling over in the foreground", "NEW, BUY GET 1, SCAN and PICK UP HERE signs",
           "A kettle machine with a heart panel"] },
  { file: "18_blanket_fort", name: "Blanket fort",
    text: "A poodle reads by fairy lights inside a flowered blanket fort while a chick naps on a cushion.",
    bits: ["Cactus, tulips and a hanging lamp", "A flower-shaped portrait frame",
           "A scalloped rug under the whole tent"] },
  { file: "19_bakery", name: "Bakery",
    text: "Two rabbit bakers ice a strawberry cake together, one piping, one placing the fruit.",
    bits: ["Jars of cookies and sweets on the shelf", "Bunting, a flour bottle, a mixing bowl",
           "A carrot and cookies on the counter"] },
  { file: "20_ice_cream", name: "Ice cream parlor",
    text: "A cat lifts a fresh scoop behind the display case while a triple cone waits in front.",
    bits: ["Four tubs under the counter glass", "A scalloped awning and a TODAY board",
           "A stack of spare cones"] },
  { file: "21_boba_bar", name: "Boba tea bar",
    text: "A cat shakes a drink behind the counter and a giant boba cup fills the foreground.",
    bits: ["Pearls, a domed lid and a bendy straw", "Topping jars on a wall shelf",
           "A menu board with hearts"] },
];

const PAGES = [
  ["01_cover", "Cover", "A wreath, a big blooming flower and a line for a name."],
  ["02_sun_mandala", "Sun mandala", "Twelve-fold rings of petals, hearts and scallops."],
  ["03_owl", "Night owl", "A horned owl gripping a branch under a crescent moon."],
  ["04_whale", "Deep blue", "A humpback with throat grooves and a long flipper."],
  ["05_butterfly", "Paper wings", "Veined wing panels, mirrored exactly down the middle."],
  ["06_balloons", "Up and away", "Three balloons drifting over a village on rolling hills."],
  ["07_cat", "Yarn day", "A sitting cat with a curled tail and a ball of yarn."],
  ["08_bouquet", "Fresh picked", "Daisies and tulips gathered in a patterned vase."],
  ["09_under_the_sea", "Deep down", "A scaled fish among seaweed, coral and a starfish."],
  ["10_rocket", "To the moon", "A rocket climbing past a ringed planet and a cratered moon."],
  ["11_bloom_mandala", "Bloom mandala", "Leaves, hearts and petals in twelve-fold symmetry."],
  ["12_mushroom_cottage", "Toadstool cottage", "A spotted mushroom house with round windows and a snail."],
  ["13_hedgehog", "Prickles", "A hedgehog carrying apples home on its spines."],
  ["14_tortoise", "Slow and steady", "A tortoise with a plated shell, out for a walk."],
  ["15_big_tree", "The old tree", "A scalloped canopy full of fruit, with birds and a swing."],
  ["16_draw_your_own", "Draw your own", "An empty frame ringed with flowers, hearts and stars."],
];

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";          // 13.333 x 7.5
pres.author = "Small Wonders";
pres.title = "Small Wonders - a coloring book";

function numberDot(s, x, y, label, fill, textColor) {
  s.addShape(pres.ShapeType.ellipse,
    { x, y, w: 0.62, h: 0.62, fill: { color: fill } });
  s.addText(label, { x, y, w: 0.62, h: 0.62, align: "center", valign: "middle",
                     fontFace: BODY, fontSize: 17, bold: true, color: textColor,
                     margin: 0, isTextBox: true });
}

// ---------------------------------------------------------------- 1  title
{
  const s = pres.addSlide();
  s.background = { color: CORAL };
  s.addText("SMALL", { x: 0.9, y: 1.25, w: 6.6, h: 1.15, fontFace: HEAD, fontSize: 62,
                       bold: true, color: WHITE, charSpacing: 3, margin: 0, isTextBox: true });
  s.addText("WONDERS", { x: 0.9, y: 2.3, w: 6.6, h: 1.15, fontFace: HEAD, fontSize: 62,
                         bold: true, color: WHITE, charSpacing: 3, margin: 0, isTextBox: true });
  s.addText("A coloring book of twenty-one pages", { x: 0.9, y: 3.65, w: 6.4, h: 0.5,
            fontFace: BODY, fontSize: 21, bold: true, color: WHITE, margin: 0, isTextBox: true });
  s.addText("Every page is generated from Python — no page is traced or clip-art.\nUS Letter, black line art, print at 100%.",
            { x: 0.9, y: 4.3, w: 6.2, h: 1.1, fontFace: BODY, fontSize: 15, color: WHITE,
              lineSpacingMultiple: 1.3, margin: 0, isTextBox: true });
  s.addShape(pres.ShapeType.roundRect, { x: 7.9, y: 0.52, w: 5.05, h: 6.45,
             rectRadius: 0.14, fill: { color: WHITE }, ...card() });
  s.addImage({ path: img("17_popcorn_shop"), x: 8.1, y: 0.72, w: 4.65, h: 6.02 });
  s.addNotes("Small Wonders: 21 printable coloring pages, generated in code.");
}

// ------------------------------------------------------------- 2  contents
{
  const s = pres.addSlide();
  s.addText("What's inside", { x: 0.8, y: 0.55, w: 6.0, h: 0.8, fontFace: HEAD, fontSize: 40,
            bold: true, color: NAVY, margin: 0, isTextBox: true });
  numberDot(s, 0.8, 1.75, "5", CORAL, WHITE);
  s.addText("Inked scenes", { x: 1.62, y: 1.72, w: 3.6, h: 0.42, fontFace: HEAD, fontSize: 22,
            bold: true, color: NAVY, margin: 0, isTextBox: true });
  s.addText("Packed shop and room scenes, drawn with a hand tremble and built strictly back to front so objects overlap the way they should.",
            { x: 1.62, y: 2.18, w: 3.7, h: 1.2, fontFace: BODY, fontSize: 14, color: INK,
              lineSpacingMultiple: 1.25, margin: 0, isTextBox: true });
  numberDot(s, 0.8, 3.65, "16", CORAL, WHITE);
  s.addText("Line-art pages", { x: 1.62, y: 3.62, w: 3.6, h: 0.42, fontFace: HEAD, fontSize: 22,
            bold: true, color: NAVY, margin: 0, isTextBox: true });
  s.addText("Clean single subjects — owl, whale, rocket, two mandalas, a tree — with large open areas and nothing fiddly to colour around.",
            { x: 1.62, y: 4.08, w: 3.7, h: 1.2, fontFace: BODY, fontSize: 14, color: INK,
              lineSpacingMultiple: 1.25, margin: 0, isTextBox: true });
  s.addText("Line weights run 5.2pt on outer silhouettes down to 1.5pt on texture, so nothing closes up at print size.",
            { x: 0.8, y: 5.55, w: 4.5, h: 0.9, fontFace: BODY, fontSize: 12.5, italic: true,
              color: MUTED, lineSpacingMultiple: 1.25, margin: 0, isTextBox: true });
  s.addShape(pres.ShapeType.roundRect, { x: 5.75, y: 1.55, w: 7.0, h: 4.28,
             rectRadius: 0.12, fill: { color: CARD }, ...card() });
  s.addImage({ path: "preview.png", x: 5.95, y: 1.72, w: 6.6, h: 3.94 });
  s.addText("All twenty-one pages", { x: 5.75, y: 5.9, w: 7.0, h: 0.35, align: "center",
            fontFace: BODY, fontSize: 12, color: MUTED, margin: 0, isTextBox: true });
}

// ------------------------------------------------------------- dividers
function divider(num, title, sub, thumbs) {
  const s = pres.addSlide();
  s.background = { color: CORAL };
  s.addText(num, { x: 0.9, y: 1.15, w: 2.4, h: 1.5, fontFace: HEAD, fontSize: 84, bold: true,
            color: GOLD, margin: 0, isTextBox: true });
  s.addText(title, { x: 0.9, y: 2.75, w: 6.4, h: 0.95, fontFace: HEAD, fontSize: 46, bold: true,
            color: WHITE, margin: 0, isTextBox: true });
  s.addText(sub, { x: 0.9, y: 3.8, w: 5.6, h: 1.1, fontFace: BODY, fontSize: 16, color: WHITE,
            lineSpacingMultiple: 1.3, margin: 0, isTextBox: true });
  thumbs.forEach((f, i) => {
    const x = 7.55 + i * 1.92;
    s.addShape(pres.ShapeType.roundRect, { x, y: 1.95, w: 1.72, h: 2.23, rectRadius: 0.08,
               fill: { color: WHITE }, ...card() });
    s.addImage({ path: img(f), x: x + 0.09, y: 2.04, w: 1.54, h: 2.0 });
  });
}
divider("01", "Inked scenes", "Five busy counters and one quiet bedroom. Every shape is filled white, so the signs sit in front of the machine and the tub sits in front of the counter.",
        ["17_popcorn_shop", "19_bakery", "21_boba_bar"]);

// --------------------------------------------------------- 4-8  scenes
SCENES.forEach((sc, i) => {
  const s = pres.addSlide();
  s.addText(`INKED SCENE ${i + 1} OF 5`, { x: 0.85, y: 0.5, w: 5.0, h: 0.3, fontFace: BODY,
            fontSize: 11.5, bold: true, color: CORAL, charSpacing: 2, margin: 0, isTextBox: true });
  numberDot(s, 0.85, 0.95, String(i + 17), CORAL, WHITE);
  s.addText(sc.name, { x: 1.68, y: 0.92, w: 5.6, h: 0.7, fontFace: HEAD, fontSize: 36, bold: true,
            color: NAVY, margin: 0, isTextBox: true });
  s.addText(sc.text, { x: 0.85, y: 2.0, w: 5.9, h: 1.3, fontFace: BODY, fontSize: 16, color: INK,
            lineSpacingMultiple: 1.35, margin: 0, isTextBox: true });
  s.addText("LOOK FOR", { x: 0.85, y: 3.35, w: 4.0, h: 0.3, fontFace: BODY, fontSize: 11.5,
            bold: true, color: MUTED, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText(sc.bits.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < sc.bits.length - 1 } })),
            { x: 0.95, y: 3.75, w: 5.7, h: 1.7, fontFace: BODY, fontSize: 14.5, color: INK,
              paraSpaceAfter: 8, margin: 0, isTextBox: true });
  s.addShape(pres.ShapeType.roundRect, { x: 7.9, y: 0.52, w: 5.05, h: 6.45, rectRadius: 0.14,
             fill: { color: WHITE }, ...card() });
  s.addImage({ path: img(sc.file), x: 8.1, y: 0.72, w: 4.65, h: 6.02 });
  s.addNotes(sc.text);
});

divider("02", "Line-art pages", "Sixteen single subjects on white. Unfilled outlines, layered line weights, a decorative border and a captioned subject.",
        ["03_owl", "11_bloom_mandala", "15_big_tree"]);

// ------------------------------------------------------- 10-25  the pages
PAGES.forEach(([file, name, text], i) => {
  const s = pres.addSlide();
  s.addShape(pres.ShapeType.roundRect, { x: 0.42, y: 0.52, w: 5.05, h: 6.45, rectRadius: 0.14,
             fill: { color: WHITE }, ...card() });
  s.addImage({ path: img(file), x: 0.62, y: 0.72, w: 4.65, h: 6.02 });
  s.addText(`PAGE ${i + 1} OF 16`, { x: 6.15, y: 2.1, w: 5.0, h: 0.3, fontFace: BODY,
            fontSize: 11.5, bold: true, color: CORAL, charSpacing: 2, margin: 0, isTextBox: true });
  numberDot(s, 6.15, 2.55, String(i + 1), CORAL, WHITE);
  s.addText(name, { x: 6.98, y: 2.52, w: 5.9, h: 0.7, fontFace: HEAD, fontSize: 36, bold: true,
            color: NAVY, margin: 0, isTextBox: true });
  s.addText(text, { x: 6.15, y: 3.6, w: 6.3, h: 1.3, fontFace: BODY, fontSize: 16.5, color: INK,
            lineSpacingMultiple: 1.35, margin: 0, isTextBox: true });
  s.addNotes(text);
});

// -------------------------------------------------------------- closing
{
  const s = pres.addSlide();
  s.background = { color: CORAL };
  s.addText("Print at 100%", { x: 0.9, y: 1.1, w: 6.6, h: 1.0, fontFace: HEAD, fontSize: 48,
            bold: true, color: WHITE, margin: 0, isTextBox: true });
  const notes = [
    ["Actual size", "Choose 100% or “actual size”, not “fit to page”, or the margins shift."],
    ["Vector, not pixels", "The PDF holds no rasterised images, so it stays sharp at any size."],
    ["Any paper", "Pages are true US Letter. A4 works too — print at 100% and lose a little margin."],
  ];
  notes.forEach(([h, t], i) => {
    const y = 2.35 + i * 1.28;
    s.addShape(pres.ShapeType.ellipse, { x: 0.9, y: y, w: 0.5, h: 0.5, fill: { color: GOLD } });
    s.addText(String(i + 1), { x: 0.9, y: y, w: 0.5, h: 0.5, align: "center", valign: "middle",
              fontFace: BODY, fontSize: 15, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(h, { x: 1.6, y: y - 0.03, w: 5.6, h: 0.36, fontFace: HEAD, fontSize: 19, bold: true,
              color: WHITE, margin: 0, isTextBox: true });
    s.addText(t, { x: 1.6, y: y + 0.36, w: 5.7, h: 0.68, fontFace: BODY, fontSize: 14,
              color: WHITE, lineSpacingMultiple: 1.25, margin: 0, isTextBox: true });
  });
  ["18_blanket_fort", "20_ice_cream"].forEach((f, i) => {
    const x = 8.15 + i * 2.45;
    s.addShape(pres.ShapeType.roundRect, { x, y: 1.75, w: 2.2, h: 2.85, rectRadius: 0.1,
               fill: { color: WHITE }, ...card() });
    s.addImage({ path: img(f), x: x + 0.11, y: 1.86, w: 1.98, h: 2.56 });
  });
  s.addText("21 pages  ·  8.5 × 11 in  ·  vector PDF",
            { x: 7.95, y: 4.95, w: 5.05, h: 0.4, align: "center", fontFace: BODY, fontSize: 14,
              bold: true, color: WHITE, margin: 0, isTextBox: true });
}

pres.writeFile({ fileName: "small-wonders-deck.pptx" })
    .then(() => console.log("wrote small-wonders-deck.pptx"));
