const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");

const makeReq = (movieId) => ({ params: { movieId }, header: {} });

const validMovieId = "69efd1c1b2f8c7327f029fae";

const movieDoc = () => ({
  _id: validMovieId,
  title: "TTT",
  releaseYear: 2002,
  characters: [
    { _id: "6a1e03dc3c961cfb2829658d", name: "Aragorn", race: "Man" },
    { _id: "6a1e03d0a7e982d8b6bc2a82", name: "Frodo", race: "Hobbit" },
  ],
  save: jest.fn().mockResolvedValue(true),
});

test("MovieCharactersDelete clears all characters and returns 204", async () => {
  const movie = movieDoc();
  const MovieModel = { findOne: jest.fn().mockResolvedValue(movie) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(validMovieId), res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(movie.characters).toEqual([]);
  expect(movie.save).toHaveBeenCalledTimes(1);
});

test("MovieCharactersDelete returns 404 when movieId is invalid", async () => {
  const MovieModel = { findOne: jest.fn() };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("not-an-oid"), res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
  expect(MovieModel.findOne).not.toHaveBeenCalled();
});

test("MovieCharactersDelete returns 404 when movie not found", async () => {
  const MovieModel = { findOne: jest.fn().mockResolvedValue(null) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(validMovieId), res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieCharactersDelete returns 500 when database is down", async () => {
  const MovieModel = {
    findOne: jest.fn().mockRejectedValue(new Error("db down")),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(validMovieId), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
