const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);
const returnOfTheKing = movieDocuments.find(
  (m) => m._id["$oid"] === "69efd1c1b2f8c7327f029faf",
);

const makeReq = (movieId, characterName) => ({
  params: { movieId, characterName },
  header: {},
});

test("NamesById returns movie, name and race for matching character (case-insensitive)", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(returnOfTheKing, "findOne");

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq("69efd1c1b2f8c7327f029faf", "aragorn"),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    movie: "The Lord of the Rings: The Return of the King",
    name: "Aragorn",
    race: "Man",
  });
});

test("NamesById returns 404 when movie is not found", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(null, "findOne");

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq("000000000000000000000000", "aragorn"),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("NamesById returns 404 when character is not found", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(returnOfTheKing, "findOne");

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq("69efd1c1b2f8c7327f029faf", "nobody"),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No character found" });
});

test("NamesById returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  MovieModel.findOne = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq("69efd1c1b2f8c7327f029faf", "aragorn"),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
