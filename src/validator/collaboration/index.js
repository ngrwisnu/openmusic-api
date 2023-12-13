import {
  AddCollaboratorPayloadSchema,
  DeleteCollaboratorPayloadSchema,
} from "./schema.js";
import InvariantError from "../../middleware/error/InvariantError.js";

const CollaborationValidator = {
  validateAddCollaboratorPayload: (payload) => {
    const result = AddCollaboratorPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
  validateDeleteCollaboratorPayload: (payload) => {
    const result = DeleteCollaboratorPayloadSchema.validate(payload);

    if (result.error) throw new InvariantError(result.error.message);
  },
};

export default CollaborationValidator;
