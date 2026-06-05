const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");

const MovieModel = require("../../movies/models/movie");

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("CharacterByParamsAddPost adds character and returns updated movie", async () => {
  const movieDoc = [{
    _id: { $oid: "690b9436fb29d9d76b2a0dc2" },
    name: "The Lord of the Rings: The War of the Rohirrim",
    releaseYear: 2024,
    characters: [{ name: "Helm" }]
  }];

  mockingoose(MovieModel).toReturn(movieDoc[0], "findOne");
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let req = { params: { movie_id: "690b9436fb29d9d76b2a0dc2", mainCharacterName: "Olwyn" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(body.characters.some(c => c.name === "Olwyn")).toBe(true);
});

test("CharacterByParamsAddPost returns 406 when character name is less than three characters", async () => {
  let req = { params: { movie_id: "690b9436fb29d9d76b2a0dc2", mainCharacterName: "Al" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Main Character Name is not valid. It must be at least three characters." });
});

test("CharacterByParamsAddPost returns 404 when movie is not found", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");

  let req = { params: { movie_id: "000000000000000000000000", mainCharacterName: "Olwyn" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("CharacterByParamsAddPost returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "findById").mockRejectedValue(new Error("Database connection failed"));

  let req = { params: { movie_id: "690b9436fb29d9d76b2a0dc2", mainCharacterName: "Olwyn" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
