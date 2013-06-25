var mongo = require('mongoskin'),
    http = require('http'),
    csv = require('csv'),
    _ = require('underscore')._;

var StockTrader = function (app) {
    var stocktrader = {};

    var connect = function (next) {
        var db = mongo.db('localhost/stocktrader', {safe: true});
        next(db);
    };

    var formatSecurityResponse = function (security, portfolioDetails) {
        security.details = portfolioDetails + '/' + security.symbol;
        security.data = 'quote/' + security.symbol;
        return security;
    };

    var formatPortfolioResponse = function (portfolio) {
        portfolio.details = 'portfolio/' + portfolio._id;
        if (portfolio.securities) {
            var securities = [];
            _.each(portfolio.securities, function (security) {
                securities.push(formatSecurityResponse(security, portfolio.details))
            });
            portfolio.securities = securities;
        }
        return portfolio;
    };

    app.get('/api/portfolio', function (req, res) {
        var out = [];
        connect(function (db) {
            db.collection('portfolios').find({}, {'name': true}).toArray(function (err, items) {
                if (err) throw(err);
                _.each(items, function (item) {
                    out.push(formatPortfolioResponse(item));
                });
                res.json(out);
            })
        })
    });

    app.post('/api/portfolio', function (req, res) {
        var portfolioName = req.body.name;
        if (!portfolioName) throw({error: 'Need a portfolio name'});
        connect(function (db) {
            db.collection('portfolios').insert({name: portfolioName}, function (err, result) {
                if (err) throw(err);
                res.json(formatPortfolioResponse(result[0]));
            });
        });
    });

    app.delete('/api/portfolio/:portfolioId', function (req, res) {
        connect(function (db) {
            db.collection('portfolios').removeById(req.params.portfolioId, function (err, result) {
                var out = {error: err, result: result};
                res.json(out);
            });
        });
    });

    app.get('/api/portfolio/:portfolioId', function (req, res) {
        connect(function (db) {
            db.collection('portfolios').findById(req.params.portfolioId, function (err, result) {
                if (err) throw(err);
                res.json(formatPortfolioResponse(result));
            });
        });
    });

    app.post('/api/portfolio/:portfolioId', function (req, res) {
        var portfolio = req.body;
        delete portfolio._id;
        connect(function (db) {
            db.collection('portfolios').updateById(req.params.portfolioId, portfolio, function (err) {
                if (err) throw(err);
                portfolio._id = req.params.portfolioId;
                res.json(formatPortfolioResponse(portfolio));
            });
        });
    });

    var requestQuote = function (symbol, callback) {
        http.get('http://download.finance.yahoo.com/d/quotes.csv?s=' + symbol + '&f=d1l1ophgm3m4xsne1',function (yahoo) {
            yahoo.setEncoding('utf8');
            yahoo.on('data', function (chunk) {
                csv().from(chunk).transform(function (row) {
                    var tradeDate = new Date(row[0]);
                    var error = row[11];
                    if (error) {
                        console.log(error);
                    }
                    if (tradeDate) {
                        var quote = {
                            lastTradeDate: new Date(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate(), 0, 0, 0, 0),
                            lastPrice: row[1],
                            open: row[2],
                            previousClose: row[3],
                            high: row[4],
                            low: row[5],
                            ma50: row[6],
                            ma200: row[7],
                            exchange: row[8],
                            symbol: row[9],
                            name: row[10]
                        };
                        callback(undefined, quote)
                    }
                    else {
                        callback(undefined, undefined);
                    }
                }).on('error', function (error) {
                        callback(error);
                    });
            });
        }).on('error', function (err) {
                callback(err);
            });
    };

    app.get('/api/quote/:symbol', function (req, res) {
        connect(function (db) {
            var symbol = req.params.symbol;
            db.collection('securities').findById(symbol, function (err, result) {
                if (err) throw(err);
                if (result) {
                    res.json(result);
                } else {
                    requestQuote(symbol, function (err, quote) {
                        if (err) throw(err);
                        if (quote) {
                            quote._id = symbol;
                            quote.lastQuote = new Date();
                            quote.history = [
                                {
                                    date: quote.lastTradeDate,
                                    open: quote.open,
                                    high: quote.high,
                                    low: quote.low,
                                    ma50: quote.ma50,
                                    ma200: quote.ma200
                                }
                            ];
                            db.collection('securities').insert(quote, function (err) {
                                if (err) throw(err);
                                res.json(quote);
                            })
                        } else {
                            res.statusCode = 404;
                            res.end();
                        }
                    })
                }
            });
        });
    });

    var updateQuotes = function () {
        var now = new Date();
        var twentyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        connect(function (db) {
            db.collection('securities').findEach({'lastQuote': {$lt: twentyMinutesAgo}}, function (err, security) {
                if (err) throw(err);
                if (security) {
                    console.log(security.lastQuote);
                    console.log(twentyMinutesAgo);
                    console.log(security.lastQuote < twentyMinutesAgo);
                    requestQuote(security.symbol, function (err, quote) {
                        if (security.lastTradeDate.getTime() != quote.lastTradeDate.getTime()) {
                            var yesterday = _.find(security.history, function (item) {
                                return item.date.getTime() == security.lastTradeDate.getTime()
                            });
                            yesterday.close = quote.previousClose;
                            yesterday.open = security.open;
                            yesterday.high = security.high;
                            yesterday.low = security.low;
                            yesterday.ma50 = security.ma50;
                            yesterday.ma200 = security.ma200;
                            security.history.unshift({date: quote.lastTradeDate, open: quote.open, high: quote.high, low: quote.low});
                        }
                        security.lastQuote = new Date();
                        security.lastTradeDate = quote.lastTradeDate;
                        security.lastPrice = quote.lastPrice;
                        security.open = quote.open;
                        security.previousClose = quote.previousClose;
                        security.high = quote.high;
                        security.low = quote.low;
                        security.ma50 = quote.ma50;
                        security.ma200 = quote.ma200;
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

    setInterval(updateQuotes, 1000 * 60);
};

module.exports = StockTrader;