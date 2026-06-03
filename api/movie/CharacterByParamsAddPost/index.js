const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../../movies/models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { movie_id, mainCharacterName } = req.params;

      if (
        typeof mainCharacterName !== "string" ||
        mainCharacterName.trim().length < 3
      ) {
        return res.status(406).json({
          error:
            "Main Character Name is not valid. It must be at least three characters.",
        });
      }

      if (!movie_id) {
        return res.status(404).json({ error: "No movie found" });
      }

      const movie = await MovieModel.findOne({ _id: movie_id });
      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      movie.characters = movie.characters || [];
      movie.characters.push({ name: mainCharacterName.trim() });
      const saved = await movie.save();

      return res.status(200).json(saved);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
