import InvariantError from "../../middleware/error/InvariantError.js";
import {
  NewAuthPayloadSchema,
  UpdateAuthPayloadSchema,
  DeleteAuthPayloadSchema,
} from "./schema.js";

const AuthValidator = {
  validateNewAuthPayload: (payload) => {
    const result = NewAuthPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
  validateUpdateAuthPayload: (payload) => {
    const result = UpdateAuthPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
  validateDeleteAuthPayload: (payload) => {
    const result = DeleteAuthPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
};

export default AuthValidator;
