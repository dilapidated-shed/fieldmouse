// Artifact/dependency receipt for the supported Linux Chez build.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const command = path.resolve(process.argv[2] ?? path.join(root,'build/exec/fieldmouse'));
const payload = command + '_app/fieldmouse.so';
const bytes = fs.readFileSync(payload);
const header = bytes.subarray(0, bytes.indexOf(10)).toString();
assert.ok(header.startsWith('#!') && header.endsWith(' --program'), 'unknown Chez payload header');
const scheme = fs.realpathSync(header.slice(2, -10));
const schemeDirectory = path.dirname(scheme);
const support = command + '_app/libidris2_support.so';
const row = (key, value) => console.log(key + '\t' + value);
row('artifact_kind','Chez compiled program plus generated launcher');
row('payload_bytes', bytes.length);
row('payload_sha256', createHash('sha256').update(bytes).digest('hex'));
row('launcher_bytes', fs.statSync(command).size);
row('support_bytes', fs.statSync(support).size);
row('minimal_application_bytes', bytes.length + fs.statSync(command).size + fs.statSync(support).size);
let runtimeBytes = 0;
for (const name of ['scheme','petite.boot','scheme.boot']) {
  const size = fs.statSync(path.join(schemeDirectory,name)).size;
  runtimeBytes += size; row('chez_' + name + '_bytes', size);
}
row('chez_runtime_bytes',runtimeBytes);
row('application_and_chez_bytes',runtimeBytes + bytes.length + fs.statSync(command).size + fs.statSync(support).size);
row('node_reference_bytes',fs.statSync(process.execPath).size);
for (const [name, executable] of [['scheme',scheme], ['support',support]]) {
  const result = spawnSync('ldd',[executable],{encoding:'utf8'});
  assert.ifError(result.error); assert.equal(result.status,0,result.stderr);
  row(name + '_linked_dependencies',result.stdout.trim().replaceAll('\n','; ').replaceAll('\t',' '));
}
const started = process.hrtime.bigint();
const smoke = spawnSync(command,['-e','console.log("startup-smoke");'],{encoding:'utf8'});
assert.ifError(smoke.error); assert.equal(smoke.status,0,smoke.stdout + smoke.stderr);
assert.equal(smoke.stdout,'startup-smoke\n');
row('startup_smoke','PASS');
row('startup_elapsed_ms',Number(process.hrtime.bigint() - started) / 1e6);
row('node_runtime_required','no');
row('idric_compiler_required_at_runtime','no');
row('chez_runtime_required','yes');
