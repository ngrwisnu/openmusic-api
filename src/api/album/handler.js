import config from "../../config/env.js";
import InvariantError from "../../middleware/error/InvariantError.js";

class AlbumHandler {
  constructor(
    service,
    storageService,
    userService,
    validator,
    uploadValidator
  ) {
    this._service = service;
    this._storageService = storageService;
    this._userService = userService;
    this._validator = validator;
    this._uploadValidator = uploadValidator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._service.addAlbum(request.payload);

    const response = h.response({
      status: "success",
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this._service.getAlbumById(id);

    const response = h.response({
      status: "success",
      data: {
        album: album.data,
      },
    });

    if (album.isCache) {
      response.header("X-Data-Source", "cache");
    }

    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    const response = h.response({
      status: "success",
      message: "Successfully updated the album.",
    });

    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    const response = h.response({
      status: "success",
      message: "Successfully deleted the album.",
    });

    response.code(200);
    return response;
  }

  async postAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    this._uploadValidator.validateImageHeaders(cover.hapi.headers);

    const fileName = await this._storageService.writeFile(
      cover,
      cover.hapi.filename
    );

    const fileLocation = `http://${config.app.host}:${config.app.port}/assets/upload/images/${fileName}`;

    await this._service.updateAlbumCover(id, fileLocation);

    const response = h.response({
      status: "success",
      message: "Success added album cover",
    });

    response.code(201);
    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { uid } = request.auth.credentials;

    const album = await this._service.getAlbumById(id);

    const isUserAlreadyLiked =
      await this._userService.isUserAlreadyLikedTheAlbum(uid);

    if (isUserAlreadyLiked)
      throw new InvariantError("You already like the album!");

    await this._service.addAlbumLike(uid, id);

    const response = h.response({
      status: "success",
      message: `You've just liked ${album.data.name}`,
    });

    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { uid } = request.auth.credentials;

    const album = await this._service.getAlbumById(id);

    const isUserAlreadyLiked =
      await this._userService.isUserAlreadyLikedTheAlbum(uid);

    if (!isUserAlreadyLiked)
      throw new InvariantError("You haven't liked the album!");

    await this._service.deleteAlbumLike(uid, id);

    const response = h.response({
      status: "success",
      message: `You've just disliked ${album.data.name}`,
    });

    response.code(200);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;

    await this._service.getAlbumById(id);

    const likes = await this._service.getAlbumLikes(id);

    const response = h.response({
      status: "success",
      data: {
        likes: likes.data,
      },
    });

    if (likes.isCache) {
      response.header("X-Data-Source", "cache");
    }

    response.code(200);
    return response;
  }
}

export default AlbumHandler;
