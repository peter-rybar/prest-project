///<reference path="../node_modules/@types/express/index.d.ts"/>

import * as cluster from "cluster";

if (cluster.isMaster) {
    console.log("master " + process.pid + " is running");

    const numCPUs = require("os").cpus().length;
    const workers = numCPUs; // * 2;

    for (let i = 0; i < workers; i++) {
        console.log("cluster fork " + i + "/" + workers);
        cluster.fork();
    }

    cluster.on("online", function(worker) {
        console.log("worker " + worker.process.pid + " is online");
    });

    cluster.on("exit", function(worker, code, signal) {
        console.log("worker " + worker.process.pid + " exit: code: " + code + ", signal: " + signal);
        console.log("starting a new worker");
        cluster.fork();
    });
} else {
    require("./app");
}
