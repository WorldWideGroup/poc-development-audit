const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");
const mockingoose = require("mockingoose");
const { getJSON } = require("../../../helpers/readFile");

const movieDocuments = getJSON(
  "../api/movies/_test/documents/movies-get-document.json",
);

const inRange = (start, end) =>
  movieDocuments.filter(
    (m) => m.releaseYear >= start && m.releaseYear <= end,
  );

const makeReq = (startReleaseYear, endReleaseYear) => ({
  params: { startReleaseYear, endReleaseYear },
  header: {},
});

test("MoviesByReleaseYearsGet returns movies in range sorted by releaseYear", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn(inRange(2000, 2005), "find");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("2000", "2005"), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body).toHaveLength(3);
  expect(body[0].releaseYear).toBe(2001);
  expect(body[1].releaseYear).toBe(2002);
  expect(body[2].releaseYear).toBe(2003);
});

test("MoviesByReleaseYearsGet returns 406 when starting year is not a number", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("abc", "2005"), res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Starting release year must be a number",
  });
});

test("MoviesByReleaseYearsGet returns 406 when starting year is out of range", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("1999", "2005"), res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Starting release year must be between 2000 and 2020",
  });

  const res2 = makeMockRes();
  await func.inject({ MovieModel })(makeReq("2021", "2022"), res2);
  expect(res2.status).toHaveBeenCalledWith(406);
  expect(res2.json).toHaveBeenCalledWith({
    error: "Starting release year must be between 2000 and 2020",
  });
});

test("MoviesByReleaseYearsGet returns 406 when ending year is not a number", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("2000", "xyz"), res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Ending release year must be a number",
  });
});

test("MoviesByReleaseYearsGet returns 406 when ending year is out of range", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("2000", "1999"), res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Ending release year must be between 1977 and 2020",
  });

  const res2 = makeMockRes();
  await func.inject({ MovieModel })(makeReq("2000", "2021"), res2);
  expect(res2.status).toHaveBeenCalledWith(406);
  expect(res2.json).toHaveBeenCalledWith({
    error: "Ending release year must be between 1977 and 2020",
  });
});

test("MoviesByReleaseYearsGet returns 404 when no movies are found", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  mockingoose(MovieModel).toReturn([], "find");

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("2018", "2019"), res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movies found" });
});

test("MoviesByReleaseYearsGet returns 500 when database is down", async () => {
  const MovieModel = require("../models/movie");
  mockingoose.resetAll();
  MovieModel.find = jest
    .fn()
    .mockRejectedValue(new Error("Database connection failed"));

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq("2000", "2005"), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
