const routes = (handler) => [
  {
    method: "POST",
    path: "/songs",
    handler: (request, h) => handler.postSongHandler(request, h),
  },
  {
    method: "GET",
    path: "/songs",
    handler: () => handler.getSongsHandler(),
  },
  {
    method: "GET",
    path: "/songs/{id}",
    handler: (request, h) => handler.getSongsHandler(request, h),
  },
  {
    method: "PUT",
    path: "/songs/{id}",
    handler: (request, h) => handler.putSongHandler(request, h),
  },
  {
    method: "DELETE",
    path: "/songs/{id}",
    handler: (request, h) => handler.deleteSongHandler(request, h),
  },
];

export default routes;
