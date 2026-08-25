# /direct — a self-evolving autonomy skill for Claude Code

A skill for the moment you hand a job to an agent and walk away.

Two things go wrong when you do that. The agent gets **timid** — it does 20% of the work
and comes back with a menu of options you have to read. Or it gets **confident** — it
reports success it never verified, and you find out three days later that "installed"
never meant "running."

`/direct` is one page of instructions that addresses both, plus a small mechanism that
makes it get better at *your* codebase every time it's wrong.

## What it does

**Act.** No "shall I?" for reversible steps that obviously follow from the request. No
menu of options it could have simply tried. It crosses the boundary of the task instead
of stopping to describe what's on the other side.

**Prove.** A claim without a command output behind it isn't a claim. Not "the config is
set" — probe the socket. Not "the tests should pass" — run them. It's told to prefer a
check *that could have failed*, because a check that can't fail proves nothing.

**Stop for exactly four things.** Everything else, it proceeds. The four are: irreversible
or outward-facing acts in your name; grading its own homework (weakening the test that
would have caught it); anything physical; and destroying work it didn't create. Naming
them narrowly is what makes "proceed" safe to mean literally.

**Learn.** After each run it appends what it got *wrong* to `references/lessons.md`, and
reads that file before planning the next one.

## The self-evolution loop

Most "learning" agent setups fail the same way: an open invitation to journal produces a
file full of "the task went well," nobody reads it, it grows without bound, and it dies.
This one is deliberately narrow.

- **It only writes on failure.** The harvest condition is a closed list: a verification you
  expected to pass failed; a doc or your own prior claim turned out false; a check went
  green that wasn't real; the owner corrected you; a guard denied you; or something cost
  more than ~20 minutes that one sentence would have prevented. A clean run writes
  **nothing**. That's what keeps the file worth reading.
- **Fixed entry shape.** Believed → Reality → Rule → Cost → Fires. The *Rule* is one
  imperative sentence a future session can apply with none of today's context. The rest is
  there so a human can audit whether the rule is justified.
- **Repeats increment, they don't duplicate.** Same trap twice bumps `Fires: 2`.
- **Promotion at 3 fires** (or one hour-plus incident): the rule graduates out of the log
  and into the skill body or the verification playbook, where it's read unconditionally.
- **Bounded.** Capped at 40 live entries; pruning removes only entries that never re-fired
  *and* whose subject no longer exists on disk. Bounded memory that gets read beats
  unbounded memory that gets skipped.
- **It can't edit its own past.** Never rewrite a lesson to make a run look better, and the
  no-grading-your-own-homework rule explicitly binds the harvest condition itself.

The result is a skill whose value curve is the opposite of a prompt's: the parts that are
specific to your machine get written by your machine's failures, not guessed at by
whoever wrote the file.

## Install

Copy the `direct` folder into any skills directory Claude Code reads:

```bash
# every project on this machine
cp -r skills/direct ~/.claude/skills/

# or just this project
cp -r skills/direct .claude/skills/
```

Windows PowerShell:

```powershell
robocopy skills\direct "$env:USERPROFILE\.claude\skills\direct" /E
```

Then start a session and say **`/direct`** — or "do wonderful things", "finish it", "do it
yourself". The description triggers on all of them.

## Make it yours (5 minutes, and it matters)

`references/verification-playbook.md` ships as a **template**, and it's the half of this
skill that can't be shared. "Prove it" means something different in every codebase. Fill in:

- the health check for each service you run, phrased as *the proof*, not the thing;
- the exact test / build / typecheck / e2e commands that constitute evidence here;
- the signals you know lie in your environment.

A `/direct` with a filled-in playbook is dramatically more useful than one without. Leave
`lessons.md` empty — your first real entry arrives on its own within a few tasks.

## Design notes, if you're writing your own

Things this file does on purpose, which you may want to steal:

- **The stop-list is short and enumerated.** Vague caution ("be careful with risky
  actions") makes an agent hesitant everywhere and safe nowhere. Four named categories
  make "everything else, proceed" a sentence you can actually mean.
- **The self-check is adversarial.** "Verify with something that could have failed" is the
  single highest-leverage line in the file.
- **Guard denials are findings, not obstacles.** The skill forbids routing around a
  PreToolUse guard, and tells the agent a denial is often the most interesting result of
  the run — which converts a frustration into a reported signal.
- **Learning is gated on falsification, not on activity.** This is the whole trick.

## Also in this repo

[`app/`](app/) — **Division Adventure**, a colourful Grade 1–6 division learning
app built in a `/direct` session. No build step: open `app/index.html`. Six
learning paths, 18 lessons, ~40 question generators, an interactive long-division
widget, and a checked-in test suite that drives the real thing in a browser.

## License

MIT. See [LICENSE](LICENSE).
