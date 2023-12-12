import Joi from "joi";

export const NewAuthPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const UpdateAuthPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const DeleteAuthPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
