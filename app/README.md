# ➗ Division Adventure

A colourful, playful web app that teaches **division from Grade 1 to Grade 6**.

Open `app/index.html` in any modern browser — no build step, no install, no server.
It works offline and saves progress on the device.

## What's inside

**Six grades, six genuinely different ideas.** Not the same worksheet with bigger
numbers — each grade teaches a different way of thinking about division:

| Grade | Path | What it actually teaches |
|---|---|---|
| 1 | Sharing Star | Fair shares, making groups, equal vs. not equal — all with objects |
| 2 | Picture Explorer | Arrays, the ÷ sign and what each number means, skip-counting on a number line |
| 3 | Fact Finder | Fact families, remainders, and the two kinds of word problem (sharing vs. grouping) |
| 4 | Division Cadet | Dividing tens/hundreds, long division (Divide–Multiply–Subtract–Bring down), interpreting remainders |
| 5 | Number Navigator | Two-digit divisors with estimation, decimal quotients, unit rates and better-buy problems |
| 6 | Division Master | Dividing decimals (and *why* ×10 both sides works), fractions via Keep–Change–Flip, ratios and multi-step problems |

**Every lesson runs in four steps:** Big Idea → Picture It → Watch Me (worked
example) → Try It! Each Try It has a hint button, a check button, and warm
feedback either way.

**Practice** generates fresh questions in six shapes — multiple choice, type the
answer, missing number, picture division, word problems, and drag-and-drop
grouping — across three levels. Medium unlocks after 10 correct on Easy;
Challenge after 10 correct on Medium.

**Challenges** add pressure three different ways: Three Lives, Beat the Clock,
and a Rising Ladder that climbs Easy → Medium → Challenge.

**Progress** tracks questions answered, accuracy, lessons finished, daily
practice streak, best run of correct answers, and 22 badges.

## Mistakes are handled carefully

A wrong answer never says "Wrong." It opens with something like *"Almost! Let's do
it together"*, re-teaches the idea in three short lines, redraws the picture with
the answer visible, offers **Try it again**, and finishes with *"Mistakes help
your brain grow."* Scoring uses the first attempt, so retrying is free.

## Built for tablets

Chunky 56px+ buttons, an on-screen number pad so the keyboard never covers the
question, drag-and-drop that works with a finger (or tap-an-object then
tap-a-basket), and layouts that reflow from phone to desktop. Sound is a toggle
in the top bar, and `prefers-reduced-motion` is respected.

## Code layout

```
app/
├── index.html          page shell
├── css/styles.css      the whole classroom theme
└── js/
    ├── util.js         DOM helpers, number parsing, sound, confetti, toasts
    ├── state.js        progress + unlocks, saved to localStorage
    ├── badges.js       22 achievements, each reporting its own progress
    ├── visual.js       13 picture types + the interactive long-division widget
    ├── questions.js    ~40 question generators, pooled per grade and level
    ├── curriculum.js   the 6 paths and their 18 lessons
    ├── session.js      question card, drag-and-drop, round runner
    ├── learn.js        lesson list + four-step lesson player
    ├── practice.js     level picker + 10-question rounds
    ├── challenge.js    the three challenge modes
    ├── progress.js     dashboard + badge wall
    └── app.js          top bar, home screen, router
```

Plain ES5-style scripts loaded in order — no bundler, no dependencies, so the
folder can simply be copied onto a tablet or served from anywhere.

## Adding content

- **A new lesson:** add an entry to the right grade array in `curriculum.js`
  (`explain`, `visual`, `worked`, and a `tryIt()` that returns a question).
- **A new question type:** write a generator in `questions.js` returning the
  question shape documented at the top of that file, then add it to a grade's
  difficulty pool with a weight.
- **A new picture:** add a renderer to `visual.js` and register it in `KINDS`.
