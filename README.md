# poc-development-audit

Express + Mongoose API serving Middle-earth movies and characters.

## Run

```
npm install
npm start    # http://localhost:3750
npm test
```

Routes are auto-discovered from `api/<prefix>/<HandlerDir>/route.yaml` and mounted under `/api/<prefix>/<route>`. Path parameters use `{name}` syntax.

## Movie schema

```
{ _id: ObjectId, title: String, releaseYear: Number,
  characters: [ { _id: ObjectId, name: String, race: String } ] }
```

## Endpoints

### Movies (read)

| Method | Route | Required | Description |
|---|---|---|---|
| GET | `/api/movies/all` | — | All movies. |
| GET | `/api/movies/id/{id}` | path `id` | Single movie by `_id`. 404 if not found. |
| GET | `/api/movies/between/{startReleaseYear}/and/{endReleaseYear}` | path years (numbers) | Movies released in the inclusive range. |
| GET | `/api/movies/by-race/{race}` | path `race` | Movies containing characters of `race` (only matching characters returned). |
| GET | `/api/movies/by/race/{raceName}` | path `raceName` | Each character of that race (once) with the list of movies they appear in. 404 if none. |
| GET | `/api/movies/character/{characterName}/name` | path `characterName` | Movies that include a character with that name. |
| GET | `/api/movies/all/characters` | — | All characters across all movies. |
| GET | `/api/movies/movie-id/{movieId}/characters` | path `movieId` | Characters of a single movie. |
| GET | `/api/movies/movie-id/{movieId}/character-name/{characterName}` | path `movieId`, `characterName` | Character `_id` for a name within a movie. |

### Movie (create / update)

| Method | Route | Required (body unless noted) | Description |
|---|---|---|---|
| POST | `/api/movie/add` | `movieName` (string, >3 chars), `releaseYear` (1990..current year) | Create a movie. |
| POST | `/api/movie/character/add` | `movieId`, `characterName` (>=3 chars) | Add a character to a movie. |
| POST | `/api/movie/{movie_id}/character/{mainCharacterName}/add` | path `movie_id`, `mainCharacterName` (>=3 chars) | Same as above via path params. |
| POST | `/api/movie/add/characters` | body `movies` (string[] of movie ids), `characterToAdd` `{ id, name, race }` | Adds the same character to many movies; skips movies that already have it. 201. |
| PUT | `/api/movie/name/update` | `movieId`, `movieName` (>=3 chars) | Rename a movie's `title`. 204. |
| PUT | `/api/movie/character/update` | `movieId`, `characterId`, `name` (>=3 chars) | Rename a character. 204. |
| PUT | `/api/movie/{movieId}/character/{characterId}/name/{characterName}/update` | path params; `characterName` (>=3 chars) | Same as above via path params. |
| PUT | `/api/movie/characters/update` | `_id` (movie), `characters: [{_id, name, race}]` | Per character, returns `status`: `ADDED` / `UPDATED` / `NOT ADDED`. |

### Movies (bulk add / delete)

| Method | Route | Required | Description |
|---|---|---|---|
| POST | `/api/movies/add/all` | body: array of full movie objects (`_id`, `title`, `releaseYear`, `characters`) | Inserts movies whose `_id` doesn't already exist. Returns each with `status`: `ADDED` / `NOT ADDED`. |
| DELETE | `/api/movies/character/delete` | body `movieId`, `characterId` | Remove a character from a movie. 204. 404 with `{ "error": "No movie found" }` or `{ "error": "No Character found" }`. |
| DELETE | `/api/movie/{movieId}/characters/delete` | path `movieId` | Clear all characters from a movie. 204. |
| DELETE | `/api/movies/delete` | — | Delete every movie. 204. |

## Common responses

- `400` / `404` / `406` return `{ "error": "..." }` per the route's validation rules.
- `500` returns `{ "error": "Database error" }` on unexpected failure.