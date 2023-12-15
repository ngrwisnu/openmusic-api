import routes from "./routes.js";

const uploadPlugin = {
  name: "upload",
  version: "1.0.0",
  register: (server) => {
    server.route(routes());
  },
};

export default uploadPlugin;
