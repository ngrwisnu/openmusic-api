class CollabHandler {
  constructor(service, playlistService, userService, validator) {
    this._service = service;
    this.playlistService = playlistService;
    this._userService = userService;
    this._validator = validator;
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateAddCollaboratorPayload(request.payload);

    const { uid } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.playlistService.verifyPlaylistOwner(playlistId, uid);

    await this._userService.isUserExist(userId);

    const collaborationId = await this._service.addCollaboration(
      playlistId,
      userId
    );

    const response = h.response({
      status: "success",
      data: {
        collaborationId,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateDeleteCollaboratorPayload(request.payload);

    const { uid } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.playlistService.verifyPlaylistOwner(playlistId, uid);

    const result = await this._service.deleteCollaboration(playlistId, userId);

    const response = h.response({
      status: "success",
      message: `Success deleting ${result.username} from ${result.name}`,
    });

    response.code(200);
    return response;
  }
}

export default CollabHandler;
