const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MovieByIdGet returns a single movie object when found", async () => {
  const movieDocument = getJSON(
    "../api/movies/_test/documents/movie-by-id-get-document.json"
  );

  mockingoose(MovieModel).toReturn(movieDocument[0], "findOne");

  let req = { params: { id: "69efd1c1b2f8c7327f029faf" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(body.title).toBe("The Lord of the Rings: The Return of the King");
  expect(body.releaseYear).toBe(2003);
  expect(Array.isArray(body)).toBe(false);
});

test("MovieByIdGet returns 404 when no movie matches the _id", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = { params: { id: "000000000000000000000000" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieByIdGet returns 400 when no _id is provided", async () => {
  let req = { params: {} };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "No _id received" });
});

test("MovieByIdGet returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "findOne").mockRejectedValue(new Error("Database connection failed"));

  let req = { params: { id: "69efd1c1b2f8c7327f029faf" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
