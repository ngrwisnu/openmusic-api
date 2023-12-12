import InvariantError from "../../middleware/error/InvariantError.js";
import {
  DeletePlaylistSongPayloadSchema,
  NewPlaylistPayloadSchema,
  NewPlaylistSongPayloadSchema,
} from "./schema.js";

const PlaylistValidator = {
  validateNewPlaylistPayload: (payload) => {
    const result = NewPlaylistPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
  validateNewPlaylistSongPayload: (payload) => {
    const result = NewPlaylistSongPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
  validateDeletePlaylistSongPayload: (payload) => {
    const result = DeletePlaylistSongPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
};

export default PlaylistValidator;
