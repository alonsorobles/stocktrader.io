'use strict';

var _ = require('underscore')._,
    Portfolio = require('../models/portfolio.js'),
    Quote = require('../models/quote.js'),
    basePath = '/api/portfolio',
    routes;

var index = function (req, res) {
    Portfolio.findAll(function (err, portfolios) {
        if (err) {
            throw err;
        }
        res.json(portfolios);
    });
};

function create(req, res) {
    Portfolio.create(req.body.name, function (err, portfolio) {
        if (err) {
            throw err;
        }
        res.json(portfolio);
    });
}

function show(req, res) {
    Portfolio.findById(req.params.portfolioId, function (err, portfolio) {
        if (err) {
            throw err;
        }
        if (portfolio) {
            Quote.findBySymbols(_.pluck(portfolio.securities, 'symbol'), function (err, securities) {
                if (err) {
                    throw err;
                }
                portfolio.securities = securities;
                res.json(portfolio);
            });
        } else {
            res.statusCode = 404;
            res.end();
        }
    });
}

function destroy(req, res) {
    Portfolio.findById(req.params.portfolioId, function (err, portfolio) {
        if (!portfolio) {
            res.statusCode = 404;
            res.end();
        } else {
            Portfolio.remove(portfolio, function (err) {
                if (err) {
                    throw err;
                }
                res.statusCode = 200;
                res.end();
            });
        }
    });
}

routes = [
    {
        path: basePath,
        httpMethod: 'GET',
        middleWare: [index]
    },
    {
        path: basePath,
        httpMethod: 'POST',
        middleWare: [create]
    },
    {
        path: basePath + '/:portfolioId',
        httpMethod: 'GET',
        middleWare: [show]
    },
    {
        path: basePath + '/:portfolioId',
        httpMethod: 'DELETE',
        middleWare: [destroy]
    }
];

module.exports = {
    routes: routes,
    actions: {
        index: index,
        create: create,
        show: show,
        destroy: destroy
    }
};