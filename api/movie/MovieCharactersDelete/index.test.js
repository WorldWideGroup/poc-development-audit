const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const MovieModel = require("../../movies/models/movie");

beforeEach(() => { mockingoose.resetAll(); jest.restoreAllMocks(); });

const MOVIE_ID = "69efd1c1b2f8c7327f029fae";

test("MovieCharactersDelete returns 204 when characters are cleared", async () => {
  mockingoose(MovieModel).toReturn(
    { _id: { $oid: MOVIE_ID }, title: "Two Towers", releaseYear: 2002,
      characters: [{ name: "Gollum", race: "Hobbit (Corrupted)" }] },
    "findOne"
  );
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let res = makeMockRes();
  await func.inject({ MovieModel })({ params: { movieId: MOVIE_ID } }, res);

  expect(res.status).toHaveBeenCalledWith(204);
});

test("MovieCharactersDelete returns 404 when movie not found", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");

  let res = makeMockRes();
  await func.inject({ MovieModel })({ params: { movieId: "000000000000000000000000" } }, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieCharactersDelete returns 404 for invalid movieId", async () => {
  const castError = new Error("Cast to ObjectId failed");
  castError.name = "CastError";
  jest.spyOn(MovieModel, "findById").mockRejectedValue(castError);

  let res = makeMockRes();
  await func.inject({ MovieModel })({ params: { movieId: "invalid" } }, res);

  expect(res.status).toHaveBeenCalledWith(404);
});

test("MovieCharactersDelete returns 500 on unexpected database error", async () => {
  jest.spyOn(MovieModel, "findById").mockImplementation(() => { throw new Error("Unexpected"); });

  let res = makeMockRes();
  await func.inject({ MovieModel })({ params: { movieId: MOVIE_ID } }, res);

  expect(res.status).toHaveBeenCalledWith(500);
});
