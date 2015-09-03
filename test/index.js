describe("index", function () {
    var expect = require('expect.js');
    var Q = require('q');
    var sinon = require('sinon');
    var baucis = require('baucis');

    var sandbox = sinon.sandbox.create();

    var plugin;

    var methods = {};

    var Model = function(){

    };

    Model.find = function () {

    };

    var controller = {
        model: function(){
            return Model;
        },
        request: function (method, fn) {
            methods[method] = fn;
        }
    };


    beforeEach(function () {
        sandbox.stub(baucis.Controller, "decorators").callsArgOn(0, controller).returns();
        plugin = require('../index');
    });

    afterEach(function () {
        sandbox.restore();
        delete require.cache[require.resolve('../index')];
    });


    it("should return 200 if access is permitted", function (done) {

        var validateWasCalled = false;

        var req = {
            baucis: {
                conditions: {}
            }
        };

        var res = {};

        var docs = [{
            data: "example"
        }];

        plugin(function (instance, ctx) {
            expect(docs).to.contain(instance);
            expect(ctx.req).to.be(req);

            validateWasCalled = true;

            return Q(true);
        });

        sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, docs);
        methods['get delete'](req, res, function () {
            expect(validateWasCalled).to.be(true);
            done();
        });
    });

    it("should return 200 if access is permitted clone", function (done) {

        var validateWasCalled = false;

        var req = {
            baucis: {
                conditions: {}
            }
        };

        var res = {};

        var docs = [{
            data: "example"
        }];

        plugin(function (instance, ctx) {
            expect(docs).to.contain(instance);
            expect(ctx.req).to.be(req);

            validateWasCalled = true;

            return Q(true);
        });

        sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, docs);
        methods['get delete'](req, res, function () {
            expect(validateWasCalled).to.be(true);
            done();
        });
    });
});