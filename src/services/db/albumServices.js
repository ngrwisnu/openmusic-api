import { nanoid } from "nanoid";
import Postgre from "pg";
import InvariantError from "../../middleware/error/InvariantError.js";
import NotFoundError from "../../middleware/error/NotFoundError.js";
import SongServices from "./songServices.js";
const { Pool } = Postgre;

class AlbumServices {
  constructor() {
    this._pool = new Pool();
    this._songService = new SongServices();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id)
      throw new InvariantError("Failed adding new album!");

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: "SELECT albums.id, albums.name, albums.year FROM albums WHERE id=$1",
      values: [id],
    };

    const album = await this._pool.query(query);

    if (!album.rows.length) throw new NotFoundError("Albums not found!");

    const songs = await this._songService.getSongsByAlbumId(album.rows[0].id);

    return {
      ...album.rows[0],
      songs,
    };
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: "UPDATE albums SET name=$2, year=$3, updated_at=$4 WHERE id=$1 RETURNING id",
      values: [id, name, year, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("Album not found!");
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id=$1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("Album not found!");
  }
}

export default AlbumServices;
