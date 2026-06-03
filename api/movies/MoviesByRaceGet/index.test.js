const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

describe("MoviesByRaceGet", () => {
  test("returns movies with only the characters matching the provided race", async () => {
    const matchingMoviesFromDb = [
      {
        _id: { $oid: "69efd1c1b2f8c7327f029fad" },
        title: "The Lord of the Rings: The Fellowship of the Ring",
        releaseYear: 2001,
        characters: [
          { name: "Frodo Baggins", race: "Hobbit" },
          { name: "Gimli", race: "Dwarf" },
          { name: "Aragorn", race: "Man" },
        ],
      },
      {
        _id: { $oid: "69efd1c1b2f8c7327f029fb0" },
        title: "The Hobbit: An Unexpected Journey",
        releaseYear: 2012,
        characters: [
          { name: "Thorin Oakenshield", race: "Dwarf" },
          { name: "Balin", race: "Dwarf" },
          { name: "Bilbo Baggins", race: "Hobbit" },
        ],
      },
    ];

    const expectedMovies = [
      {
        _id: { $oid: "69efd1c1b2f8c7327f029fad" },
        title: "The Lord of the Rings: The Fellowship of the Ring",
        releaseYear: 2001,
        characters: [{ name: "Gimli", race: "Dwarf" }],
      },
      {
        _id: { $oid: "69efd1c1b2f8c7327f029fb0" },
        title: "The Hobbit: An Unexpected Journey",
        releaseYear: 2012,
        characters: [
          { name: "Thorin Oakenshield", race: "Dwarf" },
          { name: "Balin", race: "Dwarf" },
        ],
      },
    ];

    const MovieModel = {
      find: jest.fn().mockResolvedValue(matchingMoviesFromDb),
    };

    const req = {
      params: {
        race: "dwarf",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.find).toHaveBeenCalledWith({
      "characters.race": "Dwarf",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedMovies);
  });

  test("returns 406 when race is missing", async () => {
    const MovieModel = {
      find: jest.fn(),
    };

    const req = {
      params: {},
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Race is required" });
  });

  test("returns 404 when no movies match the provided race", async () => {
    const MovieModel = {
      find: jest.fn().mockResolvedValue([]),
    };

    const req = {
      params: {
        race: "oompa loompa",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No movie(s) with characters of the oompa loompa race were found",
    });
  });

  test("returns 500 when database lookup fails", async () => {
    const MovieModel = {
      find: jest.fn().mockRejectedValue(new Error("Database failed")),
    };

    const req = {
      params: {
        race: "dwarf",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
