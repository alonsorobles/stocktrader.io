'use strict';

var _ = require('underscore')._,
    Portfolio = require('../models/portfolio'),
    Quote = require('../models/quote.js');

var create = function (req, res) {
    var symbol = req.body.symbol;
    if (!symbol) {
        res.statusCode = 400;
        res.end();
    } else {
        Portfolio.findById(req.params.portfolioId, function (err, portfolio) {
            if (err) throw (err);
            if (!portfolio) {
                res.statusCode = 404;
                res.end();
            } else {
                symbol = symbol.toLocaleUpperCase();
                Quote.findById(symbol, function (err, quote) {
                    if (err) throw (err);
                    if (!quote) {
                        res.statusCode = 404;
                        res.end();
                    } else {
                        var security = _.findWhere(portfolio.securities, {symbol: symbol});
                        if (!security) {
                            if (!portfolio.securities) portfolio.securities = [];
                            portfolio.securities.push({symbol: symbol});
                            Portfolio.update(portfolio, function (err) {
                                if (err) throw (err);
                                res.json(quote);
                            });
                        } else {
                            res.json(quote);
                        }
                    }
                });
            }
        });
    }
};

var destroy = function (req, res) {
    Portfolio.findById(req.params.portfolioId, function (err, portfolio) {
        if (err) throw (err);
        if (!portfolio) {
            res.statusCode = 404;
            res.end();
        } else {
            var security = {symbol: req.params.symbol};
            if (portfolio.securities) {
                portfolio.securities.splice(portfolio.securities.indexOf(security), 1);
            }
            Portfolio.update(portfolio, function (err) {
                if (err) throw (err);
                res.statusCode = 200;
                res.end();
            });
        }
    });
};

var basePath = '/api/portfolio/:portfolioId/security';

var routes = [
    {
        path: basePath,
        httpMethod: 'POST',
        middleWare: [create]
    },
    {
        path: basePath + '/:symbol',
        httpMethod: 'DELETE',
        middleWare: [destroy]
    }
];

module.exports = {
    routes: routes,
    actions: {
        create: create,
        destroy: destroy
    }
};