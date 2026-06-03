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
      const { movieId, movieName } = body;

      if (
        movieName === undefined ||
        movieName === null ||
        typeof movieName !== "string" ||
        movieName.trim().length < 3
      ) {
        return res.status(406).json({
          error: "Movie Name is not valid. It must be at least three characters.",
        });
      }

      if (!movieId) {
        return res.status(404).json({ error: "No movie found" });
      }

      const movie = await MovieModel.findOne({ _id: movieId });
      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      movie.name = movieName.trim();
      await movie.save();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
