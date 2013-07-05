'use strict';

var _ = require('underscore')._,
    client = require('../lib/mongoClient'),
    YahooFinance = require('../services/yahooFinance'),
    QuoteHistory = require('./quoteHistory'),
    collectionName = 'quotes';

function save(quote, callback) {
    client.connect(function (db) {
        db.collection(collectionName).findOne({_id: quote.symbol}, function (err, oldQuote) {
            if (oldQuote && oldQuote.lastTradeDate < quote.lastTradeDate) {
                oldQuote.date = oldQuote.lastTradeDate;
                oldQuote.close = quote.previousClose;
                delete oldQuote._id;
                delete oldQuote.lastQuote;
                delete oldQuote.lastTradeDate;
                delete oldQuote.lastPrice;
                delete oldQuote.previousClose;
                delete oldQuote.yahooFinanceMovingAverage;
                QuoteHistory.save(oldQuote, function (err) {
                    console.error(err);
                });
            }
            db.collection(collectionName).save(quote, function (err, result) {
                callback(err, result);
                db.close();
            });
        });
    });
}

function createFromYahooQuote(yahooQuote, callback) {
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
    switch (convertedQuote.symbol) {
        case null:
            callback({message: 'No symbol found in Yahoo! Finance quote.'});
            break;
        default:
            save(convertedQuote, function (err) {
                callback(err, convertedQuote);
            });
            break;
    }
}

function findAll(callback) {
    client.connect(function (db) {
        db.collection(collectionName)
            .find({}, {symbol: 1})
            .toArray(function (err, quotes) {
                callback(err, quotes);
                db.close();
            });
    });
}

function find(query, callback) {
    client.connect(function (db) {
        db.collection(collectionName)
            .find(query)
            .toArray(function (err, quotes) {
                callback(err, quotes);
                db.close();
            });
    });
}

function findBySymbols(symbols, callback) {
    find({_id: {$in: symbols}}, function (err, quotes) {
        var missingQuotes;
        if (err) {
            callback(err, quotes);
        } else {
            if (symbols.length !== quotes.length) {
                missingQuotes = _.difference(symbols, _.pluck(quotes, 'symbol'));
                YahooFinance.get(missingQuotes, function (err, yahooQuotes) {
                    var remainingQuotes = yahooQuotes.length;
                    _.each(yahooQuotes, function (yahooQuote) {
                        createFromYahooQuote(yahooQuote, function (err, convertedQuote) {
                            remainingQuotes -= 1;
                            quotes.push(convertedQuote);
                            if (remainingQuotes === 0) {
                                callback(err, quotes);
                            }
                        });
                    });
                });
            } else {
                callback(err, quotes);
            }
        }
    });
}

function findById(symbol, callback) {
    client.connect(function (db) {
        db.collection(collectionName).findOne({_id: symbol}, function (err, result) {
            if (err || result) {
                callback(err, result);
            } else {
                YahooFinance.get([symbol], function (err, yahooQuotes) {
                    var yahooQuote;
                    if (err || !yahooQuotes) {
                        callback(err, yahooQuotes);
                    } else {
                        yahooQuote = yahooQuotes[0];
                        createFromYahooQuote(yahooQuote, function (err, quote) {
                            callback(err, quote);
                        });
                    }
                });
            }
            db.close();
        });
    });
}


module.exports = {
    findAll: findAll,
    findBySymbols: findBySymbols,
    find: find,
    findById: findById,
    createFromYahooQuote: createFromYahooQuote
};