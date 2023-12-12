const routes = (handler) => [
  {
    method: "POST",
    path: "/authentications",
    handler: (request, h) => handler.postAuthHandler(request, h),
  },
  {
    method: "PUT",
    path: "/authentications",
    handler: (request, h) => handler.putAuthHandler(request, h),
  },
  {
    method: "DELETE",
    path: "/authentications",
    handler: (request, h) => handler.deleteAuthHandler(request, h),
  },
];

export default routes;
