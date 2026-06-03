const makeInjectable = require("../../../helpers/makeInjectable");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { raceName } = req.params;

      if (!raceName) {
        return res.status(400).json({ error: "A race is required" });
      }

      const raceRegex = new RegExp(`^${escapeRegex(raceName)}$`, "i");

      const movies = await MovieModel.find({ "characters.race": raceRegex });

      const byName = new Map();
      for (const m of movies || []) {
        const doc = typeof m.toObject === "function" ? m.toObject() : m;
        for (const c of doc.characters || []) {
          if (!raceRegex.test(c.race)) continue;
          if (!byName.has(c.name)) byName.set(c.name, new Set());
          byName.get(c.name).add(doc.title);
        }
      }

      if (byName.size === 0) {
        return res
          .status(404)
          .json({ error: "No character with that race was found in a movie." });
      }

      const result = Array.from(byName, ([name, titles]) => ({
        name,
        movies: Array.from(titles),
      }));

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
