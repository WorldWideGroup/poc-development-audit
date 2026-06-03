const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { movieId, characterName } = req.params;

      if (!movieId) {
        return res.status(400).json({ error: "A movie _id is required" });
      }
      if (!characterName) {
        return res
          .status(400)
          .json({ error: "A character name is required" });
      }

      const movie = await MovieModel.findOne({ _id: movieId });

      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      const needle = characterName.toLowerCase();
      const character = (movie.characters || []).find(
        (c) => c.name && c.name.toLowerCase() === needle,
      );

      if (!character) {
        return res.status(404).json({ error: "No character found" });
      }

      return res.status(200).json({
        movie: movie.title,
        name: character.name,
        race: character.race,
      });
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
