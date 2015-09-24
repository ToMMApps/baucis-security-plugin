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

How it works
-----------

*GET* and *DELETE* requests are handled the same way. In both cases the method validate is called for each queried instance. If any of those calls resolve to false, the whole request is forbidden.
This plugin does not filter the response. Instead it blocks the whole request. To solve this problem, the request must be more specific.

When doing a *POST* request a new instance is created and the mongoose validate function will be called. After that, the overhanded validate function is called. If any of those actions fail, the request fails.

During a *PUT* request this plugin calls the overhanded validate function on the updated instance. As always the request fails if validate resolves to false. In this case the instance will not be modified.


