'use strict';

var Quote = require('../models/quote');

var show = function (req, res) {
    Quote.findById(req.params.symbol, function (err, quote) {
        if (err) throw(err);
        if (quote) {
            res.json(quote);
        } else {
            res.statusCode = 404;
            res.end();
        }
    });
};

var routes = [
    {
        path: '/api/quote/:symbol',
        httpMethod: 'GET',
        middleWare: [show]
    }
];

module.exports = {
    routes: routes,
    show: show
};