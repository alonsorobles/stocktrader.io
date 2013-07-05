'use strict';

var QuoteService = require('./services/quoteRefreshService'),
    delay = 1000 * 60 * 5;

module.exports = function () {
    setInterval(QuoteService.refresh, delay);
};