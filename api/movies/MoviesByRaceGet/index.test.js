const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MoviesByRaceGet returns movies with only matching race characters", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-race-get-document.json"
  );

  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  let req = { params: { race: "Dwarf" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(4);

  body.forEach(movie => {
    expect(movie).toHaveProperty("title");
    expect(movie).toHaveProperty("releaseYear");
    expect(movie).toHaveProperty("characters");
    movie.characters.forEach(c => {
      expect(c.race.toLowerCase()).toBe("dwarf");
    });
  });
});

test("MoviesByRaceGet matching is case-insensitive", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-race-get-document.json"
  );

  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  let req = { params: { race: "dwarf" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  body.forEach(movie => {
    movie.characters.forEach(c => {
      expect(c.race.toLowerCase()).toBe("dwarf");
    });
  });
});

test("MoviesByRaceGet returns 404 when no movies contain characters of the race", async () => {
  mockingoose(MovieModel).toReturn([], "find");

  let req = { params: { race: "oompa loompa" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie(s) with characters of the oompa loompa race were found" });
});

test("MoviesByRaceGet returns 400 when no race is provided", async () => {
  let req = { params: {} };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "No race received" });
});

test("MoviesByRaceGet returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "find").mockRejectedValue(new Error("Database connection failed"));

  let req = { params: { race: "Dwarf" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
