const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "No _id received" });
    }

    const movie = await MovieModel.findOne({ _id: id });

    if (!movie) {
      return res.status(404).json({ error: "No movie found" });
    }

    return res.status(200).json(movie);
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
