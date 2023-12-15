import { ImageHeadersSchema } from "./schema.js";
import InvariantError from "../../middleware/error/InvariantError.js";

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const result = ImageHeadersSchema.validate(headers);

    if (result.error) throw new InvariantError(result.error.message);
  },
};

export default UploadsValidator;
