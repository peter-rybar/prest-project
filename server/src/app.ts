///<reference path="../node_modules/@types/express/index.d.ts"/>

import * as log4js from "log4js";
if ((process.env as any).NODE_ENV === "production") {
    log4js.configure({
        appenders: { out: { type: "stdout", layout: { type: "basic" } } },
        categories: { default: { appenders: ["out"], level: "warn" } }
    });
} else {
    log4js.configure({
        appenders: { out: { type: "stdout", layout: { type: "basic" } } },
        categories: { default: { appenders: ["out"], level: "trace" } }
    });
}
const log = log4js.getLogger("app");

log.info("NODE_ENV:", process.env.NODE_ENV || "development");

import * as path from "path";
import * as express from "express";
import * as tdb from "./db";
import { users } from "./data/users";
import { rootRouter } from "./router/root";
import { jserrRouter } from "./router/jserr";


tdb.connect(__dirname + "/../db", () => log.info("db connected"));

tdb.loadUsers(users);


const app: express.Application = express();

app.use(log4js.connectLogger(log4js.getLogger("http"), { level: "auto" }));

app.use("/", rootRouter);
app.use("/jserr", jserrRouter);

app.use(express.static(path.join(__dirname, "../public")));
app.use("/node_modules", express.static(path.join(__dirname, "../../client/node_modules")));

if ((process.env as any).NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../client/dist")));
} else {
    app.use(express.static(path.join(__dirname, "../../client/build/main")));
    app.use("/src", express.static(path.join(__dirname, "../../client/src")));
}


const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || ((process.env as any).NODE_ENV === "production" ? "0.0.0.0" : "localhost");

const server = app.listen(port, host, () => {
    const host = server.address().address;
    const port = server.address().port;
    log.info("process %s listening at http://%s:%s", process.pid, host, port);
});
