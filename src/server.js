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
import CollaborationValidator from "./validator/collaboration/index.js";
import CollabServices from "./services/db/collabServices.js";
import collabPlugin from "./api/collab/index.js";
import UploadValidator from "./validator/uploads/index.js";
import StorageServices from "./services/storage/storageServices.js";
import path from "path";
import { __dirname } from "./config/dirname.js";
import Inert from "@hapi/inert";
import uploadPlugin from "./api/upload/index.js";
import CacheServices from "./services/redis/cacheServices.js";

const init = async () => {
  const cacheService = new CacheServices();
  const songServices = new SongServices();
  const albumServices = new AlbumServices(songServices, cacheService);
  const userServices = new UserServices();
  const authServices = new AuthServices();
  const collabServices = new CollabServices();
  const playlistServices = new PlaylistServices(collabServices);
  const storageServices = new StorageServices(
    path.resolve(__dirname, "../../assets/upload/images")
  );

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
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
        storageService: storageServices,
        userService: userServices,
        validator: AlbumValidator,
        uploadValidator: UploadValidator,
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
    {
      plugin: collabPlugin,
      options: {
        service: collabServices,
        playlistService: playlistServices,
        userService: userServices,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: uploadPlugin,
    },
  ]);

  server.ext("onPreResponse", preResponse);

  await server.start();

  console.log(`Server is running on ${server.info.uri}`);
};

init();
