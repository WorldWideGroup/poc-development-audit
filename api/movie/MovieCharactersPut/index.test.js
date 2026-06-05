const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const mongoose = require("mongoose");
const MovieModel = require("../../movies/models/movie");

beforeEach(() => { mockingoose.resetAll(); jest.restoreAllMocks(); });

const CHAR_ID_1 = new mongoose.Types.ObjectId().toHexString();
const CHAR_ID_2 = new mongoose.Types.ObjectId().toHexString();
const MOVIE_ID  = "69efd1c1b2f8c7327f029fad";

test("MovieCharactersPut returns ADDED for new character", async () => {
  mockingoose(MovieModel).toReturn(
    { _id: { $oid: MOVIE_ID }, title: "Fellowship", releaseYear: 2001, characters: [] },
    "findOne"
  );
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let res = makeMockRes();
  await func.inject({ MovieModel })({
    body: { _id: MOVIE_ID, characters: [{ _id: CHAR_ID_1, name: "Frodo", race: "Hobbit" }] }
  }, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("ADDED");
});

test("MovieCharactersPut returns NOT ADDED when character is unchanged", async () => {
  mockingoose(MovieModel).toReturn(
    { _id: { $oid: MOVIE_ID }, title: "Fellowship", releaseYear: 2001,
      characters: [{ _id: CHAR_ID_1, name: "Frodo", race: "Hobbit" }] },
    "findOne"
  );

  let res = makeMockRes();
  await func.inject({ MovieModel })({
    body: { _id: MOVIE_ID, characters: [{ _id: CHAR_ID_1, name: "Frodo", race: "Hobbit" }] }
  }, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("NOT ADDED");
});

test("MovieCharactersPut returns UPDATED when character name or race changes", async () => {
  mockingoose(MovieModel).toReturn(
    { _id: { $oid: MOVIE_ID }, title: "Fellowship", releaseYear: 2001,
      characters: [{ _id: CHAR_ID_1, name: "Frodo", race: "Hobbit" }] },
    "findOne"
  );
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let res = makeMockRes();
  await func.inject({ MovieModel })({
    body: { _id: MOVIE_ID, characters: [{ _id: CHAR_ID_1, name: "Frodo Baggins", race: "Hobbit" }] }
  }, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.characters[0].status).toBe("UPDATED");
});

test("MovieCharactersPut returns 404 when movie not found", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");

  let res = makeMockRes();
  await func.inject({ MovieModel })({
    body: { _id: "000000000000000000000000", characters: [] }
  }, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieCharactersPut returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "findById").mockRejectedValue(new Error("Database connection failed"));

  let res = makeMockRes();
  await func.inject({ MovieModel })({
    body: { _id: MOVIE_ID, characters: [] }
  }, res);

  expect(res.status).toHaveBeenCalledWith(500);
});
