# Field Mouse conventions (current implementation)

These conventions describe the **current Field Mouse dialect**, not standard
ECMAScript and not the proposed conventional-JavaScript mode. They are grounded
in `Fieldmouse.idric`, `Tests.idric`, and the helper acceptance corpus.
Changes to the dialect should change the tests, examples, and [gotchas](gotchas)
together.

## Source spelling

| Meaning | Field Mouse | Not interchangeable with |
| --- | --- | --- |
| Assign to a name or property | `destination ← expression` | JavaScript `destination = expression` |
| Assign rightward | `expression → destination` | No JavaScript equivalent operator |
| Equality with limited coercion | `left = right` | JavaScript `==` |
| Inequality with limited coercion | `left ≠ right` | JavaScript `!=` |
| Strict equality | `left ≟ right` | JavaScript `===` |
| False literal | `Ø` | JavaScript `false` |
| True literal | `true` | — |
| Logical negation, and, or | `!`, `&&`, `||` | Return values/short-circuiting follow current interpreter |
| Arithmetic | `+`, `-`, `*`, `/` | `%` is parsed but fails at evaluation |

`÷` in the Idriç evaluator's implementation is NOT a supported spelling
for division in Field Mouse scripts: source division uses `/`.
The lexer recognizes JavaScript-like `==`, `===`, `!=`, and `!==`
tokens but the expression grammar does not accept them as operators.

Use UTF-8 source for `←`, `→`, `≠`, `≟`, and `Ø`.
Keep syntax examples honest about the actual parser.

## Declarations and control

```text
var value ← 6 * 7;
var saved;
value → saved;
if (saved ≟ 42) console.log("correct");
while (saved > 0) { saved ← saved - 1; }
```

`var`, `let`, and `const` currently act as provisional aliases for the
same declaration operation. They do not implement JavaScript's distinct
scoping, temporal-dead-zone, or immutability rules. Function declarations
execute in source order; blocks do not establish JavaScript block scope.
Reading an unknown name is an error. Assignment to an unknown name currently
creates a binding.

Semicolons can separate expression/declaration statements, but this is not
JavaScript automatic semicolon insertion. Do not assume a trailing semicolon
after a function declaration, or trailing commas in arrays/objects, work.
There are `if` / `else` and `while`; `for` and `try` / `catch` are
not part of the dialect.

## Values, properties, functions

Numbers are `Double`; arrays and objects have distinct interpreter-owned
identities, and aliases share mutation. Nested literals, property access,
computed indices, and lexical closures work. Missing array slots and object
properties read as `undefined`. Array `length` is readable, but cannot
be assigned. Array indices must be canonical nonnegative integers; this is
not JavaScript's general array-as-object property model.

Functions have **exact argument counts**, lexical captures, and no implicit
method receiver (`this`). Call depth is limited to 256. `var` bindings in
functions are local to those calls, while closures retain the binding cells
they captured. There is no general prototype chain or collection method set.

Arithmetic/coercion/equality follow the implemented operations, not the
full ECMAScript conversion algorithms. `console.log` uses a small display
renderer, not Node's inspection formatting.

## Host and data APIs

These names, rather than Node's standard objects, are current entry points:

- `arguments()`, `environment(name)`, `exit(integerStatus)`.
- `readText(path)`, `writeText(path, text)`, `appendText(path, text)`,
  `fileExists(path)`, `listDirectory(path)`, `createDirectory(path)`.
- `joinPath(parts...)`, `normalizePath(path)`, `basename(path)`,
  `dirname(path)` (lexical POSIX paths).
- `parseJson(text)`, `stringifyJson(value)`.
- `subprocess(program, denseTextArgumentArray)`, which returns an object
  with `status` and `stdout`. `console.log(...)` records display output.

Calls are synchronous. The host is a closed, typed request/response boundary,
but it is NOT a filesystem sandbox. The current subprocess adapter quotes
each argument and invokes an underlying shell-backed Idriç adapter; it is
not direct `execvp`. Consult [gotchas](gotchas) before processing untrusted
source or assuming Node-compatible process behavior.

## Files and tests

Use `.fm` for **examples of the experimental dialect**, and `.js` /
`.mjs` for explicit conventional-JavaScript reference code. This is a
repository convention, not a parser mode selected by an extension.

The executable accepts `fieldmouse -e 'SOURCE'` or
`fieldmouse path/to/source.fm [arguments...]`. The compiler is required
to build, not to run the compiled host artifact; the latter still requires
its declared Chez/runtime files.

- Positive syntax and runtime tests: `Tests.idric`.
- Deliberately rejected structures: `tests/rejected/`.
- Differential task comparisons against Node: `tests/helpers/`.
- Human-readable, executable examples: `examples/sample-code/`.
- Current omissions and nonstandard behaviors: top-level `gotchas`.

When adding a feature, add a positive case and, where meaningful, a
negative/compatibility case; document whether it belongs to the Field Mouse
dialect, proposed JavaScript mode, or both.