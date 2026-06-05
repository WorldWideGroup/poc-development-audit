const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const movies = await MovieModel.find().sort({ releaseYear: 1 });

    const seen = new Set();
    const characters = [];

    for (const movie of movies) {
      for (const character of movie.characters) {
        if (!seen.has(character.name)) {
          seen.add(character.name);
          characters.push({ name: character.name, race: character.race });
        }
      }
    }

    return res.status(200).json(characters);
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
