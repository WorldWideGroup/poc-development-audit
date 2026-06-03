const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");

const makeReq = (body) => ({ body, header: {} });

const sampleMovies = [
  {
    _id: "69efd1c1b2f8c7327f029fad",
    title: "The Lord of the Rings: The Fellowship of the Ring",
    releaseYear: 2001,
    characters: [{ name: "Frodo Baggins", race: "Hobbit" }],
  },
  {
    _id: "69efd1c1b2f8c7327f029fae",
    title: "The Lord of the Rings: The Two Towers",
    releaseYear: 2002,
    characters: [{ name: "Aragorn", race: "Man" }],
  },
];

test("MovieAllAddPost adds new movies and skips existing ones", async () => {
  const MovieModel = {
    find: jest
      .fn()
      .mockResolvedValue([{ _id: "69efd1c1b2f8c7327f029fae" }]),
    create: jest.fn().mockResolvedValue(true),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(sampleMovies), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body).toHaveLength(2);
  expect(body[0]).toMatchObject({
    _id: "69efd1c1b2f8c7327f029fad",
    status: "ADDED",
  });
  expect(body[1]).toMatchObject({
    _id: "69efd1c1b2f8c7327f029fae",
    status: "NOT ADDED",
  });
  expect(MovieModel.create).toHaveBeenCalledTimes(1);
  expect(MovieModel.create).toHaveBeenCalledWith(sampleMovies[0]);
});

test("MovieAllAddPost adds all when none exist", async () => {
  const MovieModel = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue(true),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(sampleMovies), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const body = res.json.mock.calls[0][0];
  expect(body.every((m) => m.status === "ADDED")).toBe(true);
  expect(MovieModel.create).toHaveBeenCalledTimes(2);
});

test("MovieAllAddPost returns 406 when body is not an array", async () => {
  const MovieModel = { find: jest.fn(), create: jest.fn() };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq({ not: "array" }), res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Body must be an array of movies.",
  });
  expect(MovieModel.find).not.toHaveBeenCalled();
});

test("MovieAllAddPost returns 500 when database is down", async () => {
  const MovieModel = {
    find: jest.fn().mockRejectedValue(new Error("db down")),
    create: jest.fn(),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(sampleMovies), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
