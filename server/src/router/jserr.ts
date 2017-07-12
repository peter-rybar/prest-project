///<reference path="../../node_modules/@types/express/index.d.ts"/>

import { Router, Request, Response } from "express";
import * as bodyParser from "body-parser";


const jsonParser = bodyParser.json();

const router: Router = Router();

router.post("/", jsonParser, (req: Request, res: Response) => {
    console.log("jserr post", req.params, req.query);
    for (const k in req.body) {
        if (req.body.hasOwnProperty(k)) {
            console.log("\t", k, req.body[k]);
        }
    }
    res.send("");
});

export const jserrRouter: Router = router;
