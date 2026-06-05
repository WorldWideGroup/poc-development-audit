const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../../movies/models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { _id: movieId, characters } = req.body || {};

    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "No movie found" });
    }

    const result = [];
    let changed = false;

    for (const inputChar of (characters || [])) {
      const existing = movie.characters.id(inputChar._id);

      if (!existing) {
        movie.characters.push({ _id: inputChar._id, name: inputChar.name, race: inputChar.race });
        result.push({ ...inputChar, status: "ADDED" });
        changed = true;
      } else if (existing.name === inputChar.name && existing.race === inputChar.race) {
        result.push({ ...inputChar, status: "NOT ADDED" });
      } else {
        existing.name = inputChar.name;
        existing.race = inputChar.race;
        result.push({ ...inputChar, status: "UPDATED" });
        changed = true;
      }
    }

    if (changed) {
      movie.markModified("characters");
      await movie.save();
    }

    return res.status(200).json({ _id: movieId, characters: result });
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
