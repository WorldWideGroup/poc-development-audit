const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");

const MovieModel = require("../models/movie");

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MoviesAllCharactersGet returns flat deduplicated character list sorted by release year", async () => {
  const movieDocuments = [
    {
      title: "Movie A",
      releaseYear: 2001,
      characters: [
        { name: "Frodo Baggins", race: "Hobbit" },
        { name: "Aragorn", race: "Man" }
      ]
    },
    {
      title: "Movie B",
      releaseYear: 2002,
      characters: [
        { name: "Frodo Baggins", race: "Hobbit" },
        { name: "Gollum", race: "Hobbit (Corrupted)" }
      ]
    }
  ];

  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  let req = {};
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(3);
  expect(body[0]).toEqual({ name: "Frodo Baggins", race: "Hobbit" });
  expect(body[1]).toEqual({ name: "Aragorn", race: "Man" });
  expect(body[2]).toEqual({ name: "Gollum", race: "Hobbit (Corrupted)" });
});

test("MoviesAllCharactersGet does not include duplicate characters", async () => {
  const movieDocuments = [
    {
      title: "Movie A",
      releaseYear: 2001,
      characters: [{ name: "Aragorn", race: "Man" }]
    },
    {
      title: "Movie B",
      releaseYear: 2002,
      characters: [{ name: "Aragorn", race: "Man" }]
    }
  ];

  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  let req = {};
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  const body = res.json.mock.calls[0][0];
  expect(body.length).toBe(1);
  expect(body[0].name).toBe("Aragorn");
});

test("MoviesAllCharactersGet returns empty array when no movies", async () => {
  mockingoose(MovieModel).toReturn([], "find");

  let req = {};
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([]);
});

test("MoviesAllCharactersGet returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "find").mockRejectedValue(new Error("Database connection failed"));

  let req = {};
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
