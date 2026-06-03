const mongoose = require("mongoose");
const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const { id } = req.params || {};

      // The route requires an id, so fail early if it's missing or invalid
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(406).json({ error: "Movie id is required" });
      }

      const movie = await MovieModel.findById(id);

      if (!movie) {
        return res.status(404).json({ error: "No movie found" });
      }

      return res.status(200).json(movie);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
