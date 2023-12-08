class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const songId = this._service.addSong(request.payload);

    const response = h.response({
      status: "success",
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }

  getSongsHandler(request, h) {
    const songs = this._service.getSongs();

    const response = h.response({
      status: "success",
      data: {
        songs,
      },
    });

    response.code(200);
    return response;
  }

  getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = this._service.getSongById(id);

    const response = h.response({
      status: "success",
      data: {
        song,
      },
    });

    response.code(200);
    return response;
  }

  putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    this._service.editSongById(id, request.payload);

    const response = h.response({
      status: "success",
      message: "Successfully updated the song.",
    });

    response.code(200);
    return response;
  }

  deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    this._service.deleteSongById(id);

    const response = h.response({
      status: "success",
      message: "Successfully deleted the song.",
    });

    response.code(200);
    return response;
  }
}

export default SongHandler;
