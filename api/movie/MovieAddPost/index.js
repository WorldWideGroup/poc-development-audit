const mongoose = require("mongoose");
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
      const { movieName, releaseYear } = body;

      if (movieName === undefined || movieName === null || movieName === "") {
        return res.status(406).json({ error: "No movie name found" });
      }

      if (typeof movieName !== "string" || movieName.trim().length <= 3) {
        return res.status(406).json({ error: "Invalid movie name" });
      }

      const year = Number(releaseYear);
      const currentYear = new Date().getFullYear();
      if (
        releaseYear === undefined ||
        releaseYear === null ||
        releaseYear === "" ||
        !Number.isFinite(year) ||
        year < 1990 ||
        year > currentYear
      ) {
        return res.status(406).json({ error: "Invalid release year" });
      }

      const created = await MovieModel.create({
        _id: new mongoose.Types.ObjectId(),
        name: movieName.trim(),
        releaseYear: year,
        characters: [],
      });

      return res.status(200).json(created);
    } catch (error) {
      return res.status(500).json({ error: "Database error" });
    }
  },
);
