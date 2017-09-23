///<reference path="../../node_modules/@types/express/index.d.ts"/>

import { Router, Request, Response } from "express";
import * as tdb from "../db";

import { User } from "../model/model"
import { authBasic } from "../middleware/authbasic";
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

router.get("/", (req: Request, res: Response) => {
    res.set('Content-Type', 'text/html');
    res.send(indexPage("Project"));
});

router.get("/user", authBasic, (req: Request, res: Response, next) => {
    console.log("user get", req.params, req.query);
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

router.get("/users", authBasic, (req: Request, res: Response, next) => {
    console.log("users get", req.params, req.query);
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
                    }
                })
            });
        });
});

export const rootRouter: Router = router;
