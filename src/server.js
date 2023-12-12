import Hapi from "@hapi/hapi";
import "dotenv/config";
import preResponse from "./utils/preResponse.js";
import AlbumValidator from "./validator/album/index.js";
import SongValidator from "./validator/song/index.js";
import UserValidator from "./validator/user/index.js";
import albumPlugin from "./api/album/index.js";
import songPlugin from "./api/song/index.js";
import AlbumServices from "./services/db/albumServices.js";
import SongServices from "./services/db/songServices.js";
import userPlugin from "./api/user/index.js";
import UserServices from "./services/db/userServices.js";

const init = async () => {
  const albumServices = new AlbumServices();
  const songServices = new SongServices();
  const userServices = new UserServices();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register([
    {
      plugin: albumPlugin,
      options: {
        service: albumServices,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songPlugin,
      options: {
        service: songServices,
        validator: SongValidator,
      },
    },
    {
      plugin: userPlugin,
      options: {
        service: userServices,
        validator: UserValidator,
      },
    },
  ]);

  server.ext("onPreResponse", preResponse);

  await server.start();

  console.log(`Server is running on ${server.info.uri}`);
};

init();
