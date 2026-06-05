const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const MovieModel = require("../models/movie");

beforeEach(() => { mockingoose.resetAll(); jest.restoreAllMocks(); });

const sampleMovie = {
  _id: "69efd1c1b2f8c7327f029fad",
  title: "The Lord of the Rings: The Fellowship of the Ring",
  releaseYear: 2001,
  characters: [{ name: "Frodo Baggins", race: "Hobbit" }]
};

test("MovieAllAddPost returns ADDED when movie does not exist", async () => {
  mockingoose(MovieModel).toReturn(null, "findOne");
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let res = makeMockRes();
  await func.inject({ MovieModel })({ body: [sampleMovie] }, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body[0].status).toBe("ADDED");
  expect(body[0].title).toBe(sampleMovie.title);
});

test("MovieAllAddPost returns NOT ADDED when movie already exists", async () => {
  mockingoose(MovieModel).toReturn({ _id: sampleMovie._id, title: sampleMovie.title }, "findOne");

  let res = makeMockRes();
  await func.inject({ MovieModel })({ body: [sampleMovie] }, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body[0].status).toBe("NOT ADDED");
});

test("MovieAllAddPost handles mix of new and existing movies", async () => {
  const existingMovie = { ...sampleMovie, _id: "69efd1c1b2f8c7327f029fae", title: "The Two Towers" };

  mockingoose(MovieModel)
    .toReturn(null, "findOne");
  jest.spyOn(MovieModel, "findById")
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ _id: existingMovie._id });
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let res = makeMockRes();
  await func.inject({ MovieModel })({ body: [sampleMovie, existingMovie] }, res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body[0].status).toBe("ADDED");
  expect(body[1].status).toBe("NOT ADDED");
});

test("MovieAllAddPost returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "findById").mockRejectedValue(new Error("Database connection failed"));

  let res = makeMockRes();
  await func.inject({ MovieModel })({ body: [sampleMovie] }, res);

  expect(res.status).toHaveBeenCalledWith(500);
});
