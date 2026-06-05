const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { raceName } = req.params;
    const movies = await MovieModel.find();

    const characterMap = new Map();

    for (const movie of movies) {
      const movieTitle = movie.title || movie.name;
      for (const character of movie.characters) {
        if (character.race.toLowerCase() === raceName.toLowerCase()) {
          if (!characterMap.has(character.name)) {
            characterMap.set(character.name, { name: character.name, movies: [] });
          }
          characterMap.get(character.name).movies.push(movieTitle);
        }
      }
    }

    if (characterMap.size === 0) {
      return res.status(404).json({ error: "No character with that race was found in a movie." });
    }

    return res.status(200).json(Array.from(characterMap.values()));
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
