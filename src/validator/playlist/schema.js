import Joi from "joi";

export const NewPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

export const NewPlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

export const DeletePlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});
