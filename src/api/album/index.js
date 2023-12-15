import AlbumHandler from "./handler.js";
import routes from "./routes.js";

const albumPlugin = {
  name: "album",
  version: "1.0.0",
  register: async (
    server,
    { service, storageService, validator, uploadValidator }
  ) => {
    const albumHandler = new AlbumHandler(
      service,
      storageService,
      validator,
      uploadValidator
    );

    server.route(routes(albumHandler));
  },
};

export default albumPlugin;
