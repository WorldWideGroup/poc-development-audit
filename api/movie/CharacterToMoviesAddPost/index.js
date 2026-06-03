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
      const movies = Array.isArray(body.movies) ? body.movies : [];
      const characterToAdd = body.characterToAdd || {};

      const { id, name, race } = characterToAdd;
      if (!id || !name || !race) {
        return res
          .status(406)
          .json({ error: "Your character can not be added." });
      }

      for (const movieId of movies) {
        const movie = await MovieModel.findOne({ _id: movieId });
        if (!movie) continue;

        const existing = (movie.characters || []).some(
          (c) =>
            (c._id && String(c._id) === String(id)) ||
            (c.name &&
              name &&
              c.name.toLowerCase() === name.toLowerCase()),
        );
        if (existing) continue;

        movie.characters.push({ _id: id, name, race });
        await movie.save();
      }

      return res.status(201).send();
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
