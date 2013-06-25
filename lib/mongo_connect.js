'use strict';

var mongo = require('mongoskin');

var connect = function (callback) {
    var db = mongo.db('localhost/stocktrader', {safe: true});
    callback(db);
};

module.exports = connect;