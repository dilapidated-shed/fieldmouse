# Characterize the active binding model

These `.fm` programs test the language being interpreted, not a replacement
interpreter. Input is fixed dialect source; output is two specified text lines.
The first program distinguishes a captured cell from a later declaration of
the same name. The second returns two closures over one local cell and checks
that updates from one are visible to the other. Only buffered console output
is observable; no file/process host operations are required.

The same cases were added to Tests.idric and passed before deleting any source.
The obsolete `Environment` alias and direct-value helpers are private, with no
active callers. The actual model remains `Runtime.bindings` plus shared cells.
Use the actual compiled Field Mouse CLI and ai-ci's existing equality verifier
against `acceptance.expected`. A deliberately changed capture must be refused.
No Idriç compiler capability or alternate implementation is needed.
