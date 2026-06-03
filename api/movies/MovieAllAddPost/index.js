const makeInjectable = require("../../../helpers/makeInjectable");

module.exports = makeInjectable(
  {
    defaults: {
      MovieModel: () => require("../models/movie"),
    },
  },
  async function ({ MovieModel }, req, res) {
    try {
      const body = req.body;
      if (!Array.isArray(body)) {
        return res
          .status(406)
          .json({ error: "Body must be an array of movies." });
      }

      const ids = body.map((m) => m && m._id).filter(Boolean);
      const existingDocs = ids.length
        ? await MovieModel.find({ _id: { $in: ids } }, { _id: 1 })
        : [];
      const existingIds = new Set(
        (existingDocs || []).map((d) => String(d._id)),
      );

      const result = [];
      for (const movie of body) {
        if (!movie || !movie._id || existingIds.has(String(movie._id))) {
          result.push({ ...movie, status: "NOT ADDED" });
          continue;
        }
        await MovieModel.create(movie);
        result.push({ ...movie, status: "ADDED" });
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
