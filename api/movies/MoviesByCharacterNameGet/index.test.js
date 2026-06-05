const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MoviesByCharacterNameGet returns array of _id, title, releaseYear for matching movies", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-character-name-get-document.json"
  );

  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  let req = { params: { characterName: "Frodo Baggins" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(3);
  expect(body[0].title).toBe("The Lord of the Rings: The Fellowship of the Ring");
  expect(body[0].releaseYear).toBe(2001);
  expect(body[0]).not.toHaveProperty("characters");
});

test("MoviesByCharacterNameGet returns 404 when no movies contain the character", async () => {
  mockingoose(MovieModel).toReturn([], "find");

  let req = { params: { characterName: "Unknown Character" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie(s) with this Character were found" });
});

test("MoviesByCharacterNameGet returns 400 when no character name is provided", async () => {
  let req = { params: {} };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "No character name received" });
});

test("MoviesByCharacterNameGet returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "find").mockRejectedValue(new Error("Database connection failed"));

  let req = { params: { characterName: "Frodo Baggins" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
