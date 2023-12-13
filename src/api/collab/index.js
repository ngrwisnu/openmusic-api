import CollabHandler from "./handler.js";
import routes from "./routes.js";

const collabPlugin = {
  name: "collaborations",
  version: "1.0.0",
  register: (server, { service, playlistService, userService, validator }) => {
    const collabHandler = new CollabHandler(
      service,
      playlistService,
      userService,
      validator
    );

    server.route(routes(collabHandler));
  },
};

export default collabPlugin;
