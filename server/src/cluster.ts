import * as log4js from "log4js";
const log = log4js.getLogger("cluster");

import * as cluster from "cluster";

if (cluster.isMaster) {
    log.info("master " + process.pid + " is running");

    const numCPUs = require("os").cpus().length;
    const workers = numCPUs; // * 2;

    for (let i = 0; i < workers; i++) {
        log.info("cluster fork " + i + "/" + workers);
        cluster.fork();
    }

    cluster.on("online", function(worker) {
        log.info("worker " + worker.process.pid + " is online");
    });

    cluster.on("exit", function(worker, code, signal) {
        log.info("worker " + worker.process.pid + " exit: code: " + code + ", signal: " + signal);
        log.info("starting a new worker");
        cluster.fork();
    });
} else {
    require("./server");
}
