const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

describe("MoviesByCharacterNameGet", () => {
  test("returns movies matching the provided character name", async () => {
    const expectedMovies = [
      {
        _id: { $oid: "69efd1c1b2f8c7327f029fad" },
        title: "The Lord of the Rings: The Fellowship of the Ring",
        releaseYear: 2001,
      },
      {
        _id: { $oid: "69efd1c1b2f8c7327f029fae" },
        title: "The Lord of the Rings: The Two Towers",
        releaseYear: 2002,
      },
      {
        _id: { $oid: "69efd1c1b2f8c7327f029faf" },
        title: "The Lord of the Rings: The Return of the King",
        releaseYear: 2003,
      },
    ];

    const MovieModel = {
      find: jest.fn().mockResolvedValue(expectedMovies),
    };

    const req = {
      params: {
        characterName: "Frodo Baggins",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.find).toHaveBeenCalledWith(
      {
        "characters.name": "Frodo Baggins",
      },
      {
        _id: 1,
        title: 1,
        releaseYear: 1,
      },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedMovies);
  });

  test("returns 406 when character name is missing", async () => {
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
    expect(res.json).toHaveBeenCalledWith({
      error: "Character name is required",
    });
  });

  test("returns 404 when no movies match the provided character name", async () => {
    const MovieModel = {
      find: jest.fn().mockResolvedValue([]),
    };

    const req = {
      params: {
        characterName: "Nobody McFakerson",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No movie(s) with this Character were found",
    });
  });

  test("returns 500 when database lookup fails", async () => {
    const MovieModel = {
      find: jest.fn().mockRejectedValue(new Error("Database failed")),
    };

    const req = {
      params: {
        characterName: "Frodo Baggins",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
