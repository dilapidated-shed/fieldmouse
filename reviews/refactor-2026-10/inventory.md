# Field Mouse architectural inventory

Review base: `07720d43eb6f9ec740719f34e29774efa8d34c50`, `master`.
Scope: existing Linux Idriç interpreter, without new language syntax, packaging,
Cat Food integration, or conventional-JavaScript implementation.

## Intent recovered

Read GOALS.md, CONVENTIONS.md, gotchas, README.md, ISSUES.md, all three active
Idriç files, package files, workflow, rejection fixtures, Node acceptance and
measurement runners, helper pairs, and sample-code checks. The goal remains
modifiable JavaScript with a future explicit conventional-JavaScript mode.
The implemented dialect is a smaller interim language. Its arrows, equality,
false literal, exact arity, source-order declarations, and Double semantics
must not silently acquire JavaScript behavior during refactoring.

## Current source map

Locations below name definitions in the review base, so later line shifts do
not change the inventory's meaning.

| Component | Definitions / files | Finding |
| --- | --- | --- |
| Public model | Fieldmouse.idric: `token`, `unary_operator`, `binary_operator`, `native_function`, `value`, mutual `expression`/`statement` | Closed operations exclude arbitrary operation strings. Expressions remain dynamically valued; this is not a statically typed JavaScript AST. |
| Scanner | `take_while` through `lex` | One character traversal into a token list; no source coordinates. Escapes and numbers deliberately differ from JSON. |
| Grammar | `parse_left_associative` through `parse` | Precedence tiers, recursive unary/assignment, chained postfix access. No repeated full-program parse found. Three block/list loops have similar structure but different termination diagnostics. |
| Primitive semantics | `render`, `truthy`, `number_from_value`, `same_value`, `coercive_equal`, `calculate_*` | Explicit Double and partial coercions. Do not change these during structural work. |
| Storage | `Aggregate`, `Closure`, `Runtime`, `lookup_entry`, `put_entry`, `bind_local`, `read_binding`, `write_binding`, allocation and property operations | Lists for names, cells, aggregate identities, function identities, and properties. Capture shares cells; calls restore caller bindings. |
| Pure paths | `normalize_components` through `path_dirname` | Natural independent module; lexical POSIX semantics, no host dependence. |
| JSON | `json_data`, scanner/parser, `import_json*`, `quote_json`, `serialize_json*` | Separate syntax tree converted into runtime storage only after successful parse. Path-local ancestor checks distinguish cycles from repeated references. |
| Host contract | `host_request`, `host_response`, `Host`, `native_request`, `validate_host_text`, `host_response_value` | Closed synchronous requests; response correspondence checked at runtime. File NUL checks precede actual calls. |
| Host lowering | `file_problem`, `file_host` | Files, environment, directories, escaped shell-backed subprocess. This is the narrow future direct-argv replacement point. |
| Execution | mutual `evaluate*`, `invoke*`, `execute*`; `run*` | State/effects explicitly threaded left-to-right; parse finishes before effects. Return and exit are separate state fields. Buffered logs are exposed only at the public run boundary. |
| CLI | Main.idric | Arguments, file input, output, exit status; diagnostics currently on stdout. |
| Acceptance | Tests.idric; tests/rejected; tests/acceptance.mjs; examples/sample-code | 74 existing language checks, four refusal fixtures, seven differential cases. Node is an oracle, not a runtime implementation. |

## History actually examined

- Last MuJS tree `c4db159`: src/jsparse.c (`jsP_error`, AST source lines,
  postfix grammar, function/program blocks), src/jsrun.c (environment chains,
  variable lookup, function calls and restored scope), src/jsproperty.c
  (hash-table properties, identity and resizing), src/json.c (separate JSON
  scanning, recursive materialization and cycle checks).
- `c8213d5` began the small Idriç interpreter; `331da8f` removed accidental
  recursive helper hazards. This cautions against cosmetic parser factoring.
- `1d50a3c` closed expression operations; `124007d` and `44c68a5` introduced
  and tested the host boundary; `8ffd5c4` established identities, shared binding
  cells, structured values, closures, JSON and the first helper runtime.
- The first-runtime attempt record explains why bytecode, prototypes, C stack
  control, MuJS GC and broad compatibility were not carried into the rewrite.

The old engine is a source of distinctions and counterexamples, not a fallback
or a mandate to copy its representation. No MuJS code enters this build.

## Dependencies and evidence limits

Pinned Idriç: `94dfd99bd3e376507fedc8611053b7173b2519f0`, Chez 10.4.1.
Current compiler source resolved separately during this review; exact results
belong in acceptance.md. The baseline bundle's payload hashes were checked.
ai-ci owns independent deterministic comparison; its verifier is not an LLM
architectural judgment. Flexible Pipes is a job/evidence integration dependency,
not an interpreter dependency. This task does not claim dispatch through FP.
Cat Food's previously recorded integration gap was not requalified here.
Android and physical-device evidence remain outside this job.
