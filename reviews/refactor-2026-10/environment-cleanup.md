# Remove the unused direct-value environment

Review base: `07720d43eb6f9ec740719f34e29774efa8d34c50`.
Implementation: `735fe2d` on `refactor/remove-obsolete-environment`.

`publication.tsv` maps the locally tested commits to published commits with
verified identical Git trees. Only commit metadata differs; all tested file
bytes are preserved. The mapping itself is review metadata.

The active evaluator uses `Runtime.bindings : List (Text, Number)` and shared
cells. The old private `Environment = List (String, value)`, `lookup_variable`,
`set_variable` and `define_variable` have no callers outside their own obsolete
definitions. Removing those 18 lines leaves one model for a maintainer to follow.
No exported definition, parser, binding operation or runtime behavior changes.

Two tests were added before removal and passed on the unchanged runtime:
an earlier capture retains its cell after redeclaration, and two returned
closures share one local cell. Existing tests already exercise mutation of a
captured cell, caller-map restoration, self recursion and local isolation.
The added tests clarify why resurrecting a direct-value environment would be
wrong. Their placement at the end avoids overlap with the separate runtime
cost refactor's tests.

## Acceptance

Both command/test packages built and all 76 language checks passed with:

- Pinned Idriç `94dfd99bd3e376507fedc8611053b7173b2519f0`.
- Current compiler source `0e8cfdd1106ebdeffd01b6c519880ea3afc7dc35`, rebuilt
  using the pinned compiler and tested with pinned bundle libraries/support.
  This is not a freshly rebuilt full current-library toolchain.

With both compilers, all four type refusals, seven Node differential cases,
host/CLI/fresh-copy acceptance and all five published examples passed.
The final test ordering was exercised by the current-compiler run; the earlier
ordering also passed with the pinned compiler.

The actual compiled CLI ran the separate environment-cleanup acceptance
program with status zero. ai-ci at
`32cb45b3a3a257aeb07881c75f3b846495cfb2c9`, built through the observed ICK
`515c0f29fe6e2e96e10495fbaf25da93532e7722` frontend, compared its captured output
to the specified result. Both compiler-produced commands passed. Changing the
first result from `1.0 3.0` to `3.0 3.0` was rejected at
`AICI-FIELDMOUSE-BINDING-CELLS`, proving that the checker detects accidental
retargeting to the newer declaration. Restoring actual execution passed again.
The shared verifier's 75 self-tests passed. Its binary SHA-256 is
`8077799a817d100398f271097b2c583250655bf0adbe767c12cdeafd2d333da8`.

No speed or memory benefit is claimed: these definitions were already unused.
The benefit is removal of an obsolete competing account of binding semantics.
No gotchas update is needed because behavior and verified runtime limits are
unchanged. Broader architecture and performance work is independently recorded
on the `refactor/runtime-list-costs` branch in this review directory.
