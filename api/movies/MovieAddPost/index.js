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
      const { movieName, releaseYear } = req.body || {};
      const currentYear = new Date().getFullYear();

      if (!movieName) {
        return res.status(406).json({ error: "No movie name found" });
      }

      if (movieName.length <= 3) {
        return res.status(406).json({ error: "Invalid movie name" });
      }

      if (
        typeof releaseYear !== "number" ||
        releaseYear < 1990 ||
        releaseYear > currentYear
      ) {
        return res.status(406).json({ error: "Invalid release year" });
      }

      const newMovie = await MovieModel.create({
        _id: new mongoose.Types.ObjectId(),
        title: movieName,
        releaseYear,
        characters: [],
      });

      return res.status(200).json(newMovie);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Database error" });
    }
  },
);
