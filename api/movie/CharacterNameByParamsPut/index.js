const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../../movies/models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { movieId, characterId, characterName } = req.params;

      if (
        typeof characterName !== "string" ||
        characterName.trim().length < 3
      ) {
        return res.status(406).json({
          error:
            "Character Name is not valid. It must be at least three characters.",
        });
      }

      const movie = await MovieModel.findOne({ _id: movieId });
      if (!movie) {
        return res
          .status(404)
          .json({ error: `Movie not found for id > ${movieId}` });
      }

      const character = (movie.characters || []).find(
        (c) => c._id && String(c._id) === String(characterId),
      );
      if (!character) {
        return res
          .status(404)
          .json({ error: `Character not found for id > ${characterId}` });
      }

      character.name = characterName.trim();
      await movie.save();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
