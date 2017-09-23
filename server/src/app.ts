///<reference path="../node_modules/@types/express/index.d.ts"/>

import * as path from "path";
import * as express from "express";
import * as morgan from "morgan";
import * as tdb from "./db";
import { users } from "./data/users";
import { rootRouter } from "./router/root";
import { jserrRouter } from "./router/jserr";

console.log("NODE_ENV:", process.env.NODE_ENV || "development");

tdb.connect(__dirname + "/../db", () => console.log("db connected"));

tdb.loadUsers(users);


const app: express.Application = express();

if ((process.env as any).NODE_ENV === "production") {
    app.use(morgan("tiny"));
    // app.use(morgan("combined"));
} else {
    app.use(morgan("dev"));
}

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
    console.log("process %s listening at http://%s:%s", process.pid, host, port);
});
