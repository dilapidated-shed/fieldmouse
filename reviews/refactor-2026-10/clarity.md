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
