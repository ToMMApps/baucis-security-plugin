# Baucis Security Plugin
This plugin adds a security middleware to baucis.

![BuildStatus](http://jenkins.tomm-apps.de/buildStatus/icon?job=baucis-security-plugin)
![Test](http://jenkins.tomm-apps.de:3434/badge/baucis-security-plugin/test)
![LastBuild](http://jenkins.tomm-apps.de:3434/badge/baucis-security-plugin/lastbuild)
![CodeCoverageInJenkins](http://jenkins.tomm-apps.de:3434/badge/baucis-security-plugin/coverage)

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
