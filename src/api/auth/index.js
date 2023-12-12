import AuthHandler from "./handler.js";
import routes from "./routes.js";

const authPlugin = {
  name: "authentications",
  version: "1.0.0",
  register: async (
    server,
    { authService, userService, tokenGenerator, validator }
  ) => {
    const authHandler = new AuthHandler(
      authService,
      userService,
      tokenGenerator,
      validator
    );

    server.route(routes(authHandler));
  },
};

export default authPlugin;
