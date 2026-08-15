# Lessons — falsified beliefs, newest last

This is `/direct`'s memory. Every entry exists because something looked fine and was not.
Read it before planning (loop step 0); append to it under the harvest condition in
SKILL.md (loop step 7). Append only — two sessions may harvest at once.

Do not add an entry for a run that went as expected. The value of this file is that
everything in it is a real, paid-for surprise. An empty file is the correct starting
state; the first entry usually arrives within a few real tasks.

---

<!-- Example of the format. Delete it once you have a real one. -->

### 2026-01-01 — Local green is not CI green
- **Believed:** a passing local test run is evidence the tree is good.
- **Reality:** the local run was a subset — the runner silently skipped the integration
  project, and CI failed on the first file it touched.
- **Rule:** treat a local pass as provisional unless you can see the test count; say
  "provisional" in the report when that is what you have.
- **Cost:** ~40 min, one rework cycle.
- **Fires:** 1
