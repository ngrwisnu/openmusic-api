import { nanoid } from "nanoid";
import InvariantError from "../../middleware/error/InvariantError.js";
import NotFoundError from "../../middleware/error/NotFoundError.js";
import Postgre from "pg";
import { mappedAlbumOutput } from "../../utils/mapDBToModel.js";
const { Pool } = Postgre;

class AlbumServices {
  constructor(songService) {
    this._pool = new Pool();
    this._songService = songService;
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
      text: "SELECT albums.id, albums.name, albums.year, albums.cover FROM albums WHERE id=$1",
      values: [id],
    };

    const album = await this._pool.query(query);

    if (!album.rows.length) throw new NotFoundError("Albums not found!");

    const songs = await this._songService.getSongsByAlbumId(album.rows[0].id);

    const mappedAlbum = mappedAlbumOutput(album.rows[0]);

    return {
      ...mappedAlbum,
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

  async updateAlbumCover(albumId, filename) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: "UPDATE albums SET cover=$2, updated_at=$3 WHERE id=$1 RETURNING id",
      values: [albumId, filename, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError("Album not found!");
  }

  async addAlbumLike(userId, albumId) {
    const likeId = `li-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO album_likes VALUES($1, $2, $3) RETURNING id",
      values: [likeId, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError("Couldn't like the album!");
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: "DELETE FROM album_likes WHERE user_id=$1 AND album_id=$2 RETURNING id",
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount)
      throw new InvariantError("Couldn't dislike the album!");
  }

  async getAlbumLikes(albumId) {
    const query = {
      text: "SELECT COUNT(user_id) AS likes FROM album_likes WHERE album_id=$1",
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return +result.rows[0].likes;
  }
}

export default AlbumServices;
