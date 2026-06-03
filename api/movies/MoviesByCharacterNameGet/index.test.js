const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);

const projected = (characterName) =>
  movieDocuments
    .filter((m) => m.characters.some((c) => c.name === characterName))
    .map((m) => ({
      _id: m._id,
      title: m.title,
      releaseYear: m.releaseYear,
    }));

const makeReq = (characterName) => ({
  params: { characterName },
  header: {},
});

test("MoviesByCharacterNameGet returns matching movies (projected)", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(projected("Frodo Baggins"), "find");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("Frodo Baggins"), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body).toHaveLength(3);
  expect(body[0].title).toBe(
    "The Lord of the Rings: The Fellowship of the Ring",
  );
  expect(body[0].releaseYear).toBe(2001);
  expect(body[0].characters ?? []).toHaveLength(0);
});

test("MoviesByCharacterNameGet returns 400 when character name is missing", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(undefined), res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    error: "A character name is required",
  });
});

test("MoviesByCharacterNameGet returns 404 when no movies are found", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn([], "find");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("Nobody"), res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "No movie(s) with this Character were found",
  });
});

test("MoviesByCharacterNameGet returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("Frodo Baggins"), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
