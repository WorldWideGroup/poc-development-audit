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
      const body = req.body || {};
      const { movieId, characterId } = body;

      if (!movieId || !mongoose.isValidObjectId(movieId)) {
        return res.status(404).json({ error: "No movie found" });
      }

      const movie = await MovieModel.findOne({ _id: movieId });
      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      if (!characterId || !mongoose.isValidObjectId(characterId)) {
        return res.status(404).json({ error: "No Character found" });
      }

      const before = (movie.characters || []).length;
      movie.characters = (movie.characters || []).filter(
        (c) => String(c._id) !== String(characterId),
      );
      if (movie.characters.length === before) {
        return res.status(404).json({ error: "No Character found" });
      }

      await movie.save();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
