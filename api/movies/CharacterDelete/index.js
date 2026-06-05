const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { movieId, characterId } = req.body || {};

    let movie;
    try {
      movie = await MovieModel.findById(movieId);
    } catch (e) {
      if (e.name === "CastError") return res.status(404).json({ error: "No movie found" });
      throw e;
    }

    if (!movie) {
      return res.status(404).json({ error: "No movie found" });
    }

    let character;
    try {
      character = movie.characters.id(characterId);
    } catch (e) {
      return res.status(404).json({ error: "No Character found" });
    }

    if (!character) {
      return res.status(404).json({ error: "No Character found" });
    }

    movie.characters.pull(characterId);
    await movie.save();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
