'use strict';

var _ = require('underscore')._,
    User = require('../models/user');

var index = function (req, res) {
    User.findAll(function (err, users) {
        if (err) throw(err);
        _.each(users, function (user) {
            delete user.password;
            delete user.twitter;
            delete user.facebook;
            delete user.google;
            delete user.linkedin;
        });
        res.json(users);
    })
};

module.exports = {
    index: index
};