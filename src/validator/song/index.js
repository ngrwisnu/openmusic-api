import { SongPayloadSchema } from "./schema";
import InvariantError from "../../middleware/error/InvariantError.js";

const SongValidator = {
  validateSongPayload: (payload) => {
    const result = SongPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
};

export default SongValidator;
