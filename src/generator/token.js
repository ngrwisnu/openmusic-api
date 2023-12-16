import Jwt from "@hapi/jwt";
import InvariantError from "../middleware/error/InvariantError.js";
import config from "../config/env.js";

const tokenGenerator = {
  generateAccessToken(payload) {
    return Jwt.token.generate(payload, config.tk.accessTokenKey);
  },
  generateRefreshToken(payload) {
    return Jwt.token.generate(payload, config.tk.refreshTokenKey);
  },
  verifyRefreshToken(token) {
    try {
      const artifact = Jwt.token.decode(token);

      Jwt.token.verifySignature(artifact, config.tk.refreshTokenKey);

      return artifact.decoded.payload;
    } catch (error) {
      throw new InvariantError("Token is not valid!");
    }
  },
};

export default tokenGenerator;
