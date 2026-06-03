const mongoose = require("mongoose");
const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../../movies/models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { movieId } = req.params;

      if (!movieId || !mongoose.isValidObjectId(movieId)) {
        return res.status(404).json({ error: "No movie found" });
      }

      const movie = await MovieModel.findOne({ _id: movieId });
      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      movie.characters = [];
      await movie.save();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
