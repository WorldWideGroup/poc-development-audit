const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

describe("CharacterAddPost", () => {
  test("adds a new main character to a movie", async () => {
    const movie = {
      _id: "6a206a5ac0afd9eaa6b718d0",
      title: "The Lord of the Rings: The War of the Rohirrim",
      releaseYear: 2024,
      characters: [],
      save: jest.fn().mockResolvedValue(),
    };

    const MovieModel = {
      findById: jest.fn().mockResolvedValue(movie),
    };

    const req = {
      body: {
        movieId: "6a206a5ac0afd9eaa6b718d0",
        characterName: "Helm",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.findById).toHaveBeenCalledWith(
      "6a206a5ac0afd9eaa6b718d0",
    );
    expect(movie.characters).toHaveLength(1);
    expect(movie.characters[0]).toEqual({
      _id: expect.any(Object),
      name: "Helm",
    });
    expect(movie.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(movie);
  });

  test("returns 404 when movie is not found", async () => {
    const MovieModel = {
      findById: jest.fn().mockResolvedValue(null),
    };

    const req = {
      body: {
        movieId: "69efd1c1b2f8c7327f029aaa",
        characterName: "Helm",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
  });

  test("returns 404 when characterName is missing", async () => {
    const MovieModel = {
      findById: jest.fn(),
    };

    const req = {
      body: {
        movieId: "6a206a5ac0afd9eaa6b718d0",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No Main Character Name Provided",
    });
  });

  test("returns 406 when characterName is less than three characters", async () => {
    const MovieModel = {
      findById: jest.fn(),
    };

    const req = {
      body: {
        movieId: "6a206a5ac0afd9eaa6b718d0",
        characterName: "He",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Character Name is not valid. It must be at least three characters.",
    });
  });
});
