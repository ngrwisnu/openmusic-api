import path from "path";
import { __dirname } from "../../config/dirname.js";

const routes = () => [
  {
    method: "GET",
    path: "/assets/upload/images/{params*}",
    handler: {
      directory: {
        path: path.resolve(__dirname, "../../assets/upload/images"),
      },
    },
  },
];

export default routes;
