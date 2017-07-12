
import * as basicAuth from "express-basic-auth";
import * as tdb from "../db";
import { User } from "../model/model";


export const authBasic = basicAuth({
    authorizeAsync: true,
    authorizer: (username, password, cb) => {
        tdb.get().collection("users").findOne({ login: username },
            (err, user: User) => {
                if (err) {
                    console.error(err);
                    cb(null, false);
                } else {
                    const auth = user && user.password === password;
                    console.log("auth: ", username, password, user);
                    cb(null, auth);
                }
            });
    },
    challenge: true,
    realm: "Imb4T3st4pp"
});
