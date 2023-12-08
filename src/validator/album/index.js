import { AlbumPayloadSchema } from "./schema";
import InvariantError from "../../middleware/error/InvariantError.js";

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const result = AlbumPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
};

export default AlbumValidator;
