# Middle Earth API

A RESTful API for managing data about Peter Jackson's six live-action Middle-earth films. Built with Node.js, Express, and MongoDB (Azure Cosmos DB).

## Setup

```bash
npm install
npm start        # starts on http://localhost:3750
npm test         # runs all unit tests with coverage
```

---

## Routes

### Movies — `/api/movies`

---

#### GET /api/movies/all
Returns all movies sorted by release year (oldest to newest).

**Response 200**
```json
[{ "_id": "...", "title": "...", "releaseYear": 2001, "characters": [...] }]
```

---

#### GET /api/movies/id/{id}
Returns a single movie by `_id`.

| Status | Body |
|---|---|
| 200 | Movie object |
| 400 | `{ "error": "No _id received" }` |
| 404 | `{ "error": "No movie found" }` |

---

#### GET /api/movies/between/{startReleaseYear}/and/{endReleaseYear}
Returns movies whose release year falls within the given range.

| Status | Body |
|---|---|
| 200 | Array of movies |
| 404 | `{ "error": "No movies found" }` |
| 406 | `{ "error": "Starting release year must be a number" }` |
| 406 | `{ "error": "Starting release year must be between 2000 and 2020" }` |
| 406 | `{ "error": "Ending release year must be a number" }` |
| 406 | `{ "error": "Ending release year must be between 1977 and 2020" }` |

---

#### GET /api/movies/character/{characterName}/name
Returns an array of `{ _id, title, releaseYear }` for movies containing the given character name.

| Status | Body |
|---|---|
| 200 | Array of `{ _id, title, releaseYear }` |
| 404 | `{ "error": "No movie(s) with this Character were found" }` |

---

#### GET /api/movies/by-race/{race}
Returns movies that contain at least one character of the given race. Only matching characters are included in each movie's characters array. Matching is case-insensitive.

| Status | Body |
|---|---|
| 200 | Array of `{ _id, title, releaseYear, characters }` |
| 404 | `{ "error": "No movie(s) with characters of the {race} race were found" }` |

---

#### GET /api/movies/by/race/{raceName}
Returns a deduplicated list of characters of the given race, each with the movies they appear in. Matching is case-insensitive.

**Response 200**
```json
[{ "name": "Aragorn", "movies": ["The Fellowship of the Ring", "The Two Towers", "..."] }]
```

| Status | Body |
|---|---|
| 200 | Array of `{ name, movies[] }` |
| 404 | `{ "error": "No character with that race was found in a movie." }` |

---

#### GET /api/movies/all/characters
Returns a flat, deduplicated list of all characters across all movies, ordered by movie release year. Each character appears only once.

**Response 200**
```json
[{ "name": "Frodo Baggins", "race": "Hobbit" }, ...]
```

---

#### GET /api/movies/movie-id/{movieId}/character-name/{characterName}
Returns the name and race of a character in a specific movie. Character name matching is case-insensitive.

**Response 200**
```json
{ "movie": "The Return of the King", "name": "Aragorn", "race": "Man" }
```

| Status | Body |
|---|---|
| 200 | `{ movie, name, race }` |
| 404 | `{ "error": "No movie found" }` |
| 404 | `{ "error": "No character found" }` |

---

#### GET /api/movies/movie-id/{movieId}/characters
Returns the name of every character in a specific movie.

**Response 200**
```json
[{ "name": "Bilbo Baggins" }, { "name": "Gandalf the Grey" }]
```

| Status | Body |
|---|---|
| 200 | Array of `{ name }` |
| 404 | `{ "error": "No movie found" }` |

---

#### POST /api/movies/add/all
Accepts an array of movies. Adds each movie if its `_id` does not already exist; skips it if it does. Returns the input array with a `status` field added to each item.

**Request Body**
```json
[{ "_id": "...", "title": "...", "releaseYear": 2001, "characters": [...] }]
```

**Response 200**
```json
[{ "_id": "...", "title": "...", "releaseYear": 2001, "characters": [...], "status": "ADDED" }]
```
Status values: `ADDED` or `NOT ADDED`.

---

#### DELETE /api/movies/character/delete
Removes a single character from a movie.

**Request Body**
```json
{ "movieId": "...", "characterId": "..." }
```

| Status | Body |
|---|---|
| 204 | No content |
| 404 | `{ "error": "No movie found" }` |
| 404 | `{ "error": "No Character found" }` |

---

#### DELETE /api/movies/delete
Deletes all movies from the database.

| Status | Body |
|---|---|
| 204 | No content |

---

### Movie — `/api/movie`

---

#### POST /api/movie/add
Creates a new movie with no characters.

**Request Body**
```json
{ "movieName": "...", "releaseYear": 2024 }
```

**Response 200**
```json
{ "_id": "...", "name": "...", "releaseYear": 2024, "characters": [] }
```

| Status | Body |
|---|---|
| 200 | New movie object |
| 406 | `{ "error": "No movie name found" }` |
| 406 | `{ "error": "Invalid movie name" }` |
| 406 | `{ "error": "Invalid release year" }` |

---

#### POST /api/movie/character/add
Adds a character (by name only) to a movie. Returns the updated movie.

**Request Body**
```json
{ "movieId": "...", "characterName": "Helm" }
```

| Status | Body |
|---|---|
| 200 | Updated movie object |
| 404 | `{ "error": "No movie found" }` |
| 404 | `{ "error": "No Main Character Name Provided" }` |
| 406 | `{ "error": "Character Name is not valid. It must be at least three characters." }` |

---

#### POST /api/movie/{movie_id}/character/{mainCharacterName}/add
Adds a character to a movie via URL parameters. Returns the updated movie.

| Status | Body |
|---|---|
| 200 | Updated movie object |
| 404 | `{ "error": "No movie found" }` |
| 406 | `{ "error": "Main Character Name is not valid. It must be at least three characters." }` |

---

#### POST /api/movie/add/characters
Adds a character (with `id`, `name`, and `race`) to one or more movies. Skips movies that don't exist or already contain the character. Returns 201 with no body on success.

**Request Body**
```json
{
  "movies": ["movieId1", "movieId2"],
  "characterToAdd": { "id": "...", "name": "Dave Jones", "race": "Man" }
}
```

| Status | Body |
|---|---|
| 201 | No content |
| 406 | `{ "error": "Your character can not be added." }` |

---

#### PUT /api/movie/name/update
Updates the name of a movie.

**Request Body**
```json
{ "movieId": "...", "movieName": "New Title" }
```

| Status | Body |
|---|---|
| 204 | No content |
| 404 | `{ "error": "No movie found" }` |
| 406 | `{ "error": "Movie Name is not valid. It must be at least three characters." }` |

---

#### PUT /api/movie/characters/update
Upserts characters on a movie. For each character: adds if not found, updates if name/race changed, skips if unchanged. Returns the result with a `status` per character.

**Request Body**
```json
{
  "_id": "movieId",
  "characters": [{ "_id": "...", "name": "Aragorn", "race": "Man" }]
}
```

**Response 200**
```json
{
  "_id": "movieId",
  "characters": [{ "_id": "...", "name": "Aragorn", "race": "Man", "status": "ADDED" }]
}
```
Status values: `ADDED`, `UPDATED`, or `NOT ADDED`.

| Status | Body |
|---|---|
| 200 | `{ _id, characters[] }` with status per character |
| 404 | `{ "error": "No movie found" }` |

---

#### PUT /api/movie/{movieId}/character/{characterId}/name/{characterName}/update
Updates a character's name via URL parameters.

| Status | Body |
|---|---|
| 204 | No content |
| 404 | `{ "error": "Movie not found for id {movieId}" }` |
| 404 | `{ "error": "Character not found for id {characterId}" }` |
| 406 | `{ "error": "Character Name is not valid. It must be at least three characters." }` |

---

#### PUT /api/movie/character/update
Updates a character's name via request body.

**Request Body**
```json
{ "movieId": "...", "characterId": "...", "name": "Smeagol" }
```

| Status | Body |
|---|---|
| 204 | No content |
| 404 | `{ "error": "Movie not found for id {movieId}" }` |
| 404 | `{ "error": "Character not found for id {characterId}" }` |
| 406 | `{ "error": "Character Name is not valid. It must be at least three characters." }` |

---

#### DELETE /api/movie/{movieId}/characters/delete
Removes all characters from a movie.

| Status | Body |
|---|---|
| 204 | No content |
| 404 | `{ "error": "No movie found" }` |
