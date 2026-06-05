const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");

const MovieModel = require("../../movies/models/movie");

beforeEach(() => {
  jest.restoreAllMocks();
});

test("MovieAddPost creates and returns a new movie", async () => {
  jest.spyOn(MovieModel.prototype, "save").mockResolvedValue();

  let req = { body: { movieName: "The Lord of the Rings: The War of the Rohirrim", releaseYear: 2024 } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(body.name).toBe("The Lord of the Rings: The War of the Rohirrim");
  expect(body.releaseYear).toBe(2024);
  expect(body.characters).toEqual([]);
});

test("MovieAddPost returns 406 when movieName is missing", async () => {
  let req = { body: { releaseYear: 2024 } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie name found" });
});

test("MovieAddPost returns 406 when movieName is three characters or less", async () => {
  let req = { body: { movieName: "LOR", releaseYear: 2024 } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid movie name" });
});

test("MovieAddPost returns 406 when releaseYear is not a number", async () => {
  let req = { body: { movieName: "Valid Movie Name", releaseYear: "not-a-year" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 406 when releaseYear is before 1990", async () => {
  let req = { body: { movieName: "Valid Movie Name", releaseYear: 1989 } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 406 when releaseYear is after the current year", async () => {
  const futureYear = new Date().getFullYear() + 1;
  let req = { body: { movieName: "Valid Movie Name", releaseYear: futureYear } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
});

test("MovieAddPost returns 500 on database error", async () => {
  jest.spyOn(MovieModel.prototype, "save").mockRejectedValue(new Error("Database connection failed"));

  let req = { body: { movieName: "Valid Movie Name", releaseYear: 2024 } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
