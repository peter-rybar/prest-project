
import * as log4js from "log4js";
const log = log4js.getLogger("rbac");

import { User } from "../model/model";

const middlewares = {};

export interface RbacOpt {
    loginUrl?: string;
    noRoleUrl?: string;
}

export const rbac = (roles: string[], opts?: RbacOpt) => {
    return middlewares[roles.toString()] || (middlewares[roles.toString()] = (req, res, next) => {
        if (!req.user) {
            if (opts && opts.loginUrl) {
                res.redirect(opts.loginUrl);
            } else {
                log.debug(`user not logged in: req.user ${JSON.stringify(req.user)}`);
                res.status(401).send(`user not logged in`);
            }
            return;
        }
        if (!("roles" in req.user)) {
            log.debug(`user has no 'roles' attribute`);
            res.status(401).send(`user has no 'roles' attribute`);
            return;
        }
        const user = req.user as User;
        let hasRole = false;
        if (user.roles.length) {
            hasRole = roles
                .map(role => user.roles.filter(userRole => userRole === role))
                .reduce((prev, curr) => prev || !!curr.length, false);
        }
        if (hasRole) {
            next();
        } else {
            log.debug(`user missing role: ${JSON.stringify(roles)} user roles ${JSON.stringify(req.user.roles)}`);
            if (opts && opts.noRoleUrl) {
                res.redirect(opts.noRoleUrl);
            } else {
                res.status(401).send(`user missing role`);
            }
        }
    });
};
