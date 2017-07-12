/// <reference path="../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../node_modules/@types/chai/index.d.ts" />

const expect = chai.expect;


describe("test", function () {

    it("check true", function () {
        const expected = true;
        expect(expected).to.be.equal(true);
    });

    it("check false", function () {
        const expected = false;
        expect(expected).to.be.equal(false);
    });

});
