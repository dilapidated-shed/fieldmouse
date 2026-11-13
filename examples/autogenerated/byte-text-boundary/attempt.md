# Byte and Unicode boundary for small data helpers

Base: `1b18318de1a69991d080df4ea9625a21da9b1cd7`.

## Type sketch before implementation

The BME TSV helper needs original file bytes, explicit Unicode scalar access and
text construction. Existing Field Mouse exposes only whole text and text length.

`codePoints(text)` is pure: return an interpreter-owned dense array containing
the Unicode scalar numbers in that text. `fromCodePoints(array)` is pure:
validate a dense array of finite integral scalars from 0 through 0x10FFFF excluding
surrogates, then produce text. Empty values round trip. The scalar domain is
explicitly different from UTF-16 code units or encoded UTF-8 bytes.

`readBytes(path)` is effectful: a checked text path becomes a closed
`read_bytes_request`; the host returns closed `bytes_response (List Bits8)`.
The runtime imports those bytes as a dense interpreter-owned array of exact
numbers 0 through 255. Original bytes are not decoded or normalized. Invalid
path/arity/type and mismatched host response fail as existing APIs do.

The host uses Idriç's existing `System.File.Buffer` and `Data.Buffer`, with a
file-size allocation, explicit read-count check, automatic close through withFile,
and checked bounds iteration through the resulting buffer. No Node, foreign Python,
new C adapter, implicit text decoding or alternate interpreter is introduced.

## Intended evidence

Build through the parent's acquired verified Idriç revision
`94dfd99bd3e376507fedc8611053b7173b2519f0`. Add executable empty/ASCII/non-BMP/NUL
scalar round trips, malformed scalar arrays and host-response controls. Real
binary bytes must retain 0 and 255 and malformed UTF-8 without text conversion.
No execution result was claimed before the actual build/tests ran.

## Actual execution, 2026-11-13

The parent built owned Idriç source
`94dfd99bd3e376507fedc8611053b7173b2519f0`; its executable reports
`Idris 2, version 0.8.0-94dfd99bd`. The first direct app build lacked the compiler
prefix and failed at `Module Prelude not found`, before these modules were
checked. Following the existing Field Mouse CI prefix contract resolved it.

Executable: `/workspace/scratch/17039cda87c1/idric/_/build/exec/idris2`.
Required build settings: `CHEZ=/workspace/scratch/17039cda87c1/idric/_/.tools/bin/scheme`
and `IDRIS2_PREFIX=/workspace/scratch/17039cda87c1/idric/_/bootstrap-build`.
With the project directory explicitly selected, `--build fieldmouse.ipkg` passed.
The first `--build tests.ipkg` rejected a trailing do-pattern with no final
expression. Adding `pure ()` fixed that source error; the next test build passed.

`build/exec/fieldmouse-tests` passed all 114 checks: 92 retained and 22 new.
The new cases include a real five-byte file containing 0,65,255,128,10 and a
zero-byte file, plus scalar rejection and injected-host response checks.
The owned compiled runtime executed directly, without Node or compiler-prefix
settings. `execution.tsv` binds the changed source digests and exact test log.
The test log is retained as `language-tests.log` in this directory; the original
workspace log is `/workspace/scratch/17039cda87c1/fieldmouse-language-tests.log`.
The three inherited compiler-refusal fixtures also failed at their intended
closed unary/binary/native operation boundaries under this compiler.

An independent read-only review checked the scalar/byte distinction, withFile
cleanup, short-read validation and the BME consumer's syntax. It found no definite
source defect. This review is supplemental to actual build/execution evidence.
Host Linux/Chez execution does not establish Android or physical-device behavior.
