const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");

const makeReq = (body) => ({ body, header: {} });

const movieDoc = {
  _id: "690b9436fb29d9d76b2a0dc2",
  title: "The Lord of the Rings: The War of the Rohirrim",
  releaseYear: 2024,
  characters: [],
};

test("CharacterAddPost adds character and returns the movie", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(movieDoc, "findOne");
  mockingoose(MovieModel).toReturn((doc) => doc, "save");

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: movieDoc._id, characterName: "Helm" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.title).toBe(movieDoc.title);
  expect(body.releaseYear).toBe(2024);
  const names = body.characters.map((c) => c.name);
  expect(names).toContain("Helm");
});

test("CharacterAddPost returns 404 when characterName missing", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq({ movieId: movieDoc._id }), res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: "No Main Character Name Provided",
  });
});

test("CharacterAddPost returns 406 when characterName too short", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: movieDoc._id, characterName: "Bo" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error:
      "Character Name is not valid. It must be at least three characters.",
  });
});

test("CharacterAddPost returns 404 when movie not found", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(null, "findOne");

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({
      movieId: "000000000000000000000000",
      characterName: "Helm",
    }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterAddPost returns 500 when database is down", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();
  MovieModel.findOne = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ movieId: movieDoc._id, characterName: "Helm" }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
