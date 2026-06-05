const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("CharactersByMovieId returns array of character name objects", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/characters-by-movie-id-get-document.json"
  );

  mockingoose(MovieModel).toReturn(movieDocument[0], "findOne");

  let req = { params: { movieId: "69efd1c1b2f8c7327f029fb0" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(6);
  expect(body[0]).toEqual({ name: "Bilbo Baggins" });
  expect(body[0]).not.toHaveProperty("race");
});

test("CharactersByMovieId returns 404 when movie is not found", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = { params: { movieId: "000000000000000000000000" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharactersByMovieId returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "findOne").mockRejectedValue(new Error("Database connection failed"));

  let req = { params: { movieId: "69efd1c1b2f8c7327f029fb0" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
