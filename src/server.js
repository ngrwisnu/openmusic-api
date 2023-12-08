import Hapi from "@hapi/hapi";
import "dotenv/config";
import preResponse from "./utils/preResponse.js";

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  server.ext("onPreResponse", preResponse);

  await server.start();

  console.log(`Server is running on ${server.info.uri}`);
};

init();
