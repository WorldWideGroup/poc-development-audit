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
      const { _id, characters } = body;

      if (!_id || !Array.isArray(characters)) {
        return res
          .status(406)
          .json({ error: "Movie _id and characters array are required." });
      }

      const movie = await MovieModel.findOne({ _id });
      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      const existingById = new Map(
        (movie.characters || []).map((c) => [String(c._id), c]),
      );

      const resultCharacters = [];
      for (const incoming of characters) {
        const id = incoming && incoming._id;
        const existing = id ? existingById.get(String(id)) : null;

        if (!existing) {
          movie.characters.push({
            _id: id,
            name: incoming.name,
            race: incoming.race,
          });
          resultCharacters.push({ ...incoming, status: "ADDED" });
          continue;
        }

        if (existing.name === incoming.name && existing.race === incoming.race) {
          resultCharacters.push({ ...incoming, status: "NOT ADDED" });
          continue;
        }

        existing.name = incoming.name;
        existing.race = incoming.race;
        resultCharacters.push({ ...incoming, status: "UPDATED" });
      }

      await movie.save();

      return res.status(200).json({ _id, characters: resultCharacters });
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
