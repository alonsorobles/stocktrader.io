'use strict';
var connect = require('./mongo_connect.js'),
    csv = require('csv'),
    http = require('http'),
    _ = require('underscore')._;

var QuoteService = function () {
    var that = {};

    var requestQuote = function (symbol, callback) {
        console.log('Requesting quote for: ' + symbol);
        http.get('http://download.finance.yahoo.com/d/quotes.csv?s=' + symbol + '&f=d1l1ophgm3m4xsne1',function (yahoo) {
            yahoo.setEncoding('utf8');
            yahoo.on('data', function (chunk) {
                csv().from(chunk).transform(function (row) {
                    var error, quote;
                    var tradeDate = new Date(row[0]);
                    if (row[11] && row[11].toUpperCase() != 'N/A') {
                        error = {message: 'Quote Error: ' + row[11]};
                        console.warn(error.message);
                    }
                    if (tradeDate) {
                        quote = {
                            lastTradeDate: new Date(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate(), 0, 0, 0, 0),
                            lastPrice: row[1],
                            open: row[2],
                            previousClose: row[3],
                            high: row[4],
                            low: row[5],
                            yahooMovingAverage: {
                                ma50: row[6],
                                ma200: row[7]
                            },
                            exchange: row[8],
                            symbol: row[9],
                            name: row[10]
                        };
                    }
                    callback(error, quote);
                }).on('error', function (err) {
                        callback(err);
                    });
            });
        }).on('error', function (err) {
                callback(err);
            });
    };

    var getQuote = function (symbol, callback) {
        connect(function (db) {
            db.collection('securities').findById(symbol, function (err, result) {
                if (err || result) {
                    callback(err, result);
                } else {
                    requestQuote(symbol, function (err, quote) {
                        if (err || !quote) {
                            callback(err, quote);
                        } else {
                            quote._id = symbol;
                            quote.lastQuote = new Date();
                            quote.history = [
                                {
                                    date: quote.lastTradeDate,
                                    open: quote.open,
                                    high: quote.high,
                                    low: quote.low,
                                    yahooMovingAverage: quote.yahooMovingAverage
                                }
                            ];
                            db.collection('securities').insert(quote, function (err) {
                                callback(err, quote);
                            });
                        }
                    });
                }
            });
        });
    };

    that.getQuote = getQuote;

    that.registerRoutes = function (app) {

        app.get('/api/quote/:symbol', function (req, res) {
            getQuote(req.params.symbol, function (err, quote) {
                if (err) throw(err);
                if (quote) {
                    res.json(quote);
                } else {
                    res.statusCode = 404;
                    res.end();
                }
            });
        });
    };

    that.updateQuotes = function () {
        var now = new Date();
        var twentyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        connect(function (db) {
            db.collection('securities').findEach({'lastQuote': {$lt: twentyMinutesAgo}}, function (err, security) {
                if (err) throw(err);
                if (security) {
                    requestQuote(security.symbol, function (err, quote) {
                        if (security.lastTradeDate.getTime() != quote.lastTradeDate.getTime()) {
                            var yesterday = _.find(security.history, function (item) {
                                return item.date.getTime() == security.lastTradeDate.getTime()
                            });
                            yesterday.close = quote.previousClose;
                            yesterday.open = security.open;
                            yesterday.high = security.high;
                            yesterday.low = security.low;
                            yesterday.yahooMovingAverage = security.yahooMovingAverage;
                            security.history.unshift({date: quote.lastTradeDate, open: quote.open, high: quote.high, low: quote.low, yahooMovingAverage: quote.yahooMovingAverage});
                        }
                        security.lastQuote = new Date();
                        security.lastTradeDate = quote.lastTradeDate;
                        security.lastPrice = quote.lastPrice;
                        security.open = quote.open;
                        security.previousClose = quote.previousClose;
                        security.high = quote.high;
                        security.low = quote.low;
                        security.yahooMovingAverage = quote.yahooMovingAverage;
                        security.name = quote.name;
                        security.exchange = quote.exchange;
                        db.collection('securities').save(security, function (err) {
                            if (err) throw(err);
                        });
                    });
                }
            });
        });
    };

    return that;
};

module.exports = QuoteService;