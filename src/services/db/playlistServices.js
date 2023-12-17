import { nanoid } from "nanoid";
import Postgre from "pg";
import InvariantError from "../../middleware/error/InvariantError.js";
import NotFoundError from "../../middleware/error/NotFoundError.js";
import AuthorizationError from "../../middleware/error/AuthorizationError.js";
import { mapActivityOutput } from "../../utils/mapDBToModel.js";
const { Pool } = Postgre;

class PlaylistServices {
  constructor(collabServices, cacheService) {
    this._pool = new Pool();
    this._collabService = collabServices;
    this._cacheService = cacheService;
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

    await this._cacheService.delete(`playlists:${ownerId}`);

    return result.rows[0].id;
  }

  async getPlaylists(ownerId) {
    try {
      const cacheResult = await this._cacheService.get(`playlists:${ownerId}`);

      return {
        data: JSON.parse(cacheResult),
        isCache: true,
      };
    } catch (error) {
      const query = {
        text: "SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id JOIN users ON playlists.owner = users.id WHERE playlists.owner=$1 OR collaborations.couser_id=$1",
        values: [ownerId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(
        `playlists:${ownerId}`,
        JSON.stringify(result.rows)
      );

      return {
        data: result.rows,
        isCache: false,
      };
    }
  }

  async deletePlaylist(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id=$1 RETURNING id, owner",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("Playlist not found!");

    await this._cacheService.delete([
      `playlists:${result.rows[0].owner}`,
      `playlist_activities:${id}`,
    ]);
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

    await this._cacheService.delete([
      `playlist_songs:${playlistId}`,
      `playlist_activities${playlistId}`,
    ]);

    const playlistDetail = await this.getPlaylistById(playlistId);

    return playlistDetail.data;
  }

  async getPlaylistSongs(playlistId) {
    try {
      const cacheResult = await this._cacheService.get(
        `playlist_songs:${playlistId}`
      );

      return {
        data: JSON.parse(cacheResult),
        isCache: true,
      };
    } catch (error) {
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

      await this._cacheService.set(
        `playlist_songs:${playlistId}`,
        JSON.stringify({
          ...playlist.rows[0],
          songs: result.rows,
        })
      );

      return {
        data: {
          ...playlist.rows[0],
          songs: result.rows,
        },
        isCache: false,
      };
    }
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

    await this._cacheService.delete([
      `playlist_songs:${playlistId}`,
      `playlist_activities:${playlistId}`,
    ]);

    const playlistDetail = await this.getPlaylistById(playlistId);

    return playlistDetail.data;
  }

  async getPlaylistActivities(playlistId) {
    try {
      const cacheResult = await this._cacheService.get(
        `playlist_activities:${playlistId}`
      );

      return {
        data: JSON.parse(cacheResult),
        isCache: true,
      };
    } catch (error) {
      const query = {
        text: "SELECT songs.title, users.username, playlist_activities.* FROM playlist_activities LEFT JOIN songs ON playlist_activities.song_id = songs.id LEFT JOIN users ON playlist_activities.user_id = users.id WHERE playlist_id=$1",
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) throw new NotFoundError("Playlist not found!");

      const mappedOutput = result.rows.map(mapActivityOutput);

      await this._cacheService.set(
        `playlist_activities:${playlistId}`,
        JSON.stringify({
          playlistId,
          activities: mappedOutput,
        })
      );

      return {
        data: {
          playlistId,
          activities: mappedOutput,
        },
        isCache: false,
      };
    }
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
    try {
      const cacheResult = await this._cacheService.get(
        `playlist:${playlistId}`
      );

      return {
        data: JSON.parse(cacheResult),
        isCache: true,
      };
    } catch (error) {
      const query = {
        text: "SELECT playlists.id, playlists.name, playlists.owner FROM playlists WHERE id=$1",
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length)
        throw new NotFoundError("Playlist doesn't exist!");

      await this._cacheService.set(
        `playlist:${playlistId}`,
        JSON.stringify(result.rows[0])
      );

      return {
        data: result.rows[0],
        isCache: false,
      };
    }
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
