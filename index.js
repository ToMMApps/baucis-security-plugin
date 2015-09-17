var baucis = require('baucis');
var util = require('util');
var Q = require('q');


/**
 * @param {function} validate Is called with the model instance and a context object that contains several properties
 * that might be helpful to decide if it is allowed to access this entry:
 *  - req: express request object
 *  The function must return a promise that resolves with a boolean that indicates if the entry is allowed to be access or not.
 */
module.exports = function(validate) {

    if(!util.isFunction(validate)){
        throw new TypeError("first arg must be a function");
    }

    /**
     * baucis middleware to ensure that only entries are modified or retrieved that the the currently logged in user has
     * access to.
     */
    baucis.Controller.decorators(function (model) {
        var controller = this;
        var Model = controller.model();

        /**
         * Creates (but NOT saves) the entry; checks for validity and checks if the resolved user equals
         * the current session. If so, the entry will be saved.
         * For performance reasons this operation does not call next; instead it calls save on the created instance
         * if the above operations have succeeded. This prohibits unnecessary database operations.
         */
        controller.request('post', function(req, res, next){
            var instance = new Model(req.body);

            instance.validate(function(err){
                if(err){
                    res.status(400).end(err.toString());
                } else {

                    validate(instance, {
                        req: req
                    }).then(function (isValid) {
                        if(!isValid){
                            return res.status(403).end("baucis-security-plugin has blocked access");
                        } else {
                            instance.save(function(err, entry){
                                if(err){
                                    res.status(500).end(err.message);
                                } else {
                                    res.status(200).json(entry._doc);
                                }
                            })
                        }
                    }, function (err) {
                        res.status(500).end(err.toString());
                    });
                }
            });
        });

        /**
         * Uses the instance of the model in the database that was retrieved by baucis and calls
         * getUserId on this instance to find out if the requested database entry belongs to the current session.
         * If the document that shall be updated does not belong to the current session then the
         * middleware skips next and sends the error code Forbidden.
         * The baucis context (ctx) contains the document that shall be updated (doc) and the incoming data (incoming).
         */
        controller.request('put', function(req, res, next){
            req.baucis.incoming(function(ctx, cb){

                validate(ctx.doc, {
                    req: req
                }).then(function (isValid) {
                    if(!isValid){
                        return res.status(403).end("baucis-security-plugin has blocked access");
                    } else {
                        cb(null, ctx);
                    }
                }, function (err) {
                    res.status(500).end(err.toString());
                });
            });

            next();
        });

        /**
         * Get and delete requests are processed in the same way.
         * In both cases this middleware tries to resolve all userId's of the requested
         * database entries and compares them to the user in the current session. If any entry
         * does not belong to the current user the whole operation is cancelled which means
         * that next is skipped and the error code Forbidden will be send.
         * This makes it easier to determine problems in the query as it might not be specific enough.
         * Also this procedure saves performance because the other userIds don't have to be resolved any more.
         */
        controller.request('get delete', function(req, res, next) {

            controller.model().find(req.baucis.conditions, function (err, docs) {
                if (err) {
                    res.status(500).end(err.toString());
                } else if (!docs || !util.isArray(docs)) {
                    return res.status(404).end();
                } else {

                    var promises = docs.map(function (doc) {

                        return validate(doc, {
                            req: req
                        }).then(function (isValid) {
                            if(!isValid){
                                var err = new Error("baucis-security-plugin has blocked access");
                                err.statusCode = 403;
                                return Q.reject(err);
                            } else {
                                return Q();
                            }
                        }, function (reason) {
                            var err = new Error(reason.toString());
                            err.statusCode = 500;
                            return Q.reject(err);
                        })
                    });

                    Q.all(promises).then(function () {
                        next();
                    }, function (err) {
                        res.status(err.statusCode).end(err.toString());
                    });
                }
            });
        });
    });
};



