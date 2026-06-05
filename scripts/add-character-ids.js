const mongoose = require("mongoose");
const MovieModel = require("../api/movies/models/movie");

mongoose
  .connect(
    "mongodb://cosmos-wwg-dev-centralus:2IO6XwrVqSxCXl2AFiQzO1CQ7VdbpqrkmE60dS5N609mPvQ5e507GgWNoNnXP1JxwTopBxLtlWfXQcjMSpAdIw==@cosmos-wwg-dev-centralus.mongo.cosmos.azure.com:10255/test?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@cosmos-wwg-dev-centralus@",
    { serverSelectionTimeoutMS: 10000 }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((e) => { console.error("Connection failed:", e.message); process.exit(1); });

async function run() {
  // Use lean() to get raw DB data — characters without _id in DB will have no _id field
  const rawMovies = await MovieModel.find().lean();
  let updatedMovies = 0;

  for (const raw of rawMovies) {
    const needsUpdate = raw.characters.some(c => !c._id);
    if (needsUpdate) {
      const movie = await MovieModel.findById(raw._id);
      // markModified forces Mongoose to include the full characters array
      // (with auto-generated _ids) in the update sent to the DB
      movie.markModified("characters");
      await movie.save();
      updatedMovies++;
      console.log(`Updated: ${movie.title || movie.name} (${movie.characters.length} characters)`);
    }
  }

  console.log(`\nDone. Updated ${updatedMovies} movies.`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
