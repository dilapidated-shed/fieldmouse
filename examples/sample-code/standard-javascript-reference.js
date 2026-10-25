// This is ordinary JavaScript, not valid current Field Mouse syntax.
// Preserving the ability to run existing JavaScript is a future goal.
"use strict";
var total = 0;
for (var index = 1; index <= 4; index++) {
  total += index;
}
if (total === 10) console.log("ordinary JavaScript: pass");
