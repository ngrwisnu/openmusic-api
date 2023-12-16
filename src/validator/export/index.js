import InvariantError from "../../middleware/error/InvariantError.js";
import { ExportSongsPayloadSchema } from "./schema.js";

const ExportValidator = {
  validateExportSongsPayload: (payload) => {
    const result = ExportSongsPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
};

export default ExportValidator;
