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
      const { race } = req.params;

      if (!race) {
        return res.status(400).json({ error: "A race is required" });
      }

      const raceRegex = new RegExp(`^${escapeRegex(race)}$`, "i");

      const movies = await MovieModel.find({
        "characters.race": raceRegex,
      });

      const filtered = (movies || [])
        .map((m) => {
          const doc = typeof m.toObject === "function" ? m.toObject() : m;
          return {
            ...doc,
            characters: (doc.characters || []).filter((c) =>
              raceRegex.test(c.race),
            ),
          };
        })
        .filter((m) => m.characters.length > 0);

      if (filtered.length === 0) {
        return res.status(404).json({
          error: `No movie(s) with characters of the ${race} race were found`,
        });
      }

      return res.status(200).json(filtered);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
