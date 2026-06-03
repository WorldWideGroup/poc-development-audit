const mongoose = require("mongoose");
const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { movieId, characterName } = req.body || {};

      if (!characterName) {
        return res
          .status(404)
          .json({ error: "No Main Character Name Provided" });
      }

      if (characterName.length < 3) {
        return res.status(406).json({
          error:
            "Character Name is not valid. It must be at least three characters.",
        });
      }

      if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
        return res.status(404).json({ error: "No movie found" });
      }

      const movie = await MovieModel.findById(movieId);

      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      movie.characters.push({
        _id: new mongoose.Types.ObjectId(),
        name: characterName,
      });

      await movie.save();

      return res.status(200).json(movie);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Database error" });
    }
  },
);
