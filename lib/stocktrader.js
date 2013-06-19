var mongo = require('mongoskin');
var _ = require('underscore')._;

var StockTrader = function (app) {
    var stocktrader = {};

    var connect = function (next) {
        var db = mongo.db('localhost/stocktrader', {safe: true});
        next(db);
    };

    app.get('/api/portfolios', function (req, res) {
        connect(function(db) {
            db.collection('portfolios').find().toArray(function(err, items) {
                res.json(items);
            })
        })
    });
};

module.exports = StockTrader;