# Decisions

## Keep the interpreter and its semantic boundaries

The direct interpreter, closed operators/native functions, lexical binding
cells, explicit identities and injectable synchronous host are justified for
the present helper workload. The review does not support replacing them with
a VM, the C engine, a parser framework, or another implementation language.

The monolithic file has real separable responsibilities, but the useful next
split must follow dependencies and visibility, not a line-count target. In
particular, JSON parsing is independent of runtime storage; JSON import and
serialization are not. The current refusal harnesses compile isolated source
links and would need module-aware updates. Keep the existing facade and typed
boundaries when undertaking that separate change.

## Implemented: cheaper output accumulation

`104b890` changes only the internal output representation. Logging prepends to
`output_reversed`; `run_command_with_host` reverses once on success, including
deliberate exit. Nested calls share this state. Runtime failure still returns
Left and exposes no collected output. No streaming behavior is introduced.

The invariant is explicit in the field name and at its two access points.
A difference-list closure or queue would add machinery without serving an
additional requirement. The accumulation work falls from repeated prefix
copying to one cons per line plus one final traversal.

## Implemented: distinguish array and object allocation

`d5803ca161ec7cb59ccb2c07e768d27d69fe7481` introduces `allocate_object` and
keeps `allocate_array`, sharing `store_aggregate` for identity insertion only.
Objects still deduplicate left-to-right with first key position and last value.
Array keys are generated once as distinct canonical indices, so searching all
previous indices serves no purpose. Literal/JSON/host arrays use the same path.
Property representation, lookups, writes, sparse growth, serialization and
identity allocation order remain unchanged.

## Separate branch: remove a misleading historical model

`735fe2d` removes the unused private `Environment` alias and three old direct-
value binding helpers. Searching all active Idriç files found only those
definitions and their recursive self-calls. They do not describe the actual
cell-based runtime. Two additional tests preserve the important distinctions:
redeclaration does not retarget an existing capture, and two closures returned
from one call share a local cell. This cleanup remains independently reviewable
on `refactor/remove-obsolete-environment`.

## Measurements

The retained Idriç driver invokes the real interpreter. Five fresh-process
samples per size/variant alternate baseline/refactor order. The monotonic
timer encloses `run`; process startup, source generation and result comparison
are excluded. Linux VmHWM is whole-process peak RSS, including those costs.
All 40 result checks passed. Raw samples are in measurements.tsv.

| Case | Size | Baseline median | Refactor median |
| --- | ---: | ---: | ---: |
| Sequential logs | 10,000 | 313.0 ms | 22.8 ms |
| Sequential logs | 20,000 | 1,381.6 ms | 38.7 ms |
| JSON array parse/import and boundary reads | 10,000 | 685.7 ms | 21.3 ms |
| JSON array parse/import and boundary reads | 20,000 | 3,341.0 ms | 45.1 ms |

This is a focused microbenchmark on a shared Ubuntu x86-64 container, not a
general script-speed claim. Compiler work overlapped some samples; CPU affinity
and system load were not controlled. Interleaving and the size trend support
the local result but do not establish a universal speedup factor. Peak RSS
remained approximately 47,000 KiB in both variants: no meaningful peak-memory
improvement was demonstrated. Compiled payload increased by 387 bytes, from
192,858 to 193,245 bytes. Single startup-smoke times are not benchmarks.

## Remaining weaknesses and separate jobs

1. Add located tokens and structured diagnostics with an explicit Unicode
   position convention; isolate syntax/model/host modules while preserving
   the facade and refusal tests. Recovery needs a real editing use case.
2. Benchmark indexed cell/identity stores and distinct array/object stores.
   Preserve shadowing, aliasing, duplicate key order and sparse semantics;
   include large retained-cell and repeated-call cases.
3. Design storage reclamation around actual roots and escaped closures before
   advertising long-lived service use. Current calls retain dead locals and
   functions; a faster lookup structure does not solve retention.
4. Consider request-indexed responses and direct subprocess argv lowering at
   the existing host boundary. Callback lifetimes remain a separate contract.

NaN truthiness is a reproduced existing numeric difference, not changed here.
Full JavaScript compatibility, Cat Food repair, Android packaging and device
acceptance stay with their separate jobs. `gotchas` is unchanged because these
refactors do not change the documented language or operational contract.
