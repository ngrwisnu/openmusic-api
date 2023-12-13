import { nanoid } from "nanoid";
import Postgre from "pg";
import InvariantError from "../../middleware/error/InvariantError.js";
import NotFoundError from "../../middleware/error/NotFoundError.js";
import AuthorizationError from "../../middleware/error/AuthorizationError.js";
import { mapActivityOutput } from "../../utils/mapDBToModel.js";
const { Pool } = Postgre;

class PlaylistServices {
  constructor(collabServices) {
    this._pool = new Pool();
    this._collabService = collabServices;
  }

  async addPlaylist(name, ownerId) {
    const playlistId = `pl-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3, $4, $4) RETURNING id",
      values: [playlistId, name, ownerId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new InvariantError("Failed adding new playlist!");

    return result.rows[0].id;
  }

  async getPlaylists(ownerId) {
    const query = {
      text: "SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id JOIN users ON playlists.owner = users.id WHERE playlists.owner=$1 OR collaborations.couser_id=$1",
      values: [ownerId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylist(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id=$1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("Playlist not found!");
  }

  async addSongToPlaylist(playlistId, songId, uid) {
    const playlistSongId = `plsong-${nanoid(16)}`;
    const activityId = `act-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id",
      values: [playlistSongId, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new InvariantError("Failed adding song to Playlist!");

    const activityQuery = {
      text: "INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6, $6)",
      values: [activityId, playlistId, songId, uid, "ADD", createdAt],
    };

    await this._pool.query(activityQuery);

    return await this.getPlaylistById(playlistId);
  }

  async getPlaylistSongs(playlistId) {
    const playlistQuery = {
      text: "SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON playlists.owner = users.id WHERE playlists.id=$1",
      values: [playlistId],
    };

    const playlist = await this._pool.query(playlistQuery);

    const query = {
      text: "SELECT songs.id, songs.title, songs.performer FROM playlist_songs JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_id=$1",
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return {
      ...playlist.rows[0],
      songs: result.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId, uid) {
    const activityId = `act-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id=$1 AND song_id=$2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new InvariantError("Failed deleting song from playlist.");

    const activityQuery = {
      text: "INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6, $6)",
      values: [activityId, playlistId, songId, uid, "DELETE", createdAt],
    };

    await this._pool.query(activityQuery);

    return await this.getPlaylistById(playlistId);
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: "SELECT songs.title, users.username, playlist_activities.* FROM playlist_activities LEFT JOIN songs ON playlist_activities.song_id = songs.id LEFT JOIN users ON playlist_activities.user_id = users.id WHERE playlist_id=$1",
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("Playlist not found!");

    const mappedOutput = result.rows.map(mapActivityOutput);

    return {
      playlistId,
      activities: mappedOutput,
    };
  }

  async verifyPlaylistOwner(playlistId, ownerId) {
    const query = {
      text: "SELECT * FROM playlists WHERE id=$1",
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("Playlist doesn't exist!");

    const playlist = result.rows[0];

    if (playlist.owner !== ownerId)
      throw new AuthorizationError("Unauthorized!");
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: "SELECT playlists.id, playlists.name, playlists.owner FROM playlists WHERE id=$1",
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("Playlist doesn't exist!");

    return result.rows[0];
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;

      try {
        await this._collabService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

export default PlaylistServices;
