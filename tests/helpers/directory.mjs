import fs from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
if (args.length !== 2) process.exit(64);
const names = fs.readdirSync(args[0]).sort();
fs.mkdirSync("out");
function entry(name) { return name + ": " + fs.readFileSync(path.join(args[0], name), 'utf8') + "\n"; }
let result = "";
for (const name of names) result += entry(name);
fs.writeFileSync(path.join("out", args[1]), result);
console.log(path.basename(path.join("out", args[1])));
