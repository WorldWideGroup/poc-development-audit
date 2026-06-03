const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);
const returnOfTheKing = movieDocuments.find(
  (m) => m._id["$oid"] === "69efd1c1b2f8c7327f029faf",
);

test("MovieByIdGet returns movie with matching _id", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(returnOfTheKing, "findOne");

  let req = {
    params: { id: "69efd1c1b2f8c7327f029faf" },
    header: {},
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.title).toBe("The Lord of the Rings: The Return of the King");
  expect(body.releaseYear).toBe(2003);
  expect(body.characters).toHaveLength(7);
});

test("MovieByIdGet returns 404 when movie is not found", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = {
    params: { id: "000000000000000000000000" },
    header: {},
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieByIdGet returns 400 when _id is missing", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();

  let req = {
    params: {},
    header: {},
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: "An _id is required" });
});

test("MovieByIdGet returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  MovieModel.findOne = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  let req = {
    params: { id: "69efd1c1b2f8c7327f029faf" },
    header: {},
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
