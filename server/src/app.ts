///<reference path="../node_modules/@types/express/index.d.ts"/>

import * as path from "path";
import * as express from "express";
import * as tdb from "./db";
import { users } from "./data/users";
import { rootRouter } from "./router/root";
import { jserrRouter } from "./router/jserr";


tdb.connect(__dirname + "/../db", () => console.log("db connected"));

tdb.loadUsers(users);


const app: express.Application = express();

app.use('/', rootRouter);
app.use('/jserr', jserrRouter);

app.use(express.static(path.join(__dirname, "../public")));
app.use("/node_modules", express.static(path.join(__dirname, "../../client/node_modules")));

// console.log("NODE_ENV:", process.env.NODE_ENV || "development");
if ((process.env as any).NODE_ENV === "production") {
    console.log("env: production");
    app.use(express.static(path.join(__dirname, "../../client/dist")));
} else {
    console.log("env: development");
    app.use(express.static(path.join(__dirname, "../../client/build/main")));
    app.use("/src", express.static(path.join(__dirname, "../../client/src")));
}


let port = 3000;
let host = "localhost";
if ((process.env as any).NODE_ENV === "production") {
    port = 3000;
    host = "0.0.0.0";
}

const server = app.listen(port, host, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log("process %s listening at http://%s:%s", process.pid, host, port);
});
