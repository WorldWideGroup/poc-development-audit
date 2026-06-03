const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");

const makeReq = (body) => ({ body, header: {} });

const movieDoc = () => ({
  _id: "690b9436fb29d9d76b2a0dc2",
  name: "Old Name",
  releaseYear: 2024,
  characters: [],
  save: jest.fn().mockResolvedValue(true),
});

test("MovieNamePut updates name and returns 204 with no body", async () => {
  const movie = movieDoc();
  const MovieModel = { findOne: jest.fn().mockResolvedValue(movie) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: movie._id, movieName: "Brand New Title" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
  expect(movie.name).toBe("Brand New Title");
  expect(movie.save).toHaveBeenCalledTimes(1);
});

test("MovieNamePut returns 406 when movieName is missing", async () => {
  const MovieModel = { findOne: jest.fn() };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq({ movieId: "x" }), res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Movie Name is not valid. It must be at least three characters.",
  });
  expect(MovieModel.findOne).not.toHaveBeenCalled();
});

test("MovieNamePut returns 406 when movieName is too short", async () => {
  const MovieModel = { findOne: jest.fn() };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: "x", movieName: "ab" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Movie Name is not valid. It must be at least three characters.",
  });
});

test("MovieNamePut returns 404 when movie not found", async () => {
  const MovieModel = { findOne: jest.fn().mockResolvedValue(null) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: "deadbeef", movieName: "Valid Name" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieNamePut returns 500 when database is down", async () => {
  const MovieModel = {
    findOne: jest.fn().mockRejectedValue(new Error("db down")),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: "x", movieName: "Valid Name" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
