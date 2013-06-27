'use strict';

var _ = require('underscore')._,
    client = require('../lib/mongoClient'),
    YahooFinance = require('../services/yahooFinance'),
    QuoteHistory = require('./quoteHistory');

var collectionName = 'quotes';

var createFromYahooQuote = function (yahooQuote, callback) {
    var convertedQuote = {
        _id: yahooQuote.symbol,
        symbol: yahooQuote.symbol,
        exchange: yahooQuote.exchange,
        name: yahooQuote.name,
        lastPrice: yahooQuote.lastPrice,
        lastQuote: new Date(),
        lastTradeDate: yahooQuote.lastTradeDate,
        previousClose: yahooQuote.previousClose,
        open: yahooQuote.open,
        high: yahooQuote.high,
        low: yahooQuote.low,
        yahooFinanceMovingAverage: {
            d50: yahooQuote.ma50,
            d200: yahooQuote.ma200
        }
    };
    save(convertedQuote, function (err) {
        callback(err, convertedQuote);
    })
};

var findAll = function(callback) {
    client.connect(function (db){
       db.collection(collectionName)
           .find({}, {symbol: 1})
           .toArray(function (err, quotes) {
                callback(err, quotes);
           });
    });
};

var find = function (query, callback) {
    client.connect(function(db) {
        db.collection(collectionName)
            .find(query)
            .toArray(function (err, quotes) {
                callback(err, quotes);
            });
    });
};

var findBySymbols = function (symbols, callback) {
    find({_id: {$in: symbols}}, function (err, quotes) {
        if (err) {
            callback(err, quotes);
        } else {
            if (symbols.length != quotes.length) {
                var missingQuotes = _.difference(symbols, _.pluck(quotes, 'symbol'));
                YahooFinance.get(missingQuotes, function (err, yahooQuotes) {
                    var remainingQuotes = yahooQuotes.length;
                    _.each(yahooQuotes, function (yahooQuote) {
                        createFromYahooQuote(yahooQuote, function (err, convertedQuote) {
                            remainingQuotes -= 1;
                            quotes.push(convertedQuote);
                            if (remainingQuotes == 0) callback(err, quotes);
                        });
                    });
                });
            } else {
                callback(err, quotes);
            }
        }
    });
};

var findById = function (symbol, callback) {
    client.connect(function (db) {
        db.collection(collectionName).findOne({_id: symbol}, function (err, result) {
            if (err || result) {
                callback(err, result);
            } else {
                YahooFinance.get([symbol], function (err, yahooQuotes) {
                    if (err || !yahooQuotes) {
                        callback(err, yahooQuotes);
                    } else {
                        var yahooQuote = yahooQuotes[0];
                        createFromYahooQuote(yahooQuote, function (err, quote) {
                            callback(err, quote);
                        });
                    }
                });
            }
        });
    });
};

var save = function (quote, callback) {
    client.connect(function (db) {
        db.collection(collectionName).findOne({_id: quote.symbol}, function (err, oldQuote) {
            if (oldQuote.lastTradeDate < quote.lastTradeDate) {
                oldQuote.date = oldQuote.lastTradeDate;
                oldQuote.close = quote.previousClose;
                delete oldQuote._id;
                delete oldQuote.lastQuote;
                delete oldQuote.lastTradeDate;
                delete oldQuote.lastPrice;
                delete oldQuote.previousClose;
                delete oldQuote.yahooFinanceMovingAverage;
                QuoteHistory.save(oldQuote);
            }
            db.collection(collectionName).save(quote, function (err, result) {
                callback(err, result);
            });
        });
    });
};

module.exports = {
    findAll: findAll,
    findBySymbols: findBySymbols,
    find: find,
    findById: findById,
    createFromYahooQuote: createFromYahooQuote
};