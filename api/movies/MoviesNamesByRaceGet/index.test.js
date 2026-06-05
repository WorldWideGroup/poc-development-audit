const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const MovieModel = require("../models/movie");

beforeEach(() => { mockingoose.resetAll(); jest.restoreAllMocks(); });

test("MoviesNamesByRaceGet returns characters with their movies for given race", async () => {
  mockingoose(MovieModel).toReturn([
    { title: "Fellowship", releaseYear: 2001, characters: [{ name: "Aragorn", race: "Man" }, { name: "Frodo", race: "Hobbit" }] },
    { title: "Two Towers",  releaseYear: 2002, characters: [{ name: "Aragorn", race: "Man" }, { name: "Theoden", race: "Man" }] }
  ], "find");

  let res = makeMockRes();
  await func.inject({ MovieModel })({ params: { raceName: "Man" } }, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.length).toBe(2);
  const aragorn = body.find(c => c.name === "Aragorn");
  expect(aragorn.movies).toEqual(["Fellowship", "Two Towers"]);
  const theoden = body.find(c => c.name === "Theoden");
  expect(theoden.movies).toEqual(["Two Towers"]);
});

test("MoviesNamesByRaceGet is case-insensitive", async () => {
  mockingoose(MovieModel).toReturn([
    { title: "Fellowship", releaseYear: 2001, characters: [{ name: "Gimli", race: "Dwarf" }] }
  ], "find");

  let res = makeMockRes();
  await func.inject({ MovieModel })({ params: { raceName: "dwarf" } }, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body[0].name).toBe("Gimli");
});

test("MoviesNamesByRaceGet returns 404 when race is not found", async () => {
  mockingoose(MovieModel).toReturn([
    { title: "Fellowship", releaseYear: 2001, characters: [{ name: "Frodo", race: "Hobbit" }] }
  ], "find");

  let res = makeMockRes();
  await func.inject({ MovieModel })({ params: { raceName: "oompa loompa" } }, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No character with that race was found in a movie." });
});

test("MoviesNamesByRaceGet returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "find").mockRejectedValue(new Error("Database connection failed"));
  let res = makeMockRes();
  await func.inject({ MovieModel })({ params: { raceName: "Man" } }, res);
  expect(res.status).toHaveBeenCalledWith(500);
});
