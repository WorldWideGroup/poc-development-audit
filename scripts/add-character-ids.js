const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const file = path.join(__dirname, "..", "json-setup", "middle-earth-setup.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const map = new Map();
for (const movie of data) {
  for (const c of movie.characters) {
    const key = `${c.name}|${c.race}`;
    if (!map.has(key)) map.set(key, new mongoose.Types.ObjectId().toString());
    c._id = { $oid: map.get(key) };
  }
}

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`Assigned IDs. Unique character/race combos: ${map.size}`);
