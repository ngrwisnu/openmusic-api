import { nanoid } from "nanoid";
import Postgre from "pg";
import bcrypt from "bcrypt";
import InvariantError from "../../middleware/error/InvariantError.js";
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
}

export default UserServices;
