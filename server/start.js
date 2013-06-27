'use strict';

var QuoteService = require('./services/quoteRefreshService');

var delay = 1000 * 30;

module.exports = function() {
    setInterval(QuoteService.refresh, delay);
};