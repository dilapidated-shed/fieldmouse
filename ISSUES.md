# Field Mouse backlog

The GitHub issue tracker is disabled; this file records remaining runtime work.

## First useful runtime: implemented and verified

Arrays, objects, nested mutation, ordinary/property calls, functions, parameters,
return, lexical/local binding cells, closures, and self recursion are implemented
in Idriç. Strict JSON, argv, environment, lexical paths, directory listing/creation,
text files, deliberate exit, and subprocess status/stdout are implemented.
The typed injectable host and compile-time refusals remain tested.

Five helper tasks have Node references: generation, directory processing, JSON
updates, subprocess orchestration, and structured request-log append. The last
minimizes an actual cloud-storage-api script. Exact omitted constructs and the
comparison contract are in `tests/helpers/README.md`.

The old arrays/objects, functions/calls, text-I/O, small build-script surface,
compiler-drift, and corpus milestones are superseded by this first-runtime
acceptance gate. Local execution and hosted exact-head checks prove the corpus;
the hosted receipt is in the engineering note. CI repeats the full corpus for
each supported head with pinned and resolved-current compiler revisions.

## 1. Cat Food integration follow-up

Inspection at Cat Food `62ac940588f5ee4c5be468d48e38d74514da3757` found:
- `tools.tsv` still selects `edric-rewrite`, not active `master`.
- `build-tools.sh:build_fieldmouse` uses `=` assignment and `===` comparison
  in its smoke source; both contradict the current language contract.
- `update-tools.ysh` links the generated command into stable bin. This works
  when its generated Chez interpreter path remains available; copying a release
  artifact requires preserving or deliberately relocating that runtime path.
- `android/delivery.tsv` explicitly reports `gap:android-package-missing`.

Required change: follow the accepted master revision, use arrow assignments and
`≟` in the build smoke, retain the compiled app directory and declared Chez
runtime, then prove a fresh stable-bin invocation. No Cat Food source was changed
by this drive. No Cat Food rewrite or phone-side compiler bootstrap is required
by this host runtime drive.

## 2. Direct subprocess adapter

The closed `subprocess_request Text (List Text)` interface is implemented.
The initial file host uses Idriç's escaped synchronous process adapter, which
quotes each argument and uses a shell internally. It captures stdout and
inherits stderr. Replace only this host lowering with direct argument-vector
execution when the supported compiler/runtime supplies it. Acceptance:
literal spaces, quotes, newlines, semicolons, and command-substitution text stay
literal; missing executables and failed children return nonzero status.
The evaluator and host interface need no replacement.

## 3. Concrete unsupported constructs

Deliberately outside this gate:
- ES-module/CommonJS imports, npm loading;
- async functions, Promise construction, event listeners and server lifetimes;
- Buffer.concat, object spread, optional chaining, nullish coalescing;
- template interpolation;
- prototypes/classes/Proxy, automatic `this`, declaration hoisting;
- variadic/default parameters, array methods and length mutation;
- for loops; remainder (existing explicit error);
- file removal/rename/status APIs not needed by this corpus;
- callback/event/readiness lifetime contract;
- binary values, arbitrary object coercion, long-lived heap collection.

Add a feature only when a concrete useful helper demonstrates the need, and
record its exact failing construct and required observable result.

## 4. Runtime packaging boundaries

The current supported host artifact is a compiled Chez program plus generated
launcher/support library; Chez is a declared runtime dependency. It is not one
self-contained ELF. Executable size/dependencies/startup are measured by
`tests/measure.mjs`. Runtime acceptance excludes the compiler and Node as
required dependencies, and proves execution with Petite.

Android packaging/ABI qualification and physical A1/C67 behavior remain separate
deployment work. Host execution does not establish phone installation or launch.
