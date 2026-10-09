# Field Mouse

Field Mouse is a small standalone scripting command for ordinary filesystem,
data, and build-helper tasks that should not need Node. Its active interpreter
is written in **Idriç**, with deliberately smaller language and its own syntax.
The original MuJS-derived C runtime remains in Git history as a semantic
reference, outside the active build.

## Run a script

```text
fieldmouse script [arguments...]
fieldmouse -e 'var xs ← [6, 7]; console.log(xs[0] * xs[1]);'
```

The example prints `42.0`. Errors return status 1 with a diagnostic. `exit(n)`
returns an integer status from 0 to 255 and stops later effects.
Console output is collected and printed after successful interpretation,
including deliberate exit; a runtime failure discards collected log output.
File and subprocess effects occur synchronously.

## Language

- `name ← value` and `value → name` assign toward the destination.
- `=` compares with existing primitive coercion; it never assigns.
- `≠` is inequality, `≟` strict equality, and `Ø` false.
- Decimal numbers, text, Boolean, null, undefined, bindings, blocks,
  arithmetic/comparisons, short-circuit Boolean operations, if/else, and while.
- Arrays, nested values, indexed reads/writes, and read-only `length`.
- Plain objects, named/computed properties, mutation, and chained calls.
- Functions, parameters, local bindings, return, lexical captures, and closures.
  Self recursion works; call depth beyond 256 fails explicitly.

```text
function twice(x) { return x * 2; }
var person ← {name: "Ada", age: 36};
var xs ← [person, {run: twice}];
xs[0].age ← 37;
console.log(person.age, xs[1].run(21));
```

Arrays/objects have identity: aliases share mutation and strict equality compares
identities. Missing object properties/array slots return undefined. Array writes
grow length and leave intervening slots absent. Indices must be canonical
nonnegative integers; arbitrary named array properties and length mutation are
unsupported. Assignment evaluates owner, key, then value once each.
Object literal properties evaluate left to right; the last duplicate key wins.

Functions capture visible binding cells at definition. Assignment changes a
captured cell; a local declaration creates a fresh cell. Calls restore the
caller's binding map while preserving shared mutations. Calls require exact
parameter arity. Declarations execute in source order without hoisting.
Property calls invoke the stored function without an implicit `this`.
Blocks preserve existing function/global binding scope. `var`, `let`, and
`const` remain provisional aliases; full const/let behavior is not claimed.

## Data and host surface

| Operation | Contract |
| --- | --- |
| `parseJson(text)` | Strict null/Boolean/number/text/array/object parsing, Unicode escapes and surrogate pairs; malformed/trailing input fails. |
| `stringifyJson(value)` | Ordinary structured data; cycles, functions, undefined, and nonfinite numbers fail. Missing array slots become null; shared acyclic references are allowed. |
| `arguments()` | Array of arguments after script name, or after the `-e` source. |
| `environment(name)` | Text or undefined if absent; empty stays empty. Invalid names fail. |
| `joinPath(parts...)` | POSIX lexical join/normalization; an absolute part resets preceding path. |
| `normalizePath(path)` | Removes redundant separators/dots; preserves leading relative `..`; never climbs above absolute root. Empty result is `.`. |
| `basename(path)`, `dirname(path)` | Name and parent of the normalized lexical path. |
| `readText(path)` | Complete text; errors identify operation/path. |
| `writeText(path, text)` | Create/truncate without creating parents; returns undefined. |
| `appendText(path, text)` | Create/append; returns undefined. |
| `fileExists(path)` | Existing file-host existence behavior. |
| `listDirectory(path)` | Sorted entry names excluding dot entries; no recursive traversal. |
| `createDirectory(path)` | Create one directory; missing parents/existing destination fail. |
| `subprocess(program, args)` | Program text and dense text-argument array; returns `{status, stdout}`. |
| `exit(status)` | Checked integer 0–255; stops execution. |

JSON number formatting/key order are not Node byte-format compatibility.
Numbers retain the interpreter's explicit Double representation.
Paths are lexical, not a filesystem sandbox. File text/path arguments containing
NUL fail explicitly rather than being truncated.

The first subprocess host uses Idriç's existing escaped process adapter:
each argument is quoted independently before the underlying synchronous shell
adapter runs it. Field Mouse accepts no shell command string and adds no shell
parser. Stdout is captured; stderr and current environment/directory are
inherited. Missing programs produce nonzero status. Direct exec-vector lowering
remains a specific host-adapter improvement; this adapter is not claimed to use
execvp or provide Node spawn compatibility.

## Closed host boundary

Effects become a closed `host_request` after dynamic arguments are checked.
A closed `host_response` must match the request. No arbitrary operation-name
string, opaque pointer, or unrestricted FFI crosses that boundary.
Native functions are closed function values, so ordinary calls/aliases preserve
the same boundary. Aggregate/function identities belong to interpreter storage.

`run_with_host` and `run_command_with_host` accept an injected host; the latter
also returns deliberate exit status. JSON/paths and collected console output use
interpreter-owned data. The host remains synchronous request/response.
Future TCP/timer/readiness/Binder capabilities can add checked choices/adapters.
Event streams, callbacks, cancellation, and lifetimes need a separate explicit
contract rather than being hidden inside synchronous requests.

## Build, installation, and acceptance

CI tests the reproducible full-SHA pin
`94dfd99bd3e376507fedc8611053b7173b2519f0` and exact resolved current Idriç.
The older `61970be77769f607cca8650bf424c0f0b22ddee7` predates the current
Number/Text/Unicode-equality surface and is replaced. The pinned compiler also
accepts `÷` in the evaluator's Idriç arithmetic; Field Mouse source syntax keeps
its existing `/` operator. Later compiler drift remains independently checked.

```text
idris2 --build fieldmouse.ipkg
idris2 --build tests.ipkg
build/exec/fieldmouse-tests
node tests/acceptance.mjs
node tests/measure.mjs
```

Set `IDRIC` to the compiler executable for the acceptance runner's four
compile-time refusals. The retained `tests/check-type-boundaries.sh` proves the
three original refusals. Node is an explicit differential oracle/acceptance
checker, never a dependency of the resulting Field Mouse runtime.

The supported build produces a compiled Chez payload, a small support library,
and the compiler-generated launcher. Install the launcher and
`fieldmouse_app/*.so` beside it, or expose the original launcher through a
stable bin symlink. The runtime needs Chez at the payload's generated interpreter
path, libc/libm, and standard Unix launcher utilities. It does not need Idriç
compiler or Node. Fresh-copy acceptance removes compiler prefix settings and
omits generated source. Petite runtime execution is also proven.
This build is not advertised as one self-contained ELF file.

See [the acceptance note](examples/autogenerated/first-runtime/attempt.md) for
the type sketch, MuJS audit, exact evidence, size, and Cat Food follow-up.
See [the helper corpus](tests/helpers/README.md) for provenance and exact
unsupported constructs found in a real repository script.

## Deliberate limits

No npm, modules, prototypes, classes, promises, async/await, event loop, streams,
Proxy, typed arrays, Buffer, Web APIs, or broad fs/path/process compatibility.
No hoisting, automatic method receiver, variadic/default parameters, array
methods, for loops, template literals, or object-coercion callbacks.
Remainder remains the existing explicit unsupported-operation error.
Missing properties do not make unknown global variables silently succeed.

Storage identities remain for the script's lifetime: this first runtime serves
small helpers, not long-lived services or large-data heaps. Android packaging
and physical acceptance remain separate from Linux host-runtime evidence.

## Layout and license

`Fieldmouse.idric` owns the model, parser, evaluator, pure data operations, and
closed host. `Main.idric` owns CLI execution; `Tests.idric` owns language and
injected-host checks. Package files and CI retain the build path.
The new `tests/` corpus and `examples/autogenerated/` records hold acceptance
and provenance, not an alternate runtime.

Original MuJS-derived notices remain in history and `COPYING`.
