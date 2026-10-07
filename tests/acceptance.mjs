// Explicit Node differential oracle and external process/filesystem checker.
// It never implements or emulates Field Mouse.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const command = path.resolve(process.argv[2] ?? path.join(root, 'build/exec/fieldmouse'));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'fieldmouse-acceptance-'));
const environment = {...process.env, FIELDMOUSE_LABEL: 'build Ω'};
const run = (program, args, cwd, env = environment) => {
  const result = spawnSync(program, args, {cwd, env, encoding: 'utf8', timeout: 15000});
  assert.ifError(result.error);
  assert.equal(result.signal, null, `unexpected signal: ${result.signal}`);
  assert.notEqual(result.status, null);
  return result;
};
const inventory = dir => {
  const result = {};
  const walk = (current, relative = '') => {
    for (const entry of fs.readdirSync(current).sort()) {
      const full = path.join(current, entry);
      const name = path.join(relative, entry);
      if (fs.statSync(full).isDirectory()) { result[name + '/'] = 'directory'; walk(full, name); }
      else {
        const contents = fs.readFileSync(full, 'utf8');
        result[name] = name.endsWith('.json') ? JSON.parse(contents)
          : name.endsWith('.jsonl') ? contents.trimEnd().split('\n').map(line => JSON.parse(line))
          : contents;
      }
    }
  };
  walk(dir);
  return result;
};
const cases = [
  {name:'generate', args:['Ada', '3', 'hello.txt'], prepare(){}},
  {name:'generate', args:['a different name', '0', 'empty.txt'], prepare(){}},
  {name:'directory', args:['input', 'bundle.txt'], prepare(dir){
    fs.mkdirSync(path.join(dir, 'input'));
    for (const [name, contents] of [['z.txt','last'], ['a.txt','first'], ['two words.txt','λ']])
      fs.writeFileSync(path.join(dir, 'input', name), contents);
  }},
  {name:'json', args:['config.json'], prepare(dir){
    fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({
      items:[{name:'a', count:2}, {name:'b', count:9}], nested:{nil:null, truth:false, text:'line\n😀'}
    }));
  }},
  {name:'subprocess', args:["two words; $(touch MUST_NOT_EXIST) 'quoted' \nsecond"], prepare(){}},
  {name:'record', args:['PUT', '/upload/example', 'input.txt'], prepare(dir){
    fs.writeFileSync(path.join(dir, 'input.txt'), 'body with "quotes"\nand newline');
  }},
  {name:'generate', args:[], prepare(){}, status:64}
];
try {
  if (process.env.IDRIC) {
    const boundary = path.join(temporary, 'boundaries');
    fs.mkdirSync(boundary);
    fs.symlinkSync(path.join(root, 'Fieldmouse.idric'), path.join(boundary, 'Fieldmouse.idric'));
    for (const [fixture, diagnostic] of [
      ['ArbitraryOperator','unary_operator'], ['ArbitraryBinaryOperator','binary_operator'],
      ['ArbitraryNativeCall','native_function'], ['ArbitraryHostRequest','host_request']
    ]) {
      fs.symlinkSync(path.join(root, 'tests/rejected', fixture + '.idric'), path.join(boundary, fixture + '.idric'));
      const result = spawnSync(process.env.IDRIC, ['--check', '--build-dir', path.join(boundary,'build'), fixture + '.idric'],
        {cwd:boundary, env:environment, encoding:'utf8', timeout:120000});
      assert.ifError(result.error);
      assert.equal(result.signal, null);
      assert.notEqual(result.status, 0, fixture + ' compiled unexpectedly');
      assert.ok((result.stdout + result.stderr).includes(diagnostic), fixture + ': wrong refusal\n' + result.stdout + result.stderr);
      console.log('PASS compile-time refusal ' + fixture);
    }
  }
  for (const [index, test] of cases.entries()) {
    const directories = ['reference','fieldmouse'].map(kind => {
      const dir = path.join(temporary, `${index}-${kind}`);
      fs.mkdirSync(dir); test.prepare(dir); return dir;
    });
    const reference = run(process.execPath, [path.join(root, 'tests/helpers', test.name + '.mjs'), ...test.args], directories[0]);
    const actual = run(command, [path.join(root, 'tests/helpers', test.name + '.fm'), ...test.args], directories[1]);
    assert.equal(reference.status, test.status ?? 0, `bad Node reference: ${test.name}`);
    assert.equal(actual.status, reference.status, `${test.name}: status\n${actual.stdout}\n${actual.stderr}`);
    assert.equal(actual.stdout, reference.stdout, `${test.name}: stdout`);
    assert.equal(actual.stderr, reference.stderr, `${test.name}: stderr`);
    assert.deepEqual(inventory(directories[1]), inventory(directories[0]), `${test.name}: filesystem result`);
    console.log(`PASS differential ${test.name} case=${index} status=${actual.status}`);
  }
  const failures = [
    ['syntax','var answer = 42;', 'expected expression'],
    ['runtime','missing();', 'unknown variable'],
    ['arity','writeText("one");', 'expected 2 arguments'],
    ['host-argument','writeText(2, 3);', 'invalid argument types'],
    ['host-failure','readText("absent.txt");', 'readText'],
    ['directory-failure','listDirectory("absent-directory");', 'listDirectory'],
    ['mkdir-failure','createDirectory("absent-parent/child");', 'createDirectory'],
    ['json-failure','parseJson("{bad}");', 'malformed JSON'],
    ['exit-status','exit(23);', '', 23]
  ];
  for (const [name, source, diagnostic, status] of failures) {
    const result = run(command, ['-e', source], temporary);
    if (status) assert.equal(result.status, status, name);
    else {
      assert.notEqual(result.status, 0, `${name} returned false-green success`);
      assert.ok((result.stdout + result.stderr).includes(diagnostic), `${name}: missing diagnostic`);
    }
    console.log(`PASS failure ${name} status=${result.status}`);
  }
  const missingProgram = run(command, ['-e', 'var r ← subprocess("/fieldmouse/no-such-program", []); if (r.status = 0) exit(73);'], temporary);
  assert.equal(missingProgram.status, 0, missingProgram.stdout + missingProgram.stderr);
  const textIO = run(command, ['-e', 'console.log(fileExists("note.txt")); writeText("note.txt", "old"); writeText("note.txt", "alpha"); appendText("note.txt", " beta"); console.log(fileExists("note.txt")); console.log(readText("note.txt"));'], temporary);
  assert.equal(textIO.status, 0);
  assert.equal(textIO.stdout, 'false\ntrue\nalpha beta\n');
  assert.equal(fs.readFileSync(path.join(temporary,'note.txt'), 'utf8'), 'alpha beta');
  const nulPath = run(command, ['-e', 'readText(parseJson("\\"\\\\u0000\\""));'], temporary);
  assert.notEqual(nulPath.status, 0);
  assert.match(nulPath.stdout + nulPath.stderr, /NUL/);
  const stop = run(command, ['-e', 'writeText("must-not-write", exit(0)); console.log("must-not-log");'], temporary);
  assert.equal(stop.status, 0);
  assert.equal(stop.stdout, '');
  assert.equal(fs.existsSync(path.join(temporary, 'must-not-write')), false);
  const parseBeforeEffects = run(command, ['-e', 'writeText("parse-side-effect", "bad"); var x ← [1,;'], temporary);
  assert.notEqual(parseBeforeEffects.status, 0);
  assert.equal(fs.existsSync(path.join(temporary, 'parse-side-effect')), false);
  const noArgs = run(command, [], temporary);
  assert.notEqual(noArgs.status, 0);
  assert.match(noArgs.stdout + noArgs.stderr, /usage: fieldmouse/);
  const missingSource = run(command, ['absent-script'], temporary);
  assert.notEqual(missingSource.status, 0);
  assert.match(missingSource.stdout + missingSource.stderr, /cannot read/);
  const installed = path.join(temporary, 'fresh-install', 'bin');
  fs.mkdirSync(installed, {recursive:true});
  fs.copyFileSync(command, path.join(installed, 'fieldmouse'));
  fs.mkdirSync(path.join(installed, 'fieldmouse_app'));
  for (const name of fs.readdirSync(command + '_app').filter(name => name.endsWith('.so')))
    fs.copyFileSync(path.join(command + '_app', name), path.join(installed, 'fieldmouse_app', name));
  const installedResult = run(path.join(installed, 'fieldmouse'),
    ['-e', 'var xs ← [6, 7]; function product(x) { return x[0] * x[1]; } if (product(xs) ≠ 42) exit(74); console.log("installed");'],
    temporary, {...environment, IDRIS2_PREFIX:'', IDRIS2_PATH:'', IDRIS2_DATA:''});
  assert.equal(installedResult.status, 0, installedResult.stdout + installedResult.stderr);
  assert.equal(installedResult.stdout, 'installed\n');
  console.log('PASS fresh stable-bin install: compiler prefix removed, compiled payload only');
  console.log('PASS missing executable status, exit control, parse-before-effects, CLI failures');
} finally {
  fs.rmSync(temporary, {recursive:true, force:true});
}
