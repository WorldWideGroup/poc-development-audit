const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const movies = await MovieModel.find();

      const sorted = (movies || []).sort(
        (a, b) => a.releaseYear - b.releaseYear,
      );

      const seen = new Set();
      const result = [];
      for (const movie of sorted) {
        for (const c of movie.characters || []) {
          const key = (c.name || "").toLowerCase();
          if (!key || seen.has(key)) continue;
          seen.add(key);
          result.push({ name: c.name, race: c.race });
        }
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
