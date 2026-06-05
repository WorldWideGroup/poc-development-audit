const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const MovieModel = require("../models/movie");

beforeEach(() => {
  mockingoose.resetAll();
  jest.restoreAllMocks();
});

test("MoviesByReleaseYearsGet returns movies within the year range", async () => {
  const movieDocuments = getJSON(
    "../api/movies/_test/documents/movies-by-release-years-get-document.json"
  );

  mockingoose(MovieModel).toReturn(movieDocuments, "find");

  let req = { params: { startReleaseYear: "2001", endReleaseYear: "2003" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(200);

  const body = res.json.mock.calls[0][0];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(3);
});

test("MoviesByReleaseYearsGet returns 406 when startReleaseYear is not a number", async () => {
  let req = { params: { startReleaseYear: "abc", endReleaseYear: "2003" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Starting release year must be a number" });
});

test("MoviesByReleaseYearsGet returns 406 when startReleaseYear is less than 2000", async () => {
  let req = { params: { startReleaseYear: "1999", endReleaseYear: "2003" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Starting release year must be between 2000 and 2020" });
});

test("MoviesByReleaseYearsGet returns 406 when startReleaseYear is greater than 2020", async () => {
  let req = { params: { startReleaseYear: "2021", endReleaseYear: "2022" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Starting release year must be between 2000 and 2020" });
});

test("MoviesByReleaseYearsGet returns 406 when endReleaseYear is not a number", async () => {
  let req = { params: { startReleaseYear: "2001", endReleaseYear: "xyz" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Ending release year must be a number" });
});

test("MoviesByReleaseYearsGet returns 406 when endReleaseYear is less than 2000", async () => {
  let req = { params: { startReleaseYear: "2001", endReleaseYear: "1999" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Ending release year must be between 1977 and 2020" });
});

test("MoviesByReleaseYearsGet returns 406 when endReleaseYear is greater than 2020", async () => {
  let req = { params: { startReleaseYear: "2001", endReleaseYear: "2021" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({ error: "Ending release year must be between 1977 and 2020" });
});

test("MoviesByReleaseYearsGet returns 404 when no movies found in range", async () => {
  mockingoose(MovieModel).toReturn([], "find");

  let req = { params: { startReleaseYear: "2005", endReleaseYear: "2010" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movies found" });
});

test("MoviesByReleaseYearsGet returns 500 on database error", async () => {
  jest.spyOn(MovieModel, "find").mockRejectedValue(new Error("Database connection failed"));

  let req = { params: { startReleaseYear: "2001", endReleaseYear: "2003" } };
  let res = makeMockRes();

  await func.inject({ MovieModel })(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
