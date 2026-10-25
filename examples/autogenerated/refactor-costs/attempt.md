# Runtime list-cost measurements

## Type sketch before implementation

The input selects `logs` or `array` and a positive whole-number size. The
benchmark produces dialect source as `Text`, invokes the real `Fieldmouse.run`,
and checks the resulting `Either Text (List Text)`. It never interprets the
source itself. `logs` must return the complete sequence of decimal counters;
`array` parses a JSON array, checks its length and first/last values, and emits
one checked line. The monotonic timer encloses the real `run` call; source
construction, result checking, and process startup are outside that interval.

Operations: `source_for : Text → Number → Text`,
`expected_for : Text → Number → List Text`, `main : IO ()`.
No external host effects are required. Numbers use Field Mouse's existing
Double display; counters use `Number` in this driver. The backend is the
repository's existing Idriç/Chez Linux x86-64 lane. Failure is a nonzero exit,
never a fabricated timing success. `/usr/bin/time` was absent, so the driver
uses the existing `System.Clock` monotonic API and reads Linux's `VmHWM` from
`/proc/self/status`. Peak RSS includes the whole process, including source
construction and result checking. It is not allocated bytes or live heap size.
Repeated raw samples belong in the review's measurements TSV.

This is an Idriç attempt, with no Python or JavaScript benchmark replacement.
The first draft used `cast index `the` Double`, incorrectly reversing `the`'s
arguments; the pinned compiler rejected its missing Show instance. Corrected
to the supported `the Double (cast index)`. The compiler also attempted code
generation after that error; that diagnostic is not a benchmark result.
Compiler revisions, execution commands, and results are recorded in
`reviews/refactor-2026-10/acceptance.md` once actually exercised.
