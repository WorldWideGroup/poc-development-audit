const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);

const moviesWithRace = (race) =>
  movieDocuments.filter((m) =>
    m.characters.some((c) => c.race.toLowerCase() === race.toLowerCase()),
  );

const makeReq = (raceName) => ({ params: { raceName }, header: {} });

test("MoviesNamesByRaceGet returns each character once with their movies", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(moviesWithRace("Man"), "find");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("man"), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);

  const names = body.map((c) => c.name);
  expect(new Set(names).size).toBe(names.length);

  for (const entry of body) {
    expect(typeof entry.name).toBe("string");
    expect(Array.isArray(entry.movies)).toBe(true);
    expect(entry.movies.length).toBeGreaterThan(0);
  }

  const aragorn = body.find((c) => c.name === "Aragorn");
  expect(aragorn).toBeDefined();
  expect(aragorn.movies).toEqual(
    expect.arrayContaining([
      "The Lord of the Rings: The Fellowship of the Ring",
      "The Lord of the Rings: The Two Towers",
      "The Lord of the Rings: The Return of the King",
    ]),
  );
});

test("MoviesNamesByRaceGet returns 400 when race is missing", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(undefined), res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "A race is required" });
});

test("MoviesNamesByRaceGet returns 404 when no character with that race", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn([], "find");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("oompa loompa"), res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "No character with that race was found in a movie.",
  });
});

test("MoviesNamesByRaceGet returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("man"), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
