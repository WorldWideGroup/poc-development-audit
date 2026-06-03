const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");

const makeReq = (movieId, characterId, characterName) => ({
  params: { movieId, characterId, characterName },
  header: {},
});

const buildMovie = () => ({
  _id: "69efd1c1b2f8c7327f029fae",
  title: "Two Towers",
  releaseYear: 2002,
  characters: [
    { _id: "6a15b4f20a41fb7270ce2f3e", name: "Gollum", race: "Hobbit (Corrupted)" },
    { _id: "6a15b4f20a41fb7270ce2f3f", name: "Frodo", race: "Hobbit" },
  ],
  save: jest.fn().mockResolvedValue(true),
});

test("CharacterNameByParamsPut renames character and returns 204 with no body", async () => {
  const movie = buildMovie();
  const MovieModel = { findOne: jest.fn().mockResolvedValue(movie) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq(movie._id, "6a15b4f20a41fb7270ce2f3e", "Smeagol"),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
  expect(
    movie.characters.find((c) => c._id === "6a15b4f20a41fb7270ce2f3e").name,
  ).toBe("Smeagol");
  expect(movie.save).toHaveBeenCalledTimes(1);
});

test("CharacterNameByParamsPut returns 406 when characterName too short", async () => {
  const MovieModel = { findOne: jest.fn() };
  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("m", "c", "ab"), res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Character Name is not valid. It must be at least three characters.",
  });
  expect(MovieModel.findOne).not.toHaveBeenCalled();
});

test("CharacterNameByParamsPut returns 404 with movieId in error when movie missing", async () => {
  const MovieModel = { findOne: jest.fn().mockResolvedValue(null) };
  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("missingMovie", "c", "Smeagol"), res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "Movie not found for id > missingMovie",
  });
});

test("CharacterNameByParamsPut returns 404 with characterId in error when character missing", async () => {
  const movie = buildMovie();
  const MovieModel = { findOne: jest.fn().mockResolvedValue(movie) };
  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq(movie._id, "missingChar", "Smeagol"),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "Character not found for id > missingChar",
  });
});

test("CharacterNameByParamsPut returns 500 when database is down", async () => {
  const MovieModel = {
    findOne: jest.fn().mockRejectedValue(new Error("db down")),
  };
  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("m", "c", "Smeagol"), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
