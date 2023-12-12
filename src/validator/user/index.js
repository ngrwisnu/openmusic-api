import { UserPayloadSchema } from "./schema.js";
import InvariantError from "../../middleware/error/InvariantError.js";

const UserValidator = {
  validateUserPayload: (payload) => {
    const result = UserPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
};

export default UserValidator;
