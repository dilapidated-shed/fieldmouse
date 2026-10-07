import fs from 'node:fs';
const args = process.argv.slice(2);
if (args.length !== 3) process.exit(64);
const record = {method: args[0], url: args[1], authorization: process.env.FIELDMOUSE_LABEL, body: fs.readFileSync(args[2], 'utf8')};
fs.appendFileSync("requests.jsonl", JSON.stringify(record) + "\n");
console.log("recorded");
