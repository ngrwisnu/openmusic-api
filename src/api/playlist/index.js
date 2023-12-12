import PlaylistHandler from "./handler.js";
import routes from "./routes.js";

const playlistPlugin = {
  name: "playlist",
  version: "1.0.0",
  register: async (server, { service, songServices, validator }) => {
    const playlistHandler = new PlaylistHandler(
      service,
      songServices,
      validator
    );

    server.route(routes(playlistHandler));
  },
};

export default playlistPlugin;
