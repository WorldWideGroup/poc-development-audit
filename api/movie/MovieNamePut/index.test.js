const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");

const MovieModel = require("../../movies/models/movie");

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MovieNamePut returns 204 when movie name is updated", async () => {
  mockingoose(MovieModel).toReturn(
    { _id: { $oid: "69efd1c1b2f8c7327f029fad" }, title: "Old Title", releaseYear: 2001, characters: [] },
    "findOne"
  );
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let req = { body: { movieId: "69efd1c1b2f8c7327f029fad", movieName: "New Title" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(204);
});

test("MovieNamePut returns 404 when movie is not found", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = { body: { movieId: "000000000000000000000000", movieName: "New Title" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieNamePut returns 406 when movieName is missing", async () => {
  let req = { body: { movieId: "69efd1c1b2f8c7327f029fad" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Movie Name is not valid. It must be at least three characters." });
});

test("MovieNamePut returns 406 when movieName is less than three characters", async () => {
  let req = { body: { movieId: "69efd1c1b2f8c7327f029fad", movieName: "AB" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Movie Name is not valid. It must be at least three characters." });
});

test("MovieNamePut returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "findById").mockRejectedValue(new Error("Database connection failed"));

  let req = { body: { movieId: "69efd1c1b2f8c7327f029fad", movieName: "New Title" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
