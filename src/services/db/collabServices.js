import { nanoid } from "nanoid";
import InvariantError from "../../middleware/error/InvariantError.js";
import Postgre from "pg";
const { Pool } = Postgre;

class CollabServices {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, coUserId) {
    const id = `co-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO collaborations VALUES($1, $2, $3, $4, $4) RETURNING id",
      values: [id, playlistId, coUserId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new InvariantError("Failed adding collaborator!");

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, coUserId) {
    const details = await this.getCollaborationDetail(playlistId, coUserId);

    const query = {
      text: "DELETE FROM collaborations WHERE playlist_id=$1 AND couser_id=$2 RETURNING id",
      values: [playlistId, coUserId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new InvariantError("Failed deleting collaborator!");

    return details;
  }

  async getCollaborationDetail(playlistId, collabId) {
    const query = {
      text: "SELECT playlists.name, users.username FROM collaborations LEFT JOIN playlists ON collaborations.playlist_id = playlists.id LEFT JOIN users ON collaborations.couser_id = users.id WHERE collaborations.playlist_id=$1 AND couser_id=$2",
      values: [playlistId, collabId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      return result.rows[0];
    }
  }

  async verifyCollaborator(playlistId, coUserId) {
    const query = {
      text: "SELECT * FROM collaborations WHERE playlist_id=$1 AND couser_id=$2",
      values: [playlistId, coUserId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new InvariantError("Verification failed!");
  }
}

export default CollabServices;
