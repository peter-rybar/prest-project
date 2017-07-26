
import { User } from "../model/model";


export const users: User[] = [
    {
        login: "rybar",
        password: "peter",
        name: "Peter Rybár",
        roles: ["admin", "user"]
    },
    {
        login: "peter",
        password: "peter",
        name: "Peter",
        roles: ["user"]
    }
];
