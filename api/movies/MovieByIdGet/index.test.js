const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

describe("MovieByIdGet", () => {
  test("returns one movie by id", async () => {
    const expectedMovie = {
      _id: { $oid: "69efd1c1b2f8c7327f029faf" },
      title: "The Lord of the Rings: The Return of the King",
      releaseYear: 2003,
      characters: [
        { name: "Frodo Baggins", race: "Hobbit" },
        { name: "Aragorn", race: "Man" },
        { name: "Gandalf the White", race: "Maia (Wizard)" },
        { name: "Arwen", race: "Elf" },
        { name: "Elrond", race: "Elf" },
        { name: "Sauron", race: "Maia (Dark Lord)" },
        { name: "Witch-king of Angmar", race: "Wraith" },
      ],
    };

    const MovieModel = {
      findById: jest.fn().mockResolvedValue(expectedMovie),
    };

    const req = {
      params: {
        id: "69efd1c1b2f8c7327f029faf",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.findById).toHaveBeenCalledWith(
      "69efd1c1b2f8c7327f029faf",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedMovie);
  });

  test("returns 406 when id is missing", async () => {
    const MovieModel = {
      findById: jest.fn(),
    };

    const req = {
      params: {},
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Movie id is required" });
  });

  test("returns 404 when no movie is found", async () => {
    const MovieModel = {
      findById: jest.fn().mockResolvedValue(null),
    };

    const req = {
      params: {
        id: "69efd1c1b2f8c7327f029aaa",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
  });

  test("returns 500 when database lookup fails", async () => {
    const MovieModel = {
      findById: jest.fn().mockRejectedValue(new Error("Database failed")),
    };

    const req = {
      params: {
        id: "69efd1c1b2f8c7327f029faf",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
