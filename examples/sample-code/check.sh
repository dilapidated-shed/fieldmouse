#!/bin/sh
# Smoke-test public Field Mouse examples; run with sh, no executable bit needed.
set -eu

root=$(CDPATH='' cd -- "$(dirname -- "$0")/../.." && pwd)
if [ "$#" -ge 1 ]; then
    runner=$1
else
    runner=$root/build/exec/fieldmouse
fi
if [ ! -x "$runner" ]; then
    printf 'no Field Mouse executable at %s\n' "$runner" >&2
    exit 2
fi

for example in 01-arrows 02-collections 03-closures 04-json; do
    "$runner" "$root/examples/sample-code/$example.fm"
done

scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' 0
"$runner" "$root/examples/sample-code/05-host-files.fm" "$scratch/out.txt"
printf 'alpha\nbeta\n' > "$scratch/expected.txt"
cmp "$scratch/expected.txt" "$scratch/out.txt"
printf 'Field Mouse published examples passed\n'
