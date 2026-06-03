const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { characterName } = req.params || {};

      // The route requires a character name before we can search movie characters
      if (!characterName) {
        return res.status(406).json({ error: "Character name is required" });
      }

      const movies = await MovieModel.find(
        {
          "characters.name": characterName,
        },
        {
          _id: 1,
          title: 1,
          releaseYear: 1,
        },
      );

      if (!movies || movies.length === 0) {
        return res
          .status(404)
          .json({ error: "No movie(s) with this Character were found" });
      }

      return res.status(200).json(movies);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
