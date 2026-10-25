# Readable interpreter structure

Purpose: a human must be able to find a behavior, read its named steps, and
maintain it without an LLM. This refactor follows the human's explicit priority:
readability, descriptive snake_case names, function composition and file ownership.

## Types and invariants before editing

Input remains dialect source Text. Parsing returns Either Text (List statement).
The checked operator, native-function and host-request choices stay closed.
Evaluation threads Runtime through IO (Either Text (value, Runtime)); filesystem
and subprocess operations belong to the concrete host, not to syntax or storage.
Public run/parse/lex/render entry points retain their names and types.

Bindings map names to shared cells. Declaration creates a new cell; assignment
updates an existing cell or creates a binding. Function entry uses the captured
name map, and return restores the caller's map while retaining shared-cell and
object mutations, output and program-exit state. Source order, short circuiting,
error text, object key order and separate function-return/program-exit behavior
are compatibility requirements. No numeric, grammar, dependency or backend
change is intended. The established Linux Idriç/Chez compiler remains selected.

## Planned ownership

Language_types owns the interpreter vocabulary; Tokenize_source and Parse_source
own the dialect frontend. Primitive_values owns conversions/display/operators.
Runtime_storage owns identities, cells and properties. Evaluate_program owns
the mutually recursive expression/statement/function-call execution. Built-in
execution takes already evaluated arguments, so it can live independently in
Builtin_functions. Host_interface owns requests/responses; System_host owns OS
effects. Json_syntax owns independent JSON data/text grammar; Json_runtime_values
owns conversion through interpreter storage. Posix_paths owns lexical paths.
Fieldmouse remains the public entry point and Main the CLI.

Cross-module visibility will expose only what the receiving module needs.
Splitting must not create a generic Utils module or circular imports. The
isolated rejection harnesses must receive the whole source module directory,
and must continue to fail for their intended typed-operation diagnostics.

## Implemented result

The public entry point is 55 lines, with twelve responsibility modules and
an indexed source guide in Fieldmouse/README.md. The parser, JSON grammar,
runtime storage and system host have separate imports. The evaluator and its
mutually recursive expression/statement/call operations remain together.
Built-ins consume evaluated values and never import the evaluator. The host
adapter knows no AST or Runtime. Module interfaces expose the required types
and operations; storage internals are not re-exported by the facade.

Names describe declaration versus assignment, evaluation order, conditional
truth, coercion, identity allocation and response import. Function calls now
read as argument/depth checks, saving the caller, entering captured scope,
binding parameters, executing the body and restoring the caller. Caller_scope
names the three fields restored; it does not replace the mutated shared heap.
Unicode JSON escape decoding has separate named validation steps. Existing
tuple interfaces remain at the public API and low-level evaluation seams;
this refactor does not introduce a new effect framework.

Tests are grouped into eight named behavior suites. Nine new checks cover
captured-cell sharing, redeclaration, nested calls and shared mutation, early
return through loops, omitted return, both arity errors and the depth boundary.
All nine also passed against the unchanged merged interpreter at the review
base. A readable .fm fixture and public source-API program accompany them.
The old private direct-value Environment helpers are removed. This overlaps
the already-open environment cleanup, whose two capture characterizations are
retained here. No separate implementation of binding semantics is introduced.

## Local acceptance

Review base: 367c1c6293098d581b3f68e230a5a41ae95f851a. Baseline packages,
83 existing checks, four refusals, seven Node differential cases, host/CLI/
fresh-copy acceptance and five public examples passed before the split.

Implementation commit 1a77c92f1ddad13fce28d707982736c5f9b35f02 passed 92
language checks, command/test builds, all four refusals, seven Node cases,
host/CLI/fresh-copy checks, five examples and the executed lex/parse/render/run
facade check with both compiler paths:

- Pinned Idriç 94dfd99bd3e376507fedc8611053b7173b2519f0, verified Linux bundle.
- Current compiler source 0e8cfdd1106ebdeffd01b6c519880ea3afc7dc35, rebuilt
  locally using the pinned libraries/support. This local result is compiler
  compatibility evidence, not a newly bootstrapped full-current library build.

The subsequent visibility/import-only commit 073d704 also built and passed
all 92 pinned language checks. Hosted results must name their own final head.

ai-ci 32cb45b3a3a257aeb07881c75f3b846495cfb2c9 independently checked actual
CLI captures against clarity.contract.tsv. Both compiler-built executables
passed. Changing the observed shared value from 5.0 to 0.0 was rejected with
AICI-FIELDMOUSE-CALL-SCOPE and exit 1; restoring actual execution passed again.
The unchanged verifier binary is SHA-256
8077799a817d100398f271097b2c583250655bf0adbe767c12cdeafd2d333da8.
This is a deterministic independent output check, not an LLM review.

The first split exposed missing cross-module visibility, a misplaced indent
and a formerly mutual forward reference; compilation rejected them and they
were repaired. A rename pass briefly substituted JavaScript's inherited
constructor property for the Idriç constructor keyword; compilation rejected
it and the edit was repaired. The public API probe initially used an invalid
source-path invocation; the maintained runner now links it into the same
isolated module tree used for rejection checks and builds/runs it there.
No fallback compiler, language or runtime was substituted.

Reproduce with the two package builds, build/exec/fieldmouse-tests,
IDRIC=<compiler> node tests/acceptance.mjs [command], and
sh examples/sample-code/check.sh [command]. Current local builds use
--build-dir build-current and the pinned idric-env for runtime library paths.
Run the CLI against examples/autogenerated/clarity-scope/acceptance.fm and
use `aici verify reviews/refactor-2026-10/clarity.contract.tsv .` after capturing
its stdout into build/clarity-observed.txt.

No speed improvement is claimed. Source locations, retained-memory growth,
linear identity lookups, numeric semantics and broader JavaScript compatibility
remain separate work. gotchas behavior is unchanged.

clarity-publication.tsv maps the local commits named above to their published
commits with verified identical Git trees. Commit metadata differs; tested
source bytes do not. The mapping itself is documentation, not executable code.
