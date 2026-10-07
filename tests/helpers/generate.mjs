import fs from 'node:fs';
const args = process.argv.slice(2);
if (args.length !== 3) process.exit(64);
const count = JSON.parse(args[1]);
function line(name) { return "hello " + name + "\n"; }
let result = "";
let i = 0;
while (i < count) { result += line(args[0]); i += 1; }
fs.writeFileSync(args[2], result);
console.log("generated");
