import { nanoid } from "nanoid";
import Postgre from "pg";
import bcrypt from "bcrypt";
import InvariantError from "../../middleware/error/InvariantError.js";
import AuthenticationError from "../../middleware/error/AuthenticationError.js";
import NotFoundError from "../../middleware/error/NotFoundError.js";
const { Pool } = Postgre;

class UserServices {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    const uid = `us-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    await this.verifyNewUsername(username);

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: "INSERT INTO users(id, username, password, fullname, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $5) RETURNING id",
      values: [uid, username, hashedPassword, fullname, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new InvariantError("Failed adding new user!");

    return result.rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: "SELECT username FROM users WHERE username=$1",
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0)
      throw new InvariantError("Username is already exist!");
  }

  async verifyUserCredentials(username, password) {
    const query = {
      text: "SELECT id, password FROM users WHERE username=$1",
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new AuthenticationError("Username or password is wrong!");

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      throw new AuthenticationError("Username or password is wrong!");

    return user.id;
  }

  async isUserExist(userId) {
    const query = {
      text: "SELECT * FROM users WHERE id=$1",
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) throw new NotFoundError("User doesn't exist!");
  }

  async isUserAlreadyLikedTheAlbum(userId) {
    const query = {
      text: "SELECT * FROM album_likes WHERE user_id=$1",
      values: [userId],
    };

    const result = await this._pool.query(query);

    return !!result.rowCount;
  }
}

export default UserServices;
