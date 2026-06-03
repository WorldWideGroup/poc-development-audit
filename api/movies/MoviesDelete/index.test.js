const func = require("./index");

const makeMockRes = require("../../../helpers/makeMockRes");

const makeReq = () => ({ header: {} });

test("MoviesDelete deletes all movies and returns 204", async () => {
  const MovieModel = {
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 6 }),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(), res);

  expect(MovieModel.deleteMany).toHaveBeenCalledWith({});
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
});

test("MoviesDelete returns 500 when database is down", async () => {
  const MovieModel = {
    deleteMany: jest.fn().mockRejectedValue(new Error("db down")),
  };

  const res = makeMockRes();
  await func.inject({ MovieModel })(makeReq(), res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
});
