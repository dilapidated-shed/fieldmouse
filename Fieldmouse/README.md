# Find the behavior you want to understand

Start with [../Fieldmouse.idric](../Fieldmouse.idric): parse the program, create
its runtime, execute its statements, collect output and status. The public
`run`, `run_command`, `run_with_host`, `run_command_with_host`, `parse`, `lex`
and `render` names remain available through that entry point.

| Question | Read |
| --- | --- |
| What can the language represent? | [Language_types.idric](Language_types.idric) |
| How are comments, words, strings and symbols read? | [Tokenize_source.idric](Tokenize_source.idric) |
| What does a source expression mean grammatically? | [Parse_source.idric](Parse_source.idric) |
| How do numbers, equality, truth and console display work? | [Primitive_values.idric](Primitive_values.idric) |
| How do variables and mutable objects keep their identity? | [Runtime_storage.idric](Runtime_storage.idric) |
| How do statements, expressions and user functions run? | [Evaluate_program.idric](Evaluate_program.idric) |
| How are built-in arguments checked and results imported? | [Builtin_functions.idric](Builtin_functions.idric) |
| What may the interpreter ask its host to do? | [Host_interface.idric](Host_interface.idric) |
| Which operations actually touch the operating system? | [System_host.idric](System_host.idric) |
| Which JSON text is accepted and how are escapes decoded? | [Json_syntax.idric](Json_syntax.idric) |
| How do JSON and interpreter-owned values connect? | [Json_runtime_values.idric](Json_runtime_values.idric) |
| How are POSIX paths manipulated without accessing files? | [Posix_paths.idric](Posix_paths.idric) |

## Read a user-function call

In Evaluate_program, `call_function_in_running_program` finds the captured
function, checks argument count and depth, remembers the caller, enters the
captured scope, binds parameter values, executes the body and restores the
caller. Each of those steps has a named helper.

A variable binding maps a name to a **cell identity**. The cell contains the
current value. Capturing a binding retains that identity, so closures share
later changes. A new declaration creates another cell even for the same name.
The `Caller_scope` record names the fields restored after a call: bindings,
return context and depth. Changed cells, objects, output and exit status stay.

## Keep the boundaries clear

Language_types contains vocabulary, not execution. Tokenization and parsing
import no runtime storage or system host. Json_syntax is independent of the
dialect frontend and runtime. Json_runtime_values bridges JSON and storage.
Builtin_functions receives values whose argument expressions have already run;
it never calls the evaluator. System_host imports only the host contract and
platform libraries, not language expressions or runtime storage.

Expression evaluation, statement execution and user-function calls remain
together because they are mutually recursive. No circular module imports or
generic Utils module are needed. Record constructors are available to internal
modules that inspect/update them; the public facade does not re-export storage.
