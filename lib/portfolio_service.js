'use strict';

var connect = require('./mongo_connect.js'),
    quoteService = require('./quote_service.js')(),
    http = require('http'),
    _ = require('underscore')._;

var PortfolioService = function () {
    var that = {};

    var formatSecurityResponse = function (security, portfolioPath, callback) {
        security.details = portfolioPath + '/security/' + security.symbol;
        quoteService.getQuote(security.symbol, function (err, quote) {
            if (err) console.error(err);
            if (quote) {
                security.name = quote.name;
                security.lastPrice = quote.lastPrice;
                security.trendUp = quote.yahooMovingAverage.ma50 > quote.yahooMovingAverage.ma200;
                security.trendDown = quote.yahooMovingAverage.ma50 < quote.yahooMovingAverage.ma200;
                security.changeUp = quote.lastPrice > quote.previousClose;
                security.changeDown = quote.lastPrice < quote.previousClose;
                security.changeAmount = Math.abs(quote.lastPrice - quote.previousClose);
                security.changePercentage = (security.changeAmount / quote.previousClose)*100;
            }
            callback(security);
        });
    };

    var portfolioPath = function (portolioId) {
        return 'portfolio/' + portolioId;
    };

    var formatPortfolioResponse = function (portfolio, callback) {
        var remaining = portfolio.securities ? portfolio.securities.length : 0;

        portfolio.details = portfolioPath(portfolio._id);

        if (portfolio.securities) {
            _.each(portfolio.securities, function (security) {
                formatSecurityResponse(security, portfolio.details, function (formattedSecurity) {
                    remaining -= 1;
                    if (formattedSecurity) {
                        security = formattedSecurity;
                    }
                    if (remaining == 0) callback(portfolio);
                });
            });
        } else {
            callback(portfolio);
        }
    };

    that.registerRoutes = function (app) {
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
            if (!portfolioName) throw({message: 'Need a portfolio name'});
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
                db.collection('portfolios').findById(req.params.portfolioId, function (err, portfolio) {
                    if (err) throw(err);
                    formatPortfolioResponse(portfolio, function (formattedPortfolio) {
                        res.json(formattedPortfolio);
                    });
                });
            });
        });

        app.post('/api/portfolio/:portfolioId/security', function (req, res) {
            var symbol = req.body.symbol;
            if (!symbol) throw({message: 'Need a symbol!'});
            getPortfolioById(req.params.portfolioId, function (err, portfolio) {
                if (err) throw (err);
                if (!portfolio) throw ({message: 'Failed to find portfolio'});
                quoteService.getQuote(symbol, function (err, quote) {
                    if (err) throw(err);
                    if (!quote) throw({message: 'Unable to get quote for security.'});
                    var security = {symbol: symbol};
                    if (!portfolio.securities) {
                        portfolio.securities = [security];
                    } else {
                        portfolio.securities.push(security);
                    }
                    savePortfolio(portfolio, function (err) {
                        if (err) throw(err);
                        formatSecurityResponse(security, portfolioPath(req.params.portfolioId), function(formattedSecurity) {
                            res.json(formattedSecurity);
                        });
                    });
                });
            });
        });


        app.delete('/api/portfolio/:portfolioId/security/:symbol', function (req, res) {
            getPortfolioById(req.params.portfolioId, function (err, portfolio) {
                if (!portfolio.securities) {
                    notFound(res);
                } else {
                    var security = _.findWhere(portfolio.securities, {symbol: req.params.symbol});
                    if (!security) {
                        notFound(res);
                    } else {
                        portfolio.securities.splice(portfolio.securities.indexOf(security), 1);
                        savePortfolio(portfolio, function (err) {
                            if (err) throw(err);
                            res.end();
                        });
                    }
                }
            });
        });
    };

    var getPortfolioById = function (portfolioId, callback) {
        connect(function (db) {
            db.collection('portfolios').findById(portfolioId, callback);
        });
    };

    var savePortfolio = function (portfolio, callback) {
        connect(function (db) {
            db.collection('portfolios').save(portfolio, callback);
        });
    };

    var notFound = function (res, message) {
        res.statusCode = 404;
        res.end(message);
    };

    return that;
};

module.exports = PortfolioService;