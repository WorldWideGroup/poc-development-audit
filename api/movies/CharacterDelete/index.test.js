const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const mongoose = require("mongoose");
const MovieModel = require("../models/movie");

beforeEach(() => { mockingoose.resetAll(); jest.restoreAllMocks(); });

const CHAR_ID  = new mongoose.Types.ObjectId().toHexString();
const MOVIE_ID = "69efd1c1b2f8c7327f029fae";

test("CharacterDelete returns 204 when character is removed", async () => {
  mockingoose(MovieModel).toReturn(
    { _id: { $oid: MOVIE_ID }, title: "Two Towers", releaseYear: 2002,
      characters: [{ _id: CHAR_ID, name: "Gollum", race: "Hobbit (Corrupted)" }] },
    "findOne"
  );
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let res = makeMockRes();
  await func.inject({ MovieModel })({ body: { movieId: MOVIE_ID, characterId: CHAR_ID } }, res);

  expect(res.status).toHaveBeenCalledWith(204);
});

test("CharacterDelete returns 404 when movie is not found", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");

  let res = makeMockRes();
  await func.inject({ MovieModel })({ body: { movieId: "000000000000000000000000", characterId: CHAR_ID } }, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterDelete returns 404 when character is not found", async () => {
  mockingoose(MovieModel).toReturn(
    { _id: { $oid: MOVIE_ID }, title: "Two Towers", releaseYear: 2002, characters: [] },
    "findOne"
  );

  let res = makeMockRes();
  await func.inject({ MovieModel })({ body: { movieId: MOVIE_ID, characterId: CHAR_ID } }, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No Character found" });
});

test("CharacterDelete returns 404 for invalid movieId", async () => {
  const castError = new Error("Cast to ObjectId failed");
  castError.name = "CastError";
  jest.spyOn(MovieModel, "findById").mockRejectedValue(castError);

  let res = makeMockRes();
  await func.inject({ MovieModel })({ body: { movieId: "invalid", characterId: CHAR_ID } }, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterDelete returns 500 on unexpected database error", async () => {
  jest.spyOn(MovieModel, "findById").mockImplementation(() => {
    throw new Error("Unexpected error");
  });

  let res = makeMockRes();
  await func.inject({ MovieModel })({ body: { movieId: MOVIE_ID, characterId: CHAR_ID } }, res);

  expect(res.status).toHaveBeenCalledWith(500);
});
