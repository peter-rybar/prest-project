///<reference path="../../node_modules/@types/express/index.d.ts"/>
///<reference path="../../node_modules/@types/express-session/index.d.ts"/>

import * as log4js from "log4js";
const log = log4js.getLogger("root");

import { Router, Request, Response } from "express";
import * as tdb from "../db";

import { User } from "../model/model";
import { authBasic } from "../middleware/authbasic";
import { rbac } from "../middleware/rbac";
import { jsonmls2htmls } from "../prest/jsonml";


// import * as bodyParser from "body-parser";

// parse application/json
// const jsonParser = bodyParser.json();
// app.use(jsonParser);

// parse application/x-www-form-urlencoded
// const urlencodedParser = bodyParser.urlencoded({ extended: false });
// app.use(urlencodedParser);

// const textParser = bodyParser.text();
// app.use(textParser);

// import * as cookieParser from "cookie-parser";
// app.use(cookieParser());

// app.use(authBasic);


function indexPage(title: string): string {
    return jsonmls2htmls([
        "<!DOCTYPE html>",
        ["html", { lang: "en" },
            ["head",
                ["meta", { charset: "utf-8" }],
                ["meta", { "http-equiv": "X-UA-Compatible", content: "IE=edge,chrome=1" }],
                ["meta", { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0" }],
                ["meta", { name: "author", content: "Peter Rybar, pr.rybar@gmail.com" }],
                ["title", title]
            ],
            ["body",
                ["p", "Protected data (user: rybar, password: peter): ",
                    ["a", { href: "user" }, "user"],
                    ", ",
                    ["a", { href: "users" }, "users"],
                ],
                ["div", { id: "app" }],
                ["script", { src: "/node_modules/incremental-dom/dist/incremental-dom-min.js", type: "text/javascript" }],
                ["script", { src: "/node_modules/requirejs/require.js", "data-main": "index.js", type: "text/javascript" }]
            ]
        ]
    ]).join("");
}


const router: Router = Router();

router.get("/",
    (req: Request, res: Response) => {
        res.set("Content-Type", "text/html");
        res.send(indexPage("Project"));
    });

router.get("/session",
    (req: Request, res: Response) => {
        if (!req.session.count) {
            req.session.count = 1;
        } else {
            req.session.count++;
        }
        log.info(req.session.id, req.session.count);

        res.set("Content-Type", "text/plain");
        res.send(`${req.session.id}: ${req.session.count}`);
    });

router.get("/rbac",
    rbac(["admin"], {loginUrl: "/login"}),
    (req: Request, res: Response, next) => {
        log.debug("rbac", (req as any).user, (req as any).auth);
        res.send(`user ${JSON.stringify((req as any).user)} auth ${JSON.stringify((req as any).auth)}`);
    });

router.get("/rbac-authbasic",
    authBasic,
    rbac(["admin", "user"]),
    (req: Request, res: Response, next) => {
        log.debug("rbac-authbasic", (req as any).user, (req as any).auth);
        res.send(`user ${JSON.stringify((req as any).user)} auth ${JSON.stringify((req as any).auth)}`);
    });

router.get("/user",
    authBasic,
    (req: Request, res: Response, next) => {
        log.debug("user get", req.params, req.query);
        if ((req as any).auth) {
            tdb.get().collection("users").findOne({ login: (req as any).auth.user },
                (err, user: User) => {
                    if (err) return next(err);
                    if (user) {
                        res.json({
                            user: {
                                login: user.login,
                                name: user.name,
                                roles: user.roles
                            }
                        });
                    } else {
                        res.sendStatus(404); // Not Found
                    }
                });
        } else {
            res.sendStatus(404); // Not Found
        }
    });

router.get("/users",
    authBasic,
    (req: Request, res: Response, next) => {
        log.debug("users get", req.params, req.query);
        tdb.get().collection("users").find().sort({ login: 1 }).toArray(
            (err, users) => {
                if (err) return next(err);
                res.json({
                    users: users.map(u => {
                        return {
                            login: u.login,
                            name: u.name,
                            password: u.password,
                            roles: u.roles
                        };
                    })
                });
            });
    });

export const rootRouter: Router = router;
