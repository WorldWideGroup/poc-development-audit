const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const mongoose = require("mongoose");

const MovieModel = require("../../movies/models/movie");

const CHARACTER_ID = new mongoose.Types.ObjectId().toHexString();

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("CharacterNamePut returns 204 when character name is updated", async () => {
  mockingoose(MovieModel).toReturn(
    { _id: { $oid: "69efd1c1b2f8c7327f029fae" }, title: "The Two Towers", releaseYear: 2002,
      characters: [{ _id: CHARACTER_ID, name: "Gollum", race: "Hobbit (Corrupted)" }] },
    "findOne"
  );
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let req = { body: { movieId: "69efd1c1b2f8c7327f029fae", characterId: CHARACTER_ID, name: "Smeagol" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
});

test("CharacterNamePut returns 404 when movie is not found", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = { body: { movieId: "000000000000000000000000", characterId: CHARACTER_ID, name: "Smeagol" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "Movie not found for id 000000000000000000000000" });
});

test("CharacterNamePut returns 404 when character is not found", async () => {
  mockingoose(MovieModel).toReturn(
    { _id: { $oid: "69efd1c1b2f8c7327f029fae" }, title: "The Two Towers", releaseYear: 2002, characters: [] },
    "findOne"
  );

  let req = { body: { movieId: "69efd1c1b2f8c7327f029fae", characterId: CHARACTER_ID, name: "Smeagol" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: `Character not found for id ${CHARACTER_ID}` });
});

test("CharacterNamePut returns 406 when name is less than three characters", async () => {
  let req = { body: { movieId: "69efd1c1b2f8c7327f029fae", characterId: CHARACTER_ID, name: "Al" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Character Name is not valid. It must be at least three characters." });
});

test("CharacterNamePut returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "findById").mockRejectedValue(new Error("Database connection failed"));

  let req = { body: { movieId: "69efd1c1b2f8c7327f029fae", characterId: CHARACTER_ID, name: "Smeagol" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
