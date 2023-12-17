class PlaylistHandler {
  constructor(service, songService, validator) {
    this._service = service;
    this._songService = songService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validateNewPlaylistPayload(request.payload);

    const { uid } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist(
      request.payload.name,
      uid
    );

    const response = h.response({
      status: "success",
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { uid } = request.auth.credentials;

    const playlists = await this._service.getPlaylists(uid);

    const response = h.response({
      status: "success",
      data: {
        playlists: playlists.data,
      },
    });

    if (playlists.isCache) {
      response.header("X-Data-Source", "cache");
    }

    response.code(200);
    return response;
  }

  async deletePlaylistHandler(request, h) {
    const { id } = request.params;
    const { uid } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, uid);

    await this._service.deletePlaylist(id, uid);

    const response = h.response({
      status: "success",
      message: "Successfully deleting the playlist.",
    });

    response.code(200);
    return response;
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validateNewPlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { uid } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, uid);
    await this._songService.verifySongById(songId);

    const playlist = await this._service.addSongToPlaylist(id, songId, uid);

    const response = h.response({
      status: "success",
      message: `Successfully added new song to ${playlist.name}`,
    });

    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { id } = request.params;
    const { uid } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, uid);

    const playlist = await this._service.getPlaylistSongs(id);

    const response = h.response({
      status: "success",
      data: {
        playlist: playlist.data,
      },
    });

    if (playlist.isCache) {
      response.header("X-Data-Source", "cache");
    }

    response.code(200);
    return response;
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { uid } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, uid);
    await this._songService.verifySongById(songId);

    const playlist = await this._service.deleteSongFromPlaylist(
      id,
      songId,
      uid
    );

    const response = h.response({
      status: "success",
      message: `Successfully deleting song from ${playlist.name}`,
    });

    response.code(200);
    return response;
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id } = request.params;
    const { uid } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, uid);

    const result = await this._service.getPlaylistActivities(id);

    const response = h.response({
      status: "success",
      data: result.data,
    });

    if (result.isCache) {
      response.header("X-Data-Source", "cache");
    }

    response.code(200);
    return response;
  }
}

export default PlaylistHandler;
