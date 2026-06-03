const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");

const makeReq = (body) => ({ body, header: {} });

const buildMovie = () => ({
  _id: "69efd1c1b2f8c7327f029fae",
  title: "Two Towers",
  releaseYear: 2002,
  characters: [
    { _id: "6a15b4f20a41fb7270ce2f3e", name: "Gollum", race: "Hobbit (Corrupted)" },
  ],
  save: jest.fn().mockResolvedValue(true),
});

test("CharacterNamePut renames character and returns 204 with no body", async () => {
  const movie = buildMovie();
  const MovieModel = { findOne: jest.fn().mockResolvedValue(movie) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({
      movieId: movie._id,
      characterId: "6a15b4f20a41fb7270ce2f3e",
      name: "Smeagol",
    }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
  expect(movie.characters[0].name).toBe("Smeagol");
  expect(movie.save).toHaveBeenCalledTimes(1);
});

test("CharacterNamePut returns 406 when name too short", async () => {
  const MovieModel = { findOne: jest.fn() };
  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: "m", characterId: "c", name: "ab" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Character Name is not valid. It must be at least three characters.",
  });
  expect(MovieModel.findOne).not.toHaveBeenCalled();
});

test("CharacterNamePut returns 404 with movieId in error when movie missing", async () => {
  const MovieModel = { findOne: jest.fn().mockResolvedValue(null) };
  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: "missingMovie", characterId: "c", name: "Smeagol" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "Movie not found for id > missingMovie",
  });
});

test("CharacterNamePut returns 404 with characterId in error when character missing", async () => {
  const movie = buildMovie();
  const MovieModel = { findOne: jest.fn().mockResolvedValue(movie) };
  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({
      movieId: movie._id,
      characterId: "missingChar",
      name: "Smeagol",
    }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "Character not found for id > missingChar",
  });
});

test("CharacterNamePut returns 500 when database is down", async () => {
  const MovieModel = {
    findOne: jest.fn().mockRejectedValue(new Error("db down")),
  };
  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: "m", characterId: "c", name: "Smeagol" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
