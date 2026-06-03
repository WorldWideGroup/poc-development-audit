const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { startReleaseYear, endReleaseYear } = req.params || {};

      const startYear = Number(startReleaseYear);
      const endYear = Number(endReleaseYear);

      // Validate the starting year before querying MongoDB
      if (Number.isNaN(startYear)) {
        return res
          .status(406)
          .json({ error: "Starting release year must be a number" });
      }

      if (startYear < 2000 || startYear > 2020) {
        return res
          .status(406)
          .json({
            error: "Starting release year must be between 2000 and 2020",
          });
      }

      // Validate the ending year before querying MongoDB
      if (Number.isNaN(endYear)) {
        return res
          .status(406)
          .json({ error: "Ending release year must be a number" });
      }

      if (endYear < 2000 || endYear > 2020) {
        return res
          .status(406)
          .json({ error: "Ending release year must be between 1977 and 2020" });
      }

      const movies = await MovieModel.find({
        releaseYear: {
          $gte: startYear,
          $lte: endYear,
        },
      });

      if (!movies || movies.length === 0) {
        return res.status(404).json({ error: "No movies found" });
      }

      // Keep the response deterministic and aligned with the example output
      const sortedMovies = movies.sort((a, b) => a.releaseYear - b.releaseYear);

      return res.status(200).json(sortedMovies);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
