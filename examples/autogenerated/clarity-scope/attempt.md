# Readable call-scope regression

The fixture is interpreted Field Mouse, not a replacement implementation.
Its input is fixed dialect Text; the actual CLI produces specified console
lines and status zero. It checks captured shared-cell mutation, local bindings,
left-to-right calls, and early return from a nested block and loop.

Core operations remain run : Text → IO (Either Text (List Text)) and
run_command : List Text → Text → IO (Either Text (List Text, Int)). The changed
Idriç evaluator will use a named caller-scope record and descriptive call steps.
Only the caller's bindings, return context and depth are restored; cells,
objects, logs and exit state survive. No filesystem/process operation is needed.

Run the baseline and refactored CLIs against acceptance.fm, then have the
existing ai-ci equality verifier compare actual output with acceptance.expected.
A capture in which the global mutation is lost must fail. Idriç/Chez Linux
is the established backend. No new compiler capability or fallback is expected.

Public_api.idric also compiles against the public facade, checks lex/parse/render
and executes run. Its observable result is `public source API: pass`, status zero.
This checks that moving types and implementations has retained the old imports.
