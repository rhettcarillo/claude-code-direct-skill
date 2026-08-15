# Verification playbook — how to prove things on THIS machine

**This file is a template. Fill it in for your own environment.** It is the half of
`/direct` that cannot be shared, because "prove it" means something different in every
codebase. The skill is only as good as this page is specific.

Rule for what belongs here: a concrete signal that has actually caught a mistake, or that
you know is load-bearing. Not a description of your stack — a command whose output you
would accept as proof against your own optimism.

## Services: probe, never assume

Replace with your own. The point of the table is that each row names the *proof*, not
the thing.

| Thing | The proof |
|---|---|
| API | `curl -fsS http://127.0.0.1:<port>/health` — and check the body, not just the 200. A live port is not a live service. |
| Worker | the job it just consumed appears in the sink, not "the process is up". |
| Deploy | fetch the deployed URL and assert on content you changed, not on the build's exit code. |
| DB migration | query the new column/constraint, don't trust the migration runner's output. |

Prefer `127.0.0.1` over `localhost` where DNS or proxy resolution can add latency or
silently pick the wrong stack.

## Commands that constitute proof here

Fill in the real ones — the whole suite, the linter, the type check, the e2e driver:

    <test command>
    <build command>
    <lint / typecheck command>
    <end-to-end command>

If any of these are slow enough that you will be tempted to skip or subset them, say so
here, and say which subset is honest and which is a false green.

## Signals that lie here

Start with these — they are near-universal — and add your own as `lessons.md` promotes them.

- **A passing local check is not CI.** Partial runs, stale caches, and a different
  environment have all produced confident false greens.
- **Pid files and lock files go stale.** Confirm the live process before killing anything.
- **A tool result is not a delivered effect.** Composing a perfect message and sending it
  are different events; only the receiving side proves delivery.
- **A self-asserted label is not provenance.** If the subject wrote the record, the record
  is a claim, not evidence.
- **A green build on a dirty tree is provisional.** Exit evidence should attest a committed
  tree.

## Environment traps

Anything that costs time and is not discoverable from the code: required env vars, a
proxy or TLS-interception quirk, a resource gate, a service that must be warm first,
a platform-specific shell footgun. One line each.
