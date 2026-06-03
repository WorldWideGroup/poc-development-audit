const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

describe("MoviesByReleaseYearsGet", () => {
  test("returns movies between the starting and ending release years", async () => {
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
        startReleaseYear: "2000",
        endReleaseYear: "2005",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.find).toHaveBeenCalledWith({
      releaseYear: {
        $gte: 2000,
        $lte: 2005,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedMovies);
  });

  test("returns 406 when starting release year is not a number", async () => {
    const MovieModel = {
      find: jest.fn(),
    };

    const req = {
      params: {
        startReleaseYear: "nope",
        endReleaseYear: "2005",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({
      error: "Starting release year must be a number",
    });
  });

  test("returns 406 when starting release year is outside the allowed range", async () => {
    const MovieModel = {
      find: jest.fn(),
    };

    const req = {
      params: {
        startReleaseYear: "1999",
        endReleaseYear: "2005",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({
      error: "Starting release year must be between 2000 and 2020",
    });
  });

  test("returns 406 when ending release year is not a number", async () => {
    const MovieModel = {
      find: jest.fn(),
    };

    const req = {
      params: {
        startReleaseYear: "2000",
        endReleaseYear: "nope",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({
      error: "Ending release year must be a number",
    });
  });

  test("returns 406 when ending release year is outside the allowed range", async () => {
    const MovieModel = {
      find: jest.fn(),
    };

    const req = {
      params: {
        startReleaseYear: "2000",
        endReleaseYear: "2021",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({
      error: "Ending release year must be between 1977 and 2020",
    });
  });

  test("returns 404 when no movies are found", async () => {
    const MovieModel = {
      find: jest.fn().mockResolvedValue([]),
    };

    const req = {
      params: {
        startReleaseYear: "2004",
        endReleaseYear: "2005",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movies found" });
  });

  test("returns 500 when database lookup fails", async () => {
    const MovieModel = {
      find: jest.fn().mockRejectedValue(new Error("Database failed")),
    };

    const req = {
      params: {
        startReleaseYear: "2000",
        endReleaseYear: "2005",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
