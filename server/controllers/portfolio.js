'use strict';

var Portfolio = require('../models/portfolio');

var index = function (req, res) {
    Portfolio.findAll(function(err, portfolios) {
        if (err) throw(err);
       res.json(portfolios);
    });
};

var create = function (req, res) {
    Portfolio.create(req.body.name, function(err, portfolio) {
        if (err) throw(err);
        res.json(portfolio);
    });
};

var show = function (req, res) {
    Portfolio.findById(req.params.portfolioId, function (err, portfolio) {
        if (err) throw(err);
        if (!portfolio) {
            res.statusCode = 404;
            res.end();
        } else {
            res.json(portfolio);
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