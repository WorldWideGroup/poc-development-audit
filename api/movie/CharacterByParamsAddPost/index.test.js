const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");

const makeReq = (movie_id, mainCharacterName) => ({
  params: { movie_id, mainCharacterName },
  header: {},
});

const movieDoc = {
  _id: "690b9436fb29d9d76b2a0dc2",
  name: "The Lord of the Rings: The War of the Rohirrim",
  releaseYear: 2024,
  characters: [{ name: "Helm" }],
};

test("CharacterByParamsAddPost adds character and returns the movie", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(movieDoc, "findOne");
  mockingoose(MovieModel).toReturn((doc) => doc, "save");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(movieDoc._id, "Olwyn"), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.name).toBe(movieDoc.name);
  const names = body.characters.map((c) => c.name);
  expect(names).toEqual(expect.arrayContaining(["Helm", "Olwyn"]));
});

test("CharacterByParamsAddPost returns 406 when name is too short", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(movieDoc._id, "Bo"), res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error:
      "Main Character Name is not valid. It must be at least three characters.",
  });
});

test("CharacterByParamsAddPost returns 404 when movie not found", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(null, "findOne");

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq("000000000000000000000000", "Olwyn"),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterByParamsAddPost returns 500 when database is down", async () => {
  const MovieModel = require("../../movies/models/movie");
  mockingoose.resetAll();
  MovieModel.findOne = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(movieDoc._id, "Olwyn"), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
