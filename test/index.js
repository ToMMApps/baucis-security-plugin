describe("index", function () {
    var expect = require('expect.js');
    var Q = require('q');
    var sinon = require('sinon');
    var baucis = require('baucis');

    var sandbox = sinon.sandbox.create();

    var plugin;

    var methods = {};

    var Model = function(body){
        this.body = body;
    };

    Model.find = function () {

    };

    Model.prototype.validate = function () {
    }

    Model.prototype.save = function () {

    }

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

    it("should throw an error if validate is not a function", function () {
        expect(function () {
            plugin(null);
        }).to.throwException();
    });

    describe("get delete", function(){
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

        it("should return 401 if access to one element of an array is forbidden", function (done) {

            var validateWasCalled = [false, false, false];

            var req = {
                baucis: {
                    conditions: {}
                }
            };

            var res = {
                status: function (statusCode) {
                    expect(statusCode).to.be(403);
                    return {
                        end: function(){
                            expect(validateWasCalled).to.eql([true, true, true]);

                            done();
                        }
                    }
                }
            };

            var docs = [{
                data: 0
            }, {
                data: 1
            }, {
                data: 2
            }];

            plugin(function (instance, ctx) {
                expect(docs).to.contain(instance);
                expect(ctx.req).to.be(req);

                validateWasCalled[instance.data] = true;

                if(instance.data === 1){
                    return Q(false);
                } else {
                    return Q(true);
                }
            });

            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, docs);
            methods['get delete'](req, res);
        });

        it("should return 403 if access is forbidden", function (done) {

            var req = {
                baucis: {
                    conditions: {}
                }
            };

            var res = {
                status: function (statusCode) {
                    expect(statusCode).to.be(403);
                    return {
                        end: function () {
                            done();
                        }
                    }
                }
            };

            var docs = [{
                data: "example"
            }];

            plugin(function (instance, ctx) {
                expect(docs).to.contain(instance);
                expect(ctx.req).to.be(req);

                return Q(false);
            });

            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, docs);
            methods['get delete'](req, res);
        });

        it("should return 500 if find returns an error", function (done) {

            var req = {
                baucis: {
                    conditions: {}
                }
            };

            var res = {
                status: function (statusCode) {
                    expect(statusCode).to.be(500);
                    return {
                        end: function () {
                            done();
                        }
                    }
                }
            };

            var docs = [{
                data: "example"
            }];

            plugin(function (instance, ctx) {
                expect(docs).to.contain(instance);
                expect(ctx.req).to.be(req);

                return Q(true);
            });

            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, new Error(""), docs);
            methods['get delete'](req, res);
        });

        it("should return 404 if docs is null and err is null", function (done) {

            var req = {
                baucis: {
                    conditions: {}
                }
            };

            var res = {
                status: function (statusCode) {
                    expect(statusCode).to.be(404);
                    return {
                        end: function () {
                            done();
                        }
                    }
                }
            };

            plugin(function () {
                throw Error("should not be called");
            });

            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, null);
            methods['get delete'](req, res);
        });

        it("should return 500 if validate rejects", function (done) {

            var req = {
                baucis: {
                    conditions: {}
                }
            };

            var docs = [
                {
                    data: 0
                }
            ];

            var res = {
                status: function (statusCode) {
                    expect(statusCode).to.be(500);
                    return {
                        end: function () {
                            done();
                        }
                    }
                }
            };

            plugin(function (instance, ctx) {
                expect(docs).to.contain(instance);
                expect(ctx.req).to.be(req);

                return Q.reject(new Error(""));
            });

            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, docs);
            methods['get delete'](req, res);
        });
    });

    describe("put", function () {
        it("should call callback with correct params if access is granted", function (done) {

            var req = {
                baucis: {
                    incoming: function () {

                    }
                }
            };

            var _ctx = {
                doc: {

                }
            };

            sandbox.stub(req.baucis, "incoming").callsArgWith(0, _ctx, function(err, ctx){
                expect(err).to.be(null);
                expect(ctx).to.be(_ctx);
                done();
            });

            plugin(function (instance, ctx) {
                expect(instance).to.eql(_ctx.doc);
                expect(ctx.req).to.be(req);

                return Q(true);
            });

            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, function () {

            });
            methods['put'](req, null, function () {

            });
        });

        it("should return 403 if access is forbidden", function (done) {

            var req = {
                baucis: {
                    incoming: function () {

                    }
                }
            };

            var res = {
                status: function(statusCode){
                    expect(statusCode).to.be(403);
                    return {
                        end: function () {
                            done();
                        }
                    }
                }
            };

            var _ctx = {
                doc: {

                }
            };

            sandbox.stub(req.baucis, "incoming").callsArgWith(0, _ctx, null);

            plugin(function (instance, ctx) {
                expect(instance).to.eql(_ctx.doc);
                expect(ctx.req).to.be(req);

                return Q(false);
            });

            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, function () {

            });
            methods['put'](req, res, function () {

            });
        });

        it("should return 500 if validate rejects", function (done) {

            var req = {
                baucis: {
                    incoming: function () {

                    }
                }
            };

            var res = {
                status: function(statusCode){
                    expect(statusCode).to.be(500);
                    return {
                        end: function () {
                            done();
                        }
                    }
                }
            };

            var _ctx = {
                doc: {

                }
            };

            sandbox.stub(req.baucis, "incoming").callsArgWith(0, _ctx, null);

            plugin(function (instance, ctx) {
                expect(instance).to.eql(_ctx.doc);
                expect(ctx.req).to.be(req);

                return Q.reject(new Error(""));
            });

            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, function () {

            });
            methods['put'](req, res, function () {

            });
        });
    });

    describe("post", function () {
        it("should return 200 when posting a valid element", function (done) {
            var validateWasCalled = false;

            var req = {
                baucis: {
                    conditions: {}
                },
                body: {
                    data: "example"
                }
            };

            var res = {
                status: function (statusCode) {
                    expect(statusCode).to.be(200);
                    return {
                        json: function () {
                            expect(validateWasCalled).to.be(true);
                            done();
                        }
                    }
                }
            };

            var docs = [{
                data: "example"
            }];

            var entry = {

            };

            sandbox.stub(Model.prototype, "validate").callsArgWith(0, null);
            sandbox.stub(Model.prototype, "save").callsArgWith(0, null, entry);

            plugin(function (instance, ctx) {
                expect(instance.body).to.be(req.body);
                expect(ctx.req).to.be(req);

                validateWasCalled = true;

                return Q(true);
            });



            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, docs);
            methods['post'](req, res, function () {
                expect(validateWasCalled).to.be(true);
                done();
            });
        });

        it("should return 400 if instance.validate fails", function (done) {
            var validateWasCalled = false;

            var req = {
                baucis: {
                    conditions: {}
                },
                body: {
                    data: "example"
                }
            };

            var res = {
                status: function (statusCode) {
                    expect(statusCode).to.be(400);
                    return {
                        end: function () {
                            sinon.assert.callCount(Model.prototype.save, 0);
                            sinon.assert.calledOnce(Model.prototype.validate);
                            expect(validateWasCalled).to.be(false);

                            done();
                        }
                    }
                }
            };

            var docs = [{
                data: "example"
            }];

            var entry = {

            };

            sandbox.stub(Model.prototype, "validate").callsArgWith(0, new Error());
            sandbox.stub(Model.prototype, "save");

            plugin(function (instance, ctx) {
                validateWasCalled = true;
            });



            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, docs);
            methods['post'](req, res, function () {
                expect(validateWasCalled).to.be(true);
                done();
            });
        });

        it("should return 403 if validate fails", function (done) {
            var validateWasCalled = false;

            var req = {
                baucis: {
                    conditions: {}
                },
                body: {
                    data: "example"
                }
            };

            var res = {
                status: function (statusCode) {
                    expect(statusCode).to.be(403);
                    return {
                        end: function () {
                            sinon.assert.callCount(Model.prototype.save, 0);
                            sinon.assert.calledOnce(Model.prototype.validate);
                            expect(validateWasCalled).to.be(true);
                            done();
                        }
                    }
                }
            };

            var docs = [{
                data: "example"
            }];

            var entry = {

            };

            sandbox.stub(Model.prototype, "validate").callsArgWith(0, null);
            sandbox.stub(Model.prototype, "save");

            plugin(function (instance, ctx) {
                expect(instance.body).to.be(req.body);
                expect(ctx.req).to.be(req);

                validateWasCalled = true;

                return Q(false);
            });



            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, docs);
            methods['post'](req, res, function () {
                expect(validateWasCalled).to.be(true);
                done();
            });
        });

        it("should return 500 if save fails", function (done) {
            var validateWasCalled = false;

            var req = {
                baucis: {
                    conditions: {}
                },
                body: {
                    data: "example"
                }
            };

            var res = {
                status: function (statusCode) {
                    expect(statusCode).to.be(500);
                    return {
                        end: function () {
                            sinon.assert.calledOnce(Model.prototype.save);
                            sinon.assert.calledOnce(Model.prototype.validate);
                            expect(validateWasCalled).to.be(true);
                            done();
                        }
                    }
                }
            };

            var docs = [{
                data: "example"
            }];

            var entry = {

            };

            sandbox.stub(Model.prototype, "validate").callsArgWith(0, null);
            sandbox.stub(Model.prototype, "save").callsArgWith(0, new Error());

            plugin(function (instance, ctx) {
                expect(instance.body).to.be(req.body);
                expect(ctx.req).to.be(req);

                validateWasCalled = true;

                return Q(true);
            });



            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, docs);
            methods['post'](req, res, function () {
                expect(validateWasCalled).to.be(true);
                done();
            });
        });

        it("should return 500 if validate rejects", function (done) {
            var validateWasCalled = false;

            var req = {
                baucis: {
                    conditions: {}
                },
                body: {
                    data: "example"
                }
            };

            var res = {
                status: function (statusCode) {
                    expect(statusCode).to.be(500);
                    return {
                        end: function () {
                            sinon.assert.callCount(Model.prototype.save, 0);
                            sinon.assert.calledOnce(Model.prototype.validate);
                            expect(validateWasCalled).to.be(true);
                            done();
                        }
                    }
                }
            };

            var docs = [{
                data: "example"
            }];

            sandbox.stub(Model.prototype, "validate").callsArgWith(0, null);
            sandbox.stub(Model.prototype, "save");

            plugin(function (instance, ctx) {
                expect(instance.body).to.be(req.body);
                expect(ctx.req).to.be(req);

                validateWasCalled = true;

                return Q.reject(new Error(""));
            });



            sandbox.stub(Model, "find").withArgs(req.baucis.conditions).callsArgWith(1, null, docs);
            methods['post'](req, res, function () {
                expect(validateWasCalled).to.be(true);
                done();
            });
        });
    });

});