const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../../movies/models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const body = req.body || {};
      const { movieId, characterName } = body;

      if (
        characterName === undefined ||
        characterName === null ||
        characterName === ""
      ) {
        return res
          .status(404)
          .json({ error: "No Main Character Name Provided" });
      }

      if (
        typeof characterName !== "string" ||
        characterName.trim().length < 3
      ) {
        return res.status(406).json({
          error:
            "Character Name is not valid. It must be at least three characters.",
        });
      }

      if (!movieId) {
        return res.status(404).json({ error: "No movie found" });
      }

      const movie = await MovieModel.findOne({ _id: movieId });
      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      movie.characters = movie.characters || [];
      movie.characters.push({ name: characterName.trim() });
      const saved = await movie.save();

      return res.status(200).json(saved);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
