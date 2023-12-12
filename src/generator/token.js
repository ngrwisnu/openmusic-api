import Jwt from "@hapi/jwt";
import InvariantError from "../middleware/error/InvariantError.js";

const tokenGenerator = {
  generateAccessToken(payload) {
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
  },
  generateRefreshToken(payload) {
    return Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY);
  },
  verifyRefreshToken(token) {
    try {
      const artifact = Jwt.token.decode(token);

      Jwt.token.verifySignature(artifact, process.env.REFRESH_TOKEN_KEY);

      return artifact.decoded.payload;
    } catch (error) {
      throw new InvariantError("Token is not valid!");
    }
  },
};

export default tokenGenerator;
