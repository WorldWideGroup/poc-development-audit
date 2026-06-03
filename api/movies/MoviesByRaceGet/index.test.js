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

const makeReq = (race) => ({
  params: { race },
  header: {},
});

test("MoviesByRaceGet returns movies with only matching characters", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(moviesWithRace("Dwarf"), "find");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("dwarf"), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.length).toBeGreaterThan(0);
  for (const movie of body) {
    expect(movie.characters.length).toBeGreaterThan(0);
    for (const c of movie.characters) {
      expect(c.race.toLowerCase()).toBe("dwarf");
    }
    expect(movie.title).toBeDefined();
    expect(movie.releaseYear).toBeDefined();
  }
});

test("MoviesByRaceGet returns 400 when race is missing", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(undefined), res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "A race is required" });
});

test("MoviesByRaceGet returns 404 with race echoed in error when none found", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn([], "find");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("oompa loompa"), res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "No movie(s) with characters of the oompa loompa race were found",
  });
});

test("MoviesByRaceGet returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("dwarf"), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
