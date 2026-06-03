const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);

const makeReq = () => ({ params: {}, header: {} });

test("MoviesAllCharactersGet returns unique characters ordered by movie release year", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];

  expect(body.slice(0, 4)).toEqual([
    { name: "Frodo Baggins", race: "Hobbit" },
    { name: "Gandalf the Grey", race: "Maia (Wizard)" },
    { name: "Aragorn", race: "Man" },
    { name: "Legolas", race: "Elf" },
  ]);

  const names = body.map((c) => c.name.toLowerCase());
  expect(new Set(names).size).toBe(names.length);

  const expectedNames = new Set();
  for (const m of movieDocuments) {
    for (const c of m.characters) expectedNames.add(c.name.toLowerCase());
  }
  expect(names.length).toBe(expectedNames.size);

  for (const item of body) {
    expect(item).toEqual({ name: item.name, race: item.race });
    expect(Object.keys(item).sort()).toEqual(["name", "race"]);
  }
});

test("MoviesAllCharactersGet returns empty array when no movies", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn([], "find");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(), res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([]);
});

test("MoviesAllCharactersGet returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
