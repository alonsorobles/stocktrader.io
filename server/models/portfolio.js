'use strict';

var _ = require('underscore')._,
    client = require('../lib/mongoClient'),
    Quote = require('./quote');

var collectionName = 'portfolios';

var findAll = function (query, callback) {
    client.connect(function (db) {
        db.collection(collectionName).find(query, {'name': true}).toArray(function (err, portfolios) {
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
            if (!err && portfolio) {
                Quote.findBySymbols(_.pluck(portfolio.securities, 'symbol'), function (err, securites) {
                    portfolio.securities = securites;
                    callback(err, portfolio);
                });
            } else {
                callback(err, portfolio);
            }
        });
    });
};

module.exports = {
    findAll: findAll,
    create: create,
    findById: findById
};