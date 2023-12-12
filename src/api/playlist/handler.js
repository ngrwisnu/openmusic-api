class PlaylistHandler {
  constructor(service, songServices, validator) {
    this._service = service;
    this.songServices = songServices;
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
        playlists,
      },
    });

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

    await this._service.verifyPlaylistOwner(id, uid);
    await this.songServices.verifySongById(songId);

    const playlist = await this._service.addSongToPlaylist(id, songId);

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

    await this._service.verifyPlaylistOwner(id, uid);

    const playlist = await this._service.getPlaylistSongs(id);

    const response = h.response({
      status: "success",
      data: {
        playlist,
      },
    });

    response.code(200);
    return response;
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { uid } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, uid);
    await this.songServices.verifySongById(songId);

    const playlist = await this._service.deleteSongFromPlaylist(id, songId);

    const response = h.response({
      status: "success",
      message: `Successfully deleting song from ${playlist.name}`,
    });

    response.code(200);
    return response;
  }
}

export default PlaylistHandler;
