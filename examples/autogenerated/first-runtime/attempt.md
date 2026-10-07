# First standalone runtime

Base: `78f8e9fdc655f869d6f226c24850e5f09520ada8`.

## Type sketch before implementation

Dynamic script values remain a closed choice: primitives, aggregate identities,
user-function identities, and closed native-function values. Aggregate and binding
identities refer to interpreter-owned storage, never host pointers. Bindings use
shared cells so lexical captures and aliases see deterministic mutations.

Expressions produce a value and updated interpreter state, or a diagnostic.
Statements additionally carry return/exit control; neither is a fabricated value.
Functions retain parameter names, parsed bodies, and the lexical binding map.
Calling creates fresh local bindings; returning restores the caller's map while
preserving changes to shared cells and aggregate storage.

Host requests/responses stay closed and inspectable. New capabilities carry
validated text, text lists, optional text, or process status. JSON and paths are
pure data operations. Event/callback lifetimes remain outside synchronous Host.

JSON conversion recursively allocates aggregate identities; serialization tracks
the current ancestor path to reject cycles without rejecting shared acyclic data.
Missing properties/indexes yield undefined. Null/undefined access is an error.

Build target: host Linux x86-64 using the repository's Idriç/Chez build contract.
Compiler compatibility, executable/dependency size, real helper outputs, failure
status, and clean installation must be measured; source presence is not PASS.

## MuJS design audit

Reference: the last pre-rewrite tree, `c4db159`, especially `src/jsparse.c`
(`callexp`, `memberexp`, functions), `src/jsrun.c` (calls/environments/value
identity/coercion), `src/jsproperty.c` (property storage and array length), and
`src/json.c` (recursive structured data and ancestor-cycle checks).

MuJS already solved arbitrary chained postfix syntax, shared object identity,
lexical environments, return control, missing-property values, and JSON cycle
detection. Copy those semantic distinctions, with explicit smaller contracts.
Keep current Field Mouse primitive coercion; do not introduce object-to-primitive
callbacks or pretend it is ECMAScript conformance.

Do not bring forward prototypes, descriptor/getter machinery, constructors,
bytecode, C stack/longjmp control, its GC, revivers/replacers, or unrestricted C
extensions. Keeping Idriç preserves the checked choices and injectable closed host
boundary already established on master. The old C runtime is reference only.

## Execution record

Build/compiler source: `isomorphisms/Idric`
`ff4d852862a3942592f8ade9afde8d409d9803be`, current `Idriç` branch.
Observed compiler: `Idris 2, version 0.8.0-ff4d85286`.
Host: Ubuntu 24.04.3, Linux x86-64. Chez: pinned threaded 10.4.1.

The existing `./edric bootstrap` twice stopped in inherited RefC support
(`gmp.h` missing). A MAKEFLAGS omission did not propagate to that recursive
target and also failed. No RefC dependency was installed or used to execute
Field Mouse. Recovery used existing make targets: install only C/Chez support,
then `bootstrap-install -o install-support`, and rebuild `idris2-exec` with
the pinned Chez bin directory on PATH. The first final-compiler attempt missed
Scheme on PATH and failed with status 127; correcting PATH completed the build.
These are dependency-bootstrap observations, not Field Mouse runtime failures.
No compiler source was modified.

Source attempts exposed actual accepted syntax: choice alternatives require
lower snake_case, while record type/constructor names still require capitals.
The `parameters` token is reserved. Those rejected drafts were corrected in
this implementation rather than expanding compiler scope.

Local results:
- `idris2 --build fieldmouse.ipkg`: PASS.
- `idris2 --build tests.ipkg`: PASS.
- 74 executable language/structured-value/injected-host checks: PASS.
- Four focused compile-time refusal fixtures: PASS at their intended boundary.
- Seven Node-reference cases spanning five helper tasks: PASS.
- Parse/runtime/host/argument/JSON/directory errors return nonzero: PASS.
- Deliberate status 23 and missing-argument status 64 are preserved: PASS.
- Literal subprocess metacharacters remain literal; child failure/missing program
  are observed as nonzero status: PASS.
- Create/truncate/append/read/existence, parse-before-effects, and exit-before-
  later-effects: PASS.
- Fresh copied stable-bin launcher plus compiled runtime files, without source
  or compiler-prefix settings: PASS.
- Direct Petite runtime execution of compiled payload: PASS.

No Node fallback interpreter, external JSON package, C/MuJS runtime restoration,
or unrestricted host interface was introduced. Node files are explicitly
requested differential references and external acceptance/measurement checks.

## Footprint and installation evidence

At the locally measured runtime build:

| Component | Bytes |
| --- | ---: |
| Compiled Field Mouse payload | 192789 |
| Generated launcher | 429 |
| Idriç support shared library | 50624 |
| Minimal application files | 243842 |
| Chez executable plus petite/scheme boot files | 4408150 |
| Application plus declared Chez runtime | 4651992 |
| Node reference executable alone, this host | 125989464 |

Payload SHA-256:
`d79062f3c30b5b8c973095d5a2deafe9bea1b678f9e5b89bbf75fbf4a6bbbe6a`.
One startup smoke was 55 ms (one local sample, not a benchmark).
Dynamic dependencies: libc.so.6, libm.so.6, ELF loader, plus the supplied
libidris2_support.so. Chez/boot files are separate declared runtime files.
The compiled program is not a standalone single ELF, and its generated
interpreter path is absolute. Cat Food's source-workbench stable-bin link works
with that runtime available; cross-host artifact relocation must handle it.

Current Cat Food inspection was bound to
`62ac940588f5ee4c5be468d48e38d74514da3757`. Exact stale branch/smoke/runtime
assumptions are recorded in `ISSUES.md`. No other repository was modified.
Android packaging and physical acceptance were not run or claimed.

## Remaining language work

No compiler capability blocks the tested small-helper class. Existing current
Idriç accepts the runtime after the focused syntax corrections above.
The next specific host improvement is direct argument-vector subprocess
lowering, preserving the existing typed request and adversarial literal-argument
tests. Callback/event lifetimes remain separate architectural work.

Hosted CI must still prove the final published head before a full completion
claim. Local passing results are not relabeled as hosted evidence.
