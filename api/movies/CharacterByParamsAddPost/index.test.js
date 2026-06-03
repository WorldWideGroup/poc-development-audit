const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

describe("CharacterByParamsAddPost", () => {
  test("adds a new main character to a movie using route params", async () => {
    const movie = {
      _id: "6a206a5ac0afd9eaa6b718d0",
      title: "The Lord of the Rings: The War of the Rohirrim",
      releaseYear: 2024,
      characters: [{ name: "Helm" }],
      save: jest.fn().mockResolvedValue(),
    };

    const MovieModel = {
      findById: jest.fn().mockResolvedValue(movie),
    };

    const req = {
      params: {
        movieId: "6a206a5ac0afd9eaa6b718d0",
        mainCharacterName: "Olwyn",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.findById).toHaveBeenCalledWith(
      "6a206a5ac0afd9eaa6b718d0",
    );
    expect(movie.characters).toHaveLength(2);
    expect(movie.characters[1]).toEqual({
      _id: expect.any(Object),
      name: "Olwyn",
    });
    expect(movie.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(movie);
  });

  test("returns 406 when mainCharacterName is less than three characters", async () => {
    const MovieModel = {
      findById: jest.fn(),
    };

    const req = {
      params: {
        movieId: "6a206a5ac0afd9eaa6b718d0",
        mainCharacterName: "Ol",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({
      error:
        "Main Character Name is not valid. It must be at least three characters.",
    });
  });

  test("returns 404 when movie is not found", async () => {
    const MovieModel = {
      findById: jest.fn().mockResolvedValue(null),
    };

    const req = {
      params: {
        movieId: "69efd1c1b2f8c7327f029aaa",
        mainCharacterName: "Olwyn",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
  });
});
