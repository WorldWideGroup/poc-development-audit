const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");
const MovieModel = require("../models/movie");

beforeEach(() => { jest.restoreAllMocks(); });

test("MoviesDelete returns 204 when all movies are deleted", async () => {
  jest.spyOn(MovieModel, "deleteMany").mockResolvedValue({ deletedCount: 6 });

  let res = makeMockRes();
  await func.inject({ MovieModel })({}, res);

  expect(res.status).toHaveBeenCalledWith(204);
  expect(MovieModel.deleteMany).toHaveBeenCalledWith({});
});

test("MoviesDelete returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "deleteMany").mockRejectedValue(new Error("Database connection failed"));

  let res = makeMockRes();
  await func.inject({ MovieModel })({}, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
