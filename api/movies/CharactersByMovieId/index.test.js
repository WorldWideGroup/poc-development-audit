const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);
const unexpectedJourney = movieDocuments.find(
  (m) => m._id["$oid"] === "69efd1c1b2f8c7327f029fb0",
);

const makeReq = (movieId) => ({
  params: { movieId },
  header: {},
});

test("CharactersByMovieId returns array of name-only character objects", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(unexpectedJourney, "findOne");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("69efd1c1b2f8c7327f029fb0"), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body).toEqual([
    { name: "Bilbo Baggins" },
    { name: "Gandalf the Grey" },
    { name: "Thorin Oakenshield" },
    { name: "Balin" },
    { name: "Radagast the Brown" },
    { name: "Galadriel" },
  ]);
});

test("CharactersByMovieId returns 404 when movie is not found", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(null, "findOne");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("000000000000000000000000"), res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharactersByMovieId returns 400 when movieId missing", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(undefined), res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "A movie _id is required" });
});

test("CharactersByMovieId returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  MovieModel.findOne = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("69efd1c1b2f8c7327f029fb0"), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
