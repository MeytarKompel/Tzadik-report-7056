import dal from "./2-utils/dal";
dal.connect();

import express from "express";
import cors from "cors";
import catchAll from "./3-middleware/catch-all";
import routeNotFound from "./3-middleware/route-not-found";
import controller from "./6-controllers/controller";
import config from "./2-utils/config";

const server = express();

server.use(cors());
server.use(express.json());
server.use("/api", controller);
server.use("*", routeNotFound);
server.use(catchAll);

server.listen(config.port, () => console.log("Listening on http://localhost:" + config.port));
