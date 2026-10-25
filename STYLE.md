# Readability for a human maintainer

Refactoring primarily improves comprehension. A reader must be able to find a
behavior, follow named steps and change it without an LLM. File length and
execution speed alone do not justify restructuring.

- Use descriptive snake_case function and variable names. Include consequences
  such as creating a binding or restoring a scope when those distinguish the
  operation. Prefer meaningful steps over wrappers that merely rename syntax.
- Let orchestration read as the procedure it implements. Put lower-level work
  behind named operations and group definitions by responsibility.
- Keep files accountable to the boundaries in [Fieldmouse/README.md](Fieldmouse/README.md).
  Expose the names required by another module; keep local helpers private.
- Use Text/Data.Text and the supported Idriç arrows/equality notation. Preserve
  spellings inside interpreted source strings and public script APIs.
- Give comments to reasons, invariants and non-obvious encodings. Do not repeat
  what a descriptive name already says.
- Keep source order, closure-cell sharing, mutation, errors, return and exit
  visible. A helper must not conceal a semantic change behind a clearer name.
- Use named records when several fields have different roles, as Caller_scope
  does. Retain established public tuple interfaces for compatibility.
- Group tests by behavior. Show larger programs as readable .fm fixtures;
  retain positive, rejection and effect-order evidence when moving code.

The interpreter deliberately accepts nonterminating programs. Its covering
contract is explicit; use neither totality claims nor another backend to hide
that fact. Numeric and conventional-JavaScript semantics remain separately
specified language work.
