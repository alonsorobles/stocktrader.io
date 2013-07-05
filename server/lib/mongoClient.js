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

function connect(callback) {
    MongoClient.connect('mongodb://localhost/stocktrader?w=1', function (err, db) {
        if (err) console.error(err);
        callback(db);
    });
}

module.exports = {
    connect: connect,
    ObjectID: ObjectID
};