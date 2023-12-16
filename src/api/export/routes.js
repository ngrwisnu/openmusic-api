const routes = (handler) => [
  {
    method: "POST",
    path: "/export/playlists/{id}",
    handler: (request, h) => handler.postExportPlaylistSongsHandler(request, h),
    options: {
      auth: "openmusic_jwt",
    },
  },
];

export default routes;
