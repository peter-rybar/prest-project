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
