import AlbumHandler from "./handler.js";
import routes from "./routes.js";

const albumPlugin = {
  name: "album",
  version: "1.0.0",
  register: async (
    server,
    { service, storageService, userService, validator, uploadValidator }
  ) => {
    const albumHandler = new AlbumHandler(
      service,
      storageService,
      userService,
      validator,
      uploadValidator
    );

    server.route(routes(albumHandler));
  },
};

export default albumPlugin;
