const func = require("./index");
const makeMockRes = require("../../../helpers/makeMockRes");

describe("MovieAddPost", () => {
  test("adds a new movie with no main characters", async () => {
    const newMovie = {
      _id: "690b9436fb29d9d76b2a0dc2",
      title: "The Lord of the Rings: The War of the Rohirrim",
      releaseYear: 2024,
      characters: [],
    };

    const MovieModel = {
      create: jest.fn().mockResolvedValue(newMovie),
    };

    const req = {
      body: {
        movieName: "The Lord of the Rings: The War of the Rohirrim",
        releaseYear: 2024,
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.create).toHaveBeenCalledWith({
      _id: expect.any(Object),
      title: "The Lord of the Rings: The War of the Rohirrim",
      releaseYear: 2024,
      characters: [],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(newMovie);
  });

  test("returns 406 when movie name is missing", async () => {
    const MovieModel = {
      create: jest.fn(),
    };

    const req = {
      body: {
        releaseYear: 2024,
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "No movie name found" });
  });

  test("returns 406 when movie name has three characters or less", async () => {
    const MovieModel = {
      create: jest.fn(),
    };

    const req = {
      body: {
        movieName: "Lot",
        releaseYear: 2024,
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid movie name" });
  });

  test("returns 406 when release year is invalid", async () => {
    const MovieModel = {
      create: jest.fn(),
    };

    const req = {
      body: {
        movieName: "The Lord of the Rings: The War of the Rohirrim",
        releaseYear: 1989,
      },
    };

    const res = makeMockRes();

    await func.inject({ MovieModel })(req, res);

    expect(MovieModel.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(406);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid release year" });
  });
});
