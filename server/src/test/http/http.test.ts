
import * as mocha from "mocha";
import * as chai from "chai";
import chaiHttp = require("chai-http");

import { server as app } from "../../server";
// import { app } from "../../app";

chai.use(chaiHttp);

const expect = chai.expect;
const request = (chai as any).request;

describe("baseRoute", () => {

    // let app;

    // before(() => {
    //     app = require("../../server");
    // });

    after((done) => {
        app.close(done);
    });

    // beforeEach(() => {
    //     // Clears the cache so a new server instance is used for each test.
    //     delete require.cache[require.resolve("../app")];
    //     app = require("../../app");
    // });

    // afterEach((done) => {
    //     app.close(done);
    // });

    it("should be text/html", () => {
        return request(app)
            .get("/")
            .then(res => {
                (expect(res).to.have as any).status(200);
                (expect(res).to.have as any).header("content-type", /^text/);
                expect(res.type).to.eql("text/html");
            });
    });

    it("should have a response body", () => {
        return request(app)
            .get("/user")
            .auth("rybar", "peter")
            .then(res => {
                expect(res.statusCode).to.equal(200);
                expect(res.type).to.eql("application/json");
                expect(res.body.user.name).to.eql("Peter Rybár");
            });
    });
});
