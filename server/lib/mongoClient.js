'use strict';

var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    //ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON;

var connect = function (callback) {
    MongoClient.connect('mongodb://localhost/stocktrader?w=1', function (err, db) {
        callback(db);
    });
};

module.exports = {
    connect: connect,
    ObjectID: ObjectID
};