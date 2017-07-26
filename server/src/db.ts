
// var MongoClient = require('mongodb').MongoClient

import { User } from "./model/model";


const state = {
    db: null,
};

export function connect(url, done): any {
    if (state.db) {
        return done();
    }

    const tingodb = require("tingodb")();
    const db = new tingodb.Db(url, {});
    state.db = db;
    done();

    // MongoClient.connect(url, function(err, db) {
    //     if (err) return done(err);
    //     state.db = db;
    //     done();
    // })
}

export function get(): any {
    return state.db
}

// export function close(done) {
//     if (state.db) {
//         state.db.close((err, result) => {
//             state.db = null;
//             state.mode = null;
//             done(err)
//         })
//     }
// }


export function loadUsers(users: User[]): void {
    const usersCollection = get().collection("users");
    usersCollection.remove({},
        (err, res) => {
            if (err) throw err;
            console.log("users remove", res);
        });
    usersCollection.insert(users,
        (err, res) => {
            if (err) throw err;
            console.log("users insert", res);
        });
}
