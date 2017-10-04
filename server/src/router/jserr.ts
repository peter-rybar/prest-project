///<reference path="../../node_modules/@types/express/index.d.ts"/>

import * as log4js from "log4js";
const log = log4js.getLogger("jserr");

import { Router, Request, Response } from "express";
import * as bodyParser from "body-parser";


const jsonParser = bodyParser.json();

const router: Router = Router();

router.post("/", jsonParser, (req: Request, res: Response) => {
    log.error("jserr post", req.params, req.query);
    for (const k in req.body) {
        if (req.body.hasOwnProperty(k)) {
            log.error("\t", k, req.body[k]);
        }
    }
    res.send("");
});

export const jserrRouter: Router = router;
