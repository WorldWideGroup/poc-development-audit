const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

describe("CharactersByMovieIdGet", () => {
  test("returns character names for a movie", async () => {
    const MovieModel = {
      findById: jest.fn().mockResolvedValue({
        title: "The Hobbit: An Unexpected Journey",
        characters: [
          { name: "Bilbo Baggins", race: "Hobbit" },
          { name: "Gandalf the Grey", race: "Maia" },
          { name: "Thorin Oakenshield", race: "Dwarf" },
        ],
      }),
    };

    const req = {
      params: {
        movieId: "69efd1c1b2f8c7327f029fb0",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.findById).toHaveBeenCalledWith(
      "69efd1c1b2f8c7327f029fb0",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { name: "Bilbo Baggins" },
      { name: "Gandalf the Grey" },
      { name: "Thorin Oakenshield" },
    ]);
  });

  test("returns 404 when movie is not found", async () => {
    const MovieModel = {
      findById: jest.fn().mockResolvedValue(null),
    };

    const req = {
      params: {
        movieId: "69efd1c1b2f8c7327f029aaa",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
  });

  test("returns 404 when movie ID format is invalid", async () => {
    const MovieModel = {
      findById: jest.fn(),
    };

    const req = {
      params: {
        movieId: "not-a-real-id",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
  });
});
