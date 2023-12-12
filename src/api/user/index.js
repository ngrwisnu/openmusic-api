import UserHandler from "./handler.js";
import routes from "./routes.js";

const userPlugin = {
  name: "user",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const userHandler = new UserHandler(service, validator);

    server.route(routes(userHandler));
  },
};

export default userPlugin;
