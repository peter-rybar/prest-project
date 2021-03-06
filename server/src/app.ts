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
import * as helmet from "helmet";
import * as compression from "compression";
import * as session from "express-session";
import * as tdb from "./db";
import { users } from "./data/users";
import { rootRouter } from "./router/root";
import { jserrRouter } from "./router/jserr";


tdb.connect(__dirname + "/../db", () => log.info("db connected"));

tdb.loadUsers(users);


export const app: express.Application = express();

app.use(log4js.connectLogger(log4js.getLogger("http"), { level: "auto" }));

app.use(helmet());

app.disable("x-powered-by");

app.use(compression());

app.set("trust proxy", 1); // trust first proxy
app.use(session(
    {
        secret: "se-cu-re",
        name: "sessionId",
        resave: false,
        saveUninitialized: true
    }));
// https://github.com/andybiar/express-passport-redis-template/blob/master/app.js

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
