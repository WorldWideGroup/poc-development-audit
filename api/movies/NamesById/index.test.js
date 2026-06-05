const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("NamesById returns movie, character name and race when found", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/names-by-id-get-document.json"
  );

  mockingoose(MovieModel).toReturn(movieDocument[0], "findOne");

  let req = { params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "aragorn" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(body.movie).toBe("The Lord of the Rings: The Return of the King");
  expect(body.name).toBe("Aragorn");
  expect(body.race).toBe("Man");
});

test("NamesById character lookup is case-insensitive", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/names-by-id-get-document.json"
  );

  mockingoose(MovieModel).toReturn(movieDocument[0], "findOne");

  let req = { params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "ARAGORN" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.name).toBe("Aragorn");
});

test("NamesById returns 404 when movie is not found", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = { params: { movieId: "000000000000000000000000", characterName: "Aragorn" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("NamesById returns 404 when character name is not found in the movie", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/names-by-id-get-document.json"
  );

  mockingoose(MovieModel).toReturn(movieDocument[0], "findOne");

  let req = { params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "Unknown Character" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No character found" });
});

test("NamesById returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "findOne").mockRejectedValue(new Error("Database connection failed"));

  let req = { params: { movieId: "69efd1c1b2f8c7327f029faf", characterName: "Aragorn" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
