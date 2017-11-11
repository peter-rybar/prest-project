///<reference path="../../node_modules/@types/express/index.d.ts"/>
///<reference path="../../node_modules/@types/express-session/index.d.ts"/>

import * as log4js from "log4js";
const log = log4js.getLogger("root");

import { Router, Request, Response } from "express";
import * as tdb from "../db";

import { User } from "../model/model";
import { authBasic } from "../middleware/authbasic";
import { rbac } from "../middleware/rbac";
import { jsonmls2htmls } from "../prest/jsonml/jsonml-html";


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


// ----------------------------------------------------------------------------
// SSR - server side rendering

// import { JsonMLs } from "../prest/jsonml/jsonml";
// import { Widget } from "../prest/jsonml/jsonml-widget-node";
// // import { Signal } from "../prest/signal";

// class HelloWidget extends Widget {

//     private _name: string;

//     constructor(name: string) {
//         super("HelloWidget");
//         this._name = name;
//     }

//     setName(name: string): this {
//         this._name = name;
//         this.update();
//         return this;
//     }

//     onMount() {
//         console.log("onMount", this.type, this.id);
//     }

//     onUmount() {
//         console.log("onUmount", this.type, this.id);
//     }

//     render(): JsonMLs {
//         return [
//             ["input~i", { type: "text", value: this._name, input: this._onTextInput }],
//             ["p", "Hello ", ["strong", this._name], " !"]
//         ];
//     }

//     private _onTextInput = (e: Event) => {
//         const i = e.target as HTMLInputElement;
//         // const i = this.refs["i"] as HTMLInputElement;
//         this._name = i.value;
//         this.update();
//     }

// }

// class TimerWidget extends Widget {

//     private _interval: any;

//     constructor() {
//         super("TimerWidget");
//     }

//     toggle(on?: boolean): void {
//         switch (on) {
//             case true:
//                 if (!this._interval) {
//                     this._interval = setInterval(() => this.update(), 1000);
//                 }
//                 break;
//             case false:
//                 if (this._interval) {
//                     clearInterval(this._interval);
//                     this._interval = undefined;
//                 }
//                 break;
//             default:
//                 this.toggle(!this._interval);
//         }
//         this.update();
//     }

//     onMount() {
//         console.log("onMount", this.type, this.id);
//         this.toggle(true);
//     }

//     onUmount() {
//         console.log("onUmount", this.type, this.id);
//         this.toggle(false);
//     }

//     render(): JsonMLs {
//         return [
//             ["p", { style: this._interval ? "" : "color: lightgray;" },
//                 "Time: ", new Date().toLocaleTimeString(), " ",
//                 ["button", { click: (e: Event) => this.toggle() },
//                     this._interval ? "Stop" : "Start"
//                 ]
//             ]
//         ];
//     }

// }


// interface FormData {
//     name: string;
//     age: number;
// }

// interface FormErrors {
//     name: string;
//     age: string;
// }

// class FormWidget extends Widget {

//     private _title: string = "Form";
//     private _data: FormData = { name: undefined, age: undefined };
//     private _errors: FormErrors = { name: "", age: "" };

//     // readonly sigData = new Signal<FormData>();
//     private _onData: (data: FormData) => void;

//     constructor() {
//         super("FormWidget");
//     }

//     getTitle(): string {
//         return this._title;
//     }

//     setTitle(title: string): this {
//         this._title = title;
//         this.update();
//         return this;
//     }

//     getData(): FormData {
//         return this._data;
//     }

//     setData(data: FormData): this {
//         this._data = data;
//         this.update();
//         return this;
//     }

//     onData(callback: (data: FormData) => void): this {
//         this._onData = callback;
//         return this;
//     }

//     onMount() {
//         console.log("onMount", this.type, this.id);
//     }

//     onUmount() {
//         console.log("onUmount", this.type, this.id);
//     }

//     render(): JsonMLs {
//         return [
//             ["h2", this._title],
//             ["form", { submit: this._onFormSubmit },
//                 ["p",
//                     ["label", "Name ",
//                         ["input~name",
//                             {
//                                 type: "text", size: 10, maxlength: 10,
//                                 input: this._onNameInput
//                             }
//                         ]
//                     ], " ",
//                     ["em.error", this._errors.name]
//                 ],
//                 ["p",
//                     ["label", "Age ",
//                         ["input~age",
//                             {
//                                 type: "number", min: "1", max: "120",
//                                 input: this._onAgeInput
//                             }
//                         ]
//                     ], " ",
//                     ["em.error", this._errors.age]
//                 ],
//                 ["p",
//                     ["input~submit", { type: "submit", value: "Submit" }]
//                 ]
//             ],
//             ["pre~data"]
//         ];
//     }

//     private _onFormSubmit = (e: Event) => {
//         e.preventDefault();
//         console.log("submit", this._data);
//         this._validateName((this.refs["name"] as HTMLInputElement).value);
//         this._validateAge((this.refs["age"] as HTMLInputElement).value);
//         if (this._errors.name || this._errors.age) {
//             this.update();
//         } else {
//             this._onData && this._onData(this._data);
//             this.refs["data"].innerText = JSON.stringify(this._data, null, 4);
//         }
//     }

//     private _onNameInput = (e: Event) => {
//         const i = e.target as HTMLInputElement;
//         // const i = this.refs["name"] as  HTMLInputElement;
//         console.log("name", i.value);
//         this._validateName(i.value);
//         this.update();
//     }

//     private _onAgeInput = (e: Event) => {
//         const i = e.target as HTMLInputElement;
//         // const i = this.refs["age"] as  HTMLInputElement;
//         console.log("age", i.value);
//         this._validateAge(i.value);
//         this.update();
//     }

//     private _validateName(name: string) {
//         if (name) {
//             this._data.name = name;
//             this._errors.name = "";
//         } else {
//             this._data.name = undefined;
//             this._errors.name = "Name required";
//         }
//     }

//     private _validateAge(age: string) {
//         if (age) {
//             if (isNaN(+age)) {
//                 this._data.age = undefined;
//                 this._errors.age = "Invalid age number";
//             } else {
//                 this._data.age = +age;
//                 this._errors.age = "";
//             }
//         } else {
//             this._data.age = undefined;
//             this._errors.age = "Age required";
//         }
//     }

// }

// class AppWidget extends Widget {

//     private _title: string = "App";

//     readonly helloWidget: HelloWidget;
//     readonly timerWidget: TimerWidget;
//     readonly formWidget: FormWidget;

//     constructor() {
//         super("AppWidget");
//         this.helloWidget = new HelloWidget("peter");
//         this.timerWidget = new TimerWidget();
//         this.formWidget = new FormWidget();
//         this.formWidget.onData(data => console.log("sig data", data));
//     }

//     setTitle(title: string): this {
//         this._title = title;
//         this.update();
//         return this;
//     }

//     onMount() {
//         console.log("onMount", this.type, this.id);
//     }

//     onUmount() {
//         console.log("onUmount", this.type, this.id);
//     }

//     render(): JsonMLs {
//         return [
//             ["h1", this._title],
//             this.helloWidget,
//             ["hr"],
//             this.timerWidget,
//             ["hr"],
//             this.formWidget
//         ];
//     }

// }

// const app = new AppWidget();
// app.setTitle("App");
// app.helloWidget.setName("Petko");
// app.formWidget.setTitle("Form");

// ----------------------------------------------------------------------------


function indexPage(title: string, lang = "en"): string {
    return jsonmls2htmls([
        "<!DOCTYPE html>",
        ["html", { lang: lang },
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
                // app, // SSR - server side rendering
                ["div", { id: "app" }],
                ["script", { src: "/node_modules/incremental-dom/dist/incremental-dom-min.js", type: "text/javascript" }],
                (process.env as any).NODE_ENV === "production" ?
                    ["script", { src: "/index.js", type: "text/javascript" }]
                    :
                    ["script", { src: "/node_modules/requirejs/require.js", "data-main": "index.js", type: "text/javascript" }]
            ]
        ]
    ], true).join("");
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
