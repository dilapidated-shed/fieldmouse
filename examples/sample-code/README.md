# Field Mouse examples

These small examples demonstrate the **currently supported Field Mouse
dialect**, not a general JavaScript implementation. Run them after compiling
the repository:

```sh
idris2 --build fieldmouse.ipkg
sh examples/sample-code/check.sh
```

Or run individual examples with `build/exec/fieldmouse`:

| File | What it demonstrates |
| --- | --- |
| `01-arrows.fm` | Both assignment arrows, coercive/strict comparisons |
| `02-collections.fm` | Arrays, objects, aliases, properties, missing array slots |
| `03-closures.fm` | Lexical closures, repeated function calls |
| `04-json.fm` | JSON parsing, nested mutation, serializing and re-parsing |
| `05-host-files.fm` | Text-file effects with an explicit caller-chosen output path |
| `standard-javascript-reference.js` | Ordinary JavaScript that Field Mouse **does not yet accept** |

Each successful `.fm` example prints one short `pass` line and exits with
status 0; its own checks call `exit(nonzero)` on failure. The script runner
supplies a temporary file path to the file-I/O example and cleans it afterward.

`standard-javascript-reference.js` is runnable in an ordinary JavaScript
environment such as Node. It is deliberately not a Field Mouse test:
it demonstrates the original **goal** of accepting existing JS syntax,
which is still unimplemented.

The existing `tests/helpers/*.fm` / `*.mjs` pairs are more elaborate
differential examples checking representative build-helper tasks against Node.
Consult the top-level [gotchas](../../gotchas) before assuming a normal
JavaScript program will work.