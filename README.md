# Bauic Security Plugin
This plugin adds a security middleware to baucis.

Installation
-------------

```
npm install baucis-security-plugin
```

Usage
---------

All you need to do is to overhand a function that allows this plugin to decide if the current instance is allowed
to be accessed. You can do this, for example with the mongoose-user-resolver-plugin.
This plugin adds a method getUserId to mongoose models. By comparing the current user and the owner 
of the instance (getUserId) this function realizes a general access rule.

```
var security = require('baucis-security-plugin');
security(function (instance, ctx) {
    return instance.getUserId()
        .then(function (userId) {
            if (userId.toString() !== ctx.req.session.passport.user) {
                return Q(false);
            } else {
                return Q(true);
            }
        });
});
```

This means that a user can not modify entries that belong to a different user.

For coverage report run "npm run cover" and npm test for all mocha tests.

Written by Henning Gerrits, ToMM Apps GmbH