const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");

const MovieModel = require("../../movies/models/movie");

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("CharacterToMoviesAddPost returns 201 when character added successfully", async () => {
  const movieDoc = [{
    _id: { $oid: "69efd1c1b2f8c7327f029fae" },
    title: "The Two Towers",
    releaseYear: 2002,
    characters: []
  }];

  mockingoose(MovieModel).toReturn(movieDoc[0], "findOne");
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let req = {
    body: {
      movies: ["69efd1c1b2f8c7327f029fae"],
      characterToAdd: { id: "6a15b1d58291c3d1a98c2ac1", name: "Dave Jones", race: "Man" }
    }
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
});

test("CharacterToMoviesAddPost returns 406 when characterToAdd is missing id", async () => {
  let req = {
    body: {
      movies: ["69efd1c1b2f8c7327f029fae"],
      characterToAdd: { name: "Dave Jones", race: "Man" }
    }
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Your character can not be added." });
});

test("CharacterToMoviesAddPost returns 406 when characterToAdd is missing name", async () => {
  let req = {
    body: {
      movies: ["69efd1c1b2f8c7327f029fae"],
      characterToAdd: { id: "6a15b1d58291c3d1a98c2ac1", race: "Man" }
    }
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Your character can not be added." });
});

test("CharacterToMoviesAddPost returns 406 when characterToAdd is missing race", async () => {
  let req = {
    body: {
      movies: ["69efd1c1b2f8c7327f029fae"],
      characterToAdd: { id: "6a15b1d58291c3d1a98c2ac1", name: "Dave Jones" }
    }
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Your character can not be added." });
});

test("CharacterToMoviesAddPost skips and returns 201 when movie not found", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = {
    body: {
      movies: ["000000000000000000000000"],
      characterToAdd: { id: "6a15b1d58291c3d1a98c2ac1", name: "Dave Jones", race: "Man" }
    }
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
});

test("CharacterToMoviesAddPost skips and returns 201 when character already in movie", async () => {
  const movieDoc = [{
    _id: { $oid: "69efd1c1b2f8c7327f029fae" },
    title: "The Two Towers",
    releaseYear: 2002,
    characters: [{ _id: "6a15b1d58291c3d1a98c2ac1", name: "Dave Jones", race: "Man" }]
  }];

  mockingoose(MovieModel).toReturn(movieDoc[0], "findOne");
  const saveSpy = jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let req = {
    body: {
      movies: ["69efd1c1b2f8c7327f029fae"],
      characterToAdd: { id: "6a15b1d58291c3d1a98c2ac1", name: "Dave Jones", race: "Man" }
    }
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
});

test("CharacterToMoviesAddPost returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "findById").mockRejectedValue(new Error("Database connection failed"));

  let req = {
    body: {
      movies: ["69efd1c1b2f8c7327f029fae"],
      characterToAdd: { id: "6a15b1d58291c3d1a98c2ac1", name: "Dave Jones", race: "Man" }
    }
  };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
