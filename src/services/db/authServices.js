import InvariantError from "../../middleware/error/InvariantError.js";
import Postgre from "pg";
const { Pool } = Postgre;

class AuthServices {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
    const query = {
      text: "INSERT INTO tokens(token) VALUES($1)",
      values: [token],
    };

    await this._pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: "SELECT token FROM tokens WHERE token=$1",
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length)
      throw new InvariantError("Refresh Token is not valid!");
  }

  async deleteRefreshToken(token) {
    const query = {
      text: "DELETE FROM tokens WHERE token=$1",
      values: [token],
    };

    await this._pool.query(query);
  }
}

export default AuthServices;
