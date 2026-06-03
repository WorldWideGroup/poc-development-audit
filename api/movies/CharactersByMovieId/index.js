const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { movieId } = req.params;

      if (!movieId) {
        return res.status(400).json({ error: "A movie _id is required" });
      }

      const movie = await MovieModel.findOne({ _id: movieId });

      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      const characters = (movie.characters || []).map((c) => ({
        name: c.name,
      }));

      return res.status(200).json(characters);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
