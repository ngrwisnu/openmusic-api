import { nanoid } from "nanoid";
import Postgre from "pg";
import InvariantError from "../../middleware/error/InvariantError.js";
import NotFoundError from "../../middleware/error/NotFoundError.js";
import { mappedSongOutput } from "../../utils/mapDBToModel.js";
const { Pool } = Postgre;

class SongServices {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = nanoid();
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO songs(id, title, year, genre, performer, duration, album_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id, album_id",
      values: [id, title, year, genre, performer, duration, albumId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) throw new InvariantError("Failed adding new song!");

    await this._cacheService.delete(`album_songs:${result.rows[0].album_id}`);

    return result.rows[0].id;
  }

  async getSongs(queries) {
    let query = {};

    if (!Object.keys(queries).length) {
      const result = await this._pool.query("SELECT * FROM songs");
      return result.rows;
    }

    const queryValues = Object.keys(queries);

    if (queryValues.length === 2) {
      query = {
        text: "SELECT * FROM songs WHERE title ILIKE $1 AND performer ILIKE $2",
        values: [`%${queries.title}%`, `%${queries.performer}%`],
      };
    }

    if (queryValues.length === 1 && queryValues[0] === "title") {
      query = {
        text: "SELECT * FROM songs WHERE title ILIKE $1",
        values: [`%${queries.title}%`],
      };
    } else if (queryValues.length === 1 && queryValues[0] === "performer") {
      query = {
        text: "SELECT * FROM songs WHERE performer ILIKE $1",
        values: [`%${queries.performer}%`],
      };
    }

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    try {
      const cacheResult = await this._cacheService.get(`song:${id}`);

      return {
        data: JSON.parse(cacheResult),
        isCache: true,
      };
    } catch (error) {
      const query = {
        text: "SELECT * FROM songs WHERE id=$1",
        values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) throw new NotFoundError("Song not found!");

      const mappedSong = mappedSongOutput(result.rows[0]);

      await this._cacheService.set(`song:${id}`, JSON.stringify(mappedSong));

      return {
        data: mappedSong,
        isCache: false,
      };
    }
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString();

    let query = {
      text: "UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6, updated_at=$7 WHERE id=$8 RETURNING id, album_id",
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("Song not found!");

    await this._cacheService.delete([
      `song:${id}`,
      `album_songs:${result.rows[0].album_id}`,
    ]);
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id=$1 RETURNING id, album_id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("Song not found!");

    await this._cacheService.delete([
      `song:${id}`,
      `album_songs:${result.rows[0].album_id}`,
    ]);
  }

  async getSongsByAlbumId(albumId) {
    try {
      const cacheResult = await this._cacheService.get(
        `album_songs:${albumId}`
      );

      return {
        data: JSON.parse(cacheResult),
        isCache: true,
      };
    } catch (error) {
      const query = {
        text: "SELECT songs.id, songs.title, songs.performer FROM songs WHERE album_id = $1",
        values: [albumId],
      };

      const songs = await this._pool.query(query);

      await this._cacheService.set(
        `album_songs:{${albumId}}`,
        JSON.stringify(songs.rows)
      );

      return {
        data: JSON.parse(songs.rows),
        isCache: false,
      };
    }
  }

  async verifySongById(songId) {
    const query = {
      text: "SELECT * FROM songs WHERE id=$1",
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("Song not found!");
  }
}

export default SongServices;
