const d = require("../json-setup/middle-earth-setup.json");
const m = new Map();
let mismatches = 0;
for (const mv of d) {
  for (const c of mv.characters) {
    const k = `${c.name}|${c.race}`;
    const id = c._id.$oid;
    if (!m.has(k)) m.set(k, id);
    else if (m.get(k) !== id) { console.log("MISMATCH", k); mismatches++; }
  }
}
console.log(`OK. Unique combos: ${m.size}. Mismatches: ${mismatches}.`);
