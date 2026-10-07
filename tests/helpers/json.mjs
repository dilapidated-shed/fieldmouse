import fs from 'node:fs';
const args = process.argv.slice(2);
if (args.length !== 1) process.exit(64);
const data = JSON.parse(fs.readFileSync(args[0], 'utf8'));
function advance(item) { item.count += 1; return item; }
for (const item of data.items) advance(item);
data.build = {label: process.env.FIELDMOUSE_LABEL, ok: true};
fs.writeFileSync(args[0], JSON.stringify(data));
console.log("updated");
