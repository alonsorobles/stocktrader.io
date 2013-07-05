'use strict';

var Client = require('../lib/mongoClient');

var collectionName = 'quoteHistory';

function save(quote, callback) {
    Client.connect(function (db) {
        db.collection(collectionName)
            .insert(quote, function (err, doc) {
                callback(err, doc);
                db.close();
            });
    });
}

module.exports = {
    save: save
};