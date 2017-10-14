
import * as log4js from "log4js";
const log = log4js.getLogger("authbasic");

import * as basicAuth from "express-basic-auth";
import * as tdb from "../db";
import { User } from "../model/model";

export const authBasic = (req, res, next) => {
    basicAuth({
        authorizeAsync: true,
        authorizer: (username, password, cb) => {
            tdb.get().collection("users").findOne({ login: username },
                (err, user: User) => {
                    if (err) {
                        log.error(err);
                        cb(null, false);
                    } else {
                        const auth = user && user.password === password;
                        log.debug("auth: ", username, password, user);
                        req.user = user;
                        cb(null, auth);
                    }
                });
        },
        challenge: true,
        realm: "Imb4T3st4pp"
    })(req, res, next);
};
