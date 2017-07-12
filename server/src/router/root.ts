///<reference path="../../node_modules/@types/express/index.d.ts"/>

import { Router, Request, Response } from "express";
import * as bodyParser from "body-parser";
import * as tdb from "../db";

import { Product, User, Order } from "../model/model"
import { authBasic } from "../middleware/authbasic";
import { jsonmls2htmls } from "../../../client/src/main/prest/jsonml";


// parse application/json
const jsonParser = bodyParser.json();
// app.use(jsonParser);

// parse application/x-www-form-urlencoded
// const urlencodedParser = bodyParser.urlencoded({ extended: false });
// app.use(urlencodedParser);

// const textParser = bodyParser.text();
// app.use(textParser);

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
                ["title", title],
                ["link", { rel: "stylesheet", type: "text/css", href: "/node_modules/semantic-ui-css/semantic.min.css" }]
            ],
            ["body",
                ["div", { id: "app" }],
                ["script", { src: "/node_modules/semantic-ui-css/node_modules/jquery/dist/jquery.min.js", type: "text/javascript" }],
                ["script", { src: "/node_modules/semantic-ui-css/semantic.min.js", type: "text/javascript" }],
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

router.get("/products", (req: Request, res: Response, next) => {
    console.log("products get", req.params, req.query);
    tdb.get().collection("products").find()/*.sort({price: 1})*/.toArray(
        (err, products) => {
            if (err) return next(err);
            res.json({ products: products });
        });
});

router.get("/product/:code", (req: Request, res: Response, next) => {
    console.log("product get", req.params, req.query);
    tdb.get().collection("products").findOne({ code: req.params.code },
        (err, product: Product) => {
            if (err) return next(err);
            if (product) {
                res.json({ product: product });
            } else {
                res.sendStatus(404); // Not Found
            }
        });
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
                            role: user.role
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

router.get("/orders", authBasic, (req: Request, res: Response, next) => {
    console.log("orders get", req.params, req.query, req.body);
    const userOrdersCollection = "orders_" + (req as any).auth.user;
    tdb.get().collection(userOrdersCollection).find().toArray(
        (err, orders: Order[]) => {
            if (err) return next(err);
            res.json({ orders: orders });
        });
});

router.get("/orders/:login", authBasic, (req: Request, res: Response, next) => {
    console.log("orders get", req.params, req.query, req.body);
    tdb.get().collection("users").findOne({ login: (req as any).auth.user },
        (err, user) => {
            if (err) return next(err);
            if (req.params.login && user.role === "admin") {
                const userOrdersCollection = "orders_" + req.params.login;
                tdb.get().collection(userOrdersCollection).find().toArray(
                    (err, orders) => {
                        if (err) return next(err);
                        console.log(userOrdersCollection, orders);
                        const sum = orders
                            .map(o => o.price)
                            .reduce((sum, price) => sum + price, 0);
                        const count = orders
                            .map(o => o.count)
                            .reduce((sum, count) => sum + count, 0);
                        let sumar = sum.toFixed(2) + " € " + count + "\n\n";
                        sumar += orders
                            .map(o => {
                                return "\n" + o.price.toFixed(2) + " €\t" +
                                    o.count + "\t" +
                                    o.timestamp + "\n" +
                                    o.items
                                        .map(i => {
                                            return i.product.price.toFixed(2) + " €\t" +
                                                i.count + "\t" + i.product.code;
                                        })
                                        .join("\n");
                            })
                            .join("\n");
                        res.contentType("text/plain");
                        res.send(sumar);
                        // res.send(JSON.stringify({
                        //     sum: sum,
                        //     count: count,
                        //     orders: orders}, null, 4));
                    });
            } else {
                res.sendStatus(404); // Not Found
            }
        });
});

router.post("/order", authBasic, jsonParser, (req: Request, res: Response, next) => {
    console.log("order post", req.params, req.query, req.body);
    const order = req.body;
    order.timestamp = new Date().toISOString();
    const userOrdersCollection = "orders_" + (req as any).auth.user;
    const collection = tdb.get().collection(userOrdersCollection);
    collection.insert([order],
        (err, orders) => {
            if (err) return next(err);
            console.log(userOrdersCollection, orders);
            collection.find().toArray(
                (err, orders) =>{
                    if (err) {
                        console.log(err);
                        res.sendStatus(404); // Not Found
                    } else {
                        console.log(userOrdersCollection, orders);
                        res.json({ orders: orders });
                    }
                });
        });
});

router.get("/order/:id", authBasic, (req: Request, res: Response, next) => {
    console.log("order get", req.params, req.query);
    const userOrdersCollection = "orders_" + (req as any).auth.user;
    tdb.get().collection(userOrdersCollection).findOne({ _id: req.params.id },
        (err, order) => {
            if (err) return next(err);
            res.json({ order: order });
        });
});

export const rootRouter: Router = router;
