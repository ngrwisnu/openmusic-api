class ExportHandler {
  constructor(service, playlistService, validator) {
    this._service = service;
    this._playlistService = playlistService;
    this._validator = validator;
  }

  async postExportPlaylistSongsHandler(request, h) {
    this._validator.validateExportSongsPayload(request.payload);

    const { id } = request.params;
    const { uid } = request.auth.credentials;

    await this._playlistService.getPlaylistById(id);
    await this._playlistService.verifyPlaylistOwner(id, uid);

    const message = {
      userId: uid,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage(
      `export:${request.params.id}`,
      JSON.stringify(message)
    );

    const response = h.response({
      status: "success",
      message: "Your request is in process",
    });

    response.code(201);
    return response;
  }
}

export default ExportHandler;
