const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { race } = req.params || {};

      // The route requires a race before we can search character data
      if (!race) {
        return res.status(406).json({ error: "Race is required" });
      }

      const normalizedRace =
        race.charAt(0).toUpperCase() + race.slice(1).toLowerCase();

      const movies = await MovieModel.find({
        "characters.race": normalizedRace,
      });

      if (!movies || movies.length === 0) {
        return res.status(404).json({
          error: `No movie(s) with characters of the ${race} race were found`,
        });
      }

      const matchingMovies = movies.map((movie) => ({
        _id: movie._id,
        title: movie.title,
        releaseYear: movie.releaseYear,

        // Return only the characters whose race matches the requested race
        characters: movie.characters.filter(
          (character) => character.race === normalizedRace,
        ),
      }));

      return res.status(200).json(matchingMovies);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
