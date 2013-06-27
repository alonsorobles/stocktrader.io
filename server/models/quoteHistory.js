'use strict';

var Client = require('../lib/mongoClient');

var collectionName = 'quoteHistory';

var save = function(quote, callback) {
    Client.connect(function (db) {
        db.collection(collectionName)
            .insert(quote, function(err, doc) {
                callback(err, doc);
            });
    });
};

module.exports = {
    save: save
};