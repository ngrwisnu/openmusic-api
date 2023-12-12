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
import authPlugin from "./api/auth/index.js";
import AuthServices from "./services/db/authServices.js";
import AuthValidator from "./validator/auth/index.js";
import tokenGenerator from "./generator/token.js";
import Jwt from "@hapi/jwt";
import playlistPlugin from "./api/playlist/index.js";
import PlaylistServices from "./services/db/playlistServices.js";
import PlaylistValidator from "./validator/playlist/index.js";

const init = async () => {
  const albumServices = new AlbumServices();
  const songServices = new SongServices();
  const userServices = new UserServices();
  const authServices = new AuthServices();
  const playlistServices = new PlaylistServices();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        uid: artifacts.decoded.payload.uid,
      },
    }),
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
    {
      plugin: authPlugin,
      options: {
        authService: authServices,
        userService: userServices,
        tokenGenerator,
        validator: AuthValidator,
      },
    },
    {
      plugin: playlistPlugin,
      options: {
        service: playlistServices,
        songServices,
        validator: PlaylistValidator,
      },
    },
  ]);

  server.ext("onPreResponse", preResponse);

  await server.start();

  console.log(`Server is running on ${server.info.uri}`);
};

init();
