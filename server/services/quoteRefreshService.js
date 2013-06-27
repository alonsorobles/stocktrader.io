'use strict';

var _ = require('underscore')._,
    Quote = require('../models/quote'),
    YahooFinance = require('./yahooFinance');

var delay = 1000 * 60;

var refresh = function () {
    console.log('Quote refresh invoked!');
    var now = new Date();
    var quoteDelay = new Date(now.getTime() - delay);
    Quote.find({lastQuote: {$lt: quoteDelay}}, function (err, quotes) {
        if (err) console.error(err);
        if (quotes && quotes.length > 0) {
            if (quotes.length > 200) console.warn('More than 200 quotes! You may want to revisit the quote refresh service implementation.');
            YahooFinance.get(_.pluck(quotes, 'symbol'), function (err, yahooQuotes) {
                if (err) console.error(err);
                _.each(yahooQuotes, function (yahooQuote) {
                    Quote.createFromYahooQuote(yahooQuote, function (err) {
                        if (err) console.error(err);
                    });
                });
            });
        }
    });
};

module.exports = {
    refresh: refresh
};