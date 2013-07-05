'use strict';

var _ = require('underscore')._,
    client = require('../lib/mongoClient'),
    Quote = require('./quote'),
    collectionName = 'portfolios';

function findAll(callback) {
    client.connect(function (db) {
        db.collection(collectionName).find({}, {'name': true}).toArray(function (err, portfolios) {
            callback(err, portfolios);
            db.close();
        });
    });
}

function create(name, callback) {
    if (!name) {
        callback('Missing portfolio name');
    } else {
        client.connect(function (db) {
            db.collection(collectionName).insert({name: name}, function (err, result) {
                var portfolio;
                if (result) portfolio = result[0];
                callback(err, portfolio);
                db.close();
            });
        });
    }
}

function findById(id, callback) {
    client.connect(function (db) {
        db.collection(collectionName).findOne({_id: client.ObjectID(id)}, function (err, portfolio) {
            callback(err, portfolio);
            db.close();
        });
    });
}

function update(portfolio, callback) {
    client.connect(function (db) {
        db.collection(collectionName).save(portfolio, function (err, portfolio) {
            callback(err, portfolio);
            db.close();
        });
    });
}

function remove(portfolio, callback) {
    client.connect(function (db) {
        db.collection(collectionName).remove({_id: portfolio._id}, function (err) {
            callback(err);
            db.close();
        })
    });
}

module.exports = {
    findAll: findAll,
    create: create,
    findById: findById,
    update: update,
    remove: remove
};