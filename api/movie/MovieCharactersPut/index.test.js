const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");

const makeReq = (body) => ({ body, header: {} });

const movieDoc = () => ({
  _id: "69efd1c1b2f8c7327f029fad",
  title: "The Lord of the Rings: The Fellowship of the Ring",
  releaseYear: 2001,
  characters: [
    { _id: "6a1e03d6c1b6526312a05de1", name: "Gandalf the Grey", race: "Maia (Wizard)" },
    { _id: "6a1e03dc3c961cfb2829658d", name: "Aragorn", race: "Man" },
    { _id: "6a1e03e2f2d798873cc68e6a", name: "Legolas", race: "Elf" },
    { _id: "6a1e03eea5cba77373130a83", name: "Boromir", race: "Man" },
  ],
  save: jest.fn().mockResolvedValue(true),
});

test("MovieCharactersPut sets ADDED, UPDATED, NOT ADDED per character", async () => {
  const movie = movieDoc();
  const MovieModel = { findOne: jest.fn().mockResolvedValue(movie) };

  const body = {
    _id: movie._id,
    characters: [
      { _id: "6a1e03d0a7e982d8b6bc2a82", name: "Frodo Baggins", race: "Hobbit" },
      { _id: "6a1e03d6c1b6526312a05de1", name: "Gandalf the Grey", race: "Maia (Wizard)" },
      { _id: "6a1e03dc3c961cfb2829658d", name: "Aragorn 2", race: "Man" },
      { _id: "6a1e03e2f2d798873cc68e6a", name: "Legolas", race: "Elf 2" },
      { _id: "6a1e03eea5cba77373130a83", name: "Boromir", race: "Man" },
    ],
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(body), res);

  expect(res.status).toHaveBeenCalledWith(200);
  const responseBody = res.json.mock.calls[0][0];
  expect(responseBody._id).toBe(movie._id);
  const statuses = responseBody.characters.map((c) => c.status);
  expect(statuses).toEqual(["ADDED", "NOT ADDED", "UPDATED", "UPDATED", "NOT ADDED"]);

  expect(movie.characters).toHaveLength(5);
  expect(movie.characters.find((c) => c.name === "Frodo Baggins")).toBeDefined();
  expect(movie.characters.find((c) => String(c._id) === "6a1e03dc3c961cfb2829658d").name).toBe("Aragorn 2");
  expect(movie.characters.find((c) => String(c._id) === "6a1e03e2f2d798873cc68e6a").race).toBe("Elf 2");
  expect(movie.save).toHaveBeenCalledTimes(1);
});

test("MovieCharactersPut returns 406 when payload is invalid", async () => {
  const MovieModel = { findOne: jest.fn() };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq({ _id: "x" }), res);

  expect(res.status).toHaveBeenCalledWith(406);
  expect(res.json).toHaveBeenCalledWith({
    error: "Movie _id and characters array are required.",
  });
  expect(MovieModel.findOne).not.toHaveBeenCalled();
});

test("MovieCharactersPut returns 404 when movie not found", async () => {
  const MovieModel = { findOne: jest.fn().mockResolvedValue(null) };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ _id: "deadbeef", characters: [] }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
});

test("MovieCharactersPut returns 500 when database is down", async () => {
  const MovieModel = {
    findOne: jest.fn().mockRejectedValue(new Error("db down")),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(
    makeReq({ _id: "x", characters: [] }),
    res,
  );

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
