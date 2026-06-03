const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");

const makeReq = (body) => ({ body, header: {} });

const newCharacter = {
  id: "6a15b1d58291c3d1a98c2ac1",
  name: "Dave Jones",
  race: "Man",
};

const movieA = {
  _id: "69efd1c1b2f8c7327f029fae",
  title: "Two Towers",
  releaseYear: 2002,
  characters: [{ name: "Frodo Baggins", race: "Hobbit" }],
  save: jest.fn().mockResolvedValue(true),
};
const movieB = {
  _id: "69efd1c1b2f8c7327f029fb1",
  title: "Desolation",
  releaseYear: 2013,
  characters: [{ name: "Bilbo Baggins", race: "Hobbit" }],
  save: jest.fn().mockResolvedValue(true),
};

beforeEach(() => {
  movieA.characters = [{ name: "Frodo Baggins", race: "Hobbit" }];
  movieB.characters = [{ name: "Bilbo Baggins", race: "Hobbit" }];
  movieA.save.mockClear();
  movieB.save.mockClear();
});

test("CharacterToMoviesAddPost adds character to each existing movie and returns 201", async () => {
  const MovieModel = {
    findOne: jest.fn(({ _id }) => {
      if (_id === movieA._id) return Promise.resolve(movieA);
      if (_id === movieB._id) return Promise.resolve(movieB);
      return Promise.resolve(null);
    }),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({
      movies: [movieA._id, movieB._id],
      characterToAdd: newCharacter,
    }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.send).toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
  expect(movieA.characters).toContainEqual(
    expect.objectContaining({ name: "Dave Jones", race: "Man" }),
  );
  expect(movieB.characters).toContainEqual(
    expect.objectContaining({ name: "Dave Jones", race: "Man" }),
  );
  expect(movieA.save).toHaveBeenCalledTimes(1);
  expect(movieB.save).toHaveBeenCalledTimes(1);
});

test("CharacterToMoviesAddPost ignores missing movies (still 201)", async () => {
  const MovieModel = {
    findOne: jest.fn(({ _id }) => {
      if (_id === movieA._id) return Promise.resolve(movieA);
      return Promise.resolve(null);
    }),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({
      movies: [movieA._id, "deadbeefdeadbeefdeadbeef"],
      characterToAdd: newCharacter,
    }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(201);
  expect(movieA.save).toHaveBeenCalledTimes(1);
});

test("CharacterToMoviesAddPost does not re-add an existing character", async () => {
  movieA.characters.push({ _id: newCharacter.id, name: "Dave Jones", race: "Man" });
  const MovieModel = {
    findOne: jest.fn().mockResolvedValue(movieA),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({
      movies: [movieA._id],
      characterToAdd: newCharacter,
    }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(201);
  expect(movieA.save).not.toHaveBeenCalled();
  expect(
    movieA.characters.filter((c) => c.name === "Dave Jones"),
  ).toHaveLength(1);
});

test("CharacterToMoviesAddPost returns 406 when character missing id/name/race", async () => {
  const MovieModel = { findOne: jest.fn() };

  for (const bad of [
    { name: "X", race: "Y" },
    { id: "1", race: "Y" },
    { id: "1", name: "X" },
    {},
  ]) {
    const res = makeMockRes();
    await func.inject({ MovieModel })(
      makeReq({ movies: [movieA._id], characterToAdd: bad }),
      res,
    );
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({
      error: "Your character can not be added.",
    });
  }

  expect(MovieModel.findOne).not.toHaveBeenCalled();
});

test("CharacterToMoviesAddPost returns 500 when database is down", async () => {
  const MovieModel = {
    findOne: jest.fn().mockRejectedValue(new Error("db down")),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({
      movies: [movieA._id],
      characterToAdd: newCharacter,
    }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
