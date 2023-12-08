class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = this._service.addAlbum({ name, year });

    const response = h.response({
      status: "success",
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = this._service.getAlbumById(id);

    const response = h.response({
      status: "success",
      data: {
        album: {
          id: album.id,
          name: album.name,
          year: album.year,
        },
      },
    });

    response.code(200);
    return response;
  }

  putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    this._service.editAlbumById(id, request.payload);

    const response = h.response({
      status: "success",
      message: "Successfully updated the album.",
    });

    response.code(200);
    return response;
  }

  deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    this._service.deleteAlbumById(id);

    const response = h.response({
      status: "success",
      message: "Successfully deleted the album.",
    });

    response.code(200);
    return response;
  }
}

export default AlbumHandler;
