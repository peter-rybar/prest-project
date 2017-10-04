
import * as log4js from "log4js";
var log = log4js.getLogger("server");

import { app } from "./app";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || ((process.env as any).NODE_ENV === "production" ? "0.0.0.0" : "localhost");

export const server = app.listen(port, host, () => {
    const host = server.address().address;
    const port = server.address().port;
    log.info("process %s listening at http://%s:%s", process.pid, host, port);
});
