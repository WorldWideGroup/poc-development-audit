const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");

const makeReq = (body) => ({ body, header: {} });

const validMovieId = "69efd1c1b2f8c7327f029fad";
const charId = "6a1e03dc3c961cfb2829658d";

const movieDoc = () => ({
  _id: validMovieId,
  title: "FOTR",
  releaseYear: 2001,
  characters: [
    { _id: "6a1e03d6c1b6526312a05de1", name: "Gandalf", race: "Maia (Wizard)" },
    { _id: charId, name: "Aragorn", race: "Man" },
  ],
  save: jest.fn().mockResolvedValue(true),
});

test("CharacterDelete removes the character and returns 204", async () => {
  const movie = movieDoc();
  const MovieModel = { findOne: jest.fn().mockResolvedValue(movie) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: validMovieId, characterId: charId }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(movie.characters).toHaveLength(1);
  expect(movie.characters[0].name).toBe("Gandalf");
  expect(movie.save).toHaveBeenCalledTimes(1);
});

test("CharacterDelete returns 404 when movieId is invalid ObjectId", async () => {
  const MovieModel = { findOne: jest.fn() };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: "not-an-oid", characterId: charId }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
  expect(MovieModel.findOne).not.toHaveBeenCalled();
});

test("CharacterDelete returns 404 when movie not found", async () => {
  const MovieModel = { findOne: jest.fn().mockResolvedValue(null) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: validMovieId, characterId: charId }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterDelete returns 404 when characterId is invalid ObjectId", async () => {
  const movie = movieDoc();
  const MovieModel = { findOne: jest.fn().mockResolvedValue(movie) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: validMovieId, characterId: "bad-id" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No Character found" });
});

test("CharacterDelete returns 404 when character not in movie", async () => {
  const movie = movieDoc();
  const MovieModel = { findOne: jest.fn().mockResolvedValue(movie) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({
      movieId: validMovieId,
      characterId: "6a1e03d0a7e982d8b6bc2a82",
    }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No Character found" });
});

test("CharacterDelete returns 500 when database is down", async () => {
  const MovieModel = {
    findOne: jest.fn().mockRejectedValue(new Error("db down")),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: validMovieId, characterId: charId }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
