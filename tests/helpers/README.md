# Representative helper corpus

The Node files are explicit independent reference implementations, not runtime
dependencies or alternate Field Mouse implementations. Text artifacts and stdout
are compared byte for byte; JSON artifacts are compared as parsed data (number
spelling and object key order are not part of their build-data meaning).

| Fixture | Useful task |
| --- | --- |
| generate | Read positional arguments and a numeric count; generate text through a function. |
| directory | Sort and process several input files, create an output directory, join paths. |
| json | Read JSON, mutate nested arrays/objects through a function, add environment data, write back. |
| subprocess | Invoke an executable, preserve literal metacharacters in arguments, capture stdout, observe success and failure. |
| record | Append a structured request log from arguments, environment, and an input file. |

The record fixture minimizes the actual logging task in
`isomorphisms/cloud-storage-api/tests/google-drive-api-d-server.mjs` at
`74e8dccedb333df38578b6261ac484748de7b519`:
argument selection, a record literal, JSON serialization, and append to a log.
The HTTP server itself is out of this slice. Exact omitted constructs: ES-module
imports, async functions, Promise construction, event listeners, Buffer.concat,
optional chaining, nullish coalescing, object spread, template interpolation,
and node:http server lifetime. The first-runtime goal needs none of them for
this extracted logging task. The original remains authoritative in its own repo.

The other fixtures are new small examples of the same repository-helper class,
not copied third-party code. Cases use unrelated input names and varied values
to avoid accepting hard-coded sample output. No npm packages are used.
