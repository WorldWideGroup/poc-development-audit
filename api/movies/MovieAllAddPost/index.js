const makeInjectable = require("../../../helpers/makeInjectable");
const mongoose = require("mongoose");

module.exports = makeInjectable({
  defaults: {
    MovieModel: () => require("../models/movie")
  }
}, async function({MovieModel}, req, res) {
  try {
    const movies = req.body || [];
    const result = [];

    for (const item of movies) {
      const exists = await MovieModel.findById(item._id);

      if (exists) {
        result.push({ ...item, status: "NOT ADDED" });
      } else {
        const movie = new MovieModel({
          _id: new mongoose.Types.ObjectId(item._id),
          title: item.title,
          releaseYear: item.releaseYear,
          characters: item.characters || []
        });
        await movie.save();
        result.push({ ...item, status: "ADDED" });
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Database error" });
  }
});
