const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");

const makeReq = (body) => ({ body, header: {} });

const validBody = {
  movieName: "The Lord of the Rings: The War of the Rohirrim",
  releaseYear: 2024,
};

test("MovieAddPost creates and returns the new movie", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn((doc) => doc, "save");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(validBody), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.name).toBe(validBody.movieName);
  expect(body.releaseYear).toBe(2024);
  expect(body.characters).toEqual([]);
  expect(body._id).toBeDefined();
});

test("MovieAddPost returns 406 when movieName is missing", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ releaseYear: 2024 }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie name found" });
});

test("MovieAddPost returns 406 when movieName is too short", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieName: "abc", releaseYear: 2024 }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid movie name" });
});

test("MovieAddPost returns 406 when releaseYear is not a number", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieName: validBody.movieName, releaseYear: "abc" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 406 when releaseYear is before 1990", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieName: validBody.movieName, releaseYear: 1989 }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 406 when releaseYear is in the future", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({
      movieName: validBody.movieName,
      releaseYear: new Date().getFullYear() + 1,
    }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 500 when database is down", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();
  MovieModel.create = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(validBody), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
