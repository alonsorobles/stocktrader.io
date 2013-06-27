'use strict';

var _ = require('underscore')._,
    Portfolio = require('../models/portfolio.js'),
    Quote = require('../models/quote.js');

var index = function (req, res) {
    Portfolio.findAll(function (err, portfolios) {
        if (err) throw(err);
        res.json(portfolios);
    });
};

var create = function (req, res) {
    Portfolio.create(req.body.name, function (err, portfolio) {
        if (err) throw(err);
        res.json(portfolio);
    });
};

var show = function (req, res) {
    Portfolio.findById(req.params.portfolioId, function (err, portfolio) {
        if (err) throw(err);
        if (portfolio) {
            Quote.findBySymbols(_.pluck(portfolio.securities, 'symbol'), function (err, securites) {
                if (err) throw(err);
                portfolio.securities = securites;
                res.json(portfolio);
            });
        } else {
            res.statusCode = 404;
            res.end();
        }
    });
};

var routes = [
    {
        path: '/api/portfolio',
        httpMethod: 'GET',
        middleWare: [index]
    },
    {
        path: '/api/portfolio',
        httpMethod: 'POST',
        middleWare: [create]
    },
    {
        path: '/api/portfolio/:portfolioId',
        httpMethod: 'GET',
        middleWare: [show]
    }
];

module.exports = {
    routes: routes,
    index: index
};