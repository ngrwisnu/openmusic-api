import ExportHandler from "./handler.js";
import routes from "./routes.js";

const exportPlugin = {
  name: "export",
  version: "1.0.0",
  register: async (server, { service, playlistService, validator }) => {
    const exportHandler = new ExportHandler(
      service,
      playlistService,
      validator
    );

    server.route(routes(exportHandler));
  },
};

export default exportPlugin;
