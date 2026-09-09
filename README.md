# Fieldmouse

Fieldmouse is a small language for the Node-style build-script work that should not require all of Node. Its active implementation is written in **Edriç**.

The repository started from MuJS. That C implementation remains recoverable from Git history; the active Edriç implementation is now on `master`.

## Language contract

The first syntax contract is deliberately small:

- `name ← value` assigns leftward;
- `value → name` assigns rightward;
- `=` compares with primitive coercion and is never assignment;
- `≠` is inequality;
- `≟` is strict, non-coercive equality;
- `Ø` is false.

Declaration families, full `let` / `const` scope behavior, the source-file extension, and any ordinary-JavaScript compatibility mode remain provisional. Tests do not silently settle those questions.

## Current slice

The Edriç interpreter currently has:

- primitive dynamic values represented by Edriç `choice` declarations;
- a lexer for identifiers, decimal numbers, strings, comments, and operators;
- precedence parsing for assignment, Boolean, comparison, and arithmetic expressions;
- provisional `var`, `let`, and `const` bindings;
- blocks, `if` / `else`, and `while`;
- `console.log(...)`;
- native text-file calls: `readText(path)`, `writeText(path, text)`,
  `appendText(path, text)`, and `fileExists(path)`;
- execution from `-e` or a source file.

The file calls are deliberately a Field Mouse surface, not a claim of Node compatibility. They operate on paths relative to the current working directory and do not create parent directories. `writeText` truncates or creates a file; `appendText` preserves existing contents or creates a file; both return `undefined`. Failed reads and writes identify the operation and path and return a failing process status.

This is intentionally smaller than ECMAScript and much smaller than Node. Arrays and objects, user-defined functions, property access, `fs`, `path`, `process`, directory operations, and binary buffers remain separate work.

## Build and test

CI builds with both the reproducible pinned Edriç revision and current Idriç `main`.

With either compiler available:

```text
idris2 --build fieldmouse.ipkg
idris2 --build tests.ipkg
build/exec/fieldmouse-tests
```

Then:

```text
build/exec/fieldmouse -e 'var answer ← 6 * 7; console.log(answer);'
build/exec/fieldmouse script
```

Parse errors, runtime errors, unreadable files, and invalid command lines return a failing process status.

The public expression tree carries parsed unary operators, binary operators,
and native function names as closed choices. Raw source text becomes one of
those choices at the parser boundary; arbitrary strings cannot be installed as
already-parsed operations. `tests/check-type-boundaries.sh` exercises those
compile-time refusals.

## Layout

The active code is intentionally flat:

- `Fieldmouse.idric` — language model, lexer, parser, and interpreter;
- `Main.idric` — command-line entry point;
- `Tests.idric` — executable language-contract tests;
- `fieldmouse.ipkg` and `tests.ipkg` — application and test builds.

The only directory retained is `.github`, for automated builds.

## License

The original MuJS-derived code and notices are preserved in repository history and `COPYING`.
