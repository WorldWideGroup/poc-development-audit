const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

describe("NamesByIdGet", () => {
  test("returns movie name, character name, and race", async () => {
    const MovieModel = {
      findById: jest.fn().mockResolvedValue({
        title: "The Lord of the Rings: The Return of the King",
        characters: [
          { name: "Frodo Baggins", race: "Hobbit" },
          { name: "Aragorn", race: "Man" },
        ],
      }),
    };

    const req = {
      params: {
        movieId: "69efd1c1b2f8c7327f029faf",
        characterName: "aragorn",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.findById).toHaveBeenCalledWith(
      "69efd1c1b2f8c7327f029faf",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      movie: "The Lord of the Rings: The Return of the King",
      name: "Aragorn",
      race: "Man",
    });
  });

  test("returns 404 when movie is not found", async () => {
    const MovieModel = {
      findById: jest.fn().mockResolvedValue(null),
    };

    const req = {
      params: {
        movieId: "69efd1c1b2f8c7327f029aaa",
        characterName: "aragorn",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie found" });
  });

  test("returns 404 when character is not found", async () => {
    const MovieModel = {
      findById: jest.fn().mockResolvedValue({
        title: "The Lord of the Rings: The Return of the King",
        characters: [{ name: "Frodo Baggins", race: "Hobbit" }],
      }),
    };

    const req = {
      params: {
        movieId: "69efd1c1b2f8c7327f029faf",
        characterName: "aragorn",
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No character found" });
  });
});
