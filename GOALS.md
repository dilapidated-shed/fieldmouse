# Field Mouse: purpose and direction

This file states the project's design intent. It is not a list of completed
features. For the actual supported language, see [CONVENTIONS.md](CONVENTIONS.md),
[gotchas](gotchas), and [README.md](README.md).

## Why Field Mouse exists

Field Mouse began as an attempt to have a small, understandable JavaScript
interpreter whose syntax and behavior could be deliberately changed. In
particular, assignment should not have to consume the equals sign: a writer
should be able to use directional assignment arrows and reconsider the meaning
of equality without inheriting every historical JavaScript convention.

An equally important part of the original idea was to **continue accepting
ordinary existing JavaScript**, rather than making people rewrite every script
to use the experimental notation. That compatibility goal has NOT been
implemented. The present interpreter recognizes its own JavaScript-like dialect;
it is not an ECMAScript or Node replacement.

The project began from an extended **MuJS**, a small embeddable JavaScript
interpreter in C, not V8 or MicroPython. In August 2026, the active runtime was
rewritten in **Idriç**. The original MuJS-derived C implementation survives in
Git history as a reference; it is no longer the runtime on the default branch.

## Long-term goals

1. Make the source, grammar, runtime semantics, host effects, and portability
   decisions small enough for a reader to find, inspect, and modify.
2. Offer a Field Mouse dialect in which assignment, comparison, literals, and
   future language choices can be changed intentionally, with documented
   examples and tests.
3. Add a **separate, explicitly selected conventional-JavaScript parsing mode**
   or equivalently clear compatibility boundary, initially aimed at useful
   existing scripts. A mode must not silently reinterpret conventional
   JavaScript `=` as Field Mouse comparison, or pretend that token substitution
   alone implements JavaScript semantics.
4. Reuse shared evaluation machinery where the two languages truly agree, but
   keep incompatible semantics explicit and separately testable.
5. Extend capabilities because real scripts need them, with small reproducible
   differential cases against an existing JavaScript implementation where
   compatibility is claimed.
6. Keep host access visible: file, process, environment, and future Android
   or other services should cross explicit checked interfaces.
7. Produce useful host executables with documented dependencies. Android/DEX
   would be an additional deployment route, not a prerequisite for the present
   Linux interpreter.

## What works on the current default branch

The Idriç implementation handles a deliberately small subset: expressions,
arrows, conditionals and while loops, arrays and objects with mutable
identities, functions and lexical closures, synchronous text/data/host helpers,
and JSON parsing/serialization. The reproducible compiler lane and the
current-compiler lane are covered by repository CI.

It does NOT interpret arbitrary `.js` files, supply Promise/event-loop
semantics, implement a complete standard library, run npm packages, or offer a
browser JavaScript engine. A filename ending in `.js` does not enable a
compatibility mode.

## Decisions that should be visible before expanding it

- Which ECMAScript editions or concrete script corpora does compatibility
  actually promise? Specify and test the boundary before advertising it.
- How are dialect and conventional-JavaScript modes selected, including file
  suffixes, CLI arguments, and embedded calls?
- Which grammar and evaluator operations share behavior, and which diverge?
- Which exact behaviors need compatibility (coercion, prototype lookup,
  hoisting, exceptions, callbacks, Promise scheduling, etc.)?
- Which differences are purposeful language experiments, rather than omissions?

## Acceptance direction

Maintain runnable dialect examples in [examples/sample-code](examples/sample-code),
a growing plain-text [gotchas](gotchas) inventory, and failing/positive tests for
each changed or added behavior. When a conventional JavaScript mode is introduced,
test unmodified JavaScript examples as such; do not silently rewrite them into
Field Mouse syntax and call that compatibility.

A clean public README should clearly distinguish intent, implemented behavior,
and future work. Small and changeable matters more than V8-like optimization
or a claim to broad standards compliance.