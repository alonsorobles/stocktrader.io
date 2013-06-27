'use strict';

var _ = require('underscore')._,
    client = require('../lib/mongoClient'),
    Quote = require('./quote');

var collectionName = 'portfolios';

var findAll = function (callback) {
    client.connect(function (db) {
        db.collection(collectionName).find({}, {'name': true}).toArray(function (err, portfolios) {
            callback(err, portfolios);
        });
    });
};

var create = function (name, callback) {
    if (!name) {
        callback('Missing portfolio name');
    } else {
        client.connect(function (db) {
            db.collection(collectionName).insert({name: name}, function (err, result) {
                var portfolio;
                if (result) portfolio = result[0];
                callback(err, portfolio);
            });
        });
    }
};

var findById = function (id, callback) {
    client.connect(function (db) {
        db.collection(collectionName).findOne({_id: client.ObjectID(id)}, function (err, portfolio) {
            callback(err, portfolio);
        });
    });
};

var update = function (portfolio, callback) {
    client.connect(function (db) {
        db.collection(collectionName).save(portfolio, function (err, portfolio) {
            callback(err, portfolio);
        });
    });
};

var remove = function (portfolio, callback) {
    client.connect(function (db) {
        db.collection(collectionName).remove({_id: portfolio._id}, function (err) {
            callback(err);
        })
    });
};

module.exports = {
    findAll: findAll,
    create: create,
    findById: findById,
    update: update,
    remove: remove
};