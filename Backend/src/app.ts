import dal from "./2-utils/dal";
dal.connect();

import express from "express";
import cors from "cors";
import catchAll from "./3-middleware/catch-all";
import routeNotFound from "./3-middleware/route-not-found";
import deviceController from "./6-controllers/device-controller";
import config from "./2-utils/config";
import userController from "./6-controllers/user-controller";
import reportController from "./6-controllers/report-controller";
import inventoryItemController from "./6-controllers/inventory-item-controller";

const server = express();

server.use(cors());
server.use(express.json());
server.use("/api", deviceController);
server.use("/api", userController);
server.use("/api", reportController);
server.use("/api", inventoryItemController);
server.use("*", routeNotFound);
server.use(catchAll);

server.listen(config.port, () => console.log("Listening on http://localhost:" + config.port));
